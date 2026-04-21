import Stripe from 'stripe';

type StripeCustomerBucket =
  | 'full_price_paid'
  | 'discounted_paid'
  | 'trial'
  | 'couponed_or_comped';

export type StripeSubscriptionSnapshot = {
  mrr: number;
  fullPricePaidCustomers: number;
  discountedPaidCustomers: number;
  trialCustomers: number;
  couponedOrCompedCustomers: number;
  activeAccessCustomers: number;
  activeSubscriptions: number;
};

const STRIPE_BUCKET_PRIORITY: Record<StripeCustomerBucket, number> = {
  full_price_paid: 4,
  discounted_paid: 3,
  trial: 2,
  couponed_or_comped: 1,
};

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getPriceAmountPerMonth(price: Stripe.Price) {
  if (!price.unit_amount) return 0;

  const interval = price.recurring?.interval;
  if (interval === 'year') {
    return price.unit_amount / 100 / 12;
  }
  if (interval === 'week') {
    return ((price.unit_amount / 100) * 52) / 12;
  }
  if (interval === 'day') {
    return ((price.unit_amount / 100) * 365) / 12;
  }

  return price.unit_amount / 100;
}

function getSubscriptionMonthlyAmount(subscription: Stripe.Subscription) {
  let monthlyAmount = subscription.items.data.reduce((sum, item) => {
    if (!item.price) return sum;
    return sum + getPriceAmountPerMonth(item.price);
  }, 0);

  const discounts = subscription.discounts || [];
  if (discounts.length === 0) {
    return {
      monthlyAmount: Math.round(monthlyAmount * 100) / 100,
      hasDiscount: false,
    };
  }

  const discount = discounts[0];
  if (typeof discount !== 'string' && discount?.coupon) {
    if (discount.coupon.percent_off) {
      monthlyAmount *= 1 - discount.coupon.percent_off / 100;
    } else if (discount.coupon.amount_off) {
      monthlyAmount = Math.max(
        0,
        monthlyAmount - discount.coupon.amount_off / 100,
      );
    }
  }

  return {
    monthlyAmount: Math.round(monthlyAmount * 100) / 100,
    hasDiscount: true,
  };
}

export async function getStripeSubscriptionSnapshot(
  stripe: Stripe | null = getStripeClient(),
): Promise<StripeSubscriptionSnapshot> {
  if (!stripe) {
    return {
      mrr: 0,
      fullPricePaidCustomers: 0,
      discountedPaidCustomers: 0,
      trialCustomers: 0,
      couponedOrCompedCustomers: 0,
      activeAccessCustomers: 0,
      activeSubscriptions: 0,
    };
  }

  const customerBuckets = new Map<string, StripeCustomerBucket>();
  let mrr = 0;
  let activeSubscriptions = 0;

  for await (const subscription of stripe.subscriptions.list({
    status: 'all',
    limit: 100,
    expand: ['data.discounts'],
  })) {
    if (!['active', 'trialing', 'past_due'].includes(subscription.status)) {
      continue;
    }

    activeSubscriptions += 1;

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;

    if (!customerId) {
      continue;
    }

    const { monthlyAmount, hasDiscount } =
      getSubscriptionMonthlyAmount(subscription);

    let bucket: StripeCustomerBucket;
    if (subscription.status === 'trialing') {
      bucket = 'trial';
    } else if (monthlyAmount <= 0) {
      bucket = 'couponed_or_comped';
    } else if (hasDiscount) {
      bucket = 'discounted_paid';
    } else {
      bucket = 'full_price_paid';
    }

    if (subscription.status !== 'trialing' && monthlyAmount > 0) {
      mrr += monthlyAmount;
    }

    const previousBucket = customerBuckets.get(customerId);
    if (
      !previousBucket ||
      STRIPE_BUCKET_PRIORITY[bucket] > STRIPE_BUCKET_PRIORITY[previousBucket]
    ) {
      customerBuckets.set(customerId, bucket);
    }
  }

  let fullPricePaidCustomers = 0;
  let discountedPaidCustomers = 0;
  let trialCustomers = 0;
  let couponedOrCompedCustomers = 0;

  for (const bucket of customerBuckets.values()) {
    if (bucket === 'full_price_paid') fullPricePaidCustomers += 1;
    if (bucket === 'discounted_paid') discountedPaidCustomers += 1;
    if (bucket === 'trial') trialCustomers += 1;
    if (bucket === 'couponed_or_comped') couponedOrCompedCustomers += 1;
  }

  return {
    mrr: Math.round(mrr * 100) / 100,
    fullPricePaidCustomers,
    discountedPaidCustomers,
    trialCustomers,
    couponedOrCompedCustomers,
    activeAccessCustomers: customerBuckets.size,
    activeSubscriptions,
  };
}

export async function getStripeMRR(stripe: Stripe | null = getStripeClient()) {
  const snapshot = await getStripeSubscriptionSnapshot(stripe);
  return snapshot.mrr;
}
