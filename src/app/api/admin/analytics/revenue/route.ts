import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const WINDOW_DAYS = 30;

/**
 * Revenue endpoint for insights
 * Optimized to query DB directly instead of fetching plan-breakdown + subscription-30d
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const windowStart = new Date(range.end);
    windowStart.setUTCDate(windowStart.getUTCDate() - (WINDOW_DAYS - 1));

    // Query MRR and conversion metrics in parallel
    const [mrrResult, signupsResult, conversionsResult] = await Promise.all([
      // Calculate MRR from active subscriptions
      sql.query(
        `
        SELECT
          COALESCE(SUM(CASE
            WHEN currency = 'USD' THEN amount / 100.0
            WHEN currency = 'EUR' THEN (amount / 100.0) * 1.1
            WHEN currency = 'GBP' THEN (amount / 100.0) * 1.27
            WHEN currency = 'AUD' THEN (amount / 100.0) * 0.67
            WHEN currency = 'CAD' THEN (amount / 100.0) * 0.75
            ELSE amount / 100.0
          END), 0) as total_mrr
        FROM "Subscription"
        WHERE status = 'active'
      `,
      ),
      // Count signups in window
      sql.query(
        `
        SELECT COUNT(*) as count
        FROM "user"
        WHERE "createdAt" >= $1
          AND "createdAt" <= $2
          AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
      `,
        [
          formatTimestamp(windowStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      // Count conversions (users who started subscription within window)
      sql.query(
        `
        SELECT COUNT(DISTINCT s."userId") as count
        FROM "Subscription" s
        INNER JOIN "user" u ON u.id = s."userId"
        WHERE s."createdAt" >= $1
          AND s."createdAt" <= $2
          AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
      `,
        [
          formatTimestamp(windowStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
    ]);

    const totalMrr = Number(mrrResult.rows[0]?.total_mrr || 0);
    const signups = Number(signupsResult.rows[0]?.count || 0);
    const conversions = Number(conversionsResult.rows[0]?.count || 0);
    const conversionRate = signups > 0 ? (conversions / signups) * 100 : 0;

    const response = NextResponse.json({
      mrr: Number(totalMrr.toFixed(2)),
      free_to_trial_rate: Number(conversionRate.toFixed(2)),
    });

    // Cache revenue metrics for 30 minutes with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/revenue] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
