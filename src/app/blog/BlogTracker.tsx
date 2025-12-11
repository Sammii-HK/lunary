'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { captureEvent } from '@/lib/posthog-client';
import { getStoredAttribution, extractSearchQuery } from '@/lib/attribution';

export function BlogTracker() {
  const pathname = usePathname();
  const trackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== trackedPathRef.current) {
      const attribution = getStoredAttribution();
      const referrer =
        typeof document !== 'undefined' ? document.referrer : undefined;
      const searchQuery = referrer ? extractSearchQuery(referrer) : undefined;

      const isWeeklyPost = pathname.includes('/blog/week/');
      const weekMatch = pathname.match(/week-(\d+)-(\d+)/);

      captureEvent('blog_viewed', {
        page_path: pathname,
        is_weekly_post: isWeeklyPost,
        week_number: weekMatch ? parseInt(weekMatch[1], 10) : undefined,
        year: weekMatch ? parseInt(weekMatch[2], 10) : undefined,
        source: attribution?.source || 'direct',
        referrer,
        search_query: searchQuery || attribution?.keyword,
        first_touch_source: attribution?.source,
        first_touch_page: attribution?.landingPage,
        is_seo_traffic: attribution?.source === 'seo',
      });

      trackedPathRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
