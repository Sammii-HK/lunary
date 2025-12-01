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
      '/explore',
      '/guide',
    ];

    // Define explore pages
    const explorePages = [
      '/explore',
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
      '/explore',
      '/guide',
    ];

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

    let cameFromApp: boolean;
    if (isContextualPageCheck) {
      // For contextual pages, be strict: ONLY show app nav with explicit signal
      // Do NOT rely on sessionStorage as it can be stale from previous sessions
      cameFromApp = fromParam === 'explore' || referrerIsAppPage;
    } else {
      // For other pages, use normal logic
      const navContext = sessionStorage.getItem(NAV_CONTEXT_KEY);
      cameFromApp =
        navContext === 'app' ||
        navContext === 'explore' ||
        fromParam === 'explore' ||
        referrerIsAppPage;
    }

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
        'flex flex-col w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600',
        showMarketingNav && 'mt-8 h-[calc(100vh-2rem)]',
        showAppNav && 'h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)]',
        !showMarketingNav && !showAppNav && 'h-screen',
      )}
    >
      {children}
    </main>
  );
}
