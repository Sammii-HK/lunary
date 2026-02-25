#!/usr/bin/env tsx
/**
 * Animate Portrait Images → Videos
 *
 * Takes every portrait image in images/backgrounds/portrait/ and animates
 * it into a video using Grok image-to-video. Saves to videos/animated/.
 *
 * Usage:
 *   pnpm tsx scripts/animate-portraits.ts
 *   pnpm tsx scripts/animate-portraits.ts --duration=10
 *   pnpm tsx scripts/animate-portraits.ts --limit=20
 *   pnpm tsx scripts/animate-portraits.ts --dry-run
 *
 * Requires:
 *   AI_GATEWAY_API_KEY in .env.local
 */

import { config } from 'dotenv';
import { experimental_generateVideo as generateVideo, createGateway } from 'ai';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const durationArg = args
  .find((a) => a.startsWith('--duration='))
  ?.split('=')[1];
const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1];
const DURATION = durationArg ? parseInt(durationArg, 10) : 10;
const limit = limitArg ? parseInt(limitArg, 10) : Infinity;

const MODEL = 'xai/grok-imagine-video';
const IMAGES_DIR = path.join(
  process.cwd(),
  'images',
  'backgrounds',
  'portrait',
);
const OUTPUT_DIR = path.join(process.cwd(), 'videos', 'animated');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

interface ManifestEntry {
  id: string;
  file: string;
  sourceImage: string;
  model: string;
  generatedAt: string;
  durationSeconds: number;
}

interface Manifest {
  version: number;
  entries: ManifestEntry[];
}

function loadManifest(): Manifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as Manifest;
  }
  return { version: 1, entries: [] };
}

function saveManifest(manifest: Manifest): void {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

async function main() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey && !isDryRun) {
    console.error('Error: AI_GATEWAY_API_KEY not set in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const manifest = loadManifest();
  const doneIds = new Set(manifest.entries.map((e) => e.id));

  // All portrait images
  const allImages = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => f.endsWith('__portrait.png'))
    .sort();

  // Strip __portrait.png to get id
  const todo = allImages
    .map((f) => ({ file: f, id: f.replace('__portrait.png', '') }))
    .filter(({ id }) => !doneIds.has(id));

  console.log(`\nLunary Portrait Animator`);
  console.log(`─────────────────────────`);
  console.log(`Model:     ${MODEL}`);
  console.log(`Duration:  ${DURATION}s`);
  console.log(
    `Images:    ${allImages.length} total, ${todo.length} to animate, ${doneIds.size} done`,
  );
  console.log(`Output:    ${OUTPUT_DIR}`);
  if (isDryRun) console.log(`Mode:      DRY RUN`);
  console.log('');

  if (todo.length === 0) {
    console.log('All portraits already animated.');
    return;
  }

  const batch = todo.slice(0, limit === Infinity ? todo.length : limit);

  const gateway = apiKey ? createGateway({ apiKey }) : null;
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < batch.length; i++) {
    const { file, id } = batch[i];
    const imagePath = path.join(IMAGES_DIR, file);
    const outputFile = `${id}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFile);
    const prefix = `[${i + 1}/${batch.length}]`;

    console.log(`${prefix} ${id}`);

    if (isDryRun) {
      console.log(`  → DRY RUN: ${file} → ${outputFile}\n`);
      continue;
    }

    const genStart = Date.now();
    console.log(`  → Animating...`);

    try {
      const imageData = fs.readFileSync(imagePath);

      const result = await generateVideo({
        model: gateway!.video(MODEL),
        prompt: {
          image: imageData,
          text: 'Animate this image with slow, cinematic movement. Keep the mood and atmosphere. Subtle motion only. No text.',
        },
        aspectRatio: '9:16',
        duration: DURATION,
      });

      fs.writeFileSync(outputPath, result.videos[0].uint8Array);
      console.log(
        `  → Saved: ${outputFile} (${formatDuration(Date.now() - genStart)})\n`,
      );

      manifest.entries.push({
        id,
        file: outputFile,
        sourceImage: file,
        model: MODEL,
        generatedAt: new Date().toISOString(),
        durationSeconds: DURATION,
      });
      saveManifest(manifest);
      successCount++;

      if (i < batch.length - 1) await sleep(10000);
    } catch (err) {
      let msg: string;
      if (err instanceof Promise) {
        try {
          await err;
          msg = 'Unknown error';
        } catch (inner) {
          msg = inner instanceof Error ? inner.message : String(inner);
        }
      } else {
        msg = err instanceof Error ? err.message : String(err);
      }

      console.error(
        `  → FAILED (${formatDuration(Date.now() - genStart)}): ${msg}\n`,
      );
      failCount++;

      if (i < batch.length - 1) {
        console.log('  Waiting 45s (rate limit)...\n');
        await sleep(45000);
      }
    }
  }

  const totalTime = formatDuration(Date.now() - startTime);
  console.log('─────────────────────────');
  console.log(`Done in ${totalTime}`);
  console.log(
    `Animated: ${successCount} | Failed: ${failCount} | Total: ${manifest.entries.length}`,
  );

  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
