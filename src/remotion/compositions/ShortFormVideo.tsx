import React from 'react';
import { AbsoluteFill, Audio, useVideoConfig } from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TextOverlays, type Overlay } from '../components/TextOverlays';
import { HookIntro } from '../components/HookIntro';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TransitionEffect } from '../components/TransitionEffect';
import type { AudioSegment } from '../utils/timing';
import type { CategoryVisualConfig } from '../config/category-visuals';
import { COLORS } from '../styles/theme';

export interface ShortFormVideoProps {
  /** Title/hook text for the intro (deprecated - use overlays) */
  hookText?: string;
  /** Subtitle for intro */
  hookSubtitle?: string;
  /** Audio segments for subtitles */
  segments?: AudioSegment[];
  /** Audio file URL */
  audioUrl?: string;
  /** Background images (with timestamps) — optional, animated bg used when absent */
  images?: Array<{
    url: string;
    startTime: number;
    endTime: number;
  }>;
  /** Single background image URL (fallback) */
  backgroundImage?: string;
  /** Highlight terms for subtitles */
  highlightTerms?: string[];
  /** Show progress indicator */
  showProgress?: boolean;
  /** Text overlays (hook, cta, stamps, chapters) */
  overlays?: Overlay[];
  /** Unique seed for generating different star positions and comet paths */
  seed?: string;
  /** Category visual configuration for themed backgrounds */
  categoryVisuals?: CategoryVisualConfig;
}

/**
 * Short Form Video Composition (15-60 seconds)
 *
 * Optimized for TikTok, Instagram Reels, YouTube Shorts
 * - Animated hook intro at start
 * - Animated subtitles throughout
 * - Category-themed animated backgrounds
 * - 9:16 aspect ratio (1080x1920)
 */
export const ShortFormVideo: React.FC<ShortFormVideoProps> = ({
  segments,
  audioUrl,
  highlightTerms = [],
  showProgress = true,
  overlays = [],
  seed = 'default',
  categoryVisuals,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // Separate hook overlays from other overlays — hooks are rendered by HookIntro
  const hookOverlay = overlays.find(
    (o) => o.style === 'hook' || o.style === 'hook_large',
  );
  const otherOverlays = overlays.filter(
    (o) => o.style !== 'hook' && o.style !== 'hook_large',
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* Animated background with category gradient — the full visual backdrop */}
      <AnimatedBackground
        showStars={true}
        overlayMode={false}
        seed={seed}
        animationType={categoryVisuals?.backgroundAnimation}
        particleTintColor={categoryVisuals?.particleTintColor}
        gradientColors={categoryVisuals?.gradientColors}
      />

      {/* Fade in from black */}
      <TransitionEffect
        type='fade'
        startFrame={0}
        durationFrames={30}
        direction='in'
      />

      {/* Animated hook intro — word-by-word entrance */}
      {hookOverlay && (
        <HookIntro
          text={hookOverlay.text}
          startTime={hookOverlay.startTime}
          endTime={hookOverlay.endTime}
          accentColor={categoryVisuals?.accentColor}
          highlightTerms={highlightTerms}
        />
      )}

      {/* Animated subtitles - matches FFmpeg ASS styling */}
      {segments && segments.length > 0 && (
        <AnimatedSubtitles
          segments={segments}
          highlightTerms={highlightTerms}
          highlightColor={categoryVisuals?.highlightColor}
          fontSize={44}
          bottomPosition={12}
          fps={fps}
        />
      )}

      {/* Text overlays (cta, stamps, chapters) — hooks handled above */}
      {otherOverlays.length > 0 && (
        <TextOverlays
          overlays={otherOverlays}
          accentColor={categoryVisuals?.accentColor}
        />
      )}

      {/* Audio track */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Progress indicator */}
      {showProgress && (
        <ProgressIndicator
          position='bottom'
          height={2}
          color={categoryVisuals?.accentColor}
        />
      )}

      {/* Fade out at end */}
      <TransitionEffect
        type='fade'
        startFrame={durationInFrames - 45}
        durationFrames={45}
        direction='out'
      />
    </AbsoluteFill>
  );
};

export default ShortFormVideo;
