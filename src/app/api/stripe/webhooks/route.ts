import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';

import { trackConversionEvent } from '@/lib/analytics/tracking';
import { captureEvent } from '@/lib/posthog-server';

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
          promo_code, discount_ends_at
        ) VALUES (
          ${userId}, ${userEmail}, ${status}, ${planType},
          ${customerId}, ${subscription.id},
          ${trialEndsAt}, ${currentPeriodEnd},
          ${discountInfo.hasDiscount}, ${discountInfo.discountPercent || null},
          ${discountInfo.monthlyAmountDue || null}, ${discountInfo.couponId || null},
          ${promoCode}, ${discountInfo.discountEndsAt || null}
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
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('DB write failed:', error);
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
  }
}
