'use client';

import { useEffect, useRef, useState } from 'react';

export type BodyName =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

export const TRANSIT_BODIES: BodyName[] = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

export type EphemerisSnapshot = {
  time: number;
  longitudes: Record<BodyName, number>;
  retrograde: Record<BodyName, boolean>;
};

export type EphemerisRange = {
  start: number;
  end: number;
  stepMs: number;
  snapshots: EphemerisSnapshot[];
};

type AstronomyEngine = typeof import('astronomy-engine');

let enginePromise: Promise<AstronomyEngine> | null = null;
function loadEngine() {
  if (!enginePromise) {
    enginePromise = import('astronomy-engine');
  }
  return enginePromise;
}

function angleDiff(a: number, b: number) {
  let d = ((a - b + 540) % 360) - 180;
  return d;
}

async function computeSnapshot(
  ae: AstronomyEngine,
  date: Date,
  prevLongitudes?: Record<BodyName, number>,
): Promise<EphemerisSnapshot> {
  const bodies: [BodyName, keyof typeof ae.Body][] = [
    ['Sun', 'Sun'],
    ['Moon', 'Moon'],
    ['Mercury', 'Mercury'],
    ['Venus', 'Venus'],
    ['Mars', 'Mars'],
    ['Jupiter', 'Jupiter'],
    ['Saturn', 'Saturn'],
    ['Uranus', 'Uranus'],
    ['Neptune', 'Neptune'],
    ['Pluto', 'Pluto'],
  ];
  const longitudes = {} as Record<BodyName, number>;
  const retrograde = {} as Record<BodyName, boolean>;
  for (const [name, body] of bodies) {
    try {
      const vec = ae.GeoVector(ae.Body[body], date, false);
      const ec = ae.Ecliptic(vec);
      const lon = ((ec.elon % 360) + 360) % 360;
      longitudes[name] = lon;
      if (prevLongitudes && name !== 'Sun' && name !== 'Moon') {
        const delta = angleDiff(lon, prevLongitudes[name]);
        retrograde[name] = delta < 0;
      } else {
        retrograde[name] = false;
      }
    } catch {
      longitudes[name] = prevLongitudes?.[name] ?? 0;
      retrograde[name] = false;
    }
  }
  return { time: date.getTime(), longitudes, retrograde };
}

type UseRangeOpts = {
  enabled?: boolean;
  start: Date;
  end: Date;
  stepDays?: number;
};

export function useEphemerisRange({
  enabled = true,
  start,
  end,
  stepDays = 2,
}: UseRangeOpts) {
  const [range, setRange] = useState<EphemerisRange | null>(null);
  const [progress, setProgress] = useState(0);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    cancelled.current = false;
    let active = true;
    const stepMs = stepDays * 24 * 60 * 60 * 1000;
    const startMs = start.getTime();
    const endMs = end.getTime();
    const points: number[] = [];
    for (let t = startMs; t <= endMs; t += stepMs) points.push(t);

    (async () => {
      const ae = await loadEngine();
      const snapshots: EphemerisSnapshot[] = [];
      let prev: Record<BodyName, number> | undefined;
      for (let i = 0; i < points.length; i++) {
        if (!active || cancelled.current) return;
        const snap = await computeSnapshot(ae, new Date(points[i]), prev);
        snapshots.push(snap);
        prev = snap.longitudes;
        if (i % 16 === 0) {
          setProgress(i / points.length);
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      if (!active || cancelled.current) return;
      setProgress(1);
      setRange({ start: startMs, end: endMs, stepMs, snapshots });
    })();

    return () => {
      active = false;
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, start.getTime(), end.getTime(), stepDays]);

  return { range, progress };
}

function lerpAngle(a: number, b: number, t: number) {
  let d = ((b - a + 540) % 360) - 180;
  return (((a + d * t) % 360) + 360) % 360;
}

export function sampleEphemeris(
  range: EphemerisRange,
  time: number,
): EphemerisSnapshot | null {
  const { start, stepMs, snapshots } = range;
  if (!snapshots.length) return null;
  const idx = (time - start) / stepMs;
  const lo = Math.max(0, Math.min(snapshots.length - 1, Math.floor(idx)));
  const hi = Math.max(0, Math.min(snapshots.length - 1, lo + 1));
  const frac = Math.max(0, Math.min(1, idx - lo));
  if (lo === hi) return snapshots[lo];
  const a = snapshots[lo];
  const b = snapshots[hi];
  const longitudes = {} as Record<BodyName, number>;
  const retrograde = {} as Record<BodyName, boolean>;
  for (const name of TRANSIT_BODIES) {
    longitudes[name] = lerpAngle(a.longitudes[name], b.longitudes[name], frac);
    retrograde[name] = frac < 0.5 ? a.retrograde[name] : b.retrograde[name];
  }
  return { time, longitudes, retrograde };
}
