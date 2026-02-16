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
 * Enhanced glow and counter-rotation for visual depth.
 */
export const SacredGeometryEffect: React.FC<SacredGeometryProps> = ({
  frame,
  durationInFrames,
  fps,
  seed,
  tintColor = '#D070E8',
}) => {
  const seedHash = React.useMemo(() => simpleHash(seed + '-geometry'), [seed]);

  // Rotation: 360 degrees over 30 seconds (2 RPM)
  const rotationDeg = interpolate(frame, [0, 30 * fps], [0, 360], {
    extrapolateRight: 'extend',
  });

  // Counter-rotation for visual depth
  const counterRotationDeg = interpolate(frame, [0, 45 * fps], [0, -360], {
    extrapolateRight: 'extend',
  });

  // Scale pulse: 0.95 to 1.05 over 10 seconds
  const scaleCycle = ((frame % (10 * fps)) / (10 * fps)) * Math.PI * 2;
  const scale = 0.95 + (Math.sin(scaleCycle) + 1) * 0.05;

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

  // SVG filter ID (unique per instance via seed)
  const filterId = `glow-${seedHash}`;

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
          opacity: 0.18,
        }}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        {/* Glow filter */}
        <defs>
          <filter id={filterId} x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur in='SourceGraphic' stdDeviation='3' result='blur' />
            <feComposite in='SourceGraphic' in2='blur' operator='over' />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          {/* Concentric circles */}
          {[40, 80, 120, 160].map((r, i) => (
            <circle
              key={`circle-${i}`}
              cx={center}
              cy={center}
              r={r}
              fill='none'
              stroke={tintColor}
              strokeWidth={1.0}
            />
          ))}

          {/* Hexagonal patterns */}
          {[60, 100, 140].map((r, i) => (
            <polygon
              key={`hex-${i}`}
              points={hexPoints(center, center, r)}
              fill='none'
              stroke={tintColor}
              strokeWidth={1.0}
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
                strokeWidth={0.6}
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
                strokeWidth={0.8}
              />
            );
          })}
        </g>
      </svg>

      {/* Counter-rotating layer for visual depth */}
      <svg
        style={{
          position: 'absolute',
          left: '50%',
          top: '45%',
          width: '50%',
          height: '50%',
          transform: `translate(-50%, -50%) rotate(${counterRotationDeg}deg) scale(${scale})`,
          opacity: 0.1,
        }}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        <defs>
          <filter
            id={`${filterId}-counter`}
            x='-50%'
            y='-50%'
            width='200%'
            height='200%'
          >
            <feGaussianBlur in='SourceGraphic' stdDeviation='2' result='blur' />
            <feComposite in='SourceGraphic' in2='blur' operator='over' />
          </filter>
        </defs>
        <g filter={`url(#${filterId}-counter)`}>
          {[50, 90, 130].map((r, i) => (
            <polygon
              key={`counter-hex-${i}`}
              points={hexPoints(center, center, r)}
              fill='none'
              stroke={tintColor}
              strokeWidth={0.7}
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            return (
              <line
                key={`counter-line-${i}`}
                x1={center}
                y1={center}
                x2={center + 140 * Math.cos(angle)}
                y2={center + 140 * Math.sin(angle)}
                stroke={tintColor}
                strokeWidth={0.5}
              />
            );
          })}
        </g>
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
            opacity: 0.12,
          }}
          viewBox='0 0 100 100'
        >
          <defs>
            <filter
              id={`${filterId}-sat-${idx}`}
              x='-50%'
              y='-50%'
              width='200%'
              height='200%'
            >
              <feGaussianBlur
                in='SourceGraphic'
                stdDeviation='2'
                result='blur'
              />
              <feComposite in='SourceGraphic' in2='blur' operator='over' />
            </filter>
          </defs>
          <g filter={`url(#${filterId}-sat-${idx})`}>
            <circle
              cx={50}
              cy={50}
              r={35}
              fill='none'
              stroke={tintColor}
              strokeWidth={0.8}
            />
            <polygon
              points={hexPoints(50, 50, 30)}
              fill='none'
              stroke={tintColor}
              strokeWidth={0.8}
            />
            <circle
              cx={50}
              cy={50}
              r={20}
              fill='none'
              stroke={tintColor}
              strokeWidth={0.6}
            />
          </g>
        </svg>
      ))}
    </div>
  );
};

export default SacredGeometryEffect;
