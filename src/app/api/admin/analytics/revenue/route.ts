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
      // Only count Stripe-backed subscriptions for accurate MRR
      sql.query(
        `
        SELECT
          COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as total_mrr
        FROM subscriptions
        WHERE status IN ('active', 'trial', 'trialing')
          AND stripe_subscription_id IS NOT NULL
          AND (user_email IS NULL OR (user_email NOT LIKE $1 AND user_email != $2))
      `,
        [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
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
        SELECT COUNT(DISTINCT s.user_id) as count
        FROM subscriptions s
        INNER JOIN "user" u ON u.id = s.user_id
        WHERE s.created_at >= $1
          AND s.created_at <= $2
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
