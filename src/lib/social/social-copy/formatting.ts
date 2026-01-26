/**
 * Content formatting utilities for social copy
 */

import { getMaxChars } from '../shared/constants/platform-limits';
import { trimToMaxChars } from '../shared/text/truncation';
import { extractHashtags, stripHashtags } from './hashtags';
import { HASHTAG_REGEX } from './constants';

/**
 * Normalize hashtags for platform
 */
export function normalizeHashtagsForPlatform(
  content: string,
  platform: string,
): string {
  const max = getMaxChars(platform);
  const tags = extractHashtags(content);
  const cleaned = stripHashtags(content)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  if (tags.length === 0) {
    return cleaned;
  }

  const hashtagLine = tags.join(' ');
  if (hashtagLine.length >= max) {
    return cleaned ? trimToMaxChars(cleaned, max) : hashtagLine.slice(0, max);
  }

  const separator = '\n\n';
  const bodyMax = Math.max(0, max - hashtagLine.length - separator.length);
  const body = bodyMax > 0 ? trimToMaxChars(cleaned, bodyMax) : '';
  return body ? `${body}${separator}${hashtagLine}` : hashtagLine;
}

/**
 * Apply platform-specific formatting
 */
export function applyPlatformFormatting(
  content: string,
  platform: string,
): string {
  const max = getMaxChars(platform);

  if (platform === 'threads') {
    // Threads: no hashtags, no extra blank lines, single paragraph.
    const cleaned = content
      .replace(HASHTAG_REGEX, '')
      .replace(/\n{2,}/g, '\n')
      .replace(/\s+\n/g, '\n')
      .trim();
    const flattened = cleaned.replace(/\n+/g, '\n').trim();
    return trimToMaxChars(flattened, max);
  }

  const normalized = normalizeHashtagsForPlatform(content, platform);
  const trimmed = trimToMaxChars(normalized, max);
  if (platform === 'twitter' || platform === 'bluesky') {
    return trimmed
      .replace(/\n{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return trimmed.trim();
}
