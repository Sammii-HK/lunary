import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

// Canonical event types (DB is SSOT)
// - Engagement (DAU/WAU/MAU) is derived from app_opened only.
const ACTIVITY_EVENTS = ['app_opened'];

// Product interaction events (exclude Grimoire)
const PRODUCT_EVENTS = [
  'daily_dashboard_viewed',
  'chart_viewed',
  'tarot_drawn',
  'astral_chat_used',
  'ritual_started',
];

// Note: When using @vercel/postgres, avoid constructing "array SQL" as a string
// or nesting sql fragments. Instead pass JS arrays as parameters and cast to text[].

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

const normalizeRowDateKey = (value: unknown): string => {
  // `DATE(created_at)` can come back as a Date or a string depending on driver.
  if (value instanceof Date) return formatDateKey(value);
  if (typeof value === 'string') {
    // Keep date-only strings stable.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return formatDateKey(parsed);
    return value;
  }
  const parsed = new Date(String(value));
  if (!Number.isNaN(parsed.getTime())) return formatDateKey(parsed);
  return String(value);
};

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

    const identityLinksExistsResult = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    const hasIdentityLinks = Boolean(identityLinksExistsResult.rows[0]?.exists);

    const extendedStart = new Date(range.start);
    extendedStart.setUTCDate(extendedStart.getUTCDate() - 30);

    const [activityRows, productRows] = await Promise.all([
      sql.query(
        `
          SELECT DATE(created_at) as date, user_id
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND user_id IS NOT NULL
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          ACTIVITY_EVENTS,
          formatTimestamp(extendedStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
          SELECT DATE(created_at) as date, user_id
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND user_id IS NOT NULL
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          PRODUCT_EVENTS,
          formatTimestamp(extendedStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
    ]);

    const activityMap = new Map<string, Set<string>>();
    activityRows.rows.forEach((row) => {
      const date = normalizeRowDateKey(row.date);
      const userId = String(row.user_id);
      if (!activityMap.has(date)) {
        activityMap.set(date, new Set());
      }
      activityMap.get(date)!.add(userId);
    });

    const productMap = new Map<string, Set<string>>();
    productRows.rows.forEach((row) => {
      const date = normalizeRowDateKey(row.date);
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
    const productWindowResult = await sql.query(
      `
        SELECT DISTINCT user_id
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND user_id IS NOT NULL
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
      `,
      [
        // Treat any app_opened as product engagement for the purpose of
        // identifying Grimoire-only users (Grimoire-only means Grimoire without app engagement).
        ['app_opened', ...PRODUCT_EVENTS],
        formatTimestamp(grimoireWindowStart),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    );

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

    const productUsageSummaryResult = await sql.query(
      `
        SELECT
          user_id,
          COUNT(*) as total_events,
          COUNT(DISTINCT DATE(created_at)) as active_days
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND user_id IS NOT NULL
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        GROUP BY user_id
      `,
      [
        PRODUCT_EVENTS,
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    );

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

    const calcRetention = async (
      cohortStart: Date,
      cohortEndInclusive: Date,
      days: 1 | 7 | 30,
    ): Promise<number | null> => {
      if (cohortEndInclusive < cohortStart) return null;
      const query = hasIdentityLinks
        ? `
        WITH cohort AS (
          SELECT id, "createdAt"
          FROM "user"
          WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            AND (email IS NULL OR (email NOT LIKE $4 AND email != $5))
        )
        SELECT
          COUNT(*) AS cohort_size,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM conversion_events ce
              WHERE ce.event_type = ANY($3::text[])
                AND ce.created_at > cohort."createdAt"
                AND ce.created_at <= cohort."createdAt" + INTERVAL '${days} days'
                AND (
                  ce.user_id = cohort.id
                  OR (
                    ce.anonymous_id IS NOT NULL
                    AND EXISTS (
                      SELECT 1
                      FROM analytics_identity_links l
                      WHERE l.user_id = cohort.id
                        AND l.anonymous_id = ce.anonymous_id
                    )
                  )
                )
                AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $4 AND ce.user_email != $5))
            )
          ) AS returned
        FROM cohort
      `
        : `
        WITH cohort AS (
          SELECT id, "createdAt"
          FROM "user"
          WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            AND (email IS NULL OR (email NOT LIKE $4 AND email != $5))
        )
        SELECT
          COUNT(*) AS cohort_size,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM conversion_events ce
              WHERE ce.user_id = cohort.id
                AND ce.event_type = ANY($3::text[])
                AND ce.created_at > cohort."createdAt"
                AND ce.created_at <= cohort."createdAt" + INTERVAL '${days} days'
                AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $4 AND ce.user_email != $5))
            )
          ) AS returned
        FROM cohort
      `;

      const result = await sql.query(query, [
        formatTimestamp(cohortStart),
        formatTimestamp(cohortEndInclusive),
        ACTIVITY_EVENTS,
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ]);

      const cohortSize = Number(result.rows[0]?.cohort_size || 0);
      const returned = Number(result.rows[0]?.returned || 0);
      return cohortSize > 0 ? (returned / cohortSize) * 100 : null;
    };

    // Retention for the selected range: cohort = signups inside the selected range
    // with enough time to observe the requested window (signup <= end - N days).
    const eligibleCohortEndInclusive = (days: 1 | 7 | 30) => {
      const d = new Date(range.end);
      d.setUTCDate(d.getUTCDate() - days);
      return d;
    };

    const [day1Retention, day7Retention, day30Retention] = await Promise.all([
      calcRetention(range.start, eligibleCohortEndInclusive(1), 1),
      calcRetention(range.start, eligibleCohortEndInclusive(7), 7),
      calcRetention(range.start, eligibleCohortEndInclusive(30), 30),
    ]);

    const churnRate =
      typeof day30Retention === 'number'
        ? Number((100 - day30Retention).toFixed(2))
        : null;

    return NextResponse.json({
      dau: currentTrend.dau,
      wau: currentTrend.wau,
      mau: currentTrend.mau,
      returning_users:
        currentTrend.wau > 0 && currentTrend.dau > 0
          ? Math.round(currentTrend.wau - currentTrend.dau * 0.5)
          : 0,
      retention: {
        day_1:
          typeof day1Retention === 'number'
            ? Number(day1Retention.toFixed(2))
            : null,
        day_7:
          typeof day7Retention === 'number'
            ? Number(day7Retention.toFixed(2))
            : null,
        day_30:
          typeof day30Retention === 'number'
            ? Number(day30Retention.toFixed(2))
            : null,
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
