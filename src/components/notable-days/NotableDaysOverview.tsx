'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Heart,
  Sparkles,
  BookOpen,
  MountainSnow,
  Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { InfoBottomSheet } from '@/components/ui/InfoBottomSheet';
import { cn } from '@/lib/utils';
import type {
  NotableDay,
  NotableDayTheme,
  NotableAspect,
} from '@/lib/notable-days/score';

const THEME_META: Record<
  NotableDayTheme,
  { label: string; icon: LucideIcon; barClass: string; textClass: string }
> = {
  career: {
    label: 'Career',
    icon: Sun,
    barClass: 'bg-lunary-accent-400',
    textClass: 'text-lunary-accent-300',
  },
  love: {
    label: 'Love',
    icon: Heart,
    barClass: 'bg-lunary-rose-400',
    textClass: 'text-lunary-rose-300',
  },
  healing: {
    label: 'Healing',
    icon: Sparkles,
    barClass: 'bg-lunary-success-400',
    textClass: 'text-lunary-success-300',
  },
  learning: {
    label: 'Learning',
    icon: BookOpen,
    barClass: 'bg-lunary-secondary-400',
    textClass: 'text-lunary-secondary-300',
  },
  structural: {
    label: 'Structural',
    icon: MountainSnow,
    barClass: 'bg-lunary-primary-400',
    textClass: 'text-lunary-primary-300',
  },
  general: {
    label: 'General',
    icon: Flame,
    barClass: 'bg-content-muted/60',
    textClass: 'text-content-muted',
  },
};

function formatDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function shortDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

type Props = {
  /** Optional pre-loaded data — pass to skip the fetch. */
  initialDays?: NotableDay[];
  initialTop5?: NotableDay[];
  /** Override the API endpoint (for SSR with persona, etc.). */
  endpoint?: string;
};

