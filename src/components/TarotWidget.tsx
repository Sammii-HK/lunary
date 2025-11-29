'use client';
import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from './SmartTrialButton';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import { useState, useEffect } from 'react';
import type { GeneralTarotReading } from '../../utils/tarot/generalTarot';

export const TarotWidget = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const { currentTarotCard } = useAstronomyContext();
  const [generalTarot, setGeneralTarot] = useState<GeneralTarotReading | null>(
    null,
  );

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  useEffect(() => {
    if (!hasChartAccess && !generalTarot) {
      import('../../utils/tarot/generalTarot')
        .then(({ getGeneralTarotReading }) => {
          setGeneralTarot(getGeneralTarotReading());
        })
        .catch((err) => {
          console.error('Failed to load tarot reading:', err);
        });
    }
  }, [hasChartAccess, generalTarot]);

  // If user doesn't have birth chart access, show general tarot reading
  if (!hasChartAccess) {
    if (!generalTarot) {
      return (
        <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
          <div className='h-full flex items-center justify-center'>
            <div className='w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
          </div>
        </div>
      );
    }
    return (
      <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
        <div className='space-y-3 flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
          <div className='text-center'>
            <h4 className='font-semibold text-purple-300 mb-2'>
              {generalTarot.daily.name}
            </h4>
            <p className='text-xs text-zinc-400 mb-3 break-words'>
              {generalTarot.daily.keywords.slice(0, 3).join(' • ')}
            </p>
          </div>

          <p className='text-sm text-zinc-300 leading-relaxed break-words'>
            {generalTarot.guidance.dailyMessage}
          </p>

          <div className='bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded p-3 border border-purple-500/20'>
            <p className='text-xs text-purple-200 mb-1 font-medium'>
              Your personalized tarot pattern has been calculated
            </p>
            <p className='text-xs text-zinc-400 mb-2'>
              Unlock it now to see what's influencing you today based on your
              name and birthday. Discover what the cards reveal about you!
            </p>
            <SmartTrialButton variant='link' />
          </div>
        </div>
      </div>
    );
  }

  // For premium users, show personalized tarot
  return (
    <div className='p-5 border border-stone-800 rounded-md w-full h-full flex flex-col min-w-0 overflow-hidden min-h-64'>
      <div className='space-y-3 flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Personal Tarot Card</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
        </div>

        <div className='text-center'>
          <h4 className='font-semibold text-white mb-3'>
            {currentTarotCard.name}
          </h4>
          <p className='text-xs text-zinc-400 mb-3 break-words'>
            {currentTarotCard.keywords.join(' • ')}
          </p>
        </div>

        <p className='text-sm text-zinc-300 leading-relaxed break-words'>
          {currentTarotCard.information}
        </p>
      </div>
    </div>
  );
};
