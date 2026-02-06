'use client';

import { useCallback, useMemo } from 'react';
import type {
  AnalyticsDataState,
  NotificationBucket,
} from './useAnalyticsData';
import {
  describeTrend as describeTrendUtil,
  computeWeekOverWeekChange as computeWoWChange,
  formatMetricValue as formatMetric,
  computePercent,
  shiftDateInput,
} from '@/lib/analytics/utils';
import type { UsageChartSeries } from '@/components/charts/UsageChart';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type RollingAverage = {
  average: number | null;
  previousAverage: number | null;
};

export type MomentumMetric = {
  id: string;
  label: string;
  stats: RollingAverage;
  decimals?: number;
  formatter: (value: number | null) => string;
};

export type MomentumRow = MomentumMetric & {
  change: number | null;
  percentChange: number | null;
};

export type PrimaryCard = {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const ACTIVATION_FEATURES = [
  { event: 'horoscope_viewed', label: 'Horoscope Viewed' },
  { event: 'personalized_horoscope_viewed', label: 'Personalized Horoscope' },
  { event: 'personalized_tarot_viewed', label: 'Personalized Tarot' },
];

export const INTENTION_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  confidence: 'Confidence',
  calm: 'Calm',
  insight: 'Insight',
};

export const activitySeries: UsageChartSeries[] = [
  {
    dataKey: 'dau',
    name: 'DAU',
    stroke: 'rgba(196,181,253,0.8)',
  },
  {
    dataKey: 'wau',
    name: 'WAU',
    stroke: 'rgba(129,140,248,0.9)',
    strokeDasharray: '6 4',
  },
  {
    dataKey: 'mau',
    name: 'MAU',
    stroke: 'rgba(56,189,248,0.9)',
    strokeDasharray: '4 2',
  },
];

