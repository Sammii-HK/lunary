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

export function buildMoonLitPath({
  cx,
  cy,
  r,
  illumination,
  waxing,
  segments = 48,
}: {
  cx: number;
  cy: number;
  r: number;
  illumination: number;
  waxing: boolean;
  segments?: number;
}): string {
  const k = Math.max(0, Math.min(1, illumination));
  if (k <= 0.001) return '';

  const safeSegments = Math.max(12, segments);
  const terminatorFactor = 1 - 2 * k;
  const outerPoints: Array<[number, number]> = [];
  const terminatorPoints: Array<[number, number]> = [];

  for (let i = 0; i <= safeSegments; i += 1) {
    const t = i / safeSegments;
    const y = cy - r + t * r * 2;
    const yOffset = y - cy;
    const halfWidth = Math.sqrt(Math.max(0, r * r - yOffset * yOffset));

    if (waxing) {
      outerPoints.push([cx + halfWidth, y]);
      terminatorPoints.push([cx + terminatorFactor * halfWidth, y]);
    } else {
      outerPoints.push([cx - halfWidth, y]);
      terminatorPoints.push([cx - terminatorFactor * halfWidth, y]);
    }
  }

  const points = [...outerPoints, ...terminatorPoints.reverse()];
  return `${points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ')} Z`;
}

/**
 * Pure SVG moon shape rendered from the illuminated horizontal slices.
 * This avoids arc fill-rule ambiguity where crescents can appear as gibbous.
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
  const litPath = buildMoonLitPath({
    cx,
    cy,
    r,
    illumination: k,
    waxing: isWaxing,
  });

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
      {k >= 0.999 ? (
        <circle cx={cx} cy={cy} r={r} fill={`url(#${gid}-grad)`} />
      ) : litPath ? (
        <path d={litPath} fill={`url(#${gid}-grad)`} />
      ) : null}
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
