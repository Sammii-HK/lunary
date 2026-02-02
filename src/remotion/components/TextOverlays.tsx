import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

interface Overlay {
  text: string;
  startTime: number;
  endTime: number;
  style?: 'hook' | 'cta' | 'stamp' | 'chapter';
}

interface TextOverlaysProps {
  overlays: Overlay[];
}

/**
 * Text Overlays Component - matches FFmpeg styling exactly
 *
 * Styles:
 * - hook: 55% from top, fontSize 46px
 * - cta: 25% from top, fontSize 48px
 * - stamp: 90% from top, fontSize 32px
 * - chapter: 55% from top, fontSize 44px
 *
 * All use: Roboto Mono Regular (400), white, no background, outline + shadow
 */
export const TextOverlays: React.FC<TextOverlaysProps> = ({ overlays }) => {
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
      case 'chapter':
      default:
        return baseFontSize; // 44px
    }
  };

  // Get Y position by style - hook and chapter closer to subtitles at bottom
  const getYPosition = (style: string) => {
    switch (style) {
      case 'hook':
        return '68%'; // Closer to subtitles
      case 'cta':
        return '25%';
      case 'stamp':
        return '88%'; // Near bottom, below subtitles
      case 'chapter':
      default:
        return '68%'; // Closer to subtitles
    }
  };

  // Wrap text to ~25 chars per line (matching FFmpeg maxCharsPerLine for story)
  const wrapText = (text: string, maxChars: number = 25): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxChars) {
        currentLine += (currentLine ? ' ' : '') + word;
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

        return (
          <div
            key={`overlay-${index}-${overlay.startTime}`}
            style={{
              position: 'absolute',
              top: yPosition,
              left: '5%',
              right: '5%',
              transform: 'translateY(-50%)',
              textAlign: 'center',
              opacity,
              zIndex: 15, // Above stars (5) and background, below fade transitions
            }}
          >
            {lines.map((line, lineIndex) => (
              <p
                key={lineIndex}
                style={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize,
                  fontWeight: 400, // Regular weight to match FFmpeg RobotoMono-Regular
                  color: '#ffffff',
                  lineHeight: `${lineHeight}px`,
                  margin: 0,
                  textShadow,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </>
  );
};

export default TextOverlays;
