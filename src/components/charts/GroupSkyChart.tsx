'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { bodiesSymbols, zodiacSymbol } from '@/constants/symbols';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  CHART_ASPECT_COLORS,
  CHART_COLORS,
  CHART_ELEMENT_COLORS,
  CHART_GLYPH_SHADOW,
} from '@/components/charts/chartTheme';

export type GroupParticipant = {
  id: string;
  name: string;
  color: string;
  birthChart: BirthChartData[];
  isUser?: boolean;
};

type Props = {
  participants: GroupParticipant[];
  /** Defaults to today's noon */
  now?: Date;
};

const SIGN_ELEMENTS: Record<string, keyof typeof CHART_ELEMENT_COLORS> = {
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

const ASPECTS = [
  {
    name: 'Conjunction',
    symbol: '☌',
    angle: 0,
    orb: 3,
    tint: CHART_ASPECT_COLORS.Conjunction,
  },
  {
    name: 'Opposition',
    symbol: '☍',
    angle: 180,
    orb: 3,
    tint: CHART_ASPECT_COLORS.Opposition,
  },
  {
    name: 'Trine',
    symbol: '△',
    angle: 120,
    orb: 3,
    tint: CHART_ASPECT_COLORS.Trine,
  },
  {
    name: 'Square',
    symbol: '□',
    angle: 90,
    orb: 3,
    tint: CHART_ASPECT_COLORS.Square,
  },
  {
    name: 'Sextile',
    symbol: '⚹',
    angle: 60,
    orb: 3,
    tint: CHART_ASPECT_COLORS.Sextile,
  },
] as const;

type AspectName = (typeof ASPECTS)[number]['name'];

const ASPECT_INTERPRETATION: Record<string, string> = {
  // Sun
  'Sun-Sun-Conjunction': 'spotlight on identity',
  'Sun-Sun-Opposition': 'mirror moment for ego',
  'Sun-Sun-Trine': 'easy radiance and confidence',
  'Sun-Sun-Square': 'pressure on the ego',
  'Sun-Sun-Sextile': 'gentle nudge to shine',
  'Sun-Moon-Conjunction': 'feelings and self align',
  'Sun-Moon-Opposition': 'head vs heart pull',
  'Sun-Moon-Trine': 'soft and connected today',
  'Sun-Moon-Square': 'mood vs ego friction',
  'Sun-Moon-Sextile': 'quiet inner cooperation',
  // Moon
  'Moon-Moon-Conjunction': 'big feelings up close',
  'Moon-Moon-Opposition': 'emotional pull-and-tug',
  'Moon-Moon-Trine': 'cosy emotional flow',
  'Moon-Moon-Square': 'mood swings, tender skin',
  'Moon-Moon-Sextile': 'easy comfort and care',
  'Moon-Venus-Conjunction': 'tender, indulgent vibes',
  'Moon-Venus-Trine': 'sweet emotional grace',
  'Moon-Venus-Square': 'wanting a feeling you can\u2019t name',
  'Moon-Mars-Square': 'snappy, reactive moods',
  'Moon-Mars-Conjunction': 'feelings with teeth',
  // Mercury
  'Mercury-Mercury-Conjunction': 'aligned thinking',
  'Mercury-Mercury-Square': 'crossed wires',
  'Mercury-Mercury-Trine': 'easy conversations',
  'Mercury-Sun-Conjunction': 'thoughts feel central',
  'Mercury-Moon-Square': 'words don\u2019t match the mood',
  // Venus
  'Venus-Sun-Trine': 'soft and connected today',
  'Venus-Moon-Trine': 'affection lands gently',
  'Venus-Venus-Conjunction': 'aesthetic resonance',
  'Venus-Venus-Square': 'taste clashes',
  'Venus-Mars-Trine': 'flirty, flowing energy',
  'Venus-Mars-Square': 'desire vs values',
  // Mars
  'Mars-Sun-Square': 'pressure to act',
  'Mars-Moon-Square': 'friction in conversations',
  'Mars-Mercury-Square': 'sharp tongues',
  'Mars-Venus-Conjunction': 'sparks fly',
  'Mars-Mars-Conjunction': 'fired up',
  'Mars-Mars-Square': 'power struggle vibes',
  'Mars-Mars-Trine': 'aligned momentum',
  // Saturn
  'Saturn-Sun-Square': 'reality check on identity',
  'Saturn-Moon-Square': 'low mood, heavy feelings',
  'Saturn-Saturn-Conjunction': 'a maturity threshold',
  'Saturn-Saturn-Square': 'structural pressure',
  'Saturn-Saturn-Opposition': 'long-arc reckoning',
  // Jupiter
  'Jupiter-Sun-Trine': 'expansive luck',
  'Jupiter-Moon-Trine': 'big-hearted feelings',
  'Jupiter-Venus-Conjunction': 'abundant warmth',
  // Uranus
  'Uranus-Sun-Square': 'shake-up to the self',
  'Uranus-Moon-Square': 'unsettled feelings',
  'Uranus-Venus-Square': 'unexpected attraction or rupture',
  // Pluto
  'Pluto-Sun-Square': 'identity transformation pressure',
  'Pluto-Moon-Square': 'deep emotional dredge',
  'Pluto-Venus-Square': 'intensity in connection',
  // Neptune
  'Neptune-Sun-Square': 'fog over the ego',
  'Neptune-Moon-Trine': 'dreamy, intuitive softness',
};

function symbolFor(body: string): string {
  const k = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof bodiesSymbols;
  return bodiesSymbols[k] || body.charAt(0);
}

function signFromLongitude(lon: number): string {
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

function describeDegree(lon: number) {
  const norm = ((lon % 360) + 360) % 360;
  const inSign = norm % 30;
  const deg = Math.floor(inSign);
  const min = Math.round((inSign - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}'`;
}

export type ActiveAspect = {
  key: string;
  participantId: string;
  participantName: string;
  participantColor: string;
  transitBody: BodyName;
  natalBody: string;
  natalLon: number;
  transitLon: number;
  aspect: AspectName;
  aspectSymbol: string;
  aspectTint: string;
  orb: number;
  blurb: string;
};

function pickInterpretation(
  transit: BodyName,
  natal: string,
  aspect: AspectName,
): string {
  const direct = ASPECT_INTERPRETATION[`${transit}-${natal}-${aspect}`];
  if (direct) return direct;
  // Fallback by aspect type
  switch (aspect) {
    case 'Conjunction':
      return 'a fused, intensified moment';
    case 'Opposition':
      return 'a mirror, pulling both ways';
    case 'Trine':
      return 'soft and connected today';
    case 'Square':
      return 'friction asking for action';
    case 'Sextile':
      return 'gentle invitation to act';
    default:
      return '';
  }
}

/**
 * Compute live aspects between today's transits and each participant's natal placements.
 * O(participants × transits × natal-bodies) — cheap for ≤7 participants.
 */
export function computeGroupAspects(
  snapshot: EphemerisSnapshot,
  participants: GroupParticipant[],
): ActiveAspect[] {
  const out: ActiveAspect[] = [];
  for (const participant of participants) {
    for (const transit of TRANSIT_BODIES) {
      const tLon = snapshot.longitudes[transit];
      for (const natal of participant.birthChart) {
        // Limit natal to the 10 main bodies for legibility.
        if (!TRANSIT_BODIES.includes(natal.body as BodyName)) continue;
        let diff = Math.abs(tLon - natal.eclipticLongitude);
        if (diff > 180) diff = 360 - diff;
        for (const a of ASPECTS) {
          const orb = Math.abs(diff - a.angle);
          if (orb <= a.orb) {
            const blurb = pickInterpretation(transit, natal.body, a.name);
            out.push({
              key: `${participant.id}-${transit}-${natal.body}-${a.name}`,
              participantId: participant.id,
              participantName: participant.name,
              participantColor: participant.color,
              transitBody: transit,
              natalBody: natal.body,
              natalLon: natal.eclipticLongitude,
              transitLon: tLon,
              aspect: a.name,
              aspectSymbol: a.symbol,
              aspectTint: a.tint,
              orb,
              blurb,
            });
            break;
          }
        }
      }
    }
  }
  return out;
}

export function GroupSkyChart({ participants, now }: Props) {
  const today = useMemo(() => {
    if (now) return new Date(now);
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, [now]);

  // Tiny range around today, sampled every day. Worker-backed if possible.
  const rangeStart = useMemo(
    () => new Date(today.getTime() - 2 * 86400000),
    [today],
  );
  const rangeEnd = useMemo(
    () => new Date(today.getTime() + 2 * 86400000),
    [today],
  );
  const { range, progress } = useEphemerisRange({
    enabled: true,
    start: rangeStart,
    end: rangeEnd,
    stepDays: 1,
  });

  const snapshot: EphemerisSnapshot | null = range
    ? sampleEphemeris(range, today.getTime())
    : null;

  // Use the user's ascendant for orientation.
  const userParticipant = participants.find((p) => p.isUser) ?? participants[0];
  const ascendant = userParticipant?.birthChart.find(
    (p) => p.body === 'Ascendant',
  );
  const ascLon = ascendant ? ascendant.eclipticLongitude : 0;

  const polar = (lon: number, radius: number) => {
    const adjusted = (lon - ascLon + 360) % 360;
    const angle = (180 + adjusted) % 360;
    const rad = (angle * Math.PI) / 180;
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
  };

  // Assign each participant an inner ring radius so they don't overlap.
  // Series 50, 60, 70, 80, 90, 100 — up to 6 rings.
  const RING_RADII = [50, 60, 70, 80, 90, 100];
  const radiusByParticipant = useMemo(() => {
    const map: Record<string, number> = {};
    participants.forEach((p, idx) => {
      map[p.id] = RING_RADII[Math.min(idx, RING_RADII.length - 1)];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.map((p) => p.id).join('|')]);

  const TRANSIT_R = 118;

  const aspects = useMemo(() => {
    if (!snapshot) return [];
    return computeGroupAspects(snapshot, participants);
  }, [snapshot, participants]);

  // Active filter — when user taps a participant in the legend, dim others.
  const [focusParticipantId, setFocusParticipantId] = useState<string | null>(
    null,
  );

  // Tooltip / bottom-sheet for tapped aspect / planet
  const [tappedKey, setTappedKey] = useState<string | null>(null);
  const tappedAspect = aspects.find((a) => a.key === tappedKey) ?? null;

  const transitMoonPhase = useMemo(() => {
    if (!snapshot) return null;
    return illuminationFromLongitudes(
      snapshot.longitudes.Sun,
      snapshot.longitudes.Moon,
    );
  }, [snapshot]);

  const zodiacRing = useMemo(() => {
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
    return signs.map((sign, i) => {
      const mid = i * 30 + 15;
      return { sign, ...polar(mid, 132) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ascLon]);

  return (
    <div className='w-full max-w-3xl mx-auto'>
      <div className='relative w-full mx-auto aspect-square max-w-[440px] sm:max-w-[520px]'>
        <svg
          viewBox='-140 -140 280 280'
          className='w-full h-full'
          role='img'
          aria-label="Today's group sky chart"
          onClick={(e) => {
            if ((e.target as Element).closest('[data-group-sky-tap]')) return;
            setTappedKey(null);
          }}
        >
          <defs>
            <radialGradient id='gs-transit-sun' cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stopColor={CHART_COLORS.sunA} />
              <stop offset='100%' stopColor={CHART_COLORS.sunB} />
            </radialGradient>
          </defs>

          <circle
            cx={0}
            cy={0}
            r={132}
            fill={CHART_COLORS.surface}
            opacity={0.84}
          />
          <CosmicBackdrop seed={11} />

          {/* Ring guides */}
          <circle
            cx={0}
            cy={0}
            r={130}
            fill='none'
            stroke={CHART_COLORS.stroke}
            strokeWidth={0.5}
            opacity={0.5}
          />
          <circle
            cx={0}
            cy={0}
            r={108}
            fill='none'
            stroke={CHART_COLORS.strokeSubtle}
            strokeWidth={0.4}
            opacity={0.35}
          />
          {participants.map((p) => (
            <circle
              key={`ring-${p.id}`}
              cx={0}
              cy={0}
              r={radiusByParticipant[p.id]}
              fill='none'
              stroke={p.color}
              strokeWidth={0.4}
              opacity={
                focusParticipantId && focusParticipantId !== p.id ? 0.08 : 0.25
              }
              strokeDasharray='1.5 3'
            />
          ))}

          {/* Sign dividers */}
          {Array.from({ length: 12 }, (_, i) => {
            const lon = i * 30;
            const p1 = polar(lon, 108);
            const p2 = polar(lon, 130);
            return (
              <line
                key={`div-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={CHART_COLORS.strokeSubtle}
                strokeWidth={0.4}
                opacity={0.45}
              />
            );
          })}

          {/* Zodiac glyphs */}
          {zodiacRing.map(({ sign, x, y }) => (
            <text
              key={sign}
              x={x}
              y={y}
              textAnchor='middle'
              dominantBaseline='central'
              className='font-astro'
              fontSize={10}
              fill={CHART_ELEMENT_COLORS[SIGN_ELEMENTS[sign]]}
              opacity={0.95}
            >
              {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
            </text>
          ))}

          {/* Aspect lines (drawn first so dots/glyphs sit on top) */}
          <AnimatePresence>
            {aspects.map((a) => {
              const r = radiusByParticipant[a.participantId];
              const n = polar(a.natalLon, r);
              const t = polar(a.transitLon, TRANSIT_R);
              const tight = a.orb < 1;
              const dimmed =
                focusParticipantId && focusParticipantId !== a.participantId;
              // Blend participant colour with aspect tint
              const color = a.participantColor;
              const tint = a.aspectTint;
              return (
                <motion.g
                  key={a.key}
                  data-group-sky-tap
                  onClick={(e) => {
                    e.stopPropagation();
                    setTappedKey(a.key);
                  }}
                  style={{ cursor: 'pointer' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: dimmed ? 0.06 : tight ? 0.85 : 0.55 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {tight && (
                    <motion.line
                      x1={n.x}
                      y1={n.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={tint}
                      strokeWidth={3}
                      strokeLinecap='round'
                      animate={{ opacity: [0.1, 0.28, 0.1] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ filter: 'blur(2px)' }}
                    />
                  )}
                  <line
                    x1={n.x}
                    y1={n.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={color}
                    strokeWidth={tight ? 1.1 : 0.7}
                    strokeLinecap='round'
                  />
                  {/* tint overlay near transit end */}
                  <line
                    x1={(n.x + t.x) / 2}
                    y1={(n.y + t.y) / 2}
                    x2={t.x}
                    y2={t.y}
                    stroke={tint}
                    strokeWidth={tight ? 0.9 : 0.5}
                    strokeLinecap='round'
                    opacity={0.65}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Each participant's natal planets at their assigned radius */}
          {participants.map((p) => {
            const r = radiusByParticipant[p.id];
            const dimmed =
              focusParticipantId != null && focusParticipantId !== p.id;
            const planets = p.birthChart.filter((b) =>
              TRANSIT_BODIES.includes(b.body as BodyName),
            );
            return (
              <motion.g
                key={`participant-${p.id}`}
                animate={{ opacity: dimmed ? 0.18 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {planets.map((planet) => {
                  const pos = polar(planet.eclipticLongitude, r);
                  return (
                    <g
                      key={`${p.id}-${planet.body}`}
                      data-group-sky-tap
                      onClick={(e) => {
                        e.stopPropagation();
                        // Find the first aspect involving this natal body for tooltip
                        const match = aspects.find(
                          (a) =>
                            a.participantId === p.id &&
                            a.natalBody === planet.body,
                        );
                        if (match) setTappedKey(match.key);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={2.4}
                        fill={p.color}
                        opacity={0.9}
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 6.5}
                        textAnchor='middle'
                        dominantBaseline='central'
                        className='font-astro'
                        fontSize={10}
                        fill={p.color}
                        opacity={0.85}
                      >
                        {symbolFor(planet.body)}
                      </text>
                    </g>
                  );
                })}
              </motion.g>
            );
          })}

          {/* Today's transit ring (outer) */}
          {snapshot &&
            TRANSIT_BODIES.map((name) => {
              const lon = snapshot.longitudes[name];
              const pos = polar(lon, TRANSIT_R);
              const sign = signFromLongitude(lon);
              const elColor = CHART_ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
              const isMoon = name === 'Moon';
              const isSun = name === 'Sun';
              return (
                <motion.g
                  key={`transit-${name}`}
                  data-group-sky-tap
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const match = aspects.find((a) => a.transitBody === name);
                    if (match) setTappedKey(match.key);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={9}
                    fill={elColor}
                    opacity={0.18}
                    style={{ filter: 'blur(3px)' }}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={2.6}
                    fill={elColor}
                    opacity={0.95}
                  />
                  {isMoon && transitMoonPhase ? (
                    <g transform={`translate(${pos.x}, ${pos.y - 12})`}>
                      <MoonPhase
                        cx={0}
                        cy={0}
                        r={6}
                        phase={0}
                        illumination={transitMoonPhase.illumination}
                        waxing={transitMoonPhase.waxing}
                        id='gs-transit-moon'
                      />
                    </g>
                  ) : (
                    <text
                      x={pos.x}
                      y={pos.y - 12}
                      textAnchor='middle'
                      dominantBaseline='central'
                      className='font-astro'
                      fontSize={12}
                      fill={isSun ? 'url(#gs-transit-sun)' : CHART_COLORS.text}
                      style={{ filter: CHART_GLYPH_SHADOW }}
                    >
                      {symbolFor(name)}
                    </text>
                  )}
                  {snapshot.retrograde[name] && (
                    <text
                      x={pos.x + 7}
                      y={pos.y - 1}
                      fontSize={6}
                      fill={CHART_COLORS.retrograde}
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
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <div className='text-xs text-content-muted'>
              Calculating sky… {Math.round(progress * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className='mt-4 flex flex-wrap justify-center gap-2'>
        {participants.map((p) => {
          const isFocus = focusParticipantId === p.id;
          return (
            <button
              key={`legend-${p.id}`}
              type='button'
              onClick={() =>
                setFocusParticipantId((cur) => (cur === p.id ? null : p.id))
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                isFocus
                  ? 'border-stroke-default bg-surface-elevated text-content-primary'
                  : 'border-stroke-subtle bg-transparent text-content-secondary hover:bg-surface-elevated/60'
              }`}
              aria-pressed={isFocus}
            >
              <span
                className='inline-block w-2.5 h-2.5 rounded-full'
                style={{ backgroundColor: p.color }}
              />
              {p.name}
              {p.isUser && (
                <span className='text-[10px] uppercase tracking-wide text-content-muted'>
                  you
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tooltip / bottom-sheet for tapped aspect */}
      <AnimatePresence>
        {tappedAspect && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className='mt-4 rounded-xl border border-stroke-subtle bg-surface-elevated p-4'
          >
            <div className='flex items-start gap-3'>
              <span
                className='mt-1 inline-block w-2.5 h-2.5 rounded-full shrink-0'
                style={{ backgroundColor: tappedAspect.participantColor }}
              />
              <div className='flex-1'>
                <div className='text-sm text-content-primary'>
                  <span className='font-semibold'>
                    {tappedAspect.transitBody}
                  </span>{' '}
                  <span
                    className='font-astro'
                    style={{ color: tappedAspect.aspectTint }}
                    aria-label={tappedAspect.aspect}
                  >
                    {tappedAspect.aspectSymbol}
                  </span>{' '}
                  {tappedAspect.participantName}&apos;s{' '}
                  <span className='font-semibold'>
                    {tappedAspect.natalBody}
                  </span>{' '}
                  <span className='text-content-muted'>
                    ({tappedAspect.orb.toFixed(1)}°)
                  </span>
                </div>
                {tappedAspect.blurb && (
                  <div className='text-xs text-content-secondary mt-1'>
                    {tappedAspect.blurb}
                  </div>
                )}
                <div className='mt-2 flex flex-wrap gap-3 text-[10px] uppercase tracking-wide text-content-muted'>
                  <span>
                    transit · {describeDegree(tappedAspect.transitLon)}{' '}
                    {signFromLongitude(tappedAspect.transitLon)}
                  </span>
                  <span>
                    natal · {describeDegree(tappedAspect.natalLon)}{' '}
                    {signFromLongitude(tappedAspect.natalLon)}
                  </span>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setTappedKey(null)}
                className='text-xs text-content-muted hover:text-content-primary'
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
