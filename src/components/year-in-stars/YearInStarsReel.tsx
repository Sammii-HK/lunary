'use client';

/**
 * Year in Stars — swipeable Stories-style reel.
 *
 * Renders the full year-wrap experience as a stack of `YearInStarsSlide`s
 * with progress bars across the top, touch-swipe + arrow-key navigation,
 * and an auto-advance timer that pauses when the viewer touches the screen.
 *
 * The final slide hosts a "Share my year" button that opens a native share
 * sheet (or falls back to clipboard copy) using the `/api/og/year-in-stars`
 * route as the share image.
 */

import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { Share2, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { YearInStarsData } from '@/lib/year-in-stars/compute';
import {
  YearInStarsSlide,
  type YearInStarsAccent,
  type YearInStarsSlideKind,
} from './YearInStarsSlide';

interface ReelSlideConfig {
  kind: YearInStarsSlideKind;
  accent: YearInStarsAccent;
}

export interface YearInStarsReelProps {
  data: YearInStarsData;
  /** Optional userId so the share image route can fetch the user's data. */
  userId?: string;
  /** Auto-advance duration per slide (ms). Defaults to 6000. */
  slideDurationMs?: number;
}

const SLIDE_PLAN: ReelSlideConfig[] = [
  { kind: 'top-transits', accent: 'violet' },
  { kind: 'journal-volume', accent: 'rose' },
  { kind: 'moon-pattern', accent: 'indigo' },
  { kind: 'best-week', accent: 'gold' },
  { kind: 'hardest-week', accent: 'aqua' },
  { kind: 'closing', accent: 'violet' },
];

const SWIPE_THRESHOLD = 60;

export function YearInStarsReel({
  data,
  userId,
  slideDurationMs = 6000,
}: YearInStarsReelProps) {
  const slides = useMemo(() => SLIDE_PLAN, []);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number | null>(null);
  const elapsedAtPauseRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Reset progress on slide change.
  useEffect(() => {
    startRef.current = null;
    elapsedAtPauseRef.current = 0;
    setProgress(0);
  }, [index]);

  // RAF loop drives the progress bar + auto-advance.
  useEffect(() => {
    if (paused) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) {
        startRef.current = now - elapsedAtPauseRef.current;
      }
      const elapsed = now - startRef.current;
      const ratio = Math.min(elapsed / slideDurationMs, 1);
      setProgress(ratio);
      if (ratio >= 1) {
        if (index < slides.length - 1) {
          setIndex((i) => i + 1);
        } else {
          // Stop on final slide.
          return;
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [index, paused, slideDurationMs, slides.length]);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      if (info.offset.x < -SWIPE_THRESHOLD) {
        goNext();
      } else if (info.offset.x > SWIPE_THRESHOLD) {
        goPrev();
      }
    },
    [goNext, goPrev],
  );

  const isLast = index === slides.length - 1;
  const current = slides[index];

  const handleShare = useCallback(async () => {
    const params = new URLSearchParams({ year: String(data.year) });
    if (userId) params.set('userId', userId);
    const ogUrl = `/api/og/year-in-stars?${params.toString()}`;
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/year-in-stars/${data.year}`
        : `/year-in-stars/${data.year}`;

    const shareText = `My year in stars — ${data.year}: ${data.journal.totalEntries} entries, ${data.topTransits.length} transits that mattered.`;

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Year in Stars ${data.year}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard.
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      } catch {
        // Last-resort: open the OG image in a new tab.
        if (typeof window !== 'undefined') {
          window.open(ogUrl, '_blank', 'noopener,noreferrer');
        }
      }
    }
  }, [data.journal.totalEntries, data.topTransits.length, data.year, userId]);

  return (
    <div
      className='relative h-[100dvh] w-full overflow-hidden bg-black text-content-primary select-none'
      role='region'
      aria-label={`Year in Stars ${data.year}`}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div className='absolute left-0 right-0 top-0 z-30 flex gap-1 px-4 pt-4'>
        {slides.map((_, i) => {
          const fillPct =
            i < index ? 100 : i === index ? Math.round(progress * 100) : 0;
          return (
            <div
              key={i}
              className='h-1 flex-1 overflow-hidden rounded-full bg-white/15'
            >
              <div
                className='h-full bg-white transition-[width] duration-100'
                style={{ width: `${fillPct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Pause toggle */}
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          setPaused((p) => !p);
        }}
        className='absolute right-4 top-8 z-30 rounded-full border border-white/15 bg-white/10 p-2 text-content-primary backdrop-blur transition hover:bg-white/15'
        aria-label={paused ? 'Resume' : 'Pause'}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>

      {/* Swipeable slide stack */}
      <div className='relative h-full w-full'>
        <AnimatePresence initial={false} mode='wait'>
          <motion.div
            key={current.kind}
            className='absolute inset-0'
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            drag='x'
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <YearInStarsSlide
              kind={current.kind}
              data={data}
              accent={current.accent}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/*
        Stories-style tap zones: left half = back, right half = forward.
        Sit above the slide content (z-20) but below the close/pause/share
        controls (z-30). `top-16` keeps them clear of the progress bars and
        pause toggle so those still receive clicks. On the final slide we
        narrow the right zone so it doesn't cover the share button.
      */}
      <button
        type='button'
        aria-label='Previous slide'
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className='absolute bottom-0 left-0 top-16 z-20 w-1/2 cursor-w-resize bg-transparent'
      />
      <button
        type='button'
        aria-label='Next slide'
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className={cn(
          'absolute right-0 top-16 z-20 w-1/2 cursor-e-resize bg-transparent',
          // On the final slide the share CTA sits at bottom-12; stop the tap
          // zone above it so the button stays clickable.
          isLast ? 'bottom-28' : 'bottom-0',
        )}
      />

      {/* Side arrows for desktop */}
      <div className='pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-4 md:flex'>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          disabled={index === 0}
          className={cn(
            'pointer-events-auto rounded-full border border-white/15 bg-white/10 p-2 text-content-primary backdrop-blur transition',
            index === 0 ? 'opacity-30' : 'hover:bg-white/15',
          )}
          aria-label='Previous slide'
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          disabled={isLast}
          className={cn(
            'pointer-events-auto rounded-full border border-white/15 bg-white/10 p-2 text-content-primary backdrop-blur transition',
            isLast ? 'opacity-30' : 'hover:bg-white/15',
          )}
          aria-label='Next slide'
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Final-slide share CTA */}
      {isLast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='absolute bottom-12 left-0 right-0 z-30 flex justify-center px-6'
        >
          <Button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className='gap-2'
          >
            <Share2 size={16} />
            Share my year
          </Button>
        </motion.div>
      )}
    </div>
  );
}
