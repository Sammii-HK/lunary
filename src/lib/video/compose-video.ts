import ffmpeg from 'fluent-ffmpeg';
import { VIDEO_DIMENSIONS } from './types';
import { getFrameHueShift, getHueSteps } from './hue';
import {
  writeFile,
  unlink,
  readFile,
  chmod,
  access,
  mkdtemp,
  rm,
} from 'fs/promises';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { constants } from 'fs';
import { createRequire } from 'module';

// Buffer time added at the end of the video for the last subtitle to be readable
// and for a nice pause before the video ends
const VIDEO_END_BUFFER = 2.0; // seconds

/**
 * Get the actual duration of an audio file in seconds
 * Uses ffprobe (part of ffmpeg) to get accurate duration
 */
async function getAudioDuration(audioPath: string): Promise<number> {
  // Ensure FFmpeg path is set (ffprobe uses the same binary)
  await getFfmpegPath();

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        console.error('❌ FFprobe error:', err);
        reject(err);
      } else {
        const duration = metadata.format.duration;
        if (duration === undefined || duration === null) {
          reject(new Error('Could not determine audio duration'));
        } else {
          resolve(duration);
        }
      }
    });
  });
}

// Initialize FFmpeg path - copy to /tmp for serverless compatibility
let ffmpegPath: string | null = null;

