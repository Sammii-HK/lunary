/**
 * TikTok Demo Scripts
 *
 * Storyboard scripts that define what each feature demo video shows,
 * the pacing/timing, and what Playwright needs to capture.
 *
 * These scripts are the SOURCE OF TRUTH for:
 * 1. What the TikTok video shows (scenes)
 * 2. Text overlays and voiceover
 * 3. Timing for each scene
 * 4. What the Playwright recording config needs to do
 *
 * Flow: Script → Playwright config → Recording → Remotion compose → Post
 *
 * CONTENT RULES:
 * - Hooks: 5-8 words max. Must work on mute.
 * - Text overlays: 6 words max. Pattern interrupts > explanations.
 * - Voiceover: 3.0-4.0 words/sec. Conversational, not list-y.
 * - Captions: End with question or challenge. Under 150 chars first line.
 * - Hashtags: 3-5 max. 1 broad + 1 niche + 1 branded + 1-2 topic.
 */

import { SCRIPT_GENERATORS } from './tiktok-script-generators';
import type { SkyData } from './tiktok-sky-data';

export type { SkyData } from './tiktok-sky-data';

export interface TikTokScript {
  /** Unique ID - matches recording config ID */
  id: string;
  /** Video title (internal reference) */
  title: string;
  /** Tier: 1 = core, 2 = deep dive, 3 = grimoire */
  tier: 1 | 2 | 3;
  /** Video category for content mix */
  category:
    | 'feature-reveal'
    | 'walkthrough'
    | 'deep-dive'
    | 'did-you-know'
    | 'how-to'
    | 'comparison';
  /** Total video duration in seconds */
  totalSeconds: number;
  /** The hook - what stops the scroll (first 1-3s) */
  hook: {
    /** Text overlay shown on screen */
    text: string;
    /** Duration in seconds */
    durationSeconds: number;
  };
  /** Ordered scenes that make up the video */
  scenes: Scene[];
  /** Outro / CTA */
  outro: {
    /** CTA text overlay */
    text: string;
    /** Duration in seconds */
    durationSeconds: number;
  };
  /** Voiceover script (for TTS generation) */
  voiceover: string;
  /** Suggested text overlays at specific timestamps */
  textOverlays: TextOverlay[];
  /** Suggested caption for posting */
  caption: string;
  /** Hashtags */
  hashtags: string[];
  /** What Playwright needs to do (high-level) */
  playwrightNotes: string;
}

export interface Scene {
  /** What's happening on screen */
  description: string;
  /** App path being shown */
  path: string;
  /** Duration in seconds */
  durationSeconds: number;
  /** Playwright action needed */
  action:
    | 'show' // Just display the page
    | 'scroll' // Scroll to reveal content
    | 'click' // Click an element
    | 'type' // Type into input
    | 'navigate' // Go to new page
    | 'expand' // Expand a card/section
    | 'wait'; // Wait for content to load/animate
  /** Selector or target (for click/type/expand) */
  target?: string;
  /** Scroll distance in px (for scroll action) */
  scrollDistance?: number;
  /** Selector to scroll into view (alternative to scrollDistance) */
  scrollTo?: string;
  /** Selector for a specific scroll container (for scrolling within nested elements) */
  scrollContainer?: string;
  /** Text to type (for type action) */
  typeText?: string;
  /** What the viewer should notice */
  focusPoint: string;
  /** Voiceover text spoken during this scene — used for timing sync */
  voiceoverLine?: string;
  /**
   * Optional zoom target for this scene.
   * x, y are 0-1 fractions of screen (e.g. 0.5, 0.35 = top-center).
   * scale is the zoom multiplier (e.g. 1.25 = 25% zoom in).
   * When set, the video zooms into this area for the duration of the scene.
   */
  zoomTo?: { x: number; y: number; scale: number };
  /**
   * Optional tap position for click/expand actions (0-1 fraction of screen).
   * When set, a touch-ripple animation appears at this position.
   * If omitted on a click/expand action, a default center position is used.
   */
  tapPosition?: { x: number; y: number };
}

export interface TextOverlay {
  /** Text to show */
  text: string;
  /** When to show (seconds from start) */
  startSeconds: number;
  /** How long to show */
  durationSeconds: number;
  /** Position metadata (rendering handled by Remotion component positioning) */
  position: 'top' | 'center' | 'bottom';
}

// ============================================================================
// TIER 1: CORE FEATURE DEMOS
// ============================================================================

const dashboardOverview: TikTokScript = {
  id: 'dashboard-overview',
  title: 'POV: Your Morning Cosmic Check-In',
  tier: 1,
  category: 'walkthrough',
  totalSeconds: 20,
  hook: {
    text: "your astrology app doesn't do this.",
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Dashboard loads — horoscope + ritual visible',
      path: '/app',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Personalized horoscope, daily ritual, cosmic score',
      voiceoverLine:
        'First thing I see... personalized. Not a generic horoscope.',
    },
    {
      description: 'Scroll to Sky Now widget — positioned in top third',
      path: '/app',
      durationSeconds: 1.5,
      action: 'scroll',
      scrollTo: '[data-testid="sky-now-widget"]',
      focusPoint: 'Sky Now widget in top third of screen',
      voiceoverLine: 'Moon phase... okay cool. But watch this.',
    },
    {
      description: 'Tap Sky Now — planets cascade open',
      path: '/app',
      durationSeconds: 1.5,
      action: 'expand',
      target: '[data-testid="sky-now-widget"]',
      focusPoint: 'Planet list expanding with houses',
      voiceoverLine: 'Every planet. Which house.',
      zoomTo: { x: 0.5, y: 0.32, scale: 1.28 },
      tapPosition: { x: 0.5, y: 0.32 },
    },
    {
      description:
        'Scroll through expanded planet list inside Sky Now dropdown',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 250,
      scrollContainer:
        '[data-testid="sky-now-widget"] [class*="overflow-y-auto"]',
      focusPoint: 'Multiple planets with house numbers scrolling past',
      voiceoverLine:
        "YOUR chart... not just signs. Houses. That's the difference.",
    },
    {
      description: 'Scroll to tarot section — centered on screen',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollTo: '[data-testid="tarot-daily-card"]',
      focusPoint: 'Tarot card centered on screen',
      voiceoverLine:
        "And the tarot? It's connected to your transits. Not random.",
    },
    {
      description: 'Scroll to crystal — centered on screen',
      path: '/app',
      durationSeconds: 1.5,
      action: 'scroll',
      scrollTo: '[data-testid="crystal-card"]',
      focusPoint: 'Crystal centered on screen',
      voiceoverLine: 'Even the crystal matches. All of this... every morning.',
    },
  ],
  outro: {
    text: 'link in bio',
    durationSeconds: 2,
  },
  voiceover:
    "First thing I see... personalized. Not a generic horoscope. Moon phase... okay cool. But watch this. Every planet. Which house. YOUR chart... not just signs. Houses. That's the difference. And the tarot? It's connected to your transits. Not random. Even the crystal matches. All of this... every morning.",
  textOverlays: [],
  caption:
    'Your astrology app shows you a horoscope. This one shows which house every planet is in, connects your tarot to your transits, and matches a crystal to your chart. Every single morning. Not generic \u2014 yours.',
  hashtags: ['astrology', 'birthchart', 'witchtok', 'lunary', 'cosmicenergy'],
  playwrightNotes:
    'Start at /app after auth. Dismiss modals. Fast scrolls (500-600px). Expand Sky Now. TikTok pacing.',
};

