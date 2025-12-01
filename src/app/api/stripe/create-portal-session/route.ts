import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe(secretKey?: string) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

async function findCustomerAccount(customerId: string): Promise<Stripe> {
  // Try new account first
  const newStripe = getStripe();
  try {
    await newStripe.customers.retrieve(customerId);
    return newStripe;
  } catch {
    // Not in new account
  }

  // Try legacy account if configured
  if (process.env.STRIPE_SECRET_KEY_LEGACY) {
    const legacyStripe = getStripe(process.env.STRIPE_SECRET_KEY_LEGACY);
    try {
      await legacyStripe.customers.retrieve(customerId);
      console.log(`[portal] Using legacy Stripe for ${customerId}`);
      return legacyStripe;
    } catch {
      // Not in legacy either
    }
  }

  return newStripe;
}

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 },
      );
    }

    const stripe = await findCustomerAccount(customerId);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
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
