/**
 * Single Source of Truth for all CTA copy across the app
 * Update here to change copy everywhere
 */

export const CTA_COPY = {
  // Authentication & Onboarding
  auth: {
    createChart: 'Create your free birth chart', // ✅ Emphasize "free" to remove friction
    signUp: 'Start your practice', // More aligned with daily ritual concept
    continue: 'Continue',
  },

  // Pricing & Conversion
  pricing: {
    startTrial: "See what's included", // Clear value, not pushy
    viewPricing: 'Explore plans', // Softer than "Plans & Pricing"
    currentPlan: 'Your plan',
    openApp: 'Open app',
    comparePlans: 'Compare', // Shorter, less salesy
  },

  // Navigation
  navigation: {
    exploreFeatures: 'Explore all features →', // ✅ Good
  },

  // Feature-specific CTAs
  features: {
    horoscope: {
      noVerb: 'Your personal horoscope', // ✅ My favorite - invitation
      mystical: 'See your personal horoscope', // Clearer for buttons
      simple: 'See your horoscope',
    },
    tarotDaily: {
      noVerb: 'Your full interpretation', // Better than just "Full"
      mystical: 'Your full interpretation', // Drop "Read" - less commanding
      simple: 'Full interpretation',
    },
    tarotWeekly: {
      noVerb: 'Your weekly card', // Personal invitation
      mystical: 'Pull your weekly card', // Action but ritual-focused
      simple: 'Weekly card',
    },
    chartConnection: {
      noVerb: 'How this connects to your chart', // More descriptive
      mystical: 'See your chart connection',
      simple: 'Chart connection',
    },
    transitList: {
      noVerb: "All of today's transits", // More specific
      mystical: 'See all transits',
      simple: 'All transits',
    },
    crystal: {
      noVerb: 'Your crystal reading', // Simple invitation
      mystical: 'Your crystal reading', // Same - don't need verb
      simple: 'Crystal reading',
    },
  },
} as const;

// Type for A/B test variants
export type CTAVariant = 'noVerb' | 'mystical' | 'simple';

// Helper to get feature CTA copy by variant
export function getFeatureCTA(
  feature: keyof typeof CTA_COPY.features,
  variant: CTAVariant,
): string {
  return CTA_COPY.features[feature][variant];
}

// Type exports for autocomplete
export type CTACopyKey = keyof typeof CTA_COPY;
export type AuthCTAKey = keyof typeof CTA_COPY.auth;
export type PricingCTAKey = keyof typeof CTA_COPY.pricing;
export type FeatureCTAKey = keyof typeof CTA_COPY.features;
