'use client';

import useSWR from 'swr';
import type {
  ActivityResponse,
  ConversionResponse,
  NotificationResponse,
  FeatureUsageResponse,
  EngagementOverviewResponse,
  FeatureAdoptionResponse,
  GrimoireHealthResponse,
  ConversionInfluenceResponse,
  CtaConversionResponse,
  CtaLocationsResponse,
  Subscription30dResponse,
  AttributionResponse,
  GrimoireTopPage,
  IntentionBreakdown,
  InsightData,
  MetricSnapshot,
} from './useAnalyticsData';

// Generic fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

// Different refresh intervals for different metric types
const REFRESH_INTERVALS = {
  REALTIME: 5 * 60 * 1000, // 5 minutes for DAU/WAU/MAU
  STANDARD: 30 * 60 * 1000, // 30 minutes for most metrics
  HISTORICAL: 4 * 60 * 60 * 1000, // 4 hours for historical data
  STATIC: 24 * 60 * 60 * 1000, // 24 hours for static data
  DISABLED: 0, // No auto-refresh - only fetch once
} as const;

// SWR configuration presets to respect HTTP cache
const SWR_CONFIGS = {
  REALTIME: {
    refreshInterval: REFRESH_INTERVALS.REALTIME,
    revalidateOnFocus: false, // Don't refetch on window focus
    revalidateOnReconnect: false, // Don't refetch on reconnect
    dedupingInterval: REFRESH_INTERVALS.REALTIME, // Dedupe within 5min
  },
  STANDARD: {
    refreshInterval: REFRESH_INTERVALS.STANDARD,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: REFRESH_INTERVALS.STANDARD, // Dedupe within 30min
  },
  DISABLED: {
    refreshInterval: REFRESH_INTERVALS.DISABLED,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false, // Don't even refetch on mount - use cache
    dedupingInterval: 24 * 60 * 60 * 1000, // Dedupe for 24 hours
  },
} as const;

export interface UseAnalyticsDataSWROptions {
  startDate: string;
  endDate: string;
  granularity: 'day' | 'week' | 'month';
  includeAudit: boolean;
}

