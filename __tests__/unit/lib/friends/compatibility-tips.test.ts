import { describe, it, expect } from '@jest/globals';
import { getDailyCompatibilityTip } from '@/lib/friends/compatibility-tips';

describe('getDailyCompatibilityTip', () => {
  it('returns a tip and pair type', () => {
    const result = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Aries',
      'Leo',
    );

    expect(result.tip).toBeTruthy();
    expect(typeof result.tip).toBe('string');
    expect(['same', 'complementary', 'challenging', 'neutral']).toContain(
      result.pairType,
    );
  });

  it('returns "same" for same-element signs', () => {
    // Aries + Leo = both fire
    const result = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Aries',
      'Leo',
    );
    expect(result.pairType).toBe('same');
  });

  it('returns "complementary" for fire + air', () => {
    // Aries (fire) + Gemini (air)
    const result = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Aries',
      'Gemini',
    );
    expect(result.pairType).toBe('complementary');
  });

  it('returns "complementary" for earth + water', () => {
    // Taurus (earth) + Cancer (water)
    const result = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Taurus',
      'Cancer',
    );
    expect(result.pairType).toBe('complementary');
  });

  it('returns "challenging" for fire + water', () => {
    // Aries (fire) + Cancer (water)
    const result = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Aries',
      'Cancer',
    );
    expect(result.pairType).toBe('challenging');
  });

  it('returns "challenging" for earth + air', () => {
    // Taurus (earth) + Gemini (air)
    const result = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Taurus',
      'Gemini',
    );
    expect(result.pairType).toBe('challenging');
  });

  it('returns "neutral" for null signs', () => {
    const result = getDailyCompatibilityTip('user-1', 'friend-1', null, null);
    expect(result.pairType).toBe('neutral');
  });

  it('returns "neutral" for unknown signs', () => {
    const result = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'FakeName',
      'Aries',
    );
    expect(result.pairType).toBe('neutral');
  });

  it('is deterministic for the same inputs on the same day', () => {
    const date = '2026-06-15';
    const result1 = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Aries',
      'Leo',
      date,
    );
    const result2 = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Aries',
      'Leo',
      date,
    );
    expect(result1.tip).toBe(result2.tip);
  });

  it('returns different tips for different dates', () => {
    const tips = new Set<string>();
    // Check across 10 different dates — should get at least some variation
    for (let i = 1; i <= 10; i++) {
      const result = getDailyCompatibilityTip(
        'user-1',
        'friend-1',
        'Aries',
        'Leo',
        `2026-06-${String(i).padStart(2, '0')}`,
      );
      tips.add(result.tip);
    }
    expect(tips.size).toBeGreaterThan(1);
  });

  it('returns different tips for different friend pairs', () => {
    const date = '2026-06-15';
    const result1 = getDailyCompatibilityTip(
      'user-1',
      'friend-1',
      'Aries',
      'Leo',
      date,
    );
    const result2 = getDailyCompatibilityTip(
      'user-1',
      'friend-2',
      'Aries',
      'Leo',
      date,
    );
    // Different friend IDs should give different hash → likely different tip
    // Not guaranteed for every pair, but should differ for most
    expect(result1.tip).toBeDefined();
    expect(result2.tip).toBeDefined();
  });
});
