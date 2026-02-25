#!/usr/bin/env tsx
/**
 * Lunary Background Video Generator
 *
 * Generates a bank of cosmic/astrology-themed background videos using
 * the Vercel AI Gateway and Vercel AI SDK v6.
 *
 * Videos are 9:16 vertical format for TikTok and Reels backgrounds.
 *
 * Usage:
 *   pnpm tsx scripts/generate-bg-videos.ts
 *   pnpm tsx scripts/generate-bg-videos.ts --model google/veo-3.0-fast-generate-001
 *   pnpm tsx scripts/generate-bg-videos.ts --model alibaba/wan-v2.6-t2v
 *   pnpm tsx scripts/generate-bg-videos.ts --category moon
 *   pnpm tsx scripts/generate-bg-videos.ts --dry-run
 *   pnpm tsx scripts/generate-bg-videos.ts --limit 5
 *
 * Available models (Vercel AI Gateway) — pricing per second of video:
 *   xai/grok-imagine-video             ($0.05/sec — CHEAPEST, default)
 *   alibaba/wan-v2.6-t2v               ($0.105/sec)
 *   google/veo-3.0-fast-generate-001   ($0.35/sec approx)
 *   google/veo-3.0-generate-001        ($0.35/sec approx)
 *   google/veo-3.1-fast-generate-001   ($0.35/sec approx, best quality fast)
 *   google/veo-3.1-generate-001        ($0.35/sec approx, best quality)
 *   klingai/kling-v2.5-turbo-t2v       (~$0.50/sec approx)
 *
 * Cost estimate (Grok, 5s videos):
 *   $0.25 per video. Vercel gives $5 free credits/month = 20 free clips.
 *   47 total prompts = $11.75 total (first 20 free, remaining $6.75 paid).
 *   Run in monthly batches of 20 to stay on free credit each month.
 *
 * Requires:
 *   AI_GATEWAY_API_KEY in .env.local
 */

import { config } from 'dotenv';
import { experimental_generateVideo as generateVideo, createGateway } from 'ai';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const modelArg = args.find((a) => a.startsWith('--model='))?.split('=')[1];
const categoryArg = args
  .find((a) => a.startsWith('--category='))
  ?.split('=')[1];
const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1];
const durationArg = args
  .find((a) => a.startsWith('--duration='))
  ?.split('=')[1];
const fromImagesFlag = args.includes('--from-images'); // animate portrait images
const limit = limitArg ? parseInt(limitArg, 10) : Infinity;
const DURATION = durationArg ? parseInt(durationArg, 10) : 10;

// Grok is cheapest at $0.05/sec ($0.25 per 5s video). With $5/month free Vercel
// credit you get 20 free clips per month. Quality is solid for background loops.
const DEFAULT_MODEL = 'xai/grok-imagine-video';
const MODEL = modelArg ?? DEFAULT_MODEL;

const IMAGES_DIR = path.join(
  process.cwd(),
  'images',
  'backgrounds',
  'portrait',
);
const OUTPUT_DIR = path.join(process.cwd(), 'videos', 'backgrounds');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

// ─── Prompt library ──────────────────────────────────────────────────────────

interface VideoPrompt {
  id: string;
  category: string;
  prompt: string;
  tags: string[];
}

