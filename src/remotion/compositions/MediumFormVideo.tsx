import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, useVideoConfig } from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { TextOverlays } from '../components/TextOverlays';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TransitionEffect } from '../components/TransitionEffect';
import type { AudioSegment } from '../utils/timing';
import { COLORS } from '../styles/theme';

// Helper to convert seconds to frames
const secondsToFrames = (seconds: number, fps: number) =>
  Math.round(seconds * fps);

interface Overlay {
  text: string;
  startTime: number;
  endTime: number;
  style?: 'hook' | 'cta' | 'stamp' | 'chapter';
}

export interface MediumFormVideoProps {
  /** Audio segments for subtitles with topic info */
  segments: AudioSegment[];
  /** Audio file URL */
  audioUrl?: string;
  /** Background images (with timestamps) */
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
}

/**
 * Medium Form Video Composition (1-3 minutes)
 *
 * Optimized for TikTok, Instagram Reels, YouTube Shorts (longer format)
 * - Hook sequence at start
 * - Topic cards for each section
 * - Animated subtitles throughout
 * - Image transitions between segments
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
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* Background images first - extend last image to full video duration */}
      {images.map((image, index) => {
        const startFrame = secondsToFrames(image.startTime, fps);
        const isLastImage = index === images.length - 1;
        // Extend last image to fill entire video duration
        const endFrame = isLastImage
          ? durationInFrames
          : secondsToFrames(image.endTime, fps);
        const duration = endFrame - startFrame;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <AbsoluteFill>
              <Img
                src={image.url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.6,
                }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Stars render ON TOP of background images */}
      <AnimatedBackground showStars={true} overlayMode={true} seed={seed} />

      {/* Fade in from black */}
      <TransitionEffect
        type='fade'
        startFrame={0}
        durationFrames={15}
        direction='in'
      />

      {/* Animated subtitles */}
      <AnimatedSubtitles
        segments={segments}
        highlightTerms={highlightTerms}
        fontSize={42}
        bottomPosition={15}
        fps={fps}
      />

      {/* Text overlays (hook, cta, stamps, chapters) - matches FFmpeg drawtext */}
      {overlays.length > 0 && <TextOverlays overlays={overlays} />}

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

export default MediumFormVideo;
