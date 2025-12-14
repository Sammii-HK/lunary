/**
 * Bulk Stripe Sync Script
 *
 * This script syncs all shop products to Stripe using the existing
 * generate-and-sync API endpoint. It handles rate limiting and
 * reports success/failure for each product.
 *
 * Usage:
 *   pnpm tsx scripts/sync-shop-to-stripe.ts
 *   pnpm tsx scripts/sync-shop-to-stripe.ts --dry-run
 */

import { getAllProducts } from '../src/lib/shop/generators';
import { ShopProduct } from '../src/lib/shop/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const DRY_RUN = process.argv.includes('--dry-run');
const RATE_LIMIT_DELAY = 500; // 500ms between requests to avoid Stripe rate limits

interface SyncResult {
  product: ShopProduct;
  success: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  error?: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncProductToStripe(product: ShopProduct): Promise<SyncResult> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/shop/packs/generate-and-sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: product.category,
          name: product.title,
          slug: product.slug,
          description: product.description,
          tagline: product.tagline,
          price: product.price,
          whatInside: product.whatInside,
          perfectFor: product.perfectFor,
          tags: product.tags,
          dryRun: DRY_RUN,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        product,
        success: false,
        error: data.error || data.message || 'Unknown error',
      };
    }

    return {
      product,
      success: true,
      stripeProductId: data.stripe?.productId,
      stripePriceId: data.stripe?.priceId,
    };
  } catch (error) {
    return {
      product,
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

async function main() {
  console.log('\\n🛍️  Lunary Shop → Stripe Sync Script');
  console.log('=====================================\\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No products will be created in Stripe\\n');
  }

  const products = getAllProducts();
  console.log(`📦 Found ${products.length} products to sync\\n`);

  const results: SyncResult[] = [];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progress = `[${i + 1}/${products.length}]`;

    process.stdout.write(`${progress} Syncing "${product.title}"... `);

    const result = await syncProductToStripe(product);
    results.push(result);

    if (result.success) {
      successCount++;
      if (DRY_RUN) {
        console.log('✅ Would create');
      } else {
        console.log(`✅ Created (${result.stripeProductId})`);
      }
    } else if (result.error?.includes('already exists')) {
      skipCount++;
      console.log('⏭️  Already exists');
    } else {
      failCount++;
      console.log(`❌ Failed: ${result.error}`);
    }

    // Rate limiting - wait between requests
    if (i < products.length - 1) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  // Summary
  console.log('\\n=====================================');
  console.log('📊 Sync Summary');
  console.log('=====================================');
  console.log(`✅ Successfully synced: ${successCount}`);
  console.log(`⏭️  Already existed:    ${skipCount}`);
  console.log(`❌ Failed:              ${failCount}`);
  console.log(`📦 Total products:      ${products.length}`);

  if (failCount > 0) {
    console.log('\\n❌ Failed products:');
    results
      .filter((r) => !r.success && !r.error?.includes('already exists'))
      .forEach((r) => {
        console.log(`   - ${r.product.title}: ${r.error}`);
      });
  }

  console.log('\\n✨ Done!\\n');

  // Exit with error code if any failures
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
