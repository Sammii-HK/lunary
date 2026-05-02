'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

/**
 * DailyRecapPlayer
 * -----------------------------------------------------------------------------
 * Brand-styled card that fetches the morning recap script from the
 * `/api/daily-recap` endpoint and plays it back through the existing
 * `<AudioNarrator>` (Web Speech API on-device, zero per-user cost for free
 * tier; Plus users can later be served a server-cached AI-personalised script
 * via the same endpoint).
 *
 * Lives below the fold of the authenticated dashboard. Keeps its own loading
 * + error state so failures degrade quietly without hiding the rest of the UI.
 */

export interface DailyRecapPlayerProps {
  className?: string;
  /** Override the title shown next to the narrator controls. */
  title?: string;
}

interface RecapResponse {
  script: string;
  audience: 'free' | 'plus';
}

type FetchState =
  | { status: 'loading' }
  | { status: 'ready'; script: string; audience: 'free' | 'plus' }
  | { status: 'error'; message: string };

export default function DailyRecapPlayer({
  className,
  title = 'Your daily sky recap',
}: DailyRecapPlayerProps) {
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  // AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
  // Detect the daily-push deep-link (`/app?from=daily-push&narrate=1`) once on
  // mount so we can ask <AudioNarrator> to auto-play when the user tapped in
  // from a push notification. Single-line URL parse, no router required.
  // const autoPlayFromPush =
  //   typeof window !== 'undefined' &&
  //   new URLSearchParams(window.location.search).get('narrate') === '1';

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/daily-recap', {
          method: 'GET',
          signal: controller.signal,
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Recap unavailable (${res.status})`);
        }
        const data = (await res.json()) as RecapResponse;
        if (cancelled) return;
        if (!data?.script) {
          throw new Error('Empty recap');
        }
        setState({
          status: 'ready',
          script: data.script,
          audience: data.audience ?? 'free',
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          status: 'error',
          message: 'Could not load your daily recap. Try again in a moment.',
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <section
      className={cn(
        'rounded-3xl border border-lunary-primary-700/40 bg-layer-base/70 p-5 shadow-sm backdrop-blur-sm',
        'flex flex-col gap-4',
        className,
      )}
      aria-label='Daily sky recap'
    >
      <header className='flex items-center gap-2 text-content-brand'>
        <Sparkles className='h-4 w-4' aria-hidden='true' />
        <span className='text-xs uppercase tracking-[0.18em] text-content-muted'>
          Daily recap
        </span>
      </header>

      <Heading as='h2' variant='h2'>
        {title}
      </Heading>

      {state.status === 'loading' ? (
        <div
          className='flex flex-col gap-2'
          role='status'
          aria-live='polite'
          aria-busy='true'
        >
          <div className='h-3 w-3/4 rounded-full bg-surface-overlay/70 animate-pulse' />
          <div className='h-3 w-2/3 rounded-full bg-surface-overlay/60 animate-pulse' />
          <div className='h-3 w-1/2 rounded-full bg-surface-overlay/50 animate-pulse' />
        </div>
      ) : state.status === 'error' ? (
        <p className='text-sm text-lunary-rose'>{state.message}</p>
      ) : (
        <>
          <p className='whitespace-pre-line text-sm leading-relaxed text-content-secondary'>
            {state.script}
          </p>
          {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
          {/* <div className='pt-1'>
            <AudioNarrator
              text={state.script}
              title={title}
              compactVariant='pill'
              autoPlay={autoPlayFromPush}
            />
          </div> */}
          {state.audience === 'plus' ? (
            <p className='text-[11px] uppercase tracking-[0.18em] text-lunary-accent'>
              Personalised for you
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

export { DailyRecapPlayer };
