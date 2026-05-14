'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { conversionTracking } from '@/lib/analytics';

function serverSidePageviewsActive(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === 'lunary.app' ||
    hostname === 'www.lunary.app' ||
    hostname.startsWith('links.')
  );
}

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;
    if (serverSidePageviewsActive()) return;
    if (lastTrackedPathRef.current === pathname) return;

    lastTrackedPathRef.current = pathname;
    void conversionTracking.pageViewed(pathname);
  }, [pathname]);

  return null;
}
