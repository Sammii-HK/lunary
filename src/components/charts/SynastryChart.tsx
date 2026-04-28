'use client';

import { useId, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import classNames from 'classnames';
import { CosmicBackdrop } from '@/components/charts/CosmicBackdrop';
import {
  MoonPhase,
  illuminationFromLongitudes,
} from '@/components/charts/MoonPhase';
import {
  bodiesSymbols,
  zodiacSymbol,
  astroPointSymbols,
} from '@/constants/symbols';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  CHART_ASPECT_COLORS,
  CHART_COLORS,
  CHART_ELEMENT_COLORS,
} from '@/components/charts/chartTheme';

const cx = classNames;

/** Round to 6dp to keep SSR stable. */
const r6 = (n: number) => Math.round(n * 1e6) / 1e6;

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

const ZODIAC_SIGNS = [
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

const SYNASTRY_PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
];

/**
 * Aspect definitions used for inter-chart synastry. Mirror the colour palette
 * used by the rest of the app (see TransitScrubber & friends).
 */
const SYNASTRY_ASPECTS = [
  {
    name: 'Conjunction',
    angle: 0,
    orb: 8,
    color: CHART_ASPECT_COLORS.Conjunction,
    nature: 'neutral',
  },
  {
    name: 'Opposition',
    angle: 180,
    orb: 8,
    color: CHART_ASPECT_COLORS.Opposition,
    nature: 'challenging',
  },
  {
    name: 'Trine',
    angle: 120,
    orb: 6,
    color: CHART_ASPECT_COLORS.Trine,
    nature: 'harmonious',
  },
  {
    name: 'Square',
    angle: 90,
    orb: 6,
    color: CHART_ASPECT_COLORS.Square,
    nature: 'challenging',
  },
  {
    name: 'Sextile',
    angle: 60,
    orb: 4,
    color: CHART_ASPECT_COLORS.Sextile,
    nature: 'harmonious',
  },
] as const;

export type SynastryAspectLine = {
  key: string;
  userPlanet: string;
  friendPlanet: string;
  userLon: number;
  friendLon: number;
  aspect: string;
  color: string;
  nature: 'harmonious' | 'challenging' | 'neutral';
  orb: number;
};

function symbolFor(body: string) {
  const norm = body.toLowerCase().replace(/[\s-]+/g, '');
  const k = norm as keyof typeof bodiesSymbols;
  if (bodiesSymbols[k]) return bodiesSymbols[k];
  const pk = norm as keyof typeof astroPointSymbols;
  if (astroPointSymbols[pk]) return astroPointSymbols[pk];
  return body.charAt(0);
}

function elementColor(sign?: string) {
  if (!sign) return '#a1a1aa';
  const el = SIGN_ELEMENTS[sign];
  return el ? CHART_ELEMENT_COLORS[el] : CHART_COLORS.textMuted;
}

/**
 * Compute pairwise inter-chart aspects between two charts.
 * Returns the array shape used by the SVG renderer + the breakdown.
 */
