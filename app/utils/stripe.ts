import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export async function createCheckoutSession(priceId: string, customerId?: string) {
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

export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch('/api/stripe/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  return response.json();
} 