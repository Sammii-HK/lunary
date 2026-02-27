import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

export interface Overlay {
  text: string;
  startTime: number;
  endTime: number;
  style?: 'hook' | 'hook_large' | 'cta' | 'stamp' | 'chapter' | 'series_badge';
}

interface TextOverlaysProps {
  overlays: Overlay[];
  /** Accent color for themed elements (hook highlight, CTA underline, stamp border) */
  accentColor?: string;
}

/**
 * Text Overlays Component - matches FFmpeg styling with category theming
 *
 * Styles:
 * - hook: 55% from top, fontSize 46px, first highlight term colored
 * - cta: 25% from top, fontSize 48px, subtle accent underline
 * - stamp: 90% from top, fontSize 32px, left accent border
 * - chapter: 55% from top, fontSize 44px
 *
 * All use: Roboto Mono Regular (400), white, no background, outline + shadow
 */
export const TextOverlays: React.FC<TextOverlaysProps> = ({
  overlays,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Base font size for story format (1080x1920)
  const baseFontSize = 44;

  // Get font size by style (matching FFmpeg)
  const getFontSize = (style: string) => {
    switch (style) {
      case 'hook':
        return baseFontSize + 2; // 46px
      case 'cta':
        return baseFontSize + 4; // 48px
      case 'stamp':
        return baseFontSize - 12; // 32px
      case 'series_badge':
        return 28;
      case 'chapter':
      default:
        return baseFontSize - 4; // 40px — slightly smaller to fit pill
    }
  };

  // Get Y position by style - hook and chapter closer to subtitles at bottom
  const getYPosition = (style: string) => {
    switch (style) {
      case 'hook':
        return '40%'; // TikTok safe zone - centered upper
      case 'cta':
        return '18%'; // TikTok safe zone - upper third, well clear of stars
      case 'stamp':
        return '60%'; // TikTok safe zone - well above subtitles (which are at 78%)
      case 'series_badge':
        return '15%'; // TikTok safe zone - just below top UI
      case 'chapter':
      default:
        return '40%'; // TikTok safe zone - centered upper
    }
  };

  // Wrap text to ~25 chars per line (matching FFmpeg maxCharsPerLine for story)
  const wrapText = (text: string, maxChars: number = 25): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const separator = currentLine ? ' ' : '';
      const testLine = currentLine + separator + word;

      if (testLine.length <= maxChars) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Softer text shadow - subtle outline + gentle drop shadow
  const textShadow = `
    -1px -1px 0 rgba(0,0,0,0.5),
    1px -1px 0 rgba(0,0,0,0.5),
    -1px 1px 0 rgba(0,0,0,0.5),
    1px 1px 0 rgba(0,0,0,0.5),
    0 0 8px rgba(0,0,0,0.4),
    2px 2px 4px rgba(0,0,0,0.3)
  `;

  return (
    <>
      {overlays.map((overlay, index) => {
        const isVisible =
          currentTime >= overlay.startTime && currentTime < overlay.endTime;

        if (!isVisible) return null;

        const style = overlay.style || 'chapter';
        const fontSize = getFontSize(style);
        const yPosition = getYPosition(style);
        const shouldWrap =
          style === 'hook' || style === 'cta' || style === 'chapter';
        const lines = shouldWrap ? wrapText(overlay.text) : [overlay.text];
        const lineHeight = fontSize * 1.4;

        // Fade in/out animation (200ms = 6 frames at 30fps)
        const startFrame = overlay.startTime * fps;
        const endFrame = overlay.endTime * fps;
        const fadeInDuration = 6;
        const fadeOutDuration = 6;

        const fadeIn = interpolate(
          frame,
          [startFrame, startFrame + fadeInDuration],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          },
        );

        const fadeOut = interpolate(
          frame,
          [endFrame - fadeOutDuration, endFrame],
          [1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.in(Easing.cubic),
          },
        );

        const opacity = Math.min(fadeIn, fadeOut);

        // Slide-up entrance (stronger for CTA, subtle for chapter)
        const slideUp = interpolate(
          frame,
          [startFrame, startFrame + fadeInDuration],
          [style === 'cta' ? -20 : 12, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          },
        );

        // Style-specific accent enhancements
        const isStamp = style === 'stamp';
        const isCta = style === 'cta';
        const isSeriesBadge = style === 'series_badge';

        return (
          <div
            key={`overlay-${index}-${overlay.startTime}`}
            style={{
              position: 'absolute',
              top: yPosition,
              left: '5%',
              right: '5%',
              transform: `translateY(calc(-50% + ${slideUp}px))`,
              textAlign: 'center',
              opacity,
              zIndex: 15,
            }}
          >
            {/* CTA: full-width card with gradient + accent glow */}
            {isCta ? (
              <div
                style={{
                  display: 'inline-block',
                  background: accentColor
                    ? `linear-gradient(135deg, ${accentColor}22 0%, rgba(0,0,0,0.7) 100%)`
                    : 'rgba(0,0,0,0.7)',
                  border: `1px solid ${accentColor ?? 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 16,
                  paddingLeft: 32,
                  paddingRight: 32,
                  paddingTop: 18,
                  paddingBottom: 18,
                  boxShadow: accentColor
                    ? `0 0 24px ${accentColor}40, inset 0 1px 0 rgba(255,255,255,0.1)`
                    : 'none',
                }}
              >
                {lines.map((line, lineIndex) => (
                  <p
                    key={lineIndex}
                    style={{
                      fontFamily: 'Roboto Mono, monospace',
                      fontSize: fontSize + 2,
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: `${lineHeight}px`,
                      margin: lineIndex > 0 ? '4px 0 0' : 0,
                      textShadow,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              lines.map((line, lineIndex) => (
                <p
                  key={lineIndex}
                  style={{
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize,
                    fontWeight: style === 'chapter' ? 600 : 400,
                    color: '#ffffff',
                    lineHeight: `${lineHeight}px`,
                    margin: lineIndex > 0 ? '4px 0 0' : 0,
                    textShadow,
                    // Chapter: pill with semi-transparent background
                    ...(style === 'chapter'
                      ? {
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 12,
                          paddingLeft: 18,
                          paddingRight: 18,
                          paddingTop: 8,
                          paddingBottom: 8,
                          display: 'inline-block',
                        }
                      : {}),
                    // Stamp: left accent border
                    ...(isStamp && accentColor
                      ? {
                          borderLeft: `3px solid ${accentColor}`,
                          paddingLeft: 14,
                          paddingTop: 4,
                          paddingBottom: 4,
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          display: 'inline-block',
                        }
                      : {}),
                    // Series badge: pill with accent bg
                    ...(isSeriesBadge
                      ? {
                          borderRadius: 20,
                          backgroundColor: accentColor
                            ? `${accentColor}4D`
                            : 'rgba(90, 215, 255, 0.3)',
                          border: `1px solid ${accentColor || 'rgba(90, 215, 255, 0.6)'}`,
                          paddingLeft: 16,
                          paddingRight: 16,
                          paddingTop: 6,
                          paddingBottom: 6,
                          display: 'inline-block',
                          fontWeight: 600,
                        }
                      : {}),
                  }}
                >
                  {line}
                </p>
              ))
            )}
          </div>
        );
      })}
    </>
  );
};

export default TextOverlays;
