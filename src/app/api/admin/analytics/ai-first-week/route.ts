import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const startTs = formatTimestamp(range.start);
    const endTs = formatTimestamp(range.end);

    // Use conversion_events for signup tracking (not analytics_user_activity)
    const usersWithAiAfterWeekResult = await sql`
      WITH user_signup_dates AS (
        SELECT DISTINCT
          user_id,
          MIN(created_at) AS signup_date
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at BETWEEN ${startTs} AND ${endTs}
        GROUP BY user_id
      ),
      users_with_ai_after_week AS (
        SELECT DISTINCT
          usd.user_id,
          usd.signup_date
        FROM user_signup_dates usd
        WHERE EXISTS (
          SELECT 1
          FROM analytics_ai_usage aau
          WHERE aau.user_id = usd.user_id
            AND aau.created_at BETWEEN (usd.signup_date + INTERVAL '7 days') AND (usd.signup_date + INTERVAL '14 days')
        )
      )
      SELECT
        COUNT(*) AS count,
        COUNT(*) FILTER (WHERE signup_date BETWEEN ${startTs} AND ${endTs}) AS in_range_count
      FROM users_with_ai_after_week
    `;

    const totalNewUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'signup'
        AND created_at BETWEEN ${startTs} AND ${endTs}
    `;

    const totalNewUsers = Number(totalNewUsersResult.rows[0]?.count || 0);
    const usersWithAiAfterWeek = Number(
      usersWithAiAfterWeekResult.rows[0]?.in_range_count || 0,
    );
    const percentage =
      totalNewUsers > 0
        ? Number(((usersWithAiAfterWeek / totalNewUsers) * 100).toFixed(2))
        : 0;

    const weeklyBreakdownResult = await sql`
      WITH user_signup_dates AS (
        SELECT DISTINCT
          user_id,
          MIN(created_at) AS signup_date
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at BETWEEN ${startTs} AND ${endTs}
        GROUP BY user_id
      ),
      weekly_cohorts AS (
        SELECT
          DATE_TRUNC('week', signup_date) AS week_start,
          COUNT(DISTINCT user_id) AS total_users,
          COUNT(DISTINCT CASE
            WHEN EXISTS (
              SELECT 1
              FROM analytics_ai_usage aau
              WHERE aau.user_id = usd.user_id
                AND aau.created_at BETWEEN (usd.signup_date + INTERVAL '7 days') AND (usd.signup_date + INTERVAL '14 days')
            ) THEN user_id
          END) AS users_with_ai
        FROM user_signup_dates usd
        WHERE signup_date BETWEEN ${startTs} AND ${endTs}
        GROUP BY DATE_TRUNC('week', signup_date)
      )
      SELECT
        week_start::date AS week_start,
        total_users,
        users_with_ai,
        CASE
          WHEN total_users > 0 THEN ROUND((users_with_ai::numeric / total_users::numeric) * 100, 2)
          ELSE 0
        END AS percentage
      FROM weekly_cohorts
      ORDER BY week_start DESC
    `;

    const breakdown = weeklyBreakdownResult.rows.map((row) => ({
      week_start: formatDate(new Date(row.week_start)),
      total_users: Number(row.total_users || 0),
      users_with_ai: Number(row.users_with_ai || 0),
      percentage: Number(row.percentage || 0),
    }));

    return NextResponse.json({
      total_new_users: totalNewUsers,
      users_with_ai_after_week: usersWithAiAfterWeek,
      percentage,
      breakdown,
    });
  } catch (error) {
    console.error('[analytics/ai-first-week] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
