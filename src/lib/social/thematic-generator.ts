/**
 * Thematic Content Generator
 *
 * Generates long-form and short-form educational content from weekly themes.
 * Uses real Grimoire data - no AI generation for the core content.
 */

import {
  type WeeklyTheme,
  type SabbatTheme,
  type DailyFacet,
  generateHashtags,
  getWeeklyContentPlan,
  categoryThemes,
} from './weekly-themes';
import {
  searchGrimoireForTopic,
  getGrimoireSnippetBySlug,
} from './grimoire-content';
import {
  generatePersonaPost,
  generateQuestionPost,
  generateClosingPost,
  generateEducationalCta,
} from './microcopy-ai';
import {
  normalizeHashtagsForPlatform,
  selectHashtagsForPostType,
  SocialPostType,
} from './social-copy-generator';
import { normalizeGeneratedContent } from './content-normalizer';

// Shared utilities
import { sentenceSafe, normalise, matchesTopic } from './shared/text/normalize';
import {
  splitSentencesPreservingDecimals,
  hasTruncationArtifact,
} from './shared/text/truncation';
import { normaliseUkSpelling } from './shared/text/spelling';
import { formatList } from './shared/text/formatting';
import { PLATFORM_HASHTAG_CONFIG } from './shared/constants/platform-hashtag-config';
import {
  PERSONA_VOCAB,
  PERSONA_BODY_TEMPLATES,
  QUESTION_POOL,
  CLOSING_STATEMENTS,
  getThreadsQuestion,
  getDearStyleBetaPost,
  getConversationalDeepDive,
} from './shared/constants/persona-templates';
import { THREADS_POST_HOURS } from '@/utils/posting-times';
import { isAllowedSlugForCategory } from './shared/constants/category-slugs';

// Import data sources
import zodiacSigns from '@/data/zodiac-signs.json';
import tarotCards from '@/data/tarot-cards.json';
import crystals from '@/data/crystals.json';
import numerology from '@/data/numerology.json';
import chakras from '@/data/chakras.json';
import sabbats from '@/data/sabbats.json';
import planetaryBodies from '@/data/planetary-bodies.json';
import correspondences from '@/data/correspondences.json';

export interface ThematicContent {
  longForm: string;
  shortForm: string;
  hashtags: {
    domain: string;
    topic: string;
    brand: string;
  };
  theme: WeeklyTheme | SabbatTheme;
  facet: DailyFacet;
  date: Date;
}

export interface LongFormContent {
  title: string;
  body: string;
  attribution: string;
}

export interface VideoScriptContext {
  intro?: string;
  overview?: string;
  foundations?: string;
  deeperMeaning?: string;
  practical?: string;
  summary?: string;
  themeName: string;
  facetTitles: string[];
}

// Constants are now imported from shared/constants

const buildQuestionPost = (topic: string, data: Record<string, any> | null) => {
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  const options = keywords.filter(Boolean).slice(0, 3);
  if (options.length >= 3) {
    return `When it comes to ${topic}, what do you notice most: ${options[0]}, ${options[1]}, or ${options[2]}?`;
  }
  return `What's your biggest question about ${topic}?`;
};