async function getFfmpegPath(): Promise<string> {
  if (ffmpegPath) return ffmpegPath;

  // Use createRequire to get require in ESM context, and make it dynamic
  // to prevent Turbopack from analyzing it statically
  const require = createRequire(import.meta.url);
  // Use a variable to make the require path dynamic (Turbopack can't analyze it)
  const packageName = 'ffmpeg-static';
  const ffmpegStatic = require(packageName);

  if (!ffmpegStatic) {
    throw new Error(
      'ffmpeg-static package not found. Install it with: pnpm add ffmpeg-static',
    );
  }

  const tempDir = await mkdtemp(join(tmpdir(), 'lunary-video-'));
  const tempFfmpegPath = join(tempDir, `ffmpeg-${Date.now()}`);

  try {
    let binaryContent: Buffer;

    // Read directly from the path - ffmpegStatic is already the full path to the binary
    // DO NOT use require.resolve on the binary file itself - it causes Next.js to try to parse it
    try {
      binaryContent = readFileSync(ffmpegStatic);
      console.log(
        `✅ Read FFmpeg binary from path: ${ffmpegStatic} (${binaryContent.length} bytes)`,
      );
    } catch (readError) {
      // Fallback: Try to resolve package.json and construct path (safer than resolving binary)
      try {
        const packagePath = require.resolve('ffmpeg-static/package.json');
        const packageDir = dirname(packagePath);
        const possiblePath = join(packageDir, 'ffmpeg');
        binaryContent = readFileSync(possiblePath);
        console.log(
          `✅ Read FFmpeg binary from package dir: ${possiblePath} (${binaryContent.length} bytes)`,
        );
      } catch (packageError) {
        throw new Error(
          `Could not read FFmpeg binary. Tried: ${ffmpegStatic} and package dir. ` +
            `Errors: ${readError instanceof Error ? readError.message : 'unknown'}, ` +
            `${packageError instanceof Error ? packageError.message : 'unknown'}`,
        );
      }
    }

    // Write binary to /tmp (writable in serverless)
    await writeFile(tempFfmpegPath, binaryContent);

    // Make executable (chmod +x)
    await chmod(tempFfmpegPath, 0o755);

    // Verify it's executable
    await access(tempFfmpegPath, constants.F_OK | constants.X_OK);

    ffmpegPath = tempFfmpegPath;
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log(`✅ FFmpeg binary ready at: ${ffmpegPath}`);

    return ffmpegPath;
  } catch (error) {
    console.error(`❌ Failed to setup FFmpeg binary:`, error);
    throw new Error(
      `FFmpeg binary setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export interface ComposeVideoOptions {
  imageUrl?: string; // Single image (for backward compatibility)
  images?: Array<{ url: string; startTime: number; endTime: number }>; // Multiple images with timestamps
  audioBuffer: ArrayBuffer;
  format: 'story' | 'square' | 'landscape' | 'youtube';
  outputFilename?: string;
  subtitlesText?: string;
  subtitlesHighlightTerms?: string[];
  subtitlesHighlightColor?: string;
  // Overlays for hook, CTA, chapter titles, stamps etc
  overlays?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    style?: 'chapter' | 'stamp' | 'title' | 'hook' | 'cta';
  }>;
  backgroundMusicPath?: string | null;
  hueShiftBase?: number;
  hueShiftMaxDelta?: number;
  lockIntroHue?: boolean;
}

/**
 * Combines an image and audio into an MP4 video file
 * Uses fluent-ffmpeg with ffmpeg-static for Node.js server-side video composition
 */
export async function composeVideo(
  options: ComposeVideoOptions,
): Promise<Buffer> {
  // Ensure FFmpeg path is set up (copy to /tmp if needed)
  await getFfmpegPath();

  const {
    imageUrl,
    images,
    audioBuffer,
    format,
    outputFilename = 'output.mp4',
    subtitlesText,
    subtitlesHighlightTerms,
    subtitlesHighlightColor,
    overlays,
    backgroundMusicPath,
    hueShiftBase = 0,
    hueShiftMaxDelta = 12,
    lockIntroHue = false,
  } = options;

  console.log(
    `🎬 composeVideo: format=${format}, subtitlesText length=${subtitlesText?.length || 0}, overlays=${overlays?.length || 0}`,
  );

  const dimensions = VIDEO_DIMENSIONS[format] || VIDEO_DIMENSIONS.landscape;
  const workDir = await mkdtemp(join(tmpdir(), 'lunary-video-'));
  const timestamp = Date.now();
  const audioPath = join(workDir, `audio-${timestamp}.mp3`);
  const outputPath = join(workDir, outputFilename);
  let subtitlesPath = join(workDir, `subtitles-${timestamp}.srt`);

  const escapeFilterPath = (inputPath: string) =>
    inputPath.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'");

  const formatSrtTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
  };

  const buildSubtitleChunks = (
    text: string,
    audioDuration: number,
    totalVideoDuration: number, // includes VIDEO_END_BUFFER
    wordsPerSecond: number = 2.6,
  ) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return [];

    // Split by sentences first for more natural pacing
    // Match sentences ending with . ! ? or phrases separated by , ; :
    const sentenceRegex = /[^.!?,;:]+[.!?,;:]*/g;
    const sentences = clean.match(sentenceRegex) || [clean];

    const chunks: Array<{
      words: string[];
      text: string;
      startTime: number;
      endTime: number;
    }> = [];

    // Max words per subtitle for TikTok-style pacing (5-7 words ideal)
    const maxWordsPerChunk = 6;

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      const words = trimmed.split(' ').filter((w) => w.length > 0);

      if (words.length <= maxWordsPerChunk) {
        // Short sentence - use as single chunk
        chunks.push({
          words,
          text: trimmed,
          startTime: 0,
          endTime: 0,
        });
      } else {
        // Long sentence - split into smaller phrases
        let i = 0;
        while (i < words.length) {
          const phraseWords = words.slice(i, i + maxWordsPerChunk);
          chunks.push({
            words: phraseWords,
            text: phraseWords.join(' '),
            startTime: 0,
            endTime: 0,
          });
          i += maxWordsPerChunk;
        }
      }
    }

    // Calculate timing based on word count - continuous coverage, no gaps
    const totalWords = chunks.reduce((sum, c) => sum + c.words.length, 0);
    const startOffset = 0.1; // Small delay before first subtitle
    const usableDuration = Math.max(audioDuration - startOffset, 1);
    let currentTime = startOffset;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const share = totalWords
        ? chunk.words.length / totalWords
        : 1 / chunks.length;
      // Duration proportional to word count
      const duration = share * usableDuration;

      chunk.startTime = currentTime;
      // Last chunk extends into the video end buffer so it stays visible
      chunk.endTime =
        i === chunks.length - 1
          ? totalVideoDuration - 0.5 // Stay on screen until 0.5s before video ends
          : currentTime + duration;
      currentTime = chunk.endTime; // No gap - next subtitle starts immediately
    }

    return chunks;
  };

  const buildSrt = (
    chunks: Array<{ startTime: number; endTime: number; text: string }>,
  ): string => {
    const lines: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      lines.push(`${i + 1}`);
      lines.push(
        `${formatSrtTime(chunk.startTime)} --> ${formatSrtTime(chunk.endTime)}`,
      );
      lines.push(chunk.text);
      lines.push('');
    }
    return lines.join('\n').trim() + '\n';
  };

  const formatAssTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor(((seconds % 1) * 1000) / 10);
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  };

  const escapeAssText = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/\n/g, '\\N');

  const highlightAssText = (text: string, terms: string[]) => {
    if (!terms.length) return text;
    const startToken = '[[HIGHLIGHT_START]]';
    const endToken = '[[HIGHLIGHT_END]]';
    let highlighted = text;
    for (const term of terms) {
      if (!term) continue;
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      highlighted = highlighted.replace(
        regex,
        (match) => `${startToken}${match}${endToken}`,
      );
    }
    return highlighted;
  };

  const hexToAssColor = (hex: string) => {
    const normalized = (hex || '').replace('#', '').toUpperCase();
    if (!/^[0-9A-F]{6}$/.test(normalized)) {
      return '&H5AD7FF&';
    }
    const r = normalized.slice(0, 2);
    const g = normalized.slice(2, 4);
    const b = normalized.slice(4, 6);
    return `&H${b}${g}${r}&`;
  };

  const buildAss = (
    chunks: Array<{ startTime: number; endTime: number; text: string }>,
    terms: string[],
    size: { width: number; height: number },
    fontSize: number,
    marginV: number,
    highlightColor: string,
  ): string => {
    // ASS subtitles with:
    // - Fade in/out effects (200ms each)
    // - Semi-transparent background box (BorderStyle=4)
    // - Roboto font for cleaner look
    const header = [
      '[Script Info]',
      'ScriptType: v4.00+',
      `PlayResX: ${size.width}`,
      `PlayResY: ${size.height}`,
      'ScaledBorderAndShadow: yes',
      '',
      '[V4+ Styles]',
      'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
      // Default: center-bottom for main subtitles
      // BorderStyle=4 creates opaque box background, BackColour with alpha for semi-transparent
      `Style: Default,RobotoMono-Bold,${fontSize},&H00FFFFFF,&H00FFFFFF,&H40000000,&HAA000000,0,0,0,0,100,100,1,0,4,0,3,2,50,50,${marginV},0`,
      '',
      '[Events]',
      'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text',
    ];

    const highlightTag = `{\\c${hexToAssColor(highlightColor)}\\b1}`;
    const resetTag = '{\\c&HFFFFFF&\\b0}';
    const fadeEffect = '{\\fad(200,200)}';

    const lines = chunks.map((chunk) => {
      const highlighted = highlightAssText(chunk.text, terms);
      const safeText = escapeAssText(highlighted)
        .replace(/\[\[HIGHLIGHT_START\]\]/g, highlightTag)
        .replace(/\[\[HIGHLIGHT_END\]\]/g, resetTag);
      return `Dialogue: 0,${formatAssTime(chunk.startTime)},${formatAssTime(chunk.endTime)},Default,,0,0,0,,${fadeEffect}${safeText}`;
    });

    return [...header, ...lines].join('\n');
  };

  const escapeDrawText = (text: string) =>
    text
      .replace(/\\/g, '\\\\')
      .replace(/:/g, '\\:')
      .replace(/'/g, "\\'")
      .replace(/%/g, '\\%');

  // Wrap text to fit within screen width (for overlays)
  const wrapText = (text: string, maxCharsPerLine: number): string => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
  };

  const buildOverlayFilters = (
    overlayItems: ComposeVideoOptions['overlays'],
    size: { width: number; height: number },
    videoFormat: ComposeVideoOptions['format'],
  ) => {
    if (!overlayItems || overlayItems.length === 0) {
      return null;
    }

    const fontsDir = join(process.cwd(), 'public', 'fonts');
    const fontRegular = escapeFilterPath(
      join(fontsDir, 'RobotoMono-Regular.ttf'),
    );
    const baseFontSize =
      videoFormat === 'story' ? 44 : videoFormat === 'square' ? 34 : 24;

    // Max chars per line based on format (story is narrower)
    const maxCharsPerLine =
      videoFormat === 'story' ? 25 : videoFormat === 'square' ? 30 : 40;

    console.log(
      `🎬 Building overlay filters for ${overlayItems.length} overlays`,
    );
    const filters = overlayItems.map((overlay, idx) => {
      const style = overlay.style || 'chapter';
      const fontFile = fontRegular;

      // Font sizes by style
      const fontSize =
        style === 'hook'
          ? baseFontSize + 2 // Hook text slightly larger
          : style === 'cta'
            ? baseFontSize + 4 // CTA prominent
            : style === 'stamp'
              ? baseFontSize - 12 // Stamp much smaller
              : baseFontSize; // Chapter labels

      // Wrap text for hook/cta/chapter styles
      const shouldWrap =
        style === 'hook' || style === 'cta' || style === 'chapter';
      const wrappedText = shouldWrap
        ? wrapText(overlay.text, maxCharsPerLine)
        : overlay.text;
      const text = escapeDrawText(wrappedText);

      // All styles centered horizontally
      const x = `(w-text_w)/2`;

      // Vertical positioning by style
      const y =
        style === 'hook'
          ? `h*0.65` // Hook above subtitles
          : style === 'cta'
            ? `h*0.28` // CTA in upper area
            : style === 'stamp'
              ? `h*0.90` // Stamp 10% from bottom
              : `h*0.65`; // Chapter labels lower

      // Fade in/out effect using alpha
      // Fade in over 0.4s, fade out over 0.4s
      const fadeIn = 0.4;
      const fadeOut = 0.4;
      const start = overlay.startTime;
      const end = overlay.endTime;
      const alpha = `if(lt(t-${start},${fadeIn}),(t-${start})/${fadeIn},if(gt(${end}-t,${fadeOut}),1,(${end}-t)/${fadeOut}))`;

      console.log(
        `  Overlay ${idx}: style=${style}, text="${overlay.text.substring(0, 30)}...", time=${overlay.startTime}-${overlay.endTime}`,
      );
      return `drawtext=fontfile='${fontFile}':text='${text}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=white:alpha='${alpha}':box=0:line_spacing=8:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
    });

    return filters.join(',');
  };

  try {
    // Write audio to temp file
    await writeFile(audioPath, Buffer.from(audioBuffer));

    let subtitleFilter: string | null = null;

    // Get actual audio duration
    const audioDuration = await getAudioDuration(audioPath);
    console.log(`🎵 Audio duration: ${audioDuration.toFixed(2)} seconds`);

    const defaultMusicPath = join(
      process.cwd(),
      'public',
      'audio',
      'series',
      'lunary-bed-v1.mp3',
    );
    const candidateMusicPath =
      backgroundMusicPath === null
        ? null
        : backgroundMusicPath || defaultMusicPath;
    let resolvedMusicPath: string | null = null;

    if (candidateMusicPath) {
      try {
        await access(candidateMusicPath, constants.F_OK);
        resolvedMusicPath = candidateMusicPath;
      } catch {
        console.warn(
          `⚠️ Background music not found at ${candidateMusicPath}. Continuing without it.`,
        );
      }
    }

    // Total video duration includes buffer at end for last subtitle visibility
    const totalVideoDuration = audioDuration + VIDEO_END_BUFFER;
    console.log(
      `📹 Total video duration: ${totalVideoDuration.toFixed(2)}s (audio: ${audioDuration.toFixed(2)}s + buffer: ${VIDEO_END_BUFFER}s)`,
    );

    if (subtitlesText) {
      const subtitleChunks = buildSubtitleChunks(
        subtitlesText,
        audioDuration,
        totalVideoDuration,
      );
      if (subtitleChunks.length > 0) {
        const fontsDir = join(process.cwd(), 'public', 'fonts');
        const safeMargin = format === 'story' ? 320 : 90;
        // Larger font sizes for better readability
        const fontSize = format === 'story' ? 54 : 32;
        let escapedSubPath: string;
        const escapedFontsDir = escapeFilterPath(fontsDir);

        subtitlesPath = join(workDir, `subtitles-${timestamp}.ass`);
        const highlightColorValue = subtitlesHighlightColor || '#5AD7FF';
        const assContent = buildAss(
          subtitleChunks,
          subtitlesHighlightTerms ?? [],
          dimensions,
          fontSize,
          safeMargin,
          highlightColorValue,
        );
        console.log(`📝 ASS subtitles: ${subtitleChunks.length} chunks`);
        await writeFile(subtitlesPath, assContent);
        escapedSubPath = escapeFilterPath(subtitlesPath);
        subtitleFilter = `subtitles='${escapedSubPath}':fontsdir='${escapedFontsDir}'`;
      }
    }

    if (images && images.length > 1) {
      // Multiple images: download and create temp files
      const imagePaths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const imageResponse = await fetch(images[i].url);
        if (!imageResponse.ok) {
          throw new Error(
            `Failed to fetch image ${i}: ${imageResponse.status} ${imageResponse.statusText}`,
          );
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        const imagePath = join(workDir, `image-${i}-${timestamp}.png`);
        await writeFile(imagePath, imageBuffer);
        imagePaths.push(imagePath);
      }

      const crossfadeDuration = 1.0; // Increased from 0.7s for more elegant transitions

      // Adjust image durations to match total video duration (audio + end buffer)
      const adjustedImages = [...images];
      let imagesDuration = adjustedImages.reduce(
        (sum, img) => sum + (img.endTime - img.startTime),
        0,
      );
      console.log(
        `📹 Estimated images duration: ${imagesDuration.toFixed(2)} seconds`,
      );

      // Target duration is totalVideoDuration (which includes VIDEO_END_BUFFER)
      const durationDiff = Math.abs(imagesDuration - totalVideoDuration);
      if (durationDiff <= 2) {
        // Close enough - just extend the last segment to exactly match
        const lastImg = adjustedImages[adjustedImages.length - 1];
        const extension = totalVideoDuration - imagesDuration;
        lastImg.endTime = lastImg.endTime + extension;
        console.log(
          `✅ Video duration is within tolerance, extended last segment by ${extension.toFixed(2)}s`,
        );
      } else if (imagesDuration > totalVideoDuration) {
        // Video is longer than needed - trim the last segment, but ensure minimum 1 second
        const lastImg = adjustedImages[adjustedImages.length - 1];
        const adjustment = imagesDuration - totalVideoDuration;
        const newEndTime = lastImg.endTime - adjustment;
        const minDuration = 1; // Minimum 1 second per segment

        if (newEndTime > lastImg.startTime + minDuration) {
          lastImg.endTime = newEndTime;
          console.log(
            `✂️ Adjusted last segment: ${lastImg.endTime.toFixed(2)}s (trimmed ${adjustment.toFixed(2)}s)`,
          );
        } else {
          // If adjustment would make segment too short, remove it
          adjustedImages.pop();
          console.log(
            `🗑️ Removed last segment (would be too short after adjustment)`,
          );
        }
      } else {
        // Video is shorter than needed - extend the last segment
        const lastImg = adjustedImages[adjustedImages.length - 1];
        const extension = totalVideoDuration - imagesDuration;
        lastImg.endTime = lastImg.endTime + extension;
        console.log(
          `📏 Extended last segment: ${lastImg.endTime.toFixed(2)}s (added ${extension.toFixed(2)}s)`,
        );
      }

      // Recalculate after adjustments
      imagesDuration = adjustedImages.reduce(
        (sum, img) => sum + (img.endTime - img.startTime),
        0,
      );

      if (adjustedImages.length > 1) {
        const crossfadeTotal = crossfadeDuration * (adjustedImages.length - 1);
        adjustedImages[adjustedImages.length - 1].endTime += crossfadeTotal;
        imagesDuration += crossfadeTotal;
      }

      console.log(
        `✅ Final adjusted video duration: ${imagesDuration.toFixed(2)} seconds (target: ${totalVideoDuration.toFixed(2)}s)`,
      );

      // Create FFmpeg command for multiple images
      let command = ffmpeg();

      // Add all image inputs with loop (duration handled in filter)
      adjustedImages.forEach((img, i) => {
        command = command.input(imagePaths[i]).inputOptions(['-loop', '1']);
      });

      // Add audio input
      command = command.input(audioPath);
      if (resolvedMusicPath) {
        command = command
          .input(resolvedMusicPath)
          .inputOptions(['-stream_loop', '-1']);
      }

      // Build filter complex for scaling, padding, and concatenation
      const filterParts: string[] = [];

      const hueSteps = getHueSteps(hueShiftBase, hueShiftMaxDelta);
      const driftAmplitude = Math.min(6, hueShiftMaxDelta);
      const colorSteps = hueSteps.map((hue) => ({
        hue,
        balance: 'rs=0:gs=0:bs=0',
        saturation: 0.95, // Reduced from 1.03 for more premium, dark aesthetic
        contrast: 1.02,
      }));
      console.log(
        `[HueShift] base=${hueShiftBase} maxDelta=${hueShiftMaxDelta} steps=${colorSteps.map((step) => step.hue).join(',')}`,
      );

      const segmentDurations: number[] = [];

      adjustedImages.forEach((img, i) => {
        const duration = img.endTime - img.startTime;
        segmentDurations.push(duration);
        const stepHue = getFrameHueShift({
          frameIndex: i,
          baseHue: hueShiftBase,
          maxDelta: hueShiftMaxDelta,
          lockIntroHue,
        });
        const step = {
          hue: stepHue,
          // Subtle blue/purple tint for cosmic cinematic look
          balance: 'rs=-0.05:gs=-0.02:bs=0.08:rm=-0.03:gm=0:bm=0.05',
          saturation: 0.92, // Reduced for more premium, muted aesthetic
          contrast: 1.06, // Slightly increased for more punch
        };
        const hueDrift = Math.max(duration, 3).toFixed(2);
        const hueExpression =
          lockIntroHue && i === 0
            ? `h='0':s=1`
            : `h='${step.hue}+${driftAmplitude}*sin(2*PI*t/${hueDrift})':s=1`;
        // Scale, pad, and set duration for each image with enhanced color grading
        // Stronger vignette (PI/3), crushed blacks, cinematic color balance
        filterParts.push(
          `[${i}:v]scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease,pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30,colorbalance=${step.balance},hue=${hueExpression},eq=saturation=${step.saturation}:contrast=${step.contrast}:brightness=-0.04:gamma=0.95,vignette=PI/5[scaled${i}]`,
        );
        // Trim to exact duration
        filterParts.push(
          `[scaled${i}]trim=duration=${duration},setpts=PTS-STARTPTS[v${i}]`,
        );
      });

      // Crossfade all video segments with varied elegant transitions
      // Cycle through subtle, premium transition types
      const transitions = [
        'fade',
        'dissolve',
        'smoothup',
        'smoothdown',
        'fadeblack',
      ];
      let currentLabel = 'v0';
      let cumulativeTime = segmentDurations[0] || 0;
      for (let i = 1; i < adjustedImages.length; i++) {
        const nextLabel = `v${i}`;
        const outLabel = i === adjustedImages.length - 1 ? 'outv' : `xf${i}`;
        const offset = Math.max(cumulativeTime - crossfadeDuration, 0);
        // Cycle through transitions for variety
        const transition = transitions[i % transitions.length];
        filterParts.push(
          `[${currentLabel}][${nextLabel}]xfade=transition=${transition}:duration=${crossfadeDuration}:offset=${offset.toFixed(2)}[${outLabel}]`,
        );
        cumulativeTime += segmentDurations[i] - crossfadeDuration;
        currentLabel = outLabel;
      }

      const finalVideoLabel =
        adjustedImages.length > 1
          ? '[outv]'
          : `[v${Math.max(adjustedImages.length - 1, 0)}]`;
      let intermediateLabel = finalVideoLabel;
      const overlayFilter = buildOverlayFilters(overlays, dimensions, format);
      console.log(
        `🎬 Filters - subtitleFilter: ${subtitleFilter ? 'yes' : 'no'}, overlayFilter: ${overlayFilter ? 'yes' : 'no'}, overlays count: ${overlays?.length || 0}`,
      );
      if (subtitleFilter) {
        filterParts.push(`${intermediateLabel}${subtitleFilter}[vsub]`);
        intermediateLabel = '[vsub]';
      }
      if (overlayFilter) {
        // Overlay filter needs to be applied after subtitles
        // FFmpeg syntax: [input]filter1,filter2[output]
        const overlayFilterChain = `${intermediateLabel}${overlayFilter}[vfinal]`;
        console.log(
          `🎬 Adding overlay filter chain: ${overlayFilterChain.substring(0, 300)}...`,
        );
        filterParts.push(overlayFilterChain);
        intermediateLabel = '[vfinal]';
      }

      const finalLabel = intermediateLabel;
      let audioMap = `${adjustedImages.length}:a`;
      if (resolvedMusicPath) {
        const voiceIndex = adjustedImages.length;
        const musicIndex = adjustedImages.length + 1;
        // Voice: pad with silence to extend to full video duration
        filterParts.push(
          `[${voiceIndex}:a]asetpts=PTS-STARTPTS,apad=whole_dur=${totalVideoDuration.toFixed(2)}[voice]`,
        );
        // Music: normalize, lower volume, fade in at start, fade out at end, trim to full video duration
        const fadeOutStart = Math.max(0, totalVideoDuration - 2.5); // Start fade out 2.5s before video ends
        filterParts.push(
          `[${musicIndex}:a]loudnorm=I=-23:TP=-2:LRA=7,volume=0.45,afade=t=in:st=0:d=1.0,afade=t=out:st=${fadeOutStart.toFixed(2)}:d=2.5,atrim=duration=${totalVideoDuration.toFixed(2)}[music]`,
        );
        filterParts.push(
          `[voice][music]amix=inputs=2:duration=longest:dropout_transition=0[aout]`,
        );
        audioMap = '[aout]';
      }

      const filterComplex = filterParts.join(';');

      command = command
        .complexFilter(filterComplex)
        .outputOptions([
          '-map',
          finalLabel,
          '-map',
          audioMap,
          '-c:v',
          'libx264',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-pix_fmt',
          'yuv420p',
          // Don't use -shortest for multi-image videos - duration is explicitly controlled
        ])
        .output(outputPath);

      // Execute and wait for completion
      await new Promise<void>((resolve, reject) => {
        command
          .on('start', (commandLine) => {
            console.log(`🎬 FFmpeg command: ${commandLine}`);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(
                `⏳ FFmpeg progress: ${Math.round(progress.percent)}%`,
              );
            }
          })
          .on('end', () => {
            console.log('✅ FFmpeg processing completed');
            resolve();
          })
          .on('error', (err, stdout, stderr) => {
            console.error('❌ FFmpeg error:', err.message);
            if (stderr) console.error('FFmpeg stderr:', stderr);
            reject(
              new Error(
                `FFmpeg failed: ${err.message}. Stderr: ${stderr || 'none'}`,
              ),
            );
          })
          .run();
      });

      // Cleanup image temp files
      for (const imagePath of imagePaths) {
        await unlink(imagePath).catch(() => {});
      }
    } else {
      // Single image
      const singleImageUrl = imageUrl || images?.[0]?.url;
      if (!singleImageUrl) {
        throw new Error('Either imageUrl or images must be provided');
      }

      // Download image
      const imageResponse = await fetch(singleImageUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`,
        );
      }
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const imagePath = join(workDir, `image-${timestamp}.png`);
      await writeFile(imagePath, imageBuffer);

      console.log(
        `🎵 Creating single-image video with audio duration: ${audioDuration.toFixed(2)}s`,
      );

      // Enhanced Ken Burns with subtle drift and reduced zoom (4% instead of 6%) for premium feel
      const zoomFilter = `zoompan=z='if(eq(on,0),1.0,min(zoom+0.00002,1.04))':x='iw/2-(iw/zoom/2)+sin(on/90)*8':y='ih/2-(ih/zoom/2)+cos(on/90)*6':d=1:fps=30:s=${dimensions.width}x${dimensions.height}`;
      const [baseHueStep, altHueStep] = getHueSteps(
        hueShiftBase,
        hueShiftMaxDelta,
      );
      const baseHue = lockIntroHue ? 0 : baseHueStep;
      const altHue = lockIntroHue ? 0 : altHueStep;
      // Enhanced color grading with cinematic blue/purple tint, stronger vignette
      const gradientBlendFilter =
        `split=2[base][alt];` +
        `[base]hue=h=${baseHue}:s=0.92[base];` +
        `[alt]hue=h=${altHue}:s=0.95[alt];` +
        `[base][alt]blend=all_expr='A*(1-(0.5+0.5*sin(2*3.1415926*N/360)))+B*(0.5+0.5*sin(2*3.1415926*N/360))'`;
      // Stronger vignette (PI/3), crushed blacks (gamma=0.95), cinematic color balance
      const colorGradingFilter = `colorbalance=rs=-0.05:gs=-0.02:bs=0.08:rm=-0.03:gm=0:bm=0.05,eq=saturation=0.92:contrast=1.06:brightness=-0.04:gamma=0.95,vignette=PI/5`;
      const overlayFilter = buildOverlayFilters(overlays, dimensions, format);
      const videoFilter = [
        zoomFilter,
        gradientBlendFilter,
        colorGradingFilter,
        subtitleFilter,
        overlayFilter,
      ]
        .filter(Boolean)
        .join(',');

      if (resolvedMusicPath) {
        // Music: normalize, lower volume, fade in at start, fade out at end
        // Voice: pad with silence to extend to full video duration
        const fadeOutStart = Math.max(0, totalVideoDuration - 2.5);
        const filterParts = [
          `[0:v]${videoFilter}[vfinal]`,
          `[1:a]asetpts=PTS-STARTPTS,apad=whole_dur=${totalVideoDuration.toFixed(2)}[voice]`,
          `[2:a]loudnorm=I=-23:TP=-2:LRA=7,volume=0.6,afade=t=in:st=0:d=1.0,afade=t=out:st=${fadeOutStart.toFixed(2)}:d=2.5,atrim=duration=${totalVideoDuration.toFixed(2)}[music]`,
          `[voice][music]amix=inputs=2:duration=longest:dropout_transition=0[aout]`,
        ];

        await new Promise<void>((resolve, reject) => {
          ffmpeg()
            .input(imagePath)
            .inputOptions(['-loop', '1'])
            .input(audioPath)
            .input(resolvedMusicPath)
            .inputOptions(['-stream_loop', '-1'])
            .complexFilter(filterParts.join(';'))
            .outputOptions([
              '-map',
              '[vfinal]',
              '-map',
              '[aout]',
              '-c:v',
              'libx264',
              '-tune',
              'stillimage',
              '-r',
              '30',
              '-c:a',
              'aac',
              '-b:a',
              '192k',
              '-pix_fmt',
              'yuv420p',
              '-t',
              totalVideoDuration.toFixed(2),
            ])
            .output(outputPath)
            .on('start', (commandLine) => {
              console.log(`🎬 FFmpeg command: ${commandLine}`);
            })
            .on('progress', (progress) => {
              if (progress.percent) {
                console.log(
                  `⏳ FFmpeg progress: ${Math.round(progress.percent)}%`,
                );
              }
            })
            .on('end', () => {
              console.log('✅ FFmpeg processing completed');
              resolve();
            })
            .on('error', (err, stdout, stderr) => {
              console.error('❌ FFmpeg error:', err.message);
              if (stderr) console.error('FFmpeg stderr:', stderr);
              reject(
                new Error(
                  `FFmpeg failed: ${err.message}. Stderr: ${stderr || 'none'}`,
                ),
              );
            })
            .run();
        });
      } else {
        // Create FFmpeg command with explicit duration (including end buffer)
        await new Promise<void>((resolve, reject) => {
          ffmpeg()
            .input(imagePath)
            .inputOptions(['-loop', '1'])
            .input(audioPath)
            .outputOptions([
              '-c:v',
              'libx264',
              '-tune',
              'stillimage',
              '-vf',
              videoFilter,
              '-r',
              '30',
              '-c:a',
              'aac',
              '-b:a',
              '192k',
              '-pix_fmt',
              'yuv420p',
              '-t',
              totalVideoDuration.toFixed(2), // Extended duration with end buffer
            ])
            .output(outputPath)
            .on('start', (commandLine) => {
              console.log(`🎬 FFmpeg command: ${commandLine}`);
            })
            .on('progress', (progress) => {
              if (progress.percent) {
                console.log(
                  `⏳ FFmpeg progress: ${Math.round(progress.percent)}%`,
                );
              }
            })
            .on('end', () => {
              console.log('✅ FFmpeg processing completed');
              resolve();
            })
            .on('error', (err, stdout, stderr) => {
              console.error('❌ FFmpeg error:', err.message);
              if (stderr) console.error('FFmpeg stderr:', stderr);
              reject(
                new Error(
                  `FFmpeg failed: ${err.message}. Stderr: ${stderr || 'none'}`,
                ),
              );
            })
            .run();
        });
      }
    }

    // Read output file
    const videoBuffer = await readFile(outputPath);

    return videoBuffer;
  } catch (error) {
    console.error('Video composition error:', error);
    throw new Error(
      `Failed to compose video: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
