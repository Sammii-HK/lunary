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
      'Sun sign horoscope',
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
    popular: true,
    features: [
      'Complete birth chart analysis',
      'Personalized daily horoscopes',
      'Personal tarot card & guidance',
      '10 tarot spreads per month',
      'Daily transit calendar',
      'Tarot pattern analysis',
      'Crystal & herb recommendations',
      'Moon Circles (New & Full Moon)',
      'Ritual generator',
      'Unlimited cosmic profile access',
      'Cosmic State (shareable astrological snapshot)',
      'Collections & saved insights',
      'Access to shop & moon packs',
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
      'Deeper tarot readings',
      'Personalized weekly reports',
      'Saved chat threads',
      'Cosmic Report Generator (downloadable PDF reports)',
      'AI ritual & reading generation',
      'Unlimited collections & folders',
      '7-day free trial',
    ],
  },
  {
    id: 'lunary_plus_ai_annual',
    name: 'Lunary+ AI Annual',
    description: 'Full year of cosmic wisdom with AI',
    price: 79.99,
    interval: 'year',
    stripePriceId:
      process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_ANNUAL_PRICE_ID || '',
    savings: 'Save 26%',
    features: [
      'Everything in Lunary+ AI',
      'Unlimited tarot spreads',
      'Advanced pattern analysis',
      'Yearly cosmic forecast',
      'Export your cosmic data',
      'Unlimited collections & folders',
      'Customer support',
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
  ],
};

export function normalizePlanType(planType: string | undefined): string {
  if (!planType) return 'free';

  if (planType === 'yearly' || planType === 'lunary_plus_ai_annual') {
    return 'lunary_plus_ai_annual';
  }

  if (planType === 'monthly' || planType === 'lunary_plus') {
    return 'lunary_plus';
  }

  return planType;
}

export function getPlanIdFromPriceId(priceId: string): string | null {
  const envVars: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_PRICE_ID || '']: 'lunary_plus',
    [process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_PRICE_ID || '']:
      'lunary_plus_ai',
    [process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_ANNUAL_PRICE_ID || '']:
      'lunary_plus_ai_annual',
    [process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '']: 'lunary_plus',
    [process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || '']:
      'lunary_plus_ai_annual',
  };

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

  if (subscriptionStatus === 'trial' || subscriptionStatus === 'active') {
    const normalizedPlan = normalizePlanType(planType);

    const planFeatures =
      normalizedPlan === 'lunary_plus_ai_annual'
        ? FEATURE_ACCESS.lunary_plus_ai_annual
        : normalizedPlan === 'lunary_plus_ai'
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
