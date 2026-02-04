/**
 * Persona vocabulary and template constants for social content
 *
 * Format: "dear [varied audience terms]" + Lunary intro content
 */

/**
 * Audience term facets - each facet has variations
 * Pick ONE term from each facet to avoid duplication (e.g., no "moon lovers, moon watchers")
 */
export const AUDIENCE_FACETS: Record<string, string[]> = {
  moon: ['moon lovers', 'moon watchers', 'lunar folk', 'moon trackers'],
  tarot: [
    'tarot readers',
    'tarot pullers',
    'tarot enthusiasts',
    'tarot curious',
  ],
  crystals: [
    'crystal hoarders',
    'crystal collectors',
    'crystal keepers',
    'crystal lovers',
  ],
  astrology: [
    'astrologers',
    'astrology lovers',
    'horoscope readers',
    'horoscope checkers',
  ],
  cosmic: [
    'cosmic wanderers',
    'cosmic explorers',
    'cosmic seekers',
    'cosmic souls',
    'cosmic curious',
  ],
  charts: [
    'chart nerds',
    'chart readers',
    'chart obsessives',
    'birth chart obsessives',
  ],
  stars: ['star gazers', 'star seekers', 'star chasers'],
  witches: ['witches'],
  transits: ['transit trackers', 'astro nerds'],
};

/**
 * Get a random term from a facet
 */
const pickFromFacet = (facet: string[]): string =>
  facet[Math.floor(Math.random() * facet.length)];

/**
 * Build audience terms by picking one from each of 4-5 random facets
 * This prevents duplication like "moon lovers, moon watchers"
 */
export function buildAudienceTerms(count: number = 4): string[] {
  const facetKeys = Object.keys(AUDIENCE_FACETS);
  const shuffled = [...facetKeys].sort(() => Math.random() - 0.5);
  const selectedFacets = shuffled.slice(0, Math.min(count, facetKeys.length));
  return selectedFacets.map((key) => pickFromFacet(AUDIENCE_FACETS[key]));
}

/**
 * @deprecated Use buildAudienceTerms() instead
 * Legacy pools kept for backwards compatibility
 */
export const AUDIENCE_TERM_POOLS = [
  ['witches', 'star gazers', 'astrologers', 'tarot readers'],
  ['tarot readers', 'witches', 'astrologers', 'moon lovers'],
  ['crystal hoarders', 'moon lovers', 'tarot readers', 'astrologers'],
  [
    'cosmic explorers',
    'chart obsessives',
    'tarot pullers',
    'crystal collectors',
  ],
];

/**
 * @deprecated Use AUDIENCE_FACETS instead
 */
export const AUDIENCE_TERMS = Object.values(AUDIENCE_FACETS).flat();

/**
 * Body templates for after the "dear [audience]" line
 * Focus on Lunary's USP: full birth chart personalisation (go beyond your sun sign)
 * No topic/category references - keep it about the app and community
 * Use proper capitalisation (especially "I") and avoid em dashes/hyphens
 */
export const PERSONA_BODY_TEMPLATES = [
  'I built Lunary for you.\nPersonalised horoscopes, transits, tarot, and crystals. All based on your full birth chart, not just your sun sign.',
  'Lunary goes beyond your sun sign.\nYour full natal chart shapes everything: horoscopes, transits, tarot pulls, crystal guidance. All personalised to you.',
  'Lunary is where I put everything I wish I had when I started.\nEverything based on your full birth chart. Horoscopes, transits, tarot, crystals.',
  'I made Lunary for moments like this.\nPersonalised to your full natal chart. Not generic sun sign content. Horoscopes, transits, tarot, crystals.',
  "I'm opening Lunary's beta and gifting you a free year.\nEverything personalised to your full birth chart. Horoscopes, transits, tarot, crystals.",
  'Lunary is live.\nDaily horoscopes, transits, tarot readings, crystal guidance. All based on your complete natal chart, not just your sun sign.',
];

/**
 * Pool of engagement questions
 */
export const QUESTION_POOL = [
  'Which do you check most: moon phase, tarot, transits, or horoscopes?',
  'What made astrology click for you: tarot, a horoscope, the moon, or something else?',
  'What do you usually turn to astrology for?',
  'When do you find yourself coming back to astrology most?',
  'What do you wish astrology helped you understand better?',
  'What part of astrology feels most grounding to you?',
];

/**
 * Closing statements for weekly wrap-up posts
 */
export const CLOSING_STATEMENTS = [
  'Most astrology insights only make sense in hindsight.',
  'Understanding rarely arrives on schedule.',
  'The meaning usually shows up later, not when you are looking for it.',
  'Patterns are clearer once the rush of the moment passes.',
  'One more look later often changes how the whole week reads.',
];

/**
 * Topic-aware question templates for Threads engagement posts
 * Use {topic} for the daily facet title, {sign_type} for sun/moon/rising
 */
