'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { MarketingFooter } from '@/components/MarketingFooter';
import { PWAHandler } from '@/components/PWAHandler';
import { NotificationManager } from '@/components/NotificationManager';
import { ExitIntent } from '@/components/ExitIntent';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { BetaBanner } from '@/components/BetaBanner';
import { useAuthStatus } from './AuthStatus';

const NAV_CONTEXT_KEY = 'lunary_nav_context';

export function AppChrome() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authState = useAuthStatus();
  const [isAdminHost, setIsAdminHost] = useState(false);
  const [cameFromApp, setCameFromApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    const adminHostPatterns = [
      'admin.lunary.app',
      'admin.localhost',
      'admin.127.0.0.1',
    ];

    const isAdmin =
      adminHostPatterns.includes(host) ||
      host.startsWith('admin.') ||
      host.endsWith('.admin.lunary.app');

    setIsAdminHost(isAdmin);
  }, []);

  // Track navigation context
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    // Define app pages for context tracking
    const appPagesForContext = [
      '/app',
      '/tarot',
      '/horoscope',
      '/birth-chart',
      '/book-of-shadows',
      '/grimoire',
      '/profile',
      '/cosmic-state',
      '/cosmic-report-generator',
      '/guide',
    ];

    const isCurrentAppPage = appPagesForContext.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );

    // If currently on an app page, store in sessionStorage
    if (isCurrentAppPage) {
      sessionStorage.setItem(NAV_CONTEXT_KEY, 'app');
    }

    // Check if we came from an app page or explore menu
    const referrer = document.referrer;
    const fromParam = searchParams?.get('from');

    // Check if referrer is an app page (must be same origin to be reliable)
    const referrerIsAppPage = referrer
      ? (() => {
          try {
            const referrerUrl = new URL(referrer);
            // Only trust same-origin referrers
            if (referrerUrl.origin !== window.location.origin) {
              return false;
            }
            return appPagesForContext.some(
              (page) =>
                referrerUrl.pathname === page ||
                referrerUrl.pathname.startsWith(`${page}/`),
            );
          } catch {
            return false;
          }
        })()
      : false;

    // Check if current page is a contextual page (blog/pricing)
    const isContextualPageCheck = ['/blog', '/pricing'].some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );

    if (isContextualPageCheck) {
      // For contextual pages, be strict: ONLY show app nav with explicit signal
      // Do NOT rely on sessionStorage as it can be stale from previous sessions
      // Clear stale 'app' context when visiting contextual pages without UTM
      if (!fromParam && !referrerIsAppPage) {
        sessionStorage.removeItem(NAV_CONTEXT_KEY);
      }
      setCameFromApp(fromParam === 'explore' || referrerIsAppPage);
    } else {
      // For other pages, use normal logic
      const navContext = sessionStorage.getItem(NAV_CONTEXT_KEY);
      setCameFromApp(
        navContext === 'app' ||
          navContext === 'explore' ||
          fromParam === 'explore' ||
          referrerIsAppPage,
      );
    }
  }, [pathname, searchParams]);

  const isAdminSurface = isAdminHost || pathname?.startsWith('/admin');

  // Define app pages
  const appPages = [
    '/app',
    '/tarot',
    '/horoscope',
    '/birth-chart',
    '/book-of-shadows',
    '/grimoire',
    '/profile',
    '/cosmic-state',
    '/cosmic-report-generator',
    '/guide',
    '/blog',
  ];

  // Define core marketing pages (always show marketing nav)
  const coreMarketingRoutes = ['/', '/welcome', '/help', '/auth'];

  const isCoreMarketingRoute =
    coreMarketingRoutes.includes(pathname) || pathname?.startsWith('/admin');

  // Define explore pages (can show app nav if coming from app)
  const explorePages = [
    '/explore',
    '/shop',
    '/moon-circles',
    '/collections',
    '/forecast',
    '/cosmic-report-generator',
    '/cosmic-state',
  ];

  // Pages that can show app nav if coming from app: blog, pricing, explore pages
  const contextualPages = ['/blog', '/pricing', ...explorePages];
  const isContextualPage = contextualPages.some(
    (page) => pathname === page || pathname?.startsWith(`${page}/`),
  );

  const isAppPage = appPages.some(
    (page) => pathname === page || pathname?.startsWith(`${page}/`),
  );

  // Ensure marketing and app routes are mutually exclusive
  // Core marketing routes take precedence - if it's a core marketing route, it's NOT an app page
  const isActuallyAppPage = isAppPage && !isCoreMarketingRoute;

  // For contextual pages (blog/pricing/explore), show app nav if coming from app
  // Otherwise show marketing nav (default for contextual pages)
  const shouldShowAppNavOnContextualPage = isContextualPage && cameFromApp;

  // Show marketing nav on:
  // 1. Core marketing pages (always)
  // 2. Contextual pages (blog/pricing/explore) UNLESS coming from app/explore
  const showMarketingNav =
    (isCoreMarketingRoute || (isContextualPage && !cameFromApp)) &&
    !isAdminSurface;

  // Show app nav on:
  // 1. Actual app pages
  // 2. Contextual pages (blog/pricing/explore) if coming from app/explore
  const showAppNav =
    (isActuallyAppPage || (isContextualPage && cameFromApp)) && !isAdminSurface;

  return (
    <>
      {!isAdminSurface && (
        <>
          {showMarketingNav && <BetaBanner />}
          {showMarketingNav && <MarketingNavbar />}
          {showAppNav && (
            <>
              {/* <TrialCountdownBanner /> */}
              <Navbar />
            </>
          )}
        </>
      )}
      <ErrorBoundaryWrapper>
        <PWAHandler
          allowUnauthenticatedInstall={isAdminSurface}
          silent={isAdminSurface}
        />
        {!isAdminSurface && (
          <>
            <NotificationManager />
            <ExitIntent />
            <OnboardingFlow />
          </>
        )}
      </ErrorBoundaryWrapper>
    </>
  );
}