const PROMPTS: VideoPrompt[] = [
  // MOON
  {
    id: 'moon-full-clouds',
    category: 'moon',
    prompt:
      'Cinematic close-up of a luminous full moon rising through thin silver clouds against a deep indigo night sky. Moonlight spills across wispy cloud edges. Slow dreamy movement. No text.',
    tags: ['moon', 'full-moon', 'clouds', 'night'],
  },
  {
    id: 'moon-crescent-stars',
    category: 'moon',
    prompt:
      'A glowing crescent moon hanging in a velvety dark sky filled with thousands of tiny stars. The moon casts a soft golden halo. Stars gently twinkle. Slow cinematic pan upward. No text.',
    tags: ['moon', 'crescent', 'stars'],
  },
  {
    id: 'moon-surface-orbit',
    category: 'moon',
    prompt:
      'Majestic slow orbit over the surface of the moon. Craters and highlands in sharp relief, Earth glowing blue in the distance. Cinematic space photography style. No text.',
    tags: ['moon', 'surface', 'space'],
  },
  {
    id: 'moon-rise-ocean',
    category: 'moon',
    prompt:
      'Timelapse of a massive golden full moon rising over a dark shimmering ocean. Moonlight reflects as a long glittering column on the water. Waves gently move. Ethereal and meditative. No text.',
    tags: ['moon', 'ocean', 'moonrise'],
  },
  {
    id: 'moon-eclipse-blood',
    category: 'moon',
    prompt:
      "A blood moon lunar eclipse slowly unfolding. The moon turns from white to deep crimson as Earth's shadow creeps across it. Set against thousands of distant stars. Cinematic slow motion. No text.",
    tags: ['moon', 'eclipse', 'blood-moon'],
  },
  {
    id: 'moon-phases-sequence',
    category: 'moon',
    prompt:
      'A single moon slowly cycling through all its phases from new moon to full moon and back. Set against a deep black starfield. Smooth slow transition. Mystical and hypnotic. No text.',
    tags: ['moon', 'phases', 'cycle'],
  },

  // STARS AND STAR FIELDS
  {
    id: 'starfield-milky-way-rotation',
    category: 'stars',
    prompt:
      'The Milky Way galaxy slowly rotating overhead. Billions of stars in a thick luminous band across the sky, with subtle purple and gold nebula colours. Long-exposure timelapse aesthetic. No text.',
    tags: ['stars', 'milky-way', 'galaxy'],
  },
  {
    id: 'starfield-deep-space',
    category: 'stars',
    prompt:
      'Infinite deep space filled with dense star clusters and distant galaxies. Stars of varying brightness gently pulse and shimmer. Slow cinematic zoom into the void. Dark background. No text.',
    tags: ['stars', 'deep-space', 'zoom'],
  },
  {
    id: 'starfield-shooting-stars',
    category: 'stars',
    prompt:
      'A night sky with a rich star field and multiple shooting stars streaking across the frame. The Milky Way glows faintly in the background. Subtle northern lights colours on the horizon. No text.',
    tags: ['stars', 'shooting-stars', 'meteor'],
  },
  {
    id: 'starfield-warp-speed',
    category: 'stars',
    prompt:
      'Stars streaking past at warp speed, an infinite tunnel of light trails through deep space. Hypnotic and meditative. Dark background with white and blue star trails. No text.',
    tags: ['stars', 'warp', 'light-trails'],
  },
  {
    id: 'starfield-twinkling-close',
    category: 'stars',
    prompt:
      'Extreme close-up star field, individual stars twinkling and gently pulsing in deep space. Various colours: white, blue, gold, faint red. Very slow drift. Meditative and calming. No text.',
    tags: ['stars', 'twinkling', 'close-up'],
  },

  // NEBULAE AND DEEP SPACE
  {
    id: 'nebula-purple-gold',
    category: 'nebula',
    prompt:
      'A stunning cosmic nebula in deep purples, magentas and gold. Gas clouds swirl in slow cinematic motion. Stars are embedded within the glowing wisps. Looks like a painting of the cosmos. No text.',
    tags: ['nebula', 'purple', 'gold', 'cosmic'],
  },
  {
    id: 'nebula-blue-teal',
    category: 'nebula',
    prompt:
      'An ethereal nebula in electric blue and teal tones. Luminous gas clouds drift slowly against a black starfield. Resembles glowing underwater fog. Dreamy and mystical. No text.',
    tags: ['nebula', 'blue', 'teal', 'ethereal'],
  },
  {
    id: 'nebula-rose-pink',
    category: 'nebula',
    prompt:
      'A rose-pink nebula, soft and feminine, glowing with warm light. Gas filaments curl gently like smoke. Stars sparkle within the cloud. Romantic and cosmic. No text.',
    tags: ['nebula', 'pink', 'rose', 'romantic'],
  },
  {
    id: 'nebula-gold-amber',
    category: 'nebula',
    prompt:
      'A warm amber and gold nebula, resembling a glowing ember cloud in space. Rich earthy cosmic tones. Gas swirls in slow hypnotic motion against a dark background. No text.',
    tags: ['nebula', 'gold', 'amber', 'warm'],
  },
  {
    id: 'nebula-supernova',
    category: 'nebula',
    prompt:
      'A supernova remnant expanding outward in a ring of golden and purple gas. The remnant pulses with light from within. Stars surround it in a dense field. Dramatic and otherworldly. No text.',
    tags: ['nebula', 'supernova', 'dramatic'],
  },
  {
    id: 'nebula-pillars-creation',
    category: 'nebula',
    prompt:
      'Towering gas pillars rising from a cosmic nebula, reminiscent of the Pillars of Creation. Deep green and gold tones. Stars forming within the pillars. Slow cinematic upward pan. No text.',
    tags: ['nebula', 'pillars', 'majestic'],
  },

  // PLANETS AND SOLAR SYSTEM
  {
    id: 'planet-earth-space',
    category: 'planets',
    prompt:
      'Earth slowly rotating in space. Continents, blue oceans, white clouds clearly visible. The atmosphere glows with a soft blue halo. The black void of space behind it. Cinematic and breathtaking. No text.',
    tags: ['planets', 'earth', 'space'],
  },
  {
    id: 'planet-saturn-rings',
    category: 'planets',
    prompt:
      'Saturn with its iconic rings, slowly rotating in space. Golden planet surface with visible banding. The rings cast a shadow across the planet. Surrounded by a star field. Cinematic and majestic. No text.',
    tags: ['planets', 'saturn', 'rings'],
  },
  {
    id: 'planet-jupiter-storm',
    category: 'planets',
    prompt:
      "Jupiter's swirling storm clouds in amber, orange and cream. The Great Red Spot slowly rotates. The planet fills the frame. Hypnotic banded cloud movement. No text.",
    tags: ['planets', 'jupiter', 'storm'],
  },
  {
    id: 'planet-venus-glow',
    category: 'planets',
    prompt:
      'Venus glowing soft gold and white in space. Thick swirling cloud cover catches sunlight. Surrounded by stars. Mystical and beautiful. Slow rotation. Astrologically associated with love and beauty. No text.',
    tags: ['planets', 'venus', 'glow'],
  },
  {
    id: 'planet-mars-surface',
    category: 'planets',
    prompt:
      'Low orbit over Mars surface. Red ochre canyons and craters, thin pink atmosphere. Dust swirls lazily. Cinematic flyover. Sun glinting off the horizon. Dramatic and lonely. No text.',
    tags: ['planets', 'mars', 'surface'],
  },

  // AURORA AND ATMOSPHERIC
  {
    id: 'aurora-green-purple',
    category: 'aurora',
    prompt:
      'The Northern Lights dancing across a dark arctic sky. Vivid green and purple curtains of light ripple and sway. Stars visible through the aurora. Reflected in a still lake below. Magical and mystical. No text.',
    tags: ['aurora', 'northern-lights', 'green', 'purple'],
  },
  {
    id: 'aurora-teal-pink',
    category: 'aurora',
    prompt:
      'A spectacular aurora borealis in teal, pink, and violet. The lights form spiralling curtains across the entire sky. Silhouette of pine trees at the base. Otherworldly and ethereal. No text.',
    tags: ['aurora', 'teal', 'pink'],
  },
  {
    id: 'aurora-blue-white',
    category: 'aurora',
    prompt:
      'A gentle pale blue and white aurora shimmering over a dark frozen landscape. Stars and the Milky Way visible above. Ice and snow glisten below. Calm and meditative. No text.',
    tags: ['aurora', 'blue', 'white', 'calm'],
  },

  // COSMIC AND MYSTICAL
  {
    id: 'cosmic-portal-stars',
    category: 'cosmic',
    prompt:
      'A swirling cosmic portal opening in space. Stars and galaxies visible through the opening. Purple and gold energy ripples at the edges. Looks magical and interdimensional. Slow hypnotic rotation. No text.',
    tags: ['cosmic', 'portal', 'mystical'],
  },
  {
    id: 'cosmic-golden-ratio',
    category: 'cosmic',
    prompt:
      'The golden spiral (Fibonacci) revealed in a cosmic nebula. Stars and gas clouds form perfect spiralling arms. Gold and deep blue tones. Sacred geometry made from stars. Slow cinematic reveal. No text.',
    tags: ['cosmic', 'sacred-geometry', 'spiral', 'gold'],
  },
  {
    id: 'cosmic-stardust-particles',
    category: 'cosmic',
    prompt:
      'Billions of stardust particles drifting gently through deep space. Gold and silver motes catch distant starlight. Like snow in zero gravity. Dark background. Meditative and calming. No text.',
    tags: ['cosmic', 'stardust', 'particles', 'meditative'],
  },
  {
    id: 'cosmic-black-hole',
    category: 'cosmic',
    prompt:
      'A supermassive black hole with an accretion disc of glowing orange and gold matter spiralling inward. Stars being stretched toward the event horizon. Dramatic and awe-inspiring. No text.',
    tags: ['cosmic', 'black-hole', 'dramatic'],
  },
  {
    id: 'cosmic-twin-stars',
    category: 'cosmic',
    prompt:
      'Two binary stars orbiting each other. One blue, one amber. They trail light as they dance. Gas streams between them. Set against a dense star field with a nebula backdrop. Cinematic. No text.',
    tags: ['cosmic', 'binary-stars', 'cosmic-dance'],
  },
  {
    id: 'cosmic-galaxy-zoom',
    category: 'cosmic',
    prompt:
      'A slow cinematic zoom into the centre of a spiral galaxy. Spiralling arms of stars and dust glow in blue and gold. The core blazes white. Billions of suns revealed as we approach. No text.',
    tags: ['cosmic', 'galaxy', 'zoom', 'spiral'],
  },

  // ZODIAC / ASTROLOGY THEMED
  {
    id: 'zodiac-constellation-scorpio',
    category: 'zodiac',
    prompt:
      'The Scorpio constellation glowing gold against a deep indigo star-filled sky. Stars connected by faint golden lines forming the scorpion shape. The constellation slowly rotates. Mystical and ancient. No text.',
    tags: ['zodiac', 'scorpio', 'constellation'],
  },
  {
    id: 'zodiac-constellation-pisces',
    category: 'zodiac',
    prompt:
      'Pisces constellation illuminated in soft blue and silver against a dark cosmic backdrop. Two glowing fish shapes formed by stars connected with delicate lines. The Milky Way stretches behind. No text.',
    tags: ['zodiac', 'pisces', 'constellation'],
  },
  {
    id: 'zodiac-celestial-wheel',
    category: 'stars',
    prompt:
      'A timelapse of the entire night sky rotating around Polaris, the north star. Stars trace circular light trails around the stationary pole star. Long exposure astrophotography. Breathtaking. No text.',
    tags: ['stars', 'polaris', 'rotation', 'timelapse'],
  },
  {
    id: 'zodiac-starmap-astral',
    category: 'stars',
    prompt:
      'Star trails over a dark landscape. Long exposure shows stars tracing perfect arcs across the night sky. Milky Way visible. Mountain silhouette below. Real astrophotography aesthetic. No text.',
    tags: ['stars', 'trails', 'long-exposure', 'landscape'],
  },
  {
    id: 'zodiac-elements-fire',
    category: 'zodiac',
    prompt:
      'Cosmic fire element: a swirling vortex of solar plasma and flame against deep space. Reds, oranges and golds. Looks like the surface of the sun in slow cinematic motion. Powerful and energetic. No text.',
    tags: ['zodiac', 'fire', 'element', 'solar'],
  },
  {
    id: 'zodiac-elements-water',
    category: 'zodiac',
    prompt:
      'Cosmic water element: deep blue waves merging with space. Stars visible beneath a translucent ocean surface that fades into a starfield. Otherworldly and fluid. Calming and mystical. No text.',
    tags: ['zodiac', 'water', 'element', 'ocean'],
  },

  // NATURAL COSMIC PHENOMENA
  {
    id: 'ritual-candle-cosmos',
    category: 'cosmic',
    prompt:
      'A meteor shower. Dozens of bright meteors streak across a dense star field. The Milky Way glows behind them. Long-exposure photography style. Cinematic and breathtaking. No text.',
    tags: ['cosmic', 'meteor', 'shower', 'stars'],
  },
  {
    id: 'ritual-crystals-light',
    category: 'cosmic',
    prompt:
      'A pulsar star emitting jets of brilliant blue-white radiation into space. The jets pulse rhythmically. Surrounding nebula gas glows in response. Real astrophysics made cinematic. No text.',
    tags: ['cosmic', 'pulsar', 'jets', 'radiation'],
  },
  {
    id: 'ritual-moon-water',
    category: 'moon',
    prompt:
      'A full moon rising over a calm dark ocean. Moonlight creates a perfect silver reflection path across the water stretching to the horizon. Waves gently catch the light. Real and beautiful. No text.',
    tags: ['moon', 'ocean', 'reflection', 'moonrise'],
  },
  {
    id: 'ritual-smoke-cosmos',
    category: 'cosmic',
    prompt:
      'White smoke rising and slowly morphing into the shape of a galaxy spiral. The smoke glows faintly as it billows against a deep black background scattered with real stars. Natural and hypnotic. No text.',
    tags: ['cosmic', 'smoke', 'galaxy', 'morph'],
  },
  {
    id: 'ritual-tarot-celestial',
    category: 'cosmic',
    prompt:
      'Two galaxies colliding in slow motion. Spiral arms distort and merge over millions of years, shown cinematically. Stars scatter like sparks. Dramatic and awe-inspiring. Real cosmic event. No text.',
    tags: ['cosmic', 'galaxies', 'collision', 'dramatic'],
  },

  // TRANSITIONS AND LOOPS
  {
    id: 'loop-starfield-drift',
    category: 'loop',
    prompt:
      'An infinite starfield slowly drifting upward, as if falling through the cosmos. Stars of varying brightness at different depths create parallax. Very slow, calming, perfectly loopable. Dark background. No text.',
    tags: ['loop', 'stars', 'drift', 'infinite'],
  },
  {
    id: 'loop-nebula-breathe',
    category: 'loop',
    prompt:
      'A cosmic nebula in purple and gold slowly "breathing" — expanding and contracting gently. Stars twinkle within it. Very slow movement, feels alive. Designed to loop seamlessly. No text.',
    tags: ['loop', 'nebula', 'breathing', 'organic'],
  },
  {
    id: 'loop-moon-glow-pulse',
    category: 'loop',
    prompt:
      'A full moon with a soft glowing halo, the glow gently pulsing in and out. Deep indigo sky. A few stars visible around it. Calming and hypnotic. Designed to loop seamlessly. No text.',
    tags: ['loop', 'moon', 'glow', 'pulse'],
  },
  {
    id: 'loop-stardust-rain',
    category: 'loop',
    prompt:
      'Tiny gold stardust particles slowly falling through a deep space background. Sparse star field behind. Particles catch faint light. Like cosmic snow falling gently. Seamlessly loopable. No text.',
    tags: ['loop', 'stardust', 'rain', 'gold'],
  },
  {
    id: 'loop-galaxy-spin',
    category: 'loop',
    prompt:
      'A small spiral galaxy slowly rotating. Blue and gold arms of stars and dust turn hypnotically. Deep black background. Designed to loop seamlessly. Simple and beautiful. No text.',
    tags: ['loop', 'galaxy', 'spin', 'seamless'],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ManifestEntry {
  id: string;
  file: string;
  model: string;
  generatedAt: string;
  prompt: string;
  category: string;
  tags: string[];
  durationSeconds: number;
  fromImage?: boolean;
}

interface Manifest {
  version: number;
  entries: ManifestEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadManifest(): Manifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as Manifest;
  }
  return { version: 1, entries: [] };
}

function saveManifest(manifest: Manifest): void {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey && !isDryRun) {
    console.error('Error: AI_GATEWAY_API_KEY is not set in .env.local');
    console.error(
      'Get your key from: Vercel Dashboard > AI Gateway > API Keys',
    );
    process.exit(1);
  }

  ensureOutputDir();
  const manifest = loadManifest();
  const generatedIds = new Set(manifest.entries.map((e) => e.id));

  // Filter by category if specified
  let prompts = PROMPTS;
  if (categoryArg) {
    prompts = PROMPTS.filter((p) => p.category === categoryArg);
    if (prompts.length === 0) {
      const categories = [...new Set(PROMPTS.map((p) => p.category))].join(
        ', ',
      );
      console.error(
        `Unknown category "${categoryArg}". Available: ${categories}`,
      );
      process.exit(1);
    }
  }

  // Skip already generated
  const todo = prompts.filter((p) => !generatedIds.has(p.id));

  console.log(`\nLunary Background Video Generator`);
  console.log(`──────────────────────────────────`);
  console.log(`Model:    ${MODEL}`);
  console.log(`Output:   ${OUTPUT_DIR}`);
  console.log(
    `Prompts:  ${prompts.length} total, ${todo.length} to generate, ${generatedIds.size} already done`,
  );
  if (categoryArg) console.log(`Category: ${categoryArg}`);
  if (isDryRun) console.log(`Mode:     DRY RUN (no API calls)`);
  console.log('');

  if (todo.length === 0) {
    console.log('All videos already generated. Nothing to do.');
    return;
  }

  // Apply limit
  const batch = todo.slice(0, limit === Infinity ? todo.length : limit);
  if (limit !== Infinity && batch.length < todo.length) {
    console.log(
      `Limiting to ${batch.length} videos (${todo.length - batch.length} deferred)\n`,
    );
  }

  // Set up gateway
  const gateway = apiKey ? createGateway({ apiKey }) : null;

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < batch.length; i++) {
    const prompt = batch[i];
    const filename = `${prompt.id}.mp4`;
    const filepath = path.join(OUTPUT_DIR, filename);
    const progressPrefix = `[${i + 1}/${batch.length}]`;

    console.log(`${progressPrefix} ${prompt.id}`);
    console.log(
      `  Category: ${prompt.category} | Tags: ${prompt.tags.join(', ')}`,
    );
    console.log(`  Prompt: ${prompt.prompt.substring(0, 80)}...`);

    if (isDryRun) {
      console.log(`  → DRY RUN: would save to ${filename}\n`);
      continue;
    }

    const genStart = Date.now();

    try {
      // Image-to-video: use matching portrait image if available and --from-images set
      const imageFile = path.join(IMAGES_DIR, `${prompt.id}__portrait.png`);
      const useImage = fromImagesFlag && fs.existsSync(imageFile);

      if (useImage) {
        console.log(`  → Animating from image: ${prompt.id}__portrait.png`);
      }
      console.log(`  → Generating ${DURATION}s video...`);

      const generateArgs: Parameters<typeof generateVideo>[0] = useImage
        ? {
            model: gateway!.video(MODEL),
            prompt: { image: fs.readFileSync(imageFile), text: prompt.prompt },
            aspectRatio: '9:16',
            duration: DURATION,
          }
        : {
            model: gateway!.video(MODEL),
            prompt: prompt.prompt,
            aspectRatio: '9:16',
            duration: DURATION,
          };

      const result = await generateVideo(generateArgs);

      const genTime = formatDuration(Date.now() - genStart);
      console.log(`  → Generated in ${genTime}`);

      fs.writeFileSync(filepath, result.videos[0].uint8Array);
      console.log(`  → Saved: ${filename}`);

      const entry: ManifestEntry = {
        id: prompt.id,
        file: filename,
        model: MODEL,
        generatedAt: new Date().toISOString(),
        prompt: prompt.prompt,
        category: prompt.category,
        tags: prompt.tags,
        durationSeconds: DURATION,
        fromImage: useImage,
      };
      manifest.entries.push(entry);
      saveManifest(manifest);

      successCount++;
      console.log('');

      if (i < batch.length - 1) {
        await sleep(10000);
      }
    } catch (err) {
      const genTime = formatDuration(Date.now() - genStart);

      // SDK bug: sometimes throws a rejected Promise instead of an Error
      let errorMessage: string;
      if (err instanceof Promise) {
        try {
          await err;
          errorMessage = 'Unknown error';
        } catch (inner) {
          errorMessage = inner instanceof Error ? inner.message : String(inner);
        }
      } else {
        errorMessage = err instanceof Error ? err.message : String(err);
      }

      console.error(`  → FAILED after ${genTime}: ${errorMessage}`);
      failCount++;
      console.log('');

      if (i < batch.length - 1) {
        console.log('  Waiting 45s before next attempt (Grok rate limit)...\n');
        await sleep(45000);
      }
    }
  }

  // Summary
  const totalTime = formatDuration(Date.now() - startTime);
  console.log('──────────────────────────────────');
  console.log(`Done in ${totalTime}`);
  console.log(
    `Generated: ${successCount} | Failed: ${failCount} | Total in bank: ${manifest.entries.length}`,
  );

  if (failCount > 0) {
    console.log(
      `\nRe-run the script to retry failed videos (they were not saved to the manifest).`,
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
