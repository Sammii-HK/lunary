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