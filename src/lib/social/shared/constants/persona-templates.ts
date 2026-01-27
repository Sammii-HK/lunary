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
 * @deprecated Use AUDIENCE_TERMS instead
 */
export const PERSONA_VOCAB = AUDIENCE_TERMS;
