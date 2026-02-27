/**
 * Cinematic Video Composer
 *
 * Renders landscape showcase and cinematic TikTok videos using the new
 * PhoneMockup-based compositions.
 *
 * Usage:
 *   pnpm compose:cinematic                          # All landscape videos
 *   pnpm compose:cinematic app-tour                 # Single video
 *   pnpm compose:cinematic --format landscape       # All landscape only
 *   pnpm compose:cinematic --format multiphone      # All multiphone (animated)
 *   pnpm compose:cinematic --preview                # CRF 28 (quick preview)
 *
 * Pipeline: showcase-scripts.ts → cinematic-renderer.ts → public/marketing/final/
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { mkdir, writeFile } from 'fs/promises';
import {
  LANDSCAPE_SCRIPTS,
  MULTI_PHONE_SCRIPTS,
  getShowcaseScript,
  type LandscapeScript,
  type MultiPhoneScript,
} from '../src/lib/video/showcase-scripts';
import { renderCinematicVideo } from '../src/lib/video/cinematic-renderer';

const OUTPUT_DIR = join(process.cwd(), 'public', 'marketing', 'final');

// ============================================================================
// Render landscape showcase
// ============================================================================

async function renderLandscape(
  script: LandscapeScript,
  options: { preview: boolean },
): Promise<string> {
  // script.id is a hardcoded enum value from showcase-scripts.ts — not user input
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const outputPath = join(OUTPUT_DIR, `${script.id}.mp4`);
  const crf = options.preview ? 28 : 18;

  console.log(
    `   Duration: ${script.totalSeconds}s, ${script.scenes.length} scenes`,
  );
  console.log(`   Background: ${script.backgroundType ?? 'starfield'}`);

  const videoBuffer = await renderCinematicVideo({
    format: 'LandscapeShowcase',
    inputProps: {
      scenes: script.scenes,
      backgroundType: script.backgroundType,
      seed: script.id,
    },
    durationSeconds: script.totalSeconds,
    outputPath,
    crf,
  });

  await writeFile(outputPath, videoBuffer);
  const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`   Done: ${script.id}.mp4 (${sizeMB} MB)`);
  return outputPath;
}

// ============================================================================
// Render multiphone (animated video version)
// ============================================================================

async function renderMultiPhone(
  script: MultiPhoneScript,
  options: { preview: boolean },
): Promise<string> {
  // script.id is a hardcoded enum value from showcase-scripts.ts — not user input
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const outputPath = join(OUTPUT_DIR, `${script.id}.mp4`);
  const crf = options.preview ? 28 : 18;

  console.log(
    `   Phones: ${script.phones.length}, layout: ${script.layout ?? 'row'}`,
  );

  const videoBuffer = await renderCinematicVideo({
    format: 'MultiPhoneShowcase',
    inputProps: {
      phones: script.phones,
      layout: script.layout,
      backgroundType: script.backgroundType,
      animate: true,
      title: script.heading,
      subtitle: script.subheading,
      seed: script.id,
    },
    durationSeconds: 10,
    outputPath,
    crf,
  });

  await writeFile(outputPath, videoBuffer);
  const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`   Done: ${script.id}.mp4 (${sizeMB} MB)`);
  return outputPath;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  const formatFilter =
    args.find((a) => a.startsWith('--format='))?.split('=')[1] ??
    (args.includes('--format') ? args[args.indexOf('--format') + 1] : null);
  const scriptIds = args.filter((a) => !a.startsWith('--'));

  await mkdir(OUTPUT_DIR, { recursive: true });

  // Determine which scripts to render
  let landscapeToRender: LandscapeScript[] = [];
  let multiPhoneToRender: MultiPhoneScript[] = [];

  if (scriptIds.length > 0) {
    for (const id of scriptIds) {
      const script = getShowcaseScript(id);
      if (!script) {
        console.error(`No showcase script found for: ${id}`);
        continue;
      }
      if (script.format === 'landscape') {
        landscapeToRender.push(script as LandscapeScript);
      } else if (script.format === 'multiphone') {
        multiPhoneToRender.push(script as MultiPhoneScript);
      }
    }
  } else {
    // Render all based on format filter
    if (!formatFilter || formatFilter === 'landscape') {
      landscapeToRender = LANDSCAPE_SCRIPTS;
    }
    if (!formatFilter || formatFilter === 'multiphone') {
      // Only render animated multiphone videos here — use compose:static for stills
      multiPhoneToRender = MULTI_PHONE_SCRIPTS.filter((s) => s.animate);
    }
  }

  const total = landscapeToRender.length + multiPhoneToRender.length;

  console.log('\nCinematic Video Composer');
  console.log('='.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(
    `Quality: ${preview ? 'preview (CRF 28)' : 'production (CRF 18)'}`,
  );
  console.log(`Videos to render: ${total}\n`);

  let success = 0;
  let failed = 0;

  for (const script of landscapeToRender) {
    console.log(`\n[landscape] ${script.id} — ${script.title}`);
    try {
      await renderLandscape(script, { preview });
      success++;
    } catch (err) {
      console.error(`   Failed:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  for (const script of multiPhoneToRender) {
    console.log(`\n[multiphone] ${script.id} — ${script.title}`);
    try {
      await renderMultiPhone(script, { preview });
      success++;
    } catch (err) {
      console.error(`   Failed:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Success: ${success}  Failed: ${failed}`);

  if (success > 0) {
    console.log(`\nOutput: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('   1. Preview: open public/marketing/final/ in Finder');
    console.log('   2. X/Twitter: post as native video (1920×1080)');
    console.log('   3. YouTube: upload directly');
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
