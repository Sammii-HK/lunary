/**
 * Single Source of Truth for all CTA copy across the app
 * Update here to change copy everywhere
 */

export const CTA_COPY = {
  // Authentication & Onboarding
  auth: {
    createChart: 'Create your birth chart',
    signUp: 'Get started',
    continue: 'Continue',
  },

  // Pricing & Conversion
  pricing: {
    startTrial: 'Continue', // Used for upgrade buttons
    viewPricing: 'Plans & Pricing',
    currentPlan: 'Current Plan',
    openApp: 'Open app',
    comparePlans: 'Compare plans',
  },

  // Navigation
  navigation: {
    exploreFeatures: 'Explore all features →',
  },

  // Feature-specific CTAs (used by A/B test variants)
  features: {
    horoscope: {
      noVerb: 'Your Personal Horoscope',
      mystical: 'Discover Your Personal Horoscope',
      simple: 'See Your Personal Horoscope',
    },
    tarotDaily: {
      noVerb: 'Full Interpretation',
      mystical: 'Read Full Interpretation',
      simple: 'Read Full Interpretation',
    },
    tarotWeekly: {
      noVerb: 'Your Weekly Card',
      mystical: 'Reveal Your Weekly Card',
      simple: 'See Your Weekly Card',
    },
    chartConnection: {
      noVerb: 'Your Chart Connection',
      mystical: 'See Your Chart Connection',
      simple: 'See Your Chart Connection',
    },
    transitList: {
      noVerb: 'Complete Transit List',
      mystical: 'See All Transits',
      simple: 'See All Transits',
    },
    crystal: {
      noVerb: 'Your Crystal Reading',
      mystical: 'Discover Your Crystal Reading',
      simple: 'See Your Crystal Reading',
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
