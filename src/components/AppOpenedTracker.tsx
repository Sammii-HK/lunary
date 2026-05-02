'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { conversionTracking } from '@/lib/analytics';

const APP_OPENED_ALLOWED_PREFIXES = [
  '/app',
  '/tarot',
  '/horoscope',
  '/birth-chart',
  '/guide',
  '/book-of-shadows',
  '/profile',
  '/cosmic-state',
  '/cosmic-report-generator',
  '/explore',
  '/community',
  '/moon-circles',
  '/collections',
  '/forecast',
  '/shop',
];

export function AppOpenedTracker() {
  const hasFired = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (hasFired.current) return;

    const isAppSurface = APP_OPENED_ALLOWED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

    if (!isAppSurface) return;
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
  }, [pathname]);

  return null;
}
