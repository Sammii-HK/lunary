/**
 * App Feature Recorder
 *
 * Uses Playwright to record app features for demo videos
 * Run with: tsx scripts/record-app-features.ts [feature-id]
 *
 * Required environment variables:
 * - PERSONA_EMAIL: Email for test account authentication
 * - PERSONA_PASSWORD: Password for test account authentication
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { chromium, type Page, type BrowserContext } from '@playwright/test';
import { mkdir, rename } from 'fs/promises';
import { join } from 'path';
import {
  getFeatureRecording,
  getAllFeatureIds,
  type RecordingStep,
} from '../src/lib/video/app-feature-recordings';

const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PERSONA_EMAIL = process.env.PERSONA_EMAIL;
const PERSONA_PASSWORD = process.env.PERSONA_PASSWORD;

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  if (!PERSONA_EMAIL) {
    throw new Error(
      'Missing PERSONA_EMAIL environment variable. Add it to .env.local',
    );
  }
  if (!PERSONA_PASSWORD) {
    throw new Error(
      'Missing PERSONA_PASSWORD environment variable. Add it to .env.local',
    );
  }
}

/**
 * Handle cookie consent before any navigation
 */
async function handleCookieConsent(page: Page): Promise<void> {
  console.log(`   Handling cookie consent...`);

  // Navigate to home page first to trigger cookie popup
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Try to dismiss cookie popup
  try {
    const cookieButton = page.locator(
      '[data-testid="accept-all-cookies"], button:has-text("Accept"), button:has-text("OK"), button:has-text("Got it"), button:has-text("Allow")',
    );
    await cookieButton.click({ timeout: 3000 });
    await page.waitForTimeout(500);
    console.log(`   ✓ Accepted cookies`);
  } catch {
    // No cookie popup found, set localStorage flags as backup
    await page.evaluate(() => {
      localStorage.setItem('cookies-accepted', 'true');
      localStorage.setItem('cookie-consent', 'accepted');
      localStorage.setItem('cookieConsent', 'true');
    });
    console.log(`   ✓ Set cookie consent flags`);
  }
}

/**
 * Authenticate using persona credentials
 */
