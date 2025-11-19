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
import { TrialCountdownBanner } from '@/components/TrialCountdownBanner';
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
  ];

  // Define marketing pages
  const isMarketingRoute =
    pathname === '/' ||
    pathname === '/welcome' ||
    pathname === '/pricing' ||
    pathname === '/help' ||
    pathname === '/auth' ||
    pathname?.startsWith('/blog') ||
    pathname?.startsWith('/admin');

  const isAppPage = appPages.some(
    (page) => pathname === page || pathname?.startsWith(`${page}/`),
  );

  // Show marketing nav/footer for unauthenticated users or on marketing pages
  const showMarketingNav = !authState.isAuthenticated || isMarketingRoute;
  // Show app nav only for authenticated users on app pages
  const showAppNav = authState.isAuthenticated && isAppPage && !isAdminSurface;

  return (
    <>
      {!isAdminSurface && (
        <>
          {showMarketingNav && <MarketingNavbar />}
          {showAppNav && (
            <>
              <Navbar />
              <TrialCountdownBanner />
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
      {showMarketingNav && !isAdminSurface && <MarketingFooter />}
    </>
  );
}
