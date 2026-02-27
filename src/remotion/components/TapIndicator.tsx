import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
} from 'remotion';

export interface TapPoint {
  /** Seconds when the tap animation begins */
  time: number;
  /** Horizontal position 0-1 (0 = left edge, 1 = right edge) */
  x: number;
  /** Vertical position 0-1 (0 = top edge, 1 = bottom edge) */
  y: number;
  /** Ripple colour — defaults to white */
  color?: string;
}

interface TapIndicatorProps {
  tapPoints: TapPoint[];
  /** Fallback colour when tapPoint.color is not set */
  defaultColor?: string;
}

const TAP_DURATION_S = 0.55; // total animation length in seconds

/**
 * TapIndicator — renders touch-ripple animations at specified screen positions.
 *
 * Each tap shows:
 *   • An inner dot that scales in quickly then fades
 *   • A primary ring that expands and fades
 *   • A secondary ring (slight delay) for depth/glow
 *
 * Coordinates are in screen space (same as composition width/height).
 */
export const TapIndicator: React.FC<TapIndicatorProps> = ({
  tapPoints,
  defaultColor = 'rgba(255, 255, 255, 0.9)',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 19 }}>
      {tapPoints.map((tap, i) => {
        const tapFrame = Math.round(tap.time * fps);
        const elapsed = frame - tapFrame;
        const totalFrames = Math.round(TAP_DURATION_S * fps);

        if (elapsed < 0 || elapsed >= totalFrames) return null;

        const progress = elapsed / totalFrames;
        const color = tap.color ?? defaultColor;
        const px = tap.x * width;
        const py = tap.y * height;

        // Inner filled dot
        const dotSize = interpolate(
          progress,
          [0, 0.15, 0.9, 1],
          [0, 30, 26, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );
        const dotOpacity = interpolate(
          progress,
          [0, 0.08, 0.55, 1],
          [0, 0.8, 0.6, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );

        // Primary expanding ring
        const ring1Size = interpolate(progress, [0, 0.9], [22, 100], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const ring1Opacity = interpolate(
          progress,
          [0, 0.1, 0.65, 1],
          [0.7, 0.55, 0.18, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );

        // Secondary ring (delayed start, larger max)
        const ring2Size = interpolate(progress, [0.12, 1], [16, 138], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const ring2Opacity = interpolate(
          progress,
          [0.12, 0.25, 0.75, 1],
          [0, 0.35, 0.08, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );

        return (
          <React.Fragment key={`tap-${i}-${tapFrame}`}>
            {/* Secondary outer glow ring */}
            {ring2Opacity > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: px - ring2Size / 2,
                  top: py - ring2Size / 2,
                  width: ring2Size,
                  height: ring2Size,
                  borderRadius: '50%',
                  border: `1.5px solid ${color}`,
                  opacity: ring2Opacity,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Primary ring */}
            {ring1Opacity > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: px - ring1Size / 2,
                  top: py - ring1Size / 2,
                  width: ring1Size,
                  height: ring1Size,
                  borderRadius: '50%',
                  border: `2.5px solid ${color}`,
                  opacity: ring1Opacity,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Inner dot */}
            {dotOpacity > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: px - dotSize / 2,
                  top: py - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  backgroundColor: color,
                  opacity: dotOpacity,
                  pointerEvents: 'none',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
