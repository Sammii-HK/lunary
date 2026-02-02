import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../styles/theme';

interface AnimatedBackgroundProps {
  /** Whether to show subtle starfield (very minimal) */
  showStars?: boolean;
  /** Custom background color override */
  backgroundColor?: string;
  /** Gradient end color */
  gradientEndColor?: string;
}

/**
 * Animated Background Component
 *
 * Brand-compliant background with:
 * - Static or very slow gradient shift (dark purple to black)
 * - Optional extremely subtle, slow-moving starfield (barely perceptible)
 * - No particles or busy effects
 */
export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  showStars = false,
  backgroundColor = COLORS.cosmicBlack,
  gradientEndColor = COLORS.deepPurple,
}) => {
  const frame = useCurrentFrame();

  // Very slow, subtle gradient position shift
  const gradientPosition = interpolate(
    frame,
    [0, 900], // 30 seconds at 30fps
    [50, 55],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'extend',
    },
  );

  return (
    <AbsoluteFill>
      {/* Base gradient background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at ${gradientPosition}% ${gradientPosition}%, ${gradientEndColor} 0%, ${backgroundColor} 70%)`,
        }}
      />

      {/* Optional subtle starfield */}
      {showStars && <StarField frame={frame} />}
    </AbsoluteFill>
  );
};

/**
 * Extremely subtle starfield - barely perceptible
 */
const StarField: React.FC<{ frame: number }> = ({ frame }) => {
  // Generate consistent star positions using seed-based pseudo-random
  const stars = React.useMemo(() => {
    const result: Array<{ x: number; y: number; size: number; delay: number }> =
      [];
    const seed = 42;

    for (let i = 0; i < 30; i++) {
      // Reduced from typical 100+ stars
      const pseudoRandom = (n: number) => {
        const x = Math.sin((seed + n) * 9999) * 10000;
        return x - Math.floor(x);
      };

      result.push({
        x: pseudoRandom(i * 4) * 100,
        y: pseudoRandom(i * 4 + 1) * 100,
        size: 1 + pseudoRandom(i * 4 + 2) * 1.5, // Very small stars
        delay: pseudoRandom(i * 4 + 3) * 135, // Frame offset for twinkle (4.5s cycle)
      });
    }

    return result;
  }, []);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {stars.map((star, index) => {
        // Medium speed twinkle (4.5s cycle at 30fps = 135 frames)
        const twinkle = interpolate(
          (frame + star.delay) % 135,
          [0, 67, 135],
          [0.2, 0.4, 0.2], // Very low opacity range
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              backgroundColor: COLORS.primaryText,
              opacity: twinkle,
            }}
          />
        );
      })}
    </div>
  );
};

export default AnimatedBackground;
