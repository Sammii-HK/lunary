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

// Approximate conversion rates (just for rough conversion, we'll round to .99 anyway)
const CURRENCY_RATES: Record<string, number> = {
  usd: 1.0,
  gbp: 0.79, // Rough: £1 ≈ $1.27
  eur: 0.92, // Rough: €1 ≈ $1.09
  cad: 1.36, // Rough: C$1 ≈ $0.74
  aud: 1.52, // Rough: A$1 ≈ $0.66
  jpy: 149.0, // Rough: ¥1 ≈ $0.0067
  chf: 0.88, // Rough: CHF 1 ≈ $1.14
  nzd: 1.64, // Rough: NZ$1 ≈ $0.61
  sek: 10.5, // Rough: SEK 1 ≈ $0.095
  nok: 10.7, // Rough: NOK 1 ≈ $0.093
  dkk: 6.87, // Rough: DKK 1 ≈ $0.146
  pln: 4.0, // Rough: PLN 1 ≈ $0.25
  czk: 22.8, // Rough: CZK 1 ≈ $0.044
  huf: 360.0, // Rough: HUF 1 ≈ $0.0028
  inr: 83.0, // Rough: INR 1 ≈ $0.012
  sgd: 1.34, // Rough: SGD 1 ≈ $0.75
  hkd: 7.8, // Rough: HKD 1 ≈ $0.13
  mxn: 17.0, // Rough: MXN 1 ≈ $0.059
  brl: 4.9, // Rough: BRL 1 ≈ $0.20
  zar: 18.5, // Rough: ZAR 1 ≈ $0.054
};

// Currencies to add (excluding USD which already exists)
const CURRENCIES_TO_ADD = Object.keys(CURRENCY_RATES).filter(
  (c) => c !== 'usd',
);

interface CurrencyPriceResult {
  currency: string;
  priceId?: string;
  amount: number;
  created: boolean;
  error?: string;
}

/**
 * Converts USD price to local currency and rounds UP to nearest .99
 * Example: $4.99 USD → £3.99 GBP (if rate is ~0.79)
 * Minimum: 4.99 for monthly plans, no minimum for yearly
 */
function convertToLocalCurrency(
  usdPrice: number,
  currency: string,
  interval: 'month' | 'year',
): number {
  const rate = CURRENCY_RATES[currency];
  const converted = usdPrice * rate;

  // Round UP to nearest .99
  const roundedUp = Math.ceil(converted);
  const priceWith99 = roundedUp - 0.01; // Make it end in .99

  // For currencies like JPY that don't use decimals, round to nearest whole number
  if (currency === 'jpy' || currency === 'krw' || currency === 'huf') {
    const minPrice = interval === 'month' ? 500 : 0; // Minimum ¥500 for monthly
    return Math.max(minPrice, Math.ceil(converted));
  }

  // Minimum 4.99 for monthly plans. Yearly should not undercut base conversion.
  const minPrice = interval === 'month' ? 4.99 : converted;
  return Math.max(minPrice, priceWith99);
}

async function addMultiCurrencyPrices(
  productId: string,
  plan: (typeof PRICING_PLANS)[0],
  dryRun: boolean,
): Promise<CurrencyPriceResult[]> {
  const results: CurrencyPriceResult[] = [];
  const usdPrice = plan.price;
  const trialDays = plan.interval === 'year' ? 14 : 7;
  const interval = plan.interval as 'month' | 'year';

  console.log(`\n🌍 Adding multi-currency prices for: ${plan.name}`);
  console.log(`   Product ID: ${productId}`);
  console.log(`   Base price: $${usdPrice} USD (${plan.interval})`);

  // Get existing prices for this product
  const existingPrices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });

  for (const currency of CURRENCIES_TO_ADD) {
    const localPrice = convertToLocalCurrency(usdPrice, currency, interval);
    const amountInCents = Math.round(localPrice * 100);

    // Check if price already exists for this currency
    const existingPrice = existingPrices.data.find(
      (p) => p.currency === currency && p.recurring?.interval === plan.interval,
    );

    if (existingPrice) {
      console.log(
        `   ✅ ${currency.toUpperCase()}: Already exists (${existingPrice.id}) - ${existingPrice.unit_amount / 100} ${currency.toUpperCase()}`,
      );
      results.push({
        currency,
        priceId: existingPrice.id,
        amount: existingPrice.unit_amount / 100,
        created: false,
      });
      continue;
    }

    if (dryRun) {
      console.log(
        `   [DRY RUN] Would create ${currency.toUpperCase()} price: ${localPrice} ${currency.toUpperCase()} (${amountInCents} cents)`,
      );
      results.push({
        currency,
        amount: localPrice,
        created: false,
      });
      continue;
    }

    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: amountInCents,
        currency: currency,
        recurring: {
          interval: plan.interval === 'year' ? 'year' : 'month',
          trial_period_days: trialDays,
        },
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          interval: plan.interval,
          converted_from_usd: 'true',
          usd_base_price: usdPrice.toString(),
        },
      });

      console.log(
        `   ✅ Created ${currency.toUpperCase()} price: ${price.id} (${localPrice} ${currency.toUpperCase()})`,
      );
      results.push({
        currency,
        priceId: price.id,
        amount: localPrice,
        created: true,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `   ❌ Failed to create ${currency.toUpperCase()} price: ${errorMessage}`,
      );
      results.push({
        currency,
        amount: localPrice,
        created: false,
        error: errorMessage,
      });
    }
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  console.log('🌍 Adding multi-currency prices to Stripe products...\n');
  console.log(`📊 Will add prices in ${CURRENCIES_TO_ADD.length} currencies`);
  console.log(`💰 Prices will be rounded UP to nearest .99`);
  console.log(`📌 Minimum: 4.99 for monthly plans, 0.99 for yearly plans\n`);

  const allResults: Record<string, CurrencyPriceResult[]> = {};

  // Process each subscription plan (skip free)
  for (const plan of PRICING_PLANS) {
    if (plan.id === 'free') continue;

    try {
      // Find the product by searching for it
      const searchQuery = `name:'${plan.name}' AND metadata['plan_id']:'${plan.id}'`;
      const products = await stripe.products.search({
        query: searchQuery,
        limit: 1,
      });

      if (products.data.length === 0) {
        console.log(`⚠️  Product not found for: ${plan.name}`);
        console.log(`   Search query: ${searchQuery}`);
        continue;
      }

      const product = products.data[0];
      const results = await addMultiCurrencyPrices(product.id, plan, dryRun);
      allResults[plan.id] = results;
    } catch (error) {
      console.error(`❌ Error processing ${plan.name}:`, error);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary\n');

  for (const [planId, results] of Object.entries(allResults)) {
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    console.log(`${plan?.name || planId}:`);

    const created = results.filter((r) => r.created).length;
    const existing = results.filter((r) => !r.created && !r.error).length;
    const errors = results.filter((r) => r.error).length;

    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Already existed: ${existing}`);
    if (errors > 0) {
      console.log(`   ❌ Errors: ${errors}`);
    }
    console.log('');
  }

  if (!dryRun) {
    console.log('✅ Multi-currency prices added successfully!');
    console.log(
      '\n💡 All prices rounded UP to nearest .99 for consistent pricing.',
    );
  } else {
    console.log('\n💡 Run without --dry-run to actually create the prices.');
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
