import React from 'react';
import {
  AbsoluteFill,
  Video,
  Audio,
  Sequence,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { HookIntro } from '../components/HookIntro';
import { TextOverlays, type Overlay } from '../components/TextOverlays';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TransitionEffect } from '../components/TransitionEffect';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ZoomRegion, type ZoomPoint } from '../components/ZoomRegion';
import { TapIndicator, type TapPoint } from '../components/TapIndicator';
import type { AudioSegment } from '../utils/timing';
import type { CategoryVisualConfig } from '../config/category-visuals';
import { COLORS } from '../styles/theme';

export interface AppDemoVideoProps {
  /** Path to the screen recording (relative to public/, used with staticFile) */
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
  /** TTS audio URL (relative to public/, used with staticFile) */
  audioUrl?: string;
  /** Subtitle segments synced to TTS */
  segments?: AudioSegment[];
  /** Category accent colors */
  categoryVisuals?: CategoryVisualConfig;
  /** Highlight terms for subtitles */
  highlightTerms?: string[];
  /** Show progress bar */
  showProgress?: boolean;
  /** Playback rate for screen recording (> 1 = faster scrolling to match VO pace) */
  videoPlaybackRate?: number;
  /** Seconds to delay audio start (accounts for recording dead time before first scene) */
  audioStartOffset?: number;
  /** Background music URL (relative to public/) */
  backgroundMusicUrl?: string;
  /** Background music volume (0-1, default 0.15 = ~16dB below voice) */
  backgroundMusicVolume?: number;
  /** Zoom punch-in windows — zooms into specific screen areas at key moments */
  zoomPoints?: ZoomPoint[];
  /** Touch ripple animations — shows where taps occur during the recording */
  tapPoints?: TapPoint[];
}

/**
 * App Demo Video Composition
 *
 * Uses a screen recording as the background with text overlays on top.
 * Designed for TikTok app demo videos (9:16 @ 1080x1920).
 *
 * Layer order:
 * 1. <Video> inside ZoomRegion — screen recording with zoom/pan effects
 * 2. TapIndicator — touch ripple animations over the recording
 * 3. HookIntro — animated word-by-word hook text
 * 4. TextOverlays — mid-video chapter cards + outro CTA
 * 5. AnimatedSubtitles — word-level karaoke at bottom
 * 6. <Audio> — TTS voiceover + background music
 * 7. ProgressIndicator — thin bar at bottom
 * 8. TransitionEffect — fade out to black
 */
export const AppDemoVideo: React.FC<AppDemoVideoProps> = ({
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
  backgroundMusicVolume,
  zoomPoints = [],
  tapPoints = [],
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // Shift subtitle segments forward by audioStartOffset to sync with delayed audio
  const shiftedSegments = segments?.map((s) => ({
    ...s,
    startTime: s.startTime + audioStartOffset,
    endTime: s.endTime + audioStartOffset,
  }));

  // Build outro as a CTA-style overlay
  const outroOverlay: Overlay = {
    text: outroText,
    startTime: outroStartTime,
    endTime: outroEndTime,
    style: 'cta',
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* 1. Screen recording with zoom/pan effects */}
      <AbsoluteFill style={{ zIndex: 1 }}>
        <ZoomRegion zoomPoints={zoomPoints}>
          <Video
            src={staticFile(videoSrc)}
            startFrom={Math.round(audioStartOffset * fps)}
            playbackRate={videoPlaybackRate}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </ZoomRegion>
      </AbsoluteFill>

      {/* 2. Touch ripple animations — sit above the recording, below text */}
      {tapPoints.length > 0 && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <TapIndicator
            tapPoints={tapPoints}
            defaultColor={
              categoryVisuals?.accentColor ?? 'rgba(255, 255, 255, 0.9)'
            }
          />
        </AbsoluteFill>
      )}

      {/* No fade-in — TikTok needs visible content on frame 0 for previews */}

      {/* 3. Animated hook intro with background bar */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 16 }}>
        <HookIntro
          text={hookText}
          startTime={hookStartTime}
          endTime={hookEndTime}
          accentColor={categoryVisuals?.accentColor}
          highlightTerms={highlightTerms}
        />
      </div>

      {/* 4. Mid-video text overlays + Outro CTA */}
      <TextOverlays
        overlays={[...overlays, outroOverlay]}
        accentColor={categoryVisuals?.accentColor}
      />

      {/* 5. Animated subtitles with transparent background */}
      {shiftedSegments && shiftedSegments.length > 0 && (
        <AnimatedSubtitles
          segments={shiftedSegments}
          highlightTerms={highlightTerms}
          highlightColor={categoryVisuals?.highlightColor}
          fontSize={46}
          bottomPosition={22}
          fps={fps}
          backgroundOpacity={0.6}
        />
      )}

      {/* 6. TTS voiceover (delayed by audioStartOffset to sync with recording) */}
      {audioUrl && (
        <Sequence from={Math.round(audioStartOffset * fps)}>
          <Audio src={staticFile(audioUrl)} />
        </Sequence>
      )}

      {/* 6b. Background music (plays for full duration) */}
      {backgroundMusicUrl && (
        <Audio
          src={staticFile(backgroundMusicUrl)}
          volume={backgroundMusicVolume ?? 0.15}
        />
      )}

      {/* 7. Progress indicator */}
      {showProgress && (
        <ProgressIndicator
          position='bottom'
          height={2}
          color={categoryVisuals?.accentColor}
        />
      )}

      {/* 8. Fade out at end (0.8s = 24 frames) */}
      <TransitionEffect
        type='fade'
        startFrame={durationInFrames - 24}
        durationFrames={24}
        direction='out'
      />
    </AbsoluteFill>
  );
};

export default AppDemoVideo;
