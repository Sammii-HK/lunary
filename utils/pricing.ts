import { getPriceForCurrency, type PlanId } from './stripe-prices';

export type PricingPlan = {
  id: string;
  tier: 'free' | 'plus' | 'ai' | 'ai_annual';
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  popular?: boolean;
  savings?: string;
  chatLimitPerDay?: number;
  chatLabel?: string;
  trialDays?: number;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Cosmic Explorer',
    description: 'Designed for light daily reflection',
    price: 0,
    interval: 'month',
    stripePriceId: '', // No Stripe for free plan
    chatLimitPerDay: 3,
    chatLabel: 'Astral Guide chat',
    trialDays: 0,
    features: [
      'Your personal birth chart',
      'Daily moon phases & basic insights',
      'General tarot card of the day',
      '2 tarot spreads per month',
      'Basic lunar calendar',
      'General daily horoscope',
      'Access to grimoire knowledge',
    ],
  },
  {
    id: 'lunary_plus',
    tier: 'plus',
    name: 'Lunary+',
    description: 'Personalized guidance from your exact birth chart',
    price: 4.99,
    interval: 'month',
    stripePriceId: '',
    chatLimitPerDay: 50,
    chatLabel: 'Generous daily Astral Guide chat',
    trialDays: 7,
    features: [
      'Complete birth chart analysis',
      'Personalized daily horoscopes',
      'Personal transit impacts',
      'Solar Return & birthday insights',
      'Moon Circles (New & Full Moon)',
      'Personal tarot card & guidance',
      '10 tarot spreads per month',
      'Ritual generator',
      'Personalized crystal recommendations',
      'Monthly cosmic insights',
      'Tarot pattern analysis',
      'Cosmic State (shareable snapshot)',
      'Limited Collections & saved insights',
    ],
  },
  {
    id: 'lunary_plus_ai',
    tier: 'ai',
    name: 'Lunary+ AI',
    description: 'Everything in Lunary+ with deeper Astral Guide chat',
    price: 8.99,
    interval: 'month',
    stripePriceId: '',
    chatLimitPerDay: 300,
    chatLabel: 'Effectively unlimited AI chat',
    trialDays: 7,
    features: [
      'Everything in Lunary+',
      'Personalized weekly reports',
      'Astral Guide ritual prompts (AI)',
      'Deeper tarot interpretations',
      'Advanced pattern analysis',
      'Downloadable PDF reports',
      'Saved chat threads',
      'Deeper readings and weekly reports',
    ],
  },
  {
    id: 'lunary_plus_ai_annual',
    tier: 'ai_annual',
    name: 'Lunary+ AI Annual',
    description: 'Full year of Lunary+ with Astral Guide chat',
    price: 89.99,
    interval: 'year',
    stripePriceId: '',
    savings: 'Save 17%',
    chatLimitPerDay: 300,
    chatLabel: 'Effectively unlimited AI chat',
    trialDays: 14,
    features: [
      'Everything in Lunary+ AI',
      'Unlimited tarot spreads',
      'Yearly cosmic forecast',
      'Extended timeline analysis (6 & 12-month trends)',
      'Calendar download (ICS format)',
      'Unlimited collections & folders',
      'Priority customer support',
    ],
  },
];

export const FREE_TRIAL_DAYS = {
  monthly: 7,
  yearly: 14,
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

export const FEATURE_ACCESS = {
  free: [
    'moon_phases',
    'general_horoscope',
    'general_tarot',
    'general_crystal_recommendations',
    'grimoire',
    'lunar_calendar',
    'weekly_ai_ritual',
    'birthday_collection',
    'birth_chart', // Allow free users to view their birth chart (encourage signups & sharing)
  ],
  lunary_plus: [
    'birth_chart',
    'birthday_collection',
    'personalized_horoscope',
    'personal_tarot',
    'personalized_crystal_recommendations',
    'transit_calendar',
    'tarot_patterns',
    'solar_return',
    'cosmic_profile',
    'moon_circles',
    'ritual_generator',
    'collections',
    'monthly_insights',
  ],
  lunary_plus_ai: [
    'birth_chart',
    'birthday_collection',
    'personalized_horoscope',
    'personal_tarot',
    'personalized_crystal_recommendations',
    'transit_calendar',
    'tarot_patterns',
    'solar_return',
    'cosmic_profile',
    'moon_circles',
    'ritual_generator',
    'unlimited_ai_chat',
    'deeper_readings',
    'weekly_reports',
    'saved_chat_threads',
    'downloadable_reports',
    'ai_ritual_generation',
    'collections',
    'unlimited_collections',
    'advanced_patterns',
    'monthly_insights',
  ],
  lunary_plus_ai_annual: [
    'birth_chart',
    'birthday_collection',
    'personalized_horoscope',
    'personal_tarot',
    'personalized_crystal_recommendations',
    'transit_calendar',
    'tarot_patterns',
    'solar_return',
    'cosmic_profile',
    'moon_circles',
    'ritual_generator',
    'collections',
    'unlimited_collections',
    'unlimited_ai_chat',
    'deeper_readings',
    'weekly_reports',
    'saved_chat_threads',
    'downloadable_reports',
    'ai_ritual_generation',
    'unlimited_tarot_spreads',
    'advanced_patterns',
    'yearly_forecast',
    'data_export',
    'monthly_insights',
  ],
};

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
  feature: string,
): boolean {
  if (!subscriptionStatus || subscriptionStatus === 'free') {
    return FEATURE_ACCESS.free.includes(feature);
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
      FEATURE_ACCESS.free.includes(feature) || planFeatures.includes(feature)
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
