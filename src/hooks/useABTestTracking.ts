/**
 * Automatic A/B Test Tracking Hook
 *
 * Automatically tracks PostHog A/B test variants with page views and conversions.
 * Fires one impression event PER active test so each test appears in the admin dashboard.
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useFeatureFlagVariant } from './useFeatureFlag';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';
import { trackEvent } from '@/lib/analytics';

/**
 * Track page view with all active A/B test variants
 *
 * Fires one event per active test so each test records impressions independently.
 *
 * @param pageName - Name of the page for tracking (e.g., 'horoscope', 'tarot', 'dashboard')
 * @param eventType - Event type to track (default: 'page_viewed')
 * @param tests - Optional array of specific tests to track. If not provided, tracks all common tests.
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

  // Collect ALL active A/B test metadata (not just the first)
  const activeTests = useMemo(() => {
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

    // Collect ALL active tests (user has a variant assigned)
    const results: Array<{ abTest: string; abVariant: string }> = [];
    for (const { test, variant } of relevantTests) {
      const metadata = getABTestMetadataFromVariant(test, variant);
      if (metadata) {
        results.push(metadata as { abTest: string; abVariant: string });
      }
    }

    return results;
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

  // Stable serialization for useEffect dependency
  const activeTestsKey = useMemo(
    () =>
      activeTests
        .map((t) => `${t.abTest}:${t.abVariant}`)
        .sort()
        .join(','),
    [activeTests],
  );

  // Track whether PostHog flags have resolved (any variant returned a value)
  const flagsResolved = useMemo(() => {
    return [
      ctaCopy,
      paywallPreview,
      homepageFeatures,
      featurePreview,
      transitOverflow,
      weeklyLock,
      tarotTruncation,
      transitLimit,
    ].some((v) => v !== undefined);
  }, [
    ctaCopy,
    paywallPreview,
    homepageFeatures,
    featurePreview,
    transitOverflow,
    weeklyLock,
    tarotTruncation,
    transitLimit,
  ]);

  // Fire one impression event per active test.
  // Wait for PostHog flags to resolve before firing to avoid a useless bare event.
  useEffect(() => {
    if (!flagsResolved) return; // PostHog hasn't loaded yet — wait

    if (activeTests.length === 0) {
      // Flags loaded but user isn't in any test — track bare page view
      trackEvent(eventType, {
        pagePath: `/${pageName}`,
        metadata: { page: pageName },
      });
      return;
    }

    for (const testMeta of activeTests) {
      trackEvent(eventType, {
        pagePath: `/${pageName}`,
        metadata: {
          ...testMeta,
          page: pageName,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName, eventType, activeTestsKey, flagsResolved]);

  // Return first active test for backward compatibility
  const abMetadata = activeTests.length > 0 ? activeTests[0] : null;

  return {
    abMetadata,
    activeTests,
    hasActiveTest: activeTests.length > 0,
  };
}

/**
 * Track a conversion event with ALL active A/B test metadata
 *
 * Fires one conversion event per active test so each test records conversions independently.
 */
export function useABTestConversion() {
  // Fetch all A/B test variants
  const ctaCopy = useFeatureFlagVariant('cta-copy-test');
  const paywallPreview = useFeatureFlagVariant('paywall_preview_style_v1');
  const homepageFeatures = useFeatureFlagVariant('homepage-features-test');
  const featurePreview = useFeatureFlagVariant('feature_preview_blur_v1');
  const transitOverflow = useFeatureFlagVariant('transit-overflow-style');
  const weeklyLock = useFeatureFlagVariant('weekly-lock-style');
  const tarotTruncation = useFeatureFlagVariant('tarot-truncation-length');
  const transitLimit = useFeatureFlagVariant('transit-limit-test');

  const trackConversion = useMemo(() => {
    return (
      eventName: string,
      data?: { featureName?: string; pagePath?: string; [key: string]: any },
    ) => {
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

      // Collect all active test metadata
      const activeMetadata: Array<Record<string, string>> = [];
      for (const { test, variant } of allTests) {
        const metadata = getABTestMetadataFromVariant(test, variant);
        if (metadata) {
          activeMetadata.push(metadata);
        }
      }

      if (activeMetadata.length === 0) {
        // Track without A/B metadata if no active test
        trackEvent(eventName as any, data);
        return;
      }

      // Fire one conversion per active test
      for (const abMeta of activeMetadata) {
        trackEvent(eventName as any, {
          ...data,
          metadata: {
            ...abMeta,
            ...data?.metadata,
          },
        });
      }
    };
  }, [
    ctaCopy,
    paywallPreview,
    homepageFeatures,
    featurePreview,
    transitOverflow,
    weeklyLock,
    tarotTruncation,
    transitLimit,
  ]);

  return { trackConversion };
}

/**
 * Get active A/B test variants for the current user
 * Useful for conditional rendering based on test variant
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