const horoscopeDeepDive: TikTokScript = {
  id: 'horoscope-deepdive',
  title: 'Your Horoscope Is Written for 600 Million People',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 23,
  hook: {
    text: 'Your horoscope: 600 million people. This one: 1.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description:
        'Horoscope page - personalized greeting + cosmic highlight card',
      path: '/horoscope',
      durationSeconds: 4,
      action: 'show',
      focusPoint: 'Name visible in greeting - this is FOR you, not generic',
      voiceoverLine:
        "Here's the thing... your horoscope is written for 600 million people. This one? ...Written for one.",
    },
    {
      description: 'Scroll to numerology - personal vs universal side by side',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Two different numbers - YOUR number vs the universal one',
      voiceoverLine:
        'My personal number today... completely different... from the universal one.',
    },
    {
      description: 'Tap personal day number - modal with explanation',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="numerology-day"]',
      focusPoint: 'Full breakdown of YOUR day energy',
      zoomTo: { x: 0.5, y: 0.52, scale: 1.3 },
      tapPosition: { x: 0.5, y: 0.52 },
      // No voiceoverLine — silent interaction moment
    },
    {
      description: 'Close modal, scroll to Transit Wisdom - the big reveal',
      path: '/horoscope',
      durationSeconds: 4,
      action: 'scroll',
      scrollDistance: 350,
      focusPoint: 'Which houses are activated with intensity badges',
      voiceoverLine:
        'Transit wisdom... showing which houses are activated... how intense each one is.',
    },
    {
      description: 'Scroll to aspects forming to YOUR natal planets',
      path: '/horoscope',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Exact orbs - real astronomical data, not vibes',
      voiceoverLine: 'Exact aspects... with real orbs.',
    },
    {
      description: 'Scroll to 30-day upcoming transits',
      path: '/horoscope',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Your personal forecast - see what is coming',
      voiceoverLine:
        "And a 30-day forecast... of what's coming... for my chart.",
    },
  ],
  outro: {
    text: "That's a horoscope.",
    durationSeconds: 2,
  },
  voiceover:
    "Here's the thing... your horoscope is written for 600 million people. This one? ...Written for one. My personal number today... completely different... from the universal one. Transit wisdom... showing which houses are activated... how intense each one is. Exact aspects... with real orbs. And a 30-day forecast... of what's coming... for my chart. That's a horoscope.",
  textOverlays: [
    {
      text: '600 million vs 1',
      startSeconds: 2.5,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'YOUR personal number',
      startSeconds: 7,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'houses + intensity levels',
      startSeconds: 12,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'real orbs. real data.',
      startSeconds: 16,
      durationSeconds: 2,
      position: 'top' as const,
    },
    {
      text: '30-day personal forecast',
      startSeconds: 19,
      durationSeconds: 2,
      position: 'top' as const,
    },
  ],
  caption:
    'How many people share your horoscope? About 600 million. How many share this one? One. What does YOUR personal horoscope look like?',
  hashtags: ['horoscope', 'birthchart', 'lunary', 'witchtok', 'transits'],
  playwrightNotes:
    'Navigate to /horoscope. Scene durations synced to voiceoverLine word counts. Click numerology modal is a silent interaction moment.',
};

const tarotPatterns: TikTokScript = {
  id: 'tarot-patterns',
  title: 'I Keep Pulling the Same Cards During Pluto Transits',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 24,
  hook: {
    text: 'Same card. Every Pluto transit. Coincidence?',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Jump straight to 30-day pattern view - the proof',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 500,
      focusPoint: 'Pattern analysis showing frequent cards + suit distribution',
      voiceoverLine: "Same cards... same transits... every time. Here's how.",
    },
    {
      description: 'Click 30 days - show the recurring themes',
      path: '/tarot',
      durationSeconds: 2.5,
      action: 'click',
      target: '[data-testid="pattern-30days"]',
      focusPoint: 'Themes, frequent cards, recurring suits - visible proof',
      voiceoverLine: 'Every daily card... is connected to your transits.',
      zoomTo: { x: 0.5, y: 0.48, scale: 1.25 },
      tapPosition: { x: 0.5, y: 0.48 },
    },
    {
      description: 'Scroll back up to daily card showing transit connection',
      path: '/tarot',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: -500,
      focusPoint:
        'Daily card with transit connection - THIS is where the data comes from',
      voiceoverLine:
        'Over time... it maps what cards appear during which cosmic conditions.',
    },
    {
      description: 'Show the transit link on the daily card',
      path: '/tarot',
      durationSeconds: 3,
      action: 'show',
      focusPoint: 'Card seeded from chart + connected to current transits',
      voiceoverLine:
        'At 30 days... you see patterns. Suits clustering around specific planets.',
    },
    {
      description: 'Scroll back to patterns, click 90 days',
      path: '/tarot',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 500,
      focusPoint: 'Pattern section reappears',
      // No voiceoverLine — transition scroll
    },
    {
      description: 'Click 90 day view - long term evolution',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-90days"]',
      focusPoint:
        'Themes shifting over 3 months - your personal textbook forming',
      voiceoverLine: 'At 90 days... undeniable.',
      zoomTo: { x: 0.5, y: 0.48, scale: 1.25 },
      tapPosition: { x: 0.5, y: 0.48 },
    },
    {
      description: 'Scroll to rituals generated from your patterns',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Personalized rituals + journal prompts from YOUR card data',
      voiceoverLine: 'And it generates rituals from YOUR patterns.',
    },
  ],
  outro: {
    text: 'Not a coincidence.',
    durationSeconds: 2,
  },
  voiceover:
    "Same cards... same transits... every time. Here's how. Every daily card... is connected to your transits. Over time... it maps what cards appear during which cosmic conditions. At 30 days... you see patterns. Suits clustering around specific planets. At 90 days... undeniable. And it generates rituals... from YOUR patterns.",
  textOverlays: [
    {
      text: 'cards \u2192 transit connections',
      startSeconds: 3,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'maps cosmic conditions',
      startSeconds: 8,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: '30 days = patterns',
      startSeconds: 12,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: '90 days = proof',
      startSeconds: 17,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'rituals from YOUR data',
      startSeconds: 20,
      durationSeconds: 2,
      position: 'top' as const,
    },
  ],
  caption:
    'Same cards keep appearing during the same transits. 90 days of data. What patterns would YOUR cards reveal?',
  hashtags: ['tarot', 'tarotpatterns', 'lunary', 'witchtok', 'pluto'],
  playwrightNotes:
    'Navigate to /tarot. Reverse chronology: 30d patterns first (hook payoff), scroll back to daily card (how it works), 90d escalation, rituals. Scene durations synced to voiceoverLine.',
};

