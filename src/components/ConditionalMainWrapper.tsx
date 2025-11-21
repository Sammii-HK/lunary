'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_CONTEXT_KEY = 'lunary_nav_context';

export function ConditionalMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMarketingNav, setShowMarketingNav] = useState(false);
  const [showAppNav, setShowAppNav] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    // Define core marketing pages (always show marketing nav)
    const coreMarketingRoutes = ['/', '/welcome', '/help', '/auth'];
    const isCoreMarketingRoute =
      coreMarketingRoutes.includes(pathname) || pathname.startsWith('/admin');

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

    // Define explore pages
    const explorePages = [
      '/shop',
      '/moon-circles',
      '/collections',
      '/forecast',
      '/cosmic-report-generator',
      '/cosmic-state',
    ];

    // Pages that can show app nav if coming from app
    const contextualPages = ['/blog', '/pricing', ...explorePages];
    const isContextualPage = contextualPages.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );

    const isAppPage = appPages.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );

    const isActuallyAppPage = isAppPage && !isCoreMarketingRoute;

    // Check if we came from an app page or explore menu
    const navContext = sessionStorage.getItem(NAV_CONTEXT_KEY);
    const referrer = document.referrer;
    const fromParam = searchParams?.get('from');

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
    ];

    const referrerIsAppPage = referrer
      ? appPagesForContext.some((page) => {
          try {
            const referrerUrl = new URL(referrer);
            return (
              referrerUrl.pathname === page ||
              referrerUrl.pathname.startsWith(`${page}/`)
            );
          } catch {
            return false;
          }
        })
      : false;

    // Set cameFromApp if:
    // - nav context is 'app' or 'explore'
    // - URL has ?from=explore parameter
    // - referrer is an app page
    const cameFromApp =
      navContext === 'app' ||
      navContext === 'explore' ||
      fromParam === 'explore' ||
      referrerIsAppPage;

    // Determine which nav is shown
    // Marketing nav shows on core marketing pages and contextual pages (unless coming from app/explore)
    const marketingNav =
      (isCoreMarketingRoute || (isContextualPage && !cameFromApp)) &&
      !pathname.startsWith('/admin');
    // App nav shows on actual app pages OR contextual pages if coming from app/explore
    const appNav =
      (isActuallyAppPage || (isContextualPage && cameFromApp)) &&
      !pathname.startsWith('/admin');

    setShowMarketingNav(marketingNav);
    setShowAppNav(appNav);
  }, [pathname, searchParams]);

  return (
    <main
      className={cn(
        'flex flex-col w-full font-mono text-sm gap-4 overflow-y-auto px-4',
        showMarketingNav && 'mt-8',
        showAppNav && 'pb-20',
        // Calculate height accounting for fixed navs
        showMarketingNav && showAppNav && 'h-[calc(100vh-2rem-5rem)]',
        showMarketingNav && !showAppNav && 'h-[calc(100vh-2rem)]',
        !showMarketingNav && showAppNav && 'h-[calc(100vh-5rem)]',
        !showMarketingNav && !showAppNav && 'h-screen',
      )}
    >
      {children}
    </main>
  );
}
