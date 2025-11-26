'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

let posthogModule: any = null;
let posthogLoaded = false;

async function loadPostHog() {
  if (posthogLoaded) return posthogModule;
  if (typeof window === 'undefined') {
    posthogLoaded = true;
    return null;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) {
    posthogLoaded = true;
    return null;
  }

  try {
    const posthogImport = await import('posthog-js');
    posthogModule = posthogImport.default || posthogImport;
    posthogLoaded = true;
    return posthogModule;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[PostHog] Failed to load:', error);
    }
    posthogLoaded = true;
    posthogModule = null;
    return null;
  }
}

function PostHogProviderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const posthogRef = useRef<any>(null);
  const [posthogAvailable, setPosthogAvailable] = useState(false);

  // Defer PostHog loading until after first paint to improve LCP
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey || initializedRef.current) return;

    // Use requestIdleCallback if available, otherwise setTimeout
    const scheduleLoad = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback, { timeout: 3000 });
      } else {
        setTimeout(callback, 1500);
      }
    };

    scheduleLoad(() => {
      loadPostHog().then((posthog) => {
        if (!posthog) return;

        try {
          if (typeof posthog.init !== 'function') {
            console.error('[PostHog] PostHog.init is not available');
            return;
          }

          posthog.init(posthogKey, {
            api_host:
              process.env.NEXT_PUBLIC_POSTHOG_HOST ||
              'https://us.i.posthog.com',
            loaded: () => {
              posthogRef.current = posthog;
              initializedRef.current = true;
              setPosthogAvailable(true);
            },
            capture_pageview: false,
            capture_pageleave: true,
          });
        } catch (error) {
          console.error('[PostHog] Failed to initialize:', error);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!posthogAvailable || !posthogRef.current || !initializedRef.current) {
      return;
    }

    if (pathname) {
      try {
        let url = window.origin + pathname;
        if (searchParams?.toString()) {
          url += `?${searchParams.toString()}`;
        }
        posthogRef.current?.capture?.('$pageview', { $current_url: url });
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
