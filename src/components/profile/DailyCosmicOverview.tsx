'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { useSubscription } from '@/hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import { Star } from 'lucide-react';
import { getTarotCard } from '../../../utils/tarot/tarot';
import dayjs from 'dayjs';

interface DailyCosmicOverviewProps {
  className?: string;
}

export function DailyCosmicOverview({
  className = '',
}: DailyCosmicOverviewProps) {
  const { user } = useUser();
  const subscription = useSubscription();
  const { currentMoonPhase, currentMoonConstellationPosition } =
    useAstronomyContext();

  const isPremium = hasBirthChartAccess(subscription.status, subscription.plan);
  const userName = user?.name;
  const userBirthday = user?.birthday;

  const cosmicOverview = useMemo(() => {
    const dateStr = dayjs().format('YYYY-MM-DD');

    let dailyCard = null;
    if (userName && userBirthday) {
      dailyCard = getTarotCard(`daily-${dateStr}`, userName, userBirthday);
    }

    const moonText = currentMoonPhase
      ? `${currentMoonPhase}${currentMoonConstellationPosition ? ` in ${currentMoonConstellationPosition}` : ''}`
      : null;

    let overview = '';

    if (moonText) {
      overview += `The ${moonText} sets today's emotional tone. `;
    }

    if (dailyCard) {
      overview += `${dailyCard.name} guides your energy—${(dailyCard.keywords || []).slice(0, 2).join(' and ')}. `;
    }

    if (!overview) {
      overview = 'Your cosmic energies are aligning for the day ahead.';
    }

    const focusBullets = [];

    if (currentMoonPhase) {
      if (currentMoonPhase.toLowerCase().includes('new')) {
        focusBullets.push('Set intentions for the lunar cycle');
      } else if (currentMoonPhase.toLowerCase().includes('full')) {
        focusBullets.push('Release what no longer serves you');
      } else if (currentMoonPhase.toLowerCase().includes('waxing')) {
        focusBullets.push('Build momentum on your goals');
      } else if (currentMoonPhase.toLowerCase().includes('waning')) {
        focusBullets.push('Reflect and consolidate progress');
      }
    }

    if (dailyCard) {
      const keywords = dailyCard.keywords || [];
      if (
        keywords.some((k: string) =>
          ['action', 'courage', 'initiative'].includes(k.toLowerCase()),
        )
      ) {
        focusBullets.push('Take decisive action today');
      } else if (
        keywords.some((k: string) =>
          ['patience', 'rest', 'contemplation'].includes(k.toLowerCase()),
        )
      ) {
        focusBullets.push('Allow space for quiet reflection');
      } else if (
        keywords.some((k: string) =>
          ['creativity', 'inspiration', 'expression'].includes(k.toLowerCase()),
        )
      ) {
        focusBullets.push('Express yourself creatively');
      }
    }

    if (focusBullets.length === 0) {
      focusBullets.push('Stay present and trust your intuition');
    }

    return {
      overview: overview.trim(),
      focusBullets,
      dailyCard,
      moonPhase: moonText,
    };
  }, [
    currentMoonPhase,
    currentMoonConstellationPosition,
    userName,
    userBirthday,
  ]);

  if (!cosmicOverview.overview) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 ${className}`}
    >
      <div className='flex items-center gap-2 mb-3'>
        <Star className='w-4 h-4 text-lunary-accent' />
        <h3 className='text-sm font-medium text-zinc-200'>
          Today's Cosmic Energy
        </h3>
      </div>

      <p className='text-sm text-zinc-300 leading-relaxed mb-3'>
        {cosmicOverview.overview}
      </p>

      {isPremium && cosmicOverview.focusBullets.length > 0 && (
        <div className='space-y-1.5'>
          <p className='text-xs font-medium text-zinc-400 uppercase tracking-wide'>
            Best focus for today
          </p>
          <ul className='space-y-1'>
            {cosmicOverview.focusBullets.map((bullet, i) => (
              <li
                key={i}
                className='text-xs text-zinc-400 flex items-start gap-2'
              >
                <span className='text-lunary-accent mt-0.5'>•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cosmicOverview.dailyCard && (
        <div className='mt-3 pt-3 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-500'>
            Daily card:{' '}
            <span className='text-lunary-primary-300'>
              {cosmicOverview.dailyCard.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