const astralGuide: TikTokScript = {
  id: 'astral-guide',
  title: 'Every Answer Is Sourced From 2,000+ Articles',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 27,
  hook: {
    text: 'I asked about Mars. It quoted the grimoire.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Guide page ready - show the input area',
      path: '/guide',
      durationSeconds: 1,
      action: 'show',
      focusPoint: 'Clean chat interface ready for questions',
      // No voiceoverLine — brief visual setup
    },
    {
      description: 'Type a career question',
      path: '/guide',
      durationSeconds: 5,
      action: 'type',
      target: '[data-testid="guide-input"]',
      typeText: 'When is a good time for my career based on my transits?',
      focusPoint: 'Typing a real question about career timing',
      voiceoverLine: 'When is a good time for my career?',
    },
    {
      description: 'Submit career question',
      path: '/guide',
      durationSeconds: 1,
      action: 'click',
      target: '[data-testid="guide-submit"]',
      focusPoint: 'Send the question',
      // No voiceoverLine — quick tap
    },
    {
      description: 'Watch response stream in - career timing analysis',
      path: '/guide',
      durationSeconds: 4.5,
      action: 'wait',
      focusPoint:
        'Response streaming with transit data, house placements, timing windows',
      voiceoverLine:
        'Look at this answer... it pulled my current transits... specific timing windows... even the house activations.',
    },
    {
      description: 'Scroll through career response showing depth',
      path: '/guide',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Detailed transit timing, specific dates, house activations',
      voiceoverLine: '...Now watch.',
    },
    {
      description: 'Type an incantation request',
      path: '/guide',
      durationSeconds: 5,
      action: 'type',
      target: '[data-testid="guide-input"]',
      typeText: 'Give me an incantation for prosperity and abundance',
      focusPoint: 'Showing the guide can create custom incantations',
      voiceoverLine: 'Give me an incantation... for abundance.',
    },
    {
      description: 'Submit incantation request',
      path: '/guide',
      durationSeconds: 1,
      action: 'click',
      target: '[data-testid="guide-submit"]',
      focusPoint: 'Send the request',
      // No voiceoverLine — quick tap
    },
    {
      description: 'Watch incantation stream in',
      path: '/guide',
      durationSeconds: 4.5,
      action: 'wait',
      focusPoint: 'Custom incantation with lunar timing and crystal pairing',
      voiceoverLine:
        'Custom incantation... lunar timing... crystal pairing. 2,000 plus articles backing every answer.',
    },
  ],
  outro: {
    text: 'Ask it anything.',
    durationSeconds: 2,
  },
  voiceover:
    'When is a good time for my career? Look at this answer... it pulled my current transits... specific timing windows... even the house activations. ...Now watch. Give me an incantation... for abundance. Custom incantation... lunar timing... crystal pairing. 2,000 plus articles backing every answer. Ask it anything.',
  textOverlays: [
    {
      text: 'transits + timing windows',
      startSeconds: 8,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'house activations mapped',
      startSeconds: 12,
      durationSeconds: 2,
      position: 'top' as const,
    },
    {
      text: 'custom incantations too',
      startSeconds: 19,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: '2,000+ articles behind it',
      startSeconds: 23,
      durationSeconds: 2,
      position: 'top' as const,
    },
  ],
  caption:
    'I asked about my career timing. It pulled transits, house activations, timing windows. Then I asked for an incantation. What would YOU ask?',
  hashtags: ['astrology', 'grimoire', 'lunary', 'witchtok', 'birthchart'],
  playwrightNotes:
    'Navigate to /guide. Type career question (VO speaks question), submit, watch response (VO describes what it shows). Type incantation (VO speaks request), submit, watch response (VO describes results). Scene durations synced to voiceoverLine.',
};

const birthChart: TikTokScript = {
  id: 'birth-chart',
  title: 'Your App Only Shows 10 Planets',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 25,
  hook: {
    text: 'Your app shows 10 planets. This shows 24+.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Chart wheel loads - beautiful visual hook',
      path: '/birth-chart',
      durationSeconds: 3,
      action: 'show',
      focusPoint:
        'Full birth chart wheel - visually stunning, stops the scroll',
      voiceoverLine:
        'Your astrology app shows 10 planets... this one? Twenty-four plus.',
      zoomTo: { x: 0.5, y: 0.42, scale: 1.15 },
    },
    {
      description: 'Scroll to planet list - the count escalation begins',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Sun through Pluto visible - "ok normal so far"',
      voiceoverLine: 'Sun through Pluto... sure.',
    },
    {
      description: 'Keep scrolling - Chiron, Lilith, Nodes appear',
      path: '/birth-chart',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint:
        'Chiron, Lilith, North Node, South Node - "wait there is more"',
      voiceoverLine:
        'But then... Chiron... Lilith... North Node... South Node...',
    },
    {
      description: 'Keep scrolling - asteroids too',
      path: '/birth-chart',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Juno, Ceres, Pallas, Vesta - the count keeps going',
      voiceoverLine:
        'Juno... Ceres... Pallas... Vesta. Every placement explained.',
    },
    {
      description: 'Click Aspects tab - pattern interrupt',
      path: '/birth-chart',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="tab-aspects"], button:has-text("Aspects")',
      focusPoint: 'Aspect grid appears with real orbs',
      voiceoverLine:
        'Aspects tab... how your planets actually interact. Real orbs.',
      zoomTo: { x: 0.5, y: 0.28, scale: 1.2 },
      tapPosition: { x: 0.5, y: 0.28 },
    },
    {
      description: 'Scroll through aspects slowly - show the depth',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Conjunctions, trines, squares with exact orbs',
      // No voiceoverLine — visual breathing room
    },
    {
      description: 'Click Houses tab',
      path: '/birth-chart',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="tab-houses"], button:has-text("Houses")',
      focusPoint: 'All 12 houses with signs and rulers',
      voiceoverLine: 'Houses tab maps every area of your life.',
      zoomTo: { x: 0.5, y: 0.28, scale: 1.2 },
      tapPosition: { x: 0.5, y: 0.28 },
    },
    {
      description: 'Scroll through houses - each area of life mapped',
      path: '/birth-chart',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Career, love, home, identity - all mapped to YOUR signs',
      voiceoverLine: 'And the birth chart calculator?',
    },
  ],
  outro: {
    text: 'Free.',
    durationSeconds: 2,
  },
  voiceover:
    'Your astrology app shows 10 planets... this one? Twenty-four plus. Sun through Pluto... sure. But then... Chiron... Lilith... North Node... South Node... Juno... Ceres... Pallas... Vesta. Every placement explained. Aspects tab... how your planets actually interact. Real orbs. Houses tab... maps every area of your life. And the birth chart calculator? ...Free.',
  textOverlays: [
    {
      text: '24+ celestial bodies',
      startSeconds: 2.5,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'Chiron. Lilith. Nodes.',
      startSeconds: 7,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'real orbs. real aspects.',
      startSeconds: 13,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: '12 houses = your whole life',
      startSeconds: 18,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'free.',
      startSeconds: 22,
      durationSeconds: 2,
      position: 'center' as const,
    },
  ],
  caption:
    "How many planets does YOUR astrology app show? This one shows 24+. Aspects with real orbs. All 12 houses. And it's free. How many does yours show?",
  hashtags: ['birthchart', 'astrology', 'lunary', 'natalchart', 'witchtok'],
  playwrightNotes:
    'Navigate to /birth-chart. Escalating reveal. Scene durations synced to voiceoverLine. "Free" at the end is the loop trigger.',
};

