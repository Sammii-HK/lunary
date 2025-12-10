'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { SmartTrialButton } from './SmartTrialButton';
import { conversionTracking } from '@/lib/analytics';
import { Sparkles, Zap, Star, X } from 'lucide-react';
import { Button } from './ui/button';

export type UpgradePromptVariant =
  | 'banner'
  | 'card'
  | 'inline'
  | 'modal'
  | 'floating';

type PlanType =
  | 'free'
  | 'lunary_plus'
  | 'lunary_plus_ai'
  | 'lunary_plus_ai_annual';

interface UpgradePromptProps {
  variant?: UpgradePromptVariant;
  featureName?: string;
  title?: string;
  description?: string;
  requiredPlan?: PlanType;
  showTrialCountdown?: boolean;
  className?: string;
  onShow?: () => void;
}

const PLAN_LABELS: Record<PlanType, string> = {
  free: 'Cosmic Explorer',
  lunary_plus: 'Lunary+',
  lunary_plus_ai: 'Lunary+ AI',
  lunary_plus_ai_annual: 'Lunary+ AI Annual',
};

const TRIAL_UPSELL_DISMISSAL_KEY = 'trialUpsellDismissed';
const TRIAL_UPSELL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function UpgradePrompt({
  variant = 'card',
  featureName,
  title,
  description,
  requiredPlan,
  showTrialCountdown = true,
  className = '',
  onShow,
}: UpgradePromptProps) {
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  const {
    showUpgradePrompt,
    isTrialActive,
    trialDaysRemaining,
    isSubscribed: _isSubscribed,
  } = subscription;

  // Check if trial upsell was dismissed recently
  useEffect(() => {
    if (isTrialActive) {
      const dismissedData = localStorage.getItem(TRIAL_UPSELL_DISMISSAL_KEY);
      if (dismissedData) {
        try {
          const { timestamp } = JSON.parse(dismissedData);
          const timeSinceDismissed = Date.now() - timestamp;
          if (timeSinceDismissed < TRIAL_UPSELL_COOLDOWN_MS) {
            // Still in cooldown period
            setIsDismissed(true);
            return;
          }
        } catch (e) {
          // Invalid data, continue
        }
      }
      setIsDismissed(false);
    }
  }, [isTrialActive]);

  // For trial-specific prompts, only show if user is actually on trial AND not dismissed
  // For general upgrade prompts, show if showUpgradePrompt is true (free users)
  // This prevents showing trial upsells to paid users who are not on trial
  if (isTrialActive && isDismissed) return null;
  if (!isTrialActive && !showUpgradePrompt) return null;

  if (onShow && showUpgradePrompt) {
    onShow();
    conversionTracking.upgradePromptShown(featureName);
  }

  const planLabel = requiredPlan ? PLAN_LABELS[requiredPlan] : undefined;
  const dayLabel = trialDaysRemaining === 1 ? 'day' : 'days';
  const defaultTitle = isTrialActive
    ? `Trial: ${trialDaysRemaining} ${dayLabel} left`
    : planLabel
      ? `Upgrade to ${planLabel}`
      : 'Unlock Personalized Features';

  const defaultDescription = isTrialActive
    ? 'Continue enjoying premium cosmic insights after your trial'
    : planLabel
      ? `This feature requires ${planLabel}. Upgrade to unlock it.`
      : 'Readings personalized to your name, birthday, birth chart, birth time and location';

  const promptTitle = title || defaultTitle;
  const promptDescription = description || defaultDescription;

  const handleUpgradeClick = () => {
    conversionTracking.upgradeClicked(featureName);
  };

  const handleDismiss = () => {
    if (isTrialActive) {
      // Store dismissal timestamp for trial upsells
      localStorage.setItem(
        TRIAL_UPSELL_DISMISSAL_KEY,
        JSON.stringify({ timestamp: Date.now() }),
      );
      setIsDismissed(true);
    }
  };

  switch (variant) {
    case 'banner':
      return (
        <div
          className={`bg-gradient-to-r from-lunary-primary-900 to-lunary-secondary-900 border border-lunary-primary-700 rounded-lg p-4 relative ${className}`}
        >
          {isTrialActive && (
            <button
              onClick={handleDismiss}
              className='absolute top-2 right-2 text-zinc-400 hover:text-zinc-100 transition-colors p-1'
              aria-label='Dismiss'
            >
              <X className='w-4 h-4' />
            </button>
          )}
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Zap className='w-5 h-5 text-lunary-primary' />
              <div>
                <h3 className='text-sm font-medium text-white'>
                  {promptTitle}
                </h3>
                <p className='text-xs text-gray-400'>{promptDescription}</p>
              </div>
            </div>
            <Button
              variant='lunary-white'
              size='sm'
              className='rounded-full'
              onClick={handleUpgradeClick}
              asChild
            >
              <Link href={authState.isAuthenticated ? '/pricing' : '/auth'}>
                {authState.isAuthenticated
                  ? isTrialActive
                    ? 'Continue'
                    : 'Upgrade'
                  : 'Sign In'}
              </Link>
            </Button>
          </div>
        </div>
      );

    case 'card':
      return (
        <div
          className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center ${className}`}
        >
          <div className='w-12 h-12 bg-gradient-to-br from-lunary-primary to-lunary-secondary rounded-full flex items-center justify-center mx-auto mb-4'>
            <Star className='w-6 h-6 text-white' />
          </div>
          <h3 className='text-xl font-medium text-white mb-2'>{promptTitle}</h3>
          <p className='text-sm text-gray-400 mb-6'>{promptDescription}</p>
          <SmartTrialButton fullWidth />
        </div>
      );

    case 'inline':
      return (
        <div className={`text-center py-6 ${className}`}>
          <p className='text-sm text-gray-400 mb-4'>{promptDescription}</p>
          <SmartTrialButton />
        </div>
      );

    case 'floating':
      return (
        <div
          className={`fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-4 max-w-sm z-50 shadow-lg relative ${className}`}
        >
          {isTrialActive && (
            <button
              onClick={handleDismiss}
              className='absolute top-2 right-2 text-zinc-400 hover:text-zinc-100 transition-colors p-1'
              aria-label='Dismiss'
            >
              <X className='w-4 h-4' />
            </button>
          )}
          <div className='flex items-start gap-3'>
            <Sparkles className='w-5 h-5 text-lunary-primary mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h3 className='text-sm font-medium text-white mb-1'>
                {promptTitle}
              </h3>
              <p className='text-xs text-gray-400 mb-3'>{promptDescription}</p>
              <Button
                variant='lunary-white'
                size='sm'
                className='rounded-full w-full'
                onClick={handleUpgradeClick}
                asChild
              >
                <Link href={authState.isAuthenticated ? '/pricing' : '/auth'}>
                  {authState.isAuthenticated
                    ? isTrialActive
                      ? 'Continue Trial'
                      : 'Upgrade now'
                    : 'Sign In'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={`bg-zinc-900 rounded-lg p-6 ${className}`}>
          <h3 className='text-lg font-medium text-white mb-2'>{promptTitle}</h3>
          <p className='text-sm text-gray-400 mb-4'>{promptDescription}</p>
          <SmartTrialButton />
        </div>
      );
  }
}
