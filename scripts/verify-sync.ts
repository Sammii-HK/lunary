/**
 * Verify subscription sync worked correctly
 *
 * Checks that database matches Stripe for all users
 *
 * Run with: npx ts-node scripts/verify-sync.ts
 */

// Load environment variables from .env.local
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

function mapStripeStatus(status: string): string {
  switch (status) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'canceled':
      return 'cancelled';
    case 'past_due':
      return 'past_due';
    default:
      return 'free';
  }
}

async function main() {
  console.log('✅ Verifying subscription sync...\n');

  const stripe = getStripe();

  let synced = 0;
  let mismatches = 0;
  let errors = 0;

  const issues: any[] = [];

  // Get all users with customer IDs
  const users = await sql`
    SELECT user_id, user_email, stripe_customer_id, stripe_subscription_id, status, plan_type
    FROM subscriptions
    WHERE stripe_customer_id IS NOT NULL
    ORDER BY user_email
  `;

  console.log(`Checking ${users.rows.length} users...\n`);

  for (const user of users.rows) {
    try {
      // Fetch current subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        limit: 10,
      });

      // Get active subscriptions
      const active = subscriptions.data.filter((s) =>
        ['active', 'trialing', 'past_due'].includes(s.status),
      );

      if (active.length === 0) {
        // Should be marked as cancelled/free
        if (user.status !== 'free' && user.status !== 'cancelled') {
          console.log(`❌ ${user.user_email || user.user_id}`);
          console.log(`   DB: ${user.status} | Stripe: No active subscription`);
          console.log(`   Expected: cancelled/free\n`);
          mismatches++;
          issues.push({
            email: user.user_email,
            issue: 'Should be cancelled/free',
            dbStatus: user.status,
            stripeStatus: 'none',
          });
        } else {
          synced++;
        }
        continue;
      }

      // Get highest-value active subscription
      const sorted = active.sort((a, b) => {
        const aPrice = a.items.data[0]?.price;
        const bPrice = b.items.data[0]?.price;
        const aAmount = aPrice?.unit_amount || 0;
        const bAmount = bPrice?.unit_amount || 0;
        const aMonthly =
          aPrice?.recurring?.interval === 'year' ? aAmount / 12 : aAmount;
        const bMonthly =
          bPrice?.recurring?.interval === 'year' ? bAmount / 12 : bAmount;
        return bMonthly - aMonthly;
      });

      const subscription = sorted[0];
      const price = subscription.items.data[0]?.price;

      const stripeStatus = mapStripeStatus(subscription.status);
      const stripePlanType =
        subscription.metadata?.plan_id ||
        price?.metadata?.plan_id ||
        (price?.recurring?.interval === 'year'
          ? 'lunary_plus_ai_annual'
          : 'lunary_plus');

      // Check if synced
      const isStatusMatch = user.status === stripeStatus;
      const isPlanMatch = user.plan_type === stripePlanType;
      const isSubIdMatch = user.stripe_subscription_id === subscription.id;

      if (!isStatusMatch || !isPlanMatch || !isSubIdMatch) {
        console.log(`❌ ${user.user_email || user.user_id}`);
        if (!isStatusMatch) {
          console.log(`   Status: DB=${user.status} | Stripe=${stripeStatus}`);
        }
        if (!isPlanMatch) {
          console.log(
            `   Plan: DB=${user.plan_type} | Stripe=${stripePlanType}`,
          );
        }
        if (!isSubIdMatch) {
          console.log(
            `   SubID: DB=${user.stripe_subscription_id?.slice(0, 20)}... | Stripe=${subscription.id.slice(0, 20)}...`,
          );
        }
        console.log();
        mismatches++;
        issues.push({
          email: user.user_email,
          issue: 'Mismatch',
          db: {
            status: user.status,
            plan: user.plan_type,
            subId: user.stripe_subscription_id,
          },
          stripe: {
            status: stripeStatus,
            plan: stripePlanType,
            subId: subscription.id,
          },
        });
      } else {
        synced++;
      }
    } catch (error: any) {
      if (error?.code === 'resource_missing') {
        console.log(`❌ ${user.user_email || user.user_id}`);
        console.log(`   Invalid customer ID: ${user.stripe_customer_id}\n`);
        errors++;
        issues.push({
          email: user.user_email,
          issue: 'Invalid customer ID',
          customerId: user.stripe_customer_id,
        });
      } else {
        console.error(`Error checking ${user.user_email}:`, error.message);
        errors++;
      }
    }
  }

  console.log('='.repeat(60));
  console.log('📊 Sync Verification Results\n');
  console.log(`  ✅ Synced correctly: ${synced}`);
  console.log(`  ❌ Mismatches: ${mismatches}`);
  console.log(`  ⚠️  Errors: ${errors}`);
  console.log(`  📝 Total checked: ${users.rows.length}\n`);

  if (mismatches === 0 && errors === 0) {
    console.log('🎉 All subscriptions are properly synced!\n');
  } else {
    console.log('⚠️  Some subscriptions are still out of sync');
    console.log(
      'Run: DRY_RUN=false npx ts-node scripts/sync-subscriptions-from-stripe.ts\n',
    );

    if (issues.length > 0) {
      console.log('Issues found:');
      console.log(JSON.stringify(issues, null, 2));
    }
  }
}

main().catch(console.error);
