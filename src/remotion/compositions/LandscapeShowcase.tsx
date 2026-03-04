import React from 'react';
import {
  AbsoluteFill,
  Video,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { PhoneMockup } from '../components/PhoneMockup';
import { FeatureCallout } from '../components/FeatureCallout';
import { TransitionEffect } from '../components/TransitionEffect';
import type { BackgroundAnimationType } from '../config/category-visuals';
import { COLORS } from '../styles/theme';

export interface ShowcaseScene {
  /** Bold headline, left panel */
  headline: string;
  /** Smaller secondary text below headline */
  subline?: string;
  /** Callout pill label beside the phone */
  callout: string;
  /** Path relative to public/, e.g. 'app-demos/web/dashboard-overview.mp4' */
  videoSrc: string;
  /** Seek into the recording to this second before displaying */
  seekToSeconds?: number;
  /** Scene start, in seconds from composition start */
  startTime: number;
  /** Scene end, in seconds from composition start */
  endTime: number;
  /** Which side of the phone the callout appears on */
  calloutSide?: 'left' | 'right';
  /** Per-scene accent colour override */
  highlightColor?: string;
}

export interface LandscapeShowcaseProps {
  scenes: ShowcaseScene[];
  backgroundType?: BackgroundAnimationType;
  /** Optional brand watermark label */
  brandLabel?: string;
  seed?: string;
}

const TRANSITION_FRAMES = 9;

// Phone: 420px wide — substantial presence at 1920px without crowding the left panel.
// Aspect 9:19.5 matches the 886×1920 iPhone 6.5" recordings exactly.
const PHONE_WIDTH = 420;
// Right panel starts at 48% of 1920
const LEFT_PANEL_FRAC = 0.48;

/**
 * LandscapeShowcase — 1920×1080 YouTube / X marketing format.
 *
 * Layout:
 *   Left 48%  — bold Roboto Mono headline + subline, fades between scenes
 *   Right 52% — PhoneMockup, flat (no 3D tilt), FeatureCallout beside phone
 *
 * Uses the official Apple iPhone 16 Pro Max frame PNG (transparent screen area)
 * so the hardware looks pixel-perfect with zero CSS hackery.
 */
export const LandscapeShowcase: React.FC<LandscapeShowcaseProps> = ({
  scenes,
  backgroundType = 'starfield',
  brandLabel = 'lunary.app',
  seed = 'landscape-showcase',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Derive active scene's accent color for phone glow
  const activeScene = scenes.find((s) => {
    const sf = Math.round(s.startTime * fps);
    const ef = Math.round(s.endTime * fps);
    return frame >= sf && frame < ef;
  });
  const activeColor = activeScene?.highlightColor ?? '#8458D8';

  const leftPanelW = Math.round(width * LEFT_PANEL_FRAC);
  const rightPanelW = width - leftPanelW;

  // Phone: centred in right panel, vertically centred
  const phoneHeight = PHONE_WIDTH * (19.5 / 9);
  const phoneCentreX = leftPanelW + rightPanelW / 2;
  const phoneCentreY = height * 0.5;
  const phoneLeft = phoneCentreX - PHONE_WIDTH / 2;
  const phoneTop = phoneCentreY - phoneHeight / 2;

  // Callout positioned to the right of the phone.
  // Center the pill ~120px clear of the phone right edge (60px line + ~60px pill half-width).
  const calloutLineLength = 50;
  const calloutPillHalfW = 70;
  const calloutRightX =
    (phoneLeft + PHONE_WIDTH + calloutLineLength + calloutPillHalfW) / width;
  const calloutLeftX =
    (phoneLeft - calloutLineLength - calloutPillHalfW) / width;
  const calloutY = phoneCentreY / height;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* 1. Background */}
      <AnimatedBackground
        animationType={backgroundType}
        seed={seed}
        showStars
      />

      {/* 2a. Left panel vignette — darkens the background behind the text */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: leftPanelW,
          height,
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* 2b. Vertical panel separator */}
      <div
        style={{
          position: 'absolute',
          left: leftPanelW,
          top: height * 0.1,
          width: 1,
          height: height * 0.8,
          background: `linear-gradient(180deg, transparent 0%, ${activeColor}30 30%, ${activeColor}30 70%, transparent 100%)`,
          zIndex: 6,
          pointerEvents: 'none',
        }}
      />

      {/* 2c. Phone aura — radial glow backdrop, changes color per scene */}
      <div
        style={{
          position: 'absolute',
          left: phoneCentreX - 500,
          top: phoneCentreY - 500,
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${activeColor}30 0%, ${activeColor}10 40%, transparent 68%)`,
          zIndex: 4,
          pointerEvents: 'none',
        }}
      />

      {/* 2b. Phone chassis — persistent, no 3D tilt */}
      <div
        style={{
          position: 'absolute',
          left: phoneLeft,
          top: phoneTop,
          zIndex: 5,
        }}
      >
        <PhoneMockup
          width={PHONE_WIDTH}
          scale={1}
          glowColor={activeColor}
          tiltX={0}
          tiltY={0}
          floatAmplitude={5}
          floatPeriod={5}
        >
          {/* Phone content — each scene's video in its own Sequence */}
          {scenes.map((scene, i) => {
            const startFrame = Math.round(scene.startTime * fps);
            const durationFrames = Math.round(
              (scene.endTime - scene.startTime) * fps,
            );
            const seekFrame = Math.round((scene.seekToSeconds ?? 0) * fps);
            return (
              <Sequence
                key={i}
                from={startFrame}
                durationInFrames={durationFrames}
                layout='none'
              >
                <Video
                  src={staticFile(scene.videoSrc)}
                  startFrom={seekFrame}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
              </Sequence>
            );
          })}
        </PhoneMockup>
      </div>

      {/* 3. Left panel — scene-by-scene headlines */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: leftPanelW,
          height,
          zIndex: 10,
        }}
      >
        {scenes.map((scene, i) => {
          const startFrame = Math.round(scene.startTime * fps);
          const endFrame = Math.round(scene.endTime * fps);
          const duration = endFrame - startFrame;
          const localFrame = frame - startFrame;

          const opacity = interpolate(
            localFrame,
            [0, TRANSITION_FRAMES, duration - TRANSITION_FRAMES, duration],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );

          const slideY = interpolate(
            localFrame,
            [0, TRANSITION_FRAMES],
            [20, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );

          if (
            frame < startFrame - TRANSITION_FRAMES ||
            frame > endFrame + TRANSITION_FRAMES
          )
            return null;

          const accentColor = scene.highlightColor ?? '#8458D8';

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: leftPanelW,
                height,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: 80,
                paddingRight: 60,
                opacity,
                transform: `translateY(${slideY}px)`,
              }}
            >
              {/* Accent bar */}
              <div
                style={{
                  width: 40,
                  height: 3,
                  backgroundColor: accentColor,
                  borderRadius: 2,
                  marginBottom: 28,
                }}
              />

              {/* Headline */}
              <div
                style={{
                  color: '#ffffff',
                  fontFamily: 'Roboto Mono, monospace',
                  fontWeight: 700,
                  fontSize: 56,
                  lineHeight: 1.15,
                  letterSpacing: '-0.5px',
                  marginBottom: 20,
                  whiteSpace: 'pre-line',
                }}
              >
                {scene.headline}
              </div>

              {/* Subline */}
              {scene.subline && (
                <div
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'Roboto Mono, monospace',
                    fontWeight: 300,
                    fontSize: 22,
                    lineHeight: 1.5,
                    maxWidth: 440,
                  }}
                >
                  {scene.subline}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Feature callouts (per-scene, beside the phone) */}
      {scenes.map((scene, i) => {
        const startFrame = Math.round(scene.startTime * fps);
        const endFrame = Math.round(scene.endTime * fps);
        const side = scene.calloutSide ?? 'right';
        const calloutX = side === 'right' ? calloutRightX : calloutLeftX;

        return (
          <FeatureCallout
            key={i}
            text={scene.callout}
            frameIn={startFrame + TRANSITION_FRAMES}
            frameOut={endFrame - TRANSITION_FRAMES}
            position={{ x: calloutX, y: calloutY, side }}
            color={scene.highlightColor ?? '#8458D8'}
            lineLength={calloutLineLength}
          />
        );
      })}

      {/* 5. Brand label + scene dots — bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          zIndex: 20,
        }}
      >
        <div
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Roboto Mono, monospace',
            fontWeight: 400,
            fontSize: 16,
            letterSpacing: 2,
          }}
        >
          {brandLabel}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {scenes.map((scene, i) => {
            const startFrame = Math.round(scene.startTime * fps);
            const endFrame = Math.round(scene.endTime * fps);
            const isActive = frame >= startFrame && frame < endFrame;
            return (
              <div
                key={i}
                style={{
                  width: isActive ? 20 : 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: isActive
                    ? (scene.highlightColor ?? '#8458D8')
                    : 'rgba(255,255,255,0.18)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 6. Fade out */}
      <TransitionEffect
        type='fade'
        startFrame={durationInFrames - 24}
        durationFrames={24}
        direction='out'
      />
    </AbsoluteFill>
  );
};
