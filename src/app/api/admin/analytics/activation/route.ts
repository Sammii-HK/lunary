import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';
import { ACTIVATION_EVENTS } from '@/lib/analytics/activation-events';
import { mapActivationBySourceRows } from '@/lib/analytics/source-labelled-activation';

export const dynamic = 'force-dynamic';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const PLAN_CHANGE_EVENTS = [
  'trial_started',
  'trial_converted',
  'subscription_started',
];
const SOURCE_OUTCOME_EVENTS = [
  'trial_started',
  'checkout_started',
  'checkout_completed',
  'subscription_started',
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Get new signups in the date range
    const signupsResult = await sql`
      SELECT id as user_id, "createdAt" as signup_at
      FROM "user"
      WHERE "createdAt" >= ${formatTimestamp(range.start)}
        AND "createdAt" <= ${formatTimestamp(range.end)}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
    `;

    const signups = signupsResult.rows || [];
    if (signups.length === 0) {
      return NextResponse.json({
        activationRate: 0,
        activatedUsers: 0,
        totalSignups: 0,
        activationBreakdown: {},
        activationBreakdownByPlan: {},
        activationBySource: [],
        activationByUtm: [],
        trends: [],
      });
    }

    // Check which users activated within 7 days of signup
    const activationRowsResult = await sql.query(
      `
        WITH signups AS (
          SELECT id as user_id, "createdAt" as signup_at
          FROM "user"
          WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
        ),
        activation_events AS (
          SELECT
            ce.user_id,
            ce.event_type,
            MIN(ce.created_at) as activation_at
          FROM conversion_events ce
          JOIN signups s ON ce.user_id = s.user_id
          WHERE ce.event_type = ANY($5::text[])
            AND ce.created_at >= s.signup_at
            AND ce.created_at <= s.signup_at + INTERVAL '7 days'
          GROUP BY ce.user_id, ce.event_type
        ),
        plan_snapshots AS (
          SELECT user_id, plan_type, created_at
          FROM conversion_events
          WHERE event_type = ANY($6::text[])
        ),
        activation_with_plans AS (
          SELECT
            ae.user_id,
            ae.event_type,
            ae.activation_at,
            COALESCE(ps.plan_type, 'free') as resolved_plan_type
          FROM activation_events ae
          LEFT JOIN LATERAL (
            SELECT plan_type
            FROM plan_snapshots ps
            WHERE ps.user_id = ae.user_id
              AND ps.created_at <= ae.activation_at
            ORDER BY ps.created_at DESC
            LIMIT 1
          ) ps ON true
        )
        SELECT
          user_id,
          event_type,
          CASE
            WHEN LOWER(COALESCE(resolved_plan_type, 'free')) = 'free' THEN 'free'
            WHEN LOWER(COALESCE(resolved_plan_type, 'free')) IN ('unknown', '') THEN 'unknown'
            ELSE 'paid'
          END as bucket
        FROM activation_with_plans
      `,
      [
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        ACTIVATION_EVENTS,
        PLAN_CHANGE_EVENTS,
      ],
    );

    const activationRows = activationRowsResult.rows ?? [];
    const activationBySourceResult = await sql.query(
      `
        WITH signups AS (
          SELECT id as user_id, "createdAt" as signup_at
          FROM "user"
          WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
        ),
        source_labels AS (
          SELECT
            s.user_id,
            s.signup_at,
            COALESCE(NULLIF(ua.utm_source, ''), NULLIF(ua.first_touch_source, ''), 'direct') as source,
            COALESCE(NULLIF(ua.utm_medium, ''), NULLIF(ua.first_touch_medium, ''), 'unknown') as medium,
            COALESCE(NULLIF(ua.utm_campaign, ''), NULLIF(ua.first_touch_campaign, ''), 'unknown') as campaign,
            COALESCE(NULLIF(ua.utm_content, ''), 'unknown') as content
          FROM signups s
          LEFT JOIN user_attribution ua ON ua.user_id = s.user_id
        ),
        cohort_events AS (
          SELECT
            sl.user_id,
            sl.signup_at,
            sl.source,
            sl.medium,
            sl.campaign,
            sl.content,
            ce.event_type,
            ce.created_at
          FROM source_labels sl
          LEFT JOIN conversion_events ce ON ce.user_id = sl.user_id
            AND ce.created_at >= sl.signup_at
            AND ce.created_at <= sl.signup_at + INTERVAL '7 days'
            AND (
              ce.event_type = ANY($5::text[])
              OR ce.event_type = ANY($6::text[])
            )
        )
        SELECT
          source,
          medium,
          campaign,
          content,
          COUNT(DISTINCT user_id) as signups,
          COUNT(DISTINCT CASE
            WHEN event_type = ANY($5::text[])
              AND created_at <= signup_at + INTERVAL '24 hours'
            THEN user_id END) as activated_24h,
          COUNT(DISTINCT CASE
            WHEN event_type = ANY($5::text[])
            THEN user_id END) as activated_7d,
          COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trial_started,
          COUNT(DISTINCT CASE WHEN event_type = 'checkout_started' THEN user_id END) as checkout_started,
          COUNT(DISTINCT CASE WHEN event_type = 'checkout_completed' THEN user_id END) as checkout_completed,
          COUNT(DISTINCT CASE WHEN event_type = 'subscription_started' THEN user_id END) as subscription_started
        FROM cohort_events
        GROUP BY source, medium, campaign, content
        ORDER BY activated_7d DESC, signups DESC, source ASC, medium ASC, campaign ASC, content ASC
        LIMIT 50
      `,
      [
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        ACTIVATION_EVENTS,
        SOURCE_OUTCOME_EVENTS,
      ],
    );
    const activationBySource = mapActivationBySourceRows(
      activationBySourceResult.rows ?? [],
    );
    const activatedUsers = new Set<string>();
    const activationBreakdown: Record<string, number> = {};
    const activationBreakdownByPlan: Record<
      string,
      { free: number; paid: number; unknown: number }
    > = {};

    activationRows.forEach((row) => {
      const eventType = String(row.event_type || '');
      if (!eventType) return;
      const userId = String(row.user_id);
      const bucket = ['free', 'paid', 'unknown'].includes(row.bucket)
        ? (row.bucket as 'free' | 'paid' | 'unknown')
        : 'unknown';

      activatedUsers.add(userId);
      activationBreakdown[eventType] =
        (activationBreakdown[eventType] || 0) + 1;

      if (!activationBreakdownByPlan[eventType]) {
        activationBreakdownByPlan[eventType] = {
          free: 0,
          paid: 0,
          unknown: 0,
        };
      }
      activationBreakdownByPlan[eventType][bucket] += 1;
    });

    const totalActivatedUsers = activatedUsers.size;
    const activationRate =
      signups.length > 0 ? (totalActivatedUsers / signups.length) * 100 : 0;

    // Calculate daily breakdown for trends
    const dailyBreakdown = await sql.query(
      `
        WITH signups_by_day AS (
          SELECT
            DATE("createdAt") as date,
            COUNT(*) as signups
          FROM "user"
          WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))
          GROUP BY DATE("createdAt")
        ),
        activated_by_day AS (
          SELECT
            DATE(u."createdAt") as date,
            COUNT(DISTINCT ce.user_id) as activated
          FROM "user" u
          INNER JOIN conversion_events ce ON ce.user_id = u.id
          WHERE u."createdAt" >= $1
            AND u."createdAt" <= $2
            AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
            AND ce.event_type = ANY($5::text[])
            AND ce.created_at >= u."createdAt"
            AND ce.created_at <= u."createdAt" + INTERVAL '7 days'
          GROUP BY DATE(u."createdAt")
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
      `,
      [
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        ACTIVATION_EVENTS,
      ],
    );

    const trends = dailyBreakdown.rows.map((row) => ({
      date: row.date,
      signups: Number(row.signups || 0),
      activated: Number(row.activated || 0),
      rate: Number(row.rate || 0),
    }));

    const response = NextResponse.json({
      activationRate: Number(activationRate.toFixed(2)),
      activatedUsers: totalActivatedUsers,
      totalSignups: signups.length,
      activationBreakdown,
      activationBreakdownByPlan,
      activationBySource,
      activationByUtm: activationBySource,
      trends,
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/activation] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        activationRate: 0,
        activatedUsers: 0,
        totalSignups: 0,
        activationBreakdown: {},
        activationBreakdownByPlan: {},
        activationBySource: [],
        activationByUtm: [],
        trends: [],
      },
      { status: 500 },
    );
  }
}
