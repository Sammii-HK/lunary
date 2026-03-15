/**
 * TikTok Demo Recorder
 *
 * Records app demos at 1080x1920 (9:16) timed to match voiceover.
 * Takes a TikTokScript ID and optionally a timing JSON from the TTS step.
 *
 * Usage:
 *   npx tsx scripts/record-demo.ts dashboard-overview
 *   npx tsx scripts/record-demo.ts dashboard-overview --timing timing.json
 *   npx tsx scripts/record-demo.ts dashboard-overview --headed
 *   npx tsx scripts/record-demo.ts --list
 *
 * Required env vars (in .env.local):
 *   PERSONA_EMAIL    — test account email
 *   PERSONA_PASSWORD — test account password
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { chromium, type Page } from '@playwright/test';
import { mkdir, readFile, unlink, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { getFeatureRecording } from '../src/lib/video/app-feature-recordings';
import {
  TIKTOK_SCRIPTS,
  type TikTokScript,
} from '../src/lib/video/tiktok-scripts';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PERSONA_EMAIL = process.env.PERSONA_EMAIL;
const PERSONA_PASSWORD = process.env.PERSONA_PASSWORD;

/** TTS words per second (shimmer voice at 1.05x) */
const TTS_WORDS_PER_SECOND = 3.0;

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/** 9:16 vertical — recorded at 360x640 CSS pixels, upscaled 3x to 1080x1920 */
const VIEWPORT = { width: 360, height: 640 };
const DEVICE_SCALE = 3;
const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

interface TimingFile {
  scenes: Array<{ index: number; duration: number }>;
  totalDuration: number;
}

/**
 * Load per-scene durations from an optional timing JSON file.
 * Returns a map of scene index -> duration in seconds.
 */
async function loadTiming(
  timingPath: string | null,
): Promise<Map<number, number> | null> {
  if (!timingPath) return null;
  const absPath = resolve(process.cwd(), timingPath);
  if (!existsSync(absPath)) {
    console.log(
      `   Warning: timing file not found at ${absPath}, using fallback`,
    );
    return null;
  }
  const raw = await readFile(absPath, 'utf-8');
  const data: TimingFile = JSON.parse(raw);
  const map = new Map<number, number>();
  for (const entry of data.scenes) {
    map.set(entry.index, entry.duration);
  }
  console.log(
    `   Loaded timing: ${data.scenes.length} scenes, ${data.totalDuration.toFixed(1)}s total`,
  );
  return map;
}

/**
 * Estimate scene duration from voiceoverLine word count.
 */
function estimateDuration(
  voiceoverLine: string | undefined,
  fallback: number,
): number {
  if (!voiceoverLine) return fallback;
  const words = voiceoverLine.split(/\s+/).length;
  return Math.max(1.0, words / TTS_WORDS_PER_SECOND);
}

// ---------------------------------------------------------------------------
// Auth (mirrors record-app-features.ts patterns)
// ---------------------------------------------------------------------------

function validateAuth(needsAuth: boolean): void {
  if (!needsAuth) return;
  if (!PERSONA_EMAIL) {
    throw new Error('Missing PERSONA_EMAIL in .env.local');
  }
  if (!PERSONA_PASSWORD) {
    throw new Error('Missing PERSONA_PASSWORD in .env.local');
  }
}

async function handleCookieConsent(page: Page): Promise<void> {
  console.log('   Setting up cookie consent and banners...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1000);

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
      localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
      document.cookie = `pwa_banner_dismissed=${Date.now()}; max-age=31536000; path=/; SameSite=Lax`;
      localStorage.setItem('pwa_notifications_prompted', '1');
      document.cookie = `pwa_notifications_prompted=1; max-age=31536000; path=/; SameSite=Lax`;
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
    console.log('   Done');
  } catch {
    try {
      const btn = page.locator('[data-testid="accept-all-cookies"]');
      await btn.click({ timeout: 3000 });
      await page.waitForTimeout(1000);
      console.log('   Accepted cookies via popup');
    } catch {
      console.log('   No cookie popup found');
    }
  }
}

