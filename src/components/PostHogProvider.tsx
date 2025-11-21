'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PostHogProviderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const posthogRef = useRef<any>(null);
  const [posthogAvailable, setPosthogAvailable] = useState(false);
  const [PostHogModule, setPostHogModule] = useState<any>(null);

  // Load PostHog module lazily on client side using eval to prevent webpack analysis
  useEffect(() => {
    if (typeof window === 'undefined' || PostHogModule !== null) return;

    // Use eval to prevent webpack from statically analyzing the import
    const loadPostHog = async () => {
      try {
        // eslint-disable-next-line no-eval
        const posthogModule = await eval('import("posthog-js")');
        setPostHogModule(posthogModule.default || posthogModule);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[PostHog] Failed to load posthog-js:', error);
        }
        setPostHogModule(false); // Mark as failed
      }
    };

    loadPostHog();
  }, [PostHogModule]);

  // Initialize PostHog once module is loaded
  useEffect(() => {
    if (!PostHogModule || PostHogModule === false || initializedRef.current)
      return;

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (!posthogKey || typeof window === 'undefined') {
      return;
    }

    try {
      if (typeof PostHogModule.init !== 'function') {
        console.error('[PostHog] PostHog.init is not available');
        return;
      }

      PostHogModule.init(posthogKey, {
        api_host: posthogHost,
        loaded: () => {
          posthogRef.current = PostHogModule;
          initializedRef.current = true;
          setPosthogAvailable(true);
          if (process.env.NODE_ENV === 'development') {
            console.log('[PostHog] Initialized');
          }
        },
        capture_pageview: false,
        capture_pageleave: true,
      });
    } catch (error) {
      console.error('[PostHog] Failed to initialize:', error);
    }
  }, [PostHogModule]);

  useEffect(() => {
    // Skip if posthog-js is not available or not initialized
    if (!posthogAvailable || !posthogRef.current || !initializedRef.current) {
      return;
    }

    // Capture pageviews
    if (pathname) {
      try {
        let url = window.origin + pathname;
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`;
        }
        const posthog = posthogRef.current;
        if (posthog && typeof posthog.capture === 'function') {
          posthog.capture('$pageview', {
            $current_url: url,
          });
        }
      } catch (error) {
        console.error('[PostHog] Failed to capture pageview:', error);
      }
    }
  }, [pathname, searchParams, posthogAvailable]);

  return <>{children}</>;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProviderContent>{children}</PostHogProviderContent>;
}
