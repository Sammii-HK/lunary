/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('@/lib/get-user-session', () => ({
  requireAuth: jest.fn(),
}));

import { GET, POST } from '@/app/api/attribution/route';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/get-user-session';

const sqlMock = sql as unknown as jest.Mock;
const requireAuthMock = requireAuth as jest.MockedFunction<typeof requireAuth>;

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('https://lunary.app/api/attribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(userId: string) {
  return new NextRequest(
    `https://lunary.app/api/attribution?userId=${encodeURIComponent(userId)}`,
  );
}

function sqlText(call: unknown[]) {
  return Array.from(call[0] as TemplateStringsArray).join('?');
}

describe('/api/attribution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sqlMock.mockResolvedValue({ rows: [] });
    requireAuthMock.mockResolvedValue({
      id: 'user-123',
      email: 'test@lunary.app',
      name: 'Test User',
    });
  });

  it('upserts attribution only for the authenticated user', async () => {
    const response = await POST(
      makePostRequest({
        userId: 'user-123',
        anonymous_id: 'anon-abc',
        first_touch_source: 'chatgpt',
        first_touch_medium: 'ai',
        utm_source: 'chatgpt',
        utm_medium: 'referral',
      }),
    );

    await expect(response.json()).resolves.toEqual({ success: true });
    expect(response.status).toBe(200);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    const call = sqlMock.mock.calls[0];
    expect(sqlText(call)).toContain('ON CONFLICT (user_id) DO UPDATE');
    expect(sqlText(call)).toContain(
      'utm_source = COALESCE(user_attribution.utm_source, EXCLUDED.utm_source)',
    );
    expect(call[1]).toBe('user-123');
    expect(call[2]).toBe('anon-abc');
  });

  it('rejects attribution writes for a different user id', async () => {
    requireAuthMock.mockResolvedValue({
      id: 'user-other',
      email: 'other@lunary.app',
      name: 'Other User',
    });

    const response = await POST(
      makePostRequest({ userId: 'user-123', anonymous_id: 'anon-abc' }),
    );

    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' });
    expect(response.status).toBe(403);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it('requires auth before returning attribution rows', async () => {
    const unauthorized = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
    requireAuthMock.mockResolvedValue(unauthorized);

    const response = await GET(makeGetRequest('user-123'));

    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(response.status).toBe(401);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it('returns attribution only for the authenticated user', async () => {
    sqlMock.mockResolvedValue({
      rows: [{ user_id: 'user-123', anonymous_id: 'anon-abc' }],
    });

    const response = await GET(makeGetRequest('user-123'));

    await expect(response.json()).resolves.toEqual({
      attribution: { user_id: 'user-123', anonymous_id: 'anon-abc' },
    });
    expect(response.status).toBe(200);
    expect(sqlMock).toHaveBeenCalledTimes(1);
    expect(sqlMock.mock.calls[0][1]).toBe('user-123');
  });
});