export function NotableDaysOverview({
  initialDays,
  initialTop5,
  endpoint = '/api/notable-days',
}: Props) {
  const [days, setDays] = useState<NotableDay[]>(initialDays ?? []);
  const [top5, setTop5] = useState<NotableDay[]>(initialTop5 ?? []);
  const [loading, setLoading] = useState(!initialDays);
  const [error, setError] = useState<string | null>(null);
  const [openDay, setOpenDay] = useState<NotableDay | null>(null);

  // If parent supplies initial data (or updated data), prefer that and skip the fetch.
  useEffect(() => {
    if (initialDays !== undefined) {
      setDays(initialDays);
      setTop5(initialTop5 ?? []);
      setLoading(false);
    }
  }, [initialDays, initialTop5]);

  useEffect(() => {
    if (initialDays !== undefined) return;
    let cancelled = false;
    setLoading(true);
    fetch(endpoint, { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success === false) {
          setError(json.error ?? 'Failed to load notable days');
          setDays([]);
          setTop5([]);
        } else {
          setDays(json.days ?? []);
          setTop5(json.top5 ?? []);
        }
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
    // Only run once on mount when no initial data — parent updates flow through the other effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxScore = useMemo(() => {
    const scores = days.map((d) => d.score);
    return scores.length ? Math.max(...scores, 1) : 1;
  }, [days]);

  return (
    <section className='rounded-2xl border border-stroke-default bg-surface-elevated p-5 shadow-sm'>
      <header className='mb-4 flex items-baseline justify-between gap-3'>
        <Heading as='h2' variant='h2'>
          Your Notable Days
        </Heading>
        <span className='text-xs text-content-muted'>
          Next {days.length || 90} days
        </span>
      </header>

      {error && (
        <p className='mb-4 rounded-lg border border-stroke-default bg-surface-muted px-3 py-2 text-sm text-content-secondary'>
          {error}
        </p>
      )}

      {/* Calendar strip — bar height = score, segment colour = theme */}
      <div className='mb-6'>
        <div
          className='flex h-20 items-end gap-[2px] overflow-x-auto pb-2'
          role='list'
          aria-label='Forward calendar of personally-impactful days'
        >
          {loading && days.length === 0
            ? Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className='h-2 w-1.5 shrink-0 rounded-sm bg-surface-muted'
                />
              ))
            : days.map((day, idx) => {
                const meta = THEME_META[day.theme];
                const heightPct = Math.max(
                  6,
                  Math.round((day.score / maxScore) * 100),
                );
                const isTop = top5.some((t) => t.date === day.date);
                return (
                  <motion.button
                    key={day.date}
                    type='button'
                    role='listitem'
                    onClick={() =>
                      day.score > 0 ? setOpenDay(day) : undefined
                    }
                    initial={{ scaleY: 0.2, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{
                      delay: Math.min(idx * 0.005, 0.4),
                      duration: 0.35,
                      ease: 'easeOut',
                    }}
                    style={{ height: `${heightPct}%` }}
                    className={cn(
                      'w-1.5 shrink-0 origin-bottom rounded-sm transition-opacity',
                      meta.barClass,
                      day.score === 0 && 'opacity-30',
                      isTop && 'ring-1 ring-offset-1 ring-lunary-accent-300',
                    )}
                    aria-label={`${formatDay(day.date)} — ${meta.label}, score ${day.score}`}
                    title={`${formatDay(day.date)} · ${meta.label} · ${day.score}`}
                  />
                );
              })}
        </div>
        <div className='mt-2 flex flex-wrap gap-3 text-xs text-content-muted'>
          {(
            ['career', 'love', 'healing', 'learning', 'structural'] as const
          ).map((theme) => {
            const Icon = THEME_META[theme].icon;
            return (
              <span key={theme} className='inline-flex items-center gap-1'>
                <Icon className={cn('h-3 w-3', THEME_META[theme].textClass)} />
                {THEME_META[theme].label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Ranked top 5 */}
      <div>
        <Heading as='h3' variant='h3'>
          Your Most Pivotal Days
        </Heading>
        {top5.length === 0 && !loading ? (
          <p className='text-sm text-content-secondary'>
            No standout days in this window — a steady stretch ahead.
          </p>
        ) : (
          <ol className='space-y-2'>
            {top5.map((day, idx) => {
              const meta = THEME_META[day.theme];
              const Icon = meta.icon;
              return (
                <li key={day.date}>
                  <button
                    type='button'
                    onClick={() => setOpenDay(day)}
                    className='group flex w-full items-start gap-3 rounded-xl border border-stroke-default bg-surface-default px-3 py-3 text-left transition-colors hover:border-lunary-accent-500 hover:bg-surface-muted'
                  >
                    <span
                      className={cn(
                        'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted',
                        meta.textClass,
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='flex items-baseline justify-between gap-2'>
                        <span className='truncate text-sm font-medium text-content-primary'>
                          {formatDay(day.date)}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 text-xs uppercase tracking-wide',
                            meta.textClass,
                          )}
                        >
                          {meta.label}
                        </span>
                      </span>
                      <span className='mt-0.5 block text-sm text-content-secondary'>
                        {day.oneLiner}
                      </span>
                    </span>
                    <span className='shrink-0 text-xs text-content-muted'>
                      #{idx + 1}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <InfoBottomSheet
        open={!!openDay}
        onClose={() => setOpenDay(null)}
        title={openDay ? formatDay(openDay.date) : ''}
        subtitle={openDay ? THEME_META[openDay.theme].label : undefined}
        accentColor={
          openDay ? THEME_META[openDay.theme].textClass : 'text-lunary-primary'
        }
        leading={
          openDay
            ? (() => {
                const Icon = THEME_META[openDay.theme].icon;
                return <Icon className='h-5 w-5' />;
              })()
            : null
        }
      >
        {openDay && (
          <div className='space-y-4'>
            <p className='text-sm text-content-secondary'>{openDay.oneLiner}</p>
            <div className='rounded-lg border border-stroke-default bg-surface-muted px-3 py-2 text-xs text-content-muted'>
              Personal-impact score · {openDay.score}/100
            </div>
            <div>
              <h4 className='mb-2 text-xs font-medium uppercase tracking-wide text-content-muted'>
                Aspects in play
              </h4>
              {openDay.topAspects.length === 0 ? (
                <p className='text-sm text-content-secondary'>
                  No tight aspects — a quiet day.
                </p>
              ) : (
                <ul className='space-y-2'>
                  {openDay.topAspects.map((a: NotableAspect) => (
                    <li
                      key={`${a.transitPlanet}-${a.aspect}-${a.natalPlanet}`}
                      className='flex items-baseline justify-between gap-2 rounded-lg border border-stroke-default bg-surface-default px-3 py-2'
                    >
                      <span className='text-sm text-content-primary'>
                        Transit {a.transitPlanet}{' '}
                        <span className='text-content-muted'>{a.aspect}</span>{' '}
                        natal {a.natalPlanet}
                      </span>
                      <span className='shrink-0 text-xs text-content-muted'>
                        {a.exactness.toFixed(2)}° orb
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className='text-xs text-content-muted'>
              {shortDay(openDay.date)} · transits sampled at noon UTC.
            </p>
          </div>
        )}
      </InfoBottomSheet>
    </section>
  );
}

export default NotableDaysOverview;
