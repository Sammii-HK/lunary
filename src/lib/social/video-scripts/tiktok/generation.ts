/**
 * TikTok script generation
 */

import {
  generateStructuredContent,
  VideoScriptSchema,
} from '@/lib/ai/content-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import { ContentAspect } from '../../shared/types';
import {
  countWords,
  estimateDuration,
  getSearchPhraseForTopic,
} from '../../shared/text/normalize';
import { hasTruncationArtifact } from '../../shared/text/truncation';
import {
  ensureSentenceEndsWithPunctuation,
  normalizeHookLine,
} from '../../shared/text/normalize';
import type { VideoScript, ScriptSection } from '../types';
import { mapAngleToAspect } from '../constants';
import { getSafeGrimoireDataForFacet } from '../grimoire-helpers';
import { getAngleForTopic } from '../rotation';
import {
  validateVideoHook,
  validateScriptBody,
  getCriticalIssues,
  getSoftIssuesAsFeedback,
  hasOnlySoftIssues,
} from '../validation';
import {
  buildHookForTopic,
  selectHookStyle,
  buildCommentBaitHook,
} from '../hooks';
import { sanitizeVideoScriptLines } from '../sanitization';
import {
  getContentTypeFromCategory,
  getPerformanceBiasedStructure,
} from '../content-type-voices';
import type { HookIntroVariant } from '../types';
import { buildTikTokPrompt } from './prompts';
import { buildFallbackShortScript } from './fallback';
import {
  generateTikTokMetadata,
  generateCoverImageUrl,
  generateTikTokCaption,
  shouldIncludeCta,
} from './metadata';
import { getOptimalPostingHour } from '@/utils/posting-times';

/**
 * Parse script into sections for metadata
 */
function parseScriptIntoSections(script: string): ScriptSection[] {
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const totalWords = countWords(script);

  if (sentences.length < 4) {
    return [
      {
        name: 'Complete Script',
        duration: estimateDuration(totalWords),
        content: script,
      },
    ];
  }

  const hookEnd = Math.ceil(sentences.length * 0.1);
  const introEnd = Math.ceil(sentences.length * 0.3);
  const coreEnd = Math.ceil(sentences.length * 0.85);

  const hook = sentences.slice(0, hookEnd).join('. ') + '.';
  const intro = sentences.slice(hookEnd, introEnd).join('. ') + '.';
  const core = sentences.slice(introEnd, coreEnd).join('. ') + '.';
  const takeaway = sentences.slice(coreEnd).join('. ') + '.';

  return [
    { name: 'Hook', duration: '3 seconds', content: hook },
    { name: 'Theme Intro', duration: '6 seconds', content: intro },
    { name: 'Core Content', duration: '20-25 seconds', content: core },
    { name: 'Takeaway', duration: '5 seconds', content: takeaway },
  ];
}

/**
 * Generate TikTok script content using AI
 */