type ShortFormOverride = {
  dayOffset: number;
  postType: 'persona' | 'question' | 'closing_statement';
  seed: number;
  personaList?: string[];
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Helper functions are now imported from shared/text/*
// Using: splitSentencesPreservingDecimals, sentenceSafe, formatList, normaliseUkSpelling

const normalizeLunarNodesText = (text: string) =>
  text.replace(
    /what is lunar nodes(\?|!|\.|$)/gi,
    'what are the Lunar Nodes$1',
  );

const adjustMoonCapitalization = (text: string) =>
  text
    .replace(/moon phases of the Moon/gi, 'moon phases')
    .replace(/moon phases of the moon/gi, 'moon phases')
    .replace(/the moon/gi, 'the Moon')
    .replace(/moon of the Moon/gi, 'Moon')
    .replace(/moon of the moon/gi, 'Moon');

const applyShortFormNormalizations = (text: string, category?: string) => {
  const normalized = text.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim();
  const uk = normaliseUkSpelling(normalized);
  if (category === 'lunar') {
    return adjustMoonCapitalization(normalizeLunarNodesText(uk));
  }
  return uk;
};

const cleanShortForm = (text: string, category?: string) =>
  applyShortFormNormalizations(text, category);

const trimToLimit = (text: string, maxChars: number) => {
  if (text.length <= maxChars) return text;
  const snippet = text.slice(0, Math.max(0, maxChars - 3)).trim();
  const lastSpace = snippet.lastIndexOf(' ');
  if (lastSpace > 0) {
    return `${snippet.slice(0, lastSpace).trim()}...`;
  }
  return `${snippet}...`;
};

const trimShortFormForPlatform = (text: string, platform: string) => {
  const limits: Record<string, number> = {
    twitter: 280,
    threads: 450,
    bluesky: 300,
  };
  const limit = limits[platform] || 450;
  return trimToLimit(text, limit);
};

// TRUNCATION_PATTERNS and hasTruncationArtifact are now imported from shared/text/truncation

const getTopicFallbackDefinition = (topic: string) => {
  const key = topic.trim().toLowerCase();
  if (!topic.trim()) {
    return 'describes a timing marker that helps track cycles over time';
  }
  return `${topic.trim()} highlights how timing and attention cycle through experience`;
};

const isCompleteSentence = (text: string) => {
  if (!text) return false;
  const trimmed = text.trim();
  if (!/[.!?]$/.test(trimmed)) return false;
  return !hasTruncationArtifact(trimmed);
};

const sanitizeSnippet = (text: string | undefined, fallback: string) => {
  const source = String(text || '').trim();
  if (!source) return fallback;
  const sentences = splitSentencesPreservingDecimals(source);
  for (const sentence of sentences) {
    if (isCompleteSentence(sentence)) {
      return sentence;
    }
  }
  if (isCompleteSentence(source)) return source;
  return fallback;
};

const formatTopicLabel = (topic: string) => {
  const trimmed = topic.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('the ') ||
    lower.startsWith('a ') ||
    lower.startsWith('an ')
  ) {
    return trimmed;
  }
  return `The ${trimmed}`;
};

const buildDefinitionSentence = (
  topic: string,
  sourceSnippet: string,
): string => {
  const safeSnippet = sourceSnippet.replace(/[.!?]+$/, '').trim();
  if (!safeSnippet) {
    return `${formatTopicLabel(topic)} ${getTopicFallbackDefinition(topic)}.`;
  }
  if (safeSnippet.toLowerCase().includes(topic.toLowerCase())) {
    return sentenceSafe(safeSnippet);
  }
  return sentenceSafe(`${formatTopicLabel(topic)} is ${safeSnippet}`);
};

const buildPracticalSentence = (
  topic: string,
  data: Record<string, any> | null,
): string => {
  if (Array.isArray(data?.magicalUses) && data.magicalUses.length > 0) {
    return sentenceSafe(
      `${topic} is often used for ${formatList(data.magicalUses, 2)}`,
    );
  }
  if (
    Array.isArray(data?.healingPractices) &&
    data.healingPractices.length > 0
  ) {
    return sentenceSafe(
      `People work with ${topic} through ${formatList(
        data.healingPractices,
        2,
      )}`,
    );
  }
  if (Array.isArray(data?.traditions) && data.traditions.length > 0) {
    return sentenceSafe(
      `${topic} is often marked by ${formatList(data.traditions, 2)}`,
    );
  }
  if (data?.houseMeaning) {
    return sentenceSafe(String(data.houseMeaning));
  }
  if (data?.transitEffect) {
    return sentenceSafe(String(data.transitEffect));
  }
  if (data?.element || data?.modality) {
    const parts = [data.element, data.modality].filter(Boolean).join(' and ');
    if (parts) {
      return sentenceSafe(`${topic} works through ${parts}`);
    }
  }
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  if (keywords.length > 0) {
    return sentenceSafe(`${topic} often relates to ${formatList(keywords, 2)}`);
  }
  return sentenceSafe(`${topic} adds practical context to daily timing`);
};

const prefixSentenceWithTopic = (topic: string, sentence: string) => {
  const trimmed = sentence.trim();
  if (!trimmed) return '';
  if (trimmed.toLowerCase().includes(topic.toLowerCase())) {
    return sentenceSafe(trimmed);
  }
  if (/^it\s/i.test(trimmed)) {
    return sentenceSafe(
      trimmed.replace(/^it\s/i, `${formatTopicLabel(topic)} `),
    );
  }
  return sentenceSafe(
    `${formatTopicLabel(topic)} ${trimmed.replace(/^[A-Z]/, (c) => c.toLowerCase())}`,
  );
};

const buildMechanicsSentence = (
  topic: string,
  data: Record<string, any> | null,
): string => {
  if (data?.element && data?.modality) {
    return sentenceSafe(
      `${topic} works through the ${data.element} element and ${data.modality} modality`,
    );
  }
  if (data?.element) {
    return sentenceSafe(`${topic} is linked to the ${data.element} element`);
  }
  if (data?.modality) {
    return sentenceSafe(`${topic} moves through ${data.modality} modality`);
  }
  if (Array.isArray(data?.rules) && data.rules.length > 0) {
    return sentenceSafe(
      `${topic} is associated with ${formatList(data.rules, 2)}`,
    );
  }
  if (data?.rulingPlanet || data?.ruler) {
    return sentenceSafe(
      `${topic} is associated with ${(data.rulingPlanet || data.ruler).toString()}`,
    );
  }
  if (data?.houseMeaning) {
    return sentenceSafe(String(data.houseMeaning));
  }
  if (data?.transitEffect) {
    return sentenceSafe(String(data.transitEffect));
  }
  return sentenceSafe(`${topic} has a role within wider cycles`);
};

const buildUseSentence = (
  topic: string,
  data: Record<string, any> | null,
): string => {
  if (Array.isArray(data?.magicalUses) && data.magicalUses.length > 0) {
    return sentenceSafe(
      `Try working with ${topic} for ${formatList(data.magicalUses, 2)}`,
    );
  }
  if (
    Array.isArray(data?.healingPractices) &&
    data.healingPractices.length > 0
  ) {
    return sentenceSafe(
      `A simple way to use ${topic} is ${formatList(data.healingPractices, 2)}`,
    );
  }
  if (Array.isArray(data?.traditions) && data.traditions.length > 0) {
    return sentenceSafe(
      `A practical example is ${formatList(data.traditions, 2)}`,
    );
  }
  return sentenceSafe(`Try noting how ${topic} shows up this week`);
};

const buildStandaloneEducationalCopy = ({
  topic,
  data,
  detail,
  sourceSnippet,
  mode,
  category,
  deepKind,
}: {
  topic: string;
  data: Record<string, any> | null;
  detail?: string;
  sourceSnippet: string;
  mode: 'intro' | 'deep';
  category?: string;
  deepKind?: 'mechanics' | 'use';
}) => {
  const definitionSentence = buildDefinitionSentence(topic, sourceSnippet);
  const practicalSentence = buildPracticalSentence(topic, data);
  const detailSentence = detail
    ? sanitizeSnippet(detail, '')
    : sanitizeSnippet(sourceSnippet, '');
  const sentences =
    mode === 'intro'
      ? [definitionSentence, practicalSentence]
      : [
          prefixSentenceWithTopic(
            topic,
            detailSentence || sanitizeSnippet(sourceSnippet, ''),
          ),
          deepKind === 'use'
            ? buildUseSentence(topic, data)
            : buildMechanicsSentence(topic, data),
        ];
  return cleanShortForm(sentences.filter(Boolean).join(' '), category);
};

const enforceContentSafety = ({
  text,
  category,
  topic,
  mode,
  detail,
}: {
  text: string;
  category: string;
  topic: string;
  mode: 'intro' | 'deep';
  detail?: string;
}) => {
  let safe = text;
  const bannedPhrases = [
    'is the focus here',
    'matters because it adds context to timing and pattern',
    'related focus points include',
  ];
  if (hasTruncationArtifact(safe)) {
    safe = buildStandaloneEducationalCopy({
      topic,
      data: null,
      detail: undefined,
      sourceSnippet: '',
      mode,
      category,
    });
  }
  if (bannedPhrases.some((phrase) => safe.toLowerCase().includes(phrase))) {
    safe = buildStandaloneEducationalCopy({
      topic,
      data: null,
      detail: undefined,
      sourceSnippet: '',
      mode,
      category,
    });
  }
  return safe;
};

const getInlineHashtags = (
  platform: string,
  hashtags?: { domain: string; topic: string; brand: string },
): string[] => {
  if (!hashtags) return [];
  if (platform === 'threads') {
    return [hashtags.domain, hashtags.topic, hashtags.brand].slice(0, 2);
  }
  if (platform === 'bluesky') {
    return [hashtags.topic].filter(Boolean).slice(0, 1);
  }
  return [];
};

// isAllowedSlugForCategory is now imported from shared/constants/category-slugs

type SourceInfo = {
  sourceType: 'grimoire' | 'fallback';
  sourceId: string;
  sourceTitle: string;
  sourceSnippet: string;
  data: Record<string, any> | null;
};

const normalizeTopicKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// matchesTopic is now imported from shared/text/normalize

const splitSentencesPreservingDecimalsForHook = (text?: string) => {
  if (!text) return [];
  return (
    text
      .replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2')
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((sentence) => sentence.replace(/<DECIMAL>/g, '.').trim())
      .filter(Boolean) || []
  );
};

const buildHookSentenceFromSource = (source?: string, topic?: string) => {
  if (!source) return null;
  const sentences = splitSentencesPreservingDecimalsForHook(source);
  for (const sentence of sentences) {
    if (!sentence) continue;
    if (hasTruncationArtifact(sentence)) continue;
    if (sentence.endsWith(':')) continue;
    if (
      topic &&
      !sentence.toLowerCase().includes(topic.toLowerCase()) &&
      sentence.length < 40
    ) {
      continue;
    }
    return sentenceSafe(sentence);
  }
  return null;
};

export const buildVideoHook = (facet: DailyFacet) => {
  const topic = facet.title;
  const sourceCandidate =
    buildHookSentenceFromSource(facet.shortFormHook, topic) ||
    buildHookSentenceFromSource(facet.focus, topic);
  if (sourceCandidate) {
    return sourceCandidate;
  }
  return `If you’ve heard of ${topic}, here’s what to know.`;
};

export const resolveSourceForFacet = (
  facet: DailyFacet,
  category: string,
): SourceInfo => {
  const rawSlug = facet.grimoireSlug;
  const normalizedSlug = rawSlug.includes('#')
    ? rawSlug.replace('#', '/')
    : rawSlug;
  const allowedSlug = isAllowedSlugForCategory(category, normalizedSlug);
  const fallbackSnippet = facet.focus || facet.shortFormHook || facet.title;

  const trySnippets: Array<{ snippet: any; slug: string }> = [];
  if (allowedSlug) {
    const direct = getGrimoireSnippetBySlug(normalizedSlug);
    if (direct) {
      trySnippets.push({ snippet: direct, slug: direct.slug });
    }
  }

  if (trySnippets.length === 0) {
    const searched = searchGrimoireForTopic(facet.title, 3);
    for (const snippet of searched) {
      if (!isAllowedSlugForCategory(category, snippet.slug)) continue;
      trySnippets.push({ snippet, slug: snippet.slug });
    }
  }

  const matched = trySnippets.find((candidate) =>
    matchesTopic(candidate.snippet.title || '', facet.title),
  );
  if (matched) {
    const sourceSnippet =
      matched.snippet.summary ||
      matched.snippet.fullContent?.description ||
      matched.snippet.title ||
      fallbackSnippet;
    return {
      sourceType: 'grimoire',
      sourceId: matched.slug || normalizedSlug,
      sourceTitle: matched.snippet.title || facet.title,
      sourceSnippet,
      data: getSafeGrimoireData(facet, category),
    };
  }

  return {
    sourceType: 'fallback',
    sourceId: normalizedSlug,
    sourceTitle: facet.title,
    sourceSnippet: fallbackSnippet,
    data: null,
  };
};

const getSafeGrimoireData = (
  facet: DailyFacet,
  category: string,
): Record<string, any> | null => {
  if (!isAllowedSlugForCategory(category, facet.grimoireSlug)) {
    return null;
  }
  const data = getGrimoireDataForFacet(facet);
  if (!data) return null;
  if (category === 'lunar') {
    const tarotKeys = [
      'arcana',
      'suit',
      'cardNumber',
      'court',
      'uprightMeaning',
      'reversedMeaning',
    ];
    const hasTarotFields = tarotKeys.some((key) => key in data);
    if (hasTarotFields) return null;
  }
  return data;
};

const containsForbiddenKeywords = (_text: string, _category: string) => false;

const applyPlatformFormatting = (
  text: string,
  platform: string,
  hashtags?: { domain: string; topic: string; brand: string },
) => {
  const tags = getInlineHashtags(platform, hashtags);
  const limits: Record<string, number> = {
    twitter: 280,
    threads: 450,
    bluesky: 350,
  };
  const limit = limits[platform] || 450;
  const tagText = tags.length > 0 ? tags.join(' ') : '';
  const reserved = tagText ? tagText.length + 1 : 0;
  const bodyLimit = Math.max(80, limit - reserved);
  const trimmedBody = trimToLimit(text, bodyLimit);
  return tagText ? `${trimmedBody} ${tagText}` : trimmedBody;
};

const buildKeywordSentence = (data: Record<string, any> | null) => {
  if (!data) return '';
  const keywords: string[] = [];
  if (Array.isArray(data.keywords)) {
    keywords.push(...data.keywords);
  }
  if (Array.isArray(data.rules)) {
    keywords.push(...data.rules);
  }
  if (data.element) keywords.push(data.element);
  if (data.modality) keywords.push(data.modality);
  if (data.planet) keywords.push(data.planet);
  if (data.rulingPlanet) keywords.push(data.rulingPlanet);
  if (data.ruler) keywords.push(data.ruler);

  const unique = Array.from(
    new Map(
      keywords.filter(Boolean).map((item) => [String(item), String(item)]),
    ).values(),
  );
  const trimmed = unique.slice(0, 4);
  if (trimmed.length === 0) return '';
  return `Common keywords: ${formatList(trimmed, 4)}.`;
};

const addDiscoveryKeywords = (
  text: string,
  data: Record<string, any> | null,
  category?: string,
) => {
  const keywordSentence = buildKeywordSentence(data);
  if (!keywordSentence) return text;
  const lowerText = text.toLowerCase();
  const keywords = keywordSentence
    .replace(/^Common keywords:\s+/i, '')
    .replace(/\.$/, '')
    .split(',')
    .map((item) => item.replace(/\band\b/i, '').trim())
    .filter(Boolean);
  const hasKeyword = keywords.some((keyword) =>
    lowerText.includes(keyword.toLowerCase()),
  );
  if (hasKeyword) return text;
  return cleanShortForm(`${text} ${keywordSentence}`, category);
};

const buildIntroShortForm = (
  facet: DailyFacet,
  data: Record<string, any> | null,
  category?: string,
) => {
  const source =
    data?.description ||
    data?.mysticalProperties ||
    data?.information ||
    data?.meaning ||
    data?.properties ||
    facet.focus ||
    facet.shortFormHook ||
    facet.title;
  const sentences = splitSentencesPreservingDecimals(String(source));
  const intro = sentences.slice(0, 2).map(sentenceSafe).join(' ');
  return cleanShortForm(intro, category);
};

const buildDeepShortForm = (
  facet: DailyFacet,
  data: Record<string, any> | null,
  category?: string,
) => {
  const sentences: string[] = [];
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  if (keywords.length > 0) {
    sentences.push(`Common keywords: ${formatList(keywords, 3)}.`);
  }
  if (data?.mysticalProperties) {
    sentences.push(sentenceSafe(String(data.mysticalProperties)));
  } else if (data?.metaphysicalProperties) {
    sentences.push(sentenceSafe(String(data.metaphysicalProperties)));
  }
  if (data?.element && data?.modality) {
    sentences.push(
      `Its element is ${data.element} and its modality is ${data.modality}.`,
    );
  } else if (data?.element) {
    sentences.push(`Its element is ${data.element}.`);
  } else if (data?.modality) {
    sentences.push(`Its modality is ${data.modality}.`);
  }
  if (Array.isArray(data?.rules) && data.rules.length > 0) {
    sentences.push(`It rules ${formatList(data.rules, 3)}.`);
  } else if (data?.rulingPlanet || data?.ruler) {
    sentences.push(`Its ruling planet is ${data.rulingPlanet || data.ruler}.`);
  }
  if (data?.exalted || data?.detriment || data?.fall) {
    const parts = [
      data?.exalted ? `exalted in ${data.exalted}` : null,
      data?.detriment ? `in detriment in ${data.detriment}` : null,
      data?.fall ? `in fall in ${data.fall}` : null,
    ].filter(Boolean);
    if (parts.length > 0) {
      sentences.push(`It is ${parts.join(', ')}.`);
    }
  }
  if (data?.houseMeaning) {
    sentences.push(sentenceSafe(String(data.houseMeaning)));
  } else if (data?.transitEffect) {
    sentences.push(sentenceSafe(String(data.transitEffect)));
  }
  if (Array.isArray(data?.magicalUses) && data.magicalUses.length > 0) {
    sentences.push(
      `In magical practice, it is used for ${formatList(data.magicalUses, 3)}.`,
    );
  } else if (
    Array.isArray(data?.healingPractices) &&
    data.healingPractices.length > 0
  ) {
    sentences.push(
      `Practices include ${formatList(data.healingPractices, 3)}.`,
    );
  } else if (Array.isArray(data?.traditions) && data.traditions.length > 0) {
    sentences.push(
      `Traditional observances include ${formatList(data.traditions, 3)}.`,
    );
  }

  if (sentences.length === 0) {
    const fallback =
      facet.focus ||
      facet.shortFormHook ||
      facet.title ||
      'Astrological insight.';
    sentences.push(sentenceSafe(fallback));
  }

  const core = sentences.slice(0, 2).join(' ');
  const expanded =
    sentences.length < 2 && facet.focus
      ? `${core} ${sentenceSafe(facet.focus)}`
      : core;
  return cleanShortForm(expanded, category);
};

type DeepDiveCandidate = { kind: string; text: string };

const buildDeepDiveShortForms = (
  facet: DailyFacet,
  data: Record<string, any> | null,
  category?: string,
): DeepDiveCandidate[] => {
  const deepDives: DeepDiveCandidate[] = [];
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];

  const structureSentences: string[] = [];
  if (data?.element && data?.modality) {
    structureSentences.push(
      `It sits in the ${data.element} element and the ${data.modality} modality, describing how its energy moves.`,
    );
  } else if (data?.element) {
    structureSentences.push(`It belongs to the ${data.element} element.`);
  } else if (data?.modality) {
    structureSentences.push(`Its modality is ${data.modality}.`);
  }
  if (Array.isArray(data?.rules) && data.rules.length > 0) {
    structureSentences.push(`It rules ${formatList(data.rules, 3)}.`);
  } else if (data?.rulingPlanet || data?.ruler) {
    structureSentences.push(
      `Its ruling planet is ${data.rulingPlanet || data.ruler}.`,
    );
  }
  if (data?.exalted || data?.detriment || data?.fall) {
    const parts = [
      data?.exalted ? `exalted in ${data.exalted}` : null,
      data?.detriment ? `in detriment in ${data.detriment}` : null,
      data?.fall ? `in fall in ${data.fall}` : null,
    ].filter(Boolean);
    if (parts.length > 0) {
      structureSentences.push(`It is ${parts.join(', ')}.`);
    }
  }
  if (structureSentences.length > 0) {
    deepDives.push({
      kind: 'structure',
      text: cleanShortForm(structureSentences.slice(0, 2).join(' '), category),
    });
  }

  const meaningSentences: string[] = [];
  if (data?.houseMeaning) {
    meaningSentences.push(sentenceSafe(String(data.houseMeaning)));
  }
  if (data?.transitEffect) {
    meaningSentences.push(sentenceSafe(String(data.transitEffect)));
  }
  if (!meaningSentences.length && data?.uprightMeaning) {
    meaningSentences.push(
      `When expressed clearly, ${data.uprightMeaning.replace(/^[A-Z]/, (c: string) => c.toLowerCase())}`,
    );
  }
  if (!meaningSentences.length && data?.spiritualMeaning) {
    meaningSentences.push(sentenceSafe(String(data.spiritualMeaning)));
  }
  if (!meaningSentences.length && data?.mysticalProperties) {
    meaningSentences.push(sentenceSafe(String(data.mysticalProperties)));
  }
  if (meaningSentences.length > 0) {
    deepDives.push({
      kind: 'meaning',
      text: cleanShortForm(meaningSentences.slice(0, 2).join(' '), category),
    });
  }

  const practiceSentences: string[] = [];
  if (Array.isArray(data?.magicalUses) && data.magicalUses.length > 0) {
    practiceSentences.push(
      `In magical practice, it is used for ${formatList(data.magicalUses, 3)}.`,
    );
  }
  if (
    Array.isArray(data?.healingPractices) &&
    data.healingPractices.length > 0
  ) {
    practiceSentences.push(
      `Practices include ${formatList(data.healingPractices, 3)}.`,
    );
  }
  if (Array.isArray(data?.traditions) && data.traditions.length > 0) {
    practiceSentences.push(
      `Traditional observances include ${formatList(data.traditions, 3)}.`,
    );
  }
  if (Array.isArray(data?.colors) && data.colors.length > 0) {
    practiceSentences.push(
      `Correspondences often include colours like ${formatList(data.colors, 3)}.`,
    );
  }
  if (Array.isArray(data?.herbs) && data.herbs.length > 0) {
    practiceSentences.push(
      `Herbal allies often include ${formatList(data.herbs, 3)}.`,
    );
  }
  if (practiceSentences.length > 0) {
    deepDives.push({
      kind: 'practice',
      text: cleanShortForm(practiceSentences.slice(0, 2).join(' '), category),
    });
  }

  if (keywords.length > 0) {
    const keywordSentence = cleanShortForm(
      `Common keywords: ${formatList(keywords, 3)}.`,
      category,
    );
    if (keywordSentence) {
      deepDives.push({ kind: 'keywords', text: keywordSentence });
    }
  }

  const fallbackSentence =
    facet.focus ||
    facet.shortFormHook ||
    facet.title ||
    'Astrological insight.';
  if (deepDives.length === 0) {
    deepDives.push({
      kind: 'fallback',
      text: cleanShortForm(sentenceSafe(fallbackSentence), category),
    });
  }

  return deepDives;
};

// normalise is now replaced with normalise from shared/text/normalize

const isTooSimilar = (a: string, b: string) => {
  const aNorm = normalise(a);
  const bNorm = normalise(b);
  if (!aNorm || !bNorm) return false;
  if (aNorm === bNorm) return true;
  if (aNorm.startsWith(bNorm) || bNorm.startsWith(aNorm)) return true;
  const aWords = new Set(aNorm.split(' ').filter(Boolean));
  const bWords = new Set(bNorm.split(' ').filter(Boolean));
  if (aWords.size < 6 || bWords.size < 6) return false;
  let overlap = 0;
  for (const word of aWords) {
    if (bWords.has(word)) overlap += 1;
  }
  const ratio = overlap / Math.min(aWords.size, bWords.size);
  return ratio >= 0.75;
};

const bigramOverlapRatio = (a: string, b: string) => {
  const aNorm = normalise(a);
  const bNorm = normalise(b);
  const aWords = aNorm.split(' ').filter(Boolean);
  const bWords = bNorm.split(' ').filter(Boolean);
  if (aWords.length < 2 || bWords.length < 2) return 0;
  const aBigrams = new Set(
    aWords.slice(0, -1).map((_, idx) => `${aWords[idx]} ${aWords[idx + 1]}`),
  );
  const bBigrams = new Set(
    bWords.slice(0, -1).map((_, idx) => `${bWords[idx]} ${bWords[idx + 1]}`),
  );
  let overlap = 0;
  for (const bigram of aBigrams) {
    if (bBigrams.has(bigram)) overlap += 1;
  }
  return overlap / Math.max(aBigrams.size, bBigrams.size);
};

const selectUniqueDeepDives = (
  candidates: DeepDiveCandidate[],
  intro: string,
  count: number,
): string[] => {
  const picks: DeepDiveCandidate[] = [];
  const usedKinds = new Set<string>();
  const filtered = candidates.filter(
    (candidate) =>
      candidate.text &&
      !hasTruncationArtifact(candidate.text) &&
      !isTooSimilar(candidate.text, intro),
  );

  for (const candidate of filtered) {
    if (picks.length >= count) break;
    if (usedKinds.has(candidate.kind)) continue;
    if (picks.some((pick) => isTooSimilar(pick.text, candidate.text))) continue;
    picks.push(candidate);
    usedKinds.add(candidate.kind);
  }

  if (picks.length < count) {
    for (const candidate of filtered) {
      if (picks.length >= count) break;
      if (picks.some((pick) => isTooSimilar(pick.text, candidate.text)))
        continue;
      picks.push(candidate);
    }
  }

  return picks.map((pick) => pick.text);
};

const pickDeepDiveCandidate = (
  candidates: DeepDiveCandidate[],
  preferredKinds: string[],
  usedTexts: string[],
): DeepDiveCandidate | null => {
  const filtered = candidates.filter(
    (candidate) =>
      candidate.text &&
      !hasTruncationArtifact(candidate.text) &&
      !usedTexts.some((used) => isTooSimilar(used, candidate.text)),
  );
  for (const kind of preferredKinds) {
    const match = filtered.find((candidate) => candidate.kind === kind);
    if (match) return match;
  }
  return filtered[0] || null;
};

const buildFallbackDeepDive = (
  facet: DailyFacet,
  data: Record<string, any> | null,
  category?: string,
): string => {
  const topic = facet.title;
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  if (keywords.length > 0) {
    return cleanShortForm(
      `${topic} often links to ${formatList(keywords, 2)} in practice.`,
      category,
    );
  }
  if (data?.element) {
    return cleanShortForm(
      `${topic} is commonly associated with the ${data.element} element and its tone.`,
      category,
    );
  }
  if (Array.isArray(data?.rules) && data.rules.length > 0) {
    return cleanShortForm(
      `${topic} connects with ${formatList(data.rules, 2)} in astrological practice.`,
      category,
    );
  }
  return cleanShortForm(
    sentenceSafe(facet.focus || facet.shortFormHook || topic),
    category,
  );
};

const createSeededRng = (seed: number) => () => {
  let nextSeed = seed >>> 0;
  nextSeed = (nextSeed * 1664525 + 1013904223) % 4294967296;
  seed = nextSeed;
  return nextSeed / 4294967296;
};

const seededShuffle = <T>(values: T[], seed: number) => {
  const rng = createSeededRng(seed);
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildShortFormOverrides = (weekStartDate: Date): ShortFormOverride[] => {
  const weekKey = weekStartDate.toISOString().split('T')[0];
  const seed = hashString(weekKey);
  const closingDayOffset = 6;
  const dayPool = [0, 1, 2, 3, 4, 5];
  const [personaDayOffset, questionDayOffset] = seededShuffle(dayPool, seed);
  const personaCount = seed % 2 === 0 ? 3 : 4;
  const personaList = seededShuffle(PERSONA_VOCAB, seed).slice(0, personaCount);
  return [
    {
      dayOffset: personaDayOffset,
      postType: 'persona',
      seed,
      personaList,
    },
    {
      dayOffset: questionDayOffset,
      postType: 'question',
      seed: seed + 1,
    },
    {
      dayOffset: closingDayOffset,
      postType: 'closing_statement',
      seed: seed + 2,
    },
  ];
};

/**
 * Get rich content data for a facet from Grimoire sources
 */
function getGrimoireDataForFacet(
  facet: DailyFacet,
): Record<string, any> | null {
  const slug = facet.grimoireSlug;
  const normalizedSlug = slug.includes('#') ? slug.replace('#', '/') : slug;

  if (slug.includes('birth-chart/houses')) {
    const housesSnippet =
      getGrimoireSnippetBySlug('houses') ||
      getGrimoireSnippetBySlug('birth-chart/houses');
    if (housesSnippet) {
      const fullContent = housesSnippet.fullContent || {};
      return {
        ...fullContent,
        description: fullContent.description || housesSnippet.summary,
        title: housesSnippet.title,
        keywords: fullContent.keywords || housesSnippet.keyPoints,
      };
    }
  }

  const exactSnippet =
    getGrimoireSnippetBySlug(normalizedSlug) ||
    getGrimoireSnippetBySlug(slug.split('#')[0]);
  if (exactSnippet) {
    const fullContent = exactSnippet.fullContent || {};
    return {
      ...fullContent,
      description: fullContent.description || exactSnippet.summary,
      title: exactSnippet.title,
      keywords: fullContent.keywords || exactSnippet.keyPoints,
    };
  }

  // Try zodiac signs
  if (slug.includes('zodiac/')) {
    const sign = slug.split('/').pop();
    if (sign && zodiacSigns[sign as keyof typeof zodiacSigns]) {
      return zodiacSigns[sign as keyof typeof zodiacSigns];
    }
  }

  // Try planets
  if (slug.includes('planets/')) {
    const planet = slug.split('/').pop();
    if (planet && planetaryBodies[planet as keyof typeof planetaryBodies]) {
      return planetaryBodies[planet as keyof typeof planetaryBodies];
    }
  }

  // Try chakras
  if (slug.includes('chakras/')) {
    const chakra = slug.split('/').pop();
    if (chakra && chakras[chakra as keyof typeof chakras]) {
      return chakras[chakra as keyof typeof chakras];
    }
  }

  // Try crystals
  if (slug.includes('crystals/')) {
    const crystalId = slug.split('/').pop();
    const crystal = (crystals as any[]).find(
      (c) =>
        c.id === crystalId || c.name.toLowerCase() === crystalId?.toLowerCase(),
    );
    if (crystal) return crystal;
  }

  // Try tarot
  if (slug.includes('tarot/')) {
    const cardSlug = slug.split('/').pop();
    if (cardSlug) {
      const cardKey = cardSlug
        .split('-')
        .map((word, i) =>
          i === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('');
      const card =
        tarotCards.majorArcana[cardKey as keyof typeof tarotCards.majorArcana];
      if (card) return card;
    }
  }

  // Try sabbats
  if (slug.includes('wheel-of-the-year/')) {
    const sabbatName = slug.split('/').pop();
    const sabbat = (sabbats as any[]).find(
      (s) => s.name.toLowerCase() === sabbatName?.toLowerCase(),
    );
    if (sabbat) return sabbat;
  }

  // Try numerology
  if (slug.includes('numerology') || slug.includes('angel-numbers')) {
    const match = slug.match(/(\d+)/);
    if (match) {
      const num = match[1];
      const angelNum =
        numerology.angelNumbers[num as keyof typeof numerology.angelNumbers];
      if (angelNum) return angelNum;
    }
  }

  // Try correspondences/elements
  if (slug.includes('correspondences/elements')) {
    const elementKey = slug.split('/').pop() || '';
    const elementData =
      correspondences.elements[
        elementKey as keyof typeof correspondences.elements
      ];
    if (elementData) {
      return { ...elementData, name: elementKey };
    }

    const elementEntries = Object.entries(correspondences.elements);
    if (elementEntries.length > 0) {
      const elementDescriptions = elementEntries
        .map(([name, data]) => `${name}: ${data.description}`)
        .join('\n\n');
      return {
        description:
          'The four classical elements are the foundation of astrological and magical correspondences. Each element carries a distinct temperament and set of associations.',
        details: elementDescriptions,
      };
    }
  }

  // Fallback: try Grimoire search
  const snippets = searchGrimoireForTopic(facet.title, 1);
  if (snippets.length > 0 && snippets[0].fullContent) {
    return snippets[0].fullContent;
  }

  return null;
}

/**
 * Generate long-form content based on video script
 * Creates a readable summary that mirrors the video narrative with searchable keywords
 */
export function generateVideoBasedLongFormContent(
  facet: DailyFacet,
  theme: WeeklyTheme | SabbatTheme,
  videoScript: VideoScriptContext,
): LongFormContent {
  const data = getGrimoireDataForFacet(facet);
  let title = facet.title;
  let body = '';

  // Intro: Brief mention of week's theme
  if (videoScript.intro) {
    // Convert spoken language to written form
    const introText = videoScript.intro
      .replace(/Today, we explore/g, 'This week explores')
      .replace(/Today we explore/g, 'This week explores')
      .replace(/we explore/g, 'we explore')
      .replace(/\.$/, '');
    body += `${introText}.\n\n`;
  }

  // Overview: Topics covered
  if (videoScript.overview) {
    const overviewText = videoScript.overview
      .replace(/This deep dive covers/g, 'This exploration covers')
      .replace(/We begin with/g, 'Beginning with')
      .replace(/we begin with/g, 'beginning with');
    body += `${overviewText}\n\n`;
  }

  // Foundations: Core concepts (focus on this facet if mentioned)
  if (videoScript.foundations) {
    // Extract sentences related to this facet's topic
    const facetKeywords = facet.title.toLowerCase().split(' ');
    const foundationSentences = videoScript.foundations
      .split(/[.!?]+/)
      .filter((s) => {
        const lower = s.toLowerCase();
        return facetKeywords.some((kw) => lower.includes(kw));
      });

    if (foundationSentences.length > 0) {
      body += foundationSentences.slice(0, 2).join('. ') + '.\n\n';
    } else if (data?.description) {
      // Fallback to Grimoire data if facet not in foundations
      body += data.description.split('.').slice(0, 2).join('.') + '.\n\n';
    }
  }

  // Deeper Meaning: Symbolic/interpretive layers
  if (videoScript.deeperMeaning) {
    const deeperSentences = videoScript.deeperMeaning
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0)
      .slice(0, 2);
    if (deeperSentences.length > 0) {
      body += deeperSentences.join('. ') + '.\n\n';
    }
  } else if (data?.mysticalProperties || data?.meaning) {
    body += (data.mysticalProperties || data.meaning) + '\n\n';
  }

  // Practical Application: How to use/apply
  if (videoScript.practical) {
    const practicalSentences = videoScript.practical
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0)
      .slice(0, 2);
    if (practicalSentences.length > 0) {
      body += practicalSentences.join('. ') + '.\n\n';
    }
  } else if (data?.healingPractices && data.healingPractices.length > 0) {
    body +=
      'Practical applications: ' +
      data.healingPractices.slice(0, 3).join(', ') +
      '.\n\n';
  }

  // Summary: Key takeaways
  if (videoScript.summary) {
    const summaryText = videoScript.summary
      .replace(/To summarize:/g, 'In summary,')
      .replace(/we have explored/g, 'this covers');
    body += summaryText + '\n\n';
  }

  // Add searchable keywords from Grimoire data
  const keywords: string[] = [];
  if (data?.keywords && Array.isArray(data.keywords)) {
    keywords.push(...data.keywords.slice(0, 3));
  }
  if (data?.element) keywords.push(data.element);
  if (data?.rulingPlanet || data?.ruler) {
    keywords.push(data.rulingPlanet || data.ruler);
  }

  // Integrate keywords naturally if not already mentioned
  if (
    keywords.length > 0 &&
    !body.toLowerCase().includes(keywords[0].toLowerCase())
  ) {
    body += `Key concepts include ${keywords.slice(0, 2).join(' and ')}.\n\n`;
  }

  // Clean up extra whitespace
  body = body.trim().replace(/\n{3,}/g, '\n\n');

  return {
    title,
    body,
    attribution: "From Lunary's Grimoire",
  };
}

