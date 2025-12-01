'use client';

import { useMemo } from 'react';
import { useAccount } from 'jazz-tools/react';
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
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const dailyCard = useMemo(() => {
    const today = dayjs();
    const dateStr = today.format('YYYY-MM-DD');

    if (hasChartAccess && userName && userBirthday) {
      const card = getTarotCard(`daily-${dateStr}`, userName, userBirthday);
      return {
        name: card.name,
        keywords: card.keywords?.slice(0, 3) || [],
        information: card.information || '',
        isPersonalized: true,
      };
    }

    const nowUtc = today.utc();
    const dayOfYearUtc = nowUtc.dayOfYear();
    const generalSeed = `cosmic-${nowUtc.format('YYYY-MM-DD')}-${dayOfYearUtc}-energy`;
    const card = getTarotCard(generalSeed);
    return {
      name: card.name,
      keywords: card.keywords?.slice(0, 3) || [],
      information: card.information || '',
      isPersonalized: false,
    };
  }, [hasChartAccess, userName, userBirthday]);

  if (!dailyCard.isPersonalized) {
    return (
      <Link
        href='/tarot'
        className='block py-3 px-4 border border-stone-800 rounded-md hover:border-purple-500/50 transition-colors group h-full'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <Layers className='w-4 h-4 text-purple-400' />
              <span className='text-sm font-medium text-zinc-200'>
                Daily Card
              </span>
            </div>
            <p className='text-sm text-purple-300 font-medium'>
              {dailyCard.name}
            </p>
            <p className='text-xs text-zinc-500'>
              {dailyCard.keywords.join(' • ')}
            </p>
            {dailyCard.information && (
              <p className='hidden md:block text-xs text-zinc-400 mt-2 line-clamp-2'>
                {dailyCard.information}
              </p>
            )}
            <div className='flex items-center gap-1.5 mt-2 text-xs text-purple-400 group-hover:text-purple-300'>
              <Lock className='w-3 h-3' />
              <span>Unlock personalized tarot</span>
            </div>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href='/tarot'
      className='block py-3 px-4 border border-stone-800 rounded-md hover:border-purple-500/50 transition-colors group h-full'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <Layers className='w-4 h-4 text-purple-400' />
            <span className='text-sm font-medium text-zinc-200'>
              Daily Card
            </span>
            <span className='text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded'>
              Personal
            </span>
          </div>
          <p className='text-sm text-purple-300 font-medium'>
            {dailyCard.name}
          </p>
          <p className='text-xs text-zinc-500'>
            {dailyCard.keywords.join(' • ')}
          </p>
          {dailyCard.information && (
            <p className='hidden md:block text-xs text-zinc-400 mt-2 line-clamp-2'>
              {dailyCard.information}
            </p>
          )}
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
