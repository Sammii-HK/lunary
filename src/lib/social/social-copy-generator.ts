import { getOpenAI } from '@/lib/openai-client';
import { buildScopeGuard } from '@/lib/social/topic-scope';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import {
  CLOSING_PARTICIPATION_INSTRUCTION,
  FACTUAL_GUARDRAIL_INSTRUCTION,
} from '@/lib/social/prompt-guards';
import { generateHashtags } from './weekly-themes';
import type { DailyFacet, WeeklyTheme, SabbatTheme } from './weekly-themes';
import {
  getGrimoireSnippetBySlug,
  searchGrimoireForTopic,
} from './grimoire-content';

export type SocialPostType =
  | 'educational'
  | 'educational_intro'
  | 'educational_deep_1'
  | 'educational_deep_2'
  | 'educational_deep_3'
  | 'closing_ritual'
  | 'closing_statement'
  | 'persona'
  | 'question'
  | 'video_caption';

export type SourcePack = {
  topic: string;
  theme: string;
  platform: string;
  postType: SocialPostType;
  grimoireFacts: string[];
  grimoireExamples: string[];
  relatedKeywords: string[];
  contentDomain: string;
  searchKeyword: string;
  displayTitle: string;
  topicTitle: string;
  categoryLabel: string;
  categoryContextClause: string;
  grimoireSnippets: string[];
  hashtagData: { domain: string; topic: string; brand: string };
  allowJournaling: boolean;
  tone: string;
  constraints: string[];
  needsContext: boolean;
  noveltyContext?: NoveltyContext;
};

export type SocialCopyResult = {
  content: string;
  hashtags: string[];
  title?: string;
  safetyChecks?: string[];
};

export type NoveltyContext = {
  recentTexts?: string[];
  recentOpenings?: string[];
  avoidBigrams?: string[];
  dayLabel?: string;
};

const BANNED_PHRASES = [
  'distinct rhythm worth tracking',
  'most people misunderstand',
  'here is how',
  'related focus points include',
  'is the focus here',
  'matters because it adds context to timing and pattern',
  'explore in the grimoire',
  'example prompt',
  'notice where it shifts your routine',
  'visibility to',
];

