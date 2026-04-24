'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';

import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { Button } from './ui/button';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';
import { trackEvent } from '@/lib/analytics';

const TRIAL_COUNTDOWN_TEST = 'trial_countdown_v1';

export function TrialCountdownBanner() {
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const variantRaw = useFeatureFlagVariant(TRIAL_COUNTDOWN_TEST);

  const { isTrialActive, trialDaysRemaining } = subscription;

  const isVisible =
    isTrialActive && trialDaysRemaining > 0 && authState.isAuthenticated;

  // Treat the urgency variant string as the active test arm. Anything else
  // (including undefined / no-variant) is control copy.
  const variant = typeof variantRaw === 'string' ? variantRaw : 'control';
  const isUrgency = variant === 'urgency';

  useEffect(() => {
    if (!isVisible) return;

    const abMetadata = getABTestMetadataFromVariant(
      TRIAL_COUNTDOWN_TEST,
      variantRaw,
    );

    trackEvent('trial_countdown_view', {
      metadata: {
        variant,
        daysRemaining: trialDaysRemaining,
        ...(abMetadata ?? {}),
      },
    });
  }, [isVisible, variant, variantRaw, trialDaysRemaining]);

  if (!isVisible) {
    return null;
  }

  const handleCtaClick = () => {
    const abMetadata = getABTestMetadataFromVariant(
      TRIAL_COUNTDOWN_TEST,
      variantRaw,
    );

    trackEvent('trial_countdown_cta_click', {
      metadata: {
        variant,
        daysRemaining: trialDaysRemaining,
        ...(abMetadata ?? {}),
      },
    });
  };

  const controlCopy = (
    <>
      Your trial ends in {trialDaysRemaining} day
      {trialDaysRemaining !== 1 ? 's' : ''} ·{' '}
      <Link
        href='/pricing?nav=app'
        onClick={handleCtaClick}
        className='underline hover:text-lunary-accent transition-colors inline-flex items-center gap-1'
      >
        Unlock deeper insights
        <Sparkles className='w-4 h-4' />
      </Link>
    </>
  );

  const urgencyCopy = (
    <>
      {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left,{' '}
      <Link
        href='/pricing?nav=app'
        onClick={handleCtaClick}
        className='underline hover:text-lunary-accent transition-colors inline-flex items-center gap-1'
      >
        lock in £4.99/mo before your trial ends
        <Sparkles className='w-4 h-4' />
      </Link>
    </>
  );

  return (
    <div className='fixed top-0 left-0 right-0 z-50 border-b border-lunary-rose-700 bg-gradient-to-r from-layer-base to-lunary-rose-900 backdrop-blur-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between gap-4 py-3'>
          <div className='flex items-center gap-3 flex-1'>
            <Clock className='w-5 h-5 text-lunary-accent flex-shrink-0' />
            <span className='text-sm font-medium text-content-primary'>
              {isUrgency ? urgencyCopy : controlCopy}
            </span>
          </div>
          <Button
            variant='lunary-white'
            size='sm'
            className='rounded-full'
            asChild
          >
            <Link href='/pricing?nav=app' onClick={handleCtaClick}>
              {isUrgency ? 'Lock in' : 'Upgrade Now'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
