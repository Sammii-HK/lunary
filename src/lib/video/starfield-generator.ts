import sharp from 'sharp';
import { join } from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';

/**
 * Seeded pseudo-random number generator (same as og-utils.ts)
 */
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }

  return function () {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

interface AnimatedStar {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number; // How fast this star twinkles
  twinklePhase: number; // Starting phase offset
}

/**
 * Generate animated starfield data with twinkle parameters
 */
export function generateAnimatedStarfield(
  seed: string,
  count: number = 80,
): AnimatedStar[] {
  const random = seededRandom(seed);
  const stars: AnimatedStar[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      x: random() * 100,
      y: random() * 100,
      size: 0.8 + random() * 1.2, // Small, subtle stars (0.8-2px)
      baseOpacity: 0.3 + random() * 0.4, // Subtle opacity (0.3-0.7)
      twinkleSpeed: 0.4 + random() * 0.5, // Faster twinkle (0.4-0.9 cycles per second)
      twinklePhase: random() * Math.PI * 2, // Random starting phase
    });
  }

  return stars;
}

/**
 * Calculate star opacity at a given time with random organic twinkle
 */
function getStarOpacity(star: AnimatedStar, time: number): number {
  // Combine multiple sine waves at different frequencies for organic, random-feeling twinkle
  const t = time * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase;

  // Primary slow wave
  const wave1 = Math.sin(t);
  // Secondary faster wave (golden ratio offset for non-repeating feel)
  const wave2 = Math.sin(t * 1.618 + star.twinklePhase * 2.3) * 0.5;
  // Tertiary even faster wave for subtle flicker
  const wave3 = Math.sin(t * 2.71 + star.x * 0.1) * 0.25;

  // Combine waves (weighted sum)
  const twinkle = (wave1 + wave2 + wave3) / 1.75;

  // Map from [-1, 1] to [0.5, 1.3] multiplier for subtle effect
  const multiplier = 0.65 + (twinkle + 1) * 0.35;
  return Math.min(1, Math.max(0, star.baseOpacity * multiplier));
}

/**
 * Generate a single starfield frame as PNG buffer
 */
async function generateStarfieldFrame(
  stars: AnimatedStar[],
  width: number,
  height: number,
  time: number,
): Promise<Buffer> {
  // Create SVG with stars
  const svgStars = stars
    .map((star) => {
      const opacity = getStarOpacity(star, time);
      const x = (star.x / 100) * width;
      const y = (star.y / 100) * height;
      const r = star.size;
      // Add a subtle glow effect
      return `
        <circle cx="${x}" cy="${y}" r="${r * 2}" fill="rgba(255,255,255,${opacity * 0.3})" />
        <circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,${opacity})" />
      `;
    })
    .join('');

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent" />
      ${svgStars}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export interface StarfieldVideoOptions {
  seed: string;
  width: number;
  height: number;
  duration: number; // Duration in seconds
  fps?: number;
  starCount?: number;
  outputPath: string;
}

/**
 * Generate an animated starfield video loop
 */
export async function generateStarfieldVideo(
  options: StarfieldVideoOptions,
): Promise<string> {
  const {
    seed,
    width,
    height,
    duration,
    fps = 15, // Lower FPS for starfield is fine
    starCount = 100,
    outputPath,
  } = options;

  const stars = generateAnimatedStarfield(seed, starCount);
  const totalFrames = Math.ceil(duration * fps);

  // Create temp directory for frames
  const tempDir = join(process.cwd(), '.temp', `starfield-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });

  console.log(`🌟 Generating ${totalFrames} starfield frames...`);

  // Generate frames
  const framePaths: string[] = [];
  for (let i = 0; i < totalFrames; i++) {
    const time = i / fps;
    const frameBuffer = await generateStarfieldFrame(
      stars,
      width,
      height,
      time,
    );
    const framePath = join(tempDir, `frame-${String(i).padStart(5, '0')}.png`);
    await writeFile(framePath, frameBuffer);
    framePaths.push(framePath);
  }

  console.log(`🌟 Encoding starfield video...`);

  // Encode frames to video with alpha channel (WebM with VP9 for transparency)
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(join(tempDir, 'frame-%05d.png'))
      .inputFPS(fps)
      .outputOptions([
        '-c:v',
        'libvpx-vp9',
        '-pix_fmt',
        'yuva420p', // Preserve alpha channel
        '-b:v',
        '500k',
        '-auto-alt-ref',
        '0',
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });

  // Cleanup temp frames
  for (const framePath of framePaths) {
    await unlink(framePath).catch(() => {});
  }

  console.log(`🌟 Starfield video generated: ${outputPath}`);
  return outputPath;
}

/**
 * Generate a static starfield image (for simpler overlay)
 */
export async function generateStarfieldImage(
  seed: string,
  width: number,
  height: number,
  starCount: number = 100,
): Promise<Buffer> {
  const stars = generateAnimatedStarfield(seed, starCount);
  return generateStarfieldFrame(stars, width, height, 0);
}

/**
 * Generate animated starfield frames for video overlay
 * Returns paths to generated frame images
 */
export async function generateStarfieldFrames(
  seed: string,
  width: number,
  height: number,
  duration: number,
  outputDir: string,
  options: {
    fps?: number;
    starCount?: number;
    loopDuration?: number; // Duration of one twinkle cycle
  } = {},
): Promise<{ framePaths: string[]; fps: number }> {
  const {
    fps = 10, // Low FPS is fine for subtle twinkle
    starCount = 80,
    loopDuration = 4, // 4 second twinkle cycle
  } = options;

  const stars = generateAnimatedStarfield(seed, starCount);

  // Generate frames for one loop cycle (will be looped in FFmpeg)
  const framesNeeded = Math.ceil(loopDuration * fps);
  const framePaths: string[] = [];

  console.log(`🌟 Generating ${framesNeeded} starfield frames at ${fps}fps...`);

  for (let i = 0; i < framesNeeded; i++) {
    const time = i / fps;
    const frameBuffer = await generateStarfieldFrame(
      stars,
      width,
      height,
      time,
    );
    const framePath = join(
      outputDir,
      `stars-${String(i).padStart(4, '0')}.png`,
    );
    await writeFile(framePath, frameBuffer);
    framePaths.push(framePath);
  }

  return { framePaths, fps };
}
