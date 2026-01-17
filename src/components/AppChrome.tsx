'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { PWAHandler } from '@/components/PWAHandler';
import { NotificationManager } from '@/components/NotificationManager';
import { ExitIntent } from '@/components/ExitIntent';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { BetaBanner } from '@/components/BetaBanner';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { TestimonialForm } from '@/components/TestimonialForm';
import {
  markTestimonialSubmitted,
  scheduleTestimonialReask,
  shouldPromptForTestimonial,
  TestimonialPromptMeta,
} from '@/lib/testimonial-prompt';
import { useAuthStatus } from './AuthStatus';
import { conversionTracking } from '@/lib/analytics';

const NAV_CONTEXT_KEY = 'lunary_nav_context';
const TESTIMONIAL_PROMPT_KEY = 'lunary-testimonial-prompt';
const APP_SESSION_KEY = 'lunary_app_session_ts';
const APP_SESSION_USER_KEY = 'lunary_app_session_user_id';
const APP_SESSION_TTL_MS = 30 * 60 * 1000;

export function AppChrome() {
  const pathname = usePathname() || '';
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
    '/about',
  ];

  const isCoreMarketingRoute =
    coreMarketingRoutes.includes(pathname) ||
    pathname?.startsWith('/comparison/') ||
    pathname?.startsWith('/about/') ||
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

  const [testimonialMeta, setTestimonialMeta] =
    useState<TestimonialPromptMeta | null>(null);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);

  const persistTestimonialMeta = useCallback((next: TestimonialPromptMeta) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TESTIMONIAL_PROMPT_KEY, JSON.stringify(next));
    setTestimonialMeta(next);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(TESTIMONIAL_PROMPT_KEY);
    if (stored) {
      try {
        const parsed: TestimonialPromptMeta = JSON.parse(stored);
        persistTestimonialMeta(parsed);
      } catch (error) {
        const fallbackMeta: TestimonialPromptMeta = {
          firstSeen: Date.now(),
          dontAskUntil: 0,
          submitted: false,
        };
        persistTestimonialMeta(fallbackMeta);
      }
    } else {
      const initialMeta: TestimonialPromptMeta = {
        firstSeen: Date.now(),
        dontAskUntil: 0,
        submitted: false,
      };
      persistTestimonialMeta(initialMeta);
    }
  }, [persistTestimonialMeta]);

  useEffect(() => {
    if (!testimonialMeta) return;
    const now = Date.now();
    if (shouldPromptForTestimonial(testimonialMeta, now)) {
      setTestimonialModalOpen(true);
    }
  }, [testimonialMeta]);

  const handleTestimonialModalClose = () => {
    if (!testimonialMeta) {
      setTestimonialModalOpen(false);
      return;
    }

    persistTestimonialMeta(
      scheduleTestimonialReask(testimonialMeta, Date.now()),
    );
    setTestimonialModalOpen(false);
  };

  const handleTestimonialSubmitted = () => {
    if (!testimonialMeta) {
      setTestimonialModalOpen(false);
      return;
    }

    persistTestimonialMeta(markTestimonialSubmitted(testimonialMeta));
    setTestimonialModalOpen(false);
  };

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
    if (!isAppPage) return;
    if (authState.loading) return;

    const now = Date.now();
    const last = Number(sessionStorage.getItem(APP_SESSION_KEY) || 0);
    const currentUserId = authState.user?.id ? String(authState.user.id) : '';
    const lastUserId = sessionStorage.getItem(APP_SESSION_USER_KEY) || '';

    const withinSession = last && now - last < APP_SESSION_TTL_MS;
    // If we're within the session TTL but the user just authenticated (or changed),
    // record one `app_opened` for their real user id. This prevents signup-cohort
    // retention from being 0 due to opens being attributed only to anon ids.
    if (withinSession) {
      if (!currentUserId || currentUserId === lastUserId) return;

      sessionStorage.setItem(APP_SESSION_USER_KEY, currentUserId);
      conversionTracking.appOpened(authState.user?.id, authState.user?.email);
      return;
    }

    sessionStorage.setItem(APP_SESSION_KEY, String(now));
    sessionStorage.setItem(APP_SESSION_USER_KEY, currentUserId);
    conversionTracking.appOpened(authState.user?.id, authState.user?.email);
  }, [isAppPage, authState.loading, authState.user?.id, authState.user?.email]);

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
      <Modal
        isOpen={testimonialModalOpen}
        onClose={handleTestimonialModalClose}
        size='lg'
      >
        <ModalHeader>Share your Lunary experience?</ModalHeader>
        <ModalBody>
          <p className='text-sm text-zinc-300'>
            You&apos;ve been engaging with Lunary for about a week—would you
            mind sharing a quick testimonial while the experience is still
            fresh?
          </p>
          <TestimonialForm
            helperText='We read every submission and may feature the ones that inspire other cosmic seekers.'
            submitButtonLabel='Submit Testimonial'
            onSuccess={handleTestimonialSubmitted}
            onError={(message) => {
              console.warn(
                '[Testimonial Modal] Failed to submit testimonial:',
                message,
              );
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' onClick={handleTestimonialModalClose}>
            Maybe later
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