const profileCircle: TikTokScript = {
  id: 'profile-circle',
  title: '84% Compatible. But Look at the Timing Tab.',
  tier: 1,
  category: 'walkthrough',
  totalSeconds: 24,
  hook: {
    text: '84% compatible. But the Timing tab...',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Circle tab - tap friend card showing 84% compatibility',
      path: '/profile',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="friend-card"]',
      focusPoint: 'Friend card with % and streak - quick visual, move fast',
      voiceoverLine: "84 percent compatible... but that's just the start.",
    },
    {
      description: 'Friend overview loads - big compatibility score',
      path: '/profile/friends/[id]',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Large 84% score + key placements at a glance',
      // No voiceoverLine — visual moment
    },
    {
      description: 'Tap Synastry tab - element balance appears',
      path: '/profile/friends/[id]',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="tab-synastry"]',
      focusPoint: 'Fire/Earth/Air/Water bars comparing You vs Them',
      voiceoverLine: 'Synastry shows element balance... side by side.',
    },
    {
      description: 'Scroll to aspects - every one listed with orbs',
      path: '/profile/friends/[id]',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 350,
      focusPoint: 'Harmonious vs challenging with planet pairs + orbs',
      voiceoverLine:
        'Every aspect between our charts... harmonious... vs challenging.',
    },
    {
      description: 'Tap Their Chart tab - full birth chart wheel',
      path: '/profile/friends/[id]',
      durationSeconds: 2.5,
      action: 'click',
      target: '[data-testid="tab-chart"]',
      focusPoint: "Friend's complete chart wheel - visually impressive",
      voiceoverLine: 'Her complete birth chart...',
    },
    {
      description: 'Tap Timing tab - the big reveal',
      path: '/profile/friends/[id]',
      durationSeconds: 4,
      action: 'click',
      target: '[data-testid="tab-timing"]',
      focusPoint: 'Best times to connect analyzing BOTH charts',
      voiceoverLine:
        "But HERE'S what no other app has... timing. It analyzes BOTH transits.",
    },
    {
      description: 'Scroll through timing windows',
      path: '/profile/friends/[id]',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint:
        'Specific date ranges + what type of conversation is supported',
      voiceoverLine: 'Shows the best windows... for important conversations.',
    },
  ],
  outro: {
    text: 'Both charts. Not just yours.',
    durationSeconds: 2,
  },
  voiceover:
    "84 percent compatible... but that's just the start. Synastry shows element balance... side by side. Every aspect between our charts... harmonious... vs challenging. Her complete birth chart... But HERE'S what no other app has... timing. It analyzes BOTH transits... and shows the best windows... for important conversations. Both charts. Not just mine.",
  textOverlays: [
    {
      text: 'element balance: side by side',
      startSeconds: 5,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'harmonious vs challenging',
      startSeconds: 9,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'TIMING \u2192 both charts',
      startSeconds: 15,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'best windows to connect',
      startSeconds: 19,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
  ],
  caption:
    '84% compatible. Synastry. Aspects. Their full chart. And the best times to talk based on BOTH transits. Not a percentage\u2014a relationship guide. Who would you check?',
  hashtags: ['synastry', 'compatibility', 'lunary', 'astrology', 'witchtok'],
  playwrightNotes:
    'Navigate to /profile, click friend card. Fast pace through Overview \u2192 Synastry \u2192 scroll aspects \u2192 Their Chart \u2192 TIMING (the payoff). Scene durations synced to voiceoverLine.',
};

// ============================================================================
// TIER 2: DEEP DIVES
// ============================================================================

const skyNowDeepDive: TikTokScript = {
  id: 'sky-now-deepdive',
  title: 'Every Planet Right Now. Mapped to YOUR Houses.',
  tier: 2,
  category: 'deep-dive',
  totalSeconds: 15,
  hook: {
    text: 'Every planet. YOUR houses. Right now.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Sky Now widget collapsed - planet symbols visible',
      path: '/app',
      durationSeconds: 1,
      action: 'show',
      focusPoint: 'Planet grid - "what does all this mean?"',
    },
    {
      description: 'Tap to expand - cascade of planetary data',
      path: '/app',
      durationSeconds: 2,
      action: 'expand',
      target: '[data-testid="sky-now-widget"]',
      focusPoint: 'Every planet: sign, degree, YOUR house - satisfying reveal',
    },
    {
      description: 'Scroll through Sun, Moon, Mercury - personal planets',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 120,
      focusPoint: 'Sun sign + degree + house, Moon + house, Mercury retrograde',
    },
    {
      description: 'Scroll to Venus, Mars - relationship & drive planets',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 120,
      focusPoint: 'Venus in YOUR love house, Mars in YOUR career house',
    },
    {
      description: 'Scroll to Jupiter, Saturn - life themes',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 120,
      focusPoint: 'Jupiter expansion + Saturn lessons in YOUR houses',
    },
    {
      description: 'Scroll to Uranus, Neptune, Pluto - generational',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 120,
      focusPoint: 'Generational planets mapped to YOUR specific houses',
    },
  ],
  outro: {
    text: 'YOUR houses. Updated live.',
    durationSeconds: 2,
  },
  voiceover:
    "Here's the full sky right now. Every planet... what sign it's at... and which house it's hitting in MY chart. Not the same for everyone. My 6th house = work. Your 7th = relationships. Jupiter, Saturn, Pluto... all mapped to my houses. This changes daily. Updated live.",
  textOverlays: [],
  caption:
    'Every planet right now mapped to YOUR houses. Not your sign. Your chart. Which house is the Moon hitting for YOU?',
  hashtags: ['transits', 'skynow', 'lunary', 'astrology', 'witchtok'],
  playwrightNotes:
    'Start at /app. Show Sky Now collapsed, click expand (satisfying cascade animation), scroll through planets. PAUSE on Mercury to show retrograde symbol + house. Continue scrolling through outer planets. House column must be visible.',
};

const numerologyDeepDive: TikTokScript = {
  id: 'numerology-deepdive',
  title: 'Your Number Is Not the Universal Number.',
  tier: 2,
  category: 'did-you-know',
  totalSeconds: 18,
  hook: {
    text: 'Your number \u2260 universal. Different energy.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description:
        'Numerology section with Personal and Universal side by side',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Two different numbers visible - instant visual contrast',
    },
    {
      description: 'Tap personal day number - the deeper meaning',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="numerology-day"]',
      focusPoint: 'Modal: meaning + energy - specific to YOU',
    },
    {
      description: 'Close modal - back to comparison view',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="numerology-close"]',
      focusPoint: 'Both numbers visible again - "see how different they are?"',
    },
    {
      description: 'Show universal day for side-by-side contrast',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        'Universal number vs YOUR personal number. Different energies.',
    },
    {
      description: 'Scroll to month and year numbers',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 100,
      focusPoint:
        'Personal month + personal year - "wait there are more cycles?"',
    },
    {
      description: 'Show all personal numbers together',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Day, month, year - three nested cycles from YOUR birthdate',
    },
  ],
  outro: {
    text: 'From your birthdate. Not universal.',
    durationSeconds: 2,
  },
  voiceover:
    'My personal day number. Different from the universal day. Different energies. The universal number applies to everyone. Your personal number? Calculated from YOUR birthdate. And it goes deeper... personal month, personal year. Three nested cycles unique to you. Feel out of sync? You might be following the universal energy instead of your own.',
  textOverlays: [],
  caption:
    'Your personal day number is NOT the universal day number. Different energies. Your numbers come from YOUR birthdate. What are yours?',
  hashtags: [
    'numerology',
    'personalnumbers',
    'lunary',
    'astrology',
    'witchtok',
  ],
  playwrightNotes:
    'Navigate to /horoscope. Scroll to numerology section showing both Personal and Universal side by side. Click personal day (modal opens). Close modal. Pause on contrast. Scroll to month/year numbers. The visual contrast between the two numbers is the key.',
};

