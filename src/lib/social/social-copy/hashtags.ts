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
  const fallback = [hashtagData.topic, hashtagData.domain].filter(Boolean);
  const baseTags = (pool.length > 0 ? pool : fallback).map((tag) =>
    tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`,
  );
  const allowBrand = platform === 'instagram' || platform === 'tiktok';
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
