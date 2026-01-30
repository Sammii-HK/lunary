/**
 * A/B Test Tracking Utilities
 *
 * Helper functions to include PostHog A/B test variants in conversion event metadata
 */

import { getFeatureFlag } from './posthog-client';

/**
 * PostHog test name -> Admin dashboard test name mapping
 */
const POSTHOG_TEST_MAPPING: Record<string, string> = {
  // Active PostHog experiments
  'cta-copy-test': 'cta_copy', // CTA copy variations (conversion impact)
  paywall_preview_style_v1: 'paywall_preview', // Paywall preview style
  'homepage-features-test': 'homepage_features', // Homepage card sections
  feature_preview_blur_v1: 'feature_preview', // Feature preview blur styles
  'transit-overflow-style': 'transit_overflow', // Transit display style
  'weekly-lock-style': 'weekly_lock', // Weekly tarot lock style
  'tarot-truncation-length': 'tarot_truncation', // Tarot text truncation
  'transit-limit-test': 'transit_limit', // Free user transit limit
};

/**
 * Variant value mapping (PostHog values -> A/B labels)
 * Supports both string variants and boolean flags
 */
function normalizeVariant(
  variant: string | boolean | undefined,
): 'A' | 'B' | null {
  if (variant === undefined || variant === null) return null;

  // Boolean flags: true = B, false = A
  if (typeof variant === 'boolean') {
    return variant ? 'B' : 'A';
  }

  // String variants
  const normalized = variant.toString().toLowerCase();

  // Common PostHog variant names
  if (
    normalized === 'control' ||
    normalized === 'a' ||
    normalized === 'variant_a'
  ) {
    return 'A';
  }
  if (
    normalized === 'test' ||
    normalized === 'b' ||
    normalized === 'variant_b'
  ) {
    return 'B';
  }

  return null;
}

/**
 * Get A/B test metadata for a specific PostHog experiment
 *
 * @param posthogTestName - The PostHog experiment/flag name
 * @returns Metadata object to merge into trackEvent() call, or null if not in test
 *
 * @example
 * ```ts
 * const abMetadata = getABTestMetadata('pricing_cta_test');
 * trackEvent('pricing_page_viewed', {
 *   metadata: {
 *     ...abMetadata,
 *     // other metadata
 *   }
 * });
 * ```
 */
export function getABTestMetadata(
  posthogTestName: string,
): Record<string, string> | null {
  const testName = POSTHOG_TEST_MAPPING[posthogTestName];
  if (!testName) {
    console.warn(`[A/B Test] Unknown PostHog test: ${posthogTestName}`);
    return null;
  }

  const variantRaw = getFeatureFlag(posthogTestName);
  const variant = normalizeVariant(variantRaw);

  if (!variant) {
    return null;
  }

  return {
    abTest: testName,
    abVariant: variant,
  };
}

/**
 * Get A/B test metadata from a variant value you already fetched
 *
 * @param posthogTestName - The PostHog experiment/flag name
 * @param variantValue - The variant value from useFeatureFlagVariant()
 * @returns Metadata object to merge into trackEvent() call, or null if not in test
 *
 * @example
 * ```ts
 * const ctaVariant = useFeatureFlagVariant('pricing_cta_test');
 * const abMetadata = getABTestMetadataFromVariant('pricing_cta_test', ctaVariant);
 * ```
 */
export function getABTestMetadataFromVariant(
  posthogTestName: string,
  variantValue: string | boolean | undefined,
): Record<string, string> | null {
  const testName = POSTHOG_TEST_MAPPING[posthogTestName];
  if (!testName) {
    console.warn(`[A/B Test] Unknown PostHog test: ${posthogTestName}`);
    return null;
  }

  const variant = normalizeVariant(variantValue);

  if (!variant) {
    return null;
  }

  return {
    abTest: testName,
    abVariant: variant,
  };
}

/**
 * Get metadata for multiple A/B tests at once
 *
 * @param posthogTestNames - Array of PostHog experiment/flag names
 * @returns Merged metadata object for all active tests
 *
 * @example
 * ```ts
 * // If user is in multiple tests, this will track all of them
 * const abMetadata = getMultipleABTestMetadata([
 *   'pricing_cta_test',
 *   'pricing_display_test'
 * ]);
 * ```
 *
 * Note: If user is in multiple tests, only the first one will be tracked
 * to avoid confusion in the admin dashboard. To track multiple tests,
 * make separate trackEvent() calls.
 */
export function getMultipleABTestMetadata(
  posthogTestNames: string[],
): Record<string, string> | null {
  for (const testName of posthogTestNames) {
    const metadata = getABTestMetadata(testName);
    if (metadata) {
      return metadata; // Return first active test
    }
  }
  return null;
}
