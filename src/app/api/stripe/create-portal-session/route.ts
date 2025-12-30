import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

function getStripe(secretKey?: string) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

async function findCustomerByEmail(email: string): Promise<string | null> {
  const stripe = getStripe();
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });
    return customers.data[0]?.id || null;
  } catch (error) {
    console.warn('Failed to lookup Stripe customer by email:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, userId, userEmail } = await request.json();

    if (!customerId && !userId && !userEmail) {
      return NextResponse.json(
        { error: 'Customer ID or user identity is required' },
        { status: 400 },
      );
    }

    let resolvedCustomerId: string | null = customerId || null;
    let lookupEmail = userEmail as string | undefined;

    if (!lookupEmail && userId) {
      const result = await sql`
        SELECT user_email
        FROM subscriptions
        WHERE user_id = ${userId}
        LIMIT 1
      `;
      lookupEmail = result.rows[0]?.user_email || undefined;
    }

    const stripe = getStripe();

    if (resolvedCustomerId) {
      try {
        await stripe.customers.retrieve(resolvedCustomerId);
      } catch {
        resolvedCustomerId = null;
      }
    }

    if (!resolvedCustomerId && lookupEmail) {
      const foundCustomerId = await findCustomerByEmail(lookupEmail);
      if (foundCustomerId) {
        resolvedCustomerId = foundCustomerId;
        if (userId) {
          try {
            await sql`
              UPDATE subscriptions
              SET stripe_customer_id = ${resolvedCustomerId}, updated_at = NOW()
              WHERE user_id = ${userId}
            `;
          } catch (error) {
            console.error('Failed to persist Stripe customer ID:', error);
          }
        }
      }
    }

    if (!resolvedCustomerId) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const portalSession = await stripe.billingPortal.sessions.create({
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
