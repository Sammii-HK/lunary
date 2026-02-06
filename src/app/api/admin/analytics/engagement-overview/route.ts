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

    // FAST PATH: Use pre-computed daily_metrics for instant load.
    // daily_metrics uses user_id counts (no identity resolution) — close enough
    // for dashboard monitoring. Use ?debug=1 for exact identity-resolved numbers.
    {
      const snapshotResult = await sql.query(
        `SELECT *
      FROM daily_metrics
      WHERE metric_date >= $1 AND metric_date <= $2
      ORDER BY metric_date ASC`,
        [
          range.start.toISOString().split('T')[0],
          range.end.toISOString().split('T')[0],
        ],
      );

      // Check if returning_referrer data exists in daily_metrics.
      // If all zeros, the cron hasn't populated these columns yet — fall through to live path.
      const hasReferrerData =
        snapshotResult.rows.length > 0 &&
        snapshotResult.rows.some(
          (r) =>
            Number(r.returning_referrer_organic || 0) +
              Number(r.returning_referrer_direct || 0) +
              Number(r.returning_referrer_internal || 0) >
            0,
        );

      const hasActiveDaysData = snapshotResult.rows.some(
        (r) =>
          Number(r.active_days_1 || 0) +
            Number(r.active_days_2_3 || 0) +
            Number(r.active_days_4_7 || 0) >
          0,
      );

      if (
        snapshotResult.rows.length > 0 &&
        !includeAudit &&
        hasReferrerData &&
        hasActiveDaysData
      ) {
        const rows = snapshotResult.rows;
        const latest = rows[rows.length - 1];
        const dau = Number(latest.dau || 0);
        const wau = Number(latest.wau || 0);
        const mau = Number(latest.mau || 0);

        // Build DAU trend from all rows
        const dau_trend = rows.map((row) => {
          const d = row.metric_date;
          const date =
            d instanceof Date
              ? d.toISOString().split('T')[0]
              : typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)
                ? d.split('T')[0]
                : String(d);
          return {
            date,
            dau: Number(row.dau || 0),
            returning_dau: Number(row.returning_dau || 0),
          };
        });

        // Find latest row with referrer data
        const lastWithReferrer =
          [...rows]
            .reverse()
            .find(
              (r) =>
                Number(r.returning_referrer_organic || 0) +
                  Number(r.returning_referrer_direct || 0) +
                  Number(r.returning_referrer_internal || 0) >
                0,
            ) ?? latest;

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
          stickiness_wau_mau: Number(latest.stickiness_wau_mau || 0),
          avg_active_days_per_user: Number(
            latest.avg_active_days_per_week || 0,
          ),
          // Returning users
          returning_dau: Number(latest.returning_dau || 0),
          returning_wau: Number(latest.returning_wau || 0),
          returning_mau: Number(latest.returning_mau || 0),
          new_users: rows.reduce(
            (sum, row) => sum + Number(row.new_signups || 0),
            0,
          ),
          returning_users_lifetime: Number(latest.returning_mau || 0),
          returning_users_range: Number(latest.returning_mau || 0),
          // Active days distribution
          active_days_distribution: {
            '1': Number(latest.active_days_1 || 0),
            '2-3': Number(latest.active_days_2_3 || 0),
            '4-7': Number(latest.active_days_4_7 || 0),
            '8-14': Number(latest.active_days_8_14 || 0),
            '15+': Number(latest.active_days_15_plus || 0),
          },
          // Retention from snapshot
          retention: {
            cohorts: [],
          },
          // All-time metrics
          all_time: {
            total_product_users: Number(latest.total_accounts || 0),
            returning_users: Number(latest.returning_mau || 0),
            median_active_days_per_user: Number(
              latest.avg_active_days_per_week || 0,
            ),
          },
          // DAU trend built from all rows
          dau_trend,
          // Returning referrer breakdown
          returning_referrer_breakdown: {
            organic_returning: Number(
              lastWithReferrer.returning_referrer_organic || 0,
            ),
            direct_returning: Number(
              lastWithReferrer.returning_referrer_direct || 0,
            ),
            internal_returning: Number(
              lastWithReferrer.returning_referrer_internal || 0,
            ),
          },
          // Signed-in product metrics
          signed_in_product_dau: Number(latest.signed_in_product_dau || 0),
          signed_in_product_wau: Number(latest.signed_in_product_wau || 0),
          signed_in_product_mau: Number(latest.signed_in_product_mau || 0),
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
    } // end fast path (falls through to live query if no snapshot, debug=1, or missing referrer data)

    // Full live query with identity resolution
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
