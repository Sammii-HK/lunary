/**
 * Read-only audit: identify Stripe subscriptions not correctly reflected in DB.
 *
 * Produces:
 *   List A — Active in Stripe but missing from DB entirely
 *   List B — Active in Stripe but DB row has wrong status (not active / trial)
 *   List C — Any Stripe sub with coupon matching STARSALIGN
 *
 * Hard-excluded from all output: anselm.eickhoff@gmail.com / Anselm Eickhoff
 *
 * Run: npx tsx scripts/audit-stripe-subscriptions.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

// Hard exclude — never appear in any list or receive any emails
const EXCLUDED_EMAILS = new Set(['anselm.eickhoff@gmail.com']);
const EXCLUDED_NAMES = ['anselm eickhoff'];

function isExcluded(email: string | null, name?: string | null): boolean {
  if (email && EXCLUDED_EMAILS.has(email.toLowerCase())) return true;
  if (name && EXCLUDED_NAMES.some((n) => name.toLowerCase().includes(n)))
    return true;
  return false;
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function main() {
  const stripe = getStripe();

  console.log('🔍 Fetching DB subscriptions...');
  const dbRows = await sql`
    SELECT user_id, user_email, stripe_subscription_id, stripe_customer_id, status
    FROM subscriptions
  `;

  const dbBySubId = new Map<string, (typeof dbRows.rows)[0]>();
  const dbByEmail = new Map<string, (typeof dbRows.rows)[0]>();

  for (const row of dbRows.rows) {
    if (row.stripe_subscription_id) {
      dbBySubId.set(row.stripe_subscription_id, row);
    }
    if (row.user_email) {
      dbByEmail.set(row.user_email.toLowerCase(), row);
    }
  }

  console.log(`  DB rows loaded: ${dbRows.rows.length}`);

  const listA: Array<{ email: string; subId: string; customerId: string }> = [];
  const listB: Array<{
    email: string;
    subId: string;
    dbStatus: string;
    stripeStatus: string;
  }> = [];
  const listC: Array<{
    email: string;
    subId: string;
    couponId: string;
    promoCode: string | null;
  }> = [];

  console.log('\n🔍 Paginating Stripe active/trialing/past_due subs...');

  for (const stripeStatus of ['active', 'trialing', 'past_due'] as const) {
    let startingAfter: string | undefined;

    while (true) {
      const page = await stripe.subscriptions.list({
        status: stripeStatus,
        limit: 100,
        expand: ['data.discounts', 'data.customer'],
        starting_after: startingAfter,
      });

      if (page.data.length === 0) break;

      for (const sub of page.data) {
        const customer =
          typeof sub.customer === 'string'
            ? null
            : (sub.customer as Stripe.Customer);
        const email = customer?.email ?? null;
        const name = customer?.name ?? null;

        if (isExcluded(email, name)) continue;

        // Check STARSALIGN
        const discounts = sub.discounts || [];
        for (const d of discounts) {
          if (typeof d === 'string') continue;
          const couponId = d?.coupon?.id || '';
          const promoCodeRaw =
            sub.metadata?.promoCode || sub.metadata?.discountCode || null;
          if (
            couponId.toUpperCase().includes('STARSALIGN') ||
            (promoCodeRaw && promoCodeRaw.toUpperCase().includes('STARSALIGN'))
          ) {
            if (email) {
              listC.push({
                email,
                subId: sub.id,
                couponId,
                promoCode: promoCodeRaw ?? null,
              });
            }
          }
        }

        const dbRow =
          dbBySubId.get(sub.id) ??
          (email ? dbByEmail.get(email.toLowerCase()) : null);

        if (!dbRow) {
          // List A: completely missing from DB
          if (email) {
            listA.push({
              email,
              subId: sub.id,
              customerId:
                typeof sub.customer === 'string'
                  ? sub.customer
                  : sub.customer.id,
            });
          }
        } else {
          // List B: wrong status in DB
          const dbStatus = dbRow.status;
          if (dbStatus !== 'active' && dbStatus !== 'trial') {
            listB.push({
              email: email || dbRow.user_email || '(unknown)',
              subId: sub.id,
              dbStatus,
              stripeStatus: sub.status,
            });
          }
        }
      }

      if (!page.has_more) break;
      startingAfter = page.data[page.data.length - 1].id;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(
    `\n📋 LIST A — Active in Stripe, MISSING from DB (${listA.length}):`,
  );
  if (listA.length === 0) {
    console.log('  (none)');
  } else {
    for (const item of listA) {
      console.log(
        `  ${item.email}  [sub: ${item.subId}]  [cus: ${item.customerId}]`,
      );
    }
  }

  console.log(
    `\n📋 LIST B — Active in Stripe, WRONG status in DB (${listB.length}):`,
  );
  if (listB.length === 0) {
    console.log('  (none)');
  } else {
    for (const item of listB) {
      console.log(
        `  ${item.email}  [sub: ${item.subId}]  DB: ${item.dbStatus} → Stripe: ${item.stripeStatus}`,
      );
    }
  }

  console.log(`\n📋 LIST C — STARSALIGN coupon users (${listC.length}):`);
  if (listC.length === 0) {
    console.log('  (none)');
  } else {
    for (const item of listC) {
      console.log(
        `  ${item.email}  [sub: ${item.subId}]  coupon: ${item.couponId}  promo: ${item.promoCode || '-'}`,
      );
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Audit complete. No writes were made.');
}

main().catch((error) => {
  console.error('Audit failed:', error);
  process.exit(1);
});
