import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../styles/theme';

interface TransitionEffectProps {
  /** Type of transition */
  type: 'fade' | 'dissolve' | 'wipeDown';
  /** Start frame of transition */
  startFrame: number;
  /** Duration of transition in frames */
  durationFrames?: number;
  /** Direction: 'in' or 'out' */
  direction: 'in' | 'out';
  /** Custom color for wipe transitions */
  color?: string;
}

/**
 * Transition Effect Component
 *
 * Elegant transitions between segments:
 * - fade: Simple opacity fade
 * - dissolve: Slightly longer, more premium feel
 * - wipeDown: Subtle vertical reveal
 */
export const TransitionEffect: React.FC<TransitionEffectProps> = ({
  type,
  startFrame,
  durationFrames = 30,
  direction,
  color = COLORS.cosmicBlack,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > durationFrames) return null;

  const progress = interpolate(relativeFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing:
      type === 'dissolve'
        ? Easing.inOut(Easing.cubic)
        : Easing.out(Easing.cubic),
  });

  const actualProgress = direction === 'in' ? 1 - progress : progress;

  if (type === 'fade' || type === 'dissolve') {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: color,
          opacity: actualProgress,
          zIndex: 100, // Above all content for proper fade to/from black
        }}
      />
    );
  }

  if (type === 'wipeDown') {
    const height = actualProgress * 100;
    return (
      <AbsoluteFill
        style={{
          backgroundColor: color,
          clipPath: `inset(0 0 ${100 - height}% 0)`,
          zIndex: 100, // Above all content for proper transition
        }}
      />
    );
  }

  return null;
};

export default TransitionEffect;
