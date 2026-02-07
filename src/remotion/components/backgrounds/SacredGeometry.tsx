import React from 'react';
import { interpolate } from 'remotion';

interface SacredGeometryProps {
  frame: number;
  durationInFrames: number;
  fps: number;
  seed: string;
  tintColor?: string;
}

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

/**
 * Sacred Geometry background effect.
 * Slowly rotating/pulsing geometric patterns — hexagons, circles, lines.
 * Very subtle stroke opacity for a premium, minimal feel.
 */
export const SacredGeometryEffect: React.FC<SacredGeometryProps> = ({
  frame,
  durationInFrames,
  fps,
  seed,
  tintColor = '#D070E8',
}) => {
  const seedHash = React.useMemo(() => simpleHash(seed + '-geometry'), [seed]);

  // Slow rotation: 360 degrees over 60 seconds (1 RPM)
  const rotationDeg = interpolate(frame, [0, 60 * fps], [0, 360], {
    extrapolateRight: 'extend',
  });

  // Subtle scale pulse: 0.98 to 1.02 over 10 seconds
  const scaleCycle = ((frame % (10 * fps)) / (10 * fps)) * Math.PI * 2;
  const scale = 0.98 + (Math.sin(scaleCycle) + 1) * 0.02;

  // Generate satellite patterns
  const satellites = React.useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      x: 15 + seededRandom(seedHash + i * 5) * 70,
      y: 15 + seededRandom(seedHash + i * 5 + 1) * 70,
      size: 80 + seededRandom(seedHash + i * 5 + 2) * 60,
      rotationDir: seededRandom(seedHash + i * 5 + 3) > 0.5 ? 1 : -1,
    }));
  }, [seedHash]);

  const viewBoxSize = 400;
  const center = viewBoxSize / 2;

  // Generate hexagonal grid points
  const hexPoints = (cx: number, cy: number, r: number): string => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 4,
        pointerEvents: 'none',
      }}
    >
      {/* Central pattern */}
      <svg
        style={{
          position: 'absolute',
          left: '50%',
          top: '45%',
          width: '60%',
          height: '60%',
          transform: `translate(-50%, -50%) rotate(${rotationDeg}deg) scale(${scale})`,
          opacity: 0.08,
        }}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        {/* Concentric circles */}
        {[40, 80, 120, 160].map((r, i) => (
          <circle
            key={`circle-${i}`}
            cx={center}
            cy={center}
            r={r}
            fill='none'
            stroke={tintColor}
            strokeWidth={0.5}
          />
        ))}

        {/* Hexagonal patterns */}
        {[60, 100, 140].map((r, i) => (
          <polygon
            key={`hex-${i}`}
            points={hexPoints(center, center, r)}
            fill='none'
            stroke={tintColor}
            strokeWidth={0.5}
          />
        ))}

        {/* Radial lines */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (Math.PI / 6) * i;
          return (
            <line
              key={`line-${i}`}
              x1={center}
              y1={center}
              x2={center + 170 * Math.cos(angle)}
              y2={center + 170 * Math.sin(angle)}
              stroke={tintColor}
              strokeWidth={0.3}
            />
          );
        })}

        {/* Inner flower of life pattern */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i;
          const cx = center + 50 * Math.cos(angle);
          const cy = center + 50 * Math.sin(angle);
          return (
            <circle
              key={`flower-${i}`}
              cx={cx}
              cy={cy}
              r={50}
              fill='none'
              stroke={tintColor}
              strokeWidth={0.4}
            />
          );
        })}
      </svg>

      {/* Satellite patterns */}
      {satellites.map((sat, idx) => (
        <svg
          key={`sat-${idx}`}
          style={{
            position: 'absolute',
            left: `${sat.x}%`,
            top: `${sat.y}%`,
            width: sat.size,
            height: sat.size,
            transform: `translate(-50%, -50%) rotate(${rotationDeg * sat.rotationDir * 0.5}deg)`,
            opacity: 0.05,
          }}
          viewBox='0 0 100 100'
        >
          <circle
            cx={50}
            cy={50}
            r={35}
            fill='none'
            stroke={tintColor}
            strokeWidth={0.5}
          />
          <polygon
            points={hexPoints(50, 50, 30)}
            fill='none'
            stroke={tintColor}
            strokeWidth={0.5}
          />
          <circle
            cx={50}
            cy={50}
            r={20}
            fill='none'
            stroke={tintColor}
            strokeWidth={0.3}
          />
        </svg>
      ))}
    </div>
  );
};

export default SacredGeometryEffect;
