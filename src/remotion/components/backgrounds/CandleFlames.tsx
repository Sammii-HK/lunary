import React from 'react';

interface CandleFlamesProps {
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

interface Particle {
  startX: number;
  startY: number;
  size: number;
  riseSpeed: number;
  wobbleSpeed: number;
  wobbleAmplitude: number;
  wobblePhase: number;
  baseOpacity: number;
  flickerSpeed: number;
  flickerPhase: number;
  hasFlicker: boolean;
  /** Warm color mix factor (0 = tintColor, 1 = amber) */
  warmth: number;
}

/**
 * Candle Flames background effect.
 * Warm flickering particles rising gently from below with soft golden-amber glow.
 */
export const CandleFlamesEffect: React.FC<CandleFlamesProps> = ({
  frame,
  durationInFrames,
  fps,
  seed,
  tintColor = '#EE789E',
}) => {
  const seedHash = React.useMemo(() => simpleHash(seed + '-candle'), [seed]);

  const particles = React.useMemo((): Particle[] => {
    const count = 32;
    return Array.from({ length: count }, (_, i) => {
      const base = seedHash + i * 9;
      return {
        startX: 5 + seededRandom(base) * 90,
        startY: 60 + seededRandom(base + 1) * 38,
        size: 2 + seededRandom(base + 2) * 4,
        riseSpeed: 0.3 + seededRandom(base + 3) * 0.8,
        wobbleSpeed: 60 + seededRandom(base + 4) * 60,
        wobbleAmplitude: 1 + seededRandom(base + 5) * 3,
        wobblePhase: seededRandom(base + 6) * Math.PI * 2,
        baseOpacity: 0.15 + seededRandom(base + 7) * 0.25,
        flickerSpeed: 9 + seededRandom(base + 8) * 15,
        flickerPhase: seededRandom(base + 9) * Math.PI * 2,
        hasFlicker: seededRandom(base + 10) < 0.5,
        warmth: 0.3 + seededRandom(base + 11) * 0.5,
      };
    });
  }, [seedHash]);

  // Amber warm color for blending
  const amberColor = '#FFB347';

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
      {particles.map((p, idx) => {
        // Calculate rise position with looping
        const cycleLength = 100 / p.riseSpeed; // frames for full rise
        const cycleFrame = frame % Math.max(1, Math.ceil(cycleLength * fps));
        const riseProgress = (cycleFrame / fps) * p.riseSpeed;

        const y = p.startY - riseProgress;

        // Horizontal wobble
        const wobble =
          Math.sin((frame / p.wobbleSpeed) * Math.PI * 2 + p.wobblePhase) *
          p.wobbleAmplitude;
        const x = p.startX + wobble;

        // Fade out near top
        const fadeTop = y < 15 ? y / 15 : 1;

        // Flicker effect
        let flickerMultiplier = 1;
        if (p.hasFlicker) {
          const flickerCycle =
            ((frame % p.flickerSpeed) / p.flickerSpeed) * Math.PI * 2;
          flickerMultiplier =
            0.4 + (Math.sin(flickerCycle + p.flickerPhase) + 1) * 0.3;
        }

        const opacity = p.baseOpacity * fadeTop * flickerMultiplier;

        // Only render if visible
        if (y < 0 || opacity < 0.01) return null;

        const showGlow = opacity > 0.25;
        // Blend tint with amber based on warmth
        const particleColor = p.warmth > 0.5 ? amberColor : tintColor;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: particleColor,
              opacity,
              boxShadow: showGlow
                ? `0 0 ${p.size * 3}px ${particleColor}`
                : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export default CandleFlamesEffect;
