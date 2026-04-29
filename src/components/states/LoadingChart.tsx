'use client';

import { motion } from 'motion/react';
import classNames from 'classnames';
import { useMemo } from 'react';

interface LoadingChartProps {
  /** Optional 0..1 progress value. When provided, renders an arc around the wheel. */
  progress?: number;
  /** Override the caption. Defaults to "Computing your sky…". */
  caption?: string;
  /** Pixel size of the loader. Defaults to 220 (mobile-friendly). */
  size?: number;
  className?: string;
  /** Optional seed for deterministic placement (avoids SSR/client mismatch). */
  seed?: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bigger themed loader for the chart area.
 * Renders a rotating ring, planet dots, twinkling stars, and a caption.
 * Optional `progress` prop renders a thin progress arc.
 */
export function LoadingChart({
  progress,
  caption = 'Computing your sky…',
  size = 220,
  className,
  seed = 11,
}: LoadingChartProps) {
  const planets = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: 4 }, (_, i) => ({
      i,
      angle: rng() * Math.PI * 2,
      // Place planets on the orbit ring (radius ~38)
      radius: 36 + rng() * 4,
      r: 1.6 + rng() * 1.4,
      delay: rng() * 1.2,
      opacity: 0.55 + rng() * 0.35,
    }));
  }, [seed]);

  const stars = useMemo(() => {
    const rng = mulberry32(seed + 31);
    return Array.from({ length: 14 }, (_, i) => {
      const r = 12 + rng() * 32;
      const theta = rng() * Math.PI * 2;
      return {
        i,
        cx: Math.cos(theta) * r,
        cy: Math.sin(theta) * r,
        r: 0.3 + rng() * 0.7,
        delay: rng() * 3,
        duration: 2 + rng() * 2.5,
        baseOpacity: 0.3 + rng() * 0.55,
      };
    });
  }, [seed]);

  // Progress arc geometry — 0..1 maps to 0..360 around the wheel.
  const progressArc = useMemo(() => {
    if (progress === undefined) return null;
    const clamped = Math.max(0, Math.min(1, progress));
    const radius = 44;
    if (clamped <= 0) return { d: '', clamped };
    if (clamped >= 1) {
      // Full circle as two arcs to avoid degenerate path.
      return {
        d: `M ${radius} 0 A ${radius} ${radius} 0 1 1 -${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} 0`,
        clamped,
      };
    }
    const angle = clamped * Math.PI * 2 - Math.PI / 2; // start at top
    const startX = 0;
    const startY = -radius;
    const endX = Math.cos(angle) * radius;
    const endY = Math.sin(angle) * radius;
    const largeArc = clamped > 0.5 ? 1 : 0;
    return {
      d: `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
      clamped,
    };
  }, [progress]);

  return (
    <div
      role='status'
      aria-live='polite'
      aria-label={caption}
      className={classNames(
        'flex flex-col items-center justify-center gap-3 text-content-primary',
        className,
      )}
    >
      <svg
        viewBox='-60 -60 120 120'
        width={size}
        height={size}
        aria-hidden='true'
        focusable='false'
      >
        <defs>
          <radialGradient id='loading-chart-glow' cx='50%' cy='50%' r='55%'>
            <stop offset='0%' stopColor='rgb(132 88 216)' stopOpacity='0.22' />
            <stop offset='70%' stopColor='rgb(132 88 216)' stopOpacity='0.05' />
            <stop offset='100%' stopColor='rgb(132 88 216)' stopOpacity='0' />
          </radialGradient>
        </defs>

        {/* Outer halo */}
        <circle cx='0' cy='0' r='52' fill='url(#loading-chart-glow)' />

        {/* Twinkling stars */}
        {stars.map((s) => (
          <motion.circle
            key={s.i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill='#fff8e7'
            initial={{ opacity: s.baseOpacity * 0.4 }}
            animate={{
              opacity: [
                s.baseOpacity * 0.4,
                s.baseOpacity,
                s.baseOpacity * 0.4,
              ],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Outer dashed orbit (partial-opacity ring) */}
        <circle
          cx='0'
          cy='0'
          r='44'
          fill='none'
          stroke='rgb(132 88 216)'
          strokeOpacity='0.35'
          strokeWidth='0.8'
          strokeDasharray='2 3'
        />

        {/* Inner solid faint ring */}
        <circle
          cx='0'
          cy='0'
          r='38'
          fill='none'
          stroke='rgb(132 88 216)'
          strokeOpacity='0.18'
          strokeWidth='0.6'
        />

        {/* Progress arc (if provided) */}
        {progressArc && progressArc.d && (
          <motion.path
            d={progressArc.d}
            fill='none'
            stroke='rgb(199 125 255)'
            strokeWidth='1.6'
            strokeLinecap='round'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        )}

        {/* Rotating planets group */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        >
          {planets.map((p) => {
            const cx = Math.cos(p.angle) * p.radius;
            const cy = Math.sin(p.angle) * p.radius;
            return (
              <motion.circle
                key={p.i}
                cx={cx}
                cy={cy}
                r={p.r}
                fill='rgb(199 125 255)'
                animate={{
                  opacity: [p.opacity * 0.6, p.opacity, p.opacity * 0.6],
                }}
                transition={{
                  duration: 2 + p.i * 0.4,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </motion.g>

        {/* Centre pulse — like a sun core */}
        <motion.circle
          cx='0'
          cy='0'
          r='4'
          fill='rgb(132 88 216)'
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '0px 0px' }}
        />
      </svg>

      <p className='text-xs sm:text-sm text-content-secondary tracking-wide'>
        {caption}
        {progressArc && progressArc.clamped > 0 && (
          <span className='ml-2 text-content-muted'>
            {Math.round(progressArc.clamped * 100)}%
          </span>
        )}
      </p>
    </div>
  );
}

export default LoadingChart;
