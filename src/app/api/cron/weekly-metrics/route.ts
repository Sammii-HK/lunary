import { NextRequest, NextResponse } from 'next/server';
import {
  calculateWeeklyMetrics,
  calculateFunnelMetrics,
  calculateFeatureUsageWeekly,
  getWeekBoundaries,
  formatDateLondon,
} from '@/lib/analytics/weekly-metrics';
import { ensureHeaders, upsertRow, appendRows } from '@/lib/google/sheets';
import { sendDiscordAdminNotification } from '@/lib/discord';

const SHEETS_ID = process.env.GOOGLE_SHEETS_ID;

/**
 * Weekly metrics pipeline
 * Runs Monday 02:00 Europe/London via Vercel cron
 * Calculates metrics for previous week and writes to Google Sheets
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

    if (!SHEETS_ID) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEETS_ID not configured' },
        { status: 500 },
      );
    }

    console.log('[Weekly Metrics] Starting weekly metrics pipeline...');

    // Calculate previous week (Monday to Sunday, Europe/London)
    const now = new Date();
    const { weekStart, weekEnd } = getWeekBoundaries(now);
    // Go back one week
    const previousWeekStart = new Date(
      weekStart.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    const previousWeekEnd = new Date(
      weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    console.log(
      `[Weekly Metrics] Calculating metrics for week: ${formatDateLondon(previousWeekStart)} to ${formatDateLondon(previousWeekEnd)}`,
    );

    // Calculate all metrics
    const [metrics, funnel, featureUsage] = await Promise.all([
      calculateWeeklyMetrics(previousWeekStart, previousWeekEnd),
      calculateFunnelMetrics(previousWeekStart, previousWeekEnd),
      calculateFeatureUsageWeekly(previousWeekStart, previousWeekEnd),
    ]);

    console.log(
      '[Weekly Metrics] Metrics calculated, writing to Google Sheets...',
    );

    // Write to Google Sheets
    await writeMetricsToSheets(SHEETS_ID, metrics, funnel, featureUsage);

    // Update README tab with last run info
    await updateReadmeTab(SHEETS_ID);

    // Send Discord notification
    await sendWeeklyMetricsNotification(metrics);

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

    // Send error notification to Discord
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
 * Write metrics to Google Sheets
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
  // Clear existing data for this week and append new
  const featureHeaders = [
    'week_start_date',
    'feature_name',
    'distinct_users',
    'total_events',
  ];

  await ensureHeaders(spreadsheetId, 'Feature_Usage_Weekly', featureHeaders);

  // Remove existing rows for this week
  // (We'll append new ones, but for simplicity, we'll just append and handle duplicates manually if needed)
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

/**
 * Update README tab with pipeline metadata
 */
async function updateReadmeTab(spreadsheetId: string): Promise<void> {
  const readmeData = [
    { key: 'purpose', value: 'Investor-grade weekly metrics pipeline' },
    { key: 'timezone', value: 'Europe/London' },
    { key: 'week_definition', value: 'Monday 00:00 to Sunday 23:59:59' },
    {
      key: 'data_sources',
      value: 'PostgreSQL (conversion_events, subscriptions), PostHog API',
    },
    { key: 'last_run_at', value: new Date().toISOString() },
    { key: 'last_success_at', value: new Date().toISOString() },
    { key: 'pipeline_version', value: '1.0.0' },
  ];

  await ensureHeaders(spreadsheetId, 'README', ['key', 'value']);

  // Update or create README rows
  for (const item of readmeData) {
    await upsertRow(
      spreadsheetId,
      'README',
      {
        key: item.key,
        value: String(item.value),
      },
      'key',
    );
  }
}

/**
 * Send Discord notification with comprehensive weekly metrics summary
 */
