'use client';

import { useMemo } from 'react';
import { BirthChartData, HouseCusp } from '../../utils/astrology/birthChart';
import {
  bodiesSymbols,
  zodiacSymbol,
  astroPointSymbols,
} from '../../utils/zodiac/zodiac';
import classNames from 'classnames';

const cx = classNames;

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
const ANGLES = ['Ascendant', 'Midheaven'];
const ANGLE_DISPLAY: Record<string, string> = {
  Ascendant: 'Rising',
  Midheaven: 'Midheaven',
};
const POINTS = ['North Node', 'South Node', 'Chiron', 'Lilith'];

function getSymbolForBody(body: string): string {
  const key = body
    .toLowerCase()
    .replace(/\s+/g, '') as keyof typeof bodiesSymbols;
  if (bodiesSymbols[key]) {
    return bodiesSymbols[key];
  }
  const pointKey = body
    .toLowerCase()
    .replace(/\s+/g, '') as keyof typeof astroPointSymbols;
  if (astroPointSymbols[pointKey]) {
    return astroPointSymbols[pointKey];
  }
  return body.charAt(0);
}

type BirthChartProps = {
  birthChart: BirthChartData[];
  houses?: HouseCusp[];
  userName?: string;
  birthDate?: string;
};

export const BirthChart = ({
  birthChart,
  houses,
  userName,
  birthDate,
}: BirthChartProps) => {
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const ascendantAngle = ascendant ? ascendant.eclipticLongitude : 0;

  const chartData = useMemo(() => {
    return birthChart.map((planet) => {
      const adjustedLong =
        (planet.eclipticLongitude - ascendantAngle + 360) % 360;
      const angle = (270 - adjustedLong + 360) % 360;
      const radian = (angle * Math.PI) / 180;

      const radius = 65;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      return {
        ...planet,
        adjustedLong,
        angle,
        x,
        y,
      };
    });
  }, [birthChart, ascendantAngle]);

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
      const adjustedMid = (signMid - ascendantAngle + 360) % 360;
      const angle = (270 - adjustedMid + 360) % 360;
      const radian = (angle * Math.PI) / 180;
      const radius = 100;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      return { sign, angle, x, y };
    });
  }, [ascendantAngle]);

  const houseData = useMemo(() => {
    if (houses && houses.length > 0) {
      return houses.map((house) => {
        const adjustedLong =
          (house.eclipticLongitude - ascendantAngle + 360) % 360;
        const angle = (270 - adjustedLong + 360) % 360;
        const radian = (angle * Math.PI) / 180;
        return { ...house, adjustedLong, angle, radian };
      });
    }
    return Array.from({ length: 12 }, (_, i) => {
      const houseStart = i * 30;
      const adjustedLong = houseStart;
      const angle = (270 - adjustedLong + 360) % 360;
      const radian = (angle * Math.PI) / 180;
      return {
        house: i + 1,
        eclipticLongitude: (ascendantAngle + houseStart) % 360,
        adjustedLong,
        angle,
        radian,
      };
    });
  }, [houses, ascendantAngle]);

  const mainPlanets = chartData.filter((p) => MAIN_PLANETS.includes(p.body));
  const angles = chartData.filter((p) => ANGLES.includes(p.body));
  const points = chartData.filter((p) => POINTS.includes(p.body));

  return (
    <div className='flex flex-col items-center space-y-4 md:space-y-6'>
      <div className='text-center'>
        <h2 className='text-lg md:text-xl font-bold text-white mb-2'>
          {userName ? `${userName}'s Birth Chart` : 'Birth Chart'}
        </h2>
        {birthDate && (
          <p className='text-zinc-400 text-xs md:text-sm'>
            {new Date(birthDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className='relative w-full max-w-[320px] md:max-w-[360px] aspect-square'>
        <svg
          viewBox='-140 -140 280 280'
          className='w-full h-full border border-zinc-700 rounded-full bg-zinc-900'
        >
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

          {houseData.map((house, i) => {
            const radian = house.radian;
            const x1 = Math.cos(radian) * 50;
            const y1 = Math.sin(radian) * 50;
            const x2 = Math.cos(radian) * 85;
            const y2 = Math.sin(radian) * 85;

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
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;

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
            const adjustedStart = (signStart - ascendantAngle + 360) % 360;
            const angle = (270 - adjustedStart + 360) % 360;
            const radian = (angle * Math.PI) / 180;
            const x1 = Math.cos(radian) * 85;
            const y1 = Math.sin(radian) * 85;
            const x2 = Math.cos(radian) * 120;
            const y2 = Math.sin(radian) * 120;

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
              className='fill-zinc-500 font-astro'
              fontSize='12'
            >
              {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
            </text>
          ))}

          {[...mainPlanets, ...angles, ...points].map(
            ({ body, x, y, retrograde }) => {
              const isAngle = ANGLES.includes(body);
              const isPoint = POINTS.includes(body);
              const color = retrograde
                ? '#f87171'
                : isAngle
                  ? '#C77DFF'
                  : isPoint
                    ? '#7B7BE8'
                    : '#ffffff';

              return (
                <g key={body}>
                  <line
                    x1='0'
                    y1='0'
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth='0.3'
                    opacity='0.2'
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor='middle'
                    dominantBaseline='central'
                    className='font-astro'
                    fontSize={isAngle || isPoint ? '12' : '14'}
                    fill={color}
                  >
                    {getSymbolForBody(body)}
                  </text>
                </g>
              );
            },
          )}

          <text
            x='125'
            y='0'
            textAnchor='middle'
            dominantBaseline='central'
            className='fill-lunary-accent font-astro'
            fontSize='10'
          >
            AC
          </text>
        </svg>
      </div>

      <div className='w-full max-w-md px-2'>
        <h3 className='text-base md:text-lg font-semibold text-lunary-secondary mb-2 md:mb-3'>
          Planetary Positions
        </h3>
        <div className='space-y-1.5 md:space-y-2'>
          {mainPlanets.map(
            ({ body, sign, degree, minute, retrograde, house }) => (
              <div
                key={body}
                className='flex items-center justify-between p-2 md:p-3 bg-zinc-800 rounded-lg'
              >
                <div className='flex items-center space-x-2 md:space-x-3'>
                  <span
                    className={cx(
                      'text-base md:text-lg font-astro',
                      retrograde ? 'text-red-400' : 'text-white',
                    )}
                  >
                    {getSymbolForBody(body)}
                  </span>
                  <span className='font-medium text-white text-sm md:text-base'>
                    {body}
                  </span>
                </div>

                <div className='flex items-center space-x-1.5 md:space-x-2 text-xs md:text-sm'>
                  <span className='text-zinc-300'>
                    {degree}°{minute.toString().padStart(2, '0')}&apos;
                  </span>
                  <span className='text-base md:text-lg font-astro'>
                    {
                      zodiacSymbol[
                        sign.toLowerCase() as keyof typeof zodiacSymbol
                      ]
                    }
                  </span>
                  <span className='text-zinc-400 hidden sm:inline'>{sign}</span>
                  {house && (
                    <span className='text-zinc-400 text-xs'>H{house}</span>
                  )}
                  {retrograde && (
                    <span className='text-red-400 text-xs font-medium'>℞</span>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        {angles.length > 0 && (
          <>
            <h3 className='text-base md:text-lg font-semibold text-lunary-accent mb-2 md:mb-3 mt-4'>
              Chart Angles
            </h3>
            <div className='space-y-1.5 md:space-y-2'>
              {angles.map(({ body, sign, degree, minute }) => (
                <div
                  key={body}
                  className='flex items-center justify-between p-2 md:p-3 bg-zinc-800 rounded-lg'
                >
                  <div className='flex items-center space-x-2 md:space-x-3'>
                    <span className='text-base md:text-lg font-astro text-lunary-accent'>
                      {getSymbolForBody(body)}
                    </span>
                    <span className='font-medium text-white text-sm md:text-base'>
                      {ANGLE_DISPLAY[body] || body}
                    </span>
                  </div>

                  <div className='flex items-center space-x-1.5 md:space-x-2 text-xs md:text-sm'>
                    <span className='text-zinc-300'>
                      {degree}°{minute.toString().padStart(2, '0')}&apos;
                    </span>
                    <span className='text-base md:text-lg font-astro'>
                      {
                        zodiacSymbol[
                          sign.toLowerCase() as keyof typeof zodiacSymbol
                        ]
                      }
                    </span>
                    <span className='text-zinc-400 hidden sm:inline'>
                      {sign}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {points.length > 0 && (
          <>
            <h3 className='text-base md:text-lg font-semibold text-lunary-secondary mb-2 md:mb-3 mt-4'>
              Sensitive Points
            </h3>
            <div className='space-y-1.5 md:space-y-2'>
              {points.map(({ body, sign, degree, minute, retrograde }) => (
                <div
                  key={body}
                  className='flex items-center justify-between p-2 md:p-3 bg-zinc-800 rounded-lg'
                >
                  <div className='flex items-center space-x-2 md:space-x-3'>
                    <span
                      className={cx(
                        'text-base md:text-lg font-astro',
                        retrograde ? 'text-red-400' : 'text-lunary-secondary',
                      )}
                    >
                      {getSymbolForBody(body)}
                    </span>
                    <span className='font-medium text-white text-sm md:text-base'>
                      {body}
                    </span>
                  </div>

                  <div className='flex items-center space-x-1.5 md:space-x-2 text-xs md:text-sm'>
                    <span className='text-zinc-300'>
                      {degree}°{minute.toString().padStart(2, '0')}&apos;
                    </span>
                    <span className='text-base md:text-lg font-astro'>
                      {
                        zodiacSymbol[
                          sign.toLowerCase() as keyof typeof zodiacSymbol
                        ]
                      }
                    </span>
                    <span className='text-zinc-400 hidden sm:inline'>
                      {sign}
                    </span>
                    {retrograde && (
                      <span className='text-red-400 text-xs font-medium'>
                        ℞
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
