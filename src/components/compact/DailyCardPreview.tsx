'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(utc);
dayjs.extend(dayOfYear);

export const DailyCardPreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const router = useRouter();
  const subscription = useSubscription();
  const { currentDate } = useAstronomyContext();
  const userName = user?.name;
  const userBirthday = user?.birthday;

  const hasPersonalizedAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personal_tarot',
  );

  const canAccessPersonalized =
    authStatus.isAuthenticated &&
    hasPersonalizedAccess &&
    userName &&
    userBirthday;

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
        <div className='flex items-start justify-between gap-3 h-full'>
          <div className='flex-1 min-w-0 h-full justify-between flex flex-col'>
            <div className='flex items-center justify-between gap-2 mb-1'>
              <div className='flex items-center gap-2'>
                <Layers className='w-4 h-4 text-lunary-accent-300' />
                <span className='text-sm font-medium text-zinc-200'>
                  Tarot for Today
                </span>
              </div>
              <span className='text-[10px] text-lunary-primary-300 uppercase tracking-wide'>
                Personal 🔒
              </span>
            </div>
            <p className='text-sm text-lunary-primary-200 font-medium'>
              {dailyCard.name}
            </p>
            <p className='text-xs text-zinc-400 mb-2'>
              {dailyCard.keywords.join(' • ')}
            </p>
            {dailyCard.information && (
              <p className='hidden md:block text-xs text-zinc-300 mb-2'>
                {dailyCard.information.split('.')[0]}.
              </p>
            )}

            {/* Blurred preview of personalized content */}
            <div className='locked-preview mb-2'>
              <p className='locked-preview-text text-xs'>
                This card connects deeply to your birth chart placements. With your Sun in your natal chart and current planetary transits, this energy speaks to the transformation you&apos;re experiencing in relationships and personal growth...
              </p>
            </div>

            <span
              role='button'
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (router) {
                  router.push(
                    authStatus.isAuthenticated
                      ? '/pricing'
                      : '/auth?signup=true',
                  );
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  if (router) {
                    router.push(
                      authStatus.isAuthenticated
                        ? '/pricing'
                        : '/auth?signup=true',
                    );
                  }
                }
              }}
              className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer font-medium'
            >
              <span>Unlock Your Personal Reading</span>
            </span>
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
                Tarot for Today
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
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-300 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
