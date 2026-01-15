import { getPriceForCurrency, type PlanId } from './stripe-prices';
import {
  CHAT_LIMITS,
  FEATURE_ACCESS,
  FREE_TRIAL_DAYS,
  JOURNAL_LIMITS,
  PRICING_PLANS,
  type FeatureKey,
  type PlanId as EntitlementPlanId,
  type PricingPlan,
} from './entitlements';

export {
  CHAT_LIMITS,
  FEATURE_ACCESS,
  FREE_TRIAL_DAYS,
  JOURNAL_LIMITS,
  PRICING_PLANS,
  type FeatureKey,
  type EntitlementPlanId as PlanId,
  type PricingPlan,
};

function resolvePriceId(planId: PlanId, currency: string): string | null {
  const normalizedCurrency = currency.toUpperCase();
  const price = getPriceForCurrency(planId, normalizedCurrency);
  if (price?.priceId) {
    return price.priceId;
  }

  const fallbackPrice = getPriceForCurrency(planId, 'USD');
  return fallbackPrice?.priceId || null;
}

/**
 * Normalizes plan type to one of the four valid plans:
 * - 'free'
 * - 'lunary_plus' (Plus)
 * - 'lunary_plus_ai' (Plus AI)
 * - 'lunary_plus_ai_annual' (Plus AI Annual)
 *
 * IMPORTANT: This function preserves specific plan identifiers.
 * Only converts generic 'monthly'/'yearly' when specific plan isn't available.
 * WARNING: Converting 'monthly' to 'lunary_plus' may be incorrect if user has 'lunary_plus_ai'.
 * Always prefer fetching specific plan name from Stripe via price ID mapping.
 */
export function normalizePlanType(planType: string | undefined): string {
  if (!planType) return 'free';

  // Preserve specific plan identifiers first - these are the four valid plans
  if (
    planType === 'lunary_plus_ai' ||
    planType === 'lunary_plus_ai_annual' ||
    planType === 'lunary_plus' ||
    planType === 'free'
  ) {
    return planType;
  }

  // Normalize generic terms only when specific plan isn't available
  // WARNING: This is a fallback - prefer using specific plan names from Stripe
  if (planType === 'yearly' || planType === 'annual') {
    return 'lunary_plus_ai_annual';
  }

  // WARNING: 'monthly' could be either 'lunary_plus' or 'lunary_plus_ai'
  // Defaulting to 'lunary_plus' is conservative but may be incorrect
  // Always prefer fetching from Stripe to get exact plan name
  if (planType === 'monthly') {
    return 'lunary_plus';
  }

  return planType;
}

export function getPlanIdFromPriceId(priceId: string): string | null {
  // First, check the comprehensive price mapping (supports all currencies)
  try {
    const { STRIPE_PRICE_MAPPING } = require('./stripe-prices');
    for (const [planId, currencies] of Object.entries(STRIPE_PRICE_MAPPING)) {
      for (const currencyData of Object.values(
        currencies as Record<string, { priceId: string }>,
      )) {
        if (currencyData.priceId === priceId) {
          return planId;
        }
      }
    }
  } catch (error) {
    // If stripe-prices module not available, continue to env var fallback
    console.warn(
      'Failed to load STRIPE_PRICE_MAPPING, falling back to env vars:',
      error,
    );
  }

  return null;
}

export function hasFeatureAccess(
  subscriptionStatus: string | undefined,
  planType: string | undefined,
  feature: FeatureKey,
): boolean {
  const freeFeatures = FEATURE_ACCESS.free as readonly FeatureKey[];

  if (!subscriptionStatus || subscriptionStatus === 'free') {
    return freeFeatures.includes(feature);
  }

  // Normalize status: 'trialing' -> 'trial' for consistency
  const normalizedStatus =
    subscriptionStatus === 'trialing' ? 'trial' : subscriptionStatus;

  if (normalizedStatus === 'trial' || normalizedStatus === 'active') {
    const normalizedPlan = normalizePlanType(planType);

    // CRITICAL: 'yearly' should always map to annual plan features
    // This ensures any yearly subscription gets annual plan access
    const effectivePlan =
      normalizedPlan === 'yearly' ? 'lunary_plus_ai_annual' : normalizedPlan;

    const planFeatures =
      effectivePlan === 'lunary_plus_ai_annual'
        ? FEATURE_ACCESS.lunary_plus_ai_annual
        : effectivePlan === 'lunary_plus_ai'
          ? FEATURE_ACCESS.lunary_plus_ai
          : FEATURE_ACCESS.lunary_plus;

    return (
      freeFeatures.includes(feature) ||
      (planFeatures as readonly FeatureKey[]).includes(feature)
    );
  }

  return false;
}

