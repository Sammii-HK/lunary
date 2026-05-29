/**
 * @jest-environment node
 *
 * Coverage for the edge-middleware origin gate (`src/middleware.ts`).
 *
 * The middleware blocks direct, browser-less API calls to a hand-picked set of
 * sensitive POST endpoints: real browsers always send an `Origin` header, bots
 * hammering the API directly usually don't. These tests pin which routes ARE
 * protected (so a regression that drops one fails CI) and — importantly for the
 * cost/abuse audit — DOCUMENT that the paid AI/LLM routes are NOT in that set.
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

  describe('RISK: paid AI/LLM routes are NOT behind the origin gate', () => {
    // BUG/RISK: src/middleware.ts only applies the Origin gate to auth, share
    // (POST) and newsletter (POST). The paid DeepInfra routes — /api/ai/chat,
    // /api/ai/grimoire-quick, /api/score, /api/community/.../ai-answer — are
    // NOT in `requiresOriginCheck`, so the middleware does not reject a direct,
    // browser-less call to them. Per-route guards (auth, daily ceiling) are the
    // only backstop; the cheap "no Origin header => 403" bot filter that auth
    // routes enjoy does not protect the spend-bearing endpoints.
    //
    // IMPACT: the lowest-cost line of defence against scripted/bot abuse of the
    // paid LLM endpoints is absent at the edge. This compounds the per-route
    // gaps flagged in the grimoire-quick / score / ai-answer guard tests.
    // SUGGESTED GUARD (owner decision, app-code change — NOT applied here):
    //   add the paid AI POST routes to `requiresOriginCheck` in middleware.ts
    //   (and to the `matcher`), mirroring the auth-route treatment, as a cheap
    //   first filter in front of the per-route auth/rate-limit guards.
    const paidAiPosts = [
      '/api/ai/chat',
      '/api/ai/grimoire-quick',
      '/api/score',
      '/api/community/questions/1/ai-answer',
    ];

    it.skip.each(paidAiPosts)(
      '[RISK] should 403 %s on a direct call with no Origin — NOT gated today',
      (path) => {
        const res = call(path, { method: 'POST' });
        // Desired hardened behaviour (currently fails — route is not gated):
        expect(res?.status).toBe(403);
      },
    );

    it.each(paidAiPosts)(
      '[current behaviour] does NOT 403 %s with a missing Origin (documents the gap)',
      (path) => {
        const res = call(path, { method: 'POST' });
        // Middleware either returns undefined (pass-through) or a non-403
        // result for these paths — it never blocks them on origin.
        expect(res?.status === 403).toBe(false);
      },
    );
  });
});
