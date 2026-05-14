'use client';

import { useCallback, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type {
  ActivityResponse,
  ConversionResponse,
  NotificationResponse,
  FeatureUsageResponse,
  GrimoireHealthResponse,
  EngagementOverviewResponse,
  CtaConversionResponse,
  CtaLocationsResponse,
  AttributionResponse,
  GrimoireTopPage,
  IntentionBreakdown,
  InsightData,
  MetricSnapshot,
} from './useAnalyticsData';
import {
  extractFeatureAdoption,
  extractUserGrowth,
  extractSubscription30d,
  computeInsights,
  type ConsolidatedSnapshot,
} from '@/lib/analytics/snapshot-extractors';

class AnalyticsFetchError extends Error {
  constructor(
    readonly url: string,
    readonly status: number,
    readonly statusText: string,
    readonly detail?: string,
  ) {
    super(
      detail ? `${status} ${statusText}: ${detail}` : `${status} ${statusText}`,
    );
    this.name = 'AnalyticsFetchError';
  }
}

type EndpointError = {
  label: string;
  error: unknown;
};

const readErrorDetail = async (res: Response): Promise<string | undefined> => {
  const contentType = res.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const body = (await res.json()) as {
        error?: unknown;
        message?: unknown;
        details?: unknown;
      };
      const message = body.error ?? body.message ?? body.details;
      return typeof message === 'string' && message.trim().length > 0
        ? message.trim()
        : undefined;
    }

    const body = await res.text();
    return body.trim().length > 0 ? body.trim().slice(0, 180) : undefined;
  } catch {
    return undefined;
  }
};

const describeEndpointError = ({ label, error }: EndpointError): string => {
  if (error instanceof AnalyticsFetchError) {
    const status = error.statusText
      ? `${error.status} ${error.statusText}`
      : String(error.status);
    return error.detail
      ? `${label} (${status}: ${error.detail})`
      : `${label} (${status})`;
  }

  if (error instanceof Error && error.message) {
    return `${label} (${error.message})`;
  }

  return label;
};

const formatAnalyticsError = (errors: EndpointError[]): string | null => {
  if (errors.length === 0) return null;

  const authError = errors.find(
    ({ error }) =>
      error instanceof AnalyticsFetchError &&
      (error.status === 401 || error.status === 403),
  );

  if (authError?.error instanceof AnalyticsFetchError) {
    return `Admin analytics API is unauthorized (${authError.error.status}). Sign in with an admin account and refresh; failed endpoints are not being counted as zero.`;
  }

  const visibleErrors = errors.slice(0, 6).map(describeEndpointError);
  const remaining = errors.length - visibleErrors.length;
  const suffix = remaining > 0 ? `, +${remaining} more` : '';

  return `Some metrics unavailable; existing data stays visible and failed endpoints are not counted as zero: ${visibleErrors.join(', ')}${suffix}`;
};

// Generic fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new AnalyticsFetchError(
      url,
      res.status,
      res.statusText,
      await readErrorDetail(res),
    );
  }
  return res.json();
};

// Different refresh intervals for different metric types
const REFRESH_INTERVALS = {
  REALTIME: 0, // Manual refresh only; keep Neon CPU low.
  STANDARD: 0, // Manual refresh only; keep analytics tabs from warming compute.
  DISABLED: 0, // No auto-refresh - only fetch once
} as const;

const DEDUPE_INTERVALS = {
  REALTIME: 5 * 60 * 1000,
  STANDARD: 30 * 60 * 1000,
  DISABLED: 24 * 60 * 60 * 1000,
} as const;

// SWR configuration presets
const SWR_CONFIGS = {
  REALTIME: {
    refreshInterval: REFRESH_INTERVALS.REALTIME,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: DEDUPE_INTERVALS.REALTIME,
  },
  STANDARD: {
    refreshInterval: REFRESH_INTERVALS.STANDARD,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: DEDUPE_INTERVALS.STANDARD,
  },
  DISABLED: {
    refreshInterval: REFRESH_INTERVALS.DISABLED,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: DEDUPE_INTERVALS.DISABLED,
  },
} as const;

export interface UseAnalyticsDataSWROptions {
  startDate: string;
  endDate: string;
  granularity: 'day' | 'week' | 'month';
  includeAudit: boolean;
  /** When false, Tier 2 (Operational tab) endpoints won't fetch. */
  operationalTabActive?: boolean;
}

