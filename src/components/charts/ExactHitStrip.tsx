'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { bodiesSymbols } from '@/constants/symbols';
import {
  TRANSIT_BODIES,
  sampleEphemeris,
  type BodyName,
  type EphemerisRange,
} from '@/components/charts/useEphemerisRange';

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 6, color: '#C77DFF', glyph: '☌' },
  { name: 'Opposition', angle: 180, orb: 6, color: '#ffd6a3', glyph: '☍' },
  { name: 'Trine', angle: 120, orb: 5, color: '#7BFFB8', glyph: '△' },
  { name: 'Square', angle: 90, orb: 5, color: '#f87171', glyph: '□' },
  { name: 'Sextile', angle: 60, orb: 3, color: '#94d1ff', glyph: '✶' },
] as const;

type NatalPlanet = {
  name: BodyName;
  longitude: number;
  retrograde: boolean;
};

type Props = {
  range: EphemerisRange | null;
  now: number;
  natalPlanets: NatalPlanet[];
  /** Window radius in days (default 15 → ±15d window). */
  windowDays?: number;
};

function symbolFor(body: string) {
  const k = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof bodiesSymbols;
  return bodiesSymbols[k] || body.charAt(0);
}

function angularDiff(a: number, b: number) {
  let d = Math.abs(a - b);
  if (d > 180) d = 360 - d;
  return d;
}

type ActivePair = {
  key: string;
  transit: BodyName;
  natal: BodyName;
  natalLon: number;
  aspectName: string;
  aspectAngle: number;
  orbAllowed: number;
  color: string;
  glyph: string;
  currentOrb: number;
};

