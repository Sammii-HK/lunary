import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { formatDate, resolveDateRange } from '@/lib/analytics/date-range';

type Granularity = 'day' | 'week' | 'month';

const GRANULARITY_STEPS: Record<Granularity, string> = {
  day: "INTERVAL '1 day'",
  week: "INTERVAL '7 day'",
  month: "INTERVAL '1 month'",
};

const DAY_OFFSETS = {
  DAY_1: 1,
  DAY_7: 7,
  DAY_30: 30,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const granularity = (searchParams.get('granularity') ||
      'day') as Granularity;

    const startDate = formatDate(range.start);
    const endDate = formatDate(range.end);

    const dauPromise = sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${endDate}
    `;

    const wauPromise = sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date BETWEEN (${endDate}::date - INTERVAL '6 days') AND ${endDate}
    `;

    const mauPromise = sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date BETWEEN (${endDate}::date - INTERVAL '29 days') AND ${endDate}
    `;

    const [dauResult, wauResult, mauResult] = await Promise.all([
      dauPromise,
      wauPromise,
      mauPromise,
    ]);

    const dau = Number(dauResult.rows[0]?.value || 0);
    const wau = Number(wauResult.rows[0]?.value || 0);
    const mau = Number(mauResult.rows[0]?.value || 0);

    // Calculate returning users (users who had activity before the current period)
    const returningUsersPromise = sql`
      SELECT COUNT(DISTINCT a.user_id) AS value
      FROM analytics_user_activity a
      WHERE a.activity_type = 'session'
        AND a.activity_date = ${endDate}
        AND EXISTS (
          SELECT 1
          FROM analytics_user_activity b
          WHERE b.user_id = a.user_id
            AND b.activity_type = 'session'
            AND b.activity_date < ${endDate}
        )
    `;

    const returningUsersResult = await returningUsersPromise;
    const returningUsers = Number(returningUsersResult.rows[0]?.value || 0);

    const trends = await sql`
      WITH buckets AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          CASE
            WHEN ${granularity} = 'week' THEN INTERVAL '7 day'
            WHEN ${granularity} = 'month' THEN INTERVAL '1 month'
            ELSE INTERVAL '1 day'
          END
        ) AS bucket_date
      )
      SELECT
        bucket_date::date AS date,
        (
          SELECT COUNT(DISTINCT user_id)
          FROM analytics_user_activity
          WHERE activity_type = 'session'
            AND activity_date = bucket_date::date
        ) AS dau,
        (
          SELECT COUNT(DISTINCT user_id)
          FROM analytics_user_activity
          WHERE activity_type = 'session'
            AND activity_date BETWEEN (bucket_date::date - INTERVAL '6 days') AND bucket_date::date
        ) AS wau,
        (
          SELECT COUNT(DISTINCT user_id)
          FROM analytics_user_activity
          WHERE activity_type = 'session'
            AND activity_date BETWEEN (bucket_date::date - INTERVAL '29 days') AND bucket_date::date
        ) AS mau
      FROM buckets
      ORDER BY bucket_date ASC
    `;

    const retention = await calculateRetention(startDate, range, endDate);
    const churnRate = Math.max(0, 100 - retention.day_30);

    return NextResponse.json({
      dau,
      wau,
      mau,
      returning_users: returningUsers,
      retention,
      churn_rate: churnRate,
      trends: trends.rows.map((row) => ({
        date: formatDate(new Date(row.date)),
        dau: Number(row.dau || 0),
        wau: Number(row.wau || 0),
        mau: Number(row.mau || 0),
      })),
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

async function calculateRetention(
  startDate: string,
  range: { start: Date; end: Date },
  endDate: string,
) {
  const baseUsersResult = await sql`
    SELECT DISTINCT user_id
    FROM analytics_user_activity
    WHERE activity_type = 'session'
      AND activity_date = ${startDate}
  `;

  const baseUsers = new Set(
    baseUsersResult.rows.map((row) => row.user_id).filter(Boolean),
  );

  if (baseUsers.size === 0) {
    return {
      day_1: 0,
      day_7: 0,
      day_30: 0,
    };
  }

  const retentionValues: Record<'day_1' | 'day_7' | 'day_30', number> = {
    day_1: 0,
    day_7: 0,
    day_30: 0,
  };

  for (const [key, offset] of Object.entries(DAY_OFFSETS) as Array<
    [keyof typeof DAY_OFFSETS, number]
  >) {
    const target = new Date(range.start);
    target.setDate(target.getDate() + offset);

    if (target > range.end) {
      retentionValues[keyMap(key)] = 0;
      continue;
    }

    const targetDate = formatDate(target);

    const result = await sql`
      SELECT DISTINCT user_id
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${targetDate}
    `;

    const returning = result.rows
      .map((row) => row.user_id)
      .filter((id) => id && baseUsers.has(id)).length;

    retentionValues[keyMap(key)] = Math.round(
      (returning / baseUsers.size) * 100,
    );
  }

  return retentionValues;
}

const keyMap = (key: keyof typeof DAY_OFFSETS) => {
  switch (key) {
    case 'DAY_1':
      return 'day_1';
    case 'DAY_7':
      return 'day_7';
    case 'DAY_30':
    default:
      return 'day_30';
  }
};
