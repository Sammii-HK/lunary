/**
 * Automatic A/B Test Tracking Hook
 *
 * Automatically tracks PostHog A/B test variants with page views and conversions
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useFeatureFlagVariant } from './useFeatureFlag';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';
import { trackEvent } from '@/lib/analytics';

/**
 * Track page view with all active A/B test variants
 *
 * @param pageName - Name of the page for tracking (e.g., 'horoscope', 'tarot', 'dashboard')
 * @param eventType - Event type to track (default: 'page_viewed')
 * @param tests - Optional array of specific tests to track. If not provided, tracks all common tests.
 *
 * @example
 * ```tsx
 * function HoroscopePage() {
 *   useABTestTracking('horoscope');
 *   // Automatically tracks all active A/B tests on this page
 * }
 * ```
 */
export function useABTestTracking(
  pageName: string,
  eventType: 'page_viewed' | 'app_opened' = 'page_viewed',
  tests?: string[],
) {
  // Fetch all relevant A/B test variants
  const ctaCopy = useFeatureFlagVariant('cta-copy-test');
  const paywallPreview = useFeatureFlagVariant('paywall_preview_style_v1');
  const homepageFeatures = useFeatureFlagVariant('homepage-features-test');
  const featurePreview = useFeatureFlagVariant('feature_preview_blur_v1');
  const transitOverflow = useFeatureFlagVariant('transit-overflow-style');
  const weeklyLock = useFeatureFlagVariant('weekly-lock-style');
  const tarotTruncation = useFeatureFlagVariant('tarot-truncation-length');
  const transitLimit = useFeatureFlagVariant('transit-limit-test');

  // Collect active A/B test metadata
  const abMetadata = useMemo(() => {
    const allTests = [
      { test: 'cta-copy-test', variant: ctaCopy },
      { test: 'paywall_preview_style_v1', variant: paywallPreview },
      { test: 'homepage-features-test', variant: homepageFeatures },
      { test: 'feature_preview_blur_v1', variant: featurePreview },
      { test: 'transit-overflow-style', variant: transitOverflow },
      { test: 'weekly-lock-style', variant: weeklyLock },
      { test: 'tarot-truncation-length', variant: tarotTruncation },
      { test: 'transit-limit-test', variant: transitLimit },
    ];

    // Filter to specific tests if provided
    const relevantTests = tests
      ? allTests.filter((t) => tests.includes(t.test))
      : allTests;

    // Find first active test (user is in)
    for (const { test, variant } of relevantTests) {
      const metadata = getABTestMetadataFromVariant(test, variant);
      if (metadata) {
        return metadata;
      }
    }

    return null;
  }, [
    ctaCopy,
    paywallPreview,
    homepageFeatures,
    featurePreview,
    transitOverflow,
    weeklyLock,
    tarotTruncation,
    transitLimit,
    tests,
  ]);

  // Track page view with A/B metadata
  useEffect(() => {
    if (abMetadata) {
      trackEvent(eventType, {
        pagePath: `/${pageName}`,
        metadata: {
          ...abMetadata,
          page: pageName,
        },
      });
    }
  }, [pageName, eventType, abMetadata]);

  return {
    abMetadata,
    hasActiveTest: !!abMetadata,
  };
}

/**
 * Track a conversion event with active A/B test metadata
 *
 * @example
 * ```tsx
 * const { trackConversion } = useABTestConversion();
 *
 * const handleUpgradeClick = () => {
 *   trackConversion('upgrade_clicked', { featureName: 'tarot_full_reading' });
 * };
 * ```
 */
export function useABTestConversion() {
  // Fetch all A/B test variants
  const ctaCopy = useFeatureFlagVariant('cta-copy-test');
  const paywallPreview = useFeatureFlagVariant('paywall_preview_style_v1');
  const homepageFeatures = useFeatureFlagVariant('homepage-features-test');
  const featurePreview = useFeatureFlagVariant('feature_preview_blur_v1');

  const trackConversion = useMemo(() => {
    return (
      eventName: string,
      data?: { featureName?: string; pagePath?: string; [key: string]: any },
    ) => {
      // Try to find active A/B test metadata
      const tests = [
        { test: 'cta-copy-test', variant: ctaCopy },
        { test: 'paywall_preview_style_v1', variant: paywallPreview },
        { test: 'homepage-features-test', variant: homepageFeatures },
        { test: 'feature_preview_blur_v1', variant: featurePreview },
      ];

      let abMetadata = null;
      for (const { test, variant } of tests) {
        const metadata = getABTestMetadataFromVariant(test, variant);
        if (metadata) {
          abMetadata = metadata;
          break;
        }
      }

      if (abMetadata) {
        trackEvent(eventName as any, {
          ...data,
          metadata: {
            ...abMetadata,
            ...data?.metadata,
          },
        });
      } else {
        // Track without A/B metadata if no active test
        trackEvent(eventName as any, data);
      }
    };
  }, [ctaCopy, paywallPreview, homepageFeatures, featurePreview]);

  return { trackConversion };
}

/**
 * Get active A/B test variants for the current user
 * Useful for conditional rendering based on test variant
 *
 * @example
 * ```tsx
 * const { ctaCopy } = useABTestVariants();
 *
 * return (
 *   <button>
 *     {ctaCopy === 'mystical' ? 'Unlock Your Destiny' : 'Get Started'}
 *   </button>
 * );
 * ```
 */
export function useABTestVariants() {
  const ctaCopy = useFeatureFlagVariant('cta-copy-test');
  const paywallPreview = useFeatureFlagVariant('paywall_preview_style_v1');
  const homepageFeatures = useFeatureFlagVariant('homepage-features-test');
  const featurePreview = useFeatureFlagVariant('feature_preview_blur_v1');
  const transitOverflow = useFeatureFlagVariant('transit-overflow-style');
  const weeklyLock = useFeatureFlagVariant('weekly-lock-style');
  const tarotTruncation = useFeatureFlagVariant('tarot-truncation-length');
  const transitLimit = useFeatureFlagVariant('transit-limit-test');

  return {
    ctaCopy,
    paywallPreview,
    homepageFeatures,
    featurePreview,
    transitOverflow,
    weeklyLock,
    tarotTruncation,
    transitLimit,
  };
}
