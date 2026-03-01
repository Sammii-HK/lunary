import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  testUserFilter,
  testUserFilterUsers,
} from '@/lib/analytics/test-filter';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';
import { apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const ALLOWED_TIME_RANGES = new Set(['7d', '30d', '90d']);

const ACTIVITY_EVENTS = [
  'app_opened',
  'tarot_viewed',
  'personalized_tarot_viewed',
  'birth_chart_viewed',
  'horoscope_viewed',
  'personalized_horoscope_viewed',
  'cosmic_pulse_opened',
  'moon_circle_opened',
  'weekly_report_opened',
  'pricing_page_viewed',
  'trial_started',
  'trial_converted',
  'subscription_started',
  'login',
  'dashboard_viewed',
  'grimoire_viewed',
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!ALLOWED_TIME_RANGES.has(timeRange)) {
      return apiError('Invalid timeRange. Must be one of: 7d, 30d, 90d', 400);
    }

    const daysAgo = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - daysAgo);

    const dateStartIso = dateStart.toISOString();

    const signups = await sql`
      SELECT COUNT(*) as count
      FROM "user"
      WHERE "createdAt" IS NOT NULL
        AND "createdAt" >= ${dateStartIso}
        AND ${testUserFilterUsers()}
    `;

    const trials = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'trial_started'
        AND created_at >= ${dateStartIso}
        AND ${testUserFilter()}
    `;

    // Fix: Use only subscription_started (canonical conversion event)
    // Avoids double-counting users who have both trial_converted and subscription_started events
    const conversions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'subscription_started'
        AND created_at >= ${dateStartIso}
        AND ${testUserFilter()}
    `;

    const trialConversions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'trial_converted'
        AND created_at >= ${dateStartIso}
        AND ${testUserFilter()}
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
        AND t1.created_at >= ${dateStartIso}
        AND (t1.user_email IS NULL OR (t1.user_email NOT LIKE '%@test.lunary.app' AND t1.user_email != 'test@test.lunary.app'))
        AND (t2.user_email IS NULL OR (t2.user_email NOT LIKE '%@test.lunary.app' AND t2.user_email != 'test@test.lunary.app'))
    `;

    const avgTimeToConvert =
      parseFloat(timeToConvert.rows[0]?.avg_days || '0') || 0;

    // Fix: Use subscriptions table with Stripe-backed validation instead of conversion_events
    // This ensures we count actual active subscriptions, not just historical events
    const activeSubscriptions = await sql`
      SELECT COUNT(DISTINCT s.user_id) as count
      FROM subscriptions s
      LEFT JOIN "user" u ON u.id = s.user_id
      WHERE s.stripe_subscription_id IS NOT NULL
        AND s.status IN ('active', 'trial', 'trialing', 'past_due')
        AND (COALESCE(s.user_email, u.email) IS NULL
             OR (COALESCE(s.user_email, u.email) NOT LIKE '%@test.lunary.app'
                 AND COALESCE(s.user_email, u.email) != 'test@test.lunary.app'))
    `;

    // Fix: Use actual monthly_amount_due from database instead of hardcoded prices
    // This handles all pricing tiers ($4.99, $8.99, $89.99/12), discounts, and multi-currency
    const mrrResult = await sql`
      SELECT COALESCE(SUM(s.monthly_amount_due), 0) as total_mrr
      FROM subscriptions s
      LEFT JOIN "user" u ON u.id = s.user_id
      WHERE s.stripe_subscription_id IS NOT NULL
        AND s.status IN ('active', 'trial', 'trialing')
        AND (COALESCE(s.user_email, u.email) IS NULL
             OR (COALESCE(s.user_email, u.email) NOT LIKE '%@test.lunary.app'
                 AND COALESCE(s.user_email, u.email) != 'test@test.lunary.app'))
    `;
    const mrr = Number(mrrResult.rows[0]?.total_mrr || 0);

    // Fix: Proper revenue calculation (daily rate × days in period)
    const revenue = (mrr * daysAgo) / 30;

    const events = await sql`
      SELECT
        event_type,
        COUNT(*) as count
      FROM conversion_events
      WHERE created_at >= ${dateStartIso}
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
      WHERE event_type = 'birth_data_submitted' AND created_at >= ${dateStartIso}
    `;

    const onboardingCompleted = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE event_type = 'onboarding_completed' AND created_at >= ${dateStartIso}
    `;

    const pricingPageViews = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type = 'pricing_page_viewed' AND created_at >= ${dateStartIso}
    `;

    const upgradeClicks = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type = 'upgrade_clicked' AND created_at >= ${dateStartIso}
    `;

    const featureGated = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type = 'feature_gated' AND created_at >= ${dateStartIso}
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

    const dauStart = new Date();
    dauStart.setUTCDate(dauStart.getUTCDate() - 1);
    const wauStart = new Date();
    wauStart.setUTCDate(wauStart.getUTCDate() - 7);

    const [dauResult, wauResult] = await Promise.all([
      sql.query(
        `
          SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= NOW()
        `,
        [ACTIVITY_EVENTS, dauStart.toISOString()],
      ),
      sql.query(
        `
          SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= NOW()
        `,
        [ACTIVITY_EVENTS, wauStart.toISOString()],
      ),
    ]);

    const dau = parseInt(dauResult.rows[0]?.count || '0');
    const wau = parseInt(wauResult.rows[0]?.count || '0');
    const stickiness = wau > 0 ? (dau / wau) * 100 : 0;

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
        AND created_at >= ${dateStartIso}
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
        AND created_at >= ${dateStartIso}
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
        AND created_at >= ${dateStartIso}
      `;
      aiUsageCount = parseInt(aiUsers.rows[0]?.count || '0');

      const activeUsers = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type IN ('app_opened', 'horoscope_viewed', 'tarot_viewed', 'birth_chart_viewed')
        AND created_at >= ${dateStartIso}
      `;
      const activeUsersCount = parseInt(activeUsers.rows[0]?.count || '0');

      aiUsagePercent =
        activeUsersCount > 0 ? (aiUsageCount / activeUsersCount) * 100 : 0;
    } catch (error) {
      console.warn('Error calculating AI usage:', error);
    }

    const response = NextResponse.json({
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

    // Cache dashboard metrics for 30 minutes with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return apiError(
      error instanceof Error ? error.message : 'Unknown error',
      500,
    );
  }
}
