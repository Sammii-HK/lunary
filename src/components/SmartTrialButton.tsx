'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStatus } from './AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthComponent } from './Auth';

interface SmartTrialButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function SmartTrialButton({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
}: SmartTrialButtonProps) {
  const authState = useAuthStatus();
  const { isSubscribed, isTrialActive } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Determine button text and action
  const getButtonConfig = () => {
    if (isSubscribed) {
      return {
        text: 'Manage Subscription',
        href: '/profile',
        action: 'link',
      };
    }

    // Simple logic: Better Auth required for subscriptions
    if (authState.isAuthenticated && authState.user) {
      // User has Better Auth - can proceed to subscription
      return {
        text: isTrialActive ? 'Continue Trial' : 'Start Free Trial',
        href: '/pricing',
        action: 'link',
      };
    }

    // Not authenticated with Better Auth - need to sign in
    return {
      text: 'Sign In to Start Trial',
      href: null,
      action: 'modal',
    };
  };

  const config = getButtonConfig();

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary:
      'bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 border border-purple-500/20 hover:border-purple-500/30',
    secondary:
      'bg-zinc-800/50 hover:bg-zinc-800/70 text-zinc-300 border border-zinc-700/50',
  };

  const buttonClasses = `
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    rounded-lg font-medium transition-all duration-200
    ${className}
  `.trim();

  if (config.action === 'link' && config.href) {
    return (
      <Link href={config.href} className={buttonClasses}>
        {children || config.text}
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
        {children || config.text}
      </button>

      {/* Auth Modal for new users */}
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
                console.log('🎉 Auth success - redirecting to pricing');
                setShowAuthModal(false);
                // After successful auth, redirect to pricing page
                window.location.href = '/pricing';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
