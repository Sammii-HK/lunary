import { getThematicImageUrl } from '@/lib/social/educational-images';
import type { DailyFacet, WeeklyTheme } from '@/lib/social/weekly-themes';
import { getPaletteHighlightColor } from '../../../utils/og/symbols';

const CHAPTER_LABELS = ['Context', 'Significance', 'Reflection'];

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Chiron',
  'North Node',
  'South Node',
];

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'was',
  'were',
  'with',
]);

const splitSentences = (text: string) => {
  const protectedText = text.replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2');
  const sentences =
    protectedText.match(/[^.!?]+[.!?]/g)?.map((s) => s.trim()) || [];
  const restored = sentences.map((sentence) =>
    sentence.replace(/<DECIMAL>/g, '.'),
  );
  if (restored.length > 0) {
    return restored;
  }
  const fallback = protectedText.replace(/<DECIMAL>/g, '.').trim();
  return fallback ? [fallback] : [];
};

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const estimateDurationSeconds = (text: string, wps = 2.6) =>
  Math.max(8, countWords(text) / wps);

const countBlankLinesBeforeLastSentence = (text: string) => {
  const lines = text.split('\n');
  let lastContentIndex = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].trim()) {
      lastContentIndex = i;
      break;
    }
  }
  if (lastContentIndex <= 0) {
    return 0;
  }

  let blankCount = 0;
  for (let i = lastContentIndex - 1; i >= 0; i -= 1) {
    if (lines[i].trim()) {
      break;
    }
    blankCount += 1;
  }
  return blankCount;
};

function extractHighlightTerms(script: string, facet: DailyFacet): string[] {
  const terms = new Set<string>();
  const text = script;

  for (const planet of PLANETS) {
    if (new RegExp(`\\b${planet}\\b`, 'i').test(text)) {
      terms.add(planet);
    }
  }
  for (const sign of ZODIAC_SIGNS) {
    if (new RegExp(`\\b${sign}\\b`, 'i').test(text)) {
      terms.add(sign);
    }
  }

  const dateMatches =
    text.match(
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b/gi,
    ) || [];
  dateMatches.forEach((match) => terms.add(match));

  if (facet.title) {
    terms.add(facet.title);
  }

  return Array.from(terms).slice(0, 8);
}

function findFirstMatch(text: string, candidates: string[]): string | null {
  for (const candidate of candidates) {
    const regex = new RegExp(`\\b${candidate}\\b`, 'i');
    if (regex.test(text)) {
      return candidate;
    }
  }
  return null;
}

