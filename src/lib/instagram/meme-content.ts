import type { MemeTemplate, MemeCategory, IGMemeContent } from './types';
import { seededRandom } from './ig-utils';

// Zodiac sign personality data for meme generation
const SIGN_TRAITS: Record<
  string,
  {
    energy: string;
    stereotype: string;
    weakness: string;
    vibe: string;
    love: string;
    mood: string;
  }
> = {
  aries: {
    energy: 'starting 10 projects and finishing none',
    stereotype: 'the one who texts back in 0.2 seconds',
    weakness: 'patience (what patience?)',
    vibe: 'main character energy at all times',
    love: 'falls in love on the first date',
    mood: 'ready to fight or party at any moment',
  },
  taurus: {
    energy: 'napping with a charcuterie board',
    stereotype: 'still mad about something from 2019',
    weakness: 'will not change their mind. ever.',
    vibe: 'cozy blanket with a grudge',
    love: 'love language is food and physical touch',
    mood: 'unbothered until you touch their snacks',
  },
  gemini: {
    energy: 'having 3 conversations at once',
    stereotype: 'has two completely different friend groups',
    weakness: 'commits to plans then immediately regrets it',
    vibe: 'chaotic but somehow always knows the tea',
    love: 'needs someone who can keep up intellectually',
    mood: 'excited about everything for exactly 48 hours',
  },
  cancer: {
    energy: 'crying at a commercial about puppies',
    stereotype: 'remembers every mean thing you said in 2017',
    weakness: 'takes everything personally (and they know it)',
    vibe: 'mom friend who is also emotionally spiraling',
    love: "will cook for you and then cry if you don't say it's amazing",
    mood: 'cozy at home but emotionally on a rollercoaster',
  },
  leo: {
    energy: 'walking into a room like they own it',
    stereotype: 'checks their reflection in every surface',
    weakness: 'cannot handle being ignored',
    vibe: 'confident, dramatic, and somehow always right',
    love: 'needs constant reassurance but makes it look cool',
    mood: 'either on top of the world or devastated. no in between.',
  },
  virgo: {
    energy: 'organizing their spice rack alphabetically',
    stereotype: 'silently judging your life choices',
    weakness: 'overthinks a text for 45 minutes',
    vibe: 'helpful but also slightly critical',
    love: 'shows love by fixing your problems',
    mood: "stressed about something that hasn't happened yet",
  },
  libra: {
    energy: "can't decide what to eat for 2 hours",
    stereotype: 'agrees with everyone to avoid conflict',
    weakness: 'will ghost you instead of having a confrontation',
    vibe: 'charming, flirty, and perpetually indecisive',
    love: 'in love with the idea of being in love',
    mood: 'thriving aesthetically, dying internally',
  },
  scorpio: {
    energy: 'already knows your secrets somehow',
    stereotype: "holds grudges like they're Olympic medals",
    weakness: 'trusts absolutely nobody (including themselves)',
    vibe: 'intense, mysterious, and slightly terrifying',
    love: 'love is a full-time obsession or nothing',
    mood: 'calm on the outside, volcano on the inside',
  },
  sagittarius: {
    energy: 'booking a flight instead of dealing with problems',
    stereotype: 'accidentally offensive but means well',
    weakness: 'commitment? never heard of her',
    vibe: 'fun, wild, and zero filter',
    love: 'needs a partner who doubles as a travel buddy',
    mood: 'optimistic to a slightly delusional degree',
  },
  capricorn: {
    energy: 'working at 2am on a Saturday',
    stereotype: 'already has a 10-year plan at age 12',
    weakness: 'forgets that fun exists',
    vibe: 'responsible, ambitious, and lowkey judging you',
    love: 'shows love through acts of service and spreadsheets',
    mood: 'tired but productive. always productive.',
  },
  aquarius: {
    energy: 'explaining a conspiracy theory at 3am',
    stereotype: "thinks they're different from everyone (they are)",
    weakness: 'emotionally available? in this economy?',
    vibe: 'weird in the best way possible',
    love: 'needs intellectual stimulation more than romance',
    mood: 'detached from reality but somehow ahead of their time',
  },
  pisces: {
    energy: 'daydreaming during an important meeting',
    stereotype: 'cries during every movie, including action films',
    weakness: 'lives in a fantasy world and refuses to leave',
    vibe: 'artistic, dreamy, and slightly unhinged',
    love: 'falls in love with potential, not reality',
    mood: 'one song away from a full emotional breakdown',
  },
};

