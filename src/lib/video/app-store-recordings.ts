/**
 * App Store Demo Recording Configs
 *
 * Hand-crafted Playwright recording configs for App Store preview videos.
 * NOT derived from TikTok scripts — no voiceover sync, no script timing.
 *
 * Design goals:
 * - Explore each page in full detail (not truncated)
 * - Natural pacing: deliberate but not lingering (~1.5–2.5s view time per beat)
 * - Open dropdowns, scroll child components, interact with the app
 * - Three videos: dashboard, horoscope, tarot
 *
 * Run with:
 *   tsx scripts/record-app-features.ts --source appstore --device iphone65
 *   tsx scripts/record-app-features.ts --source appstore dashboard-appstore --device iphone65
 */

import type {
  FeatureRecordingConfig,
  RecordingStep,
} from './app-feature-recordings';

// ─── Timing constants ──────────────────────────────────────────────────────────
/** Brief pause after landing on a page / after a tap */
const TAP_SETTLE = 600;
/** Standard view beat — enough time to read a section */
const VIEW = 1800;
/** Longer view beat — for content-rich sections */
const VIEW_LONG = 2500;
/** Short scroll settle pause */
const SCROLL_SETTLE = 900;
/** After opening a modal/dropdown */
const MODAL_VIEW = 2200;
// ──────────────────────────────────────────────────────────────────────────────