async function generateTikTokScriptContent(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
  angle: string,
  aspect: ContentAspect,
): Promise<{ script: string; hook: string; scriptBody: string }> {
  const searchPhrase = getSearchPhraseForTopic(facet.title, theme.category);
  const prompt = buildTikTokPrompt(facet, theme, grimoireData, angle, aspect);

  const snippetSource =
    grimoireData?.description ||
    grimoireData?.meaning ||
    grimoireData?.focus ||
    facet.focus ||
    facet.shortFormHook ||
    '';

  const sanitizeLines = (rawLines: string[]) =>
    sanitizeVideoScriptLines(rawLines, {
      topic: facet.title,
      category: theme.category,
      sourceSnippet: snippetSource,
      fallbackSource: facet.focus || facet.shortFormHook || facet.title,
      allowTruncationFix: false,
    });

  const requestScriptOnce = async (retryNote?: string) => {
    const result = await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt:
        'You write TikTok scripts that teach without feeling like a lecture. Your scripts sound like a smart friend explaining something fascinating at a party — confident, specific, slightly provocative. Every line earns the next second of watch time. You never sound like a textbook, a motivational poster, or a horoscope app. You sound like someone who actually knows this topic and has a take on it.',
      model: 'quality',
      temperature: 0.7,
      maxTokens: 700,
      retryNote,
    });

    return result as {
      video?: {
        hook?: string;
        scriptBody?: string[];
      };
    };
  };

  try {
    let primary = await requestScriptOnce();
    let video = primary.video || {};
    let hook = String(video.hook || '').trim();
    let scriptBodyLines = Array.isArray(video.scriptBody)
      ? video.scriptBody.map((line) => String(line).trim()).filter(Boolean)
      : [];

    scriptBodyLines = sanitizeLines(scriptBodyLines);

    let hookIssues = validateVideoHook(hook, facet.title, searchPhrase);
    let bodyIssues = validateScriptBody(
      scriptBodyLines,
      facet.title,
      searchPhrase,
    );

    // Get critical vs soft issues
    const hookCritical = getCriticalIssues(hookIssues);
    const bodyCritical = getCriticalIssues(bodyIssues);
    const hasCriticalIssues =
      hookCritical.length > 0 || bodyCritical.length > 0;

    // Retry if there are ANY issues (critical or soft), giving feedback
    if (hookIssues.length > 0 || bodyIssues.length > 0) {
      // Build retry note with all feedback
      const retryParts: string[] = [];
      if (hookCritical.length > 0) {
        retryParts.push(`Hook MUST FIX: ${hookCritical.join('; ')}`);
      }
      if (bodyCritical.length > 0) {
        retryParts.push(`Body MUST FIX: ${bodyCritical.join('; ')}`);
      }
      // Add soft issues as suggestions
      const hookSoft = getSoftIssuesAsFeedback(hookIssues);
      const bodySoft = getSoftIssuesAsFeedback(bodyIssues);
      if (hookSoft) retryParts.push(`Hook suggestions: ${hookSoft}`);
      if (bodySoft) retryParts.push(`Body suggestions: ${bodySoft}`);

      const retryNote = retryParts.join('\n');
      primary = await requestScriptOnce(retryNote);
      video = primary.video || {};
      hook = String(video.hook || '').trim();
      scriptBodyLines = Array.isArray(video.scriptBody)
        ? video.scriptBody.map((line) => String(line).trim()).filter(Boolean)
        : [];
      scriptBodyLines = sanitizeLines(scriptBodyLines);
      hookIssues = validateVideoHook(hook, facet.title, searchPhrase);
      bodyIssues = validateScriptBody(
        scriptBodyLines,
        facet.title,
        searchPhrase,
      );
    }

    // After retry, only fallback on CRITICAL issues
    // Soft issues are OK - they're style preferences, not blockers
    const hookCriticalAfterRetry = getCriticalIssues(hookIssues);
    const bodyCriticalAfterRetry = getCriticalIssues(bodyIssues);

    let fallbackScript: string | null = null;

    // Only use fallback for CRITICAL failures after retry
    if (bodyCriticalAfterRetry.length > 0) {
      console.warn(
        `Video script CRITICAL validation failed: ${bodyCriticalAfterRetry.join('; ')}`,
        {
          facet: facet.title,
          angle,
          aspect,
        },
      );
      fallbackScript = buildFallbackShortScript(
        facet,
        grimoireData,
        angle,
        aspect,
      );
    } else if (hasOnlySoftIssues(bodyIssues)) {
      // Log soft issues but proceed with the script
      console.log(
        `Video script has minor style suggestions (proceeding): ${getSoftIssuesAsFeedback(bodyIssues)}`,
        {
          facet: facet.title,
        },
      );
    }

    const scriptBody = fallbackScript
      ? fallbackScript.split('\n\n')[1] || ''
      : scriptBodyLines
          .map((line) => line.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .join('\n');
    let hookLine: string;
    if (fallbackScript) {
      hookLine =
        fallbackScript.split('\n\n')[0]?.trim() ||
        ensureSentenceEndsWithPunctuation(
          normalizeHookLine(buildHookForTopic(facet.title, aspect)),
        );
    } else {
      // Only fallback hook if CRITICAL issues
      const finalHookIssues = validateVideoHook(
        hook,
        facet.title,
        searchPhrase,
      );
      const finalHookCritical = getCriticalIssues(finalHookIssues);
      hookLine =
        finalHookCritical.length === 0
          ? ensureSentenceEndsWithPunctuation(normalizeHookLine(hook))
          : ensureSentenceEndsWithPunctuation(
              normalizeHookLine(buildHookForTopic(facet.title, aspect)),
            );
    }
    const script = fallbackScript
      ? fallbackScript
      : `${hookLine}\n\n${scriptBody}`.trim();
    if (hasTruncationArtifact(script)) {
      throw new Error('Generated script contains truncation artifact');
    }
    return { script, hook: hookLine, scriptBody };
  } catch (error) {
    console.error('Failed to generate TikTok script with AI:', error);
    const fallback = buildFallbackShortScript(
      facet,
      grimoireData,
      angle,
      aspect,
    );
    const [fallbackHook, fallbackBody] = fallback.split('\n\n');
    return {
      script: fallback,
      hook: fallbackHook || '',
      scriptBody: fallbackBody || '',
    };
  }
}

