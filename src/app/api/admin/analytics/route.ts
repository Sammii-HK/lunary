import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getPostHogActiveUsers } from '@/lib/posthog-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    let dateFilter = '';
    switch (timeRange) {
      case '7d':
        dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "created_at >= NOW() - INTERVAL '90 days'";
        break;
      default:
        dateFilter = '1=1';
    }

    const signups = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'signup' AND ${(sql as any).raw(dateFilter)}
    `;

    const trials = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'trial_started' AND ${(sql as any).raw(dateFilter)}
    `;

    const conversions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type IN ('trial_converted', 'subscription_started') AND ${(sql as any).raw(dateFilter)}
    `;

    const trialConversions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'trial_converted' AND ${(sql as any).raw(dateFilter)}
    `;

    const totalSignups = parseInt(signups.rows[0]?.count || '0');
    const trialStarted = parseInt(trials.rows[0]?.count || '0');
    const subscriptionStarted = parseInt(conversions.rows[0]?.count || '0');
    const trialConverted = parseInt(trialConversions.rows[0]?.count || '0');

    const conversionRate =
      totalSignups > 0 ? (subscriptionStarted / totalSignups) * 100 : 0;
    const trialConversionRate =
      trialStarted > 0 ? (trialConverted / trialStarted) * 100 : 0;

    const timeToConvert = await sql`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) / 86400) as avg_days
      FROM conversion_events t1
      JOIN conversion_events t2 ON t1.user_id = t2.user_id
      WHERE t1.event_type = 'trial_started'
        AND t2.event_type IN ('trial_converted', 'subscription_started')
        AND t2.created_at > t1.created_at
        AND ${(sql as any).raw(dateFilter.replace('created_at', 't1.created_at'))}
    `;

    const avgTimeToConvert =
      parseFloat(timeToConvert.rows[0]?.avg_days || '0') || 0;

    const activeSubscriptions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type IN ('subscription_started', 'trial_converted')
        AND ${(sql as any).raw(dateFilter)}
    `;

    const monthlySubscriptions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type IN ('subscription_started', 'trial_converted')
        AND plan_type = 'monthly'
        AND ${(sql as any).raw(dateFilter)}
    `;

    const yearlySubscriptions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type IN ('subscription_started', 'trial_converted')
        AND plan_type = 'yearly'
        AND ${(sql as any).raw(dateFilter)}
    `;

    const monthlyCount = parseInt(monthlySubscriptions.rows[0]?.count || '0');
    const yearlyCount = parseInt(yearlySubscriptions.rows[0]?.count || '0');

    const mrr = monthlyCount * 4.99 + (yearlyCount * 39.99) / 12;
    const revenue =
      mrr *
      (timeRange === '7d'
        ? 7 / 30
        : timeRange === '30d'
          ? 1
          : timeRange === '90d'
            ? 3
            : 12);

    const events = await sql`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM conversion_events
      WHERE ${(sql as any).raw(dateFilter)}
      GROUP BY event_type
      ORDER BY count DESC
    `;

    const totalEvents = events.rows.reduce(
      (sum, row) => sum + parseInt(row.count || '0'),
      0,
    );

    const eventsWithPercentage = events.rows.map((row) => ({
      event_type: row.event_type,
      count: parseInt(row.count || '0'),
      percentage:
        totalEvents > 0 ? (parseInt(row.count || '0') / totalEvents) * 100 : 0,
    }));

    const birthDataSubmitted = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'birth_data_submitted' AND ${(sql as any).raw(dateFilter)}
    `;

    const onboardingCompleted = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'onboarding_completed' AND ${(sql as any).raw(dateFilter)}
    `;

    const pricingPageViews = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type = 'pricing_page_viewed' AND ${(sql as any).raw(dateFilter)}
    `;

    const upgradeClicks = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type = 'upgrade_clicked' AND ${(sql as any).raw(dateFilter)}
    `;

    const featureGated = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type = 'feature_gated' AND ${(sql as any).raw(dateFilter)}
    `;

    const birthDataRate =
      totalSignups > 0
        ? (parseInt(birthDataSubmitted.rows[0]?.count || '0') / totalSignups) *
          100
        : 0;
    const onboardingRate =
      totalSignups > 0
        ? (parseInt(onboardingCompleted.rows[0]?.count || '0') / totalSignups) *
          100
        : 0;
    const pricingToTrialRate =
      parseInt(pricingPageViews.rows[0]?.count || '0') > 0
        ? (trialStarted / parseInt(pricingPageViews.rows[0]?.count || '0')) *
          100
        : 0;
    const upgradeClickRate =
      parseInt(pricingPageViews.rows[0]?.count || '0') > 0
        ? (parseInt(upgradeClicks.rows[0]?.count || '0') /
            parseInt(pricingPageViews.rows[0]?.count || '0')) *
          100
        : 0;

    let dau = 0;
    let wau = 0;
    let stickiness = 0;

    try {
      const posthogData = await getPostHogActiveUsers();
      if (posthogData) {
        dau = posthogData.dau;
        wau = posthogData.wau;
        stickiness = wau > 0 ? (dau / wau) * 100 : 0;
      }
    } catch (error) {
      console.warn('Error fetching DAU/WAU from PostHog:', error);
    }

    let tiktokVisitors = 0;
    let tiktokSignups = 0;
    let tiktokConversionRate = 0;

    try {
      const tiktokVisits = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE (
          metadata->>'utm_source' = 'tiktok'
          OR metadata->>'referrer' LIKE '%tiktok.com%'
        )
        AND ${(sql as any).raw(dateFilter)}
      `;
      tiktokVisitors = parseInt(tiktokVisits.rows[0]?.count || '0');

      const tiktokSignupsResult = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type = 'signup'
        AND (
          metadata->>'utm_source' = 'tiktok'
          OR metadata->>'referrer' LIKE '%tiktok.com%'
        )
        AND ${(sql as any).raw(dateFilter)}
      `;
      tiktokSignups = parseInt(tiktokSignupsResult.rows[0]?.count || '0');

      tiktokConversionRate =
        tiktokVisitors > 0 ? (tiktokSignups / tiktokVisitors) * 100 : 0;
    } catch (error) {
      console.warn('Error calculating TikTok metrics:', error);
    }

    let aiUsageCount = 0;
    let aiUsagePercent = 0;

    try {
      const aiUsers = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type IN ('personalized_tarot_viewed', 'personalized_horoscope_viewed', 'birth_chart_viewed', 'crystal_recommendations_viewed')
        AND ${(sql as any).raw(dateFilter)}
      `;
      aiUsageCount = parseInt(aiUsers.rows[0]?.count || '0');

      const activeUsers = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type IN ('app_opened', 'horoscope_viewed', 'tarot_viewed', 'birth_chart_viewed')
        AND ${(sql as any).raw(dateFilter)}
      `;
      const activeUsersCount = parseInt(activeUsers.rows[0]?.count || '0');

      aiUsagePercent =
        activeUsersCount > 0 ? (aiUsageCount / activeUsersCount) * 100 : 0;
    } catch (error) {
      console.warn('Error calculating AI usage:', error);
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalSignups,
        trialStarted,
        trialConverted,
        subscriptionStarted,
        conversionRate,
        trialConversionRate,
        avgTimeToConvert,
        revenue,
        mrr,
        birthDataSubmitted: parseInt(birthDataSubmitted.rows[0]?.count || '0'),
        onboardingCompleted: parseInt(
          onboardingCompleted.rows[0]?.count || '0',
        ),
        pricingPageViews: parseInt(pricingPageViews.rows[0]?.count || '0'),
        upgradeClicks: parseInt(upgradeClicks.rows[0]?.count || '0'),
        featureGated: parseInt(featureGated.rows[0]?.count || '0'),
        birthDataRate,
        onboardingRate,
        pricingToTrialRate,
        upgradeClickRate,
        dau,
        wau,
        stickiness,
        tiktokVisitors,
        tiktokSignups,
        tiktokConversionRate,
        aiUsageCount,
        aiUsagePercent,
      },
      funnel: {
        signups: totalSignups,
        trials: trialStarted,
        conversions: subscriptionStarted,
        activeSubscriptions: parseInt(
          activeSubscriptions.rows[0]?.count || '0',
        ),
      },
      events: eventsWithPercentage,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
