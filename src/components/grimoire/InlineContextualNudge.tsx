'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';
import { Heading } from '../ui/Heading';

interface InlineContextualNudgeProps {
  nudge: ContextualNudge;
  location?: string;
}

export function InlineContextualNudge({
  nudge,
  location = 'seo_inline_post_tldr',
}: InlineContextualNudgeProps) {
  const authState = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [showAuthModal, setShowAuthModal] = useState(false);
  const impressionTracked = useRef(false);

  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

  // Track impression when component mounts
  useEffect(() => {
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
      });
    }
  }, [nudge, location, pathname]);

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
    });

    if (nudge.action === 'link') {
      navigateToHref();
      return;
    }

    if (!authState.isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    navigateToHref();
  };

  // Use inlineCopy if available, otherwise fall back to headline
  const displayText = nudge.inlineCopy || nudge.headline;

  return (
    <>
      <div className='my-6'>
        <button
          onClick={handleClick}
          className='inline-flex items-center gap-2 text-sm text-lunary-accent-400 hover:text-lunary-accent-300 transition-colors group'
        >
          <Sparkles className='w-4 h-4 flex-shrink-0' />
          <span>{displayText}</span>
          <ChevronRight className='w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5' />
        </button>
      </div>

      {showAuthModal && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 rounded-xl p-6 sm:p-8 w-full max-w-md relative mx-4 sm:mx-0 shadow-lg shadow-black/50'>
            <Button
              variant='ghost'
              onClick={() => setShowAuthModal(false)}
              aria-label='Close sign in modal'
            >
              ×
            </Button>
            <div className='text-center mb-4'>
              <Heading variant='h3' className='mb-2'>
                Sign in to Lunary
              </Heading>
              <p className='text-zinc-300 text-xs sm:text-sm'>
                Create a free account to unlock your chart, preferences, and
                personalised guidance.
              </p>
            </div>
            <AuthComponent
              compact={false}
              defaultToSignUp
              onSuccess={() => {
                setShowAuthModal(false);
                navigateToHref();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
