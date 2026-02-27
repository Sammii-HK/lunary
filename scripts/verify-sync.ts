import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function countStripe(status: string) {
  let count = 0;
  let after: string | undefined;
  while (true) {
    const page = await (stripe.subscriptions.list as any)({
      status,
      limit: 100,
      starting_after: after,
    });
    count += page.data.length;
    if (page.has_more === false) break;
    after = page.data[page.data.length - 1].id;
  }
  return count;
}

async function main() {
  const [sActive, sTrialing, sPastDue] = await Promise.all([
    countStripe('active'),
    countStripe('trialing'),
    countStripe('past_due'),
  ]);

  const db = await sql.query(`
    SELECT status, COUNT(*) as count FROM subscriptions
    WHERE user_email NOT LIKE '%test.lunary.app%' AND user_email != 'hello@lunary.app'
    GROUP BY status ORDER BY count DESC
  `);

  console.log('STRIPE:');
  console.log('  active:   ', sActive);
  console.log('  trialing: ', sTrialing);
  console.log('  past_due: ', sPastDue);
  console.log('  TOTAL:    ', sActive + sTrialing + sPastDue);
  console.log('\nDB:');
  db.rows.forEach((r: any) =>
    console.log('  ' + (r.status + ':').padEnd(14), r.count),
  );
  const dbPaid = db.rows
    .filter((r: any) => ['active', 'trial', 'past_due'].includes(r.status))
    .reduce((s: number, r: any) => s + Number(r.count), 0);
  console.log('  TOTAL (active+trial+past_due):', dbPaid);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
