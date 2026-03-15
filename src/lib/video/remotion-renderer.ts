import path from 'path';
import { readFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import type { AudioSegment } from '@/remotion/utils/timing';
import type { CategoryVisualConfig } from '@/remotion/config/category-visuals';
import type { WhisperWord } from '@/lib/tts';

// Note: @remotion/bundler and @remotion/renderer are dynamically imported
// to avoid Next.js trying to parse the esbuild binary at compile time

/**
 * Convert script text to AudioSegments for Remotion subtitles
 * Accounts for word length, character count, and natural pauses
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

  // First pass: create chunks with complexity scores
  interface Chunk {
    words: string[];
    text: string;
    pauseAfter: number;
    complexity: number; // Based on character count
  }

  const chunks: Chunk[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    const words = trimmed.split(' ').filter((w) => w.length > 0);

    // Determine pause duration based on punctuation
    let pauseAfter = 0;
    if (
      trimmed.endsWith('.') ||
      trimmed.endsWith('!') ||
      trimmed.endsWith('?')
    ) {
      pauseAfter = 0.5; // 500ms pause after sentence
    } else if (
      trimmed.endsWith(',') ||
      trimmed.endsWith(';') ||
      trimmed.endsWith(':')
    ) {
      pauseAfter = 0.3; // 300ms pause after clause
    }

    if (words.length <= maxWordsPerChunk) {
      chunks.push({
        words,
        text: trimmed,
        pauseAfter,
        complexity: trimmed.length, // Use character count for complexity
      });
    } else {
      let i = 0;
      while (i < words.length) {
        const phraseWords = words.slice(i, i + maxWordsPerChunk);
        const phraseText = phraseWords.join(' ');
        const isLastChunk = i + maxWordsPerChunk >= words.length;
        chunks.push({
          words: phraseWords,
          text: phraseText,
          pauseAfter: isLastChunk ? pauseAfter : 0.2, // Small pause between chunks
          complexity: phraseText.length,
        });
        i += maxWordsPerChunk;
      }
    }
  }

  // Second pass: calculate timing based on complexity (character count) and pauses
  const totalComplexity = chunks.reduce((sum, c) => sum + c.complexity, 0);
  const totalPauses = chunks.reduce((sum, c) => sum + c.pauseAfter, 0);

  // Reserve time for pauses, rest for speaking
  const startOffset = 0.1;
  const speakingTime = Math.max(
    audioDuration - totalPauses - startOffset,
    audioDuration * 0.7,
  );
  let currentTime = startOffset;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Duration based on text complexity (longer words = more time)
    const chunkDuration = (chunk.complexity / totalComplexity) * speakingTime;
    const endTime = Math.min(currentTime + chunkDuration, audioDuration);

    segments.push({
      text: chunk.text,
      startTime: currentTime,
      endTime: endTime,
    });

    // Add pause gap before next segment
    currentTime = Math.min(endTime + chunk.pauseAfter, audioDuration);
  }

  return segments;
}

/**
 * Align original script text to Whisper word-level timestamps.
 *
 * Uses the ORIGINAL script words for display (avoiding Whisper misspellings
 * of mystical terms like grimoire, samhain, etc.) while using Whisper's
 * timestamps for accurate timing.
 *
 * Groups words into segments of up to maxWordsPerChunk, breaking early at:
 * - Natural pauses (gap > 300ms between consecutive Whisper words)
 * - Sentence boundaries (word ends with . ! ?)
 */
export function alignScriptToWhisperTiming(
  scriptText: string,
  whisperWords: WhisperWord[],
  audioDuration: number,
  maxWordsPerChunk: number = 6,
): AudioSegment[] {
  if (!whisperWords.length) {
    return scriptToAudioSegments(scriptText, audioDuration);
  }

  const scriptWords = scriptText
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 0);
  if (scriptWords.length === 0) return [];

  const segments: AudioSegment[] = [];
  let currentWords: string[] = [];
  let segStartTime = 0;
  let segEndTime = 0;

  for (let i = 0; i < scriptWords.length; i++) {
    // Map script word index to Whisper word index by position ratio
    const whisperIdx = Math.min(
      Math.round((i / scriptWords.length) * whisperWords.length),
      whisperWords.length - 1,
    );
    const timing = whisperWords[whisperIdx];

    if (currentWords.length === 0) {
      segStartTime = timing.start;
    }

    currentWords.push(scriptWords[i]);
    segEndTime = timing.end;

    // Check if we should break here
    const isLastWord = i === scriptWords.length - 1;
    const hitMaxWords = currentWords.length >= maxWordsPerChunk;

    // Check for natural pause (gap > 300ms to next word)
    const nextWhisperIdx = Math.min(
      Math.round(((i + 1) / scriptWords.length) * whisperWords.length),
      whisperWords.length - 1,
    );
    const hasNaturalPause =
      !isLastWord &&
      nextWhisperIdx < whisperWords.length &&
      whisperWords[nextWhisperIdx].start - timing.end > 0.3;

    // Check for sentence boundary
    const endsWithPunctuation = /[.!?]$/.test(scriptWords[i]);
    const isSentenceBreak = endsWithPunctuation && currentWords.length >= 2;

    if (
      isLastWord ||
      hitMaxWords ||
      (hasNaturalPause && currentWords.length >= 2) ||
      isSentenceBreak
    ) {
      segments.push({
        text: currentWords.join(' '),
        startTime: segStartTime,
        endTime: Math.min(segEndTime, audioDuration),
      });
      currentWords = [];
    }
  }

  return segments;
}

