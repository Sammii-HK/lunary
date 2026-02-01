import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Get plan breakdown with MRR contribution and coupon info
    // Only count Stripe-backed subscriptions for accurate MRR
    // MRR should only include active/trial subscriptions
    const planBreakdownResult = await sql`
      SELECT
        plan_type,
        COUNT(*) as count,
        COALESCE(SUM(COALESCE(monthly_amount_due, 0)) FILTER (WHERE status IN ('active', 'trial', 'trialing')), 0) as mrr_contribution,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status IN ('trial', 'trialing')) as trial_count,
        COUNT(*) FILTER (WHERE status IN ('cancelled', 'canceled')) as cancelled_count,
        COUNT(*) FILTER (WHERE has_discount = true AND status IN ('active', 'trial', 'trialing')) as with_discount_count,
        COUNT(*) FILTER (WHERE (has_discount = false OR has_discount IS NULL) AND status IN ('active', 'trial', 'trialing')) as full_price_count
      FROM subscriptions
      WHERE stripe_subscription_id IS NOT NULL
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY plan_type
      ORDER BY mrr_contribution DESC
    `;

    // Get coupon breakdown - which coupons are being used
    const couponBreakdownResult = await sql`
      SELECT
        COALESCE(promo_code, coupon_id, 'unknown') as coupon_code,
        discount_percent,
        COUNT(*) as subscriber_count,
        COUNT(*) FILTER (WHERE status IN ('active', 'trial', 'trialing')) as active_count,
        MIN(discount_ends_at) as earliest_expiry,
        MAX(discount_ends_at) as latest_expiry
      FROM subscriptions
      WHERE stripe_subscription_id IS NOT NULL
        AND has_discount = true
        AND status IN ('active', 'trial', 'trialing')
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY COALESCE(promo_code, coupon_id, 'unknown'), discount_percent
      ORDER BY subscriber_count DESC
    `;

    // Calculate potential MRR when coupons expire
    // Uses expected monthly price based on plan type
    const potentialMrrResult = await sql`
      SELECT
        SUM(
          CASE
            WHEN LOWER(plan_type) IN ('lunary_plus', 'basic', 'monthly', 'month') THEN 4.99
            WHEN LOWER(plan_type) IN ('lunary_plus_ai', 'pro', 'ai') THEN 8.99
            WHEN LOWER(plan_type) IN ('lunary_plus_ai_annual', 'annual', 'yearly', 'year', 'pro_annual') THEN 7.49
            ELSE 0
          END
        ) as potential_mrr,
        COUNT(*) as discounted_subscribers
      FROM subscriptions
      WHERE stripe_subscription_id IS NOT NULL
        AND has_discount = true
        AND status IN ('active', 'trial', 'trialing')
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;

    // Find legacy 'monthly' subscriber(s)
    const legacyMonthlyResult = await sql`
      SELECT
        s.id as subscription_id,
        s.user_id,
        s.plan_type,
        s.status,
        s.monthly_amount_due,
        s.has_discount,
        s.promo_code,
        s.coupon_id,
        s.created_at as subscription_created,
        COALESCE(s.user_email, u.email) as email,
        u.name
      FROM subscriptions s
      LEFT JOIN "user" u ON u.id = s.user_id
      WHERE LOWER(s.plan_type) = 'monthly'
        AND s.stripe_subscription_id IS NOT NULL
      ORDER BY s.created_at DESC
    `;

    type PlanAggregate = {
      plan: string;
      count: number;
      mrr: number;
      active: number;
      trial: number;
      cancelled: number;
      withDiscount: number;
      fullPrice: number;
    };

    const planBreakdownMap = planBreakdownResult.rows.reduce<
      Map<string, PlanAggregate>
    >((acc, row) => {
      const rawPlan = (row.plan_type as string) || 'unknown';

      // Normalize plan types to handle variations and map to canonical names
      // Based on actual Stripe plan IDs: lunary_plus, lunary_plus_ai, lunary_plus_ai_annual
      // Note: No basic-yearly plan exists in Stripe (no lunary_plus_annual)
      let normalizedPlan: string;
      const lower = rawPlan.toLowerCase();
      if (['lunary_plus', 'basic', 'monthly', 'month'].includes(lower)) {
        normalizedPlan = 'basic-monthly';
      } else if (['lunary_plus_ai', 'pro', 'ai'].includes(lower)) {
        normalizedPlan = 'pro-monthly';
      } else if (
        [
          'lunary_plus_ai_annual',
          'annual',
          'yearly',
          'year',
          'pro_annual',
        ].includes(lower)
      ) {
        // 'annual' maps to pro-yearly (lunary_plus_ai_annual), not basic
        normalizedPlan = 'pro-yearly';
      } else if (lower === 'free') {
        normalizedPlan = 'free';
      } else if (['lifetime', 'enterprise'].includes(lower)) {
        normalizedPlan = 'enterprise';
      } else {
        normalizedPlan = 'unknown';
      }
      const existing = acc.get(normalizedPlan) || {
        plan: normalizedPlan,
        count: 0,
        mrr: 0,
        active: 0,
        trial: 0,
        cancelled: 0,
        withDiscount: 0,
        fullPrice: 0,
      };
      existing.count += Number(row.count || 0);
      existing.mrr += Number(row.mrr_contribution || 0);
      existing.active += Number(row.active_count || 0);
      existing.trial += Number(row.trial_count || 0);
      existing.cancelled += Number(row.cancelled_count || 0);
      existing.withDiscount += Number(row.with_discount_count || 0);
      existing.fullPrice += Number(row.full_price_count || 0);
      acc.set(normalizedPlan, existing);
      return acc;
    }, new Map<string, PlanAggregate>());

    const planBreakdown = Array.from(planBreakdownMap.values()).sort(
      (a, b) => b.mrr - a.mrr,
    );

    const totalMrr = planBreakdown.reduce((sum, p) => sum + p.mrr, 0);
    const planDistribution = planBreakdown.map((plan) => ({
      ...plan,
      percentage: totalMrr > 0 ? (plan.mrr / totalMrr) * 100 : 0,
    }));

    // Track plan upgrades/downgrades
    const planChangesResult = await sql`
      SELECT 
        ce1.metadata->>'previous_plan' as from_plan,
        ce1.metadata->>'new_plan' as to_plan,
        COUNT(*) as count
      FROM conversion_events ce1
      WHERE ce1.event_type = 'subscription_updated'
        AND ce1.created_at >= ${formatTimestamp(range.start)}
        AND ce1.created_at <= ${formatTimestamp(range.end)}
        AND (ce1.user_email IS NULL OR (ce1.user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND ce1.user_email != ${TEST_EMAIL_EXACT}))
        AND ce1.metadata->>'previous_plan' IS NOT NULL
        AND ce1.metadata->>'new_plan' IS NOT NULL
      GROUP BY ce1.metadata->>'previous_plan', ce1.metadata->>'new_plan'
    `;

    const planChanges = planChangesResult.rows.map((row) => ({
      from: row.from_plan as string,
      to: row.to_plan as string,
      count: Number(row.count || 0),
    }));

    // Process coupon breakdown
    const couponBreakdown = couponBreakdownResult.rows.map((row) => ({
      couponCode: row.coupon_code as string,
      discountPercent: Number(row.discount_percent || 0),
      subscriberCount: Number(row.subscriber_count || 0),
      activeCount: Number(row.active_count || 0),
      earliestExpiry: row.earliest_expiry as string | null,
      latestExpiry: row.latest_expiry as string | null,
    }));

    // Calculate totals for coupon summary
    const totalWithDiscount = planBreakdown.reduce(
      (sum, p) => sum + p.withDiscount,
      0,
    );
    const totalFullPrice = planBreakdown.reduce(
      (sum, p) => sum + p.fullPrice,
      0,
    );
    const totalActiveSubscribers = totalWithDiscount + totalFullPrice;

    // Potential MRR when coupons expire
    const potentialMrr = Number(potentialMrrResult.rows[0]?.potential_mrr || 0);
    const discountedSubscribers = Number(
      potentialMrrResult.rows[0]?.discounted_subscribers || 0,
    );

    // Legacy monthly subscribers
    const legacyMonthlySubscribers = legacyMonthlyResult.rows.map((row) => ({
      subscriptionId: row.subscription_id as string,
      userId: row.user_id as string,
      planType: row.plan_type as string,
      status: row.status as string,
      monthlyAmountDue: Number(row.monthly_amount_due || 0),
      hasDiscount: row.has_discount as boolean,
      promoCode: row.promo_code as string | null,
      couponId: row.coupon_id as string | null,
      subscriptionCreated: row.subscription_created as string,
      email: row.email as string | null,
      name: row.name as string | null,
    }));

    const response = NextResponse.json({
      planBreakdown: planDistribution,
      totalMrr,
      planChanges,
      // Coupon/discount metrics
      couponBreakdown,
      couponSummary: {
        totalWithDiscount,
        totalFullPrice,
        totalActiveSubscribers,
        discountPercentage:
          totalActiveSubscribers > 0
            ? (totalWithDiscount / totalActiveSubscribers) * 100
            : 0,
        potentialMrr,
        potentialMrrIncrease: potentialMrr - totalMrr,
        discountedSubscribers,
      },
      // Legacy plan type tracking
      legacyMonthlySubscribers,
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/plan-breakdown] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        planBreakdown: [],
        totalMrr: 0,
        planChanges: [],
        couponBreakdown: [],
        couponSummary: {
          totalWithDiscount: 0,
          totalFullPrice: 0,
          totalActiveSubscribers: 0,
          discountPercentage: 0,
          potentialMrr: 0,
          potentialMrrIncrease: 0,
          discountedSubscribers: 0,
        },
        legacyMonthlySubscribers: [],
      },
      { status: 500 },
    );
  }
}
