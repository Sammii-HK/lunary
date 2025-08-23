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
        { status: 400 }
      );
    }


    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all', // Include all statuses
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
      });
    }


    const subscription = subscriptions.data[0];
    

    const priceId = subscription.items.data[0]?.price?.id;
    const price = await stripe.prices.retrieve(priceId!, {
      expand: ['product'],
    });
    
    const product = price.product as any;
    const planType = price.recurring?.interval === 'month' ? 'monthly' : 'yearly';
    const productName = product.name || 'Unknown Plan';


    const status = subscription.status;

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: status,
        plan: planType,
        planName: productName,
        customerId: customerId,
        trialEnd: subscription.trial_end,
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        created: subscription.created,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
} 