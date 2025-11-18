'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize PostHog if API key is provided
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (!posthogKey || typeof window === 'undefined' || initializedRef.current) {
      return;
    }

    // Initialize PostHog
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: () => {
          initializedRef.current = true;
          if (process.env.NODE_ENV === 'development') {
            console.log('[PostHog] Initialized');
          }
        },
        capture_pageview: false, // We'll capture manually
        capture_pageleave: true,
      });
    } catch (error) {
      console.error('[PostHog] Failed to initialize:', error);
    }
  }, []);

  useEffect(() => {
    // Capture pageviews
    if (pathname && initializedRef.current) {
      try {
        let url = window.origin + pathname;
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`;
        }
        posthog.capture('$pageview', {
          $current_url: url,
        });
      } catch (error) {
        console.error('[PostHog] Failed to capture pageview:', error);
      }
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