/**
 * Generate long-form educational content (300-500 words)
 * Calm, authoritative, encyclopedic tone
 * Optionally uses video script context if provided
 */
export function generateLongFormContent(
  facet: DailyFacet,
  theme: WeeklyTheme | SabbatTheme,
  videoScript?: VideoScriptContext,
): LongFormContent {
  // Use video script if provided
  if (videoScript) {
    return generateVideoBasedLongFormContent(facet, theme, videoScript);
  }
  const data = getGrimoireDataForFacet(facet);

  let title = facet.title;
  let body = '';

  if (data) {
    // Build structured content from real data

    // Opening definition/explanation
    if (data.description) {
      body += data.description + '\n\n';
    } else if (data.mysticalProperties) {
      body += data.mysticalProperties + '\n\n';
    } else if (data.information) {
      body += data.information + '\n\n';
    }

    // Key attributes section
    const attributes: string[] = [];

    if (data.element) attributes.push(`Element: ${data.element}`);
    if (data.modality) attributes.push(`Modality: ${data.modality}`);
    if (data.rulingPlanet) attributes.push(`Ruler: ${data.rulingPlanet}`);
    if (data.planet) attributes.push(`Planet: ${data.planet}`);
    if (data.symbol) attributes.push(`Symbol: ${data.symbol}`);
    if (data.color) attributes.push(`Color: ${data.color}`);
    if (data.sanskritName) attributes.push(`Sanskrit: ${data.sanskritName}`);
    if (data.location) attributes.push(`Location: ${data.location}`);
    if (data.number !== undefined) attributes.push(`Number: ${data.number}`);
    if (data.zodiacSign) attributes.push(`Sign: ${data.zodiacSign}`);

    if (attributes.length > 0) {
      body += attributes.join('\n') + '\n\n';
    }

    // Deeper interpretation
    if (data.uprightMeaning) {
      body += 'When expressed positively: ' + data.uprightMeaning + '\n\n';
    }

    if (data.reversedMeaning) {
      body +=
        'When blocked or imbalanced: ' +
        data.reversedMeaning.split('.').slice(0, 2).join('.') +
        '.\n\n';
    }

    if (data.spiritualMeaning) {
      body += data.spiritualMeaning + '\n\n';
    }

    if (data.details) {
      body += data.details + '\n\n';
    }

    if (data.loveTrait || data.loveMeaning) {
      body +=
        'In relationships: ' + (data.loveTrait || data.loveMeaning) + '\n\n';
    }

    if (data.careerTrait || data.careerMeaning) {
      body +=
        'In work and purpose: ' +
        (data.careerTrait || data.careerMeaning) +
        '\n\n';
    }

    // Practical application
    if (data.healingPractices && data.healingPractices.length > 0) {
      body +=
        'Practices for balance: ' +
        data.healingPractices.slice(0, 4).join(', ') +
        '.\n\n';
    }

    if (data.traditions && data.traditions.length > 0) {
      body +=
        'Traditional observances: ' +
        data.traditions.slice(0, 3).join(', ') +
        '.\n\n';
    }

    if (data.magicalUses && data.magicalUses.length > 0) {
      body +=
        'Magical applications: ' +
        data.magicalUses.slice(0, 3).join(', ') +
        '.\n\n';
    }

    // Reflective closing
    if (data.affirmation) {
      body += '"' + data.affirmation + '"';
    }
  } else {
    // Fallback: use facet focus as body
    body = facet.focus;
  }

  // Ensure educational depth for sparse facets (glossary entries, etc.)
  if (body.trim().length < 220) {
    const expansions: string[] = [];
    if (facet.focus) {
      expansions.push(facet.focus);
    }
    if (facet.shortFormHook) {
      expansions.push(facet.shortFormHook);
    }
    body = [body, ...expansions].filter(Boolean).join('\n\n');
  }

  // Clean up extra whitespace
  body = body.trim().replace(/\n{3,}/g, '\n\n');

  return {
    title,
    body,
    attribution: "From Lunary's Grimoire",
  };
}