export function ExactHitStrip({
  range,
  now,
  natalPlanets,
  windowDays = 15,
}: Props) {
  // Find currently active aspect pairs.
  const activePairs = useMemo<ActivePair[]>(() => {
    if (!range) return [];
    const snap = sampleEphemeris(range, now);
    if (!snap) return [];
    const pairs: ActivePair[] = [];
    for (const transit of TRANSIT_BODIES) {
      const tLon = snap.longitudes[transit];
      for (const natal of natalPlanets) {
        if (!TRANSIT_BODIES.includes(natal.name)) continue;
        const diff = angularDiff(tLon, natal.longitude);
        for (const a of ASPECTS) {
          const orb = Math.abs(diff - a.angle);
          if (orb <= a.orb) {
            pairs.push({
              key: `${transit}-${natal.name}-${a.name}`,
              transit,
              natal: natal.name,
              natalLon: natal.longitude,
              aspectName: a.name,
              aspectAngle: a.angle,
              orbAllowed: a.orb,
              color: a.color,
              glyph: a.glyph,
              currentOrb: orb,
            });
            break;
          }
        }
      }
    }
    pairs.sort((a, b) => a.currentOrb - b.currentOrb);
    return pairs.slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, now, natalPlanets]);

  // Sample window: every 1 day from now-windowDays..now+windowDays.
  const samples = useMemo(() => {
    if (!range || activePairs.length === 0) return null;
    const stepMs = 86400000;
    const startT = now - windowDays * stepMs;
    const endT = now + windowDays * stepMs;
    const points: { t: number; orbs: number[] }[] = [];
    for (let t = startT; t <= endT + 1; t += stepMs) {
      const snap = sampleEphemeris(range, t);
      if (!snap) continue;
      const orbs: number[] = activePairs.map((pair) => {
        const tLon = snap.longitudes[pair.transit];
        const diff = angularDiff(tLon, pair.natalLon);
        return Math.abs(diff - pair.aspectAngle);
      });
      points.push({ t, orbs });
    }
    return { startT, endT, points };
  }, [range, activePairs, now, windowDays]);

  if (!range || activePairs.length === 0 || !samples) {
    return null;
  }

  const VB_W = 600;
  const VB_H = 80;
  const PAD_X = 8;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 18;
  const innerW = VB_W - PAD_X * 2;
  const innerH = VB_H - PAD_TOP - PAD_BOTTOM;
  const totalSpan = samples.endT - samples.startT;

  const xFor = (t: number) =>
    PAD_X + ((t - samples.startT) / totalSpan) * innerW;

  // Y: orb 0 at top (PAD_TOP), max orb at bottom.
  const yFor = (orb: number, maxOrb: number) =>
    PAD_TOP + Math.min(1, orb / maxOrb) * innerH;

  const nowX = xFor(now);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className='mt-3 rounded-xl border border-stroke-subtle/70 bg-surface-elevated/30 p-2.5'
    >
      <div className='mb-1.5 flex items-center justify-between'>
        <h4 className='text-[10px] font-semibold uppercase tracking-wider text-content-muted'>
          Exact-hit strip · ±{windowDays}d
        </h4>
        <span className='text-[10px] text-content-muted'>
          peak = exact aspect
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className='block w-full'
        preserveAspectRatio='none'
        role='img'
        aria-label='Aspect strength curves over the next month'
      >
        {/* Top tightness line (0° orb) */}
        <line
          x1={PAD_X}
          y1={PAD_TOP}
          x2={VB_W - PAD_X}
          y2={PAD_TOP}
          stroke='#52525b'
          strokeWidth={0.4}
          strokeDasharray='2 3'
          opacity={0.6}
        />
        {/* Bottom (max orb) line */}
        <line
          x1={PAD_X}
          y1={PAD_TOP + innerH}
          x2={VB_W - PAD_X}
          y2={PAD_TOP + innerH}
          stroke='#52525b'
          strokeWidth={0.4}
          opacity={0.4}
        />

        {/* Curves: one path per active pair */}
        {activePairs.map((pair, idx) => {
          const pts = samples.points.map((pt) => {
            const orb = pt.orbs[idx];
            return { x: xFor(pt.t), y: yFor(orb, pair.orbAllowed) };
          });
          if (pts.length === 0) return null;
          // Build smooth path with quadratic curves.
          let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
          for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const midX = (prev.x + curr.x) / 2;
            const midY = (prev.y + curr.y) / 2;
            d += ` Q ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
          }
          d += ` T ${pts[pts.length - 1].x.toFixed(2)} ${pts[pts.length - 1].y.toFixed(2)}`;

          // Find peak (lowest orb).
          let peakIdx = 0;
          let peakOrb = samples.points[0].orbs[idx];
          for (let i = 1; i < samples.points.length; i++) {
            if (samples.points[i].orbs[idx] < peakOrb) {
              peakOrb = samples.points[i].orbs[idx];
              peakIdx = i;
            }
          }
          const peakPt = pts[peakIdx];

          return (
            <g key={pair.key}>
              <motion.path
                d={d}
                fill='none'
                stroke={pair.color}
                strokeWidth={1.4}
                strokeLinecap='round'
                strokeLinejoin='round'
                opacity={0.85}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.06 }}
              />
              {/* Peak marker */}
              <circle
                cx={peakPt.x}
                cy={peakPt.y}
                r={2.4}
                fill={pair.color}
                opacity={0.95}
              />
              <circle
                cx={peakPt.x}
                cy={peakPt.y}
                r={5}
                fill={pair.color}
                opacity={0.18}
              />
              {/* Label near the peak */}
              <text
                x={peakPt.x}
                y={Math.max(peakPt.y - 5, PAD_TOP - 3)}
                textAnchor='middle'
                fontSize='8'
                fill={pair.color}
                opacity={0.95}
                style={{
                  fontFamily:
                    'var(--font-astro, system-ui), system-ui, sans-serif',
                }}
              >
                {symbolFor(pair.transit)} {pair.glyph} {symbolFor(pair.natal)}
              </text>
            </g>
          );
        })}

        {/* "now" hairline */}
        <line
          x1={nowX}
          y1={PAD_TOP - 4}
          x2={nowX}
          y2={PAD_TOP + innerH + 4}
          stroke='#ffffff'
          strokeWidth={0.6}
          opacity={0.55}
        />
        <text
          x={nowX}
          y={VB_H - 4}
          textAnchor='middle'
          fontSize='7'
          fill='#e4e4e7'
          opacity={0.65}
        >
          now
        </text>
      </svg>
    </motion.div>
  );
}
