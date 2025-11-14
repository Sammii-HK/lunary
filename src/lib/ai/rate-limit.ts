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
