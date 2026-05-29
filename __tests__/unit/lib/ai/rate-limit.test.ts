/**
 * @jest-environment node
 *
 * Guard-invariant coverage for the AI/LLM rate limiter.
 *
 * `src/lib/ai/rate-limit.ts` is the only per-IP / per-user throttle standing
 * between an anonymous-ish caller and paid DeepInfra completions on the main
 * Astral Guide chat route. These calls cost real money per request, so a
 * regression that loosens or removes the ceilings is a silent-spend / abuse
 * risk (the PR #283 class of bug).
 *
 * These tests pin the ceilings that DO exist so a future change that raises or
 * deletes them fails CI. Pure unit — no model, no DB, no network.
 *
 * NOTE: the limiter bypasses ONLY when NODE_ENV === 'development'. Under Jest
 * NODE_ENV is 'test', so the real ceilings are exercised here. Each test uses a
 * unique key/IP so the module-level Maps do not bleed across cases.
 */

import { PLAN_LIMITS } from '@/lib/ai/plans';
import {
  enforceIpRateLimit,
  enforceUserRateLimit,
} from '@/lib/ai/rate-limit';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

let keyCounter = 0;
const uniqueKey = (label: string): string => {
  keyCounter += 1;
  return `${label}-${keyCounter}-${Math.random().toString(36).slice(2)}`;
};

beforeAll(() => {
  // Defensive: ensure we are NOT in the dev-bypass branch.
  // (next/jest sets this to 'test', but pin it so the suite is deterministic
  //  even if a future config changes the default.)
  (process.env as Record<string, string>).NODE_ENV = 'test';
});

afterAll(() => {
  (process.env as Record<string, string | undefined>).NODE_ENV =
    ORIGINAL_NODE_ENV;
});

describe('AI rate limiter — guard invariants (cost/abuse surface)', () => {
  describe('PLAN_LIMITS contract', () => {
    it('keeps a finite per-IP-per-minute ceiling (kill switch against a single abusive IP)', () => {
      // If this becomes 0 / undefined / Infinity an open IP could hammer paid
      // DeepInfra calls with no brake. Pin that a real, small ceiling exists.
      expect(typeof PLAN_LIMITS.requestsPerMinutePerIp).toBe('number');
      expect(PLAN_LIMITS.requestsPerMinutePerIp).toBeGreaterThan(0);
      expect(PLAN_LIMITS.requestsPerMinutePerIp).toBeLessThanOrEqual(60);
    });

    it('keeps a finite per-user requests-per-second ceiling', () => {
      expect(typeof PLAN_LIMITS.requestPerSecond).toBe('number');
      expect(PLAN_LIMITS.requestPerSecond).toBeGreaterThan(0);
      expect(PLAN_LIMITS.requestPerSecond).toBeLessThanOrEqual(10);
    });
  });

  describe('enforceIpRateLimit', () => {
    it('allows the first request from a fresh IP', () => {
      const ip = uniqueKey('1.2.3');
      const now = 1_000_000;
      expect(enforceIpRateLimit(ip, now).ok).toBe(true);
    });

    it('blocks once the per-minute ceiling is exceeded within the window', () => {
      const ip = uniqueKey('9.9.9');
      const start = 2_000_000;
      const ceiling = PLAN_LIMITS.requestsPerMinutePerIp;

      // Burn exactly the ceiling — all should pass.
      for (let i = 0; i < ceiling; i += 1) {
        const res = enforceIpRateLimit(ip, start + i);
        expect(res.ok).toBe(true);
      }

      // The next request inside the same 60s window must be rejected.
      const blocked = enforceIpRateLimit(ip, start + ceiling);
      expect(blocked.ok).toBe(false);
      expect(blocked.retryAfter).toBeGreaterThan(0);
      expect(typeof blocked.reason).toBe('string');
    });

    it('resets the IP window after 60 seconds (does not lock an IP out forever)', () => {
      const ip = uniqueKey('5.5.5');
      const start = 3_000_000;
      const ceiling = PLAN_LIMITS.requestsPerMinutePerIp;

      for (let i = 0; i < ceiling; i += 1) {
        enforceIpRateLimit(ip, start + i);
      }
      expect(enforceIpRateLimit(ip, start + ceiling).ok).toBe(false);

      // One full minute later the window resets and traffic flows again.
      const afterWindow = enforceIpRateLimit(ip, start + 60_000 + 1);
      expect(afterWindow.ok).toBe(true);
    });

    it('treats a missing IP header as allowed (no header => no per-IP brake)', () => {
      // Documents current behaviour: a request with no x-forwarded-for is NOT
      // throttled per-IP. The user-level + daily ceilings are the backstop.
      expect(enforceIpRateLimit(null, 4_000_000).ok).toBe(true);
      expect(enforceIpRateLimit(undefined, 4_000_001).ok).toBe(true);
    });

    it('keys on the first IP in a forwarded chain (spoofed trailing IPs cannot dodge the limit)', () => {
      const realIp = uniqueKey('7.7.7');
      const start = 5_000_000;
      const ceiling = PLAN_LIMITS.requestsPerMinutePerIp;

      for (let i = 0; i < ceiling; i += 1) {
        enforceIpRateLimit(`${realIp}, 10.0.0.${i}`, start + i);
      }
      // Same leading IP, different trailing proxy hops — still blocked.
      const blocked = enforceIpRateLimit(`${realIp}, 10.0.0.250`, start + ceiling);
      expect(blocked.ok).toBe(false);
    });
  });

  describe('enforceUserRateLimit', () => {
    it('allows the first request from a fresh user', () => {
      const userId = uniqueKey('user');
      expect(enforceUserRateLimit(userId, 6_000_000).ok).toBe(true);
    });

    it('rejects a second request fired within the same second (per-second cap)', () => {
      const userId = uniqueKey('user');
      const t = 7_000_000;
      expect(enforceUserRateLimit(userId, t).ok).toBe(true);

      // A burst in the same 1s window must be throttled.
      const blocked = enforceUserRateLimit(userId, t + 10);
      expect(blocked.ok).toBe(false);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it('allows the user again after the per-second window passes', () => {
      const userId = uniqueKey('user');
      const t = 8_000_000;
      expect(enforceUserRateLimit(userId, t).ok).toBe(true);
      expect(enforceUserRateLimit(userId, t + 10).ok).toBe(false);
      // > 1s later: allowed again.
      expect(enforceUserRateLimit(userId, t + 1_100).ok).toBe(true);
    });
  });
});
