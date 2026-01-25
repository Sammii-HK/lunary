'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { conversionTracking } from '@/lib/analytics';

export function AppOpenedTracker() {
  const pathname = usePathname();

  useEffect(() => {
    conversionTracking.appOpened();
  }, [pathname]);

  return null;
}
