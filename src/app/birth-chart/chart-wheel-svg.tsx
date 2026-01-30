'use client';

import React, { useState } from 'react';
import type {
  BirthChartData,
  HouseCusp,
} from '../../../utils/astrology/birthChart';
import {
  bodiesSymbols,
  zodiacSymbol,
  astroPointSymbols,
} from '../../../utils/zodiac/zodiac';
import { useAspects } from '@/hooks/useAspects';
import { AspectLines } from '@/components/AspectLines';

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
const ANGLES = ['Ascendant', 'Descendant', 'Midheaven'];
const POINTS = ['North Node', 'South Node', 'Chiron', 'Lilith'];
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
  const key = body
    .toLowerCase()
    .replace(/\s+/g, '') as keyof typeof bodiesSymbols;
  if (bodiesSymbols[key]) return bodiesSymbols[key];

  const pointKey = body
    .toLowerCase()
    .replace(/\s+/g, '') as keyof typeof astroPointSymbols;
  if (astroPointSymbols[pointKey]) return astroPointSymbols[pointKey];

  return body.charAt(0);
}

function formatPlacementLabel({
  body,
  sign,
  degree,
  minute,
  retrograde,
}: Pick<BirthChartData, 'body' | 'sign' | 'degree' | 'minute' | 'retrograde'>) {
  const hasDegree = Number.isFinite(degree) && Number.isFinite(minute);
  const degreeLabel = hasDegree
    ? `${Math.floor(degree)}°${String(Math.floor(minute)).padStart(2, '0')}'`
    : undefined;
  const signLabel = sign ? ` in ${sign}` : '';
  const retroLabel = retrograde ? ' ℞' : '';
  return `${body}${signLabel}${degreeLabel ? ` ${degreeLabel}` : ''}${retroLabel}`;
}

function polarFromLongitude(
  longitude: number,
  ascendantAngle: number,
  radius: number,
) {
  const adjustedLong = (longitude - ascendantAngle + 360) % 360;
  const angle = (180 + adjustedLong) % 360;
  const radian = (angle * Math.PI) / 180;
  return {
    angle,
    radian,
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius,
  };
}

