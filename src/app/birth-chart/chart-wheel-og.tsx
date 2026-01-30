import type {
  BirthChartData,
  HouseCusp,
} from '../../../utils/astrology/birthChart';
import { buildChartWheelLayout } from '../../../utils/astrology/chartWheelLayout';
import {
  astroPointSymbols,
  bodiesSymbols,
  zodiacSymbol,
} from '@/constants/symbols';

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

export function ChartWheelOg({
  birthChart,
  houses,
  size = 360,
  showTooltips = true,
}: {
  birthChart: BirthChartData[];
  houses?: HouseCusp[];
  size?: number;
  showTooltips?: boolean;
}) {
  const { ascendantAngle, chartData, zodiacSigns, houseData } =
    buildChartWheelLayout({ birthChart, houses });

  const mainPlanets = chartData.filter((p) => MAIN_PLANETS.includes(p.body));
  const angles = chartData.filter((p) => ANGLES.includes(p.body));
  const points = chartData.filter((p) => POINTS.includes(p.body));
  const asteroids = chartData.filter((p) => ASTEROIDS.includes(p.body));

  const viewBoxSize = 280;
  const scale = size / viewBoxSize;
  const center = size / 2;
  const hoverColor = '#ffffff';

  const toPixel = (value: number) => center + value * scale;

  return (
    <div
      className='chart-wheel'
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
      }}
    >
      <style>{`
        .planet-node { cursor: pointer; z-index: 1; }
        .planet-node:hover { z-index: 3; }
        .planet-glyph { transition: color 0.2s ease; }
        .chart-wheel:has(.planet-node:hover) .planet-glyph { color: #6b7280 !important; }
        .chart-wheel:has(.planet-node:hover) .planet-node:hover .planet-glyph { color: ${hoverColor} !important; }
        .planet-tooltip {
          opacity: 0;
          transform: translate(-50%, -120%);
          transition: opacity 0.2s ease;
        }
        .planet-node:hover .planet-tooltip { opacity: 1; }
      `}</style>
      <svg
        viewBox='-140 -140 280 280'
        width={size}
        height={size}
        style={{
          background: '#18181b',
          borderRadius: 9999,
          border: '1px solid #3f3f46',
        }}
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

        {Array.from({ length: 12 }, (_, i) => {
          const signStart = i * 30;
          const adjustedStart = (signStart - ascendantAngle + 360) % 360;
          const angle = (180 + adjustedStart) % 360;
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

        {[...mainPlanets, ...angles, ...points, ...asteroids].map(
          ({ body, x, y, retrograde }) => {
            const isAngle = ANGLES.includes(body);
            const isPoint = POINTS.includes(body);
            const isAsteroid = ASTEROIDS.includes(body);
            const color = retrograde
              ? '#f87171'
              : isAngle
                ? '#C77DFF'
                : isPoint
                  ? '#7B7BE8'
                  : isAsteroid
                    ? '#FCD34D'
                    : '#ffffff';

            return (
              <line
                key={`ray-${body}`}
                x1='0'
                y1='0'
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth='0.3'
                opacity='0.2'
              />
            );
          },
        )}
      </svg>

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
          <div
            key={`house-num-${i}`}
            style={{
              position: 'absolute',
              left: toPixel(x),
              top: toPixel(y),
              transform: 'translate(-50%, -50%)',
              fontSize: 18,
              color: '#52525b',
              display: 'flex',
            }}
          >
            {house.house}
          </div>
        );
      })}

      {zodiacSigns.map(({ sign, x, y }) => (
        <div
          key={sign}
          style={{
            position: 'absolute',
            left: toPixel(x),
            top: toPixel(y),
            transform: 'translate(-50%, -50%)',
            fontFamily: 'Astronomicon',
            fontSize: 32,
            color: '#71717a',
            display: 'flex',
          }}
        >
          {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
        </div>
      ))}

      {[...mainPlanets, ...angles, ...points, ...asteroids].map(
        ({ body, x, y, retrograde, sign, degree, minute }) => {
          const isAngle = ANGLES.includes(body);
          const isPoint = POINTS.includes(body);
          const isAsteroid = ASTEROIDS.includes(body);
          const color = retrograde
            ? '#f87171'
            : isAngle
              ? '#C77DFF'
              : isPoint
                ? '#7B7BE8'
                : isAsteroid
                  ? '#FCD34D'
                  : '#ffffff';

          return (
            <div
              key={body}
              className='planet-node'
              title={formatPlacementLabel({
                body,
                sign,
                degree,
                minute,
                retrograde,
              })}
              style={{
                position: 'absolute',
                left: toPixel(x),
                top: toPixel(y),
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className='planet-glyph'
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: isAsteroid ? 22 : 28,
                  color,
                  display: 'flex',
                }}
              >
                {getSymbolForBody(body)}
              </span>
              {showTooltips && (
                <span
                  className='planet-tooltip'
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    padding: '6px 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(8,8,12,0.9)',
                    color: '#ffffff',
                    fontSize: 12,
                    letterSpacing: 0.5,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  {formatPlacementLabel({
                    body,
                    sign,
                    degree,
                    minute,
                    retrograde,
                  })}
                </span>
              )}
            </div>
          );
        },
      )}
    </div>
  );
}
