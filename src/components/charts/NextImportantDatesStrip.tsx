'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CalendarDays, ChevronRight, Loader2 } from 'lucide-react';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  TRANSIT_BODIES,
  useEphemerisRange,
  type BodyName,
} from '@/components/charts/useEphemerisRange';

const DAY_MS = 24 * 60 * 60 * 1000;

const ASPECTS = [
  { name: 'conjunct', angle: 0, score: 90 },
  { name: 'opposes', angle: 180, score: 82 },
  { name: 'squares', angle: 90, score: 78 },
  { name: 'trines', angle: 120, score: 68 },
  { name: 'sextiles', angle: 60, score: 58 },
] as const;

const TRANSIT_EXACT_BODIES: BodyName[] = [
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

const NATAL_FOCUS = new Set([
  'Sun',
  'Moon',
  'Ascendant',
  'Midheaven',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
]);

type ImportantDate = {
  time: number;
  label: string;
  reason: string;
  score: number;
};

function fmtDate(time: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(time));
}

function isoDate(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

function signFromLongitude(lon: number) {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  return signs[Math.floor((((lon % 360) + 360) % 360) / 30)];
}

function signedDiff(a: number, b: number) {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

function aspectDelta(transitLon: number, natalLon: number, angle: number) {
  const separation = Math.abs(signedDiff(transitLon, natalLon));
  return separation - angle;
}

function interpolateTime(
  aTime: number,
  bTime: number,
  aDelta: number,
  bDelta: number,
) {
  const denom = bDelta - aDelta || 1;
  const frac = Math.max(0, Math.min(1, -aDelta / denom));
  return aTime + (bTime - aTime) * frac;
}

function pushUnique(out: ImportantDate[], candidate: ImportantDate) {
  const duplicate = out.some(
    (date) =>
      date.label === candidate.label &&
      Math.abs(date.time - candidate.time) < 7 * DAY_MS,
  );
  if (!duplicate) out.push(candidate);
}

type Props = {
  birthChart: BirthChartData[];
};

export function NextImportantDatesStrip({ birthChart }: Props) {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    return date;
  }, []);
  const end = useMemo(() => new Date(today.getTime() + 365 * DAY_MS), [today]);

  const { range, progress } = useEphemerisRange({
    enabled: birthChart.length > 0,
    start: today,
    end,
    stepDays: 2,
  });

  const dates = useMemo(() => {
    if (!range) return [];

    const natalBodies = birthChart
      .filter((body) => NATAL_FOCUS.has(body.body))
      .map((body) => ({
        name: body.body,
        longitude: body.eclipticLongitude,
      }));

    const natalLookup = new Map(
      birthChart
        .filter((body) => TRANSIT_BODIES.includes(body.body as BodyName))
        .map((body) => [body.body as BodyName, body.eclipticLongitude]),
    );

    const out: ImportantDate[] = [];
    const snaps = range.snapshots;

    for (let i = 1; i < snaps.length; i++) {
      const previous = snaps[i - 1];
      const current = snaps[i];

      for (const body of TRANSIT_EXACT_BODIES) {
        const previousSign = Math.floor(previous.longitudes[body] / 30);
        const currentSign = Math.floor(current.longitudes[body] / 30);
        if (body !== 'Mars' && previousSign !== currentSign) {
          pushUnique(out, {
            time: current.time,
            label: `${body} enters ${signFromLongitude(current.longitudes[body])}`,
            reason: 'A slower sky shift changes the background weather.',
            score: body === 'Jupiter' || body === 'Saturn' ? 76 : 62,
          });
        }

        for (const natal of natalBodies) {
          for (const aspect of ASPECTS) {
            const aDelta = aspectDelta(
              previous.longitudes[body],
              natal.longitude,
              aspect.angle,
            );
            const bDelta = aspectDelta(
              current.longitudes[body],
              natal.longitude,
              aspect.angle,
            );
            const crosses =
              aDelta === 0 ||
              bDelta === 0 ||
              (aDelta < 0 && bDelta > 0) ||
              (aDelta > 0 && bDelta < 0);
            const nearExact =
              Math.min(Math.abs(aDelta), Math.abs(bDelta)) < 0.35;
            if (!crosses && !nearExact) continue;

            const time = crosses
              ? interpolateTime(previous.time, current.time, aDelta, bDelta)
              : current.time;
            const isOuter = ['Uranus', 'Neptune', 'Pluto'].includes(body);
            const score =
              aspect.score +
              (natal.name === 'Sun' || natal.name === 'Moon' ? 8 : 0) +
              (isOuter ? 8 : 0);

            pushUnique(out, {
              time,
              label: `${body} ${aspect.name} natal ${natal.name}`,
              reason: 'Exact to your birth chart, not a generic transit.',
              score,
            });
          }
        }
      }

      for (const body of ['Sun', 'Moon', 'Jupiter', 'Saturn'] as BodyName[]) {
        const natalLon = natalLookup.get(body);
        if (natalLon == null) continue;
        const aDelta = signedDiff(previous.longitudes[body], natalLon);
        const bDelta = signedDiff(current.longitudes[body], natalLon);
        if (Math.abs(aDelta) > 90 || Math.abs(bDelta) > 90) continue;
        if (
          aDelta === 0 ||
          bDelta === 0 ||
          (aDelta < 0 && bDelta > 0) ||
          (aDelta > 0 && bDelta < 0)
        ) {
          const time = interpolateTime(
            previous.time,
            current.time,
            aDelta,
            bDelta,
          );
          pushUnique(out, {
            time,
            label:
              body === 'Sun'
                ? 'Solar return'
                : body === 'Moon'
                  ? 'Lunar return'
                  : `${body} return`,
            reason:
              body === 'Moon'
                ? 'Your monthly emotional reset point.'
                : 'A return to one of your natal placements.',
            score:
              body === 'Saturn'
                ? 110
                : body === 'Jupiter'
                  ? 104
                  : body === 'Sun'
                    ? 96
                    : 70,
          });
        }
      }
    }

    return out
      .filter((date) => date.time > today.getTime() + DAY_MS)
      .sort((a, b) => {
        const aRank = a.score - (a.time - today.getTime()) / (90 * DAY_MS);
        const bRank = b.score - (b.time - today.getTime()) / (90 * DAY_MS);
        return bRank - aRank;
      })
      .slice(0, 3)
      .sort((a, b) => a.time - b.time);
  }, [birthChart, range, today]);

  if (!range) {
    return (
      <div className='w-full rounded-2xl border border-stroke-subtle bg-surface-elevated/35 px-4 py-3 text-xs text-content-muted'>
        <span className='inline-flex items-center gap-2'>
          <Loader2 className='h-3.5 w-3.5 animate-spin text-lunary-primary' />
          Finding your next important dates… {Math.round(progress * 100)}%
        </span>
      </div>
    );
  }

  if (dates.length === 0) return null;

  return (
    <section className='w-full rounded-2xl border border-stroke-subtle bg-surface-elevated/35 p-3'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-muted'>
            Next in your chart
          </p>
          <h2 className='text-sm font-semibold text-content-primary'>
            Important dates to watch
          </h2>
        </div>
        <CalendarDays className='h-4 w-4 text-lunary-primary' />
      </div>

      <div className='grid gap-2 sm:grid-cols-3'>
        {dates.map((date) => {
          const params = new URLSearchParams({
            date: isoDate(date.time),
            label: date.label,
          });

          return (
            <Link
              key={`${date.label}-${date.time}`}
              href={`/app/time-machine?${params.toString()}`}
              className='group rounded-xl border border-white/10 bg-surface-base/35 p-3 transition-colors hover:border-lunary-primary/45 hover:bg-surface-base/55'
            >
              <div className='mb-2 flex items-center justify-between gap-2'>
                <span className='text-xs font-semibold text-content-brand'>
                  {fmtDate(date.time)}
                </span>
                <ChevronRight className='h-3.5 w-3.5 text-content-muted transition-transform group-hover:translate-x-0.5 group-hover:text-content-primary' />
              </div>
              <p className='text-xs font-medium text-content-primary'>
                {date.label}
              </p>
              <p className='mt-1 text-[11px] leading-relaxed text-content-muted'>
                {date.reason}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