const OFF_DOMAIN_KEYWORDS = [
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

const hasOffDomainKeyword = (text: string) =>
  OFF_DOMAIN_KEYWORDS.some((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(text),
  );

const CTA_OPTIONS = [
  'Full guide in Lunary’s Grimoire.',
  'Explored further in the Grimoire.',
];
const CTA_PHRASES = new Set(CTA_OPTIONS);

const pickCTA = () =>
  CTA_OPTIONS[Math.floor(Math.random() * CTA_OPTIONS.length)];

const AMBIGUOUS_DOMAINS = new Set([
  'astrology',
  'moon',
  'tarot',
  'crystals',
  'numerology',
]);

const PLATFORM_HASHTAG_LIMITS: Record<string, number> = {
  tiktok: 4,
  instagram: 4,
  threads: 2,
  twitter: 2,
  bluesky: 2,
  facebook: 4,
  linkedin: 3,
  pinterest: 3,
  youtube: 3,
  reddit: 3,
};

const TRUNCATION_PATTERNS = [
  /\bthe\.$/i,
  /\beach\.$/i,
  /\bbegin at\.$/i,
  /\bcrosses the\.$/i,
  /:\s*$/i,
  /\bat\.$/i,
  /\bevery 2\.$/i,
];

const MAX_CHARS: Record<string, number> = {
  twitter: 280,
  threads: 450,
  bluesky: 350,
  instagram: 2200,
  facebook: 2200,
  linkedin: 1200,
  pinterest: 1200,
  tiktok: 2200,
  youtube: 2200,
};

const CATEGORY_DOMAIN_MAP: Record<
  string,
  'astrology' | 'tarot' | 'moon' | 'crystals' | 'numerology' | 'rituals'
> = {
  zodiac: 'astrology',
  planetary: 'astrology',
  lunar: 'moon',
  chakras: 'astrology',
  tarot: 'tarot',
  crystals: 'crystals',
  numerology: 'numerology',
  sabbat: 'rituals',
};

const DOMAIN_ALLOWED_PREFIXES: Record<string, string[]> = {
  astrology: [
    'astronomy',
    'correspondences',
    'zodiac',
    'birth-chart',
    'transits',
    'houses',
    'rising-sign',
    'glossary',
  ],
  moon: [
    'moon',
    'astronomy/planets/moon',
    'moon/',
    'moon-in',
    'moon-phases',
    'lunar',
    'lunar-nodes',
    'eclipses',
  ],
  crystals: ['crystals'],
  tarot: ['tarot', 'card-combinations', 'tarot-spreads'],
  numerology: ['numerology', 'angel-numbers', 'life-path'],
  rituals: [
    'wheel-of-the-year',
    'sabbats',
    'sabbat',
    'rituals',
    'candle-magic',
    'spell',
  ],
};

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  astrology:
    'Stick to astrological systems (zodiac, houses, planets, modalities) and avoid unrelated tarot or crystal imagery.',
  moon: 'Keep the focus on lunar timing, phases, nodes, and timing cues rather than tarot-specific symbolism.',
  crystals:
    'Talk about mineral properties, correspondences, and energetic uses without slipping into unrelated astrology jargon.',
  tarot:
    'Reference tarot cards, suits, spreads, or archetypes as needed, but avoid neutral astrology topics unless they overlap.',
  numerology:
    'Use numerological language, life path meanings, cycles, and math-based symbolism.',
  rituals:
    'Focus on seasonal practices, sabbat rhythms, or ceremony structure without branching into unrelated tarot imagery.',
};

const PLATFORM_TONE_NOTES: Record<string, string> = {
  threads:
    'Threads posts should feel conversational and reflective, zeroing in on one strong idea per post.',
  twitter:
    'Twitter/X posts need tighter phrasing, a single insight, and no repeated adjectives; keep the copy sharp.',
  pinterest:
    'Pinterest entries can be slightly more explanatory while staying practical, grounded, and calm.',
  instagram:
    'Instagram and TikTok captions remain emotionally resonant, present-tense, and paired with the video energy.',
  tiktok:
    'TikTok captions should sound like a lived-in observation about what you notice right now.',
  default:
    'Keep the tone calm, grounded, and observational—describe how a pattern shows up, not why someone must believe it.',
};

const SOCIAL_POST_STYLE_INSTRUCTION = (platform: string) => {
  const platformNote =
    PLATFORM_TONE_NOTES[platform] || PLATFORM_TONE_NOTES.default;
  return `Global style rules:
- Avoid repeating sentence structures within a single post and never reuse the same opening or closing sentence across variants.
- Limit “Many believe” to once across the 7-day batch and allow “may influence” only once per post; prefer “often”, “tends to”, “is best used for”, “shows up as”, or “is felt as”.
- Skip filler phrases like “can deepen”, “may enhance”, or “often signifies” unless you immediately follow with a concrete example.
- Every post must include exactly one “why this matters today” line (practical, emotional, or behavioral).
- Max 3 short paragraphs; first sentence must reframe a misconception or describe lived experience, and the final sentence should invite reflection (not a CTA).
- Stay calm, grounded, and authoritative—explain patterns without pushing belief or using mystical exaggeration.
Platform-specific note: ${platformNote}`;
};

const CATEGORY_META: Record<string, { label: string; contextClause: string }> =
  {
    zodiac: { label: 'Astrology basics', contextClause: 'in astrology' },
    planetary: { label: 'Transits', contextClause: 'in planetary transits' },
    lunar: { label: 'Moon phases', contextClause: 'of the Moon' },
    tarot: { label: 'Tarot', contextClause: 'in Tarot' },
    crystals: { label: 'Crystals', contextClause: 'with crystals' },
    numerology: { label: 'Numerology', contextClause: 'in numerology' },
    chakras: { label: 'Energy centers', contextClause: 'in energy work' },
    sabbat: {
      label: 'Wheel of the Year',
      contextClause: 'during the wheel of the year',
    },
  };

const deriveSearchKeyword = (topic: string) => {
  const normalized = normalise(topic);
  if (!normalized) return 'astrology meaning';
  return normalized.endsWith('meaning') ? normalized : `${normalized} meaning`;
};

const collapseRepeatedTokens = (value: string) => {
  const parts = value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.trim());
  const deduped: string[] = [];
  for (const part of parts) {
    if (
      deduped.length > 0 &&
      deduped[deduped.length - 1].toLowerCase() === part.toLowerCase()
    ) {
      continue;
    }
    deduped.push(part);
  }
  return deduped.join(' ');
};

const formatCaptionTitle = (topicTitle: string) => {
  const clean = collapseRepeatedTokens(topicTitle.replace(/[:]+$/, ''));
  const trimmed = clean.trim();
  return trimmed ? `${trimmed}: meaning and context` : 'Meaning and context';
};

const getHashtagLimit = (platform: string) =>
  PLATFORM_HASHTAG_LIMITS[platform] ?? 4;

const TOPIC_HASHTAG_POOLS: Record<string, string[]> = {
  'new moon': ['#newmoon', '#moonphases', '#lunarcycle'],
  'full moon': ['#fullmoon', '#moonphases', '#lunarcycle'],
  'lunar nodes': ['#lunarnodes', '#astrology'],
  'north node': ['#northnode', '#astrology'],
  'south node': ['#southnode', '#astrology'],
  'mercury retrograde': ['#mercuryretrograde', '#astrology'],
  'venus retrograde': ['#venusretrograde', '#astrology'],
  tarot: ['#tarot', '#tarotreading'],
  'major arcana': ['#majorarcana', '#tarot'],
  'minor arcana': ['#minorarcana', '#tarot'],
};

const ZODIAC_HASHTAGS: Record<string, string> = {
  aries: '#aries',
  taurus: '#taurus',
  gemini: '#gemini',
  cancer: '#cancer',
  leo: '#leo',
  virgo: '#virgo',
  libra: '#libra',
  scorpio: '#scorpio',
  sagittarius: '#sagittarius',
  capricorn: '#capricorn',
  aquarius: '#aquarius',
  pisces: '#pisces',
};

const getTopicHashtagPool = (topicTitle: string) => {
  const normalized = normalise(topicTitle);
  if (TOPIC_HASHTAG_POOLS[normalized]) {
    return TOPIC_HASHTAG_POOLS[normalized];
  }
  for (const [sign, tag] of Object.entries(ZODIAC_HASHTAGS)) {
    if (normalized.includes(sign)) {
      return [tag, '#astrology'];
    }
  }
  return [];
};

