/**
 * @jest-environment node
 *
 * Guard-invariant coverage for `POST /api/ai/grimoire-quick` — a SECOND paid
 * DeepInfra surface (calls `generateContent` => Llama-3.3-70B). Cheaper per
 * call than the main chat route (maxTokens 150) but still real money.
 *
 * Guards that DO exist (pinned below as passing tests):
 *   - requireUser  => 401 when unauthenticated
 *   - per-day message ceiling (DAILY_MESSAGE_LIMITS) => 429 when exhausted
 *
 * Guards that are MISSING vs the main chat route (captured as it.skip +
 * RISK + a companion test pinning the CURRENT, weaker behaviour so the gap is
 * documented and a future hardening flips the skip green):
 *   - NO input length bound on body.message (chat route caps at 4000 chars)
 *   - NO enforceIpRateLimit / enforceUserRateLimit (chat route has both)
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

      const res = await POST(makeRequest({ message: 'tell me about crystals' }));

      expect(res.status).toBe(429);
      expect(generateContentMock).not.toHaveBeenCalled();
    });
  });

  describe('RISK: missing input-length bound (silent-cost / abuse surface)', () => {
    // BUG/RISK: Unlike POST /api/ai/chat (which caps message at z.string().max(4000)),
    // this route applies NO length bound to body.message before forwarding it to
    // the paid model. A single authenticated request can ship an arbitrarily large
    // prompt, inflating DeepInfra input-token cost per call. The per-day message
    // COUNT ceiling does not bound per-message SIZE, so cost-per-call is uncapped.
    //
    // IMPACT: an entitled (or trial) user — or a leaked session — can drive up
    // spend with very large prompts; cost scales with attacker-controlled input.
    // SUGGESTED GUARD (owner decision, app-code change — NOT applied here):
    //   add `if (body.message.length > MAX) return 400;` (mirror chat's 4000-char
    //   z.string().max bound), ideally via a shared zod schema.
    it.skip('[RISK] should reject an oversized message (> 4000 chars) with 400 — NO bound exists today', async () => {
      authedSession();
      const huge = 'a'.repeat(20_000);

      const res = await POST(makeRequest({ message: huge }));

      // Desired hardened behaviour (currently fails — there is no bound):
      expect(res.status).toBe(400);
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('[current behaviour] forwards an oversized 20k-char message straight to the paid model (documents the gap)', async () => {
      authedSession();
      const huge = 'a'.repeat(20_000);

      const res = await POST(makeRequest({ message: huge }));

      // Pins the present reality: oversized input is accepted and billed.
      expect(res.status).toBe(200);
      expect(generateContentMock).toHaveBeenCalledTimes(1);
      const [args] = generateContentMock.mock.calls[0] as [
        { prompt: string },
      ];
      expect(args.prompt.length).toBe(20_000);
    });
  });

  describe('RISK: no per-IP / per-second rate limit (no brake on burst spend)', () => {
    // BUG/RISK: This route does NOT call enforceIpRateLimit or
    // enforceUserRateLimit (the main chat route calls both). The only throttle
    // is the per-DAY message count. Within a single day a caller can fire as
    // fast as the event loop allows, each a paid DeepInfra call, with no
    // per-second or per-IP brake — there is no fast kill switch against a burst.
    //
    // IMPACT: a tight loop from one session/IP produces a burst of paid calls
    // until the daily ceiling trips; no rapid abuse cut-off in between.
    // SUGGESTED GUARD (owner decision, app-code change — NOT applied here):
    //   call enforceIpRateLimit(req.headers.get('x-forwarded-for'), now) and
    //   enforceUserRateLimit(user.id, now) immediately after requireUser, as the
    //   chat route does, returning 429 on !ok.
    it.skip('[RISK] should return 429 on a rapid second request from the same IP — NO per-IP/second limit exists today', async () => {
      authedSession();
      const ip = '203.0.113.7';

      const first = await POST(
        makeRequest({ message: 'one' }, { 'x-forwarded-for': ip }),
      );
      const second = await POST(
        makeRequest({ message: 'two' }, { 'x-forwarded-for': ip }),
      );

      // Desired hardened behaviour (currently fails — no such limit):
      expect(first.status).toBe(200);
      expect(second.status).toBe(429);
    });

    it('[current behaviour] allows two back-to-back paid calls from the same IP within a second (documents the gap)', async () => {
      authedSession();
      const ip = '203.0.113.7';

      const first = await POST(
        makeRequest({ message: 'one' }, { 'x-forwarded-for': ip }),
      );
      const second = await POST(
        makeRequest({ message: 'two' }, { 'x-forwarded-for': ip }),
      );

      // Pins the present reality: no per-IP/second brake — both calls bill.
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(generateContentMock).toHaveBeenCalledTimes(2);
    });
  });
});
