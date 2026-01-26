/**
 * Banned phrases and patterns for content generation
 */

export const BANNED_PHRASES = [
  // Legacy bans
  'distinct rhythm worth tracking',
  'most people misunderstand',
  'related focus points include',
  'matters because it adds context to timing and pattern',
  'explore in the grimoire',
  'example prompt',
  'visibility to',
  // Critical overused phrases - must never appear
  'gentle nudge',
  'cosmic wink',
  'cosmic thumbs-up',
  'cosmic thumbs up',
  'like the universe is',
  'whisper',
  'whispering',
  'perfect timing to',
  'curious to see where it leads',
  // Additional overused patterns
  'deepen your understanding',
  'deepen your practice',
  'journey of self-discovery',
  'cosmic dance',
  'step into',
  'unlock your',
  'manifest your',
  'your growth awaits',
  'embrace your',
  'Many believe',
  'can deepen your',
  // Template phrases that sound generic
  'patterns make sense once you start noticing them',
  'the key to',
  'the real power of',
  'the secret to',
];

export const VIDEO_BANNED_PHRASES = [
  'distinct rhythm worth tracking',
  'explore in the grimoire',
  'gentle nudge',
  'cosmic wink',
  'cosmic thumbs-up',
  'cosmic thumbs up',
  'like the universe is',
  'whisper',
  'whispering',
  'perfect timing to',
  'curious to see where it leads',
  'journey of self-discovery',
  'cosmic dance',
  'your growth awaits',
  'embrace your',
  'deepen your practice',
  'deepen your understanding',
  'step into your',
  'unlock your',
  'manifest your',
  // Template phrases
  'patterns make sense once you start noticing them',
  'the key to',
  'the real power of',
  'the secret to',
];

export const VIDEO_BANNED_PATTERNS = [
  // Original patterns
  /here is how .+ shows up in real life/i,
  // Overused opening patterns
  /ever notice .+\? it's .+\. in numerology/i,
  /seeing .+ lately\?/i,
  /spotting .+ lately\?/i,
  /noticed .+ lately\?/i,
  // Template patterns that could work for any topic
  /here is the clear meaning of .+ in practice/i,
  /look for .+ in the small,? repeatable details/i,
  /notice what shifts when you work with .+ intentionally/i,
  /here's how .+ actually works/i,
  /what makes .+ different is/i,
  /when .+ shows up,? pay attention to/i,
  /understanding .+ starts with/i,
  /working with .+ means/i,
  /here's what .+ really means/i,
  /the truth about .+ is/i,
];

export const OFF_DOMAIN_KEYWORDS = [
  'project',
  'management',
  'development',
  'productivity',
  'kpi',
  'agile',
  'roadmap',
  'stakeholder',
  'sprint',
  'okr',
];

export const hasOffDomainKeyword = (text: string): boolean =>
  OFF_DOMAIN_KEYWORDS.some((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(text),
  );

/**
 * Check if text contains any video banned pattern
 */
export const hasVideoBannedPattern = (text: string): boolean =>
  VIDEO_BANNED_PATTERNS.some((pattern) => pattern.test(text));

/**
 * Check if text contains any video banned phrase
 */
export const hasVideoBannedPhrase = (text: string): boolean => {
  const lower = text.toLowerCase();
  return VIDEO_BANNED_PHRASES.some((phrase) =>
    lower.includes(phrase.toLowerCase()),
  );
};