export function computeSynastryAspects(
  userChart: BirthChartData[],
  friendChart: BirthChartData[],
): SynastryAspectLine[] {
  const userPlanets = userChart.filter((p) =>
    SYNASTRY_PLANETS.includes(p.body),
  );
  const friendPlanets = friendChart.filter((p) =>
    SYNASTRY_PLANETS.includes(p.body),
  );

  const out: SynastryAspectLine[] = [];
  for (const a of userPlanets) {
    for (const b of friendPlanets) {
      let diff = Math.abs(a.eclipticLongitude - b.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;
      for (const def of SYNASTRY_ASPECTS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          out.push({
            key: `${a.body}-${b.body}-${def.name}`,
            userPlanet: a.body,
            friendPlanet: b.body,
            userLon: a.eclipticLongitude,
            friendLon: b.eclipticLongitude,
            aspect: def.name,
            color: def.color,
            nature: def.nature as SynastryAspectLine['nature'],
            orb,
          });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

type Props = {
  userChart: BirthChartData[];
  friendChart: BirthChartData[];
  userName?: string;
  friendName?: string;
  /** Optional: parent supplies precomputed aspects to avoid duplicate work. */
  aspects?: SynastryAspectLine[];
  /** Notify parent when a planet is selected so other panels can sync. */
  onSelect?: (key: { side: 'user' | 'friend'; planet: string } | null) => void;
};

export function SynastryChart({
  userChart,
  friendChart,
  userName,
  friendName,
  aspects: providedAspects,
  onSelect,
}: Props) {
  const uid = useId().replace(/:/g, '');
  const [selected, setSelected] = useState<{
    side: 'user' | 'friend';
    planet: string;
  } | null>(null);

  const userAscendant = userChart.find((p) => p.body === 'Ascendant');
  const ascLon = userAscendant ? userAscendant.eclipticLongitude : 0;

  // Wheel orientation: 12 o'clock = ASC opposite. We use the same transform
  // as BirthChart.tsx (clockwise=false branch) so signs read counter-clockwise.
  const polar = (lon: number, radius: number) => {
    const adjusted = (lon - ascLon + 360) % 360;
    const angle = (180 + adjusted) % 360;
    const rad = (angle * Math.PI) / 180;
    return { x: r6(Math.cos(rad) * radius), y: r6(Math.sin(rad) * radius) };
  };

  const userPlacements = useMemo(
    () => userChart.filter((p) => SYNASTRY_PLANETS.includes(p.body)),
    [userChart],
  );
  const friendPlacements = useMemo(
    () => friendChart.filter((p) => SYNASTRY_PLANETS.includes(p.body)),
    [friendChart],
  );

  const synastryAspects = useMemo<SynastryAspectLine[]>(() => {
    if (providedAspects) return providedAspects;
    return computeSynastryAspects(userChart, friendChart);
  }, [providedAspects, userChart, friendChart]);

  const userMoonPhase = useMemo(() => {
    const sun = userChart.find((p) => p.body === 'Sun');
    const moon = userChart.find((p) => p.body === 'Moon');
    if (!sun || !moon) return null;
    return illuminationFromLongitudes(
      sun.eclipticLongitude,
      moon.eclipticLongitude,
    );
  }, [userChart]);

  const friendMoonPhase = useMemo(() => {
    const sun = friendChart.find((p) => p.body === 'Sun');
    const moon = friendChart.find((p) => p.body === 'Moon');
    if (!sun || !moon) return null;
    return illuminationFromLongitudes(
      sun.eclipticLongitude,
      moon.eclipticLongitude,
    );
  }, [friendChart]);

  const zodiacGlyphs = useMemo(() => {
    return ZODIAC_SIGNS.map((sign, i) => {
      const mid = i * 30 + 15;
      const start = i * 30;
      const end = start + 30;
      const startAdjusted = (start - ascLon + 360) % 360;
      const endAdjusted = (end - ascLon + 360) % 360;
      const pos = polar(mid, 135);
      return { sign, ...pos, startAdjusted, endAdjusted };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ascLon]);

  // House lines drawn from user's ascendant (whole-sign for simplicity since
  // we don't always have full house cusp data on the friend page).
  const houseLines = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const lon = i * 30;
      return polar(lon, 1); // unit; consumer scales
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ascLon]);

  const isAspected = (side: 'user' | 'friend', planet: string) => {
    if (!selected) return false;
    return synastryAspects.some((a) => {
      if (selected.side === 'user') {
        return (
          selected.planet === a.userPlanet &&
          side === 'friend' &&
          planet === a.friendPlanet
        );
      }
      return (
        selected.planet === a.friendPlanet &&
        side === 'user' &&
        planet === a.userPlanet
      );
    });
  };

  const aspectIsHighlighted = (a: SynastryAspectLine) => {
    if (!selected) return false;
    if (selected.side === 'user') return a.userPlanet === selected.planet;
    return a.friendPlanet === selected.planet;
  };

  const handleTap = (side: 'user' | 'friend', planet: string) => {
    setSelected((s) => {
      const next =
        s && s.side === side && s.planet === planet ? null : { side, planet };
      onSelect?.(next);
      return next;
    });
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        (navigator as Navigator & { vibrate?: (p: number) => void }).vibrate?.(
          8,
        );
      } catch {
        /* noop */
      }
    }
  };

  // Radii
  const USER_GLYPH_R = 80; // inner ring (you)
  const USER_DOT_R = 64;
  const FRIEND_GLYPH_R = 118; // outer ring (friend)
  const FRIEND_DOT_R = 104;
  const ZODIAC_INNER_R = 92;
  const ZODIAC_OUTER_R = 130;

  return (
    <div
      className='flex flex-col items-center gap-3'
      data-testid='synastry-chart'
    >
      <div className='relative w-full max-w-[360px] md:max-w-[440px] aspect-square select-none'>
        <motion.svg
          viewBox='-140 -140 280 280'
          className='w-full h-full rounded-full'
          role='img'
          aria-label={`Synastry chart between ${userName || 'you'} and ${
            friendName || 'your friend'
          }`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => {
            if ((e.target as Element).closest('[data-syn-body]')) return;
            setSelected(null);
            onSelect?.(null);
          }}
        >
          <defs>
            <linearGradient
              id={`syn-sun-${uid}`}
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'
            >
              <stop offset='0%' stopColor={CHART_COLORS.sunA} />
              <stop offset='100%' stopColor={CHART_COLORS.sunB} />
            </linearGradient>
            <radialGradient
              id={`syn-user-glow-${uid}`}
              cx='50%'
              cy='50%'
              r='50%'
            >
              <stop
                offset='0%'
                stopColor={CHART_COLORS.selected}
                stopOpacity='0.28'
              />
              <stop
                offset='100%'
                stopColor={CHART_COLORS.selected}
                stopOpacity='0'
              />
            </radialGradient>
            <radialGradient
              id={`syn-friend-glow-${uid}`}
              cx='50%'
              cy='50%'
              r='50%'
            >
              <stop
                offset='0%'
                stopColor={CHART_ASPECT_COLORS.Sextile}
                stopOpacity='0.28'
              />
              <stop
                offset='100%'
                stopColor={CHART_ASPECT_COLORS.Sextile}
                stopOpacity='0'
              />
            </radialGradient>
          </defs>

          <CosmicBackdrop seed={11} />

          {/* Ring frames */}
          <circle
            cx='0'
            cy='0'
            r={ZODIAC_OUTER_R}
            fill='none'
            stroke={CHART_COLORS.stroke}
            strokeWidth='0.8'
            opacity='0.6'
          />
          <circle
            cx='0'
            cy='0'
            r={ZODIAC_INNER_R}
            fill='none'
            stroke={CHART_COLORS.stroke}
            strokeWidth='0.8'
            opacity='0.5'
          />
          <circle
            cx='0'
            cy='0'
            r={USER_DOT_R}
            fill='none'
            stroke={CHART_COLORS.strokeSubtle}
            strokeWidth='0.6'
            opacity='0.55'
          />

          {/* Element-tinted zodiac sectors */}
          {zodiacGlyphs.map(({ sign, startAdjusted, endAdjusted }, i) => {
            const a1 = (((180 + startAdjusted) % 360) * Math.PI) / 180;
            const a2 = (((180 + endAdjusted) % 360) * Math.PI) / 180;
            const sweep =
              (endAdjusted - startAdjusted + 360) % 360 > 180 ? 1 : 0;
            const rO = ZODIAC_OUTER_R;
            const rI = ZODIAC_INNER_R;
            const x1 = r6(Math.cos(a1) * rO);
            const y1 = r6(Math.sin(a1) * rO);
            const x2 = r6(Math.cos(a2) * rO);
            const y2 = r6(Math.sin(a2) * rO);
            const x3 = r6(Math.cos(a2) * rI);
            const y3 = r6(Math.sin(a2) * rI);
            const x4 = r6(Math.cos(a1) * rI);
            const y4 = r6(Math.sin(a1) * rI);
            return (
              <path
                key={`syn-sector-${i}`}
                d={`M ${x1} ${y1} A ${rO} ${rO} 0 ${sweep} 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 ${sweep} 0 ${x4} ${y4} Z`}
                fill={elementColor(sign)}
                opacity='0.045'
              />
            );
          })}

          {/* Sign dividers */}
          {Array.from({ length: 12 }, (_, i) => {
            const lon = i * 30;
            const p1 = polar(lon, ZODIAC_INNER_R);
            const p2 = polar(lon, ZODIAC_OUTER_R);
            return (
              <line
                key={`syn-div-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={CHART_COLORS.stroke}
                strokeWidth='0.4'
                opacity='0.5'
              />
            );
          })}

          {/* House lines from user's ASC (whole-sign style) */}
          {houseLines.map((_, i) => {
            const lon = i * 30;
            const inner = polar(lon, USER_DOT_R - 14);
            const outer = polar(lon, USER_DOT_R);
            const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
            return (
              <line
                key={`syn-house-${i}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={
                  isAngular ? CHART_COLORS.angular : CHART_COLORS.strokeSubtle
                }
                strokeWidth={isAngular ? 1.2 : 0.4}
                opacity={isAngular ? 0.7 : 0.35}
              />
            );
          })}

          {/* Zodiac glyphs */}
          {zodiacGlyphs.map(({ sign, x, y }) => (
            <text
              key={`syn-z-${sign}`}
              x={x}
              y={y}
              textAnchor='middle'
              dominantBaseline='central'
              className='font-astro'
              fontSize='11'
              fill={elementColor(sign)}
              opacity='0.92'
            >
              {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
            </text>
          ))}

          {/* Inter-chart aspect lines (bezier, motion-animated) */}
          <AnimatePresence>
            {synastryAspects.map((a, idx) => {
              const u = polar(a.userLon, USER_DOT_R);
              const f = polar(a.friendLon, FRIEND_DOT_R);
              const tight = a.orb < 1.5;
              const hasSelection = selected != null;
              const highlighted = aspectIsHighlighted(a);
              const lineOpacity = hasSelection
                ? highlighted
                  ? 1
                  : 0.15
                : tight
                  ? 0.55
                  : 0.32;

              // Bezier curve bulged toward centre for harmonious, away for
              // challenging, mirrors AspectLines.tsx aesthetic.
              const mx = (u.x + f.x) / 2;
              const my = (u.y + f.y) / 2;
              const dist = Math.hypot(f.x - u.x, f.y - u.y);
              const bulge =
                a.nature === 'harmonious'
                  ? dist * 0.1
                  : a.nature === 'challenging'
                    ? -dist * 0.05
                    : 0;
              const fromCenter = Math.hypot(mx, my) || 1;
              const ccx = mx + (-mx / fromCenter) * bulge;
              const ccy = my + (-my / fromCenter) * bulge;
              const d = `M ${u.x} ${u.y} Q ${ccx} ${ccy} ${f.x} ${f.y}`;

              return (
                <motion.g key={a.key} style={{ pointerEvents: 'none' }}>
                  {tight && (
                    <motion.path
                      d={d}
                      fill='none'
                      stroke={a.color}
                      strokeWidth={3}
                      strokeLinecap='round'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.08, 0.22, 0.08] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ filter: 'blur(1.8px)' }}
                    />
                  )}
                  <motion.path
                    d={d}
                    fill='none'
                    stroke={a.color}
                    strokeWidth={
                      highlighted ? 2 : tight ? 1.1 : hasSelection ? 0.6 : 0.85
                    }
                    strokeLinecap='round'
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: lineOpacity }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{
                      pathLength: {
                        duration: 0.9,
                        delay: Math.min(idx * 0.02, 0.5),
                        ease: [0.22, 1, 0.36, 1],
                      },
                      opacity: { duration: 0.35 },
                    }}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* User natal planets, inner ring */}
          {userPlacements.map((p, idx) => {
            const pos = polar(p.eclipticLongitude, USER_GLYPH_R);
            const dotPos = polar(p.eclipticLongitude, USER_DOT_R);
            const isSelected =
              selected?.side === 'user' && selected.planet === p.body;
            const aspected = isAspected('user', p.body);
            // Dim when something else is selected and this planet isn't the
            // selection, isn't on the same side as the selection (which means
            // it's not directly aspected), and isn't aspected from across.
            const dimmed =
              selected != null &&
              !isSelected &&
              !(selected.side === 'friend' && aspected);
            const sign = p.sign;
            const elColor = elementColor(sign);
            const fill =
              p.body === 'Sun'
                ? `url(#syn-sun-${uid})`
                : isSelected
                  ? CHART_COLORS.text
                  : elColor;

            return (
              <motion.g
                key={`u-${p.body}`}
                data-syn-body
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: dimmed ? 0.4 : 1,
                  scale: 1,
                }}
                transition={{
                  delay: Math.min(idx * 0.05, 0.5),
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTap('user', p.body);
                }}
                style={{ cursor: 'pointer' }}
              >
                <title>
                  {`${userName || 'You'} · ${p.body} in ${p.sign} ${p.degree}°${String(
                    p.minute,
                  ).padStart(2, '0')}'`}
                </title>
                {/* connector to dot on user ring */}
                <line
                  x1={dotPos.x}
                  y1={dotPos.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={elColor}
                  strokeWidth={0.4}
                  opacity={isSelected ? 0.6 : 0.25}
                />
                <circle
                  cx={dotPos.x}
                  cy={dotPos.y}
                  r={1.6}
                  fill={elColor}
                  opacity='0.9'
                />
                {(isSelected || aspected) && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={12}
                    fill={`url(#syn-user-glow-${uid})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 0.9 : 0.55 }}
                  />
                )}
                {isSelected && (
                  <>
                    {/* Steady glow ring, clearly marks the spotlighted planet */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={9}
                      fill='none'
                      stroke={CHART_COLORS.selected}
                      strokeWidth={1.2}
                      opacity={0.95}
                    />
                    {/* Soft pulse outside the steady ring */}
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={9}
                      fill='none'
                      stroke={CHART_COLORS.selected}
                      strokeWidth={0.6}
                      animate={{ r: [9, 14, 9], opacity: [0.5, 0, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  </>
                )}
                {p.body === 'Moon' && userMoonPhase ? (
                  <MoonPhase
                    cx={pos.x}
                    cy={pos.y}
                    r={6}
                    phase={0}
                    illumination={userMoonPhase.illumination}
                    waxing={userMoonPhase.waxing}
                    id={`syn-user-moon-${uid}`}
                    glow={isSelected}
                  />
                ) : (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor='middle'
                    dominantBaseline='central'
                    className='font-astro'
                    fontSize='12'
                    fill={fill}
                    style={{
                      fontWeight: isSelected ? 700 : 400,
                    }}
                  >
                    {symbolFor(p.body)}
                  </text>
                )}
                {p.retrograde && (
                  <text
                    x={pos.x + 7}
                    y={pos.y - 6}
                    fontSize='6'
                    fill={CHART_COLORS.retrograde}
                    textAnchor='middle'
                  >
                    ℞
                  </text>
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
                  fill='transparent'
                  pointerEvents='all'
                />
              </motion.g>
            );
          })}

          {/* Friend natal planets, outer ring */}
          {friendPlacements.map((p, idx) => {
            const pos = polar(p.eclipticLongitude, FRIEND_GLYPH_R);
            const dotPos = polar(p.eclipticLongitude, FRIEND_DOT_R);
            const isSelected =
              selected?.side === 'friend' && selected.planet === p.body;
            const aspected = isAspected('friend', p.body);
            const dimmed =
              selected != null &&
              !isSelected &&
              !(selected.side === 'user' && aspected);
            const sign = p.sign;
            const elColor = elementColor(sign);
            const fill =
              p.body === 'Sun'
                ? `url(#syn-sun-${uid})`
                : isSelected
                  ? CHART_COLORS.text
                  : elColor;

            return (
              <motion.g
                key={`f-${p.body}`}
                data-syn-body
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: dimmed ? 0.4 : 1,
                  scale: 1,
                }}
                transition={{
                  delay: Math.min(0.2 + idx * 0.05, 0.7),
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTap('friend', p.body);
                }}
                style={{ cursor: 'pointer' }}
              >
                <title>
                  {`${friendName || 'Friend'} · ${p.body} in ${p.sign} ${p.degree}°${String(
                    p.minute,
                  ).padStart(2, '0')}'`}
                </title>
                <circle
                  cx={dotPos.x}
                  cy={dotPos.y}
                  r={1.8}
                  fill={elColor}
                  opacity='0.95'
                />
                {(isSelected || aspected) && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={12}
                    fill={`url(#syn-friend-glow-${uid})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 0.9 : 0.55 }}
                  />
                )}
                {isSelected && (
                  <>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={9}
                      fill='none'
                      stroke={CHART_ASPECT_COLORS.Sextile}
                      strokeWidth={1.2}
                      opacity={0.95}
                    />
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={9}
                      fill='none'
                      stroke={CHART_ASPECT_COLORS.Sextile}
                      strokeWidth={0.6}
                      animate={{ r: [9, 14, 9], opacity: [0.5, 0, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  </>
                )}
                {p.body === 'Moon' && friendMoonPhase ? (
                  <MoonPhase
                    cx={pos.x}
                    cy={pos.y}
                    r={6}
                    phase={0}
                    illumination={friendMoonPhase.illumination}
                    waxing={friendMoonPhase.waxing}
                    id={`syn-friend-moon-${uid}`}
                    glow={isSelected}
                  />
                ) : (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor='middle'
                    dominantBaseline='central'
                    className='font-astro'
                    fontSize='12'
                    fill={fill}
                    style={{
                      fontWeight: isSelected ? 700 : 400,
                    }}
                  >
                    {symbolFor(p.body)}
                  </text>
                )}
                {p.retrograde && (
                  <text
                    x={pos.x + 7}
                    y={pos.y - 6}
                    fontSize='6'
                    fill={CHART_COLORS.retrograde}
                    textAnchor='middle'
                  >
                    ℞
                  </text>
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
                  fill='transparent'
                  pointerEvents='all'
                />
              </motion.g>
            );
          })}
        </motion.svg>

        <AnimatePresence mode='wait'>
          <motion.p
            key={selected ? 'selected' : 'empty'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className='pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-content-muted whitespace-nowrap'
          >
            {selected
              ? `${selected.planet} highlighted · tap again to clear`
              : 'tap a planet to highlight its connections'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Who's who legend, moved below chart so the wheel reads as hero */}
      <div className='flex items-center justify-between gap-4 w-full max-w-[440px] px-2 text-[11px]'>
        <div className='flex items-center gap-1.5'>
          <span className='inline-block w-2 h-2 rounded-full bg-lunary-primary' />
          <span className='text-content-secondary'>
            {userName ? `${userName} (you)` : 'You'} · inside
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='inline-block w-2 h-2 rounded-full bg-lunary-highlight' />
          <span className='text-content-secondary'>
            {friendName || 'Friend'} · outside
          </span>
        </div>
      </div>

      {/* Aspect legend, collapsed by default on mobile (saves ~32px), expanded on md+ */}
      <div className='hidden w-full max-w-[440px] px-2 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-3 md:gap-y-1'>
        {SYNASTRY_ASPECTS.map((a) => (
          <span
            key={a.name}
            className='inline-flex items-center gap-1.5 text-[10px] text-content-muted'
          >
            <span
              className={cx('inline-block w-2 h-0.5 rounded')}
              style={{ backgroundColor: a.color }}
            />
            <span>{a.name}</span>
          </span>
        ))}
      </div>
      <details className='group w-full max-w-[440px] px-2 md:hidden'>
        <summary className='inline-flex cursor-pointer list-none items-center gap-1.5 text-[10px] uppercase tracking-wider text-content-muted hover:text-content-secondary'>
          <span className='group-open:hidden'>Show aspect legend</span>
          <span className='hidden group-open:inline'>Hide aspect legend</span>
        </summary>
        <div className='mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-content-muted'>
          {SYNASTRY_ASPECTS.map((a) => (
            <span key={a.name} className='inline-flex items-center gap-1.5'>
              <span
                className={cx('inline-block w-2 h-0.5 rounded')}
                style={{ backgroundColor: a.color }}
              />
              <span>{a.name}</span>
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}

export default SynastryChart;
