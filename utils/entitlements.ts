import type { PlanId } from './stripe-prices';

export type { PlanId } from './stripe-prices';

export type PlanKey = 'free' | PlanId;

export type PricingPlan = {
  id: PlanKey;
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
    'personal_day_number',
    'personal_year_number',
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
    'personalized_transit_readings',
    'moon_circles',
    'ritual_generator',
    'collections',
    'monthly_insights',
    'personal_day_number',
    'personal_day_meaning',
    'personal_year_number',
    'personal_year_meaning',
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
    'personalized_transit_readings',
    'moon_circles',
    'ritual_generator',
    'unlimited_ai_chat',
    'deeper_readings',
    'weekly_reports',
    'saved_chat_threads',
    'downloadable_reports',
    'ai_ritual_generation',
    'collections',
    'advanced_patterns',
    'monthly_insights',
    'personal_day_number',
    'personal_day_meaning',
    'personal_year_number',
    'personal_year_meaning',
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
    'personalized_transit_readings',
    'moon_circles',
    'ritual_generator',
    'collections',
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
    'personal_day_number',
    'personal_day_meaning',
    'personal_year_number',
    'personal_year_meaning',
  ],
} as const satisfies Record<PlanKey, readonly string[]>;

export type FeatureKey =
  (typeof FEATURE_ACCESS)[keyof typeof FEATURE_ACCESS][number];

export const FREE_TRIAL_DAYS = {
  monthly: 7,
  yearly: 14,
} as const;

export const CHAT_LIMITS: Record<PlanKey, number> = {
  free: 3,
  lunary_plus: 50,
  lunary_plus_ai: 300,
  lunary_plus_ai_annual: 300,
};

export const JOURNAL_LIMITS = {
  freeMonthlyEntries: 3,
} as const;

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Cosmic Explorer',
    description: 'Designed for light daily reflection',
    price: 0,
    interval: 'month',
    stripePriceId: '', // No Stripe for free plan
    chatLimitPerDay: CHAT_LIMITS.free,
    chatLabel: 'Astral Guide chat',
    trialDays: 0,
    features: [
      'Your personal birth chart',
      'Daily moon phases & basic insights',
      'General tarot card of the day',
      'Limited tarot spreads (free library only)',
      '1 tarot spread per month',
      'Basic lunar calendar',
      'General daily horoscope',
      'Access to grimoire knowledge',
      'Book of Shadows journal (3 entries/month)',
      'Chat history (last 50 messages)',
      'Personal Day number (number only)',
      'Personal Year number (number only)',
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
    chatLimitPerDay: CHAT_LIMITS.lunary_plus,
    chatLabel: 'Generous daily Astral Guide chat',
    trialDays: FREE_TRIAL_DAYS.monthly,
    features: [
      'Everything in Cosmic Explorer',
      'Complete birth chart analysis',
      'Personalized daily horoscopes',
      'Personal transit impacts',
      'Solar Return & birthday insights',
      'Moon Circles (New & Full Moon)',
      'Personal tarot card & guidance',
      'All tarot spreads unlocked',
      '10 tarot spreads per month',
      'Ritual generator',
      'Personalized crystal recommendations',
      'Monthly cosmic insights',
      'Personal Day & Personal Year interpretations',
      'Tarot pattern analysis',
      'Cosmic State (shareable snapshot)',
      'Book of Shadows journal (no limit)',
      'Save chat messages to collections (no limit)',
      'Collections (no limit)',
      'Collection folders (no limit)',
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
    chatLimitPerDay: CHAT_LIMITS.lunary_plus_ai,
    chatLabel: 'Expanded Astral Guide chat',
    trialDays: FREE_TRIAL_DAYS.monthly,
    features: [
      'Everything in Lunary+',
      'Personalized weekly reports',
      'Astral Guide ritual prompts (AI)',
      'Deeper tarot interpretations',
      'Advanced pattern analysis',
      'Downloadable PDF reports',
      'Generous saved chat threads',
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
    chatLimitPerDay: CHAT_LIMITS.lunary_plus_ai_annual,
    chatLabel: 'Expanded Astral Guide chat',
    trialDays: FREE_TRIAL_DAYS.yearly,
    features: [
      'Everything in Lunary+ AI',
      'Unlimited tarot spreads',
      'Yearly cosmic forecast',
      'Extended timeline analysis (6 & 12-month trends)',
      'Calendar download (ICS format)',
      'Priority customer support',
    ],
  },
];
