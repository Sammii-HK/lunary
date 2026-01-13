import ffmpeg from 'fluent-ffmpeg';
import { VIDEO_DIMENSIONS } from './types';
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
  overlays?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    style?: 'chapter' | 'stamp' | 'title';
  }>;
  backgroundMusicPath?: string | null;
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
  } = options;

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
    wordsPerSecond: number = 2.6,
  ) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return [];

    const words = clean.split(' ');
    const maxWordsPerLine = 10;
    const maxWordsPerCaption = 14;
    let index = 0;
    let startTime = 0.15;
    const chunks: Array<{
      words: string[];
      text: string;
      startTime: number;
      endTime: number;
    }> = [];

    while (index < words.length) {
      const chunkWords = words.slice(index, index + maxWordsPerCaption);
      const line1 = chunkWords.slice(0, maxWordsPerLine).join(' ');
      const line2 = chunkWords.slice(maxWordsPerLine).join(' ');
      chunks.push({
        words: chunkWords,
        text: line2 ? `${line1}\n${line2}` : line1,
        startTime: 0,
        endTime: 0,
      });
      index += chunkWords.length;
    }

    const totalWords = chunks.reduce((sum, c) => sum + c.words.length, 0);
    const usableDuration = Math.max(audioDuration - 0.3, 1);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const share = totalWords
        ? chunk.words.length / totalWords
        : 1 / chunks.length;
      const duration = Math.max(
        1.2,
        share * usableDuration * (wordsPerSecond / 2.6),
      );
      const endTime =
        i === chunks.length - 1 ? audioDuration - 0.05 : startTime + duration;

      chunk.startTime = startTime;
      chunk.endTime = endTime;
      startTime = endTime + 0.05;
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
    const header = [
      '[Script Info]',
      'ScriptType: v4.00+',
      `PlayResX: ${size.width}`,
      `PlayResY: ${size.height}`,
      'ScaledBorderAndShadow: yes',
      '',
      '[V4+ Styles]',
      'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
      `Style: Default,RobotoMono-Regular,${fontSize},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,40,40,${marginV},0`,
      '',
      '[Events]',
      'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text',
    ];

    const highlightTag = `{\\c${hexToAssColor(highlightColor)}}`;
    const resetTag = '{\\c&HFFFFFF&}';
    const lines = chunks.map((chunk) => {
      const highlighted = highlightAssText(chunk.text, terms);
      const safeText = escapeAssText(highlighted)
        .replace(/\[\[HIGHLIGHT_START\]\]/g, highlightTag)
        .replace(/\[\[HIGHLIGHT_END\]\]/g, resetTag);
      return `Dialogue: 0,${formatAssTime(chunk.startTime)},${formatAssTime(
        chunk.endTime,
      )},Default,,0,0,0,,${safeText}`;
    });

    return [...header, ...lines].join('\n');
  };

  const escapeDrawText = (text: string) =>
    text
      .replace(/\\/g, '\\\\')
      .replace(/:/g, '\\:')
      .replace(/'/g, "\\'")
      .replace(/%/g, '\\%');

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

    const filters = overlayItems.map((overlay) => {
      const style = overlay.style || 'chapter';
      const fontFile = fontRegular;
      const fontSize =
        style === 'title'
          ? baseFontSize
          : style === 'stamp'
            ? baseFontSize - 6
            : baseFontSize;
      const text = escapeDrawText(overlay.text);
      const x =
        style === 'stamp'
          ? `w-text_w-48`
          : style === 'title'
            ? `(w-text_w)/2`
            : `(w-text_w)/2`;
      const y =
        style === 'stamp' ? `64` : style === 'title' ? `h*0.16` : `h*0.69`;
      const useBox = style === 'stamp';
      const boxColor = style === 'stamp' ? '0x000000AA' : '0x00000000';
      return `drawtext=fontfile='${fontFile}':text='${text}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=white:box=${useBox ? 1 : 0}:boxcolor=${boxColor}:boxborderw=12:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
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

    if (subtitlesText) {
      const subtitleChunks = buildSubtitleChunks(subtitlesText, audioDuration);
      if (subtitleChunks.length > 0) {
        const fontsDir = join(process.cwd(), 'public', 'fonts');
        const safeMargin = format === 'story' ? 320 : 90;
        const fontSize = format === 'story' ? 48 : 12;
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

      const crossfadeDuration = 0.7;

      // Adjust image durations to match audio duration exactly
      const adjustedImages = [...images];
      let totalVideoDuration = adjustedImages.reduce(
        (sum, img) => sum + (img.endTime - img.startTime),
        0,
      );
      console.log(
        `📹 Estimated video duration: ${totalVideoDuration.toFixed(2)} seconds`,
      );

      // Allow 2 second tolerance - don't adjust if close
      const durationDiff = Math.abs(totalVideoDuration - audioDuration);
      if (durationDiff <= 2) {
        console.log(
          `✅ Video duration is within tolerance (${durationDiff.toFixed(2)}s difference), no adjustment needed`,
        );
      } else if (totalVideoDuration > audioDuration) {
        // Video is longer than audio - trim the last segment, but ensure minimum 1 second
        const lastImg = adjustedImages[adjustedImages.length - 1];
        const adjustment = totalVideoDuration - audioDuration;
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
        // Video is shorter than audio - extend the last segment
        const lastImg = adjustedImages[adjustedImages.length - 1];
        const extension = audioDuration - totalVideoDuration;
        lastImg.endTime = lastImg.endTime + extension;
        console.log(
          `📏 Extended last segment: ${lastImg.endTime.toFixed(2)}s (added ${extension.toFixed(2)}s)`,
        );
      }

      // Recalculate after adjustments
      totalVideoDuration = adjustedImages.reduce(
        (sum, img) => sum + (img.endTime - img.startTime),
        0,
      );

      if (adjustedImages.length > 1) {
        const crossfadeTotal = crossfadeDuration * (adjustedImages.length - 1);
        adjustedImages[adjustedImages.length - 1].endTime += crossfadeTotal;
        totalVideoDuration += crossfadeTotal;
      }

      console.log(
        `✅ Final adjusted video duration: ${totalVideoDuration.toFixed(2)} seconds (audio: ${audioDuration.toFixed(2)}s)`,
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

      const colorSteps = [
        {
          hue: 0,
          balance: 'rs=0:gs=0:bs=0',
          saturation: 1.0,
          contrast: 1.02,
        },
        {
          hue: 10,
          balance: 'rs=-0.02:gs=0.01:bs=0.08',
          saturation: 1.08,
          contrast: 1.05,
        },
        {
          hue: -10,
          balance: 'rs=-0.04:gs=0.02:bs=0.14',
          saturation: 1.1,
          contrast: 1.08,
        },
      ];

      const segmentDurations: number[] = [];

      adjustedImages.forEach((img, i) => {
        const duration = img.endTime - img.startTime;
        segmentDurations.push(duration);
        const step = colorSteps[i % colorSteps.length];
        const hueDrift = Math.max(duration, 3).toFixed(2);
        // Scale, pad, and set duration for each image
        filterParts.push(
          `[${i}:v]scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease,pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30,colorbalance=${step.balance},hue=h='${step.hue}+6*sin(2*PI*t/${hueDrift})':s=1,eq=saturation=${step.saturation}:contrast=${step.contrast}:brightness=0.01[scaled${i}]`,
        );
        // Trim to exact duration
        filterParts.push(
          `[scaled${i}]trim=duration=${duration},setpts=PTS-STARTPTS[v${i}]`,
        );
      });

      // Crossfade all video segments for smoother transitions
      let currentLabel = 'v0';
      let cumulativeTime = segmentDurations[0] || 0;
      for (let i = 1; i < adjustedImages.length; i++) {
        const nextLabel = `v${i}`;
        const outLabel = i === adjustedImages.length - 1 ? 'outv' : `xf${i}`;
        const offset = Math.max(cumulativeTime - crossfadeDuration, 0);
        filterParts.push(
          `[${currentLabel}][${nextLabel}]xfade=transition=fade:duration=${crossfadeDuration}:offset=${offset.toFixed(2)}[${outLabel}]`,
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
      if (subtitleFilter) {
        filterParts.push(`${intermediateLabel}${subtitleFilter}[vsub]`);
        intermediateLabel = '[vsub]';
      }
      if (overlayFilter) {
        filterParts.push(`${intermediateLabel}${overlayFilter}[vfinal]`);
        intermediateLabel = '[vfinal]';
      }

      const finalLabel = intermediateLabel;
      let audioMap = `${adjustedImages.length}:a`;
      if (resolvedMusicPath) {
        const voiceIndex = adjustedImages.length;
        const musicIndex = adjustedImages.length + 1;
        filterParts.push(`[${voiceIndex}:a]asetpts=PTS-STARTPTS[voice]`);
        filterParts.push(
          `[${musicIndex}:a]loudnorm=I=-23:TP=-2:LRA=7,volume=0.75,afade=t=in:st=0:d=0.5,atrim=duration=${audioDuration}[music]`,
        );
        filterParts.push(
          `[voice][music]amix=inputs=2:duration=first:dropout_transition=0[aout]`,
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

      const zoomFilter = `zoompan=z='if(eq(on,0),1.0,min(zoom+0.00003,1.06))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:fps=30:s=${dimensions.width}x${dimensions.height}`;
      const gradientBlendFilter =
        `split=2[base][alt];` +
        `[base]hue=h=0:s=1.03[base];` +
        `[alt]hue=h=18:s=1.06[alt];` +
        `[base][alt]blend=all_expr='A*(1-(0.5+0.5*sin(2*3.1415926*N/360)))+B*(0.5+0.5*sin(2*3.1415926*N/360))'`;
      const overlayFilter = buildOverlayFilters(overlays, dimensions, format);
      const videoFilter = [
        zoomFilter,
        gradientBlendFilter,
        subtitleFilter,
        overlayFilter,
      ]
        .filter(Boolean)
        .join(',');

      if (resolvedMusicPath) {
        const filterParts = [
          `[0:v]${videoFilter}[vfinal]`,
          `[1:a]asetpts=PTS-STARTPTS[voice]`,
          `[2:a]loudnorm=I=-23:TP=-2:LRA=7,volume=0.75,afade=t=in:st=0:d=0.5,atrim=duration=${audioDuration}[music]`,
          `[voice][music]amix=inputs=2:duration=first:dropout_transition=0[aout]`,
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
              audioDuration.toFixed(2),
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
        // Create FFmpeg command with explicit duration
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
              audioDuration.toFixed(2), // Explicit duration limit
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
