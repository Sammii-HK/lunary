import path from 'path';
import { readFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import type { AudioSegment } from '@/remotion/utils/timing';

// Note: @remotion/bundler and @remotion/renderer are dynamically imported
// to avoid Next.js trying to parse the esbuild binary at compile time

/**
 * Convert script text to AudioSegments for Remotion subtitles
 * Similar to FFmpeg's buildSubtitleChunks but returns AudioSegment[]
 */
export function scriptToAudioSegments(
  text: string,
  audioDuration: number,
  wordsPerSecond: number = 2.6,
): AudioSegment[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Split by sentences for natural pacing
  const sentenceRegex = /[^.!?,;:]+[.!?,;:]*/g;
  const sentences = clean.match(sentenceRegex) || [clean];

  const segments: AudioSegment[] = [];
  const maxWordsPerChunk = 6; // TikTok-style pacing

  // First pass: create chunks
  const chunks: { words: string[]; text: string }[] = [];
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    const words = trimmed.split(' ').filter((w) => w.length > 0);

    if (words.length <= maxWordsPerChunk) {
      chunks.push({ words, text: trimmed });
    } else {
      let i = 0;
      while (i < words.length) {
        const phraseWords = words.slice(i, i + maxWordsPerChunk);
        chunks.push({ words: phraseWords, text: phraseWords.join(' ') });
        i += maxWordsPerChunk;
      }
    }
  }

  // Second pass: calculate timing
  const totalWords = chunks.reduce((sum, c) => sum + c.words.length, 0);
  const startOffset = 0.1;
  const usableDuration = Math.max(audioDuration - startOffset, 1);
  let currentTime = startOffset;

  for (const chunk of chunks) {
    const chunkDuration = (chunk.words.length / totalWords) * usableDuration;
    const endTime = Math.min(currentTime + chunkDuration, audioDuration);

    segments.push({
      text: chunk.text,
      startTime: currentTime,
      endTime: endTime,
    });

    currentTime = endTime;
  }

  return segments;
}

/**
 * Props for Remotion video rendering
 */
/** Overlay text element */
interface Overlay {
  text: string;
  startTime: number;
  endTime: number;
  style?: 'hook' | 'cta' | 'stamp' | 'chapter';
}

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
  segments?: AudioSegment[];
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
  /** Text overlays (hook, cta, stamps, chapters) */
  overlays?: Overlay[];
}

/**
 * Render a video using Remotion
 *
 * This function bundles the Remotion project and renders
 * the specified composition to a video file.
 * Returns the video as a Buffer.
 */
export async function renderRemotionVideo(
  props: RemotionVideoProps,
): Promise<Buffer> {
  // Dynamically import Remotion modules to avoid Next.js compile-time parsing
  const { bundle } = await import('@remotion/bundler');
  const { renderMedia, selectComposition } = await import('@remotion/renderer');

  const fps = 30;
  const durationInFrames = Math.ceil(props.durationSeconds * fps);

  // Create temp directory for output
  const workDir = await mkdtemp(join(tmpdir(), 'remotion-render-'));
  const outputPath = props.outputPath || join(workDir, 'output.mp4');

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
      hookText: props.hookText || props.title,
      hookSubtitle: props.hookSubtitle || props.subtitle,
      segments: props.segments,
      audioUrl: props.audioUrl,
      images: props.images,
      backgroundImage: props.backgroundImage,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
      overlays: props.overlays || [],
    };
  } else if (props.format === 'MediumFormVideo') {
    inputProps = {
      hookText: props.hookText || props.title,
      hookSubtitle: props.hookSubtitle || props.subtitle,
      segments: props.segments,
      audioUrl: props.audioUrl,
      images: props.images,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
      overlays: props.overlays || [],
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
    outputLocation: outputPath,
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

  console.log(`✅ Remotion: Video rendered to ${outputPath}`);

  // Read the output file into a buffer
  const videoBuffer = await readFile(outputPath);

  // Clean up temp file
  await unlink(outputPath).catch(() => {});

  return videoBuffer;
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
