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
 * Growth endpoint for insights
 * Optimized to query DB directly instead of fetching user-growth + dau-wau-mau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Calculate previous period for growth rate
    const rangeDurationMs = range.end.getTime() - range.start.getTime();
    const previousRangeEnd = new Date(range.start.getTime() - 1);
    const previousRangeStart = new Date(
      previousRangeEnd.getTime() - rangeDurationMs,
    );

    const endDate = range.end;
    const mauStart = new Date(endDate);
    mauStart.setUTCDate(mauStart.getUTCDate() - 29); // 30 days

    // Query all metrics in parallel
    const [currentSignupsResult, previousSignupsResult, productMauResult] =
      await Promise.all([
        // Current period signups
        sql.query(
          `
        SELECT COUNT(*) as count
        FROM "user"
        WHERE "createdAt" >= $1
          AND "createdAt" <= $2
          AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
      `,
          [
            formatTimestamp(range.start),
            formatTimestamp(range.end),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
        // Previous period signups for growth calculation
        sql.query(
          `
        SELECT COUNT(*) as count
        FROM "user"
        WHERE "createdAt" >= $1
          AND "createdAt" <= $2
          AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
      `,
          [
            formatTimestamp(previousRangeStart),
            formatTimestamp(previousRangeEnd),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
        // Product MAU for activation rate
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

    const totalSignups = Number(currentSignupsResult.rows[0]?.count || 0);
    const previousTotalSignups = Number(
      previousSignupsResult.rows[0]?.count || 0,
    );
    const productMau = Number(productMauResult.rows[0]?.count || 0);

    // Calculate growth rate
    const growthRate =
      previousTotalSignups > 0
        ? ((totalSignups - previousTotalSignups) / previousTotalSignups) * 100
        : 0;

    // Activation rate as 0–1 fraction (insights lib expects this scale)
    const activationRate = totalSignups > 0 ? productMau / totalSignups : 0;

    const response = NextResponse.json({
      product_mau_growth_rate: Number(growthRate.toFixed(2)),
      new_signups: totalSignups,
      activation_rate: Number(activationRate.toFixed(4)),
    });

    // Cache growth metrics for 30 minutes with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/growth] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