/**
 * Generate short-form content (1-2 sentences)
 * Encyclopedic, stands alone, no questions or CTAs
 */
export function generateShortFormContent(facet: DailyFacet): string {
  // Use the pre-defined short-form hook from the facet
  return facet.shortFormHook;
}

/**
 * Format long-form content for a specific platform
 */
export function formatLongFormForPlatform(
  content: LongFormContent,
  hashtags: { domain: string; topic: string; brand: string },
  platform: string,
  options?: { postType?: SocialPostType; topicTitle?: string },
): string {
  const config = PLATFORM_HASHTAG_CONFIG[platform] || {
    useHashtags: false,
    count: 0,
  };

  const cleanedBody = content.body
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.toLowerCase().includes("lunary's grimoire") &&
        !(
          line.toLowerCase().includes('explore') &&
          line.toLowerCase().includes('grimoire')
        ) &&
        !line.toLowerCase().includes('grimoire'),
    )
    .join('\n');

  let formatted = cleanedBody.trim();

  // Add attribution
  formatted += `\n\n${content.attribution}`;

  // Add hashtags if platform supports them
  if (config.useHashtags && config.count > 0) {
    const topicTitle = options?.topicTitle || '';
    const postType = options?.postType || 'educational_intro';
    const tags = selectHashtagsForPostType({
      topicTitle,
      postType,
      platform,
      hashtagData: hashtags,
    });
    if (tags.length > 0) {
      formatted += '\n\n' + tags.join(' ');
    }
  }

  return normalizeHashtagsForPlatform(formatted, platform);
}

