/**
 * Cosmic Forecast Video Script Generator
 *
 * Generates weekly cosmic forecast videos for YouTube:
 * - Moon phases → planetary transits → key aspects → weekly guidance
 * - Target: 5-10 minute video (750-1500 words)
 * - Uses the same cosmic data as the weekly blog
 */

import { generateContent } from '@/lib/ai/content-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import { ContentAspect } from '../../shared/types';
import { countWords, estimateDuration } from '../../shared/text/normalize';
import { hasDeterministicLanguage } from '../../shared/validation/deterministic-language';
import type { VideoScript, ScriptSection } from '../types';
import { sanitizeVideoScriptText } from '../sanitization';

interface CosmicData {
  moonPhases?: Array<{ phase: string; date: string; sign?: string }>;
  transits?: Array<{ planet: string; sign: string; date?: string }>;
  aspects?: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    date?: string;
  }>;
  retrogrades?: Array<{ planet: string; status: string }>;
  weekSummary?: string;
}

/**
 * Parse cosmic forecast script into sections
 */
function parseForecastSections(script: string): ScriptSection[] {
  const paragraphs = script.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const sections: ScriptSection[] = [];
  const wordsPerSecond = 2.5;

  for (const para of paragraphs) {
    const wordCount = countWords(para);
    const duration = wordCount / wordsPerSecond;
    sections.push({
      name: 'Section',
      duration: `${Math.round(duration)} seconds`,
      content: para.trim(),
    });
  }

  return sections.length > 0
    ? sections
    : [
        {
          name: 'Complete Script',
          duration: estimateDuration(countWords(script)),
          content: script,
        },
      ];
}

/**
 * Build prompt for cosmic forecast video
 */
function buildCosmicForecastPrompt(
  weekStartDate: Date,
  cosmicData: CosmicData,
): string {
  const weekStart = weekStartDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let dataContext = '';
  if (cosmicData.moonPhases?.length) {
    dataContext += `\nMoon Phases:\n${cosmicData.moonPhases.map((p) => `- ${p.phase}${p.sign ? ` in ${p.sign}` : ''} (${p.date})`).join('\n')}`;
  }
  if (cosmicData.transits?.length) {
    dataContext += `\nPlanetary Transits:\n${cosmicData.transits.map((t) => `- ${t.planet} in ${t.sign}${t.date ? ` (${t.date})` : ''}`).join('\n')}`;
  }
  if (cosmicData.aspects?.length) {
    dataContext += `\nKey Aspects:\n${cosmicData.aspects.map((a) => `- ${a.planet1} ${a.aspect} ${a.planet2}${a.date ? ` (${a.date})` : ''}`).join('\n')}`;
  }
  if (cosmicData.retrogrades?.length) {
    dataContext += `\nRetrogrades:\n${cosmicData.retrogrades.map((r) => `- ${r.planet}: ${r.status}`).join('\n')}`;
  }
  if (cosmicData.weekSummary) {
    dataContext += `\nWeek Summary: ${cosmicData.weekSummary}`;
  }

  return `Write a weekly cosmic forecast video script for ${weekStart} to ${weekEndStr}.

STRUCTURE (5-10 minutes, 750-1500 words):
1. Opening hook (1-2 sentences): What makes this week significant
2. Moon Phases: Current phase, what it means, when it shifts
3. Planetary Transits: Key planet movements and their themes
4. Aspects: Notable planetary interactions and their effects
5. Weekly Guidance: Practical advice for navigating the week
6. Closing: Encouraging wrap-up with a gentle call to explore further

COSMIC DATA:${dataContext || '\n(Use general astronomical awareness for this week)'}

TONE:
- Educational and grounding, not hype or fear-based
- Use "tends to", "may influence", "often associated with" — never "will cause" or "guarantees"
- UK English throughout
- Conversational but authoritative
- Connect cosmic events to everyday experience
- NO emojis, NO em dashes

Write as a continuous, flowing script suitable for narration. Do not include section headers or markers.`;
}

/**
 * Generate cosmic forecast cover image URL
 */
function generateForecastCoverUrl(
  weekStartDate: Date,
  baseUrl: string,
): string {
  const weekStr = weekStartDate.toISOString().split('T')[0];
  const title = encodeURIComponent('Weekly Cosmic Forecast');
  const subtitle = encodeURIComponent(
    weekStartDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
    }),
  );
  return `${baseUrl}/api/og/thematic?category=planetary&slug=cosmic-forecast&title=${title}&subtitle=${subtitle}&format=landscape&cover=youtube&v=2`;
}