async function authenticate(page: Page): Promise<void> {
  console.log(`   Authenticating as: ${PERSONA_EMAIL}`);

  // Navigate to auth page
  await page.goto(BASE_URL + '/auth?login=true', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Fill in email and password
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator(
    'input[type="password"], input[name="password"]',
  );

  await emailInput.fill(PERSONA_EMAIL!);
  await page.waitForTimeout(300);
  await passwordInput.fill(PERSONA_PASSWORD!);
  await page.waitForTimeout(300);

  // Click login button
  const loginButton = page.locator(
    'button:has-text("Log in"), button:has-text("Sign in"), button[type="submit"]',
  );
  await loginButton.click();

  // Wait for authentication to complete (redirects to /app)
  await page.waitForURL((url) => url.pathname === '/app', {
    timeout: 10000,
  });
  await page.waitForTimeout(2000); // Let dashboard load completely

  // Verify we're on the actual app, not the marketing page
  const currentPath = new URL(page.url()).pathname;
  if (currentPath === '/' || currentPath === '') {
    throw new Error(
      'Authentication did not redirect to /app - still on marketing page',
    );
  }

  console.log(`   ✓ Authenticated successfully at ${currentPath}`);
}

/**
 * Execute a single recording step
 */
async function executeStep(page: Page, step: RecordingStep): Promise<void> {
  const stepDesc = step.description || step.type;
  console.log(`  ▸ ${stepDesc}`);

  try {
    switch (step.type) {
      case 'navigate':
        if (step.url) {
          await page.goto(BASE_URL + step.url, { waitUntil: 'networkidle' });
          console.log(`    ✓ Navigated`);
        }
        break;

      case 'pressKey':
        if ((step as any).key) {
          await page.keyboard.press((step as any).key);
          await page.waitForTimeout(500);
          console.log(`    ✓ Pressed ${(step as any).key}`);
        }
        break;

      case 'click':
        if (step.selector) {
          try {
            // Use shorter timeout for optional clicks
            const timeout = (step as any).optional ? 2000 : 30000;
            const force = (step as any).force || false;
            await page.click(step.selector, { timeout, force });
            await page.waitForTimeout(500); // Let click animation finish
            console.log(`    ✓ Clicked`);
          } catch (error) {
            // If optional and not found, just continue
            if ((step as any).optional) {
              console.log(`    ⊘ Optional click skipped (element not found)`);
            } else {
              console.error(`    ✗ Click failed:`, error);
              throw error;
            }
          }
        }
        break;

      case 'type':
        if (step.selector && step.text) {
          await page.fill(step.selector, step.text);
          await page.waitForTimeout(300);
          console.log(`    ✓ Typed text`);
        }
        break;

      case 'hover':
        if (step.selector) {
          await page.hover(step.selector);
          await page.waitForTimeout(500);
          console.log(`    ✓ Hovered`);
        }
        break;

      case 'scroll':
        if (step.distance) {
          // Find the scrollable element and perform slow, human-like scroll
          const scrolled = await page.evaluate(async (distance) => {
            // Try to find the main scrollable container
            const scrollableDiv = document.querySelector(
              'div[class*="overflow-y-auto"], div[class*="overflow-auto"]',
            );
            const mainElement = document.querySelector('main');

            let scrollContainer: Element | Window = window;

            if (
              scrollableDiv &&
              scrollableDiv.scrollHeight > scrollableDiv.clientHeight
            ) {
              scrollContainer = scrollableDiv;
            } else if (
              mainElement &&
              mainElement.scrollHeight > mainElement.clientHeight
            ) {
              scrollContainer = mainElement;
            }

            // Get starting position
            const startScroll =
              scrollContainer instanceof Element
                ? scrollContainer.scrollTop
                : window.scrollY;

            // Perform slow, incremental scroll for human-like effect
            const steps = Math.ceil(distance / 80); // Scroll 80px per step
            const stepDistance = distance / steps;
            const stepDelay = 150; // 150ms between steps

            for (let i = 0; i < steps; i++) {
              if (scrollContainer instanceof Element) {
                scrollContainer.scrollBy({
                  top: stepDistance,
                  behavior: 'smooth',
                });
              } else {
                window.scrollBy({ top: stepDistance, behavior: 'smooth' });
              }
              await new Promise((resolve) => setTimeout(resolve, stepDelay));
            }

            return `scrolled element (from ${startScroll}px)`;
          }, step.distance);

          await page.waitForTimeout(800); // Final pause after scroll completes
          console.log(`    ✓ Scrolled ${step.distance}px (${scrolled})`);
        }
        break;

      case 'wait':
        if (step.duration) {
          await page.waitForTimeout(step.duration);
          console.log(`    ✓ Waited ${step.duration}ms`);
        }
        break;

      case 'screenshot':
        // Useful for debugging, not used in video
        await page.screenshot({ path: 'debug-screenshot.png' });
        console.log(`    ✓ Screenshot saved`);
        break;

      default:
        console.warn(`  ⚠️  Unknown step type: ${(step as any).type}`);
    }
  } catch (error) {
    console.error(`    ✗ Step failed:`, error);
    throw error;
  }
}

/**
 * Record a single feature (with auth)
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
    viewport: config.viewport || { width: 390, height: 844 }, // iPhone 12 Pro dimensions
    recordVideo: {
      dir: OUTPUT_DIR,
      size: config.viewport || { width: 390, height: 844 },
    },
    // Simulate iPhone 12 Pro for app-like experience
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 3, // iPhone 12 Pro has 3x pixel density
  });

  const page = await context.newPage();

  try {
    // Handle cookies FIRST, before auth
    await handleCookieConsent(page);

    // Then authenticate
    await authenticate(page);

    // Record the feature
    return await recordFeatureSteps(page, context, browser, config, featureId);
  } catch (error) {
    console.error(`   ✗ Error during recording:`, error);
    throw error;
  } finally {
    // Always close browser
    await browser.close();
  }
}

/**
 * Record feature steps (used by both single and suite mode)
 */
async function recordFeatureSteps(
  page: Page,
  context: BrowserContext,
  browser: any,
  config: any,
  featureId: string,
): Promise<string> {
  try {
    // Navigate to starting URL if not already there
    const currentUrl = page.url();
    const currentPath = new URL(currentUrl).pathname;
    const targetUrl = BASE_URL + config.startUrl;

    // Safety check: ensure we're not on the marketing page root
    if (currentPath === '/' || currentPath === '') {
      console.log(`   Warning: On marketing page, navigating to app...`);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000); // Extra time for React hydration
    } else if (!currentUrl.includes(config.startUrl)) {
      console.log(`   Loading: ${targetUrl}`);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000); // Extra time for React hydration
    } else {
      console.log(`   Already at: ${targetUrl}`);
      await page.waitForTimeout(2000); // Let page settle
    }

    // Dismiss cookie popup if present (for suite mode where each page might show it)
    try {
      const cookieButton = page.locator('[data-testid="accept-all-cookies"]');
      await cookieButton.click({ timeout: 2000 });
      await page.waitForTimeout(1000); // Wait for popup to fully dismiss
      console.log(`   ✓ Dismissed cookie popup`);
    } catch {
      // No cookie popup found, continue
    }

    // Extra wait to ensure page is fully interactive
    await page.waitForTimeout(2000);
    console.log(`   ✓ Page ready for recording`);

    // Execute all recording steps
    for (const step of config.steps) {
      await executeStep(page, step);
    }

    // Add final pause to ensure all interactions are captured
    console.log(`   ⏸  Final pause before saving...`);
    await page.waitForTimeout(3000);

    console.log(`   ✓ Recording complete`);

    // Get video path before closing
    const videoPath = await page.video()?.path();
    if (!videoPath) {
      throw new Error('Video path not found');
    }

    // Close context to finalize video recording
    await context.close();

    // Rename video from hash to feature ID
    const finalPath = join(OUTPUT_DIR, `${featureId}.webm`);
    await rename(videoPath, finalPath);
    console.log(`   📹 Saved: ${finalPath}`);
    return finalPath;
  } catch (error) {
    throw error;
  }
}

