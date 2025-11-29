import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { readFileSync, writeFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const NEW_STRIPE_KEY =
  process.env.NEW_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!NEW_STRIPE_KEY) {
  console.error(
    '❌ NEW_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY environment variable not found',
  );
  console.error('   Set NEW_STRIPE_SECRET_KEY to import to new account');
  console.error(
    '   Or set STRIPE_SECRET_KEY if you want to import to current account',
  );
  process.exit(1);
}

const stripe = new Stripe(NEW_STRIPE_KEY, {
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

interface IdMapping {
  products: Record<string, string>;
  prices: Record<string, string>;
}

async function importProduct(
  exportedProduct: ExportedProduct,
  idMapping: IdMapping,
  dryRun: boolean,
): Promise<{ productId: string; priceIds: string[] }> {
  console.log(`\n📦 Importing: ${exportedProduct.name}`);

  if (dryRun) {
    console.log(`   [DRY RUN] Would create product: ${exportedProduct.name}`);
    console.log(
      `   [DRY RUN] Would create ${exportedProduct.prices.length} prices`,
    );
    return { productId: 'dry-run', priceIds: [] };
  }

  const product = await stripe.products.create({
    name: exportedProduct.name,
    description: exportedProduct.description || undefined,
    images: exportedProduct.images,
    active: exportedProduct.active,
    metadata: exportedProduct.metadata,
  });

  console.log(`   ✅ Created product: ${product.id}`);
  idMapping.products[exportedProduct.id] = product.id;

  const priceIds: string[] = [];

  for (const exportedPrice of exportedProduct.prices) {
    const priceParams: Stripe.PriceCreateParams = {
      product: product.id,
      currency: exportedPrice.currency,
      metadata: exportedPrice.metadata,
      active: exportedPrice.active,
    };

    if (exportedPrice.unit_amount !== null) {
      priceParams.unit_amount = exportedPrice.unit_amount;
    }

    if (exportedPrice.recurring) {
      priceParams.recurring = {
        interval: exportedPrice.recurring.interval as
          | 'day'
          | 'week'
          | 'month'
          | 'year',
        interval_count: exportedPrice.recurring.interval_count,
      };
      if (exportedPrice.recurring.trial_period_days) {
        priceParams.recurring.trial_period_days =
          exportedPrice.recurring.trial_period_days;
      }
    }

    const price = await stripe.prices.create(priceParams);
    console.log(
      `   ✅ Created price: ${price.id} (${exportedPrice.currency.toUpperCase()} ${(exportedPrice.unit_amount || 0) / 100})`,
    );

    idMapping.prices[exportedPrice.id] = price.id;
    priceIds.push(price.id);
  }

  if (priceIds.length > 0) {
    const usdPrice = exportedProduct.prices.find((p) => p.currency === 'usd');
    const defaultPriceId = usdPrice
      ? idMapping.prices[usdPrice.id]
      : priceIds[0];

    await stripe.products.update(product.id, {
      default_price: defaultPriceId,
    });
    console.log(`   ✅ Set default price: ${defaultPriceId}`);
  }

  return { productId: product.id, priceIds };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  try {
    console.log('🚀 Importing products to NEW Stripe account...\n');
    console.log('='.repeat(60) + '\n');

    const exportPath = resolve(
      process.cwd(),
      'scripts/migrate-stripe/exported-products.json',
    );
    let exportData: ExportData;

    try {
      const fileContent = readFileSync(exportPath, 'utf-8');
      exportData = JSON.parse(fileContent);
    } catch (error) {
      console.error(`❌ Could not read export file: ${exportPath}`);
      console.error(
        '   Run export-products.ts first to generate the export file',
      );
      process.exit(1);
    }

    console.log(`📅 Export from: ${exportData.exportedAt}`);
    console.log(
      `📦 Subscription plans: ${exportData.subscriptionPlans.length}`,
    );
    console.log(`🛍️  Shop products: ${exportData.shopProducts.length}\n`);

    const idMapping: IdMapping = {
      products: {},
      prices: {},
    };

    console.log('='.repeat(60));
    console.log('📋 Importing Subscription Plans...\n');

    for (const plan of exportData.subscriptionPlans) {
      await importProduct(plan, idMapping, dryRun);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🛍️  Importing Shop Products...\n');

    for (const product of exportData.shopProducts) {
      await importProduct(product, idMapping, dryRun);
    }

    if (!dryRun) {
      const mappingPath = resolve(
        process.cwd(),
        'scripts/migrate-stripe/id-mapping.json',
      );
      writeFileSync(mappingPath, JSON.stringify(idMapping, null, 2), 'utf-8');
      console.log(`\n📝 ID mapping saved to: ${mappingPath}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary\n');
    console.log(
      `✅ Products imported: ${Object.keys(idMapping.products).length}`,
    );
    console.log(`✅ Prices imported: ${Object.keys(idMapping.prices).length}`);

    console.log('\n📝 Environment Variables to Update:\n');

    for (const plan of exportData.subscriptionPlans) {
      const planId = plan.metadata?.plan_id;
      if (planId) {
        const envVarName = `NEXT_PUBLIC_STRIPE_${planId.toUpperCase().replace(/-/g, '_')}_PRICE_ID`;
        const usdPrice = plan.prices.find((p) => p.currency === 'usd');
        if (usdPrice) {
          const newPriceId = idMapping.prices[usdPrice.id] || 'NEW_PRICE_ID';
          console.log(`${envVarName}=${newPriceId}`);
        }
      }
    }

    console.log('\n✅ Import completed successfully!');
    console.log('\nNext steps:');
    console.log(
      '1. Update your .env.local and Vercel env vars with the new price IDs',
    );
    console.log('2. Run: pnpm generate-price-mapping');
    console.log('3. Create new webhooks in Stripe dashboard');
    console.log(
      '4. Update STRIPE_WEBHOOK_SECRET and STRIPE_WEBHOOK_SECRET_SHOP',
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
