import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const PLAN_PRICES: Record<string, number> = {
  lunary_plus: 4.99,
  basic: 4.99,
  monthly: 4.99,
  lunary_plus_ai: 8.99,
  pro: 8.99,
  lunary_plus_annual: 4.99,
  lunary_plus_ai_annual: 7.5,
  pro_annual: 7.5,
  yearly: 4.99,
  year: 4.99,
};

function extractDiscountInfo(
  subscription: Stripe.Subscription,
  planType: string,
) {
  let monthlyAmount = PLAN_PRICES[planType] || 4.99;

  const price = subscription.items.data[0]?.price;
  if (price?.unit_amount) {
    const isYearly = price.recurring?.interval === 'year';
    monthlyAmount = isYearly
      ? price.unit_amount / 100 / 12
      : price.unit_amount / 100;
  }

  const discounts = subscription.discounts || [];
  if (discounts.length === 0) {
    return {
      hasDiscount: false,
      discountPercent: 0,
      monthlyAmountDue: monthlyAmount,
      couponId: null,
      discountEndsAt: null,
      promoCode: null,
    };
  }

  const discount = discounts[0];
  if (typeof discount === 'string' || !discount?.coupon) {
    return {
      hasDiscount: false,
      discountPercent: 0,
      monthlyAmountDue: monthlyAmount,
      couponId: null,
      discountEndsAt: null,
      promoCode: null,
    };
  }

  if (discount.coupon.percent_off) {
    monthlyAmount *= 1 - discount.coupon.percent_off / 100;
  } else if (discount.coupon.amount_off) {
    monthlyAmount = Math.max(
      0,
      monthlyAmount - discount.coupon.amount_off / 100,
    );
  }

  let discountEndsAt: string | null = discount.end
    ? new Date(discount.end * 1000).toISOString()
    : null;

  if (
    !discountEndsAt &&
    discount.coupon.duration === 'repeating' &&
    discount.coupon.duration_in_months
  ) {
    const startTimestamp = discount.start || subscription.start_date;
    if (startTimestamp) {
      const endDate = new Date(startTimestamp * 1000);
      endDate.setUTCMonth(
        endDate.getUTCMonth() + discount.coupon.duration_in_months,
      );
      discountEndsAt = endDate.toISOString();
    }
  }

  if (discount.coupon.duration === 'forever') {
    discountEndsAt = null;
  }

  return {
    hasDiscount: true,
    discountPercent: discount.coupon.percent_off || 0,
    monthlyAmountDue: Math.round(monthlyAmount * 100) / 100,
    couponId: discount.coupon.id,
    discountEndsAt,
    promoCode:
      (discount as any).promotion_code?.code ||
      subscription.metadata?.promoCode ||
      null,
  };
}

/**
 * Sync all subscription discount data from Stripe into the database.
 * Call this before any MRR calculation to ensure monthly_amount_due
 * reflects actual discounted prices.
 */
export async function syncStripeDiscounts(): Promise<{
  updated: number;
  errors: number;
}> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY not set, skipping discount sync');
    return { updated: 0, errors: 0 };
  }

  const stripe = new Stripe(stripeKey);
  let updated = 0;
  let errors = 0;

  const subs = await sql`
    SELECT user_id, user_email, stripe_subscription_id, plan_type, status,
           has_discount, discount_percent, monthly_amount_due, coupon_id
    FROM subscriptions
    WHERE stripe_subscription_id IS NOT NULL
  `;

  for (const sub of subs.rows) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        sub.stripe_subscription_id,
        { expand: ['discounts.promotion_code'] },
      );

      const info = extractDiscountInfo(subscription, sub.plan_type);

      const currentMRR = sub.monthly_amount_due ?? -1;
      const mrrDiff = Math.abs(Number(currentMRR) - info.monthlyAmountDue);
      const needsUpdate =
        sub.has_discount !== info.hasDiscount ||
        Number(sub.discount_percent || 0) !== info.discountPercent ||
        currentMRR === -1 ||
        mrrDiff > 0.01 ||
        sub.coupon_id !== info.couponId;

      if (needsUpdate) {
        await sql`
          UPDATE subscriptions
          SET has_discount = ${info.hasDiscount},
              discount_percent = ${info.discountPercent},
              monthly_amount_due = ${info.monthlyAmountDue},
              coupon_id = ${info.couponId},
              discount_ends_at = ${info.discountEndsAt},
              promo_code = ${info.promoCode},
              updated_at = NOW()
          WHERE user_id = ${sub.user_id}
        `;
        updated++;
      }
    } catch (error: any) {
      console.error(
        `Discount sync error for ${sub.user_email}:`,
        error.message,
      );
      errors++;
    }
  }

  return { updated, errors };
}
