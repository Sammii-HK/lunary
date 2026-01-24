'use client';

import { useEffect } from 'react';
import { conversionTracking } from '@/lib/analytics';

export function AppOpenedTracker() {
  useEffect(() => {
    conversionTracking.appOpened();
  }, []);

  return null;
}
