import type { ThemeCategory } from '@/lib/social/types';
import { seededPick, seededRandom } from './ig-utils';

// --- Hashtag pools ---

const BROAD_HASHTAGS = [
  '#astrology',
  '#zodiac',
  '#tarot',
  '#horoscope',
  '#spirituality',
  '#crystals',
  '#witchcraft',
  '#numerology',
];

const NICHE_HASHTAGS: Record<string, string[]> = {
  zodiac: [
    '#zodiacsigns',
    '#birthchart',
    '#birthchartreading',
    '#astrologymemes',
    '#zodiacmemes',
    '#astrologyfacts',
    '#zodiaccompatibility',
    '#astrologyapp',
    '#learnastrology',
  ],
  tarot: [
    '#dailytarot',
    '#tarotreading',
    '#tarotcards',
    '#tarotcommunity',
    '#tarotdeck',
    '#tarotspread',
  ],
  crystals: [
    '#crystalhealing',
    '#crystalcollection',
    '#witchesofinstagram',
    '#crystalgrid',
    '#healingcrystals',
  ],
  numerology: [
    '#angelNumbers',
    '#111',
    '#222',
    '#333',
    '#444',
    '#angelnumber',
    '#numerologyreading',
  ],
  compatibility: [
    '#zodiaccompatibility',
    '#zodiaclove',
    '#astrologylove',
    '#soulmate',
  ],
  ranking: [
    '#zodiacsigns',
    '#zodiacranking',
    '#astrologymemes',
    '#zodiacfacts',
  ],
  meme: ['#astrologymemes', '#zodiacmemes', '#zodiachumor', '#astrologytiktok'],
  angelNumber: [
    '#angelNumbers',
    '#angelnumber',
    '#111',
    '#222',
    '#333',
    '#444',
    '#555',
    '#777',
    '#spirituality',
  ],
};

const SIGN_HASHTAGS: Record<string, string> = {
  aries: '#aries',
  taurus: '#taurus',
  gemini: '#gemini',
  cancer: '#cancer',
  leo: '#leo',
  virgo: '#virgo',
  libra: '#libra',
  scorpio: '#scorpio',
  sagittarius: '#sagittarius',
  capricorn: '#capricorn',
  aquarius: '#aquarius',
  pisces: '#pisces',
};

const SIGN_SEASON_HASHTAGS: Record<string, string> = {
  aries: '#ariesseason',
  taurus: '#taurusseason',
  gemini: '#geminiseason',
  cancer: '#cancerseason',
  leo: '#leoseason',
  virgo: '#virgoseason',
  libra: '#libraseason',
  scorpio: '#scorpioseason',
  sagittarius: '#sagittariusseason',
  capricorn: '#capricornseason',
  aquarius: '#aquariusseason',
  pisces: '#piscesseason',
};

// --- Hook templates ---

const ZODIAC_CAPTION_HOOKS = [
  'The truth about [Sign] that nobody talks about',
  '[Sign] energy hits different',
  'If you know a [Sign], you need to read this',
  'POV: You just found out everything about [Sign]',
  'Everything you need to know about [Sign] in one post',
];

const TAROT_CAPTION_HOOKS = [
  '[Card] just showed up in your feed for a reason',
  'If [Card] appeared in your reading, read this',
  'The full meaning of [Card] \u2014 upright and reversed',
  '[Card]: what it really means when it shows up',
];

const CRYSTAL_CAPTION_HOOKS = [
  'Everything you need to know about [Crystal]',
  "If [Crystal] keeps calling to you, here's why",
  '[Crystal]: the complete spiritual guide',
  'Your crystal guide to [Crystal]',
];

const COMPATIBILITY_CAPTION_HOOKS = [
  '[Sign1] + [Sign2] = [Score]%',
  "How compatible are [Sign1] and [Sign2]? Let's find out",
  '[Sign1] and [Sign2]: destined or doomed?',
  'The truth about [Sign1] + [Sign2] compatibility',
];

