/**
 * Validation utilities for video scripts
 *
 * VALIDATION PHILOSOPHY:
 * - HARD FAILS: Only for critical issues (truncation, missing elements, banned phrases)
 * - SOFT FAILS: For style issues - passed to AI as retry feedback, not hard rejections
 * - The goal is variety, not perfection
 */

import {
  VIDEO_BANNED_PHRASES,
  VIDEO_BANNED_PATTERNS,
} from '../shared/constants/banned-phrases';
import { hasTruncationArtifact } from '../shared/text/truncation';
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
 * Check for em dashes (banned)
 */
export const hasEmDash = (text: string): boolean =>
  text.includes('—') || text.includes('--');

/**
 * CRITICAL PATTERNS - These cause HARD validation failures
 * Only the most egregious, clearly templated content
 */
const CRITICAL_BANNED_PATTERNS = [
  // The exact banned phrases from the user's requirements
  /look for .+ in the small,? repeatable details/i,
  /notice what shifts when you work with .+ intentionally/i,
  /patterns make sense once you start noticing them/i,
  /here is the clear meaning of .+ in practice/i,
  // Clearly templated closings
  /your growth awaits/i,
  /journey of self-discovery/i,
  /cosmic dance/i,
  /embrace your true/i,
];

/**
 * SOFT WARNING PATTERNS - These get passed to AI as feedback but don't fail validation
 * Used to encourage variety without rejecting otherwise good content
 */
const SOFT_WARNING_PATTERNS = [
  {
    pattern: /ever thought about/i,
    feedback: 'Avoid "ever thought about" questions - too common',
  },
  {
    pattern: /it matters because/i,
    feedback: 'Rephrase "it matters because" - sounds generic',
  },
  {
    pattern: /the (key|secret) to .+ is/i,
    feedback: 'Avoid "the key/secret to X is" - templated',
  },
  {
    pattern: /most people misunderstand/i,
    feedback: 'Rephrase "most people misunderstand" - overused hook',
  },
  {
    pattern: /it's like .+ is (saying|telling)/i,
    feedback: 'Avoid "it\'s like X is saying/telling" - cliché',
  },
];

/**
 * Get soft warnings for text (returned as feedback, not failures)
 */
export const getSoftWarnings = (text: string): string[] => {
  const warnings: string[] = [];
  for (const { pattern, feedback } of SOFT_WARNING_PATTERNS) {
    if (pattern.test(text)) {
      warnings.push(feedback);
    }
  }
  return warnings;
};

/**
 * Check for critical banned patterns (HARD FAIL)
 */
export const hasCriticalBannedPattern = (text: string): boolean =>
  CRITICAL_BANNED_PATTERNS.some((pattern) => pattern.test(text));

/**
 * Check for overused content patterns - less strict version
 */
const OVERUSED_CONTENT_PATTERNS = [
  /journey of self/i,
  /cosmic dance/i,
  /step into your/i,
  /unlock your/i,
  /manifest your/i,
  /embrace your/i,
  /your growth awaits/i,
  /deepen your practice/i,
  /deepen your understanding/i,
];

export const hasOverusedContentPattern = (text: string): boolean =>
  OVERUSED_CONTENT_PATTERNS.some((pattern) => pattern.test(text));

/**
 * Validate video hook
 * Returns array of issues - empty means valid
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

  // CRITICAL: Must be a single sentence
  const firstSentence = getFirstSentence(trimmed);
  if (!firstSentence || firstSentence !== trimmed) {
    reasons.push('Hook must be a single sentence');
  }

  // CRITICAL: Must end with punctuation
  if (!/[.!?]$/.test(trimmed)) {
    reasons.push('Hook must end with punctuation');
  }

  // CRITICAL: Word count in range
  const wordCount = countWords(trimmed);
  if (wordCount < 8 || wordCount > 14) {
    reasons.push(`Hook word count out of range (${wordCount})`);
  }

  // CRITICAL: Must include keyword
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

  // CRITICAL: Check for banned phrases (only the critical ones)
  const lower = trimmed.toLowerCase();
  for (const phrase of VIDEO_BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      reasons.push(`Hook contains banned phrase: "${phrase}"`);
      break; // Only report first one
    }
  }

  // CRITICAL: Check for critical banned patterns
  if (hasCriticalBannedPattern(trimmed)) {
    reasons.push('Hook contains critically banned template pattern');
  }

  // SOFT: Em dash (just warn, don't fail)
  // if (hasEmDash(trimmed)) {
  //   reasons.push('Hook contains em dash');
  // }

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
 * Accepts variations: "So what:", "So what -", "So what,", "Try this:", etc.
 */
export const findSoWhatLineIndex = (lines: string[]): number =>
  lines.findIndex((line) =>
    /^\s*(so what|try this)[\s:,\-]/i.test(line.trim()),
  );

/**
 * Validate script body lines
 * Returns array of issues - empty means valid
 *
 * PHILOSOPHY: Only hard-fail on critical issues. Style issues become retry feedback.
 */
