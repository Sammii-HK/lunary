import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 },
      );
    }

    console.log('Fetching subscription for customer:', customerId);

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all', // Include all statuses
      limit: 10,
    });

    console.log(
      `Found ${subscriptions.data.length} subscriptions for customer ${customerId}`,
    );

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscriptions found for this customer',
        subscription: null,
      });
    }

    // Get the most recent subscription (active or trial first, then most recent)
    const activeSubscription = subscriptions.data.find((sub) =>
      ['active', 'trialing'].includes(sub.status),
    );

    const subscription = activeSubscription || subscriptions.data[0];

    console.log('Selected subscription:', {
      id: subscription.id,
      status: subscription.status,
      customerId: subscription.customer,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer: subscription.customer,
        current_period_end: (subscription as any).current_period_end || null,
        trial_end: (subscription as any).trial_end || null,
        items: subscription.items,
        created: subscription.created,
      },
      message: `Found ${subscription.status} subscription`,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
