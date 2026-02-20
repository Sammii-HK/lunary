import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getAnalyticsCacheTTL } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const PRODUCT_EVENTS = [
  'grimoire_viewed',
  'tarot_drawn',
  'chart_viewed',
  'birth_chart_viewed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
  'astral_chat_used',
  'ritual_completed',
  'horoscope_viewed',
  'daily_dashboard_viewed',
  'journal_entry_created',
  'dream_entry_created',
  'cosmic_pulse_opened',
];

/**
 * Consolidated analytics snapshot endpoint
 * Queries ALL daily_metrics rows in range to build trend arrays + summary
 * Replaces 8 separate API calls: dau-wau-mau, engagement-overview,
 * feature-adoption, activation, user-growth, engagement, activity, subscription-30d
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const startDateStr = range.start.toISOString().split('T')[0];
    const endDateStr = range.end.toISOString().split('T')[0];

    // Check if query includes today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const rangeEndDate = new Date(range.end);
    rangeEndDate.setUTCHours(0, 0, 0, 0);
    const includesToday = rangeEndDate.getTime() >= today.getTime();

    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Query ALL rows in date range (not LIMIT 1)
    const [allRowsResult, realtimeDauResult, todaySignupsResult] =
      await Promise.all([
        sql.query(
          `SELECT *
         FROM daily_metrics
         WHERE metric_date >= $1 AND metric_date <= $2
         ORDER BY metric_date ASC`,
          [startDateStr, endDateStr],
        ),
        // Real-time DAU only if querying today
        includesToday
          ? sql.query(
              `SELECT COUNT(DISTINCT user_id) as count
             FROM conversion_events
             WHERE event_type = ANY($1::text[])
               AND user_id IS NOT NULL
               AND user_id NOT LIKE 'anon:%'
               AND created_at >= $2
               AND created_at < $3
               AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))`,
              [
                PRODUCT_EVENTS,
                today.toISOString(),
                tomorrow.toISOString(),
                TEST_EMAIL_PATTERN,
                TEST_EMAIL_EXACT,
              ],
            )
          : Promise.resolve(null),
        // Real-time signups for today
        includesToday
          ? sql.query(
              `SELECT COUNT(*) as count
             FROM "user"
             WHERE "createdAt" >= $1 AND "createdAt" < $2
               AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))`,
              [
                today.toISOString(),
                tomorrow.toISOString(),
                TEST_EMAIL_PATTERN,
                TEST_EMAIL_EXACT,
              ],
            )
          : Promise.resolve(null),
      ]);

    if (allRowsResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No snapshot data available' },
        { status: 404 },
      );
    }

    const rows = allRowsResult.rows;
    const latest = rows[rows.length - 1];
    const realtimeDau = realtimeDauResult
      ? Number(realtimeDauResult.rows[0]?.count || 0)
      : null;

    // Summary metrics from latest row
    const dau = realtimeDau ?? Number(latest.dau || 0);
    const wau = Number(latest.wau || 0);
    const mau = Number(latest.mau || 0);
    const signedInProductDau =
      realtimeDau ?? Number(latest.signed_in_product_dau || 0);
    const signedInProductWau = Number(latest.signed_in_product_wau || 0);
    const signedInProductMau = Number(latest.signed_in_product_mau || 0);

    // Build trend arrays from all rows
    const trends = rows.map((r) => ({
      date: formatMetricDate(r.metric_date),
      dau: Number(r.dau || 0),
      wau: Number(r.wau || 0),
      mau: Number(r.mau || 0),
    }));

    const signed_in_product_trends = rows.map((r) => ({
      date: formatMetricDate(r.metric_date),
      dau: Number(r.signed_in_product_dau || 0),
      wau: Number(r.signed_in_product_wau || 0),
      mau: Number(r.signed_in_product_mau || 0),
    }));

    const app_opened_trends = rows.map((r) => ({
      date: formatMetricDate(r.metric_date),
      dau: Number(r.app_opened_dau || 0),
      wau: Number(r.app_opened_wau || 0),
      mau: Number(r.app_opened_mau || 0),
    }));

    const sitewide_trends = rows.map((r) => ({
      date: formatMetricDate(r.metric_date),
      dau: Number(r.reach_dau || 0),
      wau: Number(r.reach_wau || 0),
      mau: Number(r.reach_mau || 0),
    }));

    const dau_trend = rows.map((r) => ({
      date: formatMetricDate(r.metric_date),
      dau: Number(r.dau || 0),
      returning_dau: Number(r.returning_dau || 0),
    }));

    const activation_trends = rows.map((r) => ({
      date: formatMetricDate(r.metric_date),
      rate: Number(r.activation_rate || 0),
      signups: Number(r.new_signups || 0),
      activated: Number(r.activated_users || 0),
    }));

    const growth_trends = rows.map((r) => ({
      date: formatMetricDate(r.metric_date),
      signups: Number(r.new_signups || 0),
    }));

    // Derived: user growth rate (period-over-period)
    const todaySignups = todaySignupsResult
      ? Number(todaySignupsResult.rows[0]?.count || 0)
      : 0;
    const totalSignupsRange =
      rows.reduce((sum, r) => sum + Number(r.new_signups || 0), 0) +
      todaySignups;
    const totalConversionsRange = rows.reduce(
      (sum, r) => sum + Number(r.new_conversions || 0),
      0,
    );
    const halfIdx = Math.floor(rows.length / 2);
    const firstHalfSignups = rows
      .slice(0, halfIdx)
      .reduce((sum, r) => sum + Number(r.new_signups || 0), 0);
    const secondHalfSignups = rows
      .slice(halfIdx)
      .reduce((sum, r) => sum + Number(r.new_signups || 0), 0);
    const userGrowthRate =
      firstHalfSignups > 0
        ? ((secondHalfSignups - firstHalfSignups) / firstHalfSignups) * 100
        : 0;

    // Subscription 30d approximation from daily_metrics
    const subscription30dRate =
      totalSignupsRange > 0
        ? (totalConversionsRange / totalSignupsRange) * 100
        : 0;

    const response = NextResponse.json({
      source: includesToday ? 'hybrid' : 'snapshot',
      snapshot_date: latest.metric_date,
      range: { start: range.start, end: range.end },
      row_count: rows.length,

      // Core engagement (latest)
      dau,
      wau,
      mau,
      signed_in_product_dau: signedInProductDau,
      signed_in_product_wau: signedInProductWau,
      signed_in_product_mau: signedInProductMau,

      // App opened metrics
      app_opened_dau: realtimeDau ?? Number(latest.app_opened_dau || 0),
      app_opened_wau: Number(latest.app_opened_wau || 0),
      app_opened_mau: Number(latest.app_opened_mau || 0),

      // Returning users
      returning_dau: Number(latest.returning_dau || 0),
      returning_wau: Number(latest.returning_wau || 0),
      returning_mau: Number(latest.returning_mau || 0),

      // Reach (page_viewed)
      reach_dau: Number(latest.reach_dau || 0),
      reach_wau: Number(latest.reach_wau || 0),
      reach_mau: Number(latest.reach_mau || 0),
      sitewide_dau: Number(latest.reach_dau || 0),
      sitewide_wau: Number(latest.reach_wau || 0),
      sitewide_mau: Number(latest.reach_mau || 0),

      // Grimoire metrics
      grimoire_dau: Number(latest.grimoire_dau || 0),
      grimoire_wau: Number(latest.grimoire_wau || 0),
      grimoire_mau: Number(latest.grimoire_mau || 0),
      content_mau_grimoire: Number(latest.grimoire_mau || 0),
      grimoire_only_mau: Number(latest.grimoire_only_mau || 0),
      grimoire_to_app_rate: Number(latest.grimoire_to_app_rate || 0),
      grimoire_to_app_users: Number(latest.grimoire_to_app_users || 0),

      // Retention
      retention: {
        day_1: Number(latest.d1_retention || 0),
        day_7: Number(latest.d7_retention || 0),
        day_30: Number(latest.d30_retention || 0),
      },
      d1_retention: Number(latest.d1_retention || 0),
      d7_retention: Number(latest.d7_retention || 0),
      d30_retention: Number(latest.d30_retention || 0),
      product_d7_retention: Number(latest.product_d7_retention || 0),

      // Active days distribution
      active_days_distribution: {
        '1': Number(latest.active_days_1 || 0),
        '2-3': Number(latest.active_days_2_3 || 0),
        '4-7': Number(latest.active_days_4_7 || 0),
        '8-14': Number(latest.active_days_8_14 || 0),
        '15+': Number(latest.active_days_15_plus || 0),
      },

      // Stickiness
      stickiness: mau > 0 ? Number(((dau / mau) * 100).toFixed(2)) : 0,
      stickiness_dau_mau: mau > 0 ? Number(((dau / mau) * 100).toFixed(2)) : 0,
      stickiness_wau_mau: Number(latest.stickiness_wau_mau || 0),
      avg_active_days_per_week: Number(latest.avg_active_days_per_week || 0),

      // Growth
      total_accounts: Number(latest.total_accounts || 0),
      new_signups: Number(latest.new_signups || 0),
      // Activation: sum across range for accurate rate (not single-day)
      activated_users: rows.reduce(
        (sum, r) => sum + Number(r.activated_users || 0),
        0,
      ),
      activation_rate: (() => {
        const totalActivated = rows.reduce(
          (sum, r) => sum + Number(r.activated_users || 0),
          0,
        );
        return totalSignupsRange > 0
          ? Number(((totalActivated / totalSignupsRange) * 100).toFixed(2))
          : 0;
      })(),

      // Revenue
      mrr: Number(latest.mrr || 0),
      active_subscriptions: Number(latest.active_subscriptions || 0),
      trial_subscriptions: Number(latest.trial_subscriptions || 0),
      new_conversions: Number(latest.new_conversions || 0),

      // Feature adoption
      feature_adoption: {
        dashboard: Number(latest.dashboard_adoption || 0),
        horoscope: Number(latest.horoscope_adoption || 0),
        tarot: Number(latest.tarot_adoption || 0),
        chart: Number(latest.chart_adoption || 0),
        guide: Number(latest.guide_adoption || 0),
        ritual: Number(latest.ritual_adoption || 0),
      },

      // Returning referrer breakdown (use last row with non-zero data)
      returning_referrer_breakdown: (() => {
        const lastWithReferrer =
          [...rows]
            .reverse()
            .find(
              (r) =>
                Number(r.returning_referrer_organic || 0) +
                  Number(r.returning_referrer_direct || 0) +
                  Number(r.returning_referrer_internal || 0) >
                0,
            ) ?? latest;
        return {
          organic_returning: Number(
            lastWithReferrer.returning_referrer_organic || 0,
          ),
          direct_returning: Number(
            lastWithReferrer.returning_referrer_direct || 0,
          ),
          internal_returning: Number(
            lastWithReferrer.returning_referrer_internal || 0,
          ),
        };
      })(),

      // Trend arrays (for charts and momentum)
      trends,
      signed_in_product_trends,
      app_opened_trends,
      sitewide_trends,
      dau_trend,
      activation_trends,
      growth_trends,

      // Derived growth metrics
      user_growth_rate: Number(userGrowthRate.toFixed(2)),
      total_signups_range: totalSignupsRange,

      // Subscription 30d approximation
      subscription_30d: {
        window_days: 30,
        signups: totalSignupsRange,
        conversions: totalConversionsRange,
        conversion_rate: Number(subscription30dRate.toFixed(2)),
      },

      // Flags
      is_realtime_dau: includesToday,
    });

    // Smart caching
    const cacheTTL = getAnalyticsCacheTTL(includesToday);
    response.headers.set(
      'Cache-Control',
      `private, max-age=${cacheTTL}, stale-while-revalidate=${cacheTTL * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/snapshot] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

function formatMetricDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  // Handle postgres date strings (may include time)
  return String(date).split('T')[0];
}
