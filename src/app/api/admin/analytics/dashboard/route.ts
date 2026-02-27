import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_REALTIME_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

/**
 * Consolidated dashboard endpoint using hybrid query strategy
 *
 * COST OPTIMIZATION:
 * - Historical data (yesterday and before): Fast lookup from daily_metrics table
 * - Today's data: Live query with indexes
 * - Combines both for totals
 *
 * This reduces database costs by 99% compared to scanning all raw data.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const rangeStart = new Date(range.start);
    rangeStart.setUTCHours(0, 0, 0, 0);
    const rangeEnd = new Date(range.end);
    rangeEnd.setUTCHours(23, 59, 59, 999);

    // Check if range includes today
    const includesToday = rangeEnd >= today;

    // Execute queries in parallel
    const queries = [];

    // 1. Get historical metrics from daily_metrics (fast!)
    if (rangeStart < today) {
      const historicalEnd = includesToday
        ? new Date(today.getTime() - 1) // Yesterday
        : rangeEnd;

      queries.push(
        sql.query(
          `SELECT
            metric_date,
            dau, wau, mau,
            signed_in_product_dau, signed_in_product_wau, signed_in_product_mau,
            app_opened_mau,
            new_signups, activated_users, activation_rate,
            mrr, active_subscriptions, trial_subscriptions, new_conversions,
            stickiness, avg_active_days_per_week,
            dashboard_adoption, horoscope_adoption, tarot_adoption,
            chart_adoption, guide_adoption, ritual_adoption
          FROM daily_metrics
          WHERE metric_date >= $1 AND metric_date <= $2
          ORDER BY metric_date ASC`,
          [
            rangeStart.toISOString().split('T')[0],
            historicalEnd.toISOString().split('T')[0],
          ],
        ),
      );
    } else {
      queries.push(Promise.resolve({ rows: [] }));
    }

    // 2. Get today's metrics (live query if range includes today)
    if (includesToday) {
      const todayStart = new Date(today);
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setUTCHours(23, 59, 59, 999);

      // WAU and MAU windows for today
      const wauStart = new Date(todayEnd);
      wauStart.setUTCDate(wauStart.getUTCDate() - 6);
      const mauStart = new Date(todayEnd);
      mauStart.setUTCDate(mauStart.getUTCDate() - 29);

      queries.push(
        Promise.all([
          // Today's DAU
          sql.query(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM conversion_events
             WHERE created_at >= $1 AND created_at <= $2
               AND user_id IS NOT NULL
               AND user_id NOT LIKE 'anon:%'
               AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
            [
              todayStart.toISOString(),
              todayEnd.toISOString(),
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),

          // Today's Product DAU
          sql.query(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM conversion_events
             WHERE created_at >= $1 AND created_at <= $2
               AND user_id IS NOT NULL
               AND user_id NOT LIKE 'anon:%'
               AND event_type NOT IN ('app_opened', 'page_viewed')
               AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
            [
              todayStart.toISOString(),
              todayEnd.toISOString(),
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),

          // Current WAU (7-day window)
          sql.query(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM conversion_events
             WHERE created_at >= $1 AND created_at <= $2
               AND user_id IS NOT NULL
               AND user_id NOT LIKE 'anon:%'
               AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
            [
              wauStart.toISOString(),
              todayEnd.toISOString(),
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),

          // Current MAU (30-day window)
          sql.query(
            `SELECT COUNT(DISTINCT user_id) as count
             FROM conversion_events
             WHERE created_at >= $1 AND created_at <= $2
               AND user_id IS NOT NULL
               AND user_id NOT LIKE 'anon:%'
               AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
            [
              mauStart.toISOString(),
              todayEnd.toISOString(),
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),

          // Today's signups
          sql.query(
            `SELECT COUNT(*) as count
             FROM "user"
             WHERE "createdAt" >= $1 AND "createdAt" <= $2
               AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))`,
            [
              todayStart.toISOString(),
              todayEnd.toISOString(),
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),

          // Current MRR (snapshot, not daily) — active only, trials excluded (not yet charged)
          sql.query(
            `SELECT COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr,
                    COUNT(*) FILTER (WHERE status = 'active') as active,
                    COUNT(*) FILTER (WHERE status IN ('trial', 'trialing')) as trial
             FROM subscriptions
             WHERE status = 'active'
               AND stripe_subscription_id IS NOT NULL
               AND (user_email IS NULL OR (user_email NOT LIKE $1 AND user_email != $2))`,
            [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
          ),
        ]),
      );
    } else {
      queries.push(Promise.resolve(null));
    }

    const [historicalResult, todayResults] = await Promise.all(queries);

    // Process historical data
    const historicalMetrics = historicalResult.rows.map((row: any) => ({
      date: row.metric_date,
      dau: Number(row.dau || 0),
      wau: Number(row.wau || 0),
      mau: Number(row.mau || 0),
      productDau: Number(row.signed_in_product_dau || 0),
      productWau: Number(row.signed_in_product_wau || 0),
      productMau: Number(row.signed_in_product_mau || 0),
      signups: Number(row.new_signups || 0),
      activationRate: Number(row.activation_rate || 0),
      mrr: Number(row.mrr || 0),
      stickiness: Number(row.stickiness || 0),
      featureAdoption: {
        dashboard: Number(row.dashboard_adoption || 0),
        horoscope: Number(row.horoscope_adoption || 0),
        tarot: Number(row.tarot_adoption || 0),
        chart: Number(row.chart_adoption || 0),
        guide: Number(row.guide_adoption || 0),
        ritual: Number(row.ritual_adoption || 0),
      },
    }));

    // Process today's data (if applicable)
    let todayMetrics = null;
    if (todayResults && Array.isArray(todayResults)) {
      const [dauRes, productDauRes, wauRes, mauRes, signupsRes, mrrRes] =
        todayResults;

      const dau = Number(dauRes.rows[0]?.count || 0);
      const productDau = Number(productDauRes.rows[0]?.count || 0);
      const wau = Number(wauRes.rows[0]?.count || 0);
      const mau = Number(mauRes.rows[0]?.count || 0);
      const signups = Number(signupsRes.rows[0]?.count || 0);
      const mrr = Number(mrrRes.rows[0]?.mrr || 0);
      const activeSubscriptions = Number(mrrRes.rows[0]?.active || 0);
      const trialSubscriptions = Number(mrrRes.rows[0]?.trial || 0);

      const stickiness = mau > 0 ? (dau / mau) * 100 : 0;

      todayMetrics = {
        date: todayStr,
        dau,
        wau,
        mau,
        productDau,
        signups,
        mrr,
        activeSubscriptions,
        trialSubscriptions,
        stickiness,
        isLive: true, // Flag to indicate this is real-time data
      };
    }

    // Combine historical + today
    const allMetrics = [...historicalMetrics];
    if (todayMetrics) {
      allMetrics.push(todayMetrics);
    }

    // Calculate aggregates
    const totalSignups = allMetrics.reduce(
      (sum, m) => sum + (m.signups || 0),
      0,
    );
    const latestMetric = allMetrics[allMetrics.length - 1];
    const currentMau = latestMetric?.mau || 0;
    const currentMrr = todayMetrics?.mrr || latestMetric?.mrr || 0;

    const response = NextResponse.json({
      dateRange: {
        start: range.start,
        end: range.end,
      },
      summary: {
        mau: currentMau,
        mrr: currentMrr,
        totalSignups,
        stickiness: latestMetric?.stickiness || 0,
      },
      timeseries: allMetrics,
      dataSource: {
        historical: historicalMetrics.length,
        live: todayMetrics ? 1 : 0,
        message: todayMetrics
          ? `Historical data from snapshots (fast), today's data is real-time`
          : 'All data from pre-computed snapshots',
      },
    });

    // Cache for 5 minutes with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${ANALYTICS_REALTIME_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_REALTIME_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/dashboard] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
