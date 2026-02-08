import React from 'react';
import { AbsoluteFill, Audio, useVideoConfig } from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TextOverlays, type Overlay } from '../components/TextOverlays';
import { HookIntro } from '../components/HookIntro';
import { ProgressIndicator } from '../components/ProgressIndicator';
import type { AudioSegment } from '../utils/timing';
import type { CategoryVisualConfig } from '../config/category-visuals';
import { COLORS } from '../styles/theme';

export interface MediumFormVideoProps {
  /** Audio segments for subtitles with topic info */
  segments: AudioSegment[];
  /** Audio file URL */
  audioUrl?: string;
  /** Background images (with timestamps) — optional, animated bg used when absent */
  images?: Array<{
    url: string;
    startTime: number;
    endTime: number;
    topic?: string;
    item?: string;
  }>;
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
 * Medium Form Video Composition (1-3 minutes)
 *
 * Optimized for TikTok, Instagram Reels, YouTube Shorts (longer format)
 * - Animated hook intro at start
 * - Animated subtitles throughout
 * - Category-themed animated backgrounds
 * - 9:16 aspect ratio (1080x1920)
 */
export const MediumFormVideo: React.FC<MediumFormVideoProps> = ({
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

      {/* Animated subtitles */}
      <AnimatedSubtitles
        segments={segments}
        highlightTerms={highlightTerms}
        highlightColor={categoryVisuals?.highlightColor}
        fontSize={42}
        bottomPosition={15}
        fps={fps}
      />

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
    </AbsoluteFill>
  );
};

export default MediumFormVideo;
