'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { MarketingFooter } from '@/components/MarketingFooter';
import { PWAHandler } from '@/components/PWAHandler';
import { NotificationManager } from '@/components/NotificationManager';
import { ExitIntent } from '@/components/ExitIntent';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { useAuthStatus } from './AuthStatus';

export function AppChrome() {
  const pathname = usePathname();
  const authState = useAuthStatus();
  const [isAdminHost, setIsAdminHost] = useState(false);

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
    '/blog',
  ];

  // Define marketing pages
  const isMarketingRoute =
    pathname === '/' ||
    pathname === '/welcome' ||
    pathname === '/pricing' ||
    pathname === '/help' ||
    pathname === '/auth' ||
    pathname?.startsWith('/admin');

  const isAppPage = appPages.some(
    (page) => pathname === page || pathname?.startsWith(`${page}/`),
  );

  // Ensure marketing and app routes are mutually exclusive
  // Marketing routes take precedence - if it's a marketing route, it's NOT an app page
  const isActuallyAppPage = isAppPage && !isMarketingRoute;

  // Show marketing nav ONLY on marketing pages (top nav)
  const showMarketingNav = isMarketingRoute && !isAdminSurface;
  // Show app nav ONLY on app pages (bottom nav)
  // Never show on marketing routes, even if user becomes authenticated
  const showAppNav = isActuallyAppPage && !isAdminSurface;

  return (
    <>
      {!isAdminSurface && (
        <>
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
