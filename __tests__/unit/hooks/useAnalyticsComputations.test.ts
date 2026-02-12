/**
 * Tests for useAnalyticsComputations metric fixes
 *
 * Verifies:
 * 1. Engaged DAU/WAU/MAU uses distinct user counts (engaged_users_*), not event counts
 * 2. Returning product users are capped at total product users
 * 3. Integrity warning fires when returning > total product users
 */

import { renderHook } from '@testing-library/react';
import { useAnalyticsComputations } from '@/hooks/useAnalyticsComputations';
import type { AnalyticsDataState } from '@/hooks/useAnalyticsData';

/** Minimal mock that satisfies AnalyticsDataState — most fields null/empty */
function buildMockState(
  overrides: Partial<AnalyticsDataState> = {},
): AnalyticsDataState {
  return {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    granularity: 'day',
    includeAudit: false,
    activity: null,
    conversions: null,
    notifications: null,
    featureUsage: null,
    engagementOverview: null,
    featureAdoption: null,
    grimoireHealth: null,
    conversionInfluence: null,
    ctaConversions: null,
    ctaLocations: null,
    subscription30d: null,
    attribution: null,
    successMetrics: null,
    discordAnalytics: null,
    searchConsoleData: null,
    userGrowth: null,
    activation: null,
    subscriptionLifecycle: null,
    planBreakdown: null,
    apiCosts: null,
    cohorts: null,
    userSegments: null,
    grimoireTopPages: [],
    intentionBreakdown: null,
    insights: [],
    metricSnapshots: { weekly: [], monthly: [] },
    loading: false,
    error: null,
    showExportMenu: false,
    showProductSeries: false,
    insightTypeFilter: 'all',
    insightCategoryFilter: 'all',
    ...overrides,
  };
}

/** Build a minimal ActivityResponse with specific fields */
function buildActivity(fields: Record<string, any> = {}) {
  return {
    dau: 0,
    wau: 0,
    mau: 0,
    engaged_users_dau: 0,
    engaged_users_wau: 0,
    engaged_users_mau: 0,
    engaged_rate_dau: null,
    engaged_rate_wau: null,
    engaged_rate_mau: null,
    stickiness_dau_mau: 0,
    stickiness_wau_mau: 0,
    stickiness_dau_wau: 0,
    app_opened_dau: 0,
    app_opened_wau: 0,
    app_opened_mau: 0,
    app_opened_stickiness_dau_mau: 0,
    app_opened_stickiness_wau_mau: 0,
    sitewide_dau: 0,
    sitewide_wau: 0,
    sitewide_mau: 0,
    returning_dau: 0,
    returning_wau: 0,
    returning_mau: 0,
    retention: { day_1: null, day_7: null, day_30: null },
    churn_rate: null,
    trends: [],
    app_opened_trends: [],
    sitewide_trends: [],
    product_dau: 0,
    product_wau: 0,
    product_mau: 0,
    product_stickiness_dau_mau: 0,
    product_stickiness_wau_mau: 0,
    product_trends: [],
    signed_in_product_dau: 0,
    signed_in_product_wau: 0,
    signed_in_product_mau: 0,
    signed_in_product_stickiness_dau_mau: 0,
    signed_in_product_stickiness_wau_mau: 0,
    signed_in_product_trends: [],
    signed_in_product_users: 0,
    signed_in_product_returning_users: 0,
    signed_in_product_avg_sessions_per_user: 0,
    content_mau_grimoire: 0,
    grimoire_only_mau: 0,
    total_accounts: 0,
    ...fields,
  };
}

