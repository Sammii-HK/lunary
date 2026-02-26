import Stripe from 'stripe';

/**
 * Status priority for ranking subscriptions (higher = better)
 */
const STATUS_PRIORITY: Record<string, number> = {
  active: 4,
  trialing: 3,
  past_due: 2,
  canceled: 1,
};

/**
 * Plan tier priority for ranking subscriptions (higher = better)
 */
const PLAN_PRIORITY: Record<string, number> = {
  lunary_plus_ai_annual: 4,
  lunary_plus_ai: 3,
  lunary_plus_annual: 2,
  lunary_plus: 1,
};

/**
 * Given a list of Stripe subscriptions, pick the "best" one.
 * Ranks by status priority first (active > trialing > past_due > canceled),
 * then by plan tier (annual pro > monthly pro > plus).
 */
export function pickBestSubscription(
  subs: Stripe.Subscription[],
  getPlanType: (sub: Stripe.Subscription) => string,
): Stripe.Subscription | null {
  if (subs.length === 0) return null;

  return [...subs].sort((a, b) => {
    const statusDiff =
      (STATUS_PRIORITY[b.status] || 0) - (STATUS_PRIORITY[a.status] || 0);
    if (statusDiff !== 0) return statusDiff;
    const planA = getPlanType(a);
    const planB = getPlanType(b);
    return (PLAN_PRIORITY[planB] || 0) - (PLAN_PRIORITY[planA] || 0);
  })[0];
}

/**
 * Trial level for per-tier trial tracking.
 * - 'plus' = lunary_plus / lunary_plus_annual
 * - 'pro' = lunary_plus_ai / lunary_plus_ai_annual
 */
export type TrialLevel = 'plus' | 'pro';

export function getTrialLevel(planType: string): TrialLevel {
  if (planType === 'lunary_plus' || planType === 'lunary_plus_annual')
    return 'plus';
  return 'pro';
}
