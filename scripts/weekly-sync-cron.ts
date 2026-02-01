/**
 * Weekly Subscription Sync with Discord Notifications
 *
 * This script:
 * 1. Syncs database with Stripe
 * 2. Sends Discord notification with results
 *
 * Required env vars:
 * - STRIPE_SECRET_KEY (in .env.local)
 * - DISCORD_WEBHOOK_URL (in .env.local)
 *
 * Run with: npx ts-node scripts/weekly-sync-cron.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface SyncStats {
  updated: number;
  cancelled: number;
  invalidCustomers: number;
  noChange: number;
  errors: number;
  total: number;
}

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

async function sendDiscordNotification(
  success: boolean,
  stats: SyncStats,
  error?: string,
) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('⚠️  DISCORD_WEBHOOK_URL not set, skipping notification');
    return;
  }

  const timestamp = new Date().toISOString();

  let embed;

  if (success) {
    embed = {
      title: '✅ Weekly Subscription Sync Complete',
      color: 0x00ff00, // Green
      fields: [
        { name: '📝 Updated', value: stats.updated.toString(), inline: true },
        {
          name: '❌ Cancelled',
          value: stats.cancelled.toString(),
          inline: true,
        },
        {
          name: '🗑️ Invalid Customers',
          value: stats.invalidCustomers.toString(),
          inline: true,
        },
        {
          name: '✅ No Change',
          value: stats.noChange.toString(),
          inline: true,
        },
        { name: '⚠️ Errors', value: stats.errors.toString(), inline: true },
        {
          name: '📊 Total Processed',
          value: stats.total.toString(),
          inline: true,
        },
      ],
      footer: { text: `Sync completed at ${timestamp}` },
    };
  } else {
    embed = {
      title: '❌ Weekly Subscription Sync Failed',
      color: 0xff0000, // Red
      description: `\`\`\`${error}\`\`\``,
      footer: { text: `Failed at ${timestamp}` },
    };
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error(
        'Failed to send Discord notification:',
        await response.text(),
      );
    } else {
      console.log('✅ Discord notification sent');
    }
  } catch (err) {
    console.error('Error sending Discord notification:', err);
  }
}

export async function runSync(): Promise<SyncStats> {
  const stripe = getStripe();

  const stats: SyncStats = {
    updated: 0,
    cancelled: 0,
    invalidCustomers: 0,
    noChange: 0,
    errors: 0,
    total: 0,
  };

  // Get all users with customer IDs
  const users = await sql`
    SELECT user_id, user_email, stripe_customer_id, stripe_subscription_id, status, plan_type
    FROM subscriptions
    WHERE stripe_customer_id IS NOT NULL
    ORDER BY user_email
  `;

  stats.total = users.rows.length;
  console.log(`Syncing ${stats.total} users...\n`);

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
          console.log(
            `❌ ${user.user_email || user.user_id} - marking as cancelled`,
          );

          await sql`
            UPDATE subscriptions
            SET status = 'cancelled',
                plan_type = 'free',
                stripe_subscription_id = NULL,
                updated_at = NOW()
            WHERE user_id = ${user.user_id}
          `;

          stats.cancelled++;
        } else {
          stats.noChange++;
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
        console.log(
          `✏️  ${user.user_email || user.user_id} - updating to ${newStatus}`,
        );

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

        stats.updated++;
      } else {
        stats.noChange++;
      }
    } catch (error: any) {
      if (error?.code === 'resource_missing') {
        console.log(
          `❌ ${user.user_email || user.user_id} - invalid customer ID`,
        );

        await sql`
          UPDATE subscriptions
          SET stripe_customer_id = NULL,
              stripe_subscription_id = NULL,
              status = 'free',
              plan_type = 'free',
              updated_at = NOW()
          WHERE user_id = ${user.user_id}
        `;

        stats.invalidCustomers++;
      } else {
        console.error(`Error checking ${user.user_email}:`, error.message);
        stats.errors++;
      }
    }
  }

  return stats;
}

async function main() {
  console.log('🔄 Weekly Subscription Sync Starting...\n');
  console.log(`Time: ${new Date().toISOString()}\n`);

  try {
    const stats = await runSync();

    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary\n');
    console.log(`  ✏️  Updated: ${stats.updated}`);
    console.log(`  ❌ Cancelled: ${stats.cancelled}`);
    console.log(`  🗑️  Invalid customers: ${stats.invalidCustomers}`);
    console.log(`  ✅ No change: ${stats.noChange}`);
    console.log(`  ⚠️  Errors: ${stats.errors}`);
    console.log(`  📝 Total: ${stats.total}\n`);

    await sendDiscordNotification(true, stats);

    console.log('✅ Weekly sync complete!\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Sync failed:', error);

    await sendDiscordNotification(
      false,
      {
        updated: 0,
        cancelled: 0,
        invalidCustomers: 0,
        noChange: 0,
        errors: 0,
        total: 0,
      },
      error.message || error.toString(),
    );

    process.exit(1);
  }
}

main();
