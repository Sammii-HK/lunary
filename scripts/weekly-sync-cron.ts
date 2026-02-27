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

// Load environment variables from .env.local (only for CLI execution)
import { config } from 'dotenv';
import { resolve } from 'path';

// Only load dotenv when running as CLI script
if (
  process.argv[1]?.includes('weekly-sync-cron') ||
  process.argv[1]?.includes('ts-node')
) {
  config({ path: resolve(process.cwd(), '.env.local') });
}

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Hard-excluded accounts — never receive access grants or emails
const EXCLUDED_EMAILS = new Set(['anselm.eickhoff@gmail.com']);
const EXCLUDED_NAMES = ['anselm eickhoff'];

function isExcluded(email: string | null, name?: string | null): boolean {
  if (email && EXCLUDED_EMAILS.has(email.toLowerCase())) return true;
  if (name && EXCLUDED_NAMES.some((n) => name.toLowerCase().includes(n)))
    return true;
  return false;
}

interface SyncStats {
  updated: number;
  cancelled: number;
  invalidCustomers: number;
  noChange: number;
  errors: number;
  total: number;
}

export interface StripeFirstPassStats {
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  unresolved: number;
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

// ---------------------------------------------------------------------------
// Stripe-first pass — catches subscriptions with no DB row at all
// ---------------------------------------------------------------------------

function mapStripePlanType(subscription: Stripe.Subscription): string {
  if (subscription.metadata?.plan_id) return subscription.metadata.plan_id;
  const price = subscription.items.data[0]?.price;
  if (price?.metadata?.plan_id) return price.metadata.plan_id;
  const interval = price?.recurring?.interval;
  if (interval === 'year') return 'lunary_plus_ai_annual';
  if (interval === 'month') return 'lunary_plus';
  return 'free';
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

const STRIPE_STATUS_RANK: Record<string, number> = {
  active: 1,
  trialing: 2,
  past_due: 3,
};

interface StripeCandidate {
  sub: Stripe.Subscription;
  customer: Stripe.Customer;
  monthlyAmount: number;
}

function pickBestStripeCandidate(
  candidates: StripeCandidate[],
): StripeCandidate {
  return candidates.slice().sort((a, b) => {
    const rankA = STRIPE_STATUS_RANK[a.sub.status] ?? 99;
    const rankB = STRIPE_STATUS_RANK[b.sub.status] ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    if (a.monthlyAmount !== b.monthlyAmount)
      return b.monthlyAmount - a.monthlyAmount;
    return (b.sub.created ?? 0) - (a.sub.created ?? 0);
  })[0];
}

function extractCouponId(subscription: Stripe.Subscription): string | null {
  const discounts = (subscription as any).discounts || [];
  const discount = discounts[0];
  if (discount && typeof discount !== 'string' && discount?.coupon) {
    return discount.coupon.id || null;
  }
  return null;
}

function hasDiscount(subscription: Stripe.Subscription): boolean {
  const discounts = (subscription as any).discounts || [];
  const discount = discounts[0];
  return !!(discount && typeof discount !== 'string' && discount?.coupon);
}

async function resolveUserIdForStripeFirst(
  stripe: Stripe,
  customer: Stripe.Customer,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const metaUserId =
    subscription.metadata?.userId ||
    (customer.metadata as Record<string, string> | undefined)?.userId;
  if (metaUserId) return metaUserId;

  try {
    const r = await sql`
      SELECT user_id FROM subscriptions
      WHERE stripe_subscription_id = ${subscription.id} LIMIT 1
    `;
    if (r.rows[0]?.user_id) return r.rows[0].user_id;
  } catch {}

  try {
    const r = await sql`
      SELECT user_id FROM subscriptions
      WHERE stripe_customer_id = ${customer.id} LIMIT 1
    `;
    if (r.rows[0]?.user_id) return r.rows[0].user_id;
  } catch {}

  if (customer.email) {
    try {
      const r = await sql`
        SELECT user_id FROM subscriptions
        WHERE LOWER(user_email) = LOWER(${customer.email}) LIMIT 1
      `;
      if (r.rows[0]?.user_id) return r.rows[0].user_id;
    } catch {}

    try {
      const r = await sql`
        SELECT id FROM "user"
        WHERE LOWER(email) = LOWER(${customer.email}) LIMIT 1
      `;
      if (r.rows[0]?.id) return r.rows[0].id as string;
    } catch {}
  }

  return null;
}

/**
 * Stripe-first pass: pages through all active/trialing/past_due Stripe
 * subscriptions and upserts any DB row that is missing or has stale status.
 * This closes the gap left by `runSync` which only processes DB rows that
 * already have a stripe_customer_id.
 */
export async function runStripeFirstPass(): Promise<StripeFirstPassStats> {
  const stripe = getStripe();
  const stats: StripeFirstPassStats = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    unresolved: 0,
  };

  // Pass 1: collect all active/trialing/past_due candidates per user
  const candidatesByUser = new Map<string, StripeCandidate[]>();

  for (const stripeStatus of ['active', 'trialing', 'past_due'] as const) {
    let startingAfter: string | undefined;

    while (true) {
      const page = await stripe.subscriptions.list({
        status: stripeStatus,
        limit: 100,
        expand: ['data.discounts'],
        starting_after: startingAfter,
      });

      if (page.data.length === 0) break;

      for (const sub of page.data) {
        stats.processed += 1;

        const customerId =
          typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        let customer: Stripe.Customer | null = null;
        try {
          const fetched = await stripe.customers.retrieve(customerId);
          if (!('deleted' in fetched)) customer = fetched;
        } catch {}

        if (!customer) {
          stats.unresolved += 1;
          continue;
        }

        const email = customer.email;
        const name = customer.name;
        if (isExcluded(email ?? null, name ?? null)) {
          stats.skipped += 1;
          continue;
        }

        const userId = await resolveUserIdForStripeFirst(stripe, customer, sub);
        if (!userId) {
          stats.unresolved += 1;
          console.warn(`⚠️  Cannot resolve userId for ${email || customerId}`);
          continue;
        }

        const monthlyAmount = extractMonthlyAmount(sub);
        const existing = candidatesByUser.get(userId) ?? [];
        existing.push({ sub, customer, monthlyAmount });
        candidatesByUser.set(userId, existing);
      }

      if (!page.has_more) break;
      startingAfter = page.data[page.data.length - 1].id;
    }
  }

  // Warn about users with multiple active subs
  for (const [userId, candidates] of candidatesByUser) {
    if (candidates.length > 1) {
      const ids = candidates.map((c) => c.sub.id).join(', ');
      console.warn(
        `⚠️  Multiple active subs for ${userId}: [${ids}] — picking best`,
      );
    }
  }

  // Pass 2: for each user, pick best candidate and upsert if needed
  for (const [userId, candidates] of candidatesByUser) {
    const { sub, customer } = pickBestStripeCandidate(candidates);
    const email = customer.email;

    // Check current DB row
    const existing = await sql`
      SELECT status, stripe_subscription_id FROM subscriptions
      WHERE user_id = ${userId} LIMIT 1
    `;
    const dbRow = existing.rows[0];
    const newStatus = mapStripeStatus(sub.status);
    const newPlanType = mapStripePlanType(sub);
    const trialEndsAt = sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null;
    const currentPeriodEnd = (sub as any).current_period_end
      ? new Date((sub as any).current_period_end * 1000).toISOString()
      : null;
    const monthlyAmount = extractMonthlyAmount(sub);
    const couponId = extractCouponId(sub);
    const hasDisc = hasDiscount(sub);

    const isNew = !dbRow;
    const isStale =
      dbRow &&
      (dbRow.status !== newStatus || dbRow.stripe_subscription_id !== sub.id);

    if (!isNew && !isStale) {
      stats.skipped += 1;
      continue;
    }

    try {
      await sql`
        INSERT INTO subscriptions (
          user_id, user_email, status, plan_type,
          stripe_customer_id, stripe_subscription_id,
          trial_ends_at, current_period_end,
          has_discount, monthly_amount_due, coupon_id
        ) VALUES (
          ${userId}, ${email}, ${newStatus}, ${newPlanType},
          ${customer.id}, ${sub.id},
          ${trialEndsAt}, ${currentPeriodEnd},
          ${hasDisc}, ${monthlyAmount || null}, ${couponId}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          status = EXCLUDED.status,
          plan_type = EXCLUDED.plan_type,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          trial_ends_at = EXCLUDED.trial_ends_at,
          current_period_end = EXCLUDED.current_period_end,
          has_discount = EXCLUDED.has_discount,
          monthly_amount_due = EXCLUDED.monthly_amount_due,
          coupon_id = EXCLUDED.coupon_id,
          user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
          updated_at = NOW()
      `;

      await sql`
        INSERT INTO user_profiles (user_id, stripe_customer_id)
        VALUES (${userId}, ${customer.id})
        ON CONFLICT (user_id) DO UPDATE SET
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          updated_at = NOW()
      `;

      if (isNew) {
        stats.created += 1;
        console.log(`✅ Created DB row for ${email || userId}`);
      } else {
        stats.updated += 1;
        console.log(
          `✏️  Updated ${email || userId} (was ${dbRow?.status} → ${newStatus})`,
        );
      }
    } catch (err: any) {
      console.error(`Error upserting ${email}:`, err.message);
      stats.unresolved += 1;
    }
  }

  return stats;
}

async function main() {
  console.log('🔄 Weekly Subscription Sync Starting...\n');
  console.log(`Time: ${new Date().toISOString()}\n`);

  try {
    const stats = await runSync();

    console.log('\n🔄 Running Stripe-first pass to catch missing DB rows...\n');
    const stripePassStats = await runStripeFirstPass();

    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary\n');
    console.log(`  ✏️  Updated: ${stats.updated}`);
    console.log(`  ❌ Cancelled: ${stats.cancelled}`);
    console.log(`  🗑️  Invalid customers: ${stats.invalidCustomers}`);
    console.log(`  ✅ No change: ${stats.noChange}`);
    console.log(`  ⚠️  Errors: ${stats.errors}`);
    console.log(`  📝 Total: ${stats.total}`);
    console.log('\n📊 Stripe-first pass\n');
    console.log(`  ➕ Created: ${stripePassStats.created}`);
    console.log(`  ✏️  Updated: ${stripePassStats.updated}`);
    console.log(`  ⏭️  Skipped: ${stripePassStats.skipped}`);
    console.log(`  ❓ Unresolved: ${stripePassStats.unresolved}`);
    console.log(`  📝 Processed: ${stripePassStats.processed}\n`);

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

// Only run if executed directly as a script (not when imported)
if (
  process.argv[1]?.includes('weekly-sync-cron') ||
  process.argv[1]?.includes('ts-node')
) {
  main();
}
