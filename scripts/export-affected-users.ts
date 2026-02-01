/**
 * Export affected users from subscription sync
 *
 * Creates JSON files with:
 * - Users who will be updated (cancelled -> active)
 * - Users with invalid customer IDs
 * - Users with multiple subscriptions
 *
 * Run with: npx ts-node scripts/export-affected-users.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
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

interface AffectedUser {
  email: string;
  userId: string;
  currentStatus: string;
  newStatus?: string;
  currentPlan?: string;
  newPlan?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  issue: string;
  details?: any;
}

async function main() {
  console.log('📊 Exporting affected users...\n');

  const stripe = getStripe();

  const usersToUpdate: AffectedUser[] = [];
  const invalidCustomers: AffectedUser[] = [];
  const multipleSubscriptions: AffectedUser[] = [];
  const cancelled: AffectedUser[] = [];

  // Get all users with customer IDs
  const users = await sql`
    SELECT user_id, user_email, stripe_customer_id, stripe_subscription_id, status, plan_type
    FROM subscriptions
    WHERE stripe_customer_id IS NOT NULL
    ORDER BY user_email
  `;

  console.log(`Checking ${users.rows.length} users...`);

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
        // No active subscription - will be marked as cancelled/free
        if (user.status !== 'free' && user.status !== 'cancelled') {
          cancelled.push({
            email: user.user_email || user.user_id,
            userId: user.user_id,
            currentStatus: user.status,
            newStatus: 'cancelled',
            currentPlan: user.plan_type,
            newPlan: 'free',
            stripeCustomerId: user.stripe_customer_id,
            issue: 'no_active_subscription',
            details: {
              message:
                'Had paid status in DB but no active subscription in Stripe',
            },
          });
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

      // Check if update needed
      const needsUpdate =
        user.status !== newStatus ||
        user.plan_type !== newPlanType ||
        user.stripe_subscription_id !== subscription.id;

      if (needsUpdate) {
        const affectedUser: AffectedUser = {
          email: user.user_email || user.user_id,
          userId: user.user_id,
          currentStatus: user.status,
          newStatus: newStatus,
          currentPlan: user.plan_type,
          newPlan: newPlanType,
          stripeCustomerId: user.stripe_customer_id,
          stripeSubscriptionId: subscription.id,
          issue: 'status_mismatch',
          details: {
            message:
              user.status === 'cancelled' || user.status === 'free'
                ? 'Paying customer marked as cancelled/free in database'
                : 'Status/plan mismatch between database and Stripe',
          },
        };

        usersToUpdate.push(affectedUser);

        if (active.length > 1) {
          multipleSubscriptions.push({
            ...affectedUser,
            issue: 'multiple_subscriptions',
            details: {
              subscriptionCount: active.length,
              subscriptions: active.map((s) => ({
                id: s.id,
                status: s.status,
                plan: s.metadata?.plan_id || 'unknown',
              })),
            },
          });
        }
      }
    } catch (error: any) {
      if (error?.code === 'resource_missing') {
        invalidCustomers.push({
          email: user.user_email || user.user_id,
          userId: user.user_id,
          currentStatus: user.status,
          currentPlan: user.plan_type,
          stripeCustomerId: user.stripe_customer_id,
          issue: 'invalid_customer_id',
          details: {
            message: 'Customer ID does not exist in Stripe',
            errorCode: error.code,
          },
        });
      }
    }
  }

  // Create output directory
  const outputDir = resolve(process.cwd(), 'scripts/output');
  try {
    const fs = require('fs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  } catch (e) {
    // Directory might already exist, continue
  }

  // Write individual files
  const timestamp = new Date().toISOString().split('T')[0];

  writeFileSync(
    resolve(outputDir, `users-to-update-${timestamp}.json`),
    JSON.stringify(usersToUpdate, null, 2),
  );

  writeFileSync(
    resolve(outputDir, `invalid-customers-${timestamp}.json`),
    JSON.stringify(invalidCustomers, null, 2),
  );

  writeFileSync(
    resolve(outputDir, `multiple-subscriptions-${timestamp}.json`),
    JSON.stringify(multipleSubscriptions, null, 2),
  );

  writeFileSync(
    resolve(outputDir, `cancelled-users-${timestamp}.json`),
    JSON.stringify(cancelled, null, 2),
  );

  // Create combined file with all categories
  const allAffected = {
    exportDate: new Date().toISOString(),
    summary: {
      totalAffected:
        usersToUpdate.length + invalidCustomers.length + cancelled.length,
      usersToUpdate: usersToUpdate.length,
      invalidCustomers: invalidCustomers.length,
      multipleSubscriptions: multipleSubscriptions.length,
      cancelled: cancelled.length,
    },
    categories: {
      usersToUpdate,
      invalidCustomers,
      multipleSubscriptions,
      cancelled,
    },
  };

  writeFileSync(
    resolve(outputDir, `all-affected-users-${timestamp}.json`),
    JSON.stringify(allAffected, null, 2),
  );

  // Create simple email list
  const allEmails = [
    ...usersToUpdate.map((u) => u.email),
    ...invalidCustomers.map((u) => u.email),
    ...cancelled.map((u) => u.email),
  ].filter((email, index, self) => self.indexOf(email) === index); // Remove duplicates

  writeFileSync(
    resolve(outputDir, `email-list-${timestamp}.json`),
    JSON.stringify(allEmails, null, 2),
  );

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Export Summary\n');
  console.log(
    `  ✏️  Users to update (cancelled/free -> active): ${usersToUpdate.length}`,
  );
  console.log(`  🗑️  Invalid customer IDs: ${invalidCustomers.length}`);
  console.log(`  ⚠️  Multiple subscriptions: ${multipleSubscriptions.length}`);
  console.log(`  ❌ Users being cancelled: ${cancelled.length}`);
  console.log(`  📧 Total unique emails: ${allEmails.length}\n`);

  console.log('📁 Files created in scripts/output/:');
  console.log(`  - users-to-update-${timestamp}.json`);
  console.log(`  - invalid-customers-${timestamp}.json`);
  console.log(`  - multiple-subscriptions-${timestamp}.json`);
  console.log(`  - cancelled-users-${timestamp}.json`);
  console.log(`  - all-affected-users-${timestamp}.json`);
  console.log(`  - email-list-${timestamp}.json (simple array of emails)\n`);

  console.log('✅ Export complete!\n');
}

main().catch(console.error);
