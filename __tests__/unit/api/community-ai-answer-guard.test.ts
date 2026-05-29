/**
 * @jest-environment node
 *
 * Guard-invariant coverage for `POST /api/community/questions/[id]/ai-answer` —
 * an internal route that generates a paid DeepInfra answer (generateText =>
 * Llama-3.3-70B, maxOutputTokens 800) for a community question.
 *
 * Guard that DOES exist (pinned as a passing test):
 *   - x-api-key must equal INTERNAL_API_KEY (when that env var is configured)
 *     => 401 on mismatch, and no model call.
 *   - the model input is DB-sourced (an already-approved question row), not
 *     raw request-body text, so prompt size is bounded by stored content.
 *
 * Guard WEAKNESS (captured as it.skip + RISK + companion test):
 *   - The auth check is `if (expectedKey && apiKey !== expectedKey)`. When
 *     INTERNAL_API_KEY is UNSET/empty, the gate is SKIPPED ENTIRELY and the
 *     route is callable by anyone, triggering a paid completion per valid,
 *     not-yet-answered question id.
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
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers } },
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
          { id: 1, space_id: 10, post_text: 'What is a moon square?', topic_tag: 'astro' },
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

  describe('RISK: auth gate is bypassed when INTERNAL_API_KEY is unset', () => {
    // BUG/RISK: The guard is `if (expectedKey && apiKey !== expectedKey) 401`.
    // When INTERNAL_API_KEY is undefined/empty (e.g. misconfigured env, a new
    // environment, or a secret rotation gap), `expectedKey` is falsy and the
    // entire auth check is skipped — the route then runs the paid DeepInfra
    // completion for ANY caller hitting a valid, not-yet-answered question id.
    //
    // IMPACT: an unauthenticated attacker who enumerates question ids can
    // trigger one paid Llama-3.3-70B completion (maxOutputTokens 800) per id —
    // unattended DeepInfra spend with no auth and no rate limit.
    // SUGGESTED GUARD (owner decision, app-code change — NOT applied here):
    //   fail closed when the key is unset, e.g.
    //     if (!expectedKey || apiKey !== expectedKey) return 401;
    //   (and add a rate limit / global ceiling on this paid path).
    it.skip('[RISK] should still return 401 when INTERNAL_API_KEY is unset — gate currently fails OPEN', async () => {
      delete process.env.INTERNAL_API_KEY;
      answerableQuestionDb();

      const res = await POST(makeRequest(), ctx('1'));

      // Desired hardened behaviour (currently fails — gate is skipped):
      expect(res.status).toBe(401);
      expect(generateTextMock).not.toHaveBeenCalled();
    });

    it('[current behaviour] with INTERNAL_API_KEY unset, an unauthenticated caller triggers a paid completion (documents the gap)', async () => {
      delete process.env.INTERNAL_API_KEY;
      answerableQuestionDb();

      const res = await POST(makeRequest(), ctx('1'));

      // Pins the present reality: no key configured => no auth => model billed.
      expect(res.status).toBe(200);
      expect(generateTextMock).toHaveBeenCalledTimes(1);
    });
  });
});
