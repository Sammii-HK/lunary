import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      customerId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

export async function createCustomerPortalSession(customerId: string) {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
}

export async function getTrialPeriodForPrice(priceId: string): Promise<number> {
  try {
    const response = await fetch('/api/stripe/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trial period');
    }

    const data = await response.json();
    return data.trial_period_days || 7;
  } catch (error) {
    console.error('Error fetching trial period:', error);
    return 7;
  }
}

export async function getStripeProducts() {
  try {
    const response = await fetch('/api/stripe/products');

    if (!response.ok) {
      throw new Error('Failed to fetch Stripe products');
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return [];
  }
}
