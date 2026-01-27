import { interpolate, Easing } from 'remotion';
import { TIMING } from '../styles/theme';

/**
 * Reusable animation helpers for Lunary Remotion compositions
 * All animations follow the brand aesthetic: subtle, premium, minimal
 */

/**
 * Smooth fade in animation
 */
export function fadeIn(
  frame: number,
  startFrame: number,
  durationFrames: number = TIMING.fadeIn,
): number {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
}

/**
 * Smooth fade out animation
 */
export function fadeOut(
  frame: number,
  startFrame: number,
  durationFrames: number = TIMING.fadeOut,
): number {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
}

/**
 * Combined fade in and out for a segment
 */
export function fadeInOut(
  frame: number,
  startFrame: number,
  endFrame: number,
  fadeInDuration: number = TIMING.fadeIn,
  fadeOutDuration: number = TIMING.fadeOut,
): number {
  if (frame < startFrame) return 0;
  if (frame > endFrame) return 0;

  const fadeOutStart = endFrame - fadeOutDuration;

  if (frame <= startFrame + fadeInDuration) {
    return fadeIn(frame, startFrame, fadeInDuration);
  }

  if (frame >= fadeOutStart) {
    return fadeOut(frame, fadeOutStart, fadeOutDuration);
  }

  return 1;
}

/**
 * Subtle slide in from bottom
 */
export function slideInFromBottom(
  frame: number,
  startFrame: number,
  durationFrames: number = TIMING.slideIn,
  distance: number = 30,
): { opacity: number; translateY: number } {
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  return {
    opacity: progress,
    translateY: (1 - progress) * distance,
  };
}

/**
 * Subtle slide in from left
 */
export function slideInFromLeft(
  frame: number,
  startFrame: number,
  durationFrames: number = TIMING.slideIn,
  distance: number = 20,
): { opacity: number; translateX: number } {
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  return {
    opacity: progress,
    translateX: (progress - 1) * distance,
  };
}

/**
 * Line draw animation (for lower thirds)
 */
export function lineDrawProgress(
  frame: number,
  startFrame: number,
  durationFrames: number = 20,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 100],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );
}

/**
 * Subtle scale animation (for emphasis)
 */
export function subtleScale(
  frame: number,
  startFrame: number,
  durationFrames: number = 10,
  fromScale: number = 0.95,
  toScale: number = 1,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [fromScale, toScale],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );
}

/**
 * Letter spacing animation for text reveal
 */
export function letterSpacingAnimation(
  frame: number,
  startFrame: number,
  durationFrames: number = 15,
  fromSpacing: number = 10,
  toSpacing: number = 0,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [fromSpacing, toSpacing],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );
}

/**
 * Subtle pulse animation (for accents)
 */
export function subtlePulse(
  frame: number,
  cycleDurationFrames: number = 60,
  minOpacity: number = 0.7,
  maxOpacity: number = 1,
): number {
  const cycle = (frame % cycleDurationFrames) / cycleDurationFrames;
  const sine = Math.sin(cycle * Math.PI * 2);
  return minOpacity + (sine + 1) * 0.5 * (maxOpacity - minOpacity);
}

/**
 * Ken Burns zoom effect
 */
export function kenBurnsZoom(
  frame: number,
  totalFrames: number,
  startZoom: number = 1.0,
  endZoom: number = 1.04,
): number {
  return interpolate(frame, [0, totalFrames], [startZoom, endZoom], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.linear,
  });
}

/**
 * Subtle drift for organic movement
 */
export function subtleDrift(
  frame: number,
  xAmplitude: number = 8,
  yAmplitude: number = 6,
  speed: number = 90,
): { x: number; y: number } {
  return {
    x: Math.sin(frame / speed) * xAmplitude,
    y: Math.cos(frame / speed) * yAmplitude,
  };
}
