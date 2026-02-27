import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface PhoneMockupProps {
  children?: React.ReactNode;
  /** Degrees of forward lean (X-axis tilt), default 4 */
  tiltX?: number;
  /** Degrees of left/right lean (Y-axis tilt), default -10 */
  tiltY?: number;
  /** px of vertical float amplitude, default 8 */
  floatAmplitude?: number;
  /** Seconds per float cycle, default 4 */
  floatPeriod?: number;
  /** Overall scale multiplier, default 1 */
  scale?: number;
  /** Screen edge glow colour, default lunary primary */
  glowColor?: string;
  /** Phone chassis width in px at scale=1, default 280 */
  width?: number;
}

/**
 * CSS-based iPhone-style phone mockup for Remotion compositions.
 *
 * Uses CSS perspective + rotateX/Y to simulate 3D depth without Three.js.
 * Float animation driven by sin wave via useCurrentFrame().
 */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  tiltX = 4,
  tiltY = -10,
  floatAmplitude = 8,
  floatPeriod = 4,
  scale = 1,
  glowColor = '#8458D8',
  width = 280,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sinusoidal float
  const floatOffset =
    Math.sin((frame / fps / floatPeriod) * Math.PI * 2) * floatAmplitude;

  const phoneWidth = width * scale;
  // iPhone-style aspect: 9 wide × 19.5 tall
  const phoneHeight = phoneWidth * (19.5 / 9);

  const borderRadius = 44 * scale;
  const islandWidth = phoneWidth * 0.3;
  const islandHeight = Math.max(12 * scale, 8);

  // Screen insets (leaves space for Dynamic Island at top, home indicator at bottom)
  const screenPadX = 4 * scale;
  const screenPadTop = 16 * scale;
  const screenPadBottom = 6 * scale;

  const screenWidth = phoneWidth - screenPadX * 2;
  const screenHeight = phoneHeight - screenPadTop - screenPadBottom;

  const btnWidth = 4 * scale;

  return (
    <div
      style={{
        width: phoneWidth,
        height: phoneHeight,
        transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${floatOffset}px)`,
        transformOrigin: 'center center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Chassis */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#171717',
          borderRadius,
          border: `3px solid #2a2a2a`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow:
            '0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06) inset',
        }}
      >
        {/* Screen */}
        <div
          style={{
            position: 'absolute',
            left: screenPadX,
            top: screenPadTop,
            width: screenWidth,
            height: screenHeight,
            borderRadius: borderRadius - 4,
            overflow: 'hidden',
            boxShadow: `0 0 60px 8px ${glowColor}40`,
            backgroundColor: '#000',
          }}
        >
          {children}
        </div>

        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: 18 * scale,
            left: '50%',
            transform: 'translateX(-50%)',
            width: islandWidth,
            height: islandHeight,
            backgroundColor: '#0a0a0a',
            borderRadius: islandHeight / 2,
            zIndex: 10,
          }}
        />
      </div>

      {/* Power button (right side) */}
      <div
        style={{
          position: 'absolute',
          right: -btnWidth,
          top: phoneHeight * 0.28,
          width: btnWidth,
          height: 50 * scale,
          backgroundColor: '#222',
          borderRadius: '0 3px 3px 0',
        }}
      />

      {/* Volume up (left side) */}
      <div
        style={{
          position: 'absolute',
          left: -btnWidth,
          top: phoneHeight * 0.3,
          width: btnWidth,
          height: 35 * scale,
          backgroundColor: '#222',
          borderRadius: '3px 0 0 3px',
        }}
      />

      {/* Volume down (left side) */}
      <div
        style={{
          position: 'absolute',
          left: -btnWidth,
          top: phoneHeight * 0.3 + 45 * scale,
          width: btnWidth,
          height: 35 * scale,
          backgroundColor: '#222',
          borderRadius: '3px 0 0 3px',
        }}
      />

      {/* Silent toggle (left side, smaller) */}
      <div
        style={{
          position: 'absolute',
          left: -btnWidth,
          top: phoneHeight * 0.22,
          width: btnWidth,
          height: 20 * scale,
          backgroundColor: '#222',
          borderRadius: '3px 0 0 3px',
        }}
      />
    </div>
  );
};
