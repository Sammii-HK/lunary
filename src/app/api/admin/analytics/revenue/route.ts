import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Calculate MRR directly from Stripe (single source of truth).
 * Iterates all active subscriptions and sums their actual monthly revenue
 * after discounts, avoiding stale local DB records.
 */
async function getStripeMRR(): Promise<number> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn('[analytics/revenue] STRIPE_SECRET_KEY not set, returning 0');
    return 0;
  }

  const stripe = new Stripe(stripeKey);
  let mrr = 0;

  for await (const sub of stripe.subscriptions.list({
    status: 'active',
    expand: ['data.discounts'],
    limit: 100,
  })) {
    for (const item of sub.items.data) {
      const price = item.price;
      if (!price?.unit_amount) continue;

      const isYearly = price.recurring?.interval === 'year';
      let monthlyAmount = isYearly
        ? price.unit_amount / 100 / 12
        : price.unit_amount / 100;

      // Apply discount if present
      const discounts = sub.discounts || [];
      if (discounts.length > 0) {
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
      }

      mrr += monthlyAmount;
    }
  }

  return Math.round(mrr * 100) / 100;
}

/**
 * Revenue endpoint for insights
 * MRR: queried directly from Stripe (source of truth)
 * Signups/conversions: aggregated from daily_metrics
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const [mrr, aggregateResult, trialStartsResult] = await Promise.all([
      getStripeMRR(),
      sql.query(
        `SELECT
          SUM(new_signups) as total_signups,
          SUM(new_conversions) as total_conversions
        FROM daily_metrics
        WHERE metric_date >= $1 AND metric_date <= $2`,
        [
          range.start.toISOString().split('T')[0],
          range.end.toISOString().split('T')[0],
        ],
      ),
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as trial_starts
         FROM conversion_events
         WHERE event_type = 'trial_started'
           AND created_at >= $1
           AND created_at <= $2
           AND user_id IS NOT NULL
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          range.start.toISOString(),
          range.end.toISOString(),
          '%@test.lunary.app',
          'test@test.lunary.app',
        ],
      ),
    ]);

    const result = { rows: [{ ...aggregateResult.rows[0] }] };
    const signups = Number(result.rows[0]?.total_signups || 0);
    const conversions = Number(result.rows[0]?.total_conversions || 0);
    const trialStarts = Number(trialStartsResult.rows[0]?.trial_starts || 0);

    const freeToTrialRate = signups > 0 ? (trialStarts / signups) * 100 : 0;
    const signupToPaidRate = signups > 0 ? (conversions / signups) * 100 : 0;
    const trialToPaidRate =
      trialStarts > 0 ? (conversions / trialStarts) * 100 : 0;

    const response = NextResponse.json({
      mrr: Number(mrr.toFixed(2)),
      free_to_trial_rate: Number(freeToTrialRate.toFixed(2)),
      signup_to_paid_rate: Number(signupToPaidRate.toFixed(2)),
      trial_to_paid_rate: Number(trialToPaidRate.toFixed(2)),
      total_signups: signups,
      trial_starts: trialStarts,
      total_conversions: conversions,
    });

    // Cache revenue metrics for 30 minutes with stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
    );

    return response;
  } catch (error) {
    console.error('[analytics/revenue] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
