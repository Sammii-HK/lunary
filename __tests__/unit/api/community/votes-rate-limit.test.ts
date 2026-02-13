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

const checkRateLimitMock = jest.fn();

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: (...args: any[]) => checkRateLimitMock(...args),
}));

import { POST } from '@/app/api/community/votes/route';
import { auth } from '@/lib/auth';

function makeVoteRequest(body: unknown): NextRequest {
  return new NextRequest('https://lunary.app/api/community/votes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/community/votes — rate limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: rate limits pass
    checkRateLimitMock.mockReturnValue({ allowed: true, retryAfterMs: 0 });
  });

  it('returns 401 without authentication', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeVoteRequest({ post_id: 1 }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing post_id', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });

    const res = await POST(makeVoteRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 429 when per-post cooldown is exceeded', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    // First call to checkRateLimit (per-post cooldown) returns denied
    checkRateLimitMock.mockReturnValueOnce({
      allowed: false,
      retryAfterMs: 4000,
    });

    const res = await POST(makeVoteRequest({ post_id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toMatch(/wait a moment/);
    // Should NOT have made any SQL calls
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it('returns 429 when velocity limit is exceeded', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    // First call (per-post cooldown) passes, second call (velocity) denied
    checkRateLimitMock
      .mockReturnValueOnce({ allowed: true, retryAfterMs: 0 })
      .mockReturnValueOnce({ allowed: false, retryAfterMs: 60_000 });

    const res = await POST(makeVoteRequest({ post_id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toMatch(/too quickly/);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it('calls checkRateLimit with correct keys', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-42' },
    });
    // Both rate limits pass
    checkRateLimitMock.mockReturnValue({ allowed: true, retryAfterMs: 0 });
    // Post exists
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 7 }] });
    // No existing vote
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // Insert vote
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // Update count
    sqlMock.mockResolvedValueOnce({ rows: [] });

    await POST(makeVoteRequest({ post_id: 7 }));

    // Per-post cooldown key
    expect(checkRateLimitMock).toHaveBeenCalledWith('vote:user-42:7', 1, 5_000);
    // Velocity key
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      'vote-velocity:user-42',
      30,
      300_000,
    );
  });

  it('proceeds to vote when rate limits pass', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    checkRateLimitMock.mockReturnValue({ allowed: true, retryAfterMs: 0 });
    // Post exists
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    // No existing vote
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // Insert vote
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // Update count
    sqlMock.mockResolvedValueOnce({ rows: [] });

    const res = await POST(makeVoteRequest({ post_id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.voted).toBe(true);
    // Should have made 4 SQL calls (post check, existing vote check, insert, update count)
    expect(sqlMock).toHaveBeenCalledTimes(4);
  });

  it('toggles vote off when vote already exists', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    checkRateLimitMock.mockReturnValue({ allowed: true, retryAfterMs: 0 });
    // Post exists
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    // Existing vote found
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 99 }] });
    // Delete vote
    sqlMock.mockResolvedValueOnce({ rows: [] });
    // Update count
    sqlMock.mockResolvedValueOnce({ rows: [] });

    const res = await POST(makeVoteRequest({ post_id: 1 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.voted).toBe(false);
  });
});
