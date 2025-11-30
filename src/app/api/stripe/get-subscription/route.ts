import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

export const revalidate = 300;

function getStripe(secretKey?: string) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
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
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    const { userId, customerId, forceRefresh } = body;

    if (!userId && !customerId) {
      return NextResponse.json(
        { error: 'userId or customerId is required' },
        { status: 400 },
      );
    }

    // Try database first (fast path)
    if (userId) {
      const result = await sql`
        SELECT 
          user_id, user_email, status, plan_type,
          stripe_customer_id, stripe_subscription_id,
          trial_ends_at, current_period_end
        FROM subscriptions 
        WHERE user_id = ${userId}
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        return formatResponse(result.rows[0], forceRefresh);
      }
    }

    // Fallback: check Stripe directly (for users not yet in DB)
    if (customerId) {
      const stripeData = await checkStripeForSubscription(customerId, userId);
      if (stripeData) {
        return formatResponse(stripeData, forceRefresh);
      }
    }

    return NextResponse.json({
      success: true,
      subscription: null,
      plan: 'free',
      status: 'free',
      message: 'No subscription found',
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 },
    );
  }
}

async function checkStripeForSubscription(
  customerId: string,
  userId?: string,
): Promise<any | null> {
  let stripe = getStripe();
  if (!stripe) return null;

  let subscription: Stripe.Subscription | null = null;

  // Try new Stripe account
  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });
    if (subs.data.length > 0) {
      subscription = subs.data[0];
    }
  } catch {
    // Try legacy account
    if (process.env.STRIPE_SECRET_KEY_LEGACY) {
      stripe = getStripe(process.env.STRIPE_SECRET_KEY_LEGACY);
      if (stripe) {
        try {
          const subs = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            limit: 1,
          });
          if (subs.data.length > 0) {
            subscription = subs.data[0];
          }
        } catch {
          // No subscription found
        }
      }
    }
  }

  if (!subscription) return null;

  const mapped = mapStripeSubscription(subscription, customerId, userId);

  // Write to DB for faster lookups next time
  if (userId) {
    try {
      await sql`
        INSERT INTO subscriptions (
          user_id, status, plan_type,
          stripe_customer_id, stripe_subscription_id,
          trial_ends_at, current_period_end
        ) VALUES (
          ${userId}, ${mapped.status}, ${mapped.plan_type},
          ${customerId}, ${mapped.stripe_subscription_id},
          ${mapped.trial_ends_at}, ${mapped.current_period_end}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          status = EXCLUDED.status,
          plan_type = EXCLUDED.plan_type,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          trial_ends_at = EXCLUDED.trial_ends_at,
          current_period_end = EXCLUDED.current_period_end,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('Failed to cache subscription:', error);
    }
  }

  return mapped;
}

function mapStripeSubscription(
  sub: Stripe.Subscription,
  customerId: string,
  userId?: string,
) {
  const status = mapStatus(sub.status);
  const price = sub.items.data[0]?.price;
  const planType =
    sub.metadata?.plan_id ||
    price?.metadata?.plan_id ||
    (price?.recurring?.interval === 'year'
      ? 'lunary_plus_ai_annual'
      : 'lunary_plus');

  return {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    status,
    plan_type: planType,
    trial_ends_at: sub.trial_end
      ? new Date(sub.trial_end * 1000).toISOString()
      : null,
    current_period_end: (sub as any).current_period_end
      ? new Date((sub as any).current_period_end * 1000).toISOString()
      : null,
  };
}

function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
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

function formatResponse(sub: any, forceRefresh?: boolean) {
  const cacheHeaders: Record<string, string> = forceRefresh
    ? { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    : { 'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600' };

  return NextResponse.json(
    {
      success: true,
      subscription: {
        id: sub.stripe_subscription_id,
        status: sub.status,
        customerId: sub.stripe_customer_id,
        customer: sub.stripe_customer_id,
        plan: sub.plan_type,
        planName: sub.plan_type,
        current_period_end: sub.current_period_end
          ? Math.floor(new Date(sub.current_period_end).getTime() / 1000)
          : null,
        trial_end: sub.trial_ends_at
          ? Math.floor(new Date(sub.trial_ends_at).getTime() / 1000)
          : null,
        trialEnd: sub.trial_ends_at
          ? Math.floor(new Date(sub.trial_ends_at).getTime() / 1000)
          : null,
      },
      plan: sub.plan_type || 'free',
      status: sub.status || 'free',
      message: `Found ${sub.status} subscription`,
    },
    { headers: cacheHeaders },
  );
}
