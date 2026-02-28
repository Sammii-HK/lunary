'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import { SmartTrialButton } from './SmartTrialButton';
import { IOSPaywall } from './IOSPaywall';
import { X } from 'lucide-react';
import { captureEvent } from '@/lib/posthog-client';
import { Button } from './ui/button';
import type { FeatureKey } from '../../utils/pricing';

type FeatureName = FeatureKey;

interface PaywallProps {
  feature: FeatureName;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Paywall({ feature, children, fallback }: PaywallProps) {
  const {
    hasAccess,
    isTrialActive,
    trialDaysRemaining,
    showUpgradePrompt: _showUpgradePrompt,
    loading,
  } = useSubscription();
  const _authState = useAuthStatus();
  const [paywallTracked, setPaywallTracked] = useState(false);

  const shouldShowPaywall = !loading && !hasAccess(feature) && !fallback;

  useEffect(() => {
    if (shouldShowPaywall && !paywallTracked) {
      captureEvent('subscription_viewed', {
        feature,
        is_trial_active: isTrialActive,
        trial_days_remaining: trialDaysRemaining,
      });
      setPaywallTracked(true);
    }
  }, [
    shouldShowPaywall,
    paywallTracked,
    feature,
    isTrialActive,
    trialDaysRemaining,
  ]);

  if (loading) {
    return <>{children}</>;
  }

  if (hasAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className='bg-gray-900 rounded-lg p-8 text-center'>
      <div className='max-w-md mx-auto'>
        {/* Teaser Text */}
        <div className='mb-6 p-4 bg-gradient-to-r from-lunary-primary-900 to-lunary-highlight-900 rounded-lg border border-lunary-primary-700'>
          <p className='text-lunary-accent text-sm font-medium italic'>
            &ldquo;This is the personalised interpretation for YOUR
            chart.&rdquo;
          </p>
        </div>

        <div className='w-16 h-16 bg-gradient-to-br from-lunary-primary to-lunary-secondary rounded-full flex items-center justify-center mx-auto mb-6'>
          <svg
            className='w-8 h-8 text-white'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
        </div>

        <h3 className='text-2xl font-light mb-4'>Personalised Feature</h3>

        <p className='text-gray-400 mb-6'>{getFeatureDescription(feature)}</p>

        {isTrialActive ? (
          <div className='mb-6'>
            <p className='text-sm text-lunary-accent mb-2'>
              🌟 Trial Active: {trialDaysRemaining} days remaining
            </p>
            <p className='text-xs text-gray-400'>
              This feature will be available during your trial period.
            </p>
          </div>
        ) : (
          <div className='mb-6'>
            <p className='text-sm text-gray-400'>
              Unlock this feature with a subscription to access personalized
              cosmic insights.
            </p>
          </div>
        )}

        <div className='space-y-3'>
          {Capacitor.getPlatform() === 'ios' ? (
            <IOSPaywall />
          ) : (
            <>
              <SmartTrialButton fullWidth />
              <Link
                href='/welcome'
                className='block text-sm text-gray-400 hover:text-white transition-colors'
              >
                Learn more about Personalised Features
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getFeatureDescription(feature: FeatureKey): string {
  switch (feature) {
    case 'birth_chart':
      return 'Access your complete birth chart with detailed planetary positions, aspects, and cosmic patterns unique to your birth time and location.';
    case 'personalized_horoscope':
      return 'Get daily personalized horoscopes that go beyond sun signs, incorporating your entire birth chart for truly customized guidance.';
    case 'tarot_patterns':
      return 'Discover deep insights through tarot pattern analysis, revealing trends and themes in your cosmic journey over time.';
    case 'personalized_crystal_recommendations':
      return 'Receive daily crystal recommendations perfectly aligned with your birth chart and current cosmic energies.';
    case 'downloadable_reports':
      return 'Generate personalized PDF cosmic reports with transits, moon phases, tarot insights, and rituals. Create shareable reports for launches, birthdays, and special moments.';
    case 'yearly_forecast':
      return 'Get a comprehensive yearly cosmic forecast with major transits, eclipses, retrograde periods, and seasonal transitions. Plan your year with cosmic awareness.';
    case 'data_export':
      return 'Export all your cosmic data including birth chart, tarot readings, collections, and insights. Download your complete Lunary journey as JSON.';
    case 'monthly_insights':
      return 'Track your monthly cosmic patterns with frequent tarot cards, dominant themes, and personalized insights from your readings. See how your cosmic journey unfolds over time.';
    case 'personalized_horoscope':
      return 'Get daily personalized horoscopes that dynamically change based on your selected date, incorporating your entire birth chart for truly customized guidance.';
    case 'personalized_crystal_recommendations':
      return 'Receive crystal recommendations that dynamically change based on your selected date, perfectly aligned with your birth chart and cosmic energies.';
    default:
      return 'This Personalised Feature provides deeper insights into your cosmic profile and personalized guidance.';
  }
}

const TRIAL_UPSELL_DISMISSAL_KEY = 'trialUpsellDismissed';
const TRIAL_UPSELL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple upgrade prompt component
export function UpgradePrompt() {
  const {
    showUpgradePrompt,
    isTrialActive,
    trialDaysRemaining,
    isSubscribed,
    status,
  } = useSubscription();
  const authState = useAuthStatus();
  const [isDismissed, setIsDismissed] = useState(false);

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

  console.log('UpgradePrompt render:', {
    showUpgradePrompt,
    isTrialActive,
    trialDaysRemaining,
    isSubscribed,
    status,
    isDismissed,
  });

  // Only show trial-specific messaging if user is actually on trial AND not dismissed
  // Otherwise, only show if showUpgradePrompt is true (free users)
  if (isTrialActive && isDismissed) return null;
  if (!isTrialActive && !showUpgradePrompt) return null;

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

  return (
    <div className='fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm z-50'>
      {isTrialActive && (
        <button
          onClick={handleDismiss}
          className='absolute top-2 right-2 text-zinc-400 hover:text-zinc-100 transition-colors p-1'
          aria-label='Dismiss'
        >
          <X className='w-4 h-4' />
        </button>
      )}
      <div className='text-sm'>
        {isTrialActive ? (
          <>
            <p className='text-white font-medium mb-2'>
              🌟 Trial: {trialDaysRemaining} days left
            </p>
            <p className='text-gray-400 mb-3'>
              Continue enjoying premium cosmic insights
            </p>
          </>
        ) : (
          <>
            <p className='text-white font-medium mb-2'>
              Unlock Personalised Features
            </p>
            <p className='text-gray-400 mb-3'>
              Readings based on your name, birthday, birth time and location
            </p>
          </>
        )}

        <Button
          variant='lunary-white'
          size='sm'
          className='rounded-full w-full'
          asChild
        >
          <Link href={authState.isAuthenticated ? '/pricing?nav=app' : '/auth'}>
            {authState.isAuthenticated
              ? isTrialActive
                ? 'Continue Trial'
                : 'Upgrade now'
              : 'Sign In to Continue'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
