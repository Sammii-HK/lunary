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
import { PostHogHeatmap } from '@/components/admin/PostHogHeatmap';
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
  returning_users: number;
  retention: {
    day_1: number;
    day_7: number;
    day_30: number;
  };
  churn_rate: number;
  trends: ActivityTrend[];
};

type AiMode = {
  mode: string;
  count: number;
  percentage: number;
};

type AiResponse = {
  total_sessions: number;
  unique_users: number;
  avg_sessions_per_user: number;
  avg_tokens_per_user: number;
  avg_messages_per_session: number;
  completion_rate: number;
  mode_breakdown: AiMode[];
  trends: Array<{ date: string; sessions: number; tokens: number }>;
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

const DEFAULT_RANGE_DAYS = 30;

const formatDateInput = (date: Date) => date.toISOString().split('T')[0];

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
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [aiMetrics, setAiMetrics] = useState<AiResponse | null>(null);
  const [conversions, setConversions] = useState<ConversionResponse | null>(
    null,
  );
  const [notifications, setNotifications] =
    useState<NotificationResponse | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageResponse | null>(
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = `start_date=${startDate}&end_date=${endDate}`;

    try {
      const [
        activityRes,
        aiRes,
        conversionsRes,
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
      ] = await Promise.all([
        fetch(
          `/api/admin/analytics/dau-wau-mau?${queryParams}&granularity=${granularity}`,
        ),
        fetch(`/api/admin/analytics/ai-engagement?${queryParams}`),
        fetch(`/api/admin/analytics/conversions?${queryParams}`),
        fetch(`/api/admin/analytics/notifications?${queryParams}`),
        fetch(`/api/admin/analytics/feature-usage?${queryParams}`),
        fetch(`/api/admin/analytics/success-metrics?${queryParams}`),
        fetch(`/api/analytics/discord-interactions?range=7d`),
        fetch(`/api/admin/analytics/search-console?${queryParams}`),
        fetch(
          `/api/admin/analytics/user-growth?${queryParams}&granularity=${granularity}`,
        ),
        fetch(`/api/admin/analytics/activation?${queryParams}`),
        fetch(`/api/admin/analytics/subscription-lifecycle?${queryParams}`),
        fetch(`/api/admin/analytics/plan-breakdown?${queryParams}`),
        fetch(`/api/admin/analytics/api-costs?${queryParams}`),
        fetch(`/api/admin/analytics/cohorts?${queryParams}&type=week&weeks=12`),
        fetch(`/api/admin/analytics/user-segments?${queryParams}`),
      ]);

      const errors: string[] = [];

      if (activityRes.ok) {
        setActivity(await activityRes.json());
      } else {
        errors.push('DAU/WAU/MAU');
      }

      if (aiRes.ok) {
        setAiMetrics(await aiRes.json());
      } else {
        errors.push('AI engagement');
      }

      if (conversionsRes.ok) {
        setConversions(await conversionsRes.json());
      } else {
        errors.push('Conversions');
      }

      if (notificationsRes.ok) {
        setNotifications(await notificationsRes.json());
      } else {
        errors.push('Notifications');
      }

      if (featureUsageRes.ok) {
        setFeatureUsage(await featureUsageRes.json());
      } else {
        const data = await featureUsageRes.json().catch(() => ({}));
        if (data.error?.includes('PostHog')) {
          setFeatureUsage({ features: [], heatmap: [] });
        } else {
          errors.push('Feature usage');
        }
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
    const rows: string[][] = [['Section', 'Metric', 'Value']];

    if (activity) {
      rows.push(
        ['Activity', 'DAU', String(activity.dau)],
        ['Activity', 'Returning Users', String(activity.returning_users ?? 0)],
        ['Activity', 'WAU', String(activity.wau)],
        ['Activity', 'MAU', String(activity.mau)],
        [
          'Activity',
          'Churn Rate',
          `${Number(activity.churn_rate ?? 0).toFixed(2)}%`,
        ],
      );
    }

    if (aiMetrics) {
      rows.push(
        ['AI Engagement', 'Total Sessions', String(aiMetrics.total_sessions)],
        ['AI Engagement', 'Unique Users', String(aiMetrics.unique_users)],
        [
          'AI Engagement',
          'Avg Sessions/User',
          aiMetrics.avg_sessions_per_user.toFixed(2),
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
        rows.push([
          'Feature Usage',
          feature.feature,
          feature.total_events.toString(),
        ]);
      });
    }

    const csv = rows.map((row) => row.join(',')).join('\n');
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

  type OverviewCard = {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  };

  const overviewCards: OverviewCard[] = [
    {
      title: 'Daily Active Users',
      value: activity?.dau ?? 0,
      subtitle: 'Users active yesterday',
    },
    {
      title: 'Returning Users',
      value: activity?.returning_users ?? 0,
      subtitle: `${
        activity?.dau
          ? Math.round(((activity.returning_users ?? 0) / activity.dau) * 100)
          : 0
      }% of DAU`,
    },
    {
      title: 'Weekly Active Users',
      value: activity?.wau ?? 0,
      subtitle: 'Unique users in last 7 days',
    },
    {
      title: 'Monthly Active Users',
      value: activity?.mau ?? 0,
      subtitle: 'Unique users in last 30 days',
    },
    {
      title: 'Conversion Rate',
      value: conversions ? `${conversions.conversion_rate.toFixed(1)}%` : '—',
      subtitle: 'Free → Paid',
      change: conversions?.trial_conversion_rate,
      trend:
        (conversions?.trial_conversion_rate ?? 0) >=
        (conversions?.conversion_rate ?? 0)
          ? 'up'
          : 'down',
    },
    {
      title: 'AI Engagement',
      value: aiMetrics?.avg_sessions_per_user
        ? aiMetrics.avg_sessions_per_user.toFixed(2)
        : '—',
      subtitle: 'Avg sessions per engaged user',
    },
    {
      title: 'Notification Open Rate',
      value: notifications
        ? `${notifications.overall_open_rate.toFixed(1)}%`
        : '—',
      subtitle: 'Across all notification types',
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
    !aiMetrics &&
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
            Engagement & Growth
          </h1>
          <p className='text-sm text-zinc-400'>
            Monitor active usage, AI engagement, conversions, and feature
            adoption
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

          <Button
            variant='ghost'
            onClick={handleExport}
            className='h-9 gap-1.5 rounded-xl border-0 bg-transparent px-3 text-xs text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-300'
          >
            <Download className='h-3.5 w-3.5' />
            Export
          </Button>

          <Button
            onClick={fetchAnalytics}
            className='h-9 gap-1.5 rounded-xl bg-lunary-primary-600/90 px-3 text-xs text-white hover:bg-lunary-primary-600'
          >
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

      <section>
        <SuccessMetrics
          data={successMetrics}
          loading={loading && !successMetrics}
        />
      </section>

      {searchConsoleData && (
        <section>
          <SearchConsoleMetrics
            data={searchConsoleData}
            loading={loading && !searchConsoleData}
          />
        </section>
      )}

      <section className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        {overviewCards.map((card) => (
          <MetricsCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            trend={card.trend}
            subtitle={card.subtitle}
          />
        ))}
      </section>

      <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card className='border-zinc-800/30 bg-zinc-900/10'>
          <CardHeader>
            <CardTitle>Active User Trends</CardTitle>
            <CardDescription>
              DAU, WAU, and MAU trends ({granularity})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultiLineChart data={activity?.trends ?? []} />
            <div className='mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-4'>
              <div className='flex items-center gap-2'>
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: 'rgba(196,181,253,0.8)' }}
                />
                <span className='text-xs text-zinc-400'>
                  <span className='font-medium text-zinc-300'>DAU</span> - Daily
                  Active Users
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
                value={activity?.retention.day_1 ?? 0}
              />
              <RetentionCard
                label='Day 7'
                value={activity?.retention.day_7 ?? 0}
              />
              <RetentionCard
                label='Day 30'
                value={activity?.retention.day_30 ?? 0}
              />
              <RetentionCard
                label='Churn'
                value={activity?.churn_rate ?? 0}
                variant='negative'
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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
              AI Mode Breakdown
            </CardTitle>
            <CardDescription className='text-xs text-zinc-400'>
              Usage by mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModeBreakdown modes={aiMetrics?.mode_breakdown ?? []} />
          </CardContent>
        </Card>

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
      </section>

      <section className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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
                        {Number(type.data.click_through_rate ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='border-zinc-800/30 bg-zinc-900/10'>
          <CardHeader>
            <CardTitle className='text-base font-medium'>
              AI Usage Summary
            </CardTitle>
            <CardDescription className='text-xs text-zinc-400'>
              Engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <MiniStat
                label='Total Sessions'
                value={aiMetrics?.total_sessions ?? 0}
                icon={<Sparkles className='h-5 w-5 text-lunary-primary-300' />}
              />
              <MiniStat
                label='Unique Users'
                value={aiMetrics?.unique_users ?? 0}
                icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
              />
              <MiniStat
                label='Tokens / User'
                value={
                  aiMetrics ? aiMetrics.avg_tokens_per_user.toFixed(0) : '—'
                }
                icon={<Target className='h-5 w-5 text-lunary-secondary-300' />}
              />
              <MiniStat
                label='Completion Rate'
                value={
                  aiMetrics ? `${aiMetrics.completion_rate.toFixed(1)}%` : '—'
                }
                icon={<Sparkles className='h-5 w-5 text-lunary-accent-300' />}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className='border-zinc-800/30 bg-zinc-900/10'>
          <CardHeader>
            <CardTitle className='text-base font-medium'>
              Page-Level Heatmaps
            </CardTitle>
            <CardDescription className='text-xs text-zinc-400'>
              User interaction patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostHogHeatmap />
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
                  icon={<Target className='h-5 w-5 text-lunary-success-300' />}
                />
                <MiniStat
                  label='Click-Through Rate'
                  value={
                    discordAnalytics.stats?.funnel?.clickThroughRate
                      ? `${discordAnalytics.stats.funnel.clickThroughRate}%`
                      : '—'
                  }
                  icon={
                    <Sparkles className='h-5 w-5 text-lunary-secondary-300' />
                  }
                />
                <MiniStat
                  label='Accounts Linked'
                  value={discordAnalytics.stats?.funnel?.accountsLinked ?? 0}
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
                            discordAnalytics.stats?.commands?.[0]?.total_uses >
                            0
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

      {userGrowth && (
        <section>
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
                    <MultiLineChart
                      data={userGrowth.trends.map((t: any) => ({
                        date: t.date,
                        dau: t.signups,
                        wau: 0,
                        mau: 0,
                      }))}
                    />
                    <div className='mt-4 flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-4'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{ backgroundColor: 'rgba(196,181,253,0.8)' }}
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
                  Object.keys(activation.activationBreakdown).length > 0 && (
                    <div className='mt-6'>
                      <h4 className='text-sm font-medium mb-3 text-zinc-300'>
                        Activation by Feature
                      </h4>
                      <div className='grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                        {Object.entries(activation.activationBreakdown).map(
                          ([feature, count]: [string, any]) => (
                            <div
                              key={feature}
                              className='rounded-lg border border-zinc-800/30 bg-zinc-900/5 p-3'
                            >
                              <div className='text-xs text-zinc-400 mb-1'>
                                {feature
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </div>
                              <div className='text-lg font-semibold text-white'>
                                {count}
                              </div>
                              <div className='text-xs text-zinc-500 mt-1'>
                                users activated
                              </div>
                            </div>
                          ),
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
                Subscription states and churn trends
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
                        subtitle={`${status} subscriptions`}
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
                        subscriptionLifecycle.churnRate > 10 ? 'down' : 'stable'
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
                          <span className='text-zinc-400'>Subscriptions:</span>
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
                Shows what % of users from each signup week/month returned after
                1, 7, and 30 days
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
                  return after their signup date. If all values are 0%, it means
                  users haven't returned yet or the time windows haven't
                  elapsed.
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
                Engagement comparison by user segment
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      title='Daily Active Users'
                      value={(userSegments.free?.dau || 0).toLocaleString()}
                      subtitle='Active in the last 24 hours'
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
                      title='Daily Active Users'
                      value={(userSegments.paid?.dau || 0).toLocaleString()}
                      subtitle='Active in the last 24 hours'
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
  value: number;
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
        {value.toFixed(1)}%
      </div>
    </div>
  );
}

function ModeBreakdown({ modes }: { modes: AiMode[] }) {
  if (!modes.length) {
    return (
      <div className='text-sm text-zinc-400'>No AI usage data available.</div>
    );
  }

  const max = Math.max(...modes.map((mode) => Number(mode.percentage ?? 0)), 1);

  return (
    <div className='space-y-3'>
      {modes.map((mode) => (
        <div key={mode.mode}>
          <div className='flex items-center justify-between text-sm text-zinc-400'>
            <span className='capitalize'>{mode.mode || 'general'}</span>
            <span>{Number(mode.percentage ?? 0).toFixed(1)}%</span>
          </div>
          <div className='h-2 rounded-full bg-zinc-800'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-sky-400 to-lunary-primary-500'
              style={{
                width: `${(Number(mode.percentage ?? 0) / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
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
