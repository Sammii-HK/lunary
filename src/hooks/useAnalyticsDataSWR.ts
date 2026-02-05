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
    { refreshInterval: REFRESH_INTERVALS.REALTIME },
  );

  const { data: engagementOverview, error: engagementError } =
    useSWR<EngagementOverviewResponse>(
      `/api/admin/analytics/engagement-overview?${queryParams}${debugParam}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.REALTIME },
    );

  const { data: userGrowth, error: userGrowthError } = useSWR(
    `/api/admin/analytics/user-growth?${queryParams}&granularity=${granularity}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.REALTIME },
  );

  // Standard metrics - refresh every 30 minutes
  const { data: conversions, error: conversionsError } =
    useSWR<ConversionResponse>(
      `/api/admin/analytics/conversions?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: activation, error: activationError } = useSWR(
    `/api/admin/analytics/activation?${queryParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  const { data: featureAdoption, error: featureAdoptionError } =
    useSWR<FeatureAdoptionResponse>(
      `/api/admin/analytics/feature-adoption?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: featureUsage, error: featureUsageError } =
    useSWR<FeatureUsageResponse>(
      `/api/admin/analytics/feature-usage?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: grimoireHealth, error: grimoireHealthError } =
    useSWR<GrimoireHealthResponse>(
      `/api/admin/analytics/grimoire-health?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: conversionInfluence, error: conversionInfluenceError } =
    useSWR<ConversionInfluenceResponse>(
      `/api/admin/analytics/conversion-influence?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: successMetrics, error: successMetricsError } = useSWR(
    `/api/admin/analytics/success-metrics?${queryParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  const { data: intentionBreakdownData, error: intentionBreakdownError } =
    useSWR(`/api/admin/analytics/intention-breakdown?${queryParams}`, fetcher, {
      refreshInterval: REFRESH_INTERVALS.STANDARD,
    });

  // Subscription & monetization
  const { data: subscription30d, error: subscription30dError } =
    useSWR<Subscription30dResponse>(
      `/api/admin/analytics/subscription-30d?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: subscriptionLifecycle, error: subscriptionLifecycleError } =
    useSWR(
      `/api/admin/analytics/subscription-lifecycle?${queryParams}&stripe=1`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: planBreakdown, error: planBreakdownError } = useSWR(
    `/api/admin/analytics/plan-breakdown?${queryParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  const { data: ctaConversions, error: ctaConversionsError } =
    useSWR<CtaConversionResponse>(
      `/api/admin/analytics/cta-conversions?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: ctaLocations, error: ctaLocationsError } =
    useSWR<CtaLocationsResponse>(
      `/api/admin/analytics/cta-locations?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: apiCosts, error: apiCostsError } = useSWR(
    `/api/admin/analytics/api-costs?${queryParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  const { data: userSegments, error: userSegmentsError } = useSWR(
    `/api/admin/analytics/user-segments?${queryParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  // External & misc
  const { data: notifications, error: notificationsError } =
    useSWR<NotificationResponse>(
      `/api/admin/analytics/notifications?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: attribution, error: attributionError } =
    useSWR<AttributionResponse>(
      `/api/admin/analytics/attribution?${queryParams}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVALS.STANDARD },
    );

  const { data: discordAnalytics, error: discordError } = useSWR(
    `/api/analytics/discord-interactions?range=7d`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  const { data: searchConsoleResponse, error: searchConsoleError } = useSWR(
    `/api/admin/analytics/search-console?${queryParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  const { data: insightsResponse, error: insightsError } = useSWR(
    `/api/admin/analytics/insights?${queryParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STANDARD },
  );

  const { data: grimoireTopPagesResponse, error: grimoireTopPagesError } =
    useSWR(`/api/grimoire/stats?top=20`, fetcher, {
      refreshInterval: REFRESH_INTERVALS.STANDARD,
    });

  // Historical data - refresh every 4 hours
  const { data: cohorts, error: cohortsError } = useSWR(
    `/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.HISTORICAL },
  );

  // Static data - refresh once per day
  const { data: metricSnapshotsWeekly, error: snapshotsWeeklyError } = useSWR(
    `/api/admin/analytics/metric-snapshots?type=weekly&limit=12`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STATIC },
  );

  const { data: metricSnapshotsMonthly, error: snapshotsMonthlyError } = useSWR(
    `/api/admin/analytics/metric-snapshots?type=monthly&limit=12`,
    fetcher,
    { refreshInterval: REFRESH_INTERVALS.STATIC },
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
