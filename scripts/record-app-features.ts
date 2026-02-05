/**
 * App Feature Recorder
 *
 * Uses Playwright to record app features for demo videos
 * Run with: tsx scripts/record-app-features.ts [feature-id]
 */

import { chromium, type Page } from '@playwright/test';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  getFeatureRecording,
  getAllFeatureIds,
  type RecordingStep,
} from '../src/lib/video/app-feature-recordings';

const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Execute a single recording step
 */
async function executeStep(page: Page, step: RecordingStep): Promise<void> {
  console.log(`  ▸ ${step.description || step.type}`);

  switch (step.type) {
    case 'navigate':
      if (step.url) {
        await page.goto(BASE_URL + step.url, { waitUntil: 'networkidle' });
      }
      break;

    case 'click':
      if (step.selector) {
        await page.click(step.selector);
        await page.waitForTimeout(500); // Let click animation finish
      }
      break;

    case 'type':
      if (step.selector && step.text) {
        await page.fill(step.selector, step.text);
        await page.waitForTimeout(300);
      }
      break;

    case 'hover':
      if (step.selector) {
        await page.hover(step.selector);
        await page.waitForTimeout(500);
      }
      break;

    case 'scroll':
      if (step.distance) {
        await page.evaluate((distance) => {
          window.scrollBy({ top: distance, behavior: 'smooth' });
        }, step.distance);
        await page.waitForTimeout(1000); // Let scroll animation finish
      }
      break;

    case 'wait':
      if (step.duration) {
        await page.waitForTimeout(step.duration);
      }
      break;

    case 'screenshot':
      // Useful for debugging, not used in video
      await page.screenshot({ path: 'debug-screenshot.png' });
      break;

    default:
      console.warn(`  ⚠️  Unknown step type: ${(step as any).type}`);
  }
}

/**
 * Record a single feature
 */
async function recordFeature(featureId: string): Promise<string> {
  const config = getFeatureRecording(featureId);

  console.log(`\n🎬 Recording: ${config.name}`);
  console.log(`   Duration: ${config.durationSeconds}s`);
  console.log(`   Steps: ${config.steps.length}`);

  // Launch browser with video recording
  const browser = await chromium.launch({
    headless: true, // Set to false to watch recording
  });

  const context = await browser.newContext({
    viewport: config.viewport || { width: 1080, height: 1920 }, // 9:16 for TikTok
    recordVideo: {
      dir: OUTPUT_DIR,
      size: config.viewport || { width: 1080, height: 1920 },
    },
    // Simulate iPhone 12 Pro for app-like experience
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  });

  const page = await context.newPage();

  try {
    // Navigate to starting URL
    console.log(`   Loading: ${BASE_URL}${config.startUrl}`);
    await page.goto(BASE_URL + config.startUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Let initial load settle

    // Execute all recording steps
    for (const step of config.steps) {
      await executeStep(page, step);
    }

    // Add final pause
    await page.waitForTimeout(1000);

    console.log(`   ✓ Recording complete`);
  } catch (error) {
    console.error(`   ✗ Error during recording:`, error);
    throw error;
  } finally {
    // Close context to finalize video
    await context.close();
    await browser.close();
  }

  // Get video path
  const videoPath = await page.video()?.path();
  if (!videoPath) {
    throw new Error('Video path not found');
  }

  // Rename video to feature ID
  const finalPath = join(OUTPUT_DIR, `${featureId}.webm`);
  await writeFile(finalPath, await page.video()!.saveAs(finalPath));

  console.log(`   📹 Saved: ${finalPath}`);
  return finalPath;
}

/**
 * Record all features or a specific one
 */
async function main() {
  const args = process.argv.slice(2);
  const targetFeature = args[0]; // Optional: specific feature ID

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('🎥 App Feature Recorder');
  console.log('━'.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);

  // Determine which features to record
  const featuresToRecord = targetFeature ? [targetFeature] : getAllFeatureIds();

  console.log(`\nRecording ${featuresToRecord.length} feature(s)...`);

  const results: Record<string, string> = {};
  let successCount = 0;
  let failCount = 0;

  for (const featureId of featuresToRecord) {
    try {
      const videoPath = await recordFeature(featureId);
      results[featureId] = videoPath;
      successCount++;
    } catch (error) {
      console.error(`\n❌ Failed to record ${featureId}:`, error);
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('📊 Recording Summary:');
  console.log(`   ✓ Success: ${successCount}`);
  console.log(`   ✗ Failed: ${failCount}`);

  if (successCount > 0) {
    console.log('\n📹 Recorded videos:');
    for (const [id, path] of Object.entries(results)) {
      console.log(`   ${id}: ${path}`);
    }
  }

  if (failCount > 0) {
    console.log(
      '\n⚠️  Some recordings failed. Check errors above and adjust selectors in app-feature-recordings.ts',
    );
    process.exit(1);
  }

  console.log('\n✅ All features recorded successfully!');
  console.log(
    '\n💡 Next steps:',
    '\n   1. Convert .webm to .mp4: pnpm run convert:app-demos',
    '\n   2. Generate demo videos with scripts',
  );
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { recordFeature };
