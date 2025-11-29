import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { writeFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const OLD_STRIPE_KEY =
  process.env.OLD_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!OLD_STRIPE_KEY) {
  console.error(
    '❌ OLD_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY environment variable not found',
  );
  console.error('   Set OLD_STRIPE_SECRET_KEY to export from old account');
  console.error(
    '   Or set STRIPE_SECRET_KEY if you want to export from current account',
  );
  process.exit(1);
}

const stripe = new Stripe(OLD_STRIPE_KEY, {
  apiVersion: '2024-11-20.acacia',
});

interface ExportedProduct {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  active: boolean;
  metadata: Record<string, string>;
  created: number;
  prices: ExportedPrice[];
}

interface ExportedPrice {
  id: string;
  unit_amount: number | null;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
    trial_period_days?: number;
  } | null;
  type: 'one_time' | 'recurring';
  metadata: Record<string, string>;
  active: boolean;
}

interface ExportData {
  exportedAt: string;
  account: string;
  subscriptionPlans: ExportedProduct[];
  shopProducts: ExportedProduct[];
}

async function exportAllProducts(): Promise<ExportData> {
  console.log('🔍 Fetching all products from Stripe...\n');

  const allProducts: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const products = await stripe.products.list({
      limit: 100,
      starting_after: startingAfter,
    });

    allProducts.push(...products.data);
    hasMore = products.has_more;
    if (products.data.length > 0) {
      startingAfter = products.data[products.data.length - 1].id;
    }
  }

  console.log(`✅ Found ${allProducts.length} total products\n`);

  const subscriptionPlans: ExportedProduct[] = [];
  const shopProducts: ExportedProduct[] = [];

  for (const product of allProducts) {
    console.log(`📦 Processing: ${product.name} (${product.id})`);

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });

    const exportedPrices: ExportedPrice[] = prices.data.map((price) => ({
      id: price.id,
      unit_amount: price.unit_amount,
      currency: price.currency,
      recurring: price.recurring
        ? {
            interval: price.recurring.interval,
            interval_count: price.recurring.interval_count,
            trial_period_days: price.recurring.trial_period_days || undefined,
          }
        : null,
      type: price.type,
      metadata: price.metadata,
      active: price.active,
    }));

    const exportedProduct: ExportedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      active: product.active,
      metadata: product.metadata,
      created: product.created,
      prices: exportedPrices,
    };

    const isSubscriptionPlan =
      product.metadata?.plan_id ||
      product.metadata?.plan_name ||
      (exportedPrices.some((p) => p.recurring !== null) &&
        !product.metadata?.grimoireType);

    if (isSubscriptionPlan) {
      subscriptionPlans.push(exportedProduct);
      console.log(`   ✅ Subscription plan (${exportedPrices.length} prices)`);
    } else {
      shopProducts.push(exportedProduct);
      console.log(`   ✅ Shop product (${exportedPrices.length} prices)`);
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    account: 'old',
    subscriptionPlans,
    shopProducts,
  };
}

async function main() {
  try {
    console.log('🚀 Exporting products from Stripe account...\n');
    console.log('='.repeat(60) + '\n');

    const exportData = await exportAllProducts();

    const outputPath = resolve(
      process.cwd(),
      'scripts/migrate-stripe/exported-products.json',
    );
    writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(60));
    console.log('📊 Export Summary\n');
    console.log(
      `✅ Subscription Plans: ${exportData.subscriptionPlans.length}`,
    );
    console.log(`✅ Shop Products: ${exportData.shopProducts.length}`);
    console.log(`\n📝 Export saved to: ${outputPath}`);

    console.log('\n📋 Subscription Plans:');
    for (const plan of exportData.subscriptionPlans) {
      console.log(`   - ${plan.name} (${plan.id})`);
      console.log(`     Prices: ${plan.prices.length}`);
    }

    console.log('\n🛍️  Shop Products:');
    for (const product of exportData.shopProducts) {
      console.log(`   - ${product.name} (${product.id})`);
      console.log(`     Prices: ${product.prices.length}`);
    }

    console.log('\n✅ Export completed successfully!');
    console.log(
      '\nNext step: Run import-products.ts with your NEW Stripe account keys',
    );
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
