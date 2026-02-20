import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

// Test user exclusion patterns - matches filtering in other analytics endpoints
const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Create exclusive upper bound for date range (standard practice)
    const rangeEndExclusive = new Date(range.end);
    rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);

    const conversionType = searchParams.get('conversion_type');

    const filterByType = conversionType && conversionType !== 'all';

    const conversionsSummary = filterByType
      ? await sql`
        SELECT
          COUNT(*) AS total_conversions,
          AVG(days_to_convert) AS avg_days_to_convert
        FROM analytics_conversions
        WHERE created_at >= ${formatTimestamp(range.start)}
          AND created_at < ${formatTimestamp(rangeEndExclusive)}
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
        WHERE created_at >= ${formatTimestamp(range.start)}
          AND created_at < ${formatTimestamp(rangeEndExclusive)}
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
        AND EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) > 0
        AND EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) < 86400 * 365
        AND t1.created_at >= ${formatTimestamp(range.start)}
        AND t1.created_at <= ${formatTimestamp(range.end)}
        AND (t1.user_email IS NULL OR (t1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND t1.user_email != ${TEST_EMAIL_EXACT}))
    `;
    const avgDaysToTrial = Math.max(
      0,
      Number(timeToTrialResult.rows[0]?.avg_days || 0),
    );

    const timeToPaidResult = await sql`
      SELECT
        AVG(EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) / 86400) as avg_days
      FROM conversion_events t1
      JOIN conversion_events t2 ON t1.user_id = t2.user_id
      WHERE t1.event_type = 'trial_started'
        AND t2.event_type IN ('trial_converted', 'subscription_started')
        AND EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) > 0
        AND EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) < 86400 * 365
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
      WHERE created_at >= ${formatTimestamp(range.start)}
        AND created_at < ${formatTimestamp(rangeEndExclusive)}
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
        WHERE created_at >= ${formatTimestamp(range.start)}
          AND created_at < ${formatTimestamp(rangeEndExclusive)}
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
        WHERE created_at >= ${formatTimestamp(range.start)}
          AND created_at < ${formatTimestamp(rangeEndExclusive)}
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

    // COHORT-BASED FUNNEL: Track users who signed up in the range through their journey
    // This ensures monotonic funnel: free_users >= trial_users >= paid_users
    // Uses identity stitching to match conversion_events (anon:, ph:, user:) with user table IDs

    // Check if identity links table exists
    const identityLinksExistsResult = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    const hasIdentityLinks = Boolean(identityLinksExistsResult.rows[0]?.exists);

    // 1. Get all users who signed up in the range (the cohort)
    const cohortUsersResult = await sql`
      SELECT id
      FROM "user"
      WHERE "createdAt" >= ${formatTimestamp(range.start)}
        AND "createdAt" <= ${formatTimestamp(range.end)}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
    `;
    const cohortUserIds = cohortUsersResult.rows.map((row) => row.id);
    const freeUsers = cohortUserIds.length;

    // 2. Of the cohort, count how many EVER started a trial (even after the range)
    // Check both conversion_events AND subscriptions table (source of truth)
    const trialUsersResult =
      cohortUserIds.length > 0
        ? await sql.query(
            `
          SELECT COUNT(DISTINCT u.id) AS count
          FROM "user" u
          WHERE u.id = ANY($1::text[])
            AND (
              -- Check subscriptions table: any non-free status means at least trial
              EXISTS (
                SELECT 1 FROM subscriptions s
                WHERE s.user_id = u.id
                  AND s.status != 'free'
              )
              OR EXISTS (
                SELECT 1
                FROM conversion_events ce
                WHERE ce.event_type = 'trial_started'
                  AND (ce.user_id = 'user:' || u.id OR ce.user_id = u.id)
              )
            )
        `,
            [cohortUserIds],
          )
        : { rows: [{ count: 0 }] };
    const trialUsers = Number(trialUsersResult.rows[0]?.count || 0);

    // 3. Of the cohort, count how many EVER became subscribers (even after the range)
    // Check both conversion_events AND subscriptions table (source of truth)
    const paidUsersResult =
      cohortUserIds.length > 0
        ? await sql.query(
            `
          SELECT COUNT(DISTINCT u.id) AS count
          FROM "user" u
          WHERE u.id = ANY($1::text[])
            AND (
              -- Check subscriptions table: active/past_due/canceled = had a subscription
              EXISTS (
                SELECT 1 FROM subscriptions s
                WHERE s.user_id = u.id
                  AND s.status IN ('active', 'past_due', 'canceled', 'trialing')
                  AND s.stripe_subscription_id IS NOT NULL
              )
              OR EXISTS (
                SELECT 1
                FROM conversion_events ce
                WHERE ce.event_type IN ('subscription_started', 'trial_converted')
                  AND (ce.user_id = 'user:' || u.id OR ce.user_id = u.id)
              )
            )
        `,
            [cohortUserIds],
          )
        : { rows: [{ count: 0 }] };
    const paidUsers = Number(paidUsersResult.rows[0]?.count || 0);

    const trialConversions = Number(trialConversionsResult.rows[0]?.count || 0);

    // Cohort-based conversion rate: % of signups who became paid
    const conversionRate =
      freeUsers > 0 ? Number(((paidUsers / freeUsers) * 100).toFixed(2)) : 0;

    // Trial conversion rate: % of trial users who became paid (both from cohort)
    // This ensures the rate can never exceed 100%
    const trialConversionRate =
      trialUsers > 0 ? Number(((paidUsers / trialUsers) * 100).toFixed(2)) : 0;

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

    const response = NextResponse.json({
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
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
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
