import React from 'react';

interface FloatingOrbsProps {
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

interface Orb {
  x: number;
  y: number;
  radius: number;
  driftSpeedX: number;
  driftSpeedY: number;
  driftPhaseX: number;
  driftPhaseY: number;
  pulseSpeed: number;
  pulsePhase: number;
  baseOpacity: number;
  /** Frame at which this orb does a bright pulse (-1 = never) */
  brightPulseFrame: number;
}

/**
 * Floating Orbs background effect.
 * Luminous soft spheres drifting with gentle pulse — mystical/tarot aesthetic.
 */
export const FloatingOrbsEffect: React.FC<FloatingOrbsProps> = ({
  frame,
  durationInFrames,
  fps,
  seed,
  tintColor = '#C77DFF',
}) => {
  const seedHash = React.useMemo(() => simpleHash(seed + '-orbs'), [seed]);

  const orbs = React.useMemo((): Orb[] => {
    const count = 10;
    return Array.from({ length: count }, (_, i) => {
      const base = seedHash + i * 11;
      const hasBrightPulse = seededRandom(base + 80) < 0.25;
      return {
        x: 5 + seededRandom(base) * 90,
        y: 10 + seededRandom(base + 1) * 80,
        radius: 30 + seededRandom(base + 2) * 70,
        driftSpeedX: 60 + seededRandom(base + 3) * 60,
        driftSpeedY: 70 + seededRandom(base + 4) * 50,
        driftPhaseX: seededRandom(base + 5) * Math.PI * 2,
        driftPhaseY: seededRandom(base + 6) * Math.PI * 2,
        pulseSpeed: 240 + seededRandom(base + 7) * 210,
        pulsePhase: seededRandom(base + 8) * Math.PI * 2,
        baseOpacity: 0.08 + seededRandom(base + 9) * 0.12,
        brightPulseFrame: hasBrightPulse
          ? Math.floor(seededRandom(base + 10) * durationInFrames)
          : -1,
      };
    });
  }, [seedHash, durationInFrames]);

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
      {orbs.map((orb, idx) => {
        // Sinusoidal drift
        const driftX =
          Math.sin((frame / orb.driftSpeedX) * Math.PI * 2 + orb.driftPhaseX) *
          6;
        const driftY =
          Math.cos((frame / orb.driftSpeedY) * Math.PI * 2 + orb.driftPhaseY) *
          5;

        // Opacity pulse
        const pulseCycle =
          ((frame % orb.pulseSpeed) / orb.pulseSpeed) * Math.PI * 2;
        const pulseMultiplier =
          0.6 + (Math.sin(pulseCycle + orb.pulsePhase) + 1) * 0.2;

        // Bright pulse (quick flash near a single frame)
        let brightBoost = 0;
        if (
          orb.brightPulseFrame >= 0 &&
          Math.abs(frame - orb.brightPulseFrame) < 15
        ) {
          const dist = Math.abs(frame - orb.brightPulseFrame) / 15;
          brightBoost = (1 - dist) * 0.15;
        }

        const opacity = orb.baseOpacity * pulseMultiplier + brightBoost;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${orb.x + driftX}%`,
              top: `${orb.y + driftY}%`,
              width: orb.radius * 2,
              height: orb.radius * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${tintColor} 0%, transparent 70%)`,
              opacity,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(8px)',
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingOrbsEffect;
