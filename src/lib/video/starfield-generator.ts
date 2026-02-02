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

// Natural meteor colors based on element composition when burning up
const METEOR_COLORS = [
  { head: '#fff4e0', tail: 'rgba(255,200,120,0.5)' }, // Iron/Nickel - yellow/orange
  { head: '#e8f4ff', tail: 'rgba(180,210,255,0.5)' }, // Magnesium - blue-white
  { head: '#ffe8d0', tail: 'rgba(255,180,100,0.45)' }, // Sodium - orange/yellow
  { head: '#f0e8ff', tail: 'rgba(200,170,255,0.45)' }, // Calcium - violet
  { head: '#ffe0d8', tail: 'rgba(255,160,130,0.45)' }, // Silicon - red/orange
  { head: '#ffffff', tail: 'rgba(255,255,255,0.5)' }, // Pure white (common)
  { head: '#ffffff', tail: 'rgba(255,255,255,0.45)' }, // Pure white
];

interface ShootingStar {
  startX: number; // percentage
  startY: number; // percentage
  angle: number; // degrees
  speed: number; // percentage per second
  thickness: number; // pixels
  colorIndex: number;
  startTime: number; // seconds
  duration: number; // seconds
}

/**
 * Generate shooting stars with variety in position, size, color, and speed
 */
function generateShootingStars(
  seed: string,
  totalDuration: number,
): ShootingStar[] {
  const random = seededRandom(seed + '-meteors');
  const stars: ShootingStar[] = [];

  const isShortLoop = totalDuration < 5;
  let currentTime = isShortLoop ? 0.3 + random() * 0.5 : 0.8 + random() * 1.0;

  while (currentTime < totalDuration - 0.5) {
    const colorIndex = Math.floor(random() * METEOR_COLORS.length);

    // Variety of entry positions
    const entryType = Math.floor(random() * 3);
    let startX: number;
    let startY: number;
    let angle: number;

    if (entryType === 0) {
      // From top
      startX = 5 + random() * 90;
      startY = -2 + random() * 12;
      angle = random() > 0.5 ? 25 + random() * 40 : 115 + random() * 40;
    } else if (entryType === 1) {
      // From left
      startX = -2 + random() * 10;
      startY = 10 + random() * 50;
      angle = -15 + random() * 50;
    } else {
      // From right
      startX = 92 + random() * 10;
      startY = 5 + random() * 40;
      angle = 145 + random() * 30;
    }

    // Size variety - thick = fast
    const thickness = 1 + random() * 2; // 1-3px
    const thicknessNorm = (thickness - 1) / 2;
    const speed = 30 + thicknessNorm * 30 + random() * 10; // thick: 60-70, thin: 30-40
    const duration = 0.4 + (1 - thicknessNorm) * 0.5 + random() * 0.2; // thick: 0.4-0.6s, thin: 0.7-1.1s

    stars.push({
      startX,
      startY,
      angle,
      speed,
      thickness,
      colorIndex,
      startTime: currentTime,
      duration,
    });

    const interval = isShortLoop ? 1.5 + random() * 1.5 : 3 + random() * 3;
    currentTime += interval;
  }

  return stars;
}

/**
 * Generate SVG for a shooting star at a given time with burning up effect
 */
