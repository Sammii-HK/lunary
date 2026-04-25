'use client';

import { motion } from 'motion/react';

type Props = {
  cx: number;
  cy: number;
  r: number;
  /** 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter, 1 = new */
  phase: number;
  /** absolute illumination 0..1 */
  illumination?: number;
  /** waxing or waning */
  waxing?: boolean;
  fillLit?: string;
  fillDark?: string;
  glow?: boolean;
  id?: string;
};

/**
 * Pure SVG moon shape rendered with two arcs that meet at the top/bottom.
 * The terminator x-radius is computed from illumination + waxing flag, so
 * the same component handles new → crescent → quarter → gibbous → full.
 */
export function MoonPhase({
  cx,
  cy,
  r,
  phase,
  illumination,
  waxing,
  fillLit = '#f5edd1',
  fillDark = '#1a1830',
  glow = true,
  id,
}: Props) {
  const k =
    typeof illumination === 'number'
      ? Math.max(0, Math.min(1, illumination))
      : Math.abs(Math.cos(phase * Math.PI * 2)) * 0.5 + 0.5;
  const isWaxing = typeof waxing === 'boolean' ? waxing : phase < 0.5;
  const ratio = 1 - 2 * k;
  const rx = Math.abs(ratio) * r;
  const terminatorSweep = ratio > 0 ? 1 : 0;
  const litPath =
    `M ${cx} ${cy - r} ` +
    `A ${r} ${r} 0 0 ${isWaxing ? 1 : 0} ${cx} ${cy + r} ` +
    `A ${rx} ${r} 0 0 ${isWaxing ? terminatorSweep : 1 - terminatorSweep} ${cx} ${cy - r} Z`;

  const gid = id || 'moon';

  return (
    <g>
      {glow && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={r * 1.6}
          fill={fillLit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          style={{ filter: 'blur(3px)' }}
        />
      )}
      <circle cx={cx} cy={cy} r={r} fill={fillDark} />
      <path d={litPath} fill={`url(#${gid}-grad)`} />
      <defs>
        <radialGradient id={`${gid}-grad`} cx='40%' cy='35%' r='75%'>
          <stop offset='0%' stopColor='#fffbe6' />
          <stop offset='65%' stopColor={fillLit} />
          <stop offset='100%' stopColor='#c9b87a' />
        </radialGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill='none'
        stroke='#3a324e'
        strokeWidth={0.4}
        opacity={0.6}
      />
    </g>
  );
}

/** Quick illumination calc from ecliptic longitude diff between Sun and Moon */
export function illuminationFromLongitudes(sunLon: number, moonLon: number) {
  const elongation = (moonLon - sunLon + 360) % 360;
  const phase = (1 - Math.cos((elongation * Math.PI) / 180)) / 2;
  const waxing = elongation < 180;
  return { illumination: phase, waxing, elongation };
}
