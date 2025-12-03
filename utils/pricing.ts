export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  popular?: boolean;
  savings?: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Cosmic Explorer',
    description: 'Discover your celestial nature',
    price: 0,
    interval: 'month',
    stripePriceId: '', // No Stripe for free plan
    features: [
      'Daily moon phases & basic insights',
      'General tarot card of the day',
      '2 tarot spreads per month',
      'Basic lunar calendar',
      'General daily horoscope',
      'Access to grimoire knowledge',
      '1 free AI ritual/reading per week',
    ],
  },
  {
    id: 'lunary_plus',
    name: 'Lunary+',
    description: 'Rituals, Moon Circles & personalized guidance',
    price: 4.99,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_PRICE_ID || '',
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
      'Collections & saved insights',
      '7-day free trial',
    ],
  },
  {
    id: 'lunary_plus_ai',
    name: 'Lunary+ AI',
    description: 'Everything in Lunary+ plus unlimited AI guidance',
    price: 8.99,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_PRICE_ID || '',
    features: [
      'Everything in Lunary+',
      'Unlimited AI chat (Lunary Copilot)',
      'Personalized weekly reports',
      'AI ritual & reading generation',
      'Deeper tarot interpretations',
      'Advanced pattern analysis',
      'Downloadable PDF reports',
      'Saved chat threads',
      '7-day free trial',
    ],
  },
  {
    id: 'lunary_plus_ai_annual',
    name: 'Lunary+ AI Annual',
    description: 'Full year of cosmic wisdom with AI',
    price: 89.99,
    interval: 'year',
    stripePriceId:
      process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_ANNUAL_PRICE_ID || '',
    savings: 'Save 17%',
    features: [
      'Everything in Lunary+ AI',
      'Unlimited tarot spreads',
      'Yearly cosmic forecast',
      'Extended timeline analysis (6 & 12-month trends)',
      'Calendar download (ICS format)',
      'Unlimited collections & folders',
      'Priority customer support',
      '14-day free trial',
    ],
  },
];

export const FREE_TRIAL_DAYS = {
  monthly: 7,
  yearly: 14,
};

export const FEATURE_ACCESS = {
  free: [
    'moon_phases',
    'general_horoscope',
    'general_tarot',
    'general_crystal_recommendations',
    'grimoire',
    'lunar_calendar',
    'weekly_ai_ritual',
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
  const envVars: Record<string, string> = {};

  if (process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_PRICE_ID) {
    envVars[process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_PRICE_ID] =
      'lunary_plus';
  }
  if (process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_PRICE_ID) {
    envVars[process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_PRICE_ID] =
      'lunary_plus_ai';
  }
  if (process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_ANNUAL_PRICE_ID) {
    envVars[process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_ANNUAL_PRICE_ID] =
      'lunary_plus_ai_annual';
  }
  // Legacy Cosmic Guide monthly price still maps to Lunary+ access
  if (process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID) {
    envVars[process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID] = 'lunary_plus';
  }

  return envVars[priceId] || null;
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
export async function getPricingPlansWithStripeData(): Promise<PricingPlan[]> {
  try {
    // Fetch trial periods from Stripe for our price IDs
    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

    let monthlyTrialDays = 7; // fallback
    let yearlyTrialDays = 14; // fallback

    if (monthlyPriceId) {
      try {
        const response = await fetch('/api/stripe/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: monthlyPriceId }),
        });
        if (response.ok) {
          const data = await response.json();
          monthlyTrialDays = data.trial_period_days || 7;
        }
      } catch (error) {
        console.error('Error fetching monthly trial period:', error);
      }
    }

    if (yearlyPriceId) {
      try {
        const response = await fetch('/api/stripe/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: yearlyPriceId }),
        });
        if (response.ok) {
          const data = await response.json();
          yearlyTrialDays = data.trial_period_days || 14;
        }
      } catch (error) {
        console.error('Error fetching yearly trial period:', error);
      }
    }

    // Update the pricing plans with actual trial periods
    return PRICING_PLANS.map((plan) => {
      if (plan.id === 'monthly') {
        return {
          ...plan,
          features: plan.features.map((feature) =>
            feature.includes('day free trial')
              ? `${monthlyTrialDays}-day free trial`
              : feature,
          ),
        };
      }
      if (plan.id === 'lunary_plus_ai_annual') {
        return {
          ...plan,
          features: plan.features.map((feature) =>
            feature.includes('day free trial')
              ? `${yearlyTrialDays}-day free trial`
              : feature,
          ),
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
export async function getTrialDaysFromStripe(): Promise<{
  monthly: number;
  yearly: number;
}> {
  try {
    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

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
