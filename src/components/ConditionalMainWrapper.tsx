'use client';

import { useEffect, useRef, useState } from 'react';
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
  const navOverride = searchParams?.get('nav');
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    if (navOverride === 'marketing') {
      setShowMarketingNav(true);
      setShowAppNav(false);
      return;
    }

    if (navOverride === 'app') {
      setShowMarketingNav(false);
      setShowAppNav(true);
      return;
    }

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
      '/about',
    ];
    const isCoreMarketingRoute =
      coreMarketingRoutes.includes(pathname) ||
      pathname.startsWith('/comparison/') ||
      pathname.startsWith('/about/') ||
      pathname.startsWith('/admin');

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

    // Explore pages: contextual, show app nav if coming from app
    const explorePages = [
      '/shop',
      '/moon-circles',
      '/collections',
      '/forecast',
      '/cosmic-report-generator',
      '/cosmic-state',
    ];

    // Pages that can show app nav if coming from app
    const contextualPages = ['/blog', '/pricing', '/grimoire', ...explorePages];
    const isContextualPage = contextualPages.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );

    const isAppPage = appPages.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    );

    // Actual app pages: in appPages, not a marketing route, not a contextual page
    const isActuallyAppPage =
      isAppPage && !isCoreMarketingRoute && !isContextualPage;

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

    // Check if current page is a contextual page (blog/pricing/shop)
    const isContextualPageCheck = [
      '/blog',
      '/pricing',
      '/shop',
      '/grimoire',
    ].some((page) => pathname === page || pathname.startsWith(`${page}/`));

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

    // Marketing nav: core marketing pages OR contextual pages without app context
    const marketingNav =
      (isCoreMarketingRoute || (isContextualPage && !cameFromApp)) &&
      !pathname.startsWith('/admin');
    // App nav: actual app pages OR contextual pages with app context
    // const appNav =
    //   (isActuallyAppPage || (isContextualPage && cameFromApp)) &&
    //   !pathname.startsWith('/admin');
    const appNav = searchParams?.get('nav') === 'app';

    setShowMarketingNav(marketingNav);
    setShowAppNav(appNav);
  }, [pathname, searchParams, navOverride]);

  useEffect(() => {
    if (!mainRef.current) return;
    mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  // Marketing nav (64px h-16) + Beta banner (36px) = 100px total
  // App nav is 48px mobile, 64px desktop
  return (
    <main
      ref={mainRef}
      style={{
        paddingTop: 'var(--global-nav-offset, 0px)',
        scrollPaddingTop: 'var(--global-nav-offset, 0px)',
      }}
      className={cn(
        'flex flex-col w-full overflow-y-auto h-full',
        showAppNav && 'pb-14 md:pb-15 h-screen',
        // !showMarketingNav && 'pb-14 md:pb-16 h-screen',
        !showMarketingNav && !showAppNav && 'h-screen',
      )}
    >
      {children}
    </main>
  );
}
