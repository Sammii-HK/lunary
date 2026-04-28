'use client';

/**
 * Next transit card.
 *
 * "The next transit that hits your chart hardest, when it'll be exact, and
 * what it means."
 *
 * Free users see the headline (planet glyphs, aspect, countdown, one-line
 * blurb). Paid users also get the extended interpretation.
 *
 * Data source: GET /api/live-transits/next-hit (App Router).
 */

import { useEffect, useMemo, useState } from 'react';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore dynamic import below.
// import dynamic from 'next/dynamic';
import { Sparkles, Clock, Lock, Stars } from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import { getPlanetSymbol, getAspectSymbol } from '@/constants/symbols';

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// const AudioNarrator = dynamic(
//   () => import('@/components/audio/AudioNarrator'),
//   { ssr: false },
// );

interface NextHitResponse {
  success: boolean;
  isPaid?: boolean;
  reason?: 'no_birth_chart' | 'empty_birth_chart' | 'quiet_sky';
  hit: {
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    exactDate: string;
    daysUntil: number;
    hoursUntil: number;
    score: number;
    color: string;
    blurb: string | null;
  } | null;
}

function formatCountdown(target: Date, now: Date): string {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return 'Exact now';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes - days * 60 * 24 - hours * 60;
  if (days >= 1) {
    return hours > 0 ? `Exact in ${days}d ${hours}h` : `Exact in ${days}d`;
  }
  if (hours >= 1) {
    return minutes > 0
      ? `Exact in ${hours}h ${minutes}m`
      : `Exact in ${hours}h`;
  }
  return `Exact in ${Math.max(1, minutes)}m`;
}

