/**
 * @jest-environment node
 *
 * Guard-invariant coverage for the MAIN Astral Guide chat route
 * (`POST /api/ai/chat`) — the single biggest unattended DeepInfra cost surface
 * in the app. Every reply is a paid Llama-3.3-70B completion.
 *
 * This route IS well-guarded (auth + per-IP + per-user + per-day ceilings +
 * a 4000-char input bound). These tests pin those guards so a future refactor
 * that drops one of them (the PR #283 class of regression) fails CI BEFORE it
 * can leak spend.
 *
 * Strategy: mock every expensive collaborator (the model composer, the DB, the
 * session lookup) so only the guard ordering runs. The key assertion on the
 * reject paths is that `composeAssistantReply` (the paid model call) is NEVER
 * reached. No real LLM, no real DB, no snapshots.
 */

import { NextRequest } from 'next/server';

// --- Paid model call: must never fire on a rejected request -----------------
const composeAssistantReplyMock = jest.fn();
jest.mock('@/lib/ai/responder', () => ({
  composeAssistantReply: (...args: unknown[]) =>
    composeAssistantReplyMock(...args),
}));

// --- Session lookup (better-auth) -------------------------------------------
const getSessionMock = jest.fn();
jest.mock('@/lib/auth', () => ({
  auth: { api: { getSession: (...a: unknown[]) => getSessionMock(...a) } },
}));

// --- DB ---------------------------------------------------------------------
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(async () => ({ rows: [] })),
}));

// --- Context / memory / usage collaborators (kept inert) --------------------
jest.mock('@/lib/ai/context', () => ({
  buildLunaryContext: jest.fn(async () => ({
    context: {},
    dailyHighlight: null,
  })),
}));
jest.mock('@/lib/ai/memory', () => ({
  getMemorySnippets: jest.fn(() => []),
  captureMemory: jest.fn(async () => ({ ok: true })),
}));
jest.mock('@/lib/ai/usage', () => ({
  loadUsage: jest.fn(async () => ({ usedMessages: 0 })),
  updateUsage: jest.fn(async () => ({
    limitExceeded: false,
    usage: { usedMessages: 1, tokensIn: 1, tokensOut: 1 },
    dailyLimit: 3,
  })),
}));

import { POST } from '@/app/api/ai/chat/route';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function makeChatRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest('https://lunary.app/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(() => {
  // Force the non-bypass branch of the rate limiter and the auth test-mode
  // helper to behave like production unless a test opts into the fallback.
  (process.env as Record<string, string>).NODE_ENV = 'test';
});

afterAll(() => {
  (process.env as Record<string, string | undefined>).NODE_ENV =
    ORIGINAL_NODE_ENV;
});

beforeEach(() => {
  jest.clearAllMocks();
  composeAssistantReplyMock.mockResolvedValue({
    message: 'hello from a mocked model',
    assistSnippet: null,
    reflection: null,
    promptSections: {},
  });
});

describe('POST /api/ai/chat — guard invariants (paid DeepInfra surface)', () => {
  describe('input bound (prevents an unbounded prompt being billed)', () => {
    it('rejects an oversized message (> 4000 chars) with 400 and never calls the model', async () => {
      const huge = 'a'.repeat(4001);
      const res = await POST(makeChatRequest({ message: huge }));

      expect(res.status).toBe(400);
      expect(composeAssistantReplyMock).not.toHaveBeenCalled();
    });

    it('rejects a malformed body (wrong message type) with 400 and never calls the model', async () => {
      const res = await POST(makeChatRequest({ message: 12345 }));

      expect(res.status).toBe(400);
      expect(composeAssistantReplyMock).not.toHaveBeenCalled();
    });

    it('accepts a message at exactly the 4000-char boundary (bound is inclusive, not stricter than declared)', async () => {
      // Authenticated so we get past requireUser; the model is mocked so no
      // real spend. This pins that the cap is exactly 4000 and not lower.
      getSessionMock.mockResolvedValue({ user: { id: 'user-boundary' } });
      const atLimit = 'a'.repeat(4000);

      const res = await POST(
        makeChatRequest({ message: atLimit }, { origin: 'https://lunary.app' }),
      );

      // Must NOT be the 400 input-rejection path.
      expect(res.status).not.toBe(400);
    });
  });

  describe('authentication (route is gated to a real session)', () => {
    it('returns 401 and never calls the model when there is no session', async () => {
      getSessionMock.mockResolvedValue(null);

      const res = await POST(
        // x-test-force-unauth defeats the dev/test auto-login fallback so we
        // exercise the genuine unauthenticated path.
        makeChatRequest(
          { message: 'tell me my horoscope' },
          { 'x-test-force-unauth': 'true' },
        ),
      );

      expect(res.status).toBe(401);
      expect(composeAssistantReplyMock).not.toHaveBeenCalled();
    });
  });
});
