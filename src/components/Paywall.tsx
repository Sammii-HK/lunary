'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useSubscription } from '../hooks/useSubscription';
import { FEATURE_ACCESS } from '../../utils/pricing';
import { useAuthStatus } from './AuthStatus';
import { SmartTrialButton } from './SmartTrialButton';

interface PaywallProps {
  feature: keyof typeof FEATURE_ACCESS;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Paywall({ feature, children, fallback }: PaywallProps) {
  const { hasAccess, isTrialActive, trialDaysRemaining, showUpgradePrompt } =
    useSubscription();
  const authState = useAuthStatus();

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
        <div className='mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30'>
          <p className='text-purple-200 text-sm font-medium italic'>
            &ldquo;This is the personalised interpretation for YOUR
            chart.&rdquo;
          </p>
        </div>

        <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6'>
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
            <p className='text-sm text-blue-400 mb-2'>
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
          <SmartTrialButton fullWidth />

          <Link
            href='/welcome'
            className='block text-sm text-gray-400 hover:text-white transition-colors'
          >
            Learn more about Personalised Features
          </Link>
        </div>
      </div>
    </div>
  );
}

function getFeatureDescription(feature: string): string {
  switch (feature) {
    case 'birth_chart':
      return 'Access your complete birth chart with detailed planetary positions, aspects, and cosmic patterns unique to your birth time and location.';
    case 'detailed_horoscope':
      return 'Get daily personalized horoscopes that go beyond sun signs, incorporating your entire birth chart for truly customized guidance.';
    case 'tarot_patterns':
      return 'Discover deep insights through tarot pattern analysis, revealing trends and themes in your cosmic journey over time.';
    case 'crystal_recommendations':
      return 'Receive daily crystal recommendations perfectly aligned with your birth chart and current cosmic energies.';
    default:
      return 'This Personalised Feature provides deeper insights into your cosmic profile and personalized guidance.';
  }
}

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

  console.log('UpgradePrompt render:', {
    showUpgradePrompt,
    isTrialActive,
    trialDaysRemaining,
    isSubscribed,
    status,
  });

  if (!showUpgradePrompt) return null;

  return (
    <div className='fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm z-50'>
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
              Get personalized birth charts and daily cosmic guidance
            </p>
          </>
        )}

        <Link
          href={authState.isAuthenticated ? '/pricing' : '/auth'}
          className='block w-full bg-white text-black text-center py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors'
        >
          {authState.isAuthenticated
            ? isTrialActive
              ? 'Continue Trial'
              : 'Start Free Trial'
            : 'Sign In to Continue'}
        </Link>
      </div>
    </div>
  );
}
