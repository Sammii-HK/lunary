'use client';

import { motion } from 'motion/react';
import { bodiesSymbols } from '@/constants/symbols';
import {
  TRANSIT_BODIES,
  sampleEphemeris,
  type BodyName,
  type EphemerisRange,
} from '@/components/charts/useEphemerisRange';

type Props = {
  range: EphemerisRange | null;
  /** Birth date (ISO string or Date). */
  birthDate: Date;
  /** "Now" time in ms — used to compute current age. */
  now: number;
  /** Function that converts longitude → cartesian using the parent chart's ASC orientation. */
  polar: (lon: number, radius: number) => { x: number; y: number };
  /** Radius for progressed glyphs. */
  radius?: number;
};

const PROGRESSED_COLOR = '#FFB78A'; // distinct warm amber outline

function symbolFor(body: string) {
  const k = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof bodiesSymbols;
  return bodiesSymbols[k] || body.charAt(0);
}

/**
 * Render a third "progressed" ring on the bi-wheel.
 *
 * Secondary progressions: 1 day after birth = 1 year of life. So:
 *   progressedDate = birthDate + ageInYears (days)
 *
 * If the resulting progressedDate falls outside the precomputed `range`,
 * `sampleEphemeris` will clamp to the nearest endpoint, which is acceptable
 * for a visual indicator in this UI; the parent already covers ±a year.
 */
export function ProgressedRing({
  range,
  birthDate,
  now,
  polar,
  radius = 88,
}: Props) {
  if (!range) return null;

  const birthMs = birthDate.getTime();
  const ageMs = now - birthMs;
  const ageYears = ageMs / (365.2422 * 86400000);

  // 1 day = 1 year offset from natal date.
  const progressedDate = birthMs + ageYears * 86400000;

  const snap = sampleEphemeris(range, progressedDate);
  if (!snap) return null;

  return (
    <g aria-hidden style={{ opacity: 0.55 }}>
      {/* faint outline ring marker */}
      <circle
        cx={0}
        cy={0}
        r={radius + 6}
        fill='none'
        stroke={PROGRESSED_COLOR}
        strokeWidth={0.4}
        strokeDasharray='1 3'
        opacity={0.35}
      />
      {TRANSIT_BODIES.map((name: BodyName) => {
        const lon = snap.longitudes[name];
        const pos = polar(lon, radius);
        return (
          <motion.g
            key={`prog-${name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: pos.x, y: pos.y }}
            transition={{ type: 'spring', stiffness: 70, damping: 18 }}
          >
            <circle
              cx={0}
              cy={0}
              r={1.2}
              fill={PROGRESSED_COLOR}
              opacity={0.85}
            />
            <text
              x={0}
              y={-6}
              textAnchor='middle'
              dominantBaseline='central'
              className='font-astro'
              fontSize='7'
              fill={PROGRESSED_COLOR}
              opacity={0.85}
              style={{
                paintOrder: 'stroke',
                stroke: 'rgba(0,0,0,0.45)',
                strokeWidth: 1.5,
              }}
            >
              {symbolFor(name)}
            </text>
          </motion.g>
        );
      })}
    </g>
  );
}
