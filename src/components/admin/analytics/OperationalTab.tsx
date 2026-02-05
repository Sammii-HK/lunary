'use client';

import {
  Activity,
  Bell,
  CheckCircle,
  Info,
  Loader2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConversionFunnel } from '@/components/admin/ConversionFunnel';
import { MetricTable } from '@/components/admin/MetricTable';
import { MiniStat } from '@/components/admin/MiniStat';
import { StatSection } from '@/components/admin/StatSection';
import { SearchConsoleMetrics } from '@/components/admin/SearchConsoleMetrics';
import { HeatmapGrid } from '@/components/admin/HeatmapGrid';
import type {
  AnalyticsDataState,
  AnalyticsDataActions,
  NotificationBucket,
} from '@/hooks/useAnalyticsData';
import {
  describeTrend,
  ACTIVATION_FEATURES,
  type MomentumRow,
} from '@/hooks/useAnalyticsComputations';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OperationalTabProps {
  data: AnalyticsDataState & AnalyticsDataActions;
  computed: {
    productMauCurrentWeek: number;
    totalAccountsEver: number;
    allTimeTotalProductUsers: number;
    allTimeReturningUsers: number;
    allTimeMedianActiveDays: number | null;
    totalAttributedUsers: number;
    organicAttributedUsers: number;
    organicAttributionPercentage: string;
    signup30dSignups: number;
    signup30dSubscriptions: number;
    signup30dRate: string;
    activationRateDisplay: string;
    activationTotalSignups: number;
    activationActivatedUsers: number;
    ctaHubs: any[];
    ctaLocationMetrics: any[];
    lifecycleStateEntries: [string, number][];
    conversionStages: Array<{ label: string; value: number }>;
    conversionDropOff: any[];
    integrityWarnings: string[];
    siteMomentumRows: MomentumRow[];
    productMomentumRows: MomentumRow[];
    activationMomentumRows: MomentumRow[];
    heatmapData: Array<{
      date: string;
      entries: Array<{ feature: string; value: number }>;
    }>;
    reachMau: number;
    engagedMau: number;
    grimoireMau: number;
    grimoireOnlyMau: number;
    notificationTypes: Array<{
      key: string;
      label: string;
      data: NotificationBucket;
    }>;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function OperationalTab({ data, computed }: OperationalTabProps) {
  const {
    activity,
    engagementOverview,
    grimoireHealth,
    conversionInfluence,
    activation,
    attribution,
    ctaConversions,
    subscription30d,
    subscriptionLifecycle,
    planBreakdown,
    apiCosts,
    cohorts,
    discordAnalytics,
    searchConsoleData,
    grimoireTopPages,
    loading,
  } = data;

  const {
    productMauCurrentWeek,
    totalAccountsEver,
    allTimeTotalProductUsers,
    allTimeReturningUsers,
    allTimeMedianActiveDays,
    totalAttributedUsers,
    organicAttributedUsers,
    organicAttributionPercentage,
    signup30dSignups,
    signup30dSubscriptions,
    signup30dRate,
    activationRateDisplay,
    activationTotalSignups,
    activationActivatedUsers,
    ctaHubs,
    ctaLocationMetrics,
    lifecycleStateEntries,
    conversionStages,
    conversionDropOff,
    integrityWarnings,
    siteMomentumRows,
    productMomentumRows,
    activationMomentumRows,
    heatmapData,
    reachMau,
    engagedMau,
    grimoireMau,
    grimoireOnlyMau,
    notificationTypes,
  } = computed;

  return (
    <div className='space-y-10'>
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
                    Signed-in users who used app features like horoscope, tarot,
                    chart viewing. This is our{' '}
                    <strong>north star metric</strong> for product engagement.
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
                    Users who only viewed grimoire educational content without
                    signing in.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrity Warnings */}
      {integrityWarnings.length > 0 && (
        <div className='rounded-xl border border-lunary-warning-600/40 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-200'>
          <p className='text-xs text-zinc-400 font-medium'>
            Integrity warnings
          </p>
          <ul className='mt-2 space-y-1 text-xs text-zinc-300'>
            {integrityWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* All-Time Product Footprint */}
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
              icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='Product users (signed-in, range)'
              value={allTimeTotalProductUsers}
              icon={<Sparkles className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='Total returning users (all-time)'
              value={allTimeReturningUsers}
              icon={<Activity className='h-5 w-5 text-lunary-secondary-300' />}
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

      {/* SEO & Attribution */}
      <section className='space-y-3'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>
            SEO & Attribution
          </h2>
          <p className='text-xs text-zinc-500'>
            First-touch attribution tracking for organic and marketing channels.
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
                icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
              />
              <MiniStat
                label='Organic (SEO) Users'
                value={organicAttributedUsers}
                icon={<Target className='h-5 w-5 text-lunary-success-300' />}
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
                    render: (_: any, row: any) =>
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

      {/* Signup → Subscription (30d) */}
      <section className='space-y-3'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>
            Signup -&gt; Subscription (30d)
          </h2>
          <p className='text-xs text-zinc-500'>
            Tracks new free accounts that converted to paid within 30 days of
            signup.
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

      {/* CTA Conversions */}
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

      {/* CTA Location Breakdown - Inline vs Full nudge */}
      <section className='space-y-3'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>
            CTA Performance by Location
          </h2>
          <p className='text-xs text-zinc-500'>
            Compare inline (after TL;DR) vs full CTA (bottom of page)
            performance.
          </p>
        </div>
        <Card className='border-zinc-800/30 bg-zinc-900/10'>
          <CardHeader>
            <CardTitle className='text-base font-medium'>
              Inline vs Full CTA comparison
            </CardTitle>
            <CardDescription className='text-xs text-zinc-400'>
              Track which CTA position converts better. CTR = clicks /
              impressions. Conversion = signups / clickers (7d window).
            </CardDescription>
          </CardHeader>
          <CardContent className='overflow-x-auto'>
            <MetricTable
              columns={[
                { label: 'Location', key: 'location_label', type: 'text' },
                {
                  label: 'Impressions',
                  key: 'total_impressions',
                  type: 'number',
                  align: 'right',
                },
                {
                  label: 'Clicks',
                  key: 'total_clicks',
                  type: 'number',
                  align: 'right',
                },
                {
                  label: 'CTR %',
                  key: 'click_through_rate',
                  type: 'percentage',
                  align: 'right',
                  decimals: 2,
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
              data={ctaLocationMetrics}
              emptyMessage='No CTA location data for this range. Data will appear after the inline nudge is deployed.'
            />
          </CardContent>
        </Card>
      </section>

      {/* Activation Rate */}
      <section className='space-y-3'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>Activation Rate</h2>
          <p className='text-xs text-zinc-500'>
            Users who completed 1+ key action within 24 hours of signup.
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
                icon={<Sparkles className='h-5 w-5 text-lunary-primary-300' />}
              />
              <MiniStat
                label='Activated Users'
                value={activationActivatedUsers}
                icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
              />
              <MiniStat
                label='Total Signups'
                value={activationTotalSignups}
                icon={<Target className='h-5 w-5 text-lunary-secondary-300' />}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Activation by Feature */}
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
                total: activation?.activationBreakdown?.[feature.event] ?? 0,
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

      {/* Momentum */}
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
            <CardTitle className='text-base font-medium'>Momentum</CardTitle>
            <CardDescription className='text-xs text-zinc-400'>
              Site momentum uses app_opened. Product momentum uses signed-in
              product events. Activation uses signup activation rate.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <MomentumSection
              title='Site momentum (app_opened)'
              rows={siteMomentumRows}
            />
            <MomentumSection
              title='Product momentum (signed-in)'
              rows={productMomentumRows}
            />
            <MomentumSection
              title='Activation momentum'
              rows={activationMomentumRows}
            />
            <p className='text-xs text-zinc-400'>
              Activation momentum is expressed as the rolling rate plus its
              change vs. the previous 7-day window.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Event Volume & Quality */}
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
                Canonical `app_opened` counts are surfaced when the audit mode
                is enabled.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              <MiniStat
                label='Raw app_opened events'
                value={engagementOverview?.audit?.raw_events_count ?? '—'}
                icon={<Loader2 className='h-5 w-5 text-lunary-accent-300' />}
              />
              <MiniStat
                label='Canonical identities'
                value={
                  engagementOverview?.audit?.distinct_canonical_identities ??
                  '—'
                }
                icon={<Sparkles className='h-5 w-5 text-lunary-primary-300' />}
              />
              <MiniStat
                label='Missing identity rows'
                value={engagementOverview?.audit?.missing_identity_rows ?? '—'}
                icon={<Target className='h-5 w-5 text-lunary-secondary-300' />}
              />
              <MiniStat
                label='Identity links applied'
                value={
                  engagementOverview?.audit?.linked_identities_applied ?? '—'
                }
                icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
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
                  {apiCosts ? `$${apiCosts.costPerSession.toFixed(4)}` : 'N/A'}
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
              Pageview Reach = `page_viewed` deduped - Engaged Users = key
              action events - Signed-in Product Usage = authenticated product
              event users - Grimoire Viewers = `grimoire_viewed` users
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
                icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
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

      {/* Grimoire Deep Dive */}
      <section className='space-y-6'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>
            Grimoire Deep Dive
          </h2>
          <p className='text-xs text-zinc-500'>
            Grimoire viewers are scoped to `grimoire_viewed` events and feed the
            conversion flywheel.
          </p>
        </div>
        <Card className='border-zinc-800/30 bg-zinc-900/10'>
          <CardHeader>
            <CardTitle className='text-base font-medium'>
              Grimoire health
            </CardTitle>
            <CardDescription className='text-xs text-zinc-400'>
              Entry rate, penetration, and return behavior inside the Grimoire
              experience.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <MiniStat
                label='Grimoire → App Rate'
                value={
                  typeof grimoireHealth?.grimoire_to_app_rate === 'number'
                    ? `${grimoireHealth.grimoire_to_app_rate.toFixed(2)}%`
                    : '—'
                }
                subValue={
                  grimoireHealth?.grimoire_visitors
                    ? `${grimoireHealth.grimoire_to_app_users} of ${grimoireHealth.grimoire_visitors}`
                    : undefined
                }
                icon={<Sparkles className='h-5 w-5 text-lunary-primary-300' />}
              />
              <MiniStat
                label='Grimoire MAU'
                value={grimoireMau}
                icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
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
                    ? grimoireHealth.grimoire_views_per_active_user.toFixed(2)
                    : '—'
                }
                icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
              />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              <MiniStat
                label='Grimoire return rate'
                value={
                  typeof grimoireHealth?.return_to_grimoire_rate === 'number'
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
                icon={<Sparkles className='h-5 w-5 text-lunary-success-300' />}
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
                  <span>Median days (first Grimoire -&gt; signup)</span>
                  <span>
                    {conversionInfluence?.median_days_first_grimoire_to_signup ??
                      'N/A'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Median days (signup -&gt; subscription)</span>
                  <span>
                    {conversionInfluence?.median_days_signup_to_subscription ??
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='border-zinc-800/30 bg-zinc-900/10'>
          <CardHeader>
            <CardTitle className='text-base font-medium'>
              Top Grimoire Pages
            </CardTitle>
            <CardDescription className='text-xs text-zinc-400'>
              Best performing grimoire pages by unique views (deduplicated, 1
              per user per page per day).
            </CardDescription>
          </CardHeader>
          <CardContent className='overflow-x-auto'>
            <MetricTable
              columns={[
                {
                  label: 'Page',
                  key: 'pagePath',
                  type: 'text',
                  render: (value: string) => value.replace('/grimoire/', ''),
                },
                {
                  label: '30d Views',
                  key: 'viewsLast30Days',
                  type: 'number',
                  align: 'right',
                },
                {
                  label: 'All-time',
                  key: 'viewsAllTime',
                  type: 'number',
                  align: 'right',
                },
              ]}
              data={grimoireTopPages}
              emptyMessage='No grimoire page view data yet.'
            />
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

      {/* Conversion & Lifecycle */}
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
                Free -&gt; trial -&gt; paid transitions for the selected range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionFunnel
                stages={conversionStages}
                dropOffPoints={conversionDropOff}
              />
            </CardContent>
          </Card>
          <SubscriptionLifecycleCard
            lifecycleStateEntries={lifecycleStateEntries}
            subscriptionLifecycle={subscriptionLifecycle}
            planBreakdown={planBreakdown}
          />
        </div>
      </section>

      {/* Notifications & External Channels */}
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
                          {Number(type.data.click_through_rate ?? 0).toFixed(1)}
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
            <DiscordAnalyticsCards discordAnalytics={discordAnalytics} />
          )}
        </div>
      </section>

      {/* Cohorts & Retention */}
      <section className='space-y-6'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>
            Cohorts & Retention
          </h2>
          <p className='text-xs text-zinc-500'>
            View retention by signup cohort. Cohorts younger than 30 days are
            still maturing.
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

function MomentumSection({
  title,
  rows,
}: {
  title: string;
  rows: MomentumRow[];
}) {
  return (
    <div className='space-y-2'>
      <p className='text-xs uppercase tracking-wider text-zinc-500'>{title}</p>
      {rows.map((row) => (
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
              {describeTrend(row.stats.average, row.stats.previousAverage)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionLifecycleCard({
  lifecycleStateEntries,
  subscriptionLifecycle,
  planBreakdown,
}: {
  lifecycleStateEntries: [string, number][];
  subscriptionLifecycle: any;
  planBreakdown: any;
}) {
  return (
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
            <div key={status} className='flex items-center justify-between'>
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
              <span>Share: {Number(plan.percentage ?? 0).toFixed(1)}%</span>
              {(plan.withDiscount > 0 || plan.fullPrice > 0) && (
                <span className='text-zinc-500'>
                  Coupon: {plan.withDiscount} | Full: {plan.fullPrice}
                </span>
              )}
            </div>
          ))}
          {!planBreakdown?.planBreakdown?.length && (
            <div className='text-xs text-zinc-500'>
              No plan breakdown data for this range.
            </div>
          )}
        </div>

        {/* Coupon Summary */}
        {planBreakdown?.couponSummary && (
          <div className='mt-4 rounded-lg border border-amber-800/40 bg-amber-950/20 p-3'>
            <div className='text-[11px] uppercase tracking-wide text-amber-400/80 mb-2'>
              Coupon Analysis
            </div>
            <div className='space-y-1 text-xs'>
              <div className='flex justify-between text-zinc-300'>
                <span>With coupon</span>
                <span>{planBreakdown.couponSummary.totalWithDiscount}</span>
              </div>
              <div className='flex justify-between text-zinc-300'>
                <span>Full price</span>
                <span>{planBreakdown.couponSummary.totalFullPrice}</span>
              </div>
              <div className='flex justify-between text-zinc-400'>
                <span>Coupon %</span>
                <span>
                  {Number(
                    planBreakdown.couponSummary.discountPercentage ?? 0,
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className='flex justify-between text-emerald-400 pt-1 border-t border-zinc-800/50'>
                <span>Potential MRR</span>
                <span>
                  $
                  {Number(
                    planBreakdown.couponSummary.potentialMrr ?? 0,
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between text-emerald-500/70'>
                <span>When coupons expire</span>
                <span>
                  +$
                  {Number(
                    planBreakdown.couponSummary.potentialMrrIncrease ?? 0,
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Breakdown by Code */}
        {planBreakdown?.couponBreakdown?.length > 0 && (
          <div className='mt-3 space-y-2'>
            <div className='text-[11px] uppercase tracking-wide text-zinc-500'>
              Active Coupons
            </div>
            {planBreakdown.couponBreakdown.map((coupon: any) => (
              <div
                key={coupon.couponCode}
                className='flex items-center justify-between rounded border border-zinc-800/40 bg-zinc-950/30 px-2 py-1.5 text-xs'
              >
                <div className='flex flex-col'>
                  <span className='text-zinc-300 font-medium'>
                    {coupon.couponCode}
                  </span>
                  <span className='text-zinc-500 text-[10px]'>
                    {coupon.discountPercent}% off - {coupon.activeCount} active
                  </span>
                </div>
                {coupon.latestExpiry && (
                  <span className='text-zinc-500 text-[10px]'>
                    Expires:{' '}
                    {new Date(coupon.latestExpiry).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legacy Monthly Subscriber Alert */}
        {planBreakdown?.legacyMonthlySubscribers?.length > 0 && (
          <div className='mt-3 rounded-lg border border-orange-800/40 bg-orange-950/20 p-3'>
            <div className='text-[11px] uppercase tracking-wide text-orange-400/80 mb-2'>
              Legacy &apos;monthly&apos; Subscribers
            </div>
            <div className='space-y-1 text-xs'>
              {planBreakdown.legacyMonthlySubscribers.map((sub: any) => (
                <div key={sub.subscriptionId} className='text-zinc-400'>
                  {sub.email || sub.name || 'Unknown'} - {sub.status}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DiscordAnalyticsCards({
  discordAnalytics,
}: {
  discordAnalytics: any;
}) {
  return (
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
            value={discordAnalytics.stats?.funnel?.totalCommands ?? 0}
            icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
          />
          <MiniStat
            label='Button clicks'
            value={discordAnalytics.stats?.funnel?.buttonClicks ?? 0}
            icon={<Target className='h-5 w-5 text-lunary-success-300' />}
          />
          <MiniStat
            label='Click-through rate'
            value={
              discordAnalytics.stats?.funnel?.clickThroughRate
                ? `${discordAnalytics.stats.funnel.clickThroughRate}%`
                : 'N/A'
            }
            icon={<Sparkles className='h-5 w-5 text-lunary-secondary-300' />}
          />
          <MiniStat
            label='Accounts linked'
            value={discordAnalytics.stats?.funnel?.accountsLinked ?? 0}
            icon={<Bell className='h-5 w-5 text-lunary-accent-300' />}
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
                        discordAnalytics.stats?.commands?.[0]?.total_uses > 0
                          ? (
                              (cmd.total_uses /
                                discordAnalytics.stats.commands[0].total_uses) *
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
  );
}
