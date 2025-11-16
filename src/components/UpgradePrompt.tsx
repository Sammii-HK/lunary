'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { SmartTrialButton } from './SmartTrialButton';
import { conversionTracking } from '@/lib/analytics';
import { Sparkles, Zap, Star } from 'lucide-react';

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

  const { showUpgradePrompt, isTrialActive, trialDaysRemaining, isSubscribed } =
    subscription;

  if (!showUpgradePrompt && !isTrialActive) return null;

  if (onShow && showUpgradePrompt) {
    onShow();
    conversionTracking.upgradePromptShown(featureName);
  }

  const planLabel = requiredPlan ? PLAN_LABELS[requiredPlan] : undefined;
  const defaultTitle = isTrialActive
    ? `Trial: ${trialDaysRemaining} days left`
    : planLabel
      ? `Upgrade to ${planLabel}`
      : 'Unlock Personalized Features';

  const defaultDescription = isTrialActive
    ? 'Continue enjoying premium cosmic insights after your trial'
    : planLabel
      ? `This feature requires ${planLabel}. Upgrade to unlock it.`
      : 'Get personalized birth charts, daily horoscopes, and cosmic guidance tailored to you';

  const promptTitle = title || defaultTitle;
  const promptDescription = description || defaultDescription;

  const handleUpgradeClick = () => {
    conversionTracking.upgradeClicked(featureName);
  };

  switch (variant) {
    case 'banner':
      return (
        <div
          className={`bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 ${className}`}
        >
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Zap className='w-5 h-5 text-purple-400' />
              <div>
                <h3 className='text-sm font-medium text-white'>
                  {promptTitle}
                </h3>
                <p className='text-xs text-gray-400'>{promptDescription}</p>
              </div>
            </div>
            <Link
              href={authState.isAuthenticated ? '/pricing' : '/auth'}
              onClick={handleUpgradeClick}
              className='bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap'
            >
              {authState.isAuthenticated
                ? isTrialActive
                  ? 'Continue'
                  : 'Upgrade'
                : 'Sign In'}
            </Link>
          </div>
        </div>
      );

    case 'card':
      return (
        <div
          className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center ${className}`}
        >
          <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
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
          className={`fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-4 max-w-sm z-50 shadow-lg ${className}`}
        >
          <div className='flex items-start gap-3'>
            <Sparkles className='w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>
              <h3 className='text-sm font-medium text-white mb-1'>
                {promptTitle}
              </h3>
              <p className='text-xs text-gray-400 mb-3'>{promptDescription}</p>
              <Link
                href={authState.isAuthenticated ? '/pricing' : '/auth'}
                onClick={handleUpgradeClick}
                className='block w-full bg-white text-black text-center py-2 px-4 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors'
              >
                {authState.isAuthenticated
                  ? isTrialActive
                    ? 'Continue Trial'
                    : 'Start Free Trial'
                  : 'Sign In'}
              </Link>
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
