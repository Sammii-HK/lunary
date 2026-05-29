/**
 * @jest-environment node
 *
 * Guard-invariant coverage for `POST /api/score` (the iPrep interview-coach
 * route). It calls DeepInfra Llama-3.1-70B directly via fetch — real money per
 * call. It is NOT an astrology route, but it shares the same unattended-spend
 * surface and the same DEEPINFRA_API_KEY, so the cost-abuse invariants matter.
 *
 * Guards that exist (all pinned as passing tests):
 *   - X-RC-User-Id header gate => 401 when absent or 'anonymous'
 *   - input bounds: transcript z.string().max(8000), question max(1000)
 *   - per-IP rate limit keyed on the TRUSTED IP (mirrors the chat route's
 *     enforceIpRateLimit, 10/min) + a process-wide global daily ceiling
 *     => 429s brake a burst; the spoofable header is no longer the only gate
 *
 * The rate-limit + global-ceiling guards were added in fix/ai-route-cost-guards;
 * the test that previously documented the gap now asserts the guard exists.
 * (Server-side RC-entitlement verification remains a TODO(owner) in the route.)
 *
 * No real LLM (fetch is mocked), no real DB, no snapshots.
 */

import { NextRequest } from 'next/server';

const fetchMock = jest.fn();

import { POST } from '@/app/api/score/route';
import { __resetRateLimitStateForTests } from '@/lib/ai/rate-limit';

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest('https://lunary.app/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

const validBody = {
  transcript: 'I led a migration that cut latency by 40%.',
  question: 'Tell me about a hard technical problem you solved.',
  category: 'behavioural',
  duration: 60,
};

const okDeepInfraResponse = () =>
  ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: '{"answerQuality":4}' } }],
    }),
  }) as unknown as Response;

beforeEach(() => {
  jest.clearAllMocks();
  // Clear in-memory rate-limit counters (per-IP + global daily) so prior tests
  // don't bleed state into the burst assertion or the input-bound checks.
  __resetRateLimitStateForTests();
  global.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockResolvedValue(okDeepInfraResponse());
  process.env.DEEPINFRA_API_KEY = 'test-key';
});

describe('POST /api/score — guard invariants (paid DeepInfra surface)', () => {
  describe('authentication gate that EXISTS', () => {
    it('returns 401 and never calls DeepInfra when X-RC-User-Id is absent', async () => {
      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns 401 and never calls DeepInfra when X-RC-User-Id is 'anonymous'", async () => {
      const res = await POST(
        makeRequest(validBody, { 'X-RC-User-Id': 'anonymous' }),
      );
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('proceeds to the model when a non-anonymous RC user id is supplied', async () => {
      const res = await POST(
        makeRequest(validBody, { 'X-RC-User-Id': 'rc-user-123' }),
      );
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('input bounds that EXIST (cap per-call token cost)', () => {
    it('rejects an over-long transcript (> 8000 chars) with 400 and never calls the model', async () => {
      const res = await POST(
        makeRequest(
          { ...validBody, transcript: 'a'.repeat(8001) },
          { 'X-RC-User-Id': 'rc-user-123' },
        ),
      );
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects an over-long question (> 1000 chars) with 400 and never calls the model', async () => {
      const res = await POST(
        makeRequest(
          { ...validBody, question: 'q'.repeat(1001) },
          { 'X-RC-User-Id': 'rc-user-123' },
        ),
      );
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('GUARD: rate limit + global daily ceiling now brake burst spend', () => {
    // FIXED (fix/ai-route-cost-guards): /api/score now enforces a per-IP rate
    // limit keyed on the TRUSTED IP (mirrors the chat route's enforceIpRateLimit,
    // 10/min from PLAN_LIMITS) plus a process-wide global daily ceiling. The
    // spoofable X-RC-User-Id header is kept as a cheap first gate but is no
    // longer the only thing standing between a caller and unbounded paid
    // DeepInfra completions. (Server-side RC-entitlement verification is left as
    // a documented TODO(owner) in the route — an owner secrets/cost decision.)
    it('[GUARD] throttles a rapid 25-call burst from one caller (some 429s, model not billed for them)', async () => {
      const headers = { 'X-RC-User-Id': 'rc-user-123' };

      const results = await Promise.all(
        Array.from({ length: 25 }, () => POST(makeRequest(validBody, headers))),
      );

      const ok = results.filter((r) => r.status === 200);
      const throttled = results.filter((r) => r.status === 429);

      // Hardened behaviour: the burst is braked, not billed end-to-end.
      expect(throttled.length).toBeGreaterThan(0);
      // The paid model is only hit for the calls that passed the limiter.
      expect(fetchMock).toHaveBeenCalledTimes(ok.length);
      expect(fetchMock.mock.calls.length).toBeLessThan(25);
    });

    it('[GUARD] the limit is keyed on the TRUSTED IP, not the spoofable X-RC-User-Id header', async () => {
      // Every request carries a DIFFERENT (spoofed) RC user id but the SAME
      // trusted x-real-ip. If the limiter were keyed on the header, rotating it
      // would defeat throttling; keyed on the IP, the burst is still braked.
      const ip = '198.51.100.42';
      const results = await Promise.all(
        Array.from({ length: 25 }, (_unused, i) =>
          POST(
            makeRequest(validBody, {
              'X-RC-User-Id': `spoofed-${i}`,
              'x-real-ip': ip,
            }),
          ),
        ),
      );

      const throttled = results.filter((r) => r.status === 429);
      expect(throttled.length).toBeGreaterThan(0);
    });
  });
});