export const selectHashtagsForPostType = ({
  topicTitle,
  postType,
  platform,
  hashtagData,
}: {
  topicTitle: string;
  postType: SocialPostType;
  platform: string;
  hashtagData: { domain: string; topic: string; brand: string };
}): string[] => {
  const pool = getTopicHashtagPool(topicTitle);
  const fallback = [hashtagData.topic, hashtagData.domain].filter(Boolean);
  const baseTags = (pool.length > 0 ? pool : fallback).map((tag) =>
    tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`,
  );
  const allowBrand = platform === 'instagram' || platform === 'tiktok';
  const brandTag = hashtagData.brand
    ? hashtagData.brand.startsWith('#')
      ? hashtagData.brand.toLowerCase()
      : `#${hashtagData.brand.toLowerCase()}`
    : '';
  const withBrand = allowBrand && brandTag ? [...baseTags, brandTag] : baseTags;
  const unique = Array.from(new Set(withBrand));

  const platformLimit = getHashtagLimit(platform);
  const desiredMax =
    postType === 'question'
      ? 2
      : postType === 'persona' || postType === 'closing_statement'
        ? 2
        : postType === 'closing_ritual'
          ? 2
          : 4;
  const minDesired = postType === 'educational' ? 2 : 0;
  const limit = Math.min(platformLimit, desiredMax);
  const sliced = unique.slice(0, Math.max(0, limit));
  if (minDesired > 0 && sliced.length < minDesired) {
    return unique.slice(0, Math.max(0, minDesired));
  }
  return sliced;
};

const buildCuratedHashtags = (pack: SourcePack) =>
  selectHashtagsForPostType({
    topicTitle: pack.topicTitle,
    postType: pack.postType,
    platform: pack.platform,
    hashtagData: pack.hashtagData,
  });

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const matchesTopic = (title: string, topic: string) => {
  const titleKey = normalise(title);
  const topicKey = normalise(topic);
  if (!titleKey || !topicKey) return false;
  return (
    titleKey.includes(topicKey) ||
    topicKey.includes(titleKey) ||
    titleKey === topicKey
  );
};

const sentenceSafe = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

type OpeningIntent =
  | 'definition'
  | 'misconception'
  | 'observation'
  | 'quick_rule'
  | 'question'
  | 'contrast'
  | 'signal';

export const OPENING_INTENTS: OpeningIntent[] = [
  'definition',
  'misconception',
  'observation',
  'quick_rule',
  'question',
  'contrast',
  'signal',
];

type OpeningVariation = {
  line: string;
  intent: OpeningIntent;
};

type OpeningVariationOptions = {
  preferredIntent?: OpeningIntent;
  avoidOpenings?: string[];
  intentOrder?: OpeningIntent[];
};

const normalizeOpening = (value: string) => normalise(value);

const isOpeningDuplicate = (line: string, avoid: string[]) => {
  const normalized = normalizeOpening(line);
  return avoid.some((existing) => normalizeOpening(existing) === normalized);
};

const buildOpeningPrompt = (
  pack: SourcePack,
  intent: OpeningIntent,
  avoidOpenings: string[],
) => {
  const avoidBlock = avoidOpenings.length
    ? `Avoid these openings (do not reuse or closely paraphrase them):\n- ${avoidOpenings
        .slice(0, 8)
        .join('\n- ')}`
    : '';
  return `Write one opening sentence for an educational social post about "${pack.topicTitle}".

Allowed opening intents (choose the provided intent only):
- definition: a clear definition or framing of what the topic is
- misconception: gently correct a common misunderstanding
- observation: a grounded observation about how the topic shows up
- quick_rule: a crisp rule-of-thumb or simple heuristic
- question: a thoughtful question that invites reflection (must end with "?")
- contrast: a contrast that clarifies the topic (e.g., "not X, but Y")
- signal: a subtle signal or indicator to watch for

Intent to use: ${intent}

Requirements:
- One sentence only.
- Must include the topic phrase "${pack.topicTitle}" or "${pack.displayTitle}" exactly once.
- No hashtags, emojis, or CTA language.
- End with punctuation (question intent must end with "?"; others should end with ".").
- Keep it 10-18 words.
- Do not mention platforms, days of the week, or "Lunary".
${avoidBlock}

Return strict JSON only:
{"line":"string","intent":"${intent}"}`.trim();
};

export async function generateOpeningVariation(
  pack: SourcePack,
  options: OpeningVariationOptions = {},
): Promise<OpeningVariation> {
  const openai = getOpenAI();
  const avoidOpenings = options.avoidOpenings || [];
  const intentOrder = options.intentOrder || OPENING_INTENTS;
  const startIndex = options.preferredIntent
    ? Math.max(0, intentOrder.indexOf(options.preferredIntent))
    : 0;

  for (let attempt = 0; attempt < intentOrder.length; attempt += 1) {
    const intent = intentOrder[(startIndex + attempt) % intentOrder.length];
    const prompt = buildOpeningPrompt(pack, intent, avoidOpenings);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You write concise, factual opening lines for educational social posts. Return valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 120,
    });
    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as { line?: string; intent?: string };
    const line = String(parsed.line || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!line) continue;
    if (isOpeningDuplicate(line, avoidOpenings)) continue;
    if (intent === 'question' && !line.endsWith('?')) continue;
    if (intent !== 'question' && !/[.!]$/.test(line)) continue;
    return { line, intent };
  }

  return {
    line: sentenceSafe(
      `${pack.topicTitle} offers a grounded lens worth noting`,
    ),
    intent: 'definition',
  };
}

