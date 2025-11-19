import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatDate, formatTimestamp } from '@/lib/analytics/date-range';

async function calculateRetention() {
  const today = new Date();
  const startDate = formatDate(
    new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
  );
  const endDate = formatDate(today);

  const baseUsersResult = await sql`
    SELECT DISTINCT user_id
    FROM analytics_user_activity
    WHERE activity_type = 'session'
      AND activity_date = ${startDate}
  `;

  const baseUsers = new Set(
    baseUsersResult.rows.map((row) => row.user_id).filter(Boolean),
  );

  if (baseUsers.size === 0) {
    return { day_1: 0, day_7: 0, day_30: 0 };
  }

  const day1Date = formatDate(
    new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
  );
  const day7Date = formatDate(
    new Date(today.getTime() - 23 * 24 * 60 * 60 * 1000),
  );
  const day30Date = formatDate(today);

  const [day1Result, day7Result, day30Result] = await Promise.all([
    sql`
      SELECT DISTINCT user_id
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${day1Date}
    `,
    sql`
      SELECT DISTINCT user_id
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${day7Date}
    `,
    sql`
      SELECT DISTINCT user_id
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${day30Date}
    `,
  ]);

  const day1Returning = day1Result.rows
    .map((row) => row.user_id)
    .filter((id) => id && baseUsers.has(id)).length;
  const day7Returning = day7Result.rows
    .map((row) => row.user_id)
    .filter((id) => id && baseUsers.has(id)).length;
  const day30Returning = day30Result.rows
    .map((row) => row.user_id)
    .filter((id) => id && baseUsers.has(id)).length;

  return {
    day_1:
      baseUsers.size > 0
        ? Math.round((day1Returning / baseUsers.size) * 100)
        : 0,
    day_7:
      baseUsers.size > 0
        ? Math.round((day7Returning / baseUsers.size) * 100)
        : 0,
    day_30:
      baseUsers.size > 0
        ? Math.round((day30Returning / baseUsers.size) * 100)
        : 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const apiSecret = process.env.ANALYTICS_API_SECRET;

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Analytics API secret not configured' },
        { status: 500 },
      );
    }

    const expectedAuth = `Bearer ${apiSecret.trim()}`;
    if (!authHeader || authHeader.trim() !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const endDate = formatDate(today);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoDate = formatDate(thirtyDaysAgo);
    const thirtyDaysAgoTimestamp = formatTimestamp(thirtyDaysAgo);

    const [
      dauResult,
      wauResult,
      mauResult,
      activeTrialsResult,
      subscriptionsResult,
      monthlySubscriptionsResult,
      monthlyAISubscriptionsResult,
      yearlySubscriptionsResult,
      trialConversions30dResult,
      totalTrials30dResult,
      retentionResult,
      marketingAttributionResult,
      churnReasonsResult,
      ltvDataResult,
      featureRetentionResult,
      topJourneysResult,
      tarotEngagementResult,
      crystalLookupsResult,
    ] = await Promise.all([
      sql`
        SELECT COUNT(DISTINCT user_id) AS value
        FROM analytics_user_activity
        WHERE activity_type = 'session'
          AND activity_date = ${endDate}
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS value
        FROM analytics_user_activity
        WHERE activity_type = 'session'
          AND activity_date BETWEEN (${endDate}::date - INTERVAL '6 days') AND ${endDate}
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS value
        FROM analytics_user_activity
        WHERE activity_type = 'session'
          AND activity_date BETWEEN (${endDate}::date - INTERVAL '29 days') AND ${endDate}
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'trial'
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active'
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active' 
          AND (plan_type = 'monthly' OR plan_type = 'lunary_plus')
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active' 
          AND plan_type = 'lunary_plus_ai'
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active' 
          AND (plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual')
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM analytics_conversions
        WHERE conversion_type = 'trial_to_paid'
          AND created_at >= ${thirtyDaysAgoTimestamp}
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM conversion_events
        WHERE event_type = 'trial_started'
          AND created_at >= ${thirtyDaysAgoTimestamp}
      `,
      calculateRetention(),
      sql`
        SELECT
          COALESCE(metadata->>'utm_source', 'direct') AS source,
          COUNT(DISTINCT user_id) AS count
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at >= ${thirtyDaysAgoTimestamp}
        GROUP BY COALESCE(metadata->>'utm_source', 'direct')
      `,
      sql`
        SELECT
          COALESCE(metadata->>'churn_reason', 'unknown') AS reason,
          COUNT(*) AS count
        FROM subscriptions
        WHERE status IN ('cancelled', 'canceled')
          AND updated_at >= ${thirtyDaysAgoTimestamp}
        GROUP BY COALESCE(metadata->>'churn_reason', 'unknown')
      `,
      sql`
        SELECT
          plan_type,
          COUNT(DISTINCT user_id) AS user_count,
          AVG(
            CASE
              WHEN plan_type = 'monthly' OR plan_type = 'lunary_plus' THEN 4.99 * 12
              WHEN plan_type = 'lunary_plus_ai' THEN 8.99 * 12
              WHEN plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual' THEN 89.99
              ELSE 0
            END
          ) AS avg_ltv
        FROM subscriptions
        WHERE status = 'active'
        GROUP BY plan_type
      `,
      sql`
        WITH feature_users AS (
          SELECT DISTINCT
            activity_type AS feature,
            user_id,
            MIN(activity_date) AS first_use_date
          FROM analytics_user_activity
          WHERE activity_type <> 'session'
            AND activity_date >= ${thirtyDaysAgoDate}
          GROUP BY activity_type, user_id
        ),
        retained_users AS (
          SELECT DISTINCT
            fu.feature,
            fu.user_id
          FROM feature_users fu
          WHERE EXISTS (
            SELECT 1
            FROM analytics_user_activity a2
            WHERE a2.user_id = fu.user_id
              AND a2.activity_type = 'session'
              AND a2.activity_date > fu.first_use_date
              AND a2.activity_date <= fu.first_use_date + INTERVAL '30 days'
          )
        )
        SELECT
          fu.feature,
          COUNT(DISTINCT fu.user_id) AS users_with_feature,
          COUNT(DISTINCT ru.user_id) AS retained_users
        FROM feature_users fu
        LEFT JOIN retained_users ru ON fu.feature = ru.feature AND fu.user_id = ru.user_id
        GROUP BY fu.feature
      `,
      sql`
        SELECT
          COALESCE(trigger_feature, 'unknown') AS journey,
          COUNT(*) AS count
        FROM analytics_conversions
        WHERE created_at >= ${thirtyDaysAgoTimestamp}
        GROUP BY COALESCE(trigger_feature, 'unknown')
        ORDER BY count DESC
        LIMIT 10
      `,
      sql`
        SELECT
          activity_type,
          COUNT(*) AS count
        FROM analytics_user_activity
        WHERE activity_type LIKE 'tarot%'
          AND activity_date >= ${thirtyDaysAgoDate}
        GROUP BY activity_type
      `,
      sql`
        SELECT
          COUNT(DISTINCT user_id) AS users,
          COUNT(*) AS total_lookups
        FROM analytics_user_activity
        WHERE activity_type LIKE '%crystal%'
          AND activity_date >= ${thirtyDaysAgoDate}
      `,
    ]);

    const dau = Number(dauResult.rows[0]?.value || 0);
    const wau = Number(wauResult.rows[0]?.value || 0);
    const mau = Number(mauResult.rows[0]?.value || 0);
    const activeTrials = Number(activeTrialsResult.rows[0]?.count || 0);
    const activeSubscriptions = Number(subscriptionsResult.rows[0]?.count || 0);
    const monthlySubscriptions = Number(
      monthlySubscriptionsResult.rows[0]?.count || 0,
    );
    const monthlyAISubscriptions = Number(
      monthlyAISubscriptionsResult.rows[0]?.count || 0,
    );
    const yearlySubscriptions = Number(
      yearlySubscriptionsResult.rows[0]?.count || 0,
    );

    // Correct pricing:
    // - lunary_plus (monthly): $4.99/month
    // - lunary_plus_ai (monthly): $8.99/month
    // - lunary_plus_ai_annual (yearly): $89.99/year = $7.50/month
    const mrr =
      monthlySubscriptions * 4.99 +
      monthlyAISubscriptions * 8.99 +
      (yearlySubscriptions * 89.99) / 12;
    const arpu = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;

    const trialConversions30d = Number(
      trialConversions30dResult.rows[0]?.count || 0,
    );
    const totalTrials30d = Number(totalTrials30dResult.rows[0]?.count || 0);
    const trialToPaidConversionRate30d =
      totalTrials30d > 0 ? (trialConversions30d / totalTrials30d) * 100 : 0;

    const retention = retentionResult;
    const churnRate = Math.max(0, 100 - retention.day_30);

    // Correct pricing:
    // - lunary_plus (monthly): $4.99/month
    // - lunary_plus_ai (monthly): $8.99/month
    // - lunary_plus_ai_annual (yearly): $89.99/year = $7.50/month
    const mrrMonthlyBasic = monthlySubscriptions * 4.99;
    const mrrMonthlyAI = monthlyAISubscriptions * 8.99;
    const mrrYearly = (yearlySubscriptions * 89.99) / 12;

    const arpuMonthlyBasic =
      monthlySubscriptions > 0 ? mrrMonthlyBasic / monthlySubscriptions : 0;
    const arpuMonthlyAI =
      monthlyAISubscriptions > 0 ? mrrMonthlyAI / monthlyAISubscriptions : 0;
    const arpuYearly =
      yearlySubscriptions > 0 ? mrrYearly / yearlySubscriptions : 0;

    // LTV calculations (assuming average customer lifetime)
    const ltvMonthlyBasic = 4.99 * 12; // $59.88/year
    const ltvMonthlyAI = 8.99 * 12; // $107.88/year
    const ltvYearly = 89.99; // $89.99/year
    const ltvPerUser =
      activeSubscriptions > 0
        ? (monthlySubscriptions * ltvMonthlyBasic +
            monthlyAISubscriptions * ltvMonthlyAI +
            yearlySubscriptions * ltvYearly) /
          activeSubscriptions
        : 0;

    const marketingAttribution: Record<string, number> = {
      organic: 0,
      direct: 0,
      referral: 0,
    };

    for (const row of marketingAttributionResult.rows) {
      const source = (row.source as string) || 'direct';
      const count = Number(row.count || 0);

      if (!source || source === 'direct' || source === 'null') {
        marketingAttribution.direct += count;
      } else if (
        source.includes('referral') ||
        source.includes('partner') ||
        source.includes('affiliate')
      ) {
        marketingAttribution.referral += count;
      } else {
        marketingAttribution.organic += count;
      }
      marketingAttribution[source] =
        (marketingAttribution[source] || 0) + count;
    }

    const churnReasons: Record<string, number> = {};
    for (const row of churnReasonsResult.rows) {
      const reason = (row.reason as string) || 'unknown';
      churnReasons[reason] = Number(row.count || 0);
    }

    const featureRetention: Record<string, number> = {};
    for (const row of featureRetentionResult.rows) {
      const feature = (row.feature as string) || 'unknown';
      const usersWithFeature = Number(row.users_with_feature || 0);
      const retainedUsers = Number(row.retained_users || 0);
      featureRetention[feature] =
        usersWithFeature > 0 ? (retainedUsers / usersWithFeature) * 100 : 0;
    }

    const topUserJourneys: Array<{ path: string; count: number }> = [];
    for (const row of topJourneysResult.rows) {
      topUserJourneys.push({
        path: (row.journey as string) || 'unknown',
        count: Number(row.count || 0),
      });
    }

    const tarotEngagementType: Record<string, number> = {};
    for (const row of tarotEngagementResult.rows) {
      const type = (row.activity_type as string) || 'unknown';
      tarotEngagementType[type] = Number(row.count || 0);
    }

    const crystalUsers = Number(crystalLookupsResult.rows[0]?.users || 0);
    const crystalTotalLookups = Number(
      crystalLookupsResult.rows[0]?.total_lookups || 0,
    );
    const crystalLookupsPerUser =
      crystalUsers > 0 ? crystalTotalLookups / crystalUsers : 0;

    const stickiness = mau > 0 ? (dau / mau) * 100 : 0;

    return NextResponse.json({
      mrr: Number(mrr.toFixed(2)),
      dau,
      wau,
      mau,
      stickiness: Number(stickiness.toFixed(2)),
      activeTrials,
      churnRate: Number(churnRate.toFixed(2)),
      arpu: Number(arpu.toFixed(2)),
      trialToPaidConversionRate30d: Number(
        trialToPaidConversionRate30d.toFixed(2),
      ),
      retentionDay1: retention.day_1,
      retentionDay7: retention.day_7,
      retentionDay30: retention.day_30,
      ltvPerUser: Number(ltvPerUser.toFixed(2)),
      ltvMonthlyBasic: Number(ltvMonthlyBasic.toFixed(2)),
      ltvMonthlyAI: Number(ltvMonthlyAI.toFixed(2)),
      ltvYearly: Number(ltvYearly.toFixed(2)),
      arpuMonthlyBasic: Number(arpuMonthlyBasic.toFixed(2)),
      arpuMonthlyAI: Number(arpuMonthlyAI.toFixed(2)),
      arpuYearly: Number(arpuYearly.toFixed(2)),
      churnReasons,
      marketingAttribution,
      aiCostPerEngagedUser: null,
      featureRetention,
      topUserJourneys,
      seoCtr: null,
      tarotEngagementType,
      crystalLookupsPerUser: Number(crystalLookupsPerUser.toFixed(2)),
      activePayingUsers: activeSubscriptions,
    });
  } catch (error) {
    console.error('[analytics/summary] Failed to load metrics:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
