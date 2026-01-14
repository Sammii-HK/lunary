import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

let managedStripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> | null {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return null;
  }

  if (!managedStripePromise) {
    managedStripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }

  return managedStripePromise;
}

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  referralCode?: string,
  discountCode?: string,
  userId?: string,
  userEmail?: string,
) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      customerId,
      referralCode,
      discountCode,
      userId,
      userEmail,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Failed to create checkout session');
  }

  return response.json() as Promise<{
    sessionId?: string;
    url?: string;
    portalUrl?: string;
    reason?: string;
  }>;
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