/**
 * Generate a weekly cosmic forecast YouTube video script
 */
export async function generateCosmicForecast(
  weekStartDate: Date,
  cosmicData: CosmicData = {},
  baseUrl: string = '',
): Promise<VideoScript> {
  const prompt = buildCosmicForecastPrompt(weekStartDate, cosmicData);

  let script: string;

  try {
    script = await generateContent({
      prompt,
      systemPrompt:
        'You are an educational astrology content creator writing complete, flowing video scripts in UK English. Write in a natural, authoritative tone. The script must be educational and grounding. Never use deterministic language.',
      model: 'quality',
      temperature: 0.7,
      maxTokens: 2000,
    });

    if (!script || script.trim().length === 0) {
      throw new Error('AI returned empty cosmic forecast script');
    }

    script = normalizeGeneratedContent(script.trim(), {
      topicLabel: 'Cosmic Forecast',
    });

    // Clean up section markers
    script = script
      .replace(/\[.*?\]/g, '')
      .replace(/\n\n---\n\n/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (hasDeterministicLanguage(script)) {
      script = await generateContent({
        prompt,
        systemPrompt:
          'You are an educational astrology content creator. Remove deterministic claims; use softer language (can, may, tends to, often, influences).',
        model: 'quality',
        temperature: 0.7,
        maxTokens: 2000,
        retryNote: 'Remove deterministic claims; use softer language.',
      });
      script = script.trim();
    }

    script = sanitizeVideoScriptText(script, {
      topic: 'Cosmic Forecast',
      category: 'planetary',
      sourceSnippet: '',
      fallbackSource: '',
    });
  } catch (error) {
    console.error('Failed to generate cosmic forecast:', error);
    script = buildFallbackCosmicForecast(weekStartDate, cosmicData);
  }

  const wordCount = countWords(script);
  const sections = parseForecastSections(script);
  const coverImageUrl = generateForecastCoverUrl(weekStartDate, baseUrl);

  const scheduledDate = new Date(weekStartDate);
  scheduledDate.setDate(scheduledDate.getDate() + 6); // Sunday

  return {
    themeId: 'cosmic-forecast',
    themeName: 'Weekly Cosmic Forecast',
    primaryThemeId: 'cosmic-forecast',
    facetTitle: `Cosmic Forecast: ${weekStartDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`,
    aspect: ContentAspect.CORE_MEANING,
    platform: 'youtube',
    sections,
    fullScript: script,
    wordCount,
    estimatedDuration: estimateDuration(wordCount),
    scheduledDate,
    status: 'draft',
    coverImageUrl,
    hookText: script.split(/[.!?]/)[0]?.trim() || 'This week in the cosmos.',
    hookVersion: 1,
  };
}

/**
 * Fallback cosmic forecast when AI generation fails
 */
function buildFallbackCosmicForecast(
  weekStartDate: Date,
  cosmicData: CosmicData,
): string {
  const weekStart = weekStartDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  });

  let script = `This week starting ${weekStart} brings a blend of cosmic energies worth paying attention to.\n\n`;

  if (cosmicData.moonPhases?.length) {
    const phase = cosmicData.moonPhases[0];
    script += `The Moon moves through its ${phase.phase} phase${phase.sign ? ` in ${phase.sign}` : ''}, setting the emotional tone for the days ahead. This phase traditionally encourages ${phase.phase.toLowerCase().includes('new') ? 'fresh starts and intention-setting' : phase.phase.toLowerCase().includes('full') ? 'completion and release' : 'steady progress and reflection'}.\n\n`;
  }

  if (cosmicData.transits?.length) {
    const transit = cosmicData.transits[0];
    script += `${transit.planet} continues its passage through ${transit.sign}, influencing how we approach ${transit.planet === 'Mercury' ? 'communication and thinking' : transit.planet === 'Venus' ? 'relationships and values' : transit.planet === 'Mars' ? 'action and motivation' : 'broader life themes'}.\n\n`;
  }

  script += `As with all cosmic influences, these energies are invitations rather than instructions. Notice what resonates and let the rest pass. For deeper exploration, the Lunary Grimoire offers comprehensive reference material. Until next time.`;

  return script;
}
