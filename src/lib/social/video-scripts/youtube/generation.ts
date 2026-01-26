/**
 * YouTube script generation
 */

import { generateContent } from '@/lib/ai/content-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { ContentAspect } from '../../shared/types';
import { countWords, estimateDuration } from '../../shared/text/normalize';
import { hasDeterministicLanguage } from '../../shared/validation/deterministic-language';
import type { VideoScript, ScriptSection } from '../types';
import { getSafeGrimoireDataForFacet } from '../grimoire-helpers';
import { ensureVideoHook } from '../hooks';
import { sanitizeVideoScriptText } from '../sanitization';
import { capitalizeThematicTitle } from '../../../../../utils/og/text';
import { buildYouTubePrompt } from './prompts';
import { generateYouTubeScriptFallback } from './fallback';

/**
 * Parse script into sections for YouTube
 */
function parseScriptIntoSections(script: string): ScriptSection[] {
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
 * Check if hook needs rewriting
 */
function needsHookRewrite(sentence: string): boolean {
  return /^(welcome|welcome back|today|hello|hi|now|this|let's)/i.test(
    sentence,
  );
}

/**
 * Build YouTube hook sentence
 */
function buildYouTubeHookSentence(theme: WeeklyTheme): string {
  const snippet =
    theme.description
      ?.split(/[.!?]/)
      .find((segment) => segment.trim().length > 0) || theme.name;
  const normalized = snippet.trim().toLowerCase();
  const base = normalized.length > 0 ? normalized : theme.name.toLowerCase();
  const cleanSubject = base.replace(/^\s+|\s+$/g, '');
  return `Understanding ${cleanSubject} reveals why ${theme.name.toLowerCase()} matters.`;
}

/**
 * Ensure hook is first sentence
 */
function ensureHookFirstSentence(text: string, theme: WeeklyTheme): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const firstSentenceMatch = trimmed.match(/^[^.!?]+[.!?]/);
  if (!firstSentenceMatch) return text;

  const firstSentence = firstSentenceMatch[0].trim();
  if (!needsHookRewrite(firstSentence)) {
    return text;
  }

  const rest = trimmed.slice(firstSentenceMatch[0].length).trim();
  const hookSentence = buildYouTubeHookSentence(theme);
  return rest ? `${hookSentence} ${rest}` : hookSentence;
}

/**
 * Generate YouTube cover image URL
 */
function generateYouTubeCoverUrl(
  theme: WeeklyTheme,
  baseUrl: string = '',
): string {
  const firstFacet = theme.facets[0];
  const slug =
    firstFacet?.grimoireSlug.split('/').pop() ||
    theme.name.toLowerCase().replace(/\s+/g, '-');
  const title = encodeURIComponent(capitalizeThematicTitle(theme.name));
  const subtitle = encodeURIComponent('Weekly Deep Dive');

  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=landscape&cover=youtube`;
}

/**
 * Generate YouTube script content using AI
 */
async function generateYouTubeScriptContent(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): Promise<string> {
  const prompt = buildYouTubePrompt(theme, facets, allData);

  const requestYouTubeScript = async (retryNote?: string) => {
    return generateContent({
      prompt,
      systemPrompt:
        'You are an educational content creator writing complete, flowing video scripts. Write in a natural, authoritative tone that flows smoothly when read aloud. The script must be complete and coherent - all sections must flow naturally into each other with smooth transitions. Make it educational and informative. Write as a continuous narrative, not fragmented sections.',
      model: 'quality',
      temperature: 0.7,
      maxTokens: 1400,
      retryNote,
    });
  };

  try {
    let script = await requestYouTubeScript();
    if (!script || script.trim().length === 0) {
      throw new Error('AI returned empty script');
    }

    script = normalizeGeneratedContent(script.trim(), {
      topicLabel: theme.name,
    });

    // Clean up any section markers
    script = script
      .replace(/\[.*?\]/g, '')
      .replace(/\n\n---\n\n/g, '\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Ensure outro is included
    if (
      !script.toLowerCase().includes('lunary') &&
      !script.toLowerCase().includes('until next time')
    ) {
      script += `\n\nFor deeper exploration of ${theme.name.toLowerCase()} and related topics, the Lunary Grimoire offers comprehensive reference material. It is freely available for those who wish to continue their study. Until next time.`;
    }

    if (hasDeterministicLanguage(script)) {
      script = await requestYouTubeScript(
        'Remove deterministic claims; use softer language (can, may, tends to, often, influences).',
      );
      script = script.trim();
    }

    const sanitizedScript = sanitizeVideoScriptText(script, {
      topic: theme.name,
      category: theme.category,
      sourceSnippet: theme.description || '',
      fallbackSource: theme.description || '',
    });
    const normalizedScript = ensureHookFirstSentence(sanitizedScript, theme);
    return normalizedScript;
  } catch (error) {
    console.error('Failed to generate YouTube script with AI:', error);
    const fallback = generateYouTubeScriptFallback(theme, facets, allData);
    const sanitizedFallback = sanitizeVideoScriptText(fallback, {
      topic: theme.name,
      category: theme.category,
      sourceSnippet: theme.description || '',
      fallbackSource: theme.description || '',
    });
    return ensureHookFirstSentence(sanitizedFallback, theme);
  }
}

/**
 * Generate YouTube video script
 */
export async function generateYouTubeScript(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  weekStartDate: Date,
  baseUrl: string = '',
): Promise<VideoScript> {
  const allData = facets.map((f) => ({
    facet: f,
    data: getSafeGrimoireDataForFacet(f, theme.category),
  }));

  const rawScript = await generateYouTubeScriptContent(theme, facets, allData);
  const ensuredHook = ensureVideoHook(rawScript, {
    topic: theme.name,
    category: theme.category,
    source: 'generation',
    scheduledDate: weekStartDate,
  });
  const fullScript = ensuredHook.script;
  const hookVersion = ensuredHook.modified ? 2 : 1;

  const wordCount = countWords(fullScript);
  const sections = parseScriptIntoSections(fullScript);
  const coverImageUrl = generateYouTubeCoverUrl(theme, baseUrl);

  return {
    themeId: theme.id,
    themeName: theme.name,
    primaryThemeId: theme.id,
    facetTitle: `Weekly Deep Dive: ${theme.name}`,
    aspect: ContentAspect.CORE_MEANING,
    platform: 'youtube',
    sections,
    fullScript,
    wordCount,
    estimatedDuration: estimateDuration(wordCount),
    scheduledDate: weekStartDate,
    status: 'draft',
    coverImageUrl,
    hookText: ensuredHook.hook,
    hookVersion,
  };
}
