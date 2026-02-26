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

import { chromium, type Page } from '@playwright/test';
import { mkdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { execFileSync, spawnSync } from 'child_process';
import {
  getFeatureRecording,
  getAllFeatureIds,
  type RecordingStep,
  type FeatureRecordingConfig,
} from '../src/lib/video/app-feature-recordings';
import {
  getAppStoreRecording,
  getAllAppStoreIds,
} from '../src/lib/video/app-store-recordings';

const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PERSONA_EMAIL = process.env.PERSONA_EMAIL;
const PERSONA_PASSWORD = process.env.PERSONA_PASSWORD;

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD_UA =
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

interface DeviceProfile {
  name: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  outputWidth: number;
  outputHeight: number;
  outputDir: string;
  userAgent: string;
}

const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  // Default: TikTok-style (existing behaviour, WebM upscaled to 1080×1920)
  tiktok: {
    name: 'TikTok (1080×1920)',
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 3,
    outputWidth: 1080,
    outputHeight: 1920,
    outputDir: OUTPUT_DIR,
    userAgent: IPHONE_UA,
  },
  // App Store — iPhone 6.5" (886×1920, required slot)
  iphone65: {
    name: 'iPhone App Store (886×1920)',
    viewport: { width: 414, height: 896 },
    deviceScaleFactor: 3,
    outputWidth: 886,
    outputHeight: 1920,
    outputDir: join(OUTPUT_DIR, 'iphone-6.5'),
    userAgent: IPHONE_UA,
  },
  // App Store — iPad Pro 13" (1200×1600)
  ipad: {
    name: 'iPad Pro App Store (1200×1600)',
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
    outputWidth: 1200,
    outputHeight: 1600,
    outputDir: join(OUTPUT_DIR, 'ipad-pro-13'),
    userAgent: IPAD_UA,
  },
};

/**
 * Validate required environment variables
 */
function validateEnvironment(needsAuth: boolean): void {
  if (!needsAuth) return;
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
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1000);

  // Set the cookie_consent key that CookieConsent.tsx checks (localStorage + cookie)
  try {
    await page.evaluate(() => {
      const payload = JSON.stringify({
        version: 1,
        preferences: {
          essential: true,
          analytics: true,
          timestamp: Date.now(),
        },
      });
      localStorage.setItem('cookie_consent', payload);
      document.cookie = `cookie_consent=${encodeURIComponent(payload)}; max-age=31536000; path=/; SameSite=Lax`;
      // Dismiss PWA install banner (localStorage + cookie)
      localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
      document.cookie = `pwa_banner_dismissed=${Date.now()}; max-age=31536000; path=/; SameSite=Lax`;
      // Dismiss notification prompt (localStorage + cookie)
      localStorage.setItem('pwa_notifications_prompted', '1');
      document.cookie = `pwa_notifications_prompted=1; max-age=31536000; path=/; SameSite=Lax`;
      // Dismiss all zodiac season banners (localStorage + cookie)
      const signs = [
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn',
        'Aquarius',
        'Pisces',
      ];
      for (const sign of signs) {
        const key = `season-banner-dismissed-${sign}`;
        localStorage.setItem(key, '1');
        document.cookie = `${key}=1; max-age=31536000; path=/; SameSite=Lax`;
      }
    });
    console.log(`   ✓ Cookie consent set`);
  } catch {
    // Page may be navigating, try clicking the popup instead
    try {
      const cookieButton = page.locator('[data-testid="accept-all-cookies"]');
      await cookieButton.click({ timeout: 3000 });
      await page.waitForTimeout(1000);
      console.log(`   ✓ Accepted cookies via popup`);
    } catch {
      console.log(`   ⊘ No cookie popup found`);
    }
  }
}

/**
 * Authenticate using persona credentials (with retry)
 */
