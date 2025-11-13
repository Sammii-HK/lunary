import { sql } from '@vercel/postgres';
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
  if (planType === 'yearly') return 'yearly';
  if (planType === 'monthly') return 'monthly';
  if (status === 'trial') return 'monthly';
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
        AND archived_at IS NULL
        AND created_at >= NOW() - INTERVAL '30 days'
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
