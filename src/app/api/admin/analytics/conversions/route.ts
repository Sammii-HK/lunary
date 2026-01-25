import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

// Test user exclusion patterns - matches filtering in other analytics endpoints
const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const conversionType = searchParams.get('conversion_type');

    const filterByType = conversionType && conversionType !== 'all';

    const conversionsSummary = filterByType
      ? await sql`
        SELECT
          COUNT(*) AS total_conversions,
          AVG(days_to_convert) AS avg_days_to_convert
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
          AND conversion_type = ${conversionType}
          AND NOT EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.user_id = analytics_conversions.user_id
              AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
          )
          AND NOT EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = analytics_conversions.user_id
              AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
          )
      `
      : await sql`
        SELECT
          COUNT(*) AS total_conversions,
          AVG(days_to_convert) AS avg_days_to_convert
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
          AND NOT EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.user_id = analytics_conversions.user_id
              AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
          )
          AND NOT EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = analytics_conversions.user_id
              AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
          )
      `;

    const totalConversions = Number(
      conversionsSummary.rows[0]?.total_conversions || 0,
    );
    const avgDaysToConvertRaw = Number(
      conversionsSummary.rows[0]?.avg_days_to_convert ?? 0,
    );
    const avgDaysToConvert = Number.isFinite(avgDaysToConvertRaw)
      ? Number(avgDaysToConvertRaw.toFixed(2))
      : 0;

    // Enhanced time to conversion breakdown
    const timeToTrialResult = await sql`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) / 86400) as avg_days
      FROM conversion_events t1
      JOIN conversion_events t2 ON t1.user_id = t2.user_id
      WHERE t1.event_type = 'signup'
        AND t2.event_type = 'trial_started'
        AND t2.created_at > t1.created_at
        AND t1.created_at >= ${formatTimestamp(range.start)}
        AND t1.created_at <= ${formatTimestamp(range.end)}
        AND (t1.user_email IS NULL OR (t1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND t1.user_email != ${TEST_EMAIL_EXACT}))
    `;
    const avgDaysToTrial = Number(timeToTrialResult.rows[0]?.avg_days || 0);

    const timeToPaidResult = await sql`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) / 86400) as avg_days
      FROM conversion_events t1
      JOIN conversion_events t2 ON t1.user_id = t2.user_id
      WHERE t1.event_type = 'trial_started'
        AND t2.event_type IN ('trial_converted', 'subscription_started')
        AND t2.created_at > t1.created_at
        AND t1.created_at >= ${formatTimestamp(range.start)}
        AND t1.created_at <= ${formatTimestamp(range.end)}
        AND (t1.user_email IS NULL OR (t1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND t1.user_email != ${TEST_EMAIL_EXACT}))
    `;
    const avgDaysToPaid = Number(timeToPaidResult.rows[0]?.avg_days || 0);

    // Conversion velocity by cohort (weekly)
    const velocityByCohortResult = await sql`
      SELECT 
        DATE_TRUNC('week', t1.created_at) as cohort_week,
        AVG(EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) / 86400) as avg_days
      FROM conversion_events t1
      JOIN conversion_events t2 ON t1.user_id = t2.user_id
      WHERE t1.event_type = 'signup'
        AND t2.event_type IN ('trial_converted', 'subscription_started')
        AND t2.created_at > t1.created_at
        AND t1.created_at >= ${formatTimestamp(range.start)}
        AND t1.created_at <= ${formatTimestamp(range.end)}
        AND (t1.user_email IS NULL OR (t1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND t1.user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY DATE_TRUNC('week', t1.created_at)
      ORDER BY cohort_week DESC
    `;
    const velocityByCohort = velocityByCohortResult.rows.map((row) => ({
      cohort: row.cohort_week,
      avgDays: Number(row.avg_days || 0),
    }));

    const trialConversionsResult = await sql`
      SELECT COUNT(*) AS count
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
        range.end,
      )}
        AND conversion_type = 'trial_to_paid'
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = analytics_conversions.user_id
            AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
        )
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce
          WHERE ce.user_id = analytics_conversions.user_id
            AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
        )
    `;

    const triggerBreakdownResult = filterByType
      ? await sql`
        SELECT
          COALESCE(trigger_feature, 'unknown') AS feature,
          COUNT(*) AS count
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
          AND conversion_type = ${conversionType}
          AND NOT EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.user_id = analytics_conversions.user_id
              AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
          )
          AND NOT EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = analytics_conversions.user_id
              AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
          )
        GROUP BY COALESCE(trigger_feature, 'unknown')
        ORDER BY count DESC
      `
      : await sql`
        SELECT
          COALESCE(trigger_feature, 'unknown') AS feature,
          COUNT(*) AS count
        FROM analytics_conversions
        WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
          AND NOT EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.user_id = analytics_conversions.user_id
              AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
          )
          AND NOT EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = analytics_conversions.user_id
              AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
          )
        GROUP BY COALESCE(trigger_feature, 'unknown')
        ORDER BY count DESC
      `;

    const triggerBreakdown = triggerBreakdownResult.rows.map((row) => {
      const count = Number(row.count || 0);
      return {
        feature: row.feature as string,
        count,
        percentage:
          totalConversions > 0
            ? Number(((count / totalConversions) * 100).toFixed(2))
            : 0,
      };
    });

    const freeUsersResult = await sql`
      SELECT COUNT(*) AS count
      FROM "user"
      WHERE "createdAt" >= ${formatTimestamp(range.start)}
        AND "createdAt" <= ${formatTimestamp(range.end)}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
    `;
    const freeUsersCount = Number(freeUsersResult.rows[0]?.count || 0);

    const trialUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM subscriptions
      WHERE status = 'trial'
        AND updated_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;

    const paidUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM subscriptions
      WHERE status = 'active'
        AND updated_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;

    const freeUsers = freeUsersCount;
    const trialUsers = Number(trialUsersResult.rows[0]?.count || 0);
    const paidUsers = Number(paidUsersResult.rows[0]?.count || 0);

    const trialConversions = Number(trialConversionsResult.rows[0]?.count || 0);

    const conversionRate =
      freeUsers > 0 ? Number(((paidUsers / freeUsers) * 100).toFixed(2)) : 0;

    const trialConversionRate =
      trialUsers > 0
        ? Number(((trialConversions / trialUsers) * 100).toFixed(2))
        : 0;

    const dropOffPoints = [
      {
        stage: 'free_to_trial',
        drop_off_rate:
          freeUsers > 0
            ? Number((((freeUsers - trialUsers) / freeUsers) * 100).toFixed(2))
            : 0,
      },
      {
        stage: 'trial_to_paid',
        drop_off_rate:
          trialUsers > 0
            ? Number((((trialUsers - paidUsers) / trialUsers) * 100).toFixed(2))
            : 0,
      },
    ];

    return NextResponse.json({
      total_conversions: totalConversions,
      conversion_rate: conversionRate,
      trial_conversion_rate: trialConversionRate,
      avg_days_to_convert: avgDaysToConvert,
      avg_days_to_trial: Number(avgDaysToTrial.toFixed(2)),
      avg_days_to_paid: Number(avgDaysToPaid.toFixed(2)),
      velocity_by_cohort: velocityByCohort,
      trigger_breakdown: triggerBreakdown,
      funnel: {
        free_users: freeUsers,
        trial_users: trialUsers,
        paid_users: paidUsers,
        drop_off_points: dropOffPoints,
      },
    });
  } catch (error) {
    console.error('[analytics/conversions] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
