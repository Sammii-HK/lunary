'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
} from 'lucide-react';

interface ConversionMetrics {
  totalSignups: number;
  trialStarted: number;
  trialConverted: number;
  subscriptionStarted: number;
  conversionRate: number;
  trialConversionRate: number;
  avgTimeToConvert: number;
  revenue: number;
  mrr: number;
}

interface ConversionFunnel {
  signups: number;
  trials: number;
  conversions: number;
  activeSubscriptions: number;
}

interface EventData {
  event_type: string;
  count: number;
  percentage: number;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>(
    '30d',
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/analytics?timeRange=${timeRange}`,
      );
      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
        setFunnel(data.funnel);
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <Activity className='h-8 w-8' />
          Conversion Analytics
        </h1>
        <p className='text-muted-foreground'>
          Track user conversions, trials, and subscription metrics
        </p>
      </div>

      <div className='mb-6 flex gap-2'>
        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {range === '7d'
              ? '7 Days'
              : range === '30d'
                ? '30 Days'
                : range === '90d'
                  ? '90 Days'
                  : 'All Time'}
          </button>
        ))}
      </div>

      {metrics && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Signups
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{metrics.totalSignups}</div>
                <p className='text-xs text-muted-foreground'>
                  New user registrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Trials Started
                </CardTitle>
                <Zap className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{metrics.trialStarted}</div>
                <p className='text-xs text-muted-foreground'>
                  {metrics.totalSignups > 0
                    ? formatPercentage(
                        (metrics.trialStarted / metrics.totalSignups) * 100,
                      )
                    : '0%'}{' '}
                  of signups
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Conversion Rate
                </CardTitle>
                <Target className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatPercentage(metrics.conversionRate)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Signup → Paid conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>MRR</CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {formatCurrency(metrics.mrr)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Monthly recurring revenue
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>
                  User journey from signup to subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                {funnel && (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 bg-zinc-900 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        <span className='font-medium'>Signups</span>
                      </div>
                      <span className='text-2xl font-bold'>
                        {funnel.signups}
                      </span>
                    </div>

                    <div className='flex items-center justify-center'>
                      <ArrowDownRight className='w-6 h-6 text-zinc-600' />
                      <span className='text-xs text-zinc-500 ml-2'>
                        {funnel.signups > 0
                          ? formatPercentage(
                              (funnel.trials / funnel.signups) * 100,
                            )
                          : '0%'}
                      </span>
                    </div>

                    <div className='flex items-center justify-between p-4 bg-zinc-900 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                        <span className='font-medium'>Trials Started</span>
                      </div>
                      <span className='text-2xl font-bold'>
                        {funnel.trials}
                      </span>
                    </div>

                    <div className='flex items-center justify-center'>
                      <ArrowDownRight className='w-6 h-6 text-zinc-600' />
                      <span className='text-xs text-zinc-500 ml-2'>
                        {funnel.trials > 0
                          ? formatPercentage(
                              (funnel.conversions / funnel.trials) * 100,
                            )
                          : '0%'}
                      </span>
                    </div>

                    <div className='flex items-center justify-between p-4 bg-purple-900/30 rounded-lg border border-purple-500/30'>
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <span className='font-medium'>Conversions</span>
                      </div>
                      <span className='text-2xl font-bold text-green-400'>
                        {funnel.conversions}
                      </span>
                    </div>

                    <div className='flex items-center justify-center'>
                      <ArrowDownRight className='w-6 h-6 text-zinc-600' />
                    </div>

                    <div className='flex items-center justify-between p-4 bg-green-900/30 rounded-lg border border-green-500/30'>
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <span className='font-medium'>
                          Active Subscriptions
                        </span>
                      </div>
                      <span className='text-2xl font-bold text-green-400'>
                        {funnel.activeSubscriptions}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 bg-zinc-900 rounded-lg'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Trial Conversion Rate
                      </p>
                      <p className='text-2xl font-bold mt-1'>
                        {formatPercentage(metrics.trialConversionRate)}
                      </p>
                    </div>
                    <TrendingUp className='h-8 w-8 text-green-400' />
                  </div>

                  <div className='flex items-center justify-between p-4 bg-zinc-900 rounded-lg'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Avg Time to Convert
                      </p>
                      <p className='text-2xl font-bold mt-1'>
                        {metrics.avgTimeToConvert.toFixed(1)} days
                      </p>
                    </div>
                    <Clock className='h-8 w-8 text-blue-400' />
                  </div>

                  <div className='flex items-center justify-between p-4 bg-zinc-900 rounded-lg'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Total Revenue
                      </p>
                      <p className='text-2xl font-bold mt-1'>
                        {formatCurrency(metrics.revenue)}
                      </p>
                    </div>
                    <DollarSign className='h-8 w-8 text-purple-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Breakdown</CardTitle>
              <CardDescription>
                Conversion events by type ({timeRange})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {events.map((event, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-4 bg-zinc-900 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                      <span className='font-medium capitalize'>
                        {event.event_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='w-32 bg-zinc-800 rounded-full h-2'>
                        <div
                          className='bg-purple-500 h-2 rounded-full'
                          style={{ width: `${event.percentage}%` }}
                        ></div>
                      </div>
                      <span className='text-lg font-bold w-16 text-right'>
                        {event.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
