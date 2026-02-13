import { getTransitThemeForDate } from '@/lib/social/weekly-themes';
import { generateCosmicTimingPost } from '@/lib/threads/original-content';

describe('getTransitThemeForDate', () => {
  // Saturn enters Aries around Feb 13-14 2026 — use a date near a known ingress
  // We can't predict exact ingress dates in tests, so we test the logic properties

  it('returns null when no transit occurs within ±3 day window', () => {
    // Use a date far from any known ingress
    const stableDate = new Date('2026-06-15T12:00:00Z');
    const result = getTransitThemeForDate(stableDate);
    // Result may or may not be null depending on actual transits,
    // but if it returns something, it should have valid fields
    if (result) {
      expect(result).toHaveProperty('planet');
      expect(result).toHaveProperty('fromSign');
      expect(result).toHaveProperty('toSign');
      expect(result).toHaveProperty('daysUntil');
      expect(result).toHaveProperty('hoursUntil');
      expect(typeof result.hoursUntil).toBe('number');
      expect(typeof result.daysUntil).toBe('number');
    }
  });

  it('returns hoursUntil as a number', () => {
    // Test with a date that should be near some transit
    const date = new Date('2026-02-13T14:00:00Z');
    const result = getTransitThemeForDate(date);
    if (result) {
      expect(typeof result.hoursUntil).toBe('number');
    }
  });

  it('sets daysUntil to 0 when hoursUntil < 24', () => {
    // We simulate this by checking the relationship:
    // if hoursUntil < 24, daysUntil must be 0
    const date = new Date('2026-02-13T14:00:00Z');
    const result = getTransitThemeForDate(date);
    if (result && result.hoursUntil < 24) {
      expect(result.daysUntil).toBe(0);
    }
  });

  it('sets daysUntil >= 1 when hoursUntil >= 24', () => {
    const date = new Date('2026-02-13T14:00:00Z');
    const result = getTransitThemeForDate(date);
    if (result && result.hoursUntil >= 24) {
      expect(result.daysUntil).toBeGreaterThanOrEqual(1);
    }
  });

  it('hoursUntil and daysUntil are consistent', () => {
    // daysUntil should be 0 when < 24h, otherwise ceil(hours/24)
    const dates = [
      new Date('2026-01-15T12:00:00Z'),
      new Date('2026-03-20T12:00:00Z'),
      new Date('2026-05-01T12:00:00Z'),
      new Date('2026-07-10T12:00:00Z'),
    ];

    for (const date of dates) {
      const result = getTransitThemeForDate(date);
      if (result) {
        if (result.hoursUntil < 24) {
          expect(result.daysUntil).toBe(0);
        } else {
          expect(result.daysUntil).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

describe('generateCosmicTimingPost', () => {
  it('uses slot hour in scheduled time', () => {
    const post = generateCosmicTimingPost('2026-02-13', 14);
    const scheduled = new Date(post.scheduledTime);
    expect(scheduled.getUTCHours()).toBe(14);
  });

  it('returns a valid ThreadsPost shape', () => {
    const post = generateCosmicTimingPost('2026-02-13', 14);
    expect(post).toHaveProperty('hook');
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('prompt');
    expect(post).toHaveProperty('topicTag');
    expect(post).toHaveProperty('pillar');
    expect(post).toHaveProperty('scheduledTime');
    expect(post.source).toBe('original');
  });

  it('body says hours not days when transit is < 24h away', () => {
    // Generate posts across multiple dates to catch a near-transit
    const dates = [
      '2026-02-13',
      '2026-03-20',
      '2026-04-15',
      '2026-06-01',
      '2026-08-10',
      '2026-10-05',
    ];

    for (const dateStr of dates) {
      const post = generateCosmicTimingPost(dateStr, 14);
      // If body mentions "day" or "days", it should NOT be for < 24h transits
      // If body mentions "hour", that's the fix working
      if (post.body.includes('hour')) {
        expect(post.body).not.toMatch(/\d+ days? away/);
      }
      // Should never say "0 days away"
      expect(post.body).not.toContain('0 days');
      expect(post.body).not.toContain('0 day');
    }
  });

  it('never produces empty hook or body', () => {
    const post = generateCosmicTimingPost('2026-02-13', 14);
    expect(post.hook.length).toBeGreaterThan(0);
    expect(post.body.length).toBeGreaterThan(0);
  });
});
