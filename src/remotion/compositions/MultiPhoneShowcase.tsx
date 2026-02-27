import React from 'react';
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { PhoneMockup } from '../components/PhoneMockup';
import { TransitionEffect } from '../components/TransitionEffect';
import type { BackgroundAnimationType } from '../config/category-visuals';
import { COLORS } from '../styles/theme';

export interface PhoneSlot {
  /** Path relative to public/, e.g. 'app-demos/dashboard-overview.webm' */
  videoSrc: string;
  /** Seek into the recording to this second before displaying */
  seekToSeconds?: number;
  /** Small caption below the phone */
  label?: string;
  /** Per-phone screen glow colour */
  glowColor?: string;
}

export interface MultiPhoneShowcaseProps {
  phones: PhoneSlot[];
  /** Phone arrangement style */
  layout?: 'arc' | 'row' | 'fan';
  backgroundType?: BackgroundAnimationType;
  /** When true, phones animate in with staggered entrance. When false, appear instantly at frame 0. */
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seed?: string;
}

const STAGGER_FRAMES = 8;
const PHONE_DEFAULT_GLOW = '#8458D8';

/**
 * MultiPhoneShowcase — 1920×1080 (or 1080×1080) multi-phone grid.
 *
 * Shows 5–7 phones side by side, each seeked to the best moment of their recording.
 * Three layout modes: row, arc, fan.
 *
 * At frame 0 with animate=false: all phones static, ideal for renderStill() PNG export.
 */
export const MultiPhoneShowcase: React.FC<MultiPhoneShowcaseProps> = ({
  phones,
  layout = 'row',
  backgroundType = 'starfield',
  animate = false,
  title,
  subtitle,
  seed = 'multi-phone-showcase',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Calculate phone dimensions to fit all phones across the composition width
  const count = phones.length;
  const totalMarginX = width * 0.06; // 6% total side margins
  const gapBetween = width * 0.03; // 3% gap between phones
  const availableWidth = width - totalMarginX - gapBetween * (count - 1);
  const phoneWidth = Math.floor(availableWidth / count);
  const phoneHeight = Math.round(phoneWidth * (19.5 / 9));

  // Vertical baseline — centre phones in the composition
  const titleAreaHeight = title ? 80 : 0;
  const subtitleAreaHeight = subtitle ? 40 : 0;
  const labelAreaHeight = 36;
  const textAreaAbove = titleAreaHeight + subtitleAreaHeight + 24;
  const usableHeight = height - textAreaAbove - labelAreaHeight - 20;
  const baseTop = textAreaAbove + (usableHeight - phoneHeight) / 2;

  // Tilt and vertical offset per phone based on layout
  function getPhoneLayout(index: number): {
    tiltY: number;
    offsetY: number;
  } {
    const centre = (count - 1) / 2;
    const distFromCentre = index - centre;

    if (layout === 'arc') {
      // Outer phones drop down, centre is highest
      const dropY = Math.abs(distFromCentre) * 20;
      return { tiltY: distFromCentre * 2, offsetY: dropY };
    } else if (layout === 'fan') {
      // Each phone rotates outward from centre
      return { tiltY: distFromCentre * 10, offsetY: 0 };
    } else {
      // row: alternating subtle tilt, flat
      return { tiltY: distFromCentre * 3, offsetY: 0 };
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* 1. Background */}
      <AnimatedBackground
        animationType={backgroundType}
        seed={seed}
        showStars
      />

      {/* 2. Title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#ffffff',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 700,
            fontSize: 48,
            letterSpacing: -0.5,
            zIndex: 10,
          }}
        >
          {title}
        </div>
      )}
      {subtitle && (
        <div
          style={{
            position: 'absolute',
            top: title ? 100 : 44,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: 22,
            zIndex: 10,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* 3. Phones */}
      {phones.map((slot, i) => {
        const phoneLayout = getPhoneLayout(i);
        const phoneLeft = totalMarginX / 2 + i * (phoneWidth + gapBetween);
        const phoneTop = baseTop + phoneLayout.offsetY;

        // Staggered entrance animation
        const entranceFrame = animate ? i * STAGGER_FRAMES : 0;
        const localFrame = Math.max(frame - entranceFrame, 0);

        const enterScale = animate
          ? spring({
              frame: localFrame,
              fps,
              config: { damping: 18, stiffness: 220 },
              from: 0,
              to: 1,
            })
          : 1;

        const enterOpacity = animate
          ? interpolate(localFrame, [0, 8], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          : 1;

        const seekFrame = Math.round((slot.seekToSeconds ?? 0) * fps);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: phoneLeft,
              top: phoneTop,
              opacity: enterOpacity,
              transform: `scale(${enterScale})`,
              transformOrigin: 'bottom center',
              zIndex: 5,
            }}
          >
            <PhoneMockup
              width={phoneWidth}
              scale={1}
              glowColor={slot.glowColor ?? PHONE_DEFAULT_GLOW}
              tiltX={2}
              tiltY={phoneLayout.tiltY}
              floatAmplitude={animate ? 5 : 0}
              floatPeriod={4}
            >
              <Video
                src={staticFile(slot.videoSrc)}
                startFrom={seekFrame}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </PhoneMockup>

            {/* Per-phone label */}
            {slot.label && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -labelAreaHeight,
                  left: 0,
                  width: phoneWidth,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  letterSpacing: 0.5,
                  opacity: enterOpacity,
                }}
              >
                {slot.label}
              </div>
            )}
          </div>
        );
      })}

      {/* 4. Fade out (only for animated version) */}
      {animate && durationInFrames > 30 && (
        <TransitionEffect
          type='fade'
          startFrame={durationInFrames - 24}
          durationFrames={24}
          direction='out'
        />
      )}
    </AbsoluteFill>
  );
};
