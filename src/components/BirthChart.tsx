'use client';

import { useMemo, useState } from 'react';
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
import styles from './BirthChart.module.css';

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
  if (bodiesSymbols[key]) {
    return bodiesSymbols[key];
  }
  const pointKey = normalize(body) as keyof typeof astroPointSymbols;
  if (astroPointSymbols[pointKey]) {
    return astroPointSymbols[pointKey];
  }
  return body.charAt(0);
}

function formatPlacementLabel({
  body,
  sign,
  degree,
  minute,
  retrograde,
  eclipticLongitude,
  zodiacSystem,
}: Pick<
  BirthChartData,
  'body' | 'sign' | 'degree' | 'minute' | 'retrograde' | 'eclipticLongitude'
> & { zodiacSystem?: ZodiacSystem }) {
  const hasDegree = Number.isFinite(degree) && Number.isFinite(minute);
  const degreeLabel = hasDegree
    ? `${Math.floor(degree)}°${String(Math.floor(minute)).padStart(2, '0')}'`
    : undefined;

  // Get sign for the selected zodiac system
  const displaySign = sign;

  const signLabel = displaySign ? ` in ${displaySign}` : '';
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
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(
    null,
  );
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const tropicalAscendantAngle = ascendant ? ascendant.eclipticLongitude : 0;

  // Default orientation: 1st house extends from AC at 9 o'clock upward
  // toward 10 o'clock. Toggling `clockwise` flips the wheel so the 1st
  // house descends from AC toward 8 o'clock. This matches the
  // pre-house-system behavior and is shared uniformly across all house
  // systems and zodiac systems via the single `yf` multiplier below.
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

      return { sign, angle, x, y };
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
    // houseData stores radians — yf flip is applied at render time
  }, [houses, tropicalAscendantAngle, houseSystem]);

  const mainPlanets = chartData.filter((p) => MAIN_PLANETS.includes(p.body));
  const angles = chartData.filter((p) => ANGLES.includes(p.body));
  const points = chartData.filter((p) => POINTS.includes(p.body));
  const asteroids = chartData.filter((p) => ASTEROIDS.includes(p.body));

  const allAspects = useAspects(chartData);

  const asteroidNames = ASTEROIDS;
  const aspects = useMemo(() => {
    let filtered = allAspects;
    if (!showAsteroids) {
      filtered = filtered.filter(
        (a) =>
          !asteroidNames.includes(a.planet1) &&
          !asteroidNames.includes(a.planet2),
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
  }, [allAspects, aspectFilter, showAsteroids, asteroidNames]);

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
      <div className='bg-surface-elevated/50 border border-stroke-subtle rounded-lg p-3 w-full max-w-[320px] md:max-w-[360px]'>
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

      <div className='relative w-full max-w-[320px] md:max-w-[360px] aspect-square'>
        <svg
          viewBox='-140 -140 280 280'
          className={cx(
            'chart-wheel-svg w-full h-full border border-stroke-default rounded-full bg-surface-elevated',
            styles.chartWheel,
          )}
        >
          <style>{`
            .planet-glyph { transition: fill 0.2s ease; }
          `}</style>
          <circle
            cx='0'
            cy='0'
            r='120'
            fill='none'
            stroke='#3f3f46'
            strokeWidth='1'
          />
          <circle
            cx='0'
            cy='0'
            r='85'
            fill='none'
            stroke='#3f3f46'
            strokeWidth='1'
          />
          <circle
            cx='0'
            cy='0'
            r='50'
            fill='none'
            stroke='#27272a'
            strokeWidth='1'
          />

          {showAspects && (
            <AspectLines
              aspects={aspects}
              visible={showAspects}
              highlightedPlanet={highlightedPlanet}
              opacity={0.15}
              onAspectClick={setSelectedAspect}
            />
          )}

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
                className='fill-zinc-600 text-xs'
                fontSize='9'
              >
                {house.house}
              </text>
            );
          })}

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
              opacity='0.9'
            >
              {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
            </text>
          ))}

          {/* Render all planets */}
          {[
            ...mainPlanets,
            ...angles,
            ...(showPoints ? points : []),
            ...(showAsteroids ? asteroids : []),
          ].map(
            ({
              body,
              x,
              y,
              retrograde,
              sign,
              degree,
              minute,
              eclipticLongitude,
            }) => {
              const isAngle = ANGLES.includes(body);
              const isPoint = POINTS.includes(body);
              const isPlanet = MAIN_PLANETS.includes(body);
              const isAsteroid = ASTEROIDS.includes(body);
              const isHovered = body === hoveredBody;
              const symbol = getSymbolForBody(body);
              const isAstroFont =
                symbol.length === 1 && symbol.charCodeAt(0) < 128;

              // Get sign for the selected zodiac system
              const displaySign = sign;

              // Get element color for planets based on their sign
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

              const color = isHovered ? '#ffffff' : baseColor;
              const opacity = isHovered ? 1 : hoveredBody ? 0.4 : 1;

              return (
                <g
                  key={body}
                  className={cx('planet-node', styles.planetNode)}
                  onMouseEnter={() => setHoveredBody(body)}
                  onMouseLeave={() => setHoveredBody(null)}
                  onClick={() =>
                    setHighlightedPlanet(
                      highlightedPlanet === body ? null : body,
                    )
                  }
                  opacity={opacity}
                >
                  <title>
                    {formatPlacementLabel({
                      body,
                      sign: displaySign,
                      degree,
                      minute,
                      retrograde,
                      eclipticLongitude,
                      zodiacSystem,
                    })}
                  </title>
                  <line
                    x1='0'
                    y1='0'
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth={isHovered ? '0.5' : '0.3'}
                    opacity='0.2'
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor='middle'
                    dominantBaseline='central'
                    className={cx(
                      'planet-glyph',
                      isAstroFont && 'font-astro',
                      styles.planetGlyph,
                    )}
                    fontSize={
                      isAngle || isPoint ? '12' : isAsteroid ? '11' : '14'
                    }
                    fill={color}
                  >
                    {symbol}
                  </text>
                </g>
              );
            },
          )}
        </svg>
      </div>

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
            ({
              body,
              sign,
              degree,
              minute,
              retrograde,
              house,
              eclipticLongitude,
            }) => {
              const displaySign = sign;
              return (
                <div
                  key={body}
                  className='flex items-center justify-between p-2 md:p-3 bg-surface-elevated rounded-lg'
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
                </div>
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
              {angles.map(
                ({ body, sign, degree, minute, eclipticLongitude }) => {
                  const displaySign = sign;
                  return (
                    <div
                      key={body}
                      className='flex items-center justify-between p-2 md:p-3 bg-surface-elevated rounded-lg'
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
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}

        {points.length > 0 && showPoints && (
          <>
            <h3 className='text-base md:text-lg font-semibold text-lunary-secondary mb-2 md:mb-3 mt-4'>
              Sensitive Points
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {points.map(
                ({
                  body,
                  sign,
                  degree,
                  minute,
                  retrograde,
                  eclipticLongitude,
                }) => {
                  const pointSymbol = getSymbolForBody(body);
                  const useAstroFont =
                    pointSymbol.length === 1 && pointSymbol.charCodeAt(0) < 128;
                  const displaySign = sign;
                  return (
                    <div
                      key={body}
                      className='flex items-center justify-between p-2 md:p-3 bg-surface-elevated rounded-lg'
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
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}

        <AspectDetailModal
          aspect={selectedAspect}
          onClose={() => setSelectedAspect(null)}
        />
      </div>
    </div>
  );
};
