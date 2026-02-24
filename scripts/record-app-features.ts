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
import { mkdir, unlink, rename, stat } from 'fs/promises';
import { join } from 'path';
import { execFileSync, spawnSync } from 'child_process';
import {
  getFeatureRecording,
  getAllFeatureIds,
  type RecordingStep,
  type FeatureRecordingConfig,
} from '../src/lib/video/app-feature-recordings';

const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PERSONA_EMAIL = process.env.PERSONA_EMAIL;
const PERSONA_PASSWORD = process.env.PERSONA_PASSWORD;

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
 * Trim the pre-roll from a video using ffmpeg.
 * Uses the measured setup duration (time from recording start to page reveal)
 * and falls back to blackdetect via spawnSync for proper stderr capture.
 */
async function trimPreroll(
  videoPath: string,
  setupDurationSeconds?: number,
): Promise<void> {
  try {
    let trimStart = setupDurationSeconds ?? 0;

    // If no measured setup duration, detect black frames
    if (trimStart < 0.5) {
      // Use spawnSync to capture stderr (where blackdetect writes output)
      const result = spawnSync(
        'ffmpeg',
        [
          '-i',
          videoPath,
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
      const blackMatches = detectOutput.matchAll(
        /black_start:([\d.]+)\s+black_end:([\d.]+)/g,
      );
      for (const match of blackMatches) {
        const start = parseFloat(match[1]);
        const end = parseFloat(match[2]);
        if (start < 0.5) {
          trimStart = Math.max(trimStart, end);
        }
      }
    }

    if (trimStart < 0.5) {
      console.log(`   ✂ No significant pre-roll to trim`);
      return;
    }

    console.log(`   ✂ Trimming ${trimStart.toFixed(1)}s pre-roll...`);

    // Trim the video — re-encode to avoid keyframe issues
    const trimmedPath = videoPath.replace('.webm', '.trimmed.webm');
    try {
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-ss',
          trimStart.toFixed(2),
          '-i',
          videoPath,
          '-c:v',
          'libvpx-vp9',
          '-b:v',
          '2M',
          trimmedPath,
        ],
        { timeout: 180000, stdio: 'pipe' },
      );
    } catch (trimErr: any) {
      const errMsg =
        trimErr?.stderr?.toString() || trimErr?.message || 'unknown';
      console.log(`   ⚠ ffmpeg trim failed: ${errMsg.substring(0, 200)}`);
      await unlink(trimmedPath).catch(() => {});
      return;
    }

    // Verify the trimmed file exists and has content before replacing
    try {
      const trimmedStat = await stat(trimmedPath);
      if (trimmedStat.size < 1000) {
        console.log(`   ⚠ Trimmed file too small, keeping original`);
        await unlink(trimmedPath).catch(() => {});
        return;
      }
    } catch {
      console.log(`   ⚠ Trimmed file not created, keeping original`);
      return;
    }

    // Replace original with trimmed version
    await unlink(videoPath);
    await rename(trimmedPath, videoPath);
    console.log(`   ✂ Trimmed ${trimStart.toFixed(1)}s pre-roll`);
  } catch {
    console.log(`   ⚠ Could not trim video (ffmpeg not available or failed)`);
  }
}

/**
 * Upscale video to TikTok resolution (1080x1920) using ffmpeg.
 * Uses lanczos scaling for sharp upscale from 360x640.
 */
async function upscaleToTikTok(videoPath: string): Promise<void> {
  try {
    const upscaledPath = videoPath.replace('.webm', '.upscaled.webm');
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        videoPath,
        '-vf',
        'scale=1080:1920:flags=lanczos',
        '-c:v',
        'libvpx-vp9',
        '-b:v',
        '4M',
        upscaledPath,
      ],
      { timeout: 120000, stdio: 'pipe' },
    );

    // Verify upscaled file
    const upscaledStat = await stat(upscaledPath);
    if (upscaledStat.size < 1000) {
      console.log(`   ⚠ Upscaled file too small, keeping original`);
      await unlink(upscaledPath).catch(() => {});
      return;
    }

    await unlink(videoPath);
    await rename(upscaledPath, videoPath);
    console.log(`   ⬆ Upscaled to 1080x1920`);
  } catch {
    console.log(
      `   ⚠ Could not upscale video (ffmpeg not available or failed)`,
    );
  }
}