const RANKING_CAPTION_HOOKS = [
  'Signs ranked by [trait] and #1 might surprise you',
  'Which sign is the most [trait]? The ranking is in',
  'Signs ranked by [trait] \u2014 do you agree with #1?',
  'The [trait] ranking nobody asked for (but everyone needs)',
];

const ANGEL_NUMBER_CAPTION_HOOKS = [
  "[Number] keeps showing up and it's not a coincidence",
  'If you keep seeing [Number], the universe is trying to tell you something',
  '[Number]: the angel number you need to understand right now',
  "You're seeing [Number] everywhere. Here's what it means.",
];

// --- CTA templates ---

const ZODIAC_CTAS = [
  "Which slide resonated most? Drop your sign's emoji below",
  'Tag the [Sign] who needs to see this',
  'Are you a [Sign]? Tell us if this is accurate',
  'Save this and share it with your [Sign] bestie',
];

const TAROT_CTAS = [
  'Save this for your next reading',
  'Have you pulled [Card] before? What happened?',
  'Which meaning resonated with you? Comment below',
];

const CRYSTAL_CTAS = [
  'Do you own [Crystal]? Drop a comment',
  'Save this for your next crystal shopping trip',
  'Tag someone who needs [Crystal] in their life',
];

const COMPATIBILITY_CTAS = [
  'Tag your person',
  'Do you agree with the score? Comment below',
  'Tag the [Sign2] in your life',
];

const RANKING_CTAS = [
  'Where did your sign land? Agree or disagree?',
  'Comment your sign and your ranking \u2014 do you agree?',
  'Tag someone whose sign is #1',
];

const ANGEL_NUMBER_CTAS = [
  'What number do YOU keep seeing? Comment below',
  "Drop a [Number] if you've been seeing this number",
  'Save this so you remember what it means',
];

// --- SEO lines ---

const SEO_LINES: Record<string, string[]> = {
  zodiac: [
    "Learn about your zodiac sign's personality, love style, and career strengths on Lunary \u2014 the free astrology app with 2,000+ articles.",
    'Discover your zodiac personality traits and what makes your sign unique \u2014 free birth chart reading at lunary.app.',
  ],
  tarot: [
    'Learn the full meaning of every tarot card on Lunary \u2014 the free astrology app with 78 detailed card guides.',
    'Get your free tarot reading and explore card meanings at lunary.app \u2014 no sign-up required.',
  ],
  crystals: [
    'Explore 100+ crystals and their healing properties on Lunary \u2014 the free spiritual guide app.',
    'Discover crystal meanings, chakra connections, and care guides at lunary.app \u2014 free forever.',
  ],
  compatibility: [
    'Check your compatibility with any sign for free on Lunary \u2014 personalised birth chart readings with no ads.',
    'Discover your zodiac compatibility score at lunary.app \u2014 free birth chart readings for every sign.',
  ],
  ranking: [
    'Discover your zodiac personality traits and what makes your sign unique \u2014 free birth chart reading at lunary.app.',
    'Learn what makes each zodiac sign special on Lunary \u2014 the free astrology app with 2,000+ articles.',
  ],
  numerology: [
    'Track your angel numbers and learn their meanings on Lunary \u2014 the free astrology app with 2,000+ spiritual guides.',
    'Discover angel number meanings and numerology guides at lunary.app \u2014 free forever, no ads.',
  ],
  meme: [
    'Follow @lunary.app for daily astrology memes, zodiac content, and free birth chart readings.',
    'More astrology content every day at lunary.app \u2014 your free cosmic companion.',
  ],
};

// --- Caption generator ---

