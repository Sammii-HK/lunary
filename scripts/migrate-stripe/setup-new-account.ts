import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const NEW_STRIPE_KEY =
  process.env.NEW_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!NEW_STRIPE_KEY) {
  console.error('❌ NEW_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY not found');
  process.exit(1);
}

const stripe = new Stripe(NEW_STRIPE_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

async function createWebhooks() {
  console.log('🔗 Creating webhooks...\n');

  const subscriptionWebhook = await stripe.webhookEndpoints.create({
    url: `${BASE_URL}/api/stripe/webhooks`,
    enabled_events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed',
    ],
    description: 'Main subscription webhook',
  });

  console.log('✅ Subscription webhook created');
  console.log(`   URL: ${subscriptionWebhook.url}`);
  console.log(`   STRIPE_WEBHOOK_SECRET=${subscriptionWebhook.secret}`);

  const shopWebhook = await stripe.webhookEndpoints.create({
    url: `${BASE_URL}/api/shop/webhooks`,
    enabled_events: ['checkout.session.completed', 'payment_intent.succeeded'],
    description: 'Shop purchases webhook',
  });

  console.log('\n✅ Shop webhook created');
  console.log(`   URL: ${shopWebhook.url}`);
  console.log(`   STRIPE_WEBHOOK_SECRET_SHOP=${shopWebhook.secret}`);

  return {
    subscriptionSecret: subscriptionWebhook.secret,
    shopSecret: shopWebhook.secret,
  };
}

async function createReferralCoupon() {
  console.log('\n🎟️  Creating referral coupon...\n');

  const coupon = await stripe.coupons.create({
    percent_off: 20,
    duration: 'repeating',
    duration_in_months: 3,
    name: 'Referral Discount - 20% off for 3 months',
    metadata: {
      type: 'referral',
      created_by: 'migration-script',
    },
  });

  console.log('✅ Referral coupon created');
  console.log(`   Name: ${coupon.name}`);
  console.log(
    `   Discount: ${coupon.percent_off}% off for ${coupon.duration_in_months} months`,
  );
  console.log(`   STRIPE_REFERRAL_COUPON_ID=${coupon.id}`);

  return coupon.id;
}

async function main() {
  console.log('🚀 Setting up new Stripe account...\n');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log('='.repeat(60) + '\n');

  try {
    const webhookSecrets = await createWebhooks();
    const couponId = await createReferralCoupon();

    console.log('\n' + '='.repeat(60));
    console.log('📝 Add these to your environment variables:\n');
    console.log(`STRIPE_WEBHOOK_SECRET=${webhookSecrets.subscriptionSecret}`);
    console.log(`STRIPE_WEBHOOK_SECRET_SHOP=${webhookSecrets.shopSecret}`);
    console.log(`STRIPE_REFERRAL_COUPON_ID=${couponId}`);

    console.log('\n✅ New account setup complete!');
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
}

main();
