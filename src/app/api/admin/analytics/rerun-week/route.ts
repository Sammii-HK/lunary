import { NextRequest, NextResponse } from 'next/server';
import {
  calculateWeeklyMetrics,
  calculateFunnelMetrics,
  calculateFeatureUsageWeekly,
  getWeekBoundaries,
  formatDateLondon,
} from '@/lib/analytics/weekly-metrics';
import { ensureHeaders, upsertRow, appendRows } from '@/lib/google/sheets';

const SHEETS_ID = process.env.GOOGLE_SHEETS_ID;

/**
 * Rerun metrics calculation for a specific week
 * POST /api/admin/analytics/rerun-week
 * Body: { week_start_date: "2025-01-06" } or { iso_week: "2025-W02" }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!SHEETS_ID) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEETS_ID not configured' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const weekStartDateStr = body.week_start_date;
    const isoWeek = body.iso_week;

    if (!weekStartDateStr && !isoWeek) {
      return NextResponse.json(
        {
          error:
            'week_start_date (YYYY-MM-DD) or iso_week (YYYY-W##) is required',
        },
        { status: 400 },
      );
    }

    let weekStart: Date;
    let weekEnd: Date;

    if (weekStartDateStr) {
      weekStart = new Date(weekStartDateStr);
      if (isNaN(weekStart.getTime())) {
        return NextResponse.json(
          { error: 'Invalid week_start_date format. Use YYYY-MM-DD' },
          { status: 400 },
        );
      }
      const boundaries = getWeekBoundaries(weekStart);
      weekStart = boundaries.weekStart;
      weekEnd = boundaries.weekEnd;
    } else if (isoWeek) {
      // Parse ISO week (e.g., "2025-W02")
      const match = isoWeek.match(/^(\d{4})-W(\d{2})$/);
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid iso_week format. Use YYYY-W##' },
          { status: 400 },
        );
      }

      const year = parseInt(match[1]);
      const week = parseInt(match[2]);

      // Approximate: find first Monday of the year, then add weeks
      const jan1 = new Date(year, 0, 1);
      const dayOfWeek = jan1.getDay();
      const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      const firstMonday = new Date(year, 0, daysToMonday);
      weekStart = new Date(
        firstMonday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000,
      );

      const boundaries = getWeekBoundaries(weekStart);
      weekStart = boundaries.weekStart;
      weekEnd = boundaries.weekEnd;
    } else {
      return NextResponse.json(
        { error: 'week_start_date or iso_week is required' },
        { status: 400 },
      );
    }

    console.log(
      `[Rerun Week] Processing week: ${formatDateLondon(weekStart)} to ${formatDateLondon(weekEnd)}`,
    );

    // Calculate metrics
    const [metrics, funnel, featureUsage] = await Promise.all([
      calculateWeeklyMetrics(weekStart, weekEnd),
      calculateFunnelMetrics(weekStart, weekEnd),
      calculateFeatureUsageWeekly(weekStart, weekEnd),
    ]);

    // Write to sheets
    await writeMetricsToSheets(SHEETS_ID, metrics, funnel, featureUsage);

    console.log(`[Rerun Week] Successfully reran week ${metrics.isoWeek}`);

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
    console.error('[Rerun Week] Failed:', error);
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
 * Write metrics to Google Sheets (same as weekly pipeline)
 */
