import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import type { Overlay } from './TextOverlays';

interface TextScrimProps {
  /** Text overlays to derive visibility from */
  overlays: Overlay[];
  /** Hook start/end time (seconds) */
  hookStartTime?: number;
  hookEndTime?: number;
  /** Outro start/end time (seconds) */
  outroStartTime?: number;
  outroEndTime?: number;
}

/**
 * Conditional dark gradient that only appears when text overlays are visible.
 *
 * Renders a semi-transparent gradient strip covering the top ~25% of frame,
 * fading in/out with 6-frame transitions when any text is active.
 *
 * zIndex 8: above video (1) but below text overlays (15-16).
 */
export const TextScrim: React.FC<TextScrimProps> = ({
  overlays,
  hookStartTime,
  hookEndTime,
  outroStartTime,
  outroEndTime,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build intervals where text is visible
  const intervals: Array<{ start: number; end: number }> = [];

  if (hookStartTime !== undefined && hookEndTime !== undefined) {
    intervals.push({ start: hookStartTime, end: hookEndTime });
  }

  for (const overlay of overlays) {
    intervals.push({ start: overlay.startTime, end: overlay.endTime });
  }

  if (outroStartTime !== undefined && outroEndTime !== undefined) {
    intervals.push({ start: outroStartTime, end: outroEndTime });
  }

  if (intervals.length === 0) return null;

  // Calculate smooth opacity with fade transitions
  let opacity = 0;
  for (const interval of intervals) {
    const startFrame = Math.round(interval.start * fps);
    const endFrame = Math.round(interval.end * fps);
    const fadeDuration = 6;

    const fadeIn = interpolate(
      frame,
      [startFrame - fadeDuration, startFrame],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    const fadeOut = interpolate(
      frame,
      [endFrame, endFrame + fadeDuration],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    const intervalOpacity = Math.min(fadeIn, fadeOut);
    opacity = Math.max(opacity, intervalOpacity);
  }

  if (opacity <= 0) return null;

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
        clipPath: 'inset(0 0 75% 0)',
        opacity,
        zIndex: 8,
        pointerEvents: 'none',
      }}
    />
  );
};

export default TextScrim;
