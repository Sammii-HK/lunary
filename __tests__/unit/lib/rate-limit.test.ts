/**
 * @jest-environment node
 */

import { checkRateLimit } from '@/lib/api/rate-limit';

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const result = checkRateLimit('test-under-limit', 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it('allows exactly maxRequests calls', () => {
    const key = 'test-exact-limit';
    for (let i = 0; i < 4; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(true);
  });

  it('rejects the request exceeding maxRequests', () => {
    const key = 'test-exceed-limit';
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const result = checkRateLimit(key, 5, 60_000); // 6th call
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks different keys independently', () => {
    const keyA = 'test-independent-a';
    const keyB = 'test-independent-b';

    // Exhaust key A
    for (let i = 0; i < 2; i++) {
      checkRateLimit(keyA, 2, 60_000);
    }
    expect(checkRateLimit(keyA, 2, 60_000).allowed).toBe(false);

    // Key B should still be available
    expect(checkRateLimit(keyB, 2, 60_000).allowed).toBe(true);
  });

  it('resets after the window expires', async () => {
    const key = 'test-window-reset';
    // Use a very short window
    checkRateLimit(key, 1, 50);
    expect(checkRateLimit(key, 1, 50).allowed).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 80));

    // Window should have expired, new request allowed
    const result = checkRateLimit(key, 1, 50);
    expect(result.allowed).toBe(true);
  });

  it('returns retryAfterMs less than or equal to windowMs', () => {
    const key = 'test-retry-after';
    checkRateLimit(key, 1, 10_000);
    const result = checkRateLimit(key, 1, 10_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeLessThanOrEqual(10_000);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });
});
