import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function getPlanTypeFromSubscription(
  subscription: Stripe.Subscription,
): Promise<string> {
  // First try to get plan_id from subscription metadata
  const planIdFromMetadata = subscription.metadata?.plan_id;
  if (planIdFromMetadata) {
    return planIdFromMetadata;
  }

  // Try to get from price metadata
  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId) {
    try {
      const stripe = getStripe();
      const price = await stripe.prices.retrieve(priceId, {
        expand: ['product'],
      });
      const product = price.product as Stripe.Product;

      const planIdFromPrice =
        price.metadata?.plan_id || product.metadata?.plan_id;
      if (planIdFromPrice) {
        return planIdFromPrice;
      }

      // Fallback to price ID mapping
      const { getPlanIdFromPriceId } = await import(
        '../../../../../utils/pricing'
      );
      const mappedPlanId = getPlanIdFromPriceId(priceId);
      if (mappedPlanId) {
        return mappedPlanId;
      }
    } catch (error) {
      console.error('Failed to retrieve price metadata:', error);
    }
  }

  // Final fallback: use interval-based mapping for backward compatibility
  // Note: This is less ideal - prefer using price ID mapping or metadata
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  // Default to lunary_plus for monthly, but this should be avoided
  // The price ID mapping above should catch most cases
  return interval === 'month' ? 'lunary_plus' : 'lunary_plus_ai_annual';
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Request body is required' },
          { status: 400 },
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    const { customerId } = body;

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

    // Extract plan_id from subscription metadata
    const planType = await getPlanTypeFromSubscription(subscription);

    console.log('Selected subscription:', {
      id: subscription.id,
      status: subscription.status,
      customerId: subscription.customer,
      planType,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customerId: subscription.customer,
        customer: subscription.customer,
        plan: planType,
        planName: planType, // Include planName for compatibility
        current_period_end: (subscription as any).current_period_end || null,
        trial_end: (subscription as any).trial_end || null,
        trialEnd: (subscription as any).trial_end || null, // Include both formats
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
