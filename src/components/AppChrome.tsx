'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MarketingNavbar } from '@/components/MarketingNavbar';
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
  const navOverride = searchParams?.get('nav');

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
      '/profile',
      '/cosmic-state',
      '/cosmic-report-generator',
      '/guide',
    ];

    const isCurrentAppPage = appPagesForContext.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );

    if (navOverride === 'marketing') {
      sessionStorage.removeItem(NAV_CONTEXT_KEY);
      setCameFromApp(false);
      return;
    }

    if (navOverride === 'app') {
      sessionStorage.setItem(NAV_CONTEXT_KEY, 'app');
      setCameFromApp(true);
      return;
    }

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

    // Check if current page is a contextual page (blog/pricing/shop)
    const isContextualPageCheck = [
      '/blog',
      '/pricing',
      '/shop',
      '/grimoire',
    ].some((page) => pathname === page || pathname.startsWith(`${page}/`));

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
  }, [pathname, searchParams, navOverride]);

  const isAdminSurface = isAdminHost || pathname?.startsWith('/admin');

  // Define app pages (always show app nav)
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
    '/explore', // Explore is always app-only
  ];

  // Define core marketing pages (always show marketing nav)
  const coreMarketingRoutes = [
    '/',
    '/welcome',
    '/help',
    '/auth',
    '/comparison',
    '/product',
    '/resources',
    '/about',
    '/legal',
    '/privacy',
    '/terms',
    '/cookies',
    '/refund',
    '/accessibility',
    '/acceptable-use',
    '/referral-terms',
    '/api-terms',
    '/dmca',
    '/trademark',
    '/press-kit',
    '/developers',
    '/pricing',
  ];

  const isCoreMarketingRoute =
    coreMarketingRoutes.includes(pathname) ||
    pathname?.startsWith('/comparison/') ||
    pathname?.startsWith('/admin');

  // Explore pages: contextual, show app nav if coming from app
  const explorePages = [
    '/shop',
    '/moon-circles',
    '/collections',
    '/forecast',
    '/cosmic-report-generator',
    '/cosmic-state',
  ];

  // Pages that can show app nav if coming from app: blog, pricing, explore pages
  const contextualPages = ['/blog', '/pricing', '/grimoire', ...explorePages];
  const isContextualPage = contextualPages.some(
    (page) => pathname === page || pathname?.startsWith(`${page}/`),
  );

  const isAppPage = appPages.some(
    (page) => pathname === page || pathname?.startsWith(`${page}/`),
  );

  // Actual app pages: in appPages, not a marketing route, not a contextual page
  const isActuallyAppPage =
    isAppPage && !isCoreMarketingRoute && !isContextualPage;

  // Marketing nav: core marketing pages OR contextual pages without app context
  const showMarketingNav =
    (navOverride === 'marketing' ||
      isCoreMarketingRoute ||
      (isContextualPage && !cameFromApp)) &&
    navOverride !== 'app' &&
    !isAdminSurface;

  // App nav: actual app pages OR contextual pages with app context
  const showAppNav =
    (navOverride === 'app' ||
      isActuallyAppPage ||
      (isContextualPage && cameFromApp)) &&
    navOverride !== 'marketing' &&
    !isAdminSurface;

  const showBetaBanner = !authState.loading && !authState.isAuthenticated;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setNavOffset = () => {
      let offsetPx = 0;

      if (showMarketingNav) {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>('[data-global-nav]'),
        ).filter((el) => {
          const styles = window.getComputedStyle(el);
          return styles.display !== 'none' && styles.visibility !== 'hidden';
        });

        // Use the max bottom edge instead of summing heights.
        // Summing can over-count if elements overlap (e.g. banner height differs from hardcoded navbar top).
        for (const el of nodes) {
          const rect = el.getBoundingClientRect();
          offsetPx = Math.max(offsetPx, rect.bottom);
        }
      }

      document.documentElement.style.setProperty(
        '--global-nav-offset',
        `${Math.round(offsetPx)}px`,
      );
    };

    // Run once now and again after layout settles (fonts/hydration).
    setNavOffset();
    const raf = window.requestAnimationFrame(setNavOffset);

    const resizeObserver =
      typeof window.ResizeObserver === 'function'
        ? new ResizeObserver(() => setNavOffset())
        : null;

    if (resizeObserver) {
      document
        .querySelectorAll<HTMLElement>('[data-global-nav]')
        .forEach((el) => resizeObserver.observe(el));
    }

    window.addEventListener('resize', setNavOffset);

    return () => {
      window.cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', setNavOffset);
    };
  }, [showMarketingNav, showAppNav, showBetaBanner]);

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