/**
 * Setup: handle cookies + auth in a throwaway context (no video).
 * Returns saved storage state for clean recording contexts.
 */
async function setupAuth(browser: any, needsAuth: boolean): Promise<any> {
  const setupContext = await browser.newContext({
    viewport: { width: 360, height: 640 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 3,
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
): Promise<string> {
  const viewport = config.viewport || { width: 360, height: 640 };
  const targetUrl = BASE_URL + config.startUrl;

  // 1. Warm-up: open the target page in a non-recording context so it's cached
  const warmupContext = await browser.newContext({
    viewport,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 3,
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
  // Record at viewport size (390x844), then upscale to 1080x1920 in post.
  // deviceScaleFactor: 3 means internal rendering is crisp (1170x2532),
  // but Playwright video capture operates at CSS pixel dimensions.
  const recordContext = await browser.newContext({
    viewport,
    recordVideo: { dir: OUTPUT_DIR, size: viewport },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceScaleFactor: 3,
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

    // Finalize: close context → save → trim → clean up (one pipeline)
    const finalPath = join(OUTPUT_DIR, `${featureId}.webm`);
    const rawVideoPath = await page.video()?.path();
    await recordContext.close();
    await page.video()?.saveAs(finalPath);
    if (rawVideoPath && rawVideoPath !== finalPath) {
      await unlink(rawVideoPath).catch(() => {});
    }
    // Trim the setup pre-roll (navigation, loading, cloak) using measured time
    await trimPreroll(finalPath, setupDurationSeconds);
    // Upscale to TikTok resolution (1080x1920)
    await upscaleToTikTok(finalPath);
    console.log(`   📹 ${featureId}.webm`);

    return finalPath;
  } catch (error) {
    await recordContext.close().catch(() => {});
    throw error;
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

  const browser = await chromium.launch({ headless: true });

  try {
    const needsAuth = config.requiresAuth !== false;
    const storage = await setupAuth(browser, needsAuth);
    return await recordClean(browser, config, storage, featureId);
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
): Promise<Record<string, string>> {
  console.log(
    `\n🎬 Suite Mode: Recording ${featureIds.length} features with single login\n`,
  );

  const configs = featureIds.map((id) => getFeatureRecording(id));
  const needsAuth = configs.some((c) => c.requiresAuth !== false);

  const browser = await chromium.launch({ headless: true });
  const results: Record<string, string> = {};

  try {
    // Setup auth once (no video)
    const storage = await setupAuth(browser, needsAuth);

    // Record each feature cleanly
    for (const featureId of featureIds) {
      const config = getFeatureRecording(featureId);

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
  const featureArgs = args.filter((arg) => !arg.startsWith('--'));
  const targetFeatures = featureArgs.length > 0 ? featureArgs : null;

  // Determine which features to record
  const featuresToRecord = targetFeatures || getAllFeatureIds();

  // Check if any features need auth, validate env vars accordingly
  const configs = featuresToRecord.map((id) => getFeatureRecording(id));
  const anyNeedsAuth = configs.some((c) => c.requiresAuth !== false);
  validateEnvironment(anyNeedsAuth);

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('🎥 App Feature Recorder');
  console.log('━'.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);
  if (anyNeedsAuth) {
    console.log(`Persona: ${PERSONA_EMAIL}`);
  }
  console.log(
    `Mode: ${useSuiteMode || (targetFeatures && targetFeatures.length > 1) ? 'Suite (login once)' : 'Single'}`,
  );

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
