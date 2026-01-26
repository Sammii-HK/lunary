/**
 * Validation utilities for video scripts
 */

import {
  VIDEO_BANNED_PHRASES,
  VIDEO_BANNED_PATTERNS,
} from '../shared/constants/banned-phrases';
import {
  hasTruncationArtifact,
  needsLineRewrite,
} from '../shared/text/truncation';
import {
  hasDeterministicLanguage,
  hasTextbookLanguage,
} from '../shared/validation/deterministic-language';
import { countWords, countOccurrences } from '../shared/text/normalize';
import { getFirstSentence } from '../shared/text/truncation';

export const HOOK_LIKE_PATTERNS = [
  /^most people get /i,
  /^if .+ confuses you/i,
  /this will click/i,
  /here's what matters/i,
  /here's how/i,
  /why it matters/i,
  /makes timing clearer/i,
  /^let me show you what/i,
  /^here's what .+ actually tracks/i,
  /^watch for .+ when/i,
  /^ever wonder when/i,
  /^what does .+ feel like/i,
];

/**
 * Validate video hook
 */
export const validateVideoHook = (
  hook: string,
  topic: string,
  searchPhrase: string,
): string[] => {
  const reasons: string[] = [];
  const trimmed = hook.trim();
  if (!trimmed) {
    return ['Hook is empty'];
  }
  const firstSentence = getFirstSentence(trimmed);
  if (!firstSentence || firstSentence !== trimmed) {
    reasons.push('Hook must be a single sentence');
  }
  if (!/[.!?]$/.test(trimmed)) {
    reasons.push('Hook must end with punctuation');
  }
  const wordCount = countWords(trimmed);
  if (wordCount < 8 || wordCount > 14) {
    reasons.push(`Hook word count out of range (${wordCount})`);
  }
  const hasTopic = trimmed.toLowerCase().includes(topic.toLowerCase());
  const hasSearch = trimmed.toLowerCase().includes(searchPhrase.toLowerCase());
  if (!hasTopic && !hasSearch) {
    reasons.push('Hook missing keyword');
  } else {
    const keyword = hasTopic ? topic : searchPhrase;
    if (countOccurrences(trimmed, keyword) !== 1) {
      reasons.push('Hook must include keyword exactly once');
    }
  }
  const lower = trimmed.toLowerCase();
  if (VIDEO_BANNED_PHRASES.some((phrase) => lower.includes(phrase))) {
    reasons.push('Hook contains banned phrase');
  }
  if (VIDEO_BANNED_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    reasons.push('Hook contains banned pattern');
  }
  return reasons;
};

/**
 * Check if line is hook-like
 */
export const isHookLikeLine = (
  line: string,
  topic: string,
  searchPhrase: string,
): boolean => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  const includesKeyword =
    lower.includes(topic.toLowerCase()) ||
    lower.includes(searchPhrase.toLowerCase());
  if (!includesKeyword) return false;
  if (HOOK_LIKE_PATTERNS.some((pattern) => pattern.test(lower))) return true;
  const candidate = getFirstSentence(trimmed) || trimmed;
  return validateVideoHook(candidate, topic, searchPhrase).length === 0;
};

/**
 * Check for repeated adjacent bigrams in lines
 */
export const hasRepeatedAdjacentBigrams = (lines: string[]): boolean => {
  const normalize = (line: string) =>
    line
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  const bigrams = (words: string[]) => {
    const pairs: string[] = [];
    for (let i = 0; i < words.length - 1; i += 1) {
      pairs.push(`${words[i]} ${words[i + 1]}`);
    }
    return new Set(pairs);
  };
  for (let i = 0; i < lines.length - 1; i += 1) {
    const current = bigrams(normalize(lines[i]));
    const next = bigrams(normalize(lines[i + 1]));
    if (current.size === 0 || next.size === 0) continue;
    let overlap = 0;
    for (const pair of current) {
      if (next.has(pair)) overlap += 1;
    }
    const ratio = overlap / Math.max(current.size, next.size);
    if (overlap >= 2 && ratio > 0.35) {
      return true;
    }
  }
  return false;
};

/**
 * Find index of "So what:" or "Try this:" line
 */
export const findSoWhatLineIndex = (lines: string[]): number =>
  lines.findIndex((line) => /^\s*(so what:|try this:)\b/i.test(line.trim()));

/**
 * Validate script body lines
 */
export const validateScriptBody = (
  lines: string[],
  topic: string,
  searchPhrase: string,
): string[] => {
  const reasons: string[] = [];
  if (lines.length < 6 || lines.length > 10) {
    reasons.push(`Script body must be 6–10 lines (${lines.length})`);
  }
  const combined = lines.join(' ').trim();
  if (hasTruncationArtifact(combined)) {
    reasons.push('Script contains truncation artifact');
  }
  if (hasDeterministicLanguage(combined)) {
    reasons.push('Script contains deterministic language');
  }
  if (hasRepeatedAdjacentBigrams(lines)) {
    reasons.push('Adjacent lines repeat meaning');
  }
  if (hasTextbookLanguage(combined)) {
    reasons.push('Script sounds too textbook');
  }
  const soWhatIndex = findSoWhatLineIndex(lines);
  if (soWhatIndex === -1) {
    reasons.push('Missing "So what" or "Try this" line');
  } else {
    const soWhatCount = lines.filter((line) =>
      /^\s*(so what:|try this:)\b/i.test(line.trim()),
    ).length;
    if (soWhatCount !== 1) {
      reasons.push(
        'Script must include exactly one "So what" or "Try this" line',
      );
    }
    if (soWhatIndex < Math.max(0, lines.length - 2)) {
      reasons.push('"So what" or "Try this" line must be near the end');
    }
  }
  if (lines.some((line) => needsLineRewrite(line))) {
    reasons.push('Script contains a line ending with a dangling word');
  }
  if (lines.some((line) => isHookLikeLine(line, topic, searchPhrase))) {
    reasons.push('Script body contains extra hook line');
  }
  const lower = combined.toLowerCase();
  if (VIDEO_BANNED_PHRASES.some((phrase) => lower.includes(phrase))) {
    reasons.push('Script contains banned phrase');
  }
  if (VIDEO_BANNED_PATTERNS.some((pattern) => pattern.test(combined))) {
    reasons.push('Script contains banned pattern');
  }
  if (
    countOccurrences(combined, topic) > 3 ||
    countOccurrences(combined, searchPhrase) > 2
  ) {
    reasons.push('Script repeats keyword too often');
  }
  return reasons;
};