/**
 * Format short-form content for a specific platform
 * Adds hashtags where enabled per platform
 */
export function formatShortFormForPlatform(
  content: string,
  platform: string,
  hashtags?: { domain: string; topic: string; brand: string },
  options?: { postType?: SocialPostType; topicTitle?: string },
): string {
  const config = PLATFORM_HASHTAG_CONFIG[platform] || {
    useHashtags: true,
    count: 3,
  };

  let formatted = content;

  // Add hashtags if platform supports them and hashtags are provided
  if (config.useHashtags && config.count > 0 && hashtags) {
    const topicTitle = options?.topicTitle || '';
    const postType = options?.postType || 'educational_intro';
    const tags = selectHashtagsForPostType({
      topicTitle,
      postType,
      platform,
      hashtagData: hashtags,
    });
    if (tags.length > 0) {
      formatted += '\n\n' + tags.join(' ');
    }
  }

  return normalizeHashtagsForPlatform(formatted, platform);
}

/**
 * Generate all content for a single day
 */
export function generateDayContent(
  date: Date,
  theme: WeeklyTheme | SabbatTheme,
  facet: DailyFacet,
  videoScript?: VideoScriptContext,
): ThematicContent {
  const longFormData = generateLongFormContent(facet, theme, videoScript);
  const shortForm = generateShortFormContent(facet);
  const hashtags = generateHashtags(theme, facet);

  return {
    longForm: `${longFormData.title}\n\n${longFormData.body}\n\n${longFormData.attribution}`,
    shortForm,
    hashtags,
    theme,
    facet,
    date,
  };
}

