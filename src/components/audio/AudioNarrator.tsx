'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioNarration } from '@/hooks/useAudioNarration';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;
const STORAGE_KEY = 'lunary:tts-speed';
const MOBILE_BREAKPOINT = 640; // px

export interface AudioNarratorProps {
  /** Text to narrate. Required. */
  text: string;
  /** Optional title shown when the player is expanded. */
  title?: string;
  /** Optional preferred voice name (matched against speechSynthesis voices). */
  voice?: string;
  /** Extra classes for the outer container. */
  className?: string;
  /**
   * Force the player open by default. By default it starts collapsed and
   * never auto-plays — users must click Listen.
   */
  defaultExpanded?: boolean;
  /**
   * Auto-play on mount (and force expanded). Used for the daily-push deep-link
   * (`/app?from=daily-push&narrate=1`) so a tap on the notification leads
   * straight into voiced playback without an extra Listen click.
   */
  autoPlay?: boolean;
  /** Variant for the compact button. */
  compactVariant?: 'pill' | 'inline';
}

function readStoredSpeed(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 1;
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed) && parsed >= 0.5 && parsed <= 2) {
      return parsed;
    }
  } catch {
    /* noop */
  }
  return 1;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Compact, mobile-first audio narrator.
 * Mute by default — never auto-plays. Renders a "Listen" button that expands
 * into a full-controls bar when clicked.
 */
