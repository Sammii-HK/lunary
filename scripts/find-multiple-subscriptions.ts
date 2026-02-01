/**
 * Find users with multiple active subscriptions on the same customer
 *
 * This is different from duplicate customers - this finds cases where
 * one Stripe customer has 2+ active subscriptions (double-charged!)
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

async function main() {
  console.log('🔍 Finding customers with multiple active subscriptions...\n');

  const stripe = getStripe();
  const issues: any[] = [];

  // Get all customers from database
  const users = await sql`
    SELECT user_id, user_email, stripe_customer_id
    FROM subscriptions
    WHERE stripe_customer_id IS NOT NULL
  `;

  console.log(`Checking ${users.rows.length} customers...\n`);

  for (const user of users.rows) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        limit: 100,
      });

      const active = subscriptions.data.filter((s) =>
        ['active', 'trialing', 'past_due'].includes(s.status),
      );

      if (active.length > 1) {
        console.log(`⚠️  ${user.user_email || user.user_id}`);
        console.log(`   Customer: ${user.stripe_customer_id}`);
        console.log(`   Active subscriptions: ${active.length}\n`);

        for (const sub of active) {
          const price = sub.items.data[0]?.price;
          const amount = price?.unit_amount || 0;
          const interval = price?.recurring?.interval;
          const currency = price?.currency?.toUpperCase() || 'USD';
          const monthly = interval === 'year' ? amount / 12 : amount;
          const planType =
            sub.metadata?.plan_id || price?.metadata?.plan_id || 'unknown';

          console.log(`   📌 ${sub.id}`);
          console.log(`      Status: ${sub.status}`);
          console.log(`      Plan: ${planType}`);
          console.log(
            `      Price: ${currency} ${(amount / 100).toFixed(2)}/${interval}`,
          );
          console.log(
            `      Monthly: ${currency} ${(monthly / 100).toFixed(2)}`,
          );
          console.log(
            `      Created: ${new Date(sub.created * 1000).toLocaleDateString()}\n`,
          );
        }

        issues.push({
          email: user.user_email,
          userId: user.user_id,
          customerId: user.stripe_customer_id,
          subscriptions: active.map((s) => ({
            id: s.id,
            status: s.status,
            planType: s.metadata?.plan_id || 'unknown',
            amount: s.items.data[0]?.price?.unit_amount || 0,
          })),
        });
      }
    } catch (error) {
      console.error(`Error checking ${user.user_email}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(
    `\n📊 Summary: Found ${issues.length} customers with multiple active subscriptions\n`,
  );

  if (issues.length > 0) {
    console.log('⚠️  These customers are being charged multiple times!');
    console.log(
      '   You should cancel the duplicate subscriptions in Stripe dashboard.\n',
    );

    const totalDuplicates = issues.reduce(
      (sum, i) => sum + (i.subscriptions.length - 1),
      0,
    );
    console.log(
      `   Total duplicate subscriptions to cancel: ${totalDuplicates}\n`,
    );
  } else {
    console.log('✅ No customers with multiple active subscriptions found!\n');
  }
}

main().catch(console.error);
