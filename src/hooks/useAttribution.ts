'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Attribution,
  initializeAttribution,
  getStoredAttribution,
  getAttributionForTracking,
  isOrganicTraffic,
  isSocialTraffic,
} from '@/lib/attribution';
import { captureEvent } from '@/lib/posthog-client';

export function useAttribution() {
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasTrackedLanding = useRef(false);

  useEffect(() => {
    const stored = getStoredAttribution();
    if (stored) {
      setAttribution(stored);
      setIsInitialized(true);
      return;
    }

    const newAttribution = initializeAttribution();
    if (newAttribution) {
      setAttribution(newAttribution);

      if (!hasTrackedLanding.current && newAttribution.source === 'seo') {
        captureEvent('seo_landing', {
          landing_page: newAttribution.landingPage,
          referrer: newAttribution.referrer,
          search_engine: newAttribution.medium,
          keyword: newAttribution.keyword,
        });
        hasTrackedLanding.current = true;
      }
    }
    setIsInitialized(true);
  }, []);

  const getTrackingData = () => getAttributionForTracking();

  return {
    attribution,
    isInitialized,
    isOrganic: isOrganicTraffic(),
    isSocial: isSocialTraffic(),
    getTrackingData,
    source: attribution?.source,
    landingPage: attribution?.landingPage,
    keyword: attribution?.keyword,
  };
}
