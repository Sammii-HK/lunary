'use client';

import { useMemo, useRef, useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BirthChartData, HouseCusp } from '../../utils/astrology/birthChart';
import {
  convertLongitudeToZodiacSystem,
  getLongitudeInTropicalSign,
  type ZodiacSystem,
} from '@utils/astrology/zodiacSystems';
import type { HouseSystem } from '../../utils/astrology/houseSystems';
import {
  bodiesSymbols,
  zodiacSymbol,
  astroPointSymbols,
} from '@/constants/symbols';
import classNames from 'classnames';
import { parseIsoDateOnly } from '@/lib/date-only';
import { useAspects } from '@/hooks/useAspects';
import { AspectLines } from '@/components/AspectLines';
import { AspectDetailModal } from '@/components/AspectDetailModal';
import type { Aspect } from '@/hooks/useAspects';
import { PlanetBottomSheet } from '@/components/charts/PlanetBottomSheet';
import { CosmicBackdrop } from '@/components/charts/CosmicBackdrop';
import { useChartGestures } from '@/components/charts/useChartGestures';
import {
  MoonPhase,
  illuminationFromLongitudes,
} from '@/components/charts/MoonPhase';

const cx = classNames;

/** Round to 6 decimal places to prevent SSR/client hydration mismatch from float precision drift. */
const r6 = (n: number) => Math.round(n * 1e6) / 1e6;

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

function getSignElementColor(sign: string): string {
  const element = SIGN_ELEMENTS[sign];
  return element ? ELEMENT_COLORS[element] : '#71717a';
}

const MAIN_PLANETS = [
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
];
const ANGLES = ['Ascendant', 'Descendant', 'Midheaven', 'Imum Coeli'];
const ANGLE_DISPLAY: Record<string, string> = {
  Ascendant: 'Rising',
  Descendant: 'Descendant',
  Midheaven: 'Midheaven',
  'Imum Coeli': 'Imum Coeli',
};
const POINTS = [
  'North Node',
  'South Node',
  'Chiron',
  'Lilith',
  'Part of Fortune',
  'Part of Spirit',
  'Vertex',
  'Anti-Vertex',
  'East Point',
];
const ASTEROIDS = [
  'Ceres',
  'Pallas',
  'Juno',
  'Vesta',
  'Hygiea',
  'Pholus',
  'Psyche',
  'Eros',
];

function getSymbolForBody(body: string): string {
  const normalize = (s: string) => s.toLowerCase().replace(/[\s-]+/g, '');
  const key = normalize(body) as keyof typeof bodiesSymbols;
  if (bodiesSymbols[key]) return bodiesSymbols[key];
  const pointKey = normalize(body) as keyof typeof astroPointSymbols;
  if (astroPointSymbols[pointKey]) return astroPointSymbols[pointKey];
  return body.charAt(0);
}

function formatPlacementLabel({
  body,
  sign,
  degree,
  minute,
  retrograde,
}: Pick<
  BirthChartData,
  'body' | 'sign' | 'degree' | 'minute' | 'retrograde' | 'eclipticLongitude'
>) {
  const hasDegree = Number.isFinite(degree) && Number.isFinite(minute);
  const degreeLabel = hasDegree
    ? `${Math.floor(degree)}°${String(Math.floor(minute)).padStart(2, '0')}'`
    : undefined;
  const signLabel = sign ? ` in ${sign}` : '';
  const retroLabel = retrograde ? ' ℞' : '';
  return `${body}${signLabel}${degreeLabel ? ` ${degreeLabel}` : ''}${retroLabel}`;
}

type BirthChartProps = {
  birthChart: BirthChartData[];
  houses?: HouseCusp[];
  userName?: string;
  birthDate?: string;
  showAspects?: boolean;
  aspectFilter?: 'all' | 'harmonious' | 'challenging';
  showAsteroids?: boolean;
  showPoints?: boolean;
  clockwise?: boolean;
  onAspectsToggle?: (show: boolean) => void;
  showSymbols?: boolean;
  onToggleSymbols?: () => void;
  houseSystem?: HouseSystem;
  zodiacSystem?: ZodiacSystem;
};

