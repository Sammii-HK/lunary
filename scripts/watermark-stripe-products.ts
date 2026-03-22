/**
 * Watermark Stripe Products Script
 *
 * Fetches all active Stripe shop products (those with a `slug` in metadata)
 * and updates their metadata to include a `copyright` field as plain-text
 * proof of ownership visible in the Stripe dashboard.
 *
 * Usage:
 *   npx tsx scripts/watermark-stripe-products.ts          # dry run
 *   npx tsx scripts/watermark-stripe-products.ts --apply  # actually updates Stripe
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const COPYRIGHT = '© Lunar Computing, Inc 2026 — lunary.app';
const APPLY = process.argv.includes('--apply');

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key);
}

async function fetchAllActiveShopProducts(
  stripe: Stripe,
): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  for await (const product of stripe.products.list({
    limit: 100,
    active: true,
  })) {
    if (product.metadata?.slug) {
      products.push(product);
    }
  }
  return products;
}

async function main() {
  const stripe = getStripe();

  console.log('\nFetching active Stripe shop products...\n');

  const products = await fetchAllActiveShopProducts(stripe);

  // Only products that need updating (copyright missing or different)
  const toUpdate = products.filter((p) => p.metadata?.copyright !== COPYRIGHT);

  const alreadyDone = products.length - toUpdate.length;

  if (alreadyDone > 0) {
    console.log(
      `${alreadyDone} product(s) already have the correct copyright — skipping.\n`,
    );
  }

  if (toUpdate.length === 0) {
    console.log('All shop products are already watermarked. Nothing to do.');
    return;
  }

  if (!APPLY) {
    // Dry run
    for (const product of toUpdate) {
      const slug = product.metadata.slug;
      console.log(`[dry-run] Would update: ${slug} → copyright: ${COPYRIGHT}`);
    }
    console.log(`\nTotal: ${toUpdate.length} product(s) would be updated`);
    console.log('\nRun with --apply to make the changes.');
    return;
  }

  // Apply mode
  let updated = 0;
  let failed = 0;

  for (const product of toUpdate) {
    const slug = product.metadata.slug;
    try {
      await stripe.products.update(product.id, {
        metadata: {
          ...product.metadata,
          copyright: COPYRIGHT,
        },
      });
      console.log(`Updated: ${slug} (${product.id})`);
      updated++;
    } catch (error) {
      console.error(
        `Failed: ${slug} (${product.id}) — ${error instanceof Error ? error.message : error}`,
      );
      failed++;
    }
  }

  console.log(`\nDone. ${updated} updated, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
