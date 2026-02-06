/**
 * Snapshot Extractors
 *
 * Reshape the consolidated /api/admin/analytics/snapshot response
 * into the individual type shapes that useAnalyticsComputations expects.
 *
 * This allows zero changes to useAnalyticsComputations or UI components.
 */

import type {
  ActivityResponse,
  EngagementOverviewResponse,
  FeatureAdoptionResponse,
  Subscription30dResponse,
  InsightData,
} from '@/hooks/useAnalyticsData';
import {
  generateInsights,
  detectTrackingIssues,
  type AnalyticsMetrics,
} from '@/lib/analytics/insights';

// The shape returned by the enhanced snapshot endpoint
export interface ConsolidatedSnapshot {
  source: 'hybrid' | 'snapshot';
  snapshot_date: string;
  range: { start: Date; end: Date };
  row_count: number;

  // Core engagement
  dau: number;
  wau: number;
  mau: number;
  signed_in_product_dau: number;
  signed_in_product_wau: number;
  signed_in_product_mau: number;

  // App opened
  app_opened_dau: number;
  app_opened_wau: number;
  app_opened_mau: number;

  // Returning
  returning_dau: number;
  returning_wau: number;
  returning_mau: number;

  // Reach / sitewide
  reach_dau: number;
  reach_wau: number;
  reach_mau: number;
  sitewide_dau: number;
  sitewide_wau: number;
  sitewide_mau: number;

  // Grimoire
  grimoire_dau: number;
  grimoire_wau: number;
  grimoire_mau: number;
  content_mau_grimoire: number;
  grimoire_only_mau: number;
  grimoire_to_app_rate: number;
  grimoire_to_app_users: number;

  // Retention
  retention: { day_1: number; day_7: number; day_30: number };
  d1_retention: number;
  d7_retention: number;
  d30_retention: number;

  // Active days
  active_days_distribution: Record<string, number>;

  // Stickiness
  stickiness: number;
  stickiness_dau_mau: number;
  stickiness_wau_mau: number;
  avg_active_days_per_week: number;

  // Growth
  total_accounts: number;
  new_signups: number;
  activated_users: number;
  activation_rate: number;

  // Revenue
  mrr: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  new_conversions: number;

  // Feature adoption
  feature_adoption: {
    dashboard: number;
    horoscope: number;
    tarot: number;
    chart: number;
    guide: number;
    ritual: number;
  };

  // Returning referrer
  returning_referrer_breakdown: {
    organic_returning: number;
    direct_returning: number;
    internal_returning: number;
  };

  // Trend arrays
  trends: Array<{ date: string; dau: number; wau: number; mau: number }>;
  signed_in_product_trends: Array<{
    date: string;
    dau: number;
    wau: number;
    mau: number;
  }>;
  app_opened_trends: Array<{
    date: string;
    dau: number;
    wau: number;
    mau: number;
  }>;
  sitewide_trends: Array<{
    date: string;
    dau: number;
    wau: number;
    mau: number;
  }>;
  dau_trend: Array<{ date: string; dau: number; returning_dau: number }>;
  activation_trends: Array<{
    date: string;
    rate: number;
    signups: number;
    activated: number;
  }>;
  growth_trends: Array<{ date: string; signups: number }>;

  // Derived
  user_growth_rate: number;
  total_signups_range: number;

  // Subscription 30d
  subscription_30d: {
    window_days: number;
    signups: number;
    conversions: number;
    conversion_rate: number;
  };

  is_realtime_dau: boolean;
}

/**
 * Extract ActivityResponse shape from snapshot
 * Used by: useAnalyticsComputations for activity trends, momentum, metrics
 */
