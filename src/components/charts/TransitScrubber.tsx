'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { bodiesSymbols, zodiacSymbol } from '@/constants/symbols';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import { useSubscription } from '@/hooks/useSubscription';
import { CosmicBackdrop } from '@/components/charts/CosmicBackdrop';
import {
  MoonPhase,
  illuminationFromLongitudes,
} from '@/components/charts/MoonPhase';
import {
  TRANSIT_BODIES,
  useEphemerisRange,
  sampleEphemeris,
  type BodyName,
  type EphemerisSnapshot,
} from '@/components/charts/useEphemerisRange';

const ELEMENT_COLORS = {
  Fire: '#ff6b6b',
  Earth: '#6b8e4e',
  Air: '#5dade2',
  Water: '#9b59b6',
} as const;
const SIGN_ELEMENTS: Record<string, keyof typeof ELEMENT_COLORS> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};
const signFromLongitude = (lon: number) => {
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
};

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 6, color: '#C77DFF' },
  { name: 'Opposition', angle: 180, orb: 6, color: '#ffd6a3' },
  { name: 'Trine', angle: 120, orb: 5, color: '#7BFFB8' },
  { name: 'Square', angle: 90, orb: 5, color: '#f87171' },
  { name: 'Sextile', angle: 60, orb: 3, color: '#94d1ff' },
] as const;

