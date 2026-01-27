import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, FONTS, STYLES } from '../styles/theme';

interface TopicCardProps {
  /** Topic title (e.g., "Moon Phase", "Planetary Transit") */
  title: string;
  /** Optional item detail (e.g., "Full Moon in Cancer") */
  item?: string;
  /** Optional icon emoji */
  icon?: string;
  /** Start frame for animation */
  startFrame?: number;
  /** Position: 'top' or 'bottom' */
  position?: 'top' | 'bottom';
}

/**
 * Topic Card Component
 *
 * Minimal slide-in for topic reveals:
 * - Slide-in from bottom (200ms, ease-out)
 * - Roboto for topic titles
 * - Clean divider line animations
 * - Icon reveals with opacity fade (no scaling/bouncing)
 */
export const TopicCard: React.FC<TopicCardProps> = ({
  title,
  item,
  icon,
  startFrame = 0,
  position = 'top',
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0) return null;

  // Slide in from bottom (6 frames = 200ms at 30fps)
  const slideProgress = interpolate(relativeFrame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const translateY = (1 - slideProgress) * 30;
  const opacity = slideProgress;

  // Divider line draw animation (starts after slide completes)
  const lineProgress = interpolate(relativeFrame, [6, 18], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Icon fade in (starts after divider)
  const iconOpacity = icon
    ? interpolate(relativeFrame, [12, 18], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  // Item text fade in (after icon)
  const itemOpacity = item
    ? interpolate(relativeFrame, [15, 21], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  const positionStyle =
    position === 'top'
      ? { top: '8%', left: '5%', right: '5%' }
      : { bottom: '20%', left: '5%', right: '5%' };

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: STYLES.topicCard.backgroundColor,
          borderLeft: `3px solid ${STYLES.topicCard.borderColor}`,
          padding: STYLES.topicCard.padding,
          borderRadius: STYLES.topicCard.borderRadius,
        }}
      >
        {/* Topic title with optional icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {icon && (
            <span
              style={{
                fontSize: 32,
                opacity: iconOpacity,
              }}
            >
              {icon}
            </span>
          )}
          <h2
            style={{
              fontFamily: FONTS.title,
              fontWeight: FONTS.titleWeight,
              fontSize: 36,
              color: COLORS.primaryText,
              margin: 0,
              letterSpacing: 1,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Animated divider line */}
        <div
          style={{
            marginTop: 12,
            marginBottom: 12,
            height: 1,
            background: `linear-gradient(90deg, ${COLORS.cosmicPurple} ${lineProgress}%, transparent ${lineProgress}%)`,
          }}
        />

        {/* Item detail */}
        {item && (
          <p
            style={{
              fontFamily: FONTS.body,
              fontWeight: FONTS.bodyWeight,
              fontSize: 24,
              color: COLORS.secondaryText,
              margin: 0,
              opacity: itemOpacity,
            }}
          >
            {item}
          </p>
        )}
      </div>
    </div>
  );
};

export default TopicCard;