export function applyOpeningVariation(
  content: string,
  openingLine: string,
): string {
  const trimmedContent = content.trim();
  const opening = openingLine.trim();
  if (!trimmedContent || !opening) return content;

  const firstSentenceMatch = trimmedContent.match(/^[^.!?]+[.!?]/);
  if (!firstSentenceMatch) {
    return `${opening} ${trimmedContent}`.trim();
  }

  const firstSentence = firstSentenceMatch[0].trim();
  if (normalizeOpening(firstSentence) === normalizeOpening(opening)) {
    return content;
  }

  const rest = trimmedContent.slice(firstSentenceMatch[0].length).trim();
  return rest ? `${opening} ${rest}`.trim() : opening;
}

const trimToMaxChars = (text: string, maxChars: number) => {
  if (text.length <= maxChars) return text.trim();
  const snippet = text.slice(0, Math.max(0, maxChars - 1)).trim();
  const lastStop = Math.max(
    snippet.lastIndexOf('.'),
    snippet.lastIndexOf('!'),
    snippet.lastIndexOf('?'),
  );
  if (lastStop > 40) {
    return snippet.slice(0, lastStop + 1).trim();
  }
  const lastSpace = snippet.lastIndexOf(' ');
  return `${snippet.slice(0, lastSpace > 0 ? lastSpace : snippet.length).trim()}.`;
};

const HASHTAG_REGEX = /#[\w-]+/g;

const extractHashtags = (text: string) => {
  const matches = text.match(HASHTAG_REGEX) || [];
  const normalized = matches.map((tag) => tag.toLowerCase());
  return Array.from(new Set(normalized));
};

const stripHashtags = (text: string) => text.replace(HASHTAG_REGEX, '').trim();

export function normalizeHashtagsForPlatform(
  content: string,
  platform: string,
): string {
  const max = MAX_CHARS[platform] || 450;
  const tags = extractHashtags(content);
  const cleaned = stripHashtags(content)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  if (tags.length === 0) {
    return cleaned;
  }

  const hashtagLine = tags.join(' ');
  if (hashtagLine.length >= max) {
    return cleaned ? trimToMaxChars(cleaned, max) : hashtagLine.slice(0, max);
  }

  const separator = '\n\n';
  const bodyMax = Math.max(0, max - hashtagLine.length - separator.length);
  const body = bodyMax > 0 ? trimToMaxChars(cleaned, bodyMax) : '';
  return body ? `${body}${separator}${hashtagLine}` : hashtagLine;
}

const hasTruncation = (text: string) =>
  TRUNCATION_PATTERNS.some((pattern) => pattern.test(text.trim()));

const buildNoveltyInstruction = (context?: NoveltyContext) => {
  if (!context) return '';
  const recent = (context.recentTexts || []).slice(-6);
  const openings = (context.recentOpenings || []).slice(-6);
  const avoidBigrams = (context.avoidBigrams || []).slice(0, 10);
  const lines: string[] = [];
  if (recent.length > 0) {
    lines.push(
      `Recent posts (${recent.length}) for this platform/theme (avoid reusing opening phrase structures):`,
    );
    recent.forEach((text) => lines.push(`- ${text}`));
  }
  if (openings.length > 0) {
    lines.push('Avoid repeating these opening phrases:');
    openings.forEach((opening) => lines.push(`- ${opening}`));
  }
  if (avoidBigrams.length > 0) {
    lines.push(
      `Avoid repeating these key bigrams more than once today: ${avoidBigrams.join(
        ', ',
      )}.`,
    );
  }
  return lines.length > 0 ? lines.join('\n') : '';
};

const DETERMINISTIC_WORDS = ['controls', 'always', 'guarantees'];

const hasDeterministicLanguage = (text: string) => {
  const lower = text.toLowerCase();
  return DETERMINISTIC_WORDS.some((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(lower),
  );
};

const countTopicMentions = (content: string, topic: string) => {
  const haystack = normalise(content);
  const needle = normalise(topic);
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
};

const QUESTION_STARTERS = [
  'what',
  'why',
  'how',
  'when',
  'which',
  'who',
  'where',
  'do',
  'does',
  'did',
  'is',
  'are',
  'can',
  'could',
  'would',
  'should',
  'will',
  'have',
  'has',
  'am',
  'was',
  'were',
];

const isQuestionLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed.endsWith('?')) return false;
  const lower = trimmed.toLowerCase();
  return QUESTION_STARTERS.some((starter) =>
    new RegExp(`^${starter}\\b`).test(lower),
  );
};

const normalizeQuestionLines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const pickUnique = (values: string[], limit: number) => {
  const unique: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (!unique.some((item) => normalise(item) === normalise(trimmed))) {
      unique.push(trimmed);
    }
    if (unique.length >= limit) break;
  }
  return unique;
};

const normalizeSlug = (slug: string | undefined) =>
  slug ? slug.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '') : '';

const isSlugAllowedForDomain = (domain: string, slug?: string) => {
  if (!slug) return false;
  const normalized = normalizeSlug(slug);
  const prefixes = DOMAIN_ALLOWED_PREFIXES[domain] || [];
  return prefixes.some((prefix) => normalized.startsWith(prefix));
};

