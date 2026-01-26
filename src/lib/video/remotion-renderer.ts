import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import type { AudioSegment } from '@/remotion/utils/timing';

/**
 * Props for Remotion video rendering
 */
export interface RemotionVideoProps {
  /** Video format/composition ID */
  format: 'ShortFormVideo' | 'MediumFormVideo' | 'LongFormVideo';
  /** Output file path */
  outputPath: string;
  /** Hook/title text */
  hookText?: string;
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  hookSubtitle?: string;
  /** Audio segments for subtitles */
  segments: AudioSegment[];
  /** Audio file URL */
  audioUrl?: string;
  /** Background music URL (for long-form) */
  backgroundMusicUrl?: string;
  /** Background images with timestamps */
  images?: Array<{
    url: string;
    startTime: number;
    endTime: number;
    topic?: string;
    item?: string;
  }>;
  /** Single background image (fallback) */
  backgroundImage?: string;
  /** Highlight terms for subtitles */
  highlightTerms?: string[];
  /** Total duration in seconds */
  durationSeconds: number;
  /** Lower third branding (for long-form) */
  lowerThirdInfo?: {
    title: string;
    subtitle?: string;
  };
}

/**
 * Render a video using Remotion
 *
 * This function bundles the Remotion project and renders
 * the specified composition to a video file.
 */
export async function renderRemotionVideo(
  props: RemotionVideoProps,
): Promise<void> {
  const fps = 30;
  const durationInFrames = Math.ceil(props.durationSeconds * fps);

  console.log(
    `🎬 Remotion: Rendering ${props.format} (${props.durationSeconds}s, ${durationInFrames} frames)`,
  );

  // Bundle the Remotion project
  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), 'src/remotion/index.ts'),
    // Enable caching for faster subsequent renders
    webpackOverride: (config) => config,
  });

  console.log(`📦 Remotion: Bundled to ${bundleLocation}`);

  // Prepare input props based on format
  let inputProps: Record<string, unknown>;

  if (props.format === 'ShortFormVideo') {
    inputProps = {
      hookText: props.hookText || props.title || 'Your Weekly Forecast',
      hookSubtitle: props.hookSubtitle || props.subtitle,
      segments: props.segments,
      audioUrl: props.audioUrl,
      images: props.images,
      backgroundImage: props.backgroundImage,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
    };
  } else if (props.format === 'MediumFormVideo') {
    inputProps = {
      hookText: props.hookText || props.title || 'Your Weekly Forecast',
      hookSubtitle: props.hookSubtitle || props.subtitle,
      segments: props.segments,
      audioUrl: props.audioUrl,
      images: props.images,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
    };
  } else {
    // LongFormVideo
    inputProps = {
      title: props.title || 'Weekly Cosmic Forecast',
      subtitle: props.subtitle,
      segments: props.segments,
      audioUrl: props.audioUrl,
      backgroundMusicUrl: props.backgroundMusicUrl,
      images: props.images,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
      lowerThirdInfo: props.lowerThirdInfo || {
        title: 'Lunary',
        subtitle: 'Your Cosmic Guide',
      },
    };
  }

  // Select the composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: props.format,
    inputProps,
  });

  console.log(
    `🎯 Remotion: Selected composition ${composition.id} (${composition.width}x${composition.height})`,
  );

  // Override duration if provided
  const compositionWithDuration = {
    ...composition,
    durationInFrames,
  };

  // Render the video
  await renderMedia({
    composition: compositionWithDuration,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: props.outputPath,
    inputProps,
    // Quality settings
    crf: 20, // Good balance of quality and file size
    pixelFormat: 'yuv420p', // Web-compatible
    // Progress logging
    onProgress: ({ progress }) => {
      if (progress % 10 === 0) {
        console.log(`⏳ Remotion: ${Math.round(progress * 100)}% complete`);
      }
    },
  });

  console.log(`✅ Remotion: Video rendered to ${props.outputPath}`);
}

/**
 * Check if Remotion rendering is available
 * (dependencies installed and configured)
 */
export async function isRemotionAvailable(): Promise<boolean> {
  try {
    // Try to import Remotion modules
    await import('@remotion/bundler');
    await import('@remotion/renderer');
    return true;
  } catch {
    return false;
  }
}
