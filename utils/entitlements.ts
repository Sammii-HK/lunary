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

// Friend limits by tier
export const FRIEND_LIMITS = {
  free: 5, // Free users can add up to 5 friends with basic compatibility
  paid: Infinity, // Paid users get unlimited friends
} as const;

const FEATURE_ACCESS_BASE = {
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
    'cosmic_patterns', // Basic cosmic patterns (moon phase correlations)
    'keyword_mood_detection', // Free keyword-based mood tagging (70% coverage)
    'friend_connections_basic', // Free users can add up to 5 friends with basic compatibility %
  ],
  lunary_plus: [
    'birth_chart',
    'birthday_collection',
    'personalized_horoscope',
    'personal_tarot',
    'personalized_crystal_recommendations',
    'transit_calendar',
    'tarot_patterns',
    'tarot_patterns_basic', // 14-90 day patterns, progress bars, basic visualizations
    'pattern_drill_down', // Interactive frequent cards with cosmic context
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
    'cosmic_patterns', // Basic cosmic patterns (moon phase correlations)
    'keyword_mood_detection', // Free keyword-based mood tagging (70% coverage)
    'friend_connections', // Friend invites, synastry analysis (basic tier)
  ],
  lunary_plus_ai: [
    'birth_chart',
    'birthday_collection',
    'personalized_horoscope',
    'personal_tarot',
    'personalized_crystal_recommendations',
    'transit_calendar',
    'tarot_patterns',
    'tarot_patterns_basic', // 14-90 day patterns, progress bars
    'tarot_patterns_advanced', // Radial charts, sparklines, drill-down, heatmap
    'pattern_drill_down', // Interactive frequent cards
    'pattern_heatmap', // Calendar heatmap view
    'card_combinations', // Combination analysis
    'ai_pattern_insights', // Astral Chat pattern narratives
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
    'cosmic_patterns', // Basic cosmic patterns (moon phase correlations)
    'advanced_cosmic_patterns', // Premium patterns (planetary, aspects, natal transits)
    'keyword_mood_detection', // Keyword-based mood tagging
    'ai_mood_detection', // AI-enhanced mood tagging (smart fallback for complex emotions)
    'enhanced_pattern_analysis', // Moon phase, transit, and house activation patterns
    'friend_connections', // Friend invites, synastry analysis
    'relationship_timing', // Best Times to Connect - Pro only
    'shared_cosmic_events', // Shared Cosmic Events - Pro only
  ],
  lunary_plus_ai_annual: [
    'birth_chart',
    'birthday_collection',
    'personalized_horoscope',
    'personal_tarot',
    'personalized_crystal_recommendations',
    'transit_calendar',
    'tarot_patterns',
    'tarot_patterns_basic', // 14-90 day patterns
    'tarot_patterns_advanced', // Advanced visualizations
    'pattern_drill_down', // Interactive cards
    'pattern_heatmap', // Calendar heatmap
    'card_combinations', // Combination analysis
    'ai_pattern_insights', // Astral Chat narratives
    'pattern_export', // PDF/JSON export
    'pattern_comparison', // Period comparison
    'predictive_insights', // AI predictions
    'year_over_year', // YoY analysis (existing)
    'pattern_network_graph', // Network visualization (future)
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
    'cosmic_patterns', // Basic cosmic patterns (moon phase correlations)
    'advanced_cosmic_patterns', // Premium patterns (planetary, aspects, natal transits)
    'keyword_mood_detection', // Keyword-based mood tagging
    'ai_mood_detection', // AI-enhanced mood tagging (smart fallback for complex emotions)
    'enhanced_pattern_analysis', // Moon phase, transit, and house activation patterns
    'friend_connections', // Friend invites, synastry analysis
    'relationship_timing', // Best Times to Connect - Pro only
    'shared_cosmic_events', // Shared Cosmic Events - Pro only
  ],
} as const satisfies Record<PlanKey, readonly string[]>;

export type FeatureKey =
  (typeof FEATURE_ACCESS_BASE)[keyof typeof FEATURE_ACCESS_BASE][number];

export const FEATURE_ACCESS: Record<PlanKey, readonly FeatureKey[]> =
  FEATURE_ACCESS_BASE;

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

export const FREE_TRANSIT_LIMIT = 2;
export const FREE_DAILY_TAROT_TRUNCATE_LENGTH = 120;

export const JOURNAL_LIMITS = {
  freeMonthlyEntries: 3,
} as const;

