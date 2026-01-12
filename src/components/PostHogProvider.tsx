'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookieConsent } from './CookieConsent';
import {
  initializeAttribution,
  getStoredAttribution,
  getAttributionForTracking,
} from '@/lib/attribution';
import { useAuthStatus } from '@/components/AuthStatus';

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
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const isAdminPath = pathname?.startsWith('/admin') ?? false;
  const isAdminHost =
    typeof window !== 'undefined' &&
    window.location.hostname.startsWith('admin.');
  const authStatus = useAuthStatus();

  useEffect(() => {
    const checkConsent = () => {
      const consent = getCookieConsent();
      if (consent) {
        setHasConsent(consent.analytics);
      } else {
        setHasConsent(null);
      }
    };

    checkConsent();

    const handleConsentChange = (event: CustomEvent) => {
      setHasConsent(event.detail?.analytics ?? false);
    };

    window.addEventListener(
      'cookieConsentChanged',
      handleConsentChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        'cookieConsentChanged',
        handleConsentChange as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAdminPath || isAdminHost) return;
    if (hasConsent !== true) return;

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey || initializedRef.current) return;

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

          const isPlaywright = navigator.userAgent.includes('Playwright');
          const isCITest =
            isPlaywright ||
            (window.location.hostname === 'localhost' &&
              navigator.userAgent.includes('HeadlessChrome'));

          posthog.init(posthogKey, {
            api_host:
              process.env.NEXT_PUBLIC_POSTHOG_HOST ||
              'https://us.i.posthog.com',
            loaded: () => {
              posthogRef.current = posthog;
              initializedRef.current = true;
              setPosthogAvailable(true);

              if (isCITest) {
                posthog.register({
                  is_ci_test: true,
                  is_playwright: isPlaywright,
                });
              }

              const attribution = initializeAttribution();
              if (attribution) {
                posthog.register({
                  first_touch_source: attribution.source,
                  first_touch_medium: attribution.medium,
                  first_touch_page: attribution.landingPage,
                });

                if (attribution.source === 'seo') {
                  posthog.capture('seo_landing', {
                    landing_page: attribution.landingPage,
                    referrer: attribution.referrer,
                    search_engine: attribution.medium,
                    keyword: attribution.keyword,
                  });
                }
              }
            },
            capture_pageview: false,
            capture_pageleave: true,
            autocapture: true,
            capture_exceptions: true,
            disable_session_recording: false,
            session_recording: {
              maskAllInputs: false,
              maskInputOptions: { password: true },
            },
            bootstrap: { featureFlags: {} },
          });
        } catch (error) {
          console.error('[PostHog] Failed to initialize:', error);
        }
      });
    });
  }, [hasConsent, isAdminHost, isAdminPath]);

  useEffect(() => {
    if (hasConsent === false && posthogRef.current && initializedRef.current) {
      try {
        posthogRef.current.opt_out_capturing();
      } catch (error) {
        console.error('[PostHog] Failed to opt out:', error);
      }
    }
  }, [hasConsent]);

  useEffect(() => {
    if (isAdminPath || isAdminHost) return;
    if (
      !posthogAvailable ||
      !posthogRef.current ||
      !initializedRef.current ||
      typeof authStatus.isAuthenticated !== 'boolean'
    ) {
      return;
    }

    try {
      posthogRef.current?.register?.({
        is_authenticated: authStatus.isAuthenticated,
        isAuthenticated: authStatus.isAuthenticated,
      });
      if (authStatus.isAuthenticated && authStatus.user?.id) {
        posthogRef.current?.identify?.(authStatus.user.id, {
          is_authenticated: true,
          isAuthenticated: true,
        });
      } else if (!authStatus.isAuthenticated) {
        posthogRef.current?.reset?.();
      }
    } catch (error) {
      console.error('[PostHog] Failed to sync auth state:', error);
    }
  }, [
    authStatus.isAuthenticated,
    authStatus.user?.id,
    posthogAvailable,
    isAdminHost,
    isAdminPath,
  ]);

  useEffect(() => {
    if (isAdminPath || isAdminHost) return;
    if (!posthogAvailable || !posthogRef.current || !initializedRef.current) {
      return;
    }

    if (pathname) {
      try {
        let url = window.origin + pathname;
        if (searchParams?.toString()) {
          url += `?${searchParams.toString()}`;
        }

        const attribution = getStoredAttribution();
        const attributionData = getAttributionForTracking();

        posthogRef.current?.capture?.('$pageview', {
          $current_url: url,
          pathname,
          ...attributionData,
          is_seo_traffic: attribution?.source === 'seo',
          is_grimoire_page: pathname.startsWith('/grimoire'),
          is_blog_page: pathname.startsWith('/blog'),
          is_authenticated: authStatus.isAuthenticated,
          isAuthenticated: authStatus.isAuthenticated,
          auth_user_id: authStatus.user?.id,
        });
      } catch (error) {
        console.error('[PostHog] Failed to capture pageview:', error);
      }
    }
  }, [
    pathname,
    searchParams,
    posthogAvailable,
    isAdminHost,
    isAdminPath,
    authStatus.isAuthenticated,
    authStatus.user?.id,
  ]);

  return <>{children}</>;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProviderContent>{children}</PostHogProviderContent>;
}
