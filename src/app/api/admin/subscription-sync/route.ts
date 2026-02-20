import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
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

function getPlanTypeFromSubscription(
  subscription: Stripe.Subscription,
): string {
  if (subscription.metadata?.plan_id) {
    return subscription.metadata.plan_id;
  }

  const price = subscription.items.data[0]?.price;
  if (price?.metadata?.plan_id) {
    return price.metadata.plan_id;
  }

  if (price?.id) {
    const { getPlanIdFromPriceId } = require('../../../../../utils/pricing');
    const planId = getPlanIdFromPriceId(price.id);
    if (planId) {
      return planId;
    }
  }

  const interval = price?.recurring?.interval;
  if (interval === 'year') return 'lunary_plus_ai_annual';
  if (interval === 'month') return 'lunary_plus';

  return 'free';
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
    discountPercent: discount.coupon.percent_off || null,
    monthlyAmountDue: monthlyAmount,
    couponId: discount.coupon.id || null,
    discountEndsAt,
  };
}

function pickBestSubscription(subscriptions: Stripe.Subscription[]) {
  const statusRank: Record<string, number> = {
    active: 1,
    trialing: 2,
    past_due: 3,
    unpaid: 4,
    incomplete: 5,
    incomplete_expired: 6,
    canceled: 7,
  };

  return subscriptions.slice().sort((a, b) => {
    const rankA = statusRank[a.status] ?? 99;
    const rankB = statusRank[b.status] ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    return (b.created || 0) - (a.created || 0);
  })[0];
}

async function resolveCustomer(
  stripe: Stripe,
  customerId?: string | null,
  email?: string | null,
  userId?: string | null,
) {
  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !('deleted' in customer)) {
      return customer;
    }
    return null;
  }

  if (!email) {
    return null;
  }

  const customers = await stripe.customers.list({ email, limit: 100 });
  if (customers.data.length === 0) {
    return null;
  }

  if (userId) {
    const match = customers.data.find(
      (candidate) => (candidate.metadata as any)?.userId === userId,
    );
    if (match) return match;
  }

  for (const candidate of customers.data) {
    const subs = await stripe.subscriptions.list({
      customer: candidate.id,
      status: 'all',
      limit: 5,
    });
    const best = pickBestSubscription(subs.data);
    if (best && ['active', 'trialing', 'past_due'].includes(best.status)) {
      return candidate;
    }
  }

  return customers.data.sort((a, b) => b.created - a.created)[0];
}

async function resolveUserId(
  inputUserId: string | null,
  customer: Stripe.Customer,
  subscription: Stripe.Subscription,
) {
  if (inputUserId) return inputUserId;

  const metadataUserId =
    subscription.metadata?.userId ||
    (customer.metadata as Record<string, string> | undefined)?.userId;
  if (metadataUserId) return metadataUserId;

  const customerId = customer.id;
  const subscriptionId = subscription.id;

  try {
    const subscriptionMatch = await sql`
      SELECT user_id FROM subscriptions
      WHERE stripe_subscription_id = ${subscriptionId}
      LIMIT 1
    `;
    if (subscriptionMatch.rows[0]?.user_id) {
      return subscriptionMatch.rows[0].user_id;
    }
  } catch (error) {
    console.error('Failed to match user by subscription id:', error);
  }

  try {
    const customerMatch = await sql`
      SELECT user_id FROM subscriptions
      WHERE stripe_customer_id = ${customerId}
      LIMIT 1
    `;
    if (customerMatch.rows[0]?.user_id) {
      return customerMatch.rows[0].user_id;
    }
  } catch (error) {
    console.error('Failed to match user by customer id:', error);
  }

  if (customer.email) {
    try {
      const emailMatch = await sql`
        SELECT user_id FROM subscriptions
        WHERE LOWER(user_email) = LOWER(${customer.email})
        LIMIT 1
      `;
      if (emailMatch.rows[0]?.user_id) {
        return emailMatch.rows[0].user_id;
      }
    } catch (error) {
      console.error('Failed to match user by subscription email:', error);
    }

    try {
      const userMatch = await sql`
        SELECT id FROM "user"
        WHERE LOWER(email) = LOWER(${customer.email})
        LIMIT 1
      `;
      if (userMatch.rows[0]?.id) {
        return userMatch.rows[0].id as string;
      }
    } catch (error) {
      console.error('Failed to match user by auth email:', error);
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const stripe = getStripe();
    const payload = await request.json();
    const customerId =
      typeof payload.customerId === 'string' ? payload.customerId.trim() : null;
    const email =
      typeof payload.email === 'string' ? payload.email.trim() : null;
    const userId =
      typeof payload.userId === 'string' ? payload.userId.trim() : null;

    if (!customerId && !email) {
      return NextResponse.json(
        { error: 'Provide a Stripe customer id or email.' },
        { status: 400 },
      );
    }

    const customer = await resolveCustomer(stripe, customerId, email, userId);
    if (!customer || 'deleted' in customer) {
      return NextResponse.json(
        { error: 'Stripe customer not found.' },
        { status: 404 },
      );
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });
    const subscription = pickBestSubscription(subscriptions.data);
    if (!subscription) {
      return NextResponse.json(
        { error: 'No Stripe subscriptions found for customer.' },
        { status: 404 },
      );
    }

    const resolvedUserId = await resolveUserId(userId, customer, subscription);
    if (!resolvedUserId) {
      return NextResponse.json(
        {
          error:
            'Unable to resolve user id. Provide userId or ensure email matches a user.',
        },
        { status: 400 },
      );
    }

    const status = mapStripeStatus(subscription.status);
    const planType = getPlanTypeFromSubscription(subscription);
    const discountInfo = extractDiscountInfo(subscription);
    const trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;
    const currentPeriodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null;

    await sql`
      INSERT INTO subscriptions (
        user_id, user_email, status, plan_type,
        stripe_customer_id, stripe_subscription_id,
        trial_ends_at, current_period_end,
        has_discount, discount_percent, monthly_amount_due, coupon_id
      ) VALUES (
        ${resolvedUserId},
        ${customer.email},
        ${status},
        ${planType},
        ${customer.id},
        ${subscription.id},
        ${trialEndsAt},
        ${currentPeriodEnd},
        ${discountInfo.hasDiscount},
        ${discountInfo.discountPercent || null},
        ${discountInfo.monthlyAmountDue || null},
        ${discountInfo.couponId || null}
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
        user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
        updated_at = NOW()
    `;

    await sql`
      INSERT INTO user_profiles (user_id, stripe_customer_id)
      VALUES (${resolvedUserId}, ${customer.id})
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        updated_at = NOW()
    `;

    if (!customer.metadata?.userId) {
      await stripe.customers.update(customer.id, {
        metadata: { ...(customer.metadata || {}), userId: resolvedUserId },
      });
    }

    if (!subscription.metadata?.userId) {
      await stripe.subscriptions.update(subscription.id, {
        metadata: { ...(subscription.metadata || {}), userId: resolvedUserId },
      });
    }

    return NextResponse.json({
      success: true,
      userId: resolvedUserId,
      customerId: customer.id,
      subscriptionId: subscription.id,
      status,
      planType,
      customerEmail: customer.email,
    });
  } catch (error) {
    console.error('Subscription sync failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
