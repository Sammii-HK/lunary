import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange, formatTimestamp } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { filterFields, getFieldsParam } from '@/lib/analytics/field-selection';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

/**
 * Get signup trends from daily_metrics (fast path)
 */
async function getSignupTrendsFromDailyMetrics(
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) {
  if (granularity !== 'day') {
    // For weekly/monthly, fall back to direct query for proper aggregation
    return null;
  }

  const result = await sql.query(
    `SELECT metric_date as date, new_signups as signups
     FROM daily_metrics
     WHERE metric_date >= $1 AND metric_date <= $2
     ORDER BY metric_date ASC`,
    [
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
    ],
  );

  if (result.rows.length === 0) {
    return null; // No data, fall back to live query
  }

  return result.rows.map((row) => ({
    date:
      row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date),
    signups: Number(row.signups || 0),
  }));
}

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

const fillSignupTrends = (
  trends: Array<{ date: string; signups: number }>,
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) => {
  const buckets = buildDateBuckets(startDate, endDate, granularity);
  const lookup = new Map(trends.map((t) => [t.date, t.signups]));

  return buckets.map((date) => ({
    date,
    signups: lookup.get(date) ?? 0,
  }));
};

/**
 * User Growth endpoint for insights
 * Uses pre-computed daily_metrics for 99% cost reduction when possible
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = (searchParams.get('granularity') || 'day') as
      | 'day'
      | 'week'
      | 'month';
    const range = resolveDateRange(searchParams, 30);

    // FAST PATH: Try daily_metrics first
    let dbTrends = await getSignupTrendsFromDailyMetrics(
      range.start,
      range.end,
      granularity,
    );
    let source = 'daily_metrics';

    // FALLBACK: Live query if no snapshot data
    if (!dbTrends) {
      dbTrends = await getSignupTrendsFromDb(
        range.start,
        range.end,
        granularity,
      );
      source = 'users';
    }

    const trends = fillSignupTrends(
      dbTrends,
      range.start,
      range.end,
      granularity,
    );

    const totalSignups = trends.reduce((sum, t) => sum + t.signups, 0);
    const rangeDurationMs = range.end.getTime() - range.start.getTime();
    const previousRangeEnd = new Date(range.start.getTime() - 1);
    const previousRangeStart = new Date(
      previousRangeEnd.getTime() - rangeDurationMs,
    );

    // FAST PATH for previous period too
    let previousDbTrends = await getSignupTrendsFromDailyMetrics(
      previousRangeStart,
      previousRangeEnd,
      granularity,
    );
    if (!previousDbTrends) {
      previousDbTrends = await getSignupTrendsFromDb(
        previousRangeStart,
        previousRangeEnd,
        granularity,
      );
    }

    const previousTrends = fillSignupTrends(
      previousDbTrends,
      previousRangeStart,
      previousRangeEnd,
      granularity,
    );
    const previousTotalSignups = previousTrends.reduce(
      (sum, t) => sum + t.signups,
      0,
    );
    const growthRate =
      previousTotalSignups > 0
        ? ((totalSignups - previousTotalSignups) / previousTotalSignups) * 100
        : 0;

    const fullData = {
      trends,
      growthRate: Number(growthRate.toFixed(2)),
      totalSignups,
      source,
    };

    // Apply field selection if requested (e.g., ?fields=growthRate,totalSignups)
    const fields = getFieldsParam(searchParams);
    const responseData = filterFields(fullData, fields);

    const response = NextResponse.json(responseData);
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/user-growth] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        trends: [],
        growthRate: 0,
        totalSignups: 0,
      },
      { status: 500 },
    );
  }
}

async function getSignupTrendsFromDb(
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) {
  const dateTrunc =
    granularity === 'week'
      ? 'DATE_TRUNC(\'week\', "createdAt")'
      : granularity === 'month'
        ? 'DATE_TRUNC(\'month\', "createdAt")'
        : 'DATE("createdAt")';

  const result = await sql.query(
    `
      SELECT ${dateTrunc} as date, COUNT(*) as signups
      FROM "user"
      WHERE "createdAt" >= $1
        AND "createdAt" <= $2
        AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
      GROUP BY ${dateTrunc}
      ORDER BY date ASC
    `,
    [
      formatTimestamp(startDate),
      formatTimestamp(endDate),
      TEST_EMAIL_PATTERN,
      TEST_EMAIL_EXACT,
    ],
  );

  return result.rows.map((row) => ({
    date:
      row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date),
    signups: Number(row.signups || 0),
  }));
}
