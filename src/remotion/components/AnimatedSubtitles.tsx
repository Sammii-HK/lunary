import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, STYLES } from '../styles/theme';
import type { AudioSegment } from '../utils/timing';
import { secondsToFrames, splitTextWithTiming } from '../utils/timing';

/** Subtitle highlight style:
 * - 'scale': original style — active word scales up with glow (subtle, polished)
 * - 'block': CapCut-style — active word gets a coloured background pill (punchy, high contrast)
 */
export type SubtitleHighlightStyle = 'scale' | 'block';

/**
 * Group words into display lines of 2-3 words to prevent orphaned single words.
 * Algorithm ensures no line has fewer than 2 words:
 *   2 words → [2]
 *   3 words → [3]
 *   4 words → [2, 2]
 *   5 words → [3, 2]
 *   6 words → [3, 3]
 */
function groupWordsIntoLines(words: string[]): string[][] {
  if (words.length <= 3) return [words];
  const lines: string[][] = [];
  let i = 0;
  while (i < words.length) {
    const remaining = words.length - i;
    if (remaining <= 3) {
      lines.push(words.slice(i));
      break;
    }
    // Take 3 if remaining - 3 >= 2 (won't leave an orphan), else take 2
    const take = remaining - 3 >= 2 ? 3 : 2;
    lines.push(words.slice(i, i + take));
    i += take;
  }
  return lines;
}

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
  /** Highlight style: 'scale' (original) or 'block' (coloured background pill) */
  highlightStyle?: SubtitleHighlightStyle;
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
  bottomPosition = 20, // TikTok safe zone: 20% from bottom = 80% from top
  fps = 30,
  wordHighlight = true,
  backgroundOpacity,
  highlightStyle = 'block',
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

  // Render text with word-level scale highlighting (original style)
  const renderWordHighlightScale = () => {
    const wordTimings = splitTextWithTiming(
      currentSegment.text,
      currentSegment.startTime,
      currentSegment.endTime,
      fps,
    );

    const words = wordTimings.map((wt) => wt.word);
    const lines = groupWordsIntoLines(words);

    let wordIdx = 0;
    return lines.map((lineWords, lineIndex) => (
      <span key={lineIndex} style={{ display: 'block' }}>
        {lineWords.map(() => {
          const wt = wordTimings[wordIdx];
          const idx = wordIdx;
          wordIdx++;
          const isActive = frame >= wt.startFrame && frame < wt.endFrame;
          const isKeyword = isHighlightTerm(wt.word);

          const color = isActive
            ? '#FFFFFF'
            : isKeyword
              ? highlightColor
              : 'rgba(255,255,255,0.75)';
          const fontWeight = isActive ? 800 : isKeyword ? 700 : 600;

          const wordScale = isActive
            ? interpolate(
                frame,
                [wt.startFrame, wt.startFrame + 3],
                [0.88, 1.06],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                },
              )
            : 1;

          return (
            <span
              key={idx}
              style={{
                color,
                fontWeight,
                display: 'inline-block',
                marginRight: '0.25em',
                transform: `scale(${wordScale})`,
                transformOrigin: 'bottom center',
                textShadow: isActive
                  ? `0 0 12px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.6)`
                  : `0 2px 6px rgba(0,0,0,0.5)`,
              }}
            >
              {wt.word}
            </span>
          );
        })}
      </span>
    ));
  };

  // Render text with coloured background block highlighting (CapCut style)
  const renderWordHighlightBlock = () => {
    const wordTimings = splitTextWithTiming(
      currentSegment.text,
      currentSegment.startTime,
      currentSegment.endTime,
      fps,
    );

    const words = wordTimings.map((wt) => wt.word);
    const lines = groupWordsIntoLines(words);

    let wordIdx = 0;
    return lines.map((lineWords, lineIndex) => (
      <span key={lineIndex} style={{ display: 'block' }}>
        {lineWords.map(() => {
          const wt = wordTimings[wordIdx];
          const idx = wordIdx;
          wordIdx++;
          const isActive = frame >= wt.startFrame && frame < wt.endFrame;
          const isKeyword = isHighlightTerm(wt.word);

          return (
            <span
              key={idx}
              style={{
                color: '#FFFFFF',
                fontWeight: isActive ? 800 : isKeyword ? 700 : 600,
                display: 'inline-block',
                marginRight: '0.2em',
                backgroundColor: isActive ? highlightColor : 'transparent',
                borderRadius: isActive ? 6 : 0,
                paddingLeft: isActive ? 6 : 0,
                paddingRight: isActive ? 6 : 0,
                paddingTop: isActive ? 2 : 0,
                paddingBottom: isActive ? 2 : 0,
                textShadow: isActive ? 'none' : `0 2px 6px rgba(0,0,0,0.5)`,
              }}
            >
              {wt.word}
            </span>
          );
        })}
      </span>
    ));
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

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${bottomPosition}%`,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
        transform: `translateY(${slideUp}px)`,
        zIndex: 15,
        paddingLeft: '5%',
        paddingRight: '5%',
      }}
    >
      <p
        style={{
          fontFamily: 'Roboto Mono, monospace',
          fontSize,
          fontWeight: 600,
          color: COLORS.primaryText,
          lineHeight: 1.45,
          margin: 0,
          backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity ?? 0.55})`,
          borderRadius: 10,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          display: 'inline-block',
          maxWidth: '90%',
        }}
      >
        {wordHighlight
          ? highlightStyle === 'block'
            ? renderWordHighlightBlock()
            : renderWordHighlightScale()
          : renderText()}
      </p>
    </div>
  );
};

export default AnimatedSubtitles;
