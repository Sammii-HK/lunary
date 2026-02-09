import React from 'react';
import { useCurrentFrame, interpolate, Easing, staticFile } from 'remotion';
import { COLORS } from '../styles/theme';
import { letterSpacingAnimation } from '../utils/animations';

interface HookSequenceProps {
  /** Main hook text (attention grabbing) */
  hookText: string;
  /** Optional subtitle/context */
  subtitle?: string;
  /** Date range (e.g., "Feb 9 - Feb 15") */
  dateRange?: string;
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
  dateRange,
  startFrame = 0,
  durationFrames = 150, // 5 seconds at 30fps for long-form
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;
  const logoUrl = staticFile('/logo.svg');

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

  // Logo fade in (earlier than text)
  const logoOpacity = interpolate(relativeFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Date range fade in (after subtitle)
  const dateRangeOpacity = dateRange
    ? interpolate(relativeFrame, [30, 45], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  // Brand URL fade in (last)
  const brandOpacity = interpolate(relativeFrame, [45, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

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
        padding: '8%',
        gap: '32px',
      }}
    >
      {/* Moon logo */}
      <img
        src={logoUrl}
        alt='Lunary'
        style={{
          width: '120px',
          height: '120px',
          opacity: Math.min(logoOpacity, fadeOut),
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
        }}
      />

      {/* Main title text with date on new line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <h1
          style={{
            fontFamily: 'Roboto Mono, monospace',
            fontWeight: 400,
            fontSize: 72,
            color: COLORS.primaryText,
            textAlign: 'center',
            opacity: finalOpacity,
            transform: `scale(${scale})`,
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2,
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {hookText}
        </h1>

        {/* Date range as part of title */}
        {dateRange && (
          <p
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 300,
              fontSize: 32,
              color: COLORS.primaryText,
              textAlign: 'center',
              opacity: finalOpacity,
              margin: 0,
              letterSpacing: '-0.01em',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {dateRange}
          </p>
        )}
      </div>

      {/* Subtitle with accent color */}
      {subtitle && (
        <p
          style={{
            fontFamily: 'Roboto Mono, monospace',
            fontWeight: 300,
            fontSize: 28,
            color: '#8B7DFF', // Accent purple/blue from screenshot
            textAlign: 'center',
            opacity: subtitleFinalOpacity,
            margin: 0,
            letterSpacing: '-0.01em',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Brand URL at bottom */}
      <p
        style={{
          fontFamily: 'Roboto Mono, monospace',
          fontWeight: 300,
          fontSize: 18,
          color: COLORS.secondaryText,
          textAlign: 'center',
          opacity: Math.min(brandOpacity, fadeOut),
          margin: 0,
          letterSpacing: 0,
          position: 'absolute',
          bottom: '12%',
        }}
      >
        lunary.app
      </p>
    </div>
  );
};

export default HookSequence;