async function authenticate(page: Page, attempt = 1): Promise<void> {
  console.log(
    `   Authenticating as: ${PERSONA_EMAIL}${attempt > 1 ? ` (attempt ${attempt})` : ''}`,
  );

  // Navigate to auth page
  await page.goto(BASE_URL + '/auth', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // Wait for either the login form to appear OR a redirect to /app (already authed)
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  try {
    await Promise.race([
      emailInput.waitFor({ state: 'visible', timeout: 10000 }),
      page.waitForURL((url) => url.pathname === '/app', { timeout: 10000 }),
    ]);
  } catch {
    // Fallback: wait a bit more for slow hydration
    await page.waitForTimeout(3000);
  }

  // If already redirected to /app, we're authenticated
  const currentUrl = new URL(page.url()).pathname;
  if (currentUrl === '/app' || currentUrl.startsWith('/app')) {
    console.log(`   ✓ Already authenticated at ${currentUrl}`);
    return;
  }

  // Fill in email and password
  const passwordInput = page.locator(
    'input[type="password"], input[name="password"]',
  );

  await emailInput.fill(PERSONA_EMAIL!);
  await page.waitForTimeout(300);
  await passwordInput.fill(PERSONA_PASSWORD!);
  await page.waitForTimeout(300);

  // Click login button
  const loginButton = page.locator(
    'button:has-text("Sign In"), button:has-text("Log in"), button[type="submit"]',
  );
  await loginButton.click();

  // Wait for authentication to complete (redirects to /app)
  try {
    await page.waitForURL((url) => url.pathname === '/app', {
      timeout: 15000,
    });
  } catch {
    // Check if we ended up on /app despite the timeout
    const afterUrl = new URL(page.url()).pathname;
    if (afterUrl === '/app' || afterUrl.startsWith('/app')) {
      console.log(`   ✓ Authenticated (late redirect) at ${afterUrl}`);
      return;
    }
    if (attempt < 3) {
      console.log(`   ⚠ Auth redirect timed out, retrying...`);
      return authenticate(page, attempt + 1);
    }
    throw new Error(
      'Authentication timed out after 3 attempts — /app redirect never happened',
    );
  }
  await page.waitForTimeout(2000); // Let dashboard load completely

  const finalPath = new URL(page.url()).pathname;
  console.log(`   ✓ Authenticated successfully at ${finalPath}`);
}

/**
 * Scroll an element to the center of the viewport.
 * Walks up the DOM from the element to find the nearest scrollable ancestor
 * (works for any tag: <main>, <div>, <section>, etc.).
 * Places the element's center at ~40% from viewport top to leave room for subtitles.
 */
async function scrollElementToCenter(
  page: Page,
  selector: string,
): Promise<void> {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'attached', timeout: 20000 });
  await locator.evaluate((el) => {
    // Walk up DOM to find nearest scrollable ancestor
    let scrollParent: Element | null = null;
    let current = el.parentElement;
    while (current) {
      const style = window.getComputedStyle(current);
      if (
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        current.scrollHeight > current.clientHeight
      ) {
        scrollParent = current;
        break;
      }
      current = current.parentElement;
    }
    if (!scrollParent) return;

    const rect = el.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const viewportTarget = window.innerHeight * 0.33; // 33% from top
    scrollParent.scrollBy({
      top: elementCenter - viewportTarget,
      behavior: 'smooth',
    });
  });
  await page.waitForTimeout(1000); // let smooth scroll complete
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
          // Prefer SPA navigation (click a link) over page.goto() to avoid
          // full page reloads that show dark auth/loading screens for seconds.
          // We look for links in the nav bar or anywhere on the page that
          // point to the target path.
          const spaNav = await page
            .evaluate((targetPath: string) => {
              // Try exact href match, then endsWith for relative paths
              const selectors = [
                `a[href="${targetPath}"]`,
                `a[href$="${targetPath}"]`,
              ];
              for (const sel of selectors) {
                const link = document.querySelector(
                  sel,
                ) as HTMLAnchorElement | null;
                if (link) {
                  link.click();
                  return true;
                }
              }
              // Try matching by pathname in all links
              const allLinks = document.querySelectorAll('a[href]');
              for (const a of allLinks) {
                try {
                  const href = (a as HTMLAnchorElement).href;
                  const url = new URL(href, window.location.origin);
                  if (url.pathname === targetPath) {
                    (a as HTMLAnchorElement).click();
                    return true;
                  }
                } catch {
                  // invalid URL, skip
                }
              }
              return false;
            }, step.url)
            .catch(() => false);

          if (spaNav) {
            // SPA transition — wait for content to settle
            try {
              await page.waitForLoadState('networkidle', { timeout: 5000 });
            } catch {
              /* fine */
            }
            await page.waitForTimeout(1000);
          } else {
            // No matching link found — fall back to full navigation
            await page.goto(BASE_URL + step.url, {
              waitUntil: 'domcontentloaded',
            });
            try {
              await page.waitForLoadState('networkidle', { timeout: 5000 });
            } catch {
              /* fine */
            }
            await page.waitForTimeout(500);
          }
          console.log(`    ✓ Navigated${spaNav ? ' (SPA)' : ''}`);
        }
        break;

      case 'pressKey':
        if (step.key) {
          await page.keyboard.press(step.key);
          await page.waitForTimeout(500);
          console.log(`    ✓ Pressed ${step.key}`);
        }
        break;

      case 'click':
        if (step.selector) {
          try {
            const timeout = step.optional ? 15000 : 30000;
            const force = step.force || false;
            const urlBefore = page.url();
            await page.click(step.selector, { timeout, force });
            await page.waitForTimeout(500);
            // If click caused a navigation, wait for new page to settle
            const urlAfter = page.url();
            if (urlAfter !== urlBefore) {
              try {
                await page.waitForLoadState('networkidle', { timeout: 8000 });
              } catch {
                /* fine */
              }
              await page.waitForTimeout(500);
            }
            console.log(`    ✓ Clicked`);
          } catch (error) {
            if (step.optional) {
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
          // Click the input first to focus it (force in case of overlapping elements)
          await page.click(step.selector, { timeout: 5000, force: true });
          await page.waitForTimeout(200);
          // Type character by character for a natural typing effect
          await page.keyboard.type(step.text, { delay: 80 });
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
        if (step.scrollTo) {
          try {
            await scrollElementToCenter(page, step.scrollTo);
            console.log(`    ✓ Scrolled to center: ${step.scrollTo}`);
          } catch (e) {
            console.log(
              `    ⚠ Could not scroll to: ${step.scrollTo} (${(e as Error).message})`,
            );
          }
        } else if (step.distance) {
          // Find the scrollable element and perform slow, human-like scroll
          const scrolled = await page.evaluate(
            async ({ distance, containerSelector }) => {
              // If a specific container selector is provided, use it
              let scrollContainer: Element | Window = window;

              if (containerSelector) {
                const target = document.querySelector(containerSelector);
                if (target && target.scrollHeight > target.clientHeight) {
                  scrollContainer = target;
                }
              } else {
                // Try to find the main scrollable container
                const scrollableDiv = document.querySelector(
                  'div[class*="overflow-y-auto"], div[class*="overflow-auto"]',
                );
                const mainElement = document.querySelector('main');

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
              }

              // Get starting position
              const startScroll =
                scrollContainer instanceof Element
                  ? scrollContainer.scrollTop
                  : window.scrollY;

              // Perform slow, incremental scroll for human-like effect
              const steps = Math.ceil(Math.abs(distance) / 80); // Scroll 80px per step
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

              const containerName = containerSelector || 'page';
              return `scrolled ${containerName} (from ${startScroll}px)`;
            },
            {
              distance: step.distance,
              containerSelector: step.scrollContainer,
            },
          );

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
 * Convert a raw Playwright WebM recording to a device-appropriate MP4.
 * Trims the pre-roll, scales to device output dimensions, and encodes as H.264.
 * Returns the path of the output MP4 (or null if ffmpeg is unavailable).
 */
async function convertForDevice(
  webmPath: string,
  mp4Path: string,
  device: DeviceProfile,
  setupDurationSeconds: number,
): Promise<boolean> {
  try {
    let trimStart = setupDurationSeconds;

    // Fall back to blackdetect if no measured setup time
    if (trimStart < 0.5) {
      const result = spawnSync(
        'ffmpeg',
        [
          '-i',
          webmPath,
          '-vf',
          'blackdetect=d=0.1:pix_th=0.10',
          '-an',
          '-f',
          'null',
          '-',
        ],
        { encoding: 'utf-8', timeout: 30000 },
      );
      const detectOutput = (result.stderr || '') + (result.stdout || '');
      for (const match of detectOutput.matchAll(
        /black_start:([\d.]+)\s+black_end:([\d.]+)/g,
      )) {
        const start = parseFloat(match[1]);
        const end = parseFloat(match[2]);
        if (start < 0.5) trimStart = Math.max(trimStart, end);
      }
    }

    const trimArgs = trimStart >= 0.5 ? ['-ss', trimStart.toFixed(2)] : [];
    if (trimStart >= 0.5) {
      console.log(`   ✂ Trimming ${trimStart.toFixed(1)}s pre-roll`);
    }

    console.log(
      `   🔄 Converting to MP4 at ${device.outputWidth}×${device.outputHeight}...`,
    );

    // Single-pass: trim + scale + H.264 encode → MP4
    execFileSync(
      'ffmpeg',
      [
        '-y',
        ...trimArgs,
        '-i',
        webmPath,
        '-vf',
        `scale=${device.outputWidth}:${device.outputHeight}:flags=lanczos,setsar=1`,
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        '20',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-movflags',
        '+faststart',
        mp4Path,
      ],
      { timeout: 300000, stdio: 'pipe' },
    );

    const mp4Stat = await stat(mp4Path);
    if (mp4Stat.size < 1000) {
      console.log(`   ⚠ Output MP4 too small, conversion may have failed`);
      await unlink(mp4Path).catch(() => {});
      return false;
    }

    // Remove the raw WebM
    await unlink(webmPath).catch(() => {});
    console.log(`   ✓ Saved ${device.outputWidth}×${device.outputHeight} MP4`);
    return true;
  } catch (err: any) {
    const msg = err?.stderr?.toString() || err?.message || 'unknown';
    console.log(`   ⚠ ffmpeg conversion failed: ${msg.substring(0, 200)}`);
    return false;
  }
}

/**
 * Setup: handle cookies + auth in a throwaway context (no video).
 * Returns saved storage state for clean recording contexts.
 */
async function setupAuth(
  browser: any,
  needsAuth: boolean,
  device: DeviceProfile,
): Promise<any> {
  const setupContext = await browser.newContext({
    viewport: device.viewport,
    userAgent: device.userAgent,
    deviceScaleFactor: device.deviceScaleFactor,
  });

  const setupPage = await setupContext.newPage();

  await handleCookieConsent(setupPage);
  if (needsAuth) {
    await authenticate(setupPage);
  }

  const storage = await setupContext.storageState();
  await setupContext.close();
  return storage;
}

/**
 * Navigate to target page and wait until fully loaded (no video).
 * Then create a recording context that opens to the already-warm page.
 */
async function recordClean(
  browser: any,
  config: FeatureRecordingConfig,
  storage: any,
  featureId: string,
  device: DeviceProfile,
): Promise<string> {
  // Always use the device viewport for App Store profiles; config.viewport is TikTok-specific
  const viewport = device.viewport;
  const targetUrl = BASE_URL + config.startUrl;

  // 1. Warm-up: open the target page in a non-recording context so it's cached
  const warmupContext = await browser.newContext({
    viewport,
    userAgent: device.userAgent,
    deviceScaleFactor: device.deviceScaleFactor,
    storageState: storage,
  });
  const warmupPage = await warmupContext.newPage();
  console.log(`   Warming up: ${targetUrl}`);
  await warmupPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  // Wait for auth check + API calls to complete
  try {
    await warmupPage.waitForLoadState('networkidle', { timeout: 15000 });
  } catch {
    // Fine if it times out
  }
  // Wait for content to appear (past "checking auth" screen)
  try {
    await warmupPage.waitForSelector('main h1, main h2, [data-testid], nav', {
      state: 'visible',
      timeout: 10000,
    });
  } catch {
    // Fallback
  }
  await warmupPage.waitForTimeout(1000);
  // Save the updated storage (cookies from this page visit)
  const warmedStorage = await warmupContext.storageState();
  await warmupContext.close();

  // 2. Record: fresh context with video — page loads fast from cache/state
  // Playwright video capture operates at CSS pixel dimensions; we upscale
  // to the device's output resolution in post via ffmpeg.
  const recordContext = await browser.newContext({
    viewport,
    recordVideo: { dir: device.outputDir, size: viewport },
    userAgent: device.userAgent,
    deviceScaleFactor: device.deviceScaleFactor,
    storageState: warmedStorage,
  });

  const page = await recordContext.newPage();
  // Track time from recording start to page reveal for precise trimming
  const recordingStartTime = Date.now();

  try {
    // Cloak CSS injected into HTML via route interception.
    // This ensures body is hidden BEFORE the browser's first paint —
    // addInitScript runs JS before page scripts, but the browser can still
    // render HTML before the JS executes, causing a flash.
    const CLOAK_CSS =
      '<style id="__recorder-cloak">html{background:#09090b!important}body{opacity:0!important;transition:opacity .3s ease!important}body.__loaded{opacity:1!important}</style>';

    const cloakHandler = async (route: any) => {
      // Only intercept HTML document requests — let JS/CSS/images pass through
      if (route.request().resourceType() !== 'document') {
        await route.continue();
        return;
      }
      try {
        const response = await route.fetch({ timeout: 60000 });
        let body = await response.text();
        body = body.replace('<head>', '<head>' + CLOAK_CSS);
        await route.fulfill({ response, body });
      } catch {
        // If fetch times out, continue without cloaking
        await route.continue();
      }
    };
    await page.route('**/*', cloakHandler);

    // Ensure PWA banner flags are set before React mounts.
    // The warmup context sets these in localStorage too, but the recording
    // context needs them in addInitScript to guarantee they exist before
    // any component useEffect reads them (avoids race conditions).
    await page.addInitScript(() => {
      localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
      localStorage.setItem('pwa_notifications_prompted', '1');
      localStorage.setItem('lunary_referral_onboarding_shown', '1');
      sessionStorage.setItem('testimonial-handled', '1');
      // Dismiss all zodiac season banners permanently
      const signs = [
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn',
        'Aquarius',
        'Pisces',
      ];
      for (const sign of signs) {
        localStorage.setItem(`season-banner-dismissed-${sign}`, '1');
      }
    });

    // Touch cursor ripple — visual tap feedback for TikTok demo
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `@keyframes tap-ripple {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }`;
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(style);
      });
      document.addEventListener('pointerdown', (e) => {
        const ripple = document.createElement('div');
        Object.assign(ripple.style, {
          position: 'fixed',
          left: `${e.clientX - 20}px`,
          top: `${e.clientY - 20}px`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
          border: '2px solid rgba(255,255,255,0.6)',
          pointerEvents: 'none',
          zIndex: '99999',
          animation: 'tap-ripple 0.4s ease-out forwards',
        });
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });
    });

    // Navigate to target — auth state is in storage, warmup primed the session
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // Wait for the page to be fully loaded behind the cloak
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      // Some pages have persistent connections, that's fine
    }
    try {
      await page.waitForSelector('main h1, main h2, [data-testid], nav', {
        state: 'attached',
        timeout: 10000,
      });
    } catch {
      // Fallback: page structure may differ
    }
    // Wait for rendering to complete behind the cloak (images, fonts, animations).
    // Data-dependent components (SkyNowCard, etc.) can take 5-15s on cold dev server.
    await page.waitForTimeout(3000);

    // Wait for key dashboard components to mount (data-dependent widgets)
    await page
      .waitForSelector('[data-testid="sky-now-widget"]', {
        state: 'attached',
        timeout: 15000,
      })
      .catch(() => {});

    // Reveal: fade in the fully-loaded page
    await page.evaluate(() => {
      document.body.classList.add('__loaded');
    });
    await page.waitForTimeout(400); // Let the 0.3s fade-in complete

    // Stop injecting cloak CSS on subsequent navigations — only the
    // initial page load needed it. Mid-video page transitions should
    // show the app's natural loading state, not black.
    await page.unroute('**/*', cloakHandler);

    // Measure how long the setup took — this is the pre-roll to trim
    const setupDurationMs = Date.now() - recordingStartTime;
    const setupDurationSeconds = setupDurationMs / 1000;

    const landedUrl = new URL(page.url()).pathname;
    console.log(
      `   ✓ Page ready at: ${landedUrl} (setup: ${setupDurationSeconds.toFixed(1)}s)`,
    );

    // Execute all recording steps
    for (const step of config.steps) {
      await executeStep(page, step);
    }

    // Final pause to capture last interactions
    console.log(`   ⏸  Final pause before saving...`);
    await page.waitForTimeout(2000);
    console.log(`   ✓ Recording complete`);

    // Finalize: close context → save → convert (trim + scale + MP4 encode)
    const webmPath = join(device.outputDir, `${featureId}.webm`);
    const mp4Path = join(device.outputDir, `${featureId}.mp4`);
    const rawVideoPath = await page.video()?.path();
    await recordContext.close();
    await page.video()?.saveAs(webmPath);
    if (rawVideoPath && rawVideoPath !== webmPath) {
      await unlink(rawVideoPath).catch(() => {});
    }
    // Trim pre-roll + scale to device dimensions + encode as MP4
    const ok = await convertForDevice(
      webmPath,
      mp4Path,
      device,
      setupDurationSeconds,
    );
    const outputPath = ok ? mp4Path : webmPath;
    console.log(
      `   📹 ${featureId}.${ok ? 'mp4' : 'webm'} (${device.outputWidth}×${device.outputHeight})`,
    );

    return outputPath;
  } catch (error) {
    await recordContext.close().catch(() => {});
    throw error;
  }
}

