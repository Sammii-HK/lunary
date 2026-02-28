'use client';

import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';
import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function TrialCountdownBanner() {
  const subscription = useSubscription();
  const authState = useAuthStatus();

  const { isTrialActive, trialDaysRemaining } = subscription;

  if (!isTrialActive || trialDaysRemaining <= 0 || !authState.isAuthenticated) {
    return null;
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50 border-b border-lunary-rose-700 bg-gradient-to-r from-lunary-primary-900 to-lunary-rose-900 backdrop-blur-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between gap-4 py-3'>
          <div className='flex items-center gap-3 flex-1'>
            <Clock className='w-5 h-5 text-lunary-accent flex-shrink-0' />
            <span className='text-sm font-medium text-white'>
              Your trial ends in {trialDaysRemaining} day
              {trialDaysRemaining !== 1 ? 's' : ''} ·{' '}
              <Link
                href='/pricing?nav=app'
                className='underline hover:text-lunary-accent transition-colors inline-flex items-center gap-1'
              >
                Unlock deeper insights
                <Sparkles className='w-4 h-4' />
              </Link>
            </span>
          </div>
          <Button
            variant='lunary-white'
            size='sm'
            className='rounded-full'
            asChild
          >
            <Link href='/pricing?nav=app'>Upgrade Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
