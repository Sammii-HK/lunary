import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';
import { getSearchConsoleData } from '@/lib/google/search-console';
import { summarizeEntitlements } from '@/lib/metrics/entitlement-metrics';
import { ANALYTICS_HISTORICAL_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

type StripeCustomerBucket =
  | 'full_price_paid'
  | 'discounted_paid'
  | 'trial'
  | 'couponed_or_comped';

type StripeSubscriptionSnapshot = {
  mrr: number;
  fullPricePaidCustomers: number;
  discountedPaidCustomers: number;
  trialCustomers: number;
  couponedOrCompedCustomers: number;
  activeAccessCustomers: number;
  activeSubscriptions: number;
};

const STRIPE_BUCKET_PRIORITY: Record<StripeCustomerBucket, number> = {
  full_price_paid: 4,
  discounted_paid: 3,
  trial: 2,
  couponed_or_comped: 1,
};

/**
 * Get DAU/WAU/MRR from daily_metrics snapshot (fast path)
 */
async function getSnapshotMetrics(endDate: Date) {
  const endDateStr = endDate.toISOString().split('T')[0];

  const result = await sql.query(
    `SELECT
      signed_in_product_dau as dau,
      signed_in_product_wau as wau,
      mrr,
      new_signups,
      new_conversions,
      activation_rate
    FROM daily_metrics
    WHERE metric_date <= $1
    ORDER BY metric_date DESC
    LIMIT 1`,
    [endDateStr],
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

function clampSnapshotEnd(endDate: Date) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return endDate >= today
    ? new Date(today.getTime() - 24 * 60 * 60 * 1000)
    : endDate;
}

function getPriceAmountPerMonth(price: Stripe.Price) {
  if (!price.unit_amount) return 0;

  const interval = price.recurring?.interval;
  if (interval === 'year') {
    return price.unit_amount / 100 / 12;
  }
  if (interval === 'week') {
    return ((price.unit_amount / 100) * 52) / 12;
  }
  if (interval === 'day') {
    return ((price.unit_amount / 100) * 365) / 12;
  }
  return price.unit_amount / 100;
}

function getSubscriptionMonthlyAmount(subscription: Stripe.Subscription) {
  let monthlyAmount = subscription.items.data.reduce((sum, item) => {
    if (!item.price) return sum;
    return sum + getPriceAmountPerMonth(item.price);
  }, 0);

  const discounts = subscription.discounts || [];
  if (discounts.length === 0) {
    return {
      monthlyAmount: Math.round(monthlyAmount * 100) / 100,
      hasDiscount: false,
    };
  }

  const discount = discounts[0];
  if (typeof discount !== 'string' && discount?.coupon) {
    if (discount.coupon.percent_off) {
      monthlyAmount *= 1 - discount.coupon.percent_off / 100;
    } else if (discount.coupon.amount_off) {
      monthlyAmount = Math.max(
        0,
        monthlyAmount - discount.coupon.amount_off / 100,
      );
    }
  }

  return {
    monthlyAmount: Math.round(monthlyAmount * 100) / 100,
    hasDiscount: true,
  };
}

async function getStripeSubscriptionSnapshot(
  stripe: Stripe | null,
): Promise<StripeSubscriptionSnapshot> {
  if (!stripe) {
    return {
      mrr: 0,
      fullPricePaidCustomers: 0,
      discountedPaidCustomers: 0,
      trialCustomers: 0,
      couponedOrCompedCustomers: 0,
      activeAccessCustomers: 0,
      activeSubscriptions: 0,
    };
  }

  const customerBuckets = new Map<string, StripeCustomerBucket>();
  let mrr = 0;
  let activeSubscriptions = 0;

  for await (const subscription of stripe.subscriptions.list({
    status: 'all',
    limit: 100,
    expand: ['data.discounts'],
  })) {
    if (!['active', 'trialing', 'past_due'].includes(subscription.status)) {
      continue;
    }

    activeSubscriptions += 1;

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;

    if (!customerId) {
      continue;
    }

    const { monthlyAmount, hasDiscount } =
      getSubscriptionMonthlyAmount(subscription);

    let bucket: StripeCustomerBucket;
    if (subscription.status === 'trialing') {
      bucket = 'trial';
    } else if (monthlyAmount <= 0) {
      bucket = 'couponed_or_comped';
    } else if (hasDiscount) {
      bucket = 'discounted_paid';
    } else {
      bucket = 'full_price_paid';
    }

    if (subscription.status !== 'trialing' && monthlyAmount > 0) {
      mrr += monthlyAmount;
    }

    const previousBucket = customerBuckets.get(customerId);
    if (
      !previousBucket ||
      STRIPE_BUCKET_PRIORITY[bucket] > STRIPE_BUCKET_PRIORITY[previousBucket]
    ) {
      customerBuckets.set(customerId, bucket);
    }
  }

  let fullPricePaidCustomers = 0;
  let discountedPaidCustomers = 0;
  let trialCustomers = 0;
  let couponedOrCompedCustomers = 0;

  for (const bucket of customerBuckets.values()) {
    if (bucket === 'full_price_paid') fullPricePaidCustomers += 1;
    if (bucket === 'discounted_paid') discountedPaidCustomers += 1;
    if (bucket === 'trial') trialCustomers += 1;
    if (bucket === 'couponed_or_comped') couponedOrCompedCustomers += 1;
  }

  return {
    mrr: Math.round(mrr * 100) / 100,
    fullPricePaidCustomers,
    discountedPaidCustomers,
    trialCustomers,
    couponedOrCompedCustomers,
    activeAccessCustomers: customerBuckets.size,
    activeSubscriptions,
  };
}

// Test user exclusion patterns
const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const PRODUCT_INTERACTION_EVENTS = [
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
 * Success Metrics endpoint for insights
 * Uses pre-computed daily_metrics for DAU/WAU when available
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const endDate = formatDate(range.end);
    const startDate = formatDate(range.start);

    // 1-3. DAU, WAU - try daily_metrics first (fast path)
    const periodDays = Math.ceil(
      (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const prevRangeStart = new Date(range.start);
    prevRangeStart.setDate(prevRangeStart.getDate() - periodDays);
    const prevRangeEnd = new Date(range.end);
    prevRangeEnd.setDate(prevRangeEnd.getDate() - periodDays);

    let dau = 0;
    let weeklyReturning = 0;
    let dauTrend: 'up' | 'down' | 'stable' = 'stable';
    let dauChange = 0;
    let weeklyReturningTrend: 'up' | 'down' | 'stable' = 'stable';
    let weeklyReturningChange = 0;

    const snapshotEnd = clampSnapshotEnd(range.end);
    const previousSnapshotEnd = clampSnapshotEnd(prevRangeEnd);

    // FAST PATH: Try daily_metrics snapshot first
    const [currentSnapshot, prevSnapshot] = await Promise.all([
      getSnapshotMetrics(snapshotEnd),
      getSnapshotMetrics(previousSnapshotEnd),
    ]);

    if (currentSnapshot) {
      // Use snapshot data
      dau = Number(currentSnapshot.dau || 0);
      weeklyReturning = Number(currentSnapshot.wau || 0);
      const prevDau = prevSnapshot ? Number(prevSnapshot.dau || 0) : 0;
      const prevWau = prevSnapshot ? Number(prevSnapshot.wau || 0) : 0;

      dauChange = prevDau > 0 ? ((dau - prevDau) / prevDau) * 100 : 0;
      dauTrend = dauChange > 1 ? 'up' : dauChange < -1 ? 'down' : 'stable';

      weeklyReturningChange =
        prevWau > 0 ? ((weeklyReturning - prevWau) / prevWau) * 100 : 0;
      weeklyReturningTrend =
        weeklyReturningChange > 1
          ? 'up'
          : weeklyReturningChange < -1
            ? 'down'
            : 'stable';
    } else {
      // FALLBACK: Live query if no snapshot
      const currentDayStart = new Date(range.end);
      currentDayStart.setUTCDate(currentDayStart.getUTCDate() - 1);
      const currentWeekStart = new Date(range.end);
      currentWeekStart.setUTCDate(currentWeekStart.getUTCDate() - 7);

      const prevDayStart = new Date(prevRangeEnd);
      prevDayStart.setUTCDate(prevDayStart.getUTCDate() - 1);
      const prevWeekStart = new Date(prevRangeEnd);
      prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);

      const [currentDauResult, currentWauResult, prevDauResult, prevWauResult] =
        await Promise.all([
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
              PRODUCT_INTERACTION_EVENTS,
              formatTimestamp(currentDayStart),
              formatTimestamp(range.end),
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
              PRODUCT_INTERACTION_EVENTS,
              formatTimestamp(currentWeekStart),
              formatTimestamp(range.end),
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
              PRODUCT_INTERACTION_EVENTS,
              formatTimestamp(prevDayStart),
              formatTimestamp(prevRangeEnd),
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
              PRODUCT_INTERACTION_EVENTS,
              formatTimestamp(prevWeekStart),
              formatTimestamp(prevRangeEnd),
              TEST_EMAIL_PATTERN,
              TEST_EMAIL_EXACT,
            ],
          ),
        ]);

      dau = Number(currentDauResult.rows[0]?.count || 0);
      weeklyReturning = Number(currentWauResult.rows[0]?.count || 0);
      const prevDau = Number(prevDauResult.rows[0]?.count || 0);
      const prevWau = Number(prevWauResult.rows[0]?.count || 0);

      dauChange = prevDau > 0 ? ((dau - prevDau) / prevDau) * 100 : 0;
      dauTrend = dauChange > 1 ? 'up' : dauChange < -1 ? 'down' : 'stable';

      weeklyReturningChange =
        prevWau > 0 ? ((weeklyReturning - prevWau) / prevWau) * 100 : 0;
      weeklyReturningTrend =
        weeklyReturningChange > 1
          ? 'up'
          : weeklyReturningChange < -1
            ? 'down'
            : 'stable';
    }

    // 4. Conversion Rate - use conversion_events for both numerator and denominator
    const signupsResult = await sql`
      SELECT COUNT(*) AS total_signups
      FROM "user"
      WHERE "createdAt" BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
    `;
    const totalSignups = Number(signupsResult.rows[0]?.total_signups || 0);

    const conversionsResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS total_conversions
      FROM conversion_events
      WHERE event_type IN ('trial_converted', 'subscription_started')
        AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;
    const totalConversions = Number(
      conversionsResult.rows[0]?.total_conversions || 0,
    );
    const conversionRate =
      totalSignups > 0 ? (totalConversions / totalSignups) * 100 : 0;

    const prevSignupsResult = await sql`
      SELECT COUNT(*) AS total_signups
      FROM "user"
      WHERE "createdAt" BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
        AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
    `;
    const prevTotalSignups = Number(
      prevSignupsResult.rows[0]?.total_signups || 0,
    );

    const prevConversionsResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS total_conversions
      FROM conversion_events
      WHERE event_type IN ('trial_converted', 'subscription_started')
        AND created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;
    const prevTotalConversions = Number(
      prevConversionsResult.rows[0]?.total_conversions || 0,
    );
    const prevConversionRate =
      prevTotalSignups > 0
        ? (prevTotalConversions / prevTotalSignups) * 100
        : 0;
    const conversionTrend =
      conversionRate > prevConversionRate
        ? 'up'
        : conversionRate < prevConversionRate
          ? 'down'
          : 'stable';
    const conversionChange =
      prevConversionRate > 0
        ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100
        : 0;

    // 5. Search Impressions & Clicks (Google Search Console API)
    let searchImpressions = 0;
    let searchClicks = 0;
    let searchCtr = 0;
    let searchTrend: 'up' | 'down' | 'stable' = 'stable';
    let searchChange = 0;

    try {
      const searchConsoleData = await getSearchConsoleData(startDate, endDate);
      searchImpressions = searchConsoleData.totalImpressions;
      searchClicks = searchConsoleData.totalClicks;
      searchCtr = searchConsoleData.averageCtr * 100; // Convert to percentage

      // Previous period for trend
      const prevSearchConsoleData = await getSearchConsoleData(
        formatDate(prevRangeStart),
        formatDate(prevRangeEnd),
      );
      const prevSearchImpressions = prevSearchConsoleData.totalImpressions;
      const prevSearchClicks = prevSearchConsoleData.totalClicks;

      searchTrend =
        searchClicks > prevSearchClicks
          ? 'up'
          : searchClicks < prevSearchClicks
            ? 'down'
            : 'stable';
      searchChange =
        prevSearchClicks > 0
          ? ((searchClicks - prevSearchClicks) / prevSearchClicks) * 100
          : 0;
    } catch (error) {
      // If Search Console API is not configured, use placeholder values
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[analytics/success-metrics] Search Console API error:',
        errorMessage,
        error instanceof Error ? error.stack : '',
      );

      // Set a note with the actual error for debugging
      searchImpressions = -1; // Use -1 to indicate error state
    }

    // 6. Monthly Recurring Revenue (MRR), Active Entitlements, and Subscription Health
    const perUserSubscriptionsResult = await sql`
      WITH scoped AS (
        SELECT user_id, status, monthly_amount_due, is_paying
        FROM subscriptions
        WHERE user_id IS NOT NULL
          AND COALESCE(updated_at, created_at) <= ${formatTimestamp(range.end)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      ),
      per_user AS (
        SELECT
          user_id,
          COUNT(*) FILTER (WHERE status IN ('active', 'trial', 'past_due', 'free')) AS active_rows,
          BOOL_OR(status IN ('active', 'trial', 'past_due', 'free')) AS has_active,
          MAX(
            CASE
              WHEN status IN ('active', 'past_due') THEN monthly_amount_due
              ELSE 0
            END
          ) AS max_monthly,
          BOOL_OR(
            CASE
              WHEN status IN ('active', 'past_due') THEN is_paying
              ELSE false
            END
          ) AS has_paying
        FROM scoped
        GROUP BY user_id
      )
      SELECT
        user_id,
        active_rows AS subscription_count,
        max_monthly,
        has_paying
      FROM per_user
      WHERE has_active
    `;

    const entitlementEntries = perUserSubscriptionsResult.rows.map((row) => ({
      userId: row.user_id as string,
      subscriptionCount: Number(row.subscription_count || 0),
      maxMonthly: Number(row.max_monthly || 0),
      hasPaying: Boolean(row.has_paying),
    }));

    const currentEntitlementStats = summarizeEntitlements(entitlementEntries);

    // Stripe-synced access buckets from subscriptions table
    const accessBucketsResult = await sql`
      WITH scoped AS (
        SELECT
          user_id,
          status,
          COALESCE(monthly_amount_due, 0) AS monthly_amount_due,
          COALESCE(has_discount, false) AS has_discount,
          COALESCE(discount_percent, 0) AS discount_percent
        FROM subscriptions
        WHERE user_id IS NOT NULL
          AND COALESCE(updated_at, created_at) <= ${formatTimestamp(range.end)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      ),
      per_user AS (
        SELECT
          user_id,
          BOOL_OR(status IN ('active', 'trial', 'past_due', 'free')) AS has_active,
          BOOL_OR(status = 'trial') AS has_trial,
          BOOL_OR(
            status IN ('active', 'past_due') AND monthly_amount_due > 0
          ) AS has_real_paid,
          BOOL_OR(
            status IN ('active', 'past_due')
            AND monthly_amount_due > 0
            AND has_discount = true
            AND discount_percent > 0
            AND discount_percent < 100
          ) AS has_discounted_paid,
          BOOL_OR(
            status IN ('active', 'trial', 'past_due', 'free')
            AND (
              monthly_amount_due <= 0
              OR status = 'free'
              OR discount_percent >= 100
            )
          ) AS has_couponed_or_comped
        FROM scoped
        GROUP BY user_id
      )
      SELECT
        COUNT(*) FILTER (WHERE has_active) AS total_active,
        COUNT(*) FILTER (WHERE has_real_paid) AS total_paid,
        COUNT(*) FILTER (WHERE has_discounted_paid) AS discounted_paid,
        COUNT(*) FILTER (WHERE has_trial AND NOT has_real_paid) AS trial_users,
        COUNT(*) FILTER (
          WHERE has_couponed_or_comped AND NOT has_real_paid AND NOT has_trial
        ) AS couponed_or_comped_users
      FROM per_user
    `;

    // Count total registered users and free users (users without paid subscription)
    const userCountsResult = await sql`
      WITH paid_users AS (
        SELECT DISTINCT user_id
        FROM subscriptions
        WHERE status IN ('active', 'past_due')
          AND COALESCE(monthly_amount_due, 0) > 0
          AND user_id IS NOT NULL
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      ),
      all_users AS (
        SELECT id as user_id
        FROM "user"
        WHERE "createdAt" <= ${formatTimestamp(range.end)}
          AND (email IS NULL OR (email NOT LIKE ${TEST_EMAIL_PATTERN} AND email != ${TEST_EMAIL_EXACT}))
      )
      SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE user_id NOT IN (SELECT user_id FROM paid_users)) AS free_users
      FROM all_users
    `;

    const activeSubscriptionsCountResult = {
      rows: [
        {
          total_active: accessBucketsResult.rows[0]?.total_active || 0,
          total_paid: accessBucketsResult.rows[0]?.total_paid || 0,
          discounted_paid: accessBucketsResult.rows[0]?.discounted_paid || 0,
          trial_users: accessBucketsResult.rows[0]?.trial_users || 0,
          couponed_or_comped_users:
            accessBucketsResult.rows[0]?.couponed_or_comped_users || 0,
          total_users: userCountsResult.rows[0]?.total_users || 0,
          free_users: userCountsResult.rows[0]?.free_users || 0,
        },
      ],
    };

    const prevActiveSubscriptionsResult = await sql`
      WITH scoped AS (
        SELECT user_id, status, COALESCE(monthly_amount_due, 0) AS monthly_amount_due
        FROM subscriptions
        WHERE user_id IS NOT NULL
          AND COALESCE(updated_at, created_at) <= ${formatTimestamp(prevRangeEnd)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      ),
      per_user AS (
        SELECT
          user_id,
          BOOL_OR(status IN ('active', 'trial', 'past_due', 'free')) AS has_active,
          BOOL_OR(
            status IN ('active', 'past_due') AND monthly_amount_due > 0
          ) AS has_paid
        FROM scoped
        GROUP BY user_id
      )
      SELECT
        COUNT(*) FILTER (WHERE has_active) AS total_active,
        COUNT(*) FILTER (WHERE has_paid) AS total_paid
      FROM per_user
    `;

    const previousSubscriptionsResult = await sql`
      WITH latest_per_user AS (
        SELECT DISTINCT ON (user_id)
          user_id,
          status,
          monthly_amount_due,
          is_paying
        FROM subscriptions
        WHERE user_id IS NOT NULL
          AND updated_at <= ${formatTimestamp(prevRangeEnd)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
        ORDER BY user_id, updated_at DESC
      )
      SELECT
        user_id,
        1 AS subscription_count,
        CASE
          WHEN status IN ('active', 'past_due') THEN COALESCE(monthly_amount_due, 0)
          ELSE 0
        END AS max_monthly,
        CASE
          WHEN status IN ('active', 'past_due') THEN is_paying
          ELSE false
        END AS is_paying
      FROM latest_per_user
      WHERE status IN ('active', 'trial', 'past_due', 'free')
    `;

    const previousEntries = previousSubscriptionsResult.rows.map((row) => ({
      userId: row.user_id as string,
      subscriptionCount: Number(row.subscription_count || 0),
      maxMonthly: Number(row.max_monthly || 0),
      hasPaying: Boolean(row.is_paying),
    }));

    const previousEntitlementStats = summarizeEntitlements(previousEntries);

    const activeEntitlements = currentEntitlementStats.activeEntitlements;
    const duplicateUsers = currentEntitlementStats.duplicateUsers;
    const duplicateSubscriptionRate =
      activeEntitlements > 0 ? (duplicateUsers / activeEntitlements) * 100 : 0;
    const activeSubscriptions = Number(
      activeSubscriptionsCountResult.rows[0]?.total_active || 0,
    );
    const totalUsers = Number(
      activeSubscriptionsCountResult.rows[0]?.total_users || 0,
    );
    const freeUsers = Number(
      activeSubscriptionsCountResult.rows[0]?.free_users || 0,
    );
    const prevPaidSubscriptionsTotal = Number(
      prevActiveSubscriptionsResult.rows[0]?.total_paid || 0,
    );

    // Get orphaned subscriptions count (subscriptions that couldn't be linked to a user)
    let orphanedSubscriptionsCount = 0;
    try {
      const orphanedResult = await sql`
        SELECT COUNT(*) AS count
        FROM orphaned_subscriptions
        WHERE status IN ('active', 'trial', 'past_due')
      `;
      orphanedSubscriptionsCount = Number(orphanedResult.rows[0]?.count || 0);
    } catch {
      // Table may not exist
    }

    const stripe = getStripe();
    let stripeSnapshot: StripeSubscriptionSnapshot | null = null;
    try {
      stripeSnapshot = await getStripeSubscriptionSnapshot(stripe);
    } catch (error) {
      console.warn(
        '[success-metrics] Stripe snapshot failed, falling back to local subscription sync:',
        error,
      );
    }

    const fullPricePaidCustomers =
      stripeSnapshot?.fullPricePaidCustomers ??
      Math.max(
        Number(accessBucketsResult.rows[0]?.total_paid || 0) -
          Number(accessBucketsResult.rows[0]?.discounted_paid || 0),
        0,
      );
    const discountedPaidUsers =
      stripeSnapshot?.discountedPaidCustomers ??
      Number(accessBucketsResult.rows[0]?.discounted_paid || 0);
    const trialUsers =
      stripeSnapshot?.trialCustomers ??
      Number(accessBucketsResult.rows[0]?.trial_users || 0);
    const couponedOrCompedUsers =
      stripeSnapshot?.couponedOrCompedCustomers ??
      Number(accessBucketsResult.rows[0]?.couponed_or_comped_users || 0);
    const activeAccessUsers =
      stripeSnapshot?.activeAccessCustomers ?? activeSubscriptions;
    const stripeActiveSubscriptions =
      stripeSnapshot?.activeSubscriptions ?? activeSubscriptions;
    const billedCustomers = fullPricePaidCustomers + discountedPaidUsers;
    const mrr = stripeSnapshot?.mrr ?? currentEntitlementStats.dedupedMrr;

    const prevMrr = previousEntitlementStats.dedupedMrr;
    const startingPayingCustomers = previousEntitlementStats.payingCustomers;

    const mrrTrend = mrr > prevMrr ? 'up' : mrr < prevMrr ? 'down' : 'stable';
    const mrrChange =
      prevMrr > 0 ? ((mrr - prevMrr) / prevMrr) * 100 : mrr > 0 ? 100 : 0;

    const arr = mrr * 12;
    const prevArr = prevMrr * 12;
    const arrTrend = arr > prevArr ? 'up' : arr < prevArr ? 'down' : 'stable';
    const arrChange =
      prevArr > 0 ? ((arr - prevArr) / prevArr) * 100 : arr > 0 ? 100 : 0;

    const activeSubscriptionsTrend =
      fullPricePaidCustomers > prevPaidSubscriptionsTotal
        ? 'up'
        : fullPricePaidCustomers < prevPaidSubscriptionsTotal
          ? 'down'
          : 'stable';
    const activeSubscriptionsChange =
      prevPaidSubscriptionsTotal > 0
        ? ((fullPricePaidCustomers - prevPaidSubscriptionsTotal) /
            prevPaidSubscriptionsTotal) *
          100
        : fullPricePaidCustomers > 0
          ? 100
          : 0;

    const arpu = billedCustomers > 0 ? mrr / billedCustomers : 0;
    const prevArpu =
      startingPayingCustomers > 0 ? prevMrr / startingPayingCustomers : 0;
    const arpuTrend =
      arpu > prevArpu ? 'up' : arpu < prevArpu ? 'down' : 'stable';
    const arpuChange = prevArpu > 0 ? ((arpu - prevArpu) / prevArpu) * 100 : 0;

    // 6d. Trial Conversion Rate (trial_started → trial_converted)
    // Cohort-based: Only count conversions from trials that started in the range
    const trialConversionResult = await sql`
      WITH trials_in_range AS (
        SELECT DISTINCT user_id, MIN(created_at) AS trial_start
        FROM conversion_events
        WHERE event_type = 'trial_started'
          AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
        GROUP BY user_id
      ),
      conversions_from_range_trials AS (
        SELECT DISTINCT ce.user_id
        FROM conversion_events ce
        INNER JOIN trials_in_range t ON ce.user_id = t.user_id
        WHERE ce.event_type IN ('trial_converted', 'subscription_started')
          AND ce.created_at > t.trial_start
          AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce.user_email != ${TEST_EMAIL_EXACT}))
      )
      SELECT
        (SELECT COUNT(*) FROM trials_in_range) AS trial_started,
        (SELECT COUNT(*) FROM conversions_from_range_trials) AS trial_converted
    `;
    const trialStarted = Number(
      trialConversionResult.rows[0]?.trial_started || 0,
    );
    const trialConverted = Number(
      trialConversionResult.rows[0]?.trial_converted || 0,
    );
    const trialConversionRate =
      trialStarted > 0 ? (trialConverted / trialStarted) * 100 : 0;

    // Previous period trial conversion rate (cohort-based)
    const prevTrialConversionResult = await sql`
      WITH trials_in_range AS (
        SELECT DISTINCT user_id, MIN(created_at) AS trial_start
        FROM conversion_events
        WHERE event_type = 'trial_started'
          AND created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
          AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
        GROUP BY user_id
      ),
      conversions_from_range_trials AS (
        SELECT DISTINCT ce.user_id
        FROM conversion_events ce
        INNER JOIN trials_in_range t ON ce.user_id = t.user_id
        WHERE ce.event_type IN ('trial_converted', 'subscription_started')
          AND ce.created_at > t.trial_start
          AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce.user_email != ${TEST_EMAIL_EXACT}))
      )
      SELECT
        (SELECT COUNT(*) FROM trials_in_range) AS trial_started,
        (SELECT COUNT(*) FROM conversions_from_range_trials) AS trial_converted
    `;
    const prevTrialStarted = Number(
      prevTrialConversionResult.rows[0]?.trial_started || 0,
    );
    const prevTrialConverted = Number(
      prevTrialConversionResult.rows[0]?.trial_converted || 0,
    );
    const prevTrialConversionRate =
      prevTrialStarted > 0 ? (prevTrialConverted / prevTrialStarted) * 100 : 0;

    const trialConversionTrend =
      trialConversionRate > prevTrialConversionRate
        ? 'up'
        : trialConversionRate < prevTrialConversionRate
          ? 'down'
          : 'stable';
    const trialConversionChange =
      prevTrialConversionRate > 0
        ? ((trialConversionRate - prevTrialConversionRate) /
            prevTrialConversionRate) *
          100
        : trialConversionRate > 0
          ? 100
          : 0;

    const subscriptionCancelsResult = await sql`
      SELECT COUNT(*) AS cancels
      FROM conversion_events
      WHERE event_type = 'subscription_cancelled'
        AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;
    const subscriptionCancels = Number(
      subscriptionCancelsResult.rows[0]?.cancels || 0,
    );

    const churnedCustomersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS churned
      FROM conversion_events
      WHERE event_type IN ('subscription_cancelled', 'subscription_ended')
        AND created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND user_id IS NOT NULL
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = conversion_events.user_id
            AND s.status IN ('active', 'trial', 'past_due')
            AND COALESCE(s.updated_at, s.created_at) <= ${formatTimestamp(range.end)}
        )
    `;
    const churnedCustomers = Number(
      churnedCustomersResult.rows[0]?.churned || 0,
    );
    const churnRate =
      startingPayingCustomers > 0
        ? (churnedCustomers / startingPayingCustomers) * 100
        : 0;

    const activationReturnResult = await sql.query(
      `
        WITH trial_cohort AS (
          SELECT user_id, MIN(created_at) AS started_at
          FROM conversion_events
          WHERE event_type = 'trial_started'
            AND created_at BETWEEN $1 AND $2
            AND user_id IS NOT NULL
            AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
          GROUP BY user_id
        )
        SELECT
          COUNT(*) AS total_activations,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM conversion_events ce
              WHERE ce.user_id = trial_cohort.user_id
                AND ce.event_type = ANY($5)
                AND ce.created_at >= trial_cohort.started_at
                AND ce.created_at <= trial_cohort.started_at + INTERVAL '48 hours'
                AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))
            )
          ) AS returning_activations
        FROM trial_cohort
      `,
      [
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        PRODUCT_INTERACTION_EVENTS,
      ],
    );
    const activationTotal = Number(
      activationReturnResult.rows[0]?.total_activations || 0,
    );
    const activationReturning = Number(
      activationReturnResult.rows[0]?.returning_activations || 0,
    );
    const activationToReturnRate =
      activationTotal > 0 ? (activationReturning / activationTotal) * 100 : 0;

    // 7. AI Chat Messages - count total messages from completed sessions
    // Use message_count from sessions that were completed in the date range
    const aiMessagesResult = await sql`
      SELECT
        COALESCE(SUM(message_count), 0) AS total_messages
      FROM analytics_ai_usage
      WHERE completed_at IS NOT NULL
        AND completed_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
        AND message_count > 0
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = analytics_ai_usage.user_id
            AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
        )
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce
          WHERE ce.user_id = analytics_ai_usage.user_id
            AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
        )
    `;
    const aiMessages = Number(aiMessagesResult.rows[0]?.total_messages || 0);

    // Previous period for trend
    const prevAiMessagesResult = await sql`
      SELECT
        COALESCE(SUM(message_count), 0) AS total_messages
      FROM analytics_ai_usage
      WHERE completed_at IS NOT NULL
        AND completed_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
        AND message_count > 0
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = analytics_ai_usage.user_id
            AND (s.user_email LIKE ${TEST_EMAIL_PATTERN} OR s.user_email = ${TEST_EMAIL_EXACT})
        )
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce
          WHERE ce.user_id = analytics_ai_usage.user_id
            AND (ce.user_email LIKE ${TEST_EMAIL_PATTERN} OR ce.user_email = ${TEST_EMAIL_EXACT})
        )
    `;
    const prevAiMessages = Number(
      prevAiMessagesResult.rows[0]?.total_messages || 0,
    );
    const aiMessagesTrend =
      aiMessages > prevAiMessages
        ? 'up'
        : aiMessages < prevAiMessages
          ? 'down'
          : 'stable';
    const aiMessagesChange =
      prevAiMessages > 0
        ? ((aiMessages - prevAiMessages) / prevAiMessages) * 100
        : 0;

    // 8. Push Notification Subscribers (active subscriptions)
    // Count total active subscribers (current state)
    const substackSubscribersResult = await sql`
      SELECT COUNT(*) AS count
      FROM push_subscriptions
      WHERE is_active = true
    `;
    const substackSubscribers = Number(
      substackSubscribersResult.rows[0]?.count || 0,
    );

    // Previous period for trend - count subscribers that existed at end of previous period
    // This is a proxy: count subscribers created before prevRangeEnd (they likely existed then)
    const prevSubstackSubscribersResult = await sql`
      SELECT COUNT(*) AS count
      FROM push_subscriptions
      WHERE created_at <= ${formatTimestamp(prevRangeEnd)}
    `;
    const prevSubstackSubscribers = Number(
      prevSubstackSubscribersResult.rows[0]?.count || 0,
    );
    const substackTrend =
      substackSubscribers > prevSubstackSubscribers
        ? 'up'
        : substackSubscribers < prevSubstackSubscribers
          ? 'down'
          : 'stable';
    const substackChange =
      prevSubstackSubscribers > 0
        ? ((substackSubscribers - prevSubstackSubscribers) /
            prevSubstackSubscribers) *
          100
        : substackSubscribers > 0
          ? 100
          : 0;

    const response = NextResponse.json({
      daily_active_users: {
        value: dau,
        trend: dauTrend,
        change: Number(dauChange.toFixed(1)),
        target: null,
      },
      weekly_returning_users: {
        value: weeklyReturning,
        trend: weeklyReturningTrend,
        change: Number(weeklyReturningChange.toFixed(1)),
        target: null,
      },
      conversion_rate: {
        value: Number(conversionRate.toFixed(2)),
        trend: conversionTrend,
        change: Number(conversionChange.toFixed(1)),
        target: { min: 5, max: 10 },
      },
      search_impressions_clicks: {
        impressions: searchImpressions,
        clicks: searchClicks,
        ctr: Number(searchCtr.toFixed(2)),
        trend: searchTrend,
        change: Number(searchChange.toFixed(1)),
        note:
          searchImpressions === -1
            ? 'Google Search Console API error. Check server logs for details.'
            : searchImpressions === 0
              ? 'Google Search Console API not configured. See docs/GOOGLE_SEARCH_CONSOLE_SETUP.md'
              : undefined,
      },
      monthly_recurring_revenue: {
        value: Number(mrr.toFixed(2)),
        trend: mrrTrend,
        change: Number(mrrChange.toFixed(1)),
        target: null,
      },
      annual_recurring_revenue: {
        value: Number(arr.toFixed(2)),
        trend: arrTrend,
        change: Number(arrChange.toFixed(1)),
        target: null,
      },
      active_subscriptions: {
        value: fullPricePaidCustomers,
        trend: activeSubscriptionsTrend,
        change: Number(activeSubscriptionsChange.toFixed(1)),
        target: null,
        // Breakdown: full price vs discounted vs coupon/comped vs trial access
        paid_subscriptions: fullPricePaidCustomers,
        billed_customers: billedCustomers,
        full_price_paid_users: fullPricePaidCustomers,
        discounted_paid_users: discountedPaidUsers,
        trial_users: trialUsers,
        couponed_or_comped_users: couponedOrCompedUsers,
        access_users: activeAccessUsers,
        free_users: freeUsers,
        total_registered_users: totalUsers,
        stripe_active_subscriptions: stripeActiveSubscriptions,
        stripe_active_customers: activeAccessUsers,
        orphaned_subscriptions: orphanedSubscriptionsCount,
        discrepancy: activeAccessUsers - activeSubscriptions,
      },
      active_entitlements: {
        value: activeEntitlements,
        duplicate_rate: Number(duplicateSubscriptionRate.toFixed(1)),
        duplicates: duplicateUsers,
        target: null,
      },
      paying_customers: {
        value: billedCustomers,
        full_price: fullPricePaidCustomers,
        discounted: discountedPaidUsers,
        target: null,
      },
      subscription_cancels: subscriptionCancels,
      churn_rate: Number(churnRate.toFixed(1)),
      churned_customers: churnedCustomers,
      starting_paying_customers: startingPayingCustomers,
      activation_to_return: {
        value: Number(activationToReturnRate.toFixed(1)),
        total: activationTotal,
        returning: activationReturning,
      },
      arpu: {
        value: Number(arpu.toFixed(2)),
        trend: arpuTrend,
        change: Number(arpuChange.toFixed(1)),
        target: null,
      },
      trial_conversion_rate: {
        value: Number(trialConversionRate.toFixed(2)),
        trend: trialConversionTrend,
        change: Number(trialConversionChange.toFixed(1)),
        target: { min: 20, max: 40 }, // Target: 20-40% trial conversion
      },
      ai_chat_messages: {
        value: aiMessages,
        trend: aiMessagesTrend,
        change: Number(aiMessagesChange.toFixed(1)),
        target: null,
      },
      substack_subscribers: {
        value: substackSubscribers,
        trend: substackTrend,
        change: Number(substackChange.toFixed(1)),
        target: null,
      },
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_HISTORICAL_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/success-metrics] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
