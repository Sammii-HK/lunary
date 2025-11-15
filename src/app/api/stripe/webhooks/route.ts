import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';

import { trackConversionEvent } from '@/lib/analytics/tracking';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();

    const body = await request.text();
    const headersList = await headers();
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
          event.data.previous_attributes as Stripe.Subscription | undefined,
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
  const stripe = getStripe();
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

  // Get customer to retrieve user_id and email for database sync
  let userId: string | null = null;
  let userEmail: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    userId = (customer as any).metadata?.userId || null;
    userEmail = (customer as any).email || null;
    console.log('Customer data:', { customerId, userId, userEmail });
  } catch (error) {
    console.error('Failed to retrieve customer:', error);
  }

  // Process referral code if present
  const referralCode = subscription.metadata?.referralCode;
  const referrerUserId = subscription.metadata?.referrerUserId;

  if (referralCode && referrerUserId && userId) {
    try {
      const { processReferralCode } = await import('@/lib/referrals');
      const result = await processReferralCode(referralCode, userId);

      if (result.success) {
        console.log(`✅ Referral processed: ${referralCode} by user ${userId}`);
      } else {
        console.error(`Failed to process referral: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to process referral in webhook:', error);
    }
  }

  // Write subscription to database for API access
  if (userId || userEmail) {
    try {
      const mappedStatus =
        status === 'trialing'
          ? 'trial'
          : status === 'active'
            ? 'active'
            : status === 'canceled'
              ? 'cancelled'
              : status === 'past_due'
                ? 'past_due'
                : 'free';

      const trialEndsAt = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const currentPeriodEnd = (subscription as any).current_period_end
        ? new Date(
            (subscription as any).current_period_end * 1000,
          ).toISOString()
        : null;

      if (userId) {
        await sql`
          INSERT INTO subscriptions (
            user_id,
            user_email,
            status,
            plan_type,
            stripe_customer_id,
            stripe_subscription_id,
            trial_ends_at,
            current_period_end
          ) VALUES (
            ${userId},
            ${userEmail},
            ${mappedStatus},
            ${planType},
            ${customerId},
            ${subscription.id},
            ${trialEndsAt},
            ${currentPeriodEnd}
          )
          ON CONFLICT (user_id) DO UPDATE SET
            status = EXCLUDED.status,
            plan_type = EXCLUDED.plan_type,
            stripe_customer_id = EXCLUDED.stripe_customer_id,
            stripe_subscription_id = EXCLUDED.stripe_subscription_id,
            trial_ends_at = EXCLUDED.trial_ends_at,
            current_period_end = EXCLUDED.current_period_end,
            user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
            updated_at = NOW()
        `;
        console.log(
          `✅ Subscription written to database for user_id: ${userId}`,
        );
      } else if (userEmail) {
        // Update by email if user_id not available
        await sql`
          UPDATE subscriptions
          SET
            status = ${mappedStatus},
            plan_type = ${planType},
            stripe_customer_id = ${customerId},
            stripe_subscription_id = ${subscription.id},
            trial_ends_at = ${trialEndsAt},
            current_period_end = ${currentPeriodEnd},
            updated_at = NOW()
          WHERE user_email = ${userEmail}
        `;
        console.log(
          `✅ Subscription updated in database for email: ${userEmail}`,
        );
      }
    } catch (error) {
      console.error('Failed to write subscription to database:', error);
    }
  }

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

  if (userId) {
    const conversionType =
      status === 'trialing'
        ? 'free_to_paid'
        : status === 'active'
          ? subscription.trial_end
            ? 'trial_to_paid'
            : 'free_to_paid'
          : 'upgrade';

    await trackConversionEvent({
      userId,
      conversionType,
      fromPlan: 'free',
      toPlan: planType,
      triggerFeature: subscription.metadata?.triggerFeature || null,
      daysToConvert: null,
      metadata: {
        stripeSubscriptionId: subscription.id,
      },
    });
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  previousAttributes?: Stripe.Subscription,
) {
  console.log('Subscription updated:', subscription.id);

  const { updateUserSubscriptionStatus } = await import(
    '../../../../../utils/subscription'
  );

  const stripe = getStripe();
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const planType =
    subscription.items.data[0]?.price?.recurring?.interval === 'month'
      ? 'monthly'
      : 'yearly';

  // Get customer to retrieve user_id and email for database sync
  let userId: string | null = null;
  let userEmail: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    userId = (customer as any).metadata?.userId || null;
    userEmail = (customer as any).email || null;
  } catch (error) {
    console.error('Failed to retrieve customer:', error);
  }

  // Update subscription in database
  if (userId || userEmail) {
    try {
      const mappedStatus =
        status === 'trialing'
          ? 'trial'
          : status === 'active'
            ? 'active'
            : status === 'canceled'
              ? 'cancelled'
              : status === 'past_due'
                ? 'past_due'
                : 'free';

      const trialEndsAt = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const currentPeriodEnd = (subscription as any).current_period_end
        ? new Date(
            (subscription as any).current_period_end * 1000,
          ).toISOString()
        : null;

      if (userId) {
        await sql`
          UPDATE subscriptions
          SET
            status = ${mappedStatus},
            plan_type = ${planType},
            stripe_customer_id = ${customerId},
            stripe_subscription_id = ${subscription.id},
            trial_ends_at = ${trialEndsAt},
            current_period_end = ${currentPeriodEnd},
            user_email = COALESCE(${userEmail}, subscriptions.user_email),
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      } else if (userEmail) {
        await sql`
          UPDATE subscriptions
          SET
            status = ${mappedStatus},
            plan_type = ${planType},
            stripe_customer_id = ${customerId},
            stripe_subscription_id = ${subscription.id},
            trial_ends_at = ${trialEndsAt},
            current_period_end = ${currentPeriodEnd},
            updated_at = NOW()
          WHERE user_email = ${userEmail}
        `;
      }
    } catch (error) {
      console.error('Failed to update subscription in database:', error);
    }
  }

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

  if (
    userId &&
    status === 'active' &&
    previousAttributes?.status === 'trialing'
  ) {
    const daysToConvert =
      subscription.trial_start && subscription.trial_start > 0
        ? Math.max(
            0,
            Math.round(
              (Date.now() - subscription.trial_start * 1000) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : null;

    await trackConversionEvent({
      userId,
      conversionType: 'trial_to_paid',
      fromPlan: 'trial',
      toPlan: planType,
      triggerFeature: subscription.metadata?.triggerFeature || null,
      daysToConvert,
      metadata: {
        stripeSubscriptionId: subscription.id,
      },
    });
  }
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