/**
 * Generate TikTok video script
 */
export async function generateTikTokScript(
  facet: DailyFacet,
  theme: WeeklyTheme,
  scheduledDate: Date,
  partNumber: number = 1,
  totalParts: number = 3,
  baseUrl: string = '',
  options?: {
    primaryThemeId?: string;
    secondaryThemeId?: string;
    secondaryFacetSlug?: string;
    secondaryAngleKey?: string;
    secondaryAspectKey?: string;
    angleOverride?: string;
    aspectOverride?: ContentAspect;
  },
): Promise<VideoScript> {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 4;
  const grimoireData = getSafeGrimoireDataForFacet(facet, theme.category);
  const angle =
    options?.angleOverride ||
    (await getAngleForTopic(facet.title, scheduledDate));
  const aspect =
    options?.aspectOverride ||
    options?.secondaryAspectKey ||
    mapAngleToAspect(angle);

  const { script: rawScript, hook: generatedHook } =
    await generateTikTokScriptContent(
      facet,
      theme,
      grimoireData,
      safePartNumber,
      safeTotalParts,
      angle,
      aspect as ContentAspect,
    );
  const fullScript = normalizeGeneratedContent(rawScript.trim(), {
    topicLabel: facet.title,
  });
  const hookVersion = 1;

  // Funnel tier: secondary content is consideration, primary is discovery
  // (conversion is set by app-demo/comparison generators, not here)
  const targetAudience = (
    options?.secondaryThemeId ? 'consideration' : 'discovery'
  ) as 'discovery' | 'consideration' | 'conversion';

  // Performance tracking attributes
  const contentTypeKey = getContentTypeFromCategory(theme.category);
  const hookStyle = selectHookStyle(aspect as ContentAspect, targetAudience);
  const {
    name: scriptStructureName,
    isLoop: hasLoopStructure,
    isStitchBait: hasStitchBait,
  } = await getPerformanceBiasedStructure(contentTypeKey);

  // Hook intro animation variant (#7)
  const hookIntroVariants: HookIntroVariant[] = [
    'slide_up',
    'typewriter',
    'scale_pop',
  ];
  const hookIntroVariant: HookIntroVariant =
    hookIntroVariants[Math.floor(Math.random() * hookIntroVariants.length)];

  // Optimal posting hour from audience-based time window rotation
  const scheduledContentType =
    targetAudience === 'consideration'
      ? 'educational-deepdive'
      : 'primary-educational';
  const scheduledHour = getOptimalPostingHour({
    contentType: scheduledContentType,
    scheduledDate,
    topic: facet.title,
  });

  // CTA type: brand when CTA is included, engagement otherwise
  const ctaType: 'engagement' | 'brand' = shouldIncludeCta(
    targetAudience,
    scheduledDate,
  )
    ? 'brand'
    : 'engagement';

  const wordCount = countWords(fullScript);
  const sections = parseScriptIntoSections(fullScript);
  const metadata = generateTikTokMetadata(
    facet,
    theme,
    safePartNumber,
    safeTotalParts,
  );
  metadata.angle = angle;
  metadata.topic = facet.title;
  metadata.aspect = aspect;
  // Store tracking fields on metadata for video_performance auto-population
  metadata.hookStyle = hookStyle;
  metadata.scriptStructureName = scriptStructureName;
  metadata.contentTypeKey = contentTypeKey;
  metadata.hasLoopStructure = hasLoopStructure;
  metadata.hasStitchBait = hasStitchBait;
  metadata.hookIntroVariant = hookIntroVariant;
  const coverImageUrl = generateCoverImageUrl(
    facet,
    theme,
    safePartNumber,
    baseUrl,
    safeTotalParts,
  );

  // Build overlays for Remotion renderer
  const overlays: Array<{
    text: string;
    startTime: number;
    endTime: number;
    style: string;
  }> = [];

  // Series badge overlay (#6) — show for first 5 seconds when multi-part
  if (safePartNumber && safeTotalParts > 1) {
    overlays.push({
      text: `Part ${safePartNumber}/${safeTotalParts}`,
      startTime: 0,
      endTime: 5,
      style: 'series_badge',
    });
  }

  // "Save this" closing overlay (#8) — last 5 seconds, non-conversion only
  // Extended from 3s to 5s: save decision happens in the final 5 seconds
  if (targetAudience !== 'conversion') {
    const savePrompts = [
      'Save this for later',
      'Bookmark this one',
      'Save for when you need it',
      'Pin this',
      'Screenshot this',
      'Save this reference',
    ];
    const saveSeed =
      scheduledDate.getFullYear() * 10000 +
      (scheduledDate.getMonth() + 1) * 100 +
      scheduledDate.getDate();
    const estimatedSeconds = wordCount / 2.6;
    overlays.push({
      text: savePrompts[saveSeed % savePrompts.length],
      startTime: Math.max(estimatedSeconds - 5, 0),
      endTime: estimatedSeconds,
      style: 'stamp',
    });
  }

  // Comment-bait identity trigger (#9) — stored on metadata for prompt injection
  const commentBait = buildCommentBaitHook(facet.title, contentTypeKey);
  if (commentBait) {
    metadata.commentBait = commentBait;
  }

  // Store overlays on metadata for Remotion renderer
  metadata.overlays = overlays;

  return {
    themeId: theme.id,
    themeName: theme.name,
    primaryThemeId: options?.primaryThemeId || theme.id,
    secondaryThemeId: options?.secondaryThemeId,
    secondaryFacetSlug: options?.secondaryFacetSlug,
    secondaryAngleKey: options?.secondaryAngleKey,
    secondaryAspectKey: options?.secondaryAspectKey,
    facetTitle: facet.title,
    topic: facet.title,
    angle,
    aspect,
    platform: 'tiktok',
    sections,
    fullScript,
    wordCount,
    estimatedDuration: estimateDuration(wordCount),
    scheduledDate,
    status: 'draft',
    metadata: { ...metadata, targetAudience, scheduledHour },
    coverImageUrl,
    partNumber: safePartNumber,
    writtenPostContent: generateTikTokCaption(facet, theme, generatedHook, {
      targetAudience,
      partNumber: safePartNumber,
      totalParts: safeTotalParts,
      scheduledDate,
      contentTypeKey,
      grimoireSlug: facet.grimoireSlug,
    }),
    hookText: generatedHook,
    hookVersion,
    ctaType,
    // Performance tracking
    hookStyle,
    scriptStructureName,
    hasLoopStructure,
    hasStitchBait,
    hookIntroVariant,
  };
}
