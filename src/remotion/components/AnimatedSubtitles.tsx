import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, STYLES } from '../styles/theme';
import type { AudioSegment } from '../utils/timing';
import { secondsToFrames } from '../utils/timing';

interface AnimatedSubtitlesProps {
  /** Audio segments with text and timing */
  segments: AudioSegment[];
  /** Highlight specific terms */
  highlightTerms?: string[];
  /** Custom highlight color */
  highlightColor?: string;
  /** Font size */
  fontSize?: number;
  /** Position from bottom (percentage) */
  bottomPosition?: number;
  /** FPS for timing calculations */
  fps?: number;
}

/**
 * Animated Subtitles Component
 *
 * Brand-compliant subtitle system:
 * - Clean fade-in by sentence (not word-by-word)
 * - Subtle keyword emphasis via opacity or slight weight change
 * - Smooth 200ms fade-out
 * - Good contrast against dark backgrounds
 */
export const AnimatedSubtitles: React.FC<AnimatedSubtitlesProps> = ({
  segments,
  highlightTerms = [],
  highlightColor = COLORS.highlightBlue,
  fontSize = STYLES.subtitle.fontSize,
  bottomPosition = 12,
  fps = 30,
}) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  // Find current segment
  const currentSegment = segments.find(
    (seg) => currentTime >= seg.startTime && currentTime < seg.endTime,
  );

  if (!currentSegment) return null;

  const segmentStartFrame = secondsToFrames(currentSegment.startTime, fps);
  const segmentEndFrame = secondsToFrames(currentSegment.endTime, fps);

  // Fade in (first 6 frames = 200ms at 30fps)
  const fadeInDuration = 6;
  const fadeOutDuration = 6;

  const fadeIn = interpolate(
    frame,
    [segmentStartFrame, segmentStartFrame + fadeInDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  // Fade out (last 6 frames)
  const fadeOut = interpolate(
    frame,
    [segmentEndFrame - fadeOutDuration, segmentEndFrame],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    },
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle slide up on entry
  const slideUp = interpolate(
    frame,
    [segmentStartFrame, segmentStartFrame + fadeInDuration],
    [8, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  // Render text with highlights
  const renderText = () => {
    if (highlightTerms.length === 0) {
      return currentSegment.text;
    }

    // Build regex to find highlight terms
    const escapedTerms = highlightTerms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

    const parts = currentSegment.text.split(regex);

    return parts.map((part, index) => {
      const isHighlight = highlightTerms.some(
        (term) => part.toLowerCase() === term.toLowerCase(),
      );

      if (isHighlight) {
        return (
          <span key={index} style={{ color: highlightColor, fontWeight: 500 }}>
            {part}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  // FFmpeg-matching style: no background box, outline + shadow
  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${bottomPosition}%`,
        left: '5%',
        right: '5%',
        textAlign: 'center',
        opacity,
        transform: `translateY(${slideUp}px)`,
        zIndex: 15, // Above stars (5), below fade transitions (100)
      }}
    >
      <p
        style={{
          fontFamily: 'Roboto Mono, monospace',
          fontSize,
          fontWeight: 500, // Medium weight - less bold
          color: COLORS.primaryText,
          lineHeight: 1.4,
          margin: 0,
          // Softer shadow - subtle outline + gentle glow
          textShadow: `
            -1px -1px 0 rgba(0,0,0,0.5),
            1px -1px 0 rgba(0,0,0,0.5),
            -1px 1px 0 rgba(0,0,0,0.5),
            1px 1px 0 rgba(0,0,0,0.5),
            0 0 8px rgba(0,0,0,0.4),
            2px 2px 4px rgba(0,0,0,0.3)
          `,
        }}
      >
        {renderText()}
      </p>
    </div>
  );
};

export default AnimatedSubtitles;
