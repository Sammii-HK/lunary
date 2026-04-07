'use client';

import { useMemo } from 'react';
import { Lock, Sparkles, Calendar } from 'lucide-react';
import { getUpcomingTransits } from '../../../utils/astrology/transitCalendar';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import dayjs from 'dayjs';

const SIGNIFICANCE_ORDER: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const TYPE_LABELS: Record<string, string> = {
  sign_change: 'Sign change',
  retrograde: 'Retrograde begins',
  direct: 'Goes direct',
  aspect: 'Aspect',
  lunar_phase: 'Lunar phase',
};

export function ForecastTeaser({ year }: { year: number }) {
  // Get the next 30 days of real transits — show the events, lock the interpretations
  const upcomingEvents = useMemo(() => {
    const events = getUpcomingTransits(dayjs());
    return events
      .filter((e) => e.significance !== 'low' && e.type !== 'lunar_phase')
      .sort(
        (a, b) =>
          (SIGNIFICANCE_ORDER[b.significance] ?? 1) -
          (SIGNIFICANCE_ORDER[a.significance] ?? 1),
      )
      .slice(0, 4);
  }, []);

  return (
    <div className='space-y-4'>
      {/* Upcoming events — dates and planet visible, interpretations locked */}
      <div className='rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-lunary-accent-300' />
            <span className='text-sm text-zinc-100'>Coming up</span>
          </div>
          <span className='inline-flex items-center gap-1 rounded border border-lunary-primary-700/50 bg-lunary-primary-900/80 px-2 py-0.5 text-[10px] text-lunary-primary-300'>
            <Sparkles className='h-2.5 w-2.5' />
            Lunary+
          </span>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className='space-y-2'>
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className='flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-3 py-2'
              >
                <div className='min-w-0 flex-1 space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium text-zinc-200'>
                      {event.planet} · {TYPE_LABELS[event.type] ?? event.type}
                    </span>
                    <span className='text-[0.6rem] text-zinc-600'>
                      {event.date.format('D MMM')}
                    </span>
                  </div>
                  <p className='text-[0.65rem] text-zinc-600 flex items-center gap-1'>
                    <Lock className='h-2.5 w-2.5 shrink-0' />
                    Interpretation locked · Lunary+
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-xs text-zinc-500'>
            No major transits in the next 30 days.
          </p>
        )}
      </div>

      {/* Locked full-year section */}
      <div className='rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3'>
        <p className='text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500'>
          Full {year} forecast
        </p>

        <div className='locked-preview'>
          <div className='locked-preview-text space-y-2 pointer-events-none select-none'>
            {[
              'Major planetary ingresses and their themes for your year',
              'All retrogrades with start and end dates',
              'Solar and lunar eclipses and what they activate',
              'Key outer planet aspects shaping collective energy',
              'Month-by-month breakdown with journal prompts',
            ].map((item, i) => (
              <div
                key={i}
                className='flex items-center gap-2 text-xs text-zinc-300'
              >
                <span className='h-1 w-1 rounded-full bg-lunary-accent-400 shrink-0' />
                {item}
              </div>
            ))}
          </div>
        </div>

        <SmartTrialButton size='sm' />
      </div>
    </div>
  );
}
