'use client';

import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { captureEvent } from '@/lib/posthog-client';
import { CTA_COPY as CTA_CONSTANTS, getFeatureCTA } from '@/lib/cta-copy';

type CTACopyVariant = 'no-verb' | 'mystical' | 'simple';

export function useCTACopy() {
  const variantRaw = useFeatureFlagVariant('cta-copy-test');
  const variant: CTACopyVariant =
    variantRaw === 'no-verb' ||
    variantRaw === 'mystical' ||
    variantRaw === 'simple'
      ? variantRaw
      : 'no-verb';

  // Map PostHog variant (kebab-case) to constant key (camelCase)
  const variantKey = variant === 'no-verb' ? 'noVerb' : variant;

  const getCopy = (feature: keyof typeof CTA_CONSTANTS.features): string =>
    getFeatureCTA(feature, variantKey);

  const trackCTAClick = (
    ctaType: keyof typeof CTA_CONSTANTS.features,
    page: string,
  ) => {
    captureEvent('cta_clicked', {
      variant,
      cta_type: ctaType,
      page,
      tier: 'free',
    });
  };

  return {
    horoscope: getCopy('horoscope'),
    tarotDaily: getCopy('tarotDaily'),
    tarotWeekly: getCopy('tarotWeekly'),
    chartConnection: getCopy('chartConnection'),
    transitList: getCopy('transitList'),
    crystal: getCopy('crystal'),
    trackCTAClick,
  };
}