const dismissModals: RecordingStep[] = [
  { type: 'pressKey', key: 'Escape', description: 'Dismiss any open modals' },
  { type: 'wait', duration: 300, description: 'Wait for modal to close' },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

const dashboardAppStore: FeatureRecordingConfig = {
  id: 'dashboard-appstore',
  name: 'Dashboard — App Store Demo',
  startUrl: '/app',
  requiresAuth: true,
  durationSeconds: 30,
  steps: [
    ...dismissModals,

    // Land on dashboard — show top of page
    {
      type: 'wait',
      duration: VIEW,
      description: 'Show dashboard hero: cosmic score + sky now',
    },

    // Scroll to Sky Now widget and expand it
    {
      type: 'scroll',
      scrollTo: '[data-testid="sky-now-widget"]',
      description: 'Scroll to Sky Now widget',
    },
    { type: 'wait', duration: SCROLL_SETTLE, description: 'Let scroll settle' },
    {
      type: 'click',
      selector: '[data-testid="sky-now-widget"]',
      description: 'Expand Sky Now widget',
      optional: true,
      force: true,
    },
    {
      type: 'wait',
      duration: MODAL_VIEW,
      description: 'View planetary positions detail',
    },

    // Scroll inside the sky-now widget to see more planets
    {
      type: 'scroll',
      distance: 200,
      scrollContainer:
        '[data-testid="sky-now-widget"] [class*="overflow-y-auto"]',
      description: 'Scroll planet list inside Sky Now',
    },
    { type: 'wait', duration: VIEW, description: 'View more planets' },
    {
      type: 'pressKey',
      key: 'Escape',
      description: 'Close Sky Now modal',
      optional: true,
    },
    { type: 'wait', duration: TAP_SETTLE, description: 'Settle after close' },

    // Scroll down to tarot daily card
    {
      type: 'scroll',
      scrollTo: '[data-testid="tarot-daily-card"]',
      description: 'Scroll to daily tarot card',
    },
    { type: 'wait', duration: VIEW_LONG, description: 'View tarot daily card' },

    // Scroll down to crystal recommendation
    {
      type: 'scroll',
      scrollTo: '[data-testid="crystal-card"]',
      description: 'Scroll to crystal recommendation',
      optional: true,
    },
    { type: 'wait', duration: VIEW, description: 'View crystal card' },

    // Scroll down further to see transit overview
    { type: 'scroll', distance: 350, description: 'Scroll to transit section' },
    { type: 'wait', duration: VIEW_LONG, description: 'View transit overview' },

    // Scroll down to rituals / journal streak
    { type: 'scroll', distance: 350, description: 'Scroll to rituals section' },
    {
      type: 'wait',
      duration: VIEW,
      description: 'View rituals and journal streak',
    },

    // Scroll back up to show the full dashboard again
    { type: 'scroll', distance: -800, description: 'Scroll back up to top' },
    {
      type: 'wait',
      duration: VIEW,
      description: 'Final view of dashboard top',
    },
  ],
};

// ─── Horoscope ────────────────────────────────────────────────────────────────

const horoscopeAppStore: FeatureRecordingConfig = {
  id: 'horoscope-appstore',
  name: 'Horoscope — App Store Demo',
  startUrl: '/horoscope',
  requiresAuth: true,
  durationSeconds: 32,
  steps: [
    // Land on horoscope page
    {
      type: 'wait',
      duration: VIEW,
      description: 'Show horoscope hero section',
    },

    // Scroll down to personal horoscope content
    {
      type: 'scroll',
      distance: 300,
      description: 'Scroll into horoscope body',
    },
    {
      type: 'wait',
      duration: VIEW,
      description: 'View personalised horoscope text',
    },

    // Scroll to numerology section
    {
      type: 'scroll',
      distance: 300,
      description: 'Scroll to numerology section',
    },
    { type: 'wait', duration: VIEW, description: 'View numerology section' },

    // Open personal numerology day modal
    {
      type: 'click',
      selector: '[data-testid="numerology-day"]',
      description: 'Open personal numerology day modal',
      optional: true,
      force: true,
    },
    {
      type: 'wait',
      duration: MODAL_VIEW,
      description: 'View numerology modal detail',
    },

    // Close modal and continue
    { type: 'pressKey', key: 'Escape', description: 'Close numerology modal' },
    {
      type: 'wait',
      duration: TAP_SETTLE,
      description: 'Settle after modal close',
    },

    // Scroll to transit wisdom section
    {
      type: 'scroll',
      distance: 350,
      description: 'Scroll to Transit Wisdom section',
    },
    {
      type: 'wait',
      duration: VIEW_LONG,
      description: 'View transit wisdom — active transits with severity',
    },

    // Scroll down into transit list to show more
    {
      type: 'scroll',
      distance: 300,
      description: 'Scroll through transit list',
    },
    { type: 'wait', duration: VIEW, description: 'View more transits' },

    // Tap a transit to expand it
    {
      type: 'click',
      selector:
        '[data-testid="transit-card"], [class*="transit"] button, [class*="transit"] [role="button"]',
      description: 'Expand a transit card for detail',
      optional: true,
      force: true,
    },
    {
      type: 'wait',
      duration: MODAL_VIEW,
      description: 'Read transit interpretation',
    },
    {
      type: 'pressKey',
      key: 'Escape',
      description: 'Close transit detail',
      optional: true,
    },
    { type: 'wait', duration: TAP_SETTLE, description: 'Settle' },

    // Scroll to 30-day forecast
    { type: 'scroll', distance: 400, description: 'Scroll to 30-day forecast' },
    {
      type: 'wait',
      duration: VIEW_LONG,
      description: 'View 30-day forecast section',
    },

    // Scroll further to see the month/year numerology comparison
    {
      type: 'scroll',
      distance: 300,
      description: 'Scroll to month/year numerology',
    },
    {
      type: 'wait',
      duration: VIEW,
      description: 'View month and year numbers',
    },
  ],
};

// ─── Tarot ────────────────────────────────────────────────────────────────────

const tarotAppStore: FeatureRecordingConfig = {
  id: 'tarot-appstore',
  name: 'Tarot — App Store Demo',
  startUrl: '/tarot',
  requiresAuth: true,
  durationSeconds: 30,
  steps: [
    // Land on tarot page — daily card visible
    {
      type: 'wait',
      duration: VIEW,
      description: 'Show tarot page — daily card',
    },

    // Scroll down to see daily card detail
    {
      type: 'scroll',
      distance: 250,
      description: 'Scroll to show full daily card',
    },
    {
      type: 'wait',
      duration: VIEW_LONG,
      description: 'View daily card and transit connection',
    },

    // Scroll to pattern section
    {
      type: 'scroll',
      distance: 350,
      description: 'Scroll to tarot patterns section',
    },
    {
      type: 'wait',
      duration: VIEW,
      description: 'View patterns section intro',
    },

    // Tap 7-day pattern
    {
      type: 'click',
      selector: '[data-testid="pattern-7days"]',
      description: 'Open 7-day pattern',
      optional: true,
      force: true,
    },
    { type: 'wait', duration: VIEW, description: 'View 7-day card pattern' },

    // Tap 30-day pattern
    {
      type: 'click',
      selector: '[data-testid="pattern-30days"]',
      description: 'Open 30-day pattern',
      optional: true,
      force: true,
    },
    {
      type: 'wait',
      duration: MODAL_VIEW,
      description: 'View 30-day pattern — more data',
    },

    // Tap 90-day pattern
    {
      type: 'click',
      selector: '[data-testid="pattern-90days"]',
      description: 'Open 90-day pattern',
      optional: true,
      force: true,
    },
    {
      type: 'wait',
      duration: MODAL_VIEW,
      description: 'View 90-day deep pattern',
    },

    // Scroll down to tarot spreads section
    {
      type: 'scroll',
      distance: 400,
      description: 'Scroll to tarot spreads section',
    },
    { type: 'wait', duration: VIEW, description: 'View spreads section' },

    // Start a Past-Present-Future spread
    {
      type: 'click',
      selector:
        '[data-testid="tarot-spreads-section"] button:has-text("Past"), [data-testid="tarot-spreads-section"] button:first-child',
      description: 'Select Past-Present-Future spread',
      optional: true,
      force: true,
    },
    { type: 'wait', duration: TAP_SETTLE, description: 'Settle' },
    {
      type: 'click',
      selector:
        'button:has-text("Start Reading"), button:has-text("Draw"), button:has-text("Begin")',
      description: 'Start the reading',
      optional: true,
      force: true,
    },
    {
      type: 'wait',
      duration: VIEW_LONG,
      description: 'View spread cards drawn',
    },

    // Scroll to see transit overlay on first card
    {
      type: 'scroll',
      scrollTo: '[data-testid="spread-card-0"]',
      description: 'Scroll to first spread card',
      optional: true,
    },
    { type: 'wait', duration: VIEW, description: 'View first spread card' },

    // Toggle transit detail
    {
      type: 'click',
      selector: '[data-testid="spread-transit-toggle-0"]',
      description: 'Show transit connection for card',
      optional: true,
      force: true,
    },
    {
      type: 'wait',
      duration: VIEW_LONG,
      description: 'View transit-connected interpretation',
    },
  ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const APP_STORE_RECORDINGS: FeatureRecordingConfig[] = [
  dashboardAppStore,
  horoscopeAppStore,
  tarotAppStore,
];

export function getAppStoreRecording(id: string): FeatureRecordingConfig {
  const config = APP_STORE_RECORDINGS.find((r) => r.id === id);
  if (!config) {
    throw new Error(
      `No App Store recording config found for: ${id}. Valid IDs: ${APP_STORE_RECORDINGS.map((r) => r.id).join(', ')}`,
    );
  }
  return config;
}

export function getAllAppStoreIds(): string[] {
  return APP_STORE_RECORDINGS.map((r) => r.id);
}
