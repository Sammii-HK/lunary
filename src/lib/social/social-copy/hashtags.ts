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
  'lunar nodes': ['#lunarnodes', '#astrology'],
  'north node': ['#northnode', '#astrology'],
  'south node': ['#southnode', '#astrology'],
  'mercury retrograde': ['#mercuryretrograde', '#astrology'],
  'venus retrograde': ['#venusretrograde', '#astrology'],
  tarot: ['#tarot', '#tarotreading'],
  'major arcana': ['#majorarcana', '#tarot'],
  'minor arcana': ['#minorarcana', '#tarot'],
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
    '#angelnumbers',
    '#manifestation',
    '#1111',
    '#444',
    '#lifepath',
    '#spiritualawakening',
    '#manifest',
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

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export const getTopicHashtagPool = (topicTitle: string): string[] => {
  const normalized = normalise(topicTitle);
  if (TOPIC_HASHTAG_POOLS[normalized]) {
    return TOPIC_HASHTAG_POOLS[normalized];
  }
  for (const [sign, tag] of Object.entries(ZODIAC_HASHTAGS)) {
    if (normalized.includes(sign)) {
      return [tag, '#astrology'];
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

  const fallback = [hashtagData.topic, hashtagData.domain].filter(Boolean);
  const baseTags = (pool.length > 0 ? pool : fallback).map((tag) =>
    tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`,
  );
  const allowBrand = platform === 'instagram';
  const brandTag = hashtagData.brand
    ? hashtagData.brand.startsWith('#')
      ? hashtagData.brand.toLowerCase()
      : `#${hashtagData.brand.toLowerCase()}`
    : '';
  const withBrand = allowBrand && brandTag ? [...baseTags, brandTag] : baseTags;
  const unique = Array.from(new Set(withBrand));

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
  const sliced = unique.slice(0, Math.max(0, limit));
  return sliced;
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
