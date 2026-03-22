import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function main() {
  const products: Stripe.Product[] = [];
  for await (const p of stripe.products.list({ limit: 100, active: true })) {
    if (p.metadata?.slug) products.push(p);
  }
  const withImages = products.filter((p) => p.images?.length > 0);
  const without = products.filter((p) => !p.images?.length);
  console.log(`With images:    ${withImages.length}`);
  console.log(`Without images: ${without.length}`);
  if (without.length) {
    console.log('\nSample slugs without images:');
    without.slice(0, 10).forEach((p) => console.log(' •', p.metadata.slug));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