function formatExactWhen(target: Date): string {
  return target.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function NarrationText({
  transitPlanet,
  aspect,
  natalPlanet,
  blurb,
  countdown,
}: {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  blurb: string | null;
  countdown: string;
}) {
  const sentence =
    blurb ||
    `${transitPlanet} ${aspect.toLowerCase()} your natal ${natalPlanet}.`;
  const when = countdown.replace(/^Exact /, '');
  return (
    <>
      Next transit. {transitPlanet} {aspect.toLowerCase()} your natal{' '}
      {natalPlanet}, {when}. {sentence}
    </>
  );
}

export function NextHitCard() {
  const [data, setData] = useState<NextHitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/live-transits/next-hit')
      .then((r) => (r.ok ? r.json() : null))
      .then((json: NextHitResponse | null) => {
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

  // Tick the countdown every minute. Cheap, one component per dashboard.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const exactDate = useMemo(
    () => (data?.hit ? new Date(data.hit.exactDate) : null),
    [data],
  );

  const countdown = useMemo(
    () => (exactDate ? formatCountdown(exactDate, now) : ''),
    [exactDate, now],
  );

  if (loading) {
    return (
      <div className='rounded-xl border border-lunary-primary-800/30 bg-gradient-to-br from-layer-base/40 to-lunary-accent-900/10 p-4 animate-pulse'>
        <div className='h-3 w-32 rounded bg-layer-raised/30 mb-3' />
        <div className='h-5 w-3/4 rounded bg-layer-raised/30 mb-2' />
        <div className='h-3 w-2/3 rounded bg-layer-raised/20' />
      </div>
    );
  }

  if (!data || !data.success) return null;

  // Quiet-sky / no-chart fallbacks. Card stays on the dashboard so the slot
  // doesn't pop in/out, but the copy reflects what's missing.
  if (!data.hit) {
    const reason = data.reason ?? 'quiet_sky';
    const headline =
      reason === 'no_birth_chart' || reason === 'empty_birth_chart'
        ? 'Add your birth time'
        : 'A quiet stretch ahead';
    const sub =
      reason === 'no_birth_chart' || reason === 'empty_birth_chart'
        ? 'Save your birth chart to unlock live transit hits to your placements.'
        : 'No major aspect lands on your chart in the next 30 days. Use the calm.';
    return (
      <div className='rounded-xl border border-lunary-primary-800/30 bg-gradient-to-br from-layer-base/40 to-lunary-accent-900/10 p-4'>
        <div className='flex items-center gap-2 text-content-muted text-xs uppercase tracking-wide mb-2'>
          <Stars className='h-3.5 w-3.5' />
          <span>Next transit</span>
        </div>
        <Heading as='h3' variant='h3'>
          {headline}
        </Heading>
        <p className='text-sm text-content-muted'>{sub}</p>
      </div>
    );
  }

  const { hit, isPaid } = data;
  const planetSym = getPlanetSymbol(hit.transitPlanet);
  const natalSym = getPlanetSymbol(hit.natalPlanet);
  const aspectSym = getAspectSymbol(hit.aspect);
  const accent = hit.color || '#a78bfa';

  return (
    <div
      className={cn(
        'relative rounded-xl border border-lunary-primary-800/30',
        'bg-gradient-to-br from-layer-base/50 to-lunary-accent-900/10',
        'p-4 overflow-hidden',
      )}
    >
      <div
        aria-hidden
        className='absolute inset-x-0 top-0 h-px opacity-70'
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
      <div className='flex items-center justify-between gap-2 mb-2'>
        <div className='flex items-center gap-2 text-content-muted text-xs uppercase tracking-wide'>
          <Sparkles className='h-3.5 w-3.5' />
          <span>Next transit</span>
        </div>
        <div className='flex items-center gap-1.5 text-xs text-content-secondary'>
          <Clock className='h-3.5 w-3.5' />
          <span aria-live='polite'>{countdown}</span>
        </div>
      </div>

      <div className='flex items-center gap-3 mb-2'>
        <div
          className='flex items-center gap-1.5 text-2xl'
          style={{ color: accent }}
        >
          <span aria-label={hit.transitPlanet} title={hit.transitPlanet}>
            {planetSym}
          </span>
          <span
            className='text-xl text-content-muted'
            aria-label={hit.aspect}
            title={hit.aspect}
          >
            {aspectSym}
          </span>
          <span
            className='text-content-secondary'
            aria-label={`natal ${hit.natalPlanet}`}
            title={`natal ${hit.natalPlanet}`}
          >
            {natalSym}
          </span>
        </div>
        <Heading as='h3' variant='h3' className='!mb-0'>
          {hit.transitPlanet} {hit.aspect.toLowerCase()} your natal{' '}
          {hit.natalPlanet}
        </Heading>
      </div>

      <p className='text-sm text-content-secondary leading-snug mb-2'>
        {hit.blurb ||
          `${hit.transitPlanet} meets your natal ${hit.natalPlanet}.`}
      </p>

      <div className='flex items-center justify-between gap-2 text-xs text-content-muted'>
        <span>Exact: {exactDate ? formatExactWhen(exactDate) : 'Pending'}</span>
        {/*
          AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
          Original paid-tier branch rendered:
          <AudioNarrator
            text={`Next transit. ${hit.transitPlanet} ${hit.aspect.toLowerCase()} your natal ${hit.natalPlanet}, ${countdown.replace(/^Exact /, '')}. ${hit.blurb ?? ''}`}
            title='Listen to your transit'
            compactVariant='inline'
          />
        */}
        {isPaid ? null : (
          <span className='inline-flex items-center gap-1.5 text-content-muted'>
            <Lock className='h-3.5 w-3.5' />
            <span>Deeper read on Plus</span>
          </span>
        )}
      </div>

      {/* Hidden, kept for screen readers / future markup parity */}
      <span className='sr-only'>
        <NarrationText
          transitPlanet={hit.transitPlanet}
          aspect={hit.aspect}
          natalPlanet={hit.natalPlanet}
          blurb={hit.blurb}
          countdown={countdown}
        />
      </span>
    </div>
  );
}

export default NextHitCard;