export function extractActivity(s: ConsolidatedSnapshot): ActivityResponse {
  const productMau = s.signed_in_product_mau;
  const productWau = s.signed_in_product_wau;
  const productDau = s.signed_in_product_dau;

  return {
    dau: s.dau,
    wau: s.wau,
    mau: s.mau,
    // Engaged users = same as DAU/WAU/MAU (from snapshot, all are product-engaged)
    engaged_users_dau: s.dau,
    engaged_users_wau: s.wau,
    engaged_users_mau: s.mau,
    // Engaged rate = engaged XAU / product XAU (events per product user)
    engaged_rate_dau:
      productDau > 0 ? Number((s.dau / productDau).toFixed(1)) : 0,
    engaged_rate_wau:
      productWau > 0 ? Number((s.wau / productWau).toFixed(1)) : 0,
    engaged_rate_mau:
      productMau > 0 ? Number((s.mau / productMau).toFixed(1)) : 0,
    // Stickiness
    stickiness_dau_mau: s.stickiness_dau_mau,
    stickiness_wau_mau: s.stickiness_wau_mau,
    stickiness_dau_wau:
      s.wau > 0 ? Number(((s.dau / s.wau) * 100).toFixed(2)) : 0,
    // App opened
    app_opened_dau: s.app_opened_dau,
    app_opened_wau: s.app_opened_wau,
    app_opened_mau: s.app_opened_mau,
    app_opened_stickiness_dau_mau:
      s.app_opened_mau > 0
        ? Number(((s.app_opened_dau / s.app_opened_mau) * 100).toFixed(2))
        : 0,
    app_opened_stickiness_wau_mau:
      s.app_opened_mau > 0
        ? Number(((s.app_opened_wau / s.app_opened_mau) * 100).toFixed(2))
        : 0,
    // Sitewide
    sitewide_dau: s.sitewide_dau,
    sitewide_wau: s.sitewide_wau,
    sitewide_mau: s.sitewide_mau,
    // Returning
    returning_dau: s.returning_dau,
    returning_wau: s.returning_wau,
    returning_mau: s.returning_mau,
    // Retention
    retention: s.retention,
    churn_rate: null,
    // Trends
    trends: s.trends,
    app_opened_trends: s.app_opened_trends,
    sitewide_trends: s.sitewide_trends,
    // Product metrics
    product_dau: productDau,
    product_wau: productWau,
    product_mau: productMau,
    product_stickiness_dau_mau:
      productMau > 0 ? Number(((productDau / productMau) * 100).toFixed(2)) : 0,
    product_stickiness_wau_mau:
      productMau > 0 ? Number(((productWau / productMau) * 100).toFixed(2)) : 0,
    product_trends: s.signed_in_product_trends,
    // Signed-in product
    signed_in_product_dau: productDau,
    signed_in_product_wau: productWau,
    signed_in_product_mau: productMau,
    signed_in_product_stickiness_dau_mau:
      productMau > 0 ? Number(((productDau / productMau) * 100).toFixed(2)) : 0,
    signed_in_product_stickiness_wau_mau:
      productMau > 0 ? Number(((productWau / productMau) * 100).toFixed(2)) : 0,
    signed_in_product_trends: s.signed_in_product_trends,
    signed_in_product_users: productMau,
    signed_in_product_returning_users: s.returning_mau,
    signed_in_product_avg_sessions_per_user: s.avg_active_days_per_week,
    // Grimoire
    content_mau_grimoire: s.content_mau_grimoire,
    grimoire_only_mau: s.grimoire_only_mau,
    total_accounts: s.total_accounts,
  };
}

/**
 * Extract EngagementOverviewResponse shape from snapshot
 * Used by: useAnalyticsComputations for returning referrer, retention cohorts, all-time
 */
export function extractEngagementOverview(
  s: ConsolidatedSnapshot,
): EngagementOverviewResponse {
  return {
    dau_trend: s.dau_trend,
    dau: s.dau,
    wau: s.wau,
    mau: s.mau,
    stickiness_dau_mau: s.stickiness_dau_mau,
    stickiness_wau_mau: s.stickiness_wau_mau,
    new_users: s.new_signups,
    returning_users_lifetime: s.returning_mau,
    returning_users_range: s.returning_mau,
    returning_dau: s.returning_dau,
    returning_wau: s.returning_wau,
    returning_mau: s.returning_mau,
    all_time: {
      total_product_users: s.signed_in_product_mau,
      returning_users: s.returning_mau,
      median_active_days_per_user: s.avg_active_days_per_week,
    },
    avg_active_days_per_user: s.avg_active_days_per_week,
    active_days_distribution: s.active_days_distribution,
    retention: {
      cohorts: [
        {
          cohort_day: s.snapshot_date,
          cohort_users: s.mau,
          day_1: s.retention.day_1,
          day_7: s.retention.day_7,
          day_30: s.retention.day_30,
        },
      ],
    },
    returning_referrer_breakdown: s.returning_referrer_breakdown,
  };
}

/**
 * Extract FeatureAdoptionResponse shape from snapshot
 * Used by: useAnalyticsComputations for feature adoption display
 */
export function extractFeatureAdoption(
  s: ConsolidatedSnapshot,
): FeatureAdoptionResponse {
  const fa = s.feature_adoption;
  const productMau = s.signed_in_product_mau;

  return {
    mau: productMau,
    features: [
      {
        event_type: 'daily_dashboard_viewed',
        users: Math.round((fa.dashboard / 100) * productMau),
        adoption_rate: fa.dashboard,
      },
      {
        event_type: 'personalized_horoscope_viewed',
        users: Math.round((fa.horoscope / 100) * productMau),
        adoption_rate: fa.horoscope,
      },
      {
        event_type: 'tarot_drawn',
        users: Math.round((fa.tarot / 100) * productMau),
        adoption_rate: fa.tarot,
      },
      {
        event_type: 'chart_viewed',
        users: Math.round((fa.chart / 100) * productMau),
        adoption_rate: fa.chart,
      },
      {
        event_type: 'astral_chat_used',
        users: Math.round((fa.guide / 100) * productMau),
        adoption_rate: fa.guide,
      },
      {
        event_type: 'ritual_started',
        users: Math.round((fa.ritual / 100) * productMau),
        adoption_rate: fa.ritual,
      },
    ],
  };
}