// const deriveSearchPhrase = (topic: string, domain: string) => {
//   const key = topic.trim().toLowerCase();
//   const override = SEARCH_PHRASE_OVERRIDES[key];
//   if (override) return override;
//   switch (domain) {
//     case 'moon':
//       return `${key} meaning`;
//     case 'tarot':
//       return `${key} meaning`;
//     case 'crystals':
//       return `${key} meaning`;
//     case 'numerology':
//       return `${key} meaning`;
//     case 'rituals':
//       return `${key} explained`;
//     case 'astrology':
//     default:
//       return `${key} explained`;
//   }
// };

const toHashtag = (value: string) =>
  `#${value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join('')}`;

const extractFactsFromData = (data: Record<string, any> | null) => {
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

const extractExamplesFromData = (
  topic: string,
  data: Record<string, any> | null,
) => {
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
  const contentDomain = CATEGORY_DOMAIN_MAP[theme.category] || 'astrology';
  const searchKeyword = deriveSearchKeyword(topic);
  const displayTitle = formatCaptionTitle(topic);
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
  const meta = CATEGORY_META[theme.category] || {
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
    searchKeyword,
    displayTitle,
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

// const POST_TYPE_SPECS: Record<SocialPostType, string> = {
//   educational:
//     '4-6 short lines, open with a subtle hook, include two facts, add one practical note, end with a soft invitation to save or note the idea.',
//   educational_intro:
//     '2-3 sentences: define the topic, explain why it matters, optionally close with "save this" or similar.',
//   educational_deep_1:
//     '3-5 sentences focused on nuance, misconception, or the mechanics of how it works; avoid repeating intro phrasing.',
//   educational_deep_2:
//     '3-5 sentences focused on application, timing, or a concrete example; keep journalling language minimal unless the topic is about reflection.',
//   educational_deep_3:
//     '3-5 sentences offering a fresh angle, contrast, or synthesis beyond the intro.',
//   question:
//     'Ask one sentence (no follow-up) about lived experience or patterns related to the topic; avoid asking "What is..." or repeating the keyword.',
//   persona:
//     'Start with "dear ..." line, follow with inclusive tone, 2-3 sentences, no promo.',
//   closing_statement:
//     '1-2 declarative sentences expressing a grounded belief; no CTA or hashtags.',
//   closing_ritual:
//     '2-4 sentences for gentle ritual closure; journalling language is acceptable here.',
// };

const buildEducationalPrompt = (pack: SourcePack) => {
  const domainInstruction =
    DOMAIN_DESCRIPTIONS[pack.contentDomain] ||
    'Stick closely to the specified domain and avoid unrelated references.';
  const anchorInstruction = pack.needsContext
    ? `First sentence must explicitly anchor the topic to ${pack.categoryLabel.toLowerCase()} (e.g., "In ${pack.categoryLabel.toLowerCase()}, ...").`
    : `Interpret the topic only within ${pack.categoryLabel.toLowerCase()} and avoid drifting into unrelated domains.`;
  const journalingInstruction = pack.allowJournaling
    ? 'Journalling or affirmation language is acceptable for this reflective piece.'
    : 'Do not invite journalling or use affirmation language; keep the tone practical.';
  const constraintList = pack.constraints
    .map((constraint) => `- ${constraint}`)
    .join('\n');
  const contextInstruction = pack.needsContext
    ? `Sentence one must mention ${pack.categoryLabel.toLowerCase()} ${pack.categoryContextClause} while introducing why ${pack.displayTitle} matters.`
    : `Sentence one should state what ${pack.displayTitle} explains and why it matters.`;
  const discoveryKeywords = pack.relatedKeywords
    .map((keyword) => keyword.toLowerCase())
    .filter((keyword) => keyword && keyword !== pack.topic.toLowerCase())
    .slice(0, 2);
  const discoveryInstruction = discoveryKeywords.length
    ? `Include 1-2 discovery keywords naturally (e.g. ${discoveryKeywords.join(', ')}).`
    : 'Include at least one discovery keyword like "astrology" or "lunar timing" when natural.';
  const structureNote =
    'Avoid repeating the same sentence pattern across posts and do not open with a generic phrase such as "The phases of the Moon...". Focus on a single concrete idea (timing, visibility, transition, pause, culmination) and conclude with an observational statement.';
  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);
  const nonDeterministicNote =
    'Avoid deterministic claims. Use soft language like "can", "tends to", "may", "often", "influences", "highlights".';
  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;
  const closingParticipationNote = [
    'closing_statement',
    'closing_ritual',
    'persona',
  ].includes(pack.postType)
    ? `${CLOSING_PARTICIPATION_INSTRUCTION}\n`
    : '';
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(pack.platform);

  return `You are writing social copy for Lunary. Use UK English, stay calm, and keep the tone educational.
Keyword reference (first line added later): ${pack.displayTitle}
${domainInstruction}
${anchorInstruction}
${journalingInstruction}
${contextInstruction}
${discoveryInstruction}
${structureNote}
${nonDeterministicNote}
${guardrailNote}
${closingParticipationNote}
${styleGuidance}
${buildScopeGuard(pack.topicTitle)}
${noveltyNote}

sourcePack:
- topicTitle: ${pack.topicTitle}
- theme: ${pack.theme}
- platform: ${pack.platform}
- postType: ${pack.postType}
- categoryLabel: ${pack.categoryLabel}
- grimoireSnippets:
${pack.grimoireSnippets.map((snippet) => `  - ${snippet}`).join('\\n')}
- tone: ${pack.tone}
constraints:
${constraintList}

Structure guidance:
- Provide 2-3 short sentences (no bullet list), each focused on one concrete idea (timing, visibility, transition, pause, culmination).
- Sentence one should open with the idea above and avoid filler phrases (no "What it is"/"Why it matters").
- Sentence two should add a concrete detail or observation; sentence three (optional) may add a second nuance but keep it observational.
- End with an observational statement rather than advice or actions.
- Do not include CTA phrases; they will be added separately after generation.
- Avoid repeating the topic more than twice per 200 characters.

Return strict JSON:
{
  "content": "string",
  "hashtags": ["string", "string"],
  "title": "optional string",
  "safetyChecks": ["truncation", "repetition", "missing_keyword"]
}`;
};

type VideoCaptionResponse = {
  bodyLines?: string[];
  hashtags?: string[];
  safetyChecks?: string[];
};

const buildVideoCaptionPrompt = (pack: SourcePack) => {
  const domainInstruction =
    DOMAIN_DESCRIPTIONS[pack.contentDomain] ||
    'Stay within the specified domain and avoid unrelated references.';
  const anchorInstruction = pack.needsContext
    ? `Line one must explicitly anchor the topic to ${pack.categoryLabel.toLowerCase()} (e.g., "In ${pack.categoryLabel.toLowerCase()}, ...").`
    : `Interpret the topic only within ${pack.categoryLabel.toLowerCase()} and avoid drifting into unrelated domains.`;
  const constraintList = pack.constraints
    .map((constraint) => `- ${constraint}`)
    .join('\n');
  const contextInstruction = pack.needsContext
    ? `Line one must mention ${pack.categoryLabel.toLowerCase()} ${pack.categoryContextClause} while explaining what ${pack.displayTitle} illuminates.`
    : `Line one should introduce what ${pack.displayTitle} means and why it matters.`;
  const discoveryKeywords = pack.relatedKeywords
    .map((keyword) => keyword.toLowerCase())
    .filter((keyword) => keyword && keyword !== pack.topic.toLowerCase())
    .slice(0, 2);
  const discoveryInstruction = discoveryKeywords.length
    ? `Include 1-2 discovery keywords naturally (for example: ${discoveryKeywords.join(', ')}).`
    : 'Include a discovery term like "moon phases" or "astrology" if it fits.';
  const structureNote =
    'Keep each line distinct; do not reuse the same phrasing or start with a generic opener.';
  const nonDeterministicNote =
    'Avoid deterministic claims. Use soft language like "can", "tends to", "may", "often", "influences", "highlights".';
  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);
  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(pack.platform);

  return `You are writing a search-optimized caption for Lunary in UK English to pair with the short-form video script. Focus on "${pack.topicTitle}" and keep the style informative and calm.
Keyword reference (displayTitle added separately): ${pack.displayTitle}
${domainInstruction}
${anchorInstruction}
${contextInstruction}
${discoveryInstruction}
${structureNote}
${nonDeterministicNote}
${guardrailNote}
${styleGuidance}
${buildScopeGuard(pack.topicTitle)}
${noveltyNote}
Do not include hashtags or CTA phrases; those will be added later.

sourcePack:
- topicTitle: ${pack.topicTitle}
- categoryLabel: ${pack.categoryLabel}
- grimoireSnippets:
${pack.grimoireSnippets.map((snippet) => `  - ${snippet}`).join('\\n')}
- constraints:
${constraintList}

Return strict JSON only:
{
  "bodyLines": [
    "Line 1: Definition or context that includes the keyword once",
    "Line 2: Practical relevance or example",
    "Line 3: Brief action or reflection prompt"
  ],
  "hashtags": ["#keyword1", "#keyword2"],
  "safetyChecks": ["truncation", "repetition", "missing_keyword"]
}`;
};

const buildQuestionPrompt = (pack: SourcePack) => {
  const domainInstruction =
    DOMAIN_DESCRIPTIONS[pack.contentDomain] ||
    'Stay within the specified domain and avoid unrelated references.';
  const anchorInstruction = pack.needsContext
    ? `Line 1 must explicitly anchor the topic to ${pack.categoryLabel.toLowerCase()} (e.g., "In ${pack.categoryLabel.toLowerCase()}, ...").`
    : `Interpret the topic only within ${pack.categoryLabel.toLowerCase()} and avoid drifting into unrelated domains.`;
  const discoveryKeywords = pack.relatedKeywords
    .map((keyword) => keyword.toLowerCase())
    .filter((keyword) => keyword && keyword !== pack.topic.toLowerCase())
    .slice(0, 2);
  const discoveryInstruction = discoveryKeywords.length
    ? `Include 1-2 discovery keywords naturally (e.g. ${discoveryKeywords.join(', ')}).`
    : 'Include a discovery term like "astrology" or "lunar timing" when natural.';
  const noveltyNote = buildNoveltyInstruction(pack.noveltyContext);
  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;
  const styleGuidance = SOCIAL_POST_STYLE_INSTRUCTION(pack.platform);
  return `Write a question post for Lunary in UK English about "${pack.topicTitle}".
${domainInstruction}
${anchorInstruction}
${discoveryInstruction}
${buildScopeGuard(pack.topicTitle)}
Avoid deterministic claims; use soft language like "can", "tends to", "may", "often", "influences", "highlights".
${guardrailNote}
${styleGuidance}
${noveltyNote}

Schema:
- Line 1: one direct question ending with "?"
- Line 2 (optional): a short reply prompt (max 7 words) to encourage replies

Rules:
- No "What is..." openings.
- Do not repeat the main keyword more than once.
- No hashtags, emojis, or CTA fluff.

Return strict JSON:
{"content":"Line 1\\nLine 2 (optional)","hashtags":["string","string"],"safetyChecks":["truncation","repetition","missing_keyword"]}`;
};

const buildPrompt = (pack: SourcePack) =>
  pack.postType === 'video_caption'
    ? buildVideoCaptionPrompt(pack)
    : pack.postType === 'question'
      ? buildQuestionPrompt(pack)
      : buildEducationalPrompt(pack);

type VideoCaptionValidation = {
  issues: string[];
  lines: string[];
};

const validateVideoCaptionResponse = (
  lines: string[],
  pack: SourcePack,
): VideoCaptionValidation => {
  const sanitizedLines = (lines || [])
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const issues: string[] = [];

  if (sanitizedLines.length < 2) {
    issues.push('Need at least 2 caption lines after the search phrase');
  }
  if (sanitizedLines.length > 4) {
    issues.push('Use no more than 4 caption lines after the search phrase');
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
      if (lower.includes(phrase)) {
        issues.push(`Line includes banned phrase: ${phrase}`);
        break;
      }
    }
  });

  return {
    issues,
    lines: sanitizedLines,
  };
};

