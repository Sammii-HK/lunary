import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Revenue endpoint for insights
 * Uses pre-computed daily_metrics for 99% cost reduction
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // MRR: live query from subscriptions so it always reflects current
    // discounts/coupons. daily_metrics.mrr has inconsistent historical values
    // from before coupon sync was implemented — never use MAX() on it.
    // Signups/conversions still aggregate from daily_metrics.
    const [mrrResult, aggregateResult] = await Promise.all([
      sql.query(
        `SELECT COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr
         FROM subscriptions
         WHERE status = 'active'
           AND stripe_subscription_id IS NOT NULL
           AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))`,
        [],
      ),
      sql.query(
        `SELECT
          SUM(new_signups) as total_signups,
          SUM(new_conversions) as total_conversions
        FROM daily_metrics
        WHERE metric_date >= $1 AND metric_date <= $2`,
        [
          range.start.toISOString().split('T')[0],
          range.end.toISOString().split('T')[0],
        ],
      ),
    ]);

    const mrr = Number(mrrResult.rows[0]?.mrr || 0);
    const result = { rows: [{ ...aggregateResult.rows[0] }] };
    const signups = Number(result.rows[0]?.total_signups || 0);
    const conversions = Number(result.rows[0]?.total_conversions || 0);

    // Calculate conversion rate
    const conversionRate = signups > 0 ? (conversions / signups) * 100 : 0;

    const response = NextResponse.json({
      mrr: Number(mrr.toFixed(2)),
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
