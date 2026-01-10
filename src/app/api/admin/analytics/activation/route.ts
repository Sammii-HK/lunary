import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

// Activation events - users who complete these within 24h are considered "activated"
const ACTIVATION_EVENTS = [
  'grimoire_save',
  'tarot_pull',
  'moon_phase_view',
  'birth_chart_viewed',
  'tarot_viewed',
  'horoscope_viewed',
  'personalized_tarot_viewed',
  'personalized_horoscope_viewed',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Get new signups in the date range
    const signupsResult = await sql`
      SELECT DISTINCT user_id, created_at as signup_at
      FROM conversion_events
      WHERE event_type = 'signup'
        AND created_at >= ${formatTimestamp(range.start)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;

    const signups = signupsResult.rows || [];
    if (signups.length === 0) {
      return NextResponse.json({
        activationRate: 0,
        activatedUsers: 0,
        totalSignups: 0,
        activationBreakdown: {},
        trends: [],
      });
    }

    // Helper to convert array to PostgreSQL text array literal
    const toTextArrayLiteral = (values: string[]): string | null => {
      if (values.length === 0) return null;
      return `{${values.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
    };

    // Check which users activated within 24h
    let activatedCount = 0;
    const activationBreakdown: Record<string, number> = {};
    const activationEventsArray = toTextArrayLiteral(ACTIVATION_EVENTS)!;

    for (const signup of signups) {
      const signupAt = new Date(signup.signup_at);
      const activationDeadline = new Date(
        signupAt.getTime() + 24 * 60 * 60 * 1000,
      );

      // Check if user completed any activation event within 24h
      const activatedResult = await sql`
        SELECT event_type
        FROM conversion_events
        WHERE user_id = ${signup.user_id}
          AND event_type = ANY(SELECT unnest(${activationEventsArray}::text[]))
          AND created_at >= ${formatTimestamp(signupAt)}
          AND created_at <= ${formatTimestamp(activationDeadline)}
        GROUP BY event_type
      `;

      if (activatedResult.rows.length > 0) {
        activatedCount++;
        // Track which events triggered activation
        const seenEvents = new Set<string>();
        activatedResult.rows.forEach((row) => {
          const eventType = row.event_type as string;
          if (!eventType || seenEvents.has(eventType)) return;
          seenEvents.add(eventType);
          activationBreakdown[eventType] =
            (activationBreakdown[eventType] || 0) + 1;
        });
      }
    }

    const activationRate =
      signups.length > 0 ? (activatedCount / signups.length) * 100 : 0;

    // Calculate daily breakdown for trends
    const dailyBreakdown = await sql`
      WITH signups_by_day AS (
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as signups
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at >= ${formatTimestamp(range.start)}
          AND created_at <= ${formatTimestamp(range.end)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
        GROUP BY DATE(created_at)
      ),
      activated_by_day AS (
        SELECT 
          DATE(ce2.created_at) as date,
          COUNT(DISTINCT ce1.user_id) as activated
        FROM conversion_events ce1
        INNER JOIN conversion_events ce2 ON ce1.user_id = ce2.user_id
        WHERE ce2.event_type = 'signup'
          AND ce2.created_at >= ${formatTimestamp(range.start)}
          AND ce2.created_at <= ${formatTimestamp(range.end)}
          AND ce1.event_type = ANY(SELECT unnest(${activationEventsArray}::text[]))
          AND ce1.created_at >= ce2.created_at
          AND ce1.created_at <= ce2.created_at + INTERVAL '24 hours'
          AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
        GROUP BY DATE(ce2.created_at)
      )
      SELECT 
        s.date,
        s.signups,
        COALESCE(a.activated, 0) as activated,
        CASE 
          WHEN s.signups > 0 THEN (COALESCE(a.activated, 0)::numeric / s.signups * 100)
          ELSE 0
        END as rate
      FROM signups_by_day s
      LEFT JOIN activated_by_day a ON s.date = a.date
      ORDER BY s.date ASC
    `;

    const trends = dailyBreakdown.rows.map((row) => ({
      date: row.date,
      signups: Number(row.signups || 0),
      activated: Number(row.activated || 0),
      rate: Number(row.rate || 0),
    }));

    return NextResponse.json({
      activationRate: Number(activationRate.toFixed(2)),
      activatedUsers: activatedCount,
      totalSignups: signups.length,
      activationBreakdown,
      trends,
    });
  } catch (error) {
    console.error('[analytics/activation] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        activationRate: 0,
        activatedUsers: 0,
        totalSignups: 0,
        activationBreakdown: {},
        trends: [],
      },
      { status: 500 },
    );
  }
}
