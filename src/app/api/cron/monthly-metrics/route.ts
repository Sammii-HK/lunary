import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { saveMetricSnapshot } from '@/lib/analytics/metric-snapshots';
import {
  ACTIVATION_EVENTS,
  ACTIVATION_WINDOW_DAYS,
} from '@/lib/analytics/activation-events';

/**
 * Monthly metrics snapshot
 * Runs on the 2nd of each month at 03:00 UTC via Vercel cron.
 * Calculates the previous month's aggregate KPIs and persists a monthly snapshot.
 */
export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Determine previous month boundaries
    const now = new Date();
    const prevMonthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
    );
    const prevMonthStart = new Date(
      Date.UTC(
        prevMonthEnd.getUTCFullYear(),
        prevMonthEnd.getUTCMonth(),
        1,
        0,
        0,
        0,
        0,
      ),
    );

    const periodKey = `${prevMonthStart.getUTCFullYear()}-${String(prevMonthStart.getUTCMonth() + 1).padStart(2, '0')}`;
    const periodStart = prevMonthStart.toISOString().split('T')[0];
    const periodEnd = prevMonthEnd.toISOString().split('T')[0];

    console.log(
      `[Monthly Metrics] Calculating metrics for ${periodKey} (${periodStart} to ${periodEnd})`,
    );

    const startTs = formatTimestamp(prevMonthStart);
    const endTs = formatTimestamp(prevMonthEnd);

    const TEST_EMAIL_PATTERN = '%@test.lunary.app';
    const TEST_EMAIL_EXACT = 'test@test.lunary.app';

    const [
      signupsResult,
      trialsResult,
      payingResult,
      wauResult,
      activationResult,
      trialConversionResult,
      mrrResult,
      activeSubsResult,
      churnResult,
    ] = await Promise.all([
      // New signups
      sql`
        SELECT COUNT(*) as count FROM "user"
        WHERE "createdAt" >= ${startTs} AND "createdAt" <= ${endTs}
          AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
      `,
      // New trials
      sql`
        SELECT COUNT(DISTINCT user_id) as count FROM conversion_events
        WHERE event_type = 'trial_started'
          AND created_at >= ${startTs} AND created_at <= ${endTs}
      `,
      // New paying subscribers
      sql`
        SELECT COUNT(DISTINCT user_id) as count FROM conversion_events
        WHERE event_type IN ('trial_converted', 'subscription_started')
          AND created_at >= ${startTs} AND created_at <= ${endTs}
      `,
      // WAU (unique active users in the month — serves as MAU proxy here)
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count FROM conversion_events
         WHERE event_type = ANY($1::text[])
           AND created_at >= $2 AND created_at <= $3`,
        [
          [
            'tarot_viewed',
            'personalized_tarot_viewed',
            'birth_chart_viewed',
            'horoscope_viewed',
            'personalized_horoscope_viewed',
            'cosmic_pulse_opened',
            'moon_circle_opened',
            'app_opened',
          ],
          startTs,
          endTs,
        ],
      ),
      // Activation: users who signed up AND completed an activation event within 7 days
      sql.query(
        `SELECT COUNT(DISTINCT u.id) as count
         FROM "user" u
         INNER JOIN conversion_events ce ON ce.user_id = u.id
         WHERE u."createdAt" >= $1 AND u."createdAt" <= $2
           AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
           AND ce.event_type = ANY($5::text[])
           AND ce.created_at >= u."createdAt"
           AND ce.created_at <= u."createdAt" + INTERVAL '${ACTIVATION_WINDOW_DAYS} days'`,
        [
          startTs,
          endTs,
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
          [...ACTIVATION_EVENTS],
        ],
      ),
      // Trial to paid conversion (trials that converted within the month)
      sql`
        SELECT
          COUNT(DISTINCT ce2.user_id) as converted,
          COUNT(DISTINCT ce1.user_id) as total_trials
        FROM conversion_events ce1
        LEFT JOIN conversion_events ce2
          ON ce1.user_id = ce2.user_id
          AND ce2.event_type IN ('trial_converted', 'subscription_started')
          AND ce2.created_at >= ${startTs} AND ce2.created_at <= ${endTs}
        WHERE ce1.event_type = 'trial_started'
          AND ce1.created_at >= ${startTs} AND ce1.created_at <= ${endTs}
      `,
      // MRR at end of month
      sql`
        SELECT COALESCE(SUM(monthly_amount_due), 0) as total
        FROM subscriptions
        WHERE status IN ('active', 'trial', 'past_due')
          AND plan_type IN ('lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual')
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      `,
      // Active subscribers at end of month
      sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM subscriptions
        WHERE status IN ('active', 'trial', 'past_due')
          AND plan_type != 'free'
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      `,
      // Churned in month
      sql`
        SELECT COUNT(DISTINCT user_id) as count FROM conversion_events
        WHERE event_type IN ('subscription_cancelled', 'subscription_ended')
          AND created_at >= ${startTs} AND created_at <= ${endTs}
      `,
    ]);

    const newSignups = Number(signupsResult.rows[0]?.count || 0);
    const newTrials = Number(trialsResult.rows[0]?.count || 0);
    const newPaying = Number(payingResult.rows[0]?.count || 0);
    const mau = Number(wauResult.rows[0]?.count || 0);
    const activated = Number(activationResult.rows[0]?.count || 0);
    const activationRate = newSignups > 0 ? (activated / newSignups) * 100 : 0;
    const totalTrials = Number(
      trialConversionResult.rows[0]?.total_trials || 0,
    );
    const converted = Number(trialConversionResult.rows[0]?.converted || 0);
    const trialConversionRate =
      totalTrials > 0 ? (converted / totalTrials) * 100 : 0;
    const mrr = Number(mrrResult.rows[0]?.total || 0);
    const activeSubs = Number(activeSubsResult.rows[0]?.count || 0);
    const churned = Number(churnResult.rows[0]?.count || 0);
    const churnRate = activeSubs > 0 ? (churned / activeSubs) * 100 : 0;

    await saveMetricSnapshot({
      period_type: 'monthly',
      period_key: periodKey,
      period_start: periodStart,
      period_end: periodEnd,
      new_signups: newSignups,
      new_trials: newTrials,
      new_paying_subscribers: newPaying,
      wau: mau, // For monthly snapshots this is MAU
      activation_rate: Number(activationRate.toFixed(2)),
      trial_to_paid_conversion_rate: Number(trialConversionRate.toFixed(2)),
      mrr: Number(mrr.toFixed(2)),
      active_subscribers: activeSubs,
      churn_rate: Number(churnRate.toFixed(2)),
      extras: {
        activated_users: activated,
        churned_subscribers: churned,
      },
    });

    console.log(`[Monthly Metrics] Snapshot saved for ${periodKey}`);

    return NextResponse.json({
      success: true,
      period: periodKey,
      metrics: {
        new_signups: newSignups,
        mau,
        mrr: Number(mrr.toFixed(2)),
        active_subscribers: activeSubs,
      },
    });
  } catch (error: any) {
    console.error('[Monthly Metrics] Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
