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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

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

  for (const plan of PRICING_PLANS) {
    if (plan.id === 'free') continue;

    console.log(`📦 Processing: ${plan.name} (${plan.id})`);

    // Find the product by searching for it
    const searchQuery = `name:'${plan.name}' AND metadata['plan_id']:'${plan.id}'`;
    const products = await stripe.products.search({
      query: searchQuery,
      limit: 1,
    });

    if (products.data.length === 0) {
      console.log(`   ⚠️  Product not found`);
      continue;
    }

    const product = products.data[0];

    // Get all prices for this product
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });

    mapping[plan.id] = {};

    for (const price of prices.data) {
      if (!price.recurring) continue; // Skip one-time prices

      const currency = price.currency.toUpperCase();
      const amount = price.unit_amount ? price.unit_amount / 100 : 0;

      mapping[plan.id][currency] = {
        priceId: price.id,
        amount,
        currency: price.currency,
      };

      console.log(`   ✅ ${currency}: ${amount} ${currency} (${price.id})`);
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

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`\n✅ Price mapping written to: ${outputPath}`);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
