import React from 'react';
import {
  AbsoluteFill,
  Video,
  Audio,
  Sequence,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { PhoneMockup } from '../components/PhoneMockup';
import {
  FeatureCallout,
  type FeatureCalloutProps,
} from '../components/FeatureCallout';
import { HookIntro } from '../components/HookIntro';
import { TextOverlays, type Overlay } from '../components/TextOverlays';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TransitionEffect } from '../components/TransitionEffect';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ZoomRegion, type ZoomPoint } from '../components/ZoomRegion';
import { TapIndicator, type TapPoint } from '../components/TapIndicator';
import { ConstellationOverlay } from '../components/ConstellationOverlay';
import type { AudioSegment } from '../utils/timing';
import type {
  CategoryVisualConfig,
  BackgroundAnimationType,
} from '../config/category-visuals';
import { COLORS } from '../styles/theme';

export interface CinematicPhoneDemoProps {
  /** Path to screen recording (relative to public/) */
  videoSrc: string;
  /** Hook text + timing */
  hookText: string;
  hookStartTime: number;
  hookEndTime: number;
  /** Mid-video text overlays */
  overlays: Overlay[];
  /** Outro CTA text + timing */
  outroText: string;
  outroStartTime: number;
  outroEndTime: number;
  /** TTS audio URL (relative to public/) */
  audioUrl?: string;
  /** Subtitle segments synced to TTS */
  segments?: AudioSegment[];
  /** Category accent colours */
  categoryVisuals?: CategoryVisualConfig;
  /** Highlight terms for subtitles */
  highlightTerms?: string[];
  /** Show progress bar */
  showProgress?: boolean;
  /** Screen recording playback rate */
  videoPlaybackRate?: number;
  /** Seconds to delay audio start */
  audioStartOffset?: number;
  /** Background music URL */
  backgroundMusicUrl?: string;
  /** Background music volume 0–1 */
  backgroundMusicVolume?: number;
  /** Zoom punch-in windows */
  zoomPoints?: ZoomPoint[];
  /** Touch ripple animations */
  tapPoints?: TapPoint[];
  /** Whether to render the phone frame (default true) */
  showPhoneFrame?: boolean;
  /** Background animation type */
  backgroundType?: BackgroundAnimationType;
  /** Screen glow colour */
  phoneGlowColor?: string;
  /** Feature callout labels beside the phone */
  callouts?: FeatureCalloutProps[];
  /** Seed for deterministic background */
  seed?: string;
  /** Zodiac sign to draw constellation overlay (e.g. 'scorpio'). Optional. */
  zodiacSign?: string;
}

// Phone dimensions for 1080×1920: width 440px, height ~953px
const PHONE_WIDTH = 440;

/**
 * CinematicPhoneDemo — upgraded TikTok format (1080×1920).
 *
 * Same as AppDemoVideo but wraps the screen recording inside a PhoneMockup
 * on a cosmic AnimatedBackground instead of raw full-screen playback.
 * FeatureCallouts float beside the phone frame.
 *
 * When showPhoneFrame=false, falls back to full-screen recording (AppDemoVideo behaviour).
 */
