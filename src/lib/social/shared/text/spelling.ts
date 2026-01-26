/**
 * UK spelling normalization utilities
 */

/**
 * US to UK spelling replacement patterns
 */
export const UK_SPELLING_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bcolor\b/gi, 'colour'],
  [/\bcolors\b/gi, 'colours'],
  [/\bfavor\b/gi, 'favour'],
  [/\bfavors\b/gi, 'favours'],
  [/\bhonor\b/gi, 'honour'],
  [/\bhonors\b/gi, 'honours'],
  [/\bcenter\b/gi, 'centre'],
  [/\bcenters\b/gi, 'centres'],
  [/\banalyze\b/gi, 'analyse'],
  [/\banalyzes\b/gi, 'analyses'],
  [/\borganize\b/gi, 'organise'],
  [/\borganizes\b/gi, 'organises'],
  [/\bpersonalize\b/gi, 'personalise'],
  [/\bpersonalizes\b/gi, 'personalises'],
  [/\brealize\b/gi, 'realise'],
  [/\brealizes\b/gi, 'realises'],
  [/\brecognize\b/gi, 'recognise'],
  [/\brecognizes\b/gi, 'recognises'],
];

/**
 * Convert US spelling to UK spelling while preserving case
 */
export const normaliseUkSpelling = (text: string): string => {
  return UK_SPELLING_REPLACEMENTS.reduce((acc, [pattern, replacement]) => {
    return acc.replace(pattern, (match) => {
      if (match.toUpperCase() === match) {
        return replacement.toUpperCase();
      }
      if (match[0] && match[0] === match[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }, text);
};
