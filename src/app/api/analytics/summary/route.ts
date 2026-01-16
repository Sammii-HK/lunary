import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatDate, formatTimestamp } from '@/lib/analytics/date-range';
import { getSearchConsoleData, getTopPages } from '@/lib/google/search-console';
import generateSitemap from '@/app/sitemap';

// Test user exclusion patterns - matches filtering in conversion events
const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

// Helper to safely check if a referrer URL belongs to a domain
function isFromDomain(referrer: string, domain: string): boolean {
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    return host === domain || host.endsWith('.' + domain);
  } catch {
    return false;
  }
}

function isSearchEngine(referrer: string): boolean {
  return (
    isFromDomain(referrer, 'google.com') ||
    isFromDomain(referrer, 'bing.com') ||
    isFromDomain(referrer, 'yahoo.com') ||
    isFromDomain(referrer, 'duckduckgo.com') ||
    referrer.toLowerCase().includes('search')
  );
}

const ACTIVITY_EVENTS = [
  'app_opened',
  'tarot_viewed',
  'personalized_tarot_viewed',
  'birth_chart_viewed',
  'horoscope_viewed',
  'personalized_horoscope_viewed',
  'cosmic_pulse_opened',
  'moon_circle_opened',
  'weekly_report_opened',
  'pricing_page_viewed',
  'trial_started',
  'trial_converted',
  'subscription_started',
  'login',
  'dashboard_viewed',
  'grimoire_viewed',
];