/**
 * Convert Whisper word-level timestamps into subtitle segments.
 * Groups words into chunks of up to maxWordsPerChunk, matching TikTok pacing.
 *
 * When scriptText is provided, delegates to alignScriptToWhisperTiming to use
 * the original script words (avoiding Whisper misspellings) with Whisper timing.
 */
export function wordTimestampsToSegments(
  whisperWords: WhisperWord[],
  audioDuration: number,
  maxWordsPerChunk: number = 6,
  scriptText?: string,
): AudioSegment[] {
  // If we have the original script, use it for text (avoids Whisper misspellings)
  if (scriptText && whisperWords.length > 0) {
    return alignScriptToWhisperTiming(
      scriptText,
      whisperWords,
      audioDuration,
      maxWordsPerChunk,
    );
  }

  // Fallback: Whisper-only (original behavior)
  if (!whisperWords.length) return [];

  const segments: AudioSegment[] = [];
  let i = 0;

  while (i < whisperWords.length) {
    const chunk = whisperWords.slice(i, i + maxWordsPerChunk);
    const text = chunk.map((w) => w.word).join(' ');
    const startTime = chunk[0].start;
    // End time: use the last word's end, capped at audioDuration
    const endTime = Math.min(chunk[chunk.length - 1].end, audioDuration);

    segments.push({ text, startTime, endTime });
    i += maxWordsPerChunk;
  }

  return segments;
}

/**
 * Scene-aligned audio segments using per-scene voiceoverLine data.
 *
 * The TTS audio is generated from `script.voiceover` (the full continuous text).
 * The hook text is NOT spoken — it's a text overlay only.
 * So the audio starts at time 0 with the first voiceoverLine content.
 *
 * We split the voiceover into per-scene chunks using voiceoverLine,
 * then distribute audio time proportionally by estimated speech duration.
 * Ellipsis pauses (`...`) count as extra time to account for TTS breathing pauses.
 */
