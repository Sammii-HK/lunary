'use client';

import { useMemo } from 'react';
import { useAccount } from 'jazz-tools/react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import {
  getBirthChartFromProfile,
  hasBirthChart,
} from '../../../utils/astrology/birthChart';
import { getGeneralHoroscope } from '../../../utils/astrology/generalHoroscope';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';

export const DailyInsightCard = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const hasBirthChartData = hasBirthChart(me?.profile);
  const birthChart = hasBirthChartData
    ? getBirthChartFromProfile(me?.profile)
    : null;

  const insight = useMemo(() => {
    const today = new Date();

    if (hasChartAccess && userBirthday && birthChart) {
      const horoscope = getEnhancedPersonalizedHoroscope(
        userBirthday,
        userName,
        me?.profile,
      );
      return {
        text: horoscope.personalInsight,
        isPersonalized: true,
      };
    }

    const general = getGeneralHoroscope(today);
    const firstSentence = general.reading.split('.')[0] + '.';
    return {
      text: firstSentence,
      isPersonalized: false,
    };
  }, [hasChartAccess, userBirthday, userName, birthChart, me?.profile]);

  if (!insight.isPersonalized) {
    return (
      <div className='space-y-2'>
        <Link
          href='/horoscope'
          className='block py-3 px-4 border border-stone-800 rounded-md hover:border-purple-500/50 transition-colors group'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <Sparkles className='w-4 h-4 text-purple-400' />
                <span className='text-sm font-medium text-zinc-200'>
                  Your Day
                </span>
              </div>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {insight.text}
              </p>
            </div>
            <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1' />
          </div>
        </Link>
        <Link
          href='/pricing'
          className='flex items-center gap-2 px-4 py-2 text-xs text-purple-400 hover:text-purple-300 transition-colors'
        >
          <Lock className='w-3 h-3' />
          Unlock personalized horoscopes
        </Link>
      </div>
    );
  }

  return (
    <Link
      href='/horoscope'
      className='block py-3 px-4 border border-stone-800 rounded-md hover:border-purple-500/50 transition-colors group'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <Sparkles className='w-4 h-4 text-purple-400' />
            <span className='text-sm font-medium text-zinc-200'>Your Day</span>
            <span className='text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded'>
              Personal
            </span>
          </div>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {insight.text}
          </p>
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