async function authenticate(page: Page, attempt = 1): Promise<void> {
  console.log(
    `   Authenticating as ${PERSONA_EMAIL}${attempt > 1 ? ` (attempt ${attempt})` : ''}...`,
  );

  await page.goto(BASE_URL + '/auth', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const emailInput = page.locator('input[type="email"], input[name="email"]');
  try {
    await Promise.race([
      emailInput.waitFor({ state: 'visible', timeout: 10000 }),
      page.waitForURL((url) => url.pathname === '/app', { timeout: 10000 }),
    ]);
  } catch {
    await page.waitForTimeout(3000);
  }

  const currentPath = new URL(page.url()).pathname;
  if (currentPath === '/app' || currentPath.startsWith('/app')) {
    console.log(`   Already authenticated at ${currentPath}`);
    return;
  }

  const passwordInput = page.locator(
    'input[type="password"], input[name="password"]',
  );
  await emailInput.fill(PERSONA_EMAIL!);
  await page.waitForTimeout(300);
  await passwordInput.fill(PERSONA_PASSWORD!);
  await page.waitForTimeout(300);

  const loginButton = page.locator(
    'button:has-text("Sign In"), button:has-text("Log in"), button[type="submit"]',
  );
  await loginButton.click();

  try {
    await page.waitForURL((url) => url.pathname === '/app', { timeout: 15000 });
  } catch {
    const afterPath = new URL(page.url()).pathname;
    if (afterPath === '/app' || afterPath.startsWith('/app')) {
      console.log(`   Authenticated (late redirect) at ${afterPath}`);
      return;
    }
    if (attempt < 3) {
      console.log('   Auth redirect timed out, retrying...');
      return authenticate(page, attempt + 1);
    }
    throw new Error('Authentication timed out after 3 attempts');
  }
  await page.waitForTimeout(2000);
  console.log(`   Authenticated at ${new URL(page.url()).pathname}`);
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

async function scrollElementToCenter(
  page: Page,
  selector: string,
): Promise<void> {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'attached', timeout: 20000 });
  await locator.evaluate((el) => {
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
    const viewportTarget = window.innerHeight * 0.33;
    scrollParent.scrollBy({
      top: elementCenter - viewportTarget,
      behavior: 'smooth',
    });
  });
  await page.waitForTimeout(1000);
}