/**
 * Generate content for an entire week
 */
export function generateWeekContent(
  weekStartDate: Date,
  currentThemeIndex: number = 0,
  videoScript?: VideoScriptContext,
  facetOffset: number = 0,
  includeSabbats: boolean = true,
): ThematicContent[] {
  const plan = getWeeklyContentPlan(
    weekStartDate,
    currentThemeIndex,
    facetOffset,
    includeSabbats,
  );

  return plan.map(({ date, theme, facet }) =>
    generateDayContent(date, theme, facet, videoScript),
  );
}

/**
 * Get posts ready for database insertion
 */
export interface ThematicPost {
  content: string;
  platform: string;
  postType:
    | 'educational_intro'
    | 'educational_deep'
    | 'educational_deep_1'
    | 'educational_deep_2'
    | 'educational_deep_3'
    | 'closing_ritual'
    | 'closing_statement'
    | 'persona'
    | 'question'
    | 'video'
    | 'video_caption'
    | 'threads_question'
    | 'threads_beta_cta';
  topic: string;
  scheduledDate: Date;
  hashtags: string;
  category: string;
  slug: string;
  dayOffset: number;
  themeName: string;
  sourceType?: 'grimoire' | 'fallback';
  sourceId?: string;
  sourceTitle?: string;
  partNumber?: number;
  totalParts?: number;
}

type ClosingRitualStyle = 'long' | 'short';

const CLOSING_RITUAL_HASHTAGS = '#closingritual #sundaypause #lunarbreath';

function getClosingThemeDescriptor(
  themeName?: string,
  shortForm?: boolean,
): string {
  if (!themeName) {
    return shortForm
      ? 'Let the night soften this pause.'
      : 'Let the night keep you steady as you close the week.';
  }

  const normalized = themeName.toLowerCase();
  return shortForm
    ? `Let ${normalized} soften this pause.`
    : `This week's ${normalized} energy invites a slow, conscious ending.`;
}

function buildClosingInvitation(themeName?: string): string {
  if (themeName) {
    const normalized = themeName.toLowerCase();
    return `What are you noticing about ${normalized} as you let this pause settle?`;
  }
  return 'What subtle detail are you sitting with as this pause settles?';
}

function buildClosingRitualContent(
  themeName: string | undefined,
  style: ClosingRitualStyle,
): string {
  const descriptor = getClosingThemeDescriptor(themeName, style === 'short');
  const invitation = buildClosingInvitation(themeName);

  if (style === 'long') {
    return `Sunday closing ritual • Pause with the twilight, breathe slowly, and release what no longer serves. ${descriptor} Keep returning to the stars for steadying breath. ${invitation}`;
  }

  return `Sunday closing ritual: breathe slow, release, rest. ${descriptor} ${invitation}`;
}