export function scriptToSceneAlignedSegments(
  script: {
    hook: { text: string; durationSeconds: number };
    scenes: Array<{ voiceoverLine?: string }>;
    voiceover: string;
  },
  audioDuration: number,
): AudioSegment[] {
  // Collect voiceover lines from scenes
  const lines: string[] = [];
  for (const scene of script.scenes) {
    if (scene.voiceoverLine) {
      lines.push(scene.voiceoverLine);
    }
  }

  // If no voiceover lines on scenes, fall back to the old method
  if (lines.length === 0) {
    return scriptToAudioSegments(script.voiceover, audioDuration);
  }

  // Estimate relative duration per line using word count + pause count.
  // TTS pauses ~0.3s per ellipsis, so lines with more `...` take longer.
  const PAUSE_WEIGHT = 0.3; // seconds per ellipsis pause
  const WPS = 3.0; // words per second (shimmer at 1.05x)

  function estimateLineDuration(line: string): number {
    const words = line.split(/\s+/).filter(Boolean).length;
    const pauses = (line.match(/\.\.\./g) || []).length;
    return words / WPS + pauses * PAUSE_WEIGHT;
  }

  // The full voiceover may have extra words not in any scene voiceoverLine
  // (e.g. "Okay so..." intro, "Everything here... is yours." closing).
  // We need to account for these so proportions are correct against the full audio.
  const sceneLineText = lines.join(' ');
  const fullVoText = script.voiceover;

  // Estimate total speech time for the full voiceover (what TTS actually speaks)
  const totalEstimated = estimateLineDuration(fullVoText);
  if (totalEstimated === 0) return [];

  // Estimate time for scene lines only
  const lineDurations = lines.map(estimateLineDuration);
  const scenesEstimated = lineDurations.reduce((a, b) => a + b, 0);

  // The "extra" words outside scene lines consume some audio time.
  // Calculate where scene content starts in the audio.
  const extraEstimated = totalEstimated - scenesEstimated;
  // Distribute extra time: some before scenes, some after (for closing words)
  // Find where scenes start by checking if voiceover starts with scene content
  const firstSceneLine = lines[0];
  const voStartsWithScene = fullVoText
    .trimStart()
    .startsWith(firstSceneLine.split('...')[0].trim());
  const preSceneTime = voStartsWithScene ? 0 : extraEstimated * 0.6;

  // Scale scene durations to fit within actual audio time
  const sceneAudioTime =
    audioDuration - (extraEstimated / totalEstimated) * audioDuration;
  let currentTime = (preSceneTime / totalEstimated) * audioDuration;
  const segments: AudioSegment[] = [];

  for (let i = 0; i < lines.length; i++) {
    const proportion = lineDurations[i] / scenesEstimated;
    const lineDuration = proportion * sceneAudioTime;
    segments.push({
      text: lines[i],
      startTime: currentTime,
      endTime: Math.min(currentTime + lineDuration, audioDuration),
    });
    currentTime += lineDuration;
  }

  return segments;
}

/**
 * Props for Remotion video rendering
 */
import type { HookIntroVariant } from '@/lib/social/video-scripts/types';

/** Overlay text element */
interface Overlay {
  text: string;
  startTime: number;
  endTime: number;
  style?: 'hook' | 'hook_large' | 'cta' | 'stamp' | 'chapter' | 'series_badge';
}

/** SFX timing entry */
interface SfxTiming {
  time: number;
  type: 'whoosh' | 'pop' | 'chime';
}

