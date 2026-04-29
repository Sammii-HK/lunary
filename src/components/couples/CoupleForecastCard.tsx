'use client';

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting useMemo.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Heart, Lock, Sparkles, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import { getPlanetSymbol } from '@/constants/symbols';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import type { CoupleSummary, CoupleDayTheme } from '@/lib/couples/types';

type ForecastResponse =
  | (CoupleSummary & { requiresPlus?: false })
  | { requiresPlus: true }
  | { error: string };

const THEME_BAR_CLASS: Record<CoupleDayTheme, string> = {
  harmonious: 'bg-lunary-success/70',
  friction: 'bg-lunary-rose/70',
  mixed: 'bg-lunary-accent/60',
};

const THEME_LABEL: Record<CoupleDayTheme, string> = {
  harmonious: 'Flowing',
  friction: 'Friction',
  mixed: 'Mixed',
};

function formatShortDate(iso: string): string {
  // YYYY-MM-DD → e.g. "Mon 28"
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  });
}

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// function buildNarrative(summary: CoupleSummary): string {
//   const parts: string[] = [];
//   parts.push(
//     `Today's compatibility score with ${summary.partnerName} sits at ${summary.dailyScore} out of one hundred.`,
//   );
//   if (summary.dailyAspect) {
//     parts.push(
//       `The strongest thread between your charts right now is ${summary.dailyAspect.planetA} ${summary.dailyAspect.aspect} ${summary.dailyAspect.planetB}.`,
//     );
//     parts.push(summary.dailyAspect.description);
//   }
//   const flowing = summary.fourteenDay.filter(
//     (d) => d.theme === 'harmonious',
//   ).length;
//   const friction = summary.fourteenDay.filter(
//     (d) => d.theme === 'friction',
//   ).length;
//   if (flowing || friction) {
//     parts.push(
//       `Across the next two weeks, expect ${flowing} flowing day${flowing === 1 ? '' : 's'} and ${friction} friction day${friction === 1 ? '' : 's'}.`,
//     );
//   }
//   return parts.join(' ');
// }