async function executeAction(
  page: Page,
  action: string,
  opts: {
    target?: string;
    scrollDistance?: number;
    scrollTo?: string;
    scrollContainer?: string;
    typeText?: string;
    durationMs: number;
    description: string;
  },
): Promise<void> {
  const {
    target,
    scrollDistance,
    scrollTo,
    scrollContainer,
    typeText,
    durationMs,
    description,
  } = opts;
  console.log(`     ${action}: ${description}`);

  switch (action) {
    case 'show':
    case 'wait':
      await page.waitForTimeout(durationMs);
      break;

    case 'navigate':
      if (target) {
        // Prefer SPA navigation via link click
        const spaNav = await page
          .evaluate((targetPath: string) => {
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
            const allLinks = document.querySelectorAll('a[href]');
            for (const a of allLinks) {
              try {
                const url = new URL(
                  (a as HTMLAnchorElement).href,
                  window.location.origin,
                );
                if (url.pathname === targetPath) {
                  (a as HTMLAnchorElement).click();
                  return true;
                }
              } catch {
                /* skip */
              }
            }
            return false;
          }, target)
          .catch(() => false);

        if (spaNav) {
          try {
            await page.waitForLoadState('networkidle', { timeout: 5000 });
          } catch {
            /* fine */
          }
          await page.waitForTimeout(1000);
        } else {
          await page.goto(BASE_URL + target, { waitUntil: 'domcontentloaded' });
          try {
            await page.waitForLoadState('networkidle', { timeout: 5000 });
          } catch {
            /* fine */
          }
          await page.waitForTimeout(500);
        }
        // Hold for remaining duration
        const holdMs = Math.max(durationMs - 1500, 500);
        await page.waitForTimeout(holdMs);
      }
      break;

    case 'scroll':
      if (scrollTo) {
        try {
          await scrollElementToCenter(page, scrollTo);
        } catch (e) {
          console.log(
            `     Warning: could not scroll to ${scrollTo}: ${(e as Error).message}`,
          );
        }
      } else if (scrollDistance) {
        await page.evaluate(
          async ({ distance, containerSel }) => {
            let container: Element | Window = window;
            if (containerSel) {
              const target = document.querySelector(containerSel);
              if (target && target.scrollHeight > target.clientHeight)
                container = target;
            } else {
              const scrollableDiv = document.querySelector(
                'div[class*="overflow-y-auto"], div[class*="overflow-auto"]',
              );
              const mainEl = document.querySelector('main');
              if (
                scrollableDiv &&
                scrollableDiv.scrollHeight > scrollableDiv.clientHeight
              )
                container = scrollableDiv;
              else if (mainEl && mainEl.scrollHeight > mainEl.clientHeight)
                container = mainEl;
            }
            const steps = Math.ceil(Math.abs(distance) / 80);
            const stepDist = distance / steps;
            for (let i = 0; i < steps; i++) {
              if (container instanceof Element)
                container.scrollBy({ top: stepDist, behavior: 'smooth' });
              else window.scrollBy({ top: stepDist, behavior: 'smooth' });
              await new Promise((r) => setTimeout(r, 150));
            }
          },
          { distance: scrollDistance, containerSel: scrollContainer },
        );
        await page.waitForTimeout(800);
      }
      // Hold for remaining scene time
      const scrollHold = Math.max(durationMs - 1000, 500);
      await page.waitForTimeout(scrollHold);
      break;

    case 'click':
    case 'expand':
      if (target) {
        try {
          const urlBefore = page.url();
          await page.click(target, { timeout: 15000, force: true });
          await page.waitForTimeout(500);
          if (page.url() !== urlBefore) {
            try {
              await page.waitForLoadState('networkidle', { timeout: 8000 });
            } catch {
              /* fine */
            }
            await page.waitForTimeout(500);
          }
        } catch (e) {
          console.log(
            `     Warning: click failed on ${target}: ${(e as Error).message}`,
          );
        }
        const clickHold = Math.max(durationMs - 500, 500);
        await page.waitForTimeout(clickHold);
      }
      break;

    case 'type':
      if (target && typeText) {
        try {
          await page.click(target, { timeout: 5000, force: true });
          await page.waitForTimeout(200);
          await page.keyboard.type(typeText, { delay: 80 });
          await page.waitForTimeout(300);
        } catch (e) {
          console.log(
            `     Warning: type failed on ${target}: ${(e as Error).message}`,
          );
        }
        const typingMs = 200 + typeText.length * 80 + 300;
        const typeHold = Math.max(durationMs - typingMs, 200);
        await page.waitForTimeout(typeHold);
      }
      break;

    default:
      console.log(`     Unknown action: ${action}, waiting ${durationMs}ms`);
      await page.waitForTimeout(durationMs);
  }
}

// ---------------------------------------------------------------------------
// Dismiss announcement modals
// ---------------------------------------------------------------------------

/**
 * Dismiss any "New Feature" announcement modals that appear after auth.
 * Uses three strategies:
 * 1. Mark all announcements as seen via API
 * 2. Click "Got it" buttons
 * 3. Click close/X buttons
 * 4. Click backdrop overlay
 */
async function dismissAnnouncementModals(page: Page): Promise<void> {
  // Strategy 1: Mark all announcements as seen via the API
  try {
    const dismissed = await page.evaluate(async () => {
      let count = 0;
      // Keep fetching and dismissing until no more announcements
      for (let i = 0; i < 10; i++) {
        const res = await fetch('/api/announcements');
        if (!res.ok) break;
        const data = await res.json();
        if (!data?.announcement?.id) break;
        await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ announcementId: data.announcement.id }),
        });
        count++;
      }
      return count;
    });
    if (dismissed > 0) {
      console.log(`   Dismissed ${dismissed} announcement(s) via API`);
    }
  } catch {
    // API not available, fall through to UI clicks
  }

  // Strategy 2: Click "Got it" buttons (modal might still be rendered)
  for (let i = 0; i < 3; i++) {
    try {
      const gotItBtn = page.locator('button:has-text("Got it")');
      await gotItBtn.waitFor({ state: 'visible', timeout: 2000 });
      await gotItBtn.click();
      console.log(`   Clicked "Got it" button (${i + 1})`);
      await page.waitForTimeout(500);
    } catch {
      break;
    }
  }

  // Strategy 3: Click close button
  try {
    const closeBtn = page.locator('button[aria-label="Close"]');
    await closeBtn.waitFor({ state: 'visible', timeout: 1000 });
    await closeBtn.click();
    console.log('   Clicked close button');
    await page.waitForTimeout(500);
  } catch {
    // No close button
  }

  // Strategy 4: Click backdrop (the modal closes on backdrop click)
  try {
    const backdrop = page.locator('.fixed.inset-0.bg-black\\/80');
    if (await backdrop.isVisible({ timeout: 500 })) {
      // Click the edge of the backdrop (outside the modal content)
      await page.click('.fixed.inset-0', {
        position: { x: 10, y: 10 },
        force: true,
      });
      console.log('   Clicked backdrop to dismiss modal');
      await page.waitForTimeout(500);
    }
  } catch {
    // No backdrop
  }
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

