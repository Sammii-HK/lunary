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

// Approximate conversion rates
const CURRENCY_RATES: Record<string, number> = {
  usd: 1.0,
  gbp: 0.79,
  eur: 0.92,
  cad: 1.36,
  aud: 1.52,
  jpy: 149.0,
  chf: 0.88,
  nzd: 1.64,
  sek: 10.5,
  nok: 10.7,
  dkk: 6.87,
  pln: 4.0,
  czk: 22.8,
  huf: 360.0,
  inr: 83.0,
  sgd: 1.34,
  hkd: 7.8,
  mxn: 17.0,
  brl: 4.9,
  zar: 18.5,
};

const ALL_CURRENCIES = Object.keys(CURRENCY_RATES);

function convertToLocalCurrency(usdPrice: number, currency: string): number {
  const rate = CURRENCY_RATES[currency];
  const converted = usdPrice * rate;

  // Round UP to nearest .99
  const roundedUp = Math.ceil(converted);
  const priceWith99 = roundedUp - 0.01;

  // For currencies like JPY that don't use decimals, round to nearest whole number
  if (currency === 'jpy' || currency === 'krw' || currency === 'huf') {
    return Math.max(1, Math.ceil(converted));
  }

  // Do not undercut base conversion for yearly pricing
  return Math.max(converted, priceWith99);
}

async function updateYearlyPricing(dryRun: boolean) {
  const yearlyPlan = PRICING_PLANS.find(
    (p) => p.id === 'lunary_plus_ai_annual',
  );
  if (!yearlyPlan) {
    console.error('❌ Yearly plan not found');
    return;
  }

  console.log(`\n💰 Updating yearly pricing to $${yearlyPlan.price} USD`);
  console.log(
    `   This equals ${yearlyPlan.price / 8.99} months of monthly pricing\n`,
  );

  // Find the product
  const searchQuery = `name:'${yearlyPlan.name}' AND metadata['plan_id']:'${yearlyPlan.id}'`;
  const products = await stripe.products.search({
    query: searchQuery,
    limit: 1,
  });

  if (products.data.length === 0) {
    console.error('❌ Product not found');
    return;
  }

  const product = products.data[0];
  console.log(`✅ Found product: ${product.id} (${product.name})`);

  // Get all existing prices
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  console.log(`\n📊 Found ${existingPrices.data.length} existing prices\n`);

  const results: Array<{
    currency: string;
    oldPrice?: number;
    newPrice: number;
    priceId?: string;
    action: 'created' | 'updated' | 'exists' | 'error';
    error?: string;
  }> = [];

  for (const currency of ALL_CURRENCIES) {
    const newPrice = convertToLocalCurrency(yearlyPlan.price, currency);
    const amountInCents = Math.round(newPrice * 100);

    // Find existing price for this currency
    const existingPrice = existingPrices.data.find(
      (p) => p.currency === currency && p.recurring?.interval === 'year',
    );

    if (existingPrice) {
      const oldPrice = existingPrice.unit_amount
        ? existingPrice.unit_amount / 100
        : 0;

      if (Math.abs(oldPrice - newPrice) < 0.01) {
        console.log(
          `   ✅ ${currency.toUpperCase()}: Already correct (${newPrice})`,
        );
        results.push({
          currency,
          oldPrice,
          newPrice,
          priceId: existingPrice.id,
          action: 'exists',
        });
        continue;
      }

      if (dryRun) {
        console.log(
          `   [DRY RUN] Would update ${currency.toUpperCase()}: ${oldPrice} → ${newPrice}`,
        );
        results.push({
          currency,
          oldPrice,
          newPrice,
          priceId: existingPrice.id,
          action: 'updated',
        });
        continue;
      }

      // Deactivate old price and create new one
      try {
        await stripe.prices.update(existingPrice.id, { active: false });
        console.log(
          `   🔄 Deactivated old ${currency.toUpperCase()} price: ${existingPrice.id}`,
        );

        const newPriceObj = await stripe.prices.create({
          product: product.id,
          unit_amount: amountInCents,
          currency: currency,
          recurring: {
            interval: 'year',
            trial_period_days: 14,
          },
          metadata: {
            plan_id: yearlyPlan.id,
            plan_name: yearlyPlan.name,
            interval: 'year',
            converted_from_usd: 'true',
            usd_base_price: yearlyPlan.price.toString(),
          },
        });

        console.log(
          `   ✅ Created new ${currency.toUpperCase()} price: ${newPriceObj.id} (${newPrice})`,
        );
        results.push({
          currency,
          oldPrice,
          newPrice,
          priceId: newPriceObj.id,
          action: 'updated',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `   ❌ Failed to update ${currency.toUpperCase()}: ${errorMessage}`,
        );
        results.push({
          currency,
          oldPrice,
          newPrice,
          action: 'error',
          error: errorMessage,
        });
      }
    } else {
      // Create new price
      if (dryRun) {
        console.log(
          `   [DRY RUN] Would create ${currency.toUpperCase()} price: ${newPrice}`,
        );
        results.push({
          currency,
          newPrice,
          action: 'created',
        });
        continue;
      }

      try {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: amountInCents,
          currency: currency,
          recurring: {
            interval: 'year',
            trial_period_days: 14,
          },
          metadata: {
            plan_id: yearlyPlan.id,
            plan_name: yearlyPlan.name,
            interval: 'year',
            converted_from_usd: 'true',
            usd_base_price: yearlyPlan.price.toString(),
          },
        });

        console.log(
          `   ✅ Created ${currency.toUpperCase()} price: ${price.id} (${newPrice})`,
        );
        results.push({
          currency,
          newPrice,
          priceId: price.id,
          action: 'created',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `   ❌ Failed to create ${currency.toUpperCase()}: ${errorMessage}`,
        );
        results.push({
          currency,
          newPrice,
          action: 'error',
          error: errorMessage,
        });
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary\n');
  const created = results.filter((r) => r.action === 'created').length;
  const updated = results.filter((r) => r.action === 'updated').length;
  const exists = results.filter((r) => r.action === 'exists').length;
  const errors = results.filter((r) => r.action === 'error').length;

  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Already correct: ${exists}`);
  if (errors > 0) {
    console.log(`   ❌ Errors: ${errors}`);
  }

  if (!dryRun) {
    console.log('\n✅ Yearly pricing updated!');
    console.log(
      '💡 Run: npm run generate-price-mapping to update the price mapping file',
    );
  } else {
    console.log('\n💡 Run without --dry-run to actually update the prices');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  await updateYearlyPricing(dryRun);
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
