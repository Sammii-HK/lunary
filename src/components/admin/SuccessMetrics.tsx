'use client';

import { ArrowDownRight, ArrowUpRight, Minus, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Trend = 'up' | 'down' | 'stable';

interface MetricData {
  value: number;
  trend: Trend;
  change: number;
  target?: { min: number; max: number } | null;
}

interface SearchMetricData {
  impressions: number;
  clicks: number;
  ctr: number;
  trend: Trend;
  change: number;
  note?: string;
}

interface SuccessMetricsData {
  daily_active_users: MetricData;
  weekly_returning_users: MetricData;
  conversion_rate: MetricData;
  search_impressions_clicks: SearchMetricData;
  monthly_recurring_revenue: MetricData;
  annual_recurring_revenue: MetricData;
  active_subscriptions: MetricData;
  arpu?: MetricData;
  trial_conversion_rate: MetricData;
  ai_chat_messages: MetricData;
  substack_subscribers: MetricData;
}

interface SuccessMetricsProps {
  data: SuccessMetricsData | null;
  loading?: boolean;
}

export function SuccessMetrics({ data, loading }: SuccessMetricsProps) {
  if (loading || !data) {
    return (
      <Card className='border-zinc-800 bg-zinc-950/40'>
        <CardHeader>
          <CardTitle>Success Metrics</CardTitle>
          <CardDescription>Loading metrics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Daily Active Users (PostHog)',
      value: data.daily_active_users.value,
      trend: data.daily_active_users.trend,
      change: data.daily_active_users.change,
      target: null,
      format: (v: number) => v.toLocaleString(),
      subtitle: 'Source: PostHog active users',
    },
    {
      label: 'Weekly Active Users (PostHog)',
      value: data.weekly_returning_users.value,
      trend: data.weekly_returning_users.trend,
      change: data.weekly_returning_users.change,
      target: null,
      format: (v: number) => v.toLocaleString(),
      subtitle: 'Source: PostHog active users',
    },
    {
      label: 'Conversion Rate',
      value: data.conversion_rate.value,
      trend: data.conversion_rate.trend,
      change: data.conversion_rate.change,
      target: data.conversion_rate.target,
      format: (v: number) => `${v.toFixed(2)}%`,
    },
    {
      label: 'Search Impressions + Clicks',
      value:
        data.search_impressions_clicks.impressions +
        data.search_impressions_clicks.clicks,
      trend: data.search_impressions_clicks.trend,
      change: data.search_impressions_clicks.change,
      target: null,
      format: (v: number) => {
        if (
          data.search_impressions_clicks.impressions === 0 &&
          data.search_impressions_clicks.clicks === 0
        ) {
          return 'Not configured';
        }
        return `${data.search_impressions_clicks.impressions.toLocaleString()} impressions, ${data.search_impressions_clicks.clicks.toLocaleString()} clicks`;
      },
      subtitle: data.search_impressions_clicks.note,
    },
    {
      label: 'Monthly Recurring Revenue',
      value: data.monthly_recurring_revenue.value,
      trend: data.monthly_recurring_revenue.trend,
      change: data.monthly_recurring_revenue.change,
      target: null,
      format: (v: number) =>
        `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      label: 'Annual Recurring Revenue',
      value: data.annual_recurring_revenue.value,
      trend: data.annual_recurring_revenue.trend,
      change: data.annual_recurring_revenue.change,
      target: null,
      format: (v: number) =>
        `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      label: 'Active Subscriptions',
      value: data.active_subscriptions.value,
      trend: data.active_subscriptions.trend,
      change: data.active_subscriptions.change,
      target: null,
      format: (v: number) => v.toLocaleString(),
    },
    ...(data.arpu
      ? [
          {
            label: 'ARPU',
            value: data.arpu.value,
            trend: data.arpu.trend,
            change: data.arpu.change,
            target: null,
            format: (v: number) =>
              `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          },
        ]
      : []),
    {
      label: 'Trial Conversion Rate',
      value: data.trial_conversion_rate.value,
      trend: data.trial_conversion_rate.trend,
      change: data.trial_conversion_rate.change,
      target: data.trial_conversion_rate.target,
      format: (v: number) => `${v.toFixed(2)}%`,
    },
    {
      label: 'AI Chat Messages',
      value: data.ai_chat_messages.value,
      trend: data.ai_chat_messages.trend,
      change: data.ai_chat_messages.change,
      target: null,
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Push Subscribers',
      value: data.substack_subscribers.value,
      trend: data.substack_subscribers.trend,
      change: data.substack_subscribers.change,
      target: null,
      format: (v: number) => v.toLocaleString(),
    },
  ];

  return (
    <Card className='border-zinc-800/30 bg-zinc-900/10'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Target className='h-4 w-4 text-lunary-primary-400/70' />
          <CardTitle className='text-base font-medium'>
            Success Metrics
          </CardTitle>
        </div>
        <CardDescription className='text-xs text-zinc-400'>
          Key performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              formattedValue={metric.format(metric.value)}
              trend={metric.trend}
              change={metric.change}
              target={metric.target}
              subtitle={metric.subtitle}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  formattedValue,
  trend,
  change,
  target,
  subtitle,
}: {
  label: string;
  value: number;
  formattedValue: string;
  trend: Trend;
  change: number;
  target?: { min: number; max: number } | null;
  subtitle?: string;
}) {
  const trendColors = {
    up: 'text-lunary-success',
    down: 'text-lunary-error',
    stable: 'text-zinc-400',
  };

  const trendBgColors = {
    up: 'bg-lunary-success-900/20 border-lunary-success-800',
    down: 'bg-lunary-error-900/20 border-lunary-error-800',
    stable: 'bg-zinc-900/40 border-zinc-800',
  };

  const TrendIcon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  const isInTargetRange = target && value >= target.min && value <= target.max;

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-colors',
        trendBgColors[trend],
      )}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='text-xs font-medium text-zinc-400'>{label}</div>
          <div className='mt-2 text-xl font-light tracking-tight text-white'>
            {formattedValue}
          </div>
          {subtitle && (
            <div className='mt-1 text-xs text-zinc-600'>{subtitle}</div>
          )}
        </div>
        <div className='flex flex-col items-end gap-1'>
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trendColors[trend],
            )}
          >
            <TrendIcon className='h-3 w-3' />
            {change !== 0 && `${Math.abs(change).toFixed(1)}%`}
            {change === 0 && trend === 'stable' && '—'}
          </div>
          {target && (
            <div
              className={cn(
                'mt-1 flex items-center gap-1 text-xs',
                isInTargetRange ? 'text-lunary-success' : 'text-lunary-accent',
              )}
            >
              <Target className='h-3 w-3' />
              {target.min}–{target.max}%
            </div>
          )}
        </div>
      </div>
      {target && (
        <div className='mt-3'>
          <div className='mb-1 flex items-center justify-between text-xs text-zinc-400'>
            <span>Target Range</span>
            <span
              className={cn(
                isInTargetRange ? 'text-lunary-success' : 'text-lunary-accent',
              )}
            >
              {isInTargetRange ? '✓ In Range' : '⚠ Outside Range'}
            </span>
          </div>
          <div className='h-2 w-full rounded-full bg-zinc-800'>
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                isInTargetRange
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400',
              )}
              style={{
                width: `${Math.min((value / target.max) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
