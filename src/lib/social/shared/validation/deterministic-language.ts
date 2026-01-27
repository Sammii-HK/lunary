/**
 * Deterministic language detection and softening
 */

export const DETERMINISTIC_WORDS = ['controls', 'always', 'guarantees'];

/**
 * Check if text contains deterministic language
 */
export const hasDeterministicLanguage = (text: string): boolean => {
  const lower = text.toLowerCase();
  return DETERMINISTIC_WORDS.some((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(lower),
  );
};

/**
 * Soften deterministic language in text
 */
export const softenDeterministicLanguage = (text: string): string =>
  text
    .replace(/\bcontrols\b/gi, 'can influence')
    .replace(/\balways\b/gi, 'often')
    .replace(/\bguarantees\b/gi, 'can support');

/**
 * Textbook-style patterns to avoid
 */
export const TEXTBOOK_PATTERNS = [/\bis defined as\b/i, /\brefers to\b/i];

/**
 * Check if text sounds too textbook-like
 */
export const hasTextbookLanguage = (text: string): boolean =>
  TEXTBOOK_PATTERNS.some((pattern) => pattern.test(text));
