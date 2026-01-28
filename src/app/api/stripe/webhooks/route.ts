import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';

import { trackConversionEvent } from '@/lib/analytics/tracking';
import { captureEvent } from '@/lib/posthog-server';
import { conversionTracking } from '@/lib/analytics';

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

function getPlanTypeFromSubscription(
  subscription: Stripe.Subscription,
): string {
  // Try subscription metadata first
  if (subscription.metadata?.plan_id) {
    return subscription.metadata.plan_id;
  }

  // Try price/product metadata
  const price = subscription.items.data[0]?.price;
  if (price?.metadata?.plan_id) {
    return price.metadata.plan_id;
  }

  // Try price ID mapping (supports multi-currency)
  if (price?.id) {
    const { getPlanIdFromPriceId } = require('../../../../../utils/pricing');
    const planId = getPlanIdFromPriceId(price.id);
    if (planId) {
      return planId;
    }
  }

  // Fallback to interval-based mapping
  const interval = price?.recurring?.interval;
  if (interval === 'year') return 'lunary_plus_ai_annual';
  if (interval === 'month') return 'lunary_plus';

  return 'free';
}

function mapStripeStatus(status: string): string {
  switch (status) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'canceled':
      return 'cancelled';
    case 'past_due':
      return 'past_due';
    default:
      return 'free';
  }
}

