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
    const { email, userId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get ALL customers with this email (Stripe allows multiple)
    const customers = await stripe.customers.list({
      email: email,
      limit: 100, // Get all to find the right one
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        found: false,
        customer: null,
      });
    }

    let customer: Stripe.Customer | null = null;

    // If userId provided, prioritize customer with matching userId in metadata
    if (userId) {
      const matchingCustomer = customers.data.find(
        (c) => (c.metadata as any)?.userId === userId,
      );
      if (matchingCustomer) {
        customer = matchingCustomer;
      }
    }

    // If no match by userId, find customer with active subscription
    if (!customer) {
      for (const c of customers.data) {
        const subscriptions = await stripe.subscriptions.list({
          customer: c.id,
          status: 'all',
          limit: 1,
        });
        const hasActiveSub = subscriptions.data.some(
          (sub) =>
            sub.status === 'active' ||
            sub.status === 'trialing' ||
            sub.status === 'past_due',
        );
        if (hasActiveSub) {
          customer = c;
          break;
        }
      }
    }

    // If still no match, use most recently created customer
    if (!customer) {
      customer = customers.data.sort((a, b) => b.created - a.created)[0];
    }

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
        metadata: customer.metadata,
      },
      subscriptions: subscriptions.data.map((sub) => ({
        id: sub.id,
        status: sub.status,
        current_period_end: (sub as any).current_period_end,
        trial_end: sub.trial_end,
      })),
      totalCustomersWithEmail: customers.data.length, // Inform caller if multiple found
    });
  } catch (error) {
    console.error('Error finding customer:', error);
    return NextResponse.json(
      { error: 'Failed to find customer' },
      { status: 500 },
    );
  }
}