export async function generateThematicPostsForWeek(
  weekStartDate: Date,
  currentThemeIndex: number = 0,
  videoScript?: VideoScriptContext,
  facetOffset: number = 0,
  includeSabbats: boolean = true,
): Promise<ThematicPost[]> {
  const weekContent = generateWeekContent(
    weekStartDate,
    currentThemeIndex,
    videoScript,
    facetOffset,
    includeSabbats,
  );
  const posts: ThematicPost[] = [];
  const weekTopics = weekContent.map((entry) => entry.facet.title);
  const overrideCache = new Map<number, string>();
  const getOverrideContent = async (
    override: ShortFormOverride,
    dayContent: ThematicContent,
    sourceInfo: SourceInfo,
  ) => {
    if (!override) return '';
    if (overrideCache.has(override.dayOffset)) {
      return overrideCache.get(override.dayOffset) ?? '';
    }
    const snippet =
      sourceInfo.sourceSnippet ||
      dayContent.facet.focus ||
      dayContent.facet.shortFormHook ||
      dayContent.facet.title;
    const dataKeywords = Array.isArray(sourceInfo.data?.keywords)
      ? sourceInfo.data.keywords
      : [];
    let text: string | null = null;
    if (override.postType === 'persona') {
      text = await generatePersonaPost({
        seed: override.seed,
        themeName: dayContent.theme.name,
        category: dayContent.theme.category,
        dayTopic: dayContent.facet.title,
        sourceSnippet: snippet,
        personaList: override.personaList || PERSONA_VOCAB,
        personaBodies: PERSONA_BODY_TEMPLATES,
      });
    } else if (override.postType === 'question') {
      text = await generateQuestionPost({
        seed: override.seed,
        themeName: dayContent.theme.name,
        category: dayContent.theme.category,
        dayTopic: dayContent.facet.title,
        dataKeywords,
        sourceSnippet: snippet,
        questionGuides: QUESTION_POOL,
      });
    } else if (override.postType === 'closing_statement') {
      text = await generateClosingPost({
        seed: override.seed,
        themeName: dayContent.theme.name,
        category: dayContent.theme.category,
        weekTopics,
        closingGuides: CLOSING_STATEMENTS,
      });
    }
    if (!text && override.postType === 'question') {
      text = buildQuestionPost(dayContent.facet.title, sourceInfo.data);
    }
    const resolvedText = text || '';
    overrideCache.set(override.dayOffset, resolvedText);
    return resolvedText;
  };
  const shortFormOverrides = buildShortFormOverrides(weekStartDate);
  const overrideByDayOffset = new Map(
    shortFormOverrides.map((override) => [override.dayOffset, override]),
  );
  const shortFormOverridePlatforms = new Set(['twitter', 'threads', 'bluesky']);
  const ctaPlatforms = new Set(['threads', 'bluesky']);

  // Long-form platforms (educational depth, images)
  const longFormPlatforms = ['linkedin', 'pinterest'];
  // Short-form platforms (1-2 sentences, optional hashtags)
  const shortFormPlatforms = ['twitter', 'bluesky', 'threads'];

  for (const dayContent of weekContent) {
    const sourceInfo = resolveSourceForFacet(
      dayContent.facet,
      dayContent.theme.category,
    );
    const sourceMeta = {
      sourceType: sourceInfo.sourceType,
      sourceId: sourceInfo.sourceId,
      sourceTitle: sourceInfo.sourceTitle,
    };
    // Long-form posts
    for (const platform of longFormPlatforms) {
      const longFormData = generateLongFormContent(
        dayContent.facet,
        dayContent.theme,
      );
      const formattedContent = formatLongFormForPlatform(
        longFormData,
        dayContent.hashtags,
        platform,
        {
          postType: 'educational_intro',
          topicTitle: dayContent.facet.title,
        },
      );

      const dayOffset =
        dayContent.date.getDay() === 0 ? 6 : dayContent.date.getDay() - 1;
      const totalParts =
        dayContent.theme.category === 'sabbat'
          ? (dayContent.theme as SabbatTheme).leadUpFacets.length
          : 7;
      posts.push({
        content: formattedContent,
        platform,
        postType: 'educational_intro',
        topic: dayContent.facet.title,
        scheduledDate: dayContent.date,
        hashtags: `${dayContent.hashtags.domain} ${dayContent.hashtags.topic}`,
        category: dayContent.theme.category,
        dayOffset,
        slug:
          dayContent.facet.grimoireSlug.split('/').pop() ||
          dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
        themeName: dayContent.theme.name,
        partNumber: dayOffset + 1,
        totalParts,
        ...sourceMeta,
      });
    }

    // Short-form posts (now with hashtags and images)
    for (const platform of shortFormPlatforms) {
      const dayOffset =
        dayContent.date.getDay() === 0 ? 6 : dayContent.date.getDay() - 1;
      const override = shortFormOverridePlatforms.has(platform)
        ? overrideByDayOffset.get(dayOffset)
        : undefined;
      const data = sourceInfo.data;

      if (shortFormOverridePlatforms.has(platform)) {
        const baseIntro = buildStandaloneEducationalCopy({
          topic: dayContent.facet.title,
          data,
          sourceSnippet: sourceInfo.sourceSnippet,
          mode: 'intro',
          category: dayContent.theme.category,
        });
        const safeIntro = enforceContentSafety({
          text: baseIntro,
          category: dayContent.theme.category,
          topic: dayContent.facet.title,
          mode: 'intro',
        });
        const keywordBoostedIntro = addDiscoveryKeywords(
          safeIntro,
          data,
          dayContent.theme.category,
        );
        let aiCtaLine = '';
        if (ctaPlatforms.has(platform)) {
          try {
            const snippet =
              sourceInfo.sourceSnippet ||
              dayContent.facet.focus ||
              dayContent.facet.shortFormHook ||
              dayContent.facet.title;
            aiCtaLine = await generateEducationalCta({
              themeName: dayContent.theme.name,
              category: dayContent.theme.category,
              topic: dayContent.facet.title,
              sourceSnippet: snippet,
            });
          } catch (error) {
            console.warn(
              'Failed to generate CTA line for',
              platform,
              dayContent.facet.title,
              (error as Error).message,
            );
          }
        }
        const assembledIntro = [keywordBoostedIntro, aiCtaLine]
          .filter(Boolean)
          .join(' ');
        const introContent = applyPlatformFormatting(
          normalizeGeneratedContent(assembledIntro, {
            topicLabel: dayContent.facet.title,
          }),
          platform,
          dayContent.hashtags,
        );
        posts.push({
          content: introContent,
          platform,
          postType: 'educational_intro',
          topic: dayContent.facet.title,
          scheduledDate: dayContent.date,
          hashtags: `${dayContent.hashtags.domain} ${dayContent.hashtags.topic}`,
          category: dayContent.theme.category,
          dayOffset,
          slug:
            dayContent.facet.grimoireSlug.split('/').pop() ||
            dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
          themeName: dayContent.theme.name,
          partNumber: dayOffset + 1,
          totalParts:
            dayContent.theme.category === 'sabbat'
              ? (dayContent.theme as SabbatTheme).leadUpFacets.length
              : 7,
          ...sourceMeta,
        });

        if (platform !== 'threads') {
          continue;
        }

        const deepDiveCandidates = buildDeepDiveShortForms(
          dayContent.facet,
          data,
          dayContent.theme.category,
        );
        const deepDiveTargets = 1; // Keep 1 educational deep-dive per day
        const usedTexts: string[] = [safeIntro];
        const deep1Candidate = pickDeepDiveCandidate(
          deepDiveCandidates,
          ['structure', 'meaning', 'keywords'],
          usedTexts,
        );
        const deep1Text = deep1Candidate?.text || '';
        if (deep1Text) usedTexts.push(deep1Text);
        const deep2Candidate = pickDeepDiveCandidate(
          deepDiveCandidates,
          ['practice', 'keywords', 'meaning'],
          usedTexts,
        );
        const deep2Text = deep2Candidate?.text || '';
        if (deep2Text) usedTexts.push(deep2Text);
        const deep3Candidate =
          deepDiveTargets > 2
            ? pickDeepDiveCandidate(
                deepDiveCandidates,
                ['meaning', 'practice', 'keywords'],
                usedTexts,
              )
            : null;
        const deepDives = [deep1Text, deep2Text, deep3Candidate?.text]
          .filter(Boolean)
          .slice(0, deepDiveTargets);

        const uniqueDeepDives: string[] = [];
        for (const deepDive of deepDives) {
          if (deepDive && hasTruncationArtifact(deepDive)) continue;
          if (deepDive && isTooSimilar(deepDive, dayContent.shortForm))
            continue;
          if (
            deepDive &&
            uniqueDeepDives.some((entry) => isTooSimilar(entry, deepDive))
          )
            continue;
          if (deepDive) uniqueDeepDives.push(deepDive);
        }

        let attempts = 0;
        while (uniqueDeepDives.length < deepDiveTargets && attempts < 3) {
          const fallback = buildFallbackDeepDive(
            dayContent.facet,
            data,
            dayContent.theme.category,
          );
          if (
            !hasTruncationArtifact(fallback) &&
            !isTooSimilar(fallback, dayContent.shortForm) &&
            !uniqueDeepDives.some((entry) => isTooSimilar(entry, fallback))
          ) {
            uniqueDeepDives.push(fallback);
          }
          attempts += 1;
        }

        // Generate conversational deep-dive for Threads (replaces formal educational copy)
        const conversationalSeed = dayOffset + dayContent.facet.title.length;
        const deepDiveContent = getConversationalDeepDive(
          dayContent.facet.title,
          conversationalSeed,
        );
        // Schedule deep-dive at 17:00 UTC for Threads
        const deepDiveDate = new Date(dayContent.date);
        deepDiveDate.setUTCHours(THREADS_POST_HOURS.deepDive, 0, 0, 0);
        posts.push({
          content: deepDiveContent,
          platform,
          postType: 'educational_deep_1',
          topic: dayContent.facet.title,
          scheduledDate: deepDiveDate,
          hashtags: dayContent.hashtags.topic,
          category: dayContent.theme.category,
          dayOffset,
          slug:
            dayContent.facet.grimoireSlug.split('/').pop() ||
            dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
          themeName: dayContent.theme.name,
          partNumber: dayOffset + 1,
          totalParts:
            dayContent.theme.category === 'sabbat'
              ? (dayContent.theme as SabbatTheme).leadUpFacets.length
              : 7,
          ...sourceMeta,
        });

        // Add Threads-specific posts: question (12:00 UTC) and beta CTA (20:00 UTC)
        // Question post for engagement at 12:00 UTC
        const questionSeed = dayOffset + dayContent.facet.title.length;
        const questionContent = getThreadsQuestion(
          dayContent.facet.title,
          questionSeed,
        );
        const questionDate = new Date(dayContent.date);
        questionDate.setUTCHours(THREADS_POST_HOURS.question, 0, 0, 0);
        posts.push({
          content: questionContent,
          platform,
          postType: 'threads_question',
          topic: dayContent.facet.title,
          scheduledDate: questionDate,
          hashtags: dayContent.hashtags.topic,
          category: dayContent.theme.category,
          dayOffset,
          slug:
            dayContent.facet.grimoireSlug.split('/').pop() ||
            dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
          themeName: dayContent.theme.name,
          partNumber: dayOffset + 1,
          totalParts:
            dayContent.theme.category === 'sabbat'
              ? (dayContent.theme as SabbatTheme).leadUpFacets.length
              : 7,
          ...sourceMeta,
        });

        // Beta CTA post at 20:00 UTC
        const betaCtaSeed = dayOffset;
        const betaCtaContent = getDearStyleBetaPost(betaCtaSeed);
        const betaCtaDate = new Date(dayContent.date);
        betaCtaDate.setUTCHours(THREADS_POST_HOURS.betaCta, 0, 0, 0);
        posts.push({
          content: betaCtaContent,
          platform,
          postType: 'threads_beta_cta',
          topic: dayContent.facet.title,
          scheduledDate: betaCtaDate,
          hashtags: '',
          category: dayContent.theme.category,
          dayOffset,
          slug:
            dayContent.facet.grimoireSlug.split('/').pop() ||
            dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
          themeName: dayContent.theme.name,
          partNumber: dayOffset + 1,
          totalParts:
            dayContent.theme.category === 'sabbat'
              ? (dayContent.theme as SabbatTheme).leadUpFacets.length
              : 7,
          sourceType: 'fallback' as const,
          sourceId: 'beta-cta',
          sourceTitle: 'Beta CTA',
        });

        if (override) {
          const overrideText = await getOverrideContent(
            override,
            dayContent,
            sourceInfo,
          );
          const optionalBase =
            overrideText ||
            (override.postType === 'question'
              ? buildQuestionPost(dayContent.facet.title, data)
              : '');
          const optionalContent = applyPlatformFormatting(
            normalizeGeneratedContent(optionalBase, {
              topicLabel: dayContent.facet.title,
            }),
            platform,
            dayContent.hashtags,
          );
          const optionalSource =
            override.postType === 'question'
              ? sourceMeta
              : {
                  sourceType: 'fallback' as const,
                  sourceId: sourceInfo.sourceId,
                  sourceTitle: dayContent.facet.title,
                };
          posts.push({
            content: optionalContent,
            platform,
            postType: override.postType,
            topic: dayContent.facet.title,
            scheduledDate: dayContent.date,
            hashtags: `${dayContent.hashtags.domain} ${dayContent.hashtags.topic}`,
            category: dayContent.theme.category,
            dayOffset,
            slug:
              dayContent.facet.grimoireSlug.split('/').pop() ||
              dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
            themeName: dayContent.theme.name,
            partNumber: dayOffset + 1,
            totalParts:
              dayContent.theme.category === 'sabbat'
                ? (dayContent.theme as SabbatTheme).leadUpFacets.length
                : 7,
            ...optionalSource,
          });
        }
        continue;
      }

      const formattedContent = formatShortFormForPlatform(
        normalizeGeneratedContent(dayContent.shortForm, {
          topicLabel: dayContent.facet.title,
        }),
        platform,
        dayContent.hashtags,
        {
          postType: override?.postType ?? 'educational_intro',
          topicTitle: dayContent.facet.title,
        },
      );
      const totalParts =
        dayContent.theme.category === 'sabbat'
          ? (dayContent.theme as SabbatTheme).leadUpFacets.length
          : 7;
      posts.push({
        content: formattedContent,
        platform,
        postType: override?.postType ?? 'educational_intro',
        topic: dayContent.facet.title,
        scheduledDate: dayContent.date,
        hashtags: `${dayContent.hashtags.domain} ${dayContent.hashtags.topic}`,
        category: dayContent.theme.category,
        dayOffset,
        slug:
          dayContent.facet.grimoireSlug.split('/').pop() ||
          dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
        themeName: dayContent.theme.name,
        partNumber: dayOffset + 1,
        totalParts,
        ...sourceMeta,
      });
    }
  }

  if (weekContent.length > 0) {
    const closingRitualDate = new Date(weekStartDate);
    closingRitualDate.setDate(closingRitualDate.getDate() + 6);
    closingRitualDate.setHours(20, 0, 0, 0);
    const closingThemeName = weekContent[0]?.theme?.name;
    const closingPlatforms = Array.from(
      new Set([...longFormPlatforms, ...shortFormPlatforms]),
    ).filter((platform) => !shortFormOverridePlatforms.has(platform));

    for (const platform of closingPlatforms) {
      const style: ClosingRitualStyle = longFormPlatforms.includes(platform)
        ? 'long'
        : 'short';
      posts.push({
        content: buildClosingRitualContent(closingThemeName, style),
        platform,
        postType: 'closing_ritual',
        topic: 'closing ritual',
        scheduledDate: new Date(closingRitualDate),
        hashtags: CLOSING_RITUAL_HASHTAGS,
        category: 'ritual',
        dayOffset: 6,
        slug: 'closing-ritual',
        themeName: closingThemeName || 'Closing Ritual',
        partNumber: undefined,
        totalParts: undefined,
      });
    }
  }

  return posts;
}

