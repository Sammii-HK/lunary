'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

let posthogModule: any = null;
let posthogLoaded = false;

async function loadPostHog() {
  if (posthogLoaded) return posthogModule;

  // Use direct import - PostHog is optional and will be caught in try/catch
  // This avoids webpack "critical dependency" warning while still making it optional
  try {
    // Dynamic import - PostHog may not be installed
    const posthogImport = await import('posthog-js');
    // PostHog default export is the singleton instance
    posthogModule = posthogImport.default || posthogImport;

    // Check if PostHog module is valid
    if (!posthogModule) {
      throw new Error('PostHog module not found');
    }

    posthogLoaded = true;
    return posthogModule;
  } catch (error) {
    // posthog-js is optional - component will work without it
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[PostHog] posthog-js not installed, PostHog tracking disabled',
        error,
      );
    }
    posthogLoaded = true; // Mark as loaded to prevent retries
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

  useEffect(() => {
    // Load PostHog dynamically
    loadPostHog().then((posthog) => {
      if (!posthog) {
        return;
      }

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
        // Check if PostHog has an init method
        if (!posthog || typeof posthog.init !== 'function') {
          console.error('[PostHog] PostHog.init is not available');
          return;
        }

        posthog.init(posthogKey, {
          api_host: posthogHost,
          loaded: () => {
            posthogRef.current = posthog;
            initializedRef.current = true;
            setPosthogAvailable(true);
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
  return (
    <Suspense fallback={<>{children}</>}>
      <PostHogProviderContent>{children}</PostHogProviderContent>
    </Suspense>
  );
}
