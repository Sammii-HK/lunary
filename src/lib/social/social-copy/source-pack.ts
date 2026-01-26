/**
 * Source pack building for social copy generation
 */

import { generateHashtags } from '../weekly-themes';
import type { DailyFacet, WeeklyTheme, SabbatTheme } from '../weekly-themes';
import {
  getGrimoireSnippetBySlug,
  searchGrimoireForTopic,
} from '../grimoire-content';
import {
  CATEGORY_DOMAIN_MAP,
  TOPIC_DOMAIN_LABELS,
  DISALLOWED_ANALOGY_DOMAINS,
  DOMAIN_ALLOWED_PREFIXES,
  DOMAIN_DESCRIPTIONS,
  CATEGORY_META,
  AMBIGUOUS_DOMAINS,
} from '../shared/constants/domain-mappings';
import {
  BANNED_PHRASES,
  hasOffDomainKeyword,
} from '../shared/constants/banned-phrases';
import { MAX_CHARS } from '../shared/constants/platform-limits';
import {
  sentenceSafe,
  matchesTopic,
  deriveSearchKeyword,
  normalizeSlug,
  pickUnique,
} from '../shared/text/normalize';
import { hasTruncation } from '../shared/text/truncation';
import type { SourcePack, SocialPostType } from './types';

/**
 * Check if slug is allowed for domain
 */
const isSlugAllowedForDomain = (domain: string, slug?: string): boolean => {
  if (!slug) return false;
  const normalized = normalizeSlug(slug);
  const prefixes = DOMAIN_ALLOWED_PREFIXES[domain] || [];
  return prefixes.some((prefix) => normalized.startsWith(prefix));
};

/**
 * Build topic definition from excerpt and fallback
 */
const buildTopicDefinition = (
  topic: string,
  excerpt: string,
  fallback: string,
): string => {
  const source = excerpt.trim() || fallback.trim();
  if (!source) return sentenceSafe(topic);
  const sentences = source
    .split(/[.!?]+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 2);
  const combined = sentences.join('. ');
  const ensured = sentenceSafe(combined || source);
  return ensured.toLowerCase().includes(topic.toLowerCase())
    ? ensured
    : sentenceSafe(
        `${topic} ${ensured.replace(/^[A-Z]/, (c) => c.toLowerCase())}`,
      );
};

/**
 * Extract facts from Grimoire data
 */
const extractFactsFromData = (data: Record<string, any> | null): string[] => {
  if (!data) return [];
  const facts: string[] = [];
  const push = (value: string | undefined) => {
    if (!value) return;
    const sentence = sentenceSafe(String(value));
    if (!hasTruncation(sentence)) facts.push(sentence);
  };
  push(data.description);
  push(data.information);
  push(data.meaning);
  push(data.properties);
  push(data.mysticalProperties);
  push(data.houseMeaning);
  push(data.transitEffect);
  if (data.element && data.modality) {
    push(
      `Associated with the ${data.element} element and ${data.modality} modality.`,
    );
  } else if (data.element) {
    push(`Associated with the ${data.element} element.`);
  } else if (data.modality) {
    push(`Associated with the ${data.modality} modality.`);
  }
  if (Array.isArray(data.rules) && data.rules.length > 0) {
    push(`Linked to ${data.rules.slice(0, 3).join(', ')}.`);
  }
  if (data.rulingPlanet || data.ruler) {
    push(`Ruled by ${data.rulingPlanet || data.ruler}.`);
  }
  return facts;
};

/**
 * Extract examples from Grimoire data
 */
const extractExamplesFromData = (
  topic: string,
  data: Record<string, any> | null,
): string[] => {
  const examples: string[] = [];
  if (Array.isArray(data?.magicalUses) && data.magicalUses.length > 0) {
    examples.push(
      `Example: Work with ${topic} when focusing on ${data.magicalUses.slice(0, 2).join(' or ')}.`,
    );
  }
  if (
    Array.isArray(data?.healingPractices) &&
    data.healingPractices.length > 0
  ) {
    examples.push(
      `Example: People often use ${data.healingPractices.slice(0, 2).join(' or ')} alongside ${topic}.`,
    );
  }
  if (Array.isArray(data?.traditions) && data.traditions.length > 0) {
    examples.push(
      `Example: Traditional observances include ${data.traditions.slice(0, 2).join(' or ')}.`,
    );
  }
  if (examples.length === 0) {
    examples.push(
      `Notice where ${topic.toLowerCase()} surfaces as you move through your day.`,
    );
    examples.push(
      `Pay attention to how ${topic.toLowerCase()} shapes timing or small decisions.`,
    );
  }
  return examples;
};

