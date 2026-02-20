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
  // Transit tracking (real differentiator vs every other app)
  `Lunary is now on Google Play. It tracks how transits are actually affecting you, using your full birth chart. Not a generic sun sign forecast.`,
  // Pattern recognition (unique feature)
  `Lunary is on Google Play. It learns your patterns over time. Your tarot pulls, journal entries, and transits start connecting after a few weeks. No other app does this.`,
  // Astronomical accuracy
  `Lunary is now on Google Play. Every chart is calculated to within 1 arcminute, validated against the US Naval Observatory. Most apps round the numbers. We don't.`,
  // Free grimoire (2000+ pages, no paywall)
  `Lunary is on Google Play. There's a 2,000+ page grimoire built in. Spells, rituals, tarot meanings, correspondences. All free. No paywall on learning.`,
  // No ads, ever
  `Lunary is now on Google Play. No ads. Not in free, not ever. Your birth chart drives your horoscopes, transits, tarot, and crystal guidance. Not your sun sign.`,
  // Teaches you to read your own chart
  `I built Lunary so you can learn to read your own chart. Not depend on an app to tell you what to think. Now on Google Play.`,
  // Real time transit updates
  `Lunary is on Google Play. It reads your transits in real time and tells you what they actually mean for your specific chart. Updates throughout the day.`,
  // Chart-first tarot
  `Lunary is on Google Play. Even your tarot readings are guided by your birth chart. Nothing is generic. Everything connects back to your birth data.`,
  // Full practice in one place
  `Lunary is on Google Play. Astrology, tarot, moon phases, crystals, rituals, journaling. All in one place, all connected to your birth chart. Not fragments across five apps.`,
  // Reflection over prediction
  `Lunary is on Google Play. It's built for understanding yourself, not predicting the future. Your chart, your transits, your patterns. Everything based on real astronomy.`,
];

const CTA_CLOSINGS = [
  `3 months free with code COSMICSEASON. Tell me what you think.`,
  `Use code COSMICSEASON for 3 months free. Let me know how it feels.`,
  `3 months free with code COSMICSEASON. Would love to hear your thoughts.`,
  `Code COSMICSEASON gets you 3 months free. Drop your sign below.`,
  `3 months on me with code COSMICSEASON. What do you think?`,
  `Try it free for 3 months with code COSMICSEASON. Curious what you notice first.`,
];

/**
 * Build a complete dear-style CTA by combining audience opening + body + closing.
 * Each piece rotates independently for maximum variety.
 */
export function getDearStyleReferralPost(seed?: number): string {
  const s = seed ?? Math.floor(Math.random() * 1000);
  const terms = buildAudienceTerms(4);
  const opening = `dear ${terms.join(', ')}, and anyone who's ever asked "what time were you born" on a first date 🌖`;
  const body = CTA_BODIES[s % CTA_BODIES.length];
  const closing = CTA_CLOSINGS[(s >> 3) % CTA_CLOSINGS.length];
  return `${opening}\n${body}\n${closing}`;
}

/** @deprecated kept for backwards compat, use getDearStyleReferralPost() */
export const DEAR_STYLE_REFERRAL_TEMPLATES = CTA_BODIES.map(
  (body, i) =>
    `dear astrologers, witches, tarot readers, stargazers, crystal lovers, and anyone who's ever asked "what time were you born" on a first date 🌖\n${body}\n${CTA_CLOSINGS[i % CTA_CLOSINGS.length]}`,
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
