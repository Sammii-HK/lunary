'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getUpcomingTransits } from '../../utils/astrology/transitCalendar';
import {
  getPersonalTransitImpacts,
  PersonalTransitImpact,
} from '../../utils/astrology/personalTransits';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import { bodiesSymbols } from '../../utils/zodiac/zodiac';
import dayjs from 'dayjs';

const getOrdinalSuffix = (n: number): string => {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const getPlanetSymbol = (planet: string): string => {
  const key = planet.toLowerCase() as keyof typeof bodiesSymbols;
  return bodiesSymbols[key] || planet.charAt(0);
};

export const TransitOfTheDay = () => {
  const { user } = useUser();
  const subscription = useSubscription();

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const transit = useMemo((): PersonalTransitImpact | null => {
    if (!user || !hasChartAccess) return null;
    const birthChart = user.birthChart;
    if (!birthChart || birthChart.length === 0) return null;

    const upcomingTransits = getUpcomingTransits();
    const personalImpacts = getPersonalTransitImpacts(
      upcomingTransits,
      birthChart,
      20,
    );

    if (personalImpacts.length === 0) return null;

    const today = dayjs().startOf('day');
    const nextWeek = today.add(7, 'day');

    const relevantTransits = personalImpacts.filter((t) => {
      const transitDate = dayjs(t.date);
      return (
        transitDate.isAfter(today.subtract(1, 'day')) &&
        transitDate.isBefore(nextWeek)
      );
    });

    if (relevantTransits.length === 0) {
      return personalImpacts[0];
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sorted = relevantTransits.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.significance] - priorityOrder[a.significance];
      if (priorityDiff !== 0) return priorityDiff;
      return dayjs(a.date).diff(dayjs(b.date));
    });

    return sorted[0];
  }, [user, hasChartAccess]);

  if (!hasChartAccess) {
    return (
      <Link
        href='/pricing'
        className='block py-3 px-4 border border-purple-500/30 bg-purple-500/5 rounded-md w-full h-full hover:bg-purple-500/10 transition-colors'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Sparkles className='w-4 h-4 text-purple-400' />
            <span className='text-sm text-purple-300'>
              Unlock personal transit insights
            </span>
          </div>
          <ArrowRight className='w-4 h-4 text-purple-400' />
        </div>
      </Link>
    );
  }

  if (!transit) {
    return null;
  }

  const transitDate = dayjs(transit.date);
  const isToday = transitDate.isSame(dayjs(), 'day');
  const isTomorrow = transitDate.isSame(dayjs().add(1, 'day'), 'day');
  const dateLabel = isToday
    ? 'Today'
    : isTomorrow
      ? 'Tomorrow'
      : transitDate.format('MMM D');

  return (
    <Link
      href='/horoscope'
      className='block py-3 px-4 border border-stone-800 rounded-md w-full h-full hover:border-purple-500/50 transition-colors group'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='font-astro text-lg text-purple-400'>
              {getPlanetSymbol(transit.planet)}
            </span>
            <span className='text-xs text-zinc-500 uppercase tracking-wide'>
              {dateLabel}
            </span>
            {transit.significance === 'high' && (
              <span className='text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded'>
                Major
              </span>
            )}
          </div>
          <p className='text-sm text-zinc-200 mb-1'>
            {transit.planet} {transit.event}
            {transit.house && (
              <span className='text-zinc-400'>
                {' '}
                → your {transit.house}
                {getOrdinalSuffix(transit.house)} house
              </span>
            )}
          </p>
          <p className='text-xs text-zinc-400 line-clamp-2'>
            {transit.actionableGuidance}
          </p>
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
