'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { conversionTracking } from '@/lib/analytics';

export function AppOpenedTracker() {
  const pathname = usePathname();

  useEffect(() => {
    console.log('[AppOpenedTracker] Firing app_opened for pathname:', pathname);
    const result = conversionTracking.appOpened();
    console.log('[AppOpenedTracker] Result:', result);
  }, [pathname]);

  return null;
}
