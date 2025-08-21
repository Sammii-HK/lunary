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
      'Basic lunar calendar',
      'Sun sign horoscope',
      'Access to grimoire knowledge'
    ]
  },
  {
    id: 'monthly',
    name: 'Cosmic Guide',
    description: 'Complete personalized cosmic experience',
    price: 4.99,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    popular: true,
    features: [
      'Complete birth chart analysis',
      'Personalized daily horoscopes',
      'Personal tarot card & guidance',
      'Daily transit calendar',
      'Tarot pattern analysis',
      'Crystal & herb recommendations',
      'Solar return insights',
      'Unlimited cosmic profile access',
      '7-day free trial'
    ]
  },
  {
    id: 'yearly',
    name: 'Cosmic Master',
    description: 'Full year of cosmic wisdom',
    price: 39.99,
    interval: 'year',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || '',
    savings: 'Save 33%',
    features: [
      'Everything in Cosmic Guide',
      'Priority access to new features',
      'Advanced pattern analysis',
      'Yearly cosmic forecast',
      'Export your cosmic data',
      'Email support',
      '14-day free trial'
    ]
  }
];

export const FREE_TRIAL_DAYS = {
  monthly: 7,
  yearly: 14
};

export const FEATURE_ACCESS = {
  free: [
    'moon_phases',
    'general_tarot',
    'sun_sign_horoscope', 
    'grimoire',
    'lunar_calendar'
  ],
  trial: [
    'birth_chart',
    'personalized_horoscope',
    'personal_tarot',
    'transit_calendar',
    'tarot_patterns',
    'crystal_recommendations',
    'solar_return',
    'cosmic_profile'
  ],
  active: [
    'birth_chart',
    'personalized_horoscope', 
    'personal_tarot',
    'transit_calendar',
    'tarot_patterns',
    'crystal_recommendations',
    'solar_return',
    'cosmic_profile',
    'advanced_patterns',
    'data_export',
    'priority_support'
  ]
};

export function hasFeatureAccess(
  subscriptionStatus: string | undefined,
  feature: string
): boolean {
  if (!subscriptionStatus || subscriptionStatus === 'free') {
    return FEATURE_ACCESS.free.includes(feature);
  }
  
  if (subscriptionStatus === 'trial') {
    return FEATURE_ACCESS.free.includes(feature) || FEATURE_ACCESS.trial.includes(feature);
  }
  
  if (subscriptionStatus === 'active') {
    return FEATURE_ACCESS.free.includes(feature) || 
           FEATURE_ACCESS.trial.includes(feature) || 
           FEATURE_ACCESS.active.includes(feature);
  }
  
  return false;
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
              : feature
          ),
        };
      }
      if (plan.id === 'yearly') {
        return {
          ...plan,
          features: plan.features.map((feature) =>
            feature.includes('day free trial')
              ? `${yearlyTrialDays}-day free trial`
              : feature
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
export async function getTrialDaysFromStripe(): Promise<{ monthly: number; yearly: number }> {
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
        }).then(response => response.ok ? response.json() : { trial_period_days: 7 })
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
        }).then(response => response.ok ? response.json() : { trial_period_days: 14 })
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