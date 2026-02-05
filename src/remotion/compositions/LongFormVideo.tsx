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
import { LowerThird } from '../components/LowerThird';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { TransitionEffect } from '../components/TransitionEffect';
import type { AudioSegment } from '../utils/timing';
import { secondsToFrames } from '../utils/timing';
import { COLORS } from '../styles/theme';

export interface LongFormVideoProps {
  /** Title for the intro */
  title: string;
  /** Subtitle for intro (e.g., week dates) */
  subtitle?: string;
  /** Audio segments for subtitles with topic info */
  segments: AudioSegment[];
  /** Audio file URL */
  audioUrl?: string;
  /** Background music URL (optional) */
  backgroundMusicUrl?: string;
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
  /** Lower third branding info */
  lowerThirdInfo?: {
    title: string;
    subtitle?: string;
  };
  /** Unique seed for generating different star positions and comet paths */
  seed?: string;
}

/**
 * Long Form Video Composition (5-8 minutes)
 *
 * Optimized for YouTube
 * - Extended hook/intro sequence
 * - Topic cards for each section
 * - Lower third branding
 * - Animated subtitles throughout
 * - Image transitions between segments
 * - 16:9 aspect ratio (1920x1080)
 */
export const LongFormVideo: React.FC<LongFormVideoProps> = ({
  title,
  subtitle,
  segments,
  audioUrl,
  backgroundMusicUrl,
  images = [],
  highlightTerms = [],
  showProgress = true,
  lowerThirdInfo,
  seed = 'default',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate intro duration (first 5 seconds for long-form)
  const introDurationFrames = 150; // 5 seconds at 30fps
  const showIntro = frame < introDurationFrames;

  // Determine current background image and segment
  const currentTime = frame / fps;
  let currentImage = images[0];

  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      if (
        currentTime >= images[i].startTime &&
        currentTime < images[i].endTime
      ) {
        currentImage = images[i];
        break;
      }
    }
  }

  // Check if we're at a segment transition (first 2 seconds of new segment)
  const segmentStartFrame = currentImage
    ? secondsToFrames(currentImage.startTime, fps)
    : 0;
  const isAtSegmentStart =
    frame >= segmentStartFrame && frame < segmentStartFrame + 60;
  const showTopicCard =
    isAtSegmentStart && currentImage?.topic && frame > introDurationFrames;

  // Show lower third periodically (every 90 seconds) for branding
  const showLowerThird =
    lowerThirdInfo &&
    frame > introDurationFrames &&
    frame % (90 * fps) < 120 && // Show for 4 seconds every 90 seconds
    frame < durationInFrames - 300; // Don't show in last 10 seconds

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cosmicBlack }}>
      {/* Animated background */}
      <AnimatedBackground showStars={true} seed={seed} />

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
                  opacity: 0.5,
                }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Fade in from black */}
      <TransitionEffect
        type='dissolve'
        startFrame={0}
        durationFrames={30}
        direction='in'
      />

      {/* Intro/Hook sequence */}
      {showIntro && (
        <HookSequence
          hookText={title}
          subtitle={subtitle}
          startFrame={0}
          durationFrames={introDurationFrames}
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

      {/* Lower third branding */}
      {showLowerThird && lowerThirdInfo && (
        <LowerThird
          title={lowerThirdInfo.title}
          subtitle={lowerThirdInfo.subtitle}
          startFrame={
            Math.floor(frame / (90 * fps)) * (90 * fps) + introDurationFrames
          }
          durationFrames={120}
        />
      )}

      {/* Animated subtitles */}
      <AnimatedSubtitles
        segments={segments}
        highlightTerms={highlightTerms}
        fontSize={36}
        bottomPosition={10}
        fps={fps}
      />

      {/* Main audio track */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Background music (lower volume) */}
      {backgroundMusicUrl && <Audio src={backgroundMusicUrl} volume={0.15} />}

      {/* Progress indicator */}
      {showProgress && <ProgressIndicator position='bottom' height={2} />}

      {/* Fade out at end */}
      <TransitionEffect
        type='dissolve'
        startFrame={durationInFrames - 30}
        durationFrames={30}
        direction='out'
      />
    </AbsoluteFill>
  );
};

export default LongFormVideo;
