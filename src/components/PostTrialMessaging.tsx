'use client';

import { useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUser } from '@/context/UserContext';
import { SmartTrialButton } from './SmartTrialButton';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export function PostTrialMessaging() {
  const subscription = useSubscription();
  const { user } = useUser();

  // Show for users who had a trial that expired and didn't convert
  const trialExpired = useMemo(() => {
    if (subscription.status === 'active') return false;
    if (subscription.isTrialActive) return false;

    // Check if user had a trial that ended (trialEndsAt in the past)
    const trialEndsAt = user?.trialEndsAt;
    if (!trialEndsAt) return false;

    return new Date(trialEndsAt) < new Date();
  }, [subscription.status, subscription.isTrialActive, user?.trialEndsAt]);

  const missedInsights = useMemo(() => {
    if (!trialExpired || !user?.trialEndsAt) return 0;
    const daysSince = Math.floor(
      (Date.now() - new Date(user.trialEndsAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return Math.max(1, daysSince);
  }, [trialExpired, user?.trialEndsAt]);

  if (!trialExpired || missedInsights === 0) {
    return null;
  }

  return (
    <div className='bg-gradient-to-r from-lunary-primary-900/40 to-pink-900/40 rounded-lg p-6 border border-lunary-primary/30 mb-6'>
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0 w-12 h-12 rounded-full bg-lunary-primary-500/20 flex items-center justify-center'>
          <Calendar className='w-6 h-6 text-lunary-primary-300' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-white mb-2'>
            You&apos;ve missed {missedInsights} day
            {missedInsights !== 1 ? 's' : ''} of personalised guidance
          </h3>
          <p className='text-zinc-300 text-sm mb-4'>
            Your daily tarot pulls, personalised horoscopes, and transit
            insights have been waiting. Pick up where you left off.
          </p>
          <p className='text-lunary-primary-300 text-sm font-medium mb-4'>
            Come back with 20% off — use code COSMICSEASON at checkout
          </p>
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button variant='lunary-soft' size='default' asChild>
              <Link href='/pricing?nav=app&promo=COSMICSEASON'>
                Get 20% off
              </Link>
            </Button>
            <SmartTrialButton size='default' />
          </div>
        </div>
      </div>
    </div>
  );
}
