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

const DISMISS_KEY = 'lunary_sticky_cta_dismissed';

export function StickyBottomCTA({ nudge }: StickyBottomCTAProps) {
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const impressionTracked = useRef(false);

  // Don't show to logged-in users
  const isAuthenticated = authState.isAuthenticated;

  // Check session dismissal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedAt = sessionStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        setDismissed(true);
      }
    }
  }, []);

  // Show after 30% scroll, or after 3s delay on short pages
  useEffect(() => {
    if (dismissed || isAuthenticated) return;

    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    // Short page (no scroll): show after 3 second delay
    if (scrollable <= 50) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    const handleScroll = () => {
      const scrollPercent = window.scrollY / scrollable;
      if (scrollPercent > 0.3) {
        setVisible(true);
      }
    };

    // Check on mount in case user already scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      sessionStorage.setItem(DISMISS_KEY, Date.now().toString());
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
        <div className='bg-zinc-950/95 backdrop-blur-sm border-t border-lunary-primary-700/50'>
          <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3'>
            <button
              onClick={handleClick}
              className='flex-1 flex items-center gap-2 text-sm text-lunary-accent-400 hover:text-lunary-accent-300 transition-colors group min-w-0'
            >
              <Sparkles className='w-4 h-4 flex-shrink-0' />
              <span className='truncate'>{displayText}</span>
              <ChevronRight className='w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5' />
            </button>
            <button
              onClick={handleDismiss}
              className='flex-shrink-0 p-1 text-zinc-500 hover:text-zinc-300 transition-colors'
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