export const CinematicPhoneDemo: React.FC<CinematicPhoneDemoProps> = ({
  videoSrc,
  hookText,
  hookStartTime,
  hookEndTime,
  overlays,
  outroText,
  outroStartTime,
  outroEndTime,
  audioUrl,
  segments,
  categoryVisuals,
  highlightTerms = [],
  showProgress = true,
  videoPlaybackRate = 1,
  audioStartOffset = 0,
  backgroundMusicUrl,
  backgroundMusicVolume = 0.15,
  zoomPoints = [],
  tapPoints = [],
  showPhoneFrame = true,
  backgroundType = 'starfield',
  phoneGlowColor,
  callouts = [],
  seed = 'cinematic-demo',
  zodiacSign,
}) => {
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const glowColor = phoneGlowColor ?? categoryVisuals?.accentColor ?? '#8458D8';

  const phoneHeight = PHONE_WIDTH * (19.5 / 9);
  const phoneLeft = (width - PHONE_WIDTH) / 2;
  const phoneTop = (height - phoneHeight) / 2;

  const shiftedSegments = segments?.map((s) => ({
    ...s,
    startTime: s.startTime + audioStartOffset,
    endTime: s.endTime + audioStartOffset,
  }));

  const outroOverlay: Overlay = {
    text: outroText,
    startTime: outroStartTime,
    endTime: outroEndTime,
    style: 'cta',
  };

  const videoContent = (
    <ZoomRegion zoomPoints={zoomPoints}>
      <Video
        src={staticFile(videoSrc)}
        startFrom={Math.round(audioStartOffset * fps)}
        playbackRate={videoPlaybackRate}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </ZoomRegion>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* 1. Cosmic background (only shown when phone frame is active) */}
      {showPhoneFrame && (
        <AnimatedBackground
          animationType={backgroundType}
          seed={seed}
          showStars
          gradientColors={categoryVisuals?.gradientColors}
        />
      )}

      {/* 2. Constellation overlay — draws on behind the phone */}
      {showPhoneFrame && zodiacSign && (
        <AbsoluteFill style={{ zIndex: 2 }}>
          <ConstellationOverlay
            sign={zodiacSign}
            accent={categoryVisuals?.accentColor ?? '#8458D8'}
            drawDuration={Math.round(fps * 1.5)}
            startFrame={Math.round(fps * 0.5)}
            opacity={0.7}
            scale={0.75}
          />
        </AbsoluteFill>
      )}

      {/* 3. Screen recording — inside phone or full-bleed */}
      {showPhoneFrame ? (
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
            glowColor={glowColor}
            tiltX={3}
            tiltY={-6}
            floatAmplitude={7}
          >
            {videoContent}
          </PhoneMockup>
        </div>
      ) : (
        <AbsoluteFill style={{ zIndex: 1 }}>{videoContent}</AbsoluteFill>
      )}

      {/* 4. Touch ripples */}
      {tapPoints.length > 0 && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <TapIndicator tapPoints={tapPoints} defaultColor={glowColor} />
        </AbsoluteFill>
      )}

      {/* 4. Hook intro */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 16 }}>
        <HookIntro
          text={hookText}
          startTime={hookStartTime}
          endTime={hookEndTime}
          accentColor={categoryVisuals?.accentColor}
          highlightTerms={highlightTerms}
        />
      </div>

      {/* 5. Text overlays + outro */}
      <TextOverlays
        overlays={[...overlays, outroOverlay]}
        accentColor={categoryVisuals?.accentColor}
      />

      {/* 6. Feature callouts */}
      {callouts.map((callout, i) => (
        <FeatureCallout key={i} {...callout} />
      ))}

      {/* 7. Subtitles */}
      {shiftedSegments && shiftedSegments.length > 0 && (
        <AnimatedSubtitles
          segments={shiftedSegments}
          highlightTerms={highlightTerms}
          highlightColor={categoryVisuals?.highlightColor}
          fontSize={46}
          bottomPosition={showPhoneFrame ? 18 : 22}
          fps={fps}
          backgroundOpacity={0.6}
        />
      )}

      {/* 8. Audio */}
      {audioUrl && (
        <Sequence from={Math.round(audioStartOffset * fps)}>
          <Audio src={staticFile(audioUrl)} />
        </Sequence>
      )}
      {backgroundMusicUrl && (
        <Audio
          src={staticFile(backgroundMusicUrl)}
          volume={backgroundMusicVolume}
        />
      )}

      {/* 9. Progress bar */}
      {showProgress && (
        <ProgressIndicator
          position='bottom'
          height={2}
          color={categoryVisuals?.accentColor}
        />
      )}

      {/* 10. Fade out */}
      <TransitionEffect
        type='fade'
        startFrame={durationInFrames - 24}
        durationFrames={24}
        direction='out'
      />
    </AbsoluteFill>
  );
};
