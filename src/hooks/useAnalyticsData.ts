'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuditInfo } from '@/lib/analytics/kpis';
import { formatDateInput } from '@/lib/analytics/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ActivityTrend = {
  date: string;
  dau: number;
  wau: number;
  mau: number;
};

export type ActivityResponse = {
  dau: number;
  wau: number;
  mau: number;
  // Distinct engaged users
  engaged_users_dau: number;
  engaged_users_wau: number;
  engaged_users_mau: number;
  // Engaged rate = events per signed-in user
  engaged_rate_dau: number;
  engaged_rate_wau: number;
  engaged_rate_mau: number;
  // Legacy stickiness (kept for backwards compatibility)
  stickiness_dau_mau: number;
  stickiness_wau_mau: number;
  stickiness_dau_wau: number;
  app_opened_dau: number;
  app_opened_wau: number;
  app_opened_mau: number;
  app_opened_stickiness_dau_mau: number;
  app_opened_stickiness_wau_mau: number;
  sitewide_dau: number;
  sitewide_wau: number;
  sitewide_mau: number;
  returning_dau: number;
  returning_wau: number;
  returning_mau: number;
  retention: {
    day_1: number | null;
    day_7: number | null;
    day_30: number | null;
  };
  churn_rate: number | null;
  trends: ActivityTrend[];
  app_opened_trends: ActivityTrend[];
  sitewide_trends: ActivityTrend[];
  product_dau: number;
  product_wau: number;
  product_mau: number;
  product_stickiness_dau_mau: number;
  product_stickiness_wau_mau: number;
  product_trends: ActivityTrend[];
  signed_in_product_dau: number;
  signed_in_product_wau: number;
  signed_in_product_mau: number;
  signed_in_product_stickiness_dau_mau: number;
  signed_in_product_stickiness_wau_mau: number;
  signed_in_product_trends: ActivityTrend[];
  signed_in_product_users: number;
  signed_in_product_returning_users: number;
  signed_in_product_avg_sessions_per_user: number;
  content_mau_grimoire: number;
  grimoire_only_mau: number;
  total_accounts: number;
};

export type ConversionResponse = {
  total_conversions: number;
  conversion_rate: number;
  trial_conversion_rate: number;
  avg_days_to_convert: number;
  trigger_breakdown: Array<{
    feature: string;
    count: number;
    percentage: number;
  }>;
  funnel: {
    free_users: number;
    trial_users: number;
    paid_users: number;
    drop_off_points: Array<{ stage: string; drop_off_rate: number }>;
  };
};

export type NotificationBucket = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  open_rate: number;
  click_through_rate: number;
};

export type NotificationResponse = {
  cosmic_pulse?: NotificationBucket;
  moon_circle?: NotificationBucket;
  weekly_report?: NotificationBucket;
  overall_open_rate: number;
  overall_click_through_rate: number;
  [key: string]: NotificationBucket | number | undefined;
};

