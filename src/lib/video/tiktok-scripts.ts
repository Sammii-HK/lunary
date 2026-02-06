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
 * Flow: Script → Playwright config → Recording → Edit → Post
 */

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
  /** Text to type (for type action) */
  typeText?: string;
  /** What the viewer should notice */
  focusPoint: string;
}

export interface TextOverlay {
  /** Text to show */
  text: string;
  /** When to show (seconds from start) */
  startSeconds: number;
  /** How long to show */
  durationSeconds: number;
  /** Position on screen */
  position: 'top' | 'center' | 'bottom';
}

// ============================================================================
// TIKTOK BEST PRACTICES APPLIED TO ALL SCRIPTS:
//
// HOOKS: Pattern interrupt, open loop, or bold claim. Must work on MUTE
//        (visual hook + text overlay). Target 70%+ intro retention.
//
// PACING: Visual change every 2-3 seconds. No scene > 3s without movement.
//         Target 70%+ completion rate over raw length.
//
// STRUCTURE: Open loop or escalating reveal. Never just "feature, feature,
//            feature." Plant a tease early, pay it off late.
//
// RETENTION HOOKS: At ~10s and ~15s marks to prevent natural drop-off.
//                  Use text overlays as pattern interrupts at these moments.
//
// TEXT OVERLAYS: Upper third of screen. High contrast. Max 6-8 words.
//               Work as standalone story on mute.
//
// LOOPING: Design endings that feel like beginnings. Viewer rewatches
//          without realizing = algorithm boost.
//
// CTA: Soft mid-video or natural end. Never interrupt the story.
//
// CAPTIONS: Short, emoji-light, question or bold statement. Drive comments.
// ============================================================================

// ============================================================================
// TIER 1: CORE FEATURE DEMOS
// ============================================================================

