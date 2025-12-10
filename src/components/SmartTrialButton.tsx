'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthComponent } from './Auth';
import { useModal } from '@/hooks/useModal';
import { Button } from '@/components/ui/button';

interface SmartTrialButtonProps {
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
}

export function SmartTrialButton({
  size = 'default',
  fullWidth = false,
}: SmartTrialButtonProps) {
  const authState = useAuthStatus();
  const { isSubscribed, isTrialActive } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useModal({
    isOpen: showAuthModal,
    onClose: () => setShowAuthModal(false),
    closeOnClickOutside: false,
  });

  const getButtonConfig = () => {
    if (isSubscribed) {
      return {
        text: 'Manage Subscription',
        href: '/profile',
        action: 'link' as const,
        variant: 'outline' as const,
      };
    }

    if (authState.isAuthenticated && authState.user) {
      return {
        text: isTrialActive ? 'Continue Trial' : 'Upgrade now',
        href: '/pricing',
        action: 'link' as const,
        variant: 'lunary-solid' as const,
      };
    }

    return {
      text: 'Sign In to Start Trial',
      href: null,
      action: 'modal' as const,
      variant: 'lunary-solid' as const,
    };
  };

  const config = getButtonConfig();

  if (config.action === 'link' && config.href) {
    return (
      <Button
        variant={config.variant}
        size={size}
        className={fullWidth ? 'w-full' : ''}
        asChild
      >
        <Link href={config.href}>{config.text}</Link>
      </Button>
    );
  }

  const handleClick = () => {
    if (config.action === 'modal') {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Button
        variant={config.variant}
        size={size}
        className={fullWidth ? 'w-full' : ''}
        onClick={handleClick}
      >
        {config.text}
      </Button>

      {showAuthModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 rounded-lg p-6 w-full max-w-md relative'>
            <button
              onClick={() => setShowAuthModal(false)}
              className='absolute top-4 right-4 text-zinc-400 hover:text-white text-xl'
            >
              ×
            </button>

            <div className='text-center mb-6'>
              <h3 className='text-xl font-bold text-white mb-2'>
                Start Your Free Trial
              </h3>
              <p className='text-zinc-300 text-sm'>
                Create an account to begin your cosmic journey with a free
                trial.
              </p>
            </div>

            <AuthComponent
              compact={false}
              defaultToSignUp={true}
              onSuccess={() => {
                setShowAuthModal(false);
                window.location.href = '/pricing';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
