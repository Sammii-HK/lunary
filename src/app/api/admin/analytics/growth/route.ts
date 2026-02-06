import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

/**
 * Growth endpoint for insights
 * Uses pre-computed daily_metrics for 99% cost reduction
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

    // FAST PATH: Query pre-computed metrics from daily_metrics table
    const [currentResult, previousResult] = await Promise.all([
      // Current period totals
      sql.query(
        `SELECT
          SUM(new_signups) as total_signups,
          MAX(signed_in_product_mau) as product_mau,
          SUM(activated_users) as total_activated,
          -- Weighted activation rate: total activated / total signups across range
          CASE WHEN SUM(new_signups) > 0
            THEN ROUND(SUM(activated_users)::numeric / SUM(new_signups) * 100, 2)
            ELSE 0
          END as activation_rate
        FROM daily_metrics
        WHERE metric_date >= $1 AND metric_date <= $2`,
        [
          range.start.toISOString().split('T')[0],
          range.end.toISOString().split('T')[0],
        ],
      ),
      // Previous period totals (for growth calculation)
      sql.query(
        `SELECT SUM(new_signups) as total_signups
        FROM daily_metrics
        WHERE metric_date >= $1 AND metric_date <= $2`,
        [
          previousRangeStart.toISOString().split('T')[0],
          previousRangeEnd.toISOString().split('T')[0],
        ],
      ),
    ]);

    const totalSignups = Number(currentResult.rows[0]?.total_signups || 0);
    const previousTotalSignups = Number(
      previousResult.rows[0]?.total_signups || 0,
    );
    const productMau = Number(currentResult.rows[0]?.product_mau || 0);

    // Use pre-computed activation rate if available, else calculate
    let activationRate = Number(currentResult.rows[0]?.activation_rate || 0);
    if (activationRate === 0 && totalSignups > 0 && productMau > 0) {
      activationRate = productMau / totalSignups;
    }

    // Calculate growth rate
    const growthRate =
      previousTotalSignups > 0
        ? ((totalSignups - previousTotalSignups) / previousTotalSignups) * 100
        : 0;

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
