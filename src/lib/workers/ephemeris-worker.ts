/// <reference lib="webworker" />
/**
 * Ephemeris Web Worker
 *
 * Computes ephemeris snapshots off the main thread to avoid jank during
 * heavy scrubber playback / sample rendering. Receives a compute request,
 * streams progress, and posts the final snapshot grid when done.
 *
 * Message contract (in):
 *   { type: 'compute', start: number, end: number, stepDays: number }
 *
 * Message contract (out):
 *   { type: 'progress', progress: number }
 *   { type: 'done', snapshots: EphemerisSnapshot[] }
 *   { type: 'error', message: string }
 *
 * Notes:
 * - No DOM access — Capacitor + Next 15 compatible.
 * - Runs as an ES module worker (`type: 'module'`).
 */

import { GeoVector, Ecliptic, Body } from 'astronomy-engine';

type BodyName =
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

type EphemerisSnapshot = {
  time: number;
  longitudes: Record<BodyName, number>;
  retrograde: Record<BodyName, boolean>;
};

const TRANSIT_BODIES: ReadonlyArray<[BodyName, Body]> = [
  ['Sun', Body.Sun],
  ['Moon', Body.Moon],
  ['Mercury', Body.Mercury],
  ['Venus', Body.Venus],
  ['Mars', Body.Mars],
  ['Jupiter', Body.Jupiter],
  ['Saturn', Body.Saturn],
  ['Uranus', Body.Uranus],
  ['Neptune', Body.Neptune],
  ['Pluto', Body.Pluto],
];

function angleDiff(a: number, b: number) {
  return ((a - b + 540) % 360) - 180;
}

function computeSnapshot(
  date: Date,
  prevLongitudes?: Record<BodyName, number>,
): EphemerisSnapshot {
  const longitudes = {} as Record<BodyName, number>;
  const retrograde = {} as Record<BodyName, boolean>;
  for (const [name, body] of TRANSIT_BODIES) {
    try {
      const vec = GeoVector(body, date, false);
      const ec = Ecliptic(vec);
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

type ComputeMessage = {
  type: 'compute';
  start: number;
  end: number;
  stepDays: number;
};

// Self-typed for module workers.
const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', (event: MessageEvent<ComputeMessage>) => {
  const data = event.data;
  if (!data || data.type !== 'compute') return;

  try {
    const { start, end, stepDays } = data;
    const stepMs = Math.max(1, stepDays) * 24 * 60 * 60 * 1000;
    const points: number[] = [];
    for (let t = start; t <= end; t += stepMs) points.push(t);

    const snapshots: EphemerisSnapshot[] = [];
    let prev: Record<BodyName, number> | undefined;
    const total = Math.max(points.length, 1);

    for (let i = 0; i < points.length; i++) {
      const snap = computeSnapshot(new Date(points[i]), prev);
      snapshots.push(snap);
      prev = snap.longitudes;
      // Throttle progress posts; ~6% granularity is plenty for UI.
      if (i % 16 === 0) {
        ctx.postMessage({ type: 'progress', progress: i / total });
      }
    }

    ctx.postMessage({ type: 'progress', progress: 1 });
    ctx.postMessage({ type: 'done', snapshots });
  } catch (err) {
    ctx.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Unknown worker error',
    });
  }
});

export {};
