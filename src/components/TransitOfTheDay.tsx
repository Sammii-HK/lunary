'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import {
  getUpcomingTransits,
  TransitEvent,
} from '../../utils/astrology/transitCalendar';
import {
  getPersonalTransitImpacts,
  PersonalTransitImpact,
} from '../../utils/astrology/personalTransits';
import { useSubscription } from '../hooks/useSubscription';
import { hasFeatureAccess } from '../../utils/pricing';
import { bodiesSymbols } from '@/constants/symbols';
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
  const authStatus = useAuthStatus();
  const subscription = useSubscription();

  // For unauthenticated users, force paid access to false immediately
  // Don't wait for subscription to resolve
  const hasPersonalizedAccess = !authStatus.isAuthenticated
    ? false
    : hasFeatureAccess(
        subscription.status,
        subscription.plan,
        'personalized_transit_readings',
      );

  // Get general transits for unauthenticated users or when no chart access
  const generalTransit = useMemo((): TransitEvent | null => {
    if (authStatus.isAuthenticated && hasPersonalizedAccess) return null;

    const upcomingTransits = getUpcomingTransits();
    if (upcomingTransits.length === 0) return null;

    const today = dayjs().startOf('day');
    const nextWeek = today.add(7, 'day');

    const relevantTransits = upcomingTransits.filter((t) => {
      const transitDate = dayjs(t.date);
      return (
        transitDate.isAfter(today.subtract(1, 'day')) &&
        transitDate.isBefore(nextWeek)
      );
    });

    if (relevantTransits.length === 0) {
      return upcomingTransits[0];
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sorted = relevantTransits.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.significance] - priorityOrder[a.significance];
      if (priorityDiff !== 0) return priorityDiff;
      return dayjs(a.date).diff(dayjs(b.date));
    });

    return sorted[0];
  }, [authStatus.isAuthenticated, hasPersonalizedAccess]);

  // Get personalized transit for authenticated users with chart access
  const transit = useMemo((): PersonalTransitImpact | null => {
    if (!authStatus.isAuthenticated || !user || !hasPersonalizedAccess)
      return null;
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
  }, [authStatus.isAuthenticated, user, hasPersonalizedAccess]);

  // Show general transit for unauthenticated users or users without chart access
  if (!authStatus.isAuthenticated || !hasPersonalizedAccess) {
    if (!generalTransit) {
      // Fallback: show upsell if no transits available (shouldn't happen)
      return (
        <Link
          href='/pricing'
          className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles className='w-4 h-4 text-lunary-secondary-200' />
              <span className='text-sm text-lunary-primary-200'>
                Unlock personal transit insights
              </span>
            </div>
            <ArrowRight className='w-4 h-4 text-lunary-secondary-200' />
          </div>
        </Link>
      );
    }

    const transitDate = dayjs(generalTransit.date);
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
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2 align-middle'>
                <span className='font-astro text-lg text-lunary-secondary-200 align-middle'>
                  {getPlanetSymbol(generalTransit.planet)}
                </span>
                <span className='text-sm font-medium text-zinc-200'>
                  Your Next Transit
                </span>
                <span className='text-xs text-zinc-400 uppercase tracking-wide'>
                  {dateLabel}
                </span>
              </div>
              {generalTransit.significance === 'high' && (
                <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                  Major
                </span>
              )}
            </div>
            <p className='text-sm text-zinc-200 mb-1'>
              {generalTransit.planet} {generalTransit.event}
            </p>
            <p className='text-xs text-zinc-400 line-clamp-2 mb-2'>
              {generalTransit.description}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer'
            >
              Unlock personal transit insights with Lunary+
            </button>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-secondary-200 transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  if (!transit) {
    // Fallback: show general transit if no personalized transit available
    if (generalTransit) {
      const transitDate = dayjs(generalTransit.date);
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
          className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <div className='flex items-center gap-2 align-middle'>
                  <span className='font-astro text-lg text-lunary-secondary-200'>
                    {getPlanetSymbol(generalTransit.planet)}
                  </span>
                  <span className='text-sm font-medium text-zinc-200'>
                    Your Next Transit
                  </span>
                  <span className='text-xs text-zinc-400 uppercase tracking-wide'>
                    {dateLabel}
                  </span>
                </div>
                {generalTransit.significance === 'high' && (
                  <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                    Major
                  </span>
                )}
              </div>
              <p className='text-sm text-zinc-200 mb-1'>
                {generalTransit.planet} {generalTransit.event}
              </p>
              <p className='text-xs text-zinc-400 line-clamp-2'>
                {generalTransit.description}
              </p>
            </div>
            <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-secondary-200 transition-colors flex-shrink-0 mt-1' />
          </div>
        </Link>
      );
    }
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
      className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2 align-middle'>
              <span className='font-astro text-lg text-lunary-secondary-200'>
                {getPlanetSymbol(transit.planet)}
              </span>
              <span className='text-sm font-medium text-zinc-200'>
                Your Next Transit
              </span>
              <span className='text-xs text-zinc-400 uppercase tracking-wide'>
                {dateLabel}
              </span>
            </div>
            {transit.significance === 'high' && (
              <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
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
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-secondary-200 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
