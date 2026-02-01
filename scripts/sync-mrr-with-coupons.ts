/**
 * Sync MRR with coupon/discount data from Stripe
 *
 * This script:
 * 1. Fetches all active subscriptions from database
 * 2. Gets full subscription details from Stripe including discounts
 * 3. Calculates correct monthly_amount_due with coupons applied
 * 4. Updates database with accurate MRR
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const DRY_RUN = process.env.DRY_RUN !== 'false';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Plan prices (base prices before discounts)
const PLAN_PRICES: Record<string, number> = {
  lunary_plus: 4.99,
  basic: 4.99,
  monthly: 4.99,
  lunary_plus_ai: 8.99,
  pro: 8.99,
  lunary_plus_annual: 4.99,
  lunary_plus_ai_annual: 7.5, // 89.99/12
  pro_annual: 7.5,
  yearly: 4.99,
  year: 4.99,
};

interface DiscountInfo {
  hasDiscount: boolean;
  discountPercent: number;
  monthlyAmountDue: number;
  couponId: string | null;
  discountEndsAt: string | null;
  promoCode: string | null;
}

function extractDiscountInfo(
  subscription: Stripe.Subscription,
  planType: string,
): DiscountInfo {
  // Get base price from plan type
  let monthlyAmount = PLAN_PRICES[planType] || 4.99;

  // Try to get actual price from Stripe subscription
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

  // Apply discount
  if (discount.coupon.percent_off) {
    monthlyAmount *= 1 - discount.coupon.percent_off / 100;
  } else if (discount.coupon.amount_off) {
    // amount_off is in cents
    monthlyAmount = Math.max(
      0,
      monthlyAmount - discount.coupon.amount_off / 100,
    );
  }

  // Calculate discount end date
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

  // Forever discount = null end date
  if (discount.coupon.duration === 'forever') {
    discountEndsAt = null;
  }

  return {
    hasDiscount: true,
    discountPercent: discount.coupon.percent_off || 0,
    monthlyAmountDue: Math.round(monthlyAmount * 100) / 100, // Round to 2 decimals
    couponId: discount.coupon.id,
    discountEndsAt,
    promoCode:
      (discount as any).promotion_code?.code ||
      subscription.metadata?.promoCode ||
      null,
  };
}

async function main() {
  console.log('🔄 Syncing MRR with coupon data from Stripe\n');
  console.log(
    `Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}\n`,
  );

  const stripe = getStripe();

  let updated = 0;
  let withDiscount = 0;
  let noDiscount = 0;
  let errors = 0;
  let totalMRR = 0;

  // Get all active subscriptions with Stripe IDs
  const subs = await sql`
    SELECT user_id, user_email, stripe_subscription_id, plan_type,
           has_discount, discount_percent, monthly_amount_due, coupon_id
    FROM subscriptions
    WHERE stripe_subscription_id IS NOT NULL
      AND status IN ('active', 'trial', 'trialing', 'past_due')
    ORDER BY user_email
  `;

  console.log(`Checking ${subs.rows.length} active subscriptions...\n`);

  for (const sub of subs.rows) {
    try {
      // Fetch subscription from Stripe with expanded discount
      const subscription = await stripe.subscriptions.retrieve(
        sub.stripe_subscription_id,
        {
          expand: ['discounts.promotion_code'],
        },
      );

      const discountInfo = extractDiscountInfo(subscription, sub.plan_type);
      totalMRR += discountInfo.monthlyAmountDue;

      // Check if update needed
      const needsUpdate =
        sub.has_discount !== discountInfo.hasDiscount ||
        Number(sub.discount_percent) !== discountInfo.discountPercent ||
        Math.abs(
          Number(sub.monthly_amount_due) - discountInfo.monthlyAmountDue,
        ) > 0.01 ||
        sub.coupon_id !== discountInfo.couponId;

      if (discountInfo.hasDiscount) {
        withDiscount++;
        console.log(`💰 ${sub.user_email || sub.user_id?.slice(0, 8)}`);
        console.log(`   Plan: ${sub.plan_type}`);
        console.log(
          `   Coupon: ${discountInfo.couponId} (${discountInfo.discountPercent}% off)`,
        );
        console.log(`   MRR: $${discountInfo.monthlyAmountDue.toFixed(2)}`);
        if (discountInfo.discountEndsAt) {
          console.log(
            `   Discount ends: ${discountInfo.discountEndsAt.slice(0, 10)}`,
          );
        }
        console.log();
      } else {
        noDiscount++;
      }

      if (needsUpdate) {
        if (!DRY_RUN) {
          await sql`
            UPDATE subscriptions
            SET has_discount = ${discountInfo.hasDiscount},
                discount_percent = ${discountInfo.discountPercent},
                monthly_amount_due = ${discountInfo.monthlyAmountDue},
                coupon_id = ${discountInfo.couponId},
                discount_ends_at = ${discountInfo.discountEndsAt},
                promo_code = ${discountInfo.promoCode},
                updated_at = NOW()
            WHERE user_id = ${sub.user_id}
          `;
        }
        updated++;
      }
    } catch (error: any) {
      console.error(`Error checking ${sub.user_email}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 MRR Sync Summary\n');
  console.log(`  💰 With discount: ${withDiscount}`);
  console.log(`  📦 Full price: ${noDiscount}`);
  console.log(`  ✏️  Updated: ${updated}`);
  console.log(`  ⚠️  Errors: ${errors}`);
  console.log(`  📝 Total active: ${subs.rows.length}`);
  console.log(`\n  💵 Total MRR: $${totalMRR.toFixed(2)}\n`);

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN - No changes were made');
    console.log(
      'To apply changes, run: DRY_RUN=false npx tsx scripts/sync-mrr-with-coupons.ts\n',
    );
  } else {
    console.log('✅ MRR synced with Stripe coupon data!\n');
  }
}

main().catch(console.error);
