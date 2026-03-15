/**
 * Snippet Recording Configurations
 *
 * Detailed Playwright recording instructions for the 6 TikTok snippet videos.
 * Each config maps a snippet script ID to precise browser actions that produce
 * 12-15 seconds of footage (trimmed to ~10s in post).
 *
 * These are standalone configs — they do NOT feed into the generated
 * FeatureRecordingConfig pipeline in app-feature-recordings.ts. Instead they
 * are consumed directly by the snippet recording runner.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SnippetAction {
  type: 'click' | 'scroll' | 'wait' | 'type' | 'hover';
  /** CSS selector for click / hover / type targets */
  selector?: string;
  /** Text to enter (type action) */
  value?: string;
  /** Pixels to scroll — positive = down, negative = up (scroll action) */
  scrollAmount?: number;
  /** Milliseconds to hold an action or pause */
  duration?: number;
}

export interface SnippetScene {
  /** URL path to navigate to */
  path: string;
  /** CSS selector to wait for before starting scene actions */
  waitForSelector?: string;
  /** Ordered browser actions within this scene */
  actions: SnippetAction[];
  /** How long to hold this scene after actions complete (ms) */
  holdDuration: number;
}

export interface SnippetRecordingConfig {
  scriptId: string;
  scenes: SnippetScene[];
  viewport: { width: number; height: number };
  darkMode: boolean;
}

// ---------------------------------------------------------------------------
// Mobile TikTok viewport (9:16). 390px triggers mobile CSS on most breakpoints.
// Upscaled 3x to 1170x2080 in post-processing.
// ---------------------------------------------------------------------------

const TIKTOK_VIEWPORT = { width: 390, height: 692 } as const;

// ---------------------------------------------------------------------------
// Configs
// ---------------------------------------------------------------------------

