import ffmpeg from 'fluent-ffmpeg';
import { VIDEO_DIMENSIONS } from './types';
import { writeFile, unlink, readFile, chmod, access } from 'fs/promises';
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

  const tempDir = tmpdir();
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
  } = options;

  const dimensions = VIDEO_DIMENSIONS[format] || VIDEO_DIMENSIONS.landscape;
  const tempDir = tmpdir();
  const timestamp = Date.now();
  const audioPath = join(tempDir, `audio-${timestamp}.mp3`);
  const outputPath = join(tempDir, outputFilename);

  try {
    // Write audio to temp file
    await writeFile(audioPath, Buffer.from(audioBuffer));

    // Get actual audio duration
    const audioDuration = await getAudioDuration(audioPath);
    console.log(`🎵 Audio duration: ${audioDuration.toFixed(2)} seconds`);

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
        const imagePath = join(tempDir, `image-${i}-${timestamp}.png`);
        await writeFile(imagePath, imageBuffer);
        imagePaths.push(imagePath);
      }

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

      // Build filter complex for scaling, padding, and concatenation
      const filterParts: string[] = [];

      adjustedImages.forEach((img, i) => {
        const duration = img.endTime - img.startTime;
        // Scale, pad, and set duration for each image
        filterParts.push(
          `[${i}:v]scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease,pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30[scaled${i}]`,
        );
        // Trim to exact duration
        filterParts.push(
          `[scaled${i}]trim=duration=${duration},setpts=PTS-STARTPTS[v${i}]`,
        );
      });

      // Concat all video segments
      const concatInputs = adjustedImages.map((_, i) => `[v${i}]`).join('');
      filterParts.push(
        `${concatInputs}concat=n=${adjustedImages.length}:v=1:a=0[outv]`,
      );

      const filterComplex = filterParts.join(';');

      command = command
        .complexFilter(filterComplex)
        .outputOptions([
          '-map',
          '[outv]',
          '-map',
          `${adjustedImages.length}:a`,
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
      const imagePath = join(tempDir, `image-${timestamp}.png`);
      await writeFile(imagePath, imageBuffer);

      // Create FFmpeg command
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
            '-c:a',
            'aac',
            '-b:a',
            '192k',
            '-pix_fmt',
            'yuv420p',
            '-shortest',
            '-s',
            `${dimensions.width}x${dimensions.height}`,
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

      // Cleanup image temp file
      await unlink(imagePath).catch(() => {});
    }

    // Read output file
    const videoBuffer = await readFile(outputPath);

    // Cleanup
    await unlink(audioPath).catch(() => {});
    await unlink(outputPath).catch(() => {});

    return videoBuffer;
  } catch (error) {
    // Cleanup on error
    await unlink(audioPath).catch(() => {});
    await unlink(outputPath).catch(() => {});

    console.error('Video composition error:', error);
    throw new Error(
      `Failed to compose video: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
