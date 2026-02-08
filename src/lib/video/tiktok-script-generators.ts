/**
 * Dynamic TikTok Script Generators
 *
 * 6 generator functions that produce TikTokScript objects using real sky data.
 * Each generator replaces hardcoded astrological data with current positions
 * while keeping the same structure, timing, and word-count range as the static originals.
 */

import type { TikTokScript } from './tiktok-scripts';
import type { SkyData } from './tiktok-sky-data';

// ============================================================================
// Helpers
// ============================================================================

/** Map moon sign to a life-area theme word for ritual scripts */
function moonSignToTheme(sign: string): string {
  const themes: Record<string, string> = {
    Aries: 'action',
    Taurus: 'stability',
    Gemini: 'communication',
    Cancer: 'home',
    Leo: 'creativity',
    Virgo: 'healing',
    Libra: 'balance',
    Scorpio: 'transformation',
    Sagittarius: 'expansion',
    Capricorn: 'discipline',
    Aquarius: 'innovation',
    Pisces: 'intuition',
  };
  return themes[sign] || 'reflection';
}

/** Describe the relationship between personal and universal day numbers */
function numberRelationship(personal: number, universal: number): string {
  if (personal === universal) return 'Aligned';
  // Opposite pairs in numerology
  const opposites: Record<number, number[]> = {
    1: [2, 6],
    2: [1, 5],
    3: [4, 7],
    4: [3, 5],
    5: [2, 4],
    6: [1, 7],
    7: [3, 6],
    8: [9],
    9: [8],
  };
  const opps = opposites[personal] || [];
  if (opps.includes(universal)) return 'Opposite';
  return 'Complementary';
}

/**
 * Pick the most interesting fast-moving planet for transit hooks.
 * Prefers Venus/Mars/Mercury as they change signs frequently and
 * produce relatable content.
 */
function pickNotableTransitPlanet(sky: SkyData): {
  planet: string;
  sign: string;
} {
  const preferred = ['Venus', 'Mars', 'Mercury'];
  for (const name of preferred) {
    const p = sky.planets[name];
    if (p) return { planet: name, sign: p.sign };
  }
  // Fallback to Sun
  const sun = sky.planets.Sun;
  return { planet: 'Sun', sign: sun?.sign ?? 'Aries' };
}

// ============================================================================
// Generators
// ============================================================================