export function useAnalyticsDataSWR(options: UseAnalyticsDataSWROptions) {
  const {
    startDate,
    endDate,
    granularity,
    includeAudit,
    operationalTabActive = false,
  } = options;
  const { mutate: globalMutate } = useSWRConfig();

  const queryParams = `start_date=${startDate}&end_date=${endDate}`;
  const debugParam = includeAudit ? '&debug=1' : '';

  // ── Tier 1: Snapshot tab (12 calls total) ─────────────────────────

  // 1. Consolidated snapshot (replaces feature-adoption, user-growth, subscription-30d, insights)
  const { data: snapshot, error: snapshotError } = useSWR<ConsolidatedSnapshot>(
    `/api/admin/analytics/snapshot?${queryParams}`,
    fetcher,
    SWR_CONFIGS.REALTIME,
  );

  // 2. DAU/WAU/MAU — default to snapshot data. Live Neon scans are available
  // on the endpoint for audit work, but the dashboard should stay cheap.
  const { data: activityLive, error: activityError } = useSWR<ActivityResponse>(
    `/api/admin/analytics/dau-wau-mau?${queryParams}&granularity=${granularity}`,
    fetcher,
    SWR_CONFIGS.REALTIME,
  );

  // 3. Engagement overview — debugParam passes includeAudit to trigger live path when needed
  const { data: engagementOverviewLive, error: engagementOverviewError } =
    useSWR<EngagementOverviewResponse>(
      `/api/admin/analytics/engagement-overview?${queryParams}${debugParam}`,
      fetcher,
      SWR_CONFIGS.REALTIME,
    );

  // 4-12. Live endpoints that can't be pre-computed
  const { data: conversions, error: conversionsError } =
    useSWR<ConversionResponse>(
      `/api/admin/analytics/conversions?${queryParams}`,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  // Activation needs live query for per-feature breakdown by plan tier
  const { data: activationLive, error: activationError } = useSWR(
    `/api/admin/analytics/activation?${queryParams}`,
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

  const { data: successMetrics, error: successMetricsError } = useSWR(
    `/api/admin/analytics/success-metrics?${queryParams}`,
    fetcher,
    SWR_CONFIGS.STANDARD,
  );

  const { data: attribution, error: attributionError } =
    useSWR<AttributionResponse>(
      `/api/admin/analytics/attribution?${queryParams}`,
      fetcher,
      SWR_CONFIGS.DISABLED,
    );

  // 7. Metric snapshots (single call returns both weekly + monthly)
  const { data: metricSnapshotsData } = useSWR(
    `/api/admin/analytics/metric-snapshots?type=both&limit=12`,
    fetcher,
    SWR_CONFIGS.DISABLED,
  );

  // ── Tier 2: Operational tab (load on demand) ─────────────────────

  const { data: cohorts } = useSWR(
    operationalTabActive
      ? `/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`
      : null,
    fetcher,
    SWR_CONFIGS.DISABLED,
  );

  const { data: intentionBreakdownData, error: intentionBreakdownError } =
    useSWR(
      operationalTabActive
        ? `/api/admin/analytics/intention-breakdown?${queryParams}`
        : null,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: ctaConversions, error: ctaConversionsError } =
    useSWR<CtaConversionResponse>(
      operationalTabActive
        ? `/api/admin/analytics/cta-conversions?${queryParams}`
        : null,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: ctaLocations, error: ctaLocationsError } =
    useSWR<CtaLocationsResponse>(
      operationalTabActive
        ? `/api/admin/analytics/cta-locations?${queryParams}`
        : null,
      fetcher,
      SWR_CONFIGS.STANDARD,
    );

  const { data: subscriptionLifecycle } = useSWR(
    operationalTabActive
      ? `/api/admin/analytics/subscription-lifecycle?${queryParams}&stripe=1`
      : null,
    fetcher,
    SWR_CONFIGS.STANDARD,
  );

  const { data: planBreakdown } = useSWR(
    operationalTabActive
      ? `/api/admin/analytics/plan-breakdown?${queryParams}`
      : null,
    fetcher,
    SWR_CONFIGS.STANDARD,
  );

  const { data: apiCosts } = useSWR(
    operationalTabActive
      ? `/api/admin/analytics/api-costs?${queryParams}`
      : null,
    fetcher,
    SWR_CONFIGS.DISABLED,
  );

  const { data: userSegments } = useSWR(
    operationalTabActive
      ? `/api/admin/analytics/user-segments?${queryParams}`
      : null,
    fetcher,
    SWR_CONFIGS.DISABLED,
  );

  const { data: notifications, error: notificationsError } =
    useSWR<NotificationResponse>(
      operationalTabActive
        ? `/api/admin/analytics/notifications?${queryParams}`
        : null,
      fetcher,
      SWR_CONFIGS.DISABLED,
    );

  const { data: platformBreakdown } = useSWR(
    operationalTabActive
      ? `/api/admin/analytics/platform-breakdown?${queryParams}`
      : null,
    fetcher,
    SWR_CONFIGS.STANDARD,
  );

  const { data: discordAnalytics } = useSWR(
    operationalTabActive
      ? `/api/analytics/discord-interactions?range=7d`
      : null,
    fetcher,
    SWR_CONFIGS.DISABLED,
  );

  const { data: searchConsoleResponse } = useSWR(
    operationalTabActive
      ? `/api/admin/analytics/search-console?${queryParams}`
      : null,
    fetcher,
    SWR_CONFIGS.DISABLED,
  );

  const { data: grimoireTopPagesResponse } = useSWR(
    operationalTabActive ? `/api/grimoire/stats?top=20` : null,
    fetcher,
    SWR_CONFIGS.DISABLED,
  );

  // ── Extract data from consolidated snapshot ────────────────────────

  // Activity from live dau-wau-mau endpoint (returning users, app opened, engaged rate)
  const activity = activityLive || null;

  // Engagement overview from live endpoint (returning referrer, retention cohorts)
  const engagementOverview = engagementOverviewLive || null;

  const featureAdoption = useMemo(
    () => (snapshot ? extractFeatureAdoption(snapshot) : null),
    [snapshot],
  );

  // Activation from live endpoint (has per-feature breakdown by plan tier)
  const activation = activationLive || null;

  const userGrowth = useMemo(
    () => (snapshot ? extractUserGrowth(snapshot) : null),
    [snapshot],
  );

  const subscription30d = useMemo(
    () => (snapshot ? extractSubscription30d(snapshot) : null),
    [snapshot],
  );

  const insights: InsightData[] = useMemo(
    () => (snapshot ? computeInsights(snapshot) : []),
    [snapshot],
  );

  // Conversion influence comes from grimoire-health (no separate API call)
  const conversionInfluence = grimoireHealth?.influence ?? null;

  // ── Refresh function ───────────────────────────────────────────────

  const refresh = useCallback(async () => {
    await globalMutate(
      (key) => typeof key === 'string' && key.startsWith('/api/'),
      undefined,
      { revalidate: true },
    );
  }, [globalMutate]);

  // ── Combine errors ─────────────────────────────────────────────────

  const errors: EndpointError[] = [
    {
      label: 'Snapshot (features, growth, subscription)',
      error: snapshotError,
    },
    { label: 'DAU/WAU/MAU activity', error: activityError },
    { label: 'Engagement overview', error: engagementOverviewError },
    { label: 'Activation', error: activationError },
    { label: 'Grimoire health', error: grimoireHealthError },
    { label: 'Conversions', error: conversionsError },
    { label: 'CTA conversions', error: ctaConversionsError },
    { label: 'CTA locations', error: ctaLocationsError },
    { label: 'Notifications', error: notificationsError },
    { label: 'Feature usage', error: featureUsageError },
    { label: 'Attribution', error: attributionError },
    { label: 'Success metrics', error: successMetricsError },
    { label: 'Intention breakdown', error: intentionBreakdownError },
  ].filter((item): item is EndpointError => Boolean(item.error));

  // Only block on snapshot (the critical path)
  const loading = !snapshot;

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
    activity,
    conversions: conversions || null,
    notifications: notifications || null,
    featureUsage: featureUsage || null,
    engagementOverview,
    featureAdoption,
    grimoireHealth: grimoireHealth || null,
    conversionInfluence,
    ctaConversions: ctaConversions || null,
    ctaLocations: ctaLocations || null,
    subscription30d,
    attribution: attribution || null,
    successMetrics: successMetrics || null,
    platformBreakdown: platformBreakdown || null,
    discordAnalytics: discordAnalytics || null,
    searchConsoleData: searchConsoleResponse?.success
      ? searchConsoleResponse.data
      : null,
    userGrowth,
    activation,
    subscriptionLifecycle: subscriptionLifecycle || null,
    planBreakdown: planBreakdown || null,
    apiCosts: apiCosts || null,
    cohorts: cohorts || null,
    userSegments: userSegments || null,
    grimoireTopPages:
      (grimoireTopPagesResponse?.pages as GrimoireTopPage[]) || [],
    intentionBreakdown,
    insights,
    metricSnapshots: {
      weekly: (metricSnapshotsData?.weekly as MetricSnapshot[]) || [],
      monthly: (metricSnapshotsData?.monthly as MetricSnapshot[]) || [],
    },

    // State
    loading,
    error: formatAnalyticsError(errors),

    // Actions
    refresh,
  };
}
