'use client';

/**
 * DaySkyView, client renderer for `/sky/[date]`.
 *
 * Receives transit-only placement data (no natal chart) for a single
 * historical date and renders:
 *  - a slim transit chart (reuses <BirthChart> with houses + aspects off)
 *  - the moon phase for that day
 *  - the day's top three aspects
 *  - a one-paragraph poetic interpretation built from
 *    `transit-content/templates.ts` helpers
 *  - an <AudioNarrator> for the interpretation
 *  - a "see your sky" CTA pointing into /app/time-machine
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { BirthChart } from '@/components/BirthChart';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import {
  MoonPhase,
  illuminationFromLongitudes,
} from '@/components/charts/MoonPhase';
import {
  getTemplateBlurb,
  GENERIC_FALLBACK_BLURB,
  type AspectType,
  type BodyName,
  type ZodiacSign,
} from '@/lib/transit-content/templates';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

const VALID_BODIES = new Set<BodyName>([
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
]);

const VALID_SIGNS = new Set<ZodiacSign>([
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
]);

const ASPECT_DEFS: ReadonlyArray<{
  name: AspectType;
  angle: number;
  orb: number;
  hue: string;
}> = [
  { name: 'Conjunction', angle: 0, orb: 6, hue: '#C77DFF' },
  { name: 'Opposition', angle: 180, orb: 6, hue: '#ffd6a3' },
  { name: 'Trine', angle: 120, orb: 5, hue: '#7BFFB8' },
  { name: 'Square', angle: 90, orb: 5, hue: '#f87171' },
  { name: 'Sextile', angle: 60, orb: 3, hue: '#94d1ff' },
];

type AspectRow = {
  key: string;
  planet1: BodyName;
  planet2: BodyName;
  type: AspectType;
  orb: number;
  hue: string;
};

function computeTopAspects(
  placements: BirthChartData[],
  limit = 3,
): AspectRow[] {
  const rows: AspectRow[] = [];
  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      const a = placements[i];
      const b = placements[j];
      if (!VALID_BODIES.has(a.body as BodyName)) continue;
      if (!VALID_BODIES.has(b.body as BodyName)) continue;
      let diff = Math.abs(a.eclipticLongitude - b.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;
      for (const aspect of ASPECT_DEFS) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          rows.push({
            key: `${a.body}-${b.body}-${aspect.name}`,
            planet1: a.body as BodyName,
            planet2: b.body as BodyName,
            type: aspect.name,
            orb,
            hue: aspect.hue,
          });
          break;
        }
      }
    }
  }
  rows.sort((x, y) => x.orb - y.orb);
  return rows.slice(0, limit);
}

function describeMoonPhase(illumination: number, waxing: boolean): string {
  if (illumination < 0.03) return 'New Moon';
  if (illumination > 0.97) return 'Full Moon';
  if (illumination < 0.45)
    return waxing ? 'Waxing Crescent' : 'Waning Crescent';
  if (illumination < 0.55) return waxing ? 'First Quarter' : 'Last Quarter';
  return waxing ? 'Waxing Gibbous' : 'Waning Gibbous';
}

function buildPoeticInterpretation(
  placements: BirthChartData[],
  topAspects: AspectRow[],
  moonLabel: string,
): string {
  const sun = placements.find((p) => p.body === 'Sun');
  const moon = placements.find((p) => p.body === 'Moon');
  const venus = placements.find((p) => p.body === 'Venus');

  const fragments: string[] = [];

  if (sun && VALID_SIGNS.has(sun.sign as ZodiacSign)) {
    const blurb = getTemplateBlurb({
      kind: 'planet_in_sign',
      planet: 'Sun',
      sign: sun.sign as ZodiacSign,
    });
    if (blurb) fragments.push(blurb);
  }

  if (moon && VALID_SIGNS.has(moon.sign as ZodiacSign)) {
    const blurb = getTemplateBlurb({
      kind: 'planet_in_sign',
      planet: 'Moon',
      sign: moon.sign as ZodiacSign,
    });
    if (blurb) fragments.push(`${moonLabel.toLowerCase()}, ${blurb}`);
  }

  if (topAspects.length > 0) {
    const top = topAspects[0];
    const aspectBlurb = getTemplateBlurb({
      kind: 'aspect_to_natal',
      transitPlanet: top.planet1,
      aspect: top.type,
      natalPlanet: top.planet2,
    });
    if (aspectBlurb) fragments.push(aspectBlurb);
  } else if (venus && VALID_SIGNS.has(venus.sign as ZodiacSign)) {
    const blurb = getTemplateBlurb({
      kind: 'planet_in_sign',
      planet: 'Venus',
      sign: venus.sign as ZodiacSign,
    });
    if (blurb) fragments.push(blurb);
  }

  if (fragments.length === 0) return GENERIC_FALLBACK_BLURB;
  return fragments.join(' ');
}

function formatLongDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[(m - 1 + 12) % 12]} ${d}, ${y}`;
}

interface DaySkyViewProps {
  /** ISO YYYY-MM-DD that we resolved to (always a real date). */
  date: string;
  /** Transit-only placements, Sun, Moon, planets. */
  placements: BirthChartData[];
  /** Optional: human label for the slug, e.g. "The day you were born". */
  contextLabel?: string;
  /**
   * Optional flag, when this came from a named slug we add a small badge
   * above the heading to give the share extra hook.
   */
  fromNamedSlug?: boolean;
}

