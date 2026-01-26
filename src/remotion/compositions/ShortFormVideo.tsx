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
import { HookSequence } from '../components/HookSequence';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TransitionEffect } from '../components/TransitionEffect';
import type { AudioSegment } from '../utils/timing';
import { COLORS } from '../styles/theme';

export interface ShortFormVideoProps {
  /** Title/hook text for the intro */
  hookText: string;
  /** Subtitle for intro */
  hookSubtitle?: string;
  /** Audio segments for subtitles */
  segments: AudioSegment[];
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
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate hook duration (first 3 seconds)
  const hookDurationFrames = 90; // 3 seconds at 30fps
  const showHook = frame < hookDurationFrames;

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
      {/* Animated background */}
      <AnimatedBackground showStars={false} />

      {/* Background image with Ken Burns effect */}
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

      {/* Fade in from black */}
      <TransitionEffect
        type='fade'
        startFrame={0}
        durationFrames={15}
        direction='in'
      />

      {/* Hook sequence (first 3 seconds) */}
      {showHook && (
        <HookSequence
          hookText={hookText}
          subtitle={hookSubtitle}
          startFrame={0}
          durationFrames={hookDurationFrames}
        />
      )}

      {/* Animated subtitles (after hook) */}
      {!showHook && (
        <AnimatedSubtitles
          segments={segments}
          highlightTerms={highlightTerms}
          fontSize={42}
          bottomPosition={15}
          fps={fps}
        />
      )}

      {/* Audio track */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Progress indicator */}
      {showProgress && <ProgressIndicator position='bottom' height={2} />}

      {/* Fade out at end */}
      <TransitionEffect
        type='fade'
        startFrame={durationInFrames - 15}
        durationFrames={15}
        direction='out'
      />
    </AbsoluteFill>
  );
};

export default ShortFormVideo;