const patternTimeline: TikTokScript = {
  id: 'pattern-timeline',
  title: '7 Days vs 30 Days vs 90 Days of Tracking Cards',
  tier: 2,
  category: 'feature-reveal',
  totalSeconds: 23,
  hook: {
    text: '7 days: noise. 30: patterns. 90: proof.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Pattern section - click 7 days',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-7days"]',
      focusPoint: '7-day view - basic frequent cards - "just noise"',
      voiceoverLine: '7 days... just noise.',
    },
    {
      description: 'Show 7-day results - sparse but hints visible',
      path: '/tarot',
      durationSeconds: 2.5,
      action: 'show',
      focusPoint: 'A few frequent cards, not much to see yet',
      voiceoverLine: 'A few frequent cards... nothing to see yet.',
    },
    {
      description: 'Click 30 days - data transforms',
      path: '/tarot',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="pattern-30days"]',
      focusPoint: 'Suit distribution, recurring themes appear - "wait"',
      voiceoverLine:
        "30 days... now we're talking. Suits clustering... around specific transits.",
    },
    {
      description: 'Scroll through 30-day insights',
      path: '/tarot',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Cups dominating, Tower during Pluto, themes forming',
      voiceoverLine: 'Patterns... you can actually see.',
    },
    {
      description: 'Click 90 days - the big reveal',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-90days"]',
      focusPoint: '90-day view loads - undeniable patterns',
      voiceoverLine: '90 days? ...Undeniable.',
    },
    {
      description: 'Scroll through 90-day insights - theme evolution',
      path: '/tarot',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Themes shifting over months, cosmic connections proven',
      voiceoverLine:
        'Themes shifting over months... same suits... during same transits.',
    },
    {
      description: 'Scroll to rituals generated from patterns',
      path: '/tarot',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Personalized rituals from YOUR pattern data',
      voiceoverLine: 'And it builds rituals... from your data.',
    },
  ],
  outro: {
    text: 'Your cards already proved it.',
    durationSeconds: 2,
  },
  voiceover:
    "7 days... just noise. A few frequent cards... nothing to see yet. 30 days... now we're talking. Suits clustering... around specific transits. Patterns... you can actually see. 90 days? ...Undeniable. Themes shifting over months... same suits... during same transits. And it builds rituals... from your data. Your cards already proved it.",
  textOverlays: [
    {
      text: '7 days = noise',
      startSeconds: 2.5,
      durationSeconds: 2,
      position: 'top' as const,
    },
    {
      text: '30 days = patterns',
      startSeconds: 7,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: '90 days = proof',
      startSeconds: 13,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'rituals from YOUR data',
      startSeconds: 18,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
  ],
  caption:
    '7 days: noise. 30 days: patterns. 90 days: proof. Same suits during same transits. What would YOUR cards reveal?',
  hashtags: [
    'tarot',
    'tarotpatterns',
    'lunary',
    'witchtok',
    'patternrecognition',
  ],
  playwrightNotes:
    'Navigate to /tarot, scroll to pattern section. Escalating pace: 7d quick, 30d slower, 90d most time. Scene durations synced to voiceoverLine.',
};

