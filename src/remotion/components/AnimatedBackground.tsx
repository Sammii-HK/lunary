import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from 'remotion';
import { COLORS } from '../styles/theme';
import { AuroraEffect } from './backgrounds/Aurora';
import { FloatingOrbsEffect } from './backgrounds/FloatingOrbs';
import { CandleFlamesEffect } from './backgrounds/CandleFlames';
import { SacredGeometryEffect } from './backgrounds/SacredGeometry';
import { MistWispsEffect } from './backgrounds/MistWisps';
import { EmberParticlesEffect } from './backgrounds/EmberParticles';

interface AnimatedBackgroundProps {
  /** Whether to show subtle starfield (very minimal) */
  showStars?: boolean;
  /** Custom background color override */
  backgroundColor?: string;
  /** Gradient end color */
  gradientEndColor?: string;
  /** When true, renders only stars without background gradient (for overlaying on images) */
  overlayMode?: boolean;
  /** Unique seed for generating different star positions and comet paths per video */
  seed?: string;
  /** Tint color for stars (defaults to white) */
  particleTintColor?: string;
  /** Category gradient colors [dark, mid, light] */
  gradientColors?: string[];
  /** Background animation type — dispatches to different animation components */
  animationType?: string;
}

// Natural meteor colors based on element composition when burning up
const METEOR_COLORS = [
  // Iron/Nickel - yellow/orange
  { head: '#fff4e0', tail: 'rgba(255, 200, 120, 0.4)' },
  // Magnesium - blue-white
  { head: '#e8f4ff', tail: 'rgba(180, 210, 255, 0.4)' },
  // Sodium - orange/yellow
  { head: '#ffe8d0', tail: 'rgba(255, 180, 100, 0.35)' },
  // Calcium - violet/purple tint
  { head: '#f0e8ff', tail: 'rgba(200, 170, 255, 0.35)' },
  // Silicon - red/orange
  { head: '#ffe0d8', tail: 'rgba(255, 160, 130, 0.35)' },
  // Pure white (common)
  { head: '#ffffff', tail: 'rgba(255, 255, 255, 0.4)' },
  { head: '#ffffff', tail: 'rgba(255, 255, 255, 0.35)' },
];

interface ShootingStar {
  startX: number;
  startY: number;
  angle: number;
  speed: number;
  thickness: number;
  trailLengthMultiplier: number;
  colorIndex: number;
  startFrame: number;
  duration: number;
}

/**
 * Animated Background Component
 *
 * Brand-compliant background with:
 * - Static or very slow gradient shift (dark purple to black)
 * - Optional subtle starfield with twinkling and size variation
 * - Occasional elegant shooting stars
 */
