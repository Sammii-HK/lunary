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
  'I built Lunary for you.\nPersonal astrology using your full birth chart, not just your sun sign. Now on Google Play.',
  'Lunary goes beyond your sun sign.\nYour full natal chart shapes everything: horoscopes, transits, tarot pulls, crystal guidance. Now on Google Play.',
  'Lunary tracks how transits are actually affecting you, using your full birth chart.\nNot generic content. Now on Google Play.',
  'I made Lunary for people who want more than a sun sign horoscope.\nYour full natal chart drives everything. Now on Google Play.',
  'Lunary is live on Google Play.\nDaily horoscopes, real time transit tracking, tarot, crystals. All based on your complete natal chart.',
  'Lunary reads your transits in real time and tells you what they mean for you personally.\nNow on Google Play. 3 months free with code COSMICSEASON.',
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
 * Dear-style CTA templates for Threads
 * Persona rotation: "dear [audience terms]" opening stays varied via AUDIENCE_FACETS
 * Body: USPs (full birth chart, transit tracking, not just sun sign) + Google Play + promo code
 * Closing CTA: rotated separately for variety
 */

const CTA_BODIES = [
  `Lunary uses your full birth chart for everything. Horoscopes, transits, tarot, crystals. Not just your sun sign. Code COSMICSEASON for 3 months free.`,
  `Your birth chart has 10 planets, 12 houses, and dozens of aspects. Lunary tracks all of it in real time. 3 months free with code COSMICSEASON.`,
  `Most astrology apps give you the same horoscope as everyone born in your month. Lunary uses your actual chart. Try it free: code COSMICSEASON.`,
  `Transits hit different when they are mapped to your natal placements. That is what Lunary does. COSMICSEASON = 3 months free.`,
  `Lunary tells you which transits are affecting YOUR chart today. Not generic forecasts. Yours. Code COSMICSEASON for 3 months free.`,
  `Your rising sign matters. Your moon sign matters. Lunary reads them all, together, in real time. 3 months free with COSMICSEASON.`,
  `One app for your birth chart, daily transits, tarot, and crystals. All personalised to your exact chart. COSMICSEASON gets you 3 months free.`,
  `Astrology that knows your chart. Horoscopes that reflect your placements. No ads. No fluff. Try free: code COSMICSEASON.`,
];

/** Conversation-ending questions — every dear-style post ends with one */
const CTA_QUESTIONS = [
  `Which placement surprised you most when you first read your chart?`,
  `Do you relate more to your sun sign or your rising sign?`,
  `What part of your chart took the longest to understand?`,
  `Has a transit ever completely blindsided you?`,
  `What is the one placement in your chart that explains everything?`,
  `When did astrology shift from casual interest to something deeper for you?`,
  `What is the first thing you check in your chart each morning?`,
  `Which planet do you think runs your life the most?`,
  `Have you ever read someone else's chart and understood them instantly?`,
  `What is the most underrated placement in your chart?`,
];

/**
 * Opening patterns — rotates between different audience combinations.
 * Some include the first-date line, most don't, to avoid repetition.
 */
const OPENING_PATTERNS = [
  (terms: string[]) =>
    `dear ${terms.join(', ')}, and anyone who's ever asked "what time were you born" on a first date 🌖`,
  (terms: string[]) => `dear ${terms.join(', ')} 🌖`,
  (terms: string[]) => `hey ${terms.join(', ')} 🌖`,
  (terms: string[]) =>
    `for everyone reading their chart—${terms.join(', ')} 🌖`,
  (terms: string[]) => `${terms.join(', ')}—this is for you 🌖`,
];

/**
 * Build a complete dear-style CTA by combining audience opening + body + closing.
 * Each piece rotates independently for maximum variety.
 */
export function getDearStyleReferralPost(seed?: number): string {
  const s = seed ?? Math.floor(Math.random() * 1000);
  const terms = buildAudienceTerms(4);
  const openingPattern = OPENING_PATTERNS[s % OPENING_PATTERNS.length];
  const opening = openingPattern(terms);
  const body = CTA_BODIES[s % CTA_BODIES.length];
  const question = CTA_QUESTIONS[(s * 7 + 3) % CTA_QUESTIONS.length];
  return `${opening}\n${body}\n${question}`;
}

/** @deprecated kept for backwards compat, use getDearStyleReferralPost() */
export const DEAR_STYLE_REFERRAL_TEMPLATES = CTA_BODIES.map(
  (body, i) =>
    `dear astrologers, witches, tarot readers, stargazers, crystal lovers, and anyone who's ever asked "what time were you born" on a first date 🌖\n${body}\n${CTA_QUESTIONS[i % CTA_QUESTIONS.length]}`,
);

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
 * @deprecated Use AUDIENCE_TERMS instead
 */
export const PERSONA_VOCAB = AUDIENCE_TERMS;