const ritualSystem: TikTokScript = {
  id: 'ritual-system',
  title: "Today's Ritual Changes Based on the Moon",
  tier: 2,
  category: 'did-you-know',
  totalSeconds: 18,
  hook: {
    text: "Today's ritual? Moon-based. Changes daily.",
    durationSeconds: 2,
  },
  scenes: [
    {
      description: "Dashboard ritual card showing today's ritual",
      path: '/app',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Ritual card with completion tracking - matches the hook',
      voiceoverLine:
        "Today's ritual... changes based on the moon. ...Yesterday was different.",
    },
    {
      description: 'Navigate to horoscope for full ritual details',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'navigate',
      target: '/horoscope',
      focusPoint: 'Page transition - fast',
      voiceoverLine: 'The moon moved...',
    },
    {
      description: 'Scroll to ritual section - full personalized details',
      path: '/horoscope',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 400,
      focusPoint:
        'Ritual aligned to moon phase + active transits in YOUR chart',
      voiceoverLine:
        'Every day... the ritual changes based on which house the moon activates... in YOUR chart.',
    },
    {
      description: 'Show ritual instructions tied to cosmic energy',
      path: '/horoscope',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Step-by-step instructions + WHY this timing matters',
      voiceoverLine: 'The crystal matches too...',
    },
    {
      description: 'Scroll to crystal recommendation tied to ritual',
      path: '/horoscope',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Crystal matched to ritual energy - everything connected',
      voiceoverLine: 'Everything connected... to your cosmic weather.',
    },
  ],
  outro: {
    text: 'Different tomorrow. Moon moves.',
    durationSeconds: 2.5,
  },
  voiceover:
    "Today's ritual... changes based on the moon. ...Yesterday was different. The moon moved... Every day... the ritual changes based on which house the moon activates... in YOUR chart. The crystal matches too... Everything connected... to your cosmic weather. Different tomorrow... because the moon moves.",
  textOverlays: [
    {
      text: 'changes daily',
      startSeconds: 3,
      durationSeconds: 2,
      position: 'top' as const,
    },
    {
      text: 'YOUR house = YOUR ritual',
      startSeconds: 7,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'crystal matches too',
      startSeconds: 12,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
  ],
  caption:
    "Today's ritual changes based on the moon. It changes daily based on YOUR chart. What house is the moon in for you?",
  hashtags: ['ritual', 'moonphase', 'lunary', 'witchtok', 'moonmagic'],
  playwrightNotes:
    'Show dashboard ritual card, navigate to /horoscope, scroll to ritual section. Scene durations synced to voiceoverLine.',
};

const transitWisdomDeepDive: TikTokScript = {
  id: 'transit-wisdom-deepdive',
  title: 'This Transit. 12 Meanings. Yours Is Different.',
  tier: 2,
  category: 'deep-dive',
  totalSeconds: 21,
  hook: {
    text: 'This transit. 12 meanings. Mine\u2014',
    durationSeconds: 2,
  },
  scenes: [
    {
      description:
        'Transit Wisdom section - first transit with house + intensity',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 350,
      focusPoint:
        'Transit \u2192 house \u2192 life area \u2192 intensity level',
      voiceoverLine:
        'This transit... means something different for every person. For me? ...Hitting a specific house.',
    },
    {
      description: 'Show the intensity badge - this transit matters',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Intensity badge - "this one\'s a big deal for you"',
      voiceoverLine: '...High intensity.',
    },
    {
      description: 'Scroll to show multiple active transits',
      path: '/horoscope',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Multiple transits hitting different areas simultaneously',
      voiceoverLine:
        "But that's just one transit... every transit active right now... which areas they're touching.",
    },
    {
      description: 'Scroll to exact aspects - real astronomical data',
      path: '/horoscope',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Aspects forming to YOUR natal planets with real orbs',
      voiceoverLine: 'Exact aspects... with real orbs.',
    },
    {
      description: 'Scroll to upcoming transits - your personal forecast',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: "30-day forecast - see what's coming for YOUR chart",
      voiceoverLine: 'And the next 30 days... mapped out.',
    },
  ],
  outro: {
    text: 'Not a paragraph for all Leos.',
    durationSeconds: 2,
  },
  voiceover:
    "This transit... means something different for every person. For me? ...Hitting a specific house. ...High intensity. But that's just one transit... every transit active right now... which areas they're touching. Exact aspects... with real orbs. And the next 30 days... mapped out. Not a paragraph... for all Leos.",
  textOverlays: [
    {
      text: '12 meanings. which is YOURS?',
      startSeconds: 3,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'intensity: mapped',
      startSeconds: 6,
      durationSeconds: 2,
      position: 'top' as const,
    },
    {
      text: 'real orbs. real aspects.',
      startSeconds: 11,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'next 30 days \u2192 YOUR chart',
      startSeconds: 15,
      durationSeconds: 3,
      position: 'top' as const,
    },
  ],
  caption:
    'Same transit, 12 different meanings. Depends on which house it hits in YOUR chart. Which house is it hitting for you?',
  hashtags: ['transits', 'astrology', 'lunary', 'birthchart', 'witchtok'],
  playwrightNotes:
    'Navigate to /horoscope. Scroll to Transit Wisdom. Scene durations synced to voiceoverLine. Fast escalation.',
};

const streaksAndProgress: TikTokScript = {
  id: 'streaks-progress',
  title: "The App Detected 3 Life Themes I Didn't Pick",
  tier: 2,
  category: 'did-you-know',
  totalSeconds: 23,
  hook: {
    text: "73 days. 3 life themes. I didn't choose them.",
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Profile with streak counter and progress bar',
      path: '/profile',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        '73-day streak, progress bar, achievement badge - credibility',
      voiceoverLine: '73 days... of daily check-ins.',
    },
    {
      description: 'Scroll past Big 3 and personal card - quick flash',
      path: '/profile',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Sun, Moon, Rising, personal tarot card - context, move fast',
      voiceoverLine:
        'The app detected... 3 life themes running through my journey.',
    },
    {
      description: 'Life Themes section - the reveal',
      path: '/profile',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint:
        '3 themes: Creative Emergence, Deepening Connection, Building Foundations',
      voiceoverLine:
        'Creative Emergence... Deepening Connection... Building Foundations.',
    },
    {
      description: 'Expand a theme to show detail',
      path: '/profile',
      durationSeconds: 3.5,
      action: 'expand',
      target: '[data-testid="life-theme"]',
      focusPoint:
        'Full explanation of how the theme emerged from YOUR patterns',
      voiceoverLine:
        "I didn't pick these... they emerged from my tarot patterns... journal entries... and transits.",
    },
    {
      description: 'Scroll to monthly insights',
      path: '/profile',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Monthly activity graph, frequent cards, transit impacts',
      voiceoverLine:
        'Monthly insights show which cards keep appearing... which transits are hitting hardest.',
    },
  ],
  outro: {
    text: '2-3 months. Chart comes alive.',
    durationSeconds: 2.5,
  },
  voiceover:
    "73 days... of daily check-ins. The app detected... 3 life themes running through my journey. Creative Emergence... Deepening Connection... Building Foundations. I didn't pick these... they emerged from my tarot patterns... journal entries... and transits. Monthly insights show which cards keep appearing... which transits are hitting hardest. After 2-3 months... your chart comes alive.",
  textOverlays: [
    {
      text: "3 themes. didn't choose them.",
      startSeconds: 4,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'emerged from YOUR patterns',
      startSeconds: 10,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'cards + transits + journal',
      startSeconds: 15,
      durationSeconds: 3,
      position: 'top' as const,
    },
  ],
  caption:
    "73 days. 3 life themes I didn't choose. They emerged from my patterns. What themes would emerge from yours?",
  hashtags: ['astrology', 'dailypractice', 'lunary', 'witchtok', 'streak'],
  playwrightNotes:
    'Navigate to /profile. Scene durations synced to voiceoverLine. PAUSE on life themes (the hook payoff).',
};

const tarotSpreads: TikTokScript = {
  id: 'tarot-spreads',
  title: 'Tarot with your birth chart hits different.',
  tier: 2,
  category: 'how-to',
  totalSeconds: 23,
  hook: {
    text: 'Tarot with your birth chart hits different.',
    durationSeconds: 2.5,
  },
  scenes: [
    {
      description: 'Pick Past Present Future — fast',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="tarot-spreads-section"] button:has-text("Past")',
      focusPoint: 'Quick selection — move fast to the pull',
      voiceoverLine: 'Pick a spread. Pull the cards.',
    },
    {
      description: 'Tap Start a reading',
      path: '/tarot',
      durationSeconds: 1,
      action: 'click',
      target: 'button:has-text("Start a reading")',
      focusPoint: 'Pull the cards',
      // No voiceoverLine — quick tap
    },
    {
      description: 'Scroll to first card detail — show the reading',
      path: '/tarot',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollTo: '[data-testid="spread-card-0"]',
      focusPoint: 'Card name, insight in quotes, keyword tags visible',
      voiceoverLine:
        'Every card gets its own reading... not generic. Written for your chart.',
    },
    {
      description: 'Scroll to In Your Chart button',
      path: '/tarot',
      durationSeconds: 2,
      action: 'scroll',
      scrollTo: '[data-testid="spread-transit-toggle-0"]',
      focusPoint: 'In Your Chart button visible — about to tap',
      voiceoverLine: 'Keywords... insights.',
    },
    {
      description: 'Tap In Your Chart — expand transit connections',
      path: '/tarot',
      durationSeconds: 2.5,
      action: 'click',
      target: '[data-testid="spread-transit-toggle-0"]',
      focusPoint: 'Collapsible opening — transit connections revealed',
      voiceoverLine: 'But here... is where it gets wild.',
    },
    {
      description: 'Scroll to transit content — HOLD money shot',
      path: '/tarot',
      durationSeconds: 6.5,
      action: 'scroll',
      scrollTo: '[data-testid="spread-transit-content-0"]',
      focusPoint:
        'Transit planet + natal planet, aspect symbols, degrees — HOLD here long',
      voiceoverLine:
        'Your transits... are woven into every single card. Real planets... real aspects. Your actual sky right now... inside every pull.',
    },
  ],
  outro: {
    text: 'Your sky. Every card.',
    durationSeconds: 2.5,
  },
  voiceover:
    'Tarot with your birth chart hits different. Pick a spread... pull the cards. Every card gets its own reading... not generic. Written for your chart. Keywords... insights. But here... is where it gets wild. Your transits... are woven into every single card. Real planets... real aspects. Your actual sky right now... inside every pull.',
  textOverlays: [
    {
      text: 'not generic. YOUR chart.',
      startSeconds: 5,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'transits in every card',
      startSeconds: 12,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'real planets. real aspects.',
      startSeconds: 16,
      durationSeconds: 3,
      position: 'top' as const,
    },
  ],
  caption:
    'Most tarot apps give you generic card meanings. This one reads your birth chart into every card you pull. Real transits. Real aspects. Your sky in every spread.',
  hashtags: ['tarot', 'tarottok', 'lunary', 'birthchart', 'astrology'],
  playwrightNotes:
    'Navigate to /tarot. Click PPF + Start Reading fast. HOLD on transit content (money shot). Scene durations synced to voiceoverLine.',
};

