/**
 * @jest-environment node
 *
 * Guard-invariant coverage for `POST /api/score` (the iPrep interview-coach
 * route). It calls DeepInfra Llama-3.1-70B directly via fetch — real money per
 * call. It is NOT an astrology route, but it shares the same unattended-spend
 * surface and the same DEEPINFRA_API_KEY, so the cost-abuse invariants matter.
 *
 * Guards that DO exist (pinned as passing tests):
 *   - X-RC-User-Id header gate => 401 when absent or 'anonymous'
 *   - input bounds: transcript z.string().max(8000), question max(1000)
 *
 * Guard that is MISSING (captured as it.skip + RISK + companion test):
 *   - NO rate limit of any kind (per-user, per-IP, or global) and no cost
 *     ceiling / kill switch. The X-RC-User-Id gate is a client-supplied header
 *     (spoofable), so the only thing standing between a caller and unbounded
 *     paid completions is "send any non-'anonymous' header value".
 *
 * No real LLM (fetch is mocked), no real DB, no snapshots.
 */

import { NextRequest } from 'next/server';

const fetchMock = jest.fn();

import { POST } from '@/app/api/score/route';

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

  describe('RISK: no rate limit and no cost ceiling (silent burst-spend surface)', () => {
    // BUG/RISK: /api/score has NO rate limiting (no per-user, per-IP, or global
    // ceiling) and NO cost ceiling / kill switch. Its only gate is the
    // client-supplied X-RC-User-Id header, which is trivially spoofable to any
    // non-'anonymous' string. Combined, this means an attacker who sends a
    // single header value can call paid DeepInfra completions in an unbounded
    // loop. This is the PR #283 class of finding on a non-Lunary route that
    // shares the same DEEPINFRA_API_KEY.
    //
    // IMPACT: uncapped paid completions from one spoofed header => direct,
    // unattended DeepInfra spend with no brake and no automatic cut-off.
    // SUGGESTED GUARD (owner decision, app-code change — NOT applied here):
    //   add a per-IP and/or per-RC-user rate limit (the app already has
    //   src/lib/ai/rate-limit.ts) plus a global daily call ceiling / kill
    //   switch, and ideally verify the RC entitlement server-side rather than
    //   trusting the header.
    it.skip('[RISK] should throttle a rapid burst from one caller — NO rate limit exists today', async () => {
      const headers = { 'X-RC-User-Id': 'rc-user-123' };

      const results = await Promise.all(
        Array.from({ length: 25 }, () => POST(makeRequest(validBody, headers))),
      );

      // Desired hardened behaviour (currently fails — no limiter exists):
      const throttled = results.filter((r) => r.status === 429);
      expect(throttled.length).toBeGreaterThan(0);
    });

    it('[current behaviour] bills every request in a 25-call burst from one spoofable header (documents the gap)', async () => {
      const headers = { 'X-RC-User-Id': 'rc-user-123' };

      const results = await Promise.all(
        Array.from({ length: 25 }, () => POST(makeRequest(validBody, headers))),
      );

      // Pins the present reality: zero throttling, every call hits the model.
      expect(results.every((r) => r.status === 200)).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(25);
    });
  });
});
