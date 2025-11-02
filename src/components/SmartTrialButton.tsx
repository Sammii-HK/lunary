'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthComponent } from './Auth';

interface SmartTrialButtonProps {
  className?: string;
}

export function SmartTrialButton({ className = '' }: SmartTrialButtonProps) {
  const authState = useAuthStatus();
  const { isSubscribed, isTrialActive } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getButtonConfig = () => {
    if (isSubscribed) {
      return {
        text: 'Manage Subscription',
        href: '/profile',
        action: 'link' as const,
      };
    }

    if (authState.isAuthenticated && authState.user) {
      return {
        text: isTrialActive ? 'Continue Trial' : 'Start Free Trial',
        href: '/pricing',
        action: 'link' as const,
      };
    }

    return {
      text: 'Sign In to Start Trial',
      href: null,
      action: 'modal' as const,
    };
  };

  const config = getButtonConfig();
  const buttonClasses = `
    px-6 py-3 text-base
    bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 
    border border-purple-500/20 hover:border-purple-500/30
    rounded-lg font-medium transition-all duration-200
    ${className}
  `.trim();

  if (config.action === 'link' && config.href) {
    return (
      <Link href={config.href} className={buttonClasses}>
        {config.text}
      </Link>
    );
  }

  const handleClick = () => {
    if (config.action === 'modal') {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <button onClick={handleClick} className={buttonClasses}>
        {config.text}
      </button>

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
