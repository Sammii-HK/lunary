'use client';

/**
 * ChartCinematic — a brief (~6s) animated tour played the first time a user
 * views their birth chart. Flies focus through Sun → Moon → Rising → top
 * aspect, with bursts/labels at each step.
 *
 * Usage:
 *   const { shouldPlay, markSeen, replay } = useCinematic();
 *   {shouldPlay && (
 *     <div className="relative">
 *       <BirthChart ... />
 *       <ChartCinematic
 *         bodies={bodies}
 *         aspects={aspects}
 *         onComplete={markSeen}
 *       />
 *     </div>
 *   )}
 *
 * The component renders an absolutely-positioned overlay sized to fill its
 * parent. Coordinates for `bodies` are expected to be in the BirthChart's
 * native viewBox (-140..140, 280×280 square).
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'lunary:chart-cinematic-seen';

export type CinematicBody = {
  name: string;
  /** SVG x within -140..140 (chart viewBox) */
  x: number;
  /** SVG y within -140..140 (chart viewBox) */
  y: number;
  /** Subtitle line, e.g. "12° Cancer" */
  label?: string;
};

export type CinematicAspect = {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
};

type Props = {
  bodies: CinematicBody[];
  aspects?: CinematicAspect[];
  onComplete?: () => void;
};

type Step =
  | { kind: 'body'; title: string; body: CinematicBody | null }
  | { kind: 'aspect'; title: string; aspect: CinematicAspect | null }
  | { kind: 'cta' };

const STEP_DURATION = 1000; // ms per body step
const ASPECT_DURATION = 2000; // ms for aspect tracing
const CTA_DURATION = 1000;