export const JOURNAL_PROMPT_LIMITS: Record<PlanKey, number> = {
  free: 1,
  lunary_plus: 5,
  lunary_plus_ai: 5,
  lunary_plus_ai_annual: 5,
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Cosmic Explorer',
    description: 'Perfect for exploring astrology',
    price: 0,
    interval: 'month',
    stripePriceId: '', // No Stripe for free plan
    chatLimitPerDay: CHAT_LIMITS.free,
    chatLabel: 'Limited daily Astral Guide chat',
    trialDays: 0,
    features: [
      'Your personal birth chart',
      'Daily moon phases & insights (with supermoon detection)',
      'General tarot card of the day',
      'Tarot pattern analysis (last 7 days)',
      'Limited tarot spreads (free library only)',
      '1 tarot spread per month',
      'Basic lunar calendar',
      'General daily horoscope',
      'Access to grimoire knowledge',
      'Book of Shadows journal (3 entries/month)',
      '1 journal prompt per tarot/horoscope page',
      'Smart keyword mood detection (auto-tags journal emotions)',
      'Basic cosmic pattern detection (moon phase correlations)',
      'Astral Guide context memory (no history, no memory snippets)',
      'Chat history (last 50 messages)',
      'Personal Day number (number only)',
      'Personal Year number (number only)',
      'Cosmic Circle: Add up to 5 friends with basic compatibility %',
    ],
  },
  {
    id: 'lunary_plus',
    tier: 'plus',
    name: 'Lunary+',
    description: 'For building a consistent practice',
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
      'Moon phase with personalized house placement',
      'Personal transit impacts (with duration tracking)',
      'Solar Return & birthday insights',
      'Moon Circles (New & Full Moon)',
      'Personal tarot card drawn from your birth chart, with transit context',
      'All tarot spreads unlocked (10/month)',
      'Personalized crystal recommendations',
      'Monthly cosmic insights',
      'Personal Day & Personal Year interpretations',
      'Tarot pattern analysis (up to 6 months)',
      'View cosmic context for each card appearance (moon phase & aspects)',
      'Personalized transit analysis for frequent cards',
      'Smart keyword mood detection (auto-tags journal emotions)',
      'Basic cosmic pattern detection (moon phase correlations)',
      'Cosmic State (shareable snapshot)',
      'Book of Shadows journal (no limit)',
      '5 journal prompts per tarot/horoscope page',
      'Astral Guide context memory (4 recent messages + 2 memory snippets)',
      'Save chat messages to collections (no limit)',
      'Collections (no limit)',
      'Collection folders (no limit)',
      'Cosmic Circle: Unlimited friends + full synastry analysis',
    ],
  },
  {
    id: 'lunary_plus_ai',
    tier: 'ai',
    name: 'Lunary+ Pro',
    description: 'For serious students & practitioners',
    price: 8.99,
    interval: 'month',
    stripePriceId: '',
    chatLimitPerDay: CHAT_LIMITS.lunary_plus_ai,
    chatLabel: 'Expanded Astral Guide chat',
    trialDays: FREE_TRIAL_DAYS.monthly,
    features: [
      'Everything in Lunary+',
      'Personalized weekly reports',
      'Astral Guide ritual generation',
      'Tarot pattern analysis (up to 12 months + year-over-year)',
      'Advanced multi-dimensional pattern analysis',
      'Enhanced mood detection (catches subtle emotions & implicit feelings)',
      'Enhanced pattern analysis (moon phase, transit, house activation)',
      'Advanced cosmic pattern detection (planetary, aspects, natal transits)',
      'Downloadable PDF reports',
      'Astral Guide context memory (8 recent messages + 4 memory snippets)',
      'All tarot spreads unlocked (10/month)',
      'Book of Shadows journal (no limit)',
      'Save chat messages to collections (no limit)',
      'Collections (no limit)',
      'Collection folders (no limit)',
      'Cosmic Circle: Unlimited friends + full synastry analysis',
      'Best Times to Connect: know when cosmic timing supports connection',
      'Shared Cosmic Events: moon phases that activate both charts',
    ],
  },
  {
    id: 'lunary_plus_ai_annual',
    tier: 'ai_annual',
    name: 'Lunary+ Pro Annual',
    description: 'For serious students & practitioners',
    price: 89.99,
    interval: 'year',
    stripePriceId: '',
    savings: 'Save 17%',
    chatLimitPerDay: CHAT_LIMITS.lunary_plus_ai_annual,
    chatLabel: 'Expanded Astral Guide chat',
    trialDays: FREE_TRIAL_DAYS.yearly,
    features: [
      'Everything in Lunary+ Pro',
      'Unlimited tarot spreads',
      'Yearly cosmic forecast',
      'Extended timeline analysis (6 & 12-month trends)',
      'Enhanced mood detection (catches subtle emotions & implicit feelings)',
      'Enhanced pattern analysis (moon phase, transit, house activation)',
      'Advanced cosmic pattern detection (planetary, aspects, natal transits)',
      'Book of Shadows journal (no limit)',
      'Astral Guide context memory (8 recent messages + 4 memory snippets)',
      'Save chat messages to collections (no limit)',
      'Collections & folders (no limit)',
      'Cosmic Circle: Unlimited friends + full synastry analysis',
      'Best Times to Connect: know when cosmic timing supports connection',
      'Shared Cosmic Events: moon phases that activate both charts',
    ],
  },
];
