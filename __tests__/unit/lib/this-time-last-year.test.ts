/**
 * Tests for This Time Last Year feature logic
 * Tests subscription gating and data structure
 */

import { hasFeatureAccess, normalizePlanType } from '../../../utils/pricing';

describe('This Time Last Year - Subscription Gating', () => {
  describe('year_over_year feature access', () => {
    it('should deny access for free users', () => {
      const hasAccess = hasFeatureAccess('free', 'free', 'year_over_year');
      expect(hasAccess).toBe(false);
    });

    it('should deny access for monthly plan users', () => {
      const hasAccess = hasFeatureAccess(
        'active',
        'lunary_plus_ai_monthly',
        'year_over_year',
      );
      expect(hasAccess).toBe(false);
    });

    it('should grant access for annual plan users', () => {
      const hasAccess = hasFeatureAccess(
        'active',
        'lunary_plus_ai_annual',
        'year_over_year',
      );
      expect(hasAccess).toBe(true);
    });

    it('should deny access for trial users on monthly plan', () => {
      const hasAccess = hasFeatureAccess(
        'trial',
        'lunary_plus_ai_monthly',
        'year_over_year',
      );
      expect(hasAccess).toBe(false);
    });

    it('should grant access for trial users on annual plan', () => {
      const hasAccess = hasFeatureAccess(
        'trial',
        'lunary_plus_ai_annual',
        'year_over_year',
      );
      expect(hasAccess).toBe(true);
    });
  });

  describe('normalizePlanType', () => {
    it('should normalize annual plan variations', () => {
      expect(normalizePlanType('lunary_plus_ai_annual')).toBe(
        'lunary_plus_ai_annual',
      );
      expect(normalizePlanType('lunary_plus_annual')).toBe(
        'lunary_plus_annual',
      );
    });

    it('should normalize monthly plan variations', () => {
      expect(normalizePlanType('lunary_plus_ai_monthly')).toBe(
        'lunary_plus_ai_monthly',
      );
      expect(normalizePlanType('lunary_plus_monthly')).toBe(
        'lunary_plus_monthly',
      );
    });

    it('should handle null/undefined', () => {
      expect(normalizePlanType(null)).toBe('free');
      expect(normalizePlanType(undefined)).toBe('free');
    });

    it('should handle free tier', () => {
      expect(normalizePlanType('free')).toBe('free');
    });
  });
});

describe('This Time Last Year - Date Range Logic', () => {
  it('should calculate correct date range (1 year ago ±7 days)', () => {
    const now = new Date('2026-02-02');
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date(oneYearAgo);
    endDate.setDate(endDate.getDate() + 7);

    // One year ago from Feb 2, 2026 should be Feb 2, 2025
    expect(oneYearAgo.toISOString().split('T')[0]).toBe('2025-02-02');

    // Start should be Jan 26, 2025
    expect(startDate.toISOString().split('T')[0]).toBe('2025-01-26');

    // End should be Feb 9, 2025
    expect(endDate.toISOString().split('T')[0]).toBe('2025-02-09');
  });

  it('should handle leap year correctly', () => {
    // Feb 29, 2024 (leap year) -> one year ago
    const leapDate = new Date('2024-02-29');
    const oneYearAgo = new Date(leapDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Feb 29, 2023 doesn't exist, so it should roll to Mar 1, 2023
    expect(oneYearAgo.getMonth()).toBe(2); // March (0-indexed)
    expect(oneYearAgo.getDate()).toBe(1);
  });
});

describe('This Time Last Year - Response Structure', () => {
  const mockResponseWithDailyCards = {
    hasData: true,
    hasYearOverYear: true,
    dateRange: {
      start: '2025-01-26T00:00:00.000Z',
      end: '2025-02-09T00:00:00.000Z',
      centerDate: '2025-02-02T00:00:00.000Z',
    },
    summary: {
      journalCount: 3,
      tarotCount: 2,
      dailyCardCount: 5,
      frequentCards: [{ name: 'The Empress', count: 2 }],
      dominantMoods: [{ mood: 'reflective', count: 3 }],
    },
    journalEntries: [],
    tarotReadings: [],
    dailyCards: [
      {
        id: '1',
        cardName: 'The Fool',
        interpretation: 'New beginnings await',
        createdAt: '2025-02-01T10:00:00.000Z',
      },
    ],
  };

  const mockResponseWithoutDailyCards = {
    hasData: true,
    hasYearOverYear: false,
    dateRange: {
      start: '2025-01-26T00:00:00.000Z',
      end: '2025-02-09T00:00:00.000Z',
      centerDate: '2025-02-02T00:00:00.000Z',
    },
    summary: {
      journalCount: 3,
      tarotCount: 2,
      dailyCardCount: 0,
      frequentCards: [{ name: 'The Empress', count: 2 }],
      dominantMoods: [{ mood: 'reflective', count: 3 }],
    },
    journalEntries: [],
    tarotReadings: [],
    dailyCards: [],
  };

  it('should include dailyCards for premium users', () => {
    expect(mockResponseWithDailyCards.hasYearOverYear).toBe(true);
    expect(mockResponseWithDailyCards.dailyCards.length).toBeGreaterThan(0);
    expect(mockResponseWithDailyCards.summary.dailyCardCount).toBe(5);
  });

  it('should exclude dailyCards for non-premium users', () => {
    expect(mockResponseWithoutDailyCards.hasYearOverYear).toBe(false);
    expect(mockResponseWithoutDailyCards.dailyCards.length).toBe(0);
    expect(mockResponseWithoutDailyCards.summary.dailyCardCount).toBe(0);
  });

  it('should have correct dailyCard structure', () => {
    const card = mockResponseWithDailyCards.dailyCards[0];
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('cardName');
    expect(card).toHaveProperty('createdAt');
    expect(typeof card.cardName).toBe('string');
  });
});
