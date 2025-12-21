// NOTE: Currently unused but kept for future use - generic conversion CTA component
'use client';

import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import {
  getFeatureButtonText,
  getFeatureLinkText,
  getFeatureHref,
} from '@/utils/messaging';

interface ConversionCTAProps {
  featureName?: string;
  feature?: string; // Feature key to check if it's free or paid
  variant?: 'button' | 'link' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  hasRequiredData?: boolean; // e.g., has birthday for birth chart features
}

export function ConversionCTA({
  featureName,
  feature,
  variant = 'button',
  size = 'md',
  className = '',
  showIcon = true,
  hasRequiredData,
}: ConversionCTAProps) {
  const subscription = useSubscription();
  const authState = useAuthStatus();

  const { isTrialActive, isSubscribed } = subscription;

  const handleClick = () => {
    conversionTracking.upgradeClicked(featureName);
  };

  const getButtonText = () => {
    return getFeatureButtonText(
      feature,
      authState.isAuthenticated,
      isSubscribed,
      isTrialActive,
      hasRequiredData,
    );
  };

  const getLinkText = () => {
    const baseText = getFeatureLinkText(
      feature,
      authState.isAuthenticated,
      isSubscribed,
      isTrialActive,
      hasRequiredData,
    );
    // Replace [feature] placeholder if present
    return baseText.replace('[feature]', featureName || 'this feature');
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const href = getFeatureHref(
    feature,
    authState.isAuthenticated,
    hasRequiredData,
  );

  if (variant === 'link') {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-lunary-secondary hover:text-white transition-colors ${sizeClasses[size]} ${className}`}
      >
        <span>{getLinkText()}</span>
        {showIcon && <ArrowRight className='w-3 h-3' />}
      </Link>
    );
  }

  if (variant === 'inline') {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 text-lunary-secondary hover:text-white transition-colors ${className}`}
      >
        {showIcon && <Sparkles className='w-4 h-4' />}
        <span>{getLinkText()}</span>
      </Link>
    );
  }

  const buttonSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default';

  return (
    <Button
      variant='lunary-white'
      size={buttonSize}
      className={`rounded-full ${className}`}
      onClick={handleClick}
      asChild
    >
      <Link href={href}>
        {showIcon && <Sparkles className='w-4 h-4' />}
        <span>{getButtonText()}</span>
      </Link>
    </Button>
  );
}
