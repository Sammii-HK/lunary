'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { trackCtaClick, trackCtaImpression } from '@/lib/analytics';
import { Heading } from '../ui/Heading';

interface ContextualNudgeButtonProps {
  nudge: ContextualNudge;
  location?: string;
}

export function ContextualNudgeButton({
  nudge,
  location = 'seo_contextual_nudge',
}: ContextualNudgeButtonProps) {
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
        ctaId: 'contextual_nudge',
        location,
        label: nudge.buttonLabel,
        href: nudge.href,
        pagePath: pathname,
        exampleType: nudge.exampleType,
        exampleText: nudge.exampleText,
        ctaVariant: nudge.ctaVariant,
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
      ctaId: 'contextual_nudge',
      location,
      label: nudge.buttonLabel,
      href: nudge.href,
      pagePath: pathname,
      exampleType: nudge.exampleType,
      exampleText: nudge.exampleText,
      ctaVariant: nudge.ctaVariant,
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

  return (
    <>
      <Button variant='lunary-soft' onClick={handleClick}>
        {nudge.buttonLabel}
      </Button>

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
