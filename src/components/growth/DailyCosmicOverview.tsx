'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import {
  getMoonPhase,
  type MoonPhaseLabels,
} from '../../../utils/moon/moonPhases';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthStatus } from '@/components/AuthStatus';

interface DailyCosmicOverviewProps {
  className?: string;
  variant?: 'full' | 'compact';
}

const MOON_PHASE_MEANINGS: Record<
  MoonPhaseLabels,
  { short: string; energy: string }
> = {
  'New Moon': {
    short: 'A time for new beginnings and setting intentions.',
    energy: 'receptive and introspective',
  },
  'Waxing Crescent': {
    short: 'Seeds of intention are taking root.',
    energy: 'hopeful and emerging',
  },
  'First Quarter': {
    short: 'Take action and overcome challenges.',
    energy: 'decisive and determined',
  },
  'Waxing Gibbous': {
    short: 'Refine your approach as momentum builds.',
    energy: 'focused and refining',
  },
  'Full Moon': {
    short: 'Illumination, culmination, and celebration.',
    energy: 'illuminated and expansive',
  },
  'Waning Gibbous': {
    short: 'Gratitude and sharing your wisdom.',
    energy: 'grateful and generous',
  },
  'Last Quarter': {
    short: 'Release what no longer serves you.',
    energy: 'releasing and clearing',
  },
  'Waning Crescent': {
    short: 'Rest, dream, and prepare for renewal.',
    energy: 'restful and reflective',
  },
};

const MOON_PHASE_SYMBOLS: Record<MoonPhaseLabels, string> = {
  'New Moon': '🌑',
  'Waxing Crescent': '🌒',
  'First Quarter': '🌓',
  'Waxing Gibbous': '🌔',
  'Full Moon': '🌕',
  'Waning Gibbous': '🌖',
  'Last Quarter': '🌗',
  'Waning Crescent': '🌘',
};

export function DailyCosmicOverview({
  className = '',
  variant = 'full',
}: DailyCosmicOverviewProps) {
  const { isAuthenticated } = useAuthStatus();
  const { isSubscribed } = useSubscription();
  const [dailyEnergy, setDailyEnergy] = useState<string | null>(null);
  const [focusBullets, setFocusBullets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const moonPhase = useMemo(() => getMoonPhase(new Date()), []);
  const moonData = MOON_PHASE_MEANINGS[moonPhase];
  const moonSymbol = MOON_PHASE_SYMBOLS[moonPhase];

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchDailyData = async () => {
      try {
        const response = await fetch('/api/gpt/cosmic-today', {
          credentials: 'include',
        }).catch(() => null);

        if (response?.ok) {
          const data = await response.json();
          if (data.summary) {
            setDailyEnergy(data.summary);
          }
          if (data.focusAreas) {
            setFocusBullets(data.focusAreas.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('[DailyCosmicOverview] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <Link
        href='/horoscope'
        className={`group flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-3 transition-all hover:border-lunary-primary-700/50 hover:bg-zinc-900/60 ${className}`}
      >
        <div className='shrink-0 text-2xl'>{moonSymbol}</div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-zinc-100'>{moonPhase}</p>
          <p className='text-xs text-zinc-400 line-clamp-1'>{moonData.short}</p>
        </div>
        <ChevronRight className='w-4 h-4 text-zinc-500 group-hover:text-lunary-primary-400 group-hover:translate-x-0.5 transition-all' />
      </Link>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 ${className}`}
      >
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-10 h-10 rounded-full bg-zinc-800 animate-pulse' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-zinc-800 rounded w-1/3 animate-pulse' />
            <div className='h-3 bg-zinc-800 rounded w-2/3 animate-pulse' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 to-lunary-primary-950/10 p-4 ${className}`}
    >
      <div className='flex items-start gap-3 mb-3'>
        <div className='shrink-0 w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-2xl'>
          {moonSymbol}
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='text-sm font-medium text-zinc-100'>{moonPhase}</h3>
            <span className='text-xs text-zinc-500'>Today</span>
          </div>
          <p className='text-xs text-zinc-400'>{moonData.short}</p>
        </div>
      </div>

      {dailyEnergy && (
        <div className='mb-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30'>
          <p className='text-xs text-zinc-500 mb-1'>Today's Energy</p>
          <p className='text-sm text-zinc-300'>{dailyEnergy}</p>
        </div>
      )}

      {isSubscribed && focusBullets.length > 0 && (
        <div className='mb-3'>
          <p className='text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1'>
            <Sparkles className='w-3 h-3 text-lunary-primary-400' />
            Focus for Today
          </p>
          <ul className='space-y-1'>
            {focusBullets.map((bullet, i) => (
              <li
                key={i}
                className='text-xs text-zinc-400 flex items-start gap-2'
              >
                <span className='text-lunary-primary-400'>•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href='/horoscope'
        className='group inline-flex items-center gap-1 text-xs font-medium text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
      >
        Read Your Horoscope
        <ChevronRight className='w-3 h-3 group-hover:translate-x-0.5 transition-transform' />
      </Link>
    </div>
  );
}