// a/an article helper
function article(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

type SignTraits = (typeof SIGN_TRAITS)[keyof typeof SIGN_TRAITS];

// Template pools for each meme category
const CLASSIC_TEMPLATES = [
  {
    setup: (sign: string) => `${sign} energy is`,
    punchline: (trait: string) => trait,
  },
  {
    setup: (sign: string) => `Nobody:\n${sign}:`,
    punchline: (trait: string) => trait,
  },
  {
    setup: (sign: string) => `POV: You're dating ${article(sign)} ${sign}`,
    punchline: (trait: string) => trait,
  },
  {
    setup: (sign: string) => `Things ${sign} will never admit`,
    punchline: (trait: string) => trait,
  },
  {
    setup: (sign: string) => `${sign} at 3am:`,
    punchline: (trait: string) => trait,
  },
  {
    setup: (sign: string) =>
      `Being friends with ${article(sign)} ${sign} means`,
    punchline: (trait: string) => trait,
  },
];

const COMPARISON_TEMPLATES = [
  {
    setup: (sign: string) => `${sign} in public vs in private`,
    punchline: (_sign: string, traits: SignTraits) =>
      `In public: completely fine\n\nIn private: ${traits.mood}`,
  },
  {
    setup: (sign: string) => `${sign} on the outside vs the inside`,
    punchline: (_sign: string, traits: SignTraits) =>
      `Outside: ${traits.vibe}\n\nInside: ${traits.mood}`,
  },
  {
    setup: (sign: string) => `What ${sign} says vs what they mean`,
    punchline: (_sign: string, traits: SignTraits) =>
      `Says: "I'm fine"\n\nMeans: ${traits.mood}`,
  },
];

const CALLOUT_TEMPLATES = [
  (sign: string, _traits: SignTraits) =>
    `Tag the ${sign} in your life. You know exactly who.`,
  (sign: string, _traits: SignTraits) =>
    `Send this to ${article(sign)} ${sign}. They need to see this.`,
  (sign: string, _traits: SignTraits) =>
    `Every ${sign} reading this just felt seen`,
  (sign: string, traits: SignTraits) =>
    `${sign} energy is ${traits.energy}. Tag someone who gets it.`,
];

const HOT_TAKE_TEMPLATES = [
  (sign: string, traits: SignTraits) =>
    `Unpopular opinion: ${sign} gets judged for ${traits.energy} but it's actually their superpower`,
  (sign: string, traits: SignTraits) =>
    `${sign} isn't difficult. They're just ${traits.vibe}.`,
  (sign: string, traits: SignTraits) =>
    `The real reason ${sign} is like this?\n\n${traits.weakness}`,
  (sign: string, traits: SignTraits) =>
    `Hot take: ${sign} is misunderstood because they're ${traits.mood}`,
  (sign: string, traits: SignTraits) =>
    `Everyone thinks ${sign} is being dramatic but honestly they're ${traits.mood}`,
  (sign: string, traits: SignTraits) =>
    `${sign} isn't complicated, you just need to understand they're ${traits.vibe}`,
];

const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

const TRAIT_KEYS = [
  'energy',
  'stereotype',
  'weakness',
  'vibe',
  'love',
  'mood',
] as const;

/**
 * Generate a meme content for a specific date + optional sign.
 * Deterministic: same date + sign = same meme.
 */
export function generateMemeContent(
  date: string,
  sign?: string,
): IGMemeContent {
  const rng = seededRandom(`meme-${date}-${sign || 'random'}`);

  // Pick sign if not provided
  const selectedSign =
    sign?.toLowerCase() || SIGNS[Math.floor(rng() * SIGNS.length)];
  const signName = selectedSign.charAt(0).toUpperCase() + selectedSign.slice(1);
  const traits = SIGN_TRAITS[selectedSign] || SIGN_TRAITS.aries;

  // Pick template type
  const templates: MemeTemplate[] = [
    'classic',
    'comparison',
    'callout',
    'hot_take',
  ];
  const template = templates[Math.floor(rng() * templates.length)];

  // Pick trait
  const traitKey = TRAIT_KEYS[Math.floor(rng() * TRAIT_KEYS.length)];
  const trait = traits[traitKey];

  let setup: string;
  let punchline: string;
  let category: MemeCategory;

  switch (template) {
    case 'classic': {
      const t = CLASSIC_TEMPLATES[Math.floor(rng() * CLASSIC_TEMPLATES.length)];
      setup = t.setup(signName);
      punchline = t.punchline(trait);
      category = 'zodiac_humor';
      break;
    }
    case 'comparison': {
      const t =
        COMPARISON_TEMPLATES[Math.floor(rng() * COMPARISON_TEMPLATES.length)];
      setup = t.setup(signName);
      punchline = t.punchline(signName, traits);
      category = 'cosmic_truth';
      break;
    }
    case 'callout': {
      const t = CALLOUT_TEMPLATES[Math.floor(rng() * CALLOUT_TEMPLATES.length)];
      setup = t(signName, traits);
      punchline = '';
      category = 'sign_callout';
      break;
    }
    case 'hot_take': {
      const t =
        HOT_TAKE_TEMPLATES[Math.floor(rng() * HOT_TAKE_TEMPLATES.length)];
      setup = t(signName, traits);
      punchline = '';
      category = 'cosmic_truth';
      break;
    }
  }

  return {
    sign: selectedSign,
    setup,
    punchline,
    template,
    category,
  };
}

/**
 * Generate multiple meme options for a date (different signs).
 */
export function generateDailyMemes(
  date: string,
  count: number = 3,
): IGMemeContent[] {
  const rng = seededRandom(`daily-memes-${date}`);
  const shuffled = [...SIGNS].sort(() => rng() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map((sign) => generateMemeContent(date, sign));
}