export const productSeries: UsageChartSeries[] = [
  {
    dataKey: 'signed_in_product_dau',
    name: 'Product DAU',
    stroke: 'rgba(245,158,11,0.9)',
    strokeDasharray: '3 3',
  },
  {
    dataKey: 'signed_in_product_wau',
    name: 'Product WAU',
    stroke: 'rgba(16,185,129,0.9)',
    strokeDasharray: '4 2',
  },
  {
    dataKey: 'signed_in_product_mau',
    name: 'Product MAU',
    stroke: 'rgba(14,165,233,0.9)',
    strokeDasharray: '5 3',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

const sortRowsByDate = <T extends { date: string }>(rows: T[]) =>
  [...rows].sort((a, b) =>
    a.date.localeCompare(b.date, undefined, { numeric: true }),
  );

const computeRollingAverage = <T extends { date: string }>(
  rows: T[],
  extractor: (row: T) => number | null | undefined,
  window = 7,
): RollingAverage => {
  if (window <= 0 || rows.length === 0) {
    return { average: null, previousAverage: null };
  }
  const sorted = sortRowsByDate(rows);
  const takeWindow = (offset: number) => {
    const start = Math.max(0, sorted.length - window - offset);
    const end = Math.max(0, sorted.length - offset);
    return sorted.slice(start, end);
  };
  const lastWindow = takeWindow(0);
  if (lastWindow.length === 0) {
    return { average: null, previousAverage: null };
  }
  const average =
    lastWindow.reduce((sum, row) => sum + (extractor(row) ?? 0), 0) /
    lastWindow.length;
  const prevWindow = takeWindow(window);
  const previousAverage =
    prevWindow.length === window
      ? prevWindow.reduce((sum, row) => sum + (extractor(row) ?? 0), 0) /
        prevWindow.length
      : null;
  return { average, previousAverage };
};

export const describeTrend = describeTrendUtil;
export const computeWeekOverWeekChange = computeWoWChange;
export const formatMetricValue = formatMetric;

export const formatCurrency = (value?: number) =>
  typeof value === 'number'
    ? `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : 'N/A';

export const formatPercent = (value?: number, digits = 1) =>
  typeof value === 'number' ? `${value.toFixed(digits)}%` : 'N/A';

export const formatPercentOrDash = (value?: number | null, digits = 2) =>
  typeof value === 'number' ? `${value.toFixed(digits)}%` : '—';

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAnalyticsComputations(data: AnalyticsDataState) {
  const {
    activity,
    engagementOverview,
    conversions,
    featureUsage,
    grimoireHealth,
    conversionInfluence,
    attribution,
    subscription30d,
    activation,
    cohorts,
    userGrowth,
    successMetrics,
    planBreakdown,
    insights,
    insightTypeFilter,
    insightCategoryFilter,
    ctaConversions,
    ctaLocations,
    subscriptionLifecycle,
    notifications,
    showProductSeries,
    endDate,
  } = data;

  const momentumWindowSize = 7;

  // WAU/MAU window starts
  const wauWindowStart = useMemo(() => shiftDateInput(endDate, -6), [endDate]);
  const mauWindowStart = useMemo(() => shiftDateInput(endDate, -29), [endDate]);

  // Activity usage data (combined trends)
  const activityUsageData = useMemo(() => {
    const overallTrends = activity?.trends ?? [];
    const productTrends = activity?.signed_in_product_trends ?? [];
    const overallMap = new Map(
      overallTrends.map((trend) => [trend.date, trend]),
    );
    const productMap = new Map(
      productTrends.map((trend) => [trend.date, trend]),
    );
    const dateSet = new Set<string>([
      ...overallMap.keys(),
      ...productMap.keys(),
    ]);
    const dates = Array.from(dateSet).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );

    return dates.map((date) => {
      const overall = overallMap.get(date);
      const product = productMap.get(date);
      return {
        date,
        dau: overall?.dau ?? 0,
        wau: overall?.wau ?? 0,
        mau: overall?.mau ?? 0,
        signed_in_product_dau: product?.dau ?? 0,
        signed_in_product_wau: product?.wau ?? 0,
        signed_in_product_mau: product?.mau ?? 0,
      };
    });
  }, [activity?.trends, activity?.signed_in_product_trends]);

  // Product ratios
  const productDauToWauRatio =
    activity?.signed_in_product_wau && activity.signed_in_product_wau > 0
      ? (activity.signed_in_product_dau / activity.signed_in_product_wau) * 100
      : 0;

  const productWauToMauRatio =
    activity?.signed_in_product_mau && activity.signed_in_product_mau > 0
      ? (activity.signed_in_product_wau / activity.signed_in_product_mau) * 100
      : 0;

  const grimoireShareRatio =
    activity?.content_mau_grimoire && activity.content_mau_grimoire > 0
      ? (activity.grimoire_only_mau / activity.content_mau_grimoire) * 100
      : 0;

  // Product returning percentages
  const productReturningPercent = activity
    ? {
        dau: computePercent(
          activity.returning_dau,
          activity.signed_in_product_dau,
        ),
        wau: computePercent(
          activity.returning_wau,
          activity.signed_in_product_wau,
        ),
        mau: computePercent(
          activity.returning_mau,
          activity.signed_in_product_mau,
        ),
      }
    : { dau: 0, wau: 0, mau: 0 };

  const returningReferrerBreakdown =
    engagementOverview?.returning_referrer_breakdown;

  // App metrics
  const appDau = activity?.app_opened_dau ?? 0;
  const appWau = activity?.app_opened_wau ?? 0;
  const appMau = activity?.app_opened_mau ?? 0;

  // Engaged metrics (total events — shows usage intensity)
  const engagedDau = activity?.dau ?? 0;
  const engagedWau = activity?.wau ?? 0;
  const engagedMau = activity?.mau ?? 0;

  const engagementRate = appMau > 0 ? (engagedMau / appMau) * 100 : null;

  // Audit metrics
  const appVisits = engagementOverview?.audit?.raw_events_count ?? null;
  const canonicalIdentities =
    engagementOverview?.audit?.distinct_canonical_identities ?? null;
  const appVisitsPerUser =
    appVisits !== null && appMau > 0 ? appVisits / appMau : null;

  // Reach metrics
  const reachDau = activity?.sitewide_dau ?? 0;
  const reachWau = activity?.sitewide_wau ?? 0;
  const reachMau = activity?.sitewide_mau ?? 0;

  // Grimoire metrics
  const grimoireMau = activity?.content_mau_grimoire ?? 0;
  const grimoireOnlyMau = activity?.grimoire_only_mau ?? 0;
  const totalAccountsEver = activity?.total_accounts ?? 0;

  // All-time metrics
  const allTimeTotalProductUsers =
    activity?.signed_in_product_users ??
    engagementOverview?.all_time?.total_product_users ??
    engagementOverview?.mau ??
    0;

  const allTimeReturningUsers =
    engagementOverview?.all_time?.returning_users ??
    engagementOverview?.returning_users_lifetime ??
    engagementOverview?.returning_users_range ??
    0;

  const allTimeMedianActiveDays =
    activity?.signed_in_product_avg_sessions_per_user ??
    engagementOverview?.avg_active_days_per_user ??
    null;

  // Product MAU and growth
  const productMauCurrentWeek = activity?.signed_in_product_mau ?? 0;
  const productMauGrowth = userGrowth?.growthRate ?? 0;

  // Conversion stages
  const conversionStages =
    conversions?.funnel &&
    typeof conversions.funnel.free_users === 'number' &&
    typeof conversions.funnel.trial_users === 'number' &&
    typeof conversions.funnel.paid_users === 'number'
      ? [
          { label: 'Free users', value: conversions.funnel.free_users },
          { label: 'Trial users', value: conversions.funnel.trial_users },
          { label: 'Subscribers', value: conversions.funnel.paid_users },
        ]
      : [];

  const conversionDropOff = conversions?.funnel?.drop_off_points ?? [];

  // Integrity warnings
  const productMaError = (activity?.signed_in_product_mau ?? 0) > appMau;
  const integrityWarnings: string[] = useMemo(() => {
    const warnings: string[] = [];
    if (appMau < appWau) {
      warnings.push(
        'App MAU is below WAU, indicating overlapping windows need review.',
      );
    }
    if (appWau < appDau) {
      warnings.push('App WAU is below DAU, which suggests a window miscount.');
    }
    if (productMaError) {
      warnings.push(
        'Signed-in Product MAU exceeds App MAU; review the canonical `app_opened` audit.',
      );
    }
    return warnings;
  }, [appMau, appWau, appDau, productMaError]);

  // Pageviews per reach user
  const pageviewFeature = featureUsage?.features?.find(
    (feature) => feature.feature === '$pageview',
  );
  const pageviewsPerReachUser =
    pageviewFeature && reachMau > 0
      ? pageviewFeature.total_events / reachMau
      : null;

  // Attribution
  const attributionSummary = attribution?.summary;
  const totalAttributedUsers = attributionSummary?.totalUsers ?? 0;
  const organicAttributedUsers = attributionSummary?.organicUsers ?? 0;
  const organicAttributionPercentage =
    typeof attributionSummary?.organicPercentage === 'number'
      ? `${attributionSummary.organicPercentage.toFixed(1)}%`
      : '0%';

  // Subscription 30d
  const signup30dSignups = subscription30d?.signups ?? 0;
  const signup30dSubscriptions = subscription30d?.conversions ?? 0;
  const signup30dRate =
    signup30dSignups > 0
      ? `${(subscription30d?.conversion_rate ?? 0).toFixed(2)}%`
      : 'N/A';

  // Activation
  const activationTotalSignups = activation?.totalSignups ?? 0;
  const activationActivatedUsers = activation?.activatedUsers ?? 0;
  const activationRateValue =
    typeof activation?.activationRate === 'number'
      ? activation.activationRate
      : 0;
  const activationRateDisplay =
    activationTotalSignups > 0 ? `${activationRateValue.toFixed(2)}%` : 'N/A';

  // CTA and lifecycle
  const ctaHubs = ctaConversions?.hubs ?? [];
  const ctaLocationMetrics = ctaLocations?.locations ?? [];
  const lifecycleStateEntries = subscriptionLifecycle?.states
    ? Object.entries(subscriptionLifecycle.states as Record<string, number>)
    : [];

  // Engaged matches app
  const engagedMatchesApp =
    engagedDau === appDau && engagedWau === appWau && engagedMau === appMau;

  // Chart series
  const chartSeries = showProductSeries
    ? [...activitySeries, ...productSeries]
    : activitySeries;

  // Heatmap data
  const heatmapData = useMemo(() => {
    if (!featureUsage) return [];
    const recent = featureUsage.heatmap.slice(-7);
    const meaningfulFeatures = featureUsage.features.filter(
      (f) => f.feature !== '$pageview',
    );
    const topFeatures = [
      ...meaningfulFeatures.slice(0, 4).map((f) => f.feature),
      ...(meaningfulFeatures.length < 5
        ? featureUsage.features
            .filter((f) => f.feature === '$pageview')
            .map((f) => f.feature)
        : []),
    ];

    return recent.map((row) => {
      const entries = topFeatures.map((feature) => ({
        feature,
        value: row.features[feature] ?? 0,
      }));
      return { date: row.date, entries };
    });
  }, [featureUsage]);

  // Active subscribers
  const activeSubscribers =
    successMetrics?.active_entitlements?.value ??
    successMetrics?.active_subscriptions?.value ??
    conversions?.funnel.paid_users ??
    subscriptionLifecycle?.states?.active ??
    0;

  // Primary cards
  const primaryCards: PrimaryCard[] = useMemo(
    () => [
      {
        title: 'Monthly Recurring Revenue',
        value: formatCurrency(successMetrics?.monthly_recurring_revenue?.value),
        subtitle: 'MRR this period',
      },
      {
        title: 'Annual Recurring Revenue',
        value: formatCurrency(successMetrics?.annual_recurring_revenue?.value),
        subtitle: 'ARR run-rate',
      },
      {
        title: 'Total Users',
        value:
          successMetrics?.active_subscriptions?.total_registered_users ??
          activeSubscribers,
        subtitle:
          successMetrics?.active_subscriptions?.paid_subscriptions !== undefined
            ? successMetrics.active_subscriptions.discrepancy
              ? `Paid: ${successMetrics.active_subscriptions.paid_subscriptions} | Free: ${successMetrics.active_subscriptions.free_users} | Stripe: ${successMetrics.active_subscriptions.stripe_active_customers} (${successMetrics.active_subscriptions.discrepancy > 0 ? '+' : ''}${successMetrics.active_subscriptions.discrepancy} unlinked)`
              : `Paid: ${successMetrics.active_subscriptions.paid_subscriptions} | Free: ${successMetrics.active_subscriptions.free_users}`
            : 'Paid + free users',
      },
      {
        title: 'Conversion Rate',
        value: formatPercent(conversions?.conversion_rate, 1),
        subtitle: 'Free -> Paid',
      },
      {
        title: 'Activation Rate',
        value: formatPercent(activation?.activationRate, 2),
        subtitle: 'Activated within 24h',
      },
      {
        title: 'Growth Rate',
        value: formatPercent(userGrowth?.growthRate, 1),
        subtitle: 'Signups period-over-period',
      },
    ],
    [
      successMetrics,
      activeSubscribers,
      conversions?.conversion_rate,
      activation?.activationRate,
      userGrowth?.growthRate,
    ],
  );

  // Sorted trends
  const sortedActivityTrends = useMemo(
    () => (activity?.trends ? sortRowsByDate(activity.trends) : []),
    [activity?.trends],
  );

  const sortedAppOpenedTrends = useMemo(
    () =>
      activity?.app_opened_trends
        ? sortRowsByDate(activity.app_opened_trends)
        : [],
    [activity?.app_opened_trends],
  );

  const sortedProductTrends = useMemo(
    () =>
      activity?.signed_in_product_trends
        ? sortRowsByDate(activity.signed_in_product_trends)
        : [],
    [activity?.signed_in_product_trends],
  );

  const sortedActivationTrends = useMemo(
    () =>
      activation?.trends
        ? [...activation.trends].sort((a: any, b: any) =>
            a.date.localeCompare(b.date, undefined, { numeric: true }),
          )
        : [],
    [activation?.trends],
  );

  // Rolling averages
  const wauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedActivityTrends,
        (row) => row.wau ?? 0,
        momentumWindowSize,
      ),
    [sortedActivityTrends],
  );

  const mauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedActivityTrends,
        (row) => row.mau ?? 0,
        momentumWindowSize,
      ),
    [sortedActivityTrends],
  );

  const siteDauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedAppOpenedTrends,
        (row) => row.dau ?? 0,
        momentumWindowSize,
      ),
    [sortedAppOpenedTrends],
  );

  const siteWauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedAppOpenedTrends,
        (row) => row.wau ?? 0,
        momentumWindowSize,
      ),
    [sortedAppOpenedTrends],
  );

  const siteMauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedAppOpenedTrends,
        (row) => row.mau ?? 0,
        momentumWindowSize,
      ),
    [sortedAppOpenedTrends],
  );

  const productDauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedProductTrends,
        (row) => row.dau ?? 0,
        momentumWindowSize,
      ),
    [sortedProductTrends],
  );

  const productWauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedProductTrends,
        (row) => row.wau ?? 0,
        momentumWindowSize,
      ),
    [sortedProductTrends],
  );

  const productMauStats = useMemo(
    () =>
      computeRollingAverage(
        sortedProductTrends,
        (row) => row.mau ?? 0,
        momentumWindowSize,
      ),
    [sortedProductTrends],
  );

  const activationStats = useMemo(
    () =>
      computeRollingAverage(
        sortedActivationTrends,
        (row: any) => row.rate ?? null,
        momentumWindowSize,
      ),
    [sortedActivationTrends],
  );

  // Momentum metrics
  const siteMomentumMetrics = useMemo<MomentumMetric[]>(
    () => [
      {
        id: 'site_dau',
        label: 'DAU',
        stats: siteDauStats,
        formatter: (value) => formatMetricValue(value, 0),
      },
      {
        id: 'site_wau',
        label: 'WAU',
        stats: siteWauStats,
        formatter: (value) => formatMetricValue(value, 0),
      },
      {
        id: 'site_mau',
        label: 'MAU',
        stats: siteMauStats,
        formatter: (value) => formatMetricValue(value, 0),
      },
    ],
    [siteDauStats, siteMauStats, siteWauStats],
  );

  const productMomentumMetrics = useMemo<MomentumMetric[]>(
    () => [
      {
        id: 'product_dau',
        label: 'DAU',
        stats: productDauStats,
        formatter: (value) => formatMetricValue(value, 0),
      },
      {
        id: 'product_wau',
        label: 'WAU',
        stats: productWauStats,
        formatter: (value) => formatMetricValue(value, 0),
      },
      {
        id: 'product_mau',
        label: 'MAU',
        stats: productMauStats,
        formatter: (value) => formatMetricValue(value, 0),
      },
    ],
    [productDauStats, productMauStats, productWauStats],
  );

  const activationMomentumMetrics = useMemo<MomentumMetric[]>(
    () => [
      {
        id: 'activation',
        label: 'Activation rate',
        stats: activationStats,
        formatter: (value) =>
          typeof value === 'number' ? `${value.toFixed(1)}%` : '—',
      },
    ],
    [activationStats],
  );

  const buildMomentumRows = useCallback(
    (metrics: MomentumMetric[]): MomentumRow[] =>
      metrics.map((metric) => {
        const { change, percentChange } = computeWeekOverWeekChange(
          metric.stats.average,
          metric.stats.previousAverage,
        );
        return { ...metric, change, percentChange };
      }),
    [],
  );

  const siteMomentumRows = useMemo(
    () => buildMomentumRows(siteMomentumMetrics),
    [buildMomentumRows, siteMomentumMetrics],
  );

  const productMomentumRows = useMemo(
    () => buildMomentumRows(productMomentumMetrics),
    [buildMomentumRows, productMomentumMetrics],
  );

  const activationMomentumRows = useMemo(
    () => buildMomentumRows(activationMomentumMetrics),
    [buildMomentumRows, activationMomentumMetrics],
  );

  // Filtered insights
  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      const typeMatch =
        insightTypeFilter === 'all' || insight.type === insightTypeFilter;
      const categoryMatch =
        insightCategoryFilter === 'all' ||
        insight.category === insightCategoryFilter;
      return typeMatch && categoryMatch;
    });
  }, [insights, insightTypeFilter, insightCategoryFilter]);

  // Retention cohort
  const latestRetentionCohort = useMemo(
    () => engagementOverview?.retention?.cohorts?.slice(-1).at(0) ?? null,
    [engagementOverview?.retention?.cohorts],
  );

  const retentionStability = useMemo(
    () => ({
      returning7: activity?.returning_wau ?? null,
      returning14: activity?.returning_mau ?? null,
      avgWau: wauStats.average,
      avgMau: mauStats.average,
    }),
    [activity?.returning_wau, activity?.returning_mau, wauStats, mauStats],
  );

  // Cohort age buckets
  const cohortAgeBuckets = useMemo(() => {
    const rows = cohorts?.cohorts ?? [];
    if (!rows.length) return { last7: 0, last14: 0, olderThan30: 0 };
    const lastWeek = rows.slice(-1);
    const lastTwo = rows.slice(-2);
    const coverWeeks = 5;
    const older = rows.slice(0, Math.max(0, rows.length - coverWeeks));
    const sumRows = (items: typeof rows) =>
      items.reduce(
        (sum: number, row: (typeof rows)[0]) => sum + (row.day0 ?? 0),
        0,
      );
    return {
      last7: sumRows(lastWeek),
      last14: sumRows(lastTwo),
      olderThan30: sumRows(older),
    };
  }, [cohorts?.cohorts]);

  // Overall retention (exclude immature cohorts where day7/day30 is null)
  const overallD7Retention = useMemo(() => {
    const rows = cohorts?.cohorts ?? [];
    const mature = rows.filter((r: any) => r.day7 != null);
    if (!mature.length) return 0;
    const totalUsers = mature.reduce(
      (sum: number, r: any) => sum + (r.day0 || 0),
      0,
    );
    if (totalUsers === 0) return 0;
    const weightedSum = mature.reduce(
      (sum: number, r: any) => sum + (r.day7 / 100) * (r.day0 || 0),
      0,
    );
    return weightedSum / totalUsers;
  }, [cohorts?.cohorts]);

  const overallD30Retention = useMemo(() => {
    const rows = cohorts?.cohorts ?? [];
    const mature = rows.filter((r: any) => r.day30 != null);
    if (!mature.length) return 0;
    const totalUsers = mature.reduce(
      (sum: number, r: any) => sum + (r.day0 || 0),
      0,
    );
    if (totalUsers === 0) return 0;
    const weightedSum = mature.reduce(
      (sum: number, r: any) => sum + (r.day30 / 100) * (r.day0 || 0),
      0,
    );
    return weightedSum / totalUsers;
  }, [cohorts?.cohorts]);

  const cohortAgePercents = useMemo(() => {
    const totalMau = activity?.mau ?? 0;
    if (totalMau <= 0) {
      return { last7: null, last14: null, olderThan30: null };
    }
    const { last7, last14, olderThan30 } = cohortAgeBuckets;
    return {
      last7: Number(((last7 / totalMau) * 100).toFixed(1)),
      last14: Number(((last14 / totalMau) * 100).toFixed(1)),
      olderThan30: Number(
        Math.min((olderThan30 / totalMau) * 100, 100).toFixed(1),
      ),
    };
  }, [activity?.mau, cohortAgeBuckets]);

  // Trust funnel steps
  const trustFunnelSteps = useMemo(() => {
    const featureUsers =
      featureUsage?.features?.reduce(
        (sum, feature) => sum + (feature.unique_users ?? 0),
        0,
      ) ?? 0;
    return [
      {
        label: 'First Grimoire view',
        value: formatPercent(grimoireHealth?.grimoire_entry_rate, 1),
      },
      {
        label: 'Return within 7 days',
        value: formatPercent(latestRetentionCohort?.day_7 ?? undefined, 1),
      },
      {
        label: 'App open',
        value:
          typeof activity?.app_opened_dau === 'number'
            ? activity.app_opened_dau.toLocaleString()
            : 'N/A',
      },
      {
        label: 'Second app open',
        value:
          typeof activity?.returning_dau === 'number'
            ? activity.returning_dau.toLocaleString()
            : 'N/A',
      },
      {
        label: 'Signup',
        value:
          typeof userGrowth?.totalSignups === 'number'
            ? userGrowth.totalSignups.toLocaleString()
            : 'N/A',
      },
      {
        label: 'Product feature used',
        value: featureUsers > 0 ? featureUsers.toLocaleString() : 'N/A',
      },
    ];
  }, [
    grimoireHealth?.grimoire_entry_rate,
    latestRetentionCohort?.day_7,
    activity?.app_opened_dau,
    activity?.returning_dau,
    userGrowth?.totalSignups,
    featureUsage?.features,
  ]);

  // Notification types
  const notificationTypes: Array<{
    key: string;
    label: string;
    data: NotificationBucket;
  }> = useMemo(
    () =>
      ['cosmic_pulse', 'moon_circle', 'weekly_report']
        .map((key) => ({
          key,
          label: key.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          data: (notifications?.[key] as NotificationBucket | undefined) ?? {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            open_rate: 0,
            click_through_rate: 0,
          },
        }))
        .filter((item) => item.data),
    [notifications],
  );

  return {
    // Window dates
    wauWindowStart,
    mauWindowStart,

    // Activity data
    activityUsageData,
    productDauToWauRatio,
    productWauToMauRatio,
    grimoireShareRatio,
    productReturningPercent,
    returningReferrerBreakdown,

    // App metrics
    appDau,
    appWau,
    appMau,

    // Engaged metrics
    engagedDau,
    engagedWau,
    engagedMau,
    engagementRate,

    // Audit metrics
    appVisits,
    canonicalIdentities,
    appVisitsPerUser,

    // Reach metrics
    reachDau,
    reachWau,
    reachMau,

    // Grimoire metrics
    grimoireMau,
    grimoireOnlyMau,
    totalAccountsEver,

    // All-time metrics
    allTimeTotalProductUsers,
    allTimeReturningUsers,
    allTimeMedianActiveDays,

    // Product MAU and growth
    productMauCurrentWeek,
    productMauGrowth,

    // Conversion
    conversionStages,
    conversionDropOff,

    // Integrity
    productMaError,
    integrityWarnings,

    // Feature usage
    pageviewsPerReachUser,
    heatmapData,

    // Attribution
    totalAttributedUsers,
    organicAttributedUsers,
    organicAttributionPercentage,

    // Subscription 30d
    signup30dSignups,
    signup30dSubscriptions,
    signup30dRate,

    // Activation
    activationTotalSignups,
    activationActivatedUsers,
    activationRateValue,
    activationRateDisplay,

    // CTA and lifecycle
    ctaHubs,
    ctaLocationMetrics,
    lifecycleStateEntries,

    // UI state
    engagedMatchesApp,
    chartSeries,

    // Primary cards
    activeSubscribers,
    primaryCards,

    // Sorted trends
    sortedActivityTrends,
    sortedAppOpenedTrends,
    sortedProductTrends,
    sortedActivationTrends,

    // Momentum
    siteMomentumRows,
    productMomentumRows,
    activationMomentumRows,

    // Insights
    filteredInsights,

    // Retention
    latestRetentionCohort,
    retentionStability,
    cohortAgeBuckets,
    overallD7Retention,
    overallD30Retention,
    cohortAgePercents,

    // Trust funnel
    trustFunnelSteps,

    // Notifications
    notificationTypes,

    // Export formatters
    formatCurrency,
    formatPercent,
    formatPercentOrDash,
    describeTrend,
  };
}