/**
 * Record a single feature
 */
async function recordFeature(
  featureId: string,
  device: DeviceProfile,
  appStore = false,
): Promise<string> {
  const config = appStore
    ? getAppStoreRecording(featureId)
    : getFeatureRecording(featureId);

  console.log(`\n🎬 Recording: ${config.name} [${device.name}]`);
  console.log(`   Duration: ${config.durationSeconds}s`);
  console.log(`   Steps: ${config.steps.length}`);

  const browser = await chromium.launch({ headless: true });

  try {
    const needsAuth = config.requiresAuth !== false;
    const storage = await setupAuth(browser, needsAuth, device);
    return await recordClean(browser, config, storage, featureId, device);
  } catch (error) {
    console.error(`   ✗ Error during recording:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Record multiple features in suite mode (login once, record all)
 */
async function recordSuite(
  featureIds: string[],
  device: DeviceProfile,
  appStore = false,
): Promise<Record<string, string>> {
  console.log(
    `\n🎬 Suite Mode: Recording ${featureIds.length} features with single login [${device.name}]\n`,
  );

  const configs = featureIds.map((id) =>
    appStore ? getAppStoreRecording(id) : getFeatureRecording(id),
  );
  const needsAuth = configs.some((c) => c.requiresAuth !== false);

  const browser = await chromium.launch({ headless: true });
  const results: Record<string, string> = {};

  try {
    // Setup auth once (no video)
    const storage = await setupAuth(browser, needsAuth, device);

    // Record each feature cleanly
    for (const featureId of featureIds) {
      const config = appStore
        ? getAppStoreRecording(featureId)
        : getFeatureRecording(featureId);

      console.log(`\n🎬 Recording: ${config.name}`);
      console.log(`   Duration: ${config.durationSeconds}s`);
      console.log(`   Steps: ${config.steps.length}`);
      console.log(
        `   Auth: ${config.requiresAuth !== false ? 'yes' : 'no (public)'}`,
      );

      try {
        const videoPath = await recordClean(
          browser,
          config,
          storage,
          featureId,
          device,
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
  const args = process.argv.slice(2);
  const useSuiteMode = args.includes('--suite');

  // --device <tiktok|iphone65|ipad>  (default: tiktok)
  const deviceFlagIdx = args.indexOf('--device');
  const deviceKey = deviceFlagIdx !== -1 ? args[deviceFlagIdx + 1] : 'tiktok';
  const device = DEVICE_PROFILES[deviceKey];
  if (!device) {
    console.error(
      `❌ Unknown device "${deviceKey}". Valid options: ${Object.keys(DEVICE_PROFILES).join(', ')}`,
    );
    process.exit(1);
  }

  // --source <tiktok|appstore>  (default: tiktok)
  const sourceFlagIdx = args.indexOf('--source');
  const source = sourceFlagIdx !== -1 ? args[sourceFlagIdx + 1] : 'tiktok';
  const isAppStore = source === 'appstore';

  const featureArgs = args.filter(
    (arg) => !arg.startsWith('--') && arg !== deviceKey && arg !== source,
  );
  const targetFeatures = featureArgs.length > 0 ? featureArgs : null;

  // Determine which features to record
  const featuresToRecord =
    targetFeatures || (isAppStore ? getAllAppStoreIds() : getAllFeatureIds());

  // Check if any features need auth, validate env vars accordingly
  const configs = featuresToRecord.map((id) =>
    isAppStore ? getAppStoreRecording(id) : getFeatureRecording(id),
  );
  const anyNeedsAuth = configs.some((c) => c.requiresAuth !== false);
  validateEnvironment(anyNeedsAuth);

  // Ensure output directories exist
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(device.outputDir, { recursive: true });

  console.log('🎥 App Feature Recorder');
  console.log('━'.repeat(50));
  console.log(`Device: ${device.name}`);
  console.log(`Output: ${device.outputDir}`);
  console.log(`Base URL: ${BASE_URL}`);
  if (anyNeedsAuth) {
    console.log(`Persona: ${PERSONA_EMAIL}`);
  }
  console.log(
    `Mode: ${useSuiteMode || (targetFeatures && targetFeatures.length > 1) ? 'Suite (login once)' : 'Single'}`,
  );
  console.log(`Source: ${isAppStore ? 'App Store demos' : 'TikTok scripts'}`);

  console.log(`\nRecording ${featuresToRecord.length} feature(s)...`);

  const results: Record<string, string> = {};
  let successCount = 0;
  let failCount = 0;

  // Use suite mode if flag is present OR multiple features are specified
  if (useSuiteMode || featuresToRecord.length > 1) {
    const suiteResults = await recordSuite(
      featuresToRecord,
      device,
      isAppStore,
    );
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
        const videoPath = await recordFeature(featureId, device, isAppStore);
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
  console.log(`\n💡 Output: ${device.outputDir}`);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { recordFeature };