/**
 * Track theme rotation to prevent repeats
 */
export async function getNextThemeIndex(sql: any): Promise<number> {
  try {
    // Ensure rotation table exists
    await sql`
      CREATE TABLE IF NOT EXISTS content_rotation (
        id SERIAL PRIMARY KEY,
        rotation_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        last_used_at TIMESTAMP WITH TIME ZONE,
        use_count INTEGER DEFAULT 0,
        UNIQUE(rotation_type, item_id)
      )
    `;

    // Get all theme usage
    const result = await sql`
      SELECT item_id, use_count, last_used_at
      FROM content_rotation
      WHERE rotation_type = 'theme'
      ORDER BY use_count ASC, last_used_at ASC NULLS FIRST
    `;

    // If no records, start with first theme
    if (result.rows.length === 0) {
      return 0;
    }

    // Find themes not yet used
    const usedThemeIds = new Set(result.rows.map((r: any) => r.item_id));
    for (let i = 0; i < categoryThemes.length; i++) {
      if (!usedThemeIds.has(categoryThemes[i].id)) {
        return i;
      }
    }

    // All themes used at least once - find lowest use count
    const lowestUseCount = result.rows[0].use_count;
    const candidateIds = result.rows
      .filter((r: any) => r.use_count === lowestUseCount)
      .map((r: any) => r.item_id);

    // Return index of first candidate
    for (let i = 0; i < categoryThemes.length; i++) {
      if (candidateIds.includes(categoryThemes[i].id)) {
        return i;
      }
    }

    return 0;
  } catch (error) {
    console.warn('Failed to get theme index from rotation table:', error);
    return 0;
  }
}

/**
 * Record theme usage
 */
export async function recordThemeUsage(
  sql: any,
  themeId: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO content_rotation (rotation_type, item_id, last_used_at, use_count)
      VALUES ('theme', ${themeId}, NOW(), 1)
      ON CONFLICT (rotation_type, item_id)
      DO UPDATE SET
        last_used_at = NOW(),
        use_count = content_rotation.use_count + 1
    `;
  } catch (error) {
    console.warn('Failed to record theme usage:', error);
  }
}