export function CoupleForecastCard() {
  const router = useRouter();
  const [data, setData] = useState<CoupleSummary | null>(null);
  const [requiresPlus, setRequiresPlus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unpairing, setUnpairing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/couples/forecast', {
          credentials: 'include',
        });
        const json = (await res.json()) as ForecastResponse;
        if (cancelled) return;
        if ('requiresPlus' in json && json.requiresPlus) {
          setRequiresPlus(true);
          return;
        }
        if ('error' in json) {
          throw new Error(json.error);
        }
        setData(json);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load forecast',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
  // const narrative = useMemo(() => (data ? buildNarrative(data) : ''), [data]);

  const handleUnpair = async () => {
    if (!window.confirm('Unpair from your partner? You can re-pair anytime.'))
      return;
    setUnpairing(true);
    try {
      await fetch('/api/couples/unpair', {
        method: 'DELETE',
        credentials: 'include',
      });
      router.refresh();
    } finally {
      setUnpairing(false);
    }
  };

  if (loading) {
    return (
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-8 text-center text-content-muted text-sm'>
        Reading the sky between the two of you...
      </div>
    );
  }

  if (requiresPlus) {
    return (
      <div className='rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 flex flex-wrap items-center gap-3'>
        <Lock className='w-5 h-5 text-amber-300 shrink-0' />
        <div className='flex-1 min-w-0'>
          <div className='text-sm font-medium text-content-primary'>
            Couples Mode is a Lunary Plus feature
          </div>
          <div className='text-xs text-content-muted'>
            Either of you can hold Plus to keep the pair unlocked.
          </div>
        </div>
        <Link href='/pricing'>
          <Button variant='lunary-solid' size='sm'>
            See plans
          </Button>
        </Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-6 text-sm text-content-muted'>
        {error || 'No forecast available yet.'}
      </div>
    );
  }

  const theme = data.fourteenDay[0]?.theme ?? 'mixed';
  const aspect = data.dailyAspect;

  return (
    <div className='space-y-6'>
      {/* ----- Today's score + headline aspect ----- */}
      <div
        className={cn(
          'rounded-2xl border bg-surface-elevated/60 p-6',
          theme === 'harmonious'
            ? 'border-lunary-success/30'
            : theme === 'friction'
              ? 'border-lunary-rose/30'
              : 'border-lunary-accent/30',
        )}
      >
        <div className='flex items-center gap-2 text-xs uppercase tracking-wide text-content-muted mb-2'>
          <Users className='w-3.5 h-3.5 text-lunary-accent' />
          You + {data.partnerName}
        </div>

        <div className='flex flex-wrap items-end gap-x-6 gap-y-2 mb-5'>
          <div>
            <div className='text-[10px] uppercase tracking-wider text-content-muted'>
              Today
            </div>
            <div className='text-6xl font-light text-content-primary tabular-nums leading-none'>
              {data.dailyScore}
              <span className='text-2xl text-content-muted ml-1'>/100</span>
            </div>
          </div>
          <div className='text-xs px-2 py-1 rounded-full border border-stroke-subtle text-content-secondary'>
            {THEME_LABEL[theme]}
          </div>
        </div>

        {aspect ? (
          <div className='rounded-xl bg-layer-base/50 border border-stroke-subtle px-4 py-3 flex items-center gap-3'>
            <div
              className='flex items-center gap-1 text-2xl text-lunary-accent shrink-0'
              aria-label={`${aspect.planetA} ${aspect.aspect} ${aspect.planetB}`}
            >
              <span>{getPlanetSymbol(aspect.planetA)}</span>
              <span className='font-astro text-content-primary'>
                {aspect.aspectSymbol}
              </span>
              <span>{getPlanetSymbol(aspect.planetB)}</span>
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-sm text-content-primary'>
                <span className='font-medium'>{aspect.planetA}</span>{' '}
                {aspect.aspect}{' '}
                <span className='font-medium'>{aspect.planetB}</span>
                <span className='text-xs text-content-muted ml-2'>
                  ({aspect.orb.toFixed(1)}°)
                </span>
              </div>
              <div className='text-xs text-content-secondary mt-0.5'>
                {aspect.description}
              </div>
            </div>
          </div>
        ) : (
          <div className='text-sm text-content-muted'>
            <Sparkles className='w-3.5 h-3.5 inline mr-1' />
            The sky between you is quiet today, nothing acute, just the steady
            current of your charts.
          </div>
        )}

        {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
        {/* <div className='mt-4'>
          <AudioNarrator
            text={narrative}
            title={`Today with ${data.partnerName}`}
            compactVariant='pill'
          />
        </div> */}
      </div>

      {/* ----- 14-day strip ----- */}
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Calendar className='w-4 h-4 text-lunary-accent' />
          <Heading as='h2' variant='h3' className='mb-0'>
            Next 14 days
          </Heading>
        </div>
        <div
          className='flex items-end gap-1 h-32'
          role='list'
          aria-label='14-day shared compatibility forecast'
        >
          {data.fourteenDay.map((day) => {
            const heightPct = Math.max(8, day.score);
            return (
              <div
                key={day.date}
                role='listitem'
                className='flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0'
                title={`${day.date}: ${day.score}/100 (${THEME_LABEL[day.theme]})`}
              >
                <div className='text-[10px] tabular-nums text-content-muted'>
                  {day.score}
                </div>
                <div
                  className={cn(
                    'w-full rounded-md transition-all',
                    THEME_BAR_CLASS[day.theme],
                  )}
                  style={{ height: `${heightPct}%` }}
                  aria-hidden='true'
                />
                <div className='text-[10px] text-content-muted truncate w-full text-center'>
                  {formatShortDate(day.date)}
                </div>
              </div>
            );
          })}
        </div>

        <div className='flex flex-wrap gap-3 mt-4 text-[11px] text-content-muted'>
          <span className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-sm bg-lunary-success/70' />
            Flowing
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-sm bg-lunary-accent/60' />
            Mixed
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-sm bg-lunary-rose/70' />
            Friction
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between text-xs text-content-muted'>
        <div className='flex items-center gap-1.5'>
          <Heart className='w-3.5 h-3.5 text-lunary-rose' />
          Paired{' '}
          {new Date(data.pairedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
        <button
          type='button'
          onClick={handleUnpair}
          disabled={unpairing}
          className='underline hover:text-content-secondary disabled:opacity-50'
        >
          {unpairing ? 'Unpairing...' : 'Unpair'}
        </button>
      </div>
    </div>
  );
}

export default CoupleForecastCard;
