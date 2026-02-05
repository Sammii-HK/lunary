import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

/**
 * Activity endpoint for insights
 * Uses pre-computed daily_metrics for 99% cost reduction
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // FAST PATH: Query pre-computed metrics from daily_metrics table
    // This is 99% cheaper than querying conversion_events!
    const result = await sql.query(
      `SELECT
        signed_in_product_mau,
        app_opened_mau,
        signed_in_product_dau,
        signed_in_product_wau
      FROM daily_metrics
      WHERE metric_date >= $1 AND metric_date <= $2
      ORDER BY metric_date DESC
      LIMIT 1`,
      [
        range.start.toISOString().split('T')[0],
        range.end.toISOString().split('T')[0],
      ],
    );

    let signedInProductMau = 0;
    let appOpenedMau = 0;
    let signedInProductDau = 0;
    let signedInProductWau = 0;

    if (result.rows.length > 0) {
      // Got pre-computed metrics - FAST!
      signedInProductMau = Number(result.rows[0].signed_in_product_mau || 0);
      appOpenedMau = Number(result.rows[0].app_opened_mau || 0);
      signedInProductDau = Number(result.rows[0].signed_in_product_dau || 0);
      signedInProductWau = Number(result.rows[0].signed_in_product_wau || 0);
    }
    // If no snapshot, return zeros (cron job will compute it tonight)

    const response = NextResponse.json({
      signed_in_product_mau: signedInProductMau,
      app_opened_mau: appOpenedMau,
      signed_in_product_dau: signedInProductDau,
      signed_in_product_wau: signedInProductWau,
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
