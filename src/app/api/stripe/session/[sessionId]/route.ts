import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 },
      );
    }


    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }


    const subscription = session.subscription as any;
    const customer = session.customer as any;
    
    const formattedSession = {
      id: session.id,
      status: session.status,
      customer_email: session.customer_details?.email || 'Unknown',
      customer_id: customer?.id || session.customer,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            trial_end: subscription.trial_end,
            current_period_end:
              subscription.current_period_end || subscription.trial_end,
          }
        : null,
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
