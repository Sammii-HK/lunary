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
    /** 'right' = callout is to the right of the phone, connector points left toward phone */
    side: 'left' | 'right';
  };
  /** Accent colour, default lunary primary */
  color?: string;
  /** Horizontal connector line length in px, default 50 */
  lineLength?: number;
}

/**
 * Floating pill label that animates in beside a phone mockup.
 *
 * The connector line always points toward the phone:
 *   - side='right' → callout is to the right of phone → connector on LEFT of pill
 *   - side='left'  → callout is to the left of phone  → connector on RIGHT of pill
 */
export const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  text,
  frameIn,
  frameOut,
  position,
  color = '#8458D8',
  lineLength = 50,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: compWidth, height: compHeight } = useVideoConfig();

  if (frame < frameIn || frame > frameOut) return null;

  const localFrame = frame - frameIn;
  const sceneDuration = frameOut - frameIn;

  const scaleValue = spring({
    frame: localFrame,
    fps,
    config: { damping: 22, stiffness: 280 },
    from: 0.8,
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

  // Connector draws in from 0 → lineLength over first 12 frames
  const connectorWidth = interpolate(localFrame, [0, 12], [0, lineLength], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
      {/* Connector points toward the phone.
          side='right': callout is RIGHT of phone → connector on LEFT of pill */}
      {position.side === 'right' && (
        <div
          style={{
            width: connectorWidth,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${color}99)`,
            marginRight: 8,
            flexShrink: 0,
          }}
        />
      )}

      {/* Pill */}
      <div
        style={{
          backgroundColor: 'rgba(10, 10, 18, 0.92)',
          border: `1px solid ${color}80`,
          borderRadius: 8,
          paddingLeft: 14,
          paddingRight: 14,
          paddingTop: 7,
          paddingBottom: 7,
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          boxShadow: `0 0 16px ${color}30`,
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontFamily: 'Roboto Mono, monospace',
            fontWeight: 400,
            fontSize: 14,
            letterSpacing: '0.04em',
          }}
        >
          {text}
        </span>
      </div>

      {/* side='left': callout is LEFT of phone → connector on RIGHT of pill */}
      {position.side === 'left' && (
        <div
          style={{
            width: connectorWidth,
            height: 1.5,
            background: `linear-gradient(270deg, transparent, ${color}99)`,
            marginLeft: 8,
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
};
