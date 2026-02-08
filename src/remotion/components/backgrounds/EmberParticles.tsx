import React from 'react';

interface EmberParticlesProps {
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

interface Ember {
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
}

/**
 * Ember Particles background effect.
 * Glowing sparks drifting upward with subtle trails.
 * Slightly warmer/redder tint than candle flames — more ember-like.
 */
export const EmberParticlesEffect: React.FC<EmberParticlesProps> = ({
  frame,
  durationInFrames,
  fps,
  seed,
  tintColor = '#D06060',
}) => {
  const seedHash = React.useMemo(() => simpleHash(seed + '-ember'), [seed]);

  const particles = React.useMemo((): Ember[] => {
    const count = 40;
    return Array.from({ length: count }, (_, i) => {
      const base = seedHash + i * 9;
      return {
        startX: 3 + seededRandom(base) * 94,
        startY: 40 + seededRandom(base + 1) * 58,
        size: 1 + seededRandom(base + 2) * 3,
        riseSpeed: 0.2 + seededRandom(base + 3) * 0.8,
        wobbleSpeed: 50 + seededRandom(base + 4) * 70,
        wobbleAmplitude: 0.5 + seededRandom(base + 5) * 2,
        wobblePhase: seededRandom(base + 6) * Math.PI * 2,
        baseOpacity: 0.15 + seededRandom(base + 7) * 0.35,
        flickerSpeed: 6 + seededRandom(base + 8) * 10,
        flickerPhase: seededRandom(base + 9) * Math.PI * 2,
        hasFlicker: seededRandom(base + 10) < 0.35,
      };
    });
  }, [seedHash]);

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
        // Rise with looping
        const cycleLength = 100 / p.riseSpeed;
        const cycleFrame = frame % Math.max(1, Math.ceil(cycleLength * fps));
        const riseProgress = (cycleFrame / fps) * p.riseSpeed;

        const y = p.startY - riseProgress;

        // Horizontal wobble
        const wobble =
          Math.sin((frame / p.wobbleSpeed) * Math.PI * 2 + p.wobblePhase) *
          p.wobbleAmplitude;
        const x = p.startX + wobble;

        // Fade out near top
        const fadeTop = y < 10 ? y / 10 : 1;

        // Quick flicker
        let flickerMultiplier = 1;
        if (p.hasFlicker) {
          const flickerCycle =
            ((frame % p.flickerSpeed) / p.flickerSpeed) * Math.PI * 2;
          flickerMultiplier =
            0.5 + (Math.sin(flickerCycle + p.flickerPhase) + 1) * 0.25;
        }

        const opacity = p.baseOpacity * fadeTop * flickerMultiplier;

        if (y < 0 || opacity < 0.01) return null;

        const showGlow = opacity > 0.3;

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
              backgroundColor: tintColor,
              opacity,
              boxShadow: showGlow
                ? `0 0 ${p.size * 2.5}px ${tintColor}`
                : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export default EmberParticlesEffect;
