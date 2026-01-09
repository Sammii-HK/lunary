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
    const startParam = searchParams.get('start_date');
    const endParam = searchParams.get('end_date');

    const parseDateParam = (value: string | null, fallback: Date): Date => {
      if (!value) return fallback;
      const parsed = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) return fallback;
      return parsed;
    };

    const defaultStart = (() => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - weeksBack * 7);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    })();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let rangeStart = parseDateParam(startParam, defaultStart);
    let rangeEndInclusive = parseDateParam(endParam, today);

    if (rangeEndInclusive < rangeStart) {
      const temp = rangeStart;
      rangeStart = rangeEndInclusive;
      rangeEndInclusive = temp;
    }

    const rangeEndExclusive = new Date(rangeEndInclusive);
    rangeEndExclusive.setUTCDate(rangeEndExclusive.getUTCDate() + 1);
    rangeEndExclusive.setUTCHours(0, 0, 0, 0);

    const alignToPeriodStart = (date: Date) => {
      const aligned = new Date(date);
      aligned.setUTCHours(0, 0, 0, 0);
      if (cohortType === 'week') {
        const day = aligned.getUTCDay();
        const distanceToMonday = (day + 6) % 7;
        aligned.setUTCDate(aligned.getUTCDate() - distanceToMonday);
      } else {
        aligned.setUTCDate(1);
      }
      return aligned;
    };

    const periodStarts: Array<{ start: Date; end: Date }> = [];
    let currentStart = alignToPeriodStart(rangeStart);
    let addedPeriods = 0;

    const addPeriod = (date: Date) => {
      const next = new Date(date);
      if (cohortType === 'week') {
        next.setUTCDate(next.getUTCDate() + 7);
      } else {
        next.setUTCMonth(next.getUTCMonth() + 1);
      }
      return next;
    };

    while (addedPeriods < weeksBack && currentStart < rangeEndExclusive) {
      const periodEnd = addPeriod(currentStart);
      if (periodEnd <= rangeStart) {
        currentStart = periodEnd;
        continue;
      }
      periodStarts.push({
        start: new Date(currentStart),
        end: new Date(periodEnd),
      });
      currentStart = periodEnd;
      addedPeriods += 1;
    }

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

    for (const period of periodStarts) {
      const cohortStartDate = period.start;
      const cohortEndDate = period.end;

      const cohortUsersResult = await sql`
        SELECT COUNT(DISTINCT user_id) as cohort_size
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at >= ${formatTimestamp(period.start)}
          AND created_at < ${formatTimestamp(period.end)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      `;

      const cohortSize = Number(cohortUsersResult.rows[0]?.cohort_size ?? 0);
      if (cohortSize === 0) continue;

      // Calculate retention metrics using the cohort window
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

      const formattedStart = period.start.toISOString().split('T')[0];
      const day1Retention =
        (Number(day1Retained.rows[0]?.count || 0) / cohortSize) * 100;
      const day7Retention =
        (Number(day7Retained.rows[0]?.count || 0) / cohortSize) * 100;
      const day30Retention =
        (Number(day30Retained.rows[0]?.count || 0) / cohortSize) * 100;

      retentionMatrix.push({
        cohort: formattedStart,
        day0: cohortSize,
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