export function useAnalyticsDataSWR(options: UseAnalyticsDataSWROptions) {
  const { startDate, endDate, granularity, includeAudit } = options;

  const queryParams = `start_date=${startDate}&end_date=${endDate}`;
  const debugParam = includeAudit ? '&debug=1' : '';

  // Core metrics - refresh every 5 minutes
  const { data: activity, error: activityError } = useSWR<ActivityResponse>(
    `/api/admin/analytics/dau-wau-mau?${queryParams}&granularity=${granularity}`,
    fetcher,
    SWR_CONFIGS.REALTIME,
  );

  const { data: engagementOverview, error: engagementError } =
    useSWR<EngagementOverviewResponse>(
      `/api/admin/analytics/engagement-overview?${queryParams}${debugParam}`,
      fetcher,
      SWR_CONFIGS.REALTIME,
    );

  const { data: userGrowth, error: userGrowthError } = useSWR(
    `/api/admin/analytics/user-growth?${queryParams}&granularity=${granularity}`,
    fetcher,
    SWR_CONFIGS.REALTIME,
  );

  // Standard metrics - refresh every 30 minutes
  const { data: conversions, error: conversionsError } =
    useSWR<ConversionResponse>(
      `/api/admin/analytics/conversions?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: activation, error: activationError } = useSWR(
    `/api/admin/analytics/activation?${queryParams}`,
    fetcher,
    SWR_CONFIGS.STANDARD,
  );

  const { data: featureAdoption, error: featureAdoptionError } =
    useSWR<FeatureAdoptionResponse>(
      `/api/admin/analytics/feature-adoption?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: featureUsage, error: featureUsageError } =
    useSWR<FeatureUsageResponse>(
      `/api/admin/analytics/feature-usage?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: grimoireHealth, error: grimoireHealthError } =
    useSWR<GrimoireHealthResponse>(
      `/api/admin/analytics/grimoire-health?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: conversionInfluence, error: conversionInfluenceError } =
    useSWR<ConversionInfluenceResponse>(
      `/api/admin/analytics/conversion-influence?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: successMetrics, error: successMetricsError } = useSWR(
    `/api/admin/analytics/success-metrics?${queryParams}`,
    fetcher,
    SWR_CONFIGS.STANDARD,
  );

  const { data: intentionBreakdownData, error: intentionBreakdownError } =
    useSWR(
      `/api/admin/analytics/intention-breakdown?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  // Subscription & monetization
  const { data: subscription30d, error: subscription30dError } =
    useSWR<Subscription30dResponse>(
      `/api/admin/analytics/subscription-30d?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: subscriptionLifecycle, error: subscriptionLifecycleError } =
    useSWR(
      `/api/admin/analytics/subscription-lifecycle?${queryParams}&stripe=1`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: planBreakdown, error: planBreakdownError } = useSWR(
    `/api/admin/analytics/plan-breakdown?${queryParams}`,
    fetcher,
    SWR_CONFIGS.STANDARD,
  );

  const { data: ctaConversions, error: ctaConversionsError } =
    useSWR<CtaConversionResponse>(
      `/api/admin/analytics/cta-conversions?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: ctaLocations, error: ctaLocationsError } =
    useSWR<CtaLocationsResponse>(
      `/api/admin/analytics/cta-locations?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: apiCosts, error: apiCostsError } = useSWR(
    `/api/admin/analytics/api-costs?${queryParams}`,
    fetcher,
    SWR_CONFIGS.DISABLED, // Historical data
  );

  const { data: userSegments, error: userSegmentsError } = useSWR(
    `/api/admin/analytics/user-segments?${queryParams}`,
    fetcher,
    SWR_CONFIGS.DISABLED, // Changes slowly
  );

  // External & misc
  const { data: notifications, error: notificationsError } =
    useSWR<NotificationResponse>(
      `/api/admin/analytics/notifications?${queryParams}`,
      fetcher,
      SWR_CONFIGS.DISABLED, // Historical data
    );

  const { data: attribution, error: attributionError } =
    useSWR<AttributionResponse>(
      `/api/admin/analytics/attribution?${queryParams}`,
      fetcher,
      SWR_CONFIGS.DISABLED, // Changes slowly
    );

  const { data: discordAnalytics, error: discordError } = useSWR(
    `/api/analytics/discord-interactions?range=7d`,
    fetcher,
    SWR_CONFIGS.DISABLED, // Not time-critical
  );

  const { data: searchConsoleResponse, error: searchConsoleError } = useSWR(
    `/api/admin/analytics/search-console?${queryParams}`,
    fetcher,
    SWR_CONFIGS.DISABLED, // Slow external API
  );

  const { data: insightsResponse, error: insightsError } = useSWR(
    `/api/admin/analytics/insights?${queryParams}`,
    fetcher,
    SWR_CONFIGS.REALTIME, // Keep insights fresh
  );

  const { data: grimoireTopPagesResponse, error: grimoireTopPagesError } =
    useSWR(`/api/grimoire/stats?top=20`, fetcher, SWR_CONFIGS.DISABLED);

  // Historical data - no auto-refresh needed
  const { data: cohorts, error: cohortsError } = useSWR(
    `/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`,
    fetcher,
    SWR_CONFIGS.DISABLED, // Historical, doesn't change
  );

  // Static data - no auto-refresh needed
  const { data: metricSnapshotsWeekly, error: snapshotsWeeklyError } = useSWR(
    `/api/admin/analytics/metric-snapshots?type=weekly&limit=12`,
    fetcher,
    SWR_CONFIGS.DISABLED, // Weekly snapshots don't change
  );

  const { data: metricSnapshotsMonthly, error: snapshotsMonthlyError } = useSWR(
    `/api/admin/analytics/metric-snapshots?type=monthly&limit=12`,
    fetcher,
    SWR_CONFIGS.DISABLED, // Monthly snapshots don't change
  );

  // Combine errors
  const errors = [
    activityError && 'DAU/WAU/MAU',
    engagementError && 'Engagement overview',
    featureAdoptionError && 'Feature adoption',
    grimoireHealthError && 'Grimoire health',
    conversionInfluenceError && 'Conversion influence',
    conversionsError && 'Conversions',
    ctaConversionsError && 'CTA conversions',
    ctaLocationsError && 'CTA locations',
    subscription30dError && 'Subscription 30d',
    notificationsError && 'Notifications',
    featureUsageError && 'Feature usage',
    attributionError && 'Attribution',
  ].filter(Boolean);

  // Check if any data is loading
  const loading =
    !activity ||
    !engagementOverview ||
    !conversions ||
    !userGrowth ||
    !activation;

  // Parse intention breakdown
  const intentionBreakdown: IntentionBreakdown | null = intentionBreakdownData
    ? Array.isArray(intentionBreakdownData?.data)
      ? (intentionBreakdownData.data as IntentionBreakdown)
      : Array.isArray(intentionBreakdownData)
        ? (intentionBreakdownData as IntentionBreakdown)
        : null
    : null;

  return {
    // Data
    activity: activity || null,
    conversions: conversions || null,
    notifications: notifications || null,
    featureUsage: featureUsage || null,
    engagementOverview: engagementOverview || null,
    featureAdoption: featureAdoption || null,
    grimoireHealth: grimoireHealth || null,
    conversionInfluence: conversionInfluence || null,
    ctaConversions: ctaConversions || null,
    ctaLocations: ctaLocations || null,
    subscription30d: subscription30d || null,
    attribution: attribution || null,
    successMetrics: successMetrics || null,
    discordAnalytics: discordAnalytics || null,
    searchConsoleData: searchConsoleResponse?.success
      ? searchConsoleResponse.data
      : null,
    userGrowth: userGrowth || null,
    activation: activation || null,
    subscriptionLifecycle: subscriptionLifecycle || null,
    planBreakdown: planBreakdown || null,
    apiCosts: apiCosts || null,
    cohorts: cohorts || null,
    userSegments: userSegments || null,
    grimoireTopPages:
      (grimoireTopPagesResponse?.pages as GrimoireTopPage[]) || [],
    intentionBreakdown,
    insights: (insightsResponse?.insights as InsightData[]) || [],
    metricSnapshots: {
      weekly: (metricSnapshotsWeekly?.snapshots as MetricSnapshot[]) || [],
      monthly: (metricSnapshotsMonthly?.snapshots as MetricSnapshot[]) || [],
    },

    // State
    loading,
    error:
      errors.length > 0
        ? `Some metrics unavailable: ${errors.join(', ')}`
        : null,
  };
}
