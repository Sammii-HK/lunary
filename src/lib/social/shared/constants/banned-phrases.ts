/**
 * Banned phrases and patterns for content generation
 */

export const BANNED_PHRASES = [
  'distinct rhythm worth tracking',
  'most people misunderstand',
  'related focus points include',
  'matters because it adds context to timing and pattern',
  'explore in the grimoire',
  'example prompt',
  'visibility to',
];

export const VIDEO_BANNED_PHRASES = [
  'distinct rhythm worth tracking',
  'explore in the grimoire',
];

export const VIDEO_BANNED_PATTERNS = [/here is how .+ shows up in real life/i];

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
