import { sql } from '@vercel/postgres';
import Stripe from 'stripe';
import {
  FREE_PLAN_HISTORY_RETENTION_DAYS,
  FREE_PLAN_MONTHLY_READING_LIMIT,
  MONTHLY_PLAN_MONTHLY_READING_LIMIT,
  PLAN_RANK,
  SUBSCRIBER_HISTORY_RETENTION_DAYS,
  TAROT_SPREAD_MAP,
  TarotPlan,
} from '@/constants/tarotSpreads';
import { SpreadCardInsight } from '@/utils/tarot/spreadReading';

export type SubscriptionStatus =
  | 'free'
  | 'trial'
  | 'active'
  | 'cancelled'
  | 'past_due';

export interface SubscriptionSnapshot {
  plan: TarotPlan;
  status: SubscriptionStatus;
}

export interface UsageSnapshot {
  plan: TarotPlan;
  status: SubscriptionStatus;
  monthlyLimit: number | null;
  monthlyUsed: number;
  monthlyRemaining: number | null;
  historyWindowDays: number;
}

const normalizePlan = (
  planType?: string | null,
  status?: string | null,
): TarotPlan => {
  // Preserve specific plan identifiers first
  if (planType === 'lunary_plus_ai_annual') return 'yearly';
  if (planType === 'lunary_plus_ai') return 'monthly';
  if (planType === 'lunary_plus') return 'monthly';

  // Normalize generic terms
  if (planType === 'yearly') return 'yearly';
  if (planType === 'monthly') return 'monthly';

  // Trial users should get their plan type, not default to monthly
  if (status === 'trial' || status === 'trialing') {
    // If they have a specific plan type, use it
    if (planType?.includes('annual') || planType?.includes('yearly')) {
      return 'yearly';
    }
    if (planType?.includes('monthly') || planType?.includes('plus')) {
      return 'monthly';
    }
    // Default trial to monthly
    return 'monthly';
  }

  if (status === 'active' && planType) {
    return planType as TarotPlan;
  }
  return 'free';
};

export const getSubscription = async (
  userId: string,
  userEmail?: string | null,
): Promise<SubscriptionSnapshot> => {
  try {
    let result = await sql`
      SELECT plan_type, status
      FROM subscriptions
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    // Fallback: if no subscription found by user_id, try looking up by email
    if (result.rows.length === 0 && userEmail) {
      console.log(
        `[tarot/readings] No subscription found for user_id ${userId}, trying email lookup: ${userEmail}`,
      );
      result = await sql`
        SELECT plan_type, status, stripe_customer_id
        FROM subscriptions
        WHERE user_email = ${userEmail}
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    // Fallback: if no subscription in DB, try fetching from Stripe by email
    if (result.rows.length === 0 && userEmail) {
      console.log(
        `[tarot/readings] No subscription in DB, attempting Stripe lookup for email: ${userEmail}`,
      );
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error('STRIPE_SECRET_KEY not configured');
        }
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Find customer by email
        const customers = await stripe.customers.list({
          email: userEmail,
          limit: 1,
        });

        if (customers.data.length > 0) {
          const customer = customers.data[0];
          const customerId = customer.id;

          // Fetch subscriptions for this customer
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            limit: 10,
          });

          if (subscriptions.data.length > 0) {
            // Get the most recent active/trial subscription, or most recent
            const activeSub = subscriptions.data.find((sub) =>
              ['active', 'trialing'].includes(sub.status),
            );
            const stripeSub = activeSub || subscriptions.data[0];

            const planType =
              stripeSub.items.data[0]?.price?.recurring?.interval === 'month'
                ? 'monthly'
                : 'yearly';
            const mappedStatus =
              stripeSub.status === 'trialing'
                ? 'trial'
                : stripeSub.status === 'active'
                  ? 'active'
                  : stripeSub.status === 'canceled'
                    ? 'cancelled'
                    : stripeSub.status === 'past_due'
                      ? 'past_due'
                      : 'free';

            // Write to database for future lookups
            try {
              const trialEndsAt = stripeSub.trial_end
                ? new Date(stripeSub.trial_end * 1000).toISOString()
                : null;
              const currentPeriodEnd = (stripeSub as any).current_period_end
                ? new Date(
                    (stripeSub as any).current_period_end * 1000,
                  ).toISOString()
                : null;

              await sql`
                INSERT INTO subscriptions (
                  user_id,
                  user_email,
                  status,
                  plan_type,
                  stripe_customer_id,
                  stripe_subscription_id,
                  trial_ends_at,
                  current_period_end,
                  trial_used
                ) VALUES (
                  ${userId},
                  ${userEmail},
                  ${mappedStatus},
                  ${planType},
                  ${customerId},
                  ${stripeSub.id},
                  ${trialEndsAt},
                  ${currentPeriodEnd},
                  true
                )
                ON CONFLICT (user_id) DO UPDATE SET
                  status = EXCLUDED.status,
                  plan_type = EXCLUDED.plan_type,
                  stripe_customer_id = EXCLUDED.stripe_customer_id,
                  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                  trial_ends_at = EXCLUDED.trial_ends_at,
                  current_period_end = EXCLUDED.current_period_end,
                  user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
                  trial_used = true,
                  updated_at = NOW()
              `;
              console.log(
                `✅ Synced subscription from Stripe to database for user ${userId}`,
              );

              return {
                plan: normalizePlan(planType, mappedStatus),
                status: mappedStatus as SubscriptionStatus,
              };
            } catch (dbError) {
              console.error(
                '[tarot/readings] Failed to write synced subscription to DB:',
                dbError,
              );
              // Still return the subscription even if DB write fails
              return {
                plan: normalizePlan(planType, mappedStatus),
                status: mappedStatus as SubscriptionStatus,
              };
            }
          }
        }
      } catch (stripeError) {
        console.error(
          '[tarot/readings] Failed to fetch subscription from Stripe:',
          stripeError,
        );
      }
    }

    if (result.rows.length === 0) {
      console.log(
        `[tarot/readings] No subscription found for user ${userId}${userEmail ? ` (email: ${userEmail})` : ''}, defaulting to free`,
      );
      return {
        plan: 'free',
        status: 'free',
      };
    }

    const row = result.rows[0] as { plan_type?: string; status?: string };
    const plan = normalizePlan(row.plan_type, row.status);
    const subscriptionStatus = (row.status || 'free') as SubscriptionStatus;

    console.log(`[tarot/readings] Subscription lookup for user ${userId}:`, {
      plan_type: row.plan_type,
      status: row.status,
      normalized_plan: plan,
      normalized_status: subscriptionStatus,
      found_by_email: result.rows.length > 0 && !result.rows[0]?.user_id,
    });

    return {
      plan,
      status: subscriptionStatus,
    };
  } catch (error) {
    console.error(
      '[tarot/readings] Failed to load subscription snapshot, defaulting to free.',
      error,
    );
    return {
      plan: 'free',
      status: 'free',
    };
  }
};

