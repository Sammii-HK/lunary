import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireUser } from '@/lib/ai/auth';

export const dynamic = 'force-dynamic';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const authedUser = await requireUser(request).catch(() => null);
  if (!authedUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const { sessionId } = await context.params;

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
            metadata: subscription.metadata || {},
          }
        : null,
      metadata: session.metadata || {},
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
