/**
 * @jest-environment node
 *
 * Coverage for the edge-middleware origin gate (`src/middleware.ts`).
 *
 * The middleware blocks direct, browser-less API calls to a hand-picked set of
 * sensitive POST endpoints: real browsers always send an `Origin` header, bots
 * hammering the API directly usually don't. These tests pin which routes ARE
 * protected (so a regression that drops one fails CI), including the paid
 * AI/LLM cost routes (grimoire-quick, score, ai-answer) added to the gate in
 * fix/ai-route-cost-guards. (/api/ai/chat is intentionally left out of scope —
 * see the note in the GUARD block — as it has strong per-route guards.)
 *
 * Pure unit: the middleware is a plain function; we hand it a NextRequest and a
 * minimal event stub. No network, no DB, no model. A non-production host
 * ('localhost') is used so we exercise the origin gate without tripping the
 * www->apex / https redirect branches.
 */

import { NextRequest } from 'next/server';

import { middleware } from '@/middleware';

const fakeEvent = { waitUntil: () => {} } as unknown as Parameters<
  typeof middleware
>[1];

function call(
  path: string,
  {
    method = 'POST',
    origin,
    host = 'localhost',
  }: { method?: string; origin?: string; host?: string } = {},
) {
  const headers: Record<string, string> = { host };
  if (origin !== undefined) headers.origin = origin;
  const req = new NextRequest(`http://${host}${path}`, { method, headers });
  return middleware(req, fakeEvent);
}

describe('middleware origin gate — guard invariants', () => {
  describe('protected sensitive routes (origin check ENFORCED)', () => {
    const protectedPosts = [
      '/api/auth/sign-up',
      '/api/auth/forgot-password',
      '/api/auth/send-verification-email',
      '/api/auth/resend-verification',
    ];

    it.each(protectedPosts)(
      'blocks %s with 403 when the Origin header is absent (direct bot call)',
      (path) => {
        const res = call(path, { method: 'POST' });
        expect(res?.status).toBe(403);
      },
    );

    it.each(protectedPosts)(
      'blocks %s with 403 when the Origin is not allow-listed',
      (path) => {
        const res = call(path, { origin: 'https://evil.example.com' });
        expect(res?.status).toBe(403);
      },
    );

    it('allows a sign-up request that carries an allow-listed Origin', () => {
      const res = call('/api/auth/sign-up', { origin: 'https://lunary.app' });
      // Not a 403 — the origin gate lets it through to the handler.
      expect(res?.status).not.toBe(403);
    });

    it('blocks a POST to /api/share/* without a valid Origin', () => {
      const res = call('/api/share/cosmic-card', { method: 'POST' });
      expect(res?.status).toBe(403);
    });
  });

  describe('GUARD: paid AI/LLM cost routes are now behind the origin gate', () => {
    // FIXED (fix/ai-route-cost-guards): the spend-bearing DeepInfra POST routes
    // /api/ai/grimoire-quick, /api/score and /api/community/.../ai-answer were
    // added to `requiresOriginCheck` (and the matcher) in src/middleware.ts,
    // mirroring the auth-route treatment. A direct, browser-less call with no
    // (or a non-allow-listed) Origin is now rejected with 403 at the edge — a
    // cheap first filter in front of the per-route auth/rate-limit guards.
    const gatedPaidAiPosts = [
      '/api/ai/grimoire-quick',
      '/api/score',
      '/api/community/questions/1/ai-answer',
    ];

    it.each(gatedPaidAiPosts)(
      '[GUARD] 403s %s on a direct POST with no Origin header',
      (path) => {
        const res = call(path, { method: 'POST' });
        expect(res?.status).toBe(403);
      },
    );

    it.each(gatedPaidAiPosts)(
      '[GUARD] 403s %s on a POST whose Origin is not allow-listed',
      (path) => {
        const res = call(path, { origin: 'https://evil.example.com' });
        expect(res?.status).toBe(403);
      },
    );

    it.each(gatedPaidAiPosts)(
      'allows %s through the origin gate when the Origin is allow-listed',
      (path) => {
        const res = call(path, { origin: 'https://lunary.app' });
        // Past the origin gate (not a 403); per-route auth/rate-limit guards
        // then apply downstream.
        expect(res?.status).not.toBe(403);
      },
    );

    // NOTE: /api/ai/chat is intentionally NOT added to the origin gate here.
    // It is the most heavily guarded route (auth + per-IP + per-user + per-day
    // ceiling + input bound) and is left out of this change's scope; its strong
    // per-route guards are pinned in ai-chat-guard.test.ts. This documents that
    // the omission is deliberate, not a regression.
    it('does not origin-gate /api/ai/chat (out of scope; covered by its per-route guards)', () => {
      const res = call('/api/ai/chat', { method: 'POST' });
      expect(res?.status === 403).toBe(false);
    });
  });
});