function renderShootingStar(
  star: ShootingStar,
  time: number,
  width: number,
  height: number,
): string {
  const localTime = time - star.startTime;

  if (localTime < 0 || localTime > star.duration) {
    return '';
  }

  const progress = localTime / star.duration;
  const colors = METEOR_COLORS[star.colorIndex];

  // Calculate head position
  const angleRad = (star.angle * Math.PI) / 180;
  const distanceTraveled = localTime * star.speed;
  const headX = star.startX + distanceTraveled * Math.cos(angleRad);
  const headY = star.startY + distanceTraveled * Math.sin(angleRad);

  // Convert to pixels
  const px = (headX / 100) * width;
  const py = (headY / 100) * height;

  // Trail length grows then shrinks
  const baseTrailLength = 6 + star.thickness * 2; // percentage
  let trailLengthPct: number;
  if (progress < 0.2) {
    trailLengthPct =
      baseTrailLength * 0.3 + (baseTrailLength * 0.7 * progress) / 0.2;
  } else if (progress > 0.8) {
    trailLengthPct =
      ((baseTrailLength * (1 - progress)) / 0.2) * 0.7 + baseTrailLength * 0.3;
  } else {
    trailLengthPct = baseTrailLength;
  }
  const trailLength = (trailLengthPct / 100) * width;

  // Burning up effect - gets brighter mid-flight
  let intensity: number;
  if (progress < 0.15) {
    intensity = 0.3 + (0.4 * progress) / 0.15;
  } else if (progress < 0.5) {
    intensity = 0.7 + (0.3 * (progress - 0.15)) / 0.35;
  } else if (progress < 0.75) {
    intensity = 1.0 - (0.1 * (progress - 0.5)) / 0.25;
  } else {
    intensity = 0.9 * (1 - (progress - 0.75) / 0.25);
  }

  // Trail end position
  const trailEndX = px - trailLength * Math.cos(angleRad);
  const trailEndY = py - trailLength * Math.sin(angleRad);

  const gradientId = `meteor-${star.startTime.toFixed(2).replace('.', '-')}-${time.toFixed(2).replace('.', '-')}`;

  return `
    <defs>
      <linearGradient id="${gradientId}" x1="${trailEndX}" y1="${trailEndY}" x2="${px}" y2="${py}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${colors.tail}" stop-opacity="0" />
        <stop offset="50%" stop-color="${colors.tail}" stop-opacity="${intensity * 0.3}" />
        <stop offset="85%" stop-color="${colors.head}" stop-opacity="${intensity * 0.7}" />
        <stop offset="100%" stop-color="${colors.head}" stop-opacity="${intensity}" />
      </linearGradient>
    </defs>
    <line
      x1="${trailEndX}"
      y1="${trailEndY}"
      x2="${px}"
      y2="${py}"
      stroke="url(#${gradientId})"
      stroke-width="${star.thickness}"
      stroke-linecap="round"
    />
    ${intensity > 0.5 ? `<circle cx="${px}" cy="${py}" r="${star.thickness * 0.8 + intensity * 1.5}" fill="${colors.head}" opacity="${intensity * 0.6}" />` : ''}
  `;
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
      twinkleSpeed: 0.08 + random() * 0.12, // Very gentle twinkle (0.08-0.2 cycles per second = 5-12 second cycles)
      twinklePhase: random() * Math.PI * 2, // Random starting phase
    });
  }

  return stars;
}

/**
 * Calculate star opacity and size at a given time with random organic twinkle
 */
function getStarTwinkle(
  star: AnimatedStar,
  time: number,
): { opacity: number; sizeMultiplier: number } {
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

  // Map from [-1, 1] to multipliers
  const opacityMultiplier = 0.65 + (twinkle + 1) * 0.35;
  const opacity = Math.min(
    1,
    Math.max(0, star.baseOpacity * opacityMultiplier),
  );

  // Size varies with twinkle - stars grow and shrink
  const sizeMultiplier = 0.6 + (twinkle + 1) * 0.4; // 0.6 to 1.4

  return { opacity, sizeMultiplier };
}

/**
 * Generate a single starfield frame as PNG buffer
 */
async function generateStarfieldFrame(
  stars: AnimatedStar[],
  shootingStars: ShootingStar[],
  width: number,
  height: number,
  time: number,
): Promise<Buffer> {
  // Create SVG with twinkling stars
  const svgStars = stars
    .map((star) => {
      const { opacity, sizeMultiplier } = getStarTwinkle(star, time);
      const x = (star.x / 100) * width;
      const y = (star.y / 100) * height;
      const r = star.size * sizeMultiplier;

      // Add glow when bright
      const glowOpacity = opacity > 0.4 ? opacity * 0.4 : 0;

      return `
        ${glowOpacity > 0 ? `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="rgba(255,255,255,${glowOpacity})" />` : ''}
        <circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="rgba(255,255,255,${opacity * 0.4})" />
        <circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,${opacity})" />
      `;
    })
    .join('');

  // Render shooting stars
  const svgShootingStars = shootingStars
    .map((star) => renderShootingStar(star, time, width, height))
    .join('');

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="transparent" />
      ${svgStars}
      ${svgShootingStars}
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
  const shootingStars = generateShootingStars(seed, duration);
  const totalFrames = Math.ceil(duration * fps);

  // Create temp directory for frames
  const tempDir = join(process.cwd(), '.temp', `starfield-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });

  console.log(
    `🌟 Generating ${totalFrames} starfield frames with ${shootingStars.length} shooting stars...`,
  );

  // Generate frames
  const framePaths: string[] = [];
  for (let i = 0; i < totalFrames; i++) {
    const time = i / fps;
    const frameBuffer = await generateStarfieldFrame(
      stars,
      shootingStars,
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
  return generateStarfieldFrame(stars, [], width, height, 0);
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
  // Generate shooting stars for the loop duration
  const shootingStars = generateShootingStars(seed, loopDuration);

  // Generate frames for one loop cycle (will be looped in FFmpeg)
  const framesNeeded = Math.ceil(loopDuration * fps);
  const framePaths: string[] = [];

  console.log(`🌟 Generating ${framesNeeded} starfield frames at ${fps}fps...`);

  for (let i = 0; i < framesNeeded; i++) {
    const time = i / fps;
    const frameBuffer = await generateStarfieldFrame(
      stars,
      shootingStars,
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
