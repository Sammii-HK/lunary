/**
 * Sync all subscriptions from Stripe to database
 *
 * This script:
 * 1. Gets all users from database
 * 2. Fetches their current Stripe subscriptions
 * 3. Updates database to match Stripe's current state
 * 4. Cleans up invalid customer IDs
 * 5. Shows summary of changes
 */

// Load environment variables from .env.local
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
  console.log('🔄 Syncing subscriptions from Stripe to database\n');
  console.log(
    `Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (will update database)'}\n`,
  );

  const stripe = getStripe();

  let updated = 0;
  let cancelled = 0;
  let errors = 0;
  let noChange = 0;
  let invalidCustomers = 0;

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
        // No active subscription - mark as cancelled/free
        if (user.status !== 'free' && user.status !== 'cancelled') {
          console.log(`❌ ${user.user_email || user.user_id}`);
          console.log(`   Current DB: ${user.status} (${user.plan_type})`);
          console.log(`   Stripe: No active subscriptions`);
          console.log(`   Action: Mark as cancelled\n`);

          if (!DRY_RUN) {
            await sql`
              UPDATE subscriptions
              SET status = 'cancelled',
                  plan_type = 'free',
                  stripe_subscription_id = NULL,
                  updated_at = NOW()
              WHERE user_id = ${user.user_id}
            `;
          }
          cancelled++;
        } else {
          noChange++;
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

      const newStatus = mapStripeStatus(subscription.status);
      const newPlanType =
        subscription.metadata?.plan_id ||
        price?.metadata?.plan_id ||
        (price?.recurring?.interval === 'year'
          ? 'lunary_plus_ai_annual'
          : 'lunary_plus');

      const trialEndsAt = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const currentPeriodEnd = (subscription as any).current_period_end
        ? new Date(
            (subscription as any).current_period_end * 1000,
          ).toISOString()
        : null;

      // Check if update needed
      const needsUpdate =
        user.status !== newStatus ||
        user.plan_type !== newPlanType ||
        user.stripe_subscription_id !== subscription.id;

      if (needsUpdate) {
        console.log(`✏️  ${user.user_email || user.user_id}`);
        console.log(`   Current DB: ${user.status} (${user.plan_type})`);
        console.log(`   Stripe: ${newStatus} (${newPlanType})`);
        console.log(`   Subscription: ${subscription.id}`);

        if (active.length > 1) {
          console.log(
            `   ⚠️  Warning: ${active.length} active subscriptions, using highest value`,
          );
        }
        console.log();

        if (!DRY_RUN) {
          await sql`
            UPDATE subscriptions
            SET status = ${newStatus},
                plan_type = ${newPlanType},
                stripe_subscription_id = ${subscription.id},
                trial_ends_at = ${trialEndsAt},
                current_period_end = ${currentPeriodEnd},
                updated_at = NOW()
            WHERE user_id = ${user.user_id}
          `;
        }
        updated++;
      } else {
        noChange++;
      }
    } catch (error: any) {
      if (error?.code === 'resource_missing') {
        console.log(`❌ ${user.user_email || user.user_id}`);
        console.log(`   Invalid customer ID: ${user.stripe_customer_id}`);
        console.log(`   Action: Clear invalid customer ID\n`);

        if (!DRY_RUN) {
          await sql`
            UPDATE subscriptions
            SET stripe_customer_id = NULL,
                stripe_subscription_id = NULL,
                status = 'free',
                plan_type = 'free',
                updated_at = NOW()
            WHERE user_id = ${user.user_id}
          `;
        }
        invalidCustomers++;
      } else {
        console.error(`Error checking ${user.user_email}:`, error.message);
        errors++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Sync Summary\n');
  console.log(`  ✏️  Updated: ${updated}`);
  console.log(`  ❌ Cancelled (no active sub): ${cancelled}`);
  console.log(`  🗑️  Invalid customers removed: ${invalidCustomers}`);
  console.log(`  ✅ No change needed: ${noChange}`);
  console.log(`  ⚠️  Errors: ${errors}`);
  console.log(`  📝 Total processed: ${users.rows.length}\n`);

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN - No changes were made');
    console.log(
      'To apply changes, run: DRY_RUN=false npx ts-node scripts/sync-subscriptions-from-stripe.ts\n',
    );
  } else {
    console.log('✅ Database synced with Stripe!\n');
  }
}

main().catch(console.error);