const PRODUCT_EVENTS = [
  'birth_chart_viewed',
  'tarot_viewed',
  'horoscope_viewed',
  'crystal_recommendations_viewed',
  'personalized_tarot_viewed',
  'personalized_horoscope_viewed',
];

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
      activeTrialsResult,
      subscriptionsResult,
      monthlySubscriptionsResult,
      monthlyAISubscriptionsResult,
      yearlySubscriptionsResult,
      trialConversions30dResult,
      totalTrials30dResult,
      marketingAttributionResult,
      churnReasonsResult,
      ltvDataResult,
      topJourneysResult,
    ] = await Promise.all([
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'trial'
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active'
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active' 
          AND (plan_type = 'monthly' OR plan_type = 'lunary_plus')
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active' 
          AND plan_type = 'lunary_plus_ai'
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active' 
          AND (plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual')
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM analytics_conversions
        WHERE conversion_type = 'trial_to_paid'
          AND created_at >= ${thirtyDaysAgoTimestamp}
          AND user_id NOT IN (
            SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}             UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}           )
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM conversion_events
        WHERE event_type = 'trial_started'
          AND created_at >= ${thirtyDaysAgoTimestamp}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT
          metadata->>'utm_source' AS utm_source,
          metadata->>'referrer' AS referrer,
          COUNT(DISTINCT user_id) AS count
        FROM conversion_events
        WHERE event_type = 'signup'
          AND created_at >= ${thirtyDaysAgoTimestamp}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
        GROUP BY metadata->>'utm_source', metadata->>'referrer'
      `,
      sql`
        SELECT
          'cancelled' AS reason,
          COUNT(*) AS count
        FROM subscriptions
        WHERE status IN ('cancelled', 'canceled')
          AND updated_at >= ${thirtyDaysAgoTimestamp}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
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
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
        GROUP BY plan_type
      `,
      sql`
        SELECT
          COALESCE(trigger_feature, 'unknown') AS journey,
          COUNT(*) AS count
        FROM analytics_conversions
        WHERE created_at >= ${thirtyDaysAgoTimestamp}
          AND user_id NOT IN (
            SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}             UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}           )
        GROUP BY COALESCE(trigger_feature, 'unknown')
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    const dauStart = new Date(today);
    dauStart.setUTCDate(dauStart.getUTCDate() - 1);
    const wauStart = new Date(today);
    wauStart.setUTCDate(wauStart.getUTCDate() - 7);

    const [dauResult, wauResult, mauResult] = await Promise.all([
      sql.query(
        `
          SELECT COUNT(DISTINCT user_id) AS count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          ACTIVITY_EVENTS,
          formatTimestamp(dauStart),
          formatTimestamp(today),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
          SELECT COUNT(DISTINCT user_id) AS count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          ACTIVITY_EVENTS,
          formatTimestamp(wauStart),
          formatTimestamp(today),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
          SELECT COUNT(DISTINCT user_id) AS count
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          ACTIVITY_EVENTS,
          thirtyDaysAgoTimestamp,
          formatTimestamp(today),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
    ]);

    const dau = Number(dauResult.rows[0]?.count || 0);
    const wau = Number(wauResult.rows[0]?.count || 0);
    const mau = Number(mauResult.rows[0]?.count || 0);
    const activeUsersSource = 'database';

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

    const calcRetention = async (
      cohortStart: Date,
      cohortEnd: Date,
      days: 1 | 7 | 30,
    ) => {
      const result = await sql.query(
        `
          WITH cohort AS (
            SELECT id, "createdAt"
            FROM "user"
            WHERE "createdAt" >= $1
              AND "createdAt" < $2
              AND (email IS NULL OR (email NOT LIKE $4 AND email != $5))
          )
          SELECT
            COUNT(*) AS cohort_size,
            COUNT(*) FILTER (
              WHERE EXISTS (
                SELECT 1
                FROM conversion_events ce
                WHERE ce.user_id = cohort.id
                  AND ce.event_type = ANY($3::text[])
                  AND ce.created_at > cohort."createdAt"
                  AND ce.created_at <= cohort."createdAt" + INTERVAL '${days} days'
                  AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $4 AND ce.user_email != $5))
              )
            ) AS returned
          FROM cohort
        `,
        [
          formatTimestamp(cohortStart),
          formatTimestamp(cohortEnd),
          ACTIVITY_EVENTS,
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      );

      const cohortSize = Number(result.rows[0]?.cohort_size || 0);
      const returned = Number(result.rows[0]?.returned || 0);
      return cohortSize > 0 ? (returned / cohortSize) * 100 : null;
    };

    const day1Start = new Date(today);
    day1Start.setUTCDate(day1Start.getUTCDate() - 2);
    const day1End = new Date(today);
    day1End.setUTCDate(day1End.getUTCDate() - 1);

    const day7Start = new Date(today);
    day7Start.setUTCDate(day7Start.getUTCDate() - 14);
    const day7End = new Date(today);
    day7End.setUTCDate(day7End.getUTCDate() - 7);

    const day30Start = new Date(today);
    day30Start.setUTCDate(day30Start.getUTCDate() - 60);
    const day30End = new Date(today);
    day30End.setUTCDate(day30End.getUTCDate() - 30);

    const [day1Retention, day7Retention, day30Retention] = await Promise.all([
      calcRetention(day1Start, day1End, 1),
      calcRetention(day7Start, day7End, 7),
      calcRetention(day30Start, day30End, 30),
    ]);

    const retention = {
      day_1: day1Retention,
      day_7: day7Retention,
      day_30: day30Retention,
    };

    const churnRate =
      retention.day_30 !== null
        ? Math.max(0, 100 - Number(retention.day_30))
        : null;

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

    // Categorize acquisition sources
    const acquisitionSources = {
      organic: 0,
      paid: 0,
      social: 0,
      seo: 0,
      referral: 0,
      direct: 0,
      total: 0,
    };

    for (const row of marketingAttributionResult.rows) {
      const utmSource = (row.utm_source as string) || '';
      const referrer = (row.referrer as string) || '';
      const count = Number(row.count || 0);
      const sourceLower = utmSource.toLowerCase();
      const referrerLower = referrer.toLowerCase();

      // Categorize based on utm_source and referrer
      if (!utmSource || utmSource === 'direct' || utmSource === 'null') {
        // Check referrer for SEO
        if (isSearchEngine(referrer)) {
          acquisitionSources.seo += count;
        } else {
          acquisitionSources.direct += count;
        }
      } else if (
        sourceLower.includes('paid') ||
        sourceLower.includes('ad') ||
        sourceLower.includes('ads') ||
        sourceLower.includes('facebook') ||
        sourceLower.includes('google') ||
        sourceLower.includes('instagram') ||
        sourceLower.includes('adwords') ||
        sourceLower.includes('ppc')
      ) {
        acquisitionSources.paid += count;
      } else if (
        sourceLower.includes('social') ||
        sourceLower.includes('twitter') ||
        sourceLower.includes('tiktok') ||
        sourceLower.includes('instagram') ||
        sourceLower.includes('facebook') ||
        sourceLower.includes('pinterest') ||
        sourceLower.includes('linkedin') ||
        sourceLower.includes('reddit')
      ) {
        acquisitionSources.social += count;
      } else if (sourceLower === 'seo' || isSearchEngine(referrer)) {
        acquisitionSources.seo += count;
      } else if (
        sourceLower.includes('referral') ||
        sourceLower.includes('partner') ||
        sourceLower.includes('affiliate')
      ) {
        acquisitionSources.referral += count;
      } else if (sourceLower.includes('organic') || sourceLower === 'organic') {
        acquisitionSources.organic += count;
      } else {
        // Default to organic for unknown sources
        acquisitionSources.organic += count;
      }

      acquisitionSources.total += count;
    }

    // Keep legacy marketingAttribution for backward compatibility
    const marketingAttribution: Record<string, number> = {
      organic: acquisitionSources.organic + acquisitionSources.seo,
      direct: acquisitionSources.direct,
      referral: acquisitionSources.referral,
      paid: acquisitionSources.paid,
      social: acquisitionSources.social,
      seo: acquisitionSources.seo,
      total: acquisitionSources.total,
    };

    const churnReasons: Record<string, number> = {};
    for (const row of churnReasonsResult.rows) {
      const reason = (row.reason as string) || 'unknown';
      churnReasons[reason] = Number(row.count || 0);
    }

    // Feature retention now tracked by PostHog
    const featureRetention: Record<string, number> = {};

    const topUserJourneys: Array<{ path: string; count: number }> = [];
    for (const row of topJourneysResult.rows) {
      topUserJourneys.push({
        path: (row.journey as string) || 'unknown',
        count: Number(row.count || 0),
      });
    }

    // Tarot engagement now tracked by PostHog
    const tarotEngagementType: Record<string, number> = {};

    const productUsageResult = await sql.query(
      `
        SELECT event_type, COUNT(*) AS count
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND created_at >= $2
          AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
        GROUP BY event_type
      `,
      [
        PRODUCT_EVENTS,
        thirtyDaysAgoTimestamp,
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    );
    const productUsageCounts: Record<string, number> = {};
    productUsageResult.rows.forEach((row) => {
      productUsageCounts[row.event_type as string] = Number(row.count || 0);
    });
    const birthChartViews = productUsageCounts['birth_chart_viewed'] || 0;
    const tarotPulls = productUsageCounts['tarot_viewed'] || 0;
    const ritualsGenerated = 0; // Not currently tracked
    const crystalSearches =
      productUsageCounts['crystal_recommendations_viewed'] || 0;
    const collectionsCreated = 0; // Not currently tracked
    const reportsDownloaded = 0; // Not currently tracked

    // Crystal lookups from PostHog
    const crystalUsers = crystalSearches;
    const crystalTotalLookups = crystalSearches;
    const crystalLookupsPerUser = crystalUsers > 0 ? 1 : 0;

    const stickiness = mau > 0 ? (dau / mau) * 100 : 0;
    const stickinessDauWau = wau > 0 ? (dau / wau) * 100 : 0;
    const arr = mrr * 12;

    // Validation: Catch impossible metric combinations
    if (dau === 0 && (wau > 0 || mau > 0)) {
      console.warn(
        `[analytics/summary] Data inconsistency detected: DAU=0 but WAU=${wau}, MAU=${mau}. This may indicate a date/timezone issue.`,
      );
    }
    if (wau > 0 && dau > wau) {
      console.warn(
        `[analytics/summary] Data inconsistency detected: DAU=${dau} > WAU=${wau}. This should not be possible.`,
      );
    }
    if (mau > 0 && wau > mau) {
      console.warn(
        `[analytics/summary] Data inconsistency detected: WAU=${wau} > MAU=${mau}. This should not be possible.`,
      );
    }

    // Returning users percentage (now tracked by PostHog)
    // Estimate using WAU/DAU ratio as a proxy for returning users
    const returningUsers = wau > 0 ? wau : 0;
    const returningUsersPercent =
      dau > 0 && wau > 0 ? Math.min((wau / (wau + dau * 0.5)) * 100, 100) : 0;

    // Calculate conversion rate (Free → Paid)
    const freeUsersResult = await sql`
      SELECT COUNT(*) AS count
      FROM "user"
      WHERE "createdAt" >= ${thirtyDaysAgoTimestamp}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT} ))
    `;
    const freeUsers = Number(freeUsersResult.rows[0]?.count || 0);
    const conversionRate =
      freeUsers > 0 ? (activeSubscriptions / freeUsers) * 100 : 0;

    // Financial metrics: New MRR, Expansion MRR, Churned MRR
    const thisMonthStart = formatTimestamp(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const lastMonthStart = formatTimestamp(
      new Date(today.getFullYear(), today.getMonth() - 1, 1),
    );
    const lastMonthEnd = formatTimestamp(
      new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59),
    );

    const newSubscriptionsThisMonth = await sql`
      SELECT COUNT(DISTINCT user_id) AS count,
        SUM(CASE
          WHEN plan_type = 'monthly' OR plan_type = 'lunary_plus' THEN 4.99
          WHEN plan_type = 'lunary_plus_ai' THEN 8.99
          WHEN plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual' THEN 89.99 / 12
          ELSE 0
        END) AS new_mrr
      FROM subscriptions
      WHERE status = 'active'
        AND created_at >= ${thisMonthStart}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
    `;
    const newMrr = Number(newSubscriptionsThisMonth.rows[0]?.new_mrr || 0);

    // Expansion MRR (upgrades from plus to AI, or monthly to yearly)
    const expansionMrrResult = await sql`
      SELECT SUM(CASE
        WHEN old_plan IN ('monthly', 'lunary_plus') AND new_plan = 'lunary_plus_ai' THEN 8.99 - 4.99
        WHEN old_plan IN ('monthly', 'lunary_plus') AND new_plan IN ('yearly', 'lunary_plus_ai_annual') THEN (89.99 / 12) - 4.99
        WHEN old_plan = 'lunary_plus_ai' AND new_plan IN ('yearly', 'lunary_plus_ai_annual') THEN (89.99 / 12) - 8.99
        ELSE 0
      END) AS expansion_mrr
      FROM (
        SELECT DISTINCT ON (user_id)
          user_id,
          LAG(plan_type) OVER (PARTITION BY user_id ORDER BY updated_at) AS old_plan,
          plan_type AS new_plan
        FROM subscriptions
        WHERE updated_at >= ${thisMonthStart}
          AND status = 'active'
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
        ORDER BY user_id, updated_at DESC
      ) upgrades
      WHERE old_plan IS NOT NULL
        AND old_plan != new_plan
    `;
    const expansionMrr = Number(expansionMrrResult.rows[0]?.expansion_mrr || 0);

    // Churned MRR (cancellations this month)
    const churnedMrrResult = await sql`
      SELECT SUM(CASE
        WHEN plan_type = 'monthly' OR plan_type = 'lunary_plus' THEN 4.99
        WHEN plan_type = 'lunary_plus_ai' THEN 8.99
        WHEN plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual' THEN 89.99 / 12
        ELSE 0
      END) AS churned_mrr
      FROM subscriptions
      WHERE status IN ('cancelled', 'canceled')
        AND updated_at >= ${thisMonthStart}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
    `;
    const churnedMrr = Number(churnedMrrResult.rows[0]?.churned_mrr || 0);
    const netRevenue = mrr - churnedMrr;

    // Paid Subscriber Churn % (Monthly and Annual)
    const [
      activeMonthlyAtStartResult,
      cancelledMonthlyThisMonthResult,
      activeAnnualAtStartResult,
      cancelledAnnualThisMonthResult,
    ] = await Promise.all([
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active'
          AND (plan_type = 'monthly' OR plan_type = 'lunary_plus' OR plan_type = 'lunary_plus_ai')
          AND created_at < ${thisMonthStart}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status IN ('cancelled', 'canceled')
          AND (plan_type = 'monthly' OR plan_type = 'lunary_plus' OR plan_type = 'lunary_plus_ai')
          AND updated_at >= ${thisMonthStart}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status = 'active'
          AND (plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual')
          AND created_at < ${thisMonthStart}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
      sql`
        SELECT COUNT(DISTINCT user_id) AS count
        FROM subscriptions
        WHERE status IN ('cancelled', 'canceled')
          AND (plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual')
          AND updated_at >= ${thisMonthStart}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
      `,
    ]);

    const activeMonthlyAtStart = Number(
      activeMonthlyAtStartResult.rows[0]?.count || 0,
    );
    const cancelledMonthlyThisMonth = Number(
      cancelledMonthlyThisMonthResult.rows[0]?.count || 0,
    );
    const activeAnnualAtStart = Number(
      activeAnnualAtStartResult.rows[0]?.count || 0,
    );
    const cancelledAnnualThisMonth = Number(
      cancelledAnnualThisMonthResult.rows[0]?.count || 0,
    );

    const monthlySubscriberChurn =
      activeMonthlyAtStart > 0
        ? (cancelledMonthlyThisMonth / activeMonthlyAtStart) * 100
        : 0;
    const annualSubscriberChurn =
      activeAnnualAtStart > 0
        ? (cancelledAnnualThisMonth / activeAnnualAtStart) * 100
        : 0;

    // Stripe fees estimate (2.9% + $0.30 per transaction, approximate)
    const estimatedTransactions = activeSubscriptions;
    const stripeFees =
      estimatedTransactions > 0 ? mrr * 0.029 + estimatedTransactions * 0.3 : 0;

    // Infrastructure costs (placeholder - would need Vercel API or manual input)
    const infraCosts = null; // TODO: Integrate with Vercel billing API

    const grossMargin =
      infraCosts !== null && stripeFees !== null
        ? mrr - stripeFees - (infraCosts || 0)
        : null;
    const netMargin = grossMargin !== null ? (grossMargin / mrr) * 100 : null;

    // Cohort retention now tracked by PostHog - only show signup counts
    const cohortRetentionResult = await sql`
      SELECT
        DATE_TRUNC('week', "createdAt") AS cohort_start,
        COUNT(*) AS day0_users
      FROM "user"
      WHERE "createdAt" >= ${formatTimestamp(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000))}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT} ))
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY cohort_start DESC
      LIMIT 12
    `;

    const cohorts = cohortRetentionResult.rows.map((row) => ({
      startDate: formatDate(new Date(row.cohort_start)),
      day0Users: Number(row.day0_users || 0),
      day1Retention: retention.day_1,
      day7Retention: retention.day_7,
      day30Retention: retention.day_30,
      day90Retention: null,
    }));

    // AI Engagement metrics - database source of truth
    const aiEngagementResult = await sql`
      SELECT
        COUNT(*) AS sessions,
        COUNT(DISTINCT user_id) AS unique_users,
        COALESCE(SUM(token_count), 0) AS total_tokens,
        COUNT(*) FILTER (WHERE completed) AS completed_sessions
      FROM analytics_ai_usage
      WHERE created_at >= ${thirtyDaysAgoTimestamp}
        AND user_id NOT IN (
            SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}             UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}           )
    `;
    const aiSessions = Number(aiEngagementResult.rows[0]?.sessions || 0);
    const aiUniqueUsers = Number(aiEngagementResult.rows[0]?.unique_users || 0);
    const aiTotalTokens = Number(aiEngagementResult.rows[0]?.total_tokens || 0);
    const aiCompletedSessions = Number(
      aiEngagementResult.rows[0]?.completed_sessions || 0,
    );
    const aiCostFromPostHog: number | null = null;

    const aiTokensPerUser =
      aiUniqueUsers > 0 ? aiTotalTokens / aiUniqueUsers : 0;
    const aiCompletionRate =
      aiSessions > 0 ? (aiCompletedSessions / aiSessions) * 100 : 0;

    const aiModesResult = await sql`
      SELECT COALESCE(mode, 'unknown') AS mode, COUNT(*) AS count
      FROM analytics_ai_usage
      WHERE created_at >= ${thirtyDaysAgoTimestamp}
        AND user_id NOT IN (
            SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}             UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}           )
      GROUP BY COALESCE(mode, 'unknown')
      ORDER BY count DESC
      LIMIT 10
    `;
    const topAIModes = aiModesResult.rows.map((row) => ({
      mode: row.mode as string,
      count: Number(row.count || 0),
    }));

    // Funnel metrics
    const funnelFreeUsersResult = await sql`
      SELECT COUNT(*) AS count
      FROM "user"
      WHERE "createdAt" >= ${thirtyDaysAgoTimestamp}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT} ))
    `;
    const funnelResult = await sql`
      SELECT
        COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) AS trial_starts,
        COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) AS paid_users
      FROM conversion_events
      WHERE created_at >= ${thirtyDaysAgoTimestamp}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
    `;
    const funnelFreeUsers = Number(funnelFreeUsersResult.rows[0]?.count || 0);
    const funnelTrialStarts = Number(funnelResult.rows[0]?.trial_starts || 0);
    const funnelPaidUsers = Number(funnelResult.rows[0]?.paid_users || 0);

    // Upsells (Plus → AI)
    const upsellsResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM subscriptions
      WHERE plan_type = 'lunary_plus_ai'
        AND updated_at >= ${thirtyDaysAgoTimestamp}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
        AND EXISTS (
          SELECT 1 FROM subscriptions s2
          WHERE s2.user_id = subscriptions.user_id
            AND s2.plan_type IN ('monthly', 'lunary_plus')
            AND s2.updated_at < subscriptions.updated_at
        )
    `;
    const upsells = Number(upsellsResult.rows[0]?.count || 0);

    // Annual plan conversions
    const annualConversions = yearlySubscriptions;

    // Free → Plus conversion
    const freeToPlusResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type IN ('trial_started', 'subscription_started')
        AND created_at >= ${thirtyDaysAgoTimestamp}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.user_id = conversion_events.user_id
            AND ce2.event_type = 'signup'
            AND ce2.created_at < conversion_events.created_at
        )
    `;
    const freeToPlus = Number(freeToPlusResult.rows[0]?.count || 0);

    // Plus → AI conversion
    const plusToAI = upsells;

    // Average Revenue Per New User (ARPNU)
    const arpnuResult = await sql`
      WITH new_paid_users AS (
        SELECT DISTINCT
          ce.user_id,
          s.plan_type,
          CASE
            WHEN s.plan_type = 'monthly' OR s.plan_type = 'lunary_plus' THEN 4.99
            WHEN s.plan_type = 'lunary_plus_ai' THEN 8.99
            WHEN s.plan_type = 'yearly' OR s.plan_type = 'lunary_plus_ai_annual' THEN 89.99 / 12
            ELSE 0
          END AS mrr_contribution
      FROM conversion_events ce
      INNER JOIN subscriptions s ON s.user_id = ce.user_id
      WHERE ce.event_type = 'signup'
        AND ce.created_at >= ${thirtyDaysAgoTimestamp}
        AND s.status = 'active'
        AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce.user_email != ${TEST_EMAIL_EXACT} ))
        AND (s.email IS NULL OR (s.email NOT LIKE ${TEST_EMAIL_PATTERN} AND s.email != ${TEST_EMAIL_EXACT} ))
    )
    SELECT
      COUNT(DISTINCT user_id) AS new_paid_users,
      SUM(mrr_contribution) AS new_user_revenue
    FROM new_paid_users
  `;
    const newPaidUsers = Number(arpnuResult.rows[0]?.new_paid_users || 0);
    const newUserRevenue = Number(arpnuResult.rows[0]?.new_user_revenue || 0);
    const arpnu = newPaidUsers > 0 ? newUserRevenue / newPaidUsers : 0;

    // Activation Rate (users who completed onboarding)
    const activatedUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'onboarding_completed'
        AND created_at >= ${thirtyDaysAgoTimestamp}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
    `;
    const totalSignupsResult = await sql`
      SELECT COUNT(*) AS count
      FROM "user"
      WHERE "createdAt" >= ${thirtyDaysAgoTimestamp}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT} ))
    `;
    const activatedUsers = Number(activatedUsersResult.rows[0]?.count || 0);
    const totalSignups = Number(totalSignupsResult.rows[0]?.count || 0);
    const activationRate =
      totalSignups > 0 ? (activatedUsers / totalSignups) * 100 : 0;

    // SEO metrics - Use database table if available, fallback to API
    let articleCount = 0;
    let pagesIndexed = 0;
    let monthlyClicks = 0;
    let monthlyImpressions = 0;
    let seoCtr = 0;
    let topPages: Array<{ url: string; clicks: number }> = [];

    try {
      // Count pages from sitemap (always use current sitemap)
      const sitemapData = generateSitemap();
      pagesIndexed = sitemapData.length;
      // Count articles (grimoire + blog pages)
      articleCount = sitemapData.filter(
        (entry) =>
          entry.url.includes('/grimoire/') || entry.url.includes('/blog/week/'),
      ).length;

      // Try to get data from database table first
      const seoMetricsResult = await sql`
        SELECT
          SUM(clicks) AS total_clicks,
          SUM(impressions) AS total_impressions,
          AVG(ctr) AS avg_ctr,
          jsonb_agg(DISTINCT jsonb_array_elements(top_pages)) FILTER (WHERE top_pages IS NOT NULL) AS all_top_pages
        FROM analytics_seo_metrics
        WHERE metric_date >= ${thirtyDaysAgoDate}::DATE
          AND metric_date <= ${endDate}::DATE
      `;

      const row = seoMetricsResult.rows[0];
      if (row && row.total_clicks !== null) {
        // Use database data
        monthlyClicks = Number(row.total_clicks || 0);
        monthlyImpressions = Number(row.total_impressions || 0);
        seoCtr = Number(row.avg_ctr || 0) * 100; // Convert to percentage

        // Aggregate top pages from all days
        if (row.all_top_pages) {
          const pagesMap = new Map<string, number>();
          row.all_top_pages.forEach((page: { url: string; clicks: number }) => {
            if (page?.url && page?.clicks) {
              const current = pagesMap.get(page.url) || 0;
              pagesMap.set(page.url, current + page.clicks);
            }
          });
          topPages = Array.from(pagesMap.entries())
            .map(([url, clicks]) => ({ url, clicks }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 10);
        }
      } else {
        // Fallback to API if no database data
        const searchConsoleData = await getSearchConsoleData(
          thirtyDaysAgoDate,
          endDate,
        );
        monthlyClicks = searchConsoleData.totalClicks;
        monthlyImpressions = searchConsoleData.totalImpressions;
        seoCtr = searchConsoleData.averageCtr * 100; // Convert to percentage

        // Get top 10 pages
        const topPagesData = await getTopPages(thirtyDaysAgoDate, endDate, 10);
        topPages = topPagesData.map((page) => ({
          url: page.page,
          clicks: page.clicks,
        }));
      }
    } catch (error) {
      // If Search Console API is not configured, use defaults
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[analytics/summary] SEO metrics error:', errorMessage);
      // Keep defaults (0 values)
    }

    // Notification metrics (by date and type)
    const notificationMetricsResult = await sql`
      SELECT
        DATE(created_at) AS date,
        notification_type,
        COUNT(*) FILTER (WHERE event_type = 'sent') AS sent,
        COUNT(*) FILTER (WHERE event_type = 'opened') AS opened,
        COUNT(*) FILTER (WHERE event_type = 'clicked') AS clicked
      FROM analytics_notification_events
      WHERE created_at >= ${thirtyDaysAgoTimestamp}
      GROUP BY DATE(created_at), notification_type
      ORDER BY date DESC, notification_type
    `;

    const notifications = notificationMetricsResult.rows.map((row) => {
      const sent = Number(row.sent || 0);
      const opened = Number(row.opened || 0);
      const clicked = Number(row.clicked || 0);
      return {
        date: formatDate(new Date(row.date)),
        type: row.notification_type as string,
        sent,
        openRate: sent > 0 ? (opened / sent) * 100 : 0,
        ctr: sent > 0 ? (clicked / sent) * 100 : 0,
        signupsAttributed: 0, // Would need attribution tracking
      };
    });

    // Pricing tier breakdown
    const freeUsersCount = await sql`
      SELECT COUNT(*) AS count
      FROM "user"
      WHERE (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT} ))
    `;
    const freeUsersTotal = Number(freeUsersCount.rows[0]?.count || 0);
    const arppu = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;
    const annualVsMonthlySplit =
      monthlySubscriptions + monthlyAISubscriptions > 0
        ? (yearlySubscriptions /
            (monthlySubscriptions +
              monthlyAISubscriptions +
              yearlySubscriptions)) *
          100
        : 0;

    // API costs - use PostHog actual cost if available, otherwise estimate
    const aiCost = aiCostFromPostHog ?? (aiTotalTokens / 1000) * 0.002;
    const aiCostPerEngagedUser = aiUniqueUsers > 0 ? aiCost / aiUniqueUsers : 0;

    // AI Cost Per Paid User
    const aiCostPerPaidUserResult = await sql`
      SELECT COUNT(DISTINCT aau.user_id) AS paid_ai_users
      FROM analytics_ai_usage aau
      INNER JOIN subscriptions s ON s.user_id = aau.user_id
      WHERE aau.created_at >= ${thirtyDaysAgoTimestamp}
        AND s.status = 'active'
        AND (aau.user_id NOT IN (
          SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}           UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT}         ))
    `;
    const paidAiUsers = Number(
      aiCostPerPaidUserResult.rows[0]?.paid_ai_users || 0,
    );
    const aiCostPerPaidUser = paidAiUsers > 0 ? aiCost / paidAiUsers : 0;

    // Cost Per Activated User (requires CAC)
    const cac = null; // Would need marketing spend data
    const costPerActivatedUser =
      cac !== null && activationRate > 0 ? cac / (activationRate / 100) : null;

    // Payback Period (Months)
    const mrrPerUser = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;
    const paybackPeriodMonths =
      cac !== null && mrrPerUser > 0 ? cac / mrrPerUser : null;

    // Subscription Cohort Analysis
    const subscriptionCohortsResult = await sql`
      WITH subscription_cohorts AS (
        SELECT
          DATE_TRUNC('month', created_at) AS cohort_month,
          COUNT(DISTINCT user_id) AS initial_subscribers,
          SUM(CASE
            WHEN plan_type = 'monthly' OR plan_type = 'lunary_plus' THEN 4.99
            WHEN plan_type = 'lunary_plus_ai' THEN 8.99
            WHEN plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual' THEN 89.99 / 12
            ELSE 0
          END) AS initial_mrr
        FROM subscriptions
        WHERE (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
        GROUP BY DATE_TRUNC('month', created_at)
      ),
      current_status AS (
        SELECT
          DATE_TRUNC('month', created_at) AS cohort_month,
          COUNT(DISTINCT CASE WHEN status = 'active' THEN user_id END) AS current_subscribers,
          COUNT(DISTINCT CASE WHEN status IN ('cancelled', 'canceled') THEN user_id END) AS churned_subscribers,
          SUM(CASE
            WHEN status = 'active' THEN
              CASE
                WHEN plan_type = 'monthly' OR plan_type = 'lunary_plus' THEN 4.99
                WHEN plan_type = 'lunary_plus_ai' THEN 8.99
                WHEN plan_type = 'yearly' OR plan_type = 'lunary_plus_ai_annual' THEN 89.99 / 12
                ELSE 0
              END
            ELSE 0
          END) AS current_mrr
        FROM subscriptions
        WHERE (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} ))
        GROUP BY DATE_TRUNC('month', created_at)
      ),
      expansion_by_cohort AS (
        SELECT
          DATE_TRUNC('month', s1.created_at) AS cohort_month,
          SUM(CASE
            WHEN s1.plan_type IN ('monthly', 'lunary_plus') AND s2.plan_type = 'lunary_plus_ai' THEN 8.99 - 4.99
            WHEN s1.plan_type IN ('monthly', 'lunary_plus') AND s2.plan_type IN ('yearly', 'lunary_plus_ai_annual') THEN (89.99 / 12) - 4.99
            WHEN s1.plan_type = 'lunary_plus_ai' AND s2.plan_type IN ('yearly', 'lunary_plus_ai_annual') THEN (89.99 / 12) - 8.99
            ELSE 0
          END) AS expansion_mrr
        FROM subscriptions s1
        INNER JOIN subscriptions s2 ON s1.user_id = s2.user_id
        WHERE s2.updated_at > s1.created_at
          AND s2.status = 'active'
          AND (s1.user_email IS NULL OR (s1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND s1.user_email != ${TEST_EMAIL_EXACT} ))
        GROUP BY DATE_TRUNC('month', s1.created_at)
      )
      SELECT
        sc.cohort_month,
        sc.initial_subscribers,
        sc.initial_mrr,
        COALESCE(cs.current_subscribers, 0) AS current_subscribers,
        COALESCE(cs.current_mrr, 0) AS current_mrr,
        COALESCE(cs.churned_subscribers, 0) AS churned_subscribers,
        CASE
          WHEN sc.initial_subscribers > 0 THEN
            (COALESCE(cs.current_subscribers, 0)::float / sc.initial_subscribers * 100)
          ELSE 0
        END AS retention_rate,
        COALESCE(ebc.expansion_mrr, 0) AS expansion_mrr
      FROM subscription_cohorts sc
      LEFT JOIN current_status cs ON sc.cohort_month = cs.cohort_month
      LEFT JOIN expansion_by_cohort ebc ON sc.cohort_month = ebc.cohort_month
      WHERE sc.cohort_month >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
      ORDER BY sc.cohort_month DESC
    `;

    const subscriptionCohorts = subscriptionCohortsResult.rows.map((row) => ({
      cohortMonth: formatDate(new Date(row.cohort_month)),
      initialSubscribers: Number(row.initial_subscribers || 0),
      initialMRR: Number(Number(row.initial_mrr || 0).toFixed(2)),
      currentSubscribers: Number(row.current_subscribers || 0),
      currentMRR: Number(Number(row.current_mrr || 0).toFixed(2)),
      churnedSubscribers: Number(row.churned_subscribers || 0),
      retentionRate: Number(Number(row.retention_rate || 0).toFixed(2)),
      expansionMRR: Number(Number(row.expansion_mrr || 0).toFixed(2)),
    }));

    const infraMinutes = null; // Would need Vercel API
    const storage = null; // Would need Vercel API
    const compute = null; // Would need Vercel API

    return NextResponse.json({
      // Metadata about data sources
      _metadata: {
        generatedAt: new Date().toISOString(),
        activeUsersSource: activeUsersSource,
        aiMetricsSource: 'database',
      },

      // Sheet 1: High-Level KPIs
      highLevelKPIs: {
        dau,
        wau,
        mau,
        returningUsersPercent: Number(returningUsersPercent.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        churnPercent: churnRate !== null ? Number(churnRate.toFixed(2)) : null,
        mrr: Number(mrr.toFixed(2)),
        arr: Number(arr.toFixed(2)),
        arpu: Number(arpu.toFixed(2)),
        cac: null, // Would need marketing spend data
        ltv: Number(ltvPerUser.toFixed(2)),
        dauWauStickiness: Number(stickinessDauWau.toFixed(2)),
      },

      // Sheet 2: Financial Metrics
      financial: {
        mrr: Number(mrr.toFixed(2)),
        newMrr: Number(newMrr.toFixed(2)),
        expansionMrr: Number(expansionMrr.toFixed(2)),
        churnedMrr: Number(churnedMrr.toFixed(2)),
        netRevenue: Number(netRevenue.toFixed(2)),
        stripeFees: Number(stripeFees.toFixed(2)),
        infraCosts,
        grossMargin:
          grossMargin !== null ? Number(grossMargin.toFixed(2)) : null,
        netMargin: netMargin !== null ? Number(netMargin.toFixed(2)) : null,
      },

      // Churn Metrics
      churn: {
        monthlySubscriberChurn: Number(monthlySubscriberChurn.toFixed(2)),
        annualSubscriberChurn: Number(annualSubscriberChurn.toFixed(2)),
        overallChurn: churnRate !== null ? Number(churnRate.toFixed(2)) : null,
      },

      // Acquisition Metrics
      acquisition: {
        arpnu: Number(arpnu.toFixed(2)),
        newPaidUsers,
        newUserRevenue: Number(newUserRevenue.toFixed(2)),
        organic: acquisitionSources.organic,
        paid: acquisitionSources.paid,
        social: acquisitionSources.social,
        seo: acquisitionSources.seo,
        referral: acquisitionSources.referral,
        direct: acquisitionSources.direct,
        total: acquisitionSources.total,
        activationRate: Number(activationRate.toFixed(2)),
        costPerActivatedUser:
          costPerActivatedUser !== null
            ? Number(costPerActivatedUser.toFixed(2))
            : null,
        paybackPeriodMonths:
          paybackPeriodMonths !== null
            ? Number(paybackPeriodMonths.toFixed(2))
            : null,
      },

      // Subscription Cohorts
      subscriptionCohorts,

      // Sheet 3: Cohort Retention
      cohorts,

      // Sheet 4: AI Engagement
      aiEngagement: {
        sessions: aiSessions,
        uniqueUsers: aiUniqueUsers,
        tokensPerUser: Number(aiTokensPerUser.toFixed(2)),
        completionRate: Number(aiCompletionRate.toFixed(2)),
        topModes: topAIModes,
      },

      // Sheet 5: Funnel Performance
      funnel: {
        freeUsers: funnelFreeUsers,
        trialStarts: funnelTrialStarts,
        trialToPaidConversion: Number(trialToPaidConversionRate30d.toFixed(2)),
        paidUsers: funnelPaidUsers,
        upsells,
        annualConversions,
        freeToPlus,
        plusToAI,
      },

      // Sheet 6: SEO
      seo: {
        articleCount,
        pagesIndexed,
        monthlyClicks,
        monthlyImpressions,
        ctr: seoCtr,
        topPages,
      },

      // Sheet 7: Notifications
      notifications,

      // Sheet 8: Product Usage
      productUsage: {
        birthChartViews,
        tarotPulls,
        ritualsGenerated,
        crystalSearches,
        collectionsCreated,
        reportsDownloaded,
      },

      // Sheet 9: Pricing Tier Breakdown
      pricingTiers: {
        freeUsers: freeUsersTotal,
        plusSubscribers: monthlySubscriptions,
        aiSubscribers: monthlyAISubscriptions,
        annualSubscribers: yearlySubscriptions,
        arppu: Number(arppu.toFixed(2)),
        annualVsMonthlySplit: Number(annualVsMonthlySplit.toFixed(2)),
      },

      // Sheet 10: API Costs
      apiCosts: {
        aiTokensUsed: aiTotalTokens,
        aiCost: Number(aiCost.toFixed(2)),
        perUserCost: Number(aiCostPerEngagedUser.toFixed(2)),
        aiCostPerPaidUser: Number(aiCostPerPaidUser.toFixed(2)),
        infraMinutes,
        storage,
        compute,
      },

      // Legacy flat structure for backward compatibility and History sheet
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      dau,
      wau,
      mau,
      stickiness: Number(stickiness.toFixed(2)),
      stickinessDauWau: Number(stickinessDauWau.toFixed(2)),
      returningUsersPercent: Number(returningUsersPercent.toFixed(2)),
      activeTrials,
      activePayingUsers: activeSubscriptions,
      churnRate: churnRate !== null ? Number(churnRate.toFixed(2)) : null,
      conversionRate: Number(conversionRate.toFixed(2)),
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
      newMrr: Number(newMrr.toFixed(2)),
      expansionMrr: Number(expansionMrr.toFixed(2)),
      churnedMrr: Number(churnedMrr.toFixed(2)),
      netRevenue: Number(netRevenue.toFixed(2)),
      stripeFees: Number(stripeFees.toFixed(2)),
      churnReasons,
      marketingAttribution,
      aiCostPerEngagedUser: Number(aiCostPerEngagedUser.toFixed(2)),
      aiSessions,
      aiUniqueUsers,
      aiTokensPerUser: Number(aiTokensPerUser.toFixed(2)),
      featureRetention,
      topUserJourneys,
      seoCtr,
      tarotEngagementType,
      crystalLookupsPerUser: Number(crystalLookupsPerUser.toFixed(2)),
      birthChartViews,
      tarotPulls,
      ritualsGenerated,
      collectionsCreated,
      reportsDownloaded,
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