function generateDashboardOverview(_sky: SkyData): TikTokScript {
  // Complete rewrite — each scene = one voiceover sentence.
  // Mobile layout order: Moon → Sky Now → Daily Insight → Tarot → Transit → Crystal
  // Voiceover describes EXACTLY what is visible. No referencing off-screen content.
  return {
    id: 'dashboard-overview',
    title: 'POV: Your Morning Cosmic Check-In',
    tier: 1,
    category: 'walkthrough',
    totalSeconds: 20,
    hook: {
      text: "Wait... your app doesn't show houses?",
      durationSeconds: 2.5,
    },
    scenes: [
      {
        // VO: "Personalized horoscope. Daily ritual."
        description:
          "Dashboard loads — Today's Cosmic Energy section with personalized horoscope + daily ritual",
        path: '/app',
        durationSeconds: 2.5,
        action: 'show',
        focusPoint:
          'Personalized horoscope text, daily ritual checkbox, streak counter visible',
      },
      {
        // VO: "Moon phase. Current sign."
        description: 'Scroll to Moon phase card with sign + illumination',
        path: '/app',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 250,
        focusPoint:
          'Moon phase name, constellation, illumination percentage visible',
      },
      {
        // VO: "But look. Every planet."
        description: 'Tap Sky Now — planets cascade open',
        path: '/app',
        durationSeconds: 2.5,
        action: 'expand',
        target: '[data-testid="sky-now-widget"]',
        focusPoint: 'Planet list expanding — signs, degrees, houses visible',
      },
      {
        // VO: "Which house it's in. For YOUR chart."
        description: 'Scroll through expanded planets showing houses',
        path: '/app',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 200,
        focusPoint: 'House numbers next to each planet clearly on screen',
      },
      {
        // VO: "Today's influence. Your tarot card. Connected to your transits."
        description:
          "Scroll to Today's Influence + Tarot for Today with transit connection",
        path: '/app',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 300,
        focusPoint:
          'Daily insight card and tarot card visible — transit connection on tarot',
      },
      {
        // VO: "Your next transit. Which house it's hitting."
        description: 'Scroll to Your Next Transit widget',
        path: '/app',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 200,
        focusPoint:
          'Next transit with planet, house activation, timing, and guidance',
      },
      {
        // VO: "Even the crystal."
        description: 'Scroll to Crystal Preview — visible on screen',
        path: '/app',
        durationSeconds: 1.5,
        action: 'scroll',
        scrollDistance: 200,
        focusPoint: 'Crystal matched to current transits + chart',
      },
    ],
    outro: {
      text: 'Every morning. Your chart.',
      durationSeconds: 2,
    },
    // Scene-aligned voiceover: each sentence matches one scene.
    // 0–2.5s hook (filler). 2.5–5s moon. 5–7.5s sky now expand.
    // 7.5–10s planets. 10–12s insight. 12–14s tarot. 14–16s transit.
    // 16–18s crystal. 18–20s outro.
    voiceover:
      "Okay so. Morning check-in. Personalized horoscope. Daily ritual. Moon phase. Current sign. But look. Every planet. Which house it's in. For YOUR chart. Today's influence. Your tarot card. Connected to your transits. Your next transit. Which house it's hitting. Even the crystal. Everything here... is yours.",
    textOverlays: [],
    caption:
      "Your app doesn't show which house each planet is in. This one does. Horoscope, ritual, moon, planets, tarot with transit connections, crystal — all personalized. What does YOUR morning look like?",
    hashtags: ['astrology', 'birthchart', 'lunary', 'witchtok', 'cosmicenergy'],
    playwrightNotes:
      "Start at /app after auth. Dismiss modals. SLOW deliberate scrolls — each section must be FULLY VISIBLE before the next. Today's Cosmic Energy (2.5s), Moon card (2s), expand Sky Now (2.5s), scroll planets (2s), scroll to Today's Influence + Tarot for Today (2s), Your Next Transit (2s), Crystal (1.5s). iPhone 390x844.",
  };
}

