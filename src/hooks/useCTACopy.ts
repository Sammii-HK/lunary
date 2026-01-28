'use client';

import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { captureEvent } from '@/lib/posthog-client';

type CTACopyVariant = 'no-verb' | 'mystical' | 'simple';

const CTA_COPY: Record<string, Record<CTACopyVariant, string>> = {
  horoscope: {
    'no-verb': 'Your Personal Horoscope',
    mystical: 'Discover Your Personal Horoscope',
    simple: 'See Your Personal Horoscope',
  },
  tarotDaily: {
    'no-verb': 'Full Interpretation',
    mystical: 'Read Full Interpretation',
    simple: 'Read Full Interpretation',
  },
  tarotWeekly: {
    'no-verb': 'Your Weekly Card',
    mystical: 'Reveal Your Weekly Card',
    simple: 'See Your Weekly Card',
  },
  chartConnection: {
    'no-verb': 'Your Chart Connection',
    mystical: 'See Your Chart Connection',
    simple: 'See Your Chart Connection',
  },
  transitList: {
    'no-verb': 'Complete Transit List',
    mystical: 'See All Transits',
    simple: 'See All Transits',
  },
};

export function useCTACopy() {
  const variantRaw = useFeatureFlagVariant('cta-copy-test');
  const variant: CTACopyVariant =
    variantRaw === 'no-verb' ||
    variantRaw === 'mystical' ||
    variantRaw === 'simple'
      ? variantRaw
      : 'no-verb';

  const getCopy = (key: keyof typeof CTA_COPY): string =>
    CTA_COPY[key][variant];

  const trackCTAClick = (ctaType: keyof typeof CTA_COPY, page: string) => {
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
    trackCTAClick,
  };
}
