import React from 'react';

interface AuroraProps {
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
 * Real aurora borealis colors — each band gets its own distinct color.
 * Ordered by typical altitude appearance: green lowest, red/pink highest.
 */
const AURORA_PALETTE = [
  '#3DED97', // vivid green — oxygen at ~100km (the classic aurora color)
  '#00E5CC', // teal/cyan — transition zone
  '#4DA6FF', // electric blue — nitrogen ions
  '#8458D8', // deep violet — higher altitude nitrogen
  '#C77DFF', // soft purple/magenta — very high altitude oxygen
  '#EE789E', // pink/rose — highest altitude, rare intense storms
];

interface AuroraBand {
  /** Control point Y positions across the width (percentage of height) */
  controlPoints: number[];
  /** How far down the curtain extends (percentage of screen) */
  curtainDepth: number;
  /** Color from the palette */
  color: string;
  /** Primary wave period in frames (slow undulation) */
  primaryPeriod: number;
  /** Secondary wave period (faster ripple) */
  secondaryPeriod: number;
  /** Tertiary micro-wave for organic texture */
  tertiaryPeriod: number;
  /** Horizontal drift period */
  driftPeriod: number;
  /** Phase offset for this band */
  phase: number;
  /** Base opacity — lower bands brighter, upper bands more subtle */
  baseOpacity: number;
  /** Opacity breathing period */
  breathPeriod: number;
  /** Blur amount */
  blur: number;
}

/**
 * Aurora Borealis background effect.
 *
 * Multiple distinct colored bands layered like a real northern lights display.
 * Green dominates the lower bands, transitioning through blue, purple, and
 * pink at the top. Each band undulates independently with layered sine waves
 * for organic curtain movement.
 */
export const AuroraEffect: React.FC<AuroraProps> = ({ frame, fps, seed }) => {
  const seedHash = React.useMemo(() => simpleHash(seed + '-aurora'), [seed]);

  const bands = React.useMemo((): AuroraBand[] => {
    const count = 6;
    const numPoints = 8;

    return Array.from({ length: count }, (_, i) => {
      const base = seedHash + i * 17;

      // Each band sits at a different vertical position
      // Lower bands (green) sit around 30-45%, upper bands (pink) around 8-20%
      const bandCenter = 35 - i * 5 + seededRandom(base + 200) * 6;

      const controlPoints = Array.from(
        { length: numPoints },
        (_, j) => bandCenter + (seededRandom(base + j * 7) - 0.5) * 14,
      );

      // Lower bands are taller/deeper, upper bands are thinner wisps
      const curtainDepth = 18 + (count - i) * 3 + seededRandom(base + 100) * 8;

      return {
        controlPoints,
        curtainDepth,
        color: AURORA_PALETTE[i % AURORA_PALETTE.length],
        // Slower periods for lower bands, faster for upper (more flickery)
        primaryPeriod: Math.round(
          (22 + seededRandom(base + 102) * 12 - i * 1.5) * fps,
        ),
        secondaryPeriod: Math.round((9 + seededRandom(base + 103) * 5) * fps),
        tertiaryPeriod: Math.round((4 + seededRandom(base + 110) * 3) * fps),
        driftPeriod: Math.round((28 + seededRandom(base + 104) * 14) * fps),
        phase: seededRandom(base + 105) * Math.PI * 2,
        // Green bands (lower) are brightest, pink bands (upper) are faintest
        baseOpacity: 0.22 - i * 0.018 + seededRandom(base + 106) * 0.05, // Increased from 0.14 for more visibility
        breathPeriod: Math.round((12 + seededRandom(base + 107) * 10) * fps),
        blur: 12 + i * 2 + seededRandom(base + 109) * 6,
      };
    });
  }, [seedHash, fps]);

  const viewW = 1080;
  const viewH = 1920;

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
      {bands.map((band, idx) => {
        // Opacity breathing — each band brightens/dims independently
        const breathCycle =
          ((frame % band.breathPeriod) / band.breathPeriod) * Math.PI * 2;
        const breathMultiplier =
          0.55 + (Math.sin(breathCycle + band.phase) + 1) * 0.225;
        const opacity = band.baseOpacity * breathMultiplier;

        // Build the curtain path from animated control points
        const numPoints = band.controlPoints.length;
        const topPoints: Array<{ x: number; y: number }> = [];

        for (let j = 0; j < numPoints; j++) {
          const xPercent = (j / (numPoints - 1)) * 110 - 5; // slightly wider than screen
          const baseY = band.controlPoints[j];

          // Layered sine waves for organic undulation
          const primaryWave =
            Math.sin(
              (frame / band.primaryPeriod) * Math.PI * 2 + band.phase + j * 0.7,
            ) * 7;

          const secondaryWave =
            Math.sin(
              (frame / band.secondaryPeriod) * Math.PI * 2 +
                band.phase * 1.6 +
                j * 1.3,
            ) * 3;

          const tertiaryWave =
            Math.sin(
              (frame / band.tertiaryPeriod) * Math.PI * 2 +
                band.phase * 2.1 +
                j * 2.0,
            ) * 1.2;

          // Horizontal drift
          const drift =
            Math.sin((frame / band.driftPeriod) * Math.PI * 2 + band.phase) *
            3.5;

          const y = baseY + primaryWave + secondaryWave + tertiaryWave;
          const x = xPercent + drift;

          topPoints.push({
            x: (x / 100) * viewW,
            y: (y / 100) * viewH,
          });
        }

        // Build smooth cubic bezier through the top edge
        let topPath = `M ${topPoints[0].x},${topPoints[0].y}`;
        for (let j = 1; j < topPoints.length; j++) {
          const prev = topPoints[j - 1];
          const curr = topPoints[j];
          const cpOffset = (curr.x - prev.x) * 0.4;
          topPath += ` C ${prev.x + cpOffset},${prev.y} ${curr.x - cpOffset},${curr.y} ${curr.x},${curr.y}`;
        }

        // Close downward to form the filled curtain shape
        const bottomY =
          topPoints[topPoints.length - 1].y + (band.curtainDepth / 100) * viewH;
        const firstBottomY = topPoints[0].y + (band.curtainDepth / 100) * viewH;

        topPath += ` L ${topPoints[topPoints.length - 1].x},${bottomY}`;
        topPath += ` L ${topPoints[0].x},${firstBottomY}`;
        topPath += ' Z';

        const gradId = `aurora-band-${idx}`;

        return (
          <svg
            key={idx}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              filter: `blur(${band.blur}px)`,
              opacity,
            }}
            viewBox={`0 0 ${viewW} ${viewH}`}
            preserveAspectRatio='none'
          >
            <defs>
              <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={band.color} stopOpacity='0.85' />
                <stop offset='40%' stopColor={band.color} stopOpacity='0.45' />
                <stop offset='75%' stopColor={band.color} stopOpacity='0.12' />
                <stop offset='100%' stopColor={band.color} stopOpacity='0' />
              </linearGradient>
            </defs>
            <path d={topPath} fill={`url(#${gradId})`} />
          </svg>
        );
      })}
    </div>
  );
};

export default AuroraEffect;
