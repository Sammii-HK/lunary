import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

// Normalised [x, y] star positions (0–1) + line connections for all 12 signs.
// Coords are remapped to [10%, 90%] at render time so the pattern always
// sits fully inset from the canvas edge.
const CONSTELLATION_DATA: Record<
  string,
  { stars: [number, number][]; lines: [number, number][] }
> = {
  aries: {
    stars: [
      [0.34, 0.46],
      [0.44, 0.38],
      [0.56, 0.44],
      [0.66, 0.5],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  taurus: {
    stars: [
      [0.28, 0.56],
      [0.4, 0.46],
      [0.5, 0.5],
      [0.6, 0.4],
      [0.72, 0.38],
      [0.5, 0.62],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  gemini: {
    stars: [
      [0.36, 0.24],
      [0.52, 0.24],
      [0.34, 0.42],
      [0.5, 0.42],
      [0.32, 0.58],
      [0.48, 0.58],
      [0.28, 0.74],
      [0.44, 0.74],
    ],
    lines: [
      [0, 2],
      [2, 4],
      [4, 6],
      [1, 3],
      [3, 5],
      [5, 7],
      [2, 3],
    ],
  },
  cancer: {
    stars: [
      [0.42, 0.36],
      [0.54, 0.44],
      [0.36, 0.58],
      [0.62, 0.56],
      [0.5, 0.64],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
    ],
  },
  leo: {
    stars: [
      [0.5, 0.24],
      [0.38, 0.36],
      [0.3, 0.5],
      [0.38, 0.64],
      [0.54, 0.68],
      [0.66, 0.58],
      [0.64, 0.4],
      [0.54, 0.26],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
    ],
  },
  virgo: {
    stars: [
      [0.5, 0.24],
      [0.5, 0.4],
      [0.36, 0.5],
      [0.62, 0.5],
      [0.5, 0.6],
      [0.42, 0.72],
      [0.58, 0.72],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [4, 5],
      [4, 6],
    ],
  },
  libra: {
    stars: [
      [0.5, 0.38],
      [0.34, 0.54],
      [0.66, 0.54],
      [0.5, 0.54],
      [0.36, 0.7],
      [0.64, 0.7],
    ],
    lines: [
      [0, 3],
      [3, 1],
      [3, 2],
      [1, 4],
      [2, 5],
      [1, 2],
    ],
  },
  scorpio: {
    stars: [
      [0.3, 0.32],
      [0.38, 0.42],
      [0.44, 0.5],
      [0.5, 0.56],
      [0.56, 0.62],
      [0.62, 0.66],
      [0.68, 0.7],
      [0.72, 0.62],
      [0.74, 0.52],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
    ],
  },
  sagittarius: {
    stars: [
      [0.5, 0.28],
      [0.38, 0.42],
      [0.32, 0.58],
      [0.44, 0.68],
      [0.58, 0.62],
      [0.66, 0.48],
      [0.56, 0.38],
    ],
    lines: [
      [0, 6],
      [6, 5],
      [5, 4],
      [4, 3],
      [3, 2],
      [2, 1],
      [1, 0],
      [1, 6],
    ],
  },
  capricorn: {
    stars: [
      [0.28, 0.38],
      [0.42, 0.32],
      [0.56, 0.38],
      [0.66, 0.48],
      [0.66, 0.62],
      [0.52, 0.72],
      [0.38, 0.68],
      [0.3, 0.54],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
    ],
  },
  aquarius: {
    stars: [
      [0.28, 0.42],
      [0.42, 0.38],
      [0.52, 0.48],
      [0.64, 0.42],
      [0.74, 0.38],
      [0.34, 0.58],
      [0.48, 0.62],
      [0.58, 0.55],
      [0.7, 0.6],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [5, 6],
      [6, 7],
      [7, 8],
      [1, 6],
    ],
  },
  pisces: {
    stars: [
      [0.28, 0.35],
      [0.38, 0.28],
      [0.48, 0.35],
      [0.48, 0.5],
      [0.38, 0.62],
      [0.28, 0.56],
      [0.58, 0.48],
      [0.68, 0.42],
      [0.76, 0.52],
      [0.66, 0.62],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [3, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 6],
    ],
  },
};

export interface ConstellationOverlayProps {
  sign: string;
  accent: string;
  /** How many frames the draw-on animation takes. Default 45 (1.5s at 30fps) */
  drawDuration?: number;
  /** Frame offset to start the draw-on. Default 0 */
  startFrame?: number;
  /** Overall opacity of the whole overlay. Default 1 */
  opacity?: number;
  /** Scale of the pattern relative to canvas. Default 0.8 */
  scale?: number;
  /** Horizontal offset as fraction of width, -0.5 to 0.5. Default 0 (centred) */
  offsetX?: number;
  /** Vertical offset as fraction of height, -0.5 to 0.5. Default 0 (centred) */
  offsetY?: number;
}

export const ConstellationOverlay: React.FC<ConstellationOverlayProps> = ({
  sign,
  accent,
  drawDuration = 45,
  startFrame = 0,
  opacity = 1,
  scale = 0.8,
  offsetX = 0,
  offsetY = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const data = CONSTELLATION_DATA[sign.toLowerCase()];
  if (!data) return null;

  const localFrame = frame - startFrame;

  // Map normalised [0,1] coords into the padded, scaled, offset region
  const margin = (1 - scale) / 2;
  const mapX = (v: number) => (margin + v * scale + offsetX) * width;
  const mapY = (v: number) => (margin + v * scale + offsetY) * height;

  // --- Line draw-on ---
  // Each line draws on in sequence. Total draw time is split evenly across lines.
  const lineCount = data.lines.length;
  const lineSlot = drawDuration / lineCount; // frames per line

  // --- Star dot spring-in ---
  // Each star pops in after its connected lines have drawn.
  // We find the earliest line that connects to each star.
  const starRevealFrame = data.stars.map((_, starIdx) => {
    // Find the first line that references this star
    const firstLine = data.lines.findIndex(
      ([a, b]) => a === starIdx || b === starIdx,
    );
    if (firstLine === -1) return 0;
    // Reveal star when that line completes
    return Math.round((firstLine + 1) * lineSlot);
  });

  // --- Glow pulse after draw completes ---
  const glowCycle = fps * 3; // 3-second cycle
  const glowPulse =
    localFrame > drawDuration
      ? 0.5 +
        0.5 * Math.sin(((localFrame - drawDuration) / glowCycle) * Math.PI * 2)
      : 0;

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity,
        overflow: 'visible',
      }}
    >
      {/* Lines — draw on staggered */}
      {data.lines.map(([a, b], i) => {
        const lineStart = i * lineSlot;
        const lineEnd = lineStart + lineSlot;

        const lineProgress = interpolate(
          localFrame,
          [lineStart, lineEnd],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );

        if (lineProgress <= 0) return null;

        const x1 = mapX(data.stars[a][0]);
        const y1 = mapY(data.stars[a][1]);
        const x2 = mapX(data.stars[b][0]);
        const y2 = mapY(data.stars[b][1]);

        // Interpolate the drawn endpoint along the line
        const drawnX2 = x1 + (x2 - x1) * lineProgress;
        const drawnY2 = y1 + (y2 - y1) * lineProgress;

        // Line brightens as draw completes, then gently pulses
        const lineOpacity =
          interpolate(lineProgress, [0, 0.5, 1], [0, 0.2, 0.35], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }) +
          glowPulse * 0.1;

        return (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={y1}
            x2={drawnX2}
            y2={drawnY2}
            stroke={accent}
            strokeWidth={1.5}
            strokeLinecap='round'
            opacity={lineOpacity}
          />
        );
      })}

      {/* Star dots — spring in after their line draws */}
      {data.stars.map(([x, y], i) => {
        const revealAt = starRevealFrame[i];
        const dotScale = spring({
          frame: localFrame - revealAt,
          fps,
          config: { damping: 18, stiffness: 300, mass: 0.6 },
        });

        if (dotScale <= 0) return null;

        const cx = mapX(x);
        const cy = mapY(y);
        const isAnchor = i === 0; // brightest star in constellation
        const r = (isAnchor ? 5 : 3.5) * dotScale;

        // Anchor star gets extra glow pulse
        const dotOpacity =
          (isAnchor ? 0.9 : 0.65) + (isAnchor ? glowPulse * 0.1 : 0);

        // Glow ring behind anchor star
        return (
          <g key={`star-${i}`}>
            {isAnchor && (
              <circle
                cx={cx}
                cy={cy}
                r={r * (2.5 + glowPulse)}
                fill={accent}
                opacity={0.08 + glowPulse * 0.06}
              />
            )}
            <circle cx={cx} cy={cy} r={r} fill={accent} opacity={dotOpacity} />
          </g>
        );
      })}
    </svg>
  );
};