export type FeatureUsageResponse = {
  features: Array<{
    feature: string;
    unique_users: number;
    total_events: number;
    avg_per_user: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  heatmap: Array<{
    date: string;
    features: Record<string, number>;
  }>;
};

export type AttributionSummary = {
  totalUsers: number;
  organicUsers: number;
  organicPercentage: number;
};

export type AttributionResponse = {
  summary: AttributionSummary;
  sourceBreakdown?: Array<{
    source: string;
    user_count: number;
    percentage: number;
  }>;
  mediumBreakdown?: Array<{
    source: string;
    medium: string;
    user_count: number;
  }>;
  topLandingPages?: Array<{
    page: string;
    source: string;
    user_count: number;
  }>;
  keywordBreakdown?: Array<{ keyword: string; user_count: number }>;
  dailyTrend?: Array<{
    date: string;
    source: string;
    user_count: number;
  }>;
  conversionBySource?: Array<{
    source: string;
    total_users: number;
    paying_users: number;
    conversion_rate: number;
  }>;
  source?: string;
  error?: string;
};

export type CtaConversionHub = {
  hub: string;
  total_clicks: number;
  unique_clickers: number;
  signups_7d: number;
  conversion_rate: number;
};

export type CtaConversionResponse = {
  window_days: number;
  hubs: CtaConversionHub[];
};

export type CtaLocationMetric = {
  location: string;
  location_label: string;
  cta_id: string;
  total_impressions: number;
  unique_viewers: number;
  total_clicks: number;
  unique_clickers: number;
  signups_7d: number;
  click_through_rate: number;
  conversion_rate: number;
};

export type CtaLocationsResponse = {
  window_days: number;
  locations: CtaLocationMetric[];
};

export type Subscription30dResponse = {
  window_days: number;
  signups: number;
  conversions: number;
  conversion_rate: number;
};

export type EngagementOverviewResponse = {
  dau_trend: Array<{ date: string; dau: number; returning_dau: number }>;
  dau: number;
  wau: number;
  mau: number;
  stickiness_dau_mau: number;
  stickiness_wau_mau: number;
  new_users: number;
  returning_users_lifetime: number;
  returning_users_range: number;
  returning_dau: number;
  returning_wau: number;
  returning_mau: number;
  all_time: {
    total_product_users: number;
    returning_users: number;
    median_active_days_per_user: number;
  };
  avg_active_days_per_user: number;
  active_days_distribution: Record<string, number>;
  retention: {
    cohorts: Array<{
      cohort_day: string;
      cohort_users: number;
      day_1: number | null;
      day_7: number | null;
      day_30: number | null;
    }>;
  };
  returning_referrer_breakdown?: {
    organic_returning: number;
    direct_returning: number;
    internal_returning: number;
  };
  audit?: AuditInfo;
};

export type FeatureAdoptionResponse = {
  mau: number;
  features: Array<{
    event_type: string;
    users: number;
    adoption_rate: number;
  }>;
};

export type GrimoireHealthResponse = {
  grimoire_entry_rate: number;
  grimoire_to_app_rate: number;
  grimoire_visitors: number;
  grimoire_to_app_users: number;
  grimoire_views_per_active_user: number;
  return_to_grimoire_rate: number;
  influence: {
    subscription_users: number;
    subscription_users_with_grimoire_before: number;
    subscription_with_grimoire_before_rate: number;
    median_days_first_grimoire_to_signup: number | null;
    median_days_signup_to_subscription: number | null;
  };
};

export type ConversionInfluenceResponse = {
  subscription_users: number;
  subscription_users_with_grimoire_before: number;
  subscription_with_grimoire_before_rate: number;
  median_days_first_grimoire_to_signup: number | null;
  median_days_signup_to_subscription: number | null;
};

export type GrimoireTopPage = {
  pagePath: string;
  viewsLast30Days: number;
  viewsAllTime: number;
};

export type IntentionBreakdownItem = {
  intention: string;
  count: number;
  percentage: number;
};

export type IntentionBreakdown = IntentionBreakdownItem[];

export type InsightData = {
  type: string;
  category: string;
  priority: number;
  message: string;
  action?: string;
  metric?: {
    label: string;
    value: unknown;
  };
};

export type MetricSnapshot = {
  period_key: string;
  new_signups: number;
  wau: number;
  new_trials: number;
  new_paying_subscribers: number;
  active_subscribers: number;
  mrr: number;
  activation_rate: number;
  churn_rate: number;
  trial_to_paid_conversion_rate: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_RANGE_DAYS = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsDataState {
  // Date range controls
  startDate: string;
  endDate: string;
  granularity: 'day' | 'week' | 'month';
  includeAudit: boolean;

  // Data state
  activity: ActivityResponse | null;
  conversions: ConversionResponse | null;
  notifications: NotificationResponse | null;
  featureUsage: FeatureUsageResponse | null;
  engagementOverview: EngagementOverviewResponse | null;
  featureAdoption: FeatureAdoptionResponse | null;
  grimoireHealth: GrimoireHealthResponse | null;
  conversionInfluence: ConversionInfluenceResponse | null;
  ctaConversions: CtaConversionResponse | null;
  ctaLocations: CtaLocationsResponse | null;
  subscription30d: Subscription30dResponse | null;
  attribution: AttributionResponse | null;
  successMetrics: any | null;
  discordAnalytics: any | null;
  searchConsoleData: any | null;
  userGrowth: any | null;
  activation: any | null;
  subscriptionLifecycle: any | null;
  planBreakdown: any | null;
  apiCosts: any | null;
  cohorts: any | null;
  userSegments: any | null;
  grimoireTopPages: GrimoireTopPage[];
  intentionBreakdown: IntentionBreakdown | null;
  insights: InsightData[];
  metricSnapshots: {
    weekly: MetricSnapshot[];
    monthly: MetricSnapshot[];
  };

  // UI state
  loading: boolean;
  error: string | null;
  showExportMenu: boolean;
  showProductSeries: boolean;
  insightTypeFilter: string;
  insightCategoryFilter: string;
}

export interface AnalyticsDataActions {
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setGranularity: (granularity: 'day' | 'week' | 'month') => void;
  setIncludeAudit: (include: boolean) => void;
  setShowExportMenu: (show: boolean) => void;
  setShowProductSeries: (show: boolean) => void;
  setInsightTypeFilter: (filter: string) => void;
  setInsightCategoryFilter: (filter: string) => void;
  fetchAnalytics: () => Promise<void>;
  exportMenuRef: React.RefObject<HTMLDivElement>;
}

export function useAnalyticsData(): AnalyticsDataState & AnalyticsDataActions {
  const today = new Date();
  const defaultEnd = formatDateInput(today);
  const defaultStart = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DEFAULT_RANGE_DAYS - 1));
    return formatDateInput(d);
  })();

  // Date range controls
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'day',
  );
  const [includeAudit, setIncludeAudit] = useState(false);

  // Data state
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [conversions, setConversions] = useState<ConversionResponse | null>(
    null,
  );
  const [notifications, setNotifications] =
    useState<NotificationResponse | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageResponse | null>(
    null,
  );
  const [engagementOverview, setEngagementOverview] =
    useState<EngagementOverviewResponse | null>(null);
  const [featureAdoption, setFeatureAdoption] =
    useState<FeatureAdoptionResponse | null>(null);
  const [grimoireHealth, setGrimoireHealth] =
    useState<GrimoireHealthResponse | null>(null);
  const [conversionInfluence, setConversionInfluence] =
    useState<ConversionInfluenceResponse | null>(null);
  const [ctaConversions, setCtaConversions] =
    useState<CtaConversionResponse | null>(null);
  const [ctaLocations, setCtaLocations] = useState<CtaLocationsResponse | null>(
    null,
  );
  const [subscription30d, setSubscription30d] =
    useState<Subscription30dResponse | null>(null);
  const [attribution, setAttribution] = useState<AttributionResponse | null>(
    null,
  );
  const [successMetrics, setSuccessMetrics] = useState<any | null>(null);
  const [discordAnalytics, setDiscordAnalytics] = useState<any | null>(null);
  const [searchConsoleData, setSearchConsoleData] = useState<any | null>(null);
  const [userGrowth, setUserGrowth] = useState<any | null>(null);
  const [activation, setActivation] = useState<any | null>(null);
  const [subscriptionLifecycle, setSubscriptionLifecycle] = useState<
    any | null
  >(null);
  const [planBreakdown, setPlanBreakdown] = useState<any | null>(null);
  const [apiCosts, setApiCosts] = useState<any | null>(null);
  const [cohorts, setCohorts] = useState<any | null>(null);
  const [userSegments, setUserSegments] = useState<any | null>(null);
  const [grimoireTopPages, setGrimoireTopPages] = useState<GrimoireTopPage[]>(
    [],
  );
  const [intentionBreakdown, setIntentionBreakdown] =
    useState<IntentionBreakdown | null>(null);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [metricSnapshots, setMetricSnapshots] = useState<{
    weekly: MetricSnapshot[];
    monthly: MetricSnapshot[];
  }>({ weekly: [], monthly: [] });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showProductSeries, setShowProductSeries] = useState(false);
  const [insightTypeFilter, setInsightTypeFilter] = useState<string>('all');
  const [insightCategoryFilter, setInsightCategoryFilter] =
    useState<string>('all');

  const exportMenuRef = useRef<HTMLDivElement>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = `start_date=${startDate}&end_date=${endDate}`;
    const debugParam = includeAudit ? '&debug=1' : '';

    try {
      // ALL requests in parallel - no more sequential batches
      const [
        activityRes,
        engagementOverviewRes,
        conversionsRes,
        userGrowthRes,
        activationRes,
        cohortsRes,
        featureAdoptionRes,
        featureUsageRes,
        grimoireHealthRes,
        conversionInfluenceRes,
        successMetricsRes,
        intentionBreakdownRes,
        subscription30dRes,
        subscriptionLifecycleRes,
        planBreakdownRes,
        ctaConversionsRes,
        ctaLocationsRes,
        apiCostsRes,
        userSegmentsRes,
        notificationsRes,
        attributionRes,
        discordRes,
        searchConsoleRes,
        insightsRes,
        grimoireTopPagesRes,
      ] = await Promise.all([
        // Core metrics
        fetch(
          `/api/admin/analytics/dau-wau-mau?${queryParams}&granularity=${granularity}`,
        ),
        fetch(
          `/api/admin/analytics/engagement-overview?${queryParams}${debugParam}`,
        ),
        fetch(`/api/admin/analytics/conversions?${queryParams}`),
        fetch(
          `/api/admin/analytics/user-growth?${queryParams}&granularity=${granularity}`,
        ),
        fetch(`/api/admin/analytics/activation?${queryParams}`),
        fetch(`/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`),
        // Feature metrics
        fetch(`/api/admin/analytics/feature-adoption?${queryParams}`),
        fetch(`/api/admin/analytics/feature-usage?${queryParams}`),
        fetch(`/api/admin/analytics/grimoire-health?${queryParams}`),
        fetch(`/api/admin/analytics/conversion-influence?${queryParams}`),
        fetch(`/api/admin/analytics/success-metrics?${queryParams}`),
        fetch(`/api/admin/analytics/intention-breakdown?${queryParams}`),
        // Subscription & monetization
        fetch(`/api/admin/analytics/subscription-30d?${queryParams}`),
        fetch(
          `/api/admin/analytics/subscription-lifecycle?${queryParams}&stripe=1`,
        ),
        fetch(`/api/admin/analytics/plan-breakdown?${queryParams}`),
        fetch(`/api/admin/analytics/cta-conversions?${queryParams}`),
        fetch(`/api/admin/analytics/cta-locations?${queryParams}`),
        fetch(`/api/admin/analytics/api-costs?${queryParams}`),
        fetch(`/api/admin/analytics/user-segments?${queryParams}`),
        // External & misc
        fetch(`/api/admin/analytics/notifications?${queryParams}`),
        fetch(`/api/admin/analytics/attribution?${queryParams}`),
        fetch(`/api/analytics/discord-interactions?range=7d`),
        fetch(`/api/admin/analytics/search-console?${queryParams}`),
        fetch(`/api/admin/analytics/insights?${queryParams}`),
        fetch(`/api/grimoire/stats?top=20`),
      ]);

      const errors: string[] = [];

      if (activityRes.ok) {
        setActivity(await activityRes.json());
      } else {
        errors.push('DAU/WAU/MAU');
      }

      if (engagementOverviewRes.ok) {
        setEngagementOverview(await engagementOverviewRes.json());
      } else {
        errors.push('Engagement overview');
      }

      if (featureAdoptionRes.ok) {
        setFeatureAdoption(await featureAdoptionRes.json());
      } else {
        errors.push('Feature adoption');
      }

      if (grimoireHealthRes.ok) {
        setGrimoireHealth(await grimoireHealthRes.json());
      } else {
        errors.push('Grimoire health');
      }

      if (conversionInfluenceRes.ok) {
        setConversionInfluence(await conversionInfluenceRes.json());
      } else {
        errors.push('Conversion influence');
      }

      if (conversionsRes.ok) {
        setConversions(await conversionsRes.json());
      } else {
        errors.push('Conversions');
      }

      if (ctaConversionsRes.ok) {
        setCtaConversions(await ctaConversionsRes.json());
      } else {
        errors.push('CTA conversions');
      }

      if (ctaLocationsRes.ok) {
        setCtaLocations(await ctaLocationsRes.json());
      } else {
        errors.push('CTA locations');
      }

      if (subscription30dRes.ok) {
        setSubscription30d(await subscription30dRes.json());
      } else {
        errors.push('Subscription 30d');
      }

      if (notificationsRes.ok) {
        setNotifications(await notificationsRes.json());
      } else {
        errors.push('Notifications');
      }

      if (featureUsageRes.ok) {
        setFeatureUsage(await featureUsageRes.json());
      } else {
        errors.push('Feature usage');
      }

      if (attributionRes.ok) {
        setAttribution(await attributionRes.json());
      } else {
        errors.push('Attribution');
      }

      if (successMetricsRes.ok) {
        setSuccessMetrics(await successMetricsRes.json());
      } else {
        errors.push('Success metrics');
      }

      if (discordRes.ok) {
        setDiscordAnalytics(await discordRes.json());
      }

      if (searchConsoleRes.ok) {
        const searchData = await searchConsoleRes.json();
        if (searchData.success) {
          setSearchConsoleData(searchData.data);
        }
      }

      if (userGrowthRes.ok) {
        setUserGrowth(await userGrowthRes.json());
      }

      if (activationRes.ok) {
        setActivation(await activationRes.json());
      }

      if (subscriptionLifecycleRes.ok) {
        setSubscriptionLifecycle(await subscriptionLifecycleRes.json());
      }

      if (planBreakdownRes.ok) {
        setPlanBreakdown(await planBreakdownRes.json());
      }

      if (apiCostsRes.ok) {
        setApiCosts(await apiCostsRes.json());
      }

      if (cohortsRes.ok) {
        setCohorts(await cohortsRes.json());
      }

      if (userSegmentsRes.ok) {
        setUserSegments(await userSegmentsRes.json());
      }

      if (intentionBreakdownRes.ok) {
        const data = await intentionBreakdownRes.json();
        const breakdown = Array.isArray(data?.data)
          ? (data.data as IntentionBreakdown)
          : Array.isArray(data)
            ? (data as IntentionBreakdown)
            : null;
        setIntentionBreakdown(breakdown);
      } else {
        errors.push('Intention breakdown');
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights || []);
      }

      if (grimoireTopPagesRes.ok) {
        const data = await grimoireTopPagesRes.json();
        setGrimoireTopPages(data.pages || []);
      }

      if (errors.length > 0) {
        setError(`Some metrics unavailable: ${errors.join(', ')}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong loading data',
      );
    } finally {
      setLoading(false);
    }
  }, [granularity, startDate, endDate, includeAudit]);

  // Fetch analytics on mount and when dependencies change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Fetch metric snapshots on mount
  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const [weeklyRes, monthlyRes] = await Promise.all([
          fetch('/api/admin/analytics/metric-snapshots?type=weekly&limit=12'),
          fetch('/api/admin/analytics/metric-snapshots?type=monthly&limit=12'),
        ]);
        const weekly = weeklyRes.ok
          ? ((await weeklyRes.json()).snapshots ?? [])
          : [];
        const monthly = monthlyRes.ok
          ? ((await monthlyRes.json()).snapshots ?? [])
          : [];
        setMetricSnapshots({ weekly, monthly });
      } catch {
        // Snapshots are supplementary - fail silently
      }
    };
    fetchSnapshots();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  return {
    // Date range controls
    startDate,
    endDate,
    granularity,
    includeAudit,

    // Data state
    activity,
    conversions,
    notifications,
    featureUsage,
    engagementOverview,
    featureAdoption,
    grimoireHealth,
    conversionInfluence,
    ctaConversions,
    ctaLocations,
    subscription30d,
    attribution,
    successMetrics,
    discordAnalytics,
    searchConsoleData,
    userGrowth,
    activation,
    subscriptionLifecycle,
    planBreakdown,
    apiCosts,
    cohorts,
    userSegments,
    grimoireTopPages,
    intentionBreakdown,
    insights,
    metricSnapshots,

    // UI state
    loading,
    error,
    showExportMenu,
    showProductSeries,
    insightTypeFilter,
    insightCategoryFilter,

    // Actions
    setStartDate,
    setEndDate,
    setGranularity,
    setIncludeAudit,
    setShowExportMenu,
    setShowProductSeries,
    setInsightTypeFilter,
    setInsightCategoryFilter,
    fetchAnalytics,
    exportMenuRef,
  };
}
