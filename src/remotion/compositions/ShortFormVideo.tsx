import React from 'react';
import { AbsoluteFill, Audio, useVideoConfig } from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TextOverlays, type Overlay } from '../components/TextOverlays';
import { HookIntro } from '../components/HookIntro';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ZodiacSymbolOverlay } from '../components/ZodiacSymbolOverlay';
import type { AudioSegment } from '../utils/timing';
import type { CategoryVisualConfig } from '../config/category-visuals';
import { COLORS } from '../styles/theme';
import type { HookIntroVariant } from '@/lib/social/video-scripts/types';

/** SFX timing entry for pattern interrupts (#12) */
interface SfxTiming {
  time: number;
  type: 'whoosh' | 'pop' | 'chime';
}

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
  /** Hook intro animation variant (#7) */
  hookIntroVariant?: HookIntroVariant;
  /** SFX timings for pattern interrupts (#12) */
  sfxTimings?: SfxTiming[];
  /** Subtitle background opacity override (#14) */
  subtitleBackgroundOpacity?: number;
  /** Zodiac sign for symbol overlay (optional) */
  zodiacSign?: string;
  /** Background music URL (optional, plays at low volume under voiceover) */
  backgroundMusicUrl?: string;
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
  hookIntroVariant,
  sfxTimings,
  subtitleBackgroundOpacity,
  zodiacSign,
  backgroundMusicUrl,
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

      {/* Symbol overlay - zodiac, planet, numerology, or tarot */}
      {zodiacSign && <ZodiacSymbolOverlay content={zodiacSign} fps={fps} />}

      {/* Animated hook intro — word-by-word entrance (#7: variant support) */}
      {hookOverlay && (
        <HookIntro
          text={hookOverlay.text}
          startTime={hookOverlay.startTime}
          endTime={hookOverlay.endTime}
          accentColor={categoryVisuals?.accentColor}
          highlightTerms={highlightTerms}
          variant={hookIntroVariant}
        />
      )}

      {/* Animated subtitles - matches FFmpeg ASS styling (#14: adaptive contrast) */}
      {segments && segments.length > 0 && (
        <AnimatedSubtitles
          segments={segments}
          highlightTerms={highlightTerms}
          highlightColor={categoryVisuals?.highlightColor}
          fontSize={44}
          bottomPosition={22}
          fps={fps}
          backgroundOpacity={subtitleBackgroundOpacity}
        />
      )}

      {/* SFX for pattern interrupts (#12) */}
      {sfxTimings?.map((sfx, i) => (
        <Audio
          key={`sfx-${i}`}
          src={`/sfx/${sfx.type}.mp3`}
          startFrom={Math.round(sfx.time * fps)}
          volume={0.3}
        />
      ))}

      {/* Text overlays (cta, stamps, chapters) — hooks handled above */}
      {otherOverlays.length > 0 && (
        <TextOverlays
          overlays={otherOverlays}
          accentColor={categoryVisuals?.accentColor}
        />
      )}

      {/* Audio track */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Background music (low volume under voiceover) */}
      {backgroundMusicUrl && <Audio src={backgroundMusicUrl} volume={0.12} />}

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

export default ShortFormVideo;