const snippetBirthChart: SnippetRecordingConfig = {
  scriptId: 'snippet-birth-chart',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Full chart wheel loads and renders
    {
      path: '/birth-chart',
      waitForSelector: '[data-testid="chart-visualization"] svg',
      actions: [{ type: 'wait', duration: 1500 }],
      holdDuration: 3500,
    },
    // Scene 2 — Scroll down to planet interpretations (Chiron / Lilith rows)
    {
      path: '/birth-chart',
      waitForSelector: '[data-testid="planets-list"]',
      actions: [
        { type: 'scroll', scrollAmount: 380, duration: 800 },
        { type: 'wait', duration: 400 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Scroll back up slightly to show full chart overview
    {
      path: '/birth-chart',
      actions: [{ type: 'scroll', scrollAmount: -200, duration: 600 }],
      holdDuration: 2500,
    },
  ],
};

const snippetCompatibility: SnippetRecordingConfig = {
  scriptId: 'snippet-compatibility',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Land on a specific compatibility match page (Leo & Scorpio)
    {
      path: '/grimoire/compatibility/leo-and-scorpio',
      waitForSelector: 'h1',
      actions: [{ type: 'wait', duration: 800 }],
      holdDuration: 3000,
    },
    // Scene 2 — Scroll to score bars (love / friendship / work scores)
    {
      path: '/grimoire/compatibility/leo-and-scorpio',
      waitForSelector: '.h-2.bg-zinc-800',
      actions: [
        { type: 'scroll', scrollAmount: 320, duration: 700 },
        { type: 'wait', duration: 300 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Scroll further to strengths / challenges section and hold
    {
      path: '/grimoire/compatibility/leo-and-scorpio',
      actions: [{ type: 'scroll', scrollAmount: 280, duration: 600 }],
      holdDuration: 2500,
    },
  ],
};

const snippetAngelNumber: SnippetRecordingConfig = {
  scriptId: 'snippet-angel-number',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Open grimoire and type "444" into the search bar
    {
      path: '/grimoire',
      waitForSelector: '[data-testid="grimoire-search"]',
      actions: [
        {
          type: 'click',
          selector: '[data-testid="grimoire-search"]',
          duration: 300,
        },
        { type: 'wait', duration: 400 },
        {
          type: 'type',
          selector: '[data-testid="grimoire-search"]',
          value: '444',
          duration: 600,
        },
        { type: 'wait', duration: 800 },
      ],
      holdDuration: 2000,
    },
    // Scene 2 — Click the 444 angel number result
    {
      path: '/grimoire',
      waitForSelector: '#grimoire-search-results a, .max-h-80 a',
      actions: [
        {
          type: 'click',
          selector:
            '#grimoire-search-results a[href*="angel-numbers/444"], .max-h-80 a[href*="angel-numbers/444"], #grimoire-search-results a:first-child, .max-h-80 a:first-child',
          duration: 300,
        },
        { type: 'wait', duration: 1200 },
      ],
      holdDuration: 2000,
    },
    // Scene 3 — Scroll to the key meaning paragraph on the angel number page
    {
      path: '/grimoire/angel-numbers/444',
      waitForSelector: 'h1',
      actions: [{ type: 'scroll', scrollAmount: 350, duration: 700 }],
      holdDuration: 3000,
    },
  ],
};

const snippetTransitAlert: SnippetRecordingConfig = {
  scriptId: 'snippet-transit-alert',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — App dashboard with Sky Now widget visible
    {
      path: '/app',
      waitForSelector: '[data-testid="sky-now-widget"]',
      actions: [
        { type: 'wait', duration: 600 },
        {
          type: 'scroll',
          selector: '#sky-now',
          scrollAmount: 0,
          duration: 400,
        },
      ],
      holdDuration: 2500,
    },
    // Scene 2 — Expand the Sky Now card and show planet list
    {
      path: '/app',
      waitForSelector: '[data-testid="sky-now-widget"]',
      actions: [
        {
          type: 'click',
          selector: '[data-testid="sky-now-widget"]',
          duration: 300,
        },
        { type: 'wait', duration: 800 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Click on a specific planet item (Mercury) for detail
    {
      path: '/app',
      waitForSelector: '[data-testid="sky-now-expand"]',
      actions: [
        {
          type: 'click',
          selector:
            '[data-testid="planet-item"][data-planet="Mercury"], [data-testid="planet-item"]:nth-child(3)',
          duration: 300,
        },
        { type: 'wait', duration: 600 },
      ],
      holdDuration: 3000,
    },
    // Scene 4 — Scroll to Transit of the Day section and hold
    {
      path: '/app',
      actions: [
        { type: 'scroll', scrollAmount: 250, duration: 600 },
        { type: 'wait', duration: 400 },
      ],
      holdDuration: 2000,
    },
  ],
};

const snippetTarotPull: SnippetRecordingConfig = {
  scriptId: 'snippet-tarot-pull',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Tarot page loads with daily card visible
    {
      path: '/tarot',
      waitForSelector: 'h2, .text-lg.font-medium',
      actions: [{ type: 'wait', duration: 1000 }],
      holdDuration: 3500,
    },
    // Scene 2 — Scroll down to the card reading / interpretation text
    {
      path: '/tarot',
      actions: [
        { type: 'scroll', scrollAmount: 300, duration: 700 },
        { type: 'wait', duration: 400 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Scroll a little further to show transit connection and hold
    {
      path: '/tarot',
      actions: [{ type: 'scroll', scrollAmount: 200, duration: 500 }],
      holdDuration: 3000,
    },
  ],
};

const snippetHoroscopeSpeed: SnippetRecordingConfig = {
  scriptId: 'snippet-horoscope-speed',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Fast scroll through the monthly horoscope content
    {
      path: '/grimoire/horoscopes/leo/2026/march',
      waitForSelector: 'h1',
      actions: [
        { type: 'wait', duration: 600 },
        { type: 'scroll', scrollAmount: 700, duration: 1800 },
      ],
      holdDuration: 1500,
    },
    // Scene 2 — Snap stop on a mid-page paragraph (the impactful prediction)
    {
      path: '/grimoire/horoscopes/leo/2026/march',
      actions: [
        { type: 'scroll', scrollAmount: -250, duration: 500 },
        { type: 'wait', duration: 300 },
      ],
      holdDuration: 3500,
    },
    // Scene 3 — Hold for the reaction beat, let the viewer read
    {
      path: '/grimoire/horoscopes/leo/2026/march',
      actions: [{ type: 'wait', duration: 200 }],
      holdDuration: 3000,
    },
  ],
};

const snippetAstralChat: SnippetRecordingConfig = {
  scriptId: 'snippet-astral-chat',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Type Saturn return question into Astral Chat
    {
      path: '/guide',
      waitForSelector: '[data-testid="guide-input"]',
      actions: [
        {
          type: 'click',
          selector: '[data-testid="guide-input"]',
          duration: 300,
        },
        { type: 'wait', duration: 400 },
        {
          type: 'type',
          selector: '[data-testid="guide-input"]',
          value: 'What does my Saturn return mean for my career?',
          duration: 1200,
        },
        { type: 'wait', duration: 300 },
        {
          type: 'click',
          selector: '[data-testid="guide-submit"]',
          duration: 300,
        },
      ],
      holdDuration: 2000,
    },
    // Scene 2 — Wait for response to stream in and show grimoire-sourced detail
    {
      path: '/guide',
      actions: [{ type: 'wait', duration: 3500 }],
      holdDuration: 3000,
    },
    // Scene 3 — Scroll through response showing depth
    {
      path: '/guide',
      actions: [{ type: 'scroll', scrollAmount: 200, duration: 600 }],
      holdDuration: 2500,
    },
  ],
};

const snippetCosmicScore: SnippetRecordingConfig = {
  scriptId: 'snippet-cosmic-score',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Dashboard with cosmic score visible
    {
      path: '/app',
      waitForSelector: '[data-testid="cosmic-score"], .cosmic-score',
      actions: [{ type: 'wait', duration: 1000 }],
      holdDuration: 3000,
    },
    // Scene 2 — Scroll to pattern breakdown
    {
      path: '/app',
      actions: [
        { type: 'scroll', scrollAmount: 250, duration: 700 },
        { type: 'wait', duration: 400 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Hold on pattern detail
    {
      path: '/app',
      actions: [{ type: 'wait', duration: 300 }],
      holdDuration: 2500,
    },
  ],
};

const snippetRealAstronomy: SnippetRecordingConfig = {
  scriptId: 'snippet-real-astronomy',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Sky page showing precise planetary positions
    {
      path: '/sky',
      waitForSelector: '[data-testid="sky-now-widget"], .planet-position',
      actions: [{ type: 'wait', duration: 1200 }],
      holdDuration: 3500,
    },
    // Scene 2 — Scroll through planets showing exact degrees and arcminutes
    {
      path: '/sky',
      actions: [
        { type: 'scroll', scrollAmount: 250, duration: 700 },
        { type: 'wait', duration: 400 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Hold on precise data
    {
      path: '/sky',
      actions: [{ type: 'wait', duration: 200 }],
      holdDuration: 2500,
    },
  ],
};

const snippetMoonSpells: SnippetRecordingConfig = {
  scriptId: 'snippet-moon-spells',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Spells page with moon phase filter visible
    {
      path: '/grimoire/spells',
      waitForSelector: 'h1',
      actions: [{ type: 'wait', duration: 1000 }],
      holdDuration: 3500,
    },
    // Scene 2 — Scroll through filtered spell list
    {
      path: '/grimoire/spells',
      actions: [
        { type: 'scroll', scrollAmount: 300, duration: 800 },
        { type: 'wait', duration: 300 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Hold on a specific spell
    {
      path: '/grimoire/spells',
      actions: [{ type: 'scroll', scrollAmount: -100, duration: 400 }],
      holdDuration: 2500,
    },
  ],
};

const snippetCircleFriends: SnippetRecordingConfig = {
  scriptId: 'snippet-circle-friends',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Profile page with circle / friend cards visible
    {
      path: '/profile',
      waitForSelector: '[data-testid="friend-card"], .friend-card',
      actions: [{ type: 'wait', duration: 800 }],
      holdDuration: 3000,
    },
    // Scene 2 — Tap a friend card to see compatibility and aspects
    {
      path: '/profile',
      actions: [
        {
          type: 'click',
          selector: '[data-testid="friend-card"]',
          duration: 300,
        },
        { type: 'wait', duration: 1000 },
      ],
      holdDuration: 3000,
    },
    // Scene 3 — Scroll to aspect highlights
    {
      path: '/profile',
      actions: [
        { type: 'scroll', scrollAmount: 200, duration: 600 },
        { type: 'wait', duration: 300 },
      ],
      holdDuration: 2500,
    },
  ],
};

const snippetTarotTransits: SnippetRecordingConfig = {
  scriptId: 'snippet-tarot-transits',
  viewport: TIKTOK_VIEWPORT,
  darkMode: true,
  scenes: [
    // Scene 1 — Tarot page with daily card visible
    {
      path: '/tarot',
      waitForSelector: 'h2, .text-lg.font-medium',
      actions: [{ type: 'wait', duration: 1000 }],
      holdDuration: 3000,
    },
    // Scene 2 — Scroll to transit connection section
    {
      path: '/tarot',
      actions: [
        { type: 'scroll', scrollAmount: 300, duration: 700 },
        { type: 'wait', duration: 400 },
      ],
      holdDuration: 3500,
    },
    // Scene 3 — Hold on transit connection detail showing card-to-transit link
    {
      path: '/tarot',
      actions: [
        { type: 'scroll', scrollAmount: 150, duration: 400 },
        { type: 'wait', duration: 300 },
      ],
      holdDuration: 2500,
    },
  ],
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const SNIPPET_RECORDING_CONFIGS: Record<string, SnippetRecordingConfig> =
  {
    'snippet-birth-chart': snippetBirthChart,
    'snippet-compatibility': snippetCompatibility,
    'snippet-angel-number': snippetAngelNumber,
    'snippet-transit-alert': snippetTransitAlert,
    'snippet-tarot-pull': snippetTarotPull,
    'snippet-horoscope-speed': snippetHoroscopeSpeed,
    'snippet-astral-chat': snippetAstralChat,
    'snippet-cosmic-score': snippetCosmicScore,
    'snippet-real-astronomy': snippetRealAstronomy,
    'snippet-moon-spells': snippetMoonSpells,
    'snippet-circle-friends': snippetCircleFriends,
    'snippet-tarot-transits': snippetTarotTransits,
  };

/**
 * Get a snippet recording config by script ID.
 * Throws if the ID is not found.
 */
export function getSnippetRecording(scriptId: string): SnippetRecordingConfig {
  const config = SNIPPET_RECORDING_CONFIGS[scriptId];
  if (!config) {
    throw new Error(`No snippet recording config for script: ${scriptId}`);
  }
  return config;
}

/**
 * All snippet script IDs that have recording configs.
 */
export function getAllSnippetIds(): string[] {
  return Object.keys(SNIPPET_RECORDING_CONFIGS);
}
