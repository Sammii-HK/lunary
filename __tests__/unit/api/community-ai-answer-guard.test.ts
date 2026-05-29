/**
 * @jest-environment node
 *
 * Guard-invariant coverage for `POST /api/community/questions/[id]/ai-answer` —
 * an internal route that generates a paid DeepInfra answer (generateText =>
 * Llama-3.3-70B, maxOutputTokens 800) for a community question.
 *
 * Guards that exist (all pinned as passing tests):
 *   - x-api-key must equal INTERNAL_API_KEY => 401 on mismatch, no model call.
 *   - the gate now FAILS CLOSED: when INTERNAL_API_KEY is unset/empty the route
 *     returns 401 instead of skipping auth (was the fail-open weakness below).
 *   - the model input is DB-sourced (an already-approved question row), not
 *     raw request-body text, so prompt size is bounded by stored content.
 *
 * The fail-closed change was added in fix/ai-route-cost-guards; the test that
 * previously documented the fail-open gap now asserts the gate is closed.
 * OPERATIONAL CAVEAT: INTERNAL_API_KEY MUST be set in prod or the route 401s
 * for everyone (including the internal cron caller).
 *
 * No real LLM, no real DB, no snapshots.
 */

import { NextRequest } from 'next/server';

// --- DB ---------------------------------------------------------------------
const sqlMock = jest.fn();
jest.mock('@vercel/postgres', () => ({
  sql: (...args: unknown[]) => sqlMock(...args),
}));

// --- Embeddings (grimoire search) -------------------------------------------
jest.mock('@/lib/embeddings', () => ({
  searchSimilar: jest.fn(async () => []),
}));

// --- Paid model call (dynamic-imported `generateText` from 'ai') ------------
const generateTextMock = jest.fn();
jest.mock('ai', () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}));
jest.mock('@/lib/ai/content-generator', () => ({
  getDeepInfraModel: jest.fn(() => ({})),
}));

import { POST } from '@/app/api/community/questions/[id]/ai-answer/route';

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(
    'https://lunary.app/api/community/questions/1/ai-answer',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    },
  );
}

// A DB stub where the question exists and has no prior AI answer, so a
// well-authed call would proceed to the paid model.
const answerableQuestionDb = () => {
  sqlMock.mockImplementation((strings: TemplateStringsArray) => {
    // Join with a separator so interpolation boundaries don't fuse column
    // names across clauses (e.g. `parent_id =` + `AND user_id`).
    const text = strings.join(' ');
    // Check INSERT first: its column list also contains parent_id/user_id, so
    // it must be matched before the existing-answer SELECT.
    if (text.includes('INSERT INTO community_posts')) {
      return Promise.resolve({ rows: [{ id: 99, created_at: new Date() }] });
    }
    if (text.includes('FROM community_posts') && text.includes('post_type')) {
      return Promise.resolve({
        rows: [
          {
            id: 1,
            space_id: 10,
            post_text: 'What is a moon square?',
            topic_tag: 'astro',
          },
        ],
      });
    }
    if (text.includes('parent_id') && text.includes('user_id')) {
      // No existing AI answer for this question.
      return Promise.resolve({ rows: [] });
    }
    return Promise.resolve({ rows: [] });
  });
};

const ORIGINAL_KEY = process.env.INTERNAL_API_KEY;

beforeEach(() => {
  jest.clearAllMocks();
  generateTextMock.mockResolvedValue({
    text: 'A moon square is a 90-degree aspect that creates tension between the two bodies involved.',
  });
});

afterAll(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.INTERNAL_API_KEY;
  else process.env.INTERNAL_API_KEY = ORIGINAL_KEY;
});

describe('POST /api/community/.../ai-answer — guard invariants (paid DeepInfra surface)', () => {
  describe('internal-key gate that EXISTS (when INTERNAL_API_KEY is configured)', () => {
    beforeEach(() => {
      process.env.INTERNAL_API_KEY = 'secret-internal-key';
      answerableQuestionDb();
    });

    it('returns 401 and never calls the model when x-api-key is wrong', async () => {
      const res = await POST(makeRequest({ 'x-api-key': 'WRONG' }), ctx('1'));
      expect(res.status).toBe(401);
      expect(generateTextMock).not.toHaveBeenCalled();
    });

    it('returns 401 and never calls the model when x-api-key is missing', async () => {
      const res = await POST(makeRequest(), ctx('1'));
      expect(res.status).toBe(401);
      expect(generateTextMock).not.toHaveBeenCalled();
    });

    it('proceeds to the model when the correct x-api-key is supplied', async () => {
      const res = await POST(
        makeRequest({ 'x-api-key': 'secret-internal-key' }),
        ctx('1'),
      );
      expect(res.status).toBe(200);
      expect(generateTextMock).toHaveBeenCalledTimes(1);
    });

    it('rejects an invalid (non-numeric) question id with 400 before any DB/model work', async () => {
      const res = await POST(
        makeRequest({ 'x-api-key': 'secret-internal-key' }),
        ctx('not-a-number'),
      );
      expect(res.status).toBe(400);
      expect(generateTextMock).not.toHaveBeenCalled();
    });
  });

  describe('GUARD: auth gate now FAILS CLOSED when INTERNAL_API_KEY is unset', () => {
    // FIXED (fix/ai-route-cost-guards): the gate is now
    //   `if (!expectedKey || apiKey !== expectedKey) return 401;`
    // so when INTERNAL_API_KEY is undefined/empty (misconfig, new environment,
    // or a secret-rotation gap) the route returns 401 instead of running the
    // paid DeepInfra completion for any caller. An attacker enumerating question
    // ids can no longer trigger unattended spend through a missing-env hole.
    //
    // OPERATIONAL CAVEAT (see route comment + PR note): because the gate now
    // fails closed, INTERNAL_API_KEY MUST be set in production, otherwise the
    // route 401s for EVERYONE including the internal cron caller.
    it('[GUARD] returns 401 and never calls the model when INTERNAL_API_KEY is unset and no key is sent', async () => {
      delete process.env.INTERNAL_API_KEY;
      answerableQuestionDb();

      const res = await POST(makeRequest(), ctx('1'));

      expect(res.status).toBe(401);
      expect(generateTextMock).not.toHaveBeenCalled();
    });

    it('[GUARD] returns 401 even if a caller supplies an arbitrary x-api-key while INTERNAL_API_KEY is unset', async () => {
      // Previously this path FAILED OPEN (any caller => 200 + paid completion).
      // The fail-closed gate rejects it regardless of the supplied header value.
      delete process.env.INTERNAL_API_KEY;
      answerableQuestionDb();

      const res = await POST(
        makeRequest({ 'x-api-key': 'anything-the-attacker-wants' }),
        ctx('1'),
      );

      expect(res.status).toBe(401);
      expect(generateTextMock).not.toHaveBeenCalled();
    });
  });
});
