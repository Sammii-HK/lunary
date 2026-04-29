'use client';

/**
 * CorrelationsCard, surfaces the user's strongest habit×transit
 * correlations from `/api/cosmic-habits/correlations`. Renders the top 3
 * insights as plain-language one-liners and narrates the headline through
 * AudioNarrator. Empty state nudges users to keep tracking when sample size
 * is too low to be meaningful.
 */
import { useEffect, useState } from 'react';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore dynamic import below.
// import dynamic from 'next/dynamic';
import { Heart, Moon, Sparkles } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import type {
  HabitCorrelation,
  HabitCorrelationKind,
} from '@/lib/cosmic-habits/types';

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// const AudioNarrator = dynamic(
//   () => import('@/components/audio/AudioNarrator'),
//   { ssr: false },
// );

interface CorrelationsResponse {
  success: boolean;
  correlations?: HabitCorrelation[];
  sampleSize?: number;
  reason?: string;
}

const ICONS: Record<
  HabitCorrelationKind,
  React.ComponentType<{
    className?: string;
  }>
> = {
  sleep: Moon,
  mood: Heart,
  practice: Sparkles,
};

const KIND_TINT: Record<HabitCorrelationKind, string> = {
  sleep: 'text-lunary-primary-400',
  mood: 'text-lunary-rose-400',
  practice: 'text-lunary-accent-400',
};

const CONFIDENCE_LABEL = {
  low: 'Early signal',
  medium: 'Forming pattern',
  high: 'Strong pattern',
} as const;

interface CorrelationsCardProps {
  className?: string;
}

export function CorrelationsCard({ className }: CorrelationsCardProps) {
  const [data, setData] = useState<CorrelationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cosmic-habits/correlations', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: CorrelationsResponse | null) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border border-stroke-default/60 bg-surface-elevated/40 p-4',
          className,
        )}
      >
        <div className='animate-pulse text-sm text-content-muted'>
          Reading the sky against your journal...
        </div>
      </div>
    );
  }

  const sampleSize = data?.sampleSize ?? 0;
  const correlations = data?.correlations ?? [];

  // Empty state, too little data to show real correlations.
  if (sampleSize < 10 || correlations.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-stroke-default/60 bg-gradient-to-br from-layer-base/30 to-indigo-900/20 p-4',
          className,
        )}
      >
        <div className='mb-2 inline-flex items-center gap-2'>
          <Sparkles className='h-4 w-4 text-lunary-primary-400' />
          <Heading as='h3' variant='h3'>
            Cosmic Habits
          </Heading>
        </div>
        <p className='text-sm text-content-secondary'>
          Track your sleep, mood, or practice on a few more entries and Lunary
          will start surfacing your personal evidence-based patterns, which
          transits actually move the needle for <em>you</em>.
        </p>
        <p className='mt-2 text-xs text-content-muted'>
          {sampleSize === 0
            ? 'No tracked entries yet.'
            : `${sampleSize} tracked ${sampleSize === 1 ? 'entry' : 'entries'} so far, keep going.`}
        </p>
      </div>
    );
  }

  const top = correlations.slice(0, 3);
  // AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
  // const headline = top[0];

  return (
    <div
      className={cn(
        'rounded-lg border border-lunary-primary-700/50 bg-gradient-to-br from-layer-base/30 to-indigo-900/30 p-4',
        className,
      )}
    >
      <div className='mb-3 flex items-center justify-between gap-2'>
        <div className='inline-flex items-center gap-2'>
          <Sparkles className='h-4 w-4 text-lunary-primary-400' />
          <Heading as='h3' variant='h3'>
            Cosmic Habits
          </Heading>
        </div>
        <span className='text-xs text-content-muted'>n={sampleSize}</span>
      </div>

      <ul className='space-y-3'>
        {top.map((c, i) => {
          const Icon = ICONS[c.kind];
          return (
            <li
              key={`${c.kind}-${c.transit}-${i}`}
              className='flex items-start gap-3'
            >
              <Icon
                className={cn('mt-0.5 h-4 w-4 shrink-0', KIND_TINT[c.kind])}
              />
              <div className='min-w-0'>
                <p className='text-sm text-content-primary'>{c.oneLiner}</p>
                <p className='mt-0.5 text-xs text-content-muted'>
                  {CONFIDENCE_LABEL[c.confidence]} · {c.transit}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
      {/* {headline && (
        <div className='mt-3'>
          <AudioNarrator
            text={headline.oneLiner}
            title='Cosmic Habits insight'
            compactVariant='inline'
          />
        </div>
      )} */}
    </div>
  );
}

export default CorrelationsCard;
