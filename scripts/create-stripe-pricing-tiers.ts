import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { PRICING_PLANS } from '../utils/pricing';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable not found');
  console.error('   Make sure you have .env.local with STRIPE_SECRET_KEY set');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

interface PlanResult {
  planId: string;
  planName: string;
  productId?: string;
  priceId?: string;
  error?: string;
  created: boolean;
}

async function createPricingTier(
  plan: (typeof PRICING_PLANS)[0],
  dryRun: boolean,
): Promise<PlanResult> {
  const result: PlanResult = {
    planId: plan.id,
    planName: plan.name,
    created: false,
  };

  if (plan.id === 'free') {
    console.log(`⏭️  Skipping free plan: ${plan.name}`);
    return result;
  }

  if (!plan.stripePriceId && dryRun) {
    console.log(
      `⚠️  [DRY RUN] Would create Stripe product/price for: ${plan.name}`,
    );
    return result;
  }

  try {
    const priceInCents = Math.round(plan.price * 100);
    const trialDays = plan.interval === 'year' ? 14 : 7;

    console.log(`\n📦 Processing: ${plan.name} (${plan.id})`);
    console.log(`   Price: $${plan.price} (${priceInCents} cents)`);
    console.log(`   Interval: ${plan.interval}`);
    console.log(`   Trial: ${trialDays} days`);

    if (dryRun) {
      console.log(`   [DRY RUN] Would create product with metadata:`);
      console.log(`     - plan_id: ${plan.id}`);
      console.log(`     - plan_name: ${plan.name}`);
      console.log(`     - interval: ${plan.interval}`);
      console.log(`     - trial_days: ${trialDays}`);
      return result;
    }

    const productName = plan.name;
    const productDescription = plan.description;

    const existingProducts = await stripe.products.search({
      query: `name:'${productName}' AND metadata['plan_id']:'${plan.id}'`,
      limit: 1,
    });

    let product: Stripe.Product;

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`   ✅ Found existing product: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: productName,
        description: productDescription,
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          interval: plan.interval,
          trial_days: trialDays.toString(),
        },
      });
      console.log(`   ✅ Created product: ${product.id}`);
      result.created = true;
    }

    result.productId = product.id;

    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    });

    const matchingPrice = existingPrices.data.find(
      (p) =>
        p.unit_amount === priceInCents &&
        p.currency === 'usd' &&
        p.recurring?.interval === plan.interval,
    );

    if (matchingPrice) {
      console.log(
        `   ✅ Found existing price: ${matchingPrice.id} (${matchingPrice.unit_amount} cents)`,
      );
      result.priceId = matchingPrice.id;

      if (matchingPrice.unit_amount !== priceInCents) {
        console.error(
          `   ⚠️  WARNING: Price mismatch! Expected ${priceInCents} cents, found ${matchingPrice.unit_amount} cents`,
        );
        result.error = `Price mismatch: expected ${priceInCents}, found ${matchingPrice.unit_amount}`;
      }
    } else {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceInCents,
        currency: 'usd',
        recurring: {
          interval: plan.interval === 'year' ? 'year' : 'month',
          trial_period_days: trialDays,
        },
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          interval: plan.interval,
        },
      });

      console.log(
        `   ✅ Created price: ${price.id} (${price.unit_amount} cents)`,
      );
      result.priceId = price.id;
      result.created = true;

      if (price.unit_amount !== priceInCents) {
        console.error(
          `   ⚠️  WARNING: Price mismatch! Expected ${priceInCents} cents, created ${price.unit_amount} cents`,
        );
        result.error = `Price mismatch: expected ${priceInCents}, created ${price.unit_amount}`;
      }

      await stripe.products.update(product.id, {
        default_price: price.id,
      });
      console.log(`   ✅ Set default price on product`);
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`   ❌ Error creating pricing tier: ${errorMessage}`);
    result.error = errorMessage;
    return result;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  console.log('🚀 Creating Stripe pricing tiers...\n');

  const results: PlanResult[] = [];

  for (const plan of PRICING_PLANS) {
    const result = await createPricingTier(plan, dryRun);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary\n');

  const envVars: Record<string, string> = {};

  for (const result of results) {
    if (result.planId === 'free') continue;

    const envVarName = `NEXT_PUBLIC_STRIPE_${result.planId.toUpperCase().replace(/-/g, '_')}_PRICE_ID`;

    if (result.priceId) {
      envVars[envVarName] = result.priceId;
      console.log(`✅ ${result.planName}:`);
      console.log(`   Product: ${result.productId || 'N/A'}`);
      console.log(`   Price: ${result.priceId}`);
      console.log(`   Env Var: ${envVarName}=${result.priceId}`);
      if (result.error) {
        console.log(`   ⚠️  Warning: ${result.error}`);
      }
    } else if (result.error) {
      console.log(`❌ ${result.planName}: ${result.error}`);
    } else {
      console.log(`⏭️  ${result.planName}: Skipped (dry run)`);
    }
    console.log('');
  }

  if (!dryRun && Object.keys(envVars).length > 0) {
    console.log('📝 Add these to your .env.local:\n');
    for (const [key, value] of Object.entries(envVars)) {
      console.log(`${key}=${value}`);
    }
  }

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error('\n❌ Some pricing tiers failed to create');
    process.exit(1);
  }

  console.log('\n✅ All pricing tiers processed successfully!');
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
