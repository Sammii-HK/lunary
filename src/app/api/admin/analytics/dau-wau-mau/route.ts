import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const ACTIVITY_EVENTS = [
  'app_opened',
  'tarot_viewed',
  'personalized_tarot_viewed',
  'birth_chart_viewed',
  'horoscope_viewed',
  'personalized_horoscope_viewed',
  'cosmic_pulse_opened',
  'moon_circle_opened',
  'weekly_report_opened',
  'pricing_page_viewed',
  'trial_started',
  'trial_converted',
  'subscription_started',
  'login',
  'dashboard_viewed',
  'grimoire_viewed',
];

const PRODUCT_EVENTS = [
  'birth_chart_viewed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
  'horoscope_viewed',
  'tarot_viewed',
  'dashboard_viewed',
  'login',
];

const toTextArrayLiteral = (values: string[]): string | null => {
  if (values.length === 0) return null;
  return `{${values.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
};

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

const alignDateToGranularity = (
  date: Date,
  granularity: 'day' | 'week' | 'month',
) => {
  const aligned = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  if (granularity === 'week') {
    const day = aligned.getUTCDay();
    const diff = (day + 6) % 7;
    aligned.setUTCDate(aligned.getUTCDate() - diff);
  } else if (granularity === 'month') {
    aligned.setUTCDate(1);
  }

  return aligned;
};

const buildDateBuckets = (
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) => {
  const buckets: string[] = [];
  const cursor = alignDateToGranularity(startDate, granularity);
  const end = new Date(endDate.getTime());

  while (cursor <= end) {
    buckets.push(formatDateKey(cursor));
    if (granularity === 'week') {
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    } else if (granularity === 'month') {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    } else {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return buckets;
};

const buildRollingTrends = (
  userMap: Map<string, Set<string>>,
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) => {
  const trends: Array<{ date: string; dau: number; wau: number; mau: number }> =
    [];
  const buckets = buildDateBuckets(startDate, endDate, granularity);

  const buildWindowSet = (end: Date, days: number) => {
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    const windowUsers = new Set<string>();
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = formatDateKey(d);
      const users = userMap.get(key);
      if (users) {
        users.forEach((id) => windowUsers.add(id));
      }
    }
    return windowUsers;
  };

  for (const bucket of buckets) {
    const bucketDate = new Date(`${bucket}T00:00:00Z`);
    const dau = userMap.get(bucket)?.size || 0;
    const wau = buildWindowSet(bucketDate, 7).size;
    const mau = buildWindowSet(bucketDate, 30).size;
    trends.push({ date: bucket, dau, wau, mau });
  }

  return trends;
};

const countDistinctInWindow = (
  userMap: Map<string, Set<string>>,
  endDate: Date,
  days: number,
) => {
  const start = new Date(endDate);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const windowUsers = new Set<string>();
  for (
    let d = new Date(start);
    d <= endDate;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const key = formatDateKey(d);
    const users = userMap.get(key);
    if (users) {
      users.forEach((id) => windowUsers.add(id));
    }
  }
  return windowUsers.size;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = (searchParams.get('granularity') || 'day') as
      | 'day'
      | 'week'
      | 'month';
    const range = resolveDateRange(searchParams, 30);

    const eventsArray = toTextArrayLiteral(ACTIVITY_EVENTS)!;
    const productEventsArray = toTextArrayLiteral(PRODUCT_EVENTS)!;

    const extendedStart = new Date(range.start);
    extendedStart.setUTCDate(extendedStart.getUTCDate() - 30);

    const [activityRows, productRows] = await Promise.all([
      sql`
        SELECT DATE(created_at) as date, user_id
        FROM conversion_events
        WHERE event_type = ANY(SELECT unnest(${eventsArray}::text[]))
          AND user_id IS NOT NULL
          AND created_at >= ${formatTimestamp(extendedStart)}
          AND created_at <= ${formatTimestamp(range.end)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      `,
      sql`
        SELECT DATE(created_at) as date, user_id
        FROM conversion_events
        WHERE event_type = ANY(SELECT unnest(${productEventsArray}::text[]))
          AND user_id IS NOT NULL
          AND created_at >= ${formatTimestamp(extendedStart)}
          AND created_at <= ${formatTimestamp(range.end)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      `,
    ]);

    const activityMap = new Map<string, Set<string>>();
    activityRows.rows.forEach((row) => {
      const date = String(row.date);
      const userId = String(row.user_id);
      if (!activityMap.has(date)) {
        activityMap.set(date, new Set());
      }
      activityMap.get(date)!.add(userId);
    });

    const productMap = new Map<string, Set<string>>();
    productRows.rows.forEach((row) => {
      const date = String(row.date);
      const userId = String(row.user_id);
      if (!productMap.has(date)) {
        productMap.set(date, new Set());
      }
      productMap.get(date)!.add(userId);
    });

    const trends = buildRollingTrends(
      activityMap,
      range.start,
      range.end,
      granularity,
    );
    const productTrends = buildRollingTrends(
      productMap,
      range.start,
      range.end,
      granularity,
    );

    const currentBucket = formatDateKey(
      alignDateToGranularity(range.end, granularity),
    );
    const currentTrend = trends.find(
      (trend) => trend.date === currentBucket,
    ) || {
      dau: 0,
      wau: 0,
      mau: 0,
    };
    const currentProductTrend = productTrends.find(
      (trend) => trend.date === currentBucket,
    ) || {
      dau: 0,
      wau: 0,
      mau: 0,
    };

    const productDau = countDistinctInWindow(productMap, range.end, 1);
    const productWau = countDistinctInWindow(productMap, range.end, 7);
    const productMau = countDistinctInWindow(productMap, range.end, 30);

    const signedInProductDau = productDau;
    const signedInProductWau = productWau;
    const signedInProductMau = productMau;

    const grimoireWindowStart = new Date(range.end);
    grimoireWindowStart.setUTCDate(grimoireWindowStart.getUTCDate() - 29);
    const grimoireEventsResult = await sql`
      SELECT DISTINCT user_id
      FROM conversion_events
      WHERE event_type = 'grimoire_viewed'
        AND user_id IS NOT NULL
        AND created_at >= ${formatTimestamp(grimoireWindowStart)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;
    const productWindowResult = await sql`
      SELECT DISTINCT user_id
      FROM conversion_events
      WHERE event_type = ANY(SELECT unnest(${productEventsArray}::text[]))
        AND user_id IS NOT NULL
        AND created_at >= ${formatTimestamp(grimoireWindowStart)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;

    const grimoireUsers = new Set(
      grimoireEventsResult.rows.map((row) => String(row.user_id)),
    );
    const signedInProductUsers = new Set(
      productWindowResult.rows.map((row) => String(row.user_id)),
    );
    const grimoireMau = grimoireUsers.size;
    let grimoireOnlyMau = 0;
    grimoireUsers.forEach((id) => {
      if (!signedInProductUsers.has(id)) {
        grimoireOnlyMau += 1;
      }
    });

    const productUsageSummaryResult = await sql`
      SELECT
        user_id,
        COUNT(*) as total_events,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM conversion_events
      WHERE event_type = ANY(SELECT unnest(${productEventsArray}::text[]))
        AND user_id IS NOT NULL
        AND created_at >= ${formatTimestamp(range.start)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY user_id
    `;

    const productUsers = productUsageSummaryResult.rows.length;
    const returningUsers = productUsageSummaryResult.rows.filter(
      (row) => Number(row.active_days || 0) > 1,
    ).length;
    const totalSessions = productUsageSummaryResult.rows.reduce(
      (sum, row) => sum + Number(row.active_days || 0),
      0,
    );
    const avgSessionsPerUser =
      productUsers > 0 ? totalSessions / productUsers : 0;

    const retentionEventsArray = toTextArrayLiteral(ACTIVITY_EVENTS)!;

    const calcRetention = async (
      cohortStart: Date,
      cohortEnd: Date,
      days: 1 | 7 | 30,
    ) => {
      const result = await sql`
        WITH cohort AS (
          SELECT id, "createdAt"
          FROM "user"
          WHERE "createdAt" >= ${formatTimestamp(cohortStart)}
            AND "createdAt" < ${formatTimestamp(cohortEnd)}
            AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
        )
        SELECT
          COUNT(*) AS cohort_size,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM conversion_events ce
              WHERE ce.user_id = cohort.id
                AND ce.event_type = ANY(SELECT unnest(${retentionEventsArray}::text[]))
                AND ce.created_at > cohort."createdAt"
                AND ce.created_at <= cohort."createdAt" + INTERVAL '${days} days'
                AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce.user_email != ${TEST_EMAIL_EXACT}))
            )
          ) AS returned
        FROM cohort
      `;

      const cohortSize = Number(result.rows[0]?.cohort_size || 0);
      const returned = Number(result.rows[0]?.returned || 0);
      return cohortSize > 0 ? (returned / cohortSize) * 100 : 0;
    };

    const day1Start = new Date(range.end);
    day1Start.setUTCDate(day1Start.getUTCDate() - 2);
    const day1End = new Date(range.end);
    day1End.setUTCDate(day1End.getUTCDate() - 1);

    const day7Start = new Date(range.end);
    day7Start.setUTCDate(day7Start.getUTCDate() - 14);
    const day7End = new Date(range.end);
    day7End.setUTCDate(day7End.getUTCDate() - 7);

    const day30Start = new Date(range.end);
    day30Start.setUTCDate(day30Start.getUTCDate() - 60);
    const day30End = new Date(range.end);
    day30End.setUTCDate(day30End.getUTCDate() - 30);

    const [day1Retention, day7Retention, day30Retention] = await Promise.all([
      calcRetention(day1Start, day1End, 1),
      calcRetention(day7Start, day7End, 7),
      calcRetention(day30Start, day30End, 30),
    ]);

    const churnRate =
      day30Retention > 0 ? Number((100 - day30Retention).toFixed(2)) : null;

    return NextResponse.json({
      dau: currentTrend.dau,
      wau: currentTrend.wau,
      mau: currentTrend.mau,
      returning_users:
        currentTrend.wau > 0 && currentTrend.dau > 0
          ? Math.round(currentTrend.wau - currentTrend.dau * 0.5)
          : 0,
      retention: {
        day_1: Number(day1Retention.toFixed(2)),
        day_7: Number(day7Retention.toFixed(2)),
        day_30: Number(day30Retention.toFixed(2)),
      },
      churn_rate: churnRate,
      trends,
      product_trends: productTrends,
      signed_in_product_trends: productTrends,
      product_dau: productDau,
      product_wau: productWau,
      product_mau: productMau,
      signed_in_product_dau: signedInProductDau,
      signed_in_product_wau: signedInProductWau,
      signed_in_product_mau: signedInProductMau,
      signed_in_product_users: productUsers,
      signed_in_product_returning_users: returningUsers,
      signed_in_product_avg_sessions_per_user: Number(
        avgSessionsPerUser.toFixed(2),
      ),
      content_mau_grimoire: grimoireMau,
      grimoire_only_mau: grimoireOnlyMau,
      debug: {
        grimoire_metrics_source: 'conversion_events',
        product_summary_source: 'conversion_events',
      },
      source: 'database',
    });
  } catch (error) {
    console.error('[analytics/dau-wau-mau] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