function symbolFor(body: string) {
  const k = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof bodiesSymbols;
  return bodiesSymbols[k] || body.charAt(0);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

const SPEEDS = [
  { label: '1d/s', msPerSec: 24 * 3600 * 1000 },
  { label: '1w/s', msPerSec: 7 * 24 * 3600 * 1000 },
  { label: '1mo/s', msPerSec: 30 * 24 * 3600 * 1000 },
] as const;

type Props = {
  birthChart: BirthChartData[];
  compact?: boolean;
  onOpenFull?: () => void;
};

export function TransitScrubber({
  birthChart,
  compact = false,
  onOpenFull,
}: Props) {
  const sub = useSubscription();
  const canScrub = sub.hasAccess('personalized_transit_readings');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);
  const [now, setNow] = useState(today.getTime());
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);

  const rangeStart = useMemo(
    () => new Date(today.getTime() - 180 * 86400000),
    [today],
  );
  const rangeEnd = useMemo(
    () => new Date(today.getTime() + 365 * 86400000),
    [today],
  );

  const { range, progress } = useEphemerisRange({
    enabled: true,
    start: rangeStart,
    end: rangeEnd,
    stepDays: compact ? 7 : 2,
  });

  const snapshot: EphemerisSnapshot | null = range
    ? sampleEphemeris(range, now)
    : null;

  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number>(0);
  const lastTickTs = useRef<number>(0);
  useEffect(() => {
    if (!playing) return;
    lastTs.current = performance.now();
    lastTickTs.current = lastTs.current;
    const speed = SPEEDS[speedIdx].msPerSec;
    // Throttle commits to ~16fps (62ms). The motion-spring layer interpolates
    // smoothly between commits, so the visual stays buttery without re-running
    // ephemeris sampling + aspect math on every animation frame.
    const COMMIT_INTERVAL_MS = 62;
    const loop = (ts: number) => {
      const dt = ts - lastTs.current;
      lastTs.current = ts;
      if (ts - lastTickTs.current >= COMMIT_INTERVAL_MS) {
        lastTickTs.current = ts;
        setNow((n) => {
          const next = n + (dt / 1000) * speed;
          if (next > rangeEnd.getTime()) {
            setPlaying(false);
            return rangeEnd.getTime();
          }
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speedIdx, rangeEnd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canScrub) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === 'ArrowLeft') {
        setNow((n) => Math.max(rangeStart.getTime(), n - 86400000));
      } else if (e.key === 'ArrowRight') {
        setNow((n) => Math.min(rangeEnd.getTime(), n + 86400000));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canScrub, rangeStart, rangeEnd]);

  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const ascLon = ascendant ? ascendant.eclipticLongitude : 0;

  const polar = (lon: number, radius: number) => {
    const adjusted = (lon - ascLon + 360) % 360;
    const angle = (180 + adjusted) % 360;
    const rad = (angle * Math.PI) / 180;
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
  };

  const natalPlanets = useMemo(
    () =>
      birthChart
        .filter((p) => TRANSIT_BODIES.includes(p.body as BodyName))
        .map((p) => ({
          name: p.body as BodyName,
          longitude: p.eclipticLongitude,
          retrograde: p.retrograde,
        })),
    [birthChart],
  );

  type KeyDate = {
    time: number;
    type: 'retrograde' | 'direct' | 'ingress' | 'exact';
    label: string;
    color: string;
  };

  const keyDates = useMemo<KeyDate[]>(() => {
    if (!range) return [];
    const out: KeyDate[] = [];
    const snaps = range.snapshots;
    const SLOW_BODIES: BodyName[] = [
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
    ];
    for (let i = 1; i < snaps.length; i++) {
      const a = snaps[i - 1];
      const b = snaps[i];
      for (const name of SLOW_BODIES) {
        if (a.retrograde[name] !== b.retrograde[name]) {
          out.push({
            time: b.time,
            type: b.retrograde[name] ? 'retrograde' : 'direct',
            label: `${name} ${b.retrograde[name] ? 'retrograde' : 'direct'}`,
            color: b.retrograde[name] ? '#f87171' : '#7BFFB8',
          });
        }
        const aSign = Math.floor(
          (((a.longitudes[name] % 360) + 360) % 360) / 30,
        );
        const bSign = Math.floor(
          (((b.longitudes[name] % 360) + 360) % 360) / 30,
        );
        if (aSign !== bSign) {
          out.push({
            time: b.time,
            type: 'ingress',
            label: `${name} → ${signFromLongitude(b.longitudes[name])}`,
            color: '#C77DFF',
          });
        }
      }
    }
    return out.slice(0, 50);
  }, [range]);

  const transitMoonPhase = useMemo(() => {
    if (!snapshot) return null;
    return illuminationFromLongitudes(
      snapshot.longitudes.Sun,
      snapshot.longitudes.Moon,
    );
  }, [snapshot]);

  const [anchorTime, setAnchorTime] = useState<number | null>(null);
  const anchorSnapshot: EphemerisSnapshot | null =
    range && anchorTime ? sampleEphemeris(range, anchorTime) : null;

  type Trail = { lon: number; t: number };
  const trailsRef = useRef<Record<BodyName, Trail[]>>({
    Sun: [],
    Moon: [],
    Mercury: [],
    Venus: [],
    Mars: [],
    Jupiter: [],
    Saturn: [],
    Uranus: [],
    Neptune: [],
    Pluto: [],
  });
  const [trailVersion, setTrailVersion] = useState(0);

  useEffect(() => {
    if (!playing || !snapshot) return;
    const trails = trailsRef.current;
    const MAX = 10;
    for (const name of TRANSIT_BODIES) {
      const lon = snapshot.longitudes[name];
      const arr = trails[name];
      const last = arr[arr.length - 1];
      if (!last || Math.abs(lon - last.lon) > 0.05) {
        arr.push({ lon, t: snapshot.time });
        if (arr.length > MAX) arr.shift();
      }
    }
    setTrailVersion((v) => v + 1);
  }, [snapshot, playing]);

  useEffect(() => {
    if (!playing) {
      const trails = trailsRef.current;
      for (const name of TRANSIT_BODIES) trails[name] = [];
      setTrailVersion((v) => v + 1);
    }
  }, [playing]);

  const transitPositions = useMemo(() => {
    if (!snapshot) return [];
    return TRANSIT_BODIES.map((name) => ({
      name,
      longitude: snapshot.longitudes[name],
      retrograde: snapshot.retrograde[name],
    }));
  }, [snapshot]);

  const liveAspects = useMemo(() => {
    if (!snapshot) return [];
    type Row = {
      key: string;
      transit: BodyName;
      natal: BodyName;
      natalLon: number;
      transitLon: number;
      type: string;
      color: string;
      orb: number;
    };
    const rows: Row[] = [];
    for (const transit of TRANSIT_BODIES) {
      const tLon = snapshot.longitudes[transit];
      for (const natal of natalPlanets) {
        if (!TRANSIT_BODIES.includes(natal.name)) continue;
        let diff = Math.abs(tLon - natal.longitude);
        if (diff > 180) diff = 360 - diff;
        for (const a of ASPECTS) {
          const orb = Math.abs(diff - a.angle);
          if (orb <= a.orb) {
            rows.push({
              key: `${transit}-${natal.name}-${a.name}`,
              transit,
              natal: natal.name,
              natalLon: natal.longitude,
              transitLon: tLon,
              type: a.name,
              color: a.color,
              orb,
            });
            break;
          }
        }
      }
    }
    return rows;
  }, [snapshot, natalPlanets]);

  const NATAL_R = 64;
  const TRANSIT_R = 104;
  const GLYPH_NATAL_R = 80;
  const GLYPH_TRANSIT_R = 118;

  const zodiacSigns = useMemo(() => {
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
    return signs.map((s, i) => {
      const mid = i * 30 + 15;
      return { sign: s, ...polar(mid, 135) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ascLon]);

  const trackFrac = Math.max(
    0,
    Math.min(
      1,
      (now - rangeStart.getTime()) /
        (rangeEnd.getTime() - rangeStart.getTime()),
    ),
  );

  const handleTrackInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canScrub) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const frac = x / rect.width;
    setNow(
      rangeStart.getTime() + frac * (rangeEnd.getTime() - rangeStart.getTime()),
    );
  };

  const wheelSize = compact ? 260 : 340;

  return (
    <div className='w-full max-w-3xl mx-auto'>
      {!compact && (
        <div className='flex items-center justify-between mb-3'>
          <div>
            <h2 className='text-lg md:text-xl font-bold text-content-primary'>
              Today&apos;s Sky
            </h2>
            <p className='text-xs text-content-muted mt-0.5'>
              Natal chart inside. Transits outside. Drag the timeline to travel
              through time.
            </p>
          </div>
          {!canScrub && (
            <span className='inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-200'>
              <Lock className='h-3 w-3' />
              Plus unlocks time travel
            </span>
          )}
        </div>
      )}

      <div
        className='relative w-full mx-auto aspect-square'
        style={{ maxWidth: wheelSize }}
      >
        <svg
          viewBox='-140 -140 280 280'
          className='w-full h-full'
          role='img'
          aria-label='Animated transit chart'
        >
          <defs>
            <radialGradient id='transit-sun' cx='50%' cy='50%' r='50%'>
              <motion.stop
                offset='0%'
                animate={{ stopColor: ['#ffe9a8', '#ffd76a', '#ffe9a8'] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.stop
                offset='100%'
                animate={{ stopColor: ['#ff7a45', '#ff5a2c', '#ff7a45'] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </radialGradient>
          </defs>

          <CosmicBackdrop seed={42} />

          {/* Ring boundaries */}
          <circle
            cx='0'
            cy='0'
            r='130'
            fill='none'
            stroke='#52525b'
            strokeWidth='0.5'
            opacity='0.5'
          />
          <circle
            cx='0'
            cy='0'
            r='92'
            fill='none'
            stroke='#52525b'
            strokeWidth='0.5'
            opacity='0.4'
          />
          <circle
            cx='0'
            cy='0'
            r='58'
            fill='none'
            stroke='#52525b'
            strokeWidth='0.5'
            opacity='0.3'
          />

          {/* Zodiac sector tints */}
          {zodiacSigns.map(({ sign }, i) => {
            const startMid = (i * 30 - ascLon + 360) % 360;
            const endMid = ((i + 1) * 30 - ascLon + 360) % 360;
            const a1 = (((180 + startMid) % 360) * Math.PI) / 180;
            const a2 = (((180 + endMid) % 360) * Math.PI) / 180;
            const sweep = (endMid - startMid + 360) % 360 > 180 ? 1 : 0;
            const rOuter = 130,
              rInner = 92;
            const el = SIGN_ELEMENTS[sign];
            const color = ELEMENT_COLORS[el];
            const x1 = Math.cos(a1) * rOuter,
              y1 = Math.sin(a1) * rOuter;
            const x2 = Math.cos(a2) * rOuter,
              y2 = Math.sin(a2) * rOuter;
            const x3 = Math.cos(a2) * rInner,
              y3 = Math.sin(a2) * rInner;
            const x4 = Math.cos(a1) * rInner,
              y4 = Math.sin(a1) * rInner;
            return (
              <path
                key={`sector-${i}`}
                d={`M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${sweep} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${sweep} 0 ${x4} ${y4} Z`}
                fill={color}
                opacity='0.08'
              />
            );
          })}

          {/* Sign dividers */}
          {Array.from({ length: 12 }, (_, i) => {
            const lon = i * 30;
            const p1 = polar(lon, 58);
            const p2 = polar(lon, 130);
            return (
              <line
                key={`div-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke='#52525b'
                strokeWidth='0.4'
                opacity='0.4'
              />
            );
          })}

          {/* Zodiac glyphs */}
          {zodiacSigns.map(({ sign, x, y }) => (
            <text
              key={sign}
              x={x}
              y={y}
              textAnchor='middle'
              dominantBaseline='central'
              className='font-astro'
              fontSize='10'
              fill={ELEMENT_COLORS[SIGN_ELEMENTS[sign]]}
              opacity='0.95'
            >
              {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
            </text>
          ))}

          {/* Aspect lines between transit & natal */}
          <AnimatePresence>
            {liveAspects.map((a) => {
              const n = polar(a.natalLon, NATAL_R);
              const t = polar(a.transitLon, TRANSIT_R);
              const tight = a.orb < 1;
              return (
                <motion.g key={a.key}>
                  {tight && (
                    <motion.line
                      x1={n.x}
                      y1={n.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={a.color}
                      strokeWidth={3}
                      strokeLinecap='round'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.1, 0.28, 0.1] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ filter: 'blur(2px)' }}
                    />
                  )}
                  <motion.line
                    x1={n.x}
                    y1={n.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={a.color}
                    strokeWidth={tight ? 1.1 : 0.75}
                    strokeLinecap='round'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: tight ? 0.75 : 0.45 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Natal planet glyphs (inner ring) */}
          {natalPlanets.map((p) => {
            const pos = polar(p.longitude, GLYPH_NATAL_R);
            return (
              <g key={`natal-${p.name}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={1.5}
                  fill='#a1a1aa'
                  opacity='0.7'
                />
                <text
                  x={pos.x}
                  y={pos.y - 7}
                  textAnchor='middle'
                  dominantBaseline='central'
                  className='font-astro'
                  fontSize='9'
                  fill='#a1a1aa'
                  opacity='0.75'
                >
                  {symbolFor(p.name)}
                </text>
              </g>
            );
          })}

          {/* Particle trails for moving planets (during play) */}
          {playing && (
            <g aria-hidden>
              {TRANSIT_BODIES.flatMap((name) => {
                const trail = trailsRef.current[name];
                if (!trail || trail.length < 2) return [];
                const sign = signFromLongitude(trail[trail.length - 1].lon);
                const color = ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
                return trail.slice(0, -1).map((pt, i) => {
                  const pos = polar(pt.lon, GLYPH_TRANSIT_R);
                  const opacity = ((i + 1) / trail.length) * 0.45;
                  const r = 1.2 + (i / trail.length) * 1.8;
                  return (
                    <circle
                      key={`trail-${name}-${i}`}
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={color}
                      opacity={opacity}
                    />
                  );
                });
              })}
            </g>
          )}

          {/* Anchor (compare-from) ghost ring */}
          {anchorSnapshot && (
            <g aria-hidden style={{ opacity: 0.55 }}>
              {TRANSIT_BODIES.map((name) => {
                const lon = anchorSnapshot.longitudes[name];
                const pos = polar(lon, GLYPH_TRANSIT_R + 12);
                const sign = signFromLongitude(lon);
                const color = ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
                return (
                  <g key={`anchor-${name}`}>
                    <circle cx={pos.x} cy={pos.y} r={1.5} fill={color} />
                    <text
                      x={pos.x}
                      y={pos.y - 6}
                      textAnchor='middle'
                      dominantBaseline='central'
                      className='font-astro'
                      fontSize='9'
                      fill={color}
                      opacity='0.7'
                    >
                      {symbolFor(name)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Transit planet glyphs (outer ring, animated) */}
          {transitPositions.map((p) => {
            const pos = polar(p.longitude, GLYPH_TRANSIT_R);
            const fill = p.name === 'Sun' ? 'url(#transit-sun)' : '#ffffff';
            const sign = signFromLongitude(p.longitude);
            const elColor = ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
            return (
              <motion.g
                key={`tr-${p.name}`}
                animate={{ x: pos.x, y: pos.y }}
                transition={{
                  type: 'spring',
                  stiffness: 80,
                  damping: 18,
                  mass: 0.6,
                }}
              >
                <motion.circle
                  cx={0}
                  cy={0}
                  r={10}
                  fill={elColor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  style={{ filter: 'blur(4px)' }}
                />
                <circle cx={0} cy={0} r={2.5} fill={elColor} opacity='0.9' />
                {p.name === 'Moon' && transitMoonPhase ? (
                  <g transform='translate(0, -11)'>
                    <MoonPhase
                      cx={0}
                      cy={0}
                      r={6}
                      phase={0}
                      illumination={transitMoonPhase.illumination}
                      waxing={transitMoonPhase.waxing}
                      id='transit-moon-phase'
                      glow
                    />
                  </g>
                ) : (
                  <text
                    x={0}
                    y={-11}
                    textAnchor='middle'
                    dominantBaseline='central'
                    className='font-astro'
                    fontSize='12'
                    fill={fill}
                    style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}
                  >
                    {symbolFor(p.name)}
                  </text>
                )}
                {p.retrograde && (
                  <text
                    x={6}
                    y={-1}
                    fontSize='6'
                    fill='#f87171'
                    textAnchor='middle'
                  >
                    ℞
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>

        {!range && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='rounded-full border border-stroke-subtle bg-surface-elevated/80 px-3 py-1 text-[10px] text-content-muted backdrop-blur'>
              Computing ephemeris… {Math.round(progress * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Scrubber + controls */}
      {!compact && (
        <div className='mt-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-[11px] uppercase tracking-wider text-content-muted'>
              {fmtDate(rangeStart)}
            </span>
            <motion.span
              key={Math.floor(now / 86400000)}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-sm font-semibold text-content-primary tabular-nums'
            >
              {fmtDate(new Date(now))}
            </motion.span>
            <span className='text-[11px] uppercase tracking-wider text-content-muted'>
              {fmtDate(rangeEnd)}
            </span>
          </div>

          <div
            className={`relative h-8 rounded-full border border-stroke-subtle bg-surface-elevated/40 ${canScrub ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
            onPointerDown={handleTrackInteraction}
            onPointerMove={(e) => {
              if (e.buttons > 0) handleTrackInteraction(e);
            }}
          >
            {/* today marker */}
            <div
              className='absolute top-0 bottom-0 w-px bg-lunary-primary/60'
              style={{
                left: `${((today.getTime() - rangeStart.getTime()) / (rangeEnd.getTime() - rangeStart.getTime())) * 100}%`,
              }}
            />
            {/* anchor marker */}
            {anchorTime != null && (
              <div
                className='absolute top-0 bottom-0 w-px bg-amber-300/80'
                style={{
                  left: `${((anchorTime - rangeStart.getTime()) / (rangeEnd.getTime() - rangeStart.getTime())) * 100}%`,
                }}
                title='Anchor (compare-from) date'
              />
            )}
            {/* key-date pips */}
            {keyDates.map((k, i) => {
              const left =
                ((k.time - rangeStart.getTime()) /
                  (rangeEnd.getTime() - rangeStart.getTime())) *
                100;
              if (left < 0 || left > 100) return null;
              return (
                <button
                  key={`pip-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canScrub) setNow(k.time);
                  }}
                  className='absolute -top-1 h-2 w-2 -translate-x-1/2 rounded-full border border-black/20 transition-transform hover:scale-150'
                  style={{ left: `${left}%`, backgroundColor: k.color }}
                  title={`${fmtDate(new Date(k.time))} — ${k.label}`}
                  aria-label={`Jump to ${k.label}`}
                  disabled={!canScrub}
                />
              );
            })}
            {/* thumb */}
            <motion.div
              className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full border-2 border-lunary-primary bg-surface-elevated shadow-[0_0_12px_rgba(138,107,255,0.5)]'
              style={{ left: `${trackFrac * 100}%` }}
              animate={{ scale: playing ? [1, 1.12, 1] : 1 }}
              transition={
                playing
                  ? { duration: 0.6, repeat: Infinity }
                  : { duration: 0.2 }
              }
            />
          </div>

          {/* Anchor controls */}
          {canScrub && (
            <div className='flex items-center justify-end gap-2 text-[11px]'>
              {anchorTime != null ? (
                <>
                  <span className='text-amber-200/90'>
                    Comparing from {fmtDate(new Date(anchorTime))}
                  </span>
                  <button
                    onClick={() => setAnchorTime(null)}
                    className='rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-amber-100 hover:bg-amber-400/20'
                  >
                    Clear anchor
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAnchorTime(now)}
                  className='rounded-full border border-stroke-subtle px-2 py-0.5 text-content-muted hover:text-content-primary'
                  title='Anchor this date — see how planets have moved relative to it'
                >
                  ✦ Anchor here
                </button>
              )}
            </div>
          )}

          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5'>
              <button
                onClick={() => {
                  setNow(today.getTime());
                  setPlaying(false);
                }}
                className='flex items-center gap-1 rounded-full border border-stroke-subtle bg-surface-elevated px-2.5 py-1 text-xs text-content-secondary hover:text-content-primary'
              >
                <SkipBack className='h-3 w-3' /> Today
              </button>
              <button
                onClick={() =>
                  setNow((n) => Math.max(rangeStart.getTime(), n - 86400000))
                }
                disabled={!canScrub}
                className='rounded-full border border-stroke-subtle bg-surface-elevated p-1.5 text-content-secondary hover:text-content-primary disabled:opacity-40'
                aria-label='Previous day'
              >
                <ChevronLeft className='h-3 w-3' />
              </button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => canScrub && setPlaying((p) => !p)}
                disabled={!canScrub}
                className='flex h-9 w-9 items-center justify-center rounded-full bg-lunary-primary text-white shadow-[0_0_14px_rgba(138,107,255,0.55)] disabled:opacity-40 disabled:cursor-not-allowed'
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? (
                  <Pause className='h-4 w-4' />
                ) : (
                  <Play className='h-4 w-4 translate-x-px' />
                )}
              </motion.button>
              <button
                onClick={() =>
                  setNow((n) => Math.min(rangeEnd.getTime(), n + 86400000))
                }
                disabled={!canScrub}
                className='rounded-full border border-stroke-subtle bg-surface-elevated p-1.5 text-content-secondary hover:text-content-primary disabled:opacity-40'
                aria-label='Next day'
              >
                <ChevronRight className='h-3 w-3' />
              </button>
            </div>

            <div className='flex items-center gap-1'>
              {SPEEDS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => canScrub && setSpeedIdx(i)}
                  disabled={!canScrub}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    speedIdx === i
                      ? 'bg-lunary-primary/20 text-lunary-primary'
                      : 'text-content-muted hover:text-content-secondary'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {!canScrub && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-amber-100/90'
            >
              <span className='font-medium'>Free view shows today.</span> Plus
              lets you scrub the whole year, press play to watch transits
              unfold, and jump to exact-hit days.{' '}
              <a
                href='/pricing'
                className='underline underline-offset-2 hover:text-amber-50'
              >
                Upgrade →
              </a>
            </motion.div>
          )}

          {/* Current aspects summary */}
          {liveAspects.length > 0 && (
            <div className='mt-1'>
              <h4 className='mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-content-muted'>
                Active transits · {fmtDate(new Date(now))}
              </h4>
              <div className='flex flex-wrap gap-1.5'>
                {liveAspects
                  .sort((a, b) => a.orb - b.orb)
                  .slice(0, 8)
                  .map((a) => (
                    <motion.span
                      key={a.key}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className='rounded-full border px-2 py-0.5 text-[11px] font-medium'
                      style={{
                        backgroundColor: `${a.color}1f`,
                        borderColor: `${a.color}55`,
                        color: a.color,
                      }}
                    >
                      <span className='font-astro mr-0.5'>
                        {symbolFor(a.transit)}
                      </span>
                      {a.type === 'Conjunction'
                        ? '☌'
                        : a.type === 'Opposition'
                          ? '☍'
                          : a.type === 'Trine'
                            ? '△'
                            : a.type === 'Square'
                              ? '□'
                              : '✶'}
                      <span className='font-astro mx-0.5'>
                        {symbolFor(a.natal)}
                      </span>
                      <span className='opacity-60'>{a.orb.toFixed(1)}°</span>
                    </motion.span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {compact && (
        <button
          onClick={onOpenFull}
          className='mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-stroke-subtle bg-surface-elevated px-3 py-2 text-xs text-content-secondary hover:text-content-primary'
        >
          See the full transit view →
        </button>
      )}
    </div>
  );
}
