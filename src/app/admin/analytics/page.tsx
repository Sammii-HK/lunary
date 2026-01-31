'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  CalendarRange,
  CheckCircle,
  DollarSign,
  Download,
  Info,
  Loader2,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import { MetricsCard } from '@/components/admin/MetricsCard';
import { ConversionFunnel } from '@/components/admin/ConversionFunnel';
import { SearchConsoleMetrics } from '@/components/admin/SearchConsoleMetrics';
import { MiniStat } from '@/components/admin/MiniStat';
import { InsightCard } from '@/components/admin/InsightCard';
import { StatSection } from '@/components/admin/StatSection';
import { MetricTable } from '@/components/admin/MetricTable';
import { HealthMetricCard, StatusBadge, BadgeStatus } from '@/components/admin';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsageChartSeries } from '@/components/charts/UsageChart';
import type { AuditInfo } from '@/lib/analytics/kpis';
import {
  describeTrend as describeTrendUtil,
  computeWeekOverWeekChange as computeWoWChange,
  formatMetricValue as formatMetric,
  computePercent,
  formatDateInput,
  shiftDateInput,
} from '@/lib/analytics/utils';

type ActivityTrend = {
  date: string;
  dau: number;
  wau: number;
  mau: number;
};

type ActivityResponse = {
  dau: number;
  wau: number;
  mau: number;
  app_opened_dau: number;
  app_opened_wau: number;
  app_opened_mau: number;
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
  product_trends: ActivityTrend[];
  signed_in_product_dau: number;
  signed_in_product_wau: number;
  signed_in_product_mau: number;
  signed_in_product_trends: ActivityTrend[];
  signed_in_product_users: number;
  signed_in_product_returning_users: number;
  signed_in_product_avg_sessions_per_user: number;
  content_mau_grimoire: number;
  grimoire_only_mau: number;
  total_accounts: number;
};

type ConversionResponse = {
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

type NotificationBucket = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  open_rate: number;
  click_through_rate: number;
};

type NotificationResponse = {
  cosmic_pulse?: NotificationBucket;
  moon_circle?: NotificationBucket;
  weekly_report?: NotificationBucket;
  overall_open_rate: number;
  overall_click_through_rate: number;
  [key: string]: NotificationBucket | number | undefined;
};

