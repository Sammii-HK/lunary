/**
 * Fix users marked as cancelled who still have active subscriptions in Stripe
 *
 * This happens when users have multiple subscriptions and cancel one,
 * but still have another active subscription.
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

async function fixMisclassifiedUsers() {
  console.log('=== Fixing Misclassified Cancelled Users ===\n');

  const stripe = getStripe();

  const cancelledUsers = await sql`
    SELECT user_id, user_email, stripe_customer_id
    FROM subscriptions
    WHERE stripe_customer_id IS NOT NULL
      AND status IN ('cancelled', 'canceled')
  `;

  let fixed = 0;

  for (const user of cancelledUsers.rows) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        limit: 10,
        expand: ['data.discounts.promotion_code'],
      });

      // Find best active subscription
      const activeSubs = subs.data
        .filter((s) => ['active', 'trialing', 'past_due'].includes(s.status))
        .sort((a, b) => {
          // Prefer active > trialing > past_due
          const priority: Record<string, number> = {
            active: 0,
            trialing: 1,
            past_due: 2,
          };
          return (priority[a.status] || 3) - (priority[b.status] || 3);
        });

      if (activeSubs.length > 0) {
        const bestSub = activeSubs[0];
        const price = bestSub.items.data[0]?.price;
        const isYearly = price?.recurring?.interval === 'year';

        // Get plan type
        const planType =
          bestSub.metadata?.plan_id ||
          price?.metadata?.plan_id ||
          (isYearly ? 'lunary_plus_ai_annual' : 'lunary_plus');

        // Calculate MRR with discount
        let monthlyAmount = isYearly
          ? (price?.unit_amount || 0) / 100 / 12
          : (price?.unit_amount || 0) / 100;

        let hasDiscount = false;
        let discountPercent = 0;
        let couponId: string | null = null;

        const discounts = bestSub.discounts || [];
        if (discounts.length > 0) {
          const discount = discounts[0];
          if (typeof discount !== 'string' && discount?.coupon) {
            hasDiscount = true;
            discountPercent = discount.coupon.percent_off || 0;
            couponId = discount.coupon.id;
            if (discount.coupon.percent_off) {
              monthlyAmount *= 1 - discount.coupon.percent_off / 100;
            }
          }
        }

        const newStatus =
          bestSub.status === 'trialing' ? 'trial' : bestSub.status;

        console.log('✅ Fixing ' + user.user_email);
        console.log('   Old: cancelled -> New: ' + newStatus);
        console.log('   Subscription: ' + bestSub.id);
        console.log(
          '   MRR: $' +
            monthlyAmount.toFixed(2) +
            (hasDiscount ? ' (' + discountPercent + '% off)' : ''),
        );

        await sql`
          UPDATE subscriptions
          SET status = ${newStatus},
              stripe_subscription_id = ${bestSub.id},
              plan_type = ${planType},
              has_discount = ${hasDiscount},
              discount_percent = ${discountPercent},
              monthly_amount_due = ${monthlyAmount},
              coupon_id = ${couponId},
              updated_at = NOW()
          WHERE user_id = ${user.user_id}
        `;
        fixed++;
      }
    } catch (error: any) {
      if (error?.code !== 'resource_missing') {
        console.error('Error: ' + error.message);
      }
    }
  }

  console.log('\n=== Fixed ' + fixed + ' users ===');

  // Show new counts
  const counts = await sql`
    SELECT status, COUNT(*) as count
    FROM subscriptions
    WHERE stripe_subscription_id IS NOT NULL OR stripe_customer_id IS NOT NULL
    GROUP BY status
    ORDER BY count DESC
  `;

  console.log('\nNew status counts:');
  counts.rows.forEach((r) => console.log('  ' + r.status + ': ' + r.count));

  // Calculate correct churn
  const churnCalc = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active') as active,
      COUNT(*) FILTER (WHERE status IN ('cancelled', 'canceled')) as cancelled,
      COUNT(*) FILTER (WHERE status IN ('trial', 'trialing')) as trial,
      COUNT(*) FILTER (WHERE status = 'past_due') as past_due
    FROM subscriptions
    WHERE stripe_subscription_id IS NOT NULL OR stripe_customer_id IS NOT NULL
  `;

  const c = churnCalc.rows[0];
  const total =
    Number(c.active) +
    Number(c.cancelled) +
    Number(c.trial) +
    Number(c.past_due);
  const churnRate =
    total > 0 ? ((Number(c.cancelled) / total) * 100).toFixed(1) : '0';

  console.log('\nCorrected churn rate: ' + churnRate + '%');
  console.log('  Active: ' + c.active);
  console.log('  Trial: ' + c.trial);
  console.log('  Past due: ' + c.past_due);
  console.log('  Cancelled: ' + c.cancelled);
}

fixMisclassifiedUsers().catch(console.error);
