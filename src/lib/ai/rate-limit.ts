import { PLAN_LIMITS } from './plans';

type RateLimitState = {
  lastTimestamp: number;
  countInWindow: number;
  windowStart: number;
};

const userRateMap = new Map<string, RateLimitState>();
const ipRateMap = new Map<string, RateLimitState>();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DAY = 24 * 60 * MINUTE;

// Global (process-wide) daily call counter for paid surfaces that need a hard
// spend ceiling regardless of which caller is hitting them. Edge-safe: plain
// in-memory state, same style as the per-IP/per-user maps above. Per-instance
// (not shared across regions), which is acceptable as a catastrophic-spend
// backstop on top of the per-IP/per-user limits.
const globalDailyCounter = { count: 0, windowStart: Date.now() };

const resetIfExpired = (
  state: RateLimitState,
  windowMs: number,
  now: number,
) => {
  if (now - state.windowStart >= windowMs) {
    state.windowStart = now;
    state.countInWindow = 0;
  }
};

export type RateLimitCheck = {
  ok: boolean;
  retryAfter?: number;
  reason?: string;
};

export const enforceUserRateLimit = (
  userId: string,
  now = Date.now(),
): RateLimitCheck => {
  // Bypass rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { ok: true };
  }

  const existing = userRateMap.get(userId);
  if (!existing) {
    userRateMap.set(userId, {
      lastTimestamp: now,
      countInWindow: 1,
      windowStart: now,
    });
    return { ok: true };
  }

  if (now - existing.lastTimestamp < SECOND / PLAN_LIMITS.requestPerSecond) {
    return {
      ok: false,
      retryAfter: Math.ceil((SECOND - (now - existing.lastTimestamp)) / 1000),
      reason: 'Rate limit exceeded',
    };
  }

  resetIfExpired(existing, SECOND, now);
  existing.lastTimestamp = now;
  existing.countInWindow += 1;
  userRateMap.set(userId, existing);

  return { ok: true };
};

const extractFirstIp = (ipHeader?: string | null): string | null => {
  if (!ipHeader) return null;
  return ipHeader.split(',')[0]?.trim() ?? null;
};

export const enforceIpRateLimit = (
  ipHeader?: string | null,
  now = Date.now(),
): RateLimitCheck => {
  // Bypass IP rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { ok: true };
  }

  const ip = extractFirstIp(ipHeader);
  if (!ip) return { ok: true };

  const existing = ipRateMap.get(ip);
  if (!existing) {
    ipRateMap.set(ip, {
      lastTimestamp: now,
      countInWindow: 1,
      windowStart: now,
    });
    return { ok: true };
  }

  resetIfExpired(existing, MINUTE, now);

  if (existing.countInWindow >= PLAN_LIMITS.requestsPerMinutePerIp) {
    return {
      ok: false,
      retryAfter: Math.ceil((MINUTE - (now - existing.windowStart)) / 1000),
      reason: 'Too many requests from this IP',
    };
  }

  existing.countInWindow += 1;
  existing.lastTimestamp = now;
  ipRateMap.set(ip, existing);

  return { ok: true };
};

/**
 * Global daily call ceiling — a process-wide hard cap on a paid surface,
 * independent of caller identity. Use as a catastrophic-spend backstop on top
 * of the per-IP / per-user limits (e.g. the iPrep /api/score route, whose only
 * other gate is a spoofable client header).
 *
 * Limit defaults to PLAN_LIMITS.globalDailyCallCeiling but can be overridden
 * per call site. Returns { ok:false } with a Retry-After (seconds until the
 * 24h window rolls) once the ceiling is reached.
 */
export const enforceGlobalDailyCeiling = (
  limit: number = PLAN_LIMITS.globalDailyCallCeiling,
  now = Date.now(),
): RateLimitCheck => {
  // Bypass in development so local work isn't blocked.
  if (process.env.NODE_ENV === 'development') {
    return { ok: true };
  }

  if (now - globalDailyCounter.windowStart >= DAY) {
    globalDailyCounter.windowStart = now;
    globalDailyCounter.count = 0;
  }

  if (globalDailyCounter.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.ceil(
        (DAY - (now - globalDailyCounter.windowStart)) / 1000,
      ),
      reason: 'Daily capacity reached. Please try again later.',
    };
  }

  globalDailyCounter.count += 1;
  return { ok: true };
};

// Test-only: reset all in-memory limiter state so suites don't bleed counters
// into each other. Not used in production code paths.
export const __resetRateLimitStateForTests = () => {
  userRateMap.clear();
  ipRateMap.clear();
  globalDailyCounter.count = 0;
  globalDailyCounter.windowStart = Date.now();
};
