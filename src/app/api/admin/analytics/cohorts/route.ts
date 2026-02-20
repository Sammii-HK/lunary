import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { ANALYTICS_HISTORICAL_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

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

    const identityLinksExistsResult = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    const hasIdentityLinks = Boolean(identityLinksExistsResult.rows[0]?.exists);

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
      day1: number | null;
      day7: number | null;
      day30: number | null;
    }> = [];

    // Cohorts younger than their retention window show null (displayed as "—")
    const nowMs = Date.now();

    // DB SSOT: retention is based on meaningful opens (deduped at source).
    // Use product_opened for cohort retention (authenticated product usage)
    // app_opened is site-wide (includes anonymous grimoire visitors)
    const ACTIVITY_EVENTS = ['product_opened'];

    for (const period of periodStarts) {
      const cohortStartDate = period.start;
      const cohortEndDate = period.end;

      const cohortUsersResult = await sql`
        SELECT COUNT(*) as cohort_size
        FROM "user"
        WHERE "createdAt" >= ${formatTimestamp(period.start)}
          AND "createdAt" < ${formatTimestamp(period.end)}
          AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
      `;

      const cohortSize = Number(cohortUsersResult.rows[0]?.cohort_size ?? 0);
      if (cohortSize === 0) continue;

      // Day 1 retention: users who returned on day 1 or later (standard retention metric)
      // This ensures Day 1 >= Day 7 >= Day 30 (monotonically decreasing)
      const day1Retained = await sql.query(
        hasIdentityLinks
          ? `
          SELECT COUNT(*) as count
          FROM "user" u
          WHERE u."createdAt" >= $1
            AND u."createdAt" < $2
            AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
            AND EXISTS (
              SELECT 1
              FROM conversion_events ce2
              WHERE ce2.event_type = ANY($5::text[])
                AND DATE(ce2.created_at AT TIME ZONE 'UTC') >= DATE(u."createdAt" AT TIME ZONE 'UTC') + 1
                AND (
                  ce2.user_id = u.id
                  OR (
                    ce2.anonymous_id IS NOT NULL
                    AND EXISTS (
                      SELECT 1
                      FROM analytics_identity_links l
                      WHERE l.user_id = u.id
                        AND l.anonymous_id = ce2.anonymous_id
                    )
                  )
                )
            )
        `
          : `
          SELECT COUNT(*) as count
          FROM "user" u
          WHERE u."createdAt" >= $1
            AND u."createdAt" < $2
            AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
            AND EXISTS (
              SELECT 1
              FROM conversion_events ce2
              WHERE ce2.user_id = u.id
                AND ce2.event_type = ANY($5::text[])
                AND DATE(ce2.created_at AT TIME ZONE 'UTC') >= DATE(u."createdAt" AT TIME ZONE 'UTC') + 1
            )
        `,
        [
          formatTimestamp(cohortStartDate),
          formatTimestamp(cohortEndDate),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
          ACTIVITY_EVENTS,
        ],
      );

      // Day 7 retention: users who returned on day 7 or later (standard retention metric)
      const day7Retained = await sql.query(
        hasIdentityLinks
          ? `
          SELECT COUNT(*) as count
          FROM "user" u
          WHERE u."createdAt" >= $1
            AND u."createdAt" < $2
            AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
            AND EXISTS (
              SELECT 1
              FROM conversion_events ce2
              WHERE ce2.event_type = ANY($5::text[])
                AND DATE(ce2.created_at AT TIME ZONE 'UTC') >= DATE(u."createdAt" AT TIME ZONE 'UTC') + 7
                AND (
                  ce2.user_id = u.id
                  OR (
                    ce2.anonymous_id IS NOT NULL
                    AND EXISTS (
                      SELECT 1
                      FROM analytics_identity_links l
                      WHERE l.user_id = u.id
                        AND l.anonymous_id = ce2.anonymous_id
                    )
                  )
                )
            )
        `
          : `
          SELECT COUNT(*) as count
          FROM "user" u
          WHERE u."createdAt" >= $1
            AND u."createdAt" < $2
            AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
            AND EXISTS (
              SELECT 1
              FROM conversion_events ce2
              WHERE ce2.user_id = u.id
                AND ce2.event_type = ANY($5::text[])
                AND DATE(ce2.created_at AT TIME ZONE 'UTC') >= DATE(u."createdAt" AT TIME ZONE 'UTC') + 7
            )
        `,
        [
          formatTimestamp(cohortStartDate),
          formatTimestamp(cohortEndDate),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
          ACTIVITY_EVENTS,
        ],
      );

      // Day 30 retention: users who returned on day 30 or later (standard retention metric)
      const day30Retained = await sql.query(
        hasIdentityLinks
          ? `
          SELECT COUNT(*) as count
          FROM "user" u
          WHERE u."createdAt" >= $1
            AND u."createdAt" < $2
            AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
            AND EXISTS (
              SELECT 1
              FROM conversion_events ce2
              WHERE ce2.event_type = ANY($5::text[])
                AND DATE(ce2.created_at AT TIME ZONE 'UTC') >= DATE(u."createdAt" AT TIME ZONE 'UTC') + 30
                AND (
                  ce2.user_id = u.id
                  OR (
                    ce2.anonymous_id IS NOT NULL
                    AND EXISTS (
                      SELECT 1
                      FROM analytics_identity_links l
                      WHERE l.user_id = u.id
                        AND l.anonymous_id = ce2.anonymous_id
                    )
                  )
                )
            )
        `
          : `
          SELECT COUNT(*) as count
          FROM "user" u
          WHERE u."createdAt" >= $1
            AND u."createdAt" < $2
            AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
            AND EXISTS (
              SELECT 1
              FROM conversion_events ce2
              WHERE ce2.user_id = u.id
                AND ce2.event_type = ANY($5::text[])
                AND DATE(ce2.created_at AT TIME ZONE 'UTC') >= DATE(u."createdAt" AT TIME ZONE 'UTC') + 30
            )
        `,
        [
          formatTimestamp(cohortStartDate),
          formatTimestamp(cohortEndDate),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
          ACTIVITY_EVENTS,
        ],
      );

      const formattedStart = period.start.toISOString().split('T')[0];
      const day1RetentionRaw =
        (Number(day1Retained.rows[0]?.count || 0) / cohortSize) * 100;
      const day7RetentionRaw =
        (Number(day7Retained.rows[0]?.count || 0) / cohortSize) * 100;
      const day30RetentionRaw =
        (Number(day30Retained.rows[0]?.count || 0) / cohortSize) * 100;

      // Cap retention at 100% - values >100% indicate a data integrity issue
      const day1Retention = Math.min(day1RetentionRaw, 100);
      const day7Retention = Math.min(day7RetentionRaw, 100);
      const day30Retention = Math.min(day30RetentionRaw, 100);

      // Log warning if any raw value exceeds 100% (data integrity issue)
      if (
        day1RetentionRaw > 100 ||
        day7RetentionRaw > 100 ||
        day30RetentionRaw > 100
      ) {
        console.warn(
          `[analytics/cohorts] Retention >100% detected for cohort ${formattedStart}:`,
          {
            day1: day1RetentionRaw,
            day7: day7RetentionRaw,
            day30: day30RetentionRaw,
            cohortSize,
          },
        );
      }

      // Check if cohort is old enough for each retention window
      // Use cohort START date — a user who signed up on day 1 of the cohort
      // can return on day 1/7/30 relative to their own signup, not the cohort end.
      const cohortStartMs = cohortStartDate.getTime();
      const day1Mature = cohortStartMs + 1 * 86_400_000 <= nowMs;
      const day7Mature = cohortStartMs + 7 * 86_400_000 <= nowMs;
      const day30Mature = cohortStartMs + 30 * 86_400_000 <= nowMs;

      retentionMatrix.push({
        cohort: formattedStart,
        day0: cohortSize,
        day1: day1Mature ? Number(day1Retention.toFixed(2)) : null,
        day7: day7Mature ? Number(day7Retention.toFixed(2)) : null,
        day30: day30Mature ? Number(day30Retention.toFixed(2)) : null,
      });
    }

    const response = NextResponse.json({
      cohorts: retentionMatrix,
      cohortType,
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_HISTORICAL_TTL_SECONDS}`,
    );
    return response;
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
