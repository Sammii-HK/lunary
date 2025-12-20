import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { PRICING_PLANS } from '../utils/pricing';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable not found');
  process.exit(1);
}

function getStripe(secretKey?: string) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: '2024-11-20.acacia',
  });
}

const primaryStripe = getStripe();
const legacyStripe = process.env.STRIPE_SECRET_KEY_LEGACY
  ? getStripe(process.env.STRIPE_SECRET_KEY_LEGACY)
  : null;

interface PriceMapping {
  [planId: string]: {
    [currency: string]: {
      priceId: string;
      amount: number;
      currency: string;
    };
  };
}

async function generatePriceMapping(): Promise<PriceMapping> {
  const mapping: PriceMapping = {};

  console.log('🔍 Fetching all prices from Stripe...\n');
  console.log(
    `📊 Checking primary account${legacyStripe ? ' and legacy account' : ''}\n`,
  );

  for (const plan of PRICING_PLANS) {
    if (plan.id === 'free') continue;

    console.log(`📦 Processing: ${plan.name} (${plan.id})`);

    mapping[plan.id] = {};

    // Try primary account first
    const accounts = [
      { name: 'primary', stripe: primaryStripe },
      ...(legacyStripe ? [{ name: 'legacy', stripe: legacyStripe }] : []),
    ];

    for (const account of accounts) {
      console.log(`   🔍 Checking ${account.name} account...`);

      // Find the product by searching for it
      const searchQuery = `name:'${plan.name}' AND metadata['plan_id']:'${plan.id}'`;
      let products;
      try {
        products = await account.stripe.products.search({
          query: searchQuery,
          limit: 1,
        });
      } catch (searchError) {
        console.error(
          `   ❌ Search failed in ${account.name} account:`,
          searchError,
        );
        continue;
      }

      if (products.data.length === 0) {
        console.log(`   ⚠️  Product not found in ${account.name} account`);
        continue;
      }

      const product = products.data[0];
      console.log(
        `   📦 Found product: ${product.id} in ${account.name} account`,
      );

      // Get all prices for this product
      let prices;
      try {
        prices = await account.stripe.prices.list({
          product: product.id,
          active: true,
          limit: 100,
        });
        console.log(
          `   ✅ Found ${prices.data.length} prices in ${account.name} account`,
        );
      } catch (listError) {
        console.error(
          `   ❌ Failed to list prices in ${account.name} account:`,
          listError,
        );
        continue;
      }

      // Merge prices from both accounts (primary takes precedence for same currency)
      for (const price of prices.data) {
        if (!price.recurring) continue; // Skip one-time prices

        const currency = price.currency.toUpperCase();
        const amount = price.unit_amount ? price.unit_amount / 100 : 0;

        // Only add if we don't already have this currency (primary account wins)
        if (!mapping[plan.id][currency]) {
          mapping[plan.id][currency] = {
            priceId: price.id,
            amount,
            currency: price.currency,
          };

          console.log(
            `   ✅ ${currency}: ${amount} ${currency} (${price.id}) from ${account.name} account`,
          );
        } else {
          console.log(
            `   ⏭️  ${currency}: Skipping (already have from primary account)`,
          );
        }
      }
    }

    console.log('');
  }

  return mapping;
}

async function main() {
  try {
    const mapping = await generatePriceMapping();

    console.log('='.repeat(60));
    console.log('📊 Price Mapping Generated\n');
    console.log(JSON.stringify(mapping, null, 2));
    console.log('\n' + '='.repeat(60));

    // Also write to a file for easy import
    const fs = await import('fs');
    const outputPath = resolve(process.cwd(), 'utils/stripe-prices.ts');

    console.log(`\n📝 Writing price mapping to: ${outputPath}`);

    const content = `// Auto-generated price mapping from Stripe
// Run: npm run generate-price-mapping
// Last updated: ${new Date().toISOString()}

export const STRIPE_PRICE_MAPPING = ${JSON.stringify(mapping, null, 2)} as const;

export type PlanId = keyof typeof STRIPE_PRICE_MAPPING;
export type Currency = string;

export function getPriceForCurrency(
  planId: PlanId,
  currency: Currency = 'USD',
): { priceId: string; amount: number; currency: string } | null {
  const planPrices = STRIPE_PRICE_MAPPING[planId];
  if (!planPrices) return null;

  // Try exact match first
  if (planPrices[currency.toUpperCase()]) {
    return planPrices[currency.toUpperCase()];
  }

  // Fallback to USD
  return planPrices['USD'] || null;
}

export function getAvailableCurrencies(planId: PlanId): string[] {
  const planPrices = STRIPE_PRICE_MAPPING[planId];
  if (!planPrices) return [];
  return Object.keys(planPrices);
}
`;

    try {
      fs.writeFileSync(outputPath, content, 'utf-8');
      console.log(`✅ Price mapping written successfully!`);
    } catch (writeError) {
      console.error(`❌ Failed to write file:`, writeError);
      throw writeError;
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