/**
 * Extract activation data shape from snapshot
 * Used by: useAnalyticsComputations for activation card + momentum
 */
export function extractActivation(s: ConsolidatedSnapshot) {
  return {
    totalSignups: s.total_signups_range,
    activatedUsers: s.activated_users,
    activationRate: s.activation_rate,
    trends: s.activation_trends,
  };
}

/**
 * Extract user growth data shape from snapshot
 * Used by: useAnalyticsComputations for growth rate card + trust funnel
 */
export function extractUserGrowth(s: ConsolidatedSnapshot) {
  return {
    growthRate: s.user_growth_rate,
    totalSignups: s.total_signups_range,
    trends: s.growth_trends,
  };
}

/**
 * Extract Subscription30dResponse shape from snapshot
 * Approximated from daily_metrics: sum of signups and conversions in range
 */
export function extractSubscription30d(
  s: ConsolidatedSnapshot,
): Subscription30dResponse {
  return s.subscription_30d;
}

/**
 * Compute insights client-side from snapshot data
 * Replaces the /api/admin/analytics/insights endpoint which was a meta-endpoint
 * calling 6 other sub-APIs
 */
export function computeInsights(s: ConsolidatedSnapshot): InsightData[] {
  const fa = s.feature_adoption;
  const productMau = s.signed_in_product_mau;

  // Build feature metrics for tracking quality detection
  const featureMetrics: Record<string, { count: number; adoption: number }> = {
    daily_dashboard_viewed: {
      count: Math.round((fa.dashboard / 100) * productMau),
      adoption: fa.dashboard,
    },
    personalized_horoscope_viewed: {
      count: Math.round((fa.horoscope / 100) * productMau),
      adoption: fa.horoscope,
    },
    tarot_drawn: {
      count: Math.round((fa.tarot / 100) * productMau),
      adoption: fa.tarot,
    },
    chart_viewed: {
      count: Math.round((fa.chart / 100) * productMau),
      adoption: fa.chart,
    },
    astral_chat_used: {
      count: Math.round((fa.guide / 100) * productMau),
      adoption: fa.guide,
    },
    ritual_started: {
      count: Math.round((fa.ritual / 100) * productMau),
      adoption: fa.ritual,
    },
  };

  // Normalize percentages to 0-1 range for generateInsights
  const pct = (v: number) => Math.min(v / 100, 1);

  const metrics: AnalyticsMetrics = {
    productMAU: productMau,
    appMAU: s.app_opened_mau,
    productDAU: s.signed_in_product_dau,
    productWAU: s.signed_in_product_wau,

    productMAUGrowth: s.user_growth_rate,
    signupCount: s.total_signups_range,
    activationRate: pct(s.activation_rate),

    // Use -1 sentinel if no retention data
    recentCohortRetention: s.d30_retention > 0 ? pct(s.d30_retention) : -1,
    earlyCohortRetention: s.d30_retention > 0 ? pct(s.d30_retention) : -1,
    day30Retention: s.d30_retention > 0 ? pct(s.d30_retention) : -1,

    avgActiveDays: s.avg_active_days_per_week,
    stickiness: pct(s.stickiness),
    d1Retention: pct(s.d1_retention),

    dashboardAdoption: pct(fa.dashboard),
    horoscopeAdoption: pct(fa.horoscope),
    tarotAdoption: pct(fa.tarot),
    guideAdoption: pct(fa.guide),
    chartAdoption: pct(fa.chart),
    ritualAdoption: pct(fa.ritual),

    mrr: s.mrr,
    conversionRate:
      s.total_signups_range > 0 ? s.new_conversions / s.total_signups_range : 0,

    trackingIssues: detectTrackingIssues(featureMetrics, productMau),
  };

  const insights = generateInsights(metrics);

  // Map to InsightData shape (priority number instead of string)
  const priorityMap: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return insights.map((insight) => ({
    type: insight.type,
    category: insight.category,
    priority: priorityMap[insight.priority] ?? 2,
    message: insight.message,
    action: insight.action,
    metric: insight.metric
      ? { label: insight.metric.label, value: insight.metric.value }
      : undefined,
  }));
}