/**
 * Build source pack from theme and facet data
 */
export function buildSourcePack({
  topic,
  theme,
  platform,
  postType,
  facet,
}: {
  topic: string;
  theme: WeeklyTheme | SabbatTheme;
  platform: string;
  postType: SocialPostType;
  facet: DailyFacet;
}): SourcePack {
  const normalizedSlug = facet.grimoireSlug?.includes('#')
    ? facet.grimoireSlug.replace('#', '/')
    : facet.grimoireSlug;
  const contentDomain =
    CATEGORY_DOMAIN_MAP[theme.category as keyof typeof CATEGORY_DOMAIN_MAP] ||
    'astrology';
  const topicDomain = TOPIC_DOMAIN_LABELS[contentDomain] || contentDomain;
  const searchKeyword = deriveSearchKeyword(topic);
  const allowJournaling =
    postType === 'closing_ritual' || postType === 'closing_statement';

  let snippet =
    normalizedSlug && isSlugAllowedForDomain(contentDomain, normalizedSlug)
      ? getGrimoireSnippetBySlug(normalizedSlug)
      : null;
  if (snippet && !matchesTopic(snippet.title || '', topic)) {
    snippet = null;
  }
  if (!snippet) {
    const fallbackMatches = searchGrimoireForTopic(topic, 5);
    const domainFiltered = fallbackMatches.filter((candidate) =>
      isSlugAllowedForDomain(contentDomain, candidate.slug),
    );
    const choices = domainFiltered.length ? domainFiltered : fallbackMatches;
    snippet =
      choices.find((candidate) => matchesTopic(candidate.title || '', topic)) ||
      choices[0] ||
      null;
  }
  const sourceSummary =
    snippet?.summary || snippet?.fullContent?.description || '';
  const rawFallback = facet.shortFormHook || facet.focus || topic;
  const safeFallback = hasOffDomainKeyword(rawFallback) ? '' : rawFallback;
  const neutralFallback = `${topic} is a domain-specific term in ${topicDomain}.`;
  const fallbackText = safeFallback || neutralFallback;
  const grimoireExcerpt = sentenceSafe(sourceSummary || fallbackText);
  const topicDefinition = buildTopicDefinition(
    topic,
    sourceSummary,
    fallbackText,
  );
  const disallowedAnalogies = DISALLOWED_ANALOGY_DOMAINS.filter(
    (domain) => domain !== topicDomain,
  );
  const sourceFacts = extractFactsFromData(snippet?.fullContent || null);
  if (sourceSummary) sourceFacts.unshift(sentenceSafe(sourceSummary));
  if (sourceFacts.length === 0) {
    const fallbackText =
      facet.shortFormHook || facet.focus || `${topic} matters this week.`;
    sourceFacts.push(sentenceSafe(fallbackText));
  }
  const facts = pickUnique(sourceFacts, 8);
  const examples = pickUnique(
    extractExamplesFromData(topic, snippet?.fullContent || null),
    4,
  );
  const keywordPool = [
    topic,
    ...(snippet?.keyPoints || []),
    ...(snippet?.fullContent?.keywords || []),
  ];
  const relatedKeywords = pickUnique(keywordPool, 12);
  const constraints = [
    `Max length: ${MAX_CHARS[platform] || 450} chars`,
    `Avoid banned phrases: ${BANNED_PHRASES.join(' | ')}`,
    'Avoid truncation or dangling clauses',
    `Domain focus: ${DOMAIN_DESCRIPTIONS[contentDomain] || 'Stick to this domain content'}`,
  ];
  const meta = CATEGORY_META[theme.category as keyof typeof CATEGORY_META] || {
    label: theme.category,
    contextClause: '',
  };
  const grimoireSnippets = facts.slice(0, 3);
  const hashtagData = generateHashtags(theme, facet);
  const needsContext = AMBIGUOUS_DOMAINS.has(contentDomain);
  return {
    topic,
    theme: theme.name,
    platform,
    postType,
    grimoireFacts: facts,
    grimoireExamples: examples,
    relatedKeywords,
    contentDomain,
    topicDomain,
    topicDefinition,
    grimoireExcerpt,
    disallowedAnalogies,
    searchKeyword,
    topicTitle: facet.title,
    categoryLabel: meta.label,
    categoryContextClause: meta.contextClause,
    grimoireSnippets,
    allowJournaling,
    tone: 'calm, modern, precise, not cheesy; UK English',
    constraints,
    hashtagData,
    needsContext,
  };
}
