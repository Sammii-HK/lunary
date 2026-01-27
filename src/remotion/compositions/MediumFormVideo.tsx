import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles';
import { HookSequence } from '../components/HookSequence';
import { TopicCard } from '../components/TopicCard';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TransitionEffect } from '../components/TransitionEffect';
import type { AudioSegment } from '../utils/timing';
import { secondsToFrames } from '../utils/timing';
import { COLORS } from '../styles/theme';

export interface MediumFormVideoProps {
  /** Title/hook text for the intro */
  hookText: string;
  /** Subtitle for intro */
  hookSubtitle?: string;
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
  hookText,
  hookSubtitle,
  segments,
  audioUrl,
  images = [],
  highlightTerms = [],
  showProgress = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate hook duration (first 3 seconds)
  const hookDurationFrames = 90; // 3 seconds at 30fps
  const showHook = frame < hookDurationFrames;

  // Determine current background image and segment
  const currentTime = frame / fps;
  let currentImage = images[0];
  let currentSegmentIndex = 0;

  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      if (
        currentTime >= images[i].startTime &&
        currentTime < images[i].endTime
      ) {
        currentImage = images[i];
        currentSegmentIndex = i;
        break;
      }
    }
  }

  // Check if we're at a segment transition (first 1 second of new segment)
  const segmentStartFrame = currentImage
    ? secondsToFrames(currentImage.startTime, fps)
    : 0;
  const isAtSegmentStart =
    frame >= segmentStartFrame && frame < segmentStartFrame + 30;
  const showTopicCard =
    isAtSegmentStart && currentImage?.topic && frame > hookDurationFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* Animated background */}
      <AnimatedBackground showStars={false} />

      {/* Background images with crossfade */}
      {images.map((image, index) => {
        const startFrame = secondsToFrames(image.startTime, fps);
        const endFrame = secondsToFrames(image.endTime, fps);
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

      {/* Topic cards at segment transitions */}
      {showTopicCard && currentImage?.topic && (
        <TopicCard
          title={currentImage.topic}
          item={currentImage.item}
          startFrame={segmentStartFrame}
          position='top'
        />
      )}

      {/* Animated subtitles */}
      <AnimatedSubtitles
        segments={segments}
        highlightTerms={highlightTerms}
        fontSize={42}
        bottomPosition={15}
        fps={fps}
      />

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
