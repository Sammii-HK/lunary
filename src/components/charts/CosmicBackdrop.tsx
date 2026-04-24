'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';

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
        <radialGradient id='cosmic-sky' cx='50%' cy='45%' r='65%'>
          <stop offset='0%' stopColor='#2e1a5e' stopOpacity='0.55' />
          <stop offset='55%' stopColor='#15102d' stopOpacity='0.35' />
          <stop offset='100%' stopColor='#08060f' stopOpacity='0' />
        </radialGradient>
        <radialGradient id='cosmic-drift' cx='30%' cy='70%' r='70%'>
          <stop offset='0%' stopColor='#ff6ec7' stopOpacity='0.18' />
          <stop offset='60%' stopColor='#5dade2' stopOpacity='0.08' />
          <stop offset='100%' stopColor='transparent' stopOpacity='0' />
        </radialGradient>
      </defs>

      <circle
        cx='0'
        cy='0'
        r={Math.min(w, h) / 2 - 1}
        fill='url(#cosmic-sky)'
      />

      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        style={{ originX: 0, originY: 0 }}
      >
        <circle
          cx='0'
          cy='0'
          r={Math.min(w, h) / 2 - 1}
          fill='url(#cosmic-drift)'
        />
      </motion.g>

      {stars.map((s) => (
        <motion.circle
          key={s.i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill='#fff8e7'
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
