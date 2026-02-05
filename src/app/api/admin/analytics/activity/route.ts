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

const APP_OPENED_EVENTS = ['app_opened'];

/**
 * Activity endpoint for insights
 * Optimized to query DB directly instead of fetching dau-wau-mau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const endDate = range.end;
    const mauStart = new Date(endDate);
    mauStart.setUTCDate(mauStart.getUTCDate() - 29); // 30 days

    const dauStart = new Date(endDate);
    dauStart.setUTCDate(dauStart.getUTCDate() - 0); // Same day

    const wauStart = new Date(endDate);
    wauStart.setUTCDate(wauStart.getUTCDate() - 6); // 7 days

    // Query only the specific metrics we need
    const [
      productMauResult,
      appOpenedMauResult,
      productDauResult,
      productWauResult,
    ] = await Promise.all([
      // signed_in_product_mau
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
      // app_opened_mau (includes anonymous)
      sql.query(
        `
        SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
      `,
        [
          APP_OPENED_EVENTS,
          formatTimestamp(mauStart),
          formatTimestamp(endDate),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      // signed_in_product_dau
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
      // signed_in_product_wau
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
    ]);

    const response = NextResponse.json({
      signed_in_product_mau: Number(productMauResult.rows[0]?.count || 0),
      app_opened_mau: Number(appOpenedMauResult.rows[0]?.count || 0),
      signed_in_product_dau: Number(productDauResult.rows[0]?.count || 0),
      signed_in_product_wau: Number(productWauResult.rows[0]?.count || 0),
    });

    // Cache activity metrics for 30 minutes with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/activity] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
