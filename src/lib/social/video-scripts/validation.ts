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
 * Check for em dashes (banned)
 */
export const hasEmDash = (text: string): boolean =>
  text.includes('—') || text.includes('--');

/**
 * GENERIC FILLER PATTERNS
 * These sentences could work for ANY topic by swapping the keyword
 * This is the core problem with repetitive scripts
 */
const GENERIC_FILLER_PATTERNS = [
  // Patterns that work for literally anything
  /pay attention to how .+ (shows up|shapes|affects)/i,
  /.+ often appears when you need it most/i,
  /notice how .+ shows up in your daily life/i,
  /there's wisdom in understanding .+/i,
  /.+ invites you to reflect on/i,
  /consider what .+ might be telling you/i,
  /look for .+ in the small,? repeatable details/i,
  /notice what shifts when you work with .+ intentionally/i,
  /patterns make sense once you start noticing them/i,
  /here is the clear meaning of .+ in practice/i,
  /.+ describes .+ (energy|meaning|quality)/i,
  /it's like .+ is (saying|telling|showing)/i,
  /ever thought about (what|how|why) .+\?/i,
  /it matters because .+/i,
  /curious (how|to see|about) .+/i,
  /the (key|secret|real power) (to|of) .+ is/i,
  /understanding .+ starts with/i,
  /working with .+ means/i,
  /what makes .+ (unique|special|different) is/i,
  /.+ (helps|allows|enables) you to/i,
  /when .+ shows up,? pay attention/i,
  /the truth about .+ is/i,
  /.+ (represents|symbolizes|embodies)/i,
  /this is what .+ looks like in practice/i,
  /here's (what|how) .+ (works|manifests|appears)/i,
  /.+ can (guide|help|support) you/i,
  /the energy of .+ is/i,
  /.+ brings? (clarity|insight|awareness)/i,
];

/**
 * Template patterns that indicate lazy, repetitive writing
 */
const TEMPLATE_PATTERNS = [
  /here is the clear meaning of .+ in practice/i,
  /look for .+ in the small,? repeatable details/i,
  /notice what shifts when you work with .+ intentionally/i,
  /patterns make sense once you start noticing them/i,
  /here's how .+ actually works/i,
  /the key to .+ is/i,
  /what makes .+ different is/i,
  /when .+ shows up,? pay attention to/i,
  /the real power of .+ comes from/i,
  /most people misunderstand .+/i,
  /here's what .+ really means/i,
  /the truth about .+ is/i,
  /understanding .+ starts with/i,
  /working with .+ means/i,
  /the secret to .+ is/i,
];

/**
 * Patterns that indicate overused/formulaic content
 */
const OVERUSED_CONTENT_PATTERNS = [
  /ever notice .+\? it's .+\./i,
  /seeing .+ lately\?/i,
  /spotting .+ lately\?/i,
  /noticed .+ lately\?/i,
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

/**
 * Check for generic filler patterns (sentences that work for any topic)
 */
export const hasGenericFillerPattern = (text: string): boolean =>
  GENERIC_FILLER_PATTERNS.some((pattern) => pattern.test(text));

/**
 * Check for template patterns (generic swappable sentences)
 */
export const hasTemplatePattern = (text: string): boolean =>
  TEMPLATE_PATTERNS.some((pattern) => pattern.test(text));

/**
 * Check for overused content patterns
 */
export const hasOverusedContentPattern = (text: string): boolean =>
  OVERUSED_CONTENT_PATTERNS.some((pattern) => pattern.test(text));

/**
 * Check if a sentence is too generic (could work for multiple topics)
 * This is a heuristic check based on common generic structures
 */
export const isSentenceTooGeneric = (
  sentence: string,
  topic: string,
): boolean => {
  const lower = sentence.toLowerCase();
  const topicLower = topic.toLowerCase();

  // If the sentence doesn't even mention the topic, it might be okay
  // (could be a transitional sentence)
  if (!lower.includes(topicLower)) {
    return false;
  }

  // Check if removing the topic leaves a generic shell
  const withoutTopic = lower.replace(new RegExp(topicLower, 'gi'), '[X]');

  // Generic patterns when topic is removed
  const genericShells = [
    /\[x\] (shows up|appears|manifests) when/i,
    /pay attention to \[x\]/i,
    /notice (how|when|what) \[x\]/i,
    /\[x\] (helps|guides|supports)/i,
    /the (meaning|energy|power) of \[x\]/i,
    /working with \[x\]/i,
    /understanding \[x\]/i,
    /\[x\] (represents|symbolizes)/i,
    /when \[x\] (shows up|appears)/i,
    /\[x\] is (about|for|telling)/i,
  ];

  return genericShells.some((pattern) => pattern.test(withoutTopic));
};

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
  if (
    VIDEO_BANNED_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase()))
  ) {
    reasons.push('Hook contains banned phrase');
  }
  if (VIDEO_BANNED_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    reasons.push('Hook contains banned pattern');
  }
  if (hasEmDash(trimmed)) {
    reasons.push('Hook contains em dash (banned)');
  }
  if (hasOverusedContentPattern(trimmed)) {
    reasons.push('Hook contains overused/formulaic pattern');
  }
  if (hasTemplatePattern(trimmed)) {
    reasons.push('Hook uses generic template pattern');
  }
  if (hasGenericFillerPattern(trimmed)) {
    reasons.push('Hook uses generic filler pattern (works for any topic)');
  }
  // Check for "most people" openings
  if (/^most people/i.test(trimmed)) {
    reasons.push('Hook starts with "most people" (banned)');
  }
  // Check for "here's" openings
  if (/^here'?s/i.test(trimmed)) {
    reasons.push('Hook starts with "here\'s" (banned)');
  }
  // Check for "ever" question openings
  if (/^ever (notice|wonder|thought|think)/i.test(trimmed)) {
    reasons.push('Hook starts with "ever..." question (banned)');
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
 * Count generic lines in script
 */
export const countGenericLines = (lines: string[], topic: string): number => {
  let count = 0;
  for (const line of lines) {
    if (hasGenericFillerPattern(line) || isSentenceTooGeneric(line, topic)) {
      count++;
    }
  }
  return count;
};

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
    reasons.push(`Script body must be 6-10 lines (${lines.length})`);
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
  if (
    VIDEO_BANNED_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase()))
  ) {
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
  if (hasEmDash(combined)) {
    reasons.push('Script contains em dash (banned)');
  }
  if (hasOverusedContentPattern(combined)) {
    reasons.push('Script contains overused/formulaic pattern');
  }
  if (hasTemplatePattern(combined)) {
    reasons.push(
      'Script uses generic template pattern (could work for any topic)',
    );
  }
  if (hasGenericFillerPattern(combined)) {
    reasons.push('Script contains generic filler sentences');
  }

  // Check how many lines are too generic
  const genericCount = countGenericLines(lines, topic);
  if (genericCount > 2) {
    reasons.push(
      `Too many generic lines (${genericCount}). Each sentence must be specific to ${topic}.`,
    );
  }

  // Check for motivational poster closings
  const lastLine = lines[lines.length - 1]?.toLowerCase() || '';
  if (
    /embrace|unlock|manifest|journey|growth awaits|step into|cosmic dance/i.test(
      lastLine,
    )
  ) {
    reasons.push('Script ends with motivational poster language');
  }

  // Check for "it's like" comparisons (overused)
  if (/it's like .+ is/i.test(combined)) {
    reasons.push('Script uses "it\'s like" comparison (overused)');
  }

  return reasons;
};
