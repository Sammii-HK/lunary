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
  'ritual_started',
  'horoscope_viewed',
  'daily_dashboard_viewed',
  'journal_entry_created',
  'dream_entry_created',
  'cosmic_pulse_opened',
];

/**
 * Engagement endpoint for insights
 * Optimized to query DB directly instead of fetching dau-wau-mau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Calculate DAU, WAU, MAU for signed-in product users
    // Only query what we need - much faster than fetching full dau-wau-mau endpoint
    const endDate = range.end;
    const dauStart = new Date(endDate);
    dauStart.setUTCDate(dauStart.getUTCDate() - 0); // Same day

    const wauStart = new Date(endDate);
    wauStart.setUTCDate(wauStart.getUTCDate() - 6); // 7 days

    const mauStart = new Date(endDate);
    mauStart.setUTCDate(mauStart.getUTCDate() - 29); // 30 days

    // Query all three metrics in parallel
    const [dauResult, wauResult, mauResult] = await Promise.all([
      sql.query(
        `
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND user_id IS NOT NULL
          AND user_id NOT LIKE 'anon:%'
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
      `,
        [
          PRODUCT_EVENTS,
          formatTimestamp(dauStart),
          formatTimestamp(endDate),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND user_id IS NOT NULL
          AND user_id NOT LIKE 'anon:%'
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
      `,
        [
          PRODUCT_EVENTS,
          formatTimestamp(wauStart),
          formatTimestamp(endDate),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND user_id IS NOT NULL
          AND user_id NOT LIKE 'anon:%'
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
      `,
        [
          PRODUCT_EVENTS,
          formatTimestamp(mauStart),
          formatTimestamp(endDate),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
    ]);

    const dau = Number(dauResult.rows[0]?.count || 0);
    const wau = Number(wauResult.rows[0]?.count || 0);
    const mau = Number(mauResult.rows[0]?.count || 0);

    // Calculate avg active days per week from DAU/WAU ratio
    const avgActiveDaysPerWeek = wau > 0 ? (dau / wau) * 7 : 0;

    // Calculate stickiness (DAU/MAU ratio)
    const stickiness = mau > 0 ? (dau / mau) * 100 : 0;

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
