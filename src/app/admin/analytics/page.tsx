'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Activity,
  Bell,
  CalendarRange,
  Download,
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react';

import { MetricsCard } from '@/components/admin/MetricsCard';
import { ConversionFunnel } from '@/components/admin/ConversionFunnel';
import { SuccessMetrics } from '@/components/admin/SuccessMetrics';
import { SearchConsoleMetrics } from '@/components/admin/SearchConsoleMetrics';
import { AttributionMetrics } from '@/components/admin/AttributionMetrics';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsageChart, { UsageChartSeries } from '@/components/charts/UsageChart';

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

const formatDateInput = (date: Date) => date.toISOString().split('T')[0];

const shiftDateInput = (dateOnly: string, deltaDays: number) => {
  // Treat the date input as UTC for consistent analytics windows.
  const base = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) return dateOnly;
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return formatDateInput(base);
};

const INTENTION_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  confidence: 'Confidence',
  calm: 'Calm',
  insight: 'Insight',
};

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
  const returningReferrerBreakdown =
    engagementOverview?.returning_referrer_breakdown;

  const chartSeries = showProductSeries
    ? [...activitySeries, ...productSeries]
    : activitySeries;

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = `start_date=${startDate}&end_date=${endDate}`;

    try {
      const [
        activityRes,
        engagementOverviewRes,
        featureAdoptionRes,
        grimoireHealthRes,
        conversionInfluenceRes,
        conversionsRes,
        ctaConversionsRes,
        subscription30dRes,
        notificationsRes,
        featureUsageRes,
        successMetricsRes,
        discordRes,
        searchConsoleRes,
        userGrowthRes,
        activationRes,
        subscriptionLifecycleRes,
        planBreakdownRes,
        apiCostsRes,
        cohortsRes,
        userSegmentsRes,
        intentionBreakdownRes,
      ] = await Promise.all([
        fetch(
          `/api/admin/analytics/dau-wau-mau?${queryParams}&granularity=${granularity}`,
        ),
        fetch(`/api/admin/analytics/engagement-overview?${queryParams}`),
        fetch(`/api/admin/analytics/feature-adoption?${queryParams}`),
        fetch(`/api/admin/analytics/grimoire-health?${queryParams}`),
        fetch(`/api/admin/analytics/conversion-influence?${queryParams}`),
        fetch(`/api/admin/analytics/conversions?${queryParams}`),
        fetch(`/api/admin/analytics/cta-conversions?${queryParams}`),
        fetch(`/api/admin/analytics/subscription-30d?${queryParams}`),
        fetch(`/api/admin/analytics/notifications?${queryParams}`),
        fetch(`/api/admin/analytics/feature-usage?${queryParams}`),
        fetch(`/api/admin/analytics/success-metrics?${queryParams}`),
        fetch(`/api/analytics/discord-interactions?range=7d`),
        fetch(`/api/admin/analytics/search-console?${queryParams}`),
        fetch(
          `/api/admin/analytics/user-growth?${queryParams}&granularity=${granularity}`,
        ),
        fetch(`/api/admin/analytics/activation?${queryParams}`),
        fetch(
          `/api/admin/analytics/subscription-lifecycle?${queryParams}&stripe=1`,
        ),
        fetch(`/api/admin/analytics/plan-breakdown?${queryParams}`),
        fetch(`/api/admin/analytics/api-costs?${queryParams}`),
        fetch(`/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`),
        fetch(`/api/admin/analytics/user-segments?${queryParams}`),
        fetch(`/api/admin/analytics/intention-breakdown?${queryParams}`),
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
  }, [granularity, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = () => {
    const escapeCsvCell = (value: unknown): string => {
      const text = value === null || value === undefined ? '' : String(value);
      // Quote if needed (commas, quotes, newlines)
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
          'DAU (Sitewide Page Views)',
          String(activity.sitewide_dau ?? 0),
        ],
        [
          'Activity',
          'WAU (Sitewide Page Views)',
          String(activity.sitewide_wau ?? 0),
        ],
        [
          'Activity',
          'MAU (Sitewide Page Views)',
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

    const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `lunary-analytics-${startDate}-to-${endDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const activeSubscribers =
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
      subtitle: 'Paid subscriptions',
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
    {
      title: 'Monthly Active Users',
      value: engagementOverview?.mau ?? 0,
      subtitle: 'Deduped app opens (30d)',
    },
    {
      title: 'Weekly Active Users',
      value: engagementOverview?.wau ?? 0,
      subtitle: 'Deduped app opens (7d)',
    },
    {
      title: 'Daily Active Users',
      value: engagementOverview?.dau ?? 0,
      subtitle: 'Deduped app opens (UTC day)',
    },
  ];

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

          <Button variant='lunary-soft' onClick={handleExport}>
            <Download className='h-3.5 w-3.5' />
            Download CSV
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
          <TabsTrigger value='snapshot' className='text-xs'>
            Investor Snapshot
          </TabsTrigger>
          <TabsTrigger value='details' className='text-xs'>
            Operational Detail
          </TabsTrigger>
        </TabsList>

        <TabsContent value='snapshot' className='space-y-10'>
          <section className='space-y-3'>
            <div>
              <h2 className='text-sm font-medium text-zinc-200'>
                Primary KPIs
              </h2>
              <p className='text-xs text-zinc-500'>
                The highest-signal metrics for traction, revenue, and
                conversion.
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

          <section className='space-y-3'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Engagement Overview (deduplicated)
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Metrics are deduplicated to meaningful user-level events (for
                  example, one app open per user per day) to prioritise
                  engagement quality over raw pageview volume.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                  <MiniStat
                    label='DAU'
                    value={(engagementOverview?.dau ?? 0).toLocaleString()}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='WAU'
                    value={(engagementOverview?.wau ?? 0).toLocaleString()}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='MAU'
                    value={(engagementOverview?.mau ?? 0).toLocaleString()}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                  <MiniStat
                    label='Avg active days'
                    value={
                      typeof engagementOverview?.avg_active_days_per_user ===
                      'number'
                        ? engagementOverview.avg_active_days_per_user.toFixed(2)
                        : 'N/A'
                    }
                    icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                  <MiniStat
                    label='Stickiness (DAU/MAU)'
                    value={
                      typeof engagementOverview?.stickiness_dau_mau === 'number'
                        ? `${engagementOverview.stickiness_dau_mau.toFixed(2)}%`
                        : 'N/A'
                    }
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Stickiness (WAU/MAU)'
                    value={
                      typeof engagementOverview?.stickiness_wau_mau === 'number'
                        ? `${engagementOverview.stickiness_wau_mau.toFixed(2)}%`
                        : 'N/A'
                    }
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='New users (range)'
                    value={(
                      engagementOverview?.new_users ?? 0
                    ).toLocaleString()}
                    icon={
                      <Target className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                  <MiniStat
                    label='Returning users (range)'
                    value={(
                      engagementOverview?.returning_users_range ?? 0
                    ).toLocaleString()}
                    icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
                  />
                </div>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                  <MiniStat
                    label='Returning DAU'
                    value={(
                      engagementOverview?.returning_dau ?? 0
                    ).toLocaleString()}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                  <MiniStat
                    label='Returning WAU (7-day overlap)'
                    value={(
                      engagementOverview?.returning_wau ?? 0
                    ).toLocaleString()}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='Returning MAU (30-day overlap)'
                    value={(
                      engagementOverview?.returning_mau ?? 0
                    ).toLocaleString()}
                    icon={
                      <Activity className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                </div>
                {returningReferrerBreakdown && (
                  <>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Returning referrer breakdown
                    </p>
                    <div className='grid gap-4 md:grid-cols-3'>
                      <MiniStat
                        label='Organic returning'
                        value={returningReferrerBreakdown.organic_returning}
                        icon={
                          <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                        }
                      />
                      <MiniStat
                        label='Direct / brand returning'
                        value={returningReferrerBreakdown.direct_returning}
                        icon={
                          <Target className='h-5 w-5 text-lunary-secondary-300' />
                        }
                      />
                      <MiniStat
                        label='Internal returning'
                        value={returningReferrerBreakdown.internal_returning}
                        icon={
                          <Activity className='h-5 w-5 text-lunary-success-300' />
                        }
                      />
                    </div>
                    <div className='rounded-lg border border-zinc-800/30 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400'>
                      Segments use the most recent `app_opened` metadata
                      (referrer, UTM source, or origin type) for returning users
                      (2+ active days) so you can tell whether they came back
                      via organic search, a direct/brand touchpoint, or internal
                      navigation inside Lunary.
                    </div>
                  </>
                )}
                <div className='rounded-lg border border-zinc-800/30 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400'>
                  Returning users (range) are users with 2+ distinct active days
                  inside the selected range. Returning DAU counts signed-in
                  users active on the selected end date who were also active on
                  an earlier day in the selected range; identity links ensure we
                  dedupe anonymous→signed transitions.
                </div>

                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Active days distribution (range)
                    </p>
                    <div className='mt-2 space-y-1 text-sm text-zinc-300'>
                      {(['1', '2-3', '4-7', '8-14', '15+'] as const).map(
                        (bucket) => (
                          <div
                            key={bucket}
                            className='flex items-center justify-between'
                          >
                            <span>{bucket}</span>
                            <span>
                              {(
                                engagementOverview?.active_days_distribution?.[
                                  bucket
                                ] ?? 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4 md:col-span-2'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Cohort retention (first app open)
                    </p>
                    <div className='mt-2 space-y-1 text-sm text-zinc-300'>
                      {(engagementOverview?.retention?.cohorts ?? [])
                        .slice(-7)
                        .map((row) => (
                          <div
                            key={row.cohort_day}
                            className='grid grid-cols-4 gap-2'
                          >
                            <span className='text-zinc-400'>
                              {row.cohort_day}
                            </span>
                            <span>Day 1: {row.day_1 ?? 'N/A'}%</span>
                            <span>Day 7: {row.day_7 ?? 'N/A'}%</span>
                            <span>Day 30: {row.day_30 ?? 'N/A'}%</span>
                          </div>
                        ))}
                      {(engagementOverview?.retention?.cohorts ?? []).length ===
                        0 && (
                        <div className='text-zinc-500'>
                          No cohorts found for this range.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='grid gap-6 lg:grid-cols-2'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Feature adoption (per MAU)
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Adoption is distinct users triggering the feature in range,
                  divided by MAU.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                {(featureAdoption?.features ?? []).map((row) => (
                  <div
                    key={row.event_type}
                    className='flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 text-sm'
                  >
                    <span className='text-zinc-300'>{row.event_type}</span>
                    <span className='text-zinc-400'>
                      {row.users.toLocaleString()} users ·{' '}
                      {row.adoption_rate.toFixed(2)}%
                    </span>
                  </div>
                ))}
                {(featureAdoption?.features ?? []).length === 0 && (
                  <div className='text-sm text-zinc-500'>
                    No feature adoption data for this range.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Grimoire health
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Product and SEO signals from Grimoire engagement.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-3'>
                  <MiniStat
                    label='Entry rate'
                    value={
                      typeof grimoireHealth?.grimoire_entry_rate === 'number'
                        ? `${grimoireHealth.grimoire_entry_rate.toFixed(2)}%`
                        : 'N/A'
                    }
                    icon={
                      <Sparkles className='h-5 w-5 text-lunary-primary-300' />
                    }
                  />
                  <MiniStat
                    label='Views per active user'
                    value={
                      typeof grimoireHealth?.grimoire_views_per_active_user ===
                      'number'
                        ? grimoireHealth.grimoire_views_per_active_user.toFixed(
                            2,
                          )
                        : 'N/A'
                    }
                    icon={
                      <Activity className='h-5 w-5 text-lunary-success-300' />
                    }
                  />
                  <MiniStat
                    label='Return rate'
                    value={
                      typeof grimoireHealth?.return_to_grimoire_rate ===
                      'number'
                        ? `${grimoireHealth.return_to_grimoire_rate.toFixed(2)}%`
                        : 'N/A'
                    }
                    icon={
                      <Target className='h-5 w-5 text-lunary-secondary-300' />
                    }
                  />
                </div>

                <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                  <p className='text-xs uppercase tracking-wider text-zinc-400'>
                    Conversion influence
                  </p>
                  <div className='mt-2 space-y-1 text-sm text-zinc-300'>
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
                        ).toLocaleString()}{' '}
                        (
                        {(
                          conversionInfluence?.subscription_with_grimoire_before_rate ??
                          0
                        ).toFixed(2)}
                        %)
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Median days (first Grimoire to signup)</span>
                      <span>
                        {conversionInfluence?.median_days_first_grimoire_to_signup ??
                          'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Median days (signup to subscription)</span>
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
                  Audience Segments
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Compare sitewide pageviews, engaged users, signed-in product
                  usage, and Grimoire-only reach. Product users are signed-in
                  event users, and Grimoire-only users never trigger a product
                  event.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 rounded-lg border border-zinc-800/30 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400'>
                  <div>
                    <strong>Selected range:</strong> {startDate} to {endDate}{' '}
                    (UTC)
                  </div>
                  <div className='mt-1'>
                    <strong>Snapshot windows ending {endDate}:</strong> DAU =
                    {` ${endDate}`}, WAU = {` ${wauWindowStart} to ${endDate}`},
                    MAU = {` ${mauWindowStart} to ${endDate}`}
                  </div>
                  <div className='mt-2 text-xs text-zinc-400'>
                    Page-View DAU is deduplicated across `page_viewed` canonical
                    events for the selected window.
                  </div>
                </div>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='space-y-2 rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Page-View DAU
                    </p>
                    <div className='text-sm text-zinc-300'>
                      <div className='flex items-center justify-between'>
                        <span>DAU</span>
                        <span>
                          {(activity?.sitewide_dau ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>WAU</span>
                        <span>
                          {(activity?.sitewide_wau ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>MAU</span>
                        <span>
                          {(activity?.sitewide_mau ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-2 rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Engaged (key actions)
                    </p>
                    <div className='text-sm text-zinc-300'>
                      <div className='flex items-center justify-between'>
                        <span>DAU</span>
                        <span>{(activity?.dau ?? 0).toLocaleString()}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>WAU</span>
                        <span>{(activity?.wau ?? 0).toLocaleString()}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>MAU</span>
                        <span>{(activity?.mau ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-2 rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Product (signed-in)
                    </p>
                    <div className='text-sm text-zinc-300'>
                      <div className='flex items-center justify-between'>
                        <span>DAU</span>
                        <span>
                          {(
                            activity?.signed_in_product_dau ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>WAU</span>
                        <span>
                          {(
                            activity?.signed_in_product_wau ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>MAU</span>
                        <span>
                          {(
                            activity?.signed_in_product_mau ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='rounded-xl border border-lime-500/20 bg-lime-500/5 p-4'>
                    <p className='text-xs uppercase tracking-wider text-lime-300'>
                      <span
                        className='normal-case'
                        title='Includes users who may also use the product.'
                      >
                        Content MAU (Grimoire viewers, last 30 days ending{' '}
                        {endDate})
                      </span>
                    </p>
                    <p className='text-2xl font-semibold text-lime-100'>
                      {(activity?.content_mau_grimoire ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 p-4'>
                    <p className='text-xs uppercase tracking-wider text-amber-300'>
                      <span
                        className='normal-case'
                        title='Excludes anyone who interacted with product features.'
                      >
                        Grimoire-only MAU (Grimoire viewers who did not open the
                        app, last 30 days ending {endDate})
                      </span>
                    </p>
                    <p className='text-2xl font-semibold text-amber-100'>
                      {(activity?.grimoire_only_mau ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3'>
                    <p className='text-[11px] uppercase tracking-wider text-zinc-500'>
                      Product DAU/WAU
                    </p>
                    <p className='text-xl font-semibold text-white'>
                      {productDauToWauRatio.toFixed(1)}%
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3'>
                    <p className='text-[11px] uppercase tracking-wider text-zinc-500'>
                      Product WAU/MAU
                    </p>
                    <p className='text-xl font-semibold text-white'>
                      {productWauToMauRatio.toFixed(1)}%
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3'>
                    <p className='text-[11px] uppercase tracking-wider text-zinc-500'>
                      Grimoire-only share of Content MAU
                    </p>
                    <p className='text-xl font-semibold text-white'>
                      {grimoireShareRatio.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          <section className='space-y-3'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Product Usage
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Signed-in product engagement for {startDate} to {endDate}.
                  Product users are not counted as Grimoire-only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='mb-4 rounded-lg border border-zinc-800/30 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400'>
                  <div>
                    <strong>Selected range:</strong> {startDate} to {endDate}{' '}
                    (UTC)
                  </div>
                  <div className='mt-1'>
                    <strong>Snapshot windows ending {endDate}:</strong> Product
                    DAU = {` ${endDate}`}, Product WAU ={' '}
                    {` ${wauWindowStart} to ${endDate}`}, Product MAU ={' '}
                    {` ${mauWindowStart} to ${endDate}`}
                  </div>
                </div>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Product Users (signed-in)
                    </p>
                    <p className='text-2xl font-semibold text-white'>
                      {(
                        activity?.signed_in_product_users ?? 0
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Returning Product Users (signed-in)
                    </p>
                    <p className='text-2xl font-semibold text-white'>
                      {(
                        activity?.signed_in_product_returning_users ?? 0
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4'>
                    <p className='text-xs uppercase tracking-wider text-zinc-400'>
                      Avg Sessions per User (product)
                    </p>
                    <p className='text-2xl font-semibold text-white'>
                      {Number(
                        activity?.signed_in_product_avg_sessions_per_user ?? 0,
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3'>
                    <p className='text-[11px] uppercase tracking-wider text-zinc-500'>
                      Product DAU
                    </p>
                    <p className='text-xl font-semibold text-white'>
                      {(activity?.signed_in_product_dau ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3'>
                    <p className='text-[11px] uppercase tracking-wider text-zinc-500'>
                      Product WAU
                    </p>
                    <p className='text-xl font-semibold text-white'>
                      {(activity?.signed_in_product_wau ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3'>
                    <p className='text-[11px] uppercase tracking-wider text-zinc-500'>
                      Product MAU
                    </p>
                    <p className='text-xl font-semibold text-white'>
                      {(activity?.signed_in_product_mau ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle>Active User Trends</CardTitle>
                <CardDescription>
                  DAU, WAU, and MAU trends ({granularity}) for {startDate} to{' '}
                  {endDate}. WAU and MAU are rolling windows anchored to each
                  day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageChart
                  data={activityUsageData}
                  series={chartSeries}
                  height={240}
                />
                <div className='mt-3 flex flex-wrap gap-2'>
                  <Button
                    variant={showProductSeries ? 'secondary' : 'outline'}
                    onClick={() => setShowProductSeries((prev) => !prev)}
                  >
                    {showProductSeries
                      ? 'Hide signed-in product series'
                      : 'Show signed-in product series'}
                  </Button>
                  <span className='text-xs text-zinc-400'>
                    {showProductSeries
                      ? 'Currently overlaying signed-in product activity.'
                      : 'Toggle to compare signed-in product activity.'}
                  </span>
                </div>
                <div className='mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-4'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: 'rgba(196,181,253,0.8)' }}
                    />
                    <span className='text-xs text-zinc-400'>
                      <span className='font-medium text-zinc-300'>DAU</span> -
                      Daily Active Users
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-2 w-2 rounded-full'
                      style={{ backgroundColor: 'rgba(129,140,248,0.9)' }}
                    />
                    <span className='text-xs text-zinc-400'>
                      <span className='font-medium text-zinc-300'>WAU</span> -
                      Weekly Active Users
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-2 w-2 rounded-full'
                      style={{ backgroundColor: 'rgba(56,189,248,0.9)' }}
                    />
                    <span className='text-xs text-zinc-400'>
                      <span className='font-medium text-zinc-300'>MAU</span> -
                      Monthly Active Users
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userGrowth && (
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    User Growth Trends
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    New signups over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
                      <MetricsCard
                        title='Total Signups'
                        value={userGrowth.totalSignups.toLocaleString()}
                        subtitle='New users in this period'
                      />
                      <MetricsCard
                        title='Growth Rate'
                        value={`${userGrowth.growthRate > 0 ? '+' : ''}${userGrowth.growthRate.toFixed(1)}%`}
                        subtitle='Period-over-period change'
                        trend={
                          userGrowth.growthRate > 0
                            ? 'up'
                            : userGrowth.growthRate < 0
                              ? 'down'
                              : 'stable'
                        }
                        change={Math.abs(userGrowth.growthRate)}
                      />
                      {userGrowth.avgDailySignups !== undefined && (
                        <MetricsCard
                          title='Avg Daily Signups'
                          value={userGrowth.avgDailySignups.toFixed(1)}
                          subtitle='Average per day'
                        />
                      )}
                    </div>
                    {userGrowth.trends && userGrowth.trends.length > 0 && (
                      <div>
                        <UsageChart
                          data={userGrowth.trends.map((t: any) => ({
                            date: t.date,
                            signups: t.signups,
                          }))}
                          series={[
                            {
                              dataKey: 'signups',
                              name: 'Signups',
                              stroke: 'rgba(249,115,22,0.9)',
                            },
                          ]}
                          height={200}
                        />
                        <div className='mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-4'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='h-3 w-3 rounded-full'
                              style={{
                                backgroundColor: 'rgba(196,181,253,0.8)',
                              }}
                            />
                            <span className='text-xs text-zinc-400'>
                              <span className='font-medium text-zinc-300'>
                                Signups
                              </span>{' '}
                              - New user registrations
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Retention & Churn
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Cohort retention ({startDate} → {endDate})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <RetentionCard
                    label='Day 1'
                    value={activity?.retention.day_1 ?? null}
                  />
                  <RetentionCard
                    label='Day 7'
                    value={activity?.retention.day_7 ?? null}
                  />
                  <RetentionCard
                    label='Day 30'
                    value={activity?.retention.day_30 ?? null}
                  />
                  <RetentionCard
                    label='Churn'
                    value={activity?.churn_rate ?? null}
                    variant='negative'
                  />
                </div>
              </CardContent>
            </Card>

            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Conversion Funnel
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Free → Trial → Paid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionFunnel
                  stages={[
                    {
                      label: 'Free Users',
                      value: conversions?.funnel.free_users ?? 0,
                      subtitle: 'Total active free accounts',
                    },
                    {
                      label: 'Trial Users',
                      value: conversions?.funnel.trial_users ?? 0,
                      subtitle: 'Currently in trial',
                    },
                    {
                      label: 'Paid Users',
                      value: conversions?.funnel.paid_users ?? 0,
                      subtitle: 'Active paid subscriptions',
                    },
                  ]}
                  dropOffPoints={conversions?.funnel.drop_off_points}
                />
              </CardContent>
            </Card>
          </section>

          {subscription30d && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Signup → Subscription ({subscription30d.window_days}d)
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Subscriptions started within {subscription30d.window_days}{' '}
                    days of a free account signup.
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4 md:grid-cols-3'>
                  <MetricsCard
                    title='Signups'
                    value={subscription30d.signups.toLocaleString()}
                  />
                  <MetricsCard
                    title='Subscriptions'
                    value={subscription30d.conversions.toLocaleString()}
                  />
                  <MetricsCard
                    title='Conversion Rate'
                    value={`${subscription30d.conversion_rate.toFixed(2)}%`}
                  />
                </CardContent>
              </Card>
            </section>
          )}

          {ctaConversions && ctaConversions.hubs.length > 0 && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    CTA Conversions by Hub
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Signups within {ctaConversions.window_days} days of a CTA
                    click
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {ctaConversions.hubs.slice(0, 8).map((hub) => (
                    <div key={hub.hub} className='space-y-2'>
                      <div className='flex items-center justify-between text-sm text-zinc-300'>
                        <span className='capitalize'>{hub.hub}</span>
                        <span className='font-semibold text-white'>
                          {Number(hub.signups_7d || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className='h-2 w-full rounded-full bg-zinc-800'>
                        <div
                          className='h-2 rounded-full bg-gradient-to-r from-lunary-primary-400 to-lunary-highlight-500'
                          style={{
                            width: `${Math.min(hub.conversion_rate ?? 0, 100)}%`,
                          }}
                        />
                      </div>
                      <div className='flex items-center justify-between text-[11px] text-zinc-500'>
                        <span>
                          {Number(hub.unique_clickers || 0).toLocaleString()}{' '}
                          clickers
                        </span>
                        <span>
                          {Number(hub.conversion_rate || 0).toFixed(2)}%
                          conversion
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          )}

          {activation && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Activation Rate
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Users who complete meaningful actions within 24h of signup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
                      <MetricsCard
                        title='Activation Rate'
                        value={`${activation.activationRate.toFixed(2)}%`}
                        subtitle={`${activation.activatedUsers} of ${activation.totalSignups} users activated`}
                      />
                      <MetricsCard
                        title='Activated Users'
                        value={activation.activatedUsers.toLocaleString()}
                        subtitle='Users who completed key actions within 24h'
                      />
                      <MetricsCard
                        title='Total Signups'
                        value={activation.totalSignups.toLocaleString()}
                        subtitle='New users in this period'
                      />
                    </div>
                    {activation.activationBreakdown &&
                      Object.keys(activation.activationBreakdown).length >
                        0 && (
                        <div className='mt-6'>
                          <h4 className='text-sm font-medium mb-3 text-zinc-300'>
                            Activation by Feature
                          </h4>
                          <div className='grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                            {Object.entries(activation.activationBreakdown).map(
                              ([feature, count]: [string, any]) => {
                                const breakdown =
                                  activation.activationBreakdownByPlan?.[
                                    feature
                                  ] || {};
                                const freeCount = breakdown.free ?? 0;
                                const paidCount = breakdown.paid ?? 0;
                                const unknownCount = breakdown.unknown ?? 0;
                                return (
                                  <div
                                    key={feature}
                                    className='rounded-lg border border-zinc-800/30 bg-zinc-900/5 p-3'
                                  >
                                    <div className='text-xs text-zinc-400 mb-1'>
                                      {feature
                                        .replace(/_/g, ' ')
                                        .replace(/\b\w/g, (c) =>
                                          c.toUpperCase(),
                                        )}
                                    </div>
                                    <div className='text-lg font-semibold text-white'>
                                      {count}
                                    </div>
                                    <div className='text-xs text-zinc-500 mt-1'>
                                      users activated
                                    </div>
                                    <div className='text-xs text-zinc-500 mt-1'>
                                      Free: {freeCount} · Paid: {paidCount}
                                      {unknownCount > 0
                                        ? ` · Unknown: ${unknownCount}`
                                        : ''}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {subscriptionLifecycle && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Subscription Lifecycle
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Status changes and churn trends ({startDate} → {endDate})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
                      {Object.entries(subscriptionLifecycle.states || {}).map(
                        ([status, count]: [string, any]) => (
                          <MetricsCard
                            key={status}
                            title={
                              status.charAt(0).toUpperCase() +
                              status.slice(1).replace(/_/g, ' ')
                            }
                            value={count.toLocaleString()}
                            subtitle={`${status} updates`}
                          />
                        ),
                      )}
                    </div>
                    <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
                      <MetricsCard
                        title='Avg Subscription Duration'
                        value={`${subscriptionLifecycle.avgDurationDays.toFixed(1)} days`}
                        subtitle='Average time users stay subscribed'
                      />
                      {subscriptionLifecycle.churnRate !== undefined && (
                        <MetricsCard
                          title='Churn Rate'
                          value={`${subscriptionLifecycle.churnRate.toFixed(2)}%`}
                          subtitle='Cancellations in this period'
                          trend={
                            subscriptionLifecycle.churnRate > 10
                              ? 'down'
                              : 'stable'
                          }
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {planBreakdown && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Plan Breakdown
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    MRR contribution by plan type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
                      {planBreakdown.planBreakdown?.map((plan: any) => (
                        <div
                          key={plan.plan}
                          className='border border-zinc-800 rounded-lg p-4'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <span className='font-medium'>{plan.plan}</span>
                            <span className='text-sm text-zinc-400'>
                              {Number(plan.percentage ?? 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className='space-y-1 text-sm'>
                            <div className='flex justify-between'>
                              <span className='text-zinc-400'>
                                Subscriptions:
                              </span>
                              <span>{plan.count}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-zinc-400'>MRR:</span>
                              <span>${Number(plan.mrr ?? 0).toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-zinc-400'>Active:</span>
                              <span>{plan.active}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {apiCosts && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    API Costs vs Revenue
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    AI generation costs and efficiency metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
                      <MetricsCard
                        title='Total API Costs'
                        value={`$${apiCosts.totalCost.toFixed(2)}`}
                        subtitle='AI generation costs this period'
                      />
                      <MetricsCard
                        title='Cost per User'
                        value={`$${apiCosts.costPerUser.toFixed(2)}`}
                        subtitle={`${apiCosts.uniqueUsers.toLocaleString()} unique users`}
                      />
                      <MetricsCard
                        title='Revenue/Cost Ratio'
                        value={apiCosts.revenueCostRatio.toFixed(2)}
                        subtitle={
                          apiCosts.revenueCostRatio > 1
                            ? 'Profitable'
                            : 'Below break-even'
                        }
                        trend={apiCosts.revenueCostRatio > 1 ? 'up' : 'down'}
                      />
                    </div>
                    <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
                      <MetricsCard
                        title='Total Generations'
                        value={apiCosts.totalGenerations.toLocaleString()}
                        subtitle='AI requests processed'
                      />
                      <MetricsCard
                        title='Unique Users'
                        value={apiCosts.uniqueUsers.toLocaleString()}
                        subtitle='Users who used AI features'
                      />
                      <MetricsCard
                        title='Cost per Session'
                        value={`$${apiCosts.costPerSession.toFixed(4)}`}
                        subtitle='Average cost per AI generation'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </TabsContent>

        <TabsContent value='details' className='space-y-10'>
          <section>
            <SuccessMetrics
              data={successMetrics}
              loading={loading && !successMetrics}
            />
          </section>

          {intentionBreakdown && intentionBreakdown.length > 0 && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Onboarding Intentions
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Popular intention selections ({startDate} → {endDate})
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {intentionBreakdown.map((item) => {
                    const label =
                      INTENTION_LABELS[item.intention] ||
                      (item.intention
                        ? item.intention.charAt(0).toUpperCase() +
                          item.intention.slice(1)
                        : 'Other');
                    return (
                      <div key={item.intention} className='space-y-2'>
                        <div className='flex items-center justify-between text-sm text-zinc-300'>
                          <span>{label}</span>
                          <span className='font-semibold text-white'>
                            {item.count.toLocaleString()}
                          </span>
                        </div>
                        <div className='h-2 w-full rounded-full bg-zinc-800'>
                          <div
                            className='h-2 rounded-full bg-gradient-to-r from-lunary-primary to-lunary-highlight'
                            style={{
                              width: `${Math.min(item.percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <p className='text-[11px] text-zinc-500'>
                          {item.percentage.toFixed(2)}% of saved intentions
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </section>
          )}

          {searchConsoleData && (
            <section>
              <SearchConsoleMetrics
                data={searchConsoleData}
                loading={loading && !searchConsoleData}
              />
            </section>
          )}

          <section className='grid grid-cols-1 gap-6'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Trigger Features
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Top conversion drivers
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {(conversions?.trigger_breakdown ?? [])
                  .slice(0, 5)
                  .map((trigger) => (
                    <div key={trigger.feature} className='space-y-2'>
                      <div className='flex items-center justify-between text-sm text-zinc-400'>
                        <span className='capitalize'>
                          {trigger.feature || 'Other'}
                        </span>
                        <span>{trigger.count.toLocaleString()}</span>
                      </div>
                      <div className='h-2 w-full rounded-full bg-zinc-800'>
                        <div
                          className='h-2 rounded-full bg-gradient-to-r from-lunary-primary-400 to-lunary-highlight-500'
                          style={{
                            width: `${Number(trigger.percentage ?? 0).toFixed(2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </section>

          <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Feature Usage Heatmap
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Past 7 days activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapGrid data={heatmapData} />
              </CardContent>
            </Card>

            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Notification Health
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Open rates by channel
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
                            {Number(type.data.click_through_rate ?? 0).toFixed(
                              1,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='grid grid-cols-1 gap-6'>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  Page Interaction
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  Pageview tracking is limited to the deduplicated Page-View DAU
                  total.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-300'>
                  We record lightweight `page_viewed` events for sitewide
                  activity totals without storing full session data.
                </div>
              </CardContent>
            </Card>
          </section>

          {discordAnalytics && (
            <section className='grid gap-6 lg:grid-cols-2'>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Discord Bot Engagement
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Command usage and interactions (last 7 days)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <MiniStat
                      label='Total Commands'
                      value={discordAnalytics.stats?.funnel?.totalCommands ?? 0}
                      icon={
                        <Activity className='h-5 w-5 text-lunary-primary-300' />
                      }
                    />
                    <MiniStat
                      label='Button Clicks'
                      value={discordAnalytics.stats?.funnel?.buttonClicks ?? 0}
                      icon={
                        <Target className='h-5 w-5 text-lunary-success-300' />
                      }
                    />
                    <MiniStat
                      label='Click-Through Rate'
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
                      label='Accounts Linked'
                      value={
                        discordAnalytics.stats?.funnel?.accountsLinked ?? 0
                      }
                      icon={<Bell className='h-5 w-5 text-lunary-accent-300' />}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Top Discord Commands
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
                  {(!discordAnalytics.stats?.commands ||
                    discordAnalytics.stats.commands.length === 0) && (
                    <div className='text-sm text-zinc-400'>
                      No Discord interactions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          <section>
            <Card className='border-zinc-800/30 bg-zinc-900/10'>
              <CardHeader>
                <CardTitle className='text-base font-medium'>
                  SEO & Attribution
                </CardTitle>
                <CardDescription className='text-xs text-zinc-400'>
                  First-touch attribution tracking for organic and marketing
                  channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttributionMetrics startDate={startDate} endDate={endDate} />
              </CardContent>
            </Card>
          </section>

          {cohorts && cohorts.cohorts && cohorts.cohorts.length > 0 && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Cohort Retention Analysis
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Retention by signup cohort
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='mb-4 text-xs text-zinc-400'>
                    Shows what % of users from each signup week/month returned
                    after 1, 7, and 30 days
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-left text-sm'>
                      <thead>
                        <tr className='border-b border-zinc-800'>
                          <th className='pb-3 text-xs font-medium text-zinc-400'>
                            Cohort Week
                          </th>
                          <th className='pb-3 text-xs font-medium text-zinc-400 text-right'>
                            Cohort Size
                          </th>
                          <th className='pb-3 text-xs font-medium text-zinc-400 text-right'>
                            Day 1 Retention
                          </th>
                          <th className='pb-3 text-xs font-medium text-zinc-400 text-right'>
                            Day 7 Retention
                          </th>
                          <th className='pb-3 text-xs font-medium text-zinc-400 text-right'>
                            Day 30 Retention
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohorts.cohorts.map((cohort: any, idx: number) => {
                          const formatDate = (dateStr: string) => {
                            const date = new Date(dateStr);
                            return date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                          };
                          return (
                            <tr
                              key={idx}
                              className='border-b border-zinc-800/50 hover:bg-zinc-900/20'
                            >
                              <td className='py-3 text-zinc-300 font-medium'>
                                {formatDate(cohort.cohort)}
                              </td>
                              <td className='py-3 text-zinc-300 text-right'>
                                {cohort.day0.toLocaleString()}
                              </td>
                              <td
                                className={`py-3 text-right font-medium ${
                                  cohort.day1 > 0
                                    ? 'text-lunary-success-300'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {Number(cohort.day1 ?? 0).toFixed(1)}%
                              </td>
                              <td
                                className={`py-3 text-right font-medium ${
                                  cohort.day7 > 0
                                    ? 'text-lunary-success-300'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {Number(cohort.day7 ?? 0).toFixed(1)}%
                              </td>
                              <td
                                className={`py-3 text-right font-medium ${
                                  cohort.day30 > 0
                                    ? 'text-lunary-success-300'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {Number(cohort.day30 ?? 0).toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {cohorts.cohorts.every(
                    (c: any) => c.day1 === 0 && c.day7 === 0 && c.day30 === 0,
                  ) && (
                    <div className='mt-4 rounded-lg border border-zinc-800/30 bg-zinc-900/10 p-3 text-xs text-zinc-400'>
                      <strong>Note:</strong> Retention metrics require users to
                      return after their signup date. If all values are 0%, it
                      means users haven&apos;t returned yet or the time windows
                      haven&apos;t elapsed.
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {userSegments && (
            <section>
              <Card className='border-zinc-800/30 bg-zinc-900/10'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Free vs Paid User Engagement
                  </CardTitle>
                  <CardDescription className='text-xs text-zinc-400'>
                    Engagement comparison by user segment (event-based)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='mb-4 text-xs text-zinc-500'>
                    Uses app event activity in the selected date range. This is
                    a different view than deduplicated app opens (DAU/WAU/MAU).
                  </div>
                  <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
                    <div className='rounded-lg border border-zinc-800/30 bg-zinc-900/5 p-4'>
                      <h4 className='text-sm font-semibold mb-4 text-zinc-300'>
                        Free Users
                      </h4>
                      <div className='space-y-3'>
                        <MetricsCard
                          title='Total Users'
                          value={(
                            userSegments.free?.totalUsers || 0
                          ).toLocaleString()}
                          subtitle='Free tier users'
                        />
                        <MetricsCard
                          title='Active Users (events)'
                          value={(userSegments.free?.dau || 0).toLocaleString()}
                          subtitle='Active via app events in range'
                        />
                        <MetricsCard
                          title='Avg Events per User'
                          value={(
                            userSegments.free?.engagement?.avgEventsPerUser || 0
                          ).toFixed(2)}
                          subtitle='Average engagement level'
                        />
                      </div>
                    </div>
                    <div className='rounded-lg border border-zinc-800/30 bg-zinc-900/5 p-4'>
                      <h4 className='text-sm font-semibold mb-4 text-zinc-300'>
                        Paid Users
                      </h4>
                      <div className='space-y-3'>
                        <MetricsCard
                          title='Total Users'
                          value={(
                            userSegments.paid?.totalUsers || 0
                          ).toLocaleString()}
                          subtitle='Active paid subscribers'
                        />
                        <MetricsCard
                          title='Active Users (events)'
                          value={(userSegments.paid?.dau || 0).toLocaleString()}
                          subtitle='Active via app events in range'
                        />
                        <MetricsCard
                          title='Avg Events per User'
                          value={(
                            userSegments.paid?.engagement?.avgEventsPerUser || 0
                          ).toFixed(2)}
                          subtitle='Average engagement level'
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
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

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className='rounded-xl border border-zinc-800/20 bg-zinc-900/5 p-3'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-zinc-400'>
        {icon}
        {label}
      </div>
      <div className='mt-2 text-xl font-light tracking-tight text-white'>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
