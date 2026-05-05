/**
 * Main social copy generation functions
 */

import {
  generateStructuredContent,
  SocialPostSchema,
  VideoCaptionSchema,
} from '@/lib/ai/content-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import {
  hasDeterministicLanguage,
  softenDeterministicLanguage,
} from '../shared/validation/deterministic-language';
import type { SourcePack, SocialCopyResult } from './types';
import { OPENING_INTENTS } from './types';
import { buildPrompt } from './prompts';
import { buildCuratedHashtags } from './hashtags';
import {
  validateVideoCaptionResponse,
  isQuestionLine,
  normalizeQuestionLines,
  hasGrimoireMention,
} from './validation';
import {
  getSocialCopyQualityIssues,
  getVideoCaptionQualityIssues,
  normalizeVideoCaptionLines,
} from './quality';
import { hasOffDomainKeyword } from '../shared/constants/banned-phrases';
import { buildCaptionContent } from './fallback';
import {
  generateOpeningVariation,
  applyOpeningVariation,
} from './opening-variation';
import { enrichSourcePackWithRetrieval } from './source-pack';

/**
 * Generate social copy for a given source pack
 */
export async function generateSocialCopy(
  pack: SourcePack,
  retryNote?: string,
): Promise<SocialCopyResult> {
  const enrichedPack = await enrichSourcePackWithRetrieval(pack);
  const firstLineKeywords = enrichedPack.relatedKeywords.slice(0, 5);
  const groundingInstruction = firstLineKeywords.length
    ? `First line must include one of these source keywords: ${firstLineKeywords.join(', ')}.`
    : 'First line must include one concrete source keyword.';
  const concreteSceneInstruction =
    'Use at least one concrete scene anchor such as text, deadline, work, meeting, phone call, mirror, card pull, spending, reply, or message.';
  const sceneHintInstruction = enrichedPack.sceneHints?.length
    ? `Concrete scene hints to use: ${enrichedPack.sceneHints.join(', ')}.`
    : '';
  const requestCopy = async (note?: string) => {
    const prompt = buildPrompt(enrichedPack);
    const result = await generateStructuredContent({
      prompt,
      schema: SocialPostSchema,
      schemaName: 'social_post',
      systemPrompt:
        'You write engaging, natural social content in UK English. Be conversational and insightful. Vary your language and structure.',
      model: 'quality',
      temperature: 0.7,
      maxTokens: 600,
      retryNote: note,
    });
    return result;
  };

  const requestVideoCaption = async (note?: string) => {
    const prompt = buildPrompt(enrichedPack);
    const result = await generateStructuredContent({
      prompt,
      schema: VideoCaptionSchema,
      schemaName: 'video_caption',
      systemPrompt:
        'You write engaging, natural video captions in UK English. Be conversational and insightful. Vary your language and structure.',
      model: 'quality',
      temperature: 0.7,
      maxTokens: 600,
      retryNote: note,
    });
    return result;
  };

  if (pack.postType === 'video_caption') {
    let response = await requestVideoCaption(retryNote);
    let validation = validateVideoCaptionResponse(
      response.bodyLines || [],
      enrichedPack,
    );
    if (validation.issues.length > 0) {
      const previousOutput = (response.bodyLines || []).join('\n');
      response = await requestVideoCaption(
        `${validation.issues.join('; ')}\n${groundingInstruction}\n${sceneHintInstruction}\n${concreteSceneInstruction}\nRewrite the previous caption using the exact source facts, the keywords above, and one concrete scene.\nPrevious output:\n${previousOutput}`,
      );
      validation = validateVideoCaptionResponse(
        response.bodyLines || [],
        enrichedPack,
      );
    }
    if (validation.issues.length === 0) {
      const combined = (validation.lines || []).join(' ');
      if (hasGrimoireMention(combined)) {
        response = await requestVideoCaption(
          'Remove any mention of the Grimoire, Lunary, or product language.',
        );
        validation = validateVideoCaptionResponse(
          response.bodyLines || [],
          enrichedPack,
        );
      }
    }
    let qualityIssues = getVideoCaptionQualityIssues(
      validation.lines,
      enrichedPack,
    );
    if (qualityIssues.length > 0) {
      const previousOutput = (validation.lines || []).join('\n');
      response = await requestVideoCaption(
        `${qualityIssues.join('; ')}\n${groundingInstruction}\n${sceneHintInstruction}\n${concreteSceneInstruction}\nRewrite the previous caption so it names one concrete scene and uses one provided related keyword.\nPrevious output:\n${previousOutput}`,
      );
      validation = validateVideoCaptionResponse(
        response.bodyLines || [],
        enrichedPack,
      );
      qualityIssues = getVideoCaptionQualityIssues(
        validation.lines,
        enrichedPack,
      );
    }
    if (validation.issues.length > 0) {
      throw new Error(
        `Video caption validation failed after retries: ${validation.issues.join('; ')}`,
      );
    }
    const normalizedLines = normalizeVideoCaptionLines(
      validation.lines,
      enrichedPack,
    );
    return buildCaptionContent(
      enrichedPack,
      normalizedLines,
      response.safetyChecks ?? undefined,
    );
  }

  const validateQuestionContent = (text: string) => {
    const issues: string[] = [];
    const lines = normalizeQuestionLines(text);
    const lower = text.toLowerCase();
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
    if (
      /\bwhat does .* symbolize\b/i.test(lines[0] || '') ||
      /\bwhat does .* mean in your life\b/i.test(lines[0] || '')
    ) {
      issues.push('Avoid abstract symbolism questions');
    }
    if (
      !enrichedPack.sceneHints?.length ||
      !enrichedPack.sceneHints.some((hint) =>
        lower.includes(hint.toLowerCase()),
      )
    ) {
      issues.push('Use one of the provided concrete scene hints');
    }
    return { issues, lines };
  };

  const response = (await requestCopy(retryNote)) as any;
  let content = String(response.content || '').trim();
  if (pack.postType === 'question') {
    let validation = validateQuestionContent(content);
    if (validation.issues.length > 0) {
      const response = (await requestCopy(
        `${validation.issues.join('; ')}\n${groundingInstruction}\n${sceneHintInstruction}\nRewrite the previous answer with the exact same topic focus, no fallback wording, and tighter formatting.\nPrevious output:\n${content}`,
      )) as any;
      content = String(response.content || '').trim();
      validation = validateQuestionContent(content);
    }
    if (validation.issues.length > 0) {
      throw new Error(
        `Question copy validation failed after retries: ${validation.issues.join('; ')}`,
      );
    }
  }
  if (hasGrimoireMention(content)) {
    const retry = (await requestCopy(
      'Remove any mention of the Grimoire, Lunary, or product language.',
    )) as any;
    const retriedContent = String(retry.content || '').trim();
    content = hasGrimoireMention(retriedContent)
      ? content
          .replace(/\bgrimoire\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
      : retriedContent;
  }

  if (hasDeterministicLanguage(content)) {
    const retry = (await requestCopy(
      'Soften deterministic language (avoid "controls", "always", "guarantees"; use "can influence", "often", "tends to").',
    )) as any;
    const retriedContent = String(retry.content || '').trim();
    content = hasDeterministicLanguage(retriedContent)
      ? softenDeterministicLanguage(retriedContent)
      : retriedContent;
  }
  const qualityIssues = getSocialCopyQualityIssues(content, enrichedPack);
  if (qualityIssues.length > 0) {
    const retry = (await requestCopy(
      `${qualityIssues.join('; ')}\n${groundingInstruction}\n${sceneHintInstruction}\n${concreteSceneInstruction}\nRewrite the previous copy using the exact source facts and one concrete scene.\nPrevious output:\n${content}`,
    )) as any;
    const retriedContent = String(retry.content || '').trim();
    if (retriedContent) {
      content = retriedContent;
    }
  }
  if (
    [
      'educational',
      'educational_intro',
      'educational_deep_1',
      'educational_deep_2',
      'educational_deep_3',
    ].includes(pack.postType)
  ) {
    const preferredIntent =
      pack.postType === 'educational_intro'
        ? 'definition'
        : pack.postType === 'educational_deep_1'
          ? 'misconception'
          : pack.postType === 'educational_deep_2'
            ? 'quick_rule'
            : pack.postType === 'educational_deep_3'
              ? 'contrast'
              : 'observation';

    const opening = await generateOpeningVariation(enrichedPack, {
      preferredIntent,
      avoidOpenings: pack.noveltyContext?.recentOpenings,
      intentOrder: OPENING_INTENTS,
    });

    content = applyOpeningVariation(content, opening.line);

    if (!Array.isArray(response.safetyChecks)) {
      response.safetyChecks = [];
    }
    response.safetyChecks.push(`opening:${opening.intent}`);
  }

  content = normalizeGeneratedContent(content, {
    topicLabel: enrichedPack.topicTitle,
  });
  // Strip any stray hashtags the AI may have injected
  content = content
    .replace(/#[\w-]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const title = response.title ? String(response.title).trim() : undefined;
  const safetyChecks = Array.isArray(response.safetyChecks)
    ? response.safetyChecks.map((flag: string) => String(flag))
    : [];
  const curatedHashtags = buildCuratedHashtags(enrichedPack);
  return { content, hashtags: curatedHashtags, title, safetyChecks };
}
