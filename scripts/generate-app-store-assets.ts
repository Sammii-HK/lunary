/**
 * Apple App Store Asset Generation Pipeline
 *
 * Generates all required assets for Apple App Store listing:
 * - iPhone 6.5" screenshots (1242x2688) — required
 * - iPhone 5.5" screenshots (1242x2208) — required
 * - iPad Pro 13" screenshots (2064x2752) — optional, boosts visibility
 * - Framed marketing screenshots with tagline overlays
 *
 * Usage:
 *   tsx scripts/generate-app-store-assets.ts screenshots
 *   tsx scripts/generate-app-store-assets.ts framed
 *   tsx scripts/generate-app-store-assets.ts all
 *
 * Required environment variables (in .env.local):
 *   - PERSONA_EMAIL
 *   - PERSONA_PASSWORD
 *
 * Requires:
 *   - Local dev server running at BASE_URL (default: http://localhost:3000)
 *   - Playwright browsers installed (npx playwright install chromium)
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { chromium, type Page, type BrowserContext } from '@playwright/test';
import { mkdir, writeFile } from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'app-store-assets');
const PUBLIC_DIR = join(process.cwd(), 'public');

const OG_COLORS = {
  background: '#0A0A0A',
  primaryViolet: '#8458D8',
  galaxyHaze: '#C77DFF',
  textPrimary: '#FFFFFF',
} as const;

// ─── Device Profiles ─────────────────────────────────────────────────────────

interface DeviceProfile {
  width: number;
  height: number;
  scale: number;
  outputWidth: number;
  outputHeight: number;
  folder: string;
  userAgent: string;
}

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD_UA =
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const DEVICES: Record<string, DeviceProfile> = {
  iphone67: {
    width: 414,
    height: 896,
    scale: 3,
    outputWidth: 1242,
    outputHeight: 2688,
    folder: 'iphone-6.5',
    userAgent: IPHONE_UA,
  },
  iphone55: {
    width: 414,
    height: 736,
    scale: 3,
    outputWidth: 1242,
    outputHeight: 2208,
    folder: 'iphone-5.5',
    userAgent: IPHONE_UA,
  },
  ipadPro: {
    width: 1032,
    height: 1376,
    scale: 2,
    outputWidth: 2064,
    outputHeight: 2752,
    folder: 'ipad-pro-13',
    userAgent: IPAD_UA,
  },
};

// ─── Screen Definitions ──────────────────────────────────────────────────────

interface ScreenConfig {
  id: string;
  name: string;
  route: string;
  source: 'mock-auth';
  waitSelector?: string;
  tagline: string;
  setupSteps?: Array<{
    type:
      | 'click'
      | 'wait'
      | 'scroll'
      | 'scroll-to'
      | 'scroll-to-top'
      | 'wait-selector';
    selector?: string;
    duration?: number;
    distance?: number;
    optional?: boolean;
  }>;
}

const SCREENS: ScreenConfig[] = [
  {
    id: '01-birth-chart',
    name: 'Birth Chart',
    route: '/app/birth-chart',
    source: 'mock-auth',
    waitSelector: '.chart-wheel-svg',
    tagline: 'Read Your Full Birth Chart',
    setupSteps: [
      { type: 'wait', duration: 4000 },
      { type: 'scroll-to', selector: '.chart-wheel-svg' },
      { type: 'wait', duration: 1000 },
    ],
  },
  {
    id: '02-cosmic-score',
    name: 'Cosmic Score',
    route: '/app',
    source: 'mock-auth',
    waitSelector: '[data-testid="sky-now-widget"]',
    tagline: 'Daily Energy Reading',
    setupSteps: [
      { type: 'wait-selector', selector: '[data-testid="sky-now-widget"]' },
      { type: 'click', selector: 'button[aria-label="Close"]', optional: true },
      { type: 'wait', duration: 500 },
      { type: 'scroll-to-top' },
      { type: 'wait', duration: 1000 },
    ],
  },
  {
    id: '03-tarot',
    name: 'Tarot',
    route: '/tarot',
    source: 'mock-auth',
    tagline: 'Daily Tarot Guidance',
    setupSteps: [
      { type: 'wait', duration: 4000 },
      { type: 'scroll-to-top' },
      { type: 'wait', duration: 500 },
    ],
  },
  {
    id: '04-grimoire',
    name: 'Grimoire',
    route: '/grimoire',
    source: 'mock-auth',
    waitSelector: '[data-testid="grimoire-page"]',
    tagline: 'Learn Astrology Deeply',
    setupSteps: [{ type: 'wait', duration: 3000 }],
  },
  {
    id: '05-journal',
    name: 'Journal',
    route: '/book-of-shadows/journal',
    source: 'mock-auth',
    tagline: 'Track Your Journey',
    setupSteps: [{ type: 'wait', duration: 3000 }],
  },
  {
    id: '06-horoscope',
    name: 'Horoscope',
    route: '/horoscope',
    source: 'mock-auth',
    waitSelector: '[data-testid="numerology-section"]',
    tagline: 'Your Daily Cosmic Forecast',
    setupSteps: [
      { type: 'wait-selector', selector: '[data-testid="numerology-section"]' },
      { type: 'scroll-to-top' },
      { type: 'wait', duration: 500 },
    ],
  },
  {
    id: '07-circle',
    name: 'Cosmic Circle',
    route: '/circle',
    source: 'mock-auth',
    tagline: 'Connect With Your Tribe',
    setupSteps: [{ type: 'wait', duration: 3000 }],
  },
  {
    id: '08-synastry',
    name: 'Synastry',
    route: '/circle',
    source: 'mock-auth',
    tagline: 'See How Your Charts Align',
    setupSteps: [
      { type: 'wait', duration: 4000 },
      // Click the Synastry button on the first profile card (Sammii)
      {
        type: 'click',
        selector: 'button:has-text("Synastry")',
        optional: true,
      },
      { type: 'wait', duration: 4000 },
      // Scroll down slightly to show synastry results
      { type: 'scroll', distance: 200 },
      { type: 'wait', duration: 1000 },
    ],
  },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────

const PERSONA_EMAIL = process.env.PERSONA_EMAIL;
const PERSONA_PASSWORD = process.env.PERSONA_PASSWORD;

if (!PERSONA_EMAIL || !PERSONA_PASSWORD) {
  console.error('Missing PERSONA_EMAIL or PERSONA_PASSWORD in .env.local');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadFont(filename: string): ArrayBuffer {
  const fontPath = join(PUBLIC_DIR, 'fonts', filename);
  const buffer = readFileSync(fontPath);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

function loadFonts() {
  return [
    {
      name: 'Roboto Mono',
      data: loadFont('RobotoMono-Bold.ttf'),
      style: 'normal' as const,
      weight: 700 as const,
    },
    {
      name: 'Roboto Mono',
      data: loadFont('RobotoMono-Regular.ttf'),
      style: 'normal' as const,
      weight: 400 as const,
    },
  ];
}

async function renderSatoriToPng(
  element: unknown,
  width: number,
  height: number,
): Promise<Buffer> {
  const fonts = loadFonts();
  const svg = await satori(element as Parameters<typeof satori>[0], {
    width,
    height,
    fonts,
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false },
    logLevel: 'off',
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

async function handleCookieConsent(page: Page): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const payload = JSON.stringify({
      version: 1,
      preferences: { essential: true, analytics: true, timestamp: Date.now() },
    });
    localStorage.setItem('cookie_consent', payload);
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
    localStorage.setItem('pwa_notifications_prompted', '1');
  });
}

async function setupAuthContext(
  browser: ReturnType<typeof chromium.launch> extends Promise<infer T>
    ? T
    : never,
  device: DeviceProfile,
): Promise<BrowserContext> {
  const context = await (
    browser as Awaited<ReturnType<typeof chromium.launch>>
  ).newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.scale,
    ignoreHTTPSErrors: true,
    userAgent: device.userAgent,
  });

  const page = await context.newPage();
  await handleCookieConsent(page);

  console.log(`     Signing in as ${PERSONA_EMAIL}...`);
  const response = await page.request.post(
    `${BASE_URL}/api/auth/sign-in/email`,
    {
      timeout: 60000,
      headers: { Origin: BASE_URL, 'Content-Type': 'application/json' },
      data: { email: PERSONA_EMAIL, password: PERSONA_PASSWORD },
    },
  );

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Sign-in failed (${response.status()}): ${body}`);
  }

  await page.goto(`${BASE_URL}/app`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(2000);
  await page.close();

  console.log('     ✓ Signed in');
  return context;
}

// ─── Screenshot Capture ───────────────────────────────────────────────────────

async function captureScreenshots(): Promise<void> {
  console.log('\n📸 Capturing App Store screenshots...');
  console.log(`   Base URL: ${BASE_URL}`);

  const screenshotsRoot = join(OUTPUT_DIR, 'screenshots');
  const { rm } = await import('fs/promises');
  try {
    await rm(screenshotsRoot, { recursive: true, force: true });
    console.log('   🧹 Cleaned old screenshots');
  } catch {
    /* didn't exist */
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const [deviceName, device] of Object.entries(DEVICES)) {
      const outputDir = join(OUTPUT_DIR, 'screenshots', device.folder);
      await mkdir(outputDir, { recursive: true });

      console.log(
        `\n   📱 ${deviceName} (${device.outputWidth}x${device.outputHeight})`,
      );

      const context = await setupAuthContext(browser, device);
      const page = await context.newPage();

      await page.addInitScript(() => {
        const payload = JSON.stringify({
          version: 1,
          preferences: {
            essential: true,
            analytics: true,
            timestamp: Date.now(),
          },
        });
        localStorage.setItem('cookie_consent', payload);
        localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
        localStorage.setItem('pwa_notifications_prompted', '1');
        localStorage.setItem('lunary_referral_onboarding_shown', '1');
        sessionStorage.setItem('testimonial-handled', '1');
        (window as Record<string, unknown>).__PLAYWRIGHT_AUTHENTICATED__ = true;
      });

      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = 'nextjs-portal { display: none !important; }';
        (document.head || document.documentElement).appendChild(style);
      });

      for (const screen of SCREENS) {
        console.log(`     ▸ ${screen.name}`);

        try {
          await page.goto(`${BASE_URL}${screen.route}`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
          });
        } catch {
          console.log(
            `       ⚠ Navigation slow for ${screen.route}, continuing...`,
          );
        }
        try {
          await page.waitForLoadState('networkidle', { timeout: 15000 });
        } catch {
          /* fine */
        }

        if (screen.waitSelector) {
          try {
            await page.waitForSelector(screen.waitSelector, {
              state: 'visible',
              timeout: 10000,
            });
          } catch {
            /* proceed anyway */
          }
        }

        if (screen.setupSteps) {
          for (const step of screen.setupSteps) {
            if (step.type === 'wait-selector' && step.selector) {
              try {
                await page.waitForSelector(step.selector, {
                  state: 'visible',
                  timeout: step.optional ? 5000 : 30000,
                });
              } catch {
                if (!step.optional)
                  console.log(
                    `       ⚠ Selector never appeared: ${step.selector}`,
                  );
              }
            } else if (step.type === 'wait' && step.duration) {
              await page.waitForTimeout(step.duration);
            } else if (step.type === 'click' && step.selector) {
              try {
                await page.click(step.selector, {
                  timeout: step.optional ? 3000 : 10000,
                });
                await page.waitForTimeout(500);
              } catch {
                if (!step.optional)
                  throw new Error(`Click failed: ${step.selector}`);
              }
            } else if (step.type === 'scroll-to-top') {
              await page.evaluate(() => window.scrollTo(0, 0));
              await page.waitForTimeout(300);
            } else if (step.type === 'scroll-to' && step.selector) {
              try {
                await page.evaluate(
                  (sel) =>
                    document
                      .querySelector(sel)
                      ?.scrollIntoView({ block: 'center' }),
                  step.selector,
                );
                await page.waitForTimeout(800);
              } catch {
                if (!step.optional)
                  throw new Error(`scroll-to failed: ${step.selector}`);
              }
            } else if (step.type === 'scroll' && step.distance) {
              await page.evaluate((d) => window.scrollBy(0, d), step.distance);
              await page.waitForTimeout(800);
            }
          }
        }

        await page.evaluate(() =>
          document
            .querySelectorAll('nextjs-portal')
            .forEach((el) => el.remove()),
        );
        await page.waitForTimeout(100);

        const screenshotPath = join(outputDir, `${screen.id}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`       ✓ ${screenshotPath}`);
      }

      await context.close();
    }

    console.log('\n   ✓ All screenshots captured');
  } finally {
    await browser.close();
  }
}

// ─── Framed Marketing Screenshots ────────────────────────────────────────────

async function generateFramedScreenshots(): Promise<void> {
  console.log('\n🖼️  Generating framed marketing screenshots...');

  const framedRoot = join(OUTPUT_DIR, 'framed');
  const { rm } = await import('fs/promises');
  try {
    await rm(framedRoot, { recursive: true, force: true });
    console.log('   🧹 Cleaned old framed screenshots');
  } catch {
    /* didn't exist */
  }

  for (const [deviceName, device] of Object.entries(DEVICES)) {
    const screenshotDir = join(OUTPUT_DIR, 'screenshots', device.folder);
    const framedDir = join(OUTPUT_DIR, 'framed', device.folder);
    await mkdir(framedDir, { recursive: true });

    console.log(
      `\n   📱 ${deviceName} (${device.outputWidth}x${device.outputHeight})`,
    );

    for (const screen of SCREENS) {
      const rawScreenshotPath = join(screenshotDir, `${screen.id}.png`);

      if (!existsSync(rawScreenshotPath)) {
        console.log(`     ⚠ Skipping ${screen.id} — raw screenshot not found`);
        continue;
      }

      const screenshotData = readFileSync(rawScreenshotPath);
      const screenshotSrc = `data:image/png;base64,${screenshotData.toString('base64')}`;

      const w = device.outputWidth;
      const h = device.outputHeight;
      const titleBarHeight = Math.round(h * 0.1);
      const fontSize = Math.round(titleBarHeight * 0.35);

      const element = {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Roboto Mono',
          },
          children: [
            {
              type: 'img',
              props: {
                src: screenshotSrc,
                width: w,
                height: h,
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: `${titleBarHeight}px`,
                  background:
                    'linear-gradient(180deg, rgba(10, 10, 10, 0.92) 0%, rgba(10, 10, 10, 0.75) 70%, rgba(10, 10, 10, 0) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  paddingTop: '8px',
                },
                children: {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: `${fontSize}px`,
                      fontWeight: 700,
                      color: OG_COLORS.textPrimary,
                      letterSpacing: '0.02em',
                      textAlign: 'center',
                      display: 'flex',
                    },
                    children: screen.tagline,
                  },
                },
              },
            },
          ],
        },
      };

      const png = await renderSatoriToPng(element, w, h);
      const outputPath = join(framedDir, `${screen.id}.png`);
      await writeFile(outputPath, png);
      console.log(`     ✓ ${screen.name}`);
    }
  }

  console.log('\n   ✓ All framed screenshots generated');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Command = 'screenshots' | 'framed' | 'all';

async function main() {
  const args = process.argv.slice(2);
  const command = (args[0] || 'all') as Command;
  const validCommands: Command[] = ['screenshots', 'framed', 'all'];

  if (!validCommands.includes(command)) {
    console.error(`Unknown command: ${command}`);
    console.error(`Valid commands: ${validCommands.join(', ')}`);
    process.exit(1);
  }

  console.log('🍎 App Store Asset Generator');
  console.log('━'.repeat(50));
  console.log(`Command: ${command}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const startTime = Date.now();

  try {
    switch (command) {
      case 'screenshots':
        await captureScreenshots();
        break;
      case 'framed':
        await generateFramedScreenshots();
        break;
      case 'all':
        await captureScreenshots();
        await generateFramedScreenshots();
        break;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '━'.repeat(50));
    console.log(`✅ Done in ${elapsed}s`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
