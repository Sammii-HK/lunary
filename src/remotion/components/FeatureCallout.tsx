import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export interface FeatureCalloutProps {
  text: string;
  /** Absolute frame to appear */
  frameIn: number;
  /** Absolute frame to disappear */
  frameOut: number;
  /** Normalised position in composition space (0–1) + which side of the phone */
  position: {
    x: number;
    y: number;
    side: 'left' | 'right';
  };
  /** Accent colour, default lunary primary */
  color?: string;
  /** Optional emoji/icon prefix */
  icon?: string;
  /** Horizontal connector line length in px, default 60 */
  lineLength?: number;
}

/**
 * Floating pill label that animates in beside a phone mockup.
 *
 * Spring scale-in from 0.7 → 1, fade in/out over 6 frames each.
 * Optional horizontal connector line pointing toward the screen.
 * Position is normalised 0–1 relative to the composition dimensions.
 */
export const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  text,
  frameIn,
  frameOut,
  position,
  color = '#8458D8',
  icon,
  lineLength = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: compWidth, height: compHeight } = useVideoConfig();

  if (frame < frameIn || frame > frameOut) return null;

  const localFrame = frame - frameIn;
  const sceneDuration = frameOut - frameIn;

  const scaleValue = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 260 },
    from: 0.7,
    to: 1,
  });

  const fadeIn = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    localFrame,
    [sceneDuration - 6, sceneDuration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const opacity = Math.min(fadeIn, fadeOut);

  const x = position.x * compWidth;
  const y = position.y * compHeight;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateX(-50%) translateY(-50%) scale(${scaleValue})`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      {/* Connector line on the left */}
      {position.side === 'left' && (
        <div
          style={{
            width: lineLength,
            height: 2,
            backgroundColor: color,
            opacity: 0.5,
            marginRight: 8,
            flexShrink: 0,
          }}
        />
      )}

      {/* Pill */}
      <div
        style={{
          backgroundColor: 'rgba(13, 13, 20, 0.88)',
          border: `1px solid ${color}`,
          borderRadius: 10,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        {icon && <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>}
        <span
          style={{
            color: '#ffffff',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: 15,
            letterSpacing: 0.3,
          }}
        >
          {text}
        </span>
      </div>

      {/* Connector line on the right */}
      {position.side === 'right' && (
        <div
          style={{
            width: lineLength,
            height: 2,
            backgroundColor: color,
            opacity: 0.5,
            marginLeft: 8,
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
};