export interface IGCaption {
  hook: string;
  body: string;
  cta: string;
  seoLine: string;
  hashtags: string[];
  fullCaption: string;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pickHashtags(
  seed: string,
  broad: string[],
  niche: string[],
  extra: string[] = [],
): string[] {
  const rng = seededRandom(`hashtags-${seed}`);
  const shuffledBroad = [...broad].sort(() => rng() - 0.5);
  const shuffledNiche = [...niche, ...extra].sort(() => rng() - 0.5);
  return [...shuffledBroad.slice(0, 2), ...shuffledNiche.slice(0, 3)];
}

export function generateZodiacCaption(sign: string, seed: string): IGCaption {
  const signName = capitalize(sign);
  const hookTemplate = seededPick(ZODIAC_CAPTION_HOOKS, `zhook-${seed}`);
  const hook = hookTemplate.replace('[Sign]', signName);

  const body = `${signName}s get labelled as one thing, but there\u2019s so much more beneath the surface. Swipe through to discover what really makes this sign tick.`;

  const ctaTemplate = seededPick(ZODIAC_CTAS, `zcta-${seed}`);
  const cta = ctaTemplate.replace('[Sign]', signName);

  const seoLine = seededPick(SEO_LINES.zodiac, `zseo-${seed}`);

  const hashtags = pickHashtags(
    seed,
    BROAD_HASHTAGS,
    NICHE_HASHTAGS.zodiac,
    [
      SIGN_HASHTAGS[sign.toLowerCase()] || '',
      SIGN_SEASON_HASHTAGS[sign.toLowerCase()] || '',
    ].filter(Boolean),
  );

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

export function generateTarotCaption(card: string, seed: string): IGCaption {
  const hookTemplate = seededPick(TAROT_CAPTION_HOOKS, `thook-${seed}`);
  const hook = hookTemplate.replace('[Card]', card);

  const body = `${card} carries a powerful message \u2014 whether upright or reversed. Swipe to understand what this card is really telling you.`;

  const ctaTemplate = seededPick(TAROT_CTAS, `tcta-${seed}`);
  const cta = ctaTemplate.replace('[Card]', card);

  const seoLine = seededPick(SEO_LINES.tarot, `tseo-${seed}`);
  const hashtags = pickHashtags(seed, BROAD_HASHTAGS, NICHE_HASHTAGS.tarot);

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

export function generateCrystalCaption(
  crystal: string,
  seed: string,
): IGCaption {
  const hookTemplate = seededPick(CRYSTAL_CAPTION_HOOKS, `chook-${seed}`);
  const hook = hookTemplate.replace('[Crystal]', crystal);

  const body = `${crystal} is more than just a pretty stone. Swipe to discover its healing properties, chakra connections, and how to work with it.`;

  const ctaTemplate = seededPick(CRYSTAL_CTAS, `ccta-${seed}`);
  const cta = ctaTemplate.replace('[Crystal]', crystal);

  const seoLine = seededPick(SEO_LINES.crystals, `cseo-${seed}`);
  const hashtags = pickHashtags(seed, BROAD_HASHTAGS, NICHE_HASHTAGS.crystals);

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

export function generateCompatibilityCaption(
  sign1: string,
  sign2: string,
  score: number,
  seed: string,
): IGCaption {
  const s1 = capitalize(sign1);
  const s2 = capitalize(sign2);

  const hookTemplate = seededPick(
    COMPATIBILITY_CAPTION_HOOKS,
    `cohook-${seed}`,
  );
  const hook = hookTemplate
    .replace('[Sign1]', s1)
    .replace('[Sign2]', s2)
    .replace('[Score]', String(score));

  const vibe =
    score >= 80
      ? 'The chemistry is undeniable and the connection runs deep.'
      : score >= 60
        ? 'It takes work, but the sparks are real.'
        : 'Challenging? Absolutely. Worth it? You decide.';
  const body = `${s1} and ${s2} \u2014 ${score}% compatibility. ${vibe} Swipe for the full breakdown.`;

  const ctaTemplate = seededPick(COMPATIBILITY_CTAS, `cocta-${seed}`);
  const cta = ctaTemplate.replace('[Sign1]', s1).replace('[Sign2]', s2);

  const seoLine = seededPick(SEO_LINES.compatibility, `coseo-${seed}`);
  const hashtags = pickHashtags(
    seed,
    BROAD_HASHTAGS,
    NICHE_HASHTAGS.compatibility,
    [
      SIGN_HASHTAGS[sign1.toLowerCase()] || '',
      SIGN_HASHTAGS[sign2.toLowerCase()] || '',
    ].filter(Boolean),
  );

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

export function generateRankingCaption(
  trait: string,
  topSign: string,
  seed: string,
): IGCaption {
  const hookTemplate = seededPick(RANKING_CAPTION_HOOKS, `rhook-${seed}`);
  const hook = hookTemplate.replace('[trait]', trait);

  const body = `${capitalize(topSign)} takes the #1 spot for ${trait} \u2014 but the rest of the ranking might surprise you. Do you agree?`;

  const cta = seededPick(RANKING_CTAS, `rcta-${seed}`);
  const seoLine = seededPick(SEO_LINES.ranking, `rseo-${seed}`);
  const hashtags = pickHashtags(
    seed,
    BROAD_HASHTAGS,
    NICHE_HASHTAGS.ranking,
    [SIGN_HASHTAGS[topSign.toLowerCase()] || ''].filter(Boolean),
  );

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

export function generateAngelNumberCaption(
  number: string,
  seed: string,
): IGCaption {
  const hookTemplate = seededPick(ANGEL_NUMBER_CAPTION_HOOKS, `ahook-${seed}`);
  const hook = hookTemplate.replace('[Number]', number);

  const body = `Your angels are trying to get your attention. ${number} is one of the most powerful angel numbers \u2014 it carries a message you need to hear right now.`;

  const ctaTemplate = seededPick(ANGEL_NUMBER_CTAS, `acta-${seed}`);
  const cta = ctaTemplate.replace('[Number]', number);

  const seoLine = seededPick(SEO_LINES.numerology, `aseo-${seed}`);
  const hashtags = pickHashtags(
    seed,
    BROAD_HASHTAGS,
    NICHE_HASHTAGS.angelNumber,
    [`#${number}`, `#angelnumber${number}`],
  );

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

export function generateMemeCaption(
  sign: string,
  template: string,
  seed: string,
): IGCaption {
  const signName = capitalize(sign);
  const hook = `${signName} energy in one post`;
  const body = `If you know a ${signName}, you already know this is accurate.`;
  const cta = `Tag the ${signName} in your life`;
  const seoLine = seededPick(SEO_LINES.meme, `mseo-${seed}`);
  const hashtags = pickHashtags(
    seed,
    BROAD_HASHTAGS,
    NICHE_HASHTAGS.meme,
    [SIGN_HASHTAGS[sign.toLowerCase()] || ''].filter(Boolean),
  );

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

export function generateGenericCaption(
  title: string,
  category: ThemeCategory,
  seed: string,
): IGCaption {
  const hook = `Everything you need to know about ${title}`;
  const body = `Swipe through for the full guide. Save this for later.`;
  const cta = 'Which slide was most useful? Comment below';
  const seoLine = seededPick(
    SEO_LINES[category] || SEO_LINES.zodiac,
    `gseo-${seed}`,
  );
  const hashtags = pickHashtags(
    seed,
    BROAD_HASHTAGS,
    NICHE_HASHTAGS[category] || NICHE_HASHTAGS.zodiac,
  );

  return buildCaption(hook, body, cta, seoLine, hashtags);
}

function buildCaption(
  hook: string,
  body: string,
  cta: string,
  seoLine: string,
  hashtags: string[],
): IGCaption {
  const fullCaption = [
    hook,
    '',
    body,
    '',
    cta,
    '',
    seoLine,
    '',
    hashtags.join(' '),
  ].join('\n');
  return { hook, body, cta, seoLine, hashtags, fullCaption };
}
