import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Use only Stripe-backed subscriptions to avoid legacy/test rows.
    const statesResult = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM subscriptions
      WHERE stripe_subscription_id IS NOT NULL
        AND updated_at >= ${formatTimestamp(range.start)}
        AND updated_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY status
    `;

    const states = statesResult.rows.reduce(
      (acc, row) => {
        acc[row.status as string] = Number(row.count || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate churn rate trends
    const churnTrendsResult = await sql`
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as churned
      FROM subscriptions
      WHERE status IN ('cancelled', 'canceled', 'ended')
        AND stripe_subscription_id IS NOT NULL
        AND updated_at >= ${formatTimestamp(range.start)}
        AND updated_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `;

    const churnTrends = churnTrendsResult.rows.map((row) => ({
      date: row.date,
      churned: Number(row.churned || 0),
    }));

    // Calculate average subscription duration
    const avgDurationResult = await sql`
      SELECT 
        AVG(
          CASE 
            WHEN status IN ('cancelled', 'canceled', 'ended') AND updated_at > created_at
            THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400
            ELSE NULL
          END
        ) as avg_days
      FROM subscriptions
      WHERE status IN ('cancelled', 'canceled', 'ended')
        AND stripe_subscription_id IS NOT NULL
        AND updated_at > created_at
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;

    const avgDuration = Number(avgDurationResult.rows[0]?.avg_days || 0);

    // Calculate lifecycle transitions
    const transitionsResult = await sql`
      SELECT 
        ce1.event_type as from_state,
        ce2.event_type as to_state,
        COUNT(*) as count
      FROM conversion_events ce1
      INNER JOIN conversion_events ce2 ON ce1.user_id = ce2.user_id
      WHERE ce1.event_type IN ('trial_started', 'subscription_started', 'subscription_cancelled')
        AND ce2.event_type IN ('trial_converted', 'subscription_started', 'subscription_cancelled', 'subscription_ended')
        AND ce2.created_at > ce1.created_at
        AND ce2.created_at <= ce1.created_at + INTERVAL '90 days'
        AND ce1.created_at >= ${formatTimestamp(range.start)}
        AND ce1.created_at <= ${formatTimestamp(range.end)}
        AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
        AND EXISTS (
          SELECT 1
          FROM subscriptions s
          WHERE s.user_id = ce1.user_id
            AND s.stripe_subscription_id IS NOT NULL
        )
      GROUP BY ce1.event_type, ce2.event_type
    `;

    const transitions = transitionsResult.rows.map((row) => ({
      from: row.from_state as string,
      to: row.to_state as string,
      count: Number(row.count || 0),
    }));

    // Calculate churn rate (cancellations / active subscriptions)
    const activeSubscriptions = states.active || 0;
    const cancelledInPeriod = churnTrends.reduce(
      (sum, t) => sum + t.churned,
      0,
    );
    const churnRate =
      activeSubscriptions > 0
        ? (cancelledInPeriod / activeSubscriptions) * 100
        : 0;

    return NextResponse.json({
      states,
      churnTrends,
      avgDurationDays: Number(avgDuration.toFixed(1)),
      churnRate: Number(churnRate.toFixed(2)),
      transitions,
    });
  } catch (error) {
    console.error(
      '[analytics/subscription-lifecycle] Failed to load metrics',
      error,
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        states: {},
        churnTrends: [],
        avgDurationDays: 0,
        transitions: [],
      },
      { status: 500 },
    );
  }
}
