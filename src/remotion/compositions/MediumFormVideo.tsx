import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
  staticFile,
} from 'remotion';
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
  /** Content for symbol detection (zodiac, planet, numerology, tarot) */
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
  images = [],
  highlightTerms = [],
  showProgress = true,
  overlays = [],
  seed = 'default',
  categoryVisuals,
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

  // Detect if this is a multi-sign video (ranking, sign check, etc.)
  const isMultiSign = React.useMemo(() => {
    const allText = segments
      .map((s) => s.text)
      .join(' ')
      .toLowerCase();
    const signs = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ];
    const found = signs.filter((s) => allText.includes(s));
    return found.length >= 3;
  }, [segments]);

  // Real-time topic detection — disabled for multi-sign videos to prevent erratic jumping
  const currentTime = frame / fps;
  const detectedTopic = !isMultiSign
    ? detectCurrentTopic(currentTime, segments)
    : null;
  const isInOutro = isOutroSegment(currentTime, segments);

  // Find the frame when the outro speech section first starts (for CTA entrance animation)
  const ctaEntranceFrame = React.useMemo(() => {
    if (segments.length === 0) return 0;
    for (const seg of segments) {
      if (isOutroSegment(seg.startTime + 0.01, segments)) {
        return Math.round(seg.startTime * fps);
      }
    }
    return 0;
  }, [segments, fps]);

  // Fallback to image-based topics or zodiacSign prop (single-topic only)
  let imageTopic: string | undefined = undefined;
  if (!isMultiSign && images.length > 0) {
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
  const currentTopic =
    detectedTopic || imageTopic || (isMultiSign ? undefined : zodiacSign);

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

      {/* Topic title card — only for educational single-topic videos without a hook */}
      {currentTopic &&
        !showIntro &&
        !showOutro &&
        detectedTopic &&
        !hookOverlay && (
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
                fontWeight: 600,
                fontSize: 34,
                color: categoryVisuals?.accentColor ?? COLORS.primaryText,
                margin: 0,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                textShadow: categoryVisuals?.accentColor
                  ? `0 0 20px ${categoryVisuals.accentColor}50, -1px -1px 0 rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.9)`
                  : '0 4px 12px rgba(0, 0, 0, 0.8)',
                display: 'inline-block',
                borderBottom: `2px solid ${categoryVisuals?.accentColor ?? 'rgba(255,255,255,0.3)'}`,
                paddingBottom: '6px',
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

      {/* Animated hook intro — word-by-word entrance */}
      {!showBrandedIntro && hookOverlay && (
        <HookIntro
          text={hookOverlay.text}
          startTime={hookOverlay.startTime}
          endTime={hookOverlay.endTime}
          accentColor={categoryVisuals?.accentColor}
          highlightTerms={highlightTerms}
        />
      )}

      {/* CTA overlay during outro speech - animated entrance */}
      {isInOutro && !showIntro && (
        <div
          style={{
            position: 'absolute',
            top: '28%',
            left: '8%',
            right: '8%',
            textAlign: 'center',
            zIndex: 20,
            opacity: interpolate(
              frame,
              [ctaEntranceFrame, ctaEntranceFrame + 9],
              [0, 1],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              },
            ),
            transform: `translateY(${interpolate(
              frame,
              [ctaEntranceFrame, ctaEntranceFrame + 9],
              [16, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              },
            )}px)`,
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 700,
              fontSize: 44,
              color: COLORS.primaryText,
              margin: 0,
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              textShadow:
                '-2px -2px 0 rgba(0,0,0,0.8), 2px -2px 0 rgba(0,0,0,0.8), -2px 2px 0 rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,0.8), 0 0 24px rgba(0,0,0,0.6)',
            }}
          >
            Follow for more cosmic updates
          </p>
          <p
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontWeight: 600,
              fontSize: 28,
              color: categoryVisuals?.accentColor ?? '#8B7DFF',
              margin: 0,
              letterSpacing: '0.04em',
              textShadow: `0 0 20px ${categoryVisuals?.accentColor ?? '#8B7DFF'}60, -1px -1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,0.8)`,
            }}
          >
            lunary.app
          </p>
        </div>
      )}

      {/* Animated subtitles */}
      <AnimatedSubtitles
        segments={segments}
        highlightTerms={highlightTerms}
        highlightColor={categoryVisuals?.highlightColor}
        fontSize={42}
        bottomPosition={22}
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

      {/* Background music (low volume under voiceover) */}
      {backgroundMusicUrl && (
        <Audio
          src={
            backgroundMusicUrl.startsWith('/')
              ? staticFile(backgroundMusicUrl)
              : backgroundMusicUrl
          }
          volume={0.12}
        />
      )}

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

export default MediumFormVideo;