function generateSkyNowDeepDive(sky: SkyData): TikTokScript {
  const hasRetrograde = sky.retrogradePlanets.length > 0;
  const retroPlanet = sky.retrogradePlanets[0] || 'Mercury';

  // Adapt hook, voiceover, and caption based on retrograde state
  const hook = hasRetrograde
    ? `${retroPlanet} Rx mapped to YOUR houses.`
    : 'Every planet. YOUR houses. Right now.';

  const voiceover = hasRetrograde
    ? `${retroPlanet} retrograde in my 6th house. That explains everything. Here's the full sky right now. Every planet... what sign it's at... and which house it's hitting in MY chart. Retrograde isn't the same for everyone. My 6th house = work. Your 7th = relationships. Jupiter, Saturn, Pluto... all mapped to my houses. Updated live.`
    : `Here's the full sky right now. Every planet... what sign it's at... and which house it's hitting in MY chart. Not the same for everyone. My 6th house = work. Your 7th = relationships. Jupiter, Saturn, Pluto... all mapped to my houses. This changes daily. Updated live.`;

  const caption = hasRetrograde
    ? `${retroPlanet} retrograde in your 6th house hits completely different than your 7th. Which house is it hitting for YOU?`
    : 'Every planet right now mapped to YOUR houses. Not your sign. Your chart. Which house is the Moon hitting for YOU?';

  return {
    id: 'sky-now-deepdive',
    title: hasRetrograde
      ? `${retroPlanet} Retrograde Is in My 6th House. That Explains Work.`
      : 'Every Planet Right Now. Mapped to YOUR Houses.',
    tier: 2,
    category: 'deep-dive',
    totalSeconds: 15,
    hook: {
      text: hook,
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
        focusPoint:
          'Every planet: sign, degree, YOUR house - satisfying reveal',
      },
      {
        description: 'Scroll through Sun, Moon, Mercury - personal planets',
        path: '/app',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 120,
        focusPoint:
          'Sun sign + degree + house, Moon + house, Mercury retrograde',
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
    voiceover,
    textOverlays: [
      {
        text: 'every planet. right now.',
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
      {
        text: hasRetrograde
          ? 'retrograde \u2260 same for all'
          : 'different house = different life',
        startSeconds: 9,
        durationSeconds: 3,
        position: 'top',
      },
      {
        text: 'outer planets \u2192 YOUR chart',
        startSeconds: 13,
        durationSeconds: 2,
        position: 'top',
      },
    ],
    caption,
    hashtags: hasRetrograde
      ? [
          `${retroPlanet.toLowerCase()}retrograde`,
          'transits',
          'lunary',
          'astrology',
          'witchtok',
        ]
      : ['transits', 'skynow', 'lunary', 'astrology', 'witchtok'],
    playwrightNotes:
      'Start at /app. Show Sky Now collapsed, click expand (satisfying cascade animation), scroll through planets. PAUSE on Mercury to show retrograde symbol + house. Continue scrolling through outer planets. House column must be visible.',
  };
}

function generateNumerologyDeepDive(sky: SkyData): TikTokScript {
  // Use real numbers or sensible fallbacks
  const pd = sky.numerology?.personalDay ?? 7;
  const ud = sky.numerology?.universalDay ?? 3;
  const pdMeaning =
    sky.numerology?.personalMeaning ?? 'reflection, inner work, and intuition';
  const udMeaning =
    sky.numerology?.universalMeaning ?? 'creativity, communication, and joy';
  const relationship = numberRelationship(pd, ud);

  // First word of each meaning for voiceover
  const pdKeyword = pdMeaning.split(',')[0].trim();
  const udKeyword = udMeaning.split(',')[0].trim();

  return {
    id: 'numerology-deepdive',
    title: `My Personal Day Is a ${pd}. The Universal Day Is a ${ud}.`,
    tier: 2,
    category: 'did-you-know',
    totalSeconds: 18,
    hook: {
      text: `Personal day: ${pd}. Universal day: ${ud}. ${relationship}.`,
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
        focusPoint: `Modal: "${pd} = ${pdKeyword}" - specific to YOU`,
      },
      {
        description: 'Close modal - back to comparison view',
        path: '/horoscope',
        durationSeconds: 2,
        action: 'click',
        target: '[data-testid="numerology-close"]',
        focusPoint:
          'Both numbers visible again - "see how different they are?"',
      },
      {
        description: 'Show universal day for side-by-side contrast',
        path: '/horoscope',
        durationSeconds: 2,
        action: 'show',
        focusPoint: `Universal ${ud} = ${udKeyword}. YOUR ${pd} = ${pdKeyword}. ${relationship}.`,
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
        focusPoint:
          'Day, month, year - three nested cycles from YOUR birthdate',
      },
    ],
    outro: {
      text: 'From your birthdate. Not universal.',
      durationSeconds: 2,
    },
    voiceover: `My personal day is a ${pd}. ${pdKeyword}. The universal day is a ${ud}. ${udKeyword}. ${relationship} energies. The universal number applies to everyone. Your personal number? Calculated from YOUR birthdate. And it goes deeper... personal month, personal year. Three nested cycles unique to you. Feel out of sync? You might be following the universal energy instead of your own.`,
    textOverlays: [
      {
        text: `${pd} vs ${ud} \u2014 ${relationship.toLowerCase()}`,
        startSeconds: 2,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'from YOUR birthdate',
        startSeconds: 5,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'universal = everyone',
        startSeconds: 7,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'wait\u2014MORE cycles?',
        startSeconds: 11,
        durationSeconds: 3,
        position: 'top',
      },
      {
        text: 'day + month + year',
        startSeconds: 15,
        durationSeconds: 2,
        position: 'top',
      },
    ],
    caption: `Personal day: ${pd}. Universal day: ${ud}. ${relationship} energies. Your numbers come from YOUR birthdate. What are yours?`,
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
}

function generateRitualSystem(sky: SkyData): TikTokScript {
  const moonTheme = moonSignToTheme(sky.moonSign);

  return {
    id: 'ritual-system',
    title: `Why Today's Ritual Is About ${moonTheme.charAt(0).toUpperCase() + moonTheme.slice(1)}`,
    tier: 2,
    category: 'did-you-know',
    totalSeconds: 16,
    hook: {
      text: `Today: ${moonTheme} ritual. They change daily.`,
      durationSeconds: 2,
    },
    scenes: [
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
      {
        description: 'Scroll to ritual section - full personalized details',
        path: '/horoscope',
        durationSeconds: 3,
        action: 'scroll',
        scrollDistance: 400,
        focusPoint:
          'Ritual aligned to moon phase + active transits in YOUR chart',
      },
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
      text: 'Different tomorrow. Moon moves.',
      durationSeconds: 2,
    },
    voiceover: `Today's ritual... ${moonTheme}. Why? Moon is in my 4th house. Yesterday was different\u2014the moon moved. Every day, the ritual changes based on which house the moon activates in YOUR chart. The crystal matches too. Everything connected to your cosmic weather. Different tomorrow. Because the moon moves.`,
    textOverlays: [
      {
        text: `moon in ${sky.moonSign.toLowerCase()} = ${moonTheme}`,
        startSeconds: 2,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'yesterday: different sign',
        startSeconds: 5,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'ritual \u2192 YOUR transits',
        startSeconds: 9,
        durationSeconds: 3,
        position: 'top',
      },
      {
        text: 'even the crystal matches',
        startSeconds: 13,
        durationSeconds: 2,
        position: 'top',
      },
    ],
    caption: `Today: ${moonTheme} ritual (Moon in ${sky.moonSign}). It changes daily based on YOUR chart. What's your moon activating?`,
    hashtags: ['ritual', 'moonphase', 'lunary', 'witchtok', 'moonmagic'],
    playwrightNotes:
      'Show dashboard ritual card (fast), navigate to /horoscope, scroll to ritual section. Key: show the connection between moon house and ritual theme. Pause on instructions. Show crystal recommendation. Fast pace - each scene 2-3s.',
  };
}

function generateTransitWisdomDeepDive(sky: SkyData): TikTokScript {
  const { planet, sign } = pickNotableTransitPlanet(sky);

  return {
    id: 'transit-wisdom-deepdive',
    title: `${planet} in ${sign} Hits My 7th House. Relationships.`,
    tier: 2,
    category: 'deep-dive',
    totalSeconds: 19,
    hook: {
      text: `${planet} in ${sign}. 12 meanings. Mine\u2014`,
      durationSeconds: 2,
    },
    scenes: [
      {
        description:
          'Transit Wisdom section - first transit with house + intensity',
        path: '/horoscope',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 350,
        focusPoint: `${planet} in ${sign} \u2192 7th house \u2192 Relationships \u2192 High intensity`,
      },
      {
        description: 'Show the intensity badge - this transit matters',
        path: '/horoscope',
        durationSeconds: 2,
        action: 'show',
        focusPoint: 'Intensity badge - "this one\'s a big deal for you"',
      },
      {
        description: 'Scroll to show multiple active transits',
        path: '/horoscope',
        durationSeconds: 3,
        action: 'scroll',
        scrollDistance: 300,
        focusPoint: 'Multiple transits hitting different areas simultaneously',
      },
      {
        description: 'Scroll to exact aspects - real astronomical data',
        path: '/horoscope',
        durationSeconds: 3,
        action: 'scroll',
        scrollDistance: 300,
        focusPoint: 'Aspects forming to YOUR natal planets with real orbs',
      },
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
      text: 'Not a paragraph for all Leos.',
      durationSeconds: 2,
    },
    voiceover: `${planet} entering ${sign} means something different for every person. For me? 7th house. Relationships. High intensity. But that's just one transit. Every transit active right now... which areas they're touching. Exact aspects with real orbs. And the next 30 days mapped out. Not a paragraph for all Leos.`,
    textOverlays: [
      {
        text: `${planet} \u2192 YOUR chart`,
        startSeconds: 2,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'intensity: high \u26A1',
        startSeconds: 5,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'exact aspects + real orbs',
        startSeconds: 9,
        durationSeconds: 3,
        position: 'top',
      },
      {
        text: 'your next 30 days',
        startSeconds: 14,
        durationSeconds: 3,
        position: 'top',
      },
    ],
    caption: `${planet} entering ${sign} hits my 7th house. Relationships. High intensity. Same transit, 12 different meanings. Which house is ${planet} hitting for you?`,
    hashtags: ['transits', 'astrology', 'lunary', 'birthchart', 'witchtok'],
    playwrightNotes:
      'Navigate to /horoscope. Scroll to Transit Wisdom. Show first transit with house + intensity badge (2s). Show next transits (3s). Scroll to aspects (3s). Scroll to 30-day forecast (3s+2s). Fast escalation - each section reveals more depth.',
  };
}

function generateGrimoireSearch(sky: SkyData): TikTokScript {
  const venus = sky.planets.Venus;
  const mars = sky.planets.Mars;
  const venusSign = venus?.sign ?? 'Scorpio';
  const marsSign = mars?.sign ?? 'Capricorn';
  const searchExample = `Venus in ${venusSign}`;

  return {
    id: 'grimoire-search',
    title: `Search Anything. Venus in ${venusSign}? Here.`,
    tier: 3,
    category: 'feature-reveal',
    totalSeconds: 17,
    hook: {
      text: `Venus in ${venusSign}? Mars in ${marsSign}? Here.`,
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
      },
      {
        description: 'Fast scroll through categories - volume flex',
        path: '/grimoire',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 400,
        focusPoint:
          'Every planet in every sign, all houses, all aspects - depth',
      },
      {
        description: 'Type into search bar - live demo',
        path: '/grimoire',
        durationSeconds: 3,
        action: 'type',
        target:
          '[data-testid="grimoire-search"], input[name="grimoire-search"], input[aria-label="Search grimoire"]',
        typeText: searchExample,
        focusPoint: 'Results appearing as you type - instant',
      },
      {
        description: 'Show search results - full articles, not snippets',
        path: '/grimoire',
        durationSeconds: 2,
        action: 'show',
        focusPoint: 'Matching articles with rich previews - real depth',
      },
      {
        description: 'Click first result - full article opens',
        path: '/grimoire',
        durationSeconds: 2,
        action: 'click',
        target: '.max-h-80 a, [data-testid="grimoire-categories"] a',
        focusPoint: 'Full article page loads instantly',
      },
      {
        description: 'Scroll through the article showing depth',
        path: '/grimoire',
        durationSeconds: 2,
        action: 'scroll',
        scrollDistance: 300,
        focusPoint: 'Complete article - not a snippet, a full guide',
      },
    ],
    outro: {
      text: 'No paywall. Search yours.',
      durationSeconds: 2,
    },
    voiceover: `Search any placement. Venus in ${venusSign}? Full article. Mars in ${marsSign}? Full article. 2,000 plus articles. Every planet in every sign. All 12 houses. Every aspect. Tarot. Crystals. Spells. No paywall on education. Search yours.`,
    textOverlays: [
      {
        text: '2,000+ articles',
        startSeconds: 2,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'planets, signs, houses',
        startSeconds: 5,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'full articles \u2260 snippets',
        startSeconds: 9,
        durationSeconds: 2,
        position: 'top',
      },
      {
        text: 'no paywall',
        startSeconds: 13,
        durationSeconds: 2,
        position: 'top',
      },
    ],
    caption: `Venus in ${venusSign}? Full article. 2,000+ articles. Free. Drop your placement\u2014bet it's in there.`,
    hashtags: ['astrology', 'grimoire', 'lunary', 'learnastrology', 'witchtok'],
    playwrightNotes:
      'Navigate to /grimoire. No auth. Show categories (2s), fast scroll (2s), type "Venus in Scorpio" into search (3s - use slow typing for readability), show results (2s), scroll results (2s). The "Search yours" CTA drives comment engagement.',
  };
}

// ============================================================================
// Export registry
// ============================================================================

export const SCRIPT_GENERATORS: Record<string, (sky: SkyData) => TikTokScript> =
  {
    'dashboard-overview': generateDashboardOverview,
    'sky-now-deepdive': generateSkyNowDeepDive,
    'numerology-deepdive': generateNumerologyDeepDive,
    'ritual-system': generateRitualSystem,
    'transit-wisdom-deepdive': generateTransitWisdomDeepDive,
    'grimoire-search': generateGrimoireSearch,
  };
