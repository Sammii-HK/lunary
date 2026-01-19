import { categoryThemes } from './weekly-themes';
import { getGrimoireSnippetBySlug } from './grimoire-content';

type VideoCaptionInput = {
  themeName?: string | null;
  facetTitle: string;
  partNumber?: number | null;
  totalParts?: number | null;
  scriptText?: string | null;
};

const FALLBACK_DEFINITIONS: Record<string, string> = {};

const TRUNCATION_PATTERNS = [
  /\bthe\.$/i,
  /\beach\.$/i,
  /\bbegin at\.$/i,
  /\bcrosses the\.$/i,
  /\band the\.$/i,
];

const hasTruncationArtifact = (text: string) =>
  TRUNCATION_PATTERNS.some((pattern) => pattern.test(text.trim()));

function extractFirstSentence(text: string): string {
  const cleaned = text
    .replace(/^\s*Welcome to Part\s+\d+\s+of\s+\d+[:.]?\s*/i, '')
    .replace(/^\s*Part\s+\d+\s+of\s+\d+[:.]?\s*/i, '')
    .trim();
  const protectedText = cleaned.replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2');
  const match = protectedText.match(/[^.!?]+[.!?]/);
  if (match && match[0]) {
    return match[0].replace(/<DECIMAL>/g, '.').trim();
  }
  return cleaned.split('\n')[0]?.trim() || cleaned.slice(0, 160).trim();
}

const normaliseTopic = (topic: string) =>
  topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const ensureSentence = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const buildDefinition = (topic: string, fallback: string) => {
  const definition =
    fallback || 'describes a timing marker that helps track cycles';
  return ensureSentence(`${topic} ${definition}`.trim());
};

const extractDefinition = (scriptText?: string | null) => {
  if (!scriptText) return '';
  const first = extractFirstSentence(scriptText);
  if (hasTruncationArtifact(first)) return '';
  return ensureSentence(first);
};

const getSearchPhrase = (topic: string, category?: string) => {
  const key = normaliseTopic(topic);
  switch (category) {
    case 'zodiac':
      return `${key} explained`;
    case 'tarot':
      return `${key} meaning`;
    case 'crystals':
      return `${key} meaning`;
    case 'numerology':
      return `${key} meaning`;
    case 'chakras':
      return `${key} meaning`;
    case 'sabbat':
      return `${key} explained`;
    case 'lunar':
      return `${key} meaning`;
    case 'planetary':
      return `what is ${key}`;
    default:
      return `${key} meaning`;
  }
};

export function buildVideoCaption({
  themeName,
  facetTitle,
  partNumber,
  totalParts,
  scriptText,
}: VideoCaptionInput): string {
  const theme = themeName
    ? categoryThemes.find((candidate) => candidate.name === themeName)
    : undefined;
  const facet = theme?.facets.find(
    (candidate) => candidate.title === facetTitle,
  );
  void partNumber;
  void totalParts;

  const searchPhrase = getSearchPhrase(facetTitle, theme?.category);
  const fallbackDefinition = FALLBACK_DEFINITIONS[normaliseTopic(facetTitle)];
  const normalizedSlug = facet?.grimoireSlug?.includes('#')
    ? facet.grimoireSlug.replace('#', '/')
    : facet?.grimoireSlug || '';
  const snippet = normalizedSlug
    ? getGrimoireSnippetBySlug(normalizedSlug)
    : null;
  const sourceSummary =
    snippet?.summary || snippet?.fullContent?.description || '';
  const sourceKeywords =
    snippet?.keyPoints || snippet?.fullContent?.keywords || [];

  const definition =
    (sourceSummary && !hasTruncationArtifact(sourceSummary)
      ? sourceSummary.trim()
      : '') ||
    (facet?.focus && !hasTruncationArtifact(facet.focus)
      ? facet.focus.trim()
      : '') ||
    (facet?.shortFormHook && !hasTruncationArtifact(facet.shortFormHook)
      ? facet.shortFormHook.trim()
      : '') ||
    extractDefinition(scriptText) ||
    buildDefinition(facetTitle, fallbackDefinition);
  const definitionBase = definition.replace(/[.!?]+$/, '').trim();
  const lineTwo = definitionBase
    .toLowerCase()
    .startsWith(facetTitle.toLowerCase())
    ? ensureSentence(definitionBase)
    : buildDefinition(facetTitle, definitionBase);
  const keywordList = Array.isArray(sourceKeywords)
    ? sourceKeywords.filter(Boolean).slice(0, 2)
    : [];
  const lineThree =
    keywordList.length > 0
      ? ensureSentence(
          `In practice, ${facetTitle.toLowerCase()} is often linked to ${keywordList
            .join(' and ')
            .toLowerCase()}`,
        )
      : ensureSentence(
          `In practice, try noting how ${facetTitle.toLowerCase()} shows up this week`,
        );
  return [searchPhrase, lineTwo, lineThree].join('\n');
}
