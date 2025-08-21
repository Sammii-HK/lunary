'use client';
import { useAccount } from 'jazz-tools/react';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import { getGeneralTarotReading } from '../../utils/tarot/generalTarot';
import Link from 'next/link';

export const TarotWidget = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const { currentTarotCard } = useAstronomyContext();

  const hasChartAccess = hasBirthChartAccess(subscription.status);
  const userName = (me?.profile as any)?.name;

  // If user doesn't have birth chart access, show general tarot reading
  if (!hasChartAccess) {
    const generalTarot = getGeneralTarotReading();
    return (
      <div className='p-5 border border-stone-800 rounded-md w-full'>
        <div className='space-y-3'>
          {/* <div className='flex items-center justify-between'>
            <h3 className='font-bold'>Daily Tarot Guidance</h3>
            <span className='text-lg'>🔮</span>
          </div> */}

          {/* Daily Card Display */}
          <div className='text-center'>
            <h4 className='font-semibold text-purple-300 mb-2'>
              {generalTarot.daily.name}
            </h4>
            <p className='text-xs text-zinc-400 mb-3'>
              {generalTarot.daily.keywords.slice(0, 3).join(' • ')}
            </p>
          </div>

          {/* Daily Message */}
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {generalTarot.guidance.dailyMessage}
          </p>

          {/* Upsell Section */}
          <div className='bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded p-3 border border-purple-500/20'>
            {/* <p className='text-xs text-purple-200 mb-1'>
              🔮 Start Your Free Trial
            </p> */}
            <p className='text-xs text-zinc-400 mb-2'>
              Get tarot readings based on YOUR name and birthday. Discover what
              the cards reveal about you!
            </p>
            <Link
              href='/pricing'
              className='text-xs text-purple-400 underline font-medium'
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // For premium users, show personalized tarot
  return (
    <div className='p-5 border border-stone-800 rounded-md w-full'>
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Personal Tarot Card</h3>
          <span className='text-xs text-purple-400'>✨ Premium</span>
        </div>

        <div className='text-center'>
          <h4 className='font-semibold text-white mb-3'>
            {currentTarotCard.name}
          </h4>
          <p className='text-xs text-zinc-400 mb-3'>
            {currentTarotCard.keywords.join(' • ')}
          </p>
        </div>

        <p className='text-sm text-zinc-300 leading-relaxed'>
          {currentTarotCard.information}
        </p>
      </div>
    </div>
  );
};
