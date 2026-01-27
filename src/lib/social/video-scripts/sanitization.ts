/**
 * Script sanitization utilities
 */

import { TRUNCATION_PATTERNS } from '../shared/text/truncation';
import { ensureSentenceEndsWithPunctuation } from '../shared/text/normalize';
import type { SanitizeScriptOptions } from './types';

/**
 * Sanitize video script lines
 */
export const sanitizeVideoScriptLines = (
  lines: string[],
  options: SanitizeScriptOptions & { allowTruncationFix?: boolean },
): string[] => {
  const buildFallbackLine = () => {
    const snippet = (options.sourceSnippet || '').trim();
    const fallback = (options.fallbackSource || '').trim();
    let candidate = snippet || fallback;
    if (!candidate) {
      candidate = `${options.topic} keeps attention on recurring timing`;
    }
    const lowerTopic = options.topic.toLowerCase();
    if (!candidate.toLowerCase().includes(lowerTopic)) {
      const normalized = candidate.replace(/^[A-Z]/, (c) => c.toLowerCase());
      candidate = `${options.topic} ${normalized}`;
    }
    return ensureSentenceEndsWithPunctuation(candidate.replace(/[.!?]+$/, ''));
  };

  const trimmedLines = lines.map((line) => line.trim()).filter(Boolean);
  const allowTruncationFix = options.allowTruncationFix !== false;
  return trimmedLines.map((line) => {
    const needsReplacement = TRUNCATION_PATTERNS.some((pattern) =>
      pattern.test(line.trim()),
    );
    if (!needsReplacement || !allowTruncationFix) {
      return ensureSentenceEndsWithPunctuation(line);
    }
    return buildFallbackLine();
  });
};

/**
 * Sanitize video script text
 */
export const sanitizeVideoScriptText = (
  text: string,
  options: SanitizeScriptOptions,
): string => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const sanitizedLines = sanitizeVideoScriptLines(lines, options);
  return sanitizedLines.join('\n');
};
