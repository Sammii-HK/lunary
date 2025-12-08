'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SmartTrialButton } from './SmartTrialButton';
import { Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function PostTrialMessaging() {
  const subscription = useSubscription();
  const [missedInsights, setMissedInsights] = useState<number | null>(null);

  const hadTrialButExpired = subscription.status === 'cancelled';

  useEffect(() => {
    if (hadTrialButExpired) {
      setMissedInsights(7);
    }
  }, [hadTrialButExpired]);

  if (!hadTrialButExpired || !missedInsights) {
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
            You've missed {missedInsights} cosmic insight
            {missedInsights !== 1 ? 's' : ''} 🌙
          </h3>
          <p className='text-zinc-300 text-sm mb-4'>
            Your personalized horoscopes, birth chart insights, and tarot
            patterns are waiting for you. Rejoin to continue your cosmic
            journey.
          </p>
          <div className='flex flex-col sm:flex-row gap-3'>
            <SmartTrialButton size='md' />
            <Link
              href='/pricing'
              className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white text-sm font-medium transition-colors text-center'
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