export function ChartWheelSvg({
  birthChart,
  houses,
  size = 280,
  showHouseNumbers = true,
  showAspects = false,
  colours = {
    ring: '#3f3f46',
    ringInner: '#27272a',
    signLines: '#52525b',
    zodiac: '#71717a',
    planet: '#ffffff',
    angle: '#C77DFF',
    point: '#7B7BE8',
    asteroid: '#FCD34D',
    retrograde: '#f87171',
    angularHouse: '#7B7BE8',
    bg: '#18181b',
  },
  fontFamilySymbols = 'Astronomicon',
}: {
  birthChart: BirthChartData[];
  houses?: Partial<HouseCusp>[] | null;
  size?: number;
  showHouseNumbers?: boolean;
  showAspects?: boolean;
  colours?: Partial<{
    ring: string;
    ringInner: string;
    signLines: string;
    zodiac: string;
    planet: string;
    angle: string;
    point: string;
    asteroid: string;
    retrograde: string;
    angularHouse: string;
    bg: string;
  }>;
  fontFamilySymbols?: string;
}) {
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const ascendantAngle = ascendant?.eclipticLongitude ?? 0;
  const hoverColor = '#FDE68A';
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(
    null,
  );

  const chartData = birthChart.map((p) => {
    const pos = polarFromLongitude(p.eclipticLongitude, ascendantAngle, 65);
    return { ...p, ...pos };
  });

  const zodiacSigns = [
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
  ].map((sign, index) => {
    const signMid = index * 30 + 15;
    const pos = polarFromLongitude(signMid, ascendantAngle, 100);
    return { sign, ...pos };
  });

  const houseData = (() => {
    if (houses && houses.length > 0) {
      return houses.map((h) => {
        const pos = polarFromLongitude(
          h.eclipticLongitude || 0,
          ascendantAngle,
          0,
        );
        return { ...h, ...pos };
      });
    }

    return Array.from({ length: 12 }, (_, i) => {
      const houseStart = i * 30;
      const longitude = (ascendantAngle + houseStart) % 360;
      const pos = polarFromLongitude(longitude, ascendantAngle, 0);
      return {
        house: i + 1,
        eclipticLongitude: longitude,
        ...pos,
      };
    });
  })();

  const mainPlanets = chartData.filter((p) => MAIN_PLANETS.includes(p.body));
  const angles = chartData.filter((p) => ANGLES.includes(p.body));
  const points = chartData.filter((p) => POINTS.includes(p.body));
  const asteroids = chartData.filter((p) => ASTEROIDS.includes(p.body));

  const aspects = useAspects(chartData);

  const view = '-140 -140 280 280';

  return (
    <svg
      width={size}
      height={size}
      viewBox={view}
      style={{
        borderRadius: 9999,
        background: colours.bg,
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes planetAppear {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .planet-node {
          cursor: pointer;
          animation: planetAppear 0.3s ease-out both;
        }
        .planet-node:nth-child(1) { animation-delay: 0.05s; }
        .planet-node:nth-child(2) { animation-delay: 0.10s; }
        .planet-node:nth-child(3) { animation-delay: 0.15s; }
        .planet-node:nth-child(4) { animation-delay: 0.20s; }
        .planet-node:nth-child(5) { animation-delay: 0.25s; }
        .planet-node .planet-highlight { opacity: 0; transition: opacity 0.2s; }
        .planet-node:hover .planet-highlight { opacity: 0.2; }
        .planet-node .planet-line { transition: stroke 0.2s, opacity 0.2s; }
        .planet-node:hover .planet-line { stroke: ${hoverColor}; opacity: 0.6; }
        .planet-node .planet-glyph {
          transition: fill 0.2s, transform 0.3s;
        }
        .planet-node:hover .planet-glyph {
          fill: ${hoverColor};
          transform: scale(1.1);
        }
      `}</style>
      {/* Rings */}
      <circle
        cx='0'
        cy='0'
        r='120'
        fill='none'
        stroke={colours.ring}
        strokeWidth='1'
      />
      <circle
        cx='0'
        cy='0'
        r='85'
        fill='none'
        stroke={colours.ring}
        strokeWidth='1'
      />
      <circle
        cx='0'
        cy='0'
        r='50'
        fill='none'
        stroke={colours.ringInner}
        strokeWidth='1'
      />

      {/* Aspect lines */}
      {showAspects && (
        <AspectLines
          aspects={aspects}
          visible={showAspects}
          highlightedPlanet={highlightedPlanet}
          opacity={0.15}
        />
      )}

      {/* Houses */}
      {houseData.map((h, i) => {
        const x1 = Math.cos(h.radian) * 50;
        const y1 = Math.sin(h.radian) * 50;
        const x2 = Math.cos(h.radian) * 85;
        const y2 = Math.sin(h.radian) * 85;

        const isAngular = [1, 4, 7, 10].includes(h.house || 0);

        return (
          <line
            key={`house-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isAngular ? colours.angularHouse : colours.signLines}
            strokeWidth={isAngular ? 1.5 : 0.5}
            opacity={isAngular ? 0.8 : 0.4}
          />
        );
      })}

      {/* House numbers */}
      {showHouseNumbers &&
        houseData.map((h, i) => {
          const next = houseData[(i + 1) % 12];
          const midAngle =
            h.angle > next.angle
              ? ((h.angle + next.angle + 360) / 2) % 360
              : (h.angle + next.angle) / 2;
          const rad = (midAngle * Math.PI) / 180;
          const r = 38;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;

          return (
            <text
              key={`house-num-${i}`}
              x={x}
              y={y}
              textAnchor='middle'
              dominantBaseline='central'
              fontSize='9'
              fill='rgba(161,161,170,0.7)'
            >
              {h.house}
            </text>
          );
        })}

      {/* Sign divider lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const start = i * 30;
        const pos = polarFromLongitude(start, ascendantAngle, 0);
        const x1 = Math.cos(pos.radian) * 85;
        const y1 = Math.sin(pos.radian) * 85;
        const x2 = Math.cos(pos.radian) * 120;
        const y2 = Math.sin(pos.radian) * 120;

        return (
          <line
            key={`sign-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colours.signLines}
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
          fontSize='12'
          fill={colours.zodiac}
          style={{ fontFamily: fontFamilySymbols }}
        >
          {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
        </text>
      ))}

      {/* Planets + angles + points + asteroids */}
      {[...mainPlanets, ...angles, ...points, ...asteroids].map(
        ({ body, x, y, retrograde, sign, degree, minute }) => {
          const isAngle = ANGLES.includes(body);
          const isPoint = POINTS.includes(body);
          const isAsteroid = ASTEROIDS.includes(body);

          const colour = retrograde
            ? colours.retrograde
            : isAngle
              ? colours.angle
              : isPoint
                ? colours.point
                : isAsteroid
                  ? colours.asteroid
                  : colours.planet;

          return (
            <g
              key={body}
              className='planet-node'
              onClick={() =>
                setHighlightedPlanet(highlightedPlanet === body ? null : body)
              }
            >
              <title>
                {formatPlacementLabel({
                  body,
                  sign,
                  degree,
                  minute,
                  retrograde,
                })}
              </title>
              <circle
                className='planet-highlight'
                cx={x}
                cy={y}
                r={isAngle || isPoint ? 10 : 9}
                fill={hoverColor}
              />
              <line
                x1='0'
                y1='0'
                x2={x}
                y2={y}
                stroke={colour}
                strokeWidth='0.3'
                opacity='0.2'
                className='planet-line'
              />
              <text
                x={x}
                y={y}
                textAnchor='middle'
                dominantBaseline='central'
                fontSize={isAsteroid ? '11' : isAngle || isPoint ? '12' : '14'}
                fill={colour}
                style={{ fontFamily: fontFamilySymbols }}
                className='planet-glyph'
              >
                {getSymbolForBody(body)}
              </text>
            </g>
          );
        },
      )}
    </svg>
  );
}
