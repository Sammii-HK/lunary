import { NextRequest, NextResponse } from 'next/server';
import {
  calculateWeeklyMetrics,
  calculateFunnelMetrics,
  getWeekBoundaries,
  formatDateLondon,
} from '@/lib/analytics/weekly-metrics';
import { sendDiscordAdminNotification } from '@/lib/discord';
import {
  saveMetricSnapshot,
  getMetricSnapshots,
} from '@/lib/analytics/metric-snapshots';

/**
 * Weekly metrics pipeline
 * Runs Monday 02:00 Europe/London via Vercel cron
 * Calculates metrics for previous week, persists snapshot, and sends Discord digest
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[Weekly Metrics] Starting weekly metrics pipeline...');

    // Calculate previous week (Monday to Sunday, Europe/London)
    const now = new Date();
    const { weekStart, weekEnd } = getWeekBoundaries(now);
    const previousWeekStart = new Date(
      weekStart.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    const previousWeekEnd = new Date(
      weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    console.log(
      `[Weekly Metrics] Calculating metrics for week: ${formatDateLondon(previousWeekStart)} to ${formatDateLondon(previousWeekEnd)}`,
    );

    // Calculate metrics
    const [metrics, funnel] = await Promise.all([
      calculateWeeklyMetrics(previousWeekStart, previousWeekEnd),
      calculateFunnelMetrics(previousWeekStart, previousWeekEnd),
    ]);

    console.log('[Weekly Metrics] Metrics calculated, persisting snapshot...');

    // Persist to database
    await saveMetricSnapshot({
      period_type: 'weekly',
      period_key: metrics.isoWeek,
      period_start: metrics.weekStartDate,
      period_end: metrics.weekEndDate,
      new_signups: metrics.newUsers,
      new_trials: metrics.newTrials,
      new_paying_subscribers: metrics.newPayingSubscribers,
      wau: metrics.wau,
      activation_rate: Number(metrics.activationRate.toFixed(2)),
      trial_to_paid_conversion_rate: Number(
        metrics.trialToPaidConversionRateWeek.toFixed(2),
      ),
      mrr: Number(metrics.mrrEndOfWeek.toFixed(2)),
      active_subscribers: metrics.activeSubscribersEndOfWeek,
      churn_rate: Number(metrics.churnRateWeek.toFixed(2)),
      d7_retention: metrics.w1Retention,
      extras: {
        activated_users: metrics.activatedUsers,
        arr_run_rate: Number(metrics.arrRunRateEndOfWeek.toFixed(2)),
        arpu: Number(metrics.arpuWeek.toFixed(2)),
        top_features: metrics.topFeaturesByUsers.slice(0, 5),
        funnel: funnel,
      },
    });

    console.log(
      '[Weekly Metrics] Snapshot persisted, sending Discord digest...',
    );

    // Read last 2 weekly snapshots from DB to compute WoW deltas for Discord
    const recentSnapshots = await getMetricSnapshots('weekly', 2);
    await sendWeeklyMetricsNotification(metrics, recentSnapshots);

    console.log('[Weekly Metrics] Pipeline completed successfully');

    return NextResponse.json({
      success: true,
      week: metrics.isoWeek,
      weekStart: metrics.weekStartDate,
      weekEnd: metrics.weekEndDate,
      metrics: {
        wau: metrics.wau,
        newUsers: metrics.newUsers,
        mrr: metrics.mrrEndOfWeek,
        revenue: metrics.grossRevenueWeek,
      },
    });
  } catch (error: any) {
    console.error('[Weekly Metrics] Pipeline failed:', error);

    try {
      await sendDiscordAdminNotification({
        title: 'Weekly Metrics Pipeline Failed',
        message: `Error: ${error.message || 'Unknown error'}`,
        priority: 'high',
        category: 'urgent',
      });
    } catch (discordError) {
      console.error(
        '[Weekly Metrics] Failed to send error notification:',
        discordError,
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Send Discord notification using DB snapshots for WoW comparison
 */
async function sendWeeklyMetricsNotification(
  metrics: Awaited<ReturnType<typeof calculateWeeklyMetrics>>,
  recentSnapshots: Awaited<ReturnType<typeof getMetricSnapshots>>,
): Promise<void> {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : 'http://localhost:3000';

  // Current snapshot is [0], previous is [1] (ordered by period_start DESC)
  const prev = recentSnapshots.length >= 2 ? recentSnapshots[1] : null;

  const delta = (
    current: number,
    previous: number | undefined | null,
  ): string => {
    if (previous == null || previous === 0) return '';
    const pct = ((current - previous) / previous) * 100;
    return ` (${pct > 0 ? '+' : ''}${pct.toFixed(0)}% WoW)`;
  };

  const topFeatures = metrics.topFeaturesByUsers
    .slice(0, 3)
    .map((f) => `${f.feature}: ${f.distinctUsers}`)
    .join(', ');

  const fields = [
    {
      name: 'Week',
      value: `${metrics.isoWeek} (${metrics.weekStartDate} to ${metrics.weekEndDate})`,
      inline: false,
    },
    {
      name: 'Acquisition',
      value: `New Signups: ${metrics.newUsers}${delta(metrics.newUsers, prev?.new_signups)}\nNew Trials: ${metrics.newTrials}${delta(metrics.newTrials, prev?.new_trials)}\nNew Paying: ${metrics.newPayingSubscribers}${delta(metrics.newPayingSubscribers, prev?.new_paying_subscribers)}`,
      inline: true,
    },
    {
      name: 'Engagement & Revenue',
      value: `WAU: ${metrics.wau}${delta(metrics.wau, prev?.wau)}\nActivation: ${metrics.activationRate.toFixed(1)}%\nActive Subs: ${metrics.activeSubscribersEndOfWeek}${delta(metrics.activeSubscribersEndOfWeek, prev?.active_subscribers)}\nMRR: $${metrics.mrrEndOfWeek.toFixed(2)}${delta(metrics.mrrEndOfWeek, prev?.mrr)}`,
      inline: true,
    },
    {
      name: 'Health',
      value: `Churn Rate: ${metrics.churnRateWeek.toFixed(1)}%\nARR Run Rate: $${metrics.arrRunRateEndOfWeek.toFixed(2)}\nGross Revenue: $${metrics.grossRevenueWeek.toFixed(2)}${prev ? `\nCompared to ${prev.period_key}` : ''}`,
      inline: true,
    },
  ];

  if (topFeatures) {
    fields.push({
      name: 'Top Features (by Users)',
      value: topFeatures,
      inline: false,
    });
  }

  await sendDiscordAdminNotification({
    title: '📊 Weekly Analytics Digest',
    message: `Metrics for ${metrics.isoWeek} — view full dashboard for details.`,
    url: `${baseUrl}/admin/analytics`,
    fields,
    priority: 'normal',
    category: 'analytics',
    dedupeKey: `weekly-metrics-${metrics.isoWeek}`,
  });
}
