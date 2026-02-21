/**
 * Validation utilities for social copy
 */

import {
  BANNED_PHRASES,
  hasOffDomainKeyword,
} from '../shared/constants/banned-phrases';
import { hasTruncation } from '../shared/text/truncation';
import { hasDeterministicLanguage } from '../shared/validation/deterministic-language';
import { countTopicMentions } from '../shared/text/normalize';
import type { SourcePack, VideoCaptionValidation } from './types';
import { QUESTION_STARTERS } from './constants';

/**
 * Patterns that indicate repetitive/formulaic content
 */
const OVERUSED_PATTERNS = [
  /ever notice .+\? it's .+\./i,
  /seeing .+ lately\?/i,
  /spotting .+ lately\?/i,
  /noticed .+ lately\?/i,
  /^in numerology,/i,
  /^many believe/i,
  /journey of self/i,
  /cosmic dance/i,
  /step into your/i,
  /unlock your/i,
  /manifest your/i,
  /embrace your/i,
];

/**
 * Check for overused opening patterns
 */
export function hasOverusedPattern(content: string): boolean {
  const lower = content.toLowerCase();
  return OVERUSED_PATTERNS.some((pattern) => pattern.test(lower));
}

/**
 * Check for em dashes (banned)
 */
export function hasEmDash(content: string): boolean {
  return content.includes('—') || content.includes('--');
}

/**
 * Validate social copy content
 */
export function validateSocialCopy(content: string, topic: string): string[] {
  const reasons: string[] = [];
  const lower = content.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      reasons.push(`Contains banned phrase: ${phrase}`);
    }
  }
  if (hasTruncation(content)) {
    reasons.push('Contains truncation');
  }
  if (hasOffDomainKeyword(content)) {
    reasons.push('Contains off-domain keywords');
  }
  if (hasDeterministicLanguage(content)) {
    reasons.push('Contains deterministic language');
  }
  if (countTopicMentions(content.slice(0, 200), topic) > 2) {
    reasons.push('Topic repeated too often');
  }
  if (content.includes('..') || /:\s*$/.test(content.trim())) {
    reasons.push('Trailing punctuation');
  }
  if (hasOverusedPattern(content)) {
    reasons.push('Contains overused/formulaic pattern');
  }
  if (hasEmDash(content)) {
    reasons.push('Contains em dash (banned)');
  }
  return reasons;
}

/**
 * Validate video caption response
 */
export const validateVideoCaptionResponse = (
  lines: string[],
  pack: SourcePack,
): VideoCaptionValidation => {
  const sanitizedLines = (lines || [])
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const issues: string[] = [];

  const maxLines = pack.platform === 'tiktok' ? 3 : 4;
  if (sanitizedLines.length < 2) {
    issues.push('Need at least 2 caption lines after the search phrase');
  }
  if (sanitizedLines.length > maxLines) {
    issues.push(
      `Use no more than ${maxLines} caption lines after the search phrase`,
    );
  }

  sanitizedLines.forEach((line) => {
    const lower = line.toLowerCase();
    if (hasTruncation(line)) {
      issues.push('Caption line appears truncated');
    }
    if (hasOffDomainKeyword(line)) {
      issues.push('Caption line contains off-domain keywords');
    }
    if (hasDeterministicLanguage(line)) {
      issues.push('Caption line uses deterministic language');
    }
    if (
      !pack.allowJournaling &&
      /\b(journal|journalling|affirm)\b/i.test(lower)
    ) {
      issues.push('Avoid journalling or affirmation language');
    }
    for (const phrase of BANNED_PHRASES) {
      if (lower.includes(phrase.toLowerCase())) {
        issues.push(`Line includes banned phrase: ${phrase}`);
        break;
      }
    }
    if (hasEmDash(line)) {
      issues.push('Caption line contains em dash (banned)');
    }
  });

  const combined = sanitizedLines.join(' ');
  if (hasOverusedPattern(combined)) {
    issues.push('Caption contains overused/formulaic pattern');
  }

  return {
    issues,
    lines: sanitizedLines,
  };
};

/**
 * Check if line is a question
 */
export const isQuestionLine = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed.endsWith('?')) return false;
  const lower = trimmed.toLowerCase();
  return QUESTION_STARTERS.some((starter) =>
    new RegExp(`^${starter}\\b`).test(lower),
  );
};

/**
 * Normalize question content into lines
 */
export const normalizeQuestionLines = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Check if text has Grimoire mention
 */
export const hasGrimoireMention = (text: string): boolean =>
  /\bgrimoire\b/i.test(text);

/**
 * Check for inline CTA
 */
export const hasInlineCTA = (line: string): boolean =>
  /\b(save|share|comment|follow|bookmark|read more|explore|learn more)\b/i.test(
    line,
  );
