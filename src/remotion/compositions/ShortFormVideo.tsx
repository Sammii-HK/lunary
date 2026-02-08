import React from 'react';
import { AbsoluteFill, Audio, useVideoConfig, useCurrentFrame } from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TextOverlays, type Overlay } from '../components/TextOverlays';
import { HookIntro } from '../components/HookIntro';
import { HookSequence } from '../components/HookSequence';
import { PersistentWatermark } from '../components/PersistentWatermark';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ZodiacSymbolOverlay } from '../components/ZodiacSymbolOverlay';
import type { AudioSegment } from '../utils/timing';
import { detectCurrentTopic, isOutroSegment } from '../utils/topic-detection';
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
    topic?: string;
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
  /** Show branded cosmic forecast intro (for blog videos) */
  showBrandedIntro?: boolean;
  /** Title for branded intro */
  title?: string;
  /** Subtitle for branded intro */
  subtitle?: string;
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
  images = [],
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
  showBrandedIntro = false,
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Branded intro for cosmic forecast videos (90 frames = 3 seconds)
  const introDurationFrames = 90;
  const showIntro = showBrandedIntro && frame < introDurationFrames;

  // Simple text outro (last 2 seconds)
  const outroDurationFrames = 60; // 2 seconds at 30fps
  const outroStartFrame = durationInFrames - outroDurationFrames;
  const showOutro = showBrandedIntro && frame >= outroStartFrame;

  // Real-time topic detection based on what's actually being spoken
  const currentTime = frame / fps;
  const detectedTopic = segments
    ? detectCurrentTopic(currentTime, segments)
    : null;
  const isInOutro = segments ? isOutroSegment(currentTime, segments) : false;

  // Fallback to image-based topics or zodiacSign prop
  let imageTopic: string | undefined = undefined;
  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      if (
        currentTime >= images[i].startTime &&
        currentTime < images[i].endTime
      ) {
        imageTopic = images[i].topic;
        break;
      }
    }
  }

  // Use detected topic from subtitles, or fall back to image topic or zodiacSign
  const currentTopic = detectedTopic || imageTopic || zodiacSign;

  // Only show symbols during specific topic segments (not intro or outro)
  const showSymbols = currentTopic && !showIntro && !showOutro;
  const symbolContent = currentTopic;

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

      {/* Dynamic symbol overlay - appears based on current topic */}
      {showSymbols && symbolContent && (
        <ZodiacSymbolOverlay content={symbolContent} fps={fps} />
      )}

      {/* Topic title card when topic changes */}
      {currentTopic && !showIntro && !showOutro && detectedTopic && (
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            right: '10%',
            textAlign: 'center',
            zIndex: 15,
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 500,
              fontSize: 32,
              color: COLORS.primaryText,
              margin: 0,
              letterSpacing: '-0.01em',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '12px 20px',
              borderRadius: '8px',
            }}
          >
            {detectedTopic}
          </p>
        </div>
      )}

      {/* Branded cosmic forecast intro (for blog videos) */}
      {showIntro && title && subtitle && (
        <HookSequence
          hookText={title}
          subtitle={subtitle}
          dateRange={subtitle.match(/(\w+ \d+)\s*-\s*(\w+ \d+)/)?.[0]}
          startFrame={0}
          durationFrames={introDurationFrames}
        />
      )}

      {/* Animated hook intro — word-by-word entrance (#7: variant support) */}
      {!showBrandedIntro && hookOverlay && (
        <HookIntro
          text={hookOverlay.text}
          startTime={hookOverlay.startTime}
          endTime={hookOverlay.endTime}
          accentColor={categoryVisuals?.accentColor}
          highlightTerms={highlightTerms}
          variant={hookIntroVariant}
        />
      )}

      {/* CTA overlay during outro speech - clean text only */}
      {isInOutro && !showIntro && (
        <div
          style={{
            position: 'absolute',
            top: '28%',
            left: '8%',
            right: '8%',
            textAlign: 'center',
            zIndex: 20,
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 600,
              fontSize: 42,
              color: COLORS.primaryText,
              margin: 0,
              marginBottom: '16px',
              letterSpacing: '-0.01em',
              textShadow:
                '0 0 40px rgba(0, 0, 0, 1), 0 4px 20px rgba(0, 0, 0, 0.9)',
            }}
          >
            Follow for more cosmic updates
          </p>
          <p
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 400,
              fontSize: 24,
              color: '#8B7DFF',
              margin: 0,
              letterSpacing: 0,
              textShadow:
                '0 0 30px rgba(0, 0, 0, 1), 0 2px 12px rgba(0, 0, 0, 0.9)',
            }}
          >
            lunary.app
          </p>
        </div>
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

      {/* Persistent watermark (TikTok best practice) */}
      <PersistentWatermark
        text='lunary.app'
        position='bottom-center'
        opacity={0.7}
        fps={fps}
      />

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