export const THREADS_QUESTION_TEMPLATES = [
  "what's your {sign_type} sign? drop below 👇",
  'does your {placement} placement feel accurate? be honest',
  '{topic} — love it or dread it?',
  "what's the best astrology advice you've ever received?",
  'which sign do people always assume you are vs what you actually are?',
  "what's your big three? drop below 👇",
  'what part of your chart do you resonate with most?',
  'do you check your horoscope daily or only when things feel off?',
];

/**
 * Dear-style beta CTA templates for Threads
 * These drive signups during peak app usage times (evening)
 * Always includes FULLORBIT beta code
 * Moon phase emojis: 🌑🌒🌓🌔🌕🌖🌗🌘
 */
export const DEAR_STYLE_BETA_TEMPLATES = [
  `dear tarot readers, witches, astrologers, and moon lovers 🌕
i'm gifting a free year of lunary during the beta.
code: FULLORBIT
let me know what you think`,

  `for astrology lovers, moon watchers, and chart nerds 🌔
lunary is in beta and i'm giving away a free year.
code: FULLORBIT
feedback welcome`,

  `dear moon gazers and cosmic seekers 🌓
trying something new with lunary.
free year with code: FULLORBIT
curious what you notice`,

  `to the witches, the chart readers, the crystal collectors 🌖
lunary is finally in beta.
i'm giving away a free year to early supporters.
code: FULLORBIT
tell me what's missing`,

  `dear cosmic wanderers and horoscope checkers 🌗
if you've ever wished your astrology app actually knew your chart...
lunary does. gifting a free year during beta.
code: FULLORBIT`,

  `for the transit trackers and birth chart obsessives 🌕
lunary is live and i want you to try it.
free year with code: FULLORBIT
let me know what you think`,

  `dear tarot pullers, moon trackers, and star gazers 🌒
i built lunary for you.
gifting a free year during beta.
code: FULLORBIT
feedback welcome`,

  `to the astrologers and the astro-curious 🌘
lunary goes beyond your sun sign.
free year with code: FULLORBIT
curious what you notice`,

  `dear crystal hoarders and horoscope readers 🌑
opening lunary beta to early supporters.
free year with code: FULLORBIT
tell me what's missing`,

  `for moon lovers and chart nerds 🌔
lunary is ready for you.
free year during beta.
code: FULLORBIT`,
];

/**
 * Conversational deep-dive templates for Threads
 * These replace formal educational copy with casual, engaging hooks
 * {topic} gets replaced with the facet title
 */
export const CONVERSATIONAL_DEEP_DIVE_TEMPLATES = [
  `{topic} is one of those chart placements people sleep on`,
  `unpopular opinion: {topic} matters more than people think`,
  `ever looked at your {topic} and thought "that explains a lot"?`,
  `the thing about {topic} is it shows up when you least expect it`,
  `if you've never checked your {topic}, now's the time`,
  `{topic} — quietly running the show in your chart`,
  `{topic} hits different once you actually understand it`,
  `{topic} is underrated and i'll die on this hill`,
  `your {topic} says more about you than you'd expect`,
  `{topic} is the placement nobody talks about enough`,
  `there's a reason {topic} keeps coming up in readings`,
  `{topic} — not as simple as it sounds`,
];

/**
 * Get a conversational deep-dive for Threads
 */
export function getConversationalDeepDive(
  topic: string,
  seed?: number,
): string {
  const index =
    seed !== undefined
      ? seed % CONVERSATIONAL_DEEP_DIVE_TEMPLATES.length
      : Math.floor(Math.random() * CONVERSATIONAL_DEEP_DIVE_TEMPLATES.length);
  return CONVERSATIONAL_DEEP_DIVE_TEMPLATES[index].replace('{topic}', topic);
}

/**
 * Get a random question template with topic substitution
 */
export function getThreadsQuestion(topic: string, seed?: number): string {
  const index =
    seed !== undefined
      ? seed % THREADS_QUESTION_TEMPLATES.length
      : Math.floor(Math.random() * THREADS_QUESTION_TEMPLATES.length);
  const template = THREADS_QUESTION_TEMPLATES[index];

  // Substitute placeholders
  const signTypes = ['sun', 'moon', 'rising'];
  const placements = ['Venus', 'Mars', 'Mercury', 'Moon'];
  const signType = signTypes[seed !== undefined ? seed % signTypes.length : 0];
  const placement =
    placements[seed !== undefined ? seed % placements.length : 0];

  return template
    .replace('{topic}', topic)
    .replace('{sign_type}', signType)
    .replace('{placement}', placement);
}

/**
 * Get a dear-style beta CTA post
 */
export function getDearStyleBetaPost(seed?: number): string {
  const index =
    seed !== undefined
      ? seed % DEAR_STYLE_BETA_TEMPLATES.length
      : Math.floor(Math.random() * DEAR_STYLE_BETA_TEMPLATES.length);
  return DEAR_STYLE_BETA_TEMPLATES[index];
}

/**
 * @deprecated Use AUDIENCE_TERMS instead
 */
export const PERSONA_VOCAB = AUDIENCE_TERMS;
