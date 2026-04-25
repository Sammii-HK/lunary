'use client';

/**
 * Time Machine — pick a date and a life-event label and see what the sky
 * looked like that day. Renders the resulting chart with `<BirthChart>` and
 * a small narrative panel of the most striking aspects.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Lock, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { BirthChart } from '@/components/BirthChart';
import { SnapshotShareButton } from '@/components/charts/SnapshotShareButton';
import {
  CityPicker,
  type CityPickerValue,
} from '@/components/charts/CityPicker';
import { Heading } from '@/components/ui/Heading';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

const STORAGE_KEY = 'lunary:time-machine-events';

type SavedEvent = {
  id: string;
  date: string;
  time: string;
  label: string;
  createdAt: number;
};

type PlanetaryPositionsResponse = {
  ok?: boolean;
  data?: {
    date?: string;
    planets?: Array<{
      planet: string;
      longitude: number;
      sign?: string;
      degree?: number;
      minutes?: number;
      retrograde?: boolean;
    }>;
  };
};

const SIGN_NAMES = [
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
] as const;

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function signFromLongitude(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  return SIGN_NAMES[Math.floor(norm / 30)];
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(iso: string): string {
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

function generateLocalId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const ASPECT_DEFS = [
  {
    name: 'Conjunction',
    angle: 0,
    orb: 6,
    blurb: 'fused — same energy, amplified',
    color: '#C77DFF',
  },
  {
    name: 'Opposition',
    angle: 180,
    orb: 6,
    blurb: 'tension — two forces pulling apart',
    color: '#ffd6a3',
  },
  {
    name: 'Trine',
    angle: 120,
    orb: 5,
    blurb: 'flow — easy, supportive current',
    color: '#7BFFB8',
  },
  {
    name: 'Square',
    angle: 90,
    orb: 5,
    blurb: 'friction — pressure that demands action',
    color: '#f87171',
  },
  {
    name: 'Sextile',
    angle: 60,
    orb: 3,
    blurb: 'opportunity — gentle invitation',
    color: '#94d1ff',
  },
] as const;

type AspectRow = {
  key: string;
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  color: string;
  blurb: string;
};

function computeStrongestAspects(
  placements: BirthChartData[],
  limit = 5,
): AspectRow[] {
  const rows: AspectRow[] = [];
  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      const a = placements[i];
      const b = placements[j];
      let diff = Math.abs(a.eclipticLongitude - b.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;
      for (const aspect of ASPECT_DEFS) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          rows.push({
            key: `${a.body}-${b.body}-${aspect.name}`,
            planet1: a.body,
            planet2: b.body,
            type: aspect.name,
            orb,
            color: aspect.color,
            blurb: aspect.blurb,
          });
          break;
        }
      }
    }
  }
  rows.sort((a, b) => a.orb - b.orb);
  return rows.slice(0, limit);
}

function placementsFromResponse(
  data: PlanetaryPositionsResponse | null,
): BirthChartData[] {
  if (!data?.data?.planets) return [];
  return data.data.planets
    .map((p) => {
      const longitude = Number(p.longitude);
      if (!Number.isFinite(longitude)) return null;
      const sign = p.sign ?? signFromLongitude(longitude);
      return {
        body: capitalize(p.planet),
        sign,
        degree: Number(p.degree ?? Math.floor(longitude % 30)),
        minute: Number(p.minutes ?? 0),
        eclipticLongitude: ((longitude % 360) + 360) % 360,
        retrograde: Boolean(p.retrograde),
      } as BirthChartData;
    })
    .filter((p): p is BirthChartData => Boolean(p));
}

const TimeMachinePage = () => {
  const { user } = useUser();
  const sub = useSubscription();
  const searchParams = useSearchParams();
  const canAccess = sub.hasAccess('personalized_transit_readings');
  const userLat = user?.location?.latitude;
  const userLon = user?.location?.longitude;
  const userBirthLocation = (user?.location as any)?.birthLocation as
    | string
    | undefined;
  const [date, setDate] = useState<string>(todayIso);
  const [time, setTime] = useState<string>('12:00');
  const [location, setLocation] = useState<CityPickerValue | null>(null);
  const [label, setLabel] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartPlacements, setChartPlacements] = useState<BirthChartData[]>([]);
  const [activeEvent, setActiveEvent] = useState<{
    date: string;
    time: string;
    label: string;
  } | null>(null);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const autoSubmittedRef = useRef(false);

  // Hydrate location defaults + saved events from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (
      !location &&
      typeof userLat === 'number' &&
      typeof userLon === 'number'
    ) {
      setLocation({
        lat: userLat,
        lon: userLon,
        label: userBirthLocation || 'Your saved location',
      });
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedEvents(
            parsed
              .filter(
                (e): e is SavedEvent =>
                  e &&
                  typeof e.id === 'string' &&
                  typeof e.date === 'string' &&
                  typeof e.label === 'string',
              )
              .slice(0, 50),
          );
        }
      }
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLon, userBirthLocation]);

  const persistEvents = useCallback((events: SavedEvent[]) => {
    setSavedEvents(events);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      /* noop */
    }
  }, []);

  const fetchChart = useCallback(
    async (next: { date: string; time: string; label: string }) => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/astrology/planetary-positions?date=${encodeURIComponent(
            next.date,
          )}`,
          { cache: 'no-store', credentials: 'include' },
        );
        if (!res.ok) {
          let reason = res.statusText || 'request failed';
          try {
            const errBody = (await res.json()) as { error?: string };
            if (errBody?.error) reason = errBody.error;
          } catch {
            /* ignore non-JSON errors */
          }
          throw new Error(
            `Couldn’t load the sky for ${next.date} — ${res.status} ${reason}`,
          );
        }
        const json = (await res.json()) as PlanetaryPositionsResponse;
        const placements = placementsFromResponse(json);
        if (!placements.length) {
          throw new Error(
            `No planetary data returned for ${next.date}. Try a different date.`,
          );
        }
        setChartPlacements(placements);
        setActiveEvent(next);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Try again.',
        );
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  // Deep-link support: prefill (and optionally auto-submit) from `?date=` and
  // `?label=`. Useful for emails, share cards, journal-entry CTAs, etc.
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    if (!searchParams) return;
    const qpDate = searchParams.get('date');
    const qpLabel = searchParams.get('label');
    if (!qpDate && !qpLabel) return;

    const isoLike = /^\d{4}-\d{2}-\d{2}$/.test(qpDate || '');
    if (qpDate && isoLike) setDate(qpDate);
    if (qpLabel) setLabel(qpLabel.slice(0, 60));

    if (qpDate && isoLike) {
      autoSubmittedRef.current = true;
      void fetchChart({
        date: qpDate,
        time: '12:00',
        label: (qpLabel || '').slice(0, 60).trim(),
      });
    }
  }, [searchParams, fetchChart]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = label.trim();
      if (!date) return;
      const next = { date, time: time || '12:00', label: trimmed };
      await fetchChart(next);
      // Save into local list (deduped by date+label)
      setSavedEvents((prev) => {
        const filtered = prev.filter(
          (entry) => !(entry.date === next.date && entry.label === next.label),
        );
        const merged: SavedEvent[] = [
          {
            id: generateLocalId(),
            date: next.date,
            time: next.time,
            label: next.label,
            createdAt: Date.now(),
          },
          ...filtered,
        ].slice(0, 50);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          /* noop */
        }
        return merged;
      });
    },
    [date, fetchChart, label, time],
  );

  const reopenEvent = useCallback(
    (event: SavedEvent) => {
      setDate(event.date);
      setTime(event.time || '12:00');
      setLabel(event.label);
      void fetchChart({
        date: event.date,
        time: event.time || '12:00',
        label: event.label,
      });
    },
    [fetchChart],
  );

  const removeEvent = useCallback(
    (id: string) => {
      persistEvents(savedEvents.filter((e) => e.id !== id));
    },
    [persistEvents, savedEvents],
  );

  const aspects = useMemo(
    () => computeStrongestAspects(chartPlacements),
    [chartPlacements],
  );

  const chartUrl = useMemo(() => {
    if (!activeEvent) return null;
    const params = new URLSearchParams({
      date: activeEvent.date,
      format: 'square',
    });
    if (activeEvent.time) params.set('time', activeEvent.time);
    if (activeEvent.label) params.set('event', activeEvent.label);
    if (location) {
      params.set('lat', String(location.lat));
      params.set('lon', String(location.lon));
    }
    return `/api/og/share/birth-chart?${params.toString()}`;
  }, [activeEvent, location]);

  const headline = activeEvent?.label
    ? `The sky on ${activeEvent.label}`
    : activeEvent?.date
      ? `The sky on ${formatDateLabel(activeEvent.date)}`
      : 'The sky that day';

  if (!sub.loading && !canAccess) {
    return (
      <div className='h-full overflow-auto' data-testid='time-machine-paywall'>
        <div className='mx-auto flex w-full max-w-xl flex-col gap-6 p-4 pb-24'>
          <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/80 p-6 backdrop-blur'>
            <div className='flex items-center gap-2 text-content-primary'>
              <Lock className='h-5 w-5 text-lunary-accent' />
              <Heading as='h1' variant='h1'>
                Time Machine
              </Heading>
            </div>
            <p className='mt-3 text-sm text-content-secondary'>
              See the sky on any date in your life — first kiss, big move, the
              day everything shifted. Time Machine is part of Lunary Plus.
            </p>
            <Link
              href='/pricing?nav=app'
              className='mt-5 inline-flex items-center gap-2 rounded-full bg-lunary-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-lunary-accent/90'
            >
              <Sparkles className='h-4 w-4' />
              Unlock Time Machine
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-auto' data-testid='time-machine-page'>
      <div className='mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-24 sm:max-w-3xl md:max-w-4xl'>
        {/* Top header + share */}
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <Heading as='h1' variant='h1' className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-lunary-accent' />
              Time Machine
            </Heading>
            <p className='mt-1 text-sm text-content-secondary'>
              Pick a date and a moment in your life. See the sky that day, and
              what was lighting up.
            </p>
          </div>
          {chartUrl && (
            <SnapshotShareButton
              chartUrl={chartUrl}
              label={activeEvent?.label}
              dateLabel={
                activeEvent?.date
                  ? formatDateLabel(activeEvent.date)
                  : undefined
              }
            />
          )}
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className='flex flex-col gap-3 rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-4 backdrop-blur'
        >
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <label className='flex flex-col gap-1 text-xs text-content-muted'>
              <span className='font-semibold uppercase tracking-wider'>
                Date
              </span>
              <input
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayIso()}
                required
                className='rounded-lg border border-stroke-subtle bg-layer-base/40 px-3 py-2 text-sm text-content-primary focus:border-lunary-primary focus:outline-none'
              />
            </label>
            <label className='flex flex-col gap-1 text-xs text-content-muted'>
              <span className='font-semibold uppercase tracking-wider'>
                Time (optional)
              </span>
              <input
                type='time'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className='rounded-lg border border-stroke-subtle bg-layer-base/40 px-3 py-2 text-sm text-content-primary focus:border-lunary-primary focus:outline-none'
              />
            </label>
          </div>

          <label className='flex flex-col gap-1 text-xs text-content-muted'>
            <span className='font-semibold uppercase tracking-wider'>
              What happened?
            </span>
            <input
              type='text'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. my breakup, first day at the new job, met them'
              maxLength={60}
              className='rounded-lg border border-stroke-subtle bg-layer-base/40 px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:border-lunary-primary focus:outline-none'
            />
          </label>

          <CityPicker
            value={location}
            onChange={setLocation}
            label='Location (optional)'
            placeholder='Search a city — e.g. London, New York, Tokyo'
          />
          <p className='-mt-1 text-[11px] text-content-muted'>
            Used to colour the share card. Planet positions don’t change with
            location, just the houses (coming soon).
          </p>

          <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
            <p className='text-[11px] text-content-muted'>
              We&apos;ll show the planetary positions for that day — your event
              label is just for you.
            </p>
            <motion.button
              type='submit'
              whileTap={{ scale: 0.96 }}
              disabled={submitting || !date}
              className='inline-flex items-center gap-2 rounded-full bg-lunary-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(138,107,255,0.45)] transition-opacity disabled:opacity-50'
            >
              <Wand2 className='h-4 w-4' />
              {submitting ? 'Reading the sky…' : 'Show me'}
            </motion.button>
          </div>

          {error && (
            <p className='text-xs text-red-300' role='alert'>
              {error}
            </p>
          )}
        </motion.form>

        {/* Chart + narrative */}
        <AnimatePresence mode='wait'>
          {chartPlacements.length > 0 && activeEvent && (
            <motion.section
              key={`${activeEvent.date}-${activeEvent.label}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className='flex flex-col gap-4'
            >
              <BirthChart
                birthChart={chartPlacements}
                userName={headline}
                birthDate={activeEvent.date}
                showAspects
                aspectFilter='all'
                showAsteroids={false}
                showPoints={false}
              />

              {/* Narrative panel */}
              <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-4'>
                <Heading
                  as='h2'
                  variant='h3'
                  className='mb-2 flex items-center gap-2'
                >
                  <Sparkles className='h-4 w-4 text-lunary-accent' />
                  What was lighting up
                </Heading>
                {aspects.length === 0 ? (
                  <p className='text-xs text-content-muted'>
                    No tight major aspects on this day — the sky was relatively
                    quiet.
                  </p>
                ) : (
                  <ul className='flex flex-col gap-2'>
                    {aspects.map((a) => (
                      <li
                        key={a.key}
                        className='flex flex-wrap items-center gap-2 rounded-lg border border-stroke-subtle/70 bg-layer-base/30 px-3 py-2 text-xs'
                      >
                        <span
                          className='rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider'
                          style={{
                            backgroundColor: `${a.color}1f`,
                            color: a.color,
                            border: `1px solid ${a.color}55`,
                          }}
                        >
                          {a.type}
                        </span>
                        <span className='font-semibold text-content-primary'>
                          {a.planet1} → {a.planet2}
                        </span>
                        <span className='text-content-muted'>
                          {a.orb.toFixed(1)}° orb
                        </span>
                        <span className='basis-full text-content-secondary'>
                          {a.blurb}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Saved events */}
        <section className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <Heading as='h2' variant='h3' className='mb-0'>
              Your saved moments
            </Heading>
            <span className='text-[11px] text-content-muted'>
              Stored on this device
            </span>
          </div>
          {savedEvents.length === 0 ? (
            <div className='flex items-center gap-2 rounded-xl border border-dashed border-stroke-subtle bg-surface-elevated/40 px-4 py-6 text-xs text-content-muted'>
              <Plus className='h-4 w-4' />
              No moments yet. Pick a date above to get started.
            </div>
          ) : (
            <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {savedEvents.map((event) => {
                const isActive =
                  activeEvent?.date === event.date &&
                  activeEvent?.label === event.label;
                return (
                  <li key={event.id}>
                    <div
                      className={`flex items-center justify-between gap-2 rounded-xl border bg-surface-elevated/50 p-3 text-left transition-colors ${
                        isActive
                          ? 'border-lunary-primary/60 ring-1 ring-lunary-primary/40'
                          : 'border-stroke-subtle hover:border-lunary-primary/40'
                      }`}
                    >
                      <button
                        type='button'
                        onClick={() => reopenEvent(event)}
                        className='flex flex-1 flex-col gap-0.5 text-left'
                      >
                        <span className='text-sm font-semibold text-content-primary'>
                          {event.label || 'Untitled moment'}
                        </span>
                        <span className='text-[11px] text-content-muted'>
                          {formatDateLabel(event.date)}
                          {event.time && event.time !== '12:00'
                            ? ` · ${event.time}`
                            : ''}
                        </span>
                      </button>
                      <button
                        type='button'
                        onClick={() => removeEvent(event.id)}
                        className='rounded-full border border-stroke-subtle p-1.5 text-content-muted transition-colors hover:border-red-400/40 hover:text-red-300'
                        aria-label={`Remove ${event.label || event.date}`}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default TimeMachinePage;
