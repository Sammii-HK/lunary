/**
 * Google Play Store Asset Generation Pipeline
 *
 * Generates all required assets for Google Play Store listing:
 * - App icon (512x512, copied from existing)
 * - Feature graphic (1024x500, generated via satori)
 * - Phone screenshots (1080x1920)
 * - 7" tablet screenshots (1200x1920)
 * - 10" tablet screenshots (2560x1600)
 * - Framed marketing screenshots with text overlays
 * - Demo video with TTS narration
 *
 * Usage:
 *   tsx scripts/generate-play-store-assets.ts screenshots
 *   tsx scripts/generate-play-store-assets.ts feature-graphic
 *   tsx scripts/generate-play-store-assets.ts framed
 *   tsx scripts/generate-play-store-assets.ts video
 *   tsx scripts/generate-play-store-assets.ts all
 *
 * Required environment variables:
 *   - OPENAI_API_KEY (for TTS narration in video mode)
 *
 * Requires:
 *   - Local dev server running at BASE_URL (default: http://localhost:3000)
 *   - Playwright browsers installed (npx playwright install chromium)
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { chromium, type Page, type BrowserContext } from '@playwright/test';
import { mkdir, copyFile, writeFile, unlink } from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = join(process.cwd(), 'play-store-assets');
const PUBLIC_DIR = join(process.cwd(), 'public');

const OG_COLORS = {
  background: '#0A0A0A',
  primaryViolet: '#8458D8',
  cometTrail: '#7B7BE8',
  galaxyHaze: '#C77DFF',
  cosmicRose: '#EE789E',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
} as const;

// ─── Device Profiles ─────────────────────────────────────────────────────────

interface DeviceProfile {
  width: number;
  height: number;
  scale: number;
  outputWidth: number;
  outputHeight: number;
  folder: string;
}

const DEVICES: Record<string, DeviceProfile> = {
  phone: {
    width: 360,
    height: 640,
    scale: 3,
    outputWidth: 1080,
    outputHeight: 1920,
    folder: 'phone',
  },
  tablet7: {
    width: 600,
    height: 960,
    scale: 2,
    outputWidth: 1200,
    outputHeight: 1920,
    folder: 'tablet-7',
  },
  tablet10: {
    width: 1280,
    height: 800,
    scale: 2,
    outputWidth: 2560,
    outputHeight: 1600,
    folder: 'tablet-10',
  },
  chromebook: {
    width: 1366,
    height: 768,
    scale: 1,
    outputWidth: 1366,
    outputHeight: 768,
    folder: 'chromebook',
  },
};

// ─── Screen Definitions ──────────────────────────────────────────────────────

interface ScreenConfig {
  id: string;
  name: string;
  route: string;
  source: 'demo' | 'mock-auth';
  demoTab?: string;
  waitSelector?: string;
  tagline: string;
  setupSteps?: Array<{
    type: 'click' | 'wait' | 'scroll' | 'scroll-to' | 'scroll-to-top';
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
    waitSelector: '#dashboard-container',
    tagline: 'Daily Energy Reading',
    setupSteps: [
      { type: 'wait', duration: 8000 },
      { type: 'scroll-to-top' },
      { type: 'wait', duration: 2000 },
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
    tagline: 'Your Daily Cosmic Forecast',
    setupSteps: [
      { type: 'wait', duration: 4000 },
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
];

// ─── Auth: Real Login (Celeste demo persona) ─────────────────────────────────

const PERSONA_EMAIL = process.env.PERSONA_EMAIL;
const PERSONA_PASSWORD = process.env.PERSONA_PASSWORD;

if (!PERSONA_EMAIL || !PERSONA_PASSWORD) {
  console.error(
    'Missing PERSONA_EMAIL or PERSONA_PASSWORD in .env.local — needed to sign in as demo user',
  );
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return function () {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function generateStarfield(
  shareId: string,
  count: number = 80,
): Array<{ x: number; y: number; size: number; opacity: number }> {
  const random = seededRandom(shareId);
  const stars: Array<{ x: number; y: number; size: number; opacity: number }> =
    [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: random() * 100,
      y: random() * 100,
      size: 1 + random() * 2,
      opacity: 0.3 + random() * 0.6,
    });
  }
  return stars;
}

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
  element: any,
  width: number,
  height: number,
  scale: number = 2,
): Promise<Buffer> {
  const fonts = loadFonts();
  // Satori generates SVG at the logical size, then we render at higher resolution
  const svg = await satori(element, { width, height, fonts });
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width * scale },
    font: { loadSystemFonts: false },
    logLevel: 'off',
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

// ─── Cookie Consent (from record-app-features.ts pattern) ────────────────────

async function handleCookieConsent(page: Page): Promise<void> {
  console.log('   Handling cookie consent...');
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
    });
    console.log('   ✓ Cookie consent set');
  } catch {
    try {
      const cookieButton = page.locator('[data-testid="accept-all-cookies"]');
      await cookieButton.click({ timeout: 3000 });
      await page.waitForTimeout(1000);
      console.log('   ✓ Accepted cookies via popup');
    } catch {
      console.log('   ⊘ No cookie popup found');
    }
  }
}

// ─── Real Auth Context (sign in as Celeste via better-auth) ──────────────────

async function setupAuthContext(
  browser: any,
  device: DeviceProfile,
  userAgent?: string,
): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.scale,
    ignoreHTTPSErrors: true,
    ...(userAgent && { userAgent }),
  });

  // Sign in via better-auth API to get real session cookies
  const page = await context.newPage();
  await handleCookieConsent(page);

  console.log(`     Signing in as ${PERSONA_EMAIL}...`);
  const response = await page.request.post(
    `${BASE_URL}/api/auth/sign-in/email`,
    {
      timeout: 60000,
      headers: {
        Origin: BASE_URL,
        'Content-Type': 'application/json',
      },
      data: {
        email: PERSONA_EMAIL,
        password: PERSONA_PASSWORD,
      },
    },
  );

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Sign-in failed (${response.status()}): ${body}`);
  }

  // Wait for session to be established
  await page.goto(`${BASE_URL}/app`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(2000);
  await page.close();

  console.log('     ✓ Signed in');
  return context;
}

// ─── Step 1: Screenshot Capture ──────────────────────────────────────────────

async function captureScreenshots(): Promise<void> {
  console.log('\n📸 Capturing screenshots...');
  console.log(`   Base URL: ${BASE_URL}`);

  // Clean old screenshots before regenerating
  const screenshotsRoot = join(OUTPUT_DIR, 'screenshots');
  const { rm } = await import('fs/promises');
  try {
    await rm(screenshotsRoot, { recursive: true, force: true });
    console.log('   🧹 Cleaned old screenshots');
  } catch {
    // Directory didn't exist yet
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const [deviceName, device] of Object.entries(DEVICES)) {
      const outputDir = join(OUTPUT_DIR, 'screenshots', device.folder);
      await mkdir(outputDir, { recursive: true });

      console.log(
        `\n   📱 Device: ${deviceName} (${device.outputWidth}x${device.outputHeight})`,
      );

      // Group screens by source to minimize context switching
      const demoScreens = SCREENS.filter((s) => s.source === 'demo');
      const authScreens = SCREENS.filter((s) => s.source === 'mock-auth');

      // Use mobile user agent for phone/tablet to trigger responsive layouts
      const isMobile = device.width <= 600;
      const userAgent = isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        : undefined;

      // ── Demo screens ──
      if (demoScreens.length > 0) {
        const demoContext = await browser.newContext({
          viewport: { width: device.width, height: device.height },
          deviceScaleFactor: device.scale,
          ignoreHTTPSErrors: true,
          ...(userAgent && { userAgent }),
        });
        const demoPage = await demoContext.newPage();

        // Dismiss banners
        await handleCookieConsent(demoPage);

        // Navigate to demo preview
        await demoPage.goto(`${BASE_URL}/demo-preview`, {
          waitUntil: 'domcontentloaded',
        });
        try {
          await demoPage.waitForLoadState('networkidle', { timeout: 15000 });
        } catch {
          // Fine
        }
        await demoPage.waitForTimeout(3000);

        for (const screen of demoScreens) {
          console.log(`     ▸ ${screen.name}`);

          // Click the correct tab
          if (screen.demoTab) {
            try {
              // Click tab to navigate, then click again to stop auto-cycling
              await demoPage.click(`button:has-text("${screen.demoTab}")`, {
                timeout: 5000,
              });
              await demoPage.waitForTimeout(1500);
              await demoPage.click(`button:has-text("${screen.demoTab}")`, {
                timeout: 3000,
              });
              await demoPage.waitForTimeout(1000);
            } catch {
              console.log(
                `       ⚠ Could not click tab "${screen.demoTab}", proceeding anyway`,
              );
            }
          }

          // Wait for key content
          if (screen.waitSelector) {
            try {
              await demoPage.waitForSelector(screen.waitSelector, {
                state: 'visible',
                timeout: 10000,
              });
            } catch {
              console.log(
                `       ⚠ Selector ${screen.waitSelector} not found, taking screenshot anyway`,
              );
            }
          }

          // Execute setup steps
          if (screen.setupSteps) {
            for (const step of screen.setupSteps) {
              if (step.type === 'wait' && step.duration) {
                await demoPage.waitForTimeout(step.duration);
              } else if (step.type === 'click' && step.selector) {
                try {
                  await demoPage.click(step.selector, {
                    timeout: step.optional ? 3000 : 10000,
                  });
                  await demoPage.waitForTimeout(500);
                } catch {
                  if (!step.optional)
                    throw new Error(`Click failed: ${step.selector}`);
                }
              } else if (step.type === 'scroll-to-top') {
                await demoPage.evaluate(() => window.scrollTo(0, 0));
                await demoPage.waitForTimeout(300);
              } else if (step.type === 'scroll-to' && step.selector) {
                try {
                  await demoPage.evaluate(
                    (sel) =>
                      document
                        .querySelector(sel)
                        ?.scrollIntoView({ block: 'center' }),
                    step.selector,
                  );
                  await demoPage.waitForTimeout(800);
                } catch {
                  if (!step.optional)
                    throw new Error(`scroll-to failed: ${step.selector}`);
                }
              } else if (step.type === 'scroll' && step.distance) {
                await demoPage.evaluate(
                  (d) => window.scrollBy(0, d),
                  step.distance,
                );
                await demoPage.waitForTimeout(800);
              }
            }
          }

          const screenshotPath = join(outputDir, `${screen.id}.png`);
          await demoPage.screenshot({ path: screenshotPath, fullPage: false });
          console.log(`       ✓ ${screenshotPath}`);
        }

        await demoContext.close();
      }

      // ── Mock-auth screens ──
      if (authScreens.length > 0) {
        const authContext = await setupAuthContext(browser, device, userAgent);
        const authPage = await authContext.newPage();

        // Set cookie consent + PWA flags before navigating
        await authPage.addInitScript(() => {
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
          (window as any).__PLAYWRIGHT_AUTHENTICATED__ = true;
        });

        // Hide the Next.js dev overlay badge on every navigation (persistent MutationObserver)
        await authPage.addInitScript(() => {
          const hideNextjsOverlay = () => {
            const style = document.createElement('style');
            style.textContent =
              'nextjs-portal { display: none !important; visibility: hidden !important; }';
            (document.head || document.documentElement).appendChild(style);
          };
          // Inject immediately and again when DOM is ready
          hideNextjsOverlay();
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hideNextjsOverlay);
          }
          // Also watch for the portal being injected dynamically
          new MutationObserver((mutations) => {
            for (const m of mutations) {
              for (const node of m.addedNodes) {
                if ((node as Element).tagName === 'NEXTJS-PORTAL') {
                  (node as HTMLElement).style.display = 'none';
                }
              }
            }
          }).observe(document.documentElement, {
            childList: true,
            subtree: true,
          });
        });

        for (const screen of authScreens) {
          console.log(`     ▸ ${screen.name} (mock auth)`);

          try {
            await authPage.goto(`${BASE_URL}${screen.route}`, {
              waitUntil: 'domcontentloaded',
              timeout: 60000,
            });
          } catch {
            console.log(
              `       ⚠ Navigation slow for ${screen.route}, continuing...`,
            );
          }
          try {
            await authPage.waitForLoadState('networkidle', { timeout: 15000 });
          } catch {
            // Fine
          }

          // Wait for key content
          if (screen.waitSelector) {
            try {
              await authPage.waitForSelector(screen.waitSelector, {
                state: 'visible',
                timeout: 10000,
              });
            } catch {
              // Proceed anyway
            }
          }

          // Execute setup steps
          if (screen.setupSteps) {
            for (const step of screen.setupSteps) {
              if (step.type === 'wait' && step.duration) {
                await authPage.waitForTimeout(step.duration);
              } else if (step.type === 'click' && step.selector) {
                try {
                  await authPage.click(step.selector, {
                    timeout: step.optional ? 3000 : 10000,
                  });
                  await authPage.waitForTimeout(500);
                } catch {
                  if (!step.optional)
                    throw new Error(`Click failed: ${step.selector}`);
                }
              } else if (step.type === 'scroll-to-top') {
                await authPage.evaluate(() => window.scrollTo(0, 0));
                await authPage.waitForTimeout(300);
              } else if (step.type === 'scroll-to' && step.selector) {
                try {
                  await authPage.evaluate(
                    (sel) =>
                      document
                        .querySelector(sel)
                        ?.scrollIntoView({ block: 'center' }),
                    step.selector,
                  );
                  await authPage.waitForTimeout(800);
                } catch {
                  if (!step.optional)
                    throw new Error(`scroll-to failed: ${step.selector}`);
                }
              } else if (step.type === 'scroll' && step.distance) {
                await authPage.evaluate(
                  (d) => window.scrollBy(0, d),
                  step.distance,
                );
                await authPage.waitForTimeout(800);
              }
            }
          }

          // Force-remove the Next.js dev overlay right before screenshot
          await authPage.evaluate(() => {
            document
              .querySelectorAll('nextjs-portal')
              .forEach((el) => el.remove());
          });
          await authPage.waitForTimeout(100);

          const screenshotPath = join(outputDir, `${screen.id}.png`);
          await authPage.screenshot({ path: screenshotPath, fullPage: false });
          console.log(`       ✓ ${screenshotPath}`);
        }

        await authContext.close();
      }
    }

    console.log('\n   ✓ All screenshots captured');
  } finally {
    await browser.close();
  }
}

// ─── Step 2: Feature Graphic (1024x500) ──────────────────────────────────────

async function generateFeatureGraphic(): Promise<void> {
  console.log('\n🎨 Generating feature graphic (1024x500)...');

  await mkdir(OUTPUT_DIR, { recursive: true });

  const logoPath = join(PUBLIC_DIR, 'logo.svg');
  const logoData = readFileSync(logoPath, 'utf-8');
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logoData).toString('base64')}`;

  const stars = generateStarfield('play-store-feature-graphic', 60);

  const element = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: OG_COLORS.background,
        fontFamily: 'Roboto Mono',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Starfield background
        ...stars.map((star, i) => ({
          type: 'div',
          key: `star-${i}`,
          props: {
            style: {
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              backgroundColor: 'white',
              opacity: star.opacity,
            },
          },
        })),
        // Gradient glow
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '300px',
              borderRadius: '50%',
              background: `radial-gradient(ellipse, ${OG_COLORS.primaryViolet}33 0%, transparent 70%)`,
            },
          },
        },
        // Content container
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              zIndex: 1,
            },
            children: [
              // Logo
              {
                type: 'img',
                props: {
                  src: logoSrc,
                  width: 100,
                  height: 100,
                },
              },
              // App name
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '48px',
                    fontWeight: 700,
                    color: OG_COLORS.textPrimary,
                    letterSpacing: '0.05em',
                    display: 'flex',
                  },
                  children: 'Lunary',
                },
              },
              // Tagline
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '18px',
                    fontWeight: 400,
                    color: 'rgba(216, 180, 254, 0.8)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'flex',
                  },
                  children: 'Personal astrology grounded in real astronomy',
                },
              },
              // Accent bar
              {
                type: 'div',
                props: {
                  style: {
                    width: '200px',
                    height: '3px',
                    marginTop: '8px',
                    background: `linear-gradient(90deg, ${OG_COLORS.primaryViolet}, ${OG_COLORS.galaxyHaze})`,
                    borderRadius: '2px',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  const png = await renderSatoriToPng(element, 1024, 500, 1);
  const outputPath = join(OUTPUT_DIR, 'feature-graphic.png');
  await writeFile(outputPath, png);
  console.log(`   ✓ ${outputPath}`);
}

// ─── Step 3: Framed Marketing Screenshots ────────────────────────────────────

async function generateFramedScreenshots(): Promise<void> {
  console.log('\n🖼️  Generating framed marketing screenshots...');

  // Clean old framed screenshots
  const framedRoot = join(OUTPUT_DIR, 'framed');
  const { rm } = await import('fs/promises');
  try {
    await rm(framedRoot, { recursive: true, force: true });
    console.log('   🧹 Cleaned old framed screenshots');
  } catch {
    // Didn't exist
  }

  // Generate framed versions for each device size
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
      const isLandscape = w > h;

      // Title bar height: 12% of the shorter dimension for readability
      const titleBarHeight = Math.round((isLandscape ? h : h) * 0.1);
      const fontSize = Math.round(titleBarHeight * 0.35);

      // Full-bleed screenshot with semi-opaque title bar overlay at top
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
            // Screenshot fills entire frame
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
            // Semi-opaque title bar at top
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
                      color: '#FFFFFF',
                      letterSpacing: '0.02em',
                      textAlign: 'center',
                      display: 'flex',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    },
                    children: screen.tagline,
                  },
                },
              },
            },
          ],
        },
      };

      const png = await renderSatoriToPng(element, w, h, 1);
      const outputPath = join(framedDir, `${screen.id}.png`);
      await writeFile(outputPath, png);
      console.log(`     ✓ ${screen.name}`);
    }
  }

  console.log('\n   ✓ All framed screenshots generated');
}

// ─── Step 4: Demo Video with TTS ─────────────────────────────────────────────

const VOICEOVER_SCRIPT = `Welcome to Lunary — your personal astrology companion, grounded in real astronomy.

Every day, your cosmic dashboard shows your personalized alignment score, today's moon phase, and the exact planetary transits affecting your birth chart.

Explore tarot insights powered by pattern recognition and your natal placements. See card appearances correlated with moon phases and planetary aspects.

Track live sky transits and discover how today's celestial movements affect your houses and natal planets — with exact timing and durations.

From daily rituals and journaling to community spaces and cosmic gifting, Lunary brings your birth chart, lunar cycles, and daily guidance together in one beautifully crafted experience.

Download Lunary and start your cosmic journey today.`;

// Landscape 16:9 for YouTube
const VIDEO_VIEWPORT = { width: 1280, height: 720 };

/**
 * Trim black frames from start of a video using ffmpeg blackdetect.
 * Same approach as record-app-features.ts.
 */