export default function AudioNarrator({
  text,
  title,
  voice,
  className,
  defaultExpanded = false,
  autoPlay = false,
  compactVariant = 'pill',
}: AudioNarratorProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || autoPlay);
  const [isMobile, setIsMobile] = useState(false);
  const [storedSpeedReady, setStoredSpeedReady] = useState(false);

  const {
    state,
    duration,
    position,
    supported,
    rate,
    play,
    pause,
    stop,
    setRate,
  } = useAudioNarration(text, { voice });

  // Hydrate persisted speed on mount.
  useEffect(() => {
    const stored = readStoredSpeed();
    if (stored !== rate) {
      setRate(stored);
    }
    setStoredSpeedReady(true);
    // intentionally only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist speed changes.
  useEffect(() => {
    if (!storedSpeedReady) return;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(rate));
    } catch {
      /* noop */
    }
  }, [rate, storedSpeedReady]);

  // Track viewport for mobile bottom-sheet vs. inline desktop.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Auto-pause on navigation away (page hidden / unmount).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisibility = () => {
      if (document.hidden && state === 'playing') {
        pause();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [state, pause]);

  // Cleanup on unmount handled by the hook, but stop playback explicitly too.
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => {
    return () => {
      stopRef.current();
    };
  }, []);

  // Auto-play once on mount when the deep-link asks for it (`?narrate=1`).
  // Browsers that block autoplay without a user gesture will quietly no-op;
  // the user can still hit Play. Runs once — not on text changes.
  const autoPlayedRef = useRef(false);
  useEffect(() => {
    if (!autoPlay || autoPlayedRef.current) return;
    if (!text || !supported) return;
    autoPlayedRef.current = true;
    setExpanded(true);
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, supported, text]);

  const handleListenClick = useCallback(() => {
    setExpanded(true);
    if (state === 'idle' || state === 'error') {
      play();
    }
  }, [state, play]);

  const handlePlayPause = useCallback(() => {
    if (state === 'playing') {
      pause();
    } else {
      play();
    }
  }, [state, play, pause]);

  const handleClose = useCallback(() => {
    stop();
    setExpanded(false);
  }, [stop]);

  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';
  const progressPct =
    duration && duration > 0
      ? Math.min(100, Math.max(0, (position / duration) * 100))
      : 0;

  // ---- Unsupported environment fallback ------------------------------------
  if (!supported) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-lunary-primary-700/40 bg-layer-base/50 px-3 py-1.5 text-xs text-content-muted',
          className,
        )}
        role='note'
        aria-label='Audio narration unavailable'
      >
        <Headphones className='h-3.5 w-3.5' aria-hidden='true' />
        <span>Audio narration not supported in this browser</span>
      </div>
    );
  }

  // ---- Compact mode --------------------------------------------------------
  if (!expanded) {
    return (
      <button
        type='button'
        onClick={handleListenClick}
        className={cn(
          compactVariant === 'pill'
            ? 'inline-flex items-center gap-2 rounded-full border border-lunary-primary-700/60 bg-layer-base/70 px-3 py-1.5 text-sm font-medium text-content-brand hover:bg-layer-raised hover:border-lunary-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary'
            : 'inline-flex items-center gap-1.5 text-sm font-medium text-content-brand hover:text-lunary-accent transition-colors',
          className,
        )}
        aria-label={title ? `Listen to ${title}` : 'Listen to narration'}
      >
        <Headphones className='h-4 w-4' aria-hidden='true' />
        <span>Listen</span>
      </button>
    );
  }

  // ---- Expanded mode -------------------------------------------------------
  const playerCore = (
    <div
      className={cn(
        'flex w-full flex-col gap-3 rounded-2xl border border-lunary-primary-700/50 bg-layer-base/95 p-4 shadow-lg backdrop-blur-sm',
      )}
      role='region'
      aria-label='Audio narration controls'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 text-xs uppercase tracking-wider text-content-muted'>
            <Headphones className='h-3.5 w-3.5' aria-hidden='true' />
            <span>Now narrating</span>
          </div>
          {title ? (
            <p className='mt-1 truncate text-sm font-medium text-content-primary'>
              {title}
            </p>
          ) : null}
        </div>
        <button
          type='button'
          onClick={handleClose}
          className='flex h-7 w-7 items-center justify-center rounded-full text-content-muted hover:bg-surface-overlay hover:text-content-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary'
          aria-label='Close narrator'
        >
          <X className='h-4 w-4' aria-hidden='true' />
        </button>
      </div>

      {/* Waveform animation + progress estimate */}
      <div className='flex items-center gap-3'>
        <Waveform active={isPlaying} />
        <div className='flex-1'>
          <div
            className='h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPct)}
            aria-label='Narration progress (estimated)'
          >
            <div
              className='h-full bg-lunary-primary transition-[width] duration-200 ease-out'
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className='mt-1 flex items-center justify-between text-[11px] tabular-nums text-content-muted'>
            <span>{formatTime(position)}</span>
            <span>{duration ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handlePlayPause}
            disabled={isLoading}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-lunary-primary text-white shadow hover:brightness-110 transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary'
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? (
              <Pause className='h-4 w-4' aria-hidden='true' />
            ) : (
              <Play className='h-4 w-4' aria-hidden='true' />
            )}
          </button>
          <button
            type='button'
            onClick={stop}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-lunary-primary-700/50 text-content-secondary hover:bg-surface-overlay hover:text-content-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary'
            aria-label='Stop narration'
          >
            <Square className='h-3.5 w-3.5' aria-hidden='true' />
          </button>
        </div>

        <div
          className='flex items-center gap-1'
          role='group'
          aria-label='Playback speed'
        >
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt}
              type='button'
              onClick={() => setRate(opt)}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary',
                rate === opt
                  ? 'bg-lunary-primary text-white'
                  : 'text-content-secondary hover:bg-surface-overlay',
              )}
              aria-pressed={rate === opt}
              aria-label={`${opt}x speed`}
            >
              {opt}x
            </button>
          ))}
        </div>
      </div>

      {state === 'error' ? (
        <p className='text-xs text-lunary-error'>
          We couldn’t play audio. Try again or check your browser settings.
        </p>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2',
          className,
        )}
      >
        {playerCore}
      </div>
    );
  }

  return <div className={cn('w-full', className)}>{playerCore}</div>;
}

// ----------------------------------------------------------------------------
// Waveform animation — 6 bars, pure CSS, no extra deps.
// ----------------------------------------------------------------------------
function Waveform({ active }: { active: boolean }) {
  const bars = [0, 1, 2, 3, 4, 5];
  return (
    <div
      className='flex h-8 items-end gap-[3px]'
      aria-hidden='true'
      data-active={active}
    >
      {bars.map((i) => (
        <span
          key={i}
          className={cn(
            'block w-[3px] rounded-full bg-lunary-accent',
            active ? 'animate-tts-wave' : 'h-2 opacity-50',
          )}
          style={
            active
              ? {
                  animationDelay: `${i * 90}ms`,
                  animationDuration: `${800 + (i % 3) * 120}ms`,
                }
              : undefined
          }
        />
      ))}
      {/* Inline keyframes so we don't have to touch tailwind config. */}
      <style jsx>{`
        :global(.animate-tts-wave) {
          animation-name: tts-wave;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          height: 30%;
        }
        @keyframes tts-wave {
          0%,
          100% {
            height: 20%;
          }
          50% {
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export { AudioNarrator };
