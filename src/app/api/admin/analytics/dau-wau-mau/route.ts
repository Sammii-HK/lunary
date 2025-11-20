import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { formatDate, resolveDateRange } from '@/lib/analytics/date-range';

// Test user exclusion patterns - matches filtering in analytics summary
const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const EXCLUDED_EMAIL = 'kellow.sammii@gmail.com';

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
      WHERE activity_type = 'session' AND activity_date = ${endDate}
        AND user_id NOT IN (
          SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
          UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
        )
    `;

    const wauPromise = sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date BETWEEN (${endDate}::date - INTERVAL '6 days') AND ${endDate}
        AND user_id NOT IN (
          SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
          UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
        )
    `;

    const mauPromise = sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date BETWEEN (${endDate}::date - INTERVAL '29 days') AND ${endDate}
        AND user_id NOT IN (
          SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
          UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
        )
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
      WHERE a.activity_type = 'session' AND a.activity_date = ${endDate}
        AND a.user_id NOT IN (
          SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
          UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
        )
        AND EXISTS (
          SELECT 1 FROM analytics_user_activity b
          WHERE b.user_id = a.user_id
            AND b.activity_type = 'session'
            AND b.activity_date < ${endDate}
            AND b.user_id NOT IN (
              SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
              UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
            )
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
          WHERE activity_type = 'session' AND activity_date = bucket_date::date
            AND user_id NOT IN (
              SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
              UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
            )
        ) AS dau,
        (
          SELECT COUNT(DISTINCT user_id)
          FROM analytics_user_activity
          WHERE activity_type = 'session'
            AND activity_date BETWEEN (bucket_date::date - INTERVAL '6 days') AND bucket_date::date
            AND user_id NOT IN (
              SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
              UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
            )
        ) AS wau,
        (
          SELECT COUNT(DISTINCT user_id)
          FROM analytics_user_activity
          WHERE activity_type = 'session'
            AND activity_date BETWEEN (bucket_date::date - INTERVAL '29 days') AND bucket_date::date
            AND user_id NOT IN (
              SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
              UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
            )
        ) AS mau
      FROM buckets
      ORDER BY bucket_date ASC
    `;

    const retention = await calculateRetention(startDate, range, endDate);
    // Churn is inverse of 30-day retention, but only if we have retention data
    const churnRate =
      retention.day_30 !== null ? Math.max(0, 100 - retention.day_30) : null;

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
  // Get base cohort: users active in the first 3 days of the range
  // This makes retention more robust - if no one was active on the exact start date,
  // we still get a cohort from the first few days
  const cohortStartDate = formatDate(range.start);
  const cohortEndDateObj = new Date(range.start);
  cohortEndDateObj.setDate(cohortEndDateObj.getDate() + 2);
  const cohortEndDate = formatDate(
    cohortEndDateObj > range.end ? range.end : cohortEndDateObj,
  );

  const baseUsersResult = await sql`
    SELECT DISTINCT user_id
    FROM analytics_user_activity
    WHERE activity_type = 'session' 
      AND activity_date BETWEEN ${cohortStartDate} AND ${cohortEndDate}
      AND user_id NOT IN (
        SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
        UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
      )
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

  // Use the cohort end date as the reference point for retention calculations
  const cohortReferenceDate = new Date(cohortEndDate);

  for (const [key, offset] of Object.entries(DAY_OFFSETS) as Array<
    [keyof typeof DAY_OFFSETS, number]
  >) {
    // Use a window for retention checks (e.g., day 1 = days 1-3, day 7 = days 7-9, day 30 = days 30-32)
    // This accounts for users who might not return on the exact day
    const windowStart = new Date(cohortReferenceDate);
    windowStart.setDate(windowStart.getDate() + offset);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 2); // 3-day window

    // If window start is beyond our data range, can't calculate retention
    if (windowStart > range.end) {
      retentionValues[keyMap(key)] = 0;
      continue;
    }

    // Clamp window end to range end if needed
    const actualWindowEnd = windowEnd > range.end ? range.end : windowEnd;
    const windowStartDate = formatDate(windowStart);
    const windowEndDate = formatDate(actualWindowEnd);

    // Check if users from the cohort returned within the window
    const baseUsersArray = Array.from(baseUsers);

    if (baseUsersArray.length === 0) {
      retentionValues[keyMap(key)] = 0;
      continue;
    }

    // Use sql.unsafe() for array handling with proper test user filtering
    // Convert array to PostgreSQL array literal format
    const arrayLiteral = `{${baseUsersArray.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(',')}}`;
    const result = await (sql as any).unsafe(
      `SELECT DISTINCT a.user_id
       FROM analytics_user_activity a
       WHERE a.activity_type = 'session' 
         AND a.activity_date BETWEEN $1 AND $2
         AND a.user_id = ANY($3::text[])
         AND a.user_id NOT IN (
           SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE $4 OR user_email = $5 OR user_email = $6
           UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE $4 OR user_email = $5 OR user_email = $6
         )`,
      [
        windowStartDate,
        windowEndDate,
        arrayLiteral,
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        EXCLUDED_EMAIL,
      ],
    );

    const returning = result.rows.length;

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
