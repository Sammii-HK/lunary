'use client';

import { useEffect, useRef } from 'react';
import { conversionTracking } from '@/lib/analytics';

export function AppOpenedTracker() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Skip if already tracked today — avoids any API/DB call for return visits
    const today = new Date().toISOString().split('T')[0];
    const key = `app_opened_${today}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch {
      // localStorage unavailable (private mode etc.) — fall through to server dedup
    }

    conversionTracking.appOpened();
  }, []);

  return null;
}
