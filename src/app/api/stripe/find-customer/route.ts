import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        found: false,
        customer: null,
      });
    }

    const customer = customers.data[0];

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    return NextResponse.json({
      found: true,
      customer: {
        id: customer.id,
        email: customer.email,
        created: customer.created,
      },
      subscriptions: subscriptions.data.map((sub) => ({
        id: sub.id,
        status: sub.status,
        current_period_end: (sub as any).current_period_end,
        trial_end: sub.trial_end,
      })),
    });
  } catch (error) {
    console.error('Error finding customer:', error);
    return NextResponse.json(
      { error: 'Failed to find customer' },
      { status: 500 },
    );
  }
}
