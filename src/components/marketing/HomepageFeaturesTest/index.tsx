'use client';

import { useEffect } from 'react';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { captureEvent } from '@/lib/posthog-client';
import { ControlVariant } from './ControlVariant';
import { FourCardsUpdatedVariant } from './FourCardsUpdatedVariant';
import { ThreeSectionsVariant } from './ThreeSectionsVariant';

type FeaturesVariant = 'control' | 'four-cards-updated' | 'three-sections';

export function HomepageFeaturesTest() {
  const variantRaw = useFeatureFlagVariant('homepage-features-test');

  const variant: FeaturesVariant =
    variantRaw === 'control' ||
    variantRaw === 'four-cards-updated' ||
    variantRaw === 'three-sections'
      ? variantRaw
      : 'control';

  // Track which variant was shown
  useEffect(() => {
    if (variant) {
      captureEvent('homepage_features_variant_shown', {
        variant,
        page: 'homepage',
      });
    }
  }, [variant]);

  // Render the appropriate variant
  if (variant === 'four-cards-updated') {
    return <FourCardsUpdatedVariant />;
  }

  if (variant === 'three-sections') {
    return <ThreeSectionsVariant />;
  }

  // Default to control
  return <ControlVariant />;
}