export const computeUsageSnapshot = async (
  userId: string,
  subscription: SubscriptionSnapshot,
): Promise<UsageSnapshot> => {
  let monthlyUsed = 0;

  try {
    const result = await sql`
      SELECT COUNT(*)::int as count
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= date_trunc('month', NOW())
    `;

    monthlyUsed =
      result.rows.length > 0 ? Number(result.rows[0].count ?? 0) : 0;
  } catch (error) {
    console.warn('[tarot/readings] Failed to compute usage snapshot', error);
  }

  const monthlyLimit =
    subscription.plan === 'free'
      ? FREE_PLAN_MONTHLY_READING_LIMIT
      : subscription.plan === 'monthly'
        ? MONTHLY_PLAN_MONTHLY_READING_LIMIT
        : null; // Yearly: unlimited
  const monthlyRemaining =
    monthlyLimit !== null ? Math.max(monthlyLimit - monthlyUsed, 0) : null;

  return {
    plan: subscription.plan,
    status: subscription.status,
    monthlyLimit,
    monthlyUsed,
    monthlyRemaining,
    historyWindowDays:
      subscription.plan === 'free'
        ? FREE_PLAN_HISTORY_RETENTION_DAYS
        : SUBSCRIBER_HISTORY_RETENTION_DAYS,
  };
};

export const isSpreadAccessible = (
  spreadSlug: string,
  plan: TarotPlan,
): boolean => {
  const spread = TAROT_SPREAD_MAP[spreadSlug];
  if (!spread) {
    return false;
  }

  // Monthly and yearly have the same access for tarot pulls
  // Both can access all spreads (monthly users can access yearly spreads)
  if (plan === 'monthly' || plan === 'yearly') {
    return true;
  }

  return PLAN_RANK[plan] >= PLAN_RANK[spread.minimumPlan];
};

export const mapRowToReading = (row: any) => {
  const cards: SpreadCardInsight[] = (
    Array.isArray(row.cards) ? row.cards : []
  ).map((item: any) => ({
    positionId: item.positionId,
    positionLabel: item.positionLabel,
    positionPrompt: item.positionPrompt,
    card: item.card,
    insight: item.insight,
  }));

  return {
    id: row.id,
    spreadSlug: row.spread_slug,
    spreadName: row.spread_name,
    summary: row.summary,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    journalingPrompts: Array.isArray(row.journaling_prompts)
      ? row.journaling_prompts
      : [],
    notes: row.notes ?? '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    cards,
    metadata: row.metadata || {},
    planSnapshot: row.plan_snapshot,
    aiInterpretation: row.ai_interpretation ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
