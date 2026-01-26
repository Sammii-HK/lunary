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
import { hasOffDomainKeyword } from '../shared/constants/banned-phrases';
import { buildCaptionContent, buildFallbackCopy } from './fallback';
import {
  generateOpeningVariation,
  applyOpeningVariation,
} from './opening-variation';

/**
 * Generate social copy for a given source pack
 */
export async function generateSocialCopy(
  pack: SourcePack,
  retryNote?: string,
): Promise<SocialCopyResult> {
  const requestCopy = async (note?: string) => {
    const prompt = buildPrompt(pack);
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
    const prompt = buildPrompt(pack);
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
      pack,
    );
    if (validation.issues.length > 0) {
      response = await requestVideoCaption(validation.issues.join('; '));
      validation = validateVideoCaptionResponse(response.bodyLines || [], pack);
    }
    if (validation.issues.length === 0) {
      const combined = (validation.lines || []).join(' ');
      if (hasGrimoireMention(combined)) {
        response = await requestVideoCaption(
          'Remove any mention of the Grimoire, Lunary, or product language.',
        );
        validation = validateVideoCaptionResponse(
          response.bodyLines || [],
          pack,
        );
      }
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
    return buildCaptionContent(
      pack,
      validation.lines,
      response.safetyChecks ?? undefined,
    );
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
      await requestCopy('Fix formatting only. Do not change tone or wording.');
      const response = (await requestCopy(retryNote)) as any;
      content = String(response.content || '').trim();
      validation = validateQuestionContent(content);
    }
    if (validation.issues.length > 0) {
      const fallbackQuestion = `What do you notice most about ${pack.topicTitle.toLowerCase()}?`;
      const fallbackPrompt = 'Share one specific moment.';
      content = `${fallbackQuestion}\n${fallbackPrompt}`;
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

    const opening = await generateOpeningVariation(pack, {
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
    topicLabel: pack.topicTitle,
  });
  const title = response.title ? String(response.title).trim() : undefined;
  const safetyChecks = Array.isArray(response.safetyChecks)
    ? response.safetyChecks.map((flag: string) => String(flag))
    : [];
  const curatedHashtags = buildCuratedHashtags(pack);
  return { content, hashtags: curatedHashtags, title, safetyChecks };
}
