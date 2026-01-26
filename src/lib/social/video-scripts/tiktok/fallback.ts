/**
 * TikTok fallback script generation
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { ContentAspect } from '../../shared/types';
import { getSearchPhraseForTopic } from '../../shared/text/normalize';
import { hasTruncationArtifact } from '../../shared/text/truncation';
import { buildHookForTopic } from '../hooks';

/**
 * Build fallback short script when AI generation fails
 */
export function buildFallbackShortScript(
  facet: DailyFacet,
  grimoireData: Record<string, any> | null,
  angle: string,
  aspect: ContentAspect,
): string {
  const rawBase =
    grimoireData?.meaning ||
    grimoireData?.mysticalProperties ||
    grimoireData?.description ||
    facet.focus ||
    facet.shortFormHook;
  const base =
    rawBase && !hasTruncationArtifact(String(rawBase)) ? String(rawBase) : '';
  const lowerTopic = facet.title.toLowerCase();
  const searchPhrase = getSearchPhraseForTopic(facet.title);
  void searchPhrase;
  const hook = buildHookForTopic(facet.title, aspect);
  const context = `${facet.title} describes ${(
    base || 'how a pattern tends to express itself'
  )
    .replace(/[.!?]+$/, '')
    .toLowerCase()}.`;
  const takeaway = [
    grimoireData?.transitEffect,
    grimoireData?.houseMeaning,
    base,
  ]
    .filter(Boolean)
    .map((line) => String(line).trim())
    .slice(0, 2)
    .join(' ');
  const actionByAspect: Record<ContentAspect, string> = {
    [ContentAspect.CORE_MEANING]: `Notice where ${lowerTopic} shapes your focus today.`,
    [ContentAspect.COMMON_MISCONCEPTION]: `Look for ${lowerTopic} in what you repeat, not just what you claim.`,
    [ContentAspect.EMOTIONAL_IMPACT]: `Pay attention to the mood shift ${lowerTopic} brings.`,
    [ContentAspect.REAL_LIFE_EXPRESSION]: `Watch how ${lowerTopic} shows up in your routines.`,
    [ContentAspect.TIMING_AND_CONTEXT]: `Note when ${lowerTopic} feels more present than usual.`,
    [ContentAspect.PRACTICAL_APPLICATION]: `Make one small choice aligned with ${lowerTopic} today.`,
    [ContentAspect.WHEN_TO_AVOID]: `Pause if ${lowerTopic} feels rushed or brittle.`,
    [ContentAspect.SUBTLE_INSIGHT]: `Track the subtle signals ${lowerTopic} brings first.`,
  };
  const action =
    actionByAspect[aspect] || actionByAspect[ContentAspect.CORE_MEANING];
  const closing = 'Patterns make sense once you start noticing them.';
  const secondary = grimoireData?.meaning || grimoireData?.description || '';
  const lines = [
    context,
    takeaway || secondary || `It helps explain how ${lowerTopic} unfolds.`,
    `Look for ${lowerTopic} in the small, repeatable details.`,
    action,
    `Notice what shifts when you work with ${lowerTopic} intentionally.`,
    closing,
  ]
    .map((line) => line.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const scriptBody = lines.slice(0, 10).join('\n');
  return `${hook}\n\n${scriptBody}`.trim();
}

/**
 * Build TikTok hook from facet
 */
export function buildTikTokHook(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  const category = theme.category;

  if (data?.name && data?.keywords) {
    const keyword = data.keywords[0] || '';
    return `${data.name}. ${keyword}. This defines ${facet.title.toLowerCase()}.`;
  }

  switch (category) {
    case 'zodiac':
      return `${facet.title}. The foundation of astrological understanding.`;
    case 'tarot':
      return `${facet.title}. A symbolic key to deeper wisdom.`;
    case 'lunar':
      return `${facet.title}. The moon's influence on earthly rhythms.`;
    case 'planetary':
      return `${facet.title}. Celestial forces that shape human experience.`;
    case 'crystals':
      return `${facet.title}. Earth's concentrated energy in mineral form.`;
    case 'numerology':
      return `${facet.title}. Numbers carry vibrational significance.`;
    case 'chakras':
      return `${facet.title}. Energy centers governing mind and body.`;
    case 'sabbat':
      return `${facet.title}. A sacred marker on the wheel of the year.`;
    default:
      return `${facet.title}. Essential knowledge for understanding.`;
  }
}

/**
 * Build TikTok intro section
 */
export function buildTikTokIntro(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
): string {
  const themeIntro =
    partNumber === 1
      ? `Welcome to the ${theme.name} series. `
      : `Welcome back to our ${theme.name} series. `;

  if (data?.description) {
    const sentences = data.description.split(/[.!?]+/).filter(Boolean);
    const intro = sentences.slice(0, 2).join('. ') + '.';
    const detail = intro.length > 150 ? sentences[0] + '.' : intro;
    return `${themeIntro}${detail}`;
  }

  return `${themeIntro}${facet.focus}`;
}

/**
 * Build TikTok core content section
 */
export function buildTikTokCore(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  const points: string[] = [];

  if (data) {
    if (data.element) {
      points.push(`Element: ${data.element}.`);
    }
    if (data.ruler || data.rulingPlanet) {
      points.push(`Ruled by ${data.ruler || data.rulingPlanet}.`);
    }
    if (data.modality) {
      points.push(`${data.modality} modality.`);
    }
    if (data.keywords && Array.isArray(data.keywords)) {
      points.push(`Key themes: ${data.keywords.slice(0, 3).join(', ')}.`);
    }
    if (data.meaning || data.mysticalProperties) {
      const meaning = data.meaning || data.mysticalProperties;
      const shortened =
        meaning.length > 140 ? meaning.substring(0, 140) + '...' : meaning;
      points.push(shortened);
    }
    if (data.strengths && Array.isArray(data.strengths)) {
      points.push(
        `Strengths include ${data.strengths.slice(0, 2).join(' and ')}.`,
      );
    }
  }

  if (points.length < 2) {
    points.push(facet.focus);
  }

  return points.slice(0, 3).join(' ');
}

/**
 * Build TikTok takeaway section
 */
export function buildTikTokTakeaway(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  let takeaway = '';

  if (data?.affirmation) {
    takeaway = data.affirmation;
  } else {
    takeaway = facet.shortFormHook;
  }

  const seriesLine = `Part ${partNumber} of ${totalParts}: ${facet.title}. This week's theme: ${theme.name}.`;
  return `${takeaway}\n\n${seriesLine}`;
}

/**
 * Generate full TikTok script fallback
 */
export function generateTikTokScriptFallback(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  const hook = buildTikTokHook(facet, theme, grimoireData);
  const intro = buildTikTokIntro(facet, theme, grimoireData, partNumber);
  const core = buildTikTokCore(facet, theme, grimoireData);
  const takeaway = buildTikTokTakeaway(
    facet,
    theme,
    grimoireData,
    partNumber,
    totalParts,
  );

  return `${hook} ${intro} ${core} ${takeaway}`;
}
