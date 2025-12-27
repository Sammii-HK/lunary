'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { MarketingFooter } from '@/components/MarketingFooter';

interface MarketingFooterGateProps {
  force?: boolean;
}

const NAV_CONTEXT_KEY = 'lunary_nav_context';
const APP_REFERRER_PAGES = [
  '/app',
  '/tarot',
  '/horoscope',
  '/birth-chart',
  '/book-of-shadows',
  '/profile',
  '/cosmic-state',
  '/cosmic-report-generator',
  '/guide',
  '/explore',
];

export function MarketingFooterGate({
  force = false,
}: MarketingFooterGateProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const navOverride = searchParams?.get('nav');
  const fromParam = searchParams?.get('from');
  const isGrimoirePage = pathname
    ? pathname === '/grimoire' || pathname.startsWith('/grimoire/')
    : false;
  const [showFooter, setShowFooter] = useState(
    force || navOverride === 'marketing' || isGrimoirePage,
  );

  useEffect(() => {
    if (force || navOverride === 'marketing') {
      setShowFooter(true);
      return;
    }

    if (navOverride === 'app') {
      setShowFooter(false);
      return;
    }

    if (typeof window === 'undefined') {
      setShowFooter(false);
      return;
    }

    const navContext = sessionStorage.getItem(NAV_CONTEXT_KEY);
    const referrer = document.referrer;
    const referrerIsAppPage = referrer
      ? (() => {
          try {
            const referrerUrl = new URL(referrer);
            if (referrerUrl.origin !== window.location.origin) {
              return false;
            }
            return APP_REFERRER_PAGES.some(
              (page) =>
                referrerUrl.pathname === page ||
                referrerUrl.pathname.startsWith(`${page}/`),
            );
          } catch {
            return false;
          }
        })()
      : false;

    const cameFromApp = isGrimoirePage
      ? fromParam === 'explore' || referrerIsAppPage
      : navContext === 'app' ||
        navContext === 'explore' ||
        fromParam === 'explore' ||
        referrerIsAppPage;

    setShowFooter(!cameFromApp);
  }, [force, navOverride, fromParam, pathname, isGrimoirePage]);

  if (!showFooter) {
    return null;
  }

  return <MarketingFooter />;
}