async function writeMetricsToSheets(
  spreadsheetId: string,
  metrics: Awaited<ReturnType<typeof calculateWeeklyMetrics>>,
  funnel: Awaited<ReturnType<typeof calculateFunnelMetrics>>,
  featureUsage: Awaited<ReturnType<typeof calculateFeatureUsageWeekly>>,
): Promise<void> {
  // TAB B: Weekly_KPIs
  const kpiHeaders = [
    'week_start_date',
    'week_end_date',
    'iso_week',
    'new_users',
    'activated_users',
    'activation_rate',
    'WAU',
    'avg_sessions_per_active_user',
    'new_trials',
    'trial_to_paid_conversion_rate_week',
    'new_paying_subscribers',
    'active_subscribers_end_of_week',
    'churned_subscribers_week',
    'churn_rate_week',
    'gross_revenue_week',
    'mrr_end_of_week',
    'arr_run_rate_end_of_week',
    'arpu_week',
    'top_features_by_users',
    'data_completeness_score',
    'notes',
  ];

  await ensureHeaders(spreadsheetId, 'Weekly_KPIs', kpiHeaders);

  await upsertRow(
    spreadsheetId,
    'Weekly_KPIs',
    {
      week_start_date: metrics.weekStartDate,
      week_end_date: metrics.weekEndDate,
      iso_week: metrics.isoWeek,
      new_users: metrics.newUsers,
      activated_users: metrics.activatedUsers,
      activation_rate: metrics.activationRate.toFixed(2),
      WAU: metrics.wau,
      avg_sessions_per_active_user: metrics.avgSessionsPerActiveUser.toFixed(2),
      new_trials: metrics.newTrials,
      trial_to_paid_conversion_rate_week:
        metrics.trialToPaidConversionRateWeek.toFixed(2),
      new_paying_subscribers: metrics.newPayingSubscribers,
      active_subscribers_end_of_week: metrics.activeSubscribersEndOfWeek,
      churned_subscribers_week: metrics.churnedSubscribersWeek,
      churn_rate_week: metrics.churnRateWeek.toFixed(2),
      gross_revenue_week: metrics.grossRevenueWeek.toFixed(2),
      mrr_end_of_week: metrics.mrrEndOfWeek.toFixed(2),
      arr_run_rate_end_of_week: metrics.arrRunRateEndOfWeek.toFixed(2),
      arpu_week: metrics.arpuWeek.toFixed(2),
      top_features_by_users: JSON.stringify(metrics.topFeaturesByUsers),
      data_completeness_score: metrics.dataCompletenessScore,
      notes: metrics.notes,
    },
    'iso_week',
  );

  // TAB C: Funnel_Week
  const funnelHeaders = [
    'week_start_date',
    'visit_or_app_open',
    'signup',
    'activation',
    'paywall_view',
    'trial_start',
    'subscription_start',
    'conversion_visit_to_signup',
    'conversion_signup_to_activation',
    'conversion_activation_to_trial',
    'conversion_trial_to_paid',
  ];

  await ensureHeaders(spreadsheetId, 'Funnel_Week', funnelHeaders);

  await upsertRow(
    spreadsheetId,
    'Funnel_Week',
    {
      week_start_date: funnel.weekStartDate,
      visit_or_app_open: funnel.visitOrAppOpen,
      signup: funnel.signup,
      activation: funnel.activation,
      paywall_view: funnel.paywallView,
      trial_start: funnel.trialStart,
      subscription_start: funnel.subscriptionStart,
      conversion_visit_to_signup: funnel.conversionVisitToSignup.toFixed(2),
      conversion_signup_to_activation:
        funnel.conversionSignupToActivation.toFixed(2),
      conversion_activation_to_trial:
        funnel.conversionActivationToTrial.toFixed(2),
      conversion_trial_to_paid: funnel.conversionTrialToPaid.toFixed(2),
    },
    'week_start_date',
  );

  // TAB E: Feature_Usage_Weekly
  const featureHeaders = [
    'week_start_date',
    'feature_name',
    'distinct_users',
    'total_events',
  ];

  await ensureHeaders(spreadsheetId, 'Feature_Usage_Weekly', featureHeaders);

  await appendRows(
    spreadsheetId,
    'Feature_Usage_Weekly',
    featureUsage.map((f) => ({
      week_start_date: f.weekStartDate,
      feature_name: f.featureName,
      distinct_users: f.distinctUsers,
      total_events: f.totalEvents,
    })),
  );
}
