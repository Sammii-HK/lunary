import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, FONTS } from '../styles/theme';
import { letterSpacingAnimation } from '../utils/animations';

interface HookSequenceProps {
  /** Main hook text (attention grabbing) */
  hookText: string;
  /** Optional subtitle/context */
  subtitle?: string;
  /** Start frame for the sequence */
  startFrame?: number;
  /** Total duration in frames */
  durationFrames?: number;
}

/**
 * Hook Sequence Component
 *
 * Elegant intro for TikTok/Reels content:
 * - Fade-in from black (no flash or pulse)
 * - Roboto typography reveal
 * - Subtle text tracking animation (letters spacing in)
 * - Goal: Intrigue, not overwhelm
 */
export const HookSequence: React.FC<HookSequenceProps> = ({
  hookText,
  subtitle,
  startFrame = 0,
  durationFrames = 90, // 3 seconds at 30fps
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0) return null;

  // Main text fade in (0-15 frames)
  const textOpacity = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Letter spacing animation (wide to normal)
  const letterSpacing = letterSpacingAnimation(relativeFrame, 0, 20, 8, 2);

  // Subtle scale from 0.97 to 1
  const scale = interpolate(relativeFrame, [0, 20], [0.97, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle fade in (delayed by 15 frames)
  const subtitleOpacity = subtitle
    ? interpolate(relativeFrame, [15, 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  // Fade out at end
  const fadeOutStart = durationFrames - 15;
  const fadeOut = interpolate(
    relativeFrame,
    [fadeOutStart, durationFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    },
  );

  const finalOpacity = Math.min(textOpacity, fadeOut);
  const subtitleFinalOpacity = Math.min(subtitleOpacity, fadeOut);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10%',
      }}
    >
      {/* Main hook text */}
      <h1
        style={{
          fontFamily: FONTS.title,
          fontWeight: FONTS.titleWeight,
          fontSize: 64,
          color: COLORS.primaryText,
          textAlign: 'center',
          opacity: finalOpacity,
          transform: `scale(${scale})`,
          letterSpacing,
          margin: 0,
          lineHeight: 1.2,
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {hookText}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: FONTS.body,
            fontWeight: FONTS.bodyWeight,
            fontSize: 28,
            color: COLORS.secondaryText,
            textAlign: 'center',
            opacity: subtitleFinalOpacity,
            marginTop: 24,
            letterSpacing: 1,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HookSequence;
