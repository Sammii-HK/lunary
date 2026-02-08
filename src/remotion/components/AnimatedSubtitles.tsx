import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, STYLES } from '../styles/theme';
import type { AudioSegment } from '../utils/timing';
import { secondsToFrames, splitTextWithTiming } from '../utils/timing';

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
  /** Enable word-level highlighting (TikTok CapCut style) */
  wordHighlight?: boolean;
  /** Background opacity override for adaptive contrast (#14) */
  backgroundOpacity?: number;
}

/**
 * Animated Subtitles Component
 *
 * Brand-compliant subtitle system:
 * - Clean fade-in by sentence
 * - Word-level highlighting: active word scales up and colors
 * - Keyword emphasis via color
 * - Smooth 200ms fade in/out
 * - Good contrast against dark backgrounds
 */
export const AnimatedSubtitles: React.FC<AnimatedSubtitlesProps> = ({
  segments,
  highlightTerms = [],
  highlightColor = COLORS.highlightBlue,
  fontSize = STYLES.subtitle.fontSize,
  bottomPosition = 12,
  fps = 30,
  wordHighlight = true,
  backgroundOpacity,
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

  // Check if a word is a highlight term
  const isHighlightTerm = (word: string): boolean => {
    if (highlightTerms.length === 0) return false;
    const clean = word.replace(/[.,!?;:'"]/g, '');
    return highlightTerms.some(
      (term) => clean.toLowerCase() === term.toLowerCase(),
    );
  };

  // Render text with word-level highlighting
  const renderWordHighlight = () => {
    const wordTimings = splitTextWithTiming(
      currentSegment.text,
      currentSegment.startTime,
      currentSegment.endTime,
      fps,
    );

    return wordTimings.map((wt, index) => {
      const isActive = frame >= wt.startFrame && frame < wt.endFrame;
      const isKeyword = isHighlightTerm(wt.word);

      // Scale animation for active word (3 frame transition)
      const scaleTransition = 3;
      const scale = isActive
        ? interpolate(
            frame,
            [wt.startFrame, wt.startFrame + scaleTransition],
            [1.0, 1.08],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          )
        : 1.0;

      // Active word or keyword gets highlight color
      const color = isActive || isKeyword ? highlightColor : COLORS.primaryText;
      const fontWeight = isActive ? 600 : isKeyword ? 500 : 500;

      return (
        <span
          key={index}
          style={{
            color,
            fontWeight,
            display: 'inline-block',
            transform: `scale(${scale})`,
            transition: 'transform 0.1s ease-out',
            marginRight: '0.25em',
          }}
        >
          {wt.word}
        </span>
      );
    });
  };

  // Legacy render: highlight terms only (no word-level)
  const renderText = () => {
    if (highlightTerms.length === 0) {
      return currentSegment.text;
    }

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
        zIndex: 15,
      }}
    >
      <p
        style={{
          fontFamily: 'Roboto Mono, monospace',
          fontSize,
          fontWeight: 500,
          color: COLORS.primaryText,
          lineHeight: 1.4,
          margin: 0,
          backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity ?? 0.45})`,
          borderRadius: 8,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
          display: 'inline-block',
          textShadow: `
            -1px -1px 0 rgba(0,0,0,0.3),
            1px -1px 0 rgba(0,0,0,0.3),
            -1px 1px 0 rgba(0,0,0,0.3),
            1px 1px 0 rgba(0,0,0,0.3)
          `,
        }}
      >
        {wordHighlight ? renderWordHighlight() : renderText()}
      </p>
    </div>
  );
};

export default AnimatedSubtitles;
