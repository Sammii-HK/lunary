import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, FONTS, STYLES } from '../styles/theme';

interface LowerThirdProps {
  /** Main text line */
  title: string;
  /** Optional subtitle/secondary line */
  subtitle?: string;
  /** Start frame for animation */
  startFrame?: number;
  /** Duration in frames before fade out */
  durationFrames?: number;
  /** Accent line color */
  accentColor?: string;
}

/**
 * Lower Third Component
 *
 * Professional broadcast-style lower third:
 * - Thin accent line that draws in
 * - Roboto text fades in after line completes
 * - Dark semi-transparent background
 */
export const LowerThird: React.FC<LowerThirdProps> = ({
  title,
  subtitle,
  startFrame = 0,
  durationFrames = 120, // 4 seconds at 30fps
  accentColor = COLORS.lunarGold,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0) return null;
  if (relativeFrame > durationFrames) return null;

  // Accent line draw in (0-12 frames)
  const lineProgress = interpolate(relativeFrame, [0, 12], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Background fade in (starts with line)
  const bgOpacity = interpolate(relativeFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Title fade in (after line completes)
  const titleOpacity = interpolate(relativeFrame, [12, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle fade in (after title)
  const subtitleOpacity = subtitle
    ? interpolate(relativeFrame, [15, 21], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  // Fade out at end
  const fadeOutStart = durationFrames - 12;
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

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        right: '40%', // Lower thirds typically don't span full width
        opacity: fadeOut,
      }}
    >
      {/* Accent line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${accentColor} ${lineProgress}%, transparent ${lineProgress}%)`,
          marginBottom: 8,
        }}
      />

      {/* Content container */}
      <div
        style={{
          backgroundColor: STYLES.lowerThird.backgroundColor,
          padding: STYLES.lowerThird.padding,
          borderRadius: STYLES.lowerThird.borderRadius,
          opacity: bgOpacity,
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontFamily: FONTS.title,
            fontWeight: FONTS.titleWeight,
            fontSize: 28,
            color: COLORS.primaryText,
            margin: 0,
            opacity: titleOpacity,
            letterSpacing: 0.5,
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontFamily: FONTS.body,
              fontWeight: FONTS.bodyWeight,
              fontSize: 20,
              color: COLORS.secondaryText,
              margin: 0,
              marginTop: 4,
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default LowerThird;
