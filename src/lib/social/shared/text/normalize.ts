/**
 * Text normalization utilities
 */

/**
 * Normalize text for comparison (lowercase, no punctuation, single spaces)
 */
export const normalise = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Collapse repeated adjacent tokens in text
 */
export const collapseRepeatedTokens = (value: string): string => {
  const parts = value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.trim());
  const deduped: string[] = [];
  for (const part of parts) {
    if (
      deduped.length > 0 &&
      deduped[deduped.length - 1].toLowerCase() === part.toLowerCase()
    ) {
      continue;
    }
    deduped.push(part);
  }
  return deduped.join(' ');
};

/**
 * Ensure text ends with proper sentence punctuation
 */
export const sentenceSafe = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

/**
 * Ensure sentence ends with punctuation
 */
export const ensureSentenceEndsWithPunctuation = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

/**
 * Normalize hook line (replace dashes, collapse whitespace)
 */
export const normalizeHookLine = (value: string): string =>
  value.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim();

/**
 * Normalize slug for comparison
 */
export const normalizeSlug = (slug: string | undefined): string =>
  slug ? slug.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '') : '';

/**
 * Convert value to hashtag format
 */
export const toHashtag = (value: string): string =>
  `#${value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join('')}`;

/**
 * Check if two titles match (for topic comparison)
 */
export const matchesTopic = (title: string, topic: string): boolean => {
  const titleKey = normalise(title);
  const topicKey = normalise(topic);
  if (!titleKey || !topicKey) return false;
  return (
    titleKey.includes(topicKey) ||
    topicKey.includes(titleKey) ||
    titleKey === topicKey
  );
};

/**
 * Derive search keyword from topic
 */
export const deriveSearchKeyword = (topic: string): string => {
  const normalized = normalise(topic);
  if (!normalized) return 'astrology meaning';
  return normalized.endsWith('meaning') ? normalized : `${normalized} meaning`;
};

/**
 * Get search phrase for topic based on category
 */
export const getSearchPhraseForTopic = (
  topic: string,
  category?: string,
): string => {
  const key = normalise(topic);
  switch (category) {
    case 'zodiac':
      return `${key} explained`;
    case 'tarot':
      return `${key} meaning`;
    case 'crystals':
      return `${key} meaning`;
    case 'numerology':
      return `${key} meaning`;
    case 'chakras':
      return `${key} meaning`;
    case 'sabbat':
      return `${key} explained`;
    case 'lunar':
      return `${key} meaning`;
    case 'planetary':
      return `what is ${key}`;
    default:
      return `${key} meaning`;
  }
};

/**
 * Escape string for use in RegExp
 */
export const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Count occurrences of a term in text
 */
export const countOccurrences = (text: string, term: string): number => {
  if (!term) return 0;
  const escaped = escapeRegExp(term.trim());
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
};

/**
 * Count topic mentions in content
 */
export const countTopicMentions = (content: string, topic: string): number => {
  const haystack = normalise(content);
  const needle = normalise(topic);
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
};

/**
 * Count words in text
 */
export const countWords = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
};

/**
 * Estimate speaking duration from word count
 */
export const estimateDuration = (wordCount: number): string => {
  // Average speaking pace: 130-150 words per minute
  const minutes = wordCount / 140;
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} seconds`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
};

/**
 * Pick unique values from array (deduplicated by normalised key)
 */
export const pickUnique = (values: string[], limit: number): string[] => {
  const unique: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (!unique.some((item) => normalise(item) === normalise(trimmed))) {
      unique.push(trimmed);
    }
    if (unique.length >= limit) break;
  }
  return unique;
};

/**
 * Pick random item from array
 */
export const pickRandom = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};
