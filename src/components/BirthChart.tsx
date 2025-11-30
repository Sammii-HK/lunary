'use client';

import { useMemo } from 'react';
import { BirthChartData } from '../../utils/astrology/birthChart';
import { bodiesSymbols, zodiacSymbol } from '../../utils/zodiac/zodiac';
import classNames from 'classnames';

const cx = classNames;

type BirthChartProps = {
  birthChart: BirthChartData[];
  userName?: string;
  birthDate?: string;
};

export const BirthChart = ({
  birthChart,
  userName,
  birthDate,
}: BirthChartProps) => {
  // Calculate positions for circular chart
  const chartData = useMemo(() => {
    return birthChart.map((planet) => {
      // Convert ecliptic longitude to angle for circular positioning
      const angle = (planet.eclipticLongitude + 90) % 360; // Add 90 to start from top
      const radian = (angle * Math.PI) / 180;

      // Positions for outer ring (planets)
      const radius = 80;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      return {
        ...planet,
        angle,
        x,
        y,
      };
    });
  }, [birthChart]);

  // Group planets by sign for the zodiac ring
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
      const angle = index * 30 + 90; // 30 degrees per sign, start from top
      const radian = (angle * Math.PI) / 180;
      const radius = 110;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      const planetsInSign = chartData.filter((p) => p.sign === sign);

      return {
        sign,
        angle,
        x,
        y,
        planetsInSign,
      };
    });
  }, [chartData]);

  return (
    <div className='flex flex-col items-center space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-xl font-bold text-white mb-2'>
          {userName ? `${userName}'s Birth Chart` : 'Birth Chart'}
        </h2>
        {birthDate && (
          <p className='text-zinc-400 text-sm'>
            {new Date(birthDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Circular Chart */}
      <div className='relative'>
        <svg
          width='280'
          height='280'
          viewBox='-140 -140 280 280'
          className='border border-zinc-700 rounded-full bg-zinc-900'
        >
          {/* Zodiac sign markers */}
          {zodiacSigns.map(({ sign, x, y }) => (
            <g key={sign}>
              <text
                x={x}
                y={y}
                textAnchor='middle'
                dominantBaseline='central'
                className='fill-zinc-500 text-sm font-medium font-astro'
                fontSize='14'
              >
                {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
              </text>
            </g>
          ))}

          {/* Degree lines for major divisions */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = i * 30;
            const radian = ((angle + 90) * Math.PI) / 180;
            const innerRadius = 95;
            const outerRadius = 125;
            const x1 = Math.cos(radian) * innerRadius;
            const y1 = Math.sin(radian) * innerRadius;
            const x2 = Math.cos(radian) * outerRadius;
            const y2 = Math.sin(radian) * outerRadius;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke='#52525b'
                strokeWidth='1'
                opacity='0.3'
              />
            );
          })}

          {/* Inner circle */}
          <circle
            cx='0'
            cy='0'
            r='95'
            fill='none'
            stroke='#52525b'
            strokeWidth='1'
            opacity='0.2'
          />

          {/* Outer circle */}
          <circle
            cx='0'
            cy='0'
            r='125'
            fill='none'
            stroke='#52525b'
            strokeWidth='1'
            opacity='0.2'
          />

          {/* Planet positions */}
          {chartData.map(({ body, x, y, retrograde, sign, degree, minute }) => (
            <g key={body}>
              {/* Planet symbol */}
              <text
                x={x}
                y={y}
                textAnchor='middle'
                dominantBaseline='central'
                className={cx(
                  'font-bold font-astro',
                  retrograde ? 'fill-red-400' : 'fill-white',
                )}
                fontSize='16'
              >
                {
                  bodiesSymbols[
                    body.toLowerCase() as keyof typeof bodiesSymbols
                  ]
                }
              </text>

              {/* Connection line to center */}
              <line
                x1='0'
                y1='0'
                x2={x}
                y2={y}
                stroke={retrograde ? '#f87171' : '#d4d4d8'}
                strokeWidth='0.5'
                opacity='0.3'
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Planet details */}
      <div className='w-full max-w-md'>
        <h3 className='text-lg font-semibold text-blue-400 mb-3'>
          Planetary Positions
        </h3>
        <div className='space-y-2'>
          {chartData.map(({ body, sign, degree, minute, retrograde }) => (
            <div
              key={body}
              className='flex items-center justify-between p-3 bg-zinc-800 rounded-lg'
            >
              <div className='flex items-center space-x-3'>
                <span
                  className={cx(
                    'text-lg',
                    retrograde ? 'text-red-400' : 'text-white',
                  )}
                >
                  {
                    bodiesSymbols[
                      body.toLowerCase() as keyof typeof bodiesSymbols
                    ]
                  }
                </span>
                <span className='font-medium text-white'>{body}</span>
              </div>

              <div className='flex items-center space-x-2 text-sm'>
                <span className='text-zinc-300'>
                  {degree}°{minute.toString().padStart(2, '0')}&apos;
                </span>
                <span className='text-lg'>
                  {
                    zodiacSymbol[
                      sign.toLowerCase() as keyof typeof zodiacSymbol
                    ]
                  }
                </span>
                <span className='text-zinc-400'>{sign}</span>
                {retrograde && (
                  <span className='text-red-400 text-xs font-medium'>℞</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
