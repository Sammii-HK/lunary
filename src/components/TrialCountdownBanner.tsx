'use client';

import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';

export function TrialCountdownBanner() {
  const subscription = useSubscription();
  const authState = useAuthStatus();

  const { isTrialActive, trialDaysRemaining } = subscription;

  if (!isTrialActive || trialDaysRemaining <= 0 || !authState.isAuthenticated) {
    return null;
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between gap-4 py-3'>
          <div className='flex items-center gap-3 flex-1'>
            <Clock className='w-5 h-5 text-purple-300 flex-shrink-0' />
            <span className='text-sm font-medium text-white'>
              Your trial ends in {trialDaysRemaining} day
              {trialDaysRemaining !== 1 ? 's' : ''} ·{' '}
              <Link
                href='/pricing'
                className='underline hover:text-purple-200 transition-colors inline-flex items-center gap-1'
              >
                Unlock deeper insights
                <Sparkles className='w-4 h-4' />
              </Link>
            </span>
          </div>
          <Link
            href='/pricing'
            className='px-4 py-1.5 bg-white text-black rounded-full text-xs font-medium hover:bg-gray-100 transition-colors whitespace-nowrap'
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
}
