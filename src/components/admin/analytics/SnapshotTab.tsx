'use client';

import {
  Activity,
  CheckCircle,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricsCard } from '@/components/admin/MetricsCard';
import { MiniStat } from '@/components/admin/MiniStat';
import { InsightCard } from '@/components/admin/InsightCard';
import { StatSection } from '@/components/admin/StatSection';
import { HealthMetricCard } from '@/components/admin/HealthMetricCard';
import type {
  AnalyticsDataState,
  AnalyticsDataActions,
  MetricSnapshot,
} from '@/hooks/useAnalyticsData';
import {
  formatPercent,
  describeTrend,
  type PrimaryCard,
  type MomentumRow,
} from '@/hooks/useAnalyticsComputations';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SnapshotTabProps {
  data: AnalyticsDataState & AnalyticsDataActions;
  computed: {
    appDau: number;
    appWau: number;
    appMau: number;
    engagedDau: number;
    engagedWau: number;
    engagedMau: number;
    engagementRate: number | null;
    appVisits: number | null;
    canonicalIdentities: number | null;
    appVisitsPerUser: number | null;
    reachDau: number;
    reachWau: number;
    reachMau: number;
    grimoireMau: number;
    grimoireOnlyMau: number;
    productMauCurrentWeek: number;
    productMauGrowth: number;
    overallD7Retention: number;
    overallD30Retention: number;
    primaryCards: PrimaryCard[];
    productMaError: boolean;
    integrityWarnings: string[];
    engagedMatchesApp: boolean;
    filteredInsights: any[];
    returningReferrerBreakdown?: {
      organic_returning: number;
      direct_returning: number;
      internal_returning: number;
    };
    siteMomentumRows: MomentumRow[];
    productMomentumRows: MomentumRow[];
    activationMomentumRows: MomentumRow[];
  };
  handleExportInsights: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SnapshotTab({
  data,
  computed,
  handleExportInsights,
}: SnapshotTabProps) {
  const {
    activity,
    engagementOverview,
    grimoireHealth,
    conversionInfluence,
    activation,
    planBreakdown,
    successMetrics,
    insights,
    metricSnapshots,
    includeAudit,
    insightTypeFilter,
    insightCategoryFilter,
  } = data;

  const {
    appDau,
    appWau,
    appMau,
    engagedDau,
    engagedWau,
    engagedMau,
    engagementRate,
    appVisits,
    canonicalIdentities,
    appVisitsPerUser,
    reachDau,
    reachWau,
    reachMau,
    grimoireMau,
    grimoireOnlyMau,
    productMauCurrentWeek,
    productMauGrowth,
    overallD7Retention,
    primaryCards,
    productMaError,
    integrityWarnings,
    engagedMatchesApp,
    filteredInsights,
    returningReferrerBreakdown,
    siteMomentumRows,
    productMomentumRows,
    activationMomentumRows,
  } = computed;

  return (
    <div className='min-w-0 space-y-10'>
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
          <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
            <HealthMetricCard
              icon={TrendingUp}
              label='User Growth'
              value={
                successMetrics?.active_subscriptions?.total_registered_users ??
                productMauCurrentWeek
              }
              unit='users'
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
              description={
                successMetrics?.active_subscriptions?.paid_subscriptions !==
                undefined
                  ? `Paid: ${successMetrics.active_subscriptions.paid_subscriptions} | Free: ${successMetrics.active_subscriptions.free_users}`
                  : undefined
              }
            />

            <HealthMetricCard
              icon={Activity}
              label='Product WAU'
              value={activity?.signed_in_product_wau ?? 0}
              unit='WAU'
              status={
                (activity?.signed_in_product_wau ?? 0) > 10
                  ? 'excellent'
                  : (activity?.signed_in_product_wau ?? 0) > 0
                    ? 'good'
                    : 'warning'
              }
              description='7-day rolling (signed-in)'
            />

            <HealthMetricCard
              icon={RefreshCw}
              label='User Retention'
              value={
                activity?.retention?.day_7 != null
                  ? `${Number(activity.retention.day_7).toFixed(0)}%`
                  : overallD7Retention > 0
                    ? `${(overallD7Retention * 100).toFixed(0)}%`
                    : '—'
              }
              unit='D7'
              status={
                (activity?.retention?.day_7 ?? overallD7Retention * 100) > 30
                  ? 'excellent'
                  : (activity?.retention?.day_7 ?? overallD7Retention * 100) > 0
                    ? 'good'
                    : 'warning'
              }
              description='7-day retention (rolling cohort)'
            />

            <HealthMetricCard
              icon={CheckCircle}
              label='Activation Rate'
              value={`${(activation?.activationRate ?? 0).toFixed(1)}%`}
              status={
                (activation?.activationRate ?? 0) > 30 ? 'excellent' : 'good'
              }
              description='7-day activation'
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Glance */}
      <section className='space-y-3'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>Quick Glance</h2>
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

      {/* Insights */}
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
            <div className='flex flex-wrap gap-2'>
              <select
                value={insightTypeFilter}
                onChange={(e) => data.setInsightTypeFilter(e.target.value)}
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
                onChange={(e) => data.setInsightCategoryFilter(e.target.value)}
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

      {/* Integrity Warnings */}
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
                  <li key={warning}>- {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Signed-In Product Usage */}
      <section className='space-y-3'>
        <StatSection
          eyebrow='Product Engagement'
          title='Signed-In Product Usage'
          description='Signed-in product users capture authenticated engagement inside the app.'
          footerText='Product users are a subset of App users. Counts will not align 1:1.'
        >
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <MiniStat
              label='Product DAU'
              value={activity?.signed_in_product_dau ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='Product WAU'
              value={activity?.signed_in_product_wau ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='Product MAU'
              value={activity?.signed_in_product_mau ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-secondary-300' />}
            />
            <MiniStat
              label='Returning product users'
              value={activity?.signed_in_product_returning_users ?? 0}
              icon={<Sparkles className='h-5 w-5 text-lunary-accent-300' />}
            />
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <MiniStat
              label={`Daily Stickiness (DAU/WAU) [${activity?.signed_in_product_dau ?? 0}/${activity?.signed_in_product_wau ?? 0}]`}
              value={formatPercent(
                activity?.signed_in_product_wau &&
                  activity.signed_in_product_wau > 0
                  ? (activity.signed_in_product_dau /
                      activity.signed_in_product_wau) *
                      100
                  : 0,
                2,
              )}
              icon={<Sparkles className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label={`Weekly Stickiness (WAU/MAU) [${activity?.signed_in_product_wau ?? 0}/${activity?.signed_in_product_mau ?? 0}]`}
              value={formatPercent(
                activity?.signed_in_product_stickiness_wau_mau,
                2,
              )}
              icon={<Sparkles className='h-5 w-5 text-lunary-secondary-300' />}
            />
            <MiniStat
              label='Avg sessions/user'
              value={
                typeof activity?.signed_in_product_avg_sessions_per_user ===
                'number'
                  ? activity.signed_in_product_avg_sessions_per_user.toFixed(2)
                  : '—'
              }
              icon={<Target className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='Total product users'
              value={activity?.signed_in_product_users ?? 0}
              icon={<Users className='h-5 w-5 text-lunary-accent-300' />}
            />
          </div>
        </StatSection>
      </section>

      {/* Engagement Health */}
      <section className='space-y-3'>
        <StatSection
          eyebrow='Engagement Health'
          title='Engagement events & rates'
          description='Total engagement events and events per signed-in user.'
        >
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <MiniStat
              label='Engaged DAU'
              value={engagedDau}
              icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='Engaged WAU'
              value={engagedWau}
              icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='Engaged MAU'
              value={engagedMau}
              icon={<Activity className='h-5 w-5 text-lunary-secondary-300' />}
            />
            <MiniStat
              label='Returning Users'
              value={engagementOverview?.returning_users_range ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-accent-300' />}
            />
          </div>
          {engagedMatchesApp && (
            <p className='text-xs text-zinc-500'>
              Engaged Users currently matches App opens for this window. Check
              key-action event set.
            </p>
          )}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <MiniStat
              label='Engaged Rate (DAU)'
              value={activity?.engaged_rate_dau?.toFixed(1) ?? '—'}
              icon={<Sparkles className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='Engaged Rate (WAU)'
              value={activity?.engaged_rate_wau?.toFixed(1) ?? '—'}
              icon={<Sparkles className='h-5 w-5 text-lunary-secondary-300' />}
            />
            <MiniStat
              label='Engaged Rate (MAU)'
              value={activity?.engaged_rate_mau?.toFixed(1) ?? '—'}
              icon={<Sparkles className='h-5 w-5 text-lunary-accent-300' />}
            />
            <MiniStat
              label='Avg Active Days'
              value={
                typeof engagementOverview?.avg_active_days_per_user === 'number'
                  ? engagementOverview.avg_active_days_per_user.toFixed(2)
                  : '—'
              }
              icon={<Target className='h-5 w-5 text-lunary-primary-300' />}
            />
          </div>
        </StatSection>
      </section>

      {/* Retention & Return */}
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
              icon={<Activity className='h-5 w-5 text-lunary-secondary-300' />}
            />
            <MiniStat
              label='Returning WAU overlap'
              value={engagementOverview?.returning_wau ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='Returning MAU overlap'
              value={engagementOverview?.returning_mau ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='Returning Users (range)'
              value={engagementOverview?.returning_users_range ?? 0}
              icon={<Target className='h-5 w-5 text-lunary-accent-300' />}
            />
          </div>
        </StatSection>
      </section>

      {/* App Active Users */}
      <section className='space-y-3'>
        <StatSection
          eyebrow='Core App Usage'
          title='App Active Users'
          description='Measures who opened the app in the selected window.'
          footerText='App Active Users (DAU/WAU/MAU) are deduplicated by canonical identity per UTC window. Counts may differ from Vercel analytics due to bot filtering and PWA activity.'
        >
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <MiniStat
              label='App DAU'
              value={appDau}
              icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='App WAU'
              value={appWau}
              icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='App MAU'
              value={appMau}
              icon={<Activity className='h-5 w-5 text-lunary-secondary-300' />}
            />
            <MiniStat
              label='New users (range)'
              value={engagementOverview?.new_users ?? 0}
              icon={<Target className='h-5 w-5 text-lunary-secondary-300' />}
            />
            {appVisits !== null && (
              <MiniStat
                label='App Visits'
                value={appVisits}
                icon={<Loader2 className='h-5 w-5 text-lunary-accent-300' />}
              />
            )}
          </div>
          {appVisits !== null && (
            <div className='grid gap-4 md:grid-cols-2'>
              <MiniStat
                label='App visits per App user'
                value={
                  appVisitsPerUser !== null ? appVisitsPerUser.toFixed(2) : '—'
                }
                icon={<Target className='h-5 w-5 text-lunary-primary-300' />}
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

      {/* Returning Referrer Breakdown */}
      <section className='space-y-3'>
        <StatSection
          eyebrow='Returning referrer breakdown'
          title='Where returning users come from'
          description='Uses the most recent app_opened metadata for returning users.'
          footerText='Segments use the most recent app_opened metadata (referrer, UTM source, or origin type) for returning users (2+ active days).'
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <MiniStat
              label='Organic returning'
              value={returningReferrerBreakdown?.organic_returning ?? 0}
              icon={<Sparkles className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='Direct / brand returning'
              value={returningReferrerBreakdown?.direct_returning ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='Internal returning'
              value={returningReferrerBreakdown?.internal_returning ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-secondary-300' />}
            />
          </div>
        </StatSection>
      </section>

      {/* Active Days Distribution */}
      <section className='space-y-3'>
        <StatSection
          eyebrow='Active days distribution (range)'
          title='Distinct active days per user'
          description='Users grouped by distinct active days in the selected range.'
        >
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
            <MiniStat
              label='1 day'
              value={engagementOverview?.active_days_distribution?.['1'] ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
            />
            <MiniStat
              label='2-3 days'
              value={engagementOverview?.active_days_distribution?.['2-3'] ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
            />
            <MiniStat
              label='4-7 days'
              value={engagementOverview?.active_days_distribution?.['4-7'] ?? 0}
              icon={<Activity className='h-5 w-5 text-lunary-secondary-300' />}
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
              value={engagementOverview?.active_days_distribution?.['15+'] ?? 0}
              icon={<Target className='h-5 w-5 text-lunary-primary-300' />}
            />
          </div>
        </StatSection>
      </section>

      {/* Content & Funnel */}
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
              <MiniStat
                label='Grimoire return rate'
                value={
                  typeof grimoireHealth?.return_to_grimoire_rate === 'number'
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
      </section>

      {/* Reach */}
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
                icon={<Activity className='h-5 w-5 text-lunary-primary-300' />}
              />
              <MiniStat
                label='Reach WAU'
                value={reachWau}
                icon={<Activity className='h-5 w-5 text-lunary-success-300' />}
              />
              <MiniStat
                label='Reach MAU'
                value={reachMau}
                icon={
                  <Activity className='h-5 w-5 text-lunary-secondary-300' />
                }
              />
            </div>
            <p className='text-xs text-zinc-500'>
              Reach counts distinct canonical identities with at least one
              `page_viewed` event in the window.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Momentum */}
      <section className='space-y-3'>
        <StatSection
          eyebrow='Momentum'
          title='Rolling Averages & Deltas'
          description='Site uses app_opened. Product uses signed-in events. Activation uses signup rate.'
          footerText='Activation momentum is expressed as the rolling rate plus its change vs. the previous 7-day window.'
        >
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
        </StatSection>
      </section>

      {/* Growth History */}
      <section>
        <GrowthHistoryCard metricSnapshots={metricSnapshots} />
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Momentum Section
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
          className='flex flex-wrap items-start justify-between gap-2 rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-4 py-3 sm:gap-4'
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

// ─────────────────────────────────────────────────────────────────────────────
// Growth History Card
// ─────────────────────────────────────────────────────────────────────────────

function GrowthHistoryCard({
  metricSnapshots,
}: {
  metricSnapshots: { weekly: MetricSnapshot[]; monthly: MetricSnapshot[] };
}) {
  const delta = (current: number, previous: number | undefined) =>
    previous != null && previous > 0
      ? ((current - previous) / previous) * 100
      : null;

  const fmtDelta = (val: number | null) =>
    val != null ? `${val > 0 ? '+' : ''}${val.toFixed(0)}%` : '';

  return (
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
                No weekly snapshots yet. They are generated every Monday at
                02:00 UTC.
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-[600px] w-full text-sm'>
                  <thead>
                    <tr className='border-b border-zinc-800'>
                      <th className='py-2 text-left text-zinc-400'>Week</th>
                      <th className='py-2 text-right text-zinc-400'>Signups</th>
                      <th className='py-2 text-right text-zinc-400'>WAU</th>
                      <th className='py-2 text-right text-zinc-400'>Trials</th>
                      <th className='py-2 text-right text-zinc-400'>
                        New Paying
                      </th>
                      <th className='py-2 text-right text-zinc-400'>
                        Active Subs
                      </th>
                      <th className='py-2 text-right text-zinc-400'>MRR</th>
                      <th className='py-2 text-right text-zinc-400'>
                        Activation
                      </th>
                      <th className='py-2 text-right text-zinc-400'>Churn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricSnapshots.weekly.map((s, i) => {
                      const prev = metricSnapshots.weekly[i + 1];
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
                            {s.churn_rate != null ? `${s.churn_rate}%` : '—'}
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
                No monthly snapshots yet. They are generated on the 2nd of each
                month at 03:00 UTC.
              </p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-[600px] w-full text-sm'>
                  <thead>
                    <tr className='border-b border-zinc-800'>
                      <th className='py-2 text-left text-zinc-400'>Month</th>
                      <th className='py-2 text-right text-zinc-400'>Signups</th>
                      <th className='py-2 text-right text-zinc-400'>MAU</th>
                      <th className='py-2 text-right text-zinc-400'>Trials</th>
                      <th className='py-2 text-right text-zinc-400'>
                        New Paying
                      </th>
                      <th className='py-2 text-right text-zinc-400'>
                        Active Subs
                      </th>
                      <th className='py-2 text-right text-zinc-400'>MRR</th>
                      <th className='py-2 text-right text-zinc-400'>
                        Activation
                      </th>
                      <th className='py-2 text-right text-zinc-400'>Churn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricSnapshots.monthly.map((s, i) => {
                      const prev = metricSnapshots.monthly[i + 1];
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
                            {s.churn_rate != null ? `${s.churn_rate}%` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