export function DaySkyView({
  date,
  placements,
  contextLabel,
  fromNamedSlug,
}: DaySkyViewProps) {
  const longDate = formatLongDate(date);

  const { illumination, waxing, moonLabel } = useMemo(() => {
    const sun = placements.find((p) => p.body === 'Sun');
    const moon = placements.find((p) => p.body === 'Moon');
    if (!sun || !moon) {
      return {
        illumination: 0,
        waxing: true,
        moonLabel: 'Moon phase unavailable',
      };
    }
    const result = illuminationFromLongitudes(
      sun.eclipticLongitude,
      moon.eclipticLongitude,
    );
    return {
      illumination: result.illumination,
      waxing: result.waxing,
      moonLabel: describeMoonPhase(result.illumination, result.waxing),
    };
  }, [placements]);

  const topAspects = useMemo(
    () => computeTopAspects(placements, 3),
    [placements],
  );

  const interpretation = useMemo(
    () => buildPoeticInterpretation(placements, topAspects, moonLabel),
    [placements, topAspects, moonLabel],
  );

  const ctaHref = `/auth?next=${encodeURIComponent(
    `/app/time-machine?date=${date}`,
  )}`;

  return (
    <article className='relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14'>
      {/* Cosmic vignette behind everything */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10'
        style={{
          background:
            'radial-gradient(ellipse at 50% 10%, rgba(132,88,216,0.18) 0%, rgba(10,10,15,0) 60%)',
        }}
      />

      {/* Header */}
      <header className='flex flex-col items-center gap-3 text-center'>
        {fromNamedSlug && contextLabel ? (
          <span className='inline-flex items-center gap-2 rounded-full border border-lunary-primary-700/60 bg-layer-base/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-content-brand'>
            <Sparkles className='h-3 w-3' aria-hidden='true' />
            {contextLabel}
          </span>
        ) : (
          <span className='text-xs uppercase tracking-[0.3em] text-content-muted'>
            The sky on
          </span>
        )}
        <Heading as='h1' variant='h1' className='text-content-primary'>
          {longDate}
        </Heading>
        <p className='max-w-2xl text-sm text-content-muted sm:text-base'>
          A snapshot of where the planets stood, and what the sky was whispering
          that day.
        </p>
      </header>

      {/* Chart + side stats */}
      <section className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'>
        <div className='flex items-center justify-center rounded-3xl border border-lunary-primary-700/30 bg-layer-base/40 p-4 sm:p-6'>
          <BirthChart
            birthChart={placements}
            showAspects={false}
            showAsteroids={false}
            showPoints={false}
          />
        </div>

        <div className='flex flex-col gap-6'>
          {/* Moon phase card */}
          <div className='rounded-3xl border border-lunary-primary-700/30 bg-layer-base/50 p-5'>
            <Heading as='h2' variant='h3'>
              Moon phase
            </Heading>
            <div className='mt-2 flex items-center gap-4'>
              <svg
                width={72}
                height={72}
                viewBox='-40 -40 80 80'
                aria-hidden='true'
              >
                <MoonPhase
                  cx={0}
                  cy={0}
                  r={32}
                  phase={waxing ? illumination * 0.5 : 1 - illumination * 0.5}
                  illumination={illumination}
                  waxing={waxing}
                  glow={false}
                  id='daysky-moon'
                />
              </svg>
              <div className='min-w-0'>
                <p className='text-base font-medium text-content-primary'>
                  {moonLabel}
                </p>
                <p className='text-xs text-content-muted'>
                  {Math.round(illumination * 100)}% illuminated ·{' '}
                  {waxing ? 'waxing' : 'waning'}
                </p>
              </div>
            </div>
          </div>

          {/* Top 3 aspects */}
          <div className='rounded-3xl border border-lunary-primary-700/30 bg-layer-base/50 p-5'>
            <Heading as='h2' variant='h3'>
              Top three aspects
            </Heading>
            {topAspects.length === 0 ? (
              <p className='mt-2 text-sm text-content-muted'>
                A quiet day, no major aspects in tight orb.
              </p>
            ) : (
              <ul className='mt-3 flex flex-col gap-2'>
                {topAspects.map((row) => (
                  <li
                    key={row.key}
                    className='flex items-center justify-between gap-3 rounded-xl border border-lunary-primary-800/40 bg-surface-overlay/30 px-3 py-2'
                  >
                    <span className='flex items-center gap-2 text-sm text-content-primary'>
                      <span
                        aria-hidden='true'
                        className='inline-block h-2 w-2 rounded-full'
                        style={{ background: row.hue }}
                      />
                      {row.planet1}{' '}
                      <span className='text-content-muted'>
                        {row.type.toLowerCase()}
                      </span>{' '}
                      {row.planet2}
                    </span>
                    <span className='text-xs tabular-nums text-content-muted'>
                      {row.orb.toFixed(1)}° orb
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Poetic interpretation + audio */}
      <section className='rounded-3xl border border-lunary-primary-700/40 bg-layer-base/60 p-6 sm:p-8'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <Heading as='h2' variant='h2'>
            What the sky was saying
          </Heading>
          {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
          {/* <AudioNarrator
            text={interpretation}
            title={`The sky on ${longDate}`}
            compactVariant='pill'
          /> */}
        </div>
        <p className='text-base leading-relaxed text-content-secondary sm:text-lg'>
          {interpretation}
        </p>
      </section>

      {/* CTA */}
      <section className='flex flex-col items-center gap-3 rounded-3xl border border-lunary-accent-700/40 bg-gradient-to-br from-lunary-primary/10 via-layer-base/60 to-lunary-accent/10 p-8 text-center'>
        <Heading as='h2' variant='h2'>
          What did your sky look like?
        </Heading>
        <p className='max-w-xl text-sm text-content-muted'>
          Open the time machine to see your own birthday, your wedding, your
          first day of a new chapter, any day at all.
        </p>
        <Button asChild variant='lunary-solid' size='lg'>
          <Link href={ctaHref}>
            See yours
            <ArrowRight className='ml-1 h-4 w-4' aria-hidden='true' />
          </Link>
        </Button>
      </section>
    </article>
  );
}

export default DaySkyView;
