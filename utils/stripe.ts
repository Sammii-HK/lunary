export type CheckoutSourceContext = {
  cta_id?: string;
  cta_location?: string;
  cta_label?: string;
  cta_href?: string;
  cta_funnel_version?: string;
  cta_step?: string;
  funnel_version?: string;
  step?: string;
  page_path?: string;
  analytics_session_id?: string;
  anonymous_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  first_touch_source?: string;
  first_touch_medium?: string;
  first_touch_campaign?: string;
  first_touch_keyword?: string;
  first_touch_page?: string;
  first_touch_referrer?: string;
  first_touch_at?: string;
};

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  referralCode?: string,
  discountCode?: string,
  userId?: string,
  userEmail?: string,
  promoCode?: string,
  triggerFeature?: string,
  sourceContext?: CheckoutSourceContext,
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
      promoCode,
      userId,
      userEmail,
      triggerFeature,
      sourceContext,
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