function extractDiscountInfo(subscription: Stripe.Subscription) {
  const discounts = subscription.discounts || [];
  if (discounts.length === 0) {
    const price = subscription.items.data[0]?.price;
    const unitAmount = (price?.unit_amount || 0) / 100;
    const interval = price?.recurring?.interval;
    return {
      hasDiscount: false,
      discountPercent: 0,
      monthlyAmountDue: interval === 'year' ? unitAmount / 12 : unitAmount,
      couponId: null,
      discountEndsAt: null,
    };
  }

  const discount = discounts[0];
  if (typeof discount === 'string' || !discount?.coupon) {
    return {
      hasDiscount: false,
      discountPercent: 0,
      monthlyAmountDue: 0,
      couponId: null,
      discountEndsAt: null,
    };
  }

  const price = subscription.items.data[0]?.price;
  const unitAmount = (price?.unit_amount || 0) / 100;
  const interval = price?.recurring?.interval;
  let monthlyAmount = interval === 'year' ? unitAmount / 12 : unitAmount;

  if (discount.coupon.percent_off) {
    monthlyAmount *= 1 - discount.coupon.percent_off / 100;
  } else if (discount.coupon.amount_off) {
    monthlyAmount = Math.max(
      0,
      monthlyAmount - discount.coupon.amount_off / 100,
    );
  }

  let discountEndsAt = discount.end
    ? new Date(discount.end * 1000).toISOString()
    : null;
  if (
    !discountEndsAt &&
    discount.coupon.duration === 'repeating' &&
    discount.coupon.duration_in_months
  ) {
    const startTimestamp = discount.start || subscription.start_date;
    if (startTimestamp) {
      const endDate = new Date(startTimestamp * 1000);
      endDate.setUTCMonth(
        endDate.getUTCMonth() + discount.coupon.duration_in_months,
      );
      discountEndsAt = endDate.toISOString();
    }
  }

  return {
    hasDiscount: true,
    discountPercent: discount.coupon.percent_off || 0,
    monthlyAmountDue: monthlyAmount,
    couponId: discount.coupon.id,
    discountEndsAt,
  };
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
          event.type === 'customer.subscription.created',
          event.data.previous_attributes as Stripe.Subscription | undefined,
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  isNew: boolean,
  previousAttributes?: Stripe.Subscription,
) {
  const stripe = getStripe();
  const customerId = subscription.customer as string;
  const status = mapStripeStatus(subscription.status);
  const planType = getPlanTypeFromSubscription(subscription);
  const discountInfo = extractDiscountInfo(subscription);
  const promoCodeRaw =
    subscription.metadata?.promoCode || subscription.metadata?.discountCode;
  const promoCode =
    typeof promoCodeRaw === 'string' && promoCodeRaw.trim().length > 0
      ? promoCodeRaw.trim().toUpperCase()
      : null;

  // Get userId from customer or subscription metadata
  let userId = subscription.metadata?.userId || null;
  let userEmail: string | null = null;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!userId) userId = (customer as any).metadata?.userId || null;
    userEmail = (customer as any).email || null;

    // Sync userId to customer metadata if missing
    if (subscription.metadata?.userId && !(customer as any).metadata?.userId) {
      await stripe.customers.update(customerId, {
        metadata: { userId: subscription.metadata.userId },
      });
    }
  } catch (error) {
    console.error('Failed to get customer:', error);
  }

  // Fallback: match userId by Stripe customer id stored in our DB
  if (!userId && customerId) {
    try {
      const subscriptionMatch = await sql`
        SELECT user_id FROM subscriptions
        WHERE stripe_customer_id = ${customerId}
        LIMIT 1
      `;
      userId = subscriptionMatch.rows[0]?.user_id || null;
    } catch (error) {
      console.error('Failed to match user by subscription customer id:', error);
    }
  }

  if (!userId && customerId) {
    try {
      const profileMatch = await sql`
        SELECT user_id FROM user_profiles
        WHERE stripe_customer_id = ${customerId}
        LIMIT 1
      `;
      userId = profileMatch.rows[0]?.user_id || null;
    } catch (error) {
      console.error('Failed to match user by profile customer id:', error);
    }
  }

  if (!userId && userEmail) {
    try {
      const emailMatch = await sql`
        SELECT user_id FROM subscriptions
        WHERE LOWER(user_email) = LOWER(${userEmail})
        LIMIT 1
      `;
      userId = emailMatch.rows[0]?.user_id || null;
    } catch (error) {
      console.error('Failed to match user by email:', error);
    }
  }

  if (!userId && userEmail) {
    try {
      const userMatch = await sql`
        SELECT id FROM "user"
        WHERE LOWER(email) = LOWER(${userEmail})
        LIMIT 1
      `;
      userId = userMatch.rows[0]?.id || null;
    } catch (error) {
      console.error('Failed to match user by auth email:', error);
    }
  }

  // Process referral on new subscriptions
  if (isNew && subscription.metadata?.referralCode && userId) {
    try {
      const { processReferralCode } = await import('@/lib/referrals');
      await processReferralCode(subscription.metadata.referralCode, userId);
    } catch (error) {
      console.error('Referral error:', error);
    }
  }

  // Write to database
  if (userId) {
    const trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;
    const currentPeriodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null;

    try {
      await sql`
        INSERT INTO subscriptions (
          user_id, user_email, status, plan_type,
          stripe_customer_id, stripe_subscription_id,
          trial_ends_at, current_period_end,
          has_discount, discount_percent, monthly_amount_due, coupon_id,
          promo_code, discount_ends_at, trial_used
        ) VALUES (
          ${userId}, ${userEmail}, ${status}, ${planType},
          ${customerId}, ${subscription.id},
          ${trialEndsAt}, ${currentPeriodEnd},
          ${discountInfo.hasDiscount}, ${discountInfo.discountPercent || null},
          ${discountInfo.monthlyAmountDue || null}, ${discountInfo.couponId || null},
          ${promoCode}, ${discountInfo.discountEndsAt || null}, true
        )
        ON CONFLICT (user_id) DO UPDATE SET
          status = EXCLUDED.status,
          plan_type = EXCLUDED.plan_type,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          trial_ends_at = EXCLUDED.trial_ends_at,
          current_period_end = EXCLUDED.current_period_end,
          has_discount = EXCLUDED.has_discount,
          discount_percent = EXCLUDED.discount_percent,
          monthly_amount_due = EXCLUDED.monthly_amount_due,
          coupon_id = EXCLUDED.coupon_id,
          promo_code = EXCLUDED.promo_code,
          discount_ends_at = EXCLUDED.discount_ends_at,
          user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
          trial_used = true,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('DB write failed:', error);
    }
  }

  if (userId && customerId) {
    try {
      await sql`
        INSERT INTO user_profiles (user_id, stripe_customer_id)
        VALUES (${userId}, ${customerId})
        ON CONFLICT (user_id) DO UPDATE SET
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('Failed to sync Stripe customer to profile:', error);
    }
  }

  if (userId && customerId) {
    try {
      await stripe.customers.update(customerId, {
        metadata: { userId },
      });
    } catch (error) {
      console.error('Failed to backfill customer metadata:', error);
    }
  }

  // Analytics
  if (userId) {
    if (isNew) {
      const conversionType =
        subscription.status === 'trialing'
          ? 'free_to_paid'
          : subscription.trial_end
            ? 'trial_to_paid'
            : 'free_to_paid';

      await trackConversionEvent({
        userId,
        conversionType,
        fromPlan: 'free',
        toPlan: planType,
        triggerFeature: subscription.metadata?.triggerFeature || null,
        daysToConvert: null,
        metadata: { stripeSubscriptionId: subscription.id },
      });

      captureEvent(userId, 'subscription_started', {
        plan: planType,
        status,
        is_trial: subscription.status === 'trialing',
        has_discount: discountInfo.hasDiscount,
        discount_percent: discountInfo.discountPercent,
        monthly_amount: discountInfo.monthlyAmountDue,
        referral_code: subscription.metadata?.referralCode || null,
      });
    } else if (
      subscription.status === 'active' &&
      previousAttributes?.status === 'trialing'
    ) {
      const daysToConvert =
        subscription.trial_start && subscription.trial_start > 0
          ? Math.round(
              (Date.now() - subscription.trial_start * 1000) /
                (1000 * 60 * 60 * 24),
            )
          : null;

      await trackConversionEvent({
        userId,
        conversionType: 'trial_to_paid',
        fromPlan: 'trial',
        toPlan: planType,
        triggerFeature: subscription.metadata?.triggerFeature || null,
        daysToConvert,
        metadata: { stripeSubscriptionId: subscription.id },
      });
    }
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  if (session.mode !== 'subscription') return;

  const stripe = getStripe();
  const customerId = session.customer as string | null;
  const subscriptionId = session.subscription as string | null;
  if (!customerId || !subscriptionId) return;

  const userIdFromSession =
    (typeof session.client_reference_id === 'string' &&
      session.client_reference_id.trim().length > 0 &&
      session.client_reference_id.trim()) ||
    (typeof session.metadata?.userId === 'string' &&
      session.metadata.userId.trim().length > 0 &&
      session.metadata.userId.trim()) ||
    null;

  let customer: Stripe.Customer | null = null;
  try {
    const fetched = await stripe.customers.retrieve(customerId);
    if (!('deleted' in fetched)) {
      customer = fetched;
    }
  } catch (error) {
    console.error('Failed to retrieve checkout customer:', error);
  }

  if (userIdFromSession && customer) {
    try {
      await stripe.customers.update(customerId, {
        metadata: { ...(customer.metadata || {}), userId: userIdFromSession },
      });
    } catch (error) {
      console.error('Failed to update customer metadata from checkout:', error);
    }
  }

  let subscription: Stripe.Subscription | null = null;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Failed to retrieve subscription from checkout:', error);
  }

  if (!subscription) return;

  if (userIdFromSession && !subscription.metadata?.userId) {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        metadata: {
          ...(subscription.metadata || {}),
          userId: userIdFromSession,
        },
      });
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error(
        'Failed to update subscription metadata from checkout:',
        error,
      );
    }
  }

  await handleSubscriptionChange(subscription, false);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripe = getStripe();
  const customerId = subscription.customer as string;

  let userId = subscription.metadata?.userId || null;
  if (!userId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      userId = (customer as any).metadata?.userId || null;
    } catch {
      // Customer might be deleted
    }
  }

  if (userId) {
    try {
      await sql`
        UPDATE subscriptions
        SET status = 'cancelled', plan_type = 'free', updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    } catch (error) {
      console.error('DB update failed:', error);
    }

    // Track cancellation
    const planType = getPlanTypeFromSubscription(subscription);
    conversionTracking.subscriptionCancelled(userId, planType);

    // Track cancellation reason if available in metadata
    if (subscription.metadata?.cancellation_reason) {
      conversionTracking.subscriptionCancellationReason(
        userId,
        subscription.metadata.cancellation_reason,
        subscription.metadata.cancellation_category || undefined,
      );
    }
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') return;

  const userId =
    (typeof session.client_reference_id === 'string' &&
      session.client_reference_id.trim().length > 0 &&
      session.client_reference_id.trim()) ||
    (typeof session.metadata?.userId === 'string' &&
      session.metadata.userId.trim().length > 0 &&
      session.metadata.userId.trim()) ||
    null;

  if (userId) {
    // Track checkout abandonment
    conversionTracking.checkoutAbandoned(userId, 'expired');
  }
}

async function handleChargeFailed(charge: Stripe.Charge) {
  const stripe = getStripe();
  const customerId = charge.customer as string | null;
  if (!customerId) return;

  let userId: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    userId = (customer as any).metadata?.userId || null;
  } catch (error) {
    console.error('Failed to get customer for failed charge:', error);
  }

  // Fallback: match userId by customer id in DB
  if (!userId && customerId) {
    try {
      const match = await sql`
        SELECT user_id FROM subscriptions
        WHERE stripe_customer_id = ${customerId}
        LIMIT 1
      `;
      userId = match.rows[0]?.user_id || null;
    } catch (error) {
      console.error('Failed to match user for failed charge:', error);
    }
  }

  if (userId) {
    const failureCode = charge.failure_code || 'unknown';
    const failureMessage = charge.failure_message || 'Payment failed';
    const amount = (charge.amount || 0) / 100;

    // Track payment failure
    conversionTracking.paymentFailed(userId, failureCode, amount);

    // Log for support investigation
    console.error('Payment failed for user:', {
      userId,
      chargeId: charge.id,
      failureCode,
      failureMessage,
      amount,
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripe = getStripe();
  const customerId = invoice.customer as string | null;
  if (!customerId) return;

  let userId: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    userId = (customer as any).metadata?.userId || null;
  } catch (error) {
    console.error('Failed to get customer for failed invoice:', error);
  }

  if (!userId && customerId) {
    try {
      const match = await sql`
        SELECT user_id FROM subscriptions
        WHERE stripe_customer_id = ${customerId}
        LIMIT 1
      `;
      userId = match.rows[0]?.user_id || null;
    } catch (error) {
      console.error('Failed to match user for failed invoice:', error);
    }
  }

  if (userId) {
    const attemptCount = invoice.attempt_count || 1;
    const amount = (invoice.amount_due || 0) / 100;
    const subscriptionId = (invoice as any).subscription as string | null;

    let planType: string | undefined = undefined;
    if (subscriptionId) {
      try {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        planType = getPlanTypeFromSubscription(subscription);
      } catch (error) {
        console.error('Failed to get subscription for failed invoice:', error);
      }
    }

    // Track payment failure
    const failureReason = (invoice as any).charge
      ? `Invoice payment failed (attempt ${attemptCount})`
      : 'Invoice payment failed';
    conversionTracking.paymentFailed(userId, failureReason, amount);

    // Track retry if this is not the first attempt
    if (attemptCount > 1) {
      conversionTracking.paymentRetryAttempted(userId, attemptCount, amount);
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripe = getStripe();
  const customerId = invoice.customer as string | null;
  if (!customerId) return;

  let userId: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    userId = (customer as any).metadata?.userId || null;
  } catch (error) {
    console.error('Failed to get customer for successful invoice:', error);
  }

  if (!userId && customerId) {
    try {
      const match = await sql`
        SELECT user_id FROM subscriptions
        WHERE stripe_customer_id = ${customerId}
        LIMIT 1
      `;
      userId = match.rows[0]?.user_id || null;
    } catch (error) {
      console.error('Failed to match user for successful invoice:', error);
    }
  }

  if (userId && invoice.attempt_count && invoice.attempt_count > 1) {
    // Payment succeeded after retry
    const amount = (invoice.amount_paid || 0) / 100;
    conversionTracking.paymentRetrySuccess(
      userId,
      invoice.attempt_count,
      amount,
    );
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const stripe = getStripe();
  const customerId = charge.customer as string | null;
  if (!customerId) return;

  let userId: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    userId = (customer as any).metadata?.userId || null;
  } catch (error) {
    console.error('Failed to get customer for refund:', error);
  }

  if (!userId && customerId) {
    try {
      const match = await sql`
        SELECT user_id FROM subscriptions
        WHERE stripe_customer_id = ${customerId}
        LIMIT 1
      `;
      userId = match.rows[0]?.user_id || null;
    } catch (error) {
      console.error('Failed to match user for refund:', error);
    }
  }

  if (userId) {
    const amount = (charge.amount_refunded || 0) / 100;
    const reason = charge.refunds?.data[0]?.reason || 'unknown';

    // Track refund
    conversionTracking.subscriptionRefunded(userId, amount, reason);
  }
}
