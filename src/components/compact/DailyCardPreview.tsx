'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';
import Link from 'next/link';
import { ArrowRight, Lock, Layers } from 'lucide-react';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(utc);
dayjs.extend(dayOfYear);

export const DailyCardPreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  const { currentDate } = useAstronomyContext();
  const userName = user?.name;
  const userBirthday = user?.birthday;

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  // Birth chart is free but requires account - check authentication
  const canAccessPersonalized =
    authStatus.isAuthenticated && hasChartAccess && userName && userBirthday;

  const dailyCard = useMemo(() => {
    const dateStr = currentDate || dayjs().utc().format('YYYY-MM-DD');
    const selectedDay = dayjs(dateStr);

    if (canAccessPersonalized) {
      const card = getTarotCard(`daily-${dateStr}`, userName!, userBirthday!);
      return {
        name: card.name,
        keywords: card.keywords?.slice(0, 3) || [],
        information: card.information || '',
        isPersonalized: true,
      };
    }

    const dayOfYearNum = selectedDay.dayOfYear();
    const generalSeed = `cosmic-${dateStr}-${dayOfYearNum}-energy`;
    const card = getTarotCard(generalSeed);
    return {
      name: card.name,
      keywords: card.keywords?.slice(0, 3) || [],
      information: card.information || '',
      isPersonalized: false,
    };
  }, [canAccessPersonalized, userName, userBirthday, currentDate]);

  if (!dailyCard.isPersonalized) {
    return (
      <Link
        href='/tarot'
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <Layers className='w-4 h-4 text-lunary-accent-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Daily Card
              </span>
            </div>
            <p className='text-sm text-lunary-primary-200 font-medium'>
              {dailyCard.name}
            </p>
            <p className='text-xs text-zinc-400'>
              {dailyCard.keywords.join(' • ')}
            </p>
            {dailyCard.information && (
              <p className='hidden md:block text-xs text-zinc-400 mt-2 line-clamp-2'>
                {dailyCard.information}
              </p>
            )}
            <Link
              href={
                authStatus.isAuthenticated ? '/pricing' : '/auth?signup=true'
              }
              onClick={(e) => e.stopPropagation()}
              className='flex items-center gap-1.5 mt-2 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors'
            >
              <Lock className='w-3 h-3' />
              <span>
                {authStatus.isAuthenticated
                  ? 'Upgrade to get personalized tarot'
                  : 'Sign up to get personalized tarot'}
              </span>
            </Link>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-300 transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href='/tarot'
      className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              <Layers className='w-4 h-4 text-lunary-accent-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Daily Card
              </span>
            </div>
            <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
              Personal
            </span>
          </div>
          <p className='text-sm text-lunary-primary-200 font-medium'>
            {dailyCard.name}
          </p>
          <p className='text-xs text-zinc-400'>
            {dailyCard.keywords.join(' • ')}
          </p>
          {dailyCard.information && (
            <p className='hidden md:block text-xs text-zinc-400 mt-2 line-clamp-2'>
              {dailyCard.information}
            </p>
          )}
          <p className='text-xs text-zinc-500 mt-1.5'>View your patterns →</p>
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-300 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
