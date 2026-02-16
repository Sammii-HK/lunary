import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from 'remotion';
import { COLORS } from '../styles/theme';

import type { HookIntroVariant } from '@/lib/social/video-scripts/types';

interface HookIntroProps {
  /** The hook text to display */
  text: string;
  /** When the hook starts (seconds) */
  startTime: number;
  /** When the hook ends (seconds) */
  endTime: number;
  /** Accent color for the highlight word */
  accentColor?: string;
  /** Highlight terms — first match gets accent color */
  highlightTerms?: string[];
  /** Animation variant (#7) */
  variant?: HookIntroVariant;
}

/**
 * Animated Hook Intro — TikTok-native title card.
 *
 * Words animate in one by one with a subtle slide-up + fade,
 * then the full text holds, then fades out. The first highlight
 * term gets the accent color and a slight scale emphasis.
 *
 * Positioned in the upper-center area so it doesn't compete
 * with subtitles at the bottom.
 */
export const HookIntro: React.FC<HookIntroProps> = ({
  text,
  startTime,
  endTime,
  accentColor,
  highlightTerms = [],
  variant = 'slide_up',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = Math.round(startTime * fps);
  const endFrame = Math.round(endTime * fps);
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  // Not visible outside time range
  if (frame < startFrame || frame >= endFrame) return null;

  const words = text.split(/\s+/).filter(Boolean);

  // Poster frame: on frame 0 with startTime=0, show all words instantly
  // so the thumbnail/preview has readable text
  const isPosterFrame = startTime === 0 && frame === 0;

  // Animation timing
  const wordEntranceDuration = 4; // frames per word entrance
  const totalEntranceTime = words.length * wordEntranceDuration;
  // Hold for the middle portion
  const fadeOutStart = totalFrames - 12; // 0.4s fade out

  // Overall container fade out
  const containerOpacity = interpolate(
    localFrame,
    [fadeOutStart, totalFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Check if a word is a highlight term
  const isHighlight = (word: string) => {
    const clean = word.replace(/[.,!?;:'"]/g, '').toLowerCase();
    return highlightTerms.some((term) => clean === term.toLowerCase());
  };

  // Find the first highlight word index for special treatment
  const firstHighlightIdx = words.findIndex((w) => isHighlight(w));

  return (
    <div
      style={{
        position: 'absolute',
        top: '28%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        textAlign: 'center',
        opacity: containerOpacity,
        zIndex: 16,
        pointerEvents: 'none',
      }}
    >
      {/* Full-width background bar for legibility */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          paddingTop: 28,
          paddingBottom: 28,
          paddingLeft: '8%',
          paddingRight: '8%',
          borderTop: '2px solid rgba(255, 255, 255, 0.15)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '6px 14px',
          }}
        >
          {words.map((word, idx) => {
            // Each word enters with a stagger
            const wordStart = idx * wordEntranceDuration;

            // Highlight word gets accent color and a pop after entrance
            const highlighted = idx === firstHighlightIdx && accentColor;

            // Settled state subtle glow for highlight word
            const isSettled = localFrame > totalEntranceTime + 6;

            // Variant-specific animations
            let wordOpacity = 1;
            let transformStyle = '';

            // Poster frame: all words fully visible, no animation
            if (isPosterFrame) {
              wordOpacity = 1;
              transformStyle = '';
            } else if (variant === 'typewriter') {
              // Typewriter: left-to-right opacity fade
              wordOpacity = interpolate(
                localFrame,
                [wordStart, wordStart + 2],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              transformStyle = highlighted
                ? `scale(${interpolate(
                    localFrame,
                    [
                      wordStart + wordEntranceDuration,
                      wordStart + wordEntranceDuration + 6,
                      wordStart + wordEntranceDuration + 12,
                    ],
                    [1.0, 1.12, 1.0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                  )})`
                : '';
            } else if (variant === 'scale_pop') {
              // Scale pop: center-out scale-from-0 with bounce
              const scaleValue = spring({
                frame: Math.max(0, localFrame - wordStart),
                fps,
                config: { damping: 8, stiffness: 150, mass: 0.5 },
              });
              wordOpacity = interpolate(
                localFrame,
                [wordStart, wordStart + 2],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              const highlightPop = highlighted
                ? interpolate(
                    localFrame,
                    [
                      wordStart + wordEntranceDuration,
                      wordStart + wordEntranceDuration + 6,
                      wordStart + wordEntranceDuration + 12,
                    ],
                    [1.0, 1.12, 1.0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                  )
                : 1.0;
              transformStyle = `scale(${scaleValue * highlightPop})`;
            } else {
              // Default: slide_up (existing behavior)
              wordOpacity = interpolate(
                localFrame,
                [wordStart, wordStart + wordEntranceDuration],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              const slideUp = interpolate(
                localFrame,
                [wordStart, wordStart + wordEntranceDuration],
                [14, 0],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: Easing.out(Easing.cubic),
                },
              );
              const highlightPop = highlighted
                ? interpolate(
                    localFrame,
                    [
                      wordStart + wordEntranceDuration,
                      wordStart + wordEntranceDuration + 6,
                      wordStart + wordEntranceDuration + 12,
                    ],
                    [1.0, 1.12, 1.0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                  )
                : 1.0;
              transformStyle = `translateY(${slideUp}px) scale(${highlightPop})`;
            }

            return (
              <span
                key={idx}
                style={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: words.length <= 6 ? 56 : 46,
                  fontWeight: highlighted ? 700 : 600,
                  color: highlighted ? accentColor : COLORS.primaryText,
                  opacity: wordOpacity,
                  transform: transformStyle,
                  display: 'inline-block',
                  textShadow:
                    highlighted && isSettled
                      ? `0 0 20px ${accentColor}40, 0 0 40px ${accentColor}20`
                      : `
                    -1px -1px 0 rgba(0,0,0,0.6),
                    1px -1px 0 rgba(0,0,0,0.6),
                    -1px 1px 0 rgba(0,0,0,0.6),
                    1px 1px 0 rgba(0,0,0,0.6),
                    0 2px 8px rgba(0,0,0,0.5)
                  `,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                }}
              >
                {word}
              </span>
            );
          })}
          {/* Typewriter blinking cursor */}
          {variant === 'typewriter' &&
            localFrame >= words.length * wordEntranceDuration && (
              <span
                style={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: words.length <= 6 ? 56 : 46,
                  fontWeight: 400,
                  color: COLORS.primaryText,
                  opacity: Math.sin(localFrame * 0.3) > 0 ? 1 : 0,
                  display: 'inline-block',
                  lineHeight: 1.3,
                }}
              >
                |
              </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default HookIntro;
