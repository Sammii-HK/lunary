import React from 'react';
import { useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';

// Official Apple iPhone 16 Pro Max frame (Black Titanium, Portrait)
// Source: developer.apple.com/design/resources — screen area punched to transparent
const FRAME_PNG = 'assets/iphone16-pro-max-frame.png';

// Frame canvas dimensions (px)
const FRAME_W = 1470;
const FRAME_H = 3000;
// Screen area within the frame canvas
const SCREEN_X = 75;
const SCREEN_Y = 66;
const SCREEN_W = 1319;
const SCREEN_H = 2867;
// Screen corner radius in original frame pixels
const SCREEN_RADIUS = 55;

export interface PhoneMockupProps {
  children?: React.ReactNode;
  /** Degrees of forward lean (X-axis tilt), default 0 */
  tiltX?: number;
  /** Degrees of left/right lean (Y-axis tilt), default 0 */
  tiltY?: number;
  /** px of vertical float amplitude, default 8 */
  floatAmplitude?: number;
  /** Seconds per float cycle, default 4 */
  floatPeriod?: number;
  /** Overall scale multiplier, default 1 */
  scale?: number;
  /** Screen edge glow colour */
  glowColor?: string;
  /** Frame width in px at scale=1, default 280 */
  width?: number;
}

/**
 * iPhone mockup using the official Apple iPhone 16 Pro Max device frame.
 *
 * Children render inside the screen area. The Apple frame PNG is overlaid
 * on top so the hardware (bezel, Dynamic Island, buttons) look pixel-perfect.
 *
 * Screen area in 1470×3000 frame: x=75, y=66, w=1319, h=2867.
 * At width=420 this gives a 377×819px screen — aspect ratio 0.460,
 * almost identical to 886×1920 recordings (0.461) so objectFit:cover
 * produces essentially zero stretch.
 */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  tiltX = 0,
  tiltY = 0,
  floatAmplitude = 8,
  floatPeriod = 4,
  scale = 1,
  glowColor = '#8458D8',
  width = 280,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatOffset =
    Math.sin((frame / fps / floatPeriod) * Math.PI * 2) * floatAmplitude;

  const frameW = width * scale;
  const frameH = frameW * (FRAME_H / FRAME_W);

  const screenLeft = frameW * (SCREEN_X / FRAME_W);
  const screenTop = frameH * (SCREEN_Y / FRAME_H);
  const screenW = frameW * (SCREEN_W / FRAME_W);
  const screenH = frameH * (SCREEN_H / FRAME_H);
  const screenRadius = frameW * (SCREEN_RADIUS / FRAME_W);

  return (
    <div
      style={{
        width: frameW,
        height: frameH,
        transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${floatOffset}px)`,
        transformOrigin: 'center center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Screen content — renders behind the frame overlay */}
      <div
        style={{
          position: 'absolute',
          left: screenLeft,
          top: screenTop,
          width: screenW,
          height: screenH,
          borderRadius: screenRadius,
          overflow: 'hidden',
          backgroundColor: '#000',
          boxShadow: `0 0 60px 10px ${glowColor}44`,
        }}
      >
        {children}
      </div>

      {/* Official Apple frame overlay — sits on top of the video */}
      <Img
        src={staticFile(FRAME_PNG)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: frameW,
          height: frameH,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
