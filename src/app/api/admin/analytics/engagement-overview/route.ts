import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getEngagementOverview } from '@/lib/analytics/kpis';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { filterFields, getFieldsParam } from '@/lib/analytics/field-selection';

const familyToEventType = (
  family: string | null,
): 'app_opened' | 'product_opened' | 'grimoire_viewed' => {
  switch (family) {
    case 'product':
      return 'product_opened';
    case 'grimoire':
      return 'grimoire_viewed';
    case 'site':
      return 'app_opened';
    default:
      return 'app_opened';
  }
};

/**
 * Engagement Overview endpoint for insights
 * Uses pre-computed daily_metrics for 99% cost reduction when possible
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const includeAudit = searchParams.get('debug') === '1';
    const family = searchParams.get('family');
    const eventType = familyToEventType(family);

    // FAST PATH: Query daily_metrics for core metrics
    const snapshotResult = await sql.query(
      `SELECT
        dau, wau, mau,
        signed_in_product_dau,
        signed_in_product_wau,
        signed_in_product_mau,
        stickiness,
        avg_active_days_per_week
      FROM daily_metrics
      WHERE metric_date >= $1 AND metric_date <= $2
      ORDER BY metric_date DESC
      LIMIT 1`,
      [
        range.start.toISOString().split('T')[0],
        range.end.toISOString().split('T')[0],
      ],
    );

    // If we have snapshot data and don't need audit, return fast response
    if (snapshotResult.rows.length > 0 && !includeAudit) {
      const row = snapshotResult.rows[0];
      const dau = Number(row.dau || 0);
      const wau = Number(row.wau || 0);
      const mau = Number(row.mau || 0);

      const fullData = {
        source: 'daily_metrics',
        family: family ?? 'site',
        event_type: eventType,
        range,
        dau,
        wau,
        mau,
        stickiness_dau_mau:
          mau > 0 ? Number(((dau / mau) * 100).toFixed(2)) : 0,
        stickiness_wau_mau:
          mau > 0 ? Number(((wau / mau) * 100).toFixed(2)) : 0,
        avg_active_days_per_user: Number(row.avg_active_days_per_week || 0),
        // Simplified metrics from daily_metrics
        signed_in_product_dau: Number(row.signed_in_product_dau || 0),
        signed_in_product_wau: Number(row.signed_in_product_wau || 0),
        signed_in_product_mau: Number(row.signed_in_product_mau || 0),
      };

      const fields = getFieldsParam(searchParams);
      const responseData = filterFields(fullData, fields);

      const response = NextResponse.json(responseData);
      response.headers.set(
        'Cache-Control',
        `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
      );
      return response;
    }

    // FALLBACK: Full live query for audit mode or when no snapshot exists
    const overview = await getEngagementOverview(range, {
      includeAudit,
      eventType,
    });

    const fullData = {
      source: 'database',
      family: family ?? 'site',
      event_type: eventType,
      range,
      ...overview,
    };

    // Apply field selection if requested (e.g., ?fields=dau,wau,retention)
    const fields = getFieldsParam(searchParams);
    const responseData = filterFields(fullData, fields);

    const response = NextResponse.json(responseData);
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/engagement-overview] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
