/**
 * @jest-environment node
 *
 * Guard-invariant coverage for `POST /api/ai/grimoire-quick` — a SECOND paid
 * DeepInfra surface (calls `generateContent` => Llama-3.3-70B). Cheaper per
 * call than the main chat route (maxTokens 150) but still real money.
 *
 * Guards that exist (all pinned below as passing tests):
 *   - requireUser  => 401 when unauthenticated
 *   - per-day message ceiling (DAILY_MESSAGE_LIMITS) => 429 when exhausted
 *   - input length bound on body.message: z.string().max(4000), mirroring the
 *     chat route => 400 on an oversized prompt before the paid model is reached
 *   - enforceIpRateLimit + enforceUserRateLimit (same helpers/windows as chat)
 *     => 429 on a rapid burst from the same caller
 *
 * The rate-limit + input-bound guards were added in fix/ai-route-cost-guards;
 * the tests that previously documented the gap now assert the guard exists.
 *
 * No real LLM, no real DB, no snapshots.
 */

import { NextRequest } from 'next/server';

// --- Paid model call --------------------------------------------------------
const generateContentMock = jest.fn();
jest.mock('@/lib/ai/content-generator', () => ({
  generateContent: (...args: unknown[]) => generateContentMock(...args),
}));

// --- Session lookup ---------------------------------------------------------
const getSessionMock = jest.fn();
jest.mock('@/lib/auth', () => ({
  auth: { api: { getSession: (...a: unknown[]) => getSessionMock(...a) } },
}));

// --- DB ---------------------------------------------------------------------
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(async () => ({ rows: [] })),
}));

// --- Usage ledger -----------------------------------------------------------
const loadUsageMock = jest.fn();
const updateUsageMock = jest.fn();
jest.mock('@/lib/ai/usage', () => ({
  loadUsage: (...a: unknown[]) => loadUsageMock(...a),
  updateUsage: (...a: unknown[]) => updateUsageMock(...a),
}));

import { POST } from '@/app/api/ai/grimoire-quick/route';
import { __resetRateLimitStateForTests } from '@/lib/ai/rate-limit';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest('https://lunary.app/api/ai/grimoire-quick', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

const authedSession = (id = 'user-grimoire') =>
  getSessionMock.mockResolvedValue({ user: { id } });

beforeAll(() => {
  (process.env as Record<string, string>).NODE_ENV = 'test';
});
afterAll(() => {
  (process.env as Record<string, string | undefined>).NODE_ENV =
    ORIGINAL_NODE_ENV;
});

beforeEach(() => {
  jest.clearAllMocks();
  // Clear in-memory rate-limit counters so prior tests don't bleed state into
  // the per-IP / per-user burst assertions below.
  __resetRateLimitStateForTests();
  generateContentMock.mockResolvedValue('• one\n• two\n• three');
  loadUsageMock.mockResolvedValue({ usedMessages: 0 });
  updateUsageMock.mockResolvedValue({
    limitExceeded: false,
    usage: { usedMessages: 1, tokensIn: 1, tokensOut: 1 },
    message: '',
  });
});

describe('POST /api/ai/grimoire-quick — guard invariants (paid DeepInfra surface)', () => {
  describe('guards that EXIST', () => {
    it('returns 401 and never calls the model when unauthenticated', async () => {
      getSessionMock.mockResolvedValue(null);

      const res = await POST(
        makeRequest(
          { message: 'what is the meaning of the tower card' },
          { 'x-test-force-unauth': 'true' },
        ),
      );

      expect(res.status).toBe(401);
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('returns 400 for a missing message and never calls the model', async () => {
      authedSession();

      const res = await POST(makeRequest({}));

      expect(res.status).toBe(400);
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('returns 429 and never calls the model once the daily message ceiling is exhausted', async () => {
      authedSession();
      // Free plan daily limit is 3; simulate an already-exhausted ledger.
      loadUsageMock.mockResolvedValue({ usedMessages: 3 });

      const res = await POST(
        makeRequest({ message: 'tell me about crystals' }),
      );

      expect(res.status).toBe(429);
      expect(generateContentMock).not.toHaveBeenCalled();
    });
  });

  describe('GUARD: input-length bound now mirrors the chat route (caps per-call cost)', () => {
    // FIXED (fix/ai-route-cost-guards): the route now validates the body with
    // a zod schema `z.object({ message: z.string().max(4000) })`, mirroring the
    // main chat route's 4000-char bound. An oversized prompt is rejected with
    // 400 BEFORE the paid model is reached, so cost-per-call is capped.
    it('[GUARD] rejects an oversized message (> 4000 chars) with 400 and never calls the model', async () => {
      authedSession();
      const huge = 'a'.repeat(20_000);

      const res = await POST(makeRequest({ message: huge }));

      expect(res.status).toBe(400);
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('accepts a message at exactly the 4000-char boundary (bound is inclusive, not stricter than chat)', async () => {
      authedSession();
      const atLimit = 'a'.repeat(4000);

      const res = await POST(makeRequest({ message: atLimit }));

      // Must NOT be the 400 input-rejection path; the model (mocked) is reached.
      expect(res.status).not.toBe(400);
      expect(generateContentMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('GUARD: per-IP + per-user rate limiting now exists (brake on burst spend)', () => {
    // FIXED (fix/ai-route-cost-guards): the route now calls enforceIpRateLimit
    // and enforceUserRateLimit (the same helpers, same windows/limits as the
    // chat route) immediately after requireUser, returning 429 on !ok. A rapid
    // second request from the same caller is throttled before it bills a second
    // paid DeepInfra call.
    it('[GUARD] returns 429 on a rapid second request from the same caller', async () => {
      authedSession();
      const ip = '203.0.113.7';

      const first = await POST(
        makeRequest({ message: 'one' }, { 'x-forwarded-for': ip }),
      );
      const second = await POST(
        makeRequest({ message: 'two' }, { 'x-forwarded-for': ip }),
      );

      // Hardened behaviour: per-user/second limit trips the back-to-back call.
      expect(first.status).toBe(200);
      expect(second.status).toBe(429);
      // The throttled call never reaches the paid model.
      expect(generateContentMock).toHaveBeenCalledTimes(1);
    });
  });
});
