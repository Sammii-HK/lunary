import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { ANALYTICS_HISTORICAL_TTL_SECONDS } from '@/lib/analytics-cache-config';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const ENGAGEMENT_EVENTS = [
  'grimoire_viewed',
  'tarot_drawn',
  'chart_viewed',
  'birth_chart_viewed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
  'astral_chat_used',
  'ritual_completed',
  'horoscope_viewed',
  'daily_dashboard_viewed',
  'journal_entry_created',
  'dream_entry_created',
  'cosmic_pulse_opened',
];

/**
 * Cohort retention endpoint for insights
 * Optimized to query DB directly with simplified D30 cohort calculation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    // Default to last 12 weeks of cohorts
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const defaultStart = new Date(today);
    defaultStart.setUTCDate(defaultStart.getUTCDate() - 84); // 12 weeks

    const parseDateParam = (param: string | null, fallback: Date): Date => {
      if (!param) return fallback;
      const parsed = new Date(param);
      parsed.setUTCHours(0, 0, 0, 0);
      return isNaN(parsed.getTime()) ? fallback : parsed;
    };

    let rangeStart = parseDateParam(startParam, defaultStart);
    let rangeEnd = parseDateParam(endParam, today);

    // Calculate weekly cohorts
    const cohorts: Array<{ cohort: string; day_30_retention: number }> = [];

    // Align start to Monday
    const alignToMonday = (date: Date) => {
      const aligned = new Date(date);
      const day = aligned.getUTCDay();
      const diff = (day + 6) % 7; // Days since Monday
      aligned.setUTCDate(aligned.getUTCDate() - diff);
      return aligned;
    };

    const cohortStart = alignToMonday(rangeStart);
    const cursor = new Date(cohortStart);

    // Generate weekly cohorts
    while (cursor < rangeEnd) {
      const cohortEndDate = new Date(cursor);
      cohortEndDate.setUTCDate(cohortEndDate.getUTCDate() + 7);

      // Only process cohorts that are old enough to have D30 data
      const day30Deadline = new Date(today);
      day30Deadline.setUTCDate(day30Deadline.getUTCDate() - 30);

      if (cohortEndDate <= day30Deadline) {
        const cohortLabel = cursor.toISOString().split('T')[0];

        // Calculate D30 retention for this cohort
        const [cohortSizeResult, retainedResult] = await Promise.all([
          // Count users in cohort
          sql.query(
            `
            SELECT COUNT(*) as count
            FROM "user"
            WHERE "createdAt" >= $1
              AND "createdAt" < $2
              AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
          `,
            [
              formatTimestamp(cursor),
              formatTimestamp(cohortEndDate),
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),
          // Count users who returned on day 30 or later
          sql.query(
            `
            SELECT COUNT(DISTINCT u.id) as count
            FROM "user" u
            WHERE u."createdAt" >= $1
              AND u."createdAt" < $2
              AND (u.email IS NULL OR (u.email NOT LIKE $5 AND u.email != $6))
              AND EXISTS (
                SELECT 1
                FROM conversion_events ce
                WHERE ce.user_id = u.id
                  AND ce.event_type = ANY($3::text[])
                  AND DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(u."createdAt" AT TIME ZONE 'UTC') + $4
              )
          `,
            [
              formatTimestamp(cursor),
              formatTimestamp(cohortEndDate),
              ENGAGEMENT_EVENTS,
              30,
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),
        ]);

        const cohortSize = Number(cohortSizeResult.rows[0]?.count || 0);
        const retained = Number(retainedResult.rows[0]?.count || 0);
        const retentionRate =
          cohortSize > 0 ? (retained / cohortSize) * 100 : 0;

        cohorts.push({
          cohort: cohortLabel,
          day_30_retention: Number(retentionRate.toFixed(2)),
        });
      }

      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }

    // Calculate overall D30 retention (average of all cohorts)
    const overallD30Retention =
      cohorts.length > 0
        ? cohorts.reduce((sum, c) => sum + c.day_30_retention, 0) /
          cohorts.length
        : 0;

    const response = NextResponse.json({
      cohorts,
      overall_d30_retention: Number(overallD30Retention.toFixed(2)),
    });

    // Cache cohort retention for 4 hours (historical data, longer TTL)
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_HISTORICAL_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_HISTORICAL_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/cohort-retention] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