/**
 * Record multiple features in suite mode (login once, record all)
 */
async function recordSuite(
  featureIds: string[],
): Promise<Record<string, string>> {
  console.log(
    `\n🎬 Suite Mode: Recording ${featureIds.length} features with single login\n`,
  );

  // Launch browser once
  const browser = await chromium.launch({
    headless: true,
  });

  const results: Record<string, string> = {};

  try {
    // Create initial context for authentication
    const authContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      deviceScaleFactor: 3,
    });

    const authPage = await authContext.newPage();

    // Handle cookies and authenticate ONCE
    console.log('🔐 Authenticating once for all recordings...');
    await handleCookieConsent(authPage);
    await authenticate(authPage);
    console.log('✓ Authentication complete\n');

    // Save auth state
    const storage = await authContext.storageState();
    await authContext.close();

    // Record each feature with the saved auth state
    for (const featureId of featureIds) {
      const config = getFeatureRecording(featureId);

      console.log(`\n🎬 Recording: ${config.name}`);
      console.log(`   Duration: ${config.durationSeconds}s`);
      console.log(`   Steps: ${config.steps.length}`);

      // Create new context with saved auth
      const context = await browser.newContext({
        viewport: config.viewport || { width: 390, height: 844 },
        recordVideo: {
          dir: OUTPUT_DIR,
          size: config.viewport || { width: 390, height: 844 },
        },
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        deviceScaleFactor: 3,
        storageState: storage, // Reuse auth state
      });

      const page = await context.newPage();

      try {
        const videoPath = await recordFeatureSteps(
          page,
          context,
          browser,
          config,
          featureId,
        );
        results[featureId] = videoPath;
      } catch (error) {
        console.error(`\n❌ Failed to record ${featureId}:`, error);
      }
    }
  } finally {
    await browser.close();
  }

  return results;
}

/**
 * Record all features or a specific one
 */
async function main() {
  // Validate environment variables
  validateEnvironment();

  const args = process.argv.slice(2);
  const useSuiteMode = args.includes('--suite');
  const featureArgs = args.filter((arg) => !arg.startsWith('--'));
  const targetFeatures = featureArgs.length > 0 ? featureArgs : null;

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('🎥 App Feature Recorder');
  console.log('━'.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Persona: ${PERSONA_EMAIL}`);
  console.log(
    `Mode: ${useSuiteMode || (targetFeatures && targetFeatures.length > 1) ? 'Suite (login once)' : 'Single'}`,
  );

  // Determine which features to record
  const featuresToRecord = targetFeatures || getAllFeatureIds();

  console.log(`\nRecording ${featuresToRecord.length} feature(s)...`);

  const results: Record<string, string> = {};
  let successCount = 0;
  let failCount = 0;

  // Use suite mode if flag is present OR multiple features are specified
  if (useSuiteMode || featuresToRecord.length > 1) {
    const suiteResults = await recordSuite(featuresToRecord);
    for (const [featureId, videoPath] of Object.entries(suiteResults)) {
      if (videoPath) {
        results[featureId] = videoPath;
        successCount++;
      } else {
        failCount++;
      }
    }
  } else {
    // Single feature mode (original behavior)
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
