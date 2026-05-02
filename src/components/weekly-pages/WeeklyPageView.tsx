'use client';

/**
 * Magazine-style "Week Ahead" page view.
 *
 * Layout (top → bottom):
 *   1. Cover , week range pill, headline, hero (MoonPhase or gradient).
 *   2. Top transits, three element-tinted cards keyed by aspect tone.
 *   3. Day strip , seven day pills from notableDays.
 *   4. Ritual card, single recommendation with AudioNarrator.
 *   5. Summary   , poetic paragraph, glossary auto-linked.
 *   6. Share     , anchor that opens the OG image in a new tab.
 */

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore useMemo when restoring.
// import { useMemo } from 'react';
import {
  Calendar,
  Heart,
  Mountain,
  Share2,
  Sparkles,
  Sun,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { MoonPhase } from '@/components/charts/MoonPhase';
import { AutoLinkText } from '@/components/glossary/AutoLinkText';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';
import type { TransitWindow, WeeklyPage } from '@/lib/weekly-pages/build';

type ToneMeta = {
  label: string;
  icon: LucideIcon;
  border: string;
  text: string;
  bar: string;
};

const TONE_META: Record<TransitWindow['tone'], ToneMeta> = {
  flow: {
    label: 'Flow',
    icon: Waves,
    border: 'border-lunary-success-400/40',
    text: 'text-lunary-success-300',
    bar: 'bg-lunary-success-400',
  },
  friction: {
    label: 'Friction',
    icon: Mountain,
    border: 'border-lunary-rose-400/40',
    text: 'text-lunary-rose-300',
    bar: 'bg-lunary-rose-400',
  },
  pivot: {
    label: 'Pivot',
    icon: Sparkles,
    border: 'border-lunary-secondary-400/40',
    text: 'text-lunary-secondary-300',
    bar: 'bg-lunary-secondary-400',
  },
};

function formatRange(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T12:00:00Z`);
  const end = new Date(`${weekEnd}T12:00:00Z`);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startStr = start.toLocaleDateString(undefined, {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  });
  const endStr = end.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
  return `${startStr} – ${endStr}`;
}

function formatShortDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  });
}

function phaseFraction(name: string): number {
  // Maps a coarse phase name into a 0..1 fraction the MoonPhase SVG expects.
  const map: Record<string, number> = {
    'New Moon': 0,
    'Waxing Crescent': 0.125,
    'First Quarter': 0.25,
    'Waxing Gibbous': 0.375,
    'Full Moon': 0.5,
    'Waning Gibbous': 0.625,
    'Last Quarter': 0.75,
    'Waning Crescent': 0.875,
  };
  return map[name] ?? 0.5;
}

export interface WeeklyPageViewProps {
  page: WeeklyPage;
  ogImageHref?: string;
  /** Optional first name for personalised cover. */
  firstName?: string;
}

export function WeeklyPageView({
  page,
  ogImageHref,
  firstName,
}: WeeklyPageViewProps) {
  const dominantPhase = page.moonJourney.dominantPhase;
  const dominantFraction = phaseFraction(dominantPhase.name);
  const dominantWaxing = dominantPhase.trend === 'waxing';
  const dominantIllum = (dominantPhase.illumination ?? 50) / 100;

  // AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
  // const ritualNarration = useMemo(
  //   () =>
  //     `${page.headline}. ${page.summary} ${page.ritual.title}: ${page.ritual.body}`,
  //   [page.headline, page.summary, page.ritual.title, page.ritual.body],
  // );

  return (
    <main className='mx-auto w-full max-w-3xl px-4 py-6 md:py-10'>
      {/* ---------- Cover ---------- */}
      <section
        className={cn(
          'relative overflow-hidden rounded-3xl border border-stroke-default',
          'bg-gradient-to-br from-lunary-primary-900/60 via-lunary-secondary-900/40 to-lunary-accent-900/30',
          'px-6 py-10 md:px-10 md:py-14',
        )}
      >
        <div className='flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-content-muted'>
          <Calendar className='h-3.5 w-3.5' />
          {formatRange(page.weekStart, page.weekEnd)}
        </div>

        <Heading
          as='h1'
          variant='h1'
          className='mt-3 text-content-primary md:text-5xl'
        >
          {firstName
            ? `${firstName}, ${page.headline.toLowerCase()}`
            : page.headline}
        </Heading>

        {/* Hero, moon phase swap-in */}
        <div className='mt-8 flex items-center justify-center'>
          <svg
            viewBox='0 0 240 240'
            width={200}
            height={200}
            className='drop-shadow-[0_0_60px_rgba(199,125,255,0.35)]'
            aria-hidden='true'
          >
            <MoonPhase
              cx={120}
              cy={120}
              r={92}
              phase={dominantFraction}
              illumination={dominantIllum}
              waxing={dominantWaxing}
              fillLit='#f5edd1'
              fillDark='#1a1830'
            />
          </svg>
        </div>
        <p className='mt-3 text-center text-xs uppercase tracking-[0.2em] text-content-muted'>
          {dominantPhase.name} in {dominantPhase.sign}
        </p>

        {ogImageHref && (
          <div className='mt-6 flex justify-center'>
            <a
              href={ogImageHref}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-stroke-default',
                'bg-surface-elevated px-4 py-2 text-sm text-content-secondary',
                'transition-colors hover:text-content-primary',
              )}
            >
              <Share2 className='h-4 w-4' />
              Share this week
            </a>
          </div>
        )}
      </section>

      {/* ---------- Top transits ---------- */}
      <section className='mt-10'>
        <Heading as='h2' variant='h2'>
          Top three transits
        </Heading>
        {page.topTransits.length === 0 ? (
          <p className='text-sm text-content-secondary'>
            No tight personal transits this week, a steady stretch of sky.
          </p>
        ) : (
          <div className='grid gap-3 md:grid-cols-3'>
            {page.topTransits.map((t) => {
              const tone = TONE_META[t.tone];
              const ToneIcon = tone.icon;
              return (
                <article
                  key={`${t.transitPlanet}-${t.aspect}-${t.natalPlanet}`}
                  className={cn(
                    'flex flex-col gap-2 rounded-2xl border bg-surface-elevated p-4',
                    tone.border,
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em]',
                        tone.text,
                      )}
                    >
                      <ToneIcon className='h-3.5 w-3.5' />
                      {tone.label}
                    </span>
                    <span className='text-xs text-content-muted'>
                      {formatShortDay(t.peakDate)}
                    </span>
                  </div>
                  <Heading as='h3' variant='h3' className='!mb-0'>
                    {t.transitPlanet} {t.aspect.toLowerCase()} {t.natalPlanet}
                  </Heading>
                  <p className='text-sm text-content-secondary'>{t.blurb}</p>
                  <div className='mt-1 flex items-center gap-2 text-xs text-content-muted'>
                    <span
                      aria-hidden='true'
                      className={cn('h-1 w-10 rounded-full', tone.bar)}
                    />
                    {t.score} / 100 · {t.exactness.toFixed(2)}° orb
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- Day strip ---------- */}
      <section className='mt-10'>
        <Heading as='h2' variant='h2'>
          The week, day by day
        </Heading>
        <ol className='grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7'>
          {page.notableDays.map((d) => (
            <li
              key={d.date}
              className='flex flex-col gap-1 rounded-xl border border-stroke-default bg-surface-muted px-3 py-3'
            >
              <span className='text-xs uppercase tracking-widest text-content-muted'>
                {formatShortDay(d.date)}
              </span>
              <span className='text-xs text-content-secondary'>
                {d.oneLiner}
              </span>
              <span className='mt-auto text-[11px] text-content-muted'>
                {d.score > 0 ? `${d.score} / 100` : 'quiet'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Ritual card ---------- */}
      <section className='mt-10'>
        <Heading as='h2' variant='h2'>
          One ritual for the week
        </Heading>
        <article
          className={cn(
            'rounded-2xl border border-lunary-primary-400/30 bg-surface-elevated p-5',
            'shadow-[0_10px_30px_-10px_rgba(132,88,216,0.25)]',
          )}
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-lunary-primary-900/60 text-lunary-primary-300'>
                <Heart className='h-4 w-4' />
              </span>
              <Heading as='h3' variant='h3' className='!mb-0'>
                {page.ritual.title}
              </Heading>
            </div>
            {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
            {/* <AudioNarrator
              text={ritualNarration}
              title='Listen to your week'
              className='shrink-0'
            /> */}
          </div>
          <p className='mt-3 text-sm text-content-secondary'>
            {page.ritual.body}
          </p>
        </article>
      </section>

      {/* ---------- Summary ---------- */}
      <section className='mt-10 mb-12'>
        <Heading as='h2' variant='h2'>
          The week in a paragraph
        </Heading>
        <div className='rounded-2xl border border-stroke-default bg-surface-muted p-5'>
          <AutoLinkText
            as='p'
            className='text-base leading-relaxed text-content-secondary'
          >
            {page.summary}
          </AutoLinkText>
          {page.moonJourney.voidPeriods.length > 0 && (
            <ul className='mt-4 space-y-1 text-xs text-content-muted'>
              {page.moonJourney.voidPeriods.slice(0, 3).map((v) => (
                <li
                  key={`${v.date}-${v.description}`}
                  className='flex items-start gap-2'
                >
                  <Sun className='mt-0.5 h-3 w-3 shrink-0' />
                  <span>
                    {formatShortDay(v.date)}, {v.description}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
