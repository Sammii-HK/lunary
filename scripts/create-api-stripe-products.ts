/**
 * Create Stripe products and prices for the Lunary API tiers.
 *
 * Run: npx tsx scripts/create-api-stripe-products.ts
 *
 * This creates 3 products (Starter, Developer, Business) with monthly prices in USD.
 * After running, update utils/stripe-prices.ts with the generated price IDs.
 */
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const API_TIERS = [
  {
    name: 'Lunary API - Starter',
    description:
      '5,000 requests/month, 30 req/min. All endpoints including birth charts, tarot, and rituals.',
    planId: 'api_starter',
    priceUsd: 900, // $9.00 in cents
    features: [
      'All free tier endpoints',
      'Birth chart calculations',
      'Eclipse tracking',
      'Ephemeris data',
      '5,000 requests/month',
      '30 requests/minute',
    ],
  },
  {
    name: 'Lunary API - Developer',
    description:
      '25,000 requests/month, 60 req/min. Synastry, personal transits, progressions, and Vedic dasha.',
    planId: 'api_developer',
    priceUsd: 2900, // $29.00
    features: [
      'All starter endpoints',
      'Synastry (compatibility)',
      'Personal transits',
      'Secondary progressions',
      'Vedic dasha periods',
      '25,000 requests/month',
      '60 requests/minute',
      'Email support',
    ],
  },
  {
    name: 'Lunary API - Business',
    description:
      '100,000 requests/month, 120 req/min. Everything plus webhooks, dedicated support, custom rate limits.',
    planId: 'api_business',
    priceUsd: 9900, // $99.00
    features: [
      'All developer endpoints',
      'Webhook notifications',
      'Dedicated support',
      'Custom rate limits',
      'SLA guarantee',
      '100,000 requests/month',
      '120 requests/minute',
    ],
  },
];

async function main() {
  console.log('Creating Lunary API Stripe products...\n');

  for (const tier of API_TIERS) {
    // Create product
    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
      metadata: {
        plan_id: tier.planId,
        type: 'api',
      },
    });
    console.log(`Product: ${product.id} - ${tier.name}`);

    // Create monthly USD price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.priceUsd,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: {
        plan_id: tier.planId,
      },
    });
    console.log(`  Price:  ${price.id} - $${tier.priceUsd / 100}/mo\n`);

    console.log(`  Add to stripe-prices.ts:`);
    console.log(`    ${tier.planId}: {`);
    console.log(
      `      USD: { priceId: '${price.id}', amount: ${tier.priceUsd / 100}, currency: 'usd' },`,
    );
    console.log(`    },\n`);
  }

  console.log('Done. Update utils/stripe-prices.ts with the price IDs above.');
}

main().catch(console.error);
