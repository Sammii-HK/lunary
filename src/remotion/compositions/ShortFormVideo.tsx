import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TextOverlays } from '../components/TextOverlays';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TransitionEffect } from '../components/TransitionEffect';
import type { AudioSegment } from '../utils/timing';
import { COLORS } from '../styles/theme';

interface Overlay {
  text: string;
  startTime: number;
  endTime: number;
  style?: 'hook' | 'cta' | 'stamp' | 'chapter';
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
  /** Background images (with timestamps) */
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
}

/**
 * Short Form Video Composition (15-60 seconds)
 *
 * Optimized for TikTok, Instagram Reels, YouTube Shorts
 * - Hook sequence at start
 * - Animated subtitles throughout
 * - Premium dark aesthetic
 * - 9:16 aspect ratio (1080x1920)
 */
export const ShortFormVideo: React.FC<ShortFormVideoProps> = ({
  hookText,
  hookSubtitle,
  segments,
  audioUrl,
  images,
  backgroundImage,
  highlightTerms = [],
  showProgress = true,
  overlays = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Determine current background image
  const currentTime = frame / fps;
  let currentImage = backgroundImage;

  if (images && images.length > 0) {
    const activeImage = images.find(
      (img) => currentTime >= img.startTime && currentTime < img.endTime,
    );
    currentImage = activeImage?.url || images[0].url;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* Background image first */}
      {currentImage && (
        <AbsoluteFill>
          <Img
            src={currentImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.6, // Dim for text readability
            }}
          />
        </AbsoluteFill>
      )}

      {/* Stars render ON TOP of background image */}
      <AnimatedBackground showStars={true} overlayMode={true} />

      {/* Fade in from black */}
      <TransitionEffect
        type='fade'
        startFrame={0}
        durationFrames={30}
        direction='in'
      />

      {/* Animated subtitles - matches FFmpeg ASS styling */}
      {segments && segments.length > 0 && (
        <AnimatedSubtitles
          segments={segments}
          highlightTerms={highlightTerms}
          fontSize={44}
          bottomPosition={12}
          fps={fps}
        />
      )}

      {/* Text overlays (hook, cta, stamps, chapters) - matches FFmpeg drawtext */}
      {overlays.length > 0 && <TextOverlays overlays={overlays} />}

      {/* Audio track */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Progress indicator */}
      {showProgress && <ProgressIndicator position='bottom' height={2} />}

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
