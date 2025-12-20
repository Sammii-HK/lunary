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
 * Backfill weeks between start_date and end_date
 * POST /api/admin/analytics/backfill
 * Body: { start_date: "2025-01-01", end_date: "2025-01-31" }
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
    const startDateStr = body.start_date;
    const endDateStr = body.end_date;

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'start_date and end_date are required (YYYY-MM-DD format)' },
        { status: 400 },
      );
    }

    const safeStartDateStr = String(startDateStr).replace(/[\r\n]/g, '');
    const safeEndDateStr = String(endDateStr).replace(/[\r\n]/g, '');

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 },
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'start_date must be before end_date' },
        { status: 400 },
      );
    }

    console.log(
      `[Backfill] Starting backfill from ${startDateStr} to ${endDateStr}`,
      `[Backfill] Starting backfill from ${safeStartDateStr} to ${safeEndDateStr}`,
    );

    // Generate all weeks between start and end dates
    const weeks: Array<{ weekStart: Date; weekEnd: Date }> = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const { weekStart, weekEnd } = getWeekBoundaries(currentDate);

      // Only add if week is within range
      if (weekStart >= startDate && weekStart <= endDate) {
        weeks.push({ weekStart, weekEnd });
      }

      // Move to next week
      currentDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    console.log(`[Backfill] Processing ${weeks.length} weeks...`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const { weekStart, weekEnd } of weeks) {
      try {
        console.log(
          `[Backfill] Processing week: ${formatDateLondon(weekStart)} to ${formatDateLondon(weekEnd)}`,
        );

        // Calculate metrics
        const [metrics, funnel, featureUsage] = await Promise.all([
          calculateWeeklyMetrics(weekStart, weekEnd),
          calculateFunnelMetrics(weekStart, weekEnd),
          calculateFeatureUsageWeekly(weekStart, weekEnd),
        ]);

        // Write to sheets
        await writeMetricsToSheets(SHEETS_ID, metrics, funnel, featureUsage);

        results.push({
          week: metrics.isoWeek,
          weekStart: metrics.weekStartDate,
          weekEnd: metrics.weekEndDate,
          status: 'success',
        });

        successCount++;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(
          `[Backfill] Error processing week ${formatDateLondon(weekStart)}:`,
          error,
        );

        results.push({
          week: formatDateLondon(weekStart),
          status: 'error',
          error: error.message || 'Unknown error',
        });

        errorCount++;
      }
    }

    console.log(
      `[Backfill] Completed: ${successCount} successful, ${errorCount} errors`,
    );

    return NextResponse.json({
      success: true,
      totalWeeks: weeks.length,
      successCount,
      errorCount,
      results,
    });
  } catch (error: any) {
    console.error('[Backfill] Failed:', error);
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
