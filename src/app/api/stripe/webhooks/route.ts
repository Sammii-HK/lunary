import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const { updateUserSubscriptionStatus } = await import(
    '../../../../../utils/subscription'
  );

  const customerId = subscription.customer as string;
  const status = subscription.status;
  const planType =
    subscription.items.data[0]?.price?.recurring?.interval === 'month'
      ? 'monthly'
      : 'yearly';

  const result = await updateUserSubscriptionStatus(customerId, {
    id: subscription.id,
    status: status,
    plan: planType,
    trialEnd: subscription.trial_end || undefined,
    currentPeriodEnd: (subscription as any).current_period_end,
  });

  console.log(
    `Customer ${customerId} subscribed to ${planType} plan - sync result:`,
    result,
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const { updateUserSubscriptionStatus } = await import(
    '../../../../../utils/subscription'
  );

  const customerId = subscription.customer as string;
  const status = subscription.status;
  const planType =
    subscription.items.data[0]?.price?.recurring?.interval === 'month'
      ? 'monthly'
      : 'yearly';

  const result = await updateUserSubscriptionStatus(customerId, {
    id: subscription.id,
    status: status,
    plan: planType,
    trialEnd: subscription.trial_end || undefined,
    currentPeriodEnd: (subscription as any).current_period_end,
  });

  console.log(
    `Customer ${customerId} subscription updated to status: ${status} - sync result:`,
    result,
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const { updateUserSubscriptionStatus } = await import(
    '../../../../../utils/subscription'
  );

  const customerId = subscription.customer as string;

  const result = await updateUserSubscriptionStatus(customerId, {
    id: subscription.id,
    status: 'cancelled',
    plan: 'free',
    trialEnd: undefined,
    currentPeriodEnd: (subscription as any).current_period_end,
  });

  console.log(
    `Customer ${customerId} subscription cancelled - sync result:`,
    result,
  );
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);

  // TODO: Ensure user has active subscription status
  const customerId = invoice.customer as string;

  console.log(`Payment succeeded for customer: ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id);

  // TODO: Handle failed payment (maybe send notification)
  const customerId = invoice.customer as string;

  console.log(`Payment failed for customer: ${customerId}`);
}