// ============================================================================
// TIER 3: GRIMOIRE CONTENT
// ============================================================================

const crystalsOverview: TikTokScript = {
  id: 'crystals-overview',
  title: "Name a Crystal. It's in Here.",
  tier: 3,
  category: 'feature-reveal',
  totalSeconds: 21,
  hook: {
    text: 'Name a crystal. Full guide. Free.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Crystal categories - 8 visible at once',
      path: '/grimoire/crystals',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Protection, Love, Spiritual, Manifestation, Healing...',
      voiceoverLine: 'Name a crystal... 200 plus. Eight categories.',
    },
    {
      description: 'Type into crystal search - demo the search',
      path: '/grimoire/crystals',
      durationSeconds: 2.5,
      action: 'type',
      target: 'input[placeholder*="Search crystals"]',
      typeText: 'amethyst',
      focusPoint: 'Typing crystal name - results filter instantly',
      voiceoverLine: 'Search any one... amethyst.',
    },
    {
      description: 'Show search results for amethyst',
      path: '/grimoire/crystals',
      durationSeconds: 1,
      action: 'show',
      focusPoint: 'Amethyst card visible after filtering',
      // No voiceoverLine — quick visual
    },
    {
      description: 'Tap Amethyst - detail page opens',
      path: '/grimoire/crystals',
      durationSeconds: 2,
      action: 'click',
      target: '[data-crystal-slug="amethyst"], [data-testid="crystal-card"]',
      focusPoint: 'Crystal detail page loading instantly',
      voiceoverLine: 'Properties... meaning.',
    },
    {
      description: 'Show crystal detail - meaning, properties',
      path: '/grimoire/crystals/amethyst',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Full guide: what it is, meaning, properties',
      voiceoverLine: 'Chakra connections... how to use it.',
    },
    {
      description: 'Scroll to chakras + how to use',
      path: '/grimoire/crystals/amethyst',
      durationSeconds: 2.5,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Chakra connections, how to use, timing recommendations',
      voiceoverLine: 'When to use it... planetary correspondences.',
    },
    {
      description: 'Scroll to correspondences and timing',
      path: '/grimoire/crystals/amethyst',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Planetary correspondences + when to use',
      voiceoverLine: 'Timing recommendations...',
    },
    {
      description: 'Scroll to show even more detail',
      path: '/grimoire/crystals/amethyst',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'How to cleanse, charge, and program this crystal',
      voiceoverLine: 'Every crystal... full guide... free.',
    },
  ],
  outro: {
    text: "Name a crystal. It's in here.",
    durationSeconds: 2,
  },
  voiceover:
    "Name a crystal... 200 plus. Eight categories. Search any one... amethyst. Properties... meaning. Chakra connections... how to use it. When to use it... planetary correspondences. Timing recommendations... Every crystal... full guide... free. Name a crystal. It's in here.",
  textOverlays: [
    {
      text: '200+ crystals',
      startSeconds: 2.5,
      durationSeconds: 2,
      position: 'top' as const,
    },
    {
      text: 'search any crystal',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top' as const,
    },
    {
      text: 'chakras + timing + planets',
      startSeconds: 10,
      durationSeconds: 3,
      position: 'top' as const,
    },
    {
      text: 'full guide. free.',
      startSeconds: 16,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
  ],
  caption: "Name a crystal. Drop it in the comments. Bet it's in here.",
  hashtags: ['crystals', 'crystalhealing', 'lunary', 'witchtok', 'amethyst'],
  playwrightNotes:
    'Navigate to /grimoire/crystals. No auth. Scene durations synced to voiceoverLine. "Name a crystal" hook drives comments.',
};

const spellsOverview: TikTokScript = {
  id: 'spells-overview',
  title: 'It Knows Which Spells Work Best Tonight',
  tier: 3,
  category: 'feature-reveal',
  totalSeconds: 20,
  hook: {
    text: "112 spells. Filtered by tonight's moon.",
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Spells page with current moon phase visible',
      path: '/grimoire/spells',
      durationSeconds: 2.5,
      action: 'show',
      focusPoint: 'Moon phase indicator at top - "it knows the current moon"',
      voiceoverLine: '112 spells... and it knows the current moon phase.',
    },
    {
      description: 'Type into search bar - search for protection spell',
      path: '/grimoire/spells',
      durationSeconds: 2.5,
      action: 'type',
      target: 'input[placeholder*="Search spells"]',
      typeText: 'protection',
      focusPoint: 'Results filtering as you type',
      voiceoverLine: 'Search protection... results filter instantly.',
    },
    {
      description: 'Show search results - protection spells',
      path: '/grimoire/spells',
      durationSeconds: 2.5,
      action: 'show',
      focusPoint:
        'Protection spells filtered - cards with difficulty + duration',
      voiceoverLine: 'Each one... with difficulty and duration.',
    },
    {
      description: 'Tap a spell - full guide opens',
      path: '/grimoire/spells',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="spell-card"]',
      focusPoint: 'Full spell detail page loads',
      voiceoverLine: 'Tap any spell... purpose... optimal timing.',
    },
    {
      description: 'Scroll through spell detail - purpose, timing, ingredients',
      path: '/grimoire/spells',
      durationSeconds: 3.5,
      action: 'scroll',
      scrollDistance: 400,
      focusPoint: 'Complete guide: ingredients, step-by-step, timing',
      voiceoverLine: 'Ingredients with substitutes... step by step.',
    },
    {
      description: 'Scroll to show more spell detail',
      path: '/grimoire/spells',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Full instructions visible, timing recommendations',
      voiceoverLine: 'A grimoire... that knows your moon phase.',
    },
  ],
  outro: {
    text: 'Grimoire + live moon. Free.',
    durationSeconds: 2,
  },
  voiceover:
    '112 spells... and it knows the current moon phase. Search protection... results filter instantly. Each one... with difficulty and duration. Tap any spell... purpose... optimal timing. Ingredients with substitutes... step by step. A grimoire... that knows your moon phase. Free.',
  textOverlays: [
    {
      text: 'knows your moon phase',
      startSeconds: 3,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'difficulty + duration shown',
      startSeconds: 7,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'ingredients + substitutes',
      startSeconds: 12,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
    {
      text: 'grimoire + live moon. free.',
      startSeconds: 16,
      durationSeconds: 2.5,
      position: 'top' as const,
    },
  ],
  caption:
    "112 spells filtered by tonight's moon. Full instructions. Free. What spell would you cast tonight?",
  hashtags: ['spells', 'witchcraft', 'lunary', 'witchtok', 'moonmagic'],
  playwrightNotes:
    'Navigate to /grimoire/spells. No auth. Scene durations synced to voiceoverLine.',
};

