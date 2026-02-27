import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  let startingAfter: string | undefined;
  const results: Array<{ email: string; amount: number; discounts: string[] }> =
    [];

  while (true) {
    const page = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.discounts', 'data.customer'],
      starting_after: startingAfter,
    });

    for (const sub of page.data) {
      const hasNAF = sub.discounts?.some(
        (d) => typeof d === 'object' && (d as any)?.coupon?.id === 'NAF4vfYU',
      );
      if (!hasNAF) {
        const customer = sub.customer as Stripe.Customer;
        const email = customer.email || customer.id;
        const amount = sub.items.data[0]?.price?.unit_amount ?? 0;
        const discounts = (sub.discounts || []).map((d) => {
          if (typeof d === 'string') return d;
          const disc = d as Stripe.Discount;
          return `${disc.coupon?.id} ${disc.coupon?.percent_off ?? disc.coupon?.amount_off}% ${disc.coupon?.duration}`;
        });
        results.push({ email, amount, discounts });
      }
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1].id;
  }

  console.log(`${results.length} active subs without NAF4vfYU:\n`);
  for (const r of results) {
    console.log(
      `${r.email}  £${(r.amount / 100).toFixed(2)}  discounts: ${JSON.stringify(r.discounts)}`,
    );
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