// Helper function to check if user has access to birth chart features
export function hasBirthChartAccess(
  subscriptionStatus: string | undefined,
  planType?: string | undefined,
): boolean {
  return hasFeatureAccess(subscriptionStatus, planType, 'birth_chart');
}

/**
 * Check if user has access to a specific date for calendar features.
 * Free users: Can only access dates within 7 days back from today
 * Paying users (trial/active): Full calendar access (no date restrictions)
 * Dates are normalized to date-only (YYYY-MM-DD) for accurate comparison
 */
export function hasDateAccess(
  date: Date,
  subscriptionStatus: string | undefined,
): boolean {
  // Normalize dates to date-only (no time) for comparison
  const normalizeDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const targetDateStr = normalizeDate(date);
  const todayStr = normalizeDate(new Date());

  // Parse dates for comparison
  const targetDate = new Date(targetDateStr + 'T12:00:00');
  const today = new Date(todayStr + 'T12:00:00');

  // Calculate days difference
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If user is paying (trial or active), grant full access
  if (
    subscriptionStatus === 'trial' ||
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trialing'
  ) {
    return true;
  }

  // Free users: Can only access dates within 7 days back from today
  // Allow today and up to 7 days in the past
  return diffDays >= 0 && diffDays <= 7;
}

// Helper function to check if user can collect birthday
export function canCollectBirthday(
  subscriptionStatus: string | undefined,
): boolean {
  return hasFeatureAccess(subscriptionStatus, undefined, 'birthday_collection');
}

export function getTrialDaysRemaining(trialEndsAt: string | undefined): number {
  if (!trialEndsAt) return 0;

  const trialEnd = new Date(trialEndsAt);
  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export function isTrialExpired(trialEndsAt: string | undefined): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) < new Date();
}

// Dynamic function to get pricing plans with actual trial periods from Stripe
export async function getPricingPlansWithStripeData(
  currency: string = 'USD',
): Promise<PricingPlan[]> {
  try {
    const planConfigs: Array<{
      id: 'lunary_plus' | 'lunary_plus_ai' | 'lunary_plus_ai_annual';
      fallback: number;
    }> = [
      { id: 'lunary_plus', fallback: 7 },
      { id: 'lunary_plus_ai', fallback: 7 },
      { id: 'lunary_plus_ai_annual', fallback: 14 },
    ];

    const trialOverrides: Record<string, number> = {};

    for (const config of planConfigs) {
      const priceId = resolvePriceId(config.id, currency);
      let trialDays = config.fallback;

      if (priceId) {
        try {
          const response = await fetch('/api/stripe/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId }),
          });
          if (response.ok) {
            const data = await response.json();
            trialDays = data.trial_period_days || config.fallback;
          }
        } catch (error) {
          console.error(`Error fetching trial period for ${config.id}:`, error);
        }
      }

      trialOverrides[config.id] = trialDays;
    }

    return PRICING_PLANS.map((plan) => {
      const override = trialOverrides[plan.id];
      if (override !== undefined) {
        return {
          ...plan,
          trialDays: override,
        };
      }
      return plan;
    });
  } catch (error) {
    console.error('Error fetching pricing plans with Stripe data:', error);
    return PRICING_PLANS; // fallback to hardcoded plans
  }
}

// Update the FREE_TRIAL_DAYS to be dynamic
export async function getTrialDaysFromStripe(
  currency: string = 'USD',
): Promise<{
  monthly: number;
  yearly: number;
}> {
  try {
    const monthlyPriceId = resolvePriceId('lunary_plus', currency);
    const yearlyPriceId = resolvePriceId('lunary_plus_ai_annual', currency);

    const promises = [];

    if (monthlyPriceId) {
      promises.push(
        fetch('/api/stripe/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: monthlyPriceId }),
        }).then((response) =>
          response.ok ? response.json() : { trial_period_days: 7 },
        ),
      );
    } else {
      promises.push(Promise.resolve({ trial_period_days: 7 }));
    }

    if (yearlyPriceId) {
      promises.push(
        fetch('/api/stripe/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: yearlyPriceId }),
        }).then((response) =>
          response.ok ? response.json() : { trial_period_days: 14 },
        ),
      );
    } else {
      promises.push(Promise.resolve({ trial_period_days: 14 }));
    }

    const [monthlyData, yearlyData] = await Promise.all(promises);

    return {
      monthly: monthlyData.trial_period_days || 7,
      yearly: yearlyData.trial_period_days || 14,
    };
  } catch (error) {
    console.error('Error fetching trial days from Stripe:', error);
    return FREE_TRIAL_DAYS; // fallback to hardcoded values
  }
}
