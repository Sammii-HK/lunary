'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useAstronomyContext } from '@/context/AstronomyContext';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import { getGeneralHoroscope } from '../../../utils/astrology/generalHoroscope';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';

export const DailyInsightCard = () => {
  const { user } = useUser();
  const subscription = useSubscription();
  const { currentDate } = useAstronomyContext();
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const birthChart = user?.birthChart;

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const insight = useMemo(() => {
    const selectedDate = currentDate ? new Date(currentDate) : new Date();

    if (hasChartAccess && userBirthday && birthChart) {
      const horoscope = getEnhancedPersonalizedHoroscope(
        userBirthday,
        userName || undefined,
        { birthday: userBirthday, birthChart },
        selectedDate,
      );
      return {
        text: horoscope.personalInsight,
        isPersonalized: true,
      };
    }

    const general = getGeneralHoroscope(selectedDate);
    const firstSentence = general.reading.split('.')[0] + '.';
    return {
      text: firstSentence,
      isPersonalized: false,
    };
  }, [hasChartAccess, userBirthday, userName, birthChart, currentDate]);

  if (!insight.isPersonalized) {
    return (
      <Link
        href='/horoscope'
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full min-h-20'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='w-4 h-4 text-lunary-primary-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Your Day
              </span>
            </div>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {insight.text}
            </p>
            <div className='flex items-center gap-1.5 mt-2 text-xs text-lunary-primary-200 group-hover:text-lunary-primary-100'>
              <Lock className='w-3 h-3' />
              <span>Unlock readings based on your full birth chart</span>
            </div>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-300 transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href='/horoscope'
      className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full min-h-20'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              <Sparkles className='w-4 h-4 text-lunary-primary-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Your Day
              </span>
            </div>
            <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
              Personal
            </span>
          </div>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {insight.text}
          </p>
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-300 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
