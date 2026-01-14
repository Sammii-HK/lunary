import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable not found');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function fixUSDPrice() {
  console.log('🔧 Fixing USD yearly price...\n');

  // Find the Lunary+ AI Annual product
  const products = await stripe.products.search({
    query: `name:'Lunary+ AI Annual' AND metadata['plan_id']:'lunary_plus_ai_annual'`,
    limit: 1,
  });

  if (products.data.length === 0) {
    console.error('❌ Product not found');
    return;
  }

  const product = products.data[0];
  console.log(`✅ Found product: ${product.id}`);

  // Get current default price
  const currentPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  const oldUSDPrice = currentPrices.data.find(
    (p) => p.currency === 'usd' && p.recurring?.interval === 'year',
  );

  if (!oldUSDPrice) {
    console.error('❌ USD yearly price not found');
    return;
  }

  console.log(
    `📦 Current USD price: ${oldUSDPrice.id} ($${oldUSDPrice?.unit_amount ? oldUSDPrice.unit_amount / 100 : 0})`,
  );

  // Create new USD price at $89.99
  const newPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 8999, // $89.99
    currency: 'usd',
    recurring: {
      interval: 'year',
      trial_period_days: 14,
    },
    metadata: {
      plan_id: 'lunary_plus_ai_annual',
      plan_name: 'Lunary+ AI Annual',
      interval: 'year',
      converted_from_usd: 'true',
      usd_base_price: '89.99',
    },
  });

  console.log(`✅ Created new USD price: ${newPrice.id} ($89.99)`);

  // Set new price as default
  await stripe.products.update(product.id, {
    default_price: newPrice.id,
  });
  console.log(`✅ Set new price as default`);

  // Now deactivate old price
  await stripe.prices.update(oldUSDPrice.id, { active: false });
  console.log(`✅ Deactivated old USD price: ${oldUSDPrice.id}`);

  console.log('\n✅ USD price updated successfully!');
}

fixUSDPrice().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