async function setupAuthContext(
  browser: any,
  needsAuth: boolean,
): Promise<any> {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: IPHONE_UA,
    deviceScaleFactor: DEVICE_SCALE,
  });
  const page = await ctx.newPage();
  await handleCookieConsent(page);
  if (needsAuth) await authenticate(page);
  const storage = await ctx.storageState();
  await ctx.close();
  return storage;
}

async function recordDemo(
  script: TikTokScript,
  timing: Map<number, number> | null,
  options: { headed: boolean },
): Promise<string> {
  const needsAuth = getFeatureRecording(script.id).requiresAuth !== false;
  validateAuth(needsAuth);

  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`\nRecording: ${script.title}`);
  console.log(`   Script ID: ${script.id}`);
  console.log(`   Scenes: ${script.scenes.length}`);
  console.log(`   Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: !options.headed });

  try {
    // 1. Auth setup (no recording)
    console.log('\n   [1/4] Authenticating...');
    const storage = await setupAuthContext(browser, needsAuth);

    // 2. Warm up target page
    console.log('   [2/4] Warming up target page...');
    const startUrl = script.scenes[0]?.path || '/app';
    const warmupCtx = await browser.newContext({
      viewport: VIEWPORT,
      userAgent: IPHONE_UA,
      deviceScaleFactor: DEVICE_SCALE,
      storageState: storage,
    });
    const warmupPage = await warmupCtx.newPage();
    await warmupPage.goto(BASE_URL + startUrl, {
      waitUntil: 'domcontentloaded',
    });
    try {
      await warmupPage.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      /* fine */
    }
    try {
      await warmupPage.waitForSelector('main h1, main h2, [data-testid], nav', {
        state: 'visible',
        timeout: 10000,
      });
    } catch {
      /* fallback */
    }
    await warmupPage.waitForTimeout(1000);

    // Dismiss any "New Feature" announcement modals
    await dismissAnnouncementModals(warmupPage);

    const warmedStorage = await warmupCtx.storageState();
    await warmupCtx.close();

    // 3. Record
    console.log('   [3/4] Recording...');
    const recordCtx = await browser.newContext({
      viewport: VIEWPORT,
      recordVideo: { dir: OUTPUT_DIR, size: VIEWPORT },
      userAgent: IPHONE_UA,
      deviceScaleFactor: DEVICE_SCALE,
      storageState: warmedStorage,
    });

    const page = await recordCtx.newPage();
    const recordingStartTime = Date.now();

    // Cloak CSS to hide initial load flash
    const CLOAK_CSS =
      '<style id="__recorder-cloak">html{background:#09090b!important}body{opacity:0!important;transition:opacity .3s ease!important}body.__loaded{opacity:1!important}</style>';

    const cloakHandler = async (route: any) => {
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
        await route.continue();
      }
    };
    await page.route('**/*', cloakHandler);

    // Dismiss banners before React mounts
    await page.addInitScript(() => {
      localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
      localStorage.setItem('pwa_notifications_prompted', '1');
      localStorage.setItem('lunary_referral_onboarding_shown', '1');
      sessionStorage.setItem('testimonial-handled', '1');
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
      for (const sign of signs)
        localStorage.setItem(`season-banner-dismissed-${sign}`, '1');
    });

    // Touch ripple for tap feedback
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `@keyframes tap-ripple { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }`;
      document.addEventListener('DOMContentLoaded', () =>
        document.head.appendChild(style),
      );
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

    // Navigate to start URL
    await page.goto(BASE_URL + startUrl, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      /* fine */
    }
    try {
      await page.waitForSelector('main h1, main h2, [data-testid], nav', {
        state: 'attached',
        timeout: 10000,
      });
    } catch {
      /* fallback */
    }
    await page.waitForTimeout(3000);

    // Dismiss any "New Feature" announcement modals before recording
    await dismissAnnouncementModals(page);

    // Wait for data-dependent widgets
    await page
      .waitForSelector('[data-testid="sky-now-widget"]', {
        state: 'attached',
        timeout: 15000,
      })
      .catch(() => {});

    // Reveal page
    await page.evaluate(() => {
      document.body.classList.add('__loaded');
      // Ensure we start at the top of the page
      window.scrollTo(0, 0);
      // Also scroll any main/content containers to top
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
      const scrollable = document.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (scrollable) scrollable.scrollTop = 0;
    });
    await page.waitForTimeout(400);
    await page.unroute('**/*', cloakHandler);

    const setupDurationSeconds = (Date.now() - recordingStartTime) / 1000;
    console.log(`   Page ready (setup: ${setupDurationSeconds.toFixed(1)}s)`);

    // Hook pause (overlay is added by Remotion, not part of recording)
    console.log(
      `\n   Hook: "${script.hook.text}" (${script.hook.durationSeconds}s)`,
    );
    await page.waitForTimeout(script.hook.durationSeconds * 1000);

    // Process each scene
    let lastPath = startUrl;
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const sceneDuration =
        timing?.get(i) ??
        estimateDuration(scene.voiceoverLine, scene.durationSeconds);

      console.log(
        `\n   Scene ${i + 1}/${script.scenes.length} (${sceneDuration.toFixed(1)}s)`,
      );
      if (scene.voiceoverLine) {
        console.log(`     VO: "${scene.voiceoverLine}"`);
      }

      // Auto-navigate when path changes (unless this scene is a navigate action
      // or the previous scene was a click/expand that already navigated)
      const prevAction = i > 0 ? script.scenes[i - 1].action : null;
      const clickAlreadyNavigated =
        prevAction === 'click' || prevAction === 'expand';
      if (
        scene.path !== lastPath &&
        scene.action !== 'navigate' &&
        !clickAlreadyNavigated
      ) {
        console.log(`     Auto-navigating to ${scene.path}`);
        await page.goto(BASE_URL + scene.path, {
          waitUntil: 'domcontentloaded',
        });
        try {
          await page.waitForLoadState('networkidle', { timeout: 5000 });
        } catch {
          /* fine */
        }
        await page.waitForTimeout(1500);
      }

      await executeAction(page, scene.action, {
        target:
          scene.action === 'navigate'
            ? scene.target || scene.path
            : scene.target,
        scrollDistance: scene.scrollDistance,
        scrollTo: scene.scrollTo,
        scrollContainer: scene.scrollContainer,
        typeText: scene.typeText,
        durationMs: sceneDuration * 1000,
        description: scene.description,
      });

      lastPath = scene.path;
    }

    // Outro hold
    console.log(
      `\n   Outro: "${script.outro.text}" (${script.outro.durationSeconds}s)`,
    );
    await page.waitForTimeout(script.outro.durationSeconds * 1000);

    // Final pause
    await page.waitForTimeout(2000);
    console.log('   Recording complete');

    // 4. Save and convert
    console.log('   [4/4] Saving and converting...');
    const webmPath = join(OUTPUT_DIR, `${script.id}.webm`);
    const mp4Path = join(OUTPUT_DIR, `${script.id}.mp4`);
    const rawVideoPath = await page.video()?.path();
    await recordCtx.close();
    await page.video()?.saveAs(webmPath);
    if (rawVideoPath && rawVideoPath !== webmPath) {
      await unlink(rawVideoPath).catch(() => {});
    }

    // Convert: trim pre-roll + upscale to 1080x1920 + encode H.264
    const converted = await convertToMp4(
      webmPath,
      mp4Path,
      setupDurationSeconds,
    );
    const outputPath = converted ? mp4Path : webmPath;
    console.log(`\n   Output: ${outputPath}`);
    return outputPath;
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Post-processing
// ---------------------------------------------------------------------------

async function convertToMp4(
  webmPath: string,
  mp4Path: string,
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
      const output = (result.stderr || '') + (result.stdout || '');
      for (const match of output.matchAll(
        /black_start:([\d.]+)\s+black_end:([\d.]+)/g,
      )) {
        const start = parseFloat(match[1]);
        const end = parseFloat(match[2]);
        if (start < 0.5) trimStart = Math.max(trimStart, end);
      }
    }

    const trimArgs = trimStart >= 0.5 ? ['-ss', trimStart.toFixed(2)] : [];
    if (trimStart >= 0.5) {
      console.log(`   Trimming ${trimStart.toFixed(1)}s pre-roll`);
    }

    console.log(`   Converting to MP4 at ${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}...`);

    execFileSync(
      'ffmpeg',
      [
        '-y',
        ...trimArgs,
        '-i',
        webmPath,
        '-vf',
        `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:flags=lanczos,setsar=1`,
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        '20',
        '-pix_fmt',
        'yuv420p',
        '-r',
        '30',
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
      console.log(
        '   Warning: output MP4 too small, conversion may have failed',
      );
      await unlink(mp4Path).catch(() => {});
      return false;
    }

    // Remove the raw WebM
    await unlink(webmPath).catch(() => {});
    console.log(`   Saved ${OUTPUT_WIDTH}x${OUTPUT_HEIGHT} MP4 at 30fps`);
    return true;
  } catch (err: any) {
    const msg = err?.stderr?.toString() || err?.message || 'unknown';
    console.log(
      `   Warning: ffmpeg conversion failed: ${msg.substring(0, 200)}`,
    );
    console.log('   WebM file preserved as fallback');
    return false;
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  // --list: show available script IDs
  if (args.includes('--list')) {
    console.log('Available TikTok script IDs:\n');
    for (const script of TIKTOK_SCRIPTS) {
      const authNeeded = getFeatureRecording(script.id).requiresAuth !== false;
      console.log(
        `  ${script.id.padEnd(30)} ${script.title} ${authNeeded ? '' : '(public)'}`,
      );
    }
    console.log(`\n${TIKTOK_SCRIPTS.length} scripts available`);
    return;
  }

  // Parse args
  const headed = args.includes('--headed');
  const timingIdx = args.indexOf('--timing');
  const timingPath = timingIdx !== -1 ? args[timingIdx + 1] : null;

  const scriptId = args.find((a) => !a.startsWith('--') && a !== timingPath);
  if (!scriptId) {
    console.error(
      'Usage: npx tsx scripts/record-demo.ts <script-id> [--timing timing.json] [--headed]',
    );
    console.error('       npx tsx scripts/record-demo.ts --list');
    process.exit(1);
  }

  // Find the script
  const script = TIKTOK_SCRIPTS.find((s) => s.id === scriptId);
  if (!script) {
    console.error(`Unknown script ID: ${scriptId}`);
    console.error(`Run with --list to see available IDs`);
    process.exit(1);
  }

  // Load timing
  const timing = await loadTiming(timingPath);

  // Calculate total expected duration
  let totalDuration =
    script.hook.durationSeconds + script.outro.durationSeconds;
  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    totalDuration +=
      timing?.get(i) ??
      estimateDuration(scene.voiceoverLine, scene.durationSeconds);
  }

  console.log('TikTok Demo Recorder');
  console.log('='.repeat(50));
  console.log(`Script:   ${script.title}`);
  console.log(
    `Duration: ~${totalDuration.toFixed(1)}s (${timing ? 'from timing file' : 'estimated from voiceover'})`,
  );
  console.log(`Output:   ${OUTPUT_DIR}/${scriptId}.mp4`);
  console.log(
    `Viewport: ${VIEWPORT.width}x${VIEWPORT.height} @ ${DEVICE_SCALE}x -> ${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}`,
  );
  console.log(`Mode:     ${headed ? 'headed' : 'headless'}`);

  const outputPath = await recordDemo(script, timing, { headed });

  console.log('\n' + '='.repeat(50));
  console.log(`Done: ${outputPath}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review the recording`);
  console.log(
    `  2. Compose with Remotion: npx tsx scripts/compose-tiktok.ts ${scriptId}`,
  );
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
