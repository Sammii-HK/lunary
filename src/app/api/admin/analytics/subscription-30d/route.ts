import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const WINDOW_DAYS = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const result = await sql.query(
      `
        WITH signups AS (
          SELECT user_id, created_at
          FROM conversion_events
          WHERE event_type = 'signup_completed'
            AND user_id IS NOT NULL
            AND (
              (metadata->>'plan_type') IS NULL
              OR metadata->>'plan_type' = 'free'
            )
            AND created_at >= $1
            AND created_at <= $2
            AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
        ),
        conversions AS (
          SELECT DISTINCT s.user_id
          FROM signups s
          JOIN conversion_events ce
            ON ce.user_id = s.user_id
           AND ce.event_type = 'subscription_started'
           AND ce.created_at >= s.created_at
           AND ce.created_at <= s.created_at + INTERVAL '${WINDOW_DAYS} days'
           AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))
        )
        SELECT
          (SELECT COUNT(*) FROM signups) AS signups,
          (SELECT COUNT(*) FROM conversions) AS conversions
      `,
      [
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    );

    const signups = Number(result.rows[0]?.signups || 0);
    const conversions = Number(result.rows[0]?.conversions || 0);
    const conversionRate = signups > 0 ? (conversions / signups) * 100 : 0;

    return NextResponse.json({
      window_days: WINDOW_DAYS,
      signups,
      conversions,
      conversion_rate: Number(conversionRate.toFixed(2)),
      source: 'database',
    });
  } catch (error) {
    console.error(
      '[analytics/subscription-30d] Failed to load conversion metrics',
      error,
    );
    return NextResponse.json(
      {
        window_days: WINDOW_DAYS,
        signups: 0,
        conversions: 0,
        conversion_rate: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