export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  showStars = false,
  backgroundColor = COLORS.cosmicBlack,
  gradientEndColor = COLORS.deepPurple,
  overlayMode = false,
  seed = 'default',
  particleTintColor,
  gradientColors,
  animationType = 'starfield',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Use category gradient colors if provided
  const effectiveBg = gradientColors?.[0] || backgroundColor;
  const effectiveGradientEnd = gradientColors?.[1] || gradientEndColor;

  // Very slow, subtle gradient position shift
  const gradientPosition = interpolate(frame, [0, 900], [50, 55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill>
      {/* Base gradient background - skip in overlay mode */}
      {!overlayMode && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse at ${gradientPosition}% ${gradientPosition}%, ${effectiveGradientEnd} 0%, ${effectiveBg} 70%)`,
          }}
        />
      )}

      {/* Animated background layer */}
      {showStars && animationType === 'starfield' && (
        <StarField
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
          seed={seed}
          tintColor={particleTintColor}
        />
      )}
      {showStars && animationType === 'aurora' && (
        <AuroraEffect
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
          seed={seed}
          tintColor={particleTintColor}
        />
      )}
      {showStars && animationType === 'floating-orbs' && (
        <FloatingOrbsEffect
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
          seed={seed}
          tintColor={particleTintColor}
        />
      )}
      {showStars && animationType === 'candle-flames' && (
        <CandleFlamesEffect
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
          seed={seed}
          tintColor={particleTintColor}
        />
      )}
      {showStars && animationType === 'sacred-geometry' && (
        <SacredGeometryEffect
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
          seed={seed}
          tintColor={particleTintColor}
        />
      )}
      {showStars && animationType === 'mist-wisps' && (
        <MistWispsEffect
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
          seed={seed}
          tintColor={particleTintColor}
        />
      )}
      {showStars && animationType === 'ember-particles' && (
        <EmberParticlesEffect
          frame={frame}
          durationInFrames={durationInFrames}
          fps={fps}
          seed={seed}
          tintColor={particleTintColor}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * Simple hash function to convert string seed to number
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Seeded pseudo-random number generator
 */
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

/**
 * Generate shooting stars - natural variety in size, color, position, angle
 */
const generateShootingStars = (
  durationInFrames: number,
  fps: number,
  seedHash: number,
): ShootingStar[] => {
  const stars: ShootingStar[] = [];
  const durationSeconds = durationInFrames / fps;

  // First shooting star at 1-2 seconds (use seedHash for variation)
  let currentTime = 1 + seededRandom(seedHash + 1) * 1;
  let index = 0;

  while (currentTime < durationSeconds - 1) {
    const colorIndex = Math.floor(
      seededRandom(seedHash + index * 9) * METEOR_COLORS.length,
    );

    // Variety of entry positions - not just from top
    // 0 = top edge, 1 = left edge, 2 = top-left corner area
    const entryType = Math.floor(seededRandom(seedHash + index * 9 + 1) * 3);

    let startX: number;
    let startY: number;
    let angle: number;

    if (entryType === 0) {
      // From top - going down-right or down-left
      startX = 5 + seededRandom(seedHash + index * 9 + 2) * 90; // 5-95% across
      startY = -2 + seededRandom(seedHash + index * 9 + 3) * 15; // -2% to 13% (near top)
      angle =
        seededRandom(seedHash + index * 9 + 4) > 0.5
          ? 25 + seededRandom(seedHash + index * 9 + 5) * 40 // 25-65° down-right
          : 115 + seededRandom(seedHash + index * 9 + 5) * 40; // 115-155° down-left
    } else if (entryType === 1) {
      // From left side - going right and slightly down
      startX = -2 + seededRandom(seedHash + index * 9 + 2) * 10; // -2% to 8% (near left)
      startY = 10 + seededRandom(seedHash + index * 9 + 3) * 50; // 10-60% down
      angle = -15 + seededRandom(seedHash + index * 9 + 5) * 50; // -15° to 35°
    } else {
      // From right side - going left and down
      startX = 92 + seededRandom(seedHash + index * 9 + 2) * 10; // 92-102% (near right)
      startY = 5 + seededRandom(seedHash + index * 9 + 3) * 40; // 5-45% down
      angle = 145 + seededRandom(seedHash + index * 9 + 5) * 30; // 145-175°
    }

    // Size variety - thick meteors are FAST, thin ones can be slower
    const thickness = 0.8 + seededRandom(seedHash + index * 9 + 6) * 1.8; // 0.8-2.6px
    const trailLengthMultiplier =
      0.6 + seededRandom(seedHash + index * 9 + 7) * 0.8; // 0.6-1.4x

    // Thick = fast, thin = can be slower (inverse relationship)
    const thicknessNormalized = (thickness - 0.8) / 1.8; // 0 to 1
    const baseSpeed = 2.0 + thicknessNormalized * 2.5; // thick ones: 4.5, thin ones: 2.0
    const baseDuration = 0.2 + (1 - thicknessNormalized) * 0.35; // thick: 0.2s, thin: 0.55s

    stars.push({
      startX,
      startY,
      angle,
      speed: baseSpeed + seededRandom(seedHash + index * 9 + 8) * 0.5, // slight variation
      thickness,
      trailLengthMultiplier,
      colorIndex,
      startFrame: Math.floor(currentTime * fps),
      duration: Math.floor(
        (baseDuration + seededRandom(seedHash + index * 9 + 9) * 0.1) * fps,
      ),
    });

    // Every 3-6 seconds
    currentTime += 3 + seededRandom(seedHash + index * 9 + 10) * 3;
    index++;
  }

  return stars;
};

/**
 * Single shooting star - thin, natural streak
 */
const ShootingStarElement: React.FC<{
  star: ShootingStar;
  frame: number;
}> = ({ star, frame }) => {
  const localFrame = frame - star.startFrame;

  if (localFrame < 0 || localFrame > star.duration) {
    return null;
  }

  const progress = localFrame / star.duration;
  const colors = METEOR_COLORS[star.colorIndex];

  // Calculate head position
  const angleRad = (star.angle * Math.PI) / 180;
  const distance = progress * star.speed * star.duration;
  const headX = star.startX + distance * Math.cos(angleRad);
  const headY = star.startY + distance * Math.sin(angleRad);

  // Trail fades behind the head - length grows then shrinks
  const baseTrailLength = 6 + star.trailLengthMultiplier * 4; // 6-10 base length
  const trailLength = interpolate(
    progress,
    [0, 0.2, 0.8, 1],
    [
      baseTrailLength * 0.3,
      baseTrailLength,
      baseTrailLength,
      baseTrailLength * 0.3,
    ],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Burning up effect - starts dim, gets BRIGHTER as it enters atmosphere, then burns out
  const intensity = interpolate(
    progress,
    [0, 0.15, 0.5, 0.75, 1],
    [0.3, 0.7, 1.0, 0.9, 0], // dim → brightening → peak brightness → fade out
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Calculate tail position (behind the head)
  const tailX = headX - trailLength * Math.cos(angleRad);
  const tailY = headY - trailLength * Math.sin(angleRad);

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <defs>
        <linearGradient
          id={`meteor-grad-${star.startFrame}`}
          x1={`${tailX}%`}
          y1={`${tailY}%`}
          x2={`${headX}%`}
          y2={`${headY}%`}
        >
          <stop offset='0%' stopColor={colors.tail} stopOpacity='0' />
          <stop
            offset='50%'
            stopColor={colors.tail}
            stopOpacity={intensity * 0.3}
          />
          <stop
            offset='85%'
            stopColor={colors.head}
            stopOpacity={intensity * 0.7}
          />
          <stop offset='100%' stopColor={colors.head} stopOpacity={intensity} />
        </linearGradient>
        {/* Bright burning head glow at peak intensity */}
        <radialGradient id={`meteor-head-${star.startFrame}`}>
          <stop
            offset='0%'
            stopColor={colors.head}
            stopOpacity={intensity * 0.9}
          />
          <stop offset='100%' stopColor={colors.head} stopOpacity='0' />
        </radialGradient>
      </defs>
      {/* Trail with gradient */}
      <line
        x1={`${tailX}%`}
        y1={`${tailY}%`}
        x2={`${headX}%`}
        y2={`${headY}%`}
        stroke={`url(#meteor-grad-${star.startFrame})`}
        strokeWidth={star.thickness}
        strokeLinecap='round'
      />
      {/* Bright burning head - visible when intensity is high */}
      {intensity > 0.5 && (
        <circle
          cx={`${headX}%`}
          cy={`${headY}%`}
          r={star.thickness * 0.8 + intensity * 1.2}
          fill={`url(#meteor-head-${star.startFrame})`}
        />
      )}
    </svg>
  );
};

/**
 * Starfield with twinkling stars and occasional shooting stars.
 * Exported for reuse in admin preview.
 */
export const StarField: React.FC<{
  frame: number;
  durationInFrames: number;
  fps: number;
  seed: string;
  tintColor?: string;
}> = ({ frame, durationInFrames, fps, seed, tintColor }) => {
  // Convert seed string to number hash
  const seedHash = React.useMemo(() => simpleHash(seed), [seed]);

  // Generate consistent star positions using the seed
  const stars = React.useMemo(() => {
    const result: Array<{
      x: number;
      y: number;
      baseSize: number;
      delay: number;
      twinkleSpeed: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      result.push({
        x: seededRandom(seedHash + i * 5) * 100,
        y: seededRandom(seedHash + i * 5 + 1) * 100,
        baseSize: 2 + seededRandom(seedHash + i * 5 + 2) * 2, // 2-4px (visible on 1080x1920)
        delay: Math.floor(seededRandom(seedHash + i * 5 + 3) * 100),
        twinkleSpeed: 0.08 + seededRandom(seedHash + i * 5 + 4) * 0.12, // 0.08-0.2 Hz (gentle, slow twinkle ~5-12 second cycles)
      });
    }

    return result;
  }, [seedHash]);

  // Generate shooting stars for the video duration using the seed
  const shootingStars = React.useMemo(() => {
    return generateShootingStars(durationInFrames, fps, seedHash);
  }, [durationInFrames, fps, seedHash]);

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      {/* Twinkling stars with subtle size variation */}
      {stars.map((star, index) => {
        // Twinkle cycle: ~1.5-3 second cycles at 30fps (45-90 frames)
        // Align to video duration for seamless looping
        const baseCycleFrames = Math.floor(30 / star.twinkleSpeed); // frames per cycle
        const cyclesInVideo = Math.max(
          1,
          Math.round(durationInFrames / baseCycleFrames),
        );
        const cycleLength = Math.floor(durationInFrames / cyclesInVideo);
        const cycleProgress =
          ((frame + star.delay) % cycleLength) / cycleLength;

        // Visible opacity variation (0.3 to 0.8)
        const opacity = interpolate(
          cycleProgress,
          [0, 0.5, 1],
          [0.3, 0.8, 0.3],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );

        // Noticeable size variation (0.8 to 1.2)
        const sizeMultiplier = interpolate(
          cycleProgress,
          [0, 0.5, 1],
          [0.8, 1.2, 0.8],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );

        const currentSize = star.baseSize * sizeMultiplier;
        const showGlow = opacity > 0.5;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: currentSize,
              height: currentSize,
              borderRadius: '50%',
              backgroundColor: COLORS.primaryText,
              opacity,
              boxShadow: showGlow
                ? `0 0 ${currentSize * 2}px rgba(255, 255, 255, ${opacity * 0.6})`
                : 'none',
            }}
          />
        );
      })}

      {/* Shooting stars */}
      {shootingStars.map((star, index) => (
        <ShootingStarElement
          key={`meteor-${index}`}
          star={star}
          frame={frame}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
