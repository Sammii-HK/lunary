import React from 'react';

interface MistWispsProps {
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

interface Wisp {
  /** Base Y position (% of height) */
  y: number;
  /** Width of the ellipse (% of viewport) */
  width: number;
  /** Height of the ellipse (% of viewport) */
  height: number;
  /** Horizontal drift speed — seconds to cross the viewport */
  driftSpeed: number;
  /** Starting X offset */
  startX: number;
  /** Vertical wave amplitude (% of viewport) */
  verticalAmplitude: number;
  /** Vertical wave period in seconds */
  verticalPeriod: number;
  /** Phase offset for vertical wave */
  verticalPhase: number;
  /** Secondary horizontal wave period (slow weave) */
  weavePeriod: number;
  /** Secondary horizontal wave amplitude */
  weaveAmplitude: number;
  /** Base opacity */
  baseOpacity: number;
  /** Opacity pulse period in seconds */
  opacityPeriod: number;
  /** Opacity pulse phase */
  opacityPhase: number;
  /** Blur amount */
  blur: number;
  /** Height breathing period in seconds */
  breathPeriod: number;
  /** Height breathing phase */
  breathPhase: number;
  /** Direction: 1 = left-to-right, -1 = right-to-left */
  direction: number;
}

/**
 * Mist Wisps background effect.
 *
 * Flowing translucent fog tendrils drifting horizontally with organic movement.
 * Each wisp has independent drift direction/speed, vertical undulation,
 * horizontal weaving, opacity pulsing, and height breathing.
 */
export const MistWispsEffect: React.FC<MistWispsProps> = ({
  frame,
  fps,
  seed,
  tintColor = '#C77DFF',
}) => {
  const seedHash = React.useMemo(() => simpleHash(seed + '-mist'), [seed]);

  const wisps = React.useMemo((): Wisp[] => {
    const count = 7;
    return Array.from({ length: count }, (_, i) => {
      const base = seedHash + i * 13;
      // Alternate directions so wisps cross paths
      const direction = i % 2 === 0 ? 1 : -1;

      return {
        y: 10 + seededRandom(base) * 70,
        width: 40 + seededRandom(base + 1) * 50, // 40-90% wide
        height: 4 + seededRandom(base + 2) * 8, // 4-12% tall
        driftSpeed: 18 + seededRandom(base + 3) * 22, // 18-40 seconds to cross
        startX: seededRandom(base + 4) * 100,
        verticalAmplitude: 2 + seededRandom(base + 5) * 4, // 2-6% vertical sway
        verticalPeriod: 8 + seededRandom(base + 6) * 12, // 8-20s wave
        verticalPhase: seededRandom(base + 7) * Math.PI * 2,
        weavePeriod: 12 + seededRandom(base + 8) * 16, // 12-28s weave
        weaveAmplitude: 3 + seededRandom(base + 9) * 5, // 3-8% horizontal weave
        baseOpacity: 0.03 + seededRandom(base + 10) * 0.05, // 0.03-0.08
        opacityPeriod: 6 + seededRandom(base + 11) * 10, // 6-16s pulse
        opacityPhase: seededRandom(base + 12) * Math.PI * 2,
        blur: 20 + seededRandom(base + 13) * 25, // 20-45px
        breathPeriod: 7 + seededRandom(base + 14) * 8, // 7-15s breathing
        breathPhase: seededRandom(base + 15) * Math.PI * 2,
        direction,
      };
    });
  }, [seedHash]);

  const seconds = frame / fps;

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
      {wisps.map((wisp, idx) => {
        // Primary horizontal drift with wrapping
        const driftPercent = (seconds / wisp.driftSpeed) * 100 * wisp.direction;
        const totalWidth = 100 + wisp.width;
        let x = wisp.startX + driftPercent;
        // Wrap around — modulo that works for both directions
        x = (((x % totalWidth) + totalWidth) % totalWidth) - wisp.width;

        // Secondary horizontal weave (slower sine wave on top of drift)
        const weaveOffset =
          Math.sin(
            (seconds / wisp.weavePeriod) * Math.PI * 2 + wisp.verticalPhase,
          ) * wisp.weaveAmplitude;
        x += weaveOffset;

        // Vertical undulation — wisps rise and fall gently
        const verticalOffset =
          Math.sin(
            (seconds / wisp.verticalPeriod) * Math.PI * 2 + wisp.verticalPhase,
          ) * wisp.verticalAmplitude;
        const y = wisp.y + verticalOffset;

        // Height breathing — wisps expand and contract
        const breathCycle = Math.sin(
          (seconds / wisp.breathPeriod) * Math.PI * 2 + wisp.breathPhase,
        );
        const heightMultiplier = 0.7 + (breathCycle + 1) * 0.3; // 0.7-1.3x
        const currentHeight = wisp.height * heightMultiplier;

        // Opacity pulsing — wisps fade in and out
        const opacityCycle = Math.sin(
          (seconds / wisp.opacityPeriod) * Math.PI * 2 + wisp.opacityPhase,
        );
        const opacity = wisp.baseOpacity * (0.5 + (opacityCycle + 1) * 0.25); // 0.5x-1.0x of base

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: `${wisp.width}%`,
              height: `${currentHeight}%`,
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${tintColor} 0%, transparent 70%)`,
              opacity,
              filter: `blur(${wisp.blur}px)`,
              transform: 'translateY(-50%)',
            }}
          />
        );
      })}
    </div>
  );
};

export default MistWispsEffect;
