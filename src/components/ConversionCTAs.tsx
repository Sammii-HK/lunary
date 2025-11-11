'use client';

import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ConversionCTAProps {
  featureName?: string;
  variant?: 'button' | 'link' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function ConversionCTA({
  featureName,
  variant = 'button',
  size = 'md',
  className = '',
  showIcon = true,
}: ConversionCTAProps) {
  const subscription = useSubscription();
  const authState = useAuthStatus();

  const { isTrialActive, isSubscribed } = subscription;

  const handleClick = () => {
    conversionTracking.upgradeClicked(featureName);
  };

  const getButtonText = () => {
    if (!authState.isAuthenticated) return 'Sign In to Unlock';
    if (isTrialActive) return 'Continue Trial';
    if (isSubscribed) return 'Manage Subscription';
    return 'Start Free Trial';
  };

  const getLinkText = () => {
    if (!authState.isAuthenticated) return 'Sign in to unlock';
    if (isTrialActive) return 'Continue your trial';
    return 'Upgrade to unlock';
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  if (variant === 'link') {
    return (
      <Link
        href={authState.isAuthenticated ? '/pricing' : '/auth'}
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors ${sizeClasses[size]} ${className}`}
      >
        <span>{getLinkText()}</span>
        {showIcon && <ArrowRight className='w-3 h-3' />}
      </Link>
    );
  }

  if (variant === 'inline') {
    return (
      <Link
        href={authState.isAuthenticated ? '/pricing' : '/auth'}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors ${className}`}
      >
        {showIcon && <Sparkles className='w-4 h-4' />}
        <span>{getLinkText()}</span>
      </Link>
    );
  }

  return (
    <Link
      href={authState.isAuthenticated ? '/pricing' : '/auth'}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Sparkles className='w-4 h-4' />}
      <span>{getButtonText()}</span>
    </Link>
  );
}
