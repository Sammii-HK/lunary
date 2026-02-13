import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

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
 * Engagement endpoint for insights
 * Uses pre-computed daily_metrics for 99% cost reduction
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // FAST PATH: Use rolling 7-day average stickiness from daily_metrics
    // A single day's DAU/MAU is volatile; averaging over 7 days is more representative.
    const result = await sql.query(
      `SELECT
        AVG(stickiness) as avg_stickiness,
        AVG(avg_active_days_per_week) as avg_active_days
      FROM (
        SELECT stickiness, avg_active_days_per_week
        FROM daily_metrics
        WHERE metric_date >= $1 AND metric_date <= $2
        ORDER BY metric_date DESC
        LIMIT 7
      ) recent`,
      [
        range.start.toISOString().split('T')[0],
        range.end.toISOString().split('T')[0],
      ],
    );

    let avgActiveDaysPerWeek: number;
    let stickiness: number;

    if (result.rows.length > 0 && result.rows[0].avg_stickiness != null) {
      // 7-day rolling average — smooths out daily volatility
      avgActiveDaysPerWeek = Number(result.rows[0].avg_active_days || 0);
      stickiness = Number(result.rows[0].avg_stickiness || 0);
    } else {
      // LIVE PATH: Query conversion_events for today's data (slow but necessary)
      const dauStart = new Date(range.end);
      const wauStart = new Date(range.end);
      wauStart.setUTCDate(wauStart.getUTCDate() - 6);
      const mauStart = new Date(range.end);
      mauStart.setUTCDate(mauStart.getUTCDate() - 29);

      const [dauResult, wauResult, mauResult] = await Promise.all([
        sql.query(
          `SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND user_id IS NOT NULL
            AND user_id NOT LIKE 'anon:%'
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))`,
          [
            PRODUCT_EVENTS,
            formatTimestamp(dauStart),
            formatTimestamp(range.end),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
        sql.query(
          `SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND user_id IS NOT NULL
            AND user_id NOT LIKE 'anon:%'
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))`,
          [
            PRODUCT_EVENTS,
            formatTimestamp(wauStart),
            formatTimestamp(range.end),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
        sql.query(
          `SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND user_id IS NOT NULL
            AND user_id NOT LIKE 'anon:%'
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))`,
          [
            PRODUCT_EVENTS,
            formatTimestamp(mauStart),
            formatTimestamp(range.end),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
      ]);

      const dau = Number(dauResult.rows[0]?.count || 0);
      const wau = Number(wauResult.rows[0]?.count || 0);
      const mau = Number(mauResult.rows[0]?.count || 0);

      avgActiveDaysPerWeek = wau > 0 ? (dau / wau) * 7 : 0;
      stickiness = mau > 0 ? (dau / mau) * 100 : 0;
    }

    const response = NextResponse.json({
      avg_active_days_per_week: Number(avgActiveDaysPerWeek.toFixed(2)),
      stickiness: Number(stickiness.toFixed(2)),
    });

    // Cache engagement metrics for 30 minutes with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/engagement] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