describe('useAnalyticsComputations', () => {
  describe('Engaged metrics use distinct user counts (C2 fix)', () => {
    it('uses engaged_users_dau/wau/mau, not dau/wau/mau (event counts)', () => {
      const state = buildMockState({
        activity: buildActivity({
          // dau/wau/mau = total events (high numbers)
          dau: 500,
          wau: 2000,
          mau: 8000,
          // engaged_users = distinct users (lower numbers)
          engaged_users_dau: 50,
          engaged_users_wau: 120,
          engaged_users_mau: 300,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.engagedDau).toBe(50);
      expect(result.current.engagedWau).toBe(120);
      expect(result.current.engagedMau).toBe(300);
    });

    it('falls back to 0 when activity is null', () => {
      const state = buildMockState({ activity: null });
      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.engagedDau).toBe(0);
      expect(result.current.engagedWau).toBe(0);
      expect(result.current.engagedMau).toBe(0);
    });

    it('calculates engagement rate from distinct users, not events', () => {
      const state = buildMockState({
        activity: buildActivity({
          dau: 1000, // events — should NOT be used
          mau: 5000, // events — should NOT be used
          engaged_users_dau: 40,
          engaged_users_mau: 200,
          app_opened_dau: 100,
          app_opened_mau: 500,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      // engagementRate = engagedMau / appMau * 100 = 200/500 * 100 = 40
      expect(result.current.engagementRate).toBe(40);
    });
  });

  describe('Returning product users capped at total (C1 fix)', () => {
    it('does not warn when returning <= total', () => {
      const state = buildMockState({
        activity: buildActivity({
          signed_in_product_returning_users: 100,
          signed_in_product_users: 168,
          signed_in_product_mau: 168,
          app_opened_mau: 200,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.integrityWarnings).not.toContainEqual(
        expect.stringContaining('Returning product users'),
      );
    });

    it('fires integrity warning when returning > total product users', () => {
      const state = buildMockState({
        activity: buildActivity({
          // Bug scenario: returning (233) > total (168)
          signed_in_product_returning_users: 233,
          signed_in_product_users: 168,
          signed_in_product_mau: 168,
          app_opened_mau: 200,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.integrityWarnings).toContainEqual(
        expect.stringContaining(
          'Returning product users (233) exceeds total product users (168)',
        ),
      );
    });

    it('does not warn when total product users is 0', () => {
      const state = buildMockState({
        activity: buildActivity({
          signed_in_product_returning_users: 5,
          signed_in_product_users: 0,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.integrityWarnings).not.toContainEqual(
        expect.stringContaining('Returning product users'),
      );
    });
  });

  describe('Other integrity warnings', () => {
    it('warns when product MAU exceeds app MAU', () => {
      const state = buildMockState({
        activity: buildActivity({
          signed_in_product_mau: 300,
          app_opened_mau: 200,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.productMaError).toBe(true);
      expect(result.current.integrityWarnings).toContainEqual(
        expect.stringContaining('Signed-in Product MAU exceeds App MAU'),
      );
    });

    it('warns when app MAU < WAU', () => {
      const state = buildMockState({
        activity: buildActivity({
          app_opened_dau: 10,
          app_opened_wau: 100,
          app_opened_mau: 50,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.integrityWarnings).toContainEqual(
        expect.stringContaining('App MAU is below WAU'),
      );
    });

    it('returns no warnings for healthy data', () => {
      const state = buildMockState({
        activity: buildActivity({
          app_opened_dau: 10,
          app_opened_wau: 50,
          app_opened_mau: 200,
          signed_in_product_mau: 100,
          signed_in_product_users: 100,
          signed_in_product_returning_users: 40,
        }),
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      expect(result.current.integrityWarnings).toHaveLength(0);
      expect(result.current.productMaError).toBe(false);
    });
  });

  describe('Activation labels', () => {
    it('displays "Activated within 7 days" in primary cards', () => {
      const state = buildMockState({
        activation: { activationRate: 45.2 },
      });

      const { result } = renderHook(() => useAnalyticsComputations(state));

      const activationCard = result.current.primaryCards.find(
        (c) => c.title === 'Activation Rate',
      );
      expect(activationCard).toBeDefined();
      expect(activationCard!.subtitle).toBe('Activated within 7 days');
    });
  });
});
