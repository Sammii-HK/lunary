'use client';

import { useEffect, useRef } from 'react';
import { conversionTracking } from '@/lib/analytics';

export function AppOpenedTracker() {
  // Fire only once per page load (not on every navigation)
  // The analytics guard handles daily deduplication at the storage/DB level
  const hasFired = useRef(false);

  useEffect(() => {
    // Only fire once per page load - guard function handles daily dedup
    if (hasFired.current) return;
    hasFired.current = true;

    // Fire app_opened event (client-side guard + DB constraint prevent duplicates)
    conversionTracking.appOpened();
  }, []);

  return null;
}
