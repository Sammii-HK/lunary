/**
 * Automatic A/B Test Tracking Hook
 *
 * Reads variants from the server-assigned cookie (set by middleware) for instant
 * availability — no PostHog SDK timing dependency. Fires one impression event
 * per active test so each test appears in the admin dashboard.
 */

'use client';

import { useEffect, useMemo } from 'react';
import { getABTestVariantClient } from '@/lib/ab-tests-client';
import { trackEvent, getCtaAttribution } from '@/lib/analytics';

/** PostHog test name -> admin dashboard test name */
const TEST_NAME_MAPPING: Record<string, string> = {
  'cta-copy-test': 'cta_copy',
  paywall_preview_style_v1: 'paywall_preview',
  'homepage-features-test': 'homepage_features',
  feature_preview_blur_v1: 'feature_preview',
  'transit-overflow-style': 'transit_overflow',
  'weekly-lock-style': 'weekly_lock',
  'tarot-truncation-length': 'tarot_truncation',
  'transit-limit-test': 'transit_limit',
  'inline-cta-style': 'inline_cta',
  'hero-subhead-test': 'hero_subhead',
};

/** All trackable test names (read from middleware cookie) */
const ALL_TEST_NAMES = Object.keys(TEST_NAME_MAPPING);

/**
 * Track page view with all active A/B test variants.
 * Reads variants from the middleware cookie — available on first render.
 * Fires one event per active test so each records impressions independently.
 */
export function useABTestTracking(
  pageName: string,
  eventType: 'page_viewed' | 'app_opened' = 'page_viewed',
  tests?: string[],
) {
  // Read variants from cookie (instant, no async)
  const activeTests = useMemo(() => {
    const testNames = tests ?? ALL_TEST_NAMES;
    const results: Array<{ abTest: string; abVariant: string }> = [];

    for (const testName of testNames) {
      const dashboardName = TEST_NAME_MAPPING[testName];
      if (!dashboardName) continue;

      const variant = getABTestVariantClient(testName);
      if (variant) {
        results.push({ abTest: dashboardName, abVariant: variant });
      }
    }

    return results;
    // Cookie doesn't change during the session, so this only needs to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests]);

  // Stable key for useEffect dependency
  const activeTestsKey = useMemo(
    () =>
      activeTests
        .map((t) => `${t.abTest}:${t.abVariant}`)
        .sort()
        .join(','),
    [activeTests],
  );

  // Fire one impression event per active test
  useEffect(() => {
    if (activeTests.length === 0) {
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
  }, [pageName, eventType, activeTestsKey]);

  // Backward compatibility
  const abMetadata = activeTests.length > 0 ? activeTests[0] : null;

  return {
    abMetadata,
    activeTests,
    hasActiveTest: activeTests.length > 0,
  };
}

/**
 * Track a conversion event attributed to the correct A/B test.
 *
 * Previously this fired one conversion per active test, which meant a single
 * signup created 6+ conversion events (one for every PostHog experiment the
 * user happened to be enrolled in). This inflated conversion counts and made
 * app-level tests show more conversions than impressions.
 *
 * Now: if the user clicked a CTA with A/B test metadata (stored in
 * sessionStorage by storeCtaAttribution), we attribute the conversion ONLY
 * to that specific test. If no CTA attribution exists (e.g. direct signup),
 * we attribute to the single most relevant active test (the first one), not
 * all of them.
 */
export function useABTestConversion() {
  const activeTests = useMemo(() => {
    const results: Array<{ abTest: string; abVariant: string }> = [];

    for (const testName of ALL_TEST_NAMES) {
      const dashboardName = TEST_NAME_MAPPING[testName];
      if (!dashboardName) continue;

      const variant = getABTestVariantClient(testName);
      if (variant) {
        results.push({ abTest: dashboardName, abVariant: variant });
      }
    }

    return results;
  }, []);

  const trackConversion = useMemo(() => {
    return (
      eventName: string,
      data?: { featureName?: string; pagePath?: string; [key: string]: any },
    ) => {
      // Check if we have CTA attribution — this tells us exactly which
      // test drove this conversion
      const ctaAttribution = getCtaAttribution();

      if (ctaAttribution?.cta_ab_test && ctaAttribution?.cta_ab_variant) {
        // Attribute conversion to the specific test the user clicked
        trackEvent(eventName as any, {
          ...data,
          metadata: {
            abTest: ctaAttribution.cta_ab_test,
            abVariant: ctaAttribution.cta_ab_variant,
            ...ctaAttribution,
            ...data?.metadata,
          },
        });
        return;
      }

      // No CTA attribution — attribute to the first active test only
      // (not all of them, which would inflate conversion counts)
      if (activeTests.length > 0) {
        trackEvent(eventName as any, {
          ...data,
          metadata: {
            ...activeTests[0],
            ...data?.metadata,
          },
        });
        return;
      }

      // No active tests at all
      trackEvent(eventName as any, data);
    };
  }, [activeTests]);

  return { trackConversion };
}

/**
 * Get active A/B test variants for the current user.
 * Reads from the middleware cookie for instant availability.
 */
export function useABTestVariants() {
  return {
    ctaCopy: getABTestVariantClient('cta-copy-test'),
    paywallPreview: getABTestVariantClient('paywall_preview_style_v1'),
    homepageFeatures: getABTestVariantClient('homepage-features-test'),
    featurePreview: getABTestVariantClient('feature_preview_blur_v1'),
    transitOverflow: getABTestVariantClient('transit-overflow-style'),
    weeklyLock: getABTestVariantClient('weekly-lock-style'),
    tarotTruncation: getABTestVariantClient('tarot-truncation-length'),
    transitLimit: getABTestVariantClient('transit-limit-test'),
    heroSubhead: getABTestVariantClient('hero-subhead-test'),
    heroValueStack: getABTestVariantClient('hero_value_stack_v1'),
    stickyFreeCard: getABTestVariantClient('sticky_free_card_v1'),
  };
}