const hasInlineCTA = (line: string) =>
  CTA_PHRASES.has(line) ||
  /\b(save|share|comment|follow|bookmark|read more|explore|learn more)\b/i.test(
    line,
  );

const buildCaptionContent = (
  pack: SourcePack,
  lines: string[],
  safetyChecks?: string[],
): SocialCopyResult => {
  const sanitizedLines = lines
    .slice(0, 4)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^#\w+/.test(line))
    .filter((line) => !CTA_PHRASES.has(line));
  const curatedHashtags = buildCuratedHashtags(pack);
  const hashtagsLine = curatedHashtags.join(' ');
  const includeCTA =
    !['question', 'persona', 'closing_statement', 'closing_ritual'].includes(
      pack.postType,
    ) && !sanitizedLines.some(hasInlineCTA);
  const contentLines = [
    pack.displayTitle,
    ...sanitizedLines,
    includeCTA ? pickCTA() : '',
  ]
    .filter(Boolean)
    .map((line) => line.replace(/\s+/g, ' ').trim());
  const outputLines = hashtagsLine
    ? [...contentLines, hashtagsLine]
    : contentLines;
  return {
    content: outputLines.join('\n'),
    hashtags: curatedHashtags,
    safetyChecks: safetyChecks || [],
  };
};

export async function generateSocialCopy(
  pack: SourcePack,
  retryNote?: string,
): Promise<SocialCopyResult> {
  const openai = getOpenAI();
  const requestCopy = async (note?: string) => {
    const prompt = buildPrompt(pack);
    const retrySuffix = note ? `\nFix: ${note}` : '';
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You write concise social copy in UK English. Return valid JSON only.',
        },
        { role: 'user', content: `${prompt}${retrySuffix}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 600,
    });
    const raw = completion.choices[0]?.message?.content || '';
    return JSON.parse(raw);
  };

  if (pack.postType === 'video_caption') {
    let response = (await requestCopy(retryNote)) as VideoCaptionResponse;
    let validation = validateVideoCaptionResponse(
      response.bodyLines || [],
      pack,
    );
    if (validation.issues.length > 0) {
      response = (await requestCopy(
        validation.issues.join('; '),
      )) as VideoCaptionResponse;
      validation = validateVideoCaptionResponse(response.bodyLines || [], pack);
    }
    if (validation.issues.length > 0) {
      const fallback = buildFallbackCopy(pack);
      return {
        content: fallback.content,
        hashtags: fallback.hashtags,
        title: fallback.title,
        safetyChecks: fallback.safetyChecks,
      };
    }
    return buildCaptionContent(pack, validation.lines, response.safetyChecks);
  }

  const validateQuestionContent = (text: string) => {
    const issues: string[] = [];
    const lines = normalizeQuestionLines(text);
    if (!lines[0]) {
      issues.push('Missing question line');
      return { issues, lines };
    }
    if (!isQuestionLine(lines[0])) {
      issues.push('Line 1 must be a direct question ending with "?"');
    }
    if (lines.length > 2) {
      issues.push('Use at most 2 lines');
    }
    if (lines[1] && lines[1].split(/\s+/).length > 7) {
      issues.push('Line 2 too long');
    }
    if (hasOffDomainKeyword(text)) {
      issues.push('Contains off-domain keywords');
    }
    return { issues, lines };
  };

  const response = (await requestCopy(retryNote)) as any;
  let content = String(response.content || '').trim();
  if (pack.postType === 'question') {
    let validation = validateQuestionContent(content);
    if (validation.issues.length > 0) {
      const retry = (await requestCopy(validation.issues.join('; '))) as any;
      content = String(retry.content || '').trim();
      validation = validateQuestionContent(content);
    }
    if (validation.issues.length > 0) {
      const fallbackQuestion = `What do you notice most about ${pack.topicTitle.toLowerCase()}?`;
      const fallbackPrompt = 'Share one specific moment.';
      content = `${fallbackQuestion}\n${fallbackPrompt}`;
    }
  }
  content = normalizeGeneratedContent(content, {
    topicLabel: pack.topicTitle,
  });
  const title = response.title ? String(response.title).trim() : undefined;
  const safetyChecks = Array.isArray(response.safetyChecks)
    ? response.safetyChecks.map((flag: string) => String(flag))
    : [];
  const curatedHashtags = buildCuratedHashtags(pack);
  return { content, hashtags: curatedHashtags, title, safetyChecks };
}

export function validateSocialCopy(content: string, topic: string): string[] {
  const reasons: string[] = [];
  const lower = content.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
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
  return reasons;
}

export function buildFallbackCopy(pack: SourcePack): SocialCopyResult {
  const curatedHashtags = buildCuratedHashtags(pack);
  const safeSentence = (text: string) => sentenceSafe(text);
  const joinSentences = (lines: string[]) =>
    lines.map((line) => safeSentence(line)).join(' ');
  const lowerFirst = (text: string) =>
    text.charAt(0).toLowerCase() + text.slice(1);
  const baseDefinition = safeSentence(
    pack.grimoireFacts[0] ||
      pack.grimoireExamples[0] ||
      `${pack.topicTitle} offers a grounded lens worth noticing.`,
  );
  const detailSentence = safeSentence(
    pack.grimoireFacts[1] ||
      pack.grimoireExamples[1] ||
      `${pack.topicTitle} reveals how timing and meaning align.`,
  );
  const exampleSentence = safeSentence(
    pack.grimoireExamples[0] ||
      `Notice how ${pack.topicTitle.toLowerCase()} shows up this week.`,
  );
  const nuanceSentence = safeSentence(
    pack.grimoireFacts[2] ||
      `${pack.topicTitle} often resurfaces when patterns repeat across days.`,
  );
  const actionSentence = safeSentence(
    pack.grimoireExamples[1] ||
      `Try naming one moment where this energy feels notably present.`,
  );
  const keywordSentence = safeSentence(
    pack.relatedKeywords[0]
      ? `Watch for ${pack.relatedKeywords[0]} as the surrounding language settles.`
      : `Watch for consistent cues as this energy settles.`,
  );
  const patternSentence = safeSentence(
    pack.grimoireExamples[2] ||
      `Track how this cycle shows up in rituals or routine conversations.`,
  );
  const domainSentence =
    pack.needsContext && pack.categoryContextClause
      ? `In ${pack.categoryLabel.toLowerCase()} ${pack.categoryContextClause}, ${lowerFirst(
          baseDefinition,
        )}`
      : baseDefinition;
  const includeCTA = ![
    'question',
    'persona',
    'closing_statement',
    'closing_ritual',
  ].includes(pack.postType);
  const ctaLine = includeCTA ? pickCTA() : '';
  const withOptionalCTA = (lines: string[]) => {
    const merged = lines
      .filter(Boolean)
      .map((line) => line.replace(/\s+/g, ' ').trim());
    if (ctaLine) {
      merged.push(ctaLine);
    }
    return joinSentences(merged);
  };

  switch (pack.postType) {
    case 'educational': {
      const content = withOptionalCTA([
        domainSentence,
        detailSentence,
        exampleSentence,
      ]);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'educational_intro': {
      const content = withOptionalCTA([domainSentence, detailSentence]);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'educational_deep_1': {
      const content = withOptionalCTA([detailSentence, nuanceSentence]);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'educational_deep_2': {
      const content = withOptionalCTA([
        keywordSentence,
        actionSentence,
        patternSentence,
      ]);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'educational_deep_3': {
      const content = withOptionalCTA([
        detailSentence,
        exampleSentence,
        baseDefinition,
      ]);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'question': {
      const content = `Which part of this rhythm do you actually sense first—tension, release, or the pause before the shift?`;
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'persona': {
      const content = `dear astrology lovers, moon watchers, and cosmic wanderers\nThis space is for people who want grounded clarity on ${pack.topicTitle.toLowerCase()}.`;
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'closing_statement': {
      const content = safeSentence(baseDefinition);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'closing_ritual': {
      const content = withOptionalCTA([
        `Close the day with ${pack.topicTitle.toLowerCase()} in mind.`,
        exampleSentence,
      ]);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'video_caption': {
      const videoLines = [
        `${pack.topicTitle} describes ${baseDefinition.replace(/^[A-Z]/, (c) =>
          c.toLowerCase(),
        )}`,
        `It matters because ${detailSentence.replace(/^[A-Z]/, (c) =>
          c.toLowerCase(),
        )}`,
        exampleSentence,
      ];
      const caption = buildCaptionContent(pack, videoLines);
      return {
        content: normalizeGeneratedContent(caption.content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: caption.hashtags,
        title: caption.title,
        safetyChecks: caption.safetyChecks,
      };
    }
    default: {
      const content = withOptionalCTA([detailSentence, exampleSentence]);
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
  }
}

export function applyPlatformFormatting(
  content: string,
  platform: string,
): string {
  const max = MAX_CHARS[platform] || 450;
  const normalized = normalizeHashtagsForPlatform(content, platform);
  const trimmed = trimToMaxChars(normalized, max);
  if (platform === 'twitter' || platform === 'bluesky') {
    return trimmed
      .replace(/\n{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return trimmed.trim();
}
