import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../styles/theme';

interface PersistentWatermarkProps {
  /** Text to display (e.g., "lunary.app") */
  text?: string;
  /** Position */
  position?: 'bottom-center' | 'bottom-right' | 'top-right';
  /** Opacity */
  opacity?: number;
  /** Fade in at start */
  fadeIn?: boolean;
  fps?: number;
}

/**
 * Persistent Watermark Component
 *
 * TikTok best practice: Keep branding visible throughout the video
 * Shows "lunary.app" or custom text as a subtle, persistent overlay
 */
export const PersistentWatermark: React.FC<PersistentWatermarkProps> = ({
  text = 'lunary.app',
  position = 'bottom-center',
  opacity = 0.6,
  fadeIn = true,
  fps = 30,
}) => {
  const frame = useCurrentFrame();

  // Fade in animation (first 1 second)
  const fadeOpacity = fadeIn
    ? interpolate(frame, [0, 30], [0, opacity], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.ease),
      })
    : opacity;

  // Position styles
  const positionStyle = React.useMemo(() => {
    switch (position) {
      case 'top-right':
        return {
          top: '5%',
          right: '5%',
        };
      case 'bottom-right':
        return {
          bottom: '5%',
          right: '5%',
        };
      case 'bottom-center':
      default:
        return {
          bottom: '3%',
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  }, [position]);

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        opacity: fadeOpacity,
        zIndex: 25,
        pointerEvents: 'none',
      }}
    >
      <p
        style={{
          fontFamily: 'Roboto Mono, monospace',
          fontWeight: 400,
          fontSize: 16,
          color: COLORS.primaryText,
          margin: 0,
          letterSpacing: '0.05em',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: '6px 12px',
          borderRadius: '4px',
        }}
      >
        {text}
      </p>
    </div>
  );
};