export interface RemotionVideoProps {
  /** Video format/composition ID */
  format:
    | 'ShortFormVideo'
    | 'MediumFormVideo'
    | 'LongFormVideo'
    | 'AppDemoVideo'
    | 'AppDemoVideoFeed'
    | 'AppDemoVideoX';
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
  /** Background music URL */
  backgroundMusicUrl?: string;
  /** Background music volume (0-1) */
  backgroundMusicVolume?: number;
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
  /** Category visual configuration for themed backgrounds */
  categoryVisuals?: CategoryVisualConfig;
  /** Unique seed for deterministic but varied backgrounds per render */
  seed?: string;
  /** AppDemoVideo-specific: screen recording source path (relative to public/) */
  videoSrc?: string;
  /** AppDemoVideo-specific: hook text */
  hookTextForDemo?: string;
  /** AppDemoVideo-specific: hook start time */
  hookStartTime?: number;
  /** AppDemoVideo-specific: hook end time */
  hookEndTime?: number;
  /** AppDemoVideo-specific: outro text */
  outroText?: string;
  /** AppDemoVideo-specific: outro start time */
  outroStartTime?: number;
  /** AppDemoVideo-specific: outro end time */
  outroEndTime?: number;
  /** AppDemoVideo-specific: seconds to delay audio start (recording dead time) */
  audioStartOffset?: number;
  /** AppDemoVideo-specific: zoom punch-in windows */
  zoomPoints?: Array<{
    startTime: number;
    endTime: number;
    scale: number;
    x: number;
    y: number;
  }>;
  /** AppDemoVideo-specific: touch ripple animations */
  tapPoints?: Array<{ time: number; x: number; y: number; color?: string }>;
  /** CRF quality setting override */
  crf?: number;
  /** Hook intro animation variant (#7) */
  hookIntroVariant?: HookIntroVariant;
  /** SFX timings for pattern interrupts (#12) */
  sfxTimings?: SfxTiming[];
  /** Subtitle background opacity (#14) */
  subtitleBackgroundOpacity?: number;
  /** Zodiac sign for symbol overlay */
  zodiacSign?: string;
  /** Content for symbol detection (for LongFormVideo) */
  symbolContent?: string;
  /** Show branded cosmic forecast intro (for blog videos) */
  showBrandedIntro?: boolean;
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
  const projectRoot = process.cwd();
  const bundleLocation = await bundle({
    entryPoint: path.join(projectRoot, 'src/remotion/index.ts'),
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias || {}),
          '@': path.join(projectRoot, 'src'),
          '@lib': path.join(projectRoot, 'src/lib'),
        },
      },
    }),
  });

  console.log(`📦 Remotion: Bundled to ${bundleLocation}`);

  // Prepare input props based on format
  let inputProps: Record<string, unknown>;

  // Generate a fallback seed if none provided
  const seed = props.seed || `video-${Date.now()}`;

  if (
    props.format === 'AppDemoVideo' ||
    props.format === 'AppDemoVideoFeed' ||
    props.format === 'AppDemoVideoX'
  ) {
    inputProps = {
      videoSrc: props.videoSrc,
      hookText: props.hookTextForDemo || props.hookText || '',
      hookStartTime: props.hookStartTime ?? 0,
      hookEndTime: props.hookEndTime ?? 2,
      overlays: props.overlays || [],
      outroText: props.outroText || '',
      outroStartTime: props.outroStartTime ?? props.durationSeconds - 2,
      outroEndTime: props.outroEndTime ?? props.durationSeconds,
      audioUrl: props.audioUrl,
      segments: props.segments,
      categoryVisuals: props.categoryVisuals,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
      audioStartOffset: props.audioStartOffset,
      backgroundMusicUrl: props.backgroundMusicUrl,
      backgroundMusicVolume: props.backgroundMusicVolume,
      zoomPoints: props.zoomPoints || [],
      tapPoints: props.tapPoints || [],
      zodiacSign: props.zodiacSign,
    };
  } else if (props.format === 'ShortFormVideo') {
    inputProps = {
      hookText: props.hookText || props.title,
      hookSubtitle: props.hookSubtitle || props.subtitle,
      title: props.title,
      subtitle: props.subtitle,
      segments: props.segments,
      audioUrl: props.audioUrl,
      images: props.images,
      backgroundImage: props.backgroundImage,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
      overlays: props.overlays || [],
      categoryVisuals: props.categoryVisuals,
      seed,
      hookIntroVariant: props.hookIntroVariant,
      sfxTimings: props.sfxTimings || [],
      subtitleBackgroundOpacity:
        props.subtitleBackgroundOpacity ??
        props.categoryVisuals?.subtitleBackgroundOpacity,
      zodiacSign: props.zodiacSign,
      backgroundMusicUrl: props.backgroundMusicUrl,
      showBrandedIntro: props.showBrandedIntro,
    };
  } else if (props.format === 'MediumFormVideo') {
    inputProps = {
      hookText: props.hookText || props.title,
      hookSubtitle: props.hookSubtitle || props.subtitle,
      title: props.title,
      subtitle: props.subtitle,
      segments: props.segments,
      audioUrl: props.audioUrl,
      images: props.images,
      highlightTerms: props.highlightTerms || [],
      showProgress: true,
      overlays: props.overlays || [],
      categoryVisuals: props.categoryVisuals,
      seed,
      zodiacSign: props.zodiacSign,
      backgroundMusicUrl: props.backgroundMusicUrl,
      showBrandedIntro: props.showBrandedIntro,
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
      categoryVisuals: props.categoryVisuals,
      seed,
      symbolContent: props.symbolContent,
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
    crf: props.crf ?? 20, // Good balance of quality and file size
    pixelFormat: 'yuv420p', // Web-compatible
    // Progress logging
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) {
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
