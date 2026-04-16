'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, X } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';

interface StickyBottomCTAProps {
  nudge: ContextualNudge;
}

const DISMISS_PREFIX = 'lunary_sticky_cta_dismissed_';
const DISMISS_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes — not forever

export function StickyBottomCTA({ nudge }: StickyBottomCTAProps) {
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const impressionTracked = useRef(false);

  // Don't show to logged-in users
  const isAuthenticated = authState.isAuthenticated;

  // Dismiss key is per-page so dismissing on one grimoire page
  // doesn't affect any other page
  const dismissKey = `${DISMISS_PREFIX}${pathname}`;

  // Check dismiss — per-hub with 30min expiry
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedAt = sessionStorage.getItem(dismissKey);
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < DISMISS_EXPIRY_MS) {
          setDismissed(true);
        } else {
          // Expired — clear it
          sessionStorage.removeItem(dismissKey);
        }
      }
    }
  }, [dismissKey]);

  // Show after 15% scroll OR after 10 seconds of dwell time (whichever is
  // first). Previously the scroll-only trigger meant most anonymous readers
  // never saw the sticky CTA — they read the top of the article, clicked
  // the inline CTA or bounced, and the sticky never fired. Sticky got
  // 0.3-2% of inline impressions in prod (LUN-221). The 10s fallback
  // ensures any reader who dwells on a page sees it.
  useEffect(() => {
    if (dismissed || isAuthenticated) return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      // Recompute scrollable each check — content can lazy-load and change
      // scrollHeight after the effect mounts.
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 50) {
        // No-scroll page — rely on dwell timer instead.
        return;
      }
      const scrollPercent = window.scrollY / scrollable;
      if (scrollPercent > 0.15) {
        setVisible(true);
      }
    };

    // Check on mount in case user already scrolled.
    handleScroll();

    // Dwell fallback — fire after 10s regardless of scroll position.
    dwellTimer = setTimeout(() => setVisible(true), 10_000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [dismissed, isAuthenticated]);

  // A/B test is scoped per hub so we can compare copy variants within each hub
  const abTestName = `seo_sticky_cta_${nudge.hub}`;
  const abVariantIndex = nudge.ctaVariant?.split('_').pop() || '0';

  // Track impression when it becomes visible
  useEffect(() => {
    if (visible && !impressionTracked.current) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub: nudge.hub,
        ctaId: 'sticky_bottom_cta',
        location: 'seo_sticky_bottom',
        label: nudge.inlineCopy || nudge.buttonLabel,
        href: nudge.href,
        pagePath: pathname,
        ctaVariant: nudge.ctaVariant,
        ctaHeadline: nudge.ctaHeadline,
        ctaSubline: nudge.ctaSubline,
        abTest: abTestName,
        abVariant: abVariantIndex,
      });
    }
  }, [visible, nudge, pathname, abTestName, abVariantIndex]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(dismissKey, Date.now().toString());
    }
  };

  const navigateToHref = () => {
    if (nudge.href) {
      router.push(nudge.href);
    }
  };

  const handleClick = () => {
    trackCtaClick({
      hub: nudge.hub,
      ctaId: 'sticky_bottom_cta',
      location: 'seo_sticky_bottom',
      label: nudge.inlineCopy || nudge.buttonLabel,
      href: nudge.href,
      pagePath: pathname,
      ctaVariant: nudge.ctaVariant,
      ctaHeadline: nudge.ctaHeadline,
      ctaSubline: nudge.ctaSubline,
      abTest: abTestName,
      abVariant: abVariantIndex,
    });

    if (nudge.action === 'link') {
      navigateToHref();
      return;
    }

    if (!isAuthenticated) {
      const params = new URLSearchParams({
        hub: nudge.hub,
        headline: nudge.headline || nudge.ctaHeadline || '',
        subline: nudge.subline || nudge.ctaSubline || '',
        location: 'seo_sticky_bottom',
        pagePath: pathname,
      });
      router.push(`/signup/chart?${params.toString()}`);
      return;
    }

    navigateToHref();
  };

  if (!visible || dismissed || isAuthenticated) return null;

  const displayText = nudge.inlineCopy || nudge.headline;

  return (
    <>
      <div
        className='fixed bottom-0 left-0 right-0 z-40 animate-in slide-in-from-bottom-full duration-300'
        role='complementary'
        aria-label='Sign up prompt'
      >
        <div className='bg-surface-base/95 backdrop-blur-sm border-t border-lunary-primary-700/50'>
          <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3'>
            <button
              onClick={handleClick}
              className='flex-1 flex items-center gap-2 text-sm text-lunary-accent-400 hover:text-content-brand-accent transition-colors group min-w-0'
            >
              <Sparkles className='w-4 h-4 flex-shrink-0' />
              <span className='truncate'>{displayText}</span>
              <ChevronRight className='w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5' />
            </button>
            <button
              onClick={handleDismiss}
              className='flex-shrink-0 p-1 text-content-muted hover:text-content-secondary transition-colors'
              aria-label='Dismiss'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