type FeatureUsageResponse = {
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

type AttributionSummary = {
  totalUsers: number;
  organicUsers: number;
  organicPercentage: number;
};

type AttributionResponse = {
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

const ACTIVATION_FEATURES = [
  { event: 'horoscope_viewed', label: 'Horoscope Viewed' },
  { event: 'personalized_horoscope_viewed', label: 'Personalized Horoscope' },
  { event: 'personalized_tarot_viewed', label: 'Personalized Tarot' },
];

type CtaConversionHub = {
  hub: string;
  total_clicks: number;
  unique_clickers: number;
  signups_7d: number;
  conversion_rate: number;
};

type CtaConversionResponse = {
  window_days: number;
  hubs: CtaConversionHub[];
};

type Subscription30dResponse = {
  window_days: number;
  signups: number;
  conversions: number;
  conversion_rate: number;
};

type EngagementOverviewResponse = {
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

type FeatureAdoptionResponse = {
  mau: number;
  features: Array<{
    event_type: string;
    users: number;
    adoption_rate: number;
  }>;
};

type GrimoireHealthResponse = {
  grimoire_entry_rate: number;
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

type ConversionInfluenceResponse = {
  subscription_users: number;
  subscription_users_with_grimoire_before: number;
  subscription_with_grimoire_before_rate: number;
  median_days_first_grimoire_to_signup: number | null;
  median_days_signup_to_subscription: number | null;
};

type IntentionBreakdownItem = {
  intention: string;
  count: number;
  percentage: number;
};

type IntentionBreakdown = IntentionBreakdownItem[];

type RollingAverage = {
  average: number | null;
  previousAverage: number | null;
};

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

const describeTrend = describeTrendUtil;
const computeWeekOverWeekChange = computeWoWChange;
const formatMetricValue = formatMetric;

const DEFAULT_RANGE_DAYS = 30;
const activitySeries: UsageChartSeries[] = [
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

const productSeries: UsageChartSeries[] = [
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

// formatDateInput and shiftDateInput imported from @/lib/analytics/utils

const INTENTION_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  confidence: 'Confidence',
  calm: 'Calm',
  insight: 'Insight',
};

// computePercent imported from @/lib/analytics/utils

export default function AnalyticsPage() {
  const today = useMemo(() => new Date(), []);
  const defaultEnd = formatDateInput(today);
  const defaultStart = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DEFAULT_RANGE_DAYS - 1));
    return formatDateInput(d);
  })();

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'day',
  );
  const [showProductSeries, setShowProductSeries] = useState(false);
  const [includeAudit, setIncludeAudit] = useState(false);
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
  const [subscription30d, setSubscription30d] =
    useState<Subscription30dResponse | null>(null);
  const [attribution, setAttribution] = useState<AttributionResponse | null>(
    null,
  );

  const wauWindowStart = useMemo(() => shiftDateInput(endDate, -6), [endDate]);
  const mauWindowStart = useMemo(() => shiftDateInput(endDate, -29), [endDate]);
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
  const [intentionBreakdown, setIntentionBreakdown] =
    useState<IntentionBreakdown | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [insightTypeFilter, setInsightTypeFilter] = useState<string>('all');
  const [insightCategoryFilter, setInsightCategoryFilter] =
    useState<string>('all');
  const [metricSnapshots, setMetricSnapshots] = useState<{
    weekly: any[];
    monthly: any[];
  }>({ weekly: [], monthly: [] });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const appDau = activity?.app_opened_dau ?? 0;
  const appWau = activity?.app_opened_wau ?? 0;
  const appMau = activity?.app_opened_mau ?? 0;

  const engagedDau = activity?.dau ?? 0;
  const engagedWau = activity?.wau ?? 0;
  const engagedMau = activity?.mau ?? 0;

  const engagementRate = appMau > 0 ? (engagedMau / appMau) * 100 : null;

  const appVisits = engagementOverview?.audit?.raw_events_count ?? null;
  const canonicalIdentities =
    engagementOverview?.audit?.distinct_canonical_identities ?? null;
  const appVisitsPerUser =
    appVisits !== null && appMau > 0 ? appVisits / appMau : null;

  const reachDau = activity?.sitewide_dau ?? 0;
  const reachWau = activity?.sitewide_wau ?? 0;
  const reachMau = activity?.sitewide_mau ?? 0;

  const grimoireMau = activity?.content_mau_grimoire ?? 0;
  const grimoireOnlyMau = activity?.grimoire_only_mau ?? 0;
  const totalAccountsEver = activity?.total_accounts ?? 0;
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

  const productMauCurrentWeek = activity?.signed_in_product_mau ?? 0;
  const productMauGrowth = userGrowth?.growthRate ?? 0;

  // const returningStickinessDau =
  //   engagementOverview?.mau && engagementOverview.mau > 0
  //     ? (engagementOverview.returning_dau / engagementOverview.mau) * 100
  //     : null;
  // const returningStickinessWau =
  //   engagementOverview?.mau && engagementOverview.mau > 0
  //     ? (engagementOverview.returning_wau / engagementOverview.mau) * 100
  //     : null;

  const conversionStages =
    conversions?.funnel &&
    typeof conversions.funnel.free_users === 'number' &&
    typeof conversions.funnel.trial_users === 'number' &&
    typeof conversions.funnel.paid_users === 'number'
      ? [
          { label: 'Free users', value: conversions.funnel.free_users },
          { label: 'Trial users', value: conversions.funnel.trial_users },
          { label: 'Paid users', value: conversions.funnel.paid_users },
        ]
      : [];
  const conversionDropOff = conversions?.funnel?.drop_off_points ?? [];

  const productMaError = (activity?.signed_in_product_mau ?? 0) > appMau;
  const integrityWarnings: string[] = [];
  if (appMau < appWau) {
    integrityWarnings.push(
      'App MAU is below WAU, indicating overlapping windows need review.',
    );
  }
  if (appWau < appDau) {
    integrityWarnings.push(
      'App WAU is below DAU, which suggests a window miscount.',
    );
  }
  if (engagedMau > appMau) {
    integrityWarnings.push(
      'Engaged MAU exceeds App MAU; key action totals surpass app opens.',
    );
  }
  if (productMaError) {
    integrityWarnings.push(
      'Signed-in Product MAU exceeds App MAU; review the canonical `app_opened` audit.',
    );
  }

  const pageviewFeature = featureUsage?.features?.find(
    (feature) => feature.feature === '$pageview',
  );
  const pageviewsPerReachUser =
    pageviewFeature && reachMau > 0
      ? pageviewFeature.total_events / reachMau
      : null;

  const attributionSummary = attribution?.summary;
  const totalAttributedUsers = attributionSummary?.totalUsers ?? 0;
  const organicAttributedUsers = attributionSummary?.organicUsers ?? 0;
  const organicAttributionPercentage =
    typeof attributionSummary?.organicPercentage === 'number'
      ? `${attributionSummary.organicPercentage.toFixed(1)}%`
      : '0%';

  const signup30dSignups = subscription30d?.signups ?? 0;
  const signup30dSubscriptions = subscription30d?.conversions ?? 0;
  const signup30dRate =
    signup30dSignups > 0
      ? `${(subscription30d?.conversion_rate ?? 0).toFixed(2)}%`
      : 'N/A';

  const activationTotalSignups = activation?.totalSignups ?? 0;
  const activationActivatedUsers = activation?.activatedUsers ?? 0;
  const activationRateValue =
    typeof activation?.activationRate === 'number'
      ? activation.activationRate
      : 0;
  const activationRateDisplay =
    activationTotalSignups > 0 ? `${activationRateValue.toFixed(2)}%` : 'N/A';

  const ctaHubs = ctaConversions?.hubs ?? [];
  const lifecycleStateEntries = subscriptionLifecycle?.states
    ? Object.entries(subscriptionLifecycle.states as Record<string, number>)
    : [];
  const engagedMatchesApp =
    engagedDau === appDau && engagedWau === appWau && engagedMau === appMau;

  const chartSeries = showProductSeries
    ? [...activitySeries, ...productSeries]
    : activitySeries;

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = `start_date=${startDate}&end_date=${endDate}`;
    const debugParam = includeAudit ? '&debug=1' : '';
    const cacheBuster = `&_t=${Date.now()}`; // Force fresh data

    try {
      // Batch requests to avoid overwhelming the database connection pool
      // Previously: 23 parallel requests caused 48-131s timeouts and connection errors

      // Batch 1: Core metrics (6 requests)
      const [
        activityRes,
        engagementOverviewRes,
        conversionsRes,
        userGrowthRes,
        activationRes,
        cohortsRes,
      ] = await Promise.all([
        fetch(
          `/api/admin/analytics/dau-wau-mau?${queryParams}&granularity=${granularity}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/engagement-overview?${queryParams}${debugParam}${cacheBuster}`,
        ),
        fetch(`/api/admin/analytics/conversions?${queryParams}${cacheBuster}`),
        fetch(
          `/api/admin/analytics/user-growth?${queryParams}&granularity=${granularity}${cacheBuster}`,
        ),
        fetch(`/api/admin/analytics/activation?${queryParams}${cacheBuster}`),
        fetch(
          `/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12${cacheBuster}`,
        ),
      ]);

      // Batch 2: Feature metrics (6 requests)
      const [
        featureAdoptionRes,
        featureUsageRes,
        grimoireHealthRes,
        conversionInfluenceRes,
        successMetricsRes,
        intentionBreakdownRes,
      ] = await Promise.all([
        fetch(
          `/api/admin/analytics/feature-adoption?${queryParams}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/feature-usage?${queryParams}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/grimoire-health?${queryParams}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/conversion-influence?${queryParams}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/success-metrics?${queryParams}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/intention-breakdown?${queryParams}${cacheBuster}`,
        ),
      ]);

      // Batch 3: Subscription & monetization (6 requests)
      const [
        subscription30dRes,
        subscriptionLifecycleRes,
        planBreakdownRes,
        ctaConversionsRes,
        apiCostsRes,
        userSegmentsRes,
      ] = await Promise.all([
        fetch(
          `/api/admin/analytics/subscription-30d?${queryParams}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/subscription-lifecycle?${queryParams}&stripe=1${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/plan-breakdown?${queryParams}${cacheBuster}`,
        ),
        fetch(
          `/api/admin/analytics/cta-conversions?${queryParams}${cacheBuster}`,
        ),
        fetch(`/api/admin/analytics/api-costs?${queryParams}${cacheBuster}`),
        fetch(
          `/api/admin/analytics/user-segments?${queryParams}${cacheBuster}`,
        ),
      ]);

      // Batch 4: External & misc (5 requests)
      const [
        notificationsRes,
        attributionRes,
        discordRes,
        searchConsoleRes,
        insightsRes,
      ] = await Promise.all([
        fetch(
          `/api/admin/analytics/notifications?${queryParams}${cacheBuster}`,
        ),
        fetch(`/api/admin/analytics/attribution?${queryParams}${cacheBuster}`),
        fetch(`/api/analytics/discord-interactions?range=7d${cacheBuster}`),
        fetch(
          `/api/admin/analytics/search-console?${queryParams}${cacheBuster}`,
        ),
        fetch(`/api/admin/analytics/insights?${queryParams}${cacheBuster}`),
      ]);

      const errors: string[] = [];

      if (activityRes.ok) {
        setActivity(await activityRes.json());
      } else {
        errors.push('DAU/WAU/MAU');
      }

      if (engagementOverviewRes.ok) {
        const data = await engagementOverviewRes.json();
        setEngagementOverview(data);
      } else {
        errors.push('Engagement overview');
      }

      if (featureAdoptionRes.ok) {
        const data = await featureAdoptionRes.json();
        setFeatureAdoption(data);
      } else {
        errors.push('Feature adoption');
      }

      if (grimoireHealthRes.ok) {
        const data = await grimoireHealthRes.json();
        setGrimoireHealth(data);
      } else {
        errors.push('Grimoire health');
      }

      if (conversionInfluenceRes.ok) {
        const data = await conversionInfluenceRes.json();
        setConversionInfluence(data);
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

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
        // Snapshots are supplementary — fail silently
      }
    };
    fetchSnapshots();
  }, []);

  const downloadCsv = (rows: string[][], filename: string) => {
    const escapeCsvCell = (value: unknown): string => {
      const text = value === null || value === undefined ? '' : String(value);
      if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };
    const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  const handleExportSnapshot = () => {
    const rows: string[][] = [
      ['Metric', 'Value', 'Period'],
      ['Generated', new Date().toISOString(), `${startDate} to ${endDate}`],
    ];

    rows.push(
      ['New Signups', String(engagementOverview?.new_users ?? 0), 'Range'],
      ['WAU', String(engagementOverview?.wau ?? 0), 'Range'],
      ['MAU', String(engagementOverview?.mau ?? 0), 'Range'],
      ['DAU', String(engagementOverview?.dau ?? 0), 'Range'],
      ['New Trials', String(conversions?.total_conversions ?? 0), 'Range'],
      [
        'Conversion Rate',
        `${(conversions?.conversion_rate ?? 0).toFixed(2)}%`,
        'Range',
      ],
      [
        'Trial Conversion Rate',
        `${(conversions?.trial_conversion_rate ?? 0).toFixed(2)}%`,
        'Range',
      ],
      [
        'Activation Rate',
        `${(activation?.activationRate ?? 0).toFixed(2)}%`,
        'Range',
      ],
      [
        'Active Subscribers',
        String(planBreakdown?.totalActivePaid ?? 0),
        'Current',
      ],
      ['MRR', `$${Number(planBreakdown?.totalMrr ?? 0).toFixed(2)}`, 'Current'],
      [
        'Churn Rate',
        `${Number(successMetrics?.churn_rate ?? 0).toFixed(2)}%`,
        'Range',
      ],
    );

    if (activity?.retention) {
      rows.push(
        [
          'D1 Retention',
          activity.retention.day_1 != null
            ? `${activity.retention.day_1.toFixed(1)}%`
            : 'N/A',
          'Range',
        ],
        [
          'D7 Retention',
          activity.retention.day_7 != null
            ? `${activity.retention.day_7.toFixed(1)}%`
            : 'N/A',
          'Range',
        ],
        [
          'D30 Retention',
          activity.retention.day_30 != null
            ? `${activity.retention.day_30.toFixed(1)}%`
            : 'N/A',
          'Range',
        ],
      );
    }

    downloadCsv(
      rows,
      `lunary-investor-snapshot-${startDate}-to-${endDate}.csv`,
    );
    setShowExportMenu(false);
  };

  const handleExportWeeklyComparison = () => {
    const snapshots = metricSnapshots.weekly;
    if (!snapshots.length) return;

    const rows: string[][] = [
      [
        'Week',
        'Signups',
        'Signups Δ%',
        'WAU',
        'WAU Δ%',
        'New Trials',
        'New Paying',
        'Active Subs',
        'Active Subs Δ%',
        'MRR',
        'MRR Δ%',
        'Activation %',
        'Churn %',
        'Trial→Paid %',
      ],
    ];

    snapshots.forEach((s: any, i: number) => {
      const prev = snapshots[i + 1];
      const pct = (cur: number, p: number | undefined) =>
        p != null && p > 0 ? `${(((cur - p) / p) * 100).toFixed(1)}%` : '';

      rows.push([
        s.period_key,
        String(s.new_signups),
        pct(s.new_signups, prev?.new_signups),
        String(s.wau),
        pct(s.wau, prev?.wau),
        String(s.new_trials),
        String(s.new_paying_subscribers),
        String(s.active_subscribers),
        pct(s.active_subscribers, prev?.active_subscribers),
        `$${Number(s.mrr).toFixed(2)}`,
        pct(s.mrr, prev?.mrr),
        `${s.activation_rate}%`,
        `${s.churn_rate}%`,
        `${s.trial_to_paid_conversion_rate}%`,
      ]);
    });

    downloadCsv(rows, 'lunary-weekly-comparison.csv');
    setShowExportMenu(false);
  };

  const handleExportMonthlyComparison = () => {
    const snapshots = metricSnapshots.monthly;
    if (!snapshots.length) return;

    const rows: string[][] = [
      [
        'Month',
        'Signups',
        'Signups Δ%',
        'MAU',
        'MAU Δ%',
        'New Trials',
        'New Paying',
        'Active Subs',
        'Active Subs Δ%',
        'MRR',
        'MRR Δ%',
        'Activation %',
        'Churn %',
        'Trial→Paid %',
      ],
    ];

    snapshots.forEach((s: any, i: number) => {
      const prev = snapshots[i + 1];
      const pct = (cur: number, p: number | undefined) =>
        p != null && p > 0 ? `${(((cur - p) / p) * 100).toFixed(1)}%` : '';

      rows.push([
        s.period_key,
        String(s.new_signups),
        pct(s.new_signups, prev?.new_signups),
        String(s.wau),
        pct(s.wau, prev?.wau),
        String(s.new_trials),
        String(s.new_paying_subscribers),
        String(s.active_subscribers),
        pct(s.active_subscribers, prev?.active_subscribers),
        `$${Number(s.mrr).toFixed(2)}`,
        pct(s.mrr, prev?.mrr),
        `${s.activation_rate}%`,
        `${s.churn_rate}%`,
        `${s.trial_to_paid_conversion_rate}%`,
      ]);
    });

    downloadCsv(rows, 'lunary-monthly-comparison.csv');
    setShowExportMenu(false);
  };

  // Full operational export for the details tab
  const handleExport = () => {
    const escapeCsvCell = (value: unknown): string => {
      const text = value === null || value === undefined ? '' : String(value);
      if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const normalize = (value: unknown) =>
      value === null || value === undefined ? 'N/A' : value;

    const addRow = (section: string, metric: string, ...values: unknown[]) => {
      rows.push([
        section,
        metric,
        ...values.map((value) => normalize(value) as string),
      ]);
    };

    const rows: string[][] = [['Section', 'Metric', 'Value']];
    rows.push(
      ['Export', 'Start date', startDate],
      ['Export', 'End date', endDate],
      ['Export', 'Granularity', granularity],
      ['Export', 'Generated at (UTC)', new Date().toISOString()],
    );

    const primaryKpis = [
      [
        'Monthly Recurring Revenue (MRR)',
        formatCurrency(successMetrics?.monthly_recurring_revenue?.value),
      ],
      [
        'Annual Recurring Revenue (ARR)',
        formatCurrency(successMetrics?.annual_recurring_revenue?.value),
      ],
      ['Active Subscribers', activeSubscribers],
      ['Conversion Rate', formatPercent(conversions?.conversion_rate, 1)],
      ['Activation Rate', formatPercent(activation?.activationRate, 2)],
      ['Growth Rate', formatPercent(userGrowth?.growthRate, 1)],
      ['Monthly Active Users (MAU)', engagementOverview?.mau],
      ['Weekly Active Users (WAU)', engagementOverview?.wau],
      ['Daily Active Users (DAU)', engagementOverview?.dau],
    ];
    primaryKpis.forEach(([metric, value]) =>
      addRow('Primary KPIs', metric, value),
    );

    if (successMetrics) {
      const exportSuccessMetric = (
        label: string,
        value: unknown,
        trend?: string,
        change?: number,
        note?: string,
      ) => {
        addRow('Success Metrics', label, value, trend, change, note);
      };

      exportSuccessMetric(
        'Daily Active Users',
        successMetrics.daily_active_users.value.toLocaleString(),
        successMetrics.daily_active_users.trend,
        successMetrics.daily_active_users.change,
      );
      exportSuccessMetric(
        'Weekly Returning Users',
        successMetrics.weekly_returning_users.value.toLocaleString(),
        successMetrics.weekly_returning_users.trend,
        successMetrics.weekly_returning_users.change,
      );
      exportSuccessMetric(
        'Conversion Rate',
        `${successMetrics.conversion_rate.value.toFixed(2)}%`,
        successMetrics.conversion_rate.trend,
        successMetrics.conversion_rate.change,
        `Target: ${successMetrics.conversion_rate.target?.min ?? 'N/A'}–${successMetrics.conversion_rate.target?.max ?? 'N/A'}%`,
      );
      exportSuccessMetric(
        'Search Impressions + Clicks',
        `${successMetrics.search_impressions_clicks.impressions.toLocaleString()} impressions, ${successMetrics.search_impressions_clicks.clicks.toLocaleString()} clicks`,
        successMetrics.search_impressions_clicks.trend,
        successMetrics.search_impressions_clicks.change,
        successMetrics.search_impressions_clicks.note,
      );
      exportSuccessMetric(
        'Monthly Recurring Revenue',
        formatCurrency(successMetrics.monthly_recurring_revenue.value),
        successMetrics.monthly_recurring_revenue.trend,
        successMetrics.monthly_recurring_revenue.change,
      );
      exportSuccessMetric(
        'Annual Recurring Revenue',
        formatCurrency(successMetrics.annual_recurring_revenue.value),
        successMetrics.annual_recurring_revenue.trend,
        successMetrics.annual_recurring_revenue.change,
      );
      exportSuccessMetric(
        'Active Subscriptions',
        successMetrics.active_subscriptions.value.toLocaleString(),
        successMetrics.active_subscriptions.trend,
        successMetrics.active_subscriptions.change,
      );
      exportSuccessMetric(
        'Active Entitlements',
        successMetrics.active_entitlements.value.toLocaleString(),
        'stable',
        Number(
          typeof successMetrics.active_entitlements.duplicate_rate === 'number'
            ? successMetrics.active_entitlements.duplicate_rate.toFixed(1)
            : 0,
        ),
        `${successMetrics.active_entitlements.duplicates} duplicate subscriptions`,
      );
      exportSuccessMetric(
        'Paying Customers',
        successMetrics.paying_customers.value.toLocaleString(),
        'stable',
        0,
        'Unique paying customers',
      );
      exportSuccessMetric(
        'Subscription Cancels',
        successMetrics.subscription_cancels.toLocaleString(),
        'down',
        0,
        'Cancellations logged this period',
      );
      exportSuccessMetric(
        'Churn Rate',
        formatPercent(successMetrics.churn_rate, 1),
        successMetrics.churn_rate > 0 ? 'down' : 'stable',
        0,
        `${successMetrics.churned_customers} churned / ${successMetrics.starting_paying_customers} starting`,
      );
      exportSuccessMetric(
        'Activation → Return (48h)',
        `${successMetrics.activation_to_return.value.toFixed(1)}%`,
        'up',
        0,
        `${successMetrics.activation_to_return.returning}/${successMetrics.activation_to_return.total} returned`,
      );
      if (successMetrics.arpu) {
        exportSuccessMetric(
          'ARPU',
          formatCurrency(successMetrics.arpu.value),
          successMetrics.arpu.trend,
          successMetrics.arpu.change,
        );
      }
      exportSuccessMetric(
        'Trial Conversion Rate',
        `${successMetrics.trial_conversion_rate.value.toFixed(2)}%`,
        successMetrics.trial_conversion_rate.trend,
        successMetrics.trial_conversion_rate.change,
      );
      exportSuccessMetric(
        'AI Chat Messages',
        successMetrics.ai_chat_messages.value.toLocaleString(),
        successMetrics.ai_chat_messages.trend,
        successMetrics.ai_chat_messages.change,
      );
      exportSuccessMetric(
        'Push Subscribers',
        successMetrics.substack_subscribers.value.toLocaleString(),
        successMetrics.substack_subscribers.trend,
        successMetrics.substack_subscribers.change,
      );
    }

    if (activation) {
      const formattedActivationRate =
        typeof activation.activationRate === 'number'
          ? `${activation.activationRate.toFixed(2)}%`
          : 'N/A';
      addRow('Activation', 'Activation Rate', formattedActivationRate);
      addRow('Activation', 'Activated Users', activation.activatedUsers);
      addRow('Activation', 'Total Signups', activation.totalSignups);
      if (activation.activationBreakdown) {
        Object.entries(activation.activationBreakdown).forEach(
          ([feature, count]) => {
            const breakdown =
              activation.activationBreakdownByPlan?.[feature] || {};
            const freeCount = breakdown.free ?? 0;
            const paidCount = breakdown.paid ?? 0;
            const unknownCount = breakdown.unknown ?? 0;
            addRow(
              'Activation',
              `Feature "${feature}" activations`,
              count,
              `Free: ${freeCount} · Paid: ${paidCount}${
                unknownCount > 0 ? ` · Unknown: ${unknownCount}` : ''
              }`,
            );
          },
        );
      }
    }

    if (subscriptionLifecycle) {
      Object.entries(subscriptionLifecycle.states || {}).forEach(
        ([status, count]) => {
          const title =
            status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
          addRow('Subscription Lifecycle', `${title} updates`, count);
        },
      );
      addRow(
        'Subscription Lifecycle',
        'Average Subscription Duration',
        `${subscriptionLifecycle.avgDurationDays.toFixed(1)} days`,
      );
      if (subscriptionLifecycle.churnRate !== undefined) {
        addRow(
          'Subscription Lifecycle',
          'Churn Rate',
          `${subscriptionLifecycle.churnRate.toFixed(2)}%`,
        );
      }
    }

    if (planBreakdown?.planBreakdown?.length) {
      planBreakdown.planBreakdown.forEach((plan: any) => {
        addRow(
          'Plan Breakdown',
          plan.plan,
          `Subscriptions: ${plan.count}`,
          `Active: ${plan.active}`,
          `MRR: $${Number(plan.mrr ?? 0).toFixed(2)}`,
          `Share: ${Number(plan.percentage ?? 0).toFixed(1)}%`,
        );
      });
    }

    if (apiCosts) {
      addRow(
        'API Costs',
        'Total API Costs',
        `$${apiCosts.totalCost.toFixed(2)}`,
      );
      addRow(
        'API Costs',
        'Cost per User',
        `$${apiCosts.costPerUser.toFixed(2)}`,
      );
      addRow(
        'API Costs',
        'Revenue / Cost Ratio',
        apiCosts.revenueCostRatio.toFixed(2),
      );
      addRow(
        'API Costs',
        'Total Generations',
        apiCosts.totalGenerations.toLocaleString(),
      );
      addRow(
        'API Costs',
        'Unique Users',
        apiCosts.uniqueUsers.toLocaleString(),
      );
      addRow(
        'API Costs',
        'Cost per Session',
        `$${apiCosts.costPerSession.toFixed(4)}`,
      );
    }

    if (activity) {
      rows.push(
        [
          'Activity',
          'DAU (App Page Views)',
          String(activity.sitewide_dau ?? 0),
        ],
        [
          'Activity',
          'WAU (App Page Views)',
          String(activity.sitewide_wau ?? 0),
        ],
        [
          'Activity',
          'MAU (App Page Views)',
          String(activity.sitewide_mau ?? 0),
        ],
        ['Activity', 'DAU (Engaged)', String(activity.dau)],
        ['Activity', 'DAU (App Opened)', String(activity.app_opened_dau ?? 0)],
        [
          'Activity',
          'Returning DAU (signed-in overlap)',
          String(activity.returning_dau ?? 0),
        ],
        [
          'Activity',
          'Returning WAU (7-day overlap)',
          String(activity.returning_wau ?? 0),
        ],
        [
          'Activity',
          'Returning MAU (30-day overlap)',
          String(activity.returning_mau ?? 0),
        ],
        ['Activity', 'WAU', String(activity.wau)],
        ['Activity', 'MAU', String(activity.mau)],
        [
          'Activity',
          'Churn Rate',
          `${Number(activity.churn_rate ?? 0).toFixed(2)}%`,
        ],
        [
          'Product Usage',
          'Product Users (signed-in)',
          String(activity.signed_in_product_users ?? 0),
        ],
        [
          'Product Usage',
          'Returning Product Users (signed-in)',
          String(activity.signed_in_product_returning_users ?? 0),
        ],
        [
          'Product Usage',
          'Avg Sessions per User (signed-in)',
          Number(activity.signed_in_product_avg_sessions_per_user ?? 0).toFixed(
            2,
          ),
        ],
        [
          'Product Usage',
          'Product DAU (signed-in)',
          String(activity.signed_in_product_dau ?? 0),
        ],
        [
          'Product Usage',
          'Product WAU (signed-in)',
          String(activity.signed_in_product_wau ?? 0),
        ],
        [
          'Product Usage',
          'Product MAU (signed-in)',
          String(activity.signed_in_product_mau ?? 0),
        ],
      );
    }

    if (engagementOverview) {
      rows.push(
        [
          'Engagement Overview',
          'DAU (end day)',
          String(engagementOverview.dau ?? 0),
        ],
        [
          'Engagement Overview',
          'Returning DAU (end day)',
          String(engagementOverview.returning_dau ?? 0),
        ],
        [
          'Engagement Overview',
          'WAU (rolling)',
          String(engagementOverview.wau ?? 0),
        ],
        [
          'Engagement Overview',
          'MAU (rolling)',
          String(engagementOverview.mau ?? 0),
        ],
        [
          'Engagement Overview',
          'Stickiness (DAU/MAU)',
          `${Number(engagementOverview.stickiness_dau_mau ?? 0).toFixed(2)}%`,
        ],
        [
          'Engagement Overview',
          'Stickiness (WAU/MAU)',
          `${Number(engagementOverview.stickiness_wau_mau ?? 0).toFixed(2)}%`,
        ],
        [
          'Engagement Overview',
          'New users (range)',
          String(engagementOverview.new_users ?? 0),
        ],
        [
          'Engagement Overview',
          'Returning users (range)',
          String(engagementOverview.returning_users_range ?? 0),
        ],
      );
    }

    if (conversions) {
      rows.push(
        [
          'Conversions',
          'Total Conversions',
          String(conversions.total_conversions),
        ],
        [
          'Conversions',
          'Conversion Rate',
          `${conversions.conversion_rate.toFixed(2)}%`,
        ],
        [
          'Conversions',
          'Trial Conversion Rate',
          `${conversions.trial_conversion_rate.toFixed(2)}%`,
        ],
      );
    }

    if (ctaConversions && ctaConversions.hubs.length > 0) {
      ctaConversions.hubs.forEach((hub) => {
        rows.push(
          [
            'CTA Conversions',
            `${hub.hub} - Clickers`,
            String(hub.unique_clickers ?? 0),
          ],
          [
            'CTA Conversions',
            `${hub.hub} - Signups (${ctaConversions.window_days}d)`,
            String(hub.signups_7d ?? 0),
          ],
          [
            'CTA Conversions',
            `${hub.hub} - Conversion Rate`,
            `${Number(hub.conversion_rate ?? 0).toFixed(2)}%`,
          ],
        );
      });
    }

    if (subscription30d) {
      rows.push(
        [
          'Conversions',
          `Subscriptions within ${subscription30d.window_days}d`,
          String(subscription30d.conversions ?? 0),
        ],
        [
          'Conversions',
          `Signup → Subscription (${subscription30d.window_days}d)`,
          `${Number(subscription30d.conversion_rate ?? 0).toFixed(2)}%`,
        ],
      );
    }

    if (intentionBreakdown && intentionBreakdown.length > 0) {
      const totalIntentions =
        intentionBreakdown.reduce((sum, item) => sum + item.count, 0) ?? 0;
      rows.push(['Onboarding', 'Intentions saved', String(totalIntentions)]);
      intentionBreakdown.forEach((item) => {
        rows.push([
          'Intentions',
          INTENTION_LABELS[item.intention] ?? item.intention,
          `${item.count} (${item.percentage.toFixed(2)}%)`,
        ]);
      });
    }

    if (notifications) {
      rows.push(
        [
          'Notifications',
          'Overall Open Rate',
          `${Number(notifications.overall_open_rate ?? 0).toFixed(2)}%`,
        ],
        [
          'Notifications',
          'Overall CTR',
          `${Number(notifications.overall_click_through_rate ?? 0).toFixed(
            2,
          )}%`,
        ],
      );
    }

    if (featureUsage) {
      featureUsage.features.slice(0, 5).forEach((feature) => {
        const featureName =
          typeof feature.feature === 'string' && feature.feature.length > 0
            ? feature.feature
            : 'unknown_feature';
        const totalEvents =
          typeof feature.total_events === 'number' &&
          Number.isFinite(feature.total_events)
            ? feature.total_events
            : 0;
        rows.push(['Feature Usage', featureName, String(totalEvents)]);
      });
    }

    // Append daily trend tables (as separate sections)
    if (engagementOverview?.dau_trend?.length) {
      rows.push(['', '', '']);
      rows.push(['Daily Trend', 'date', 'dau', 'returning_dau']);
      engagementOverview.dau_trend.forEach((point) => {
        rows.push([
          'Daily Trend',
          point.date,
          String(point.dau ?? 0),
          String(point.returning_dau ?? 0),
        ]);
      });
    }

    if (activity?.trends?.length) {
      rows.push(['', '', '']);
      rows.push(['Activity Trend', 'date', 'dau', 'wau', 'mau']);
      activity.trends.forEach((point) => {
        rows.push([
          'Activity Trend',
          point.date,
          String(point.dau ?? 0),
          String(point.wau ?? 0),
          String(point.mau ?? 0),
        ]);
      });
    }

    if (activity?.product_trends?.length) {
      rows.push(['', '', '']);
      rows.push(['Product Trend', 'date', 'dau', 'wau', 'mau']);
      activity.product_trends.forEach((point) => {
        rows.push([
          'Product Trend',
          point.date,
          String(point.dau ?? 0),
          String(point.wau ?? 0),
          String(point.mau ?? 0),
        ]);
      });
    }

    if (activity?.signed_in_product_trends?.length) {
      rows.push(['', '', '']);
      rows.push(['Signed-in Product Trend', 'date', 'dau', 'wau', 'mau']);
      activity.signed_in_product_trends.forEach((point) => {
        rows.push([
          'Signed-in Product Trend',
          point.date,
          String(point.dau ?? 0),
          String(point.wau ?? 0),
          String(point.mau ?? 0),
        ]);
      });
    }

    if (featureUsage?.heatmap?.length) {
      rows.push(['', '', '']);
      rows.push(['Feature Heatmap', 'date', 'feature', 'count']);
      featureUsage.heatmap.forEach((row) => {
        const date = row.date;
        const features = row.features ?? {};
        Object.entries(features).forEach(([feature, count]) => {
          rows.push(['Feature Heatmap', date, feature, String(count ?? 0)]);
        });
      });
    }

    downloadCsv(rows, `lunary-analytics-full-${startDate}-to-${endDate}.csv`);
  };

  const heatmapData = useMemo(() => {
    if (!featureUsage) return [];
    const recent = featureUsage.heatmap.slice(-7);
    // Get top 5 features, excluding $pageview or putting it last
    const meaningfulFeatures = featureUsage.features.filter(
      (f) => f.feature !== '$pageview',
    );
    const topFeatures = [
      ...meaningfulFeatures.slice(0, 4).map((f) => f.feature),
      // Include $pageview only if we have space
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

  const formatCurrency = (value?: number) =>
    typeof value === 'number'
      ? `$${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : 'N/A';

  const formatPercent = (value?: number, digits = 1) =>
    typeof value === 'number' ? `${value.toFixed(digits)}%` : 'N/A';

  const formatPercentOrDash = (value?: number | null, digits = 2) =>
    typeof value === 'number' ? `${value.toFixed(digits)}%` : '—';

  const activeSubscribers =
    successMetrics?.active_entitlements?.value ??
    successMetrics?.active_subscriptions?.value ??
    conversions?.funnel.paid_users ??
    subscriptionLifecycle?.states?.active ??
    0;

  type PrimaryCard = {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  };

  const primaryCards: PrimaryCard[] = [
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
      title: 'Active Subscribers',
      value: activeSubscribers,
      subtitle: 'Paid + free subscribers',
    },
    {
      title: 'Conversion Rate',
      value: formatPercent(conversions?.conversion_rate, 1),
      subtitle: 'Free → Paid',
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
  ];

  const momentumWindowSize = 7;

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
        ? [...activation.trends].sort((a, b) =>
            a.date.localeCompare(b.date, undefined, { numeric: true }),
          )
        : [],
    [activation?.trends],
  );

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
        (row) => row.rate ?? null,
        momentumWindowSize,
      ),
    [sortedActivationTrends],
  );

  type MomentumMetric = {
    id: string;
    label: string;
    stats: RollingAverage;
    decimals?: number;
    formatter: (value: number | null) => string;
  };

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
    (metrics: MomentumMetric[]) =>
      metrics.map((metric) => {
        const { change, percentChange } = computeWeekOverWeekChange(
          metric.stats.average,
          metric.stats.previousAverage,
        );
        return { ...metric, change, percentChange };
      }),
    [],
  );

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

  const handleExportInsights = useCallback(() => {
    const escapeCsvCell = (value: unknown): string => {
      const text = value === null || value === undefined ? '' : String(value);
      if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows: string[][] = [
      [
        'Priority',
        'Type',
        'Category',
        'Message',
        'Action',
        'Metric Label',
        'Metric Value',
      ],
    ];

    insights.forEach((insight) => {
      rows.push([
        escapeCsvCell(insight.priority),
        escapeCsvCell(insight.type),
        escapeCsvCell(insight.category),
        escapeCsvCell(insight.message),
        escapeCsvCell(insight.action || ''),
        escapeCsvCell(insight.metric?.label || ''),
        escapeCsvCell(insight.metric?.value?.toString() || ''),
      ]);
    });

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `analytics-insights-${startDate}-to-${endDate}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [insights, startDate, endDate]);

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

  const overallD7Retention = useMemo(() => {
    const rows = cohorts?.cohorts ?? [];
    if (!rows.length) return 0;
    const totalUsers = rows.reduce(
      (sum: number, r: any) => sum + (r.day0 || 0),
      0,
    );
    if (totalUsers === 0) return 0;
    const weightedSum = rows.reduce(
      (sum: number, r: any) => sum + ((r.day7 || 0) / 100) * (r.day0 || 0),
      0,
    );
    return weightedSum / totalUsers;
  }, [cohorts?.cohorts]);

  const overallD30Retention = useMemo(() => {
    const rows = cohorts?.cohorts ?? [];
    if (!rows.length) return 0;
    const totalUsers = rows.reduce(
      (sum: number, r: any) => sum + (r.day0 || 0),
      0,
    );
    if (totalUsers === 0) return 0;
    const weightedSum = rows.reduce(
      (sum: number, r: any) => sum + ((r.day30 || 0) / 100) * (r.day0 || 0),
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

  const notificationTypes: Array<{
    key: string;
    label: string;
    data: NotificationBucket;
  }> = ['cosmic_pulse', 'moon_circle', 'weekly_report']
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
    .filter((item) => item.data);

  if (
    loading &&
    !activity &&
    !conversions &&
    !notifications &&
    !featureUsage &&
    !successMetrics
  ) {
    return (
      <div className='flex min-h-screen items-center justify-center text-zinc-400'>
        <div className='flex items-center gap-3'>
          <Loader2 className='h-5 w-5 animate-spin text-lunary-primary-400' />
          Loading analytics…
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-12 px-4 pb-16 pt-8 md:px-6'>
      <header className='flex flex-col gap-6 border-b border-zinc-800/50 pb-8 lg:flex-row lg:items-start lg:justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-xs uppercase tracking-wider text-lunary-primary-400/70'>
            <Activity className='h-4 w-4' />
            Analytics
          </div>
          <h1 className='text-2xl font-light tracking-tight text-white md:text-3xl'>
            Investor Analytics
          </h1>
          <p className='text-sm text-zinc-400'>
            Focused snapshot of traction, revenue, and conversion health.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='flex items-center gap-2 rounded-xl border border-zinc-800/30 bg-zinc-900/20 px-3 py-2'>
            <CalendarRange className='h-3.5 w-3.5 text-zinc-400' />
            <div className='flex items-center gap-1.5 text-xs text-zinc-400'>
              <input
                type='date'
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className='rounded border-0 bg-transparent px-1.5 py-0.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0'
              />
              <span className='text-zinc-600'>→</span>
              <input
                type='date'
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className='rounded border-0 bg-transparent px-1.5 py-0.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0'
              />
            </div>
          </div>

          <select
            value={granularity}
            onChange={(event) =>
              setGranularity(event.target.value as 'day' | 'week' | 'month')
            }
            className='rounded-xl border border-zinc-800/30 bg-zinc-900/20 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-lunary-primary-9500'
          >
            <option value='day'>Daily</option>
            <option value='week'>Weekly</option>
            <option value='month'>Monthly</option>
          </select>

          <div ref={exportMenuRef} className='relative'>
            <Button
              variant='lunary-soft'
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className='h-3.5 w-3.5' />
              Export
            </Button>
            {showExportMenu && (
              <div className='absolute top-full left-0 z-10 mt-1 w-56 rounded-lg border border-zinc-800/40 bg-zinc-900 shadow-lg'>
                <button
                  className='w-full px-4 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/50 first:rounded-t-lg'
                  onClick={handleExportSnapshot}
                >
                  Investor Snapshot
                </button>
                <button
                  className='w-full px-4 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/50'
                  onClick={handleExportWeeklyComparison}
                  disabled={!metricSnapshots.weekly.length}
                >
                  Weekly Comparison
                </button>
                <button
                  className='w-full px-4 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/50'
                  onClick={handleExportMonthlyComparison}
                  disabled={!metricSnapshots.monthly.length}
                >
                  Monthly Comparison
                </button>
                <button
                  className='w-full px-4 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/50 last:rounded-b-lg'
                  onClick={() => {
                    handleExport();
                    setShowExportMenu(false);
                  }}
                >
                  Full Overview
                </button>
              </div>
            )}
          </div>

          <Button
            variant='ghost'
            onClick={() => setIncludeAudit((prev) => !prev)}
          >
            {includeAudit ? 'Hide audit' : 'Show audit'}
          </Button>

          <Button onClick={fetchAnalytics} variant='outline'>
            {loading ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <Activity className='h-3.5 w-3.5' />
            )}
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <div className='rounded-lg border border-lunary-error-800/30 bg-lunary-error-950/20 px-4 py-3 text-sm text-lunary-error-300'>
          {error}
        </div>
      )}

      <Tabs defaultValue='snapshot' className='space-y-10'>
        <TabsList className='w-full flex-wrap justify-start gap-2 rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-1'>
          <TabsTrigger
            value='snapshot'
            className='text-xs flex items-center gap-2'
          >
            <BarChart3 className='h-4 w-4' />
            Investor Snapshot
          </TabsTrigger>
          <TabsTrigger
            value='details'
            className='text-xs flex items-center gap-2'
          >
            <Settings className='h-4 w-4' />
            Operational Detail
          </TabsTrigger>
        </TabsList>

        <TabsContent value='snapshot' className='space-y-10'>
          {/* Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5 text-lunary-primary' />
                Health Snapshot
              </CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <HealthMetricCard
                  icon={TrendingUp}
                  label='Product Growth'
                  value={productMauCurrentWeek}
                  unit='MAU'
                  trend={
                    productMauGrowth > 0
                      ? `+${productMauGrowth.toFixed(1)}% vs last week`
                      : `${productMauGrowth.toFixed(1)}% vs last week`
                  }
                  status={
                    productMauGrowth > 5
                      ? 'excellent'
                      : productMauGrowth > 0
                        ? 'good'
                        : 'warning'
                  }
                />

                <HealthMetricCard
                  icon={DollarSign}
                  label='Monthly Revenue'
                  value={`$${planBreakdown?.totalMrr?.toLocaleString() || 0}`}
                  unit='MRR'
                  status='good'
                  description='Recurring revenue'
                />

                <HealthMetricCard
                  icon={RefreshCw}
                  label='User Retention'
                  value={`${(overallD7Retention * 100).toFixed(0)}%`}
                  unit='D7'
                  status={overallD7Retention > 0.3 ? 'excellent' : 'good'}
                  description='7-day retention'
                />

                {/* D30 retention — uncomment when cohort size is large enough to measure
                <HealthMetricCard
                  icon={RefreshCw}
                  label='User Retention'
                  value={`${(overallD30Retention * 100).toFixed(0)}%`}
                  unit='D30'
                  status={overallD30Retention > 0.5 ? 'excellent' : 'good'}
                  description='30-day retention'
                />
                */}

                <HealthMetricCard
                  icon={CheckCircle}
                  label='Activation Rate'
                  value={`${(activation?.activationRate ?? 0).toFixed(1)}%`}
                  status={
                    (activation?.activationRate ?? 0) > 30
                      ? 'excellent'
                      : 'good'
                  }
                  description='24h activation'
                />
              </div>
            </CardContent>
          </Card>

          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Quick Glance
              </h2>
              <p className='text-xs text-zinc-500'>
                Primary revenue, conversion, and growth signals for investors.
              </p>
            </div>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {primaryCards.map((card) => (
                <MetricsCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  change={card.change}
                  trend={card.trend}
                  subtitle={card.subtitle}
                />
              ))}
            </div>
          </section>

          {insights.length > 0 && (
            <section className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-sm font-medium text-zinc-200 flex items-center gap-2'>
                    <Sparkles className='h-4 w-4 text-lunary-accent' />
                    Actionable Insights
                  </h2>
                  <p className='text-xs text-zinc-500'>
                    Auto-generated recommendations based on your metrics.
                  </p>
                </div>
                <Button
                  onClick={handleExportInsights}
                  variant='outline'
                  size='sm'
                  className='gap-2'
                >
                  <Download className='h-4 w-4' />
                  Export Insights
                </Button>
              </div>
              <div className='flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3'>
                <span className='text-xs font-medium text-zinc-400'>
                  Filter by:
                </span>
                <div className='flex gap-2'>
                  <select
                    value={insightTypeFilter}
                    onChange={(e) => setInsightTypeFilter(e.target.value)}
                    className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500'
                  >
                    <option value='all'>All Types</option>
                    <option value='positive'>Positive</option>
                    <option value='warning'>Warning</option>
                    <option value='critical'>Critical</option>
                    <option value='info'>Info</option>
                  </select>
                  <select
                    value={insightCategoryFilter}
                    onChange={(e) => setInsightCategoryFilter(e.target.value)}
                    className='rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-lunary-primary-500'
                  >
                    <option value='all'>All Categories</option>
                    <option value='retention'>Retention</option>
                    <option value='product'>Product</option>
                    <option value='growth'>Growth</option>
                    <option value='engagement'>Engagement</option>
                    <option value='revenue'>Revenue</option>
                    <option value='quality'>Quality</option>
                  </select>
                </div>
                <span className='ml-auto text-xs text-zinc-500'>
                  {filteredInsights.length} of {insights.length} insights
                </span>
              </div>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {filteredInsights.length > 0 ? (
                  filteredInsights.map((insight, idx) => (
                    <InsightCard key={idx} insight={insight} />
                  ))
                ) : (
                  <div className='col-span-2 rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-4 py-6 text-center text-sm text-zinc-400'>
                    No insights match the selected filters.
                  </div>
                )}
              </div>
            </section>
          )}

          {(productMaError || integrityWarnings.length > 0) && (
            <div className='space-y-2'>
              {productMaError && (
                <div className='rounded-xl border border-lunary-error-700/40 bg-lunary-error-950/40 px-4 py-3 text-sm text-lunary-error-200'>
                  Signed-in Product MAU exceeds App MAU. Review the canonical
                  `app_opened` audit by toggling Show audit.
                </div>
              )}
              {integrityWarnings.length > 0 && (
                <div className='rounded-xl border border-lunary-warning-600/40 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-200'>
                  <p className='text-xs text-zinc-400'>
                    Integrity checks flag the following:
                  </p>
                  <ul className='mt-2 space-y-1 text-xs text-zinc-300'>
                    {integrityWarnings.map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <section className='space-y-3'>
            <StatSection
              eyebrow='Core App Usage'
              title='App Active Users'
              description='Measures who opened the app in the selected window.'
              footerText='App Active Users (DAU/WAU/MAU) are deduplicated by canonical identity per UTC window.'
            >
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <MiniStat
                  label='App DAU'
                  value={appDau}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-primary-300' />
                  }
                />
                <MiniStat
                  label='App WAU'
                  value={appWau}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='App MAU'
                  value={appMau}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='New users (range)'
                  value={engagementOverview?.new_users ?? 0}
                  icon={
                    <Target className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                {appVisits !== null && (
                  <MiniStat
                    label='App Visits'
                    value={appVisits}
                    icon={
                      <Loader2 className='h-5 w-5 text-lunary-accent-300' />
                    }
                  />
                )}
              </div>
              {appVisits !== null && (
                <div className='grid gap-4 md:grid-cols-2'>
                  <MiniStat
                    label='App visits per App user'
                    value={
                      appVisitsPerUser !== null
                        ? appVisitsPerUser.toFixed(2)
                        : '—'
                    }
                    icon={
                      <Target className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  {includeAudit && canonicalIdentities !== null && (
                    <MiniStat
                      label='Canonical identities (audit)'
                      value={canonicalIdentities}
                      icon={
                        <Sparkles className='h-5 w-5 text-lunary-success-300' />
                      }
                    />
                  )}
                </div>
              )}
            </StatSection>
          </section>

          <section className='space-y-3'>
            <StatSection
              eyebrow='Engagement Health'
              title='Engaged users & stickiness'
              description='Key actions vs. returns inside the same canonical window.'
            >
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <MiniStat
                  label='Engaged DAU'
                  value={engagedDau}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-primary-300' />
                  }
                />
                <MiniStat
                  label='Engaged WAU'
                  value={engagedWau}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='Engaged MAU'
                  value={engagedMau}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='Engaged Rate (MAU)'
                  value={formatPercent(engagementRate ?? undefined, 1)}
                  icon={<Sparkles className='h-5 w-5 text-lunary-accent-300' />}
                />
              </div>
              {engagedMatchesApp && (
                <p className='text-xs text-zinc-500'>
                  Engaged Users currently matches App opens for this window.
                  Check key-action event set.
                </p>
              )}
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <MiniStat
                  label='Stickiness (DAU/MAU)'
                  value={formatPercent(
                    engagementOverview?.stickiness_dau_mau,
                    2,
                  )}
                  icon={
                    <Sparkles className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='Stickiness (WAU/MAU)'
                  value={formatPercent(
                    engagementOverview?.stickiness_wau_mau,
                    2,
                  )}
                  icon={
                    <Sparkles className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='Avg active days'
                  value={
                    typeof engagementOverview?.avg_active_days_per_user ===
                    'number'
                      ? engagementOverview.avg_active_days_per_user.toFixed(2)
                      : '—'
                  }
                  icon={<Target className='h-5 w-5 text-lunary-primary-300' />}
                />
                <MiniStat
                  label='Returning Users (range)'
                  value={engagementOverview?.returning_users_range ?? 0}
                  icon={<Activity className='h-5 w-5 text-lunary-accent-300' />}
                />
              </div>
            </StatSection>
          </section>

          <section className='space-y-3'>
            <StatSection
              eyebrow='Retention & return'
              title='Returning canonical users'
              description='D1 + WAU/MAU overlap inspect deduped identity recurrence.'
              footerText='Returning Users (range) need 2+ distinct active days in the window. WAU/MAU overlap compares the current period to the prior window.'
            >
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <MiniStat
                  label='Returning DAU (D1)'
                  value={engagementOverview?.returning_dau ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='Returning WAU overlap'
                  value={engagementOverview?.returning_wau ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='Returning MAU overlap'
                  value={engagementOverview?.returning_mau ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-primary-300' />
                  }
                />
                <MiniStat
                  label='Returning Users (range)'
                  value={engagementOverview?.returning_users_range ?? 0}
                  icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
                />
              </div>
            </StatSection>
          </section>

          <section className='space-y-3'>
            <StatSection
              eyebrow='Returning referrer breakdown'
              title='Where returning users come from'
              description='Uses the most recent app_opened metadata for returning users.'
              footerText='Segments use the most recent app_opened metadata (referrer, UTM source, or origin type) for returning users (2+ active days).'
            >
              <div className='grid gap-4 md:grid-cols-3'>
                <MiniStat
                  label='Organic returning'
                  value={returningReferrerBreakdown?.organic_returning ?? 0}
                  icon={
                    <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                  }
                />
                <MiniStat
                  label='Direct / brand returning'
                  value={returningReferrerBreakdown?.direct_returning ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='Internal returning'
                  value={returningReferrerBreakdown?.internal_returning ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
              </div>
            </StatSection>
          </section>

          <section className='space-y-3'>
            <StatSection
              eyebrow='Active days distribution (range)'
              title='Distinct active days per user'
              description='Users grouped by distinct active days in the selected range.'
            >
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
                <MiniStat
                  label='1 day'
                  value={
                    engagementOverview?.active_days_distribution?.['1'] ?? 0
                  }
                  icon={
                    <Activity className='h-5 w-5 text-lunary-primary-300' />
                  }
                />
                <MiniStat
                  label='2-3 days'
                  value={
                    engagementOverview?.active_days_distribution?.['2-3'] ?? 0
                  }
                  icon={
                    <Activity className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='4-7 days'
                  value={
                    engagementOverview?.active_days_distribution?.['4-7'] ?? 0
                  }
                  icon={
                    <Activity className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='8-14 days'
                  value={
                    engagementOverview?.active_days_distribution?.['8-14'] ?? 0
                  }
                  icon={<Activity className='h-5 w-5 text-lunary-accent-300' />}
                />
                <MiniStat
                  label='15+ days'
                  value={
                    engagementOverview?.active_days_distribution?.['15+'] ?? 0
                  }
                  icon={<Target className='h-5 w-5 text-lunary-primary-300' />}
                />
              </div>
            </StatSection>
          </section>

          <section className='space-y-3'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Content & Funnel
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Grimoire metrics are scoped to `grimoire_viewed`.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
                  <MiniStat
                    label='Grimoire Entry Rate'
                    value={
                      typeof grimoireHealth?.grimoire_entry_rate === 'number'
                        ? `${grimoireHealth.grimoire_entry_rate.toFixed(2)}%`
                        : '—'
                    }
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Grimoire MAU'
                    value={grimoireMau}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='Grimoire-only MAU'
                    value={grimoireOnlyMau}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                  <MiniStat
                    label='Views per Grimoire user'
                    value={
                      typeof grimoireHealth?.grimoire_views_per_active_user ===
                      'number'
                        ? grimoireHealth.grimoire_views_per_active_user.toFixed(
                            2,
                          )
                        : '—'
                    }
                    icon={
                      <Activity className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Grimoire return rate'
                    value={
                      typeof grimoireHealth?.return_to_grimoire_rate ===
                      'number'
                        ? `${grimoireHealth.return_to_grimoire_rate.toFixed(2)}%`
                        : '—'
                    }
                    icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
                  />
                </div>
                <div className='rounded-xl border border-zinc-800/30 bg-zinc-950/50 p-4 text-sm text-zinc-300'>
                  <p className='text-xs uppercase tracking-wider text-zinc-400'>
                    Conversion influence
                  </p>
                  <div className='mt-2 space-y-1'>
                    <div className='flex items-center justify-between'>
                      <span>Subscriptions in range</span>
                      <span>
                        {(
                          conversionInfluence?.subscription_users ?? 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Had Grimoire view before subscription</span>
                      <span>
                        {(
                          conversionInfluence?.subscription_users_with_grimoire_before ??
                          0
                        ).toLocaleString()}
                        (
                        {(
                          conversionInfluence?.subscription_with_grimoire_before_rate ??
                          0
                        ).toFixed(2)}
                        %)
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Median days (first Grimoire → signup)</span>
                      <span>
                        {conversionInfluence?.median_days_first_grimoire_to_signup ??
                          'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Median days (signup → subscription)</span>
                      <span>
                        {conversionInfluence?.median_days_signup_to_subscription ??
                          'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='space-y-3'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Reach (page_viewed)
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Reach measures visits. App usage measures product engagement.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  <MiniStat
                    label='Reach DAU'
                    value={reachDau}
                    icon={<Bell className='h-5 w-5 text-lunary-primary-300' />}
                  />
                  <MiniStat
                    label='Reach WAU'
                    value={reachWau}
                    icon={<Bell className='h-5 w-5 text-lunary-success-300' />}
                  />
                  <MiniStat
                    label='Reach MAU'
                    value={reachMau}
                    icon={
                      <Bell className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                </div>
                <p className='text-xs text-zinc-500'>
                  Reach counts distinct canonical identities with at least one
                  `page_viewed` event in the window.
                </p>
                <p className='text-xs text-zinc-500'>
                  Reach measures visits, while App usage tracks product
                  engagement via `app_opened`.
                </p>
                {pageviewsPerReachUser !== null && (
                  <p className='text-xs text-zinc-500'>
                    Page views per Reach user:{' '}
                    {pageviewsPerReachUser.toFixed(1)}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Growth History */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-lunary-primary' />
                  Growth History
                </CardTitle>
                <CardDescription>
                  Stored weekly & monthly snapshots for comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue='weekly' className='space-y-4'>
                  <TabsList className='rounded-lg border border-zinc-800/40 bg-zinc-900/20'>
                    <TabsTrigger value='weekly' className='text-xs'>
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value='monthly' className='text-xs'>
                      Monthly
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='weekly'>
                    {metricSnapshots.weekly.length === 0 ? (
                      <p className='text-sm text-zinc-500'>
                        No weekly snapshots yet. They are generated every Monday
                        at 02:00 UTC.
                      </p>
                    ) : (
                      <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                          <thead>
                            <tr className='border-b border-zinc-800'>
                              <th className='py-2 text-left text-zinc-400'>
                                Week
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Signups
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                WAU
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Trials
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                New Paying
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Active Subs
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                MRR
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Activation
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Churn
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {metricSnapshots.weekly.map((s: any, i: number) => {
                              const prev = metricSnapshots.weekly[i + 1];
                              const delta = (
                                current: number,
                                previous: number | undefined,
                              ) =>
                                previous != null && previous > 0
                                  ? ((current - previous) / previous) * 100
                                  : null;
                              const fmtDelta = (val: number | null) =>
                                val != null
                                  ? `${val > 0 ? '+' : ''}${val.toFixed(0)}%`
                                  : '';
                              return (
                                <tr
                                  key={s.period_key}
                                  className='border-b border-zinc-800/40'
                                >
                                  <td className='py-2 font-medium text-zinc-300'>
                                    {s.period_key}
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.new_signups}
                                    <span
                                      className={`ml-1 text-xs ${(delta(s.new_signups, prev?.new_signups) ?? 0) >= 0 ? 'text-lunary-success-400' : 'text-lunary-error-400'}`}
                                    >
                                      {fmtDelta(
                                        delta(s.new_signups, prev?.new_signups),
                                      )}
                                    </span>
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.wau}
                                    <span
                                      className={`ml-1 text-xs ${(delta(s.wau, prev?.wau) ?? 0) >= 0 ? 'text-lunary-success-400' : 'text-lunary-error-400'}`}
                                    >
                                      {fmtDelta(delta(s.wau, prev?.wau))}
                                    </span>
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.new_trials}
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.new_paying_subscribers}
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.active_subscribers}
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.mrr != null
                                      ? `$${s.mrr % 1 ? s.mrr.toFixed(1) : s.mrr}`
                                      : '—'}
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.activation_rate != null
                                      ? `${s.activation_rate}%`
                                      : '—'}
                                  </td>
                                  <td className='py-2 text-right text-zinc-300'>
                                    {s.churn_rate != null
                                      ? `${s.churn_rate}%`
                                      : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value='monthly'>
                    {metricSnapshots.monthly.length === 0 ? (
                      <p className='text-sm text-zinc-500'>
                        No monthly snapshots yet. They are generated on the 2nd
                        of each month at 03:00 UTC.
                      </p>
                    ) : (
                      <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                          <thead>
                            <tr className='border-b border-zinc-800'>
                              <th className='py-2 text-left text-zinc-400'>
                                Month
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Signups
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                MAU
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Trials
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                New Paying
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Active Subs
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                MRR
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Activation
                              </th>
                              <th className='py-2 text-right text-zinc-400'>
                                Churn
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {metricSnapshots.monthly.map(
                              (s: any, i: number) => {
                                const prev = metricSnapshots.monthly[i + 1];
                                const delta = (
                                  current: number,
                                  previous: number | undefined,
                                ) =>
                                  previous != null && previous > 0
                                    ? ((current - previous) / previous) * 100
                                    : null;
                                const fmtDelta = (val: number | null) =>
                                  val != null
                                    ? `${val > 0 ? '+' : ''}${val.toFixed(0)}%`
                                    : '';
                                return (
                                  <tr
                                    key={s.period_key}
                                    className='border-b border-zinc-800/40'
                                  >
                                    <td className='py-2 font-medium text-zinc-300'>
                                      {s.period_key}
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.new_signups}
                                      <span
                                        className={`ml-1 text-xs ${(delta(s.new_signups, prev?.new_signups) ?? 0) >= 0 ? 'text-lunary-success-400' : 'text-lunary-error-400'}`}
                                      >
                                        {fmtDelta(
                                          delta(
                                            s.new_signups,
                                            prev?.new_signups,
                                          ),
                                        )}
                                      </span>
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.wau}
                                      <span
                                        className={`ml-1 text-xs ${(delta(s.wau, prev?.wau) ?? 0) >= 0 ? 'text-lunary-success-400' : 'text-lunary-error-400'}`}
                                      >
                                        {fmtDelta(delta(s.wau, prev?.wau))}
                                      </span>
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.new_trials}
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.new_paying_subscribers}
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.active_subscribers}
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.mrr != null
                                        ? `$${s.mrr % 1 ? s.mrr.toFixed(1) : s.mrr}`
                                        : '—'}
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.activation_rate != null
                                        ? `${s.activation_rate}%`
                                        : '—'}
                                    </td>
                                    <td className='py-2 text-right text-zinc-300'>
                                      {s.churn_rate != null
                                        ? `${s.churn_rate}%`
                                        : '—'}
                                    </td>
                                  </tr>
                                );
                              },
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
        <TabsContent value='details' className='space-y-10'>
          {/* MAU Type Explainer */}
          <Card className='border-lunary-primary-700/40 bg-lunary-primary-950/20'>
            <CardContent className='pt-6'>
              <div className='flex items-start gap-3'>
                <Users className='mt-0.5 h-5 w-5 flex-shrink-0 text-lunary-primary-300' />
                <div className='space-y-3'>
                  <h3 className='font-medium text-lunary-primary-200'>
                    Understanding MAU Types
                  </h3>
                  <div className='space-y-2 text-sm text-zinc-300'>
                    <div className='flex items-start gap-2'>
                      <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-lunary-success-300' />
                      <div>
                        <strong className='text-lunary-success-200'>
                          Product MAU ({productMauCurrentWeek}):
                        </strong>{' '}
                        Signed-in users who used app features like horoscope,
                        tarot, chart viewing. This is our{' '}
                        <strong>north star metric</strong> for product
                        engagement.
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Activity className='mt-0.5 h-4 w-4 flex-shrink-0 text-lunary-secondary-300' />
                      <div>
                        <strong className='text-lunary-secondary-200'>
                          App MAU:
                        </strong>{' '}
                        All users who opened the app, including logged-out users
                        browsing grimoire content.
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-lunary-accent-300' />
                      <div>
                        <strong className='text-lunary-accent-200'>
                          Grimoire MAU:
                        </strong>{' '}
                        Users who only viewed grimoire educational content
                        without signing in.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {integrityWarnings.length > 0 && (
            <div className='rounded-xl border border-lunary-warning-600/40 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-200'>
              <p className='text-xs text-zinc-400 font-medium'>
                Integrity warnings
              </p>
              <ul className='mt-2 space-y-1 text-xs text-zinc-300'>
                {integrityWarnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
          <section className='space-y-3'>
            <StatSection
              eyebrow='Total usage'
              title='All-time product footprint'
              description='Totals as of the selected range end.'
            >
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <MiniStat
                  label='Total accounts (all-time)'
                  value={totalAccountsEver.toLocaleString()}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-primary-300' />
                  }
                />
                <MiniStat
                  label='Product users (signed-in, range)'
                  value={allTimeTotalProductUsers}
                  icon={
                    <Sparkles className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='Total returning users (all-time)'
                  value={allTimeReturningUsers}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='Avg active days per product user (range)'
                  value={
                    typeof allTimeMedianActiveDays === 'number'
                      ? allTimeMedianActiveDays.toFixed(2)
                      : '—'
                  }
                  icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
                />
              </div>
            </StatSection>
          </section>
          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                SEO & Attribution
              </h2>
              <p className='text-xs text-zinc-500'>
                First-touch attribution tracking for organic and marketing
                channels.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  First-touch attribution
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Total attributed users (first-touch source logged at signup).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <MiniStat
                    label='Total Attributed Users'
                    value={totalAttributedUsers}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Organic (SEO) Users'
                    value={organicAttributedUsers}
                    icon={
                      <Target className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='Organic % of attributed signups'
                    value={organicAttributionPercentage}
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                </div>
              </CardContent>
            </Card>
            <div className='grid gap-4 lg:grid-cols-2'>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Traffic Source Breakdown
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Where your users are coming from.
                  </CardDescription>
                </CardHeader>
                <CardContent className='overflow-x-auto'>
                  <MetricTable
                    columns={[
                      { label: 'Source', key: 'source', type: 'text' },
                      {
                        label: 'Users',
                        key: 'user_count',
                        type: 'number',
                        align: 'right',
                      },
                      {
                        label: 'Share',
                        key: 'percentage',
                        type: 'percentage',
                        align: 'right',
                        decimals: 1,
                      },
                    ]}
                    data={attribution?.sourceBreakdown ?? []}
                    emptyMessage='No attribution breakdown for this range.'
                  />
                </CardContent>
              </Card>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Conversion by Source
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Which sources convert to paid users.
                  </CardDescription>
                </CardHeader>
                <CardContent className='overflow-x-auto'>
                  <MetricTable
                    columns={[
                      { label: 'Source', key: 'source', type: 'text' },
                      {
                        label: 'Paid / Total',
                        key: 'ratio',
                        type: 'text',
                        align: 'right',
                        render: (_, row) =>
                          `${Number(row.paying_users || 0).toLocaleString()} / ${Number(row.total_users || 0).toLocaleString()}`,
                      },
                      {
                        label: 'Rate',
                        key: 'conversion_rate',
                        type: 'percentage',
                        align: 'right',
                        decimals: 1,
                      },
                    ]}
                    data={attribution?.conversionBySource ?? []}
                    emptyMessage='No conversion source data for this range.'
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Signup → Subscription (30d)
              </h2>
              <p className='text-xs text-zinc-500'>
                Tracks new free accounts that converted to paid within 30 days
                of signup.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Subscription funnel
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Window is scoped to signup date (30-day lookback).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-3 py-3 text-sm'>
                    <p className='text-xs font-medium text-zinc-400'>Signups</p>
                    <p className='text-2xl font-light text-white'>
                      {signup30dSignups.toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-3 py-3 text-sm'>
                    <p className='text-xs font-medium text-zinc-400'>
                      Subscriptions
                    </p>
                    <p className='text-2xl font-light text-white'>
                      {signup30dSubscriptions.toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-3 py-3 text-sm'>
                    <p className='text-xs font-medium text-zinc-400'>
                      Conversion rate
                    </p>
                    <p className='text-2xl font-light text-white'>
                      {signup30dRate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                CTA Conversions by Hub
              </h2>
              <p className='text-xs text-zinc-500'>
                Clickers, signups within 7 days, and conversion % per hub.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  CTA conversion performance
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Click + signup window is{' '}
                  <span className='font-semibold'>
                    {ctaConversions?.window_days ?? 7}
                  </span>{' '}
                  days.
                </CardDescription>
              </CardHeader>
              <CardContent className='overflow-x-auto'>
                <MetricTable
                  columns={[
                    { label: 'Hub', key: 'hub', type: 'text' },
                    {
                      label: 'CTA clickers',
                      key: 'unique_clickers',
                      type: 'number',
                      align: 'right',
                    },
                    {
                      label: 'Signups (7d)',
                      key: 'signups_7d',
                      type: 'number',
                      align: 'right',
                    },
                    {
                      label: 'Conversion %',
                      key: 'conversion_rate',
                      type: 'percentage',
                      align: 'right',
                      decimals: 2,
                    },
                  ]}
                  data={ctaHubs}
                  emptyMessage='No CTA conversion data for this range.'
                />
              </CardContent>
            </Card>
          </section>

          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Activation Rate
              </h2>
              <p className='text-xs text-zinc-500'>
                Users who completed ≥1 key action within 24 hours of signup.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Activation health
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Activated users cannot exceed total signups.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <MiniStat
                    label='Activation Rate %'
                    value={activationRateDisplay}
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Activated Users'
                    value={activationActivatedUsers}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='Total Signups'
                    value={activationTotalSignups}
                    icon={
                      <Target className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Activation by Feature
              </h2>
              <p className='text-xs text-zinc-500'>
                Free / Paid / Unknown splits based on tier at activation time.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Feature-driven tiers
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Tier is resolved at the time of the activation event.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetricTable
                  columns={[
                    { label: 'Feature', key: 'feature', type: 'text' },
                    {
                      label: 'Total',
                      key: 'total',
                      type: 'number',
                      align: 'right',
                    },
                    {
                      label: 'Free',
                      key: 'free',
                      type: 'number',
                      align: 'right',
                    },
                    {
                      label: 'Paid',
                      key: 'paid',
                      type: 'number',
                      align: 'right',
                    },
                    {
                      label: 'Unknown',
                      key: 'unknown',
                      type: 'number',
                      align: 'right',
                    },
                  ]}
                  data={ACTIVATION_FEATURES.map((feature) => ({
                    feature: feature.label,
                    total:
                      activation?.activationBreakdown?.[feature.event] ?? 0,
                    free:
                      activation?.activationBreakdownByPlan?.[feature.event]
                        ?.free ?? 0,
                    paid:
                      activation?.activationBreakdownByPlan?.[feature.event]
                        ?.paid ?? 0,
                    unknown:
                      activation?.activationBreakdownByPlan?.[feature.event]
                        ?.unknown ?? 0,
                  }))}
                  emptyMessage='No activation data for this range.'
                />
              </CardContent>
            </Card>
          </section>

          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>Momentum</h2>
              <p className='text-xs text-zinc-500'>
                Rolling 7-day averages plus week-over-week deltas for site and
                signed-in product usage.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Momentum
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Site momentum uses app_opened. Product momentum uses signed-in
                  product events. Activation uses signup activation rate.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2'>
                  <p className='text-xs uppercase tracking-wider text-zinc-500'>
                    Site momentum (app_opened)
                  </p>
                  {siteMomentumRows.map((row) => (
                    <div
                      key={row.id}
                      className='flex items-start justify-between gap-4 rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-4 py-3'
                    >
                      <div>
                        <p className='text-xs uppercase tracking-wider text-zinc-500'>
                          {row.label}
                        </p>
                        <p className='text-2xl font-light text-white'>
                          {row.formatter(row.stats.average)}
                        </p>
                        <p className='text-xs text-zinc-500'>7-day rolling</p>
                      </div>
                      <div className='text-right text-xs'>
                        <p className='text-sm font-semibold text-white'>
                          {row.change !== null
                            ? `${row.change >= 0 ? '+' : ''}${row.change.toLocaleString()}`
                            : 'N/A'}
                        </p>
                        <p className='text-[11px] text-zinc-500'>
                          {row.percentChange !== null
                            ? `${row.percentChange.toFixed(1)}% vs prior 7d`
                            : 'No prior window'}
                        </p>
                        <p className='text-[11px] text-zinc-500'>
                          {describeTrend(
                            row.stats.average,
                            row.stats.previousAverage,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='space-y-2'>
                  <p className='text-xs uppercase tracking-wider text-zinc-500'>
                    Product momentum (signed-in)
                  </p>
                  {productMomentumRows.map((row) => (
                    <div
                      key={row.id}
                      className='flex items-start justify-between gap-4 rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-4 py-3'
                    >
                      <div>
                        <p className='text-xs uppercase tracking-wider text-zinc-500'>
                          {row.label}
                        </p>
                        <p className='text-2xl font-light text-white'>
                          {row.formatter(row.stats.average)}
                        </p>
                        <p className='text-xs text-zinc-500'>7-day rolling</p>
                      </div>
                      <div className='text-right text-xs'>
                        <p className='text-sm font-semibold text-white'>
                          {row.change !== null
                            ? `${row.change >= 0 ? '+' : ''}${row.change.toLocaleString()}`
                            : 'N/A'}
                        </p>
                        <p className='text-[11px] text-zinc-500'>
                          {row.percentChange !== null
                            ? `${row.percentChange.toFixed(1)}% vs prior 7d`
                            : 'No prior window'}
                        </p>
                        <p className='text-[11px] text-zinc-500'>
                          {describeTrend(
                            row.stats.average,
                            row.stats.previousAverage,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='space-y-2'>
                  <p className='text-xs uppercase tracking-wider text-zinc-500'>
                    Activation momentum
                  </p>
                  {activationMomentumRows.map((row) => (
                    <div
                      key={row.id}
                      className='flex items-start justify-between gap-4 rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-4 py-3'
                    >
                      <div>
                        <p className='text-xs uppercase tracking-wider text-zinc-500'>
                          {row.label}
                        </p>
                        <p className='text-2xl font-light text-white'>
                          {row.formatter(row.stats.average)}
                        </p>
                        <p className='text-xs text-zinc-500'>7-day rolling</p>
                      </div>
                      <div className='text-right text-xs'>
                        <p className='text-sm font-semibold text-white'>
                          {row.change !== null
                            ? `${row.change >= 0 ? '+' : ''}${row.change.toLocaleString()}`
                            : 'N/A'}
                        </p>
                        <p className='text-[11px] text-zinc-500'>
                          {row.percentChange !== null
                            ? `${row.percentChange.toFixed(1)}% vs prior 7d`
                            : 'No prior window'}
                        </p>
                        <p className='text-[11px] text-zinc-500'>
                          {describeTrend(
                            row.stats.average,
                            row.stats.previousAverage,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className='text-xs text-zinc-400'>
                  Activation momentum is expressed as the rolling rate plus its
                  change vs. the previous 7-day window.
                </p>
              </CardContent>
            </Card>
          </section>

          <section className='space-y-6'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Event Volume & Quality
              </h2>
              <p className='text-xs text-zinc-500'>
                Understand raw `app_opened` volume, session depth, and AI costs
                before digging into usage trends.
              </p>
            </div>
            <div className='grid gap-6 lg:grid-cols-3'>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Raw Event Audit
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Canonical `app_opened` counts are surfaced when the audit
                    mode is enabled.
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4 md:grid-cols-2'>
                  <MiniStat
                    label='Raw app_opened events'
                    value={engagementOverview?.audit?.raw_events_count ?? '—'}
                    icon={
                      <Loader2 className='h-5 w-5 text-lunary-accent-300' />
                    }
                  />
                  <MiniStat
                    label='Canonical identities'
                    value={
                      engagementOverview?.audit
                        ?.distinct_canonical_identities ?? '—'
                    }
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Missing identity rows'
                    value={
                      engagementOverview?.audit?.missing_identity_rows ?? '—'
                    }
                    icon={
                      <Target className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                  <MiniStat
                    label='Identity links applied'
                    value={
                      engagementOverview?.audit?.linked_identities_applied ??
                      '—'
                    }
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                </CardContent>
              </Card>

              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Average sessions
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Depth of signed-in product engagement per user.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-zinc-200'>
                  <div className='flex items-center justify-between'>
                    <span>Signed-in product sessions</span>
                    <span>
                      {typeof activity?.signed_in_product_avg_sessions_per_user ===
                      'number'
                        ? activity.signed_in_product_avg_sessions_per_user.toFixed(
                            2,
                          )
                        : '—'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Signed-in returning users</span>
                    <span>
                      {(
                        activity?.signed_in_product_returning_users ?? 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    AI usage & costs
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Track generation volume versus spend.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-2 text-sm text-zinc-300'>
                  <div className='flex items-center justify-between'>
                    <span>Total API cost</span>
                    <span>
                      {apiCosts ? `$${apiCosts.totalCost.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Cost per session</span>
                    <span>
                      {apiCosts
                        ? `$${apiCosts.costPerSession.toFixed(4)}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Revenue / cost ratio</span>
                    <span>
                      {apiCosts ? apiCosts.revenueCostRatio.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Total generations</span>
                    <span>
                      {apiCosts
                        ? apiCosts.totalGenerations.toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Unique users</span>
                    <span>
                      {apiCosts ? apiCosts.uniqueUsers.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Feature usage heatmap
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Past seven days of key feature events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapGrid data={heatmapData} />
              </CardContent>
            </Card>

            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Audience Segments
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Compare the deduped counts across the four canonical families.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-xs text-zinc-400'>
                  Pageview Reach = `page_viewed` deduped · Engaged Users = key
                  action events · Signed-in Product Usage = authenticated
                  product event users · Grimoire Viewers = `grimoire_viewed`
                  users
                </p>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-3'>
                  <MiniStat
                    label='Pageview Reach MAU'
                    value={reachMau}
                    icon={<Bell className='h-5 w-5 text-lunary-primary-300' />}
                  />
                  <MiniStat
                    label='Engaged Users MAU'
                    value={engagedMau}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='Signed-in Product MAU'
                    value={activity?.signed_in_product_mau ?? 0}
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                  <MiniStat
                    label='Grimoire Viewers MAU'
                    value={grimoireMau}
                    icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
                  />
                </div>
                <p className='mt-2 text-xs text-zinc-500'>
                  These families let you compare reach, engagement, product, and
                  Grimoire-only cohorts without mixing denominators.
                </p>
              </CardContent>
            </Card>
          </section>

          <section className='space-y-6'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Signed-In Product Usage
              </h2>
              <p className='text-xs text-zinc-500'>
                Signed-in product users capture authenticated engagement inside
                the app.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Product usage (signed-in)
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Product users are a subset of App users. Counts will not align
                  1:1.
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <MiniStat
                  label='Product DAU'
                  value={activity?.signed_in_product_dau ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-primary-300' />
                  }
                />
                <MiniStat
                  label='Product WAU'
                  value={activity?.signed_in_product_wau ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-success-300' />
                  }
                />
                <MiniStat
                  label='Product MAU'
                  value={activity?.signed_in_product_mau ?? 0}
                  icon={
                    <Activity className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='Returning product MAU%'
                  value={
                    typeof productReturningPercent.mau === 'number'
                      ? `${productReturningPercent.mau.toFixed(1)}%`
                      : '—'
                  }
                  icon={<Sparkles className='h-5 w-5 text-lunary-accent-300' />}
                />
              </CardContent>
            </Card>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Feature adoption (per Product MAU)
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Distinct signed-in product users who triggered the feature
                  relative to Product MAU.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                {(featureAdoption?.features ?? []).map((row) => {
                  const adoption = row.adoption_rate;
                  let status: BadgeStatus = 'good';
                  if (adoption === 0) status = 'critical';
                  else if (adoption < 10) status = 'warning';
                  else if (adoption > 50) status = 'excellent';

                  return (
                    <div
                      key={`${row.event_type}-product`}
                      className='flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 text-sm'
                    >
                      <span className='text-zinc-300'>{row.event_type}</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-zinc-400'>
                          {row.users.toLocaleString()} users ·{' '}
                          {row.adoption_rate.toFixed(2)}%
                        </span>
                        <StatusBadge
                          status={status}
                          label=''
                          showIcon={false}
                        />
                      </div>
                    </div>
                  );
                })}
                {(featureAdoption?.features ?? []).length === 0 && (
                  <div className='text-sm text-zinc-500'>
                    No feature adoption data for this range.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className='space-y-6'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Grimoire Deep Dive
              </h2>
              <p className='text-xs text-zinc-500'>
                Grimoire viewers are scoped to `grimoire_viewed` events and feed
                the conversion flywheel.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Grimoire health
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Entry rate, penetration, and return behavior inside the
                  Grimoire experience.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                  <MiniStat
                    label='Grimoire Entry Rate'
                    value={
                      typeof grimoireHealth?.grimoire_entry_rate === 'number'
                        ? `${grimoireHealth.grimoire_entry_rate.toFixed(2)}%`
                        : '—'
                    }
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Grimoire MAU'
                    value={grimoireMau}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='Grimoire-only MAU'
                    value={grimoireOnlyMau}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                  <MiniStat
                    label='Views per Grimoire user'
                    value={
                      typeof grimoireHealth?.grimoire_views_per_active_user ===
                      'number'
                        ? grimoireHealth.grimoire_views_per_active_user.toFixed(
                            2,
                          )
                        : '—'
                    }
                    icon={
                      <Activity className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <MiniStat
                    label='Grimoire return rate'
                    value={
                      typeof grimoireHealth?.return_to_grimoire_rate ===
                      'number'
                        ? `${grimoireHealth.return_to_grimoire_rate.toFixed(2)}%`
                        : '—'
                    }
                    icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
                  />
                  <MiniStat
                    label='Grimoire conversions'
                    value={(
                      conversionInfluence?.subscription_users_with_grimoire_before ??
                      0
                    ).toLocaleString()}
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                </div>
                <div className='rounded-xl border border-zinc-800/30 bg-zinc-950/50 p-4 text-sm text-zinc-300'>
                  <p className='text-xs uppercase tracking-wider text-zinc-400'>
                    Conversion influence
                  </p>
                  <div className='mt-2 space-y-1'>
                    <div className='flex items-center justify-between'>
                      <span>Subscriptions with Grimoire before signup</span>
                      <span>
                        {(
                          conversionInfluence?.subscription_users_with_grimoire_before ??
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Conversion rate with Grimoire</span>
                      <span>
                        {(
                          conversionInfluence?.subscription_with_grimoire_before_rate ??
                          0
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Median days (first Grimoire → signup)</span>
                      <span>
                        {conversionInfluence?.median_days_first_grimoire_to_signup ??
                          'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Median days (signup → subscription)</span>
                      <span>
                        {conversionInfluence?.median_days_signup_to_subscription ??
                          'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {searchConsoleData && (
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    SEO & referral entry rate
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Organic reach that feeds the Grimoire experience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SearchConsoleMetrics
                    data={searchConsoleData}
                    loading={loading && !searchConsoleData}
                  />
                </CardContent>
              </Card>
            )}
          </section>

          <section className='space-y-6'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Conversion & Lifecycle
              </h2>
              <p className='text-xs text-zinc-500'>
                Signup to trial to paid movement, lifecycle stages, and churn
                diagnostics.
              </p>
            </div>
            <div className='grid gap-6 xl:grid-cols-2'>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Conversion funnel
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Free → trial → paid transitions for the selected range.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConversionFunnel
                    stages={conversionStages}
                    dropOffPoints={conversionDropOff}
                  />
                </CardContent>
              </Card>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Subscription lifecycle & plans
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Track plan states, duration, and churn.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-zinc-200'>
                  <div className='grid gap-2 md:grid-cols-2'>
                    {lifecycleStateEntries.map(([status, count]) => (
                      <div
                        key={status}
                        className='flex items-center justify-between'
                      >
                        <span className='capitalize tracking-wide text-xs text-zinc-500'>
                          {status.replace(/_/g, ' ')}
                        </span>
                        <span>{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className='flex items-center justify-between text-xs text-zinc-400'>
                    <span>Avg subscription duration</span>
                    <span>
                      {subscriptionLifecycle?.avgDurationDays
                        ? `${subscriptionLifecycle.avgDurationDays.toFixed(1)} days`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-xs text-zinc-400'>
                    <span>Churn rate</span>
                    <span>
                      {subscriptionLifecycle?.churnRate !== undefined
                        ? `${subscriptionLifecycle.churnRate.toFixed(2)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='space-y-2 pt-2 text-xs text-zinc-300'>
                    {planBreakdown?.planBreakdown?.map((plan: any) => (
                      <div
                        key={plan.plan}
                        className='flex flex-col gap-1 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2'
                      >
                        <span className='text-[11px] uppercase tracking-wide text-zinc-500'>
                          {plan.plan}
                        </span>
                        <span>Subscriptions: {plan.count}</span>
                        <span>Active: {plan.active}</span>
                        <span>MRR: ${Number(plan.mrr ?? 0).toFixed(2)}</span>
                        <span>
                          Share: {Number(plan.percentage ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                    {!planBreakdown?.planBreakdown?.length && (
                      <div className='text-xs text-zinc-500'>
                        No plan breakdown data for this range.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className='space-y-6'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Notifications & External Channels
              </h2>
              <p className='text-xs text-zinc-500'>
                Track deliverability and command usage across push, email, and
                Discord.
              </p>
            </div>
            <div className='grid gap-6 lg:grid-cols-2'>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Notification health
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Open rates by channel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {notificationTypes.map((type) => (
                      <div
                        key={type.key}
                        className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4'
                      >
                        <div className='flex items-center gap-2 text-sm font-medium text-zinc-300'>
                          <Bell className='h-4 w-4 text-lunary-primary-300' />
                          {type.label}
                        </div>
                        <div className='mt-3 grid gap-2 text-sm'>
                          <div className='flex items-center justify-between text-zinc-400'>
                            <span>Sent</span>
                            <span>{type.data.sent.toLocaleString()}</span>
                          </div>
                          <div className='flex items-center justify-between text-zinc-400'>
                            <span>Open rate</span>
                            <span>
                              {Number(type.data.open_rate ?? 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className='flex items-center justify-between text-zinc-400'>
                            <span>CTR</span>
                            <span>
                              {Number(
                                type.data.click_through_rate ?? 0,
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {discordAnalytics && (
                <div className='space-y-6'>
                  <Card className='border-zinc-800/30 bg-zinc-900/10'>
                    <CardHeader>
                      <CardTitle className='text-base font-medium'>
                        Discord bot engagement
                      </CardTitle>
                      <CardDescription className='text-xs text-zinc-400'>
                        Command usage (last 7 days).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='grid gap-4 md:grid-cols-2'>
                      <MiniStat
                        label='Total commands'
                        value={
                          discordAnalytics.stats?.funnel?.totalCommands ?? 0
                        }
                        icon={
                          <Activity className='h-5 w-5 text-lunary-primary-300' />
                        }
                      />
                      <MiniStat
                        label='Button clicks'
                        value={
                          discordAnalytics.stats?.funnel?.buttonClicks ?? 0
                        }
                        icon={
                          <Target className='h-5 w-5 text-lunary-success-300' />
                        }
                      />
                      <MiniStat
                        label='Click-through rate'
                        value={
                          discordAnalytics.stats?.funnel?.clickThroughRate
                            ? `${discordAnalytics.stats.funnel.clickThroughRate}%`
                            : 'N/A'
                        }
                        icon={
                          <Sparkles className='h-5 w-5 text-lunary-secondary-300' />
                        }
                      />
                      <MiniStat
                        label='Accounts linked'
                        value={
                          discordAnalytics.stats?.funnel?.accountsLinked ?? 0
                        }
                        icon={
                          <Bell className='h-5 w-5 text-lunary-accent-300' />
                        }
                      />
                    </CardContent>
                  </Card>
                  <Card className='border-zinc-800/30 bg-zinc-900/10'>
                    <CardHeader>
                      <CardTitle className='text-base font-medium'>
                        Top Discord commands
                      </CardTitle>
                      <CardDescription className='text-xs text-zinc-400'>
                        Most popular bot interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {(discordAnalytics.stats?.commands ?? [])
                        .slice(0, 5)
                        .map((cmd: any) => (
                          <div key={cmd.command_name} className='space-y-2'>
                            <div className='flex items-center justify-between text-sm text-zinc-400'>
                              <span className='capitalize'>
                                {cmd.command_name || 'Unknown'}
                              </span>
                              <span>{cmd.total_uses.toLocaleString()}</span>
                            </div>
                            <div className='h-2 w-full rounded-full bg-zinc-800'>
                              <div
                                className='h-2 rounded-full bg-gradient-to-r from-lunary-primary-400 to-lunary-highlight-500'
                                style={{
                                  width: `${
                                    discordAnalytics.stats?.commands?.[0]
                                      ?.total_uses > 0
                                      ? (
                                          (cmd.total_uses /
                                            discordAnalytics.stats.commands[0]
                                              .total_uses) *
                                          100
                                        ).toFixed(2)
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <div className='flex items-center justify-between text-xs text-zinc-400'>
                              <span>{cmd.unique_users} users</span>
                              <span>{cmd.linked_users} linked</span>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>

          <section className='space-y-6'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Cohorts & Retention
              </h2>
              <p className='text-xs text-zinc-500'>
                View retention by signup cohort. Cohorts younger than 30 days
                are still maturing.
              </p>
            </div>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Cohort retention analysis
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Retention by signup week/month (first `app_opened`).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 text-xs text-zinc-400'>
                  Keeps cohort size, Day 1/7/30 retention, and maturity notes in
                  view.
                </div>
                <MetricTable
                  columns={[
                    {
                      label: 'Cohort Week',
                      key: 'cohort',
                      type: 'text',
                      render: (dateStr: string) => {
                        const date = new Date(dateStr);
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                      },
                    },
                    {
                      label: 'Cohort Size',
                      key: 'day0',
                      type: 'number',
                      align: 'right',
                    },
                    {
                      label: 'Day 1',
                      key: 'day1',
                      type: 'percentage',
                      align: 'right',
                      decimals: 1,
                    },
                    {
                      label: 'Day 7',
                      key: 'day7',
                      type: 'percentage',
                      align: 'right',
                      decimals: 1,
                    },
                    {
                      label: 'Day 30',
                      key: 'day30',
                      type: 'percentage',
                      align: 'right',
                      decimals: 1,
                    },
                  ]}
                  data={cohorts?.cohorts ?? []}
                  emptyMessage='No cohort data for this range.'
                />
                <p className='mt-3 text-xs text-zinc-500'>
                  Immature cohorts (less than or equal to 30 days old) are still
                  filling out, so treat their Day 30 rows as provisional.
                </p>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MultiLineChart({ data }: { data: ActivityTrend[] }) {
  if (!data.length) {
    return (
      <div className='flex h-48 items-center justify-center text-sm text-zinc-400'>
        Not enough data for this range.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padding = 40;
  const values = data.flatMap((point) => [point.dau, point.wau, point.mau]);
  const max = Math.max(...values, 1);

  const createPath = (key: 'dau' | 'wau' | 'mau') =>
    data
      .map((point, index) => {
        const x =
          padding +
          (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
        const y =
          height - padding - (point[key] / max) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role='img'
      className='w-full'
      aria-label='Active user trends'
    >
      <defs>
        <linearGradient id='dauGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stopColor='rgba(196,181,253,0.8)' />
          <stop offset='100%' stopColor='rgba(196,181,253,0)' />
        </linearGradient>
      </defs>
      <path
        d={createPath('dau')}
        fill='none'
        stroke='url(#dauGradient)'
        strokeWidth={3}
      />
      <path
        d={createPath('wau')}
        fill='none'
        stroke='rgba(129,140,248,0.9)'
        strokeWidth={2}
        strokeDasharray='6 4'
      />
      <path
        d={createPath('mau')}
        fill='none'
        stroke='rgba(56,189,248,0.9)'
        strokeWidth={2}
        strokeDasharray='4 2'
      />
      <g className='text-xs fill-zinc-500'>
        {data.map((point, index) => {
          const x =
            padding +
            (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
          // Format date: show MM/DD or just day number if too many points
          const date = new Date(point.date);
          const label =
            data.length > 14
              ? date.getDate().toString()
              : `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <text key={point.date} x={x} y={height - 10} textAnchor='middle'>
              {label}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

function RetentionCard({
  label,
  value,
  variant = 'positive',
}: {
  label: string;
  value: number | null;
  variant?: 'positive' | 'negative';
}) {
  const color =
    variant === 'negative'
      ? 'text-lunary-error-300 border-lunary-error-800/20 bg-lunary-error-900/5'
      : 'text-lunary-success-300 border-lunary-success-800/20 bg-lunary-success-900/5';

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${color}`}>
      <div className='text-xs font-medium text-zinc-400'>{label}</div>
      <div className='mt-1.5 text-2xl font-light tracking-tight text-white'>
        {typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A'}
      </div>
    </div>
  );
}

function HeatmapGrid({
  data,
}: {
  data: Array<{
    date: string;
    entries: Array<{ feature: string; value: number }>;
  }>;
}) {
  if (!data.length) {
    return (
      <div className='text-sm text-zinc-400'>
        No feature usage data available.
      </div>
    );
  }

  const featureKeys = data[0].entries.map((entry) => entry.feature);
  const max = Math.max(
    ...data.flatMap((row) => row.entries.map((entry) => entry.value)),
    1,
  );

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left text-xs text-zinc-400'>
        <thead>
          <tr>
            <th className='pb-2'>Date</th>
            {featureKeys.map((feature) => {
              const featureName =
                feature === '$pageview'
                  ? 'Page Views'
                  : feature
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <th key={feature} className='pb-2'>
                  {featureName}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date}>
              <td className='py-2 text-zinc-400'>{row.date.slice(5)}</td>
              {row.entries.map((entry) => {
                const intensity = entry.value / max;
                return (
                  <td key={entry.feature} className='py-1'>
                    <div
                      className='h-6 rounded-md text-center text-xs font-semibold text-white'
                      style={{
                        backgroundColor: `rgba(147,51,234,${Math.max(
                          0.1,
                          intensity,
                        )})`,
                      }}
                    >
                      {entry.value}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// MiniStat component now imported from @/components/admin/MiniStat