async function trimBlackFrames(videoPath: string): Promise<void> {
  try {
    const detectOutput = execFileSync(
      'ffmpeg',
      [
        '-i',
        videoPath,
        '-vf',
        'blackdetect=d=0.1:pix_th=0.05',
        '-an',
        '-f',
        'null',
        '-',
      ],
      {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );

    const blackMatches = detectOutput.matchAll(
      /black_start:([\d.]+)\s+black_end:([\d.]+)/g,
    );
    let trimStart = 0;
    for (const match of blackMatches) {
      const start = parseFloat(match[1]);
      const end = parseFloat(match[2]);
      if (start < 0.5) {
        trimStart = end;
      }
    }

    if (trimStart < 0.5) {
      console.log('   ✂ No significant black pre-roll detected');
      return;
    }

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
        { timeout: 60000, stdio: 'pipe' },
      );
    } catch {
      console.log('   ⚠ ffmpeg trim failed, keeping original');
      await unlink(trimmedPath).catch(() => {});
      return;
    }

    const { stat } = await import('fs/promises');
    try {
      const trimmedStat = await stat(trimmedPath);
      if (trimmedStat.size < 1000) {
        console.log('   ⚠ Trimmed file too small, keeping original');
        await unlink(trimmedPath).catch(() => {});
        return;
      }
    } catch {
      console.log('   ⚠ Trimmed file not created, keeping original');
      return;
    }

    await unlink(videoPath);
    const { rename } = await import('fs/promises');
    await rename(trimmedPath, videoPath);
    console.log(`   ✂ Trimmed ${trimStart.toFixed(1)}s black pre-roll`);
  } catch {
    console.log('   ⚠ Could not trim video (ffmpeg not available or failed)');
  }
}

