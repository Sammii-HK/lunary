import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

function getStripe(secretKey?: string) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

async function resolveCustomerById(
  customerId: string,
): Promise<{ stripe: Stripe; customerId: string } | null> {
  const stripe = getStripe();
  try {
    await stripe.customers.retrieve(customerId);
    return { stripe, customerId };
  } catch (error: any) {
    console.log(
      '[portal] customer ID lookup failed',
      customerId,
      error?.message || error,
    );
    return null;
  }
}

async function resolveCustomerFromSubscription(
  subscriptionId: string,
): Promise<{ stripe: Stripe; customerId: string } | null> {
  const stripe = getStripe();
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = subscription.customer as string | undefined;
    if (customer) {
      return { stripe, customerId: customer };
    }
    console.log(
      '[portal] subscription lookup returned no customer',
      subscriptionId,
    );
  } catch (error: any) {
    console.log(
      '[portal] subscription lookup failed',
      subscriptionId,
      error?.message || error,
    );
  }
  return null;
}

async function findCustomerByEmail(
  email: string,
): Promise<{ stripe: Stripe; customerId: string } | null> {
  const stripe = getStripe();
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });
    if (customers.data[0]?.id) {
      console.log(
        '[portal] found customer via email',
        email,
        customers.data[0].id,
      );
      return { stripe, customerId: customers.data[0].id };
    }
    console.log('[portal] no customer in Stripe for email', email);
  } catch (error) {
    console.warn('[portal] failed to lookup customer by email', email, error);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, userId, userEmail } = await request.json();
    const sessionUser = await requireUser(request).catch(() => null);

    console.log('[portal] POST payload', {
      customerId,
      userId,
      userEmail,
    });

    if (!customerId && !userId && !userEmail) {
      return NextResponse.json(
        { error: 'Customer ID or user identity is required' },
        { status: 400 },
      );
    }

    const userIdToUse = userId || sessionUser?.id;
    let resolvedCustomerId: string | null = customerId || null;
    let lookupEmail: string | undefined = userEmail || undefined;
    let stripeForPortal: Stripe | null = null;
    let subscriptionId: string | null = null;

    if (!lookupEmail && userIdToUse) {
      const result = await sql`
        SELECT user_email, stripe_subscription_id
        FROM subscriptions
        WHERE user_id = ${userIdToUse}
        LIMIT 1
      `;
      lookupEmail = result.rows[0]?.user_email || undefined;
      subscriptionId = result.rows[0]?.stripe_subscription_id || null;
      console.log('[portal] subscription lookup', userIdToUse, {
        lookupEmail,
        subscriptionId,
      });
    }

    if (resolvedCustomerId) {
      const resolved = await resolveCustomerById(resolvedCustomerId);
      if (resolved) {
        stripeForPortal = resolved.stripe;
        resolvedCustomerId = resolved.customerId;
        console.log(
          '[portal] resolved provided customer ID',
          resolvedCustomerId,
        );
      } else {
        console.log(
          '[portal] provided customer ID not found in Stripe',
          resolvedCustomerId,
        );
        resolvedCustomerId = null;
      }
    }

    const effectiveEmail =
      userEmail || lookupEmail || sessionUser?.email || undefined;
    console.log(
      '[portal] lookupEmail',
      lookupEmail,
      'effectiveEmail',
      effectiveEmail,
      'subscriptionId',
      subscriptionId,
    );

    if (!resolvedCustomerId && effectiveEmail) {
      const foundCustomer = await findCustomerByEmail(effectiveEmail);
      if (foundCustomer) {
        resolvedCustomerId = foundCustomer.customerId;
        stripeForPortal = foundCustomer.stripe;
        console.log(
          '[portal] resolved customer via email',
          effectiveEmail,
          resolvedCustomerId,
        );
        if (userIdToUse) {
          try {
            await sql`
              UPDATE subscriptions
              SET stripe_customer_id = ${resolvedCustomerId}, updated_at = NOW()
              WHERE user_id = ${userIdToUse}
            `;
          } catch (error) {
            console.error('Failed to persist Stripe customer ID:', error);
          }
        }
      } else {
        console.log(
          '[portal] no Stripe customer found for email',
          effectiveEmail,
        );
      }
    }

    if (!resolvedCustomerId && subscriptionId) {
      const foundSubscription =
        await resolveCustomerFromSubscription(subscriptionId);
      if (foundSubscription) {
        resolvedCustomerId = foundSubscription.customerId;
        stripeForPortal = foundSubscription.stripe;
        console.log(
          '[portal] resolved customer via subscription',
          subscriptionId,
          resolvedCustomerId,
        );
        if (userIdToUse) {
          try {
            await sql`
              UPDATE subscriptions
              SET stripe_customer_id = ${resolvedCustomerId}, updated_at = NOW()
              WHERE user_id = ${userIdToUse}
            `;
          } catch (error) {
            console.error('Failed to persist Stripe customer ID:', error);
          }
        }
      } else {
        console.log('[portal] subscription lookup failed', subscriptionId);
      }
    }

    if (!resolvedCustomerId) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    if (!stripeForPortal) {
      const resolved = await resolveCustomerById(resolvedCustomerId);
      stripeForPortal = resolved?.stripe || null;
    }

    if (!stripeForPortal) {
      return NextResponse.json(
        { error: 'Customer not found in Stripe account' },
        { status: 404 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const portalSession = await stripeForPortal.billingPortal.sessions.create({
      customer: resolvedCustomerId,
      return_url: `${baseUrl}/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 },
    );
  }
}
