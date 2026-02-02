import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

export const revalidate = 300;

function sanitizeForLog(value: unknown): string {
  const str = typeof value === 'string' ? value : String(value);
  // Remove ASCII control characters (U+0000-U+001F and U+007F) to prevent log injection
  return str.replace(/[\x00-\x1F\x7F]/g, '');
}

function getStripe(secretKey?: string) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

async function findCustomerByEmail(email: string): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });
    return customers.data[0]?.id || null;
  } catch (error) {
    console.warn('Failed to lookup Stripe customer by email:', error);
    return null;
  }
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

    let { userId, customerId, forceRefresh, userEmail } = body;

    if (!userId && !customerId && !userEmail) {
      return NextResponse.json(
        { error: 'userId, customerId, or userEmail is required' },
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
        const dbRow = result.rows[0];
        // If status is 'cancelled' or forceRefresh is true, verify with Stripe
        // to get accurate cancel_at_period_end status
        let stripeCustomerId = dbRow.stripe_customer_id;
        const emailForLookup = dbRow.user_email || userEmail;
        if (!stripeCustomerId && emailForLookup) {
          const foundCustomerId = await findCustomerByEmail(emailForLookup);
          if (foundCustomerId) {
            stripeCustomerId = foundCustomerId;
            if (userId) {
              try {
                await sql`
                  UPDATE subscriptions
                  SET stripe_customer_id = ${stripeCustomerId},
                      user_email = COALESCE(user_email, ${emailForLookup}),
                      updated_at = NOW()
                  WHERE user_id = ${userId}
                `;
              } catch (error) {
                console.error('Failed to persist Stripe customer ID:', error);
              }
            }
          }
        }

        if (
          (forceRefresh || dbRow.status === 'cancelled') &&
          stripeCustomerId
        ) {
          const stripeData = await checkStripeForSubscription(
            stripeCustomerId,
            userId,
            emailForLookup || undefined,
          );
          if (stripeData) {
            return formatResponse(stripeData, forceRefresh);
          }
        }

        if (stripeCustomerId) {
          dbRow.stripe_customer_id = stripeCustomerId;
        }

        return formatResponse(dbRow, forceRefresh);
      }
    }

    if (!customerId && userEmail) {
      const foundCustomerId = await findCustomerByEmail(userEmail);
      if (foundCustomerId) {
        customerId = foundCustomerId;
      }
    }

    // Fallback: check Stripe directly (for users not yet in DB)
    if (customerId) {
      const stripeData = await checkStripeForSubscription(
        customerId,
        userId,
        userEmail,
      );
      if (stripeData) {
        return formatResponse(stripeData, forceRefresh);
      }
    }

    // RECOVERY: Check for orphaned subscriptions that match this user
    if (userId || userEmail) {
      try {
        const orphanedQuery = userId
          ? sql`
              SELECT stripe_subscription_id, stripe_customer_id, customer_email, status, plan_type
              FROM orphaned_subscriptions
              WHERE resolved = FALSE
                AND customer_email = (
                  SELECT email FROM "user" WHERE id = ${userId} LIMIT 1
                )
              ORDER BY created_at DESC
              LIMIT 1
            `
          : sql`
              SELECT stripe_subscription_id, stripe_customer_id, customer_email, status, plan_type
              FROM orphaned_subscriptions
              WHERE resolved = FALSE
                AND LOWER(customer_email) = LOWER(${userEmail})
              ORDER BY created_at DESC
              LIMIT 1
            `;

        const orphanedResult = await orphanedQuery;

        if (orphanedResult.rows.length > 0 && userId) {
          const orphaned = orphanedResult.rows[0];
          console.log(
            `🔄 Auto-recovering orphaned subscription ${sanitizeForLog(orphaned.stripe_subscription_id)} for user ${sanitizeForLog(userId)}`,
          );

          const stripe = getStripe();
          if (stripe) {
            // Update Stripe metadata
            await stripe.subscriptions.update(orphaned.stripe_subscription_id, {
              metadata: { userId },
            });
            await stripe.customers.update(orphaned.stripe_customer_id, {
              metadata: { userId },
            });

            // Link to user in database
            await sql`
              INSERT INTO subscriptions (
                user_id, user_email, status, plan_type,
                stripe_customer_id, stripe_subscription_id, trial_used
              ) VALUES (
                ${userId}, ${orphaned.customer_email}, ${orphaned.status}, ${orphaned.plan_type},
                ${orphaned.stripe_customer_id}, ${orphaned.stripe_subscription_id}, true
              )
              ON CONFLICT (user_id) DO UPDATE SET
                status = EXCLUDED.status,
                plan_type = EXCLUDED.plan_type,
                stripe_customer_id = EXCLUDED.stripe_customer_id,
                stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                updated_at = NOW()
            `;

            // Mark orphaned subscription as resolved
            await sql`
              UPDATE orphaned_subscriptions
              SET resolved = TRUE,
                  resolved_user_id = ${userId},
                  resolved_at = NOW(),
                  resolved_by = 'auto_recovery'
              WHERE stripe_subscription_id = ${orphaned.stripe_subscription_id}
            `;

            console.log(
              `✅ Successfully auto-recovered subscription for user ${sanitizeForLog(userId)}`,
            );

            // Return the recovered subscription
            return formatResponse(orphaned, forceRefresh);
          }
        }
      } catch (error) {
        console.error('Error checking for orphaned subscriptions:', error);
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
  userEmail?: string,
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
    // Keep going; fallback below may find customer by email
  }

  if (!subscription && userEmail) {
    const resolvedCustomerId = await findCustomerByEmail(userEmail);
    if (resolvedCustomerId && resolvedCustomerId !== customerId) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: resolvedCustomerId,
          status: 'all',
          limit: 1,
        });
        if (subs.data.length > 0) {
          subscription = subs.data[0];
          customerId = resolvedCustomerId;
        }
      } catch {
        // still null
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
          trial_ends_at, current_period_end, trial_used
        ) VALUES (
          ${userId}, ${mapped.status}, ${mapped.plan_type},
          ${customerId}, ${mapped.stripe_subscription_id},
          ${mapped.trial_ends_at}, ${mapped.current_period_end}, true
        )
        ON CONFLICT (user_id) DO UPDATE SET
          status = EXCLUDED.status,
          plan_type = EXCLUDED.plan_type,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          trial_ends_at = EXCLUDED.trial_ends_at,
          current_period_end = EXCLUDED.current_period_end,
          trial_used = true,
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
  // If subscription is set to cancel at period end but status is still 'active',
  // keep it as 'active' (not 'cancelled')
  const status =
    sub.cancel_at_period_end && sub.status === 'active'
      ? 'active' // Keep as active if it's set to cancel but hasn't ended yet
      : mapStatus(sub.status);
  const price = sub.items.data[0]?.price;

  // Determine plan type with multi-currency support
  let planType = sub.metadata?.plan_id || price?.metadata?.plan_id || null;

  // Try price ID mapping if metadata not found (supports multi-currency)
  if (!planType && price?.id) {
    const { getPlanIdFromPriceId } = require('../../../../../utils/pricing');
    planType = getPlanIdFromPriceId(price.id);
  }

  // Fallback to interval-based mapping
  if (!planType) {
    planType =
      price?.recurring?.interval === 'year'
        ? 'lunary_plus_ai_annual'
        : 'lunary_plus';
  }

  return {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    status,
    plan_type: planType,
    cancel_at_period_end: sub.cancel_at_period_end || false,
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
  // CRITICAL FIX: Never use stale-while-revalidate for subscription data
  // Users seeing "free" status when they're paying is a critical bug
  // Always fetch fresh data - subscription status is too important to cache
  const cacheHeaders: Record<string, string> = {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  // cancel_at_period_end might not be in DB, default to false
  const cancelAtPeriodEnd =
    sub.cancel_at_period_end !== undefined ? sub.cancel_at_period_end : false;

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
        cancelAtPeriodEnd,
        current_period_end: sub.current_period_end
          ? Math.floor(new Date(sub.current_period_end).getTime() / 1000)
          : null,
        currentPeriodEnd: sub.current_period_end
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
