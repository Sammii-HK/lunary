'use client';

import Link from 'next/link';
import { ArrowRight, Moon, Stars, BookOpen, Sparkles } from 'lucide-react';

interface TarotCrossInsightsProps {
  period: number | 'year-over-year';
  className?: string;
}

export function TarotCrossInsights({
  period,
  className = '',
}: TarotCrossInsightsProps) {
  const periodLabel =
    period === 'year-over-year'
      ? 'year-over-year'
      : period === 365
        ? '12-month'
        : period === 180
          ? '6-month'
          : `${period}-day`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className='rounded-xl border border-zinc-800/50 bg-gradient-to-r from-zinc-900/60 to-lunary-primary-950/10 p-4'>
        <div className='flex items-center gap-2 mb-2'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
          <p className='text-sm font-medium text-zinc-100'>
            Your patterns evolve daily
          </p>
        </div>
        <p className='text-xs text-zinc-400 mb-3'>
          Come back tomorrow to watch your {periodLabel} tarot season unfold.
          Each new card adds depth to your story.
        </p>
        <div className='flex items-center gap-2 text-xs text-lunary-primary-400'>
          <span className='px-2 py-0.5 rounded-full bg-lunary-primary-900/30 border border-lunary-primary-700/30'>
            Patterns update with each new pull
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        <Link
          href='/horoscope'
          className='group flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:border-lunary-primary-700/50 hover:bg-zinc-900/60 transition-all'
        >
          <div className='shrink-0 w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-lunary-primary-900/30 transition-colors'>
            <Stars className='w-4 h-4 text-zinc-400 group-hover:text-lunary-primary-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
              Your Horoscope
            </p>
            <p className='text-xs text-zinc-500 line-clamp-1'>
              See how themes show up in your transits
            </p>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-400 group-hover:translate-x-0.5 transition-all' />
        </Link>

        <Link
          href='/moon'
          className='group flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:border-lunary-primary-700/50 hover:bg-zinc-900/60 transition-all'
        >
          <div className='shrink-0 w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-lunary-primary-900/30 transition-colors'>
            <Moon className='w-4 h-4 text-zinc-400 group-hover:text-lunary-primary-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
              Moon Cycles
            </p>
            <p className='text-xs text-zinc-500 line-clamp-1'>
              Today's lunar context
            </p>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-400 group-hover:translate-x-0.5 transition-all' />
        </Link>

        <Link
          href='/book-of-shadows'
          className='group flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:border-lunary-primary-700/50 hover:bg-zinc-900/60 transition-all'
        >
          <div className='shrink-0 w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-lunary-primary-900/30 transition-colors'>
            <BookOpen className='w-4 h-4 text-zinc-400 group-hover:text-lunary-primary-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
              Book of Shadows
            </p>
            <p className='text-xs text-zinc-500 line-clamp-1'>
              Record your reflections
            </p>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-400 group-hover:translate-x-0.5 transition-all' />
        </Link>
      </div>
    </div>
  );
}

export function ReturnTomorrowBadge({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-lunary-primary-950/40 to-zinc-900/60 border border-lunary-primary-800/30 ${className}`}
    >
      <Sparkles className='w-3 h-3 text-lunary-primary-400' />
      <span className='text-xs text-lunary-primary-300/90'>
        Return tomorrow to see your patterns evolve
      </span>
    </div>
  );
}