/**
 * Smooth scroll helper — evaluates inside the page for human-like scrolling
 */
async function smoothScroll(page: Page, distance: number): Promise<void> {
  await page.evaluate(async (dist) => {
    const scrollableDiv = document.querySelector(
      'div[class*="overflow-y-auto"], div[class*="overflow-auto"]',
    );
    const target = scrollableDiv || window;
    const steps = Math.ceil(Math.abs(dist) / 80);
    const stepDist = dist / steps;
    for (let i = 0; i < steps; i++) {
      if (target instanceof Element) {
        target.scrollBy({ top: stepDist, behavior: 'smooth' });
      } else {
        target.scrollBy({ top: stepDist, behavior: 'smooth' });
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }, distance);
  await page.waitForTimeout(800);
}

async function recordDemoVideo(): Promise<void> {
  console.log('\n🎬 Recording demo video (landscape 16:9 for YouTube)...');

  const videoDir = join(OUTPUT_DIR, 'video');
  await mkdir(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const targetUrl = `${BASE_URL}/demo-preview`;

  try {
    // ── Phase 1: Setup — handle cookies in a throwaway context (no video) ──
    console.log('   Phase 1: Setup (dismiss banners)...');
    const setupContext = await browser.newContext({
      viewport: VIDEO_VIEWPORT,
    });
    const setupPage = await setupContext.newPage();
    await handleCookieConsent(setupPage);
    const setupStorage = await setupContext.storageState();
    await setupContext.close();

    // ── Phase 2: Warmup — load target page to prime cache (no video) ──
    console.log('   Phase 2: Warmup (prime cache)...');
    const warmupContext = await browser.newContext({
      viewport: VIDEO_VIEWPORT,
      storageState: setupStorage,
    });
    const warmupPage = await warmupContext.newPage();
    await warmupPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    try {
      await warmupPage.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      // Fine
    }
    try {
      await warmupPage.waitForSelector('main h1, main h2, [data-testid], nav', {
        state: 'visible',
        timeout: 10000,
      });
    } catch {
      // Fallback
    }
    await warmupPage.waitForTimeout(1000);
    const warmedStorage = await warmupContext.storageState();
    await warmupContext.close();

    // ── Phase 3: Record — fresh context with video, cloaked start ──
    console.log('   Phase 3: Recording...');
    const recordContext = await browser.newContext({
      viewport: VIDEO_VIEWPORT,
      recordVideo: { dir: videoDir, size: VIDEO_VIEWPORT },
      storageState: warmedStorage,
    });
    const page = await recordContext.newPage();

    // Cloak CSS: hide page until fully loaded to prevent flash of loading state
    const CLOAK_CSS =
      '<style id="__recorder-cloak">html{background:#09090b!important}body{opacity:0!important;transition:opacity .3s ease!important}body.__loaded{opacity:1!important}</style>';

    const cloakHandler = async (route: any) => {
      if (route.request().resourceType() !== 'document') {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      let body = await response.text();
      body = body.replace('<head>', '<head>' + CLOAK_CSS);
      await route.fulfill({ response, body });
    };
    await page.route('**/*', cloakHandler);

    // Ensure PWA flags are set before React mounts
    await page.addInitScript(() => {
      localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
      localStorage.setItem('pwa_notifications_prompted', '1');
    });

    // Navigate — auth state + cache already warmed
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      // Some pages have persistent connections
    }
    try {
      await page.waitForSelector('main h1, main h2, [data-testid], nav', {
        state: 'attached',
        timeout: 10000,
      });
    } catch {
      // Fallback
    }
    // Wait for rendering behind the cloak (images, fonts, animations)
    await page.waitForTimeout(1500);

    // Reveal: fade in the fully-loaded page
    await page.evaluate(() => {
      document.body.classList.add('__loaded');
    });
    await page.waitForTimeout(500);

    // Stop cloaking for subsequent navigations
    await page.unroute('**/*', cloakHandler);

    console.log('   ✓ Page ready, recording walkthrough...');

    // ── Walkthrough steps ──

    // Dashboard (15s)
    console.log('   ▸ Dashboard...');
    await page.waitForTimeout(3000);
    await smoothScroll(page, 400);
    await page.waitForTimeout(4000);

    // Try expanding a card
    try {
      await page.click(
        '#moon-phase [data-component="expandable-card"] > [role="button"]',
        { timeout: 3000 },
      );
      await page.waitForTimeout(3000);
      await page.click(
        '#moon-phase [data-component="expandable-card"] > [role="button"]',
        { timeout: 3000 },
      );
    } catch {
      // Optional
    }
    await page.waitForTimeout(2000);

    // Tarot (15s)
    console.log('   ▸ Tarot...');
    try {
      await page.click('button:has-text("Tarot")', { timeout: 5000 });
    } catch {
      // Tab may not exist
    }
    await page.waitForTimeout(5000);
    await smoothScroll(page, 300);
    await page.waitForTimeout(5000);

    // Horoscope (15s)
    console.log('   ▸ Horoscope...');
    try {
      await page.click('button:has-text("Horoscope")', { timeout: 5000 });
    } catch {
      // Tab may not exist
    }
    await page.waitForTimeout(5000);
    await smoothScroll(page, 300);
    await page.waitForTimeout(5000);

    // Back to dashboard (5s)
    console.log('   ▸ Return to Dashboard...');
    try {
      await page.click('button:has-text("Home")', { timeout: 5000 });
    } catch {
      // Tab may not exist
    }
    await page.waitForTimeout(5000);

    // ── Finalize recording ──
    console.log('   ⏸  Final pause before saving...');
    await page.waitForTimeout(2000);

    const finalRawPath = join(videoDir, 'demo-raw.webm');
    const rawVideoPath = await page.video()?.path();
    await recordContext.close();
    await page.video()?.saveAs(finalRawPath);
    if (rawVideoPath && rawVideoPath !== finalRawPath) {
      await unlink(rawVideoPath).catch(() => {});
    }

    // Trim black frames from start
    await trimBlackFrames(finalRawPath);
    console.log(`   ✓ Raw video: ${finalRawPath}`);
  } finally {
    await browser.close();
  }

  // ── Generate TTS narration ──
  const videoDir2 = join(OUTPUT_DIR, 'video');
  console.log('\n   🎙️  Generating TTS narration...');
  const narrationPath = join(videoDir2, 'narration.mp3');

  if (!process.env.OPENAI_API_KEY) {
    console.log(
      '   ⚠ OPENAI_API_KEY not set — skipping TTS narration. Set it in .env.local to generate voiceover.',
    );
  } else {
    try {
      const { generateVoiceover } = await import('../src/lib/tts/index');
      const audioBuffer = await generateVoiceover(VOICEOVER_SCRIPT, {
        voiceName: 'shimmer',
        speed: 1.0,
        model: 'tts-1-hd',
      });
      await writeFile(narrationPath, Buffer.from(audioBuffer));
      console.log(`   ✓ Narration: ${narrationPath}`);
    } catch (error) {
      console.error('   ✗ TTS generation failed:', error);
    }
  }

  // ── Compose final video ──
  const rawVideoFile = join(videoDir2, 'demo-raw.webm');
  const finalVideoPath = join(videoDir2, 'demo.mp4');

  if (!existsSync(rawVideoFile)) {
    console.log('   ⚠ No raw video to compose');
    return;
  }

  console.log('\n   🎞️  Composing final video...');

  try {
    // Convert WebM to MP4
    const tempMp4 = join(videoDir2, 'demo-temp.mp4');
    execFileSync('ffmpeg', [
      '-y',
      '-i',
      rawVideoFile,
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      'medium',
      '-crf',
      '23',
      tempMp4,
    ]);

    if (existsSync(narrationPath)) {
      // Mix narration with video
      execFileSync('ffmpeg', [
        '-y',
        '-i',
        tempMp4,
        '-i',
        narrationPath,
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-shortest',
        finalVideoPath,
      ]);
      await unlink(tempMp4).catch(() => {});
      console.log(`   ✓ Final video: ${finalVideoPath}`);
    } else {
      // No narration — just rename
      await copyFile(tempMp4, finalVideoPath);
      await unlink(tempMp4).catch(() => {});
      console.log(`   ✓ Final video (no audio): ${finalVideoPath}`);
    }
  } catch (error) {
    console.error('   ✗ Video composition failed:', error);
    console.log('   💡 Make sure ffmpeg is installed: brew install ffmpeg');
  }
}

// ─── Copy App Icon ───────────────────────────────────────────────────────────

async function copyAppIcon(): Promise<void> {
  console.log('\n📋 Copying app icon...');
  await mkdir(OUTPUT_DIR, { recursive: true });

  const srcPath = join(PUBLIC_DIR, 'icons', 'icon-512x512.png');
  const destPath = join(OUTPUT_DIR, 'icon.png');

  if (!existsSync(srcPath)) {
    console.log(`   ⚠ Icon not found at ${srcPath}`);
    return;
  }

  await copyFile(srcPath, destPath);
  console.log(`   ✓ ${destPath}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

type Command = 'screenshots' | 'feature-graphic' | 'framed' | 'video' | 'all';

async function main() {
  const args = process.argv.slice(2);
  const command = (args[0] || 'all') as Command;

  const validCommands: Command[] = [
    'screenshots',
    'feature-graphic',
    'framed',
    'video',
    'all',
  ];

  if (!validCommands.includes(command)) {
    console.error(`Unknown command: ${command}`);
    console.error(`Valid commands: ${validCommands.join(', ')}`);
    process.exit(1);
  }

  console.log('🏪 Google Play Store Asset Generator');
  console.log('━'.repeat(50));
  console.log(`Command: ${command}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const startTime = Date.now();

  try {
    switch (command) {
      case 'screenshots':
        await copyAppIcon();
        await captureScreenshots();
        break;

      case 'feature-graphic':
        await generateFeatureGraphic();
        break;

      case 'framed':
        await generateFramedScreenshots();
        break;

      case 'video':
        await recordDemoVideo();
        break;

      case 'all':
        await copyAppIcon();
        await captureScreenshots();
        await generateFeatureGraphic();
        await generateFramedScreenshots();
        await recordDemoVideo();
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

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
