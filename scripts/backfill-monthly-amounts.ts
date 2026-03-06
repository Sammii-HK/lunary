/**
 * Backfill monthly_amount_due for all active subscriptions
 * This will make is_paying=true (automatically via generated column)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function extractMonthlyAmount(subscription: Stripe.Subscription): number {
  const price = subscription.items.data[0]?.price;
  const unitAmount = (price?.unit_amount || 0) / 100;
  const interval = price?.recurring?.interval;
  let base = interval === 'year' ? unitAmount / 12 : unitAmount;

  const discounts = (subscription as any).discounts || [];
  const discount = discounts[0];
  if (discount && typeof discount !== 'string' && discount?.coupon) {
    if (discount.coupon.percent_off) {
      base *= 1 - discount.coupon.percent_off / 100;
    } else if (discount.coupon.amount_off) {
      base = Math.max(0, base - discount.coupon.amount_off / 100);
    }
  }
  return base;
}

async function backfillMonthlyAmounts() {
  const stripe = getStripe();

  console.log(
    '📊 Backfilling monthly_amount_due for active subscriptions...\n',
  );

  // Get all active subscriptions without monthly_amount_due
  const missing = await sql`
    SELECT user_id, stripe_subscription_id
    FROM subscriptions
    WHERE status = 'active'
      AND (monthly_amount_due IS NULL OR monthly_amount_due = 0)
    LIMIT 500
  `;

  console.log(
    `Found ${missing.rowCount} active subscriptions missing monthly amount\n`,
  );

  let updated = 0;
  let errors = 0;

  for (const row of missing.rows) {
    try {
      const sub = await stripe.subscriptions.retrieve(
        row.stripe_subscription_id,
      );
      const monthlyAmount = extractMonthlyAmount(sub);

      await sql`
        UPDATE subscriptions
        SET monthly_amount_due = ${monthlyAmount}
        WHERE user_id = ${row.user_id}
      `;

      updated++;
      if (updated % 10 === 0) {
        console.log(`  ✓ Updated ${updated}...`);
      }
    } catch (error: any) {
      console.error(
        `❌ Error updating ${row.user_id}: ${error.message || error}`,
      );
      errors++;
    }
  }

  console.log(`\n✅ Backfill complete`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}\n`);

  // Verify
  const verify = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN monthly_amount_due > 0 THEN 1 END) as has_amount,
      COUNT(CASE WHEN is_paying = true THEN 1 END) as is_paying_true
    FROM subscriptions
    WHERE status = 'active'
  `;

  const stats = verify.rows[0];
  console.log(`📊 Active subscriptions after backfill:\n`);
  console.log(`  Total: ${stats.total}`);
  console.log(`  With monthly_amount_due > 0: ${stats.has_amount}`);
  console.log(`  is_paying=true: ${stats.is_paying_true}\n`);
}

backfillMonthlyAmounts().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
