import Stripe from 'stripe';
import pg from 'pg';

const { Client } = pg;

const PLAN_PRICES = {
  lunary_plus: 4.99,
  basic: 4.99,
  monthly: 4.99,
  lunary_plus_ai: 8.99,
  pro: 8.99,
  lunary_plus_annual: 4.99,
  lunary_plus_ai_annual: 7.5,
  pro_annual: 7.5,
  yearly: 4.99,
  year: 4.99,
};

function extractDiscountInfo(subscription, planType) {
  let monthlyAmount = PLAN_PRICES[planType] || 4.99;
  const price = subscription.items.data[0]?.price;
  if (price?.unit_amount) {
    const isYearly = price.recurring?.interval === 'year';
    monthlyAmount = isYearly ? price.unit_amount / 100 / 12 : price.unit_amount / 100;
  }
  const discounts = subscription.discounts || [];
  if (discounts.length === 0) return { hasDiscount: false, discountPercent: 0, monthlyAmountDue: monthlyAmount, couponId: null };
  const discount = discounts[0];
  if (typeof discount === 'string' || !discount?.coupon) return { hasDiscount: false, discountPercent: 0, monthlyAmountDue: monthlyAmount, couponId: null };
  if (discount.coupon.percent_off) monthlyAmount *= 1 - discount.coupon.percent_off / 100;
  else if (discount.coupon.amount_off) monthlyAmount = Math.max(0, monthlyAmount - discount.coupon.amount_off / 100);
  return { hasDiscount: true, discountPercent: discount.coupon.percent_off || 0, monthlyAmountDue: Math.round(monthlyAmount * 100) / 100, couponId: discount.coupon.id };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const client = new Client({ connectionString: process.env.POSTGRES_URL });
await client.connect();

const { rows: subs } = await client.query(`SELECT user_id, stripe_subscription_id, plan_type, monthly_amount_due, has_discount FROM subscriptions WHERE stripe_subscription_id IS NOT NULL AND status = 'active'`);
console.log(`Found ${subs.length} active subscriptions`);

let updated = 0, errors = 0;
for (const sub of subs) {
  try {
    const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, { expand: ['discounts.promotion_code'] });
    const info = extractDiscountInfo(subscription, sub.plan_type);
    const mrrDiff = Math.abs(Number(sub.monthly_amount_due || 0) - info.monthlyAmountDue);
    if (mrrDiff > 0.01 || sub.has_discount !== info.hasDiscount) {
      await client.query(`UPDATE subscriptions SET has_discount=$1, discount_percent=$2, monthly_amount_due=$3, coupon_id=$4, updated_at=NOW() WHERE user_id=$5`,
        [info.hasDiscount, info.discountPercent, info.monthlyAmountDue, info.couponId, sub.user_id]);
      console.log(`Updated ${sub.user_id}: £${sub.monthly_amount_due} → £${info.monthlyAmountDue} (discount: ${info.hasDiscount})`);
      updated++;
    }
  } catch (e) { console.error(`Error ${sub.stripe_subscription_id}:`, e.message); errors++; }
}

const { rows: [{ mrr }] } = await client.query(`SELECT COALESCE(SUM(monthly_amount_due),0) as mrr FROM subscriptions WHERE status='active' AND stripe_subscription_id IS NOT NULL`);
console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`);
console.log(`Real MRR after sync: £${Number(mrr).toFixed(2)}`);

await client.end();
