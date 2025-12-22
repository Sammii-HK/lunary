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
const ANGLES = ['Ascendant', 'Midheaven'];
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

export function ChartWheelOg({
  birthChart,
  houses,
  size = 360,
}: {
  birthChart: BirthChartData[];
  houses?: HouseCusp[];
  size?: number;
}) {
  const { ascendantAngle, chartData, zodiacSigns, houseData } =
    buildChartWheelLayout({ birthChart, houses });

  const mainPlanets = chartData.filter((p) => MAIN_PLANETS.includes(p.body));
  const angles = chartData.filter((p) => ANGLES.includes(p.body));
  const points = chartData.filter((p) => POINTS.includes(p.body));

  const viewBoxSize = 280;
  const scale = size / viewBoxSize;
  const center = size / 2;

  const toPixel = (value: number) => center + value * scale;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
      }}
    >
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
              fontSize: 9,
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
            fontSize: 12,
            color: '#71717a',
            display: 'flex',
          }}
        >
          {zodiacSymbol[sign.toLowerCase() as keyof typeof zodiacSymbol]}
        </div>
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
            <div
              key={body}
              style={{
                position: 'absolute',
                left: toPixel(x),
                top: toPixel(y),
                transform: 'translate(-50%, -50%)',
                fontFamily: 'Astronomicon',
                fontSize: isAngle || isPoint ? 12 : 14,
                color,
                display: 'flex',
              }}
            >
              {getSymbolForBody(body)}
            </div>
          );
        },
      )}

      <div
        style={{
          position: 'absolute',
          left: toPixel(125),
          top: toPixel(0),
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Astronomicon',
          fontSize: 10,
          color: '#C77DFF',
          display: 'flex',
        }}
      >
        AC
      </div>
    </div>
  );
}