const dashboardOverview: TikTokScript = {
  id: 'dashboard-overview',
  title: 'POV: Your Morning Cosmic Check-In',
  tier: 1,
  category: 'walkthrough',
  totalSeconds: 21,
  hook: {
    // POV hook - viewer imagines themselves doing this
    text: 'POV: your astrology app knows which house Mars is in for YOUR chart',
    durationSeconds: 2,
  },
  scenes: [
    // ESCALATING REVEAL: each feature more impressive than the last
    {
      description: 'Dashboard loads - moon phase card with sign + illumination',
      path: '/app',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Moon phase in specific sign - visual hook, looks beautiful',
    },
    {
      description: 'Tap Sky Now - planets cascade open',
      path: '/app',
      durationSeconds: 3,
      action: 'expand',
      target: '[data-testid="sky-now-widget"]',
      focusPoint: 'All planets with signs, degrees, YOUR houses',
    },
    {
      description: 'Scroll to transit card - this is the escalation',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Transit hitting YOUR specific house - career, love, etc.',
    },
    // RETENTION HOOK at ~9s: reveal something unexpected
    {
      description: 'Daily tarot card with transit connection visible',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Card seeded from Sun/Moon/Rising - not random',
    },
    {
      description: 'Crystal recommendation - quick flash',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Crystal matched to current moon + chart',
    },
    // PAYOFF at ~13s: tap crystal for the "wow" moment
    {
      description: 'Tap crystal - modal opens with full detail',
      path: '/app',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="crystal-card"]',
      focusPoint:
        'Full crystal guide from 200+ database with exact correspondences',
    },
  ],
  outro: {
    // LOOP DESIGN: ends with "every morning" → loops back to the POV start
    text: 'Every morning. Personalized to your chart.',
    durationSeconds: 2,
  },
  voiceover:
    "POV it's morning and you open your cosmic dashboard. Moon in Scorpio, 67% illumination. Every planet and which house it's in for my chart specifically. Mars is in my 10th house, career activated for 6 weeks. My tarot card is seeded from my actual placements, not random. Even the crystal changes daily based on the current moon. Every single thing on this screen is personalized to my birth chart. Every morning.",
  textOverlays: [
    // Work as standalone mute story
    {
      text: 'your chart, not your sun sign',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'every planet + YOUR houses',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'this transit is hitting your 10th house',
      startSeconds: 7,
      durationSeconds: 3,
      position: 'top',
    },
    // Retention hook overlay at 10s
    {
      text: "wait - the tarot card isn't random",
      startSeconds: 10,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'crystal from 200+ database',
      startSeconds: 13,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    'What does your morning cosmic check-in look like? Moon phase, every planet mapped to your houses, transit activating your career house, tarot seeded from your placements, crystal matched to the current moon. All from your birth chart.',
  hashtags: [
    'astrology',
    'birthchart',
    'moonphase',
    'cosmicenergy',
    'astrologyapp',
    'lunary',
    'tarot',
    'crystals',
    'witchtok',
    'pov',
  ],
  playwrightNotes:
    'Start at /app after auth. Dismiss modals (Escape + backdrop click). Fast pace: show dashboard, expand Sky Now, scroll through transit + tarot + crystal, click crystal modal. iPhone viewport. Smooth scrolls but FAST - 2s per section max.',
};

const horoscopeDeepDive: TikTokScript = {
  id: 'horoscope-deepdive',
  title: 'Your Horoscope Is Written for 600 Million People',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 22,
  hook: {
    // Bold claim / pattern interrupt - stops the scroll
    text: 'Your horoscope is written for 600 million people. This one is written for 1.',
    durationSeconds: 2,
  },
  scenes: [
    // PROBLEM → SOLUTION arc: the "1 person" is immediately shown
    {
      description:
        'Horoscope page - personalized greeting + cosmic highlight card',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Name visible in greeting - this is FOR you, not generic',
    },
    {
      description: 'Scroll to numerology - personal vs universal side by side',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Two different numbers - YOUR number vs the universal one',
    },
    {
      description: 'Tap personal day number - modal with explanation',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="numerology-day"]',
      focusPoint: 'Full breakdown of YOUR day energy',
    },
    // RETENTION HOOK at ~9s: pivot from numerology to transits
    {
      description: 'Close modal, scroll to Transit Wisdom - the big reveal',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 350,
      focusPoint: 'Which houses are activated with intensity badges',
    },
    {
      description: 'Scroll to aspects forming to YOUR natal planets',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Exact orbs - real astronomical data, not vibes',
    },
    // SECOND ESCALATION at ~14s: the 30-day forecast
    {
      description: 'Scroll to 30-day upcoming transits',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Your personal forecast - see what is coming',
    },
  ],
  outro: {
    // LOOP: "That's a horoscope" → viewer thinks about their own generic horoscope → rewatches
    text: "That's a horoscope.",
    durationSeconds: 2,
  },
  voiceover:
    "Your horoscope is written for 600 million people. This one is written for one person. Me. My personal numerology number today versus the universal one. Completely different energies. Transit wisdom showing which of my houses are activated and how intense each one is. Exact aspects forming to my natal planets with real orbs. And a 30-day personal forecast of what's coming for my chart specifically. That's a horoscope.",
  textOverlays: [
    {
      text: '600 million vs 1',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'your number ≠ the universal number',
      startSeconds: 4,
      durationSeconds: 3,
      position: 'top',
    },
    // Retention hook at 9s
    {
      text: 'now look at which houses are activated',
      startSeconds: 9,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: 'real orbs, real data',
      startSeconds: 12,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'your next 30 days',
      startSeconds: 16,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    'How many people share your sun sign horoscope? About 600 million. How many people share this one? One. What does your personal horoscope actually look like?',
  hashtags: [
    'horoscope',
    'astrology',
    'birthchart',
    'transits',
    'numerology',
    'astrologyapp',
    'lunary',
    'zodiac',
    'witchtok',
    'personalhoroscope',
  ],
  playwrightNotes:
    'Navigate to /horoscope. Fast pace: show greeting, scroll to numerology, click day number modal (3s), close + scroll to transit wisdom, scroll to aspects, scroll to upcoming transits. Each section 2-3s max.',
};

const tarotPatterns: TikTokScript = {
  id: 'tarot-patterns',
  title: 'I Keep Pulling the Same Cards During Pluto Transits',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 21,
  hook: {
    // Open loop - show the RESULT first, make them want to know how
    text: 'I keep pulling The Tower every time Pluto is active. Coincidence?',
    durationSeconds: 2,
  },
  scenes: [
    // START with the proof (pattern view) then REWIND to show how
    {
      description: 'Jump straight to 30-day pattern view - the proof',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 500,
      focusPoint: 'Pattern analysis showing frequent cards + suit distribution',
    },
    {
      description: 'Click 30 days - show the recurring themes',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-30days"]',
      focusPoint: 'Themes, frequent cards, recurring suits - visible proof',
    },
    // REWIND: "Here's how it works"
    {
      description: 'Scroll back up to daily card showing transit connection',
      path: '/tarot',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: -500,
      focusPoint:
        'Daily card with transit connection - THIS is where the data comes from',
    },
    {
      description: 'Show the transit link on the daily card',
      path: '/tarot',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Card seeded from chart + connected to current transits',
    },
    // ESCALATION at ~11s: zoom out to bigger timeframes
    {
      description: 'Scroll back to patterns, click 90 days',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 500,
      focusPoint: 'Pattern section reappears',
    },
    {
      description: 'Click 90 day view - long term evolution',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-90days"]',
      focusPoint:
        'Themes shifting over 3 months - your personal textbook forming',
    },
    // PAYOFF: rituals based on YOUR patterns
    {
      description: 'Scroll to rituals generated from your patterns',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Personalized rituals + journal prompts from YOUR card data',
    },
  ],
  outro: {
    // LOOP: "not a coincidence" echoes the hook → rewatch
    text: 'Not a coincidence.',
    durationSeconds: 2,
  },
  voiceover:
    "Look at this. I keep pulling The Tower during Pluto transits. Cups dominate every time Venus hits my 7th house. Here's how. Every daily card is connected to the transits in your chart. Over time, the app maps what cards appear during which cosmic conditions. At 30 days you see the first patterns. At 90 days, it's undeniable. Your own cards proved the connection. Not a coincidence.",
  textOverlays: [
    {
      text: 'same cards, same transits',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: "here's how it tracks this",
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'each card is linked to your transits',
      startSeconds: 7,
      durationSeconds: 3,
      position: 'top',
    },
    // Retention hook at 11s
    {
      text: 'now zoom out to 90 days',
      startSeconds: 11,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'rituals based on YOUR patterns',
      startSeconds: 16,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    'Same cards keep appearing during the same transits. After 90 days, the pattern is undeniable. What patterns would YOUR cards reveal?',
  hashtags: [
    'tarot',
    'tarotpatterns',
    'thetower',
    'pluto',
    'astrology',
    'witchtok',
    'tarottok',
    'lunary',
    'patternrecognition',
    'divination',
  ],
  playwrightNotes:
    'Navigate to /tarot. IMPORTANT: Start at pattern section (scroll down), show 30d patterns first (the hook payoff), then scroll BACK UP to daily card to show how it works, then scroll back down to 90d for escalation, then to rituals. Reverse chronology = open loop structure.',
};

const astralGuide: TikTokScript = {
  id: 'astral-guide',
  title: 'Every Answer Is Sourced From 2,000+ Articles',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 22,
  hook: {
    // Open loop - show the impressive result FIRST, then reveal the source
    text: 'I asked about Mars in my 3rd house. It pulled the exact grimoire article.',
    durationSeconds: 2,
  },
  scenes: [
    // START with the answer (the payoff) - reverse chronology
    {
      description: 'Guide page showing a detailed response already loaded',
      path: '/guide',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        'Rich response visible - referenced articles, chart data, crystal recs',
    },
    {
      description: 'Scroll through response showing sourced data',
      path: '/guide',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint:
        'Crystal from 200+ database with correspondences, spell from grimoire',
    },
    // REWIND: "Here's what I asked"
    {
      description: 'Scroll back up to show the original question',
      path: '/guide',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: -400,
      focusPoint:
        'The question: "Why do I feel restless when Mars transits my 3rd house?"',
    },
    // RETENTION HOOK at ~9s: show WHERE the data comes from
    {
      description: 'Type a new question to show it live',
      path: '/guide',
      durationSeconds: 3,
      action: 'type',
      target: '[data-testid="guide-input"]',
      typeText: 'What crystal should I use today?',
      focusPoint: 'Quick question showing breadth - it covers everything',
    },
    {
      description: 'Submit and watch response stream in',
      path: '/guide',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="guide-submit"]',
      focusPoint:
        'Response pulls from crystal database + current transits + journal',
    },
    // ESCALATION at ~15s: show the quick actions
    {
      description: 'Show quick action buttons for common questions',
      path: '/guide',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: -200,
      focusPoint: 'Pre-built prompts: no need to know what to ask',
    },
  ],
  outro: {
    // LOOP: "Nothing invented" → viewer questions their own tools → rewatches
    text: 'Nothing invented. Everything referenced.',
    durationSeconds: 2,
  },
  voiceover:
    "Look at this answer. It pulled the grimoire article on Mars in the 3rd house, found my natal Mercury square Mars, checked my journal from the last time this happened, and recommended a crystal with exact correspondences. All sourced. I ask about today's crystal. It pulls from 200 plus crystals, checks my current transits, and gives me timing. 2,000 plus articles, 200 plus crystals, 112 spells, your chart, your journal. Nothing invented. Everything referenced.",
  textOverlays: [
    {
      text: 'sourced from the grimoire',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'YOUR chart + YOUR journal',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 9s
    {
      text: 'it covers everything',
      startSeconds: 9,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: '200+ crystals, 112 spells',
      startSeconds: 12,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: '2,000+ articles backing every answer',
      startSeconds: 16,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    'Asked about Mars in my 3rd house. It pulled the exact grimoire article, checked my natal aspects, referenced my journal. 2,000+ articles, 200+ crystals, 112 spells. Nothing invented.',
  hashtags: [
    'astrology',
    'birthchart',
    'grimoire',
    'witchtok',
    'spiritualtok',
    'lunary',
    'crystals',
    'spells',
    'personalizedastrology',
    'chartreading',
  ],
  playwrightNotes:
    'Navigate to /guide. IMPORTANT: Pre-load a good response first (account needs chat history). Show response FIRST (open loop), scroll through sourced data, scroll back to question, type new question, submit, show response streaming. Reverse chronology = curiosity hook.',
};

const birthChart: TikTokScript = {
  id: 'birth-chart',
  title: 'Your App Only Shows 10 Planets',
  tier: 1,
  category: 'feature-reveal',
  totalSeconds: 21,
  hook: {
    // Bold claim + number contrast - stops scroll
    text: 'Your astrology app shows 10 planets. This one shows 24.',
    durationSeconds: 2,
  },
  scenes: [
    // ESCALATING REVEAL: each tab more impressive than the last
    {
      description: 'Chart wheel loads - beautiful visual hook',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        'Full birth chart wheel - visually stunning, stops the scroll',
    },
    {
      description: 'Scroll to planet list - the count escalation begins',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 350,
      focusPoint: 'Sun through Pluto visible - "ok normal so far"',
    },
    {
      description: 'Keep scrolling - Chiron, Lilith, Nodes appear',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint:
        'Chiron, Lilith, North Node, South Node - "wait there is more"',
    },
    // RETENTION HOOK at ~8s: switch to aspects tab
    {
      description: 'Click Aspects tab - pattern interrupt',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="tab-aspects"], button:has-text("Aspects")',
      focusPoint: 'Aspect grid appears with real orbs',
    },
    {
      description: 'Scroll through aspects - conjunctions, trines, squares',
      path: '/birth-chart',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Every aspect explained with exact orbs - real data',
    },
    // SECOND ESCALATION at ~13s: houses tab
    {
      description: 'Click Houses tab',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="tab-houses"], button:has-text("Houses")',
      focusPoint: 'All 12 houses with signs and rulers',
    },
    {
      description: 'Scroll through houses - each area of life mapped',
      path: '/birth-chart',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Career, love, home, identity - all mapped to YOUR signs',
    },
  ],
  outro: {
    // LOOP: "Free" makes viewer think "wait, all of THAT is free?" → rewatch
    text: 'Free.',
    durationSeconds: 2,
  },
  voiceover:
    'Your astrology app shows 10 planets. This one shows 24. Sun through Pluto, sure. But then Chiron, Lilith, North Node, South Node, Juno, Ceres, Pallas, Vesta. Every single placement explained. Aspects tab shows exactly how your planets interact with real orbs. Houses tab maps every area of your life to your specific signs. And the birth chart calculator? Free.',
  textOverlays: [
    {
      text: '10 → 24 celestial bodies',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'Chiron, Lilith, Nodes, asteroids',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 8s
    {
      text: 'now look at the aspects',
      startSeconds: 8,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'real orbs, real data',
      startSeconds: 11,
      durationSeconds: 2,
      position: 'top',
    },
    // Second escalation at 13s
    {
      text: 'every house = every area of your life',
      startSeconds: 13,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: 'completely free',
      startSeconds: 18,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    'Your astrology app shows 10 planets. This one shows 24. Chiron, Lilith, Nodes, asteroids. Every aspect with real orbs. All 12 houses mapped. And the birth chart calculator is free.',
  hashtags: [
    'birthchart',
    'astrology',
    'natalchart',
    'chiron',
    'northnode',
    'astrologychart',
    'astrologyapp',
    'lunary',
    'zodiac',
    'witchtok',
  ],
  playwrightNotes:
    'Navigate to /chart. FAST PACE: Show chart wheel (2s), scroll to planets (2s), scroll to reveal Chiron/Lilith/Nodes (2s), click Aspects tab (2s), scroll aspects (3s), click Houses tab (2s), scroll houses (2s). Escalating reveal - each tab more impressive. The "Free" at the end is the loop trigger.',
};

const profileCircle: TikTokScript = {
  id: 'profile-circle',
  title: '84% Compatible. But Look at the Timing Tab.',
  tier: 1,
  category: 'walkthrough',
  totalSeconds: 22,
  hook: {
    // Open loop - tease the TIMING tab (the unique feature), make them stay to see it
    text: '84% compatible with my best friend. But wait until you see the Timing tab.',
    durationSeconds: 2,
  },
  scenes: [
    // Fast setup: get to the friend profile ASAP
    {
      description: 'Circle tab - tap friend card showing 84% compatibility',
      path: '/profile',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="friend-card"]',
      focusPoint: 'Friend card with % and streak - quick visual, move fast',
    },
    {
      description: 'Friend overview loads - big compatibility score',
      path: '/profile/friends/[id]',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Large 84% score + key placements at a glance',
    },
    {
      description: 'Tap Synastry tab - element balance appears',
      path: '/profile/friends/[id]',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="tab-synastry"]',
      focusPoint: 'Fire/Earth/Air/Water bars comparing You vs Them',
    },
    // RETENTION HOOK at ~8s: scroll to the aspect list
    {
      description: 'Scroll to aspects - every one listed with orbs',
      path: '/profile/friends/[id]',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 350,
      focusPoint: 'Harmonious vs challenging with planet pairs + orbs',
    },
    {
      description: 'Tap Their Chart tab - full birth chart wheel',
      path: '/profile/friends/[id]',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="tab-chart"]',
      focusPoint: "Friend's complete chart wheel - visually impressive",
    },
    // THE PAYOFF at ~15s: the Timing tab (what the hook promised)
    {
      description: 'Tap Timing tab - the big reveal',
      path: '/profile/friends/[id]',
      durationSeconds: 3,
      action: 'click',
      target: '[data-testid="tab-timing"]',
      focusPoint: 'Best times to connect analyzing BOTH charts',
    },
    {
      description: 'Scroll through timing windows',
      path: '/profile/friends/[id]',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint:
        'Specific date ranges + what type of conversation is supported',
    },
  ],
  outro: {
    // LOOP: "Based on both charts" → viewer thinks about their own friendships → rewatch
    text: 'Based on both charts. Not just yours.',
    durationSeconds: 2,
  },
  voiceover:
    "84 percent compatible with my best friend. But that's just the start. Synastry shows our element balance side by side. Every aspect between our charts listed. Harmonious vs challenging. I can see her complete birth chart. But here's what no other app has. Timing. It analyzes BOTH our transits and shows me the best windows to have important conversations. Based on both charts. Not just mine.",
  textOverlays: [
    {
      text: "84% - but that's just the start",
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'element balance: You vs Them',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 8s
    {
      text: 'every aspect between your charts',
      startSeconds: 8,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'their full birth chart',
      startSeconds: 12,
      durationSeconds: 2,
      position: 'top',
    },
    // Payoff at 15s
    {
      text: 'BEST TIMES TO CONNECT',
      startSeconds: 15,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: 'analyzes BOTH charts',
      startSeconds: 18,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    '84% compatible. Every aspect between our charts listed with orbs. Element balance. Their full birth chart. And the best times to have important conversations based on BOTH our transits. Not a percentage. A relationship guide.',
  hashtags: [
    'synastry',
    'compatibility',
    'astrology',
    'relationshipastrology',
    'birthchart',
    'cosmicconnection',
    'astrologyapp',
    'lunary',
    'witchtok',
    'zodiaccompatibility',
  ],
  playwrightNotes:
    'IMPORTANT: Navigate to /profile first, click Circle tab (may already be default). Click first friend card. Fast pace through Overview → Synastry → scroll aspects → Their Chart → TIMING (the payoff). The Timing tab is the hook payoff so give it the most screen time. data-testid attributes on all tabs.',
};

// ============================================================================
// TIER 2: DEEP DIVES
// ============================================================================

const skyNowDeepDive: TikTokScript = {
  id: 'sky-now-deepdive',
  title: 'Mercury Retrograde Is in My 6th House. That Explains Work.',
  tier: 2,
  category: 'deep-dive',
  totalSeconds: 19,
  hook: {
    // Specific example hook - relatable + curiosity about "which house"
    text: "Mercury retrograde is in my 6th house. That's why work feels chaotic.",
    durationSeconds: 2,
  },
  scenes: [
    // Start with the collapsed grid - tease the data
    {
      description: 'Sky Now widget collapsed - planet symbols visible',
      path: '/app',
      durationSeconds: 2,
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
      description: 'Scroll to Mercury - the retrograde proof',
      path: '/app',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint:
        'Mercury with retrograde symbol + house placement - hook payoff',
    },
    // RETENTION HOOK at ~9s: keep scrolling to outer planets
    {
      description: 'Keep scrolling - Jupiter, Saturn appearing',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Outer planets with YOUR house placements',
    },
    {
      description: 'Scroll to Uranus, Neptune, Pluto',
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Generational planets mapped to YOUR specific houses',
    },
  ],
  outro: {
    // LOOP: "your houses" echoes the hook about 6th house → viewer wants to know THEIR houses
    text: 'Every planet. YOUR houses. Updated live.',
    durationSeconds: 2,
  },
  voiceover:
    "Mercury retrograde in my 6th house. That explains the work chaos. Here's the full sky right now. Every planet, what sign and degree it's at, and which house it's activating in my chart. Not a generic sky map. Mercury retrograde isn't the same for everyone. In my 6th house it hits work and health. In your 7th it hits relationships. Jupiter, Saturn, Neptune, Pluto, all mapped to my houses. Every planet. Your houses. Updated live.",
  textOverlays: [
    {
      text: 'every planet in the sky right now',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'sign + degree + YOUR house',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 9s
    {
      text: 'retrograde hits different houses differently',
      startSeconds: 9,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: 'outer planets mapped to YOUR chart',
      startSeconds: 13,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    'Mercury retrograde in your 6th house hits completely different than in your 7th. Every planet in the sky right now mapped to YOUR specific houses. Which house is Mercury retrograde hitting for you?',
  hashtags: [
    'astrology',
    'mercuryretrograde',
    'transits',
    'retrograde',
    'birthchart',
    'cosmicweather',
    'astrologyapp',
    'lunary',
    'zodiac',
    'witchtok',
  ],
  playwrightNotes:
    'Start at /app. Show Sky Now collapsed, click expand (satisfying cascade animation), scroll through planets. PAUSE on Mercury to show retrograde symbol + house. Continue scrolling through outer planets. House column must be visible.',
};

const numerologyDeepDive: TikTokScript = {
  id: 'numerology-deepdive',
  title: 'My Personal Day Is a 7. The Universal Day Is a 3.',
  tier: 2,
  category: 'did-you-know',
  totalSeconds: 20,
  hook: {
    // Contrast hook - two numbers side by side creates instant curiosity
    text: 'My personal day is 7. The universal day is 3. Completely different energies.',
    durationSeconds: 2,
  },
  scenes: [
    // Show the contrast immediately - visual proof of the hook
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
      focusPoint: 'Modal: "7 = introspection, inner wisdom" - specific to YOU',
    },
    // RETENTION HOOK at ~7s: close and show the universal for contrast
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
        'Universal 3 = communication, social. YOUR 7 = introspection. Opposite.',
    },
    // ESCALATION at ~11s: reveal there are MORE personal numbers
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
    // LOOP: "your birthdate" → viewer wonders what THEIR numbers are → rewatch
    text: 'All from your birthdate. Not the universal year.',
    durationSeconds: 2,
  },
  voiceover:
    'My personal day is a 7. Introspection. The universal day is a 3. Communication. Those are opposite energies. The universal number applies to everyone. Your personal number is calculated from your birthdate. Only yours. And it goes deeper. Personal month number, personal year number. Three nested cycles all unique to your birth date. When you feel out of sync? You might be following the universal energy instead of your own.',
  textOverlays: [
    {
      text: '7 vs 3 — opposite energies',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'calculated from YOUR birthdate',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 7s
    {
      text: 'the universal one applies to everyone',
      startSeconds: 7,
      durationSeconds: 2,
      position: 'top',
    },
    // Escalation at 11s
    {
      text: 'wait — there are MORE personal numbers',
      startSeconds: 11,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: 'day + month + year cycles',
      startSeconds: 15,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    'My personal day is 7 (introspection). The universal day is 3 (communication). Opposite energies. Your personal numbers are calculated from YOUR birthdate. Day, month, year. What are yours?',
  hashtags: [
    'numerology',
    'personalnumbers',
    'lifepath',
    'personalyear',
    'astrology',
    'birthdate',
    'astrologyapp',
    'lunary',
    'spirituality',
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
  totalSeconds: 21,
  hook: {
    // Escalating numbers hook - viewers want to see the 90-day payoff
    text: '7 days: noise. 30 days: patterns. 90 days: proof.',
    durationSeconds: 2,
  },
  scenes: [
    // Escalating reveal: 7 → 30 → 90, each more impressive
    {
      description: 'Pattern section - click 7 days',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-7days"]',
      focusPoint: '7-day view - basic frequent cards - "just noise"',
    },
    {
      description: 'Show 7-day results - sparse but hints visible',
      path: '/tarot',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'A few frequent cards, not much to see yet',
    },
    // ESCALATION at ~6s: click 30 days
    {
      description: 'Click 30 days - data transforms',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-30days"]',
      focusPoint: 'Suit distribution, recurring themes appear - "wait"',
    },
    {
      description: 'Scroll through 30-day insights',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Cups dominating, Tower during Pluto, themes forming',
    },
    // RETENTION HOOK at ~11s: the 90-day payoff
    {
      description: 'Click 90 days - the big reveal',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="pattern-90days"]',
      focusPoint: '90-day view loads - undeniable patterns',
    },
    {
      description: 'Scroll through 90-day insights - theme evolution',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Themes shifting over months, cosmic connections proven',
    },
    {
      description: 'Scroll to rituals generated from patterns',
      path: '/tarot',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Personalized rituals from YOUR pattern data',
    },
  ],
  outro: {
    // LOOP: "Your cards already proved it" → viewer wonders what THEIR cards would show
    text: 'Your cards already proved it.',
    durationSeconds: 2,
  },
  voiceover:
    "7 days. Just noise. A few frequent cards. 30 days. Now we're talking. Cups dominate every time Venus is active. The Tower keeps showing up during Pluto transits. 90 days. Undeniable. I can see exactly how my themes shifted over months. Same suits during same transits. My own data became my textbook. No astrologer told me this. My cards already proved it.",
  textOverlays: [
    {
      text: '7 days: just noise',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: '30 days: patterns forming',
      startSeconds: 6,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'Cups dominate during Venus transits',
      startSeconds: 9,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 11s
    {
      text: '90 days: undeniable',
      startSeconds: 11,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'your data = your textbook',
      startSeconds: 15,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    '7 days: noise. 30 days: patterns. 90 days: proof. Same suits during same transits. Same cards during same moon phases. My own data proved the cosmic connection. What would YOUR cards reveal?',
  hashtags: [
    'tarot',
    'tarotpatterns',
    'patternrecognition',
    'astrology',
    'tarottok',
    'witchtok',
    'lunary',
    'tarotreading',
    'cosmicpatterns',
    'spiritualjourney',
  ],
  playwrightNotes:
    'Navigate to /tarot, scroll to pattern section. ESCALATING PACE: 7d (quick, "meh"), 30d (slower, let patterns sink in), 90d (the payoff, give it the most time). Click through timeframes, scroll insights on 30d and 90d. Account needs rich tarot history.',
};

const ritualSystem: TikTokScript = {
  id: 'ritual-system',
  title: "Why Today's Ritual Is About Home and Family",
  tier: 2,
  category: 'did-you-know',
  totalSeconds: 19,
  hook: {
    // Specific example hook - makes viewer wonder "what would MY ritual be?"
    text: "Today's ritual focuses on home and family. Because the moon is in my 4th house.",
    durationSeconds: 2,
  },
  scenes: [
    // Show the ritual immediately - proof of the hook
    {
      description: "Dashboard ritual card showing today's ritual",
      path: '/app',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Ritual card with completion tracking - matches the hook',
    },
    {
      description: 'Navigate to horoscope for full ritual details',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'navigate',
      target: '/horoscope',
      focusPoint: 'Page transition - fast',
    },
    // ESCALATION at ~6s: show WHY this ritual was chosen
    {
      description: 'Scroll to ritual section - full personalized details',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 400,
      focusPoint:
        'Ritual aligned to moon phase + active transits in YOUR chart',
    },
    // RETENTION HOOK at ~9s: the "how" behind the personalization
    {
      description: 'Show ritual instructions tied to cosmic energy',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Step-by-step instructions + WHY this timing matters',
    },
    {
      description: 'Scroll to crystal recommendation tied to ritual',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Crystal matched to ritual energy - everything connected',
    },
  ],
  outro: {
    // LOOP: "Different tomorrow" → viewer wonders what theirs would be → rewatch
    text: 'Different tomorrow. Because the moon moves.',
    durationSeconds: 2,
  },
  voiceover:
    "Today's ritual focuses on home and family. Why? The moon is in my 4th house right now. Yesterday it was about communication because the moon was in my 3rd. Every day, the ritual changes based on which house the moon activates in YOUR chart and which transits are active. The crystal recommendation matches too. Everything connected to your cosmic weather right now. Different tomorrow. Because the moon moves.",
  textOverlays: [
    {
      text: 'moon in 4th house = home + family',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'yesterday: communication (3rd house)',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 9s
    {
      text: 'ritual matched to YOUR transits',
      startSeconds: 9,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: 'even the crystal recommendation',
      startSeconds: 13,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    "Today's ritual: home and family intentions. Why? Moon is in my 4th house. Yesterday it was communication (3rd house). The ritual changes daily based on YOUR chart. What house is the moon activating for you right now?",
  hashtags: [
    'ritual',
    'moonphase',
    'witchcraft',
    'dailyritual',
    'moonmagic',
    'astrology',
    'witchtok',
    'lunary',
    'spellwork',
    'cosmicpractice',
  ],
  playwrightNotes:
    'Show dashboard ritual card (fast), navigate to /horoscope, scroll to ritual section. Key: show the connection between moon house and ritual theme. Pause on instructions. Show crystal recommendation. Fast pace - each scene 2-3s.',
};

const transitWisdomDeepDive: TikTokScript = {
  id: 'transit-wisdom-deepdive',
  title: 'Venus in Aries Hits My 7th House. Relationships.',
  tier: 2,
  category: 'deep-dive',
  totalSeconds: 21,
  hook: {
    // Specific example + "12 different meanings" creates curiosity about THEIR meaning
    text: "Venus entering Aries. 12 different meanings depending on your chart. Here's mine.",
    durationSeconds: 2,
  },
  scenes: [
    // Show the specific transit immediately - proof of hook
    {
      description:
        'Transit Wisdom section - first transit with house + intensity',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 350,
      focusPoint: 'Venus in Aries → 7th house → Relationships → High intensity',
    },
    {
      description: 'Show the intensity badge - this transit matters',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Intensity badge - "this one\'s a big deal for you"',
    },
    // ESCALATION at ~6s: there are MORE transits active
    {
      description: 'Scroll to show multiple active transits',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Multiple transits hitting different areas simultaneously',
    },
    // RETENTION HOOK at ~9s: aspects with real data
    {
      description: 'Scroll to exact aspects - real astronomical data',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Aspects forming to YOUR natal planets with real orbs',
    },
    // SECOND PAYOFF at ~14s: the 30-day forecast
    {
      description: 'Scroll to upcoming transits - your personal forecast',
      path: '/horoscope',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: "30-day forecast - see what's coming for YOUR chart",
    },
    {
      description: 'Show specific upcoming dates and transits',
      path: '/horoscope',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Specific dates + which transits + which houses',
    },
  ],
  outro: {
    // LOOP: "Not for all Leos" → viewer thinks about their generic horoscope → rewatch
    text: 'Not a paragraph for all Leos.',
    durationSeconds: 2,
  },
  voiceover:
    "Venus entering Aries means something different for every person depending on which house it hits. For me it's my 7th house. Relationships. With a high intensity badge. But that's just one transit. I can see every transit active right now and which areas of my life they're touching. Exact aspects forming to my natal planets with real orbs. And the next 30 days. What's coming, when, and which houses. Not a paragraph for all Leos.",
  textOverlays: [
    {
      text: 'Venus in Aries → my 7th house',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'intensity badge: this one matters',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 9s
    {
      text: 'exact aspects with real orbs',
      startSeconds: 9,
      durationSeconds: 3,
      position: 'top',
    },
    // Second payoff at 14s
    {
      text: 'your next 30 days mapped out',
      startSeconds: 14,
      durationSeconds: 3,
      position: 'top',
    },
  ],
  caption:
    'Venus entering Aries hits my 7th house. Relationships. High intensity. But your 7th house has a different sign. Same transit, 12 different meanings. Which house is Venus hitting for you?',
  hashtags: [
    'transits',
    'astrology',
    'birthchart',
    'planetarytransits',
    'horoscope',
    'personalized',
    'astrologyapp',
    'lunary',
    'cosmicweather',
    'witchtok',
  ],
  playwrightNotes:
    'Navigate to /horoscope. Scroll to Transit Wisdom. Show first transit with house + intensity badge (2s). Show next transits (3s). Scroll to aspects (3s). Scroll to 30-day forecast (3s+2s). Fast escalation - each section reveals more depth.',
};

const streaksAndProgress: TikTokScript = {
  id: 'streaks-progress',
  title: "The App Detected 3 Life Themes I Didn't Pick",
  tier: 2,
  category: 'did-you-know',
  totalSeconds: 20,
  hook: {
    // Open loop - "3 life themes" creates curiosity. "I didn't pick" = pattern interrupt
    text: "After 73 days, the app detected 3 life themes. I didn't choose them.",
    durationSeconds: 2,
  },
  scenes: [
    // Show the streak count first - credibility
    {
      description: 'Profile with streak counter and progress bar',
      path: '/profile',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        '73-day streak, progress bar, achievement badge - credibility',
    },
    {
      description: 'Scroll past Big 3 and personal card - quick flash',
      path: '/profile',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Sun, Moon, Rising, personal tarot card - context, move fast',
    },
    // THE PAYOFF at ~6s: life themes (what the hook promised)
    {
      description: 'Life Themes section - the reveal',
      path: '/profile',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint:
        '3 themes: Creative Emergence, Deepening Connection, Building Foundations',
    },
    {
      description: 'Expand a theme to show detail',
      path: '/profile',
      durationSeconds: 3,
      action: 'expand',
      target: '[data-testid="life-theme"]',
      focusPoint:
        'Full explanation of how the theme emerged from YOUR patterns',
    },
    // RETENTION HOOK at ~12s: monthly insights prove the depth
    {
      description: 'Scroll to monthly insights',
      path: '/profile',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 250,
      focusPoint: 'Monthly activity graph, frequent cards, transit impacts',
    },
    {
      description: 'Show transit impact breakdown',
      path: '/profile',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 150,
      focusPoint: 'Which transits hit hardest this month - data-backed',
    },
  ],
  outro: {
    // LOOP: "your chart comes alive" → viewer imagines their own journey → rewatch
    text: 'After 2-3 months, your chart comes alive.',
    durationSeconds: 2,
  },
  voiceover:
    "73 days of daily check-ins. The app detected 3 life themes running through my journey. Creative Emergence. Deepening Connection. Building Foundations. I didn't pick these. They emerged from my tarot patterns, journal entries, and transits. Monthly insights show which cards keep appearing and which transits are hitting hardest. After 2-3 months, your chart comes alive.",
  textOverlays: [
    {
      text: '73 day streak',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    // Payoff at 6s
    {
      text: '3 life themes - detected from YOUR data',
      startSeconds: 6,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: '"I didn\'t choose them"',
      startSeconds: 10,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 12s
    {
      text: 'monthly insights evolve over time',
      startSeconds: 12,
      durationSeconds: 3,
      position: 'top',
    },
  ],
  caption:
    "73 days of cosmic check-ins. The app detected 3 life themes I didn't choose. They emerged from my patterns. What themes would emerge from yours?",
  hashtags: [
    'astrology',
    'streak',
    'dailypractice',
    'patternrecognition',
    'spiritualjourney',
    'astrologyapp',
    'lunary',
    'witchtok',
    'cosmicjourney',
    'selfgrowth',
  ],
  playwrightNotes:
    'Navigate to /profile. Show streak counter (2s), flash Big 3 (2s), PAUSE on life themes (3s+3s - this is the hook payoff). Expand one theme for detail. Scroll to monthly insights. Account needs 50+ day streak and enough data for life themes.',
};

const tarotSpreads: TikTokScript = {
  id: 'tarot-spreads',
  title: "The Outcome Card Knows What Transit You're In",
  tier: 2,
  category: 'how-to',
  totalSeconds: 21,
  hook: {
    // Specific surprising detail - outcome card connected to transits = novel
    text: 'Full Celtic Cross. 10 cards. The outcome card knows your current transits.',
    durationSeconds: 2,
  },
  scenes: [
    // Fast setup: get to the spread
    {
      description: 'Spread section - tap Celtic Cross',
      path: '/tarot',
      durationSeconds: 2,
      action: 'click',
      target: 'button:has-text("Celtic Cross")',
      focusPoint: 'Celtic Cross button selected - anticipation',
    },
    // VISUAL PAYOFF: cards drawing - satisfying to watch
    {
      description: 'Cards draw into 10 positions - mesmerizing animation',
      path: '/tarot',
      durationSeconds: 3,
      action: 'wait',
      focusPoint: 'Cards filling Celtic Cross layout - visually satisfying',
    },
    {
      description: 'Show completed spread - all 10 cards visible',
      path: '/tarot',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Full spread visible - impressive layout',
    },
    // RETENTION HOOK at ~9s: scroll to interpretations
    {
      description: 'Scroll to interpretations - personalized to YOUR chart',
      path: '/tarot',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint:
        'Each position interpreted with YOUR transits, not generic meanings',
    },
    // ESCALATION at ~12s: the outcome card connection
    {
      description: 'Scroll to outcome card - transit connection visible',
      path: '/tarot',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint:
        "Outcome card linked to what's happening in your sky right now",
    },
    // BONUS: saves feed into patterns
    {
      description: 'Show save button - feeds into pattern tracking',
      path: '/tarot',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        'Save spread → becomes part of your pattern analysis over time',
    },
  ],
  outro: {
    // LOOP: "What spread should I pull?" → viewer wants to try → rewatch
    text: 'Relationship guidance. Career decisions. Past/Present/Future.',
    durationSeconds: 2,
  },
  voiceover:
    "Full Celtic Cross. Ten cards drawing into position. Each one interpreted for my chart and current transits. The outcome card isn't a generic meaning. It's connected to what's actually happening in my sky right now. Save it. Come back next month. Watch how your saved spreads become part of your pattern analysis. Relationship guidance. Career decisions. Past Present Future.",
  textOverlays: [
    {
      text: '10 cards drawing in',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'each one reads YOUR chart',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 9s
    {
      text: 'not generic meanings',
      startSeconds: 9,
      durationSeconds: 2,
      position: 'top',
    },
    // Escalation at 12s
    {
      text: 'outcome card knows your transits',
      startSeconds: 12,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'save → track patterns over time',
      startSeconds: 16,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    "Full Celtic Cross. 10 cards. Each position interpreted with YOUR current transits. The outcome card knows what's happening in your sky. What spread would you pull?",
  hashtags: [
    'tarot',
    'celticcross',
    'tarotspread',
    'tarotreading',
    'divination',
    'witchtok',
    'tarottok',
    'lunary',
    'spirituality',
    'tarotcards',
  ],
  playwrightNotes:
    'Navigate to /tarot, scroll to Spreads section. Click Celtic Cross. WAIT for draw animation (this is visually satisfying - give it 3s). Show completed spread. Scroll to interpretations. Highlight outcome card transit connection. Show save button. Account needs Lunary+ access.',
};

// ============================================================================
// TIER 3: GRIMOIRE CONTENT
// ============================================================================

const crystalsOverview: TikTokScript = {
  id: 'crystals-overview',
  title: "Name a Crystal. It's in Here.",
  tier: 3,
  category: 'feature-reveal',
  totalSeconds: 19,
  hook: {
    // Challenge hook - dares viewer to try, creates engagement
    text: 'Name a crystal. Properties, chakras, timing, how to use it. All free.',
    durationSeconds: 2,
  },
  scenes: [
    // Show the sheer volume immediately
    {
      description: 'Crystal categories - 8 visible at once',
      path: '/grimoire/crystals',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        'Protection, Love, Spiritual, Manifestation, Healing, Communication...',
    },
    {
      description: 'Fast scroll through crystal list - volume flex',
      path: '/grimoire/crystals',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 400,
      focusPoint:
        'Dozens of crystal cards scrolling past - "there are SO many"',
    },
    // PAYOFF at ~6s: tap into one for the deep dive
    {
      description: 'Tap Amethyst - detail page opens',
      path: '/grimoire/crystals',
      durationSeconds: 2,
      action: 'click',
      target: '[data-crystal-slug="amethyst"], [data-testid="crystal-card"]',
      focusPoint: 'Crystal detail page loading instantly',
    },
    // RETENTION HOOK at ~8s: depth of the guide
    {
      description: 'Show crystal detail - meaning, properties',
      path: '/grimoire/crystals/amethyst',
      durationSeconds: 3,
      action: 'show',
      focusPoint: 'Full guide: what it is, meaning, properties',
    },
    {
      description: 'Scroll to chakras + how to use',
      path: '/grimoire/crystals/amethyst',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Chakra connections, how to use, timing recommendations',
    },
    {
      description: 'Scroll to correspondences and timing',
      path: '/grimoire/crystals/amethyst',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Planetary correspondences + when to use',
    },
  ],
  outro: {
    // LOOP: "Name a crystal" → viewers will comment their crystal → engagement + rewatch
    text: "Name a crystal. It's in here.",
    durationSeconds: 2,
  },
  voiceover:
    "Name a crystal. Amethyst? Properties, meaning, chakras, how to use it, when to use it. Rose quartz? Same. Black tourmaline? Same. 200 plus crystals. 8 categories. Protection, love, spiritual, manifestation, healing, communication, creativity, balance. Every single one with a full guide. Planetary correspondences. Timing recommendations. Name a crystal. It's in here.",
  textOverlays: [
    {
      text: '8 categories, 200+ crystals',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'tap any crystal for full guide',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 8s
    {
      text: 'properties + chakras + timing',
      startSeconds: 8,
      durationSeconds: 3,
      position: 'top',
    },
    {
      text: 'planetary correspondences',
      startSeconds: 13,
      durationSeconds: 2,
      position: 'top',
    },
    { text: 'free', startSeconds: 16, durationSeconds: 2, position: 'top' },
  ],
  caption:
    'Name a crystal. Properties, chakras, how to use it, when to use it. 200+ crystals. 8 categories. Full guides. All free. Drop your crystal in the comments.',
  hashtags: [
    'crystals',
    'crystalhealing',
    'amethyst',
    'crystalguide',
    'witchcraft',
    'witchtok',
    'lunary',
    'spirituality',
    'chakras',
    'crystalproperties',
  ],
  playwrightNotes:
    'Navigate to /grimoire/crystals. No auth needed. Show categories (2s), fast scroll through list (2s), click amethyst (2s), show detail page - meaning/properties (3s), scroll to chakras/use (3s), scroll to correspondences (2s). The "Name a crystal" hook drives comments.',
};

const spellsOverview: TikTokScript = {
  id: 'spells-overview',
  title: 'It Knows Which Spells Work Best Tonight',
  tier: 3,
  category: 'feature-reveal',
  totalSeconds: 20,
  hook: {
    // Curiosity + practical value - "which spells work TONIGHT" is immediately useful
    text: '112 spells. It knows which ones work best tonight based on the moon.',
    durationSeconds: 2,
  },
  scenes: [
    // Show the moon phase indicator first - proof of "tonight"
    {
      description: 'Spells page with current moon phase visible',
      path: '/grimoire/spells',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Moon phase indicator at top - "it knows the current moon"',
    },
    {
      description: 'Show filter buttons - Current Moon Phase highlighted',
      path: '/grimoire/spells',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Filter options visible including "Current Moon Phase"',
    },
    // PAYOFF at ~6s: filter activates, list transforms
    {
      description: 'Click Current Moon Phase filter - list transforms',
      path: '/grimoire/spells',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="filter-moon-phase"]',
      focusPoint: "List filtered to ONLY tonight's optimal spells",
    },
    {
      description: "Scroll through filtered spells - tonight's options",
      path: '/grimoire/spells',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 300,
      focusPoint: 'Spell cards with difficulty, duration, category badges',
    },
    // RETENTION HOOK at ~11s: tap into a spell for full detail
    {
      description: 'Tap a spell - full guide opens',
      path: '/grimoire/spells',
      durationSeconds: 2,
      action: 'click',
      target: '[data-testid="spell-card"]',
      focusPoint: 'Full spell detail loading',
    },
    {
      description: 'Scroll through spell: purpose, timing, ingredients, steps',
      path: '/grimoire/spells/[spell]',
      durationSeconds: 3,
      action: 'scroll',
      scrollDistance: 400,
      focusPoint:
        'Complete guide: ingredients with substitutes, step-by-step, timing',
    },
  ],
  outro: {
    // LOOP: "What's the moon phase right now?" → viewer checks → comes back
    text: 'A grimoire that knows the current moon. Free.',
    durationSeconds: 2,
  },
  voiceover:
    "112 spells and it knows the current moon phase. Filter by tonight's moon and you only see spells that work right now. Protection, love, prosperity, healing, cleansing. Tap any spell. Purpose. Optimal timing. Ingredients with substitutes. Tools. Step by step instructions. A complete grimoire that knows what moon phase you're in right now. Free.",
  textOverlays: [
    {
      text: 'it knows the current moon phase',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: "filter: tonight's best spells",
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'protection, love, prosperity, healing',
      startSeconds: 8,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 11s
    {
      text: 'full guide for every spell',
      startSeconds: 11,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'ingredients + substitutes + steps',
      startSeconds: 14,
      durationSeconds: 3,
      position: 'top',
    },
  ],
  caption:
    "112 spells. Filter by tonight's moon phase. Full instructions, ingredients with substitutes, optimal timing. A complete grimoire that knows the current moon. Free.",
  hashtags: [
    'spells',
    'witchcraft',
    'moonphase',
    'moonmagic',
    'protectionspell',
    'grimoire',
    'witchtok',
    'lunary',
    'spellwork',
    'moonspell',
  ],
  playwrightNotes:
    'Navigate to /grimoire/spells. No auth. Show moon phase indicator (2s), show filters (2s), click Current Moon Phase (satisfying filter animation - 2s), scroll through filtered results (3s), click spell detail (2s), scroll through full guide (3s). The filter activation is the visual payoff.',
};

const grimoireSearch: TikTokScript = {
  id: 'grimoire-search',
  title: 'Search Anything. Venus in Scorpio? Here.',
  tier: 3,
  category: 'feature-reveal',
  totalSeconds: 18,
  hook: {
    // Challenge/dare hook - drives comments ("search MY placement!")
    text: "Search any placement. Venus in Scorpio? Mars in the 10th? It's in here.",
    durationSeconds: 2,
  },
  scenes: [
    // Show volume immediately - fast scroll
    {
      description: 'Grimoire main page - categories cascade',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'show',
      focusPoint:
        'Planets, Signs, Houses, Aspects, Tarot, Crystals, Spells - everything',
    },
    {
      description: 'Fast scroll through categories - volume flex',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 400,
      focusPoint: 'Every planet in every sign, all houses, all aspects - depth',
    },
    // PAYOFF at ~6s: live search demo
    {
      description: 'Type into search bar - live demo',
      path: '/grimoire',
      durationSeconds: 3,
      action: 'type',
      target: '[data-testid="grimoire-search"], input[type="search"]',
      typeText: 'Venus in Scorpio',
      focusPoint: 'Results appearing as you type - instant',
    },
    // RETENTION HOOK at ~9s: results are REAL
    {
      description: 'Show search results - full articles, not snippets',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'show',
      focusPoint: 'Matching articles with rich previews - real depth',
    },
    {
      description: 'Scroll through results showing breadth',
      path: '/grimoire',
      durationSeconds: 2,
      action: 'scroll',
      scrollDistance: 200,
      focusPoint: 'Multiple articles matching - comprehensive coverage',
    },
  ],
  outro: {
    // LOOP: "Search yours" → comment engagement + viewer comes back
    text: 'No paywall on education. Search yours.',
    durationSeconds: 2,
  },
  voiceover:
    'Search any placement. Venus in Scorpio? Full article. Mars in the 10th house? Full article. Mercury retrograde in the 3rd? Full article. Two thousand plus astrology articles. Every planet in every sign. All 12 houses. Every aspect. Tarot. Crystals. Spells. Herbs. No paywall on education. Search yours.',
  textOverlays: [
    {
      text: '2,000+ articles',
      startSeconds: 2,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'planets, signs, houses, aspects, tarot',
      startSeconds: 5,
      durationSeconds: 2,
      position: 'top',
    },
    // Retention hook at 9s
    {
      text: 'full articles, not snippets',
      startSeconds: 9,
      durationSeconds: 2,
      position: 'top',
    },
    {
      text: 'no paywall on education',
      startSeconds: 13,
      durationSeconds: 2,
      position: 'top',
    },
  ],
  caption:
    "Search any placement. Venus in Scorpio? Full article. 2,000+ astrology articles. Completely free. Drop your placement in the comments and I'll tell you if it's in there (it is).",
  hashtags: [
    'astrology',
    'learnastrology',
    'grimoire',
    'astrologyeducation',
    'tarot',
    'crystals',
    'spells',
    'witchtok',
    'lunary',
    'astrologyapp',
  ],
  playwrightNotes:
    'Navigate to /grimoire. No auth. Show categories (2s), fast scroll (2s), type "Venus in Scorpio" into search (3s - use slow typing for readability), show results (2s), scroll results (2s). The "Search yours" CTA drives comment engagement.',
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
      `  Action: ${scene.action}${scene.target ? ` → ${scene.target}` : ''}`,
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
