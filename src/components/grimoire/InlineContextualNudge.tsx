'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, ArrowRight, Star } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';

/**
 * Inline CTA Style Variants:
 * - control: Don't show inline CTA
 * - minimal: Simple underlined text link
 * - sparkles: Icon + text + chevron (current default)
 * - card: Small card with background
 */
export type InlineCtaVariant = 'control' | 'minimal' | 'sparkles' | 'card';

interface InlineContextualNudgeProps {
  nudge: ContextualNudge;
  location?: string;
  /** Server-assigned A/B test variant (from middleware cookie) */
  serverVariant?: InlineCtaVariant;
  /** When true, only appears after 50% scroll depth */
  scrollTriggered?: boolean;
}

export function InlineContextualNudge({
  nudge,
  location = 'seo_inline_post_tldr',
  serverVariant,
  scrollTriggered = false,
}: InlineContextualNudgeProps) {
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [scrollVisible, setScrollVisible] = useState(!scrollTriggered);
  const impressionTracked = useRef(false);

  // Use server-assigned variant (works for all users, no PostHog needed)
  const variant: InlineCtaVariant = serverVariant || 'sparkles';

  // 50% scroll trigger
  useEffect(() => {
    if (!scrollTriggered) return;
    if (sessionStorage.getItem('inline_nudge_dismissed')) return;

    const handleScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = window.scrollY / scrollable;
      if (percent > 0.5) {
        setScrollVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollTriggered]);

  // Track impression when component becomes visible
  useEffect(() => {
    if (!scrollVisible) return;
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub: nudge.hub,
        ctaId: 'inline_contextual_nudge',
        location,
        label: nudge.inlineCopy || nudge.buttonLabel,
        href: nudge.href,
        pagePath: pathname,
        exampleType: nudge.exampleType,
        exampleText: nudge.exampleText,
        ctaVariant: nudge.ctaVariant,
        ctaHeadline: nudge.ctaHeadline,
        ctaSubline: nudge.ctaSubline,
        abTest: 'inline_cta',
        abVariant: variant,
        inlineStyle: variant,
      });
    }
  }, [nudge, location, pathname, variant]);

  const navigateToHref = () => {
    if (nudge.href) {
      router.push(nudge.href);
    }
  };

  const handleClick = () => {
    trackCtaClick({
      hub: nudge.hub,
      ctaId: 'inline_contextual_nudge',
      location,
      label: nudge.inlineCopy || nudge.buttonLabel,
      href: nudge.href,
      pagePath: pathname,
      exampleType: nudge.exampleType,
      exampleText: nudge.exampleText,
      ctaVariant: nudge.ctaVariant,
      ctaHeadline: nudge.ctaHeadline,
      ctaSubline: nudge.ctaSubline,
      abTest: 'inline_cta',
      abVariant: variant,
      inlineStyle: variant,
    });

    if (nudge.action === 'link') {
      navigateToHref();
      return;
    }

    if (!authState.isAuthenticated) {
      const params = new URLSearchParams({
        hub: nudge.hub,
        headline: nudge.headline || nudge.ctaHeadline || '',
        subline: nudge.subline || nudge.ctaSubline || '',
        location,
        pagePath: pathname,
      });
      router.push(`/signup/chart?${params.toString()}`);
      return;
    }

    navigateToHref();
  };

  // Use inlineCopy if available, otherwise fall back to headline
  const displayText = nudge.inlineCopy || nudge.headline;

  // Control variant: don't render anything (but still track impression above)
  if (variant === 'control') {
    return null;
  }

  // Scroll-triggered: hidden until 50% scroll
  if (scrollTriggered && !scrollVisible) {
    return null;
  }

  return (
    <>
      <div
        className={`my-6 ${scrollTriggered ? 'transition-all duration-500 opacity-100 translate-y-0' : ''}`}
      >
        {variant === 'minimal' && (
          <button
            onClick={handleClick}
            className='text-sm text-lunary-accent-400 hover:text-lunary-accent-300 underline underline-offset-2 decoration-lunary-accent-400/50 hover:decoration-lunary-accent-300 transition-colors'
          >
            {displayText}
          </button>
        )}

        {variant === 'sparkles' && (
          <button
            onClick={handleClick}
            className='inline-flex items-center gap-2 text-sm text-lunary-accent-400 hover:text-lunary-accent-300 transition-colors group'
          >
            <Sparkles className='w-4 h-4 flex-shrink-0' />
            <span>{displayText}</span>
            <ChevronRight className='w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5' />
          </button>
        )}

        {variant === 'card' && (
          <button
            onClick={handleClick}
            className='flex items-center gap-3 px-4 py-3 rounded-lg bg-lunary-primary-900/30 border border-lunary-primary-700/50 hover:bg-lunary-primary-900/50 hover:border-lunary-primary-600 transition-all group'
          >
            <Star className='w-5 h-5 text-lunary-accent-400 flex-shrink-0' />
            <span className='text-sm text-zinc-200 group-hover:text-white'>
              {displayText}
            </span>
            <ArrowRight className='w-4 h-4 text-lunary-accent-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ml-auto' />
          </button>
        )}
      </div>
    </>
  );
}