const grimoireSearch: TikTokScript = {
  id: 'grimoire-search',
  title: 'Search Any Placement. Full Article. Free.',
  tier: 3,
  category: 'feature-reveal',
  totalSeconds: 20,
  hook: {
    text: 'Any placement? Full article. Here.',
    durationSeconds: 2,
  },
  scenes: [
    {
      description: 'Grimoire main page - categories cascade',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        'Planets, Signs, Houses, Aspects, Tarot, Crystals, Spells - everything',
      voiceoverLine: 'Search any placement... full article.',
    },
    {
      description: 'Fast scroll through categories - volume flex',
      path: '/grimoire',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 400,
      focusPoint: 'Every planet in every sign, all houses, all aspects - depth',
      voiceoverLine: '2,000 plus articles... every planet in every sign.',
    },
    {
      description: 'Type into search bar - live demo',
      path: '/grimoire',
      durationSeconds: 3,
      action: 'type',
      target:
        '[data-testid="grimoire-search"], input[name="grimoire-search"], input[aria-label="Search grimoire"]',
      typeText: 'Venus in Scorpio',
      focusPoint: 'Results appearing as you type - instant',
      voiceoverLine: 'All 12 houses... every aspect.',
    },
    {
      description: 'Show search results - full articles, not snippets',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Matching articles with rich previews - real depth',
      voiceoverLine: 'Tarot... crystals... spells.',
    },
    {
      description: 'Click first result - full article opens',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'click',
      target: '.max-h-80 a, [data-testid="grimoire-categories"] a',
      focusPoint: 'Full article page loads instantly',
      voiceoverLine: 'No paywall... on education.',
    },
    {
      description: 'Scroll through the article showing depth',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Complete article - not a snippet, a full guide',
      voiceoverLine: 'Search yours.',
    },
  ],
  outro: {
    text: 'No paywall. Search yours.',
    durationSeconds: 2,
  },
  voiceover:
    'Search any placement... full article. 2,000 plus articles... every planet in every sign. All 12 houses... every aspect. Tarot... crystals... spells. No paywall... on education. Search yours.',
  textOverlays: [
    {
      text: '2,000+ articles',
      startSeconds: 4,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'full articles ≠ snippets',
      startSeconds: 9,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'no paywall',
      startSeconds: 14,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    "Search any placement. Full article. 2,000+ articles. Free. Drop your placement\u2014bet it's in there.",
  hashtags: ['astrology', 'grimoire', 'lunary', 'learnastrology', 'witchtok'],
  playwrightNotes:
    'Navigate to /grimoire. No auth. Show categories (2s), fast scroll (3s), type "Venus in Scorpio" into search (3s - use slow typing for readability), show results (2s), click result (2s), scroll article (2s). The "Search yours" CTA drives comment engagement.',
};

// ============================================================================
// EXPORT ALL SCRIPTS
// ============================================================================

export const TIKTOK_SCRIPTS: TikTokScript[] = [
  // Tier 1: Core Features
  dashboardOverview,
  horoscopeDeepDive,
  tarotPatterns,
  astralGuide,
  birthChart,
  profileCircle,
  // Tier 2: Deep Dives
  skyNowDeepDive,
  numerologyDeepDive,
  patternTimeline,
  ritualSystem,
  transitWisdomDeepDive,
  streaksAndProgress,
  tarotSpreads,
  // Tier 3: Grimoire
  crystalsOverview,
  spellsOverview,
  grimoireSearch,
];

/**
 * Get a script by ID
 */
export function getScript(id: string): TikTokScript | undefined {
  return TIKTOK_SCRIPTS.find((s) => s.id === id);
}

/**
 * Get all scripts for a tier
 */
export function getScriptsByTier(tier: 1 | 2 | 3): TikTokScript[] {
  return TIKTOK_SCRIPTS.filter((s) => s.tier === tier);
}

/**
 * Get total video time for a set of scripts
 */
export function getTotalDuration(scripts: TikTokScript[]): number {
  return scripts.reduce((sum, s) => sum + s.totalSeconds, 0);
}

/**
 * Get a dynamic script by ID, using real sky data when available.
 * Falls back to the static script if no generator exists or no sky data provided.
 */
export function getDynamicScript(
  id: string,
  skyData?: SkyData,
): TikTokScript | undefined {
  const generator = SCRIPT_GENERATORS[id];
  if (generator && skyData) return generator(skyData);
  return TIKTOK_SCRIPTS.find((s) => s.id === id);
}

/**
 * Print a script as a human-readable storyboard
 */
export function printStoryboard(script: TikTokScript): string {
  const lines: string[] = [];
  lines.push(`${'='.repeat(60)}`);
  lines.push(`TIKTOK SCRIPT: ${script.title}`);
  lines.push(
    `ID: ${script.id} | Tier ${script.tier} | ${script.totalSeconds}s`,
  );
  lines.push(`Category: ${script.category}`);
  lines.push(`${'='.repeat(60)}`);
  lines.push('');
  lines.push(`HOOK (${script.hook.durationSeconds}s):`);
  lines.push(`  "${script.hook.text}"`);
  lines.push('');

  let currentTime = script.hook.durationSeconds;
  for (let i = 0; i < script.scenes.length; i++) {
    const scene = script.scenes[i];
    lines.push(
      `SCENE ${i + 1} (${currentTime}s - ${currentTime + scene.durationSeconds}s):`,
    );
    lines.push(
      `  Action: ${scene.action}${scene.target ? ` \u2192 ${scene.target}` : ''}`,
    );
    lines.push(`  Path: ${scene.path}`);
    lines.push(`  Shows: ${scene.description}`);
    lines.push(`  Focus: ${scene.focusPoint}`);
    lines.push('');
    currentTime += scene.durationSeconds;
  }

  lines.push(
    `OUTRO (${currentTime}s - ${currentTime + script.outro.durationSeconds}s):`,
  );
  lines.push(`  "${script.outro.text}"`);
  lines.push('');
  lines.push('VOICEOVER:');
  lines.push(`  ${script.voiceover}`);
  lines.push('');
  lines.push('TEXT OVERLAYS:');
  for (const overlay of script.textOverlays) {
    lines.push(
      `  [${overlay.startSeconds}s-${overlay.startSeconds + overlay.durationSeconds}s] (${overlay.position}) "${overlay.text}"`,
    );
  }
  lines.push('');
  lines.push('CAPTION:');
  lines.push(`  ${script.caption}`);
  lines.push('');
  lines.push(`HASHTAGS: ${script.hashtags.map((h) => `#${h}`).join(' ')}`);
  lines.push('');
  lines.push('PLAYWRIGHT NOTES:');
  lines.push(`  ${script.playwrightNotes}`);
  lines.push(`${'='.repeat(60)}`);

  return lines.join('\n');
}