export function ChartCinematic({ bodies, aspects = [], onComplete }: Props) {
  const sun = useMemo(
    () => bodies.find((b) => b.name === 'Sun') ?? null,
    [bodies],
  );
  const moon = useMemo(
    () => bodies.find((b) => b.name === 'Moon') ?? null,
    [bodies],
  );
  const rising = useMemo(
    () => bodies.find((b) => b.name === 'Ascendant') ?? null,
    [bodies],
  );

  // Top aspect = most exact (smallest orb) among major aspects
  const topAspect = useMemo<CinematicAspect | null>(() => {
    if (!aspects.length) return null;
    const sorted = [...aspects].sort((a, b) => a.orb - b.orb);
    return sorted[0] ?? null;
  }, [aspects]);

  const steps: Step[] = useMemo(
    () => [
      { kind: 'body', title: 'Your Sun', body: sun },
      { kind: 'body', title: 'Your Moon', body: moon },
      { kind: 'body', title: 'Your Rising', body: rising },
      { kind: 'aspect', title: 'Strongest aspect', aspect: topAspect },
      { kind: 'cta' },
    ],
    [sun, moon, rising, topAspect],
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [skipped, setSkipped] = useState(false);

  const finish = useCallback(() => {
    if (skipped) return;
    setSkipped(true);
    onComplete?.();
  }, [onComplete, skipped]);

  useEffect(() => {
    if (skipped) return;
    if (stepIdx >= steps.length - 1) return; // CTA waits for tap
    const cur = steps[stepIdx];
    const dur = cur.kind === 'aspect' ? ASPECT_DURATION : STEP_DURATION;
    const t = window.setTimeout(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    }, dur);
    return () => window.clearTimeout(t);
  }, [stepIdx, steps, skipped]);

  if (skipped) return null;

  const current = steps[stepIdx];
  // Convert -140..140 to 0..100 percentage for absolute positioning over the chart
  const toPct = (v: number) => ((v + 140) / 280) * 100;

  return (
    <AnimatePresence>
      <motion.div
        key='chart-cinematic'
        className='absolute inset-0 z-30 cursor-pointer'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={finish}
        role='button'
        aria-label='Skip cinematic'
      >
        {/* Soft global vignette */}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* SVG overlay — same viewBox so coords align with BirthChart */}
        <svg
          viewBox='-140 -140 280 280'
          className='pointer-events-none absolute inset-0 h-full w-full'
        >
          {current.kind === 'aspect' && current.aspect && (
            <motion.line
              key='cine-aspect-line'
              x1={current.aspect.x1}
              y1={current.aspect.y1}
              x2={current.aspect.x2}
              y2={current.aspect.y2}
              stroke={current.aspect.color ?? '#C77DFF'}
              strokeWidth={1.4}
              strokeLinecap='round'
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                filter: `drop-shadow(0 0 4px ${current.aspect.color ?? '#C77DFF'})`,
              }}
            />
          )}

          {current.kind === 'body' && current.body && (
            <g>
              {/* Pulsing rings */}
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`ring-${stepIdx}-${i}`}
                  cx={current.body!.x}
                  cy={current.body!.y}
                  fill='none'
                  stroke='#C77DFF'
                  strokeWidth={0.8}
                  initial={{ r: 6, opacity: 0.7 }}
                  animate={{ r: 22, opacity: 0 }}
                  transition={{
                    duration: 1.4,
                    delay: i * 0.35,
                    ease: 'easeOut',
                    repeat: Infinity,
                  }}
                />
              ))}
              {/* Bright dot */}
              <motion.circle
                cx={current.body.x}
                cy={current.body.y}
                r={5}
                fill='#fff'
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                style={{ filter: 'drop-shadow(0 0 6px #fff)' }}
              />
            </g>
          )}
        </svg>

        {/* Label panel — top-center, fades between steps */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={`label-${stepIdx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className='pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-center backdrop-blur-md'
          >
            {current.kind === 'body' && (
              <>
                <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90'>
                  {current.title}
                </p>
                {current.body?.label && (
                  <p className='mt-0.5 text-xs text-white/70'>
                    {current.body.label}
                  </p>
                )}
              </>
            )}
            {current.kind === 'aspect' && (
              <>
                <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90'>
                  {current.title}
                </p>
                {current.aspect && (
                  <p className='mt-0.5 text-xs text-white/70'>
                    {current.aspect.planet1} {current.aspect.type.toLowerCase()}{' '}
                    {current.aspect.planet2}
                  </p>
                )}
              </>
            )}
            {current.kind === 'cta' && (
              <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90'>
                Your sky
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pointer at the position of the current body, with a connector */}
        {current.kind === 'body' && current.body && (
          <motion.div
            key={`pointer-${stepIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]'
            style={{
              left: `${toPct(current.body.x)}%`,
              top: `${toPct(current.body.y)}%`,
            }}
          />
        )}

        {/* CTA — final step */}
        <AnimatePresence>
          {current.kind === 'cta' && (
            <motion.div
              key='cine-cta'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: CTA_DURATION / 1000,
                ease: [0.22, 1, 0.36, 1],
              }}
              className='absolute inset-0 flex items-center justify-center'
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  finish();
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                animate={{
                  boxShadow: [
                    '0 0 14px rgba(199,125,255,0.45)',
                    '0 0 28px rgba(199,125,255,0.85)',
                    '0 0 14px rgba(199,125,255,0.45)',
                  ],
                }}
                transition={{
                  boxShadow: { duration: 1.6, repeat: Infinity },
                }}
                className='pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-lunary-primary/90 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur'
              >
                <Sparkles className='h-4 w-4' />
                Begin
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap-to-skip hint */}
        {current.kind !== 'cta' && (
          <p className='pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/50'>
            tap to skip
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * useCinematic — small hook for any chart consumer to gate the cinematic.
 *
 *   const { shouldPlay, markSeen, replay } = useCinematic();
 *
 *  - shouldPlay: false on the server and during initial render until we read
 *    localStorage on mount (avoids SSR mismatch).
 *  - markSeen: persist that the user has seen it.
 *  - replay: clear the flag so it plays again (e.g. from a settings button).
 */
export function useCinematic() {
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      setShouldPlay(seen !== '1');
    } catch {
      setShouldPlay(false);
    }
  }, []);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* noop */
    }
    setShouldPlay(false);
  }, []);

  const replay = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setShouldPlay(true);
  }, []);

  return { shouldPlay, markSeen, replay };
}
