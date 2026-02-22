/**
 * Hashtag generation and formatting utilities
 */

import type { HashtagData } from '../shared/types';
import { getHashtagLimit } from '../shared/constants/platform-limits';
import { normalise } from '../shared/text/normalize';
import type { SocialPostType, SourcePack } from './types';
import { HASHTAG_REGEX } from './constants';

export const TOPIC_HASHTAG_POOLS: Record<string, string[]> = {
  'new moon': ['#newmoon', '#moonphases', '#lunarcycle'],
  'full moon': ['#fullmoon', '#moonphases', '#lunarcycle'],
  'lunar nodes': ['#lunarnodes', '#birthchart'],
  'north node': ['#northnode', '#birthchart'],
  'south node': ['#southnode', '#birthchart'],
  'mercury retrograde': ['#mercuryretrograde', '#zodiacsigns'],
  'venus retrograde': ['#venusretrograde', '#zodiacsigns'],
  tarot: ['#tarot', '#tarotreading'],
  'major arcana': ['#majorarcana', '#tarot'],
  'minor arcana': ['#minorarcana', '#tarot'],
  'angel numbers': ['#angelnumbers', '#angelnumber', '#numerology'],
  'angel number': ['#angelnumbers', '#angelnumber', '#numerology'],
};

export const ZODIAC_HASHTAGS: Record<string, string> = {
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

/**
 * Broader category pools for TikTok — varied, topical tags that rotate
 * per topic to avoid hashtag stagnation and reach suppression.
 */
const TIKTOK_CATEGORY_POOLS: Record<string, string[]> = {
  '#zodiacsigns': [
    '#zodiac',
    '#horoscope',
    '#astrology',
    '#astrologytiktok',
    '#zodiacmemes',
    '#birthchart',
    '#astrologysigns',
    '#spiritualtiktok',
    '#witchtok',
  ],
  '#zodiac': [
    '#zodiacsigns',
    '#horoscope',
    '#astrology',
    '#astrologytiktok',
    '#birthchart',
    '#spiritualtiktok',
    '#witchtok',
  ],
  '#astrology': [
    '#zodiac',
    '#horoscope',
    '#zodiacsigns',
    '#astrologytiktok',
    '#zodiacmemes',
    '#astrologymemes',
    '#birthchart',
    '#astrologysigns',
    '#spiritualtiktok',
    '#witchtok',
  ],
  '#tarot': [
    '#tarotreading',
    '#tarotcards',
    '#tarotreader',
    '#tarottok',
    '#tarotcommunity',
    '#divination',
    '#oraclecards',
    '#psychic',
    '#witchtok',
    '#spiritualtiktok',
  ],
  '#moonphases': [
    '#moon',
    '#fullmoon',
    '#newmoon',
    '#moonmagic',
    '#moonphase',
    '#mooncycle',
    '#moonritual',
    '#moonenergy',
    '#witchtok',
    '#spiritualtiktok',
  ],
  '#numerology': [
    '#numerologyreading',
    '#manifestation',
    '#lifepath',
    '#spiritualawakening',
    '#manifest',
    '#numerologydaily',
    '#spiritualtiktok',
  ],
  '#crystalhealing': [
    '#crystals',
    '#crystaltok',
    '#healingcrystals',
    '#crystalcollection',
    '#amethyst',
    '#rosequartz',
    '#crystalenergy',
    '#witchtok',
    '#spiritualtiktok',
  ],
  '#witchtok': [
    '#spells',
    '#witchcraft',
    '#witch',
    '#witchesoftiktok',
    '#magick',
    '#wicca',
    '#pagan',
    '#babywitch',
    '#spellwork',
    '#spiritualtiktok',
  ],
  '#spirituality': [
    '#spiritual',
    '#spiritualawakening',
    '#spiritualtiktok',
    '#meditation',
    '#healing',
    '#chakras',
    '#reiki',
    '#thirdeye',
    '#lightworker',
    '#consciousness',
  ],
  '#wheeloftheyear': [
    '#pagan',
    '#wicca',
    '#witchtok',
    '#witchcraft',
    '#paganism',
    '#sabbat',
    '#witchesoftiktok',
    '#spiritualtiktok',
  ],
  '#runes': [
    '#norse',
    '#viking',
    '#norsemythology',
    '#elderfuthark',
    '#norsepagan',
    '#paganism',
    '#witchtok',
    '#divination',
  ],
};

const INSTAGRAM_CATEGORY_POOLS: Record<string, string[]> = {
  '#zodiacsigns': [
    '#zodiac',
    '#horoscope',
    '#astrologyposts',
    '#zodiacmemes',
    '#astrologer',
    '#moonsign',
    '#birthchart',
    '#astrologersofinstagram',
    '#dailyhoroscope',
  ],
  '#zodiac': [
    '#zodiacsigns',
    '#horoscope',
    '#astrologyposts',
    '#astrologer',
    '#birthchart',
    '#astrologersofinstagram',
  ],
  '#tarot': [
    '#tarotreading',
    '#tarotcards',
    '#tarotreader',
    '#tarotreadersofinstagram',
    '#tarotcommunity',
    '#oraclecards',
    '#divination',
    '#psychic',
  ],
  '#moonphases': [
    '#moon',
    '#fullmoon',
    '#newmoon',
    '#lunar',
    '#moonmagic',
    '#moonenergy',
    '#lunareclipse',
    '#moonritual',
  ],
  '#numerology': [
    '#numerologyreading',
    '#manifestation',
    '#manifest',
    '#lifepath',
    '#spiritualawakening',
    '#numerologydaily',
  ],
  '#crystalhealing': [
    '#crystals',
    '#healingcrystals',
    '#crystalenergy',
    '#crystalcollection',
    '#gemstones',
    '#amethyst',
    '#crystalmagic',
    '#crystallove',
  ],
  '#witchtok': [
    '#witch',
    '#witchesofinstagram',
    '#witchcraft',
    '#witchyvibes',
    '#spellcasting',
    '#witchery',
    '#magick',
    '#wicca',
  ],
  '#spirituality': [
    '#spiritual',
    '#spiritualawakening',
    '#spiritualjourney',
    '#spiritualgrowth',
    '#meditation',
    '#healing',
    '#consciousness',
    '#lightworker',
    '#chakras',
  ],
  '#wheeloftheyear': [
    '#pagan',
    '#wicca',
    '#witchcraft',
    '#paganism',
    '#sabbat',
    '#witchesofinstagram',
  ],
};

const TWITTER_CATEGORY_POOLS: Record<string, string[]> = {
  '#zodiacsigns': ['#zodiac', '#horoscope', '#astrologyposts'],
  '#tarot': ['#tarotreading', '#tarotcards', '#divination'],
  '#moonphases': ['#fullmoon', '#newmoon', '#moonmagic'],
  '#numerology': ['#numerologyreading', '#manifestation'],
  '#crystalhealing': ['#crystals', '#healingcrystals'],
  '#witchtok': ['#witchcraft', '#witch', '#spellwork'],
  '#spirituality': ['#spiritual', '#spiritualawakening', '#meditation'],
};

const LINKEDIN_CATEGORY_POOLS: Record<string, string[]> = {
  '#zodiacsigns': ['#wellness', '#mindfulness', '#personaldevelopment'],
  '#tarot': ['#personaldevelopment', '#mindfulness', '#selfawareness'],
  '#moonphases': ['#wellness', '#mindfulness', '#naturecycles'],
  '#numerology': ['#personaldevelopment', '#selfawareness'],
  '#crystalhealing': ['#holistichealth', '#wellness', '#selfcare'],
  '#spirituality': [
    '#wellness',
    '#mindfulness',
    '#personalgrowth',
    '#consciousness',
  ],
};

const PINTEREST_CATEGORY_POOLS: Record<string, string[]> = {
  '#zodiacsigns': [
    '#zodiac',
    '#horoscope',
    '#zodiacaesthetic',
    '#birthchart',
    '#astrologyart',
  ],
  '#tarot': [
    '#tarotcards',
    '#tarotdeck',
    '#tarotart',
    '#oraclecards',
    '#tarotreading',
  ],
  '#moonphases': ['#fullmoon', '#newmoon', '#lunarmagic', '#moonaesthetic'],
  '#numerology': ['#angelnumbers', '#manifestation', '#spiritualaesthetic'],
  '#crystalhealing': [
    '#crystals',
    '#crystalaesthetic',
    '#gemstones',
    '#healingcrystals',
  ],
  '#witchtok': ['#witchaesthetic', '#witchyvibes', '#witchcraft', '#spells'],
  '#spirituality': [
    '#spiritualawakening',
    '#meditation',
    '#selfcare',
    '#manifestation',
  ],
};

const PLATFORM_CATEGORY_POOLS: Record<string, Record<string, string[]>> = {
  tiktok: TIKTOK_CATEGORY_POOLS,
  instagram: INSTAGRAM_CATEGORY_POOLS,
  twitter: TWITTER_CATEGORY_POOLS,
  linkedin: LINKEDIN_CATEGORY_POOLS,
  pinterest: PINTEREST_CATEGORY_POOLS,
  bluesky: TWITTER_CATEGORY_POOLS, // Bluesky uses same pools as Twitter
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const ZODIAC_COMPANION_POOL = [
  '#zodiacsigns',
  '#horoscope',
  '#zodiac',
  '#birthchart',
];

export const getTopicHashtagPool = (topicTitle: string): string[] => {
  const normalized = normalise(topicTitle);
  if (TOPIC_HASHTAG_POOLS[normalized]) {
    return TOPIC_HASHTAG_POOLS[normalized];
  }
  for (const [sign, tag] of Object.entries(ZODIAC_HASHTAGS)) {
    if (normalized.includes(sign)) {
      return [
        tag,
        ZODIAC_COMPANION_POOL[simpleHash(sign) % ZODIAC_COMPANION_POOL.length],
      ];
    }
  }
  return [];
};

export const selectHashtagsForPostType = ({
  topicTitle,
  postType,
  platform,
  hashtagData,
}: {
  topicTitle: string;
  postType: SocialPostType;
  platform: string;
  hashtagData: HashtagData;
}): string[] => {
  if (platform === 'threads') return [];
  const pool = getTopicHashtagPool(topicTitle);

  // TikTok: 3-5 varied, on-topic hashtags — no brand tag.
  // Uses topic-specific tags first, then fills from a broader category pool
  // rotated by topic title to ensure variety across posts.
  if (platform === 'tiktok') {
    const limit = getHashtagLimit('tiktok');
    const tags: string[] = [];
    const seen = new Set<string>();

    const addTag = (tag: string) => {
      const normalized = tag.startsWith('#')
        ? tag.toLowerCase()
        : `#${tag.toLowerCase()}`;
      if (!seen.has(normalized) && tags.length < limit) {
        seen.add(normalized);
        tags.push(normalized);
      }
    };

    // Topic-specific tags first (e.g. #aries, #newmoon, #tarot)
    for (const tag of pool) addTag(tag);

    // Fill remaining slots from broader category pool, rotated by topic
    const domainKey = hashtagData.domain?.toLowerCase() || '';
    const fillerPool = TIKTOK_CATEGORY_POOLS[domainKey] || [];
    const seed = simpleHash(topicTitle);
    const startIndex = seed % Math.max(1, fillerPool.length);
    for (let i = 0; i < fillerPool.length && tags.length < limit; i++) {
      addTag(fillerPool[(startIndex + i) % fillerPool.length]);
    }

    return tags;
  }

  // All other platforms: topic-specific tags first, then fill from platform category pool
  const platformLimit = getHashtagLimit(platform);
  const desiredMax =
    postType === 'question'
      ? 2
      : postType === 'persona' || postType === 'closing_statement'
        ? 2
        : postType === 'closing_ritual'
          ? 2
          : 4;
  const limit = Math.min(platformLimit, desiredMax);

  const tags: string[] = [];
  const seen = new Set<string>();

  const addTag = (tag: string) => {
    const normalized = tag.startsWith('#')
      ? tag.toLowerCase()
      : `#${tag.toLowerCase()}`;
    if (!seen.has(normalized) && tags.length < limit) {
      seen.add(normalized);
      tags.push(normalized);
    }
  };

  // Topic-specific tags first
  for (const tag of pool) addTag(tag);

  // Fill remaining slots from platform-specific category pool, rotated by topic
  const platformPools = PLATFORM_CATEGORY_POOLS[platform];
  if (platformPools) {
    const domainKey = hashtagData.domain?.toLowerCase() || '';
    const fillerPool = platformPools[domainKey] || [];
    const seed = simpleHash(topicTitle);
    const startIndex = seed % Math.max(1, fillerPool.length);
    for (let i = 0; i < fillerPool.length && tags.length < limit; i++) {
      addTag(fillerPool[(startIndex + i) % fillerPool.length]);
    }
  }

  // Fallback if no platform pool matched
  if (tags.length === 0) {
    const fallback = [hashtagData.topic, hashtagData.domain].filter(Boolean);
    for (const tag of fallback) addTag(tag);
  }

  return tags;
};

export const buildCuratedHashtags = (pack: SourcePack): string[] =>
  selectHashtagsForPostType({
    topicTitle: pack.topicTitle,
    postType: pack.postType,
    platform: pack.platform,
    hashtagData: pack.hashtagData,
  });

export const extractHashtags = (text: string): string[] => {
  const matches = text.match(HASHTAG_REGEX) || [];
  const normalized = matches.map((tag) => tag.toLowerCase());
  return Array.from(new Set(normalized));
};

export const stripHashtags = (text: string): string =>
  text.replace(HASHTAG_REGEX, '').trim();
