import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function main() {
  // Load all DB sub IDs and emails
  const dbRows = await sql.query(
    `SELECT stripe_subscription_id, user_email FROM subscriptions`,
  );
  const dbSubIds = new Set(
    dbRows.rows.map((r: any) => r.stripe_subscription_id).filter(Boolean),
  );
  const dbEmails = new Set(
    dbRows.rows.map((r: any) => r.user_email?.toLowerCase()).filter(Boolean),
  );

  // Also load all user emails
  const userRows = await sql.query(`SELECT email FROM "user"`);
  const userEmails = new Set(
    userRows.rows.map((r: any) => r.email?.toLowerCase()).filter(Boolean),
  );

  const missing: Array<{
    email: string;
    subId: string;
    customerId: string;
    amount: number;
    created: string;
  }> = [];

  let after: string | undefined;
  while (true) {
    const page = await (stripe.subscriptions.list as any)({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
      starting_after: after,
    });

    for (const sub of page.data) {
      const customer = sub.customer as Stripe.Customer;
      const email = customer.email?.toLowerCase();
      const inDbBySub = dbSubIds.has(sub.id);
      const inDbByEmail = email && dbEmails.has(email);
      const inUserByEmail = email && userEmails.has(email);

      if (!inDbBySub && !inDbByEmail) {
        missing.push({
          email: customer.email || '(no email)',
          subId: sub.id,
          customerId: customer.id,
          amount: sub.items.data[0]?.price?.unit_amount ?? 0,
          created: new Date(sub.created * 1000).toISOString().split('T')[0],
          hasUserAccount: inUserByEmail ? 'YES' : 'no',
        } as any);
      }
    }

    if (page.has_more === false) break;
    after = page.data[page.data.length - 1].id;
  }

  console.log(`${missing.length} active Stripe subs with no DB row:\n`);
  for (const m of missing) {
    console.log(`${(m as any).created}  ${m.email}`);
    console.log(
      `  sub: ${m.subId}  cus: ${m.customerId}  £${(m.amount / 100).toFixed(2)}/mo  user_account: ${(m as any).hasUserAccount}`,
    );
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
