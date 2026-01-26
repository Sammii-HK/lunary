/**
 * Persona vocabulary and template constants for social content
 *
 * Format: "dear [varied audience terms]" + Lunary intro content
 */

/**
 * Pools of audience terms to mix and match for variety
 * Each pool should be used as a complete set, shuffled or varied
 */
export const AUDIENCE_TERM_POOLS = [
  [
    'witches',
    'star gazers',
    'astrologers',
    'tarot readers',
    'cosmic wanderers',
  ],
  ['tarot readers', 'witches', 'astrologers', 'moon lovers'],
  [
    'crystal hoarders',
    'moon lovers',
    'tarot readers',
    'astrologers',
    'chart nerds',
  ],
  [
    'cosmic explorers',
    'birth chart obsessives',
    'tarot pullers',
    'crystal collectors',
  ],
  ['moon watchers', 'transit trackers', 'horoscope readers', 'cosmic seekers'],
  ['astrology lovers', 'tarot enthusiasts', 'crystal keepers', 'lunar folk'],
  ['star seekers', 'chart readers', 'moon trackers', 'cosmic curious'],
  [
    'horoscope checkers',
    'crystal lovers',
    'moon phase trackers',
    'astro nerds',
  ],
  [
    'tarot pullers',
    'birth chart readers',
    'crystal collectors',
    'cosmic souls',
  ],
  ['lunar lovers', 'star chasers', 'chart obsessives', 'tarot curious'],
];

/**
 * Individual audience terms that can be combined
 */
export const AUDIENCE_TERMS = [
  'witches',
  'star gazers',
  'astrologers',
  'tarot readers',
  'cosmic wanderers',
  'moon lovers',
  'crystal hoarders',
  'chart nerds',
  'cosmic explorers',
  'birth chart obsessives',
  'tarot pullers',
  'crystal collectors',
  'moon watchers',
  'transit trackers',
  'horoscope readers',
  'cosmic seekers',
  'astrology lovers',
  'tarot enthusiasts',
  'crystal keepers',
  'lunar folk',
  'star seekers',
  'chart readers',
  'moon trackers',
  'cosmic curious',
  'horoscope checkers',
  'astro nerds',
  'cosmic souls',
  'lunar lovers',
  'star chasers',
];

/**
 * Body templates for after the "dear [audience]" line
 * Use {topic} as placeholder for the current topic
 */
export const PERSONA_BODY_TEMPLATES = [
  'i built lunary for you.\n{topic} is just one of the tools inside - along with personalised horoscopes, transits, tarot, and crystals.',
  "this one's about {topic}.\nlunary has your daily horoscopes, transits, tarot pulls, and crystal guidance too - all in one place.",
  'lunary is where i put everything i wish i had when i started.\ntoday: {topic}. tomorrow it might be your transits or a tarot pull.',
  'i made lunary for moments like this.\n{topic}, personalised horoscopes, transits, tarot, crystals - all based on your chart.',
  "i'm opening lunary's beta and gifting you a free year.\n{topic} is one of many features - horoscopes, transits, tarot, crystals, all personalised to your chart.",
  'lunary is live.\n{topic}, daily horoscopes, birth chart breakdowns, tarot readings, crystal guidance - all in one app.',
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
