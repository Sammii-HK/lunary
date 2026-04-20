import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { getStripeMRR } from '@/lib/analytics/stripe-subscriptions';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Revenue endpoint for insights
 * MRR: queried directly from Stripe (source of truth)
 * Signups/conversions: aggregated from daily_metrics
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const [mrr, aggregateResult, trialStartsResult] = await Promise.all([
      getStripeMRR(),
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
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as trial_starts
         FROM conversion_events
         WHERE event_type = 'trial_started'
           AND created_at >= $1
           AND created_at <= $2
           AND user_id IS NOT NULL
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          range.start.toISOString(),
          range.end.toISOString(),
          '%@test.lunary.app',
          'test@test.lunary.app',
        ],
      ),
    ]);

    const result = { rows: [{ ...aggregateResult.rows[0] }] };
    const signups = Number(result.rows[0]?.total_signups || 0);
    const conversions = Number(result.rows[0]?.total_conversions || 0);
    const trialStarts = Number(trialStartsResult.rows[0]?.trial_starts || 0);

    const freeToTrialRate = signups > 0 ? (trialStarts / signups) * 100 : 0;
    const signupToPaidRate = signups > 0 ? (conversions / signups) * 100 : 0;
    const trialToPaidRate =
      trialStarts > 0 ? (conversions / trialStarts) * 100 : 0;

    const response = NextResponse.json({
      mrr: Number(mrr.toFixed(2)),
      free_to_trial_rate: Number(freeToTrialRate.toFixed(2)),
      signup_to_paid_rate: Number(signupToPaidRate.toFixed(2)),
      trial_to_paid_rate: Number(trialToPaidRate.toFixed(2)),
      total_signups: signups,
      trial_starts: trialStarts,
      total_conversions: conversions,
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