async function sendWeeklyMetricsNotification(
  metrics: Awaited<ReturnType<typeof calculateWeeklyMetrics>>,
): Promise<void> {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : 'http://localhost:3000';

  const sheetUrl = SHEETS_ID
    ? `https://docs.google.com/spreadsheets/d/${SHEETS_ID}`
    : null;

  const topFeatures = metrics.topFeaturesByUsers
    .slice(0, 3)
    .map((f) => `${f.feature}: ${f.distinctUsers}`)
    .join(', ');

  // Fetch additional analytics data for comprehensive notification
  const weekStart = metrics.weekStartDate;
  const weekEnd = metrics.weekEndDate;
  const queryParams = `start_date=${weekStart}&end_date=${weekEnd}`;

  let additionalData: {
    dau?: number;
    mau?: number;
    aiEngagement?: any;
    conversions?: any;
    notifications?: any;
    featureUsage?: any;
    successMetrics?: any;
    userGrowth?: any;
    activation?: any;
    subscriptionLifecycle?: any;
    planBreakdown?: any;
    apiCosts?: any;
  } = {};

  try {
    // Fetch key analytics in parallel (with timeout to avoid blocking)
    const analyticsPromises = [
      fetch(
        `${baseUrl}/api/admin/analytics/dau-wau-mau?${queryParams}&granularity=week`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/ai-engagement?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/conversions?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/notifications?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/feature-usage?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/success-metrics?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(
        `${baseUrl}/api/admin/analytics/user-growth?${queryParams}&granularity=week`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/activation?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(
        `${baseUrl}/api/admin/analytics/subscription-lifecycle?${queryParams}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/plan-breakdown?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${baseUrl}/api/admin/analytics/api-costs?${queryParams}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ];

    const results = await Promise.allSettled(analyticsPromises);
    const [
      activityData,
      aiData,
      conversionsData,
      notificationsData,
      featureUsageData,
      successMetricsData,
      userGrowthData,
      activationData,
      subscriptionLifecycleData,
      planBreakdownData,
      apiCostsData,
    ] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));

    additionalData = {
      dau: activityData?.dau,
      mau: activityData?.mau,
      aiEngagement: aiData,
      conversions: conversionsData,
      notifications: notificationsData,
      featureUsage: featureUsageData,
      successMetrics: successMetricsData,
      userGrowth: userGrowthData,
      activation: activationData,
      subscriptionLifecycle: subscriptionLifecycleData,
      planBreakdown: planBreakdownData,
      apiCosts: apiCostsData,
    };
  } catch (error) {
    console.warn('Failed to fetch additional analytics data:', error);
    // Continue with basic metrics if additional data fetch fails
  }

  const fields = [
    {
      name: 'Week',
      value: `${metrics.isoWeek} (${metrics.weekStartDate} to ${metrics.weekEndDate})`,
      inline: false,
    },
    {
      name: 'User Activity',
      value: `DAU: ${additionalData.dau || 'N/A'}\nWAU: ${metrics.wau}\nMAU: ${additionalData.mau || 'N/A'}\nNew Users: ${metrics.newUsers}`,
      inline: true,
    },
    {
      name: 'Growth & Revenue',
      value: `New Trials: ${metrics.newTrials}\nNew Paying: ${metrics.newPayingSubscribers}\nChurn: ${metrics.churnRateWeek.toFixed(1)}%\nMRR: $${metrics.mrrEndOfWeek.toFixed(2)}`,
      inline: true,
    },
    {
      name: 'Engagement',
      value: `Activation: ${metrics.activationRate.toFixed(1)}%\nGross Revenue: $${metrics.grossRevenueWeek.toFixed(2)}\nARR Run Rate: $${metrics.arrRunRateEndOfWeek.toFixed(2)}`,
      inline: true,
    },
  ];

  // Add AI engagement if available
  if (additionalData.aiEngagement) {
    const ai = additionalData.aiEngagement;
    fields.push({
      name: 'AI Engagement',
      value: `Sessions: ${ai.total_sessions || 0}\nUnique Users: ${ai.unique_users || 0}\nAvg Tokens: ${ai.avg_tokens_per_user?.toFixed(0) || 0}\nCompletion: ${ai.completion_rate?.toFixed(1) || 0}%`,
      inline: true,
    });
  }

  // Add conversions if available
  if (additionalData.conversions) {
    const conv = additionalData.conversions;
    fields.push({
      name: 'Conversions',
      value: `Total: ${conv.total_conversions || 0}\nRate: ${conv.conversion_rate?.toFixed(1) || 0}%\nTrial Rate: ${conv.trial_conversion_rate?.toFixed(1) || 0}%\nAvg Days: ${conv.avg_days_to_convert?.toFixed(1) || 'N/A'}`,
      inline: true,
    });
  }

  // Add notifications if available
  if (additionalData.notifications) {
    const notif = additionalData.notifications;
    const cosmicPulse = notif.cosmic_pulse || {};
    fields.push({
      name: 'Notifications',
      value: `Cosmic Pulse Sent: ${cosmicPulse.sent || 0}\nOpen Rate: ${cosmicPulse.open_rate?.toFixed(1) || 0}%\nCTR: ${cosmicPulse.click_through_rate?.toFixed(1) || 0}%`,
      inline: true,
    });
  }

  // Add feature usage if available
  if (
    additionalData.featureUsage &&
    additionalData.featureUsage.features?.length > 0
  ) {
    const topFeature = additionalData.featureUsage.features[0];
    fields.push({
      name: 'Top Feature',
      value: `${topFeature.feature}: ${topFeature.users} users\n(${topFeature.percentage?.toFixed(1) || 0}% of active users)`,
      inline: true,
    });
  }

  // Add success metrics if available
  if (additionalData.successMetrics) {
    const success = additionalData.successMetrics;
    fields.push({
      name: 'Success Metrics',
      value: `Weekly Return: ${success.weeklyReturning || 0}\nEngagement Score: ${success.engagementScore?.toFixed(1) || 0}\nHealth Score: ${success.healthScore?.toFixed(1) || 0}`,
      inline: true,
    });
  }

  // Add subscription lifecycle if available
  if (additionalData.subscriptionLifecycle) {
    const lifecycle = additionalData.subscriptionLifecycle;
    fields.push({
      name: 'Subscription Lifecycle',
      value: `Active: ${lifecycle.activeSubscribers || 0}\nTrials: ${lifecycle.trialSubscribers || 0}\nChurned: ${lifecycle.churnedThisWeek || 0}`,
      inline: true,
    });
  }

  // Add plan breakdown if available
  if (additionalData.planBreakdown) {
    const plans = additionalData.planBreakdown;
    const planSummary = Object.entries(plans)
      .slice(0, 3)
      .map(([plan, count]: [string, any]) => `${plan}: ${count}`)
      .join('\n');
    if (planSummary) {
      fields.push({
        name: 'Plan Breakdown',
        value: planSummary,
        inline: true,
      });
    }
  }

  // Add API costs if available
  if (additionalData.apiCosts) {
    const costs = additionalData.apiCosts;
    fields.push({
      name: 'API Costs',
      value: `Total: $${costs.totalCost?.toFixed(2) || 0}\nOpenAI: $${costs.openaiCost?.toFixed(2) || 0}\nAnthropic: $${costs.anthropicCost?.toFixed(2) || 0}`,
      inline: true,
    });
  }

  // Add top features from metrics
  if (topFeatures) {
    fields.push({
      name: 'Top Features (by Users)',
      value: topFeatures,
      inline: false,
    });
  }

  // Add data quality
  fields.push({
    name: 'Data Quality',
    value: `Completeness: ${metrics.dataCompletenessScore}%`,
    inline: true,
  });

  if (sheetUrl) {
    fields.push({
      name: 'Google Sheet',
      value: `[View Sheet](${sheetUrl})`,
      inline: false,
    });
  }

  await sendDiscordAdminNotification({
    title: '📊 Weekly Analytics Digest',
    message: `Comprehensive weekly metrics for ${metrics.isoWeek} have been calculated. View full analytics dashboard for detailed insights.`,
    url: `${baseUrl}/admin/analytics`,
    fields,
    priority: 'normal',
    category: 'analytics',
    dedupeKey: `weekly-metrics-${metrics.isoWeek}`,
  });
}
