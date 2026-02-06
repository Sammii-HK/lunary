import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getAnalyticsCacheTTL } from '@/lib/analytics-cache-config';

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
  'ritual_started',
  'horoscope_viewed',
  'daily_dashboard_viewed',
  'journal_entry_created',
  'dream_entry_created',
  'cosmic_pulse_opened',
];

/**
 * FAST consolidated analytics endpoint
 * Returns ALL metrics from daily_metrics in ONE query
 * Only hits conversion_events for today's real-time DAU
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Check if query includes today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const rangeEndDate = new Date(range.end);
    rangeEndDate.setUTCHours(0, 0, 0, 0);
    const includesToday = rangeEndDate.getTime() >= today.getTime();

    // ONE query to get latest snapshot
    const snapshotResult = await sql.query(
      `SELECT *
       FROM daily_metrics
       WHERE metric_date <= $1
       ORDER BY metric_date DESC
       LIMIT 1`,
      [range.end.toISOString().split('T')[0]],
    );

    if (snapshotResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No snapshot data available' },
        { status: 404 },
      );
    }

    const snapshot = snapshotResult.rows[0];

    // Get real-time DAU only if querying today
    let realtimeDau = null;
    if (includesToday) {
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      const dauResult = await sql.query(
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
      );
      realtimeDau = Number(dauResult.rows[0]?.count || 0);
    }

    // Build response from snapshot + real-time DAU
    const dau = realtimeDau ?? Number(snapshot.dau || 0);
    const wau = Number(snapshot.wau || 0);
    const mau = Number(snapshot.mau || 0);
    const signedInProductDau =
      realtimeDau ?? Number(snapshot.signed_in_product_dau || 0);

    const response = NextResponse.json({
      source: includesToday ? 'hybrid' : 'snapshot',
      snapshot_date: snapshot.metric_date,
      range: { start: range.start, end: range.end },

      // Core engagement
      dau,
      wau,
      mau,
      signed_in_product_dau: signedInProductDau,
      signed_in_product_wau: Number(snapshot.signed_in_product_wau || 0),
      signed_in_product_mau: Number(snapshot.signed_in_product_mau || 0),

      // App opened metrics
      app_opened_dau: realtimeDau ?? Number(snapshot.app_opened_dau || 0),
      app_opened_wau: Number(snapshot.app_opened_wau || 0),
      app_opened_mau: Number(snapshot.app_opened_mau || 0),

      // Returning users (users with 2+ active days)
      returning_dau: Number(snapshot.returning_dau || 0),
      returning_wau: Number(snapshot.returning_wau || 0),
      returning_mau: Number(snapshot.returning_mau || 0),

      // Reach (page_viewed)
      reach_dau: Number(snapshot.reach_dau || 0),
      reach_wau: Number(snapshot.reach_wau || 0),
      reach_mau: Number(snapshot.reach_mau || 0),
      sitewide_dau: Number(snapshot.reach_dau || 0),
      sitewide_wau: Number(snapshot.reach_wau || 0),
      sitewide_mau: Number(snapshot.reach_mau || 0),

      // Grimoire metrics
      grimoire_dau: Number(snapshot.grimoire_dau || 0),
      grimoire_wau: Number(snapshot.grimoire_wau || 0),
      grimoire_mau: Number(snapshot.grimoire_mau || 0),
      content_mau_grimoire: Number(snapshot.grimoire_mau || 0),
      grimoire_only_mau: Number(snapshot.grimoire_only_mau || 0),
      grimoire_to_app_rate: Number(snapshot.grimoire_to_app_rate || 0),
      grimoire_to_app_users: Number(snapshot.grimoire_to_app_users || 0),

      // Retention
      retention: {
        day_1: Number(snapshot.d1_retention || 0),
        day_7: Number(snapshot.d7_retention || 0),
        day_30: Number(snapshot.d30_retention || 0),
      },
      d1_retention: Number(snapshot.d1_retention || 0),
      d7_retention: Number(snapshot.d7_retention || 0),
      d30_retention: Number(snapshot.d30_retention || 0),

      // Active days distribution
      active_days_distribution: {
        '1': Number(snapshot.active_days_1 || 0),
        '2-3': Number(snapshot.active_days_2_3 || 0),
        '4-7': Number(snapshot.active_days_4_7 || 0),
        '8-14': Number(snapshot.active_days_8_14 || 0),
        '15+': Number(snapshot.active_days_15_plus || 0),
      },

      // Stickiness
      stickiness: mau > 0 ? Number(((dau / mau) * 100).toFixed(2)) : 0,
      stickiness_dau_mau: mau > 0 ? Number(((dau / mau) * 100).toFixed(2)) : 0,
      stickiness_wau_mau: Number(snapshot.stickiness_wau_mau || 0),
      avg_active_days_per_week: Number(snapshot.avg_active_days_per_week || 0),

      // Growth
      total_accounts: Number(snapshot.total_accounts || 0),
      new_signups: Number(snapshot.new_signups || 0),
      activated_users: Number(snapshot.activated_users || 0),
      activation_rate: Number(snapshot.activation_rate || 0),

      // Revenue
      mrr: Number(snapshot.mrr || 0),
      active_subscriptions: Number(snapshot.active_subscriptions || 0),
      trial_subscriptions: Number(snapshot.trial_subscriptions || 0),
      new_conversions: Number(snapshot.new_conversions || 0),

      // Feature adoption
      feature_adoption: {
        dashboard: Number(snapshot.dashboard_adoption || 0),
        horoscope: Number(snapshot.horoscope_adoption || 0),
        tarot: Number(snapshot.tarot_adoption || 0),
        chart: Number(snapshot.chart_adoption || 0),
        guide: Number(snapshot.guide_adoption || 0),
        ritual: Number(snapshot.ritual_adoption || 0),
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
