'use client';

import { motion } from 'motion/react';
import { useId, useMemo } from 'react';

type Props = {
  viewBox?: string;
  starCount?: number;
  seed?: number;
};

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

export function CosmicBackdrop({
  viewBox = '-140 -140 280 280',
  starCount = 42,
  seed = 7,
}: Props) {
  const gradientId = `cosmic-sky-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [, , w, h] = viewBox.split(' ').map(Number);
  const stars = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: starCount }, (_, i) => {
      const r = rng() * (Math.min(w, h) / 2 - 10);
      const theta = rng() * Math.PI * 2;
      return {
        cx: Math.cos(theta) * r,
        cy: Math.sin(theta) * r,
        r: 0.25 + rng() * 0.8,
        delay: rng() * 5,
        duration: 2.2 + rng() * 3.6,
        baseOpacity: 0.25 + rng() * 0.55,
        i,
      };
    });
  }, [starCount, seed, w, h]);

  return (
    <g className='cosmic-backdrop' pointerEvents='none' aria-hidden>
      <defs>
        <style>
          {`
            .cosmic-sky-center { stop-color: rgb(var(--chart-backdrop-center)); stop-opacity: 0.58; }
            .cosmic-sky-mid { stop-color: rgb(var(--chart-backdrop-mid)); stop-opacity: 0.32; }
            .cosmic-sky-edge { stop-color: rgb(var(--chart-backdrop-edge)); stop-opacity: 0; }
            .cosmic-star { fill: rgb(var(--chart-star)); }
            [data-theme='dark'] .cosmic-sky-center { stop-opacity: 0.52; }
            [data-theme='dark'] .cosmic-sky-mid { stop-opacity: 0.34; }
          `}
        </style>
        <radialGradient id={gradientId} cx='50%' cy='45%' r='65%'>
          <stop offset='0%' className='cosmic-sky-center' />
          <stop offset='55%' className='cosmic-sky-mid' />
          <stop offset='100%' className='cosmic-sky-edge' />
        </radialGradient>
      </defs>

      <circle
        cx='0'
        cy='0'
        r={Math.min(w, h) / 2 - 1}
        fill={`url(#${gradientId})`}
      />

      {stars.map((s) => (
        <motion.circle
          key={s.i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          className='cosmic-star'
          initial={{ opacity: s.baseOpacity * 0.4 }}
          animate={{
            opacity: [s.baseOpacity * 0.4, s.baseOpacity, s.baseOpacity * 0.4],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </g>
  );
}