function getHighlightFallbackTerm(
  script: string,
  hookSentence: string,
  facet: DailyFacet,
): string | null {
  const remainder = script.replace(hookSentence, '').trim();
  if (!remainder) {
    return null;
  }

  const dateMatch =
    remainder.match(
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b/i,
    ) || null;
  if (dateMatch) {
    return dateMatch[0];
  }

  const planetMatch = findFirstMatch(remainder, PLANETS);
  if (planetMatch) {
    return planetMatch;
  }

  const signMatch = findFirstMatch(remainder, ZODIAC_SIGNS);
  if (signMatch) {
    return signMatch;
  }

  if (
    facet.title &&
    !new RegExp(`\\b${facet.title}\\b`, 'i').test(hookSentence)
  ) {
    return facet.title;
  }

  const wordMatch = remainder.match(/[A-Za-z][A-Za-z'-]{2,}/);
  if (wordMatch) {
    const candidate = wordMatch[0];
    if (!STOPWORDS.has(candidate.toLowerCase())) {
      return candidate;
    }
  }
  return null;
}

function extractDataStamps(script: string): string[] {
  const stamps: string[] = [];
  const dateMatches =
    script.match(
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b/gi,
    ) || [];
  for (const match of dateMatches) {
    if (!stamps.includes(match)) {
      stamps.push(match);
    }
  }

  const planetSignMatches =
    script.match(
      /\b(?:Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)\s+in\s+(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/gi,
    ) || [];
  for (const match of planetSignMatches) {
    if (!stamps.includes(match)) {
      stamps.push(match);
    }
  }

  return stamps.slice(0, 2);
}

function buildSegments(script: string) {
  const sentences = splitSentences(script);
  if (sentences.length <= 2) {
    return [script.trim(), '', ''];
  }

  const hook = sentences[0] || '';
  const closeSentence = sentences[sentences.length - 1] || '';
  const middle = sentences.slice(1, sentences.length - 1).join(' ');

  return [hook, middle, closeSentence].map((s) => s.trim());
}

export function buildThematicVideoComposition({
  script,
  facet,
  theme,
  baseUrl,
  slug,
}: {
  script: string;
  facet: DailyFacet;
  theme: WeeklyTheme | undefined;
  baseUrl: string;
  slug: string;
}) {
  const category = theme?.category || 'lunar';
  const partNumber = (facet.dayIndex ?? 0) + 1;
  const totalParts = theme?.facets?.length || 7;
  const highlightColor = getPaletteHighlightColor(category) ?? '#5AD7FF';
  const [segmentA, segmentB, segmentC] = buildSegments(script);
  const durationEstimate = estimateDurationSeconds(script);
  const pauseBlocks = countBlankLinesBeforeLastSentence(script);
  const pauseSeconds = Math.min(1.8, pauseBlocks * 0.6);
  const segmentWordCounts = [
    countWords(segmentA),
    countWords(segmentB),
    countWords(segmentC),
  ];
  const totalSegmentWords =
    segmentWordCounts.reduce((sum, value) => sum + value, 0) || 1;
  const rawDurations = segmentWordCounts.map(
    (count) => (durationEstimate * count) / totalSegmentWords,
  );
  const minDurations = [3, 3, 2];
  const clampedDurations = rawDurations.map((value, index) =>
    Math.max(minDurations[index], value),
  );
  clampedDurations[1] += pauseSeconds;
  const clampedTotal = clampedDurations.reduce((sum, value) => sum + value, 0);
  const scale = clampedTotal > 0 ? durationEstimate / clampedTotal : 1;
  const segmentDurations = clampedDurations.map((value) => value * scale);

  const images = CHAPTER_LABELS.map((label, index) => {
    const subtitle = `Part ${partNumber} of ${totalParts}`;
    const url = getThematicImageUrl(
      category,
      facet.title,
      baseUrl,
      'tiktok',
      slug,
      subtitle,
      undefined,
      'story',
    );
    const startTime =
      segmentDurations.slice(0, index).reduce((sum, value) => sum + value, 0) ||
      0;
    const endTime = startTime + segmentDurations[index];
    return { url, startTime, endTime };
  });

  const topSubtitle = theme?.name || 'Weekly Theme';
  const overlays = [
    {
      text: topSubtitle,
      startTime: images[0].startTime,
      endTime: images[0].endTime,
      style: 'title' as const,
    },
    {
      text: CHAPTER_LABELS[1],
      startTime: images[1].startTime,
      endTime: images[1].endTime,
      style: 'chapter' as const,
    },
    {
      text: CHAPTER_LABELS[2],
      startTime: images[2].startTime,
      endTime: images[2].endTime,
      style: 'chapter' as const,
    },
  ];

  const stamps = extractDataStamps(script);
  const stampOverlays = stamps.map((text, index) => ({
    text,
    startTime: images[1].startTime + index * 1.4,
    endTime: images[1].startTime + index * 1.4 + 2.4,
    style: 'stamp' as const,
  }));

  const sentences = splitSentences(script);
  const hookSentence = sentences[0] || '';
  const rawHighlightTerms = extractHighlightTerms(script, facet);
  const filteredHighlightTerms = rawHighlightTerms.filter(
    (term) => !STOPWORDS.has(term.toLowerCase()),
  );
  if (filteredHighlightTerms.length === 0) {
    const fallbackTerm = getHighlightFallbackTerm(script, hookSentence, facet);
    if (fallbackTerm) {
      filteredHighlightTerms.push(fallbackTerm);
    } else if (rawHighlightTerms.length > 0) {
      filteredHighlightTerms.push(rawHighlightTerms[0]);
    }
  }

  return {
    images,
    overlays: [...overlays, ...stampOverlays],
    highlightTerms: filteredHighlightTerms,
    highlightColor,
    segments: [segmentA, segmentB, segmentC],
  };
}
