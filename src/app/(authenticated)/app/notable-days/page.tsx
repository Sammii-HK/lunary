'use client';

import { useEffect, useState } from 'react';
import {
  Sun,
  Heart,
  Sparkles,
  BookOpen,
  MountainSnow,
  Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { Heading } from '@/components/ui/Heading';
import { NotableDaysOverview } from '@/components/notable-days/NotableDaysOverview';
import { cn } from '@/lib/utils';
import type { NotableDay, NotableDayTheme } from '@/lib/notable-days/score';

const THEME_ICON: Record<NotableDayTheme, LucideIcon> = {
  career: Sun,
  love: Heart,
  healing: Sparkles,
  learning: BookOpen,
  structural: MountainSnow,
  general: Flame,
};

const THEME_LABEL: Record<NotableDayTheme, string> = {
  career: 'Career',
  love: 'Love',
  healing: 'Healing',
  learning: 'Learning',
  structural: 'Structural',
  general: 'General',
};

const THEME_TINT: Record<NotableDayTheme, string> = {
  career: 'text-lunary-accent-300',
  love: 'text-lunary-rose-300',
  healing: 'text-lunary-success-300',
  learning: 'text-lunary-secondary-300',
  structural: 'text-lunary-primary-300',
  general: 'text-content-muted',
};

function formatLong(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function buildWalkthrough(day: NotableDay): string {
  if (day.topAspects.length === 0) {
    return `${formatLong(day.date)} reads as quiet, no tight aspects to your natal chart.`;
  }
  const lines: string[] = [];
  lines.push(
    `${formatLong(day.date)} stands out as a ${THEME_LABEL[day.theme].toLowerCase()} day.`,
  );
  lines.push(day.oneLiner);
  if (day.topAspects.length > 1) {
    const others = day.topAspects
      .slice(1)
      .map(
        (a) =>
          `transit ${a.transitPlanet} ${a.aspect.toLowerCase()} natal ${a.natalPlanet}`,
      )
      .join(', and ');
    lines.push(`Underneath, ${others}.`);
  }
  lines.push(`Personal-impact score lands at ${day.score} out of 100.`);
  return lines.join(' ');
}

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// function buildNarration(top5: NotableDay[]): string {
//   if (top5.length === 0) {
//     return 'Your next ninety days look steady. No standout transits are landing on your natal chart in this window.';
//   }
//   const intro =
//     'Here are your most pivotal days in the next ninety. Each one is scored by how directly the transits hit your own chart, most days are quiet, a few burn bright.';
//   const lines = top5.map((d, i) => `Day ${i + 1}: ${buildWalkthrough(d)}`);
//   return [intro, ...lines].join(' ');
// }

export default function NotableDaysPage() {
  const [days, setDays] = useState<NotableDay[]>([]);
  const [top5, setTop5] = useState<NotableDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/notable-days', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success === false) {
          setError(json.error ?? 'Failed to load notable days');
        }
        setDays(json.days ?? []);
        setTop5(json.top5 ?? []);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load notable days');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
  // const narrationText = buildNarration(top5);

  return (
    <main className='mx-auto w-full max-w-3xl px-4 py-6 md:py-10'>
      <header className='mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          <Heading as='h1' variant='h1'>
            Notable Days
          </Heading>
          <p className='mt-2 text-sm text-content-secondary md:max-w-xl'>
            Your most pivotal days in the next three months, scored by which
            transits land on your natal chart, and sorted by life area.
          </p>
        </div>
        {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
        {/* <AudioNarrator
          text={narrationText}
          title='Notable days walkthrough'
          className='shrink-0'
        /> */}
      </header>

      <NotableDaysOverview
        initialDays={loading ? undefined : days}
        initialTop5={loading ? undefined : top5}
      />

      <section className='mt-8'>
        <Heading as='h2' variant='h2'>
          Walkthrough
        </Heading>
        {loading && top5.length === 0 ? (
          <p className='text-sm text-content-secondary'>
            Reading your chart against the next ninety days...
          </p>
        ) : error ? (
          <p className='text-sm text-content-secondary'>{error}</p>
        ) : top5.length === 0 ? (
          <p className='text-sm text-content-secondary'>
            No standout days in this window. A steady stretch ahead.
          </p>
        ) : (
          <ol className='space-y-4'>
            {top5.map((day, idx) => {
              const Icon = THEME_ICON[day.theme];
              return (
                <li
                  key={day.date}
                  className='rounded-2xl border border-stroke-default bg-surface-elevated p-4'
                >
                  <div className='mb-2 flex items-center gap-2'>
                    <span
                      className={cn(
                        'inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted',
                        THEME_TINT[day.theme],
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </span>
                    <Heading as='h3' variant='h3' className='!mb-0'>
                      Day {idx + 1} · {formatLong(day.date)}
                    </Heading>
                  </div>
                  <p className='text-sm text-content-secondary'>
                    {buildWalkthrough(day)}
                  </p>
                  {day.topAspects.length > 0 && (
                    <ul className='mt-3 space-y-1 text-xs text-content-muted'>
                      {day.topAspects.map((a) => (
                        <li
                          key={`${a.transitPlanet}-${a.aspect}-${a.natalPlanet}`}
                        >
                          Transit {a.transitPlanet} {a.aspect.toLowerCase()}{' '}
                          natal {a.natalPlanet} · {a.exactness.toFixed(2)}° orb
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
