import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { FREE_TRIAL_DAYS } from '../../../../../utils/pricing';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  let priceId: string | undefined;
  try {
    const requestBody = await request.json();
    priceId = requestBody.priceId;
    const { customerId } = requestBody;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 },
      );
    }

    // Build base URL from request if env not set
    const originFromRequest = new URL(request.url).origin;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || originFromRequest;

    // Get the price to determine trial period
    const price = await stripe.prices.retrieve(priceId);
    const isMonthly = price.recurring?.interval === 'month';
    const trialDays = isMonthly
      ? FREE_TRIAL_DAYS.monthly
      : FREE_TRIAL_DAYS.yearly;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          planType: isMonthly ? 'monthly' : 'yearly',
        },
      },
      metadata: {
        planType: isMonthly ? 'monthly' : 'yearly',
      },
    };

    // If we have a customer ID, use it
    if (customerId) {
      sessionConfig.customer = customerId;
    }
    // Note: For subscription mode, Stripe automatically creates customers
    // so we don't need to set customer_creation

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      priceId,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    });
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
