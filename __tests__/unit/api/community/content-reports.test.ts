/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const sqlMock = jest.fn();

jest.mock('@vercel/postgres', () => ({
  sql: (...args: any[]) => sqlMock(...args),
}));

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
}));

import { POST } from '@/app/api/community/reports/route';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/community/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/community/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'reporter-1' },
    });
    (checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      retryAfterMs: 0,
    });
  });

  it('returns 401 when not authenticated', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue(null);

    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 1,
        reason: 'spam',
      }),
    );

    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid content type', async () => {
    const res = await POST(
      makePostRequest({
        content_type: 'invalid',
        content_id: 1,
        reason: 'spam',
      }),
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid content type');
  });

  it('returns 400 for invalid reason', async () => {
    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 1,
        reason: 'invalid-reason',
      }),
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid report reason');
  });

  it('returns 404 when content does not exist', async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] });

    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 999,
        reason: 'spam',
      }),
    );

    expect(res.status).toBe(404);
  });

  it('returns 400 when reporting own content', async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [{ id: 1, user_id: 'reporter-1' }],
    });

    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 1,
        reason: 'spam',
      }),
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('You cannot report your own content');
  });

  it('submits a valid report successfully', async () => {
    // Content exists, owned by someone else
    sqlMock.mockResolvedValueOnce({
      rows: [{ id: 1, user_id: 'other-user' }],
    });
    // Insert report
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // Report count check (below threshold)
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 1 }] });

    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 1,
        reason: 'harassment',
      }),
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 409 on duplicate report', async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [{ id: 1, user_id: 'other-user' }],
    });
    // Unique constraint violation
    const uniqueError = new Error('duplicate');
    (uniqueError as any).code = '23505';
    sqlMock.mockRejectedValueOnce(uniqueError);

    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 1,
        reason: 'spam',
      }),
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe('You have already reported this content');
  });

  it('auto-hides content after 3 reports', async () => {
    sqlMock.mockResolvedValueOnce({
      rows: [{ id: 1, user_id: 'other-user' }],
    });
    // Insert succeeds
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // Report count at threshold
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 3 }] });
    // Auto-hide update
    sqlMock.mockResolvedValueOnce({ rows: [] });

    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 1,
        reason: 'harmful',
      }),
    );

    expect(res.status).toBe(201);
    // Verify auto-hide SQL was called (4th call)
    expect(sqlMock).toHaveBeenCalledTimes(4);
  });

  it('returns 429 when rate limited', async () => {
    (checkRateLimit as jest.Mock).mockReturnValue({
      allowed: false,
      retryAfterMs: 5000,
    });

    const res = await POST(
      makePostRequest({
        content_type: 'post',
        content_id: 1,
        reason: 'spam',
      }),
    );

    expect(res.status).toBe(429);
  });
});
