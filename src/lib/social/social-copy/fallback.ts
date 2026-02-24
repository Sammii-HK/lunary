/**
 * Fallback content generation for social copy
 */

import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import { sentenceSafe } from '../shared/text/normalize';
import type { SourcePack, SocialCopyResult } from './types';
import { buildCuratedHashtags } from './hashtags';
import { CTA_PHRASES } from './constants';

/**
 * Deterministic hash for seeded CTA decisions in fallback
 */
function fallbackHashSeed(pack: SourcePack): number {
  const str = `${pack.topicTitle}-${pack.platform}-${pack.postType}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Build caption content from validated lines
 */
export const buildCaptionContent = (
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
  const includeCTA = false;
  const useDisplayTitle = pack.postType !== 'video_caption';
  const contentLines = [
    ...(useDisplayTitle && pack.displayTitle ? [pack.displayTitle] : []),
    ...sanitizedLines,
    includeCTA ? Array.from(CTA_PHRASES)[0] : '',
  ]
    .filter((line): line is string => Boolean(line))
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

/**
 * Build fallback copy when AI generation fails
 */
export async function buildFallbackCopy(
  pack: SourcePack,
): Promise<SocialCopyResult> {
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
  const ctaLine = '';
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
      const content = withOptionalCTA([nuanceSentence, keywordSentence]);
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
      const content = `Which part of this rhythm do you actually sense first: tension, release, or the pause before the shift?`;
      return {
        content: normalizeGeneratedContent(content, {
          topicLabel: pack.topicTitle,
        }),
        hashtags: curatedHashtags,
        safetyChecks: [],
      };
    }
    case 'persona': {
      // "dear [audience]" format with varied terms + Lunary intro
      // Focus on USP: full birth chart personalisation (go beyond sun sign)
      // No topic/category references
      // Use facet-based audience terms to prevent duplication
      const { buildAudienceTerms } =
        await import('@/lib/social/shared/constants/persona-templates');
      const bodyTemplates = [
        'I built Lunary for you.\nPersonalised horoscopes, transits, tarot, and crystals. All based on your full birth chart, not just your sun sign.',
        'Lunary goes beyond your sun sign.\nYour full natal chart shapes everything: horoscopes, transits, tarot pulls, crystal guidance. All personalised to you.',
        'Lunary is where I put everything I wish I had when I started.\nEverything based on your full birth chart. Horoscopes, transits, tarot, crystals.',
        'I made Lunary for moments like this.\nPersonalised to your full natal chart. Not generic sun sign content. Horoscopes, transits, tarot, crystals.',
      ];
      const audienceTerms = buildAudienceTerms(4);
      const body =
        bodyTemplates[Math.floor(Math.random() * bodyTemplates.length)];
      const content = `dear ${audienceTerms.join(', ')}\n${body}`;
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
      const isTikTok = pack.platform === 'tiktok';
      const videoLines = isTikTok
        ? [
            safeSentence(pack.grimoireFacts[0] || baseDefinition),
            detailSentence,
          ]
        : [domainSentence, detailSentence, exampleSentence];

      // Seeded soft CTA: ~25% of fallback video captions mention Lunary
      const ctaSeed = fallbackHashSeed(pack);
      if (ctaSeed % 4 === 0) {
        const softCtas = [
          'Lunary breaks this down for your exact chart.',
          'Get your personalised chart on Lunary.',
        ];
        videoLines.push(softCtas[ctaSeed % softCtas.length]);
      }

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
