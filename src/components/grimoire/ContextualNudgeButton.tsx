'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';
import { ContextualNudge } from '@/lib/grimoire/getContextualNudge';
import { Heading } from '../ui/Heading';

interface ContextualNudgeButtonProps {
  nudge: ContextualNudge;
}

export function ContextualNudgeButton({ nudge }: ContextualNudgeButtonProps) {
  const authState = useAuthStatus();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

  const navigateToHref = () => {
    if (nudge.href) {
      router.push(nudge.href);
    }
  };

  const handleClick = () => {
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