export const validateScriptBody = (
  lines: string[],
  topic: string,
  searchPhrase: string,
): string[] => {
  const reasons: string[] = [];

  // CRITICAL: Line count
  if (lines.length < 6 || lines.length > 10) {
    reasons.push(`Script body must be 6-10 lines (got ${lines.length})`);
  }

  const combined = lines.join(' ').trim();

  // CRITICAL: Truncation artifact (broken generation)
  if (hasTruncationArtifact(combined)) {
    reasons.push('Script contains truncation artifact');
  }

  // NOTE: Removed "So what:" / "Try this:" validation - too prescriptive
  // The prompt guides for practical observations without mandating exact phrases

  // CRITICAL: Check for banned phrases
  const lower = combined.toLowerCase();
  for (const phrase of VIDEO_BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      reasons.push(`Script contains banned phrase: "${phrase}"`);
      break; // Only report first one
    }
  }

  // CRITICAL: Check for critical banned patterns
  if (hasCriticalBannedPattern(combined)) {
    reasons.push('Script contains critically banned template pattern');
  }

  // CRITICAL: Check for VIDEO_BANNED_PATTERNS
  if (VIDEO_BANNED_PATTERNS.some((pattern) => pattern.test(combined))) {
    reasons.push('Script contains banned pattern');
  }

  // CRITICAL: Keyword repetition (more than 3 times is spammy)
  if (
    countOccurrences(combined, topic) > 4 ||
    countOccurrences(combined, searchPhrase) > 3
  ) {
    reasons.push('Script repeats keyword too often');
  }

  // SOFT ISSUES - Only add if no critical issues (to allow retry with feedback)
  if (reasons.length === 0) {
    // Soft: Deterministic language (warn, don't fail)
    if (hasDeterministicLanguage(combined)) {
      reasons.push(
        'SOFT: Contains deterministic language - use "tends to", "often", "can"',
      );
    }

    // Soft: Repeated bigrams (warn, don't fail)
    if (hasRepeatedAdjacentBigrams(lines)) {
      reasons.push('SOFT: Adjacent lines repeat similar meaning');
    }

    // Soft: Textbook language
    if (hasTextbookLanguage(combined)) {
      reasons.push('SOFT: Sounds too textbook - make it conversational');
    }

    // Soft: Motivational poster closing
    const lastLine = lines[lines.length - 1]?.toLowerCase() || '';
    if (
      /embrace|unlock|manifest|journey|growth awaits|step into|cosmic dance/i.test(
        lastLine,
      )
    ) {
      reasons.push(
        'SOFT: Final line sounds like motivational poster - make it observational',
      );
    }

    // Soft: Pacing check — flag if most sentences are too long
    const longSentences = lines.filter((line) => countWords(line) > 18).length;
    if (longSentences > lines.length * 0.5) {
      reasons.push(
        'SOFT: Most lines are 18+ words - shorten for TikTok pacing',
      );
    }

    // Soft: Duration sweet-spot — flag scripts outside 25-40 second range
    const totalWords = lines.reduce((sum, line) => sum + countWords(line), 0);
    if (totalWords < 80) {
      reasons.push(
        'SOFT: Script is under 80 words - may be too short for educational TikTok',
      );
    }
    if (totalWords > 120) {
      reasons.push(
        'SOFT: Script is over 120 words - may lose viewers before completion',
      );
    }

    // Soft: Monotonous openings — flag if 3+ lines start with the same word
    const openingWords = lines.map((line) =>
      line.split(/\s+/)[0]?.toLowerCase(),
    );
    const wordCounts = openingWords.reduce(
      (acc, w) => {
        if (w) acc[w] = (acc[w] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const maxRepeat = Math.max(...Object.values(wordCounts), 0);
    if (maxRepeat >= 3) {
      reasons.push(
        'SOFT: 3+ lines start with the same word - vary line openings',
      );
    }

    // Add any soft warnings
    const warnings = getSoftWarnings(combined);
    for (const warning of warnings) {
      reasons.push(`SOFT: ${warning}`);
    }
  }

  return reasons;
};

/**
 * Check if validation result contains only soft issues (can proceed with retry feedback)
 */
export const hasOnlySoftIssues = (issues: string[]): boolean =>
  issues.length > 0 && issues.every((issue) => issue.startsWith('SOFT:'));

/**
 * Get only critical issues from validation result
 */
export const getCriticalIssues = (issues: string[]): string[] =>
  issues.filter((issue) => !issue.startsWith('SOFT:'));

/**
 * Get soft issues as retry feedback
 */
export const getSoftIssuesAsFeedback = (issues: string[]): string =>
  issues
    .filter((issue) => issue.startsWith('SOFT:'))
    .map((issue) => issue.replace('SOFT: ', ''))
    .join('; ');

// Legacy exports for backwards compatibility
export const hasGenericFillerPattern = hasCriticalBannedPattern;
export const hasTemplatePattern = hasCriticalBannedPattern;
export const countGenericLines = (lines: string[], topic: string): number => 0; // Deprecated