export const BirthChart = ({
  birthChart,
  houses,
  userName,
  birthDate,
  showAspects = false,
  aspectFilter = 'all',
  showAsteroids = true,
  showPoints = true,
  clockwise = false,
  onAspectsToggle,
  showSymbols = true,
  onToggleSymbols,
  houseSystem = 'placidus',
  zodiacSystem = 'tropical',
}: BirthChartProps) => {
  const [hoveredBody, setHoveredBody] = useState<string | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<Aspect | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const uid = useId().replace(/:/g, '');
  const wrapRef = useRef<HTMLDivElement>(null);

  const { scale, tx, ty, handlers, reset, suppressTap } = useChartGestures();

  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const tropicalAscendantAngle = ascendant ? ascendant.eclipticLongitude : 0;

  const yf = clockwise ? -1 : 1;

  const chartData = useMemo(() => {
    return birthChart.map((planet) => {
      const displayLongitude = convertLongitudeToZodiacSystem(
        planet.eclipticLongitude,
        0,
        zodiacSystem,
      );
      const displaySignData = getLongitudeInTropicalSign(displayLongitude);
      const adjustedLong =
        (planet.eclipticLongitude - tropicalAscendantAngle + 360) % 360;
      const angle = (180 + adjustedLong) % 360;
      const radian = (angle * Math.PI) / 180;

      const radius = 65;
      const x = r6(Math.cos(radian) * radius);
      const y = r6(Math.sin(radian) * radius * yf);

      return {
        ...planet,
        sign: displaySignData.sign,
        degree: Math.floor(displaySignData.degreeInSign),
        minute: Math.round((displaySignData.degreeInSign % 1) * 60),
        eclipticLongitude: displayLongitude,
        adjustedLong,
        angle,
        x,
        y,
      };
    });
  }, [birthChart, tropicalAscendantAngle, yf, zodiacSystem]);

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

    return signs.map((sign, index) => {
      const signStart = index * 30;
      const signMid = signStart + 15;
      const displayMid = convertLongitudeToZodiacSystem(
        signMid,
        0,
        zodiacSystem,
      );
      const adjustedMid = (displayMid - tropicalAscendantAngle + 360) % 360;
      const angle = (180 + adjustedMid) % 360;
      const radian = (angle * Math.PI) / 180;
      const radius = 100;
      const x = r6(Math.cos(radian) * radius);
      const y = r6(Math.sin(radian) * radius * yf);

      const startAdjusted =
        (convertLongitudeToZodiacSystem(signStart, 0, zodiacSystem) -
          tropicalAscendantAngle +
          360) %
        360;
      const endAdjusted =
        (convertLongitudeToZodiacSystem(signStart + 30, 0, zodiacSystem) -
          tropicalAscendantAngle +
          360) %
        360;
      return { sign, angle, x, y, startAdjusted, endAdjusted };
    });
  }, [tropicalAscendantAngle, yf, zodiacSystem]);

  const houseData = useMemo(() => {
    if (houseSystem === 'whole-sign') {
      const startOfFirstHouse = Math.floor(tropicalAscendantAngle / 30) * 30;
      return Array.from({ length: 12 }, (_, i) => {
        const houseLongitude = (startOfFirstHouse + i * 30) % 360;
        const adjustedLong =
          (houseLongitude - tropicalAscendantAngle + 360) % 360;
        const angle = (180 + adjustedLong) % 360;
        const radian = (angle * Math.PI) / 180;
        return {
          house: i + 1,
          eclipticLongitude: houseLongitude,
          adjustedLong,
          angle,
          radian,
        };
      });
    }

    if (houses && houses.length > 0) {
      return houses.map((house) => {
        const adjustedLong =
          (house.eclipticLongitude - tropicalAscendantAngle + 360) % 360;
        const angle = (180 + adjustedLong) % 360;
        const radian = (angle * Math.PI) / 180;
        return { ...house, adjustedLong, angle, radian };
      });
    }
    return Array.from({ length: 12 }, (_, i) => {
      const houseStart = i * 30;
      const adjustedLong = houseStart;
      const angle = (180 + adjustedLong) % 360;
      const radian = (angle * Math.PI) / 180;
      return {
        house: i + 1,
        eclipticLongitude: (tropicalAscendantAngle + houseStart) % 360,
        adjustedLong,
        angle,
        radian,
      };
    });
  }, [houses, tropicalAscendantAngle, houseSystem]);

  const mainPlanets = chartData.filter((p) => MAIN_PLANETS.includes(p.body));
  const angles = chartData.filter((p) => ANGLES.includes(p.body));
  const points = chartData.filter((p) => POINTS.includes(p.body));
  const asteroids = chartData.filter((p) => ASTEROIDS.includes(p.body));

  const natalMoonPhase = useMemo(() => {
    const sun = birthChart.find((p) => p.body === 'Sun');
    const moon = birthChart.find((p) => p.body === 'Moon');
    if (!sun || !moon) return null;
    return illuminationFromLongitudes(
      sun.eclipticLongitude,
      moon.eclipticLongitude,
    );
  }, [birthChart]);

  const allAspects = useAspects(chartData);

  const aspects = useMemo(() => {
    let filtered = allAspects;
    if (!showAsteroids) {
      filtered = filtered.filter(
        (a) => !ASTEROIDS.includes(a.planet1) && !ASTEROIDS.includes(a.planet2),
      );
    }
    if (aspectFilter === 'harmonious') {
      filtered = filtered.filter((a) =>
        ['Trine', 'Sextile', 'Conjunction'].includes(a.type),
      );
    } else if (aspectFilter === 'challenging') {
      filtered = filtered.filter((a) =>
        ['Square', 'Opposition'].includes(a.type),
      );
    }
    return filtered;
  }, [allAspects, aspectFilter, showAsteroids]);

  const progressive = scale >= 1.3;
  const allRenderableBodies = [
    ...mainPlanets,
    ...angles,
    ...(showPoints && progressive
      ? points
      : showPoints && scale < 1.3
        ? []
        : []),
    ...(showAsteroids && progressive ? asteroids : []),
  ];

  const highlightedPlanet = selectedBody ?? hoveredBody;
  const selectedChartBody = selectedBody
    ? (chartData.find((p) => p.body === selectedBody) ?? null)
    : null;

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 280 - 140;
    const py = ((e.clientY - rect.top) / rect.height) * 280 - 140;
    setCursor({ x: px, y: py });
  };

  const handleSvgMouseLeave = () => setCursor(null);

  const handleBodyTap = (body: string) => {
    setSelectedBody((s) => (s === body ? null : body));
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

  return (
    <div className='flex flex-col items-center space-y-4 md:space-y-6'>
      <div className='text-center'>
        <h2 className='text-lg md:text-xl font-bold text-content-primary mb-2'>
          {userName ? `${userName}'s Birth Chart` : 'Birth Chart'}
        </h2>
        {birthDate && (
          <p className='text-content-muted text-xs md:text-sm'>
            {(() => {
              const parsed = parseIsoDateOnly(birthDate);
              if (!parsed) return birthDate;
              return new Intl.DateTimeFormat(undefined, {
                dateStyle: 'long',
              }).format(parsed);
            })()}
          </p>
        )}
      </div>

      {/* Color Legend */}
      <div className='bg-surface-elevated/50 border border-stroke-subtle rounded-lg p-3 w-full max-w-[360px] md:max-w-[440px]'>
        <h3 className='text-xs font-semibold text-content-muted mb-2'>
          Planet Colors
        </h3>
        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='flex items-center gap-2'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: ELEMENT_COLORS.Fire }}
            />
            <span className='text-content-secondary'>
              Fire (Aries, Leo, Sag)
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: ELEMENT_COLORS.Earth }}
            />
            <span className='text-content-secondary'>
              Earth (Tau, Vir, Cap)
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: ELEMENT_COLORS.Air }}
            />
            <span className='text-content-secondary'>Air (Gem, Lib, Aqu)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: ELEMENT_COLORS.Water }}
            />
            <span className='text-content-secondary'>
              Water (Can, Sco, Pis)
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-[#C77DFF]' />
            <span className='text-content-secondary'>Angles (AC, MC, DC)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-[#FCD34D]' />
            <span className='text-content-secondary'>Asteroids</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-[#f87171]' />
            <span className='text-content-secondary'>Retrograde</span>
          </div>
        </div>
      </div>

      <div
        ref={wrapRef}
        className='relative w-full max-w-[360px] md:max-w-[440px] aspect-square touch-none select-none'
        {...handlers}
      >
        {scale > 1 && (
          <button
            onClick={reset}
            className='absolute right-2 top-2 z-10 rounded-full bg-surface-elevated/80 px-2 py-1 text-[10px] text-content-muted backdrop-blur hover:text-content-primary'
          >
            Reset zoom
          </button>
        )}

        <motion.svg
          viewBox='-140 -140 280 280'
          className='chart-wheel-svg w-full h-full rounded-full bg-transparent'
          role='img'
          aria-label={
            userName ? `${userName}'s astrological birth chart` : 'Birth chart'
          }
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={handleSvgMouseLeave}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => {
            if (suppressTap()) return;
            if (
              e.target instanceof Element &&
              e.target.closest('[data-body-node]')
            ) {
              return;
            }
            setSelectedBody(null);
          }}
        >
          <defs>
            <radialGradient id={`cursorGlow-${uid}`} cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stopColor='#ffffff' stopOpacity='0.25' />
              <stop offset='60%' stopColor='#ffffff' stopOpacity='0.05' />
              <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
            </radialGradient>
            <linearGradient
              id={`sun-${uid}`}
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'
            >
              <stop offset='0%' stopColor='#ffe08a' />
              <stop offset='100%' stopColor='#ff7a45' />
            </linearGradient>
            <linearGradient
              id={`moon-${uid}`}
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'
            >
              <stop offset='0%' stopColor='#e8ecff' />
              <stop offset='100%' stopColor='#8b9cf9' />
            </linearGradient>
            <filter
              id={`soft-${uid}`}
              x='-50%'
              y='-50%'
              width='200%'
              height='200%'
            >
              <feGaussianBlur stdDeviation='2' result='b' />
              <feMerge>
                <feMergeNode in='b' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
          </defs>

          <g>
            <CosmicBackdrop seed={7} />
          </g>

          <motion.g
            animate={{
              translateX: tx / 3,
              translateY: ty / 3,
            }}
            transition={{
              translateX: { type: 'spring', stiffness: 200, damping: 30 },
              translateY: { type: 'spring', stiffness: 200, damping: 30 },
            }}
          >
            <motion.g
              animate={{ scale }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              style={{ originX: 0, originY: 0 }}
            >
              {/* Ring circles */}
              <circle
                cx='0'
                cy='0'
                r='120'
                fill='none'
                stroke='#3f3f46'
                strokeWidth='0.8'
                opacity='0.7'
              />
              <circle
                cx='0'
                cy='0'
                r='85'
                fill='none'
                stroke='#3f3f46'
                strokeWidth='0.8'
                opacity='0.5'
              />
              <circle
                cx='0'
                cy='0'
                r='50'
                fill='none'
                stroke='#27272a'
                strokeWidth='0.6'
                opacity='0.5'
              />

              {/* Element-tinted zodiac sector fills */}
              {zodiacSigns.map(({ sign, startAdjusted, endAdjusted }, i) => {
                const a1 = ((180 + startAdjusted) % 360) * (Math.PI / 180);
                const a2 = ((180 + endAdjusted) % 360) * (Math.PI / 180);
                const rOuter = 120;
                const rInner = 85;
                const sweep =
                  (endAdjusted - startAdjusted + 360) % 360 > 180 ? 1 : 0;
                const x1 = r6(Math.cos(a1) * rOuter);
                const y1 = r6(Math.sin(a1) * rOuter * yf);
                const x2 = r6(Math.cos(a2) * rOuter);
                const y2 = r6(Math.sin(a2) * rOuter * yf);
                const x3 = r6(Math.cos(a2) * rInner);
                const y3 = r6(Math.sin(a2) * rInner * yf);
                const x4 = r6(Math.cos(a1) * rInner);
                const y4 = r6(Math.sin(a1) * rInner * yf);
                const color = getSignElementColor(sign);
                return (
                  <path
                    key={`sector-${i}`}
                    d={`M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${sweep} ${yf === 1 ? 1 : 0} ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${sweep} ${yf === 1 ? 0 : 1} ${x4} ${y4} Z`}
                    fill={color}
                    opacity='0.08'
                  />
                );
              })}

              {/* Aspects (bezier, motion-animated) */}
              {showAspects && (
                <AspectLines
                  aspects={aspects}
                  visible={showAspects}
                  highlightedPlanet={highlightedPlanet}
                  opacity={0.32}
                  onAspectClick={setSelectedAspect}
                  innerRadius={60}
                />
              )}

              {/* House lines */}
              {houseData.map((house, i) => {
                const radian = house.radian;
                const x1 = r6(Math.cos(radian) * 50);
                const y1 = r6(Math.sin(radian) * 50 * yf);
                const x2 = r6(Math.cos(radian) * 85);
                const y2 = r6(Math.sin(radian) * 85 * yf);
                const isAngular = [1, 4, 7, 10].includes(house.house);
                return (
                  <line
                    key={`house-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isAngular ? '#7B7BE8' : '#52525b'}
                    strokeWidth={isAngular ? 1.5 : 0.5}
                    opacity={isAngular ? 0.8 : 0.4}
                  />
                );
              })}

              {houseData.map((house, i) => {
                const nextHouse = houseData[(i + 1) % 12];
                const midAngle = (house.angle + nextHouse.angle) / 2;
                const adjustedMid =
                  house.angle > nextHouse.angle
                    ? ((house.angle + nextHouse.angle + 360) / 2) % 360
                    : midAngle;
                const radian = (adjustedMid * Math.PI) / 180;
                const radius = 38;
                const x = r6(Math.cos(radian) * radius);
                const y = r6(Math.sin(radian) * radius * yf);

                return (
                  <text
                    key={`house-num-${i}`}
                    x={x}
                    y={y}
                    textAnchor='middle'
                    dominantBaseline='central'
                    className='fill-zinc-500'
                    fontSize='8'
                  >
                    {house.house}
                  </text>
                );
              })}

              {/* Zodiac division ticks */}
              {Array.from({ length: 12 }, (_, i) => {
                const signStart = i * 30;
                const displayStart = convertLongitudeToZodiacSystem(
                  signStart,
                  0,
                  zodiacSystem,
                );
                const adjustedStart =
                  (displayStart - tropicalAscendantAngle + 360) % 360;
                const angle = (180 + adjustedStart) % 360;
                const radian = (angle * Math.PI) / 180;
                const x1 = r6(Math.cos(radian) * 85);
                const y1 = r6(Math.sin(radian) * 85 * yf);
                const x2 = r6(Math.cos(radian) * 120);
                const y2 = r6(Math.sin(radian) * 120 * yf);
                return (
                  <line
                    key={`sign-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke='#52525b'
                    strokeWidth='0.5'
                    opacity='0.5'
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
                  fontSize='12'
                  fill={getSignElementColor(sign)}
                  opacity='0.95'
                >
                  {
                    zodiacSymbol[
                      sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </text>
              ))}

              {/* Planets */}
              {allRenderableBodies.map((p, idx) => {
                const {
                  body,
                  x,
                  y,
                  retrograde,
                  sign,
                  degree,
                  minute,
                  eclipticLongitude,
                } = p;
                const isAngle = ANGLES.includes(body);
                const isPoint = POINTS.includes(body);
                const isPlanet = MAIN_PLANETS.includes(body);
                const isAsteroid = ASTEROIDS.includes(body);
                const isHovered = body === hoveredBody;
                const isSelected = body === selectedBody;
                const hasSelection = selectedBody != null;
                const isAspected = selectedBody
                  ? aspects.some(
                      (a) =>
                        (a.planet1 === selectedBody && a.planet2 === body) ||
                        (a.planet2 === selectedBody && a.planet1 === body),
                    )
                  : false;
                const dimmed = hasSelection && !isSelected && !isAspected;
                const displaySign = sign;
                const elementColor =
                  isPlanet && displaySign && SIGN_ELEMENTS[displaySign]
                    ? ELEMENT_COLORS[SIGN_ELEMENTS[displaySign]]
                    : undefined;
                const baseColor = retrograde
                  ? '#f87171'
                  : isAngle
                    ? '#C77DFF'
                    : isPoint
                      ? '#7B7BE8'
                      : isAsteroid
                        ? '#FCD34D'
                        : elementColor || '#ffffff';
                const glyphFill =
                  body === 'Sun'
                    ? `url(#sun-${uid})`
                    : body === 'Moon'
                      ? `url(#moon-${uid})`
                      : isHovered || isSelected
                        ? '#ffffff'
                        : baseColor;

                const symbol = getSymbolForBody(body);
                const isAstroFont =
                  symbol.length === 1 && symbol.charCodeAt(0) < 128;

                return (
                  <motion.g
                    key={body}
                    data-body-node
                    initial={{ opacity: 0, y: -8 }}
                    animate={{
                      opacity: dimmed ? 0.3 : 1,
                      y: 0,
                    }}
                    transition={{
                      delay: Math.min(idx * 0.04, 0.7),
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onMouseEnter={() => setHoveredBody(body)}
                    onMouseLeave={() => setHoveredBody(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (suppressTap()) return;
                      handleBodyTap(body);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>
                      {formatPlacementLabel({
                        body,
                        sign: displaySign,
                        degree,
                        minute,
                        retrograde,
                        eclipticLongitude,
                      })}
                    </title>
                    {/* Radial spoke */}
                    <line
                      x1='0'
                      y1='0'
                      x2={x}
                      y2={y}
                      stroke={baseColor}
                      strokeWidth={isSelected ? 0.6 : 0.3}
                      opacity={isSelected ? 0.45 : 0.18}
                    />
                    {/* Bloom (dual-stroke trick) */}
                    {(isSelected || isHovered) && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={14}
                        fill={baseColor}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.25 }}
                        exit={{ opacity: 0 }}
                        style={{ filter: 'blur(5px)' }}
                      />
                    )}
                    {/* Selection ring — static glow, no infinite pulse */}
                    {isSelected && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={9}
                        fill='none'
                        stroke={baseColor}
                        strokeWidth={1}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.65 }}
                        transition={{ duration: 0.25 }}
                      />
                    )}
                    {/* Aspected-planet ring — static, dimmer */}
                    {hasSelection && isAspected && !isSelected && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={7}
                        fill='none'
                        stroke={baseColor}
                        strokeWidth={0.4}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.45 }}
                        transition={{ duration: 0.25 }}
                      />
                    )}
                    {body === 'Moon' && natalMoonPhase ? (
                      <motion.g
                        animate={{ scale: isSelected ? 1.18 : 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 320,
                          damping: 22,
                        }}
                        style={{ originX: x, originY: y }}
                      >
                        <MoonPhase
                          cx={x}
                          cy={y}
                          r={6}
                          phase={0}
                          illumination={natalMoonPhase.illumination}
                          waxing={natalMoonPhase.waxing}
                          id={`natal-moon-${uid}`}
                          glow={isSelected || isHovered}
                        />
                      </motion.g>
                    ) : (
                      <motion.text
                        x={x}
                        y={y}
                        textAnchor='middle'
                        dominantBaseline='central'
                        className={cx(
                          'planet-glyph',
                          isAstroFont && 'font-astro',
                        )}
                        fontSize={
                          isAngle || isPoint ? '12' : isAsteroid ? '11' : '14'
                        }
                        fill={glyphFill}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.92 }}
                        animate={{ scale: isSelected ? 1.18 : 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 320,
                          damping: 22,
                        }}
                        style={{ originX: x, originY: y }}
                      >
                        {symbol}
                      </motion.text>
                    )}
                    {/* Invisible touch target */}
                    <circle
                      cx={x}
                      cy={y}
                      r='14'
                      fill='transparent'
                      pointerEvents='all'
                    />
                  </motion.g>
                );
              })}

              {/* Cursor-follow glow */}
              {cursor && !selectedBody && (
                <circle
                  cx={cursor.x}
                  cy={cursor.y}
                  r='40'
                  fill={`url(#cursorGlow-${uid})`}
                  pointerEvents='none'
                />
              )}
            </motion.g>
          </motion.g>
        </motion.svg>

        {/* Mobile hint */}
        {!selectedBody && scale === 1 && (
          <AnimatePresence>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className='pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-content-muted'
            >
              tap a planet · pinch to zoom
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      {/* Planetary positions list */}
      <div className='w-full max-w-2xl sm:max-w-3xl md:max-w-4xl px-2'>
        <div className='flex items-center justify-between mb-2 md:mb-3'>
          <h3 className='text-base md:text-lg font-semibold text-lunary-secondary'>
            Planetary Positions
          </h3>
          {onToggleSymbols && (
            <button
              onClick={onToggleSymbols}
              className='text-xs text-content-muted hover:text-content-secondary transition-colors'
            >
              {showSymbols ? 'Show names' : 'Show symbols'}
            </button>
          )}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
          {mainPlanets.map(
            ({ body, sign, degree, minute, retrograde, house }) => {
              const displaySign = sign;
              return (
                <button
                  key={body}
                  onClick={() => handleBodyTap(body)}
                  className={cx(
                    'flex items-center justify-between p-2 md:p-3 bg-surface-elevated rounded-lg transition-colors text-left',
                    selectedBody === body && 'ring-1 ring-lunary-primary',
                  )}
                >
                  <div className='flex items-center space-x-2 md:space-x-3'>
                    {showSymbols ? (
                      <span
                        className={cx(
                          'text-base md:text-lg font-astro',
                          retrograde ? 'text-red-400' : 'text-content-primary',
                        )}
                      >
                        {getSymbolForBody(body)}
                      </span>
                    ) : (
                      <span className='font-medium text-content-primary text-sm md:text-base'>
                        {body}
                      </span>
                    )}
                  </div>

                  <div className='flex items-center space-x-1.5 md:space-x-2 text-xs md:text-sm'>
                    <span className='text-content-secondary'>
                      {degree}°{minute.toString().padStart(2, '0')}&apos;
                    </span>
                    <span className='text-base md:text-lg font-astro'>
                      {
                        zodiacSymbol[
                          displaySign.toLowerCase() as keyof typeof zodiacSymbol
                        ]
                      }
                    </span>
                    <span className='text-content-muted hidden sm:inline'>
                      {displaySign}
                    </span>
                    {house && (
                      <span className='text-content-muted text-xs'>
                        H{house}
                      </span>
                    )}
                    {retrograde && (
                      <span className='text-red-400 text-xs font-medium'>
                        ℞
                      </span>
                    )}
                  </div>
                </button>
              );
            },
          )}
        </div>

        {angles.length > 0 && (
          <>
            <h3 className='text-base md:text-lg font-semibold text-lunary-accent mb-2 md:mb-3 mt-4'>
              Chart Angles
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {angles.map(({ body, sign, degree, minute }) => {
                const displaySign = sign;
                return (
                  <button
                    key={body}
                    onClick={() => handleBodyTap(body)}
                    className={cx(
                      'flex items-center justify-between p-2 md:p-3 bg-surface-elevated rounded-lg text-left',
                      selectedBody === body && 'ring-1 ring-lunary-primary',
                    )}
                  >
                    <div className='flex items-center space-x-2 md:space-x-3'>
                      {showSymbols ? (
                        <span className='text-base md:text-lg font-astro text-lunary-accent'>
                          {getSymbolForBody(body)}
                        </span>
                      ) : (
                        <span className='font-medium text-content-primary text-sm md:text-base'>
                          {ANGLE_DISPLAY[body] || body}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center space-x-1.5 md:space-x-2 text-xs md:text-sm'>
                      <span className='text-content-secondary'>
                        {degree}°{minute.toString().padStart(2, '0')}&apos;
                      </span>
                      <span className='text-base md:text-lg font-astro'>
                        {
                          zodiacSymbol[
                            displaySign.toLowerCase() as keyof typeof zodiacSymbol
                          ]
                        }
                      </span>
                      <span className='text-content-muted hidden sm:inline'>
                        {displaySign}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {points.length > 0 && showPoints && (
          <>
            <h3 className='text-base md:text-lg font-semibold text-lunary-secondary mb-2 md:mb-3 mt-4'>
              Sensitive Points
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {points.map(({ body, sign, degree, minute, retrograde }) => {
                const pointSymbol = getSymbolForBody(body);
                const useAstroFont =
                  pointSymbol.length === 1 && pointSymbol.charCodeAt(0) < 128;
                const displaySign = sign;
                return (
                  <button
                    key={body}
                    onClick={() => handleBodyTap(body)}
                    className={cx(
                      'flex items-center justify-between p-2 md:p-3 bg-surface-elevated rounded-lg text-left',
                      selectedBody === body && 'ring-1 ring-lunary-primary',
                    )}
                  >
                    <div className='flex items-center space-x-2 md:space-x-3'>
                      {showSymbols ? (
                        <span
                          className={cx(
                            'text-base md:text-lg',
                            useAstroFont && 'font-astro',
                            retrograde
                              ? 'text-red-400'
                              : 'text-lunary-secondary',
                          )}
                        >
                          {pointSymbol}
                        </span>
                      ) : (
                        <span className='font-medium text-content-primary text-sm md:text-base'>
                          {body}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center space-x-1.5 md:space-x-2 text-xs md:text-sm'>
                      <span className='text-content-secondary'>
                        {degree}°{minute.toString().padStart(2, '0')}&apos;
                      </span>
                      <span className='text-base md:text-lg font-astro'>
                        {
                          zodiacSymbol[
                            displaySign.toLowerCase() as keyof typeof zodiacSymbol
                          ]
                        }
                      </span>
                      <span className='text-content-muted hidden sm:inline'>
                        {displaySign}
                      </span>
                      {retrograde && (
                        <span className='text-red-400 text-xs font-medium'>
                          ℞
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <AspectDetailModal
          aspect={selectedAspect}
          onClose={() => setSelectedAspect(null)}
        />
        <PlanetBottomSheet
          planet={selectedChartBody as BirthChartData | null}
          aspects={aspects}
          onClose={() => setSelectedBody(null)}
        />
      </div>
    </div>
  );
};
