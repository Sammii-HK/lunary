/**
 * Script to identify and fix duplicate Stripe customers
 *
 * This script will:
 * 1. Find users with multiple Stripe customers
 * 2. Identify the correct customer to keep (the one with active subscription)
 * 3. Update all references to use the correct customer
 * 4. Archive duplicate customers in Stripe
 *
 * Run with: npx ts-node scripts/fix-duplicate-customers.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default to dry run for safety

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

interface DuplicateCustomer {
  userId: string;
  email: string;
  customers: Array<{
    customerId: string;
    hasActiveSubscription: boolean;
    subscriptionCount: number;
    created: number;
    planType: string;
    planValue: number;
    monthlyValue: number;
    activeCount: number;
  }>;
}

async function findDuplicateCustomers(): Promise<DuplicateCustomer[]> {
  const stripe = getStripe();
  const duplicates: DuplicateCustomer[] = [];

  console.log('🔍 Searching for duplicate customers...\n');

  // Get all users from auth table
  const usersResult = await sql`
    SELECT id, email
    FROM "user"
    WHERE email IS NOT NULL
    ORDER BY id
  `;

  for (const user of usersResult.rows) {
    try {
      // Search for all customers with this email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 100,
      });

      if (customers.data.length > 1) {
        console.log(
          `⚠️  Found ${customers.data.length} customers for ${user.email}`,
        );

        const customerDetails = await Promise.all(
          customers.data.map(async (customer) => {
            const subscriptions = await stripe.subscriptions.list({
              customer: customer.id,
              status: 'all',
              limit: 100,
            });

            const activeSubs = subscriptions.data.filter((sub) =>
              ['active', 'trialing', 'past_due'].includes(sub.status),
            );
            const hasActive = activeSubs.length > 0;

            // Get plan details for the highest-value active subscription
            let planType = 'none';
            let planValue = 0;
            let monthlyValue = 0;

            if (activeSubs.length > 0) {
              // Find highest value subscription
              const sorted = activeSubs.sort((a, b) => {
                const aPrice = a.items.data[0]?.price;
                const bPrice = b.items.data[0]?.price;
                const aAmount = aPrice?.unit_amount || 0;
                const bAmount = bPrice?.unit_amount || 0;
                const aMonthly =
                  aPrice?.recurring?.interval === 'year'
                    ? aAmount / 12
                    : aAmount;
                const bMonthly =
                  bPrice?.recurring?.interval === 'year'
                    ? bAmount / 12
                    : bAmount;
                return bMonthly - aMonthly;
              });

              const topSub = sorted[0];
              const price = topSub.items.data[0]?.price;
              planType =
                topSub.metadata?.plan_id ||
                price?.metadata?.plan_id ||
                'unknown';
              const amount = price?.unit_amount || 0;
              const interval = price?.recurring?.interval;
              const currency = price?.currency?.toUpperCase() || 'USD';
              monthlyValue = interval === 'year' ? amount / 12 : amount;
              planValue = monthlyValue;

              // Add currency to plan type for display
              planType = `${planType} (${currency})`;
            }

            return {
              customerId: customer.id,
              hasActiveSubscription: hasActive,
              subscriptionCount: subscriptions.data.length,
              created: customer.created,
              planType,
              planValue,
              monthlyValue: planValue / 100, // Convert cents to dollars
              activeCount: activeSubs.length,
            };
          }),
        );

        duplicates.push({
          userId: user.id,
          email: user.email,
          customers: customerDetails,
        });
      }
    } catch (error) {
      console.error(`Error checking ${user.email}:`, error);
    }
  }

  return duplicates;
}

async function fixDuplicateCustomer(duplicate: DuplicateCustomer) {
  const stripe = getStripe();

  console.log(
    `\n📝 Processing duplicates for ${duplicate.email} (user: ${duplicate.userId})`,
  );

  // Determine which customer to keep
  // Priority: 1) Has active subscription, 2) Highest plan value, 3) Most subscriptions, 4) Most recent
  const sortedCustomers = [...duplicate.customers].sort((a, b) => {
    if (a.hasActiveSubscription !== b.hasActiveSubscription) {
      return b.hasActiveSubscription ? 1 : -1;
    }
    if (a.planValue !== b.planValue) {
      return b.planValue - a.planValue; // Higher value plan wins
    }
    if (a.subscriptionCount !== b.subscriptionCount) {
      return b.subscriptionCount - a.subscriptionCount;
    }
    return b.created - a.created;
  });

  const keepCustomer = sortedCustomers[0];
  const removeCustomers = sortedCustomers.slice(1);

  console.log(`  ✅ Will keep customer: ${keepCustomer.customerId}`);
  console.log(
    `     - Active subscription: ${keepCustomer.hasActiveSubscription}`,
  );
  console.log(
    `     - Plan: ${keepCustomer.planType} ($${keepCustomer.monthlyValue.toFixed(2)}/mo)`,
  );
  console.log(`     - Total subscriptions: ${keepCustomer.subscriptionCount}`);

  for (const customer of removeCustomers) {
    console.log(`  🗑️  Will remove customer: ${customer.customerId}`);
    console.log(
      `     - Active subscription: ${customer.hasActiveSubscription}`,
    );
    console.log(
      `     - Plan: ${customer.planType} ($${customer.monthlyValue.toFixed(2)}/mo)`,
    );
    console.log(`     - Total subscriptions: ${customer.subscriptionCount}`);
  }

  if (DRY_RUN) {
    console.log('  ⚠️  DRY RUN - No changes made');
    return;
  }

  // Update database to use the correct customer
  await sql`
    UPDATE subscriptions
    SET stripe_customer_id = ${keepCustomer.customerId},
        updated_at = NOW()
    WHERE user_id = ${duplicate.userId}
  `;

  await sql`
    UPDATE user_profiles
    SET stripe_customer_id = ${keepCustomer.customerId},
        updated_at = NOW()
    WHERE user_id = ${duplicate.userId}
  `;

  // Update Stripe customer metadata
  await stripe.customers.update(keepCustomer.customerId, {
    metadata: { userId: duplicate.userId },
  });

  // Cancel and archive duplicate customers
  for (const customer of removeCustomers) {
    // Cancel any active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.customerId,
      status: 'all',
    });

    for (const subscription of subscriptions.data) {
      if (['active', 'trialing', 'past_due'].includes(subscription.status)) {
        console.log(
          `    Cancelling subscription ${subscription.id} on duplicate customer`,
        );
        await stripe.subscriptions.cancel(subscription.id);
      }
    }

    // Delete the customer (Stripe will archive it)
    console.log(`    Deleting duplicate customer ${customer.customerId}`);
    await stripe.customers.del(customer.customerId);
  }

  console.log(`  ✅ Fixed duplicates for ${duplicate.email}`);
}

async function main() {
  console.log('🚀 Duplicate Customer Cleanup Script\n');
  console.log(
    `Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (will make changes)'}\n`,
  );
  console.log(
    'To run in LIVE mode: DRY_RUN=false npx ts-node scripts/fix-duplicate-customers.ts\n',
  );

  const duplicates = await findDuplicateCustomers();

  if (duplicates.length === 0) {
    console.log('\n✅ No duplicate customers found!');
    return;
  }

  console.log(
    `\n📊 Found ${duplicates.length} users with duplicate customers\n`,
  );

  for (const duplicate of duplicates) {
    await fixDuplicateCustomer(duplicate);
  }

  console.log('\n✅ Duplicate customer cleanup complete!');

  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN. No changes were made.');
    console.log(
      'To apply changes, run: DRY_RUN=false npx ts-node scripts/fix-duplicate-customers.ts',
    );
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
