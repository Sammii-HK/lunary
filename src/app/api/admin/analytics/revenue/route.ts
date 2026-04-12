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

    const [mrr, aggregateResult] = await Promise.all([
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
    ]);

    const result = { rows: [{ ...aggregateResult.rows[0] }] };
    const signups = Number(result.rows[0]?.total_signups || 0);
    const conversions = Number(result.rows[0]?.total_conversions || 0);

    // Calculate conversion rate
    const conversionRate = signups > 0 ? (conversions / signups) * 100 : 0;

    const response = NextResponse.json({
      mrr: Number(mrr.toFixed(2)),
      free_to_trial_rate: Number(conversionRate.toFixed(2)),
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
