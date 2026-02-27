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
  /** Path relative to public/, e.g. 'app-demos/dashboard-overview.webm' */
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
  /** Optional bottom-left title (e.g. "lunary") */
  brandLabel?: string;
  seed?: string;
}

const TRANSITION_FRAMES = 9;
// Phone dimensions — fits well centred in the right panel of 1920×1080
const PHONE_WIDTH = 310;
const PHONE_SCALE = 1;
// Right panel starts at 48% of 1920
const LEFT_PANEL_WIDTH = 0.48;

/**
 * LandscapeShowcase — 1920×1080 YouTube / X marketing format.
 *
 * Layout:
 *   Left 48%  — bold headline + subline, fades between scenes
 *   Right 52% — PhoneMockup centred, FeatureCallout beside phone
 *
 * Each scene wraps a <Video startFrom={seekFrame}> inside a <Sequence> so
 * the phone content cuts cleanly to the right recording at the right moment.
 */
export const LandscapeShowcase: React.FC<LandscapeShowcaseProps> = ({
  scenes,
  backgroundType = 'starfield',
  brandLabel = 'lunary.app',
  seed = 'landscape-showcase',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const leftPanelW = Math.round(width * LEFT_PANEL_WIDTH);
  const rightPanelW = width - leftPanelW;

  // Phone: centred in right panel, vertically centred with slight upward bias
  const phoneHeight = PHONE_WIDTH * (19.5 / 9);
  const phoneCentreX = leftPanelW + rightPanelW / 2;
  const phoneCentreY = height * 0.5;
  const phoneLeft = phoneCentreX - PHONE_WIDTH / 2;
  const phoneTop = phoneCentreY - phoneHeight / 2;

  // Normalised positions for callouts
  const calloutRightX = (phoneLeft + PHONE_WIDTH + 40) / width;
  const calloutLeftX = (phoneLeft - 40) / width;
  const calloutY = phoneCentreY / height;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* 1. Background */}
      <AnimatedBackground
        animationType={backgroundType}
        seed={seed}
        showStars
      />

      {/* 2. Phone chassis — persistent across all scenes */}
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
          scale={PHONE_SCALE}
          glowColor='#8458D8'
          tiltX={3}
          tiltY={-8}
          floatAmplitude={6}
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 80,
          paddingRight: 40,
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
            [18, 0],
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
                paddingRight: 40,
                opacity,
                transform: `translateY(${slideY}px)`,
              }}
            >
              {/* Scene number indicator */}
              <div
                style={{
                  width: 32,
                  height: 3,
                  backgroundColor: accentColor,
                  borderRadius: 2,
                  marginBottom: 24,
                  opacity: 0.7,
                }}
              />

              {/* Headline */}
              <div
                style={{
                  color: '#ffffff',
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 700,
                  fontSize: 64,
                  lineHeight: 1.1,
                  letterSpacing: -1,
                  marginBottom: 16,
                }}
              >
                {scene.headline}
              </div>

              {/* Subline */}
              {scene.subline && (
                <div
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 400,
                    fontSize: 24,
                    lineHeight: 1.4,
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
          />
        );
      })}

      {/* 5. Brand label bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 80,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          fontSize: 18,
          letterSpacing: 1.5,
          zIndex: 20,
        }}
      >
        {brandLabel}
      </div>

      {/* 6. Subtle scene progress dots, bottom-right of left panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 80,
          display: 'flex',
          gap: 8,
          zIndex: 20,
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
                width: isActive ? 24 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: isActive
                  ? (scene.highlightColor ?? '#8458D8')
                  : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* 7. Fade out */}
      <TransitionEffect
        type='fade'
        startFrame={durationInFrames - 24}
        durationFrames={24}
        direction='out'
      />
    </AbsoluteFill>
  );
};
