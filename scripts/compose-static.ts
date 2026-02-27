/**
 * Static Marketing Shot Exporter
 *
 * Exports PNG marketing images from Remotion compositions using renderStill().
 * At frame 0 all phone content is seeked to the target moment — no animation
 * noise, clean production shot.
 *
 * Usage:
 *   pnpm compose:static                     # All static shots
 *   pnpm compose:static multi-phone-hero    # Single shot
 *
 * Output: public/marketing/*.png
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { mkdir } from 'fs/promises';
import {
  MULTI_PHONE_SCRIPTS,
  LANDSCAPE_SCRIPTS,
  getShowcaseScript,
  type LandscapeScript,
  type MultiPhoneScript,
} from '../src/lib/video/showcase-scripts';
import { renderCinematicStill } from '../src/lib/video/cinematic-renderer';

const OUTPUT_DIR = join(process.cwd(), 'public', 'marketing');

// ============================================================================
// Export a MultiPhoneShowcase still
// ============================================================================

async function exportMultiPhoneStill(script: MultiPhoneScript): Promise<void> {
  // script.id is a hardcoded enum value from showcase-scripts.ts — not user input
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const outputPath = join(OUTPUT_DIR, `${script.id}.png`);

  console.log(
    `   Phones: ${script.phones.length}, layout: ${script.layout ?? 'row'}`,
  );
  console.log(`   Background: ${script.backgroundType ?? 'starfield'}`);

  await renderCinematicStill({
    format: 'MultiPhoneShowcase',
    inputProps: {
      phones: script.phones,
      layout: script.layout,
      backgroundType: script.backgroundType,
      animate: false,
      title: script.heading,
      subtitle: script.subheading,
      seed: script.id,
    },
    outputPath,
    frame: 0,
  });

  console.log(`   Done: ${script.id}.png`);
}

// ============================================================================
// Export a LandscapeShowcase still (first scene, frame 0)
// ============================================================================

async function exportLandscapeStill(script: LandscapeScript): Promise<void> {
  // script.id is a hardcoded enum value from showcase-scripts.ts — not user input
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  const outputPath = join(OUTPUT_DIR, `${script.id}-poster.png`);

  console.log(`   Scenes: ${script.scenes.length}`);

  await renderCinematicStill({
    format: 'LandscapeShowcase',
    inputProps: {
      scenes: script.scenes,
      backgroundType: script.backgroundType,
      seed: script.id,
    },
    outputPath,
    frame: 0,
  });

  console.log(`   Done: ${script.id}-poster.png`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const scriptIds = args.filter((a) => !a.startsWith('--'));

  await mkdir(OUTPUT_DIR, { recursive: true });

  // Determine which shots to export
  const multiPhoneTargets: MultiPhoneScript[] = [];
  const landscapeTargets: LandscapeScript[] = [];

  if (scriptIds.length > 0) {
    for (const id of scriptIds) {
      const script = getShowcaseScript(id);
      if (!script) {
        console.error(`No showcase script found for: ${id}`);
        continue;
      }
      if (script.format === 'multiphone') {
        multiPhoneTargets.push(script as MultiPhoneScript);
      } else if (script.format === 'landscape') {
        landscapeTargets.push(script as LandscapeScript);
      }
    }
  } else {
    // Export all static shots (multiphone scripts without animate, landscape posters)
    multiPhoneTargets.push(...MULTI_PHONE_SCRIPTS.filter((s) => !s.animate));
    // Export a poster frame for every landscape script
    landscapeTargets.push(...LANDSCAPE_SCRIPTS);
  }

  const total = multiPhoneTargets.length + landscapeTargets.length;

  console.log('\nStatic Marketing Shot Exporter');
  console.log('='.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Shots to export: ${total}\n`);

  let success = 0;
  let failed = 0;

  for (const script of multiPhoneTargets) {
    console.log(`\n[multiphone-still] ${script.id}`);
    try {
      await exportMultiPhoneStill(script);
      success++;
    } catch (err) {
      console.error(`   Failed:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  for (const script of landscapeTargets) {
    console.log(`\n[landscape-poster] ${script.id}`);
    try {
      await exportLandscapeStill(script);
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
    console.log('\nFiles:');
    multiPhoneTargets.forEach((s) =>
      console.log(`   ${s.id}.png — multi-phone hero (1920×1080 PNG)`),
    );
    landscapeTargets.forEach((s) =>
      console.log(`   ${s.id}-poster.png — landscape poster frame`),
    );
    console.log('\nNext steps:');
    console.log('   1. Drop multi-phone-hero.png into Lunary website hero');
    console.log('   2. Post to X/Twitter as a standalone image tweet');
    console.log('   3. Use for App Store screenshots or LinkedIn header');
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
