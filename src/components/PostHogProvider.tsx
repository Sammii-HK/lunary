'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

let posthog: any = null;
let posthogLoaded = false;

async function loadPostHog() {
  if (posthogLoaded) return posthog;

  // Use direct import - PostHog is optional and will be caught in try/catch
  // This avoids webpack "critical dependency" warning while still making it optional
  try {
    // Dynamic import - PostHog may not be installed
    const posthogModule = await import('posthog-js');
    posthog = posthogModule.default || posthogModule;
    posthogLoaded = true;
    return posthog;
  } catch (error) {
    // posthog-js is optional - component will work without it
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[PostHog] posthog-js not installed, PostHog tracking disabled',
      );
    }
    posthogLoaded = true; // Mark as loaded to prevent retries
    return null;
  }
}

function PostHogProviderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const [posthogAvailable, setPosthogAvailable] = useState(false);

  useEffect(() => {
    // Load PostHog dynamically
    loadPostHog().then((loadedPosthog) => {
      if (!loadedPosthog) {
        return;
      }
      setPosthogAvailable(true);

      // Only initialize PostHog if API key is provided
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost =
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

      if (
        !posthogKey ||
        typeof window === 'undefined' ||
        initializedRef.current
      ) {
        return;
      }

      // Initialize PostHog
      try {
        loadedPosthog.init(posthogKey, {
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
    });
  }, []);

  useEffect(() => {
    // Skip if posthog-js is not available or not initialized
    if (!posthogAvailable || !posthog || !initializedRef.current) {
      return;
    }

    // Capture pageviews
    if (pathname) {
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
  }, [pathname, searchParams, posthogAvailable]);

  return <>{children}</>;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PostHogProviderContent>{children}</PostHogProviderContent>
    </Suspense>
  );
}
