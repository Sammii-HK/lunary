'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthComponent } from './Auth';

interface SmartTrialButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'link';
  fullWidth?: boolean;
}

export function SmartTrialButton({
  size = 'md',
  variant = 'button',
  fullWidth = false,
}: SmartTrialButtonProps) {
  const authState = useAuthStatus();
  const { isSubscribed, isTrialActive } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!showAuthModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAuthModal]);

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
        text: isTrialActive ? 'Continue Trial' : 'Upgrade now',
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

  // Size styles
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Variant styles
  const variantClasses = {
    button:
      'bg-lunary-primary-950 hover:bg-lunary-primary-900 text-lunary-primary border border-lunary-primary-800 hover:border-lunary-primary-700 rounded-lg font-medium',
    link: 'text-xs underline font-medium bg-transparent hover:bg-lunary-primary-900 px-2 py-1 border-0',
  };

  // Base classes
  const baseClasses = 'inline-block transition-all duration-200';

  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${fullWidth ? 'block w-full' : ''}
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
