import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cohortType = (searchParams.get('type') || 'week') as 'week' | 'month';
    const weeksBack = parseInt(searchParams.get('weeks') || '12', 10);

    // Get cohorts (weekly or monthly)
    const cohortStart = new Date();
    cohortStart.setDate(cohortStart.getDate() - weeksBack * 7);

    // Use DATE_TRUNC with proper SQL syntax
    // For week: DATE_TRUNC('week', created_at)
    // For month: DATE_TRUNC('month', created_at)
    const cohortsResult =
      cohortType === 'week'
        ? await sql`
          SELECT 
            DATE_TRUNC('week', created_at) as cohort_start,
            COUNT(DISTINCT user_id) as cohort_size
          FROM conversion_events
          WHERE event_type = 'signup'
            AND created_at >= ${formatTimestamp(cohortStart)}
            AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY cohort_start DESC
          LIMIT ${weeksBack}
        `
        : await sql`
          SELECT 
            DATE_TRUNC('month', created_at) as cohort_start,
            COUNT(DISTINCT user_id) as cohort_size
          FROM conversion_events
          WHERE event_type = 'signup'
            AND created_at >= ${formatTimestamp(cohortStart)}
            AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY cohort_start DESC
          LIMIT ${weeksBack}
        `;

    const cohorts = cohortsResult.rows
      .map((row) => {
        const startDate = row.cohort_start;
        // Handle invalid dates
        if (!startDate) return null;
        const date = new Date(startDate);
        if (isNaN(date.getTime())) return null;

        return {
          startDate: date,
          cohortSize: Number(row.cohort_size || 0),
        };
      })
      .filter((c): c is { startDate: Date; cohortSize: number } => c !== null);

    // Calculate retention for each cohort at different time intervals
    const retentionMatrix: Array<{
      cohort: string;
      day0: number;
      day1: number;
      day7: number;
      day30: number;
    }> = [];

    // Helper to convert array to PostgreSQL text array literal
    const toTextArrayLiteral = (values: string[]): string | null => {
      if (values.length === 0) return null;
      return `{${values.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
    };

    // Events that indicate user activity/return
    const ACTIVITY_EVENTS = [
      'tarot_viewed',
      'horoscope_viewed',
      'birth_chart_viewed',
      'personalized_tarot_viewed',
      'personalized_horoscope_viewed',
      'onboarding_completed',
      'profile_completed',
      'birthday_entered',
      'cosmic_pulse_opened',
      'moon_circle_opened',
    ];
    const activityEventsArray = toTextArrayLiteral(ACTIVITY_EVENTS)!;

    for (const cohort of cohorts) {
      const cohortStartDate = cohort.startDate;
      const cohortEndDate = new Date(cohortStartDate);
      if (cohortType === 'week') {
        cohortEndDate.setDate(cohortEndDate.getDate() + 7);
      } else {
        cohortEndDate.setMonth(cohortEndDate.getMonth() + 1);
      }

      // Get users in this cohort with their signup dates
      const cohortUsersResult = await sql`
        SELECT DISTINCT user_id, created_at as signup_date
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at >= ${formatTimestamp(cohortStartDate)}
          AND created_at < ${formatTimestamp(cohortEndDate)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      `;

      if (cohortUsersResult.rows.length === 0) continue;

      // Calculate retention based on each user's individual signup date
      // Day 1 retention: users who returned 1 day after their signup
      const day1Retained = await sql`
        SELECT COUNT(DISTINCT ce1.user_id) as count
        FROM conversion_events ce1
        INNER JOIN conversion_events ce2 ON ce1.user_id = ce2.user_id
        WHERE ce1.event_type = 'signup'
          AND ce1.created_at >= ${formatTimestamp(cohortStartDate)}
          AND ce1.created_at < ${formatTimestamp(cohortEndDate)}
          AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
          AND ce2.event_type = ANY(SELECT unnest(${activityEventsArray}::text[]))
          AND ce2.created_at > ce1.created_at
          AND ce2.created_at <= ce1.created_at + INTERVAL '1 day'
      `;

      // Day 7 retention: users who returned within 7 days after their signup
      const day7Retained = await sql`
        SELECT COUNT(DISTINCT ce1.user_id) as count
        FROM conversion_events ce1
        INNER JOIN conversion_events ce2 ON ce1.user_id = ce2.user_id
        WHERE ce1.event_type = 'signup'
          AND ce1.created_at >= ${formatTimestamp(cohortStartDate)}
          AND ce1.created_at < ${formatTimestamp(cohortEndDate)}
          AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
          AND ce2.event_type = ANY(SELECT unnest(${activityEventsArray}::text[]))
          AND ce2.created_at > ce1.created_at
          AND ce2.created_at <= ce1.created_at + INTERVAL '7 days'
      `;

      // Day 30 retention: users who returned within 30 days after their signup
      const day30Retained = await sql`
        SELECT COUNT(DISTINCT ce1.user_id) as count
        FROM conversion_events ce1
        INNER JOIN conversion_events ce2 ON ce1.user_id = ce2.user_id
        WHERE ce1.event_type = 'signup'
          AND ce1.created_at >= ${formatTimestamp(cohortStartDate)}
          AND ce1.created_at < ${formatTimestamp(cohortEndDate)}
          AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
          AND ce2.event_type = ANY(SELECT unnest(${activityEventsArray}::text[]))
          AND ce2.created_at > ce1.created_at
          AND ce2.created_at <= ce1.created_at + INTERVAL '30 days'
      `;

      const day1Retention =
        cohort.cohortSize > 0
          ? (Number(day1Retained.rows[0]?.count || 0) / cohort.cohortSize) * 100
          : 0;
      const day7Retention =
        cohort.cohortSize > 0
          ? (Number(day7Retained.rows[0]?.count || 0) / cohort.cohortSize) * 100
          : 0;
      const day30Retention =
        cohort.cohortSize > 0
          ? (Number(day30Retained.rows[0]?.count || 0) / cohort.cohortSize) *
            100
          : 0;

      retentionMatrix.push({
        cohort: cohortStartDate.toISOString().split('T')[0],
        day0: cohort.cohortSize,
        day1: Number(day1Retention.toFixed(2)),
        day7: Number(day7Retention.toFixed(2)),
        day30: Number(day30Retention.toFixed(2)),
      });
    }

    return NextResponse.json({
      cohorts: retentionMatrix,
      cohortType,
    });
  } catch (error) {
    console.error('[analytics/cohorts] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        cohorts: [],
        cohortType: 'week',
      },
      { status: 500 },
    );
  }
}
