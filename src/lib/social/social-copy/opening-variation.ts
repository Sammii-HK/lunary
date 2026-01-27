/**
 * Opening line variation for social posts
 */

import {
  generateStructuredContent,
  OpeningLineSchema,
} from '@/lib/ai/content-generator';
import { normalise, sentenceSafe } from '../shared/text/normalize';
import type {
  SourcePack,
  OpeningIntent,
  OpeningVariation,
  OpeningVariationOptions,
} from './types';
import { OPENING_INTENTS } from './types';

const normalizeOpening = (value: string): string => normalise(value);

const isOpeningDuplicate = (line: string, avoid: string[]): boolean => {
  const normalized = normalizeOpening(line);
  return avoid.some((existing) => normalizeOpening(existing) === normalized);
};

const buildOpeningPrompt = (
  pack: SourcePack,
  intent: OpeningIntent,
  avoidOpenings: string[],
): string => {
  const avoidBlock = avoidOpenings.length
    ? `\nDon't repeat these openings:\n${avoidOpenings.slice(0, 8).join('\n')}`
    : '';

  const intentGuidance = {
    definition: 'Start by clearly stating what this is',
    misconception: 'Gently correct something people often get wrong about this',
    observation: 'Share what you notice about how this shows up',
    quick_rule: 'Give a simple, practical rule of thumb',
    question: 'Ask a thoughtful question (must end with "?")',
    contrast: "Show what this is vs. what it isn't",
    signal: 'Point out a subtle indicator to watch for',
  }[intent];

  return `Write one opening sentence about "${pack.topicTitle}" in UK English.

What you know:
${pack.grimoireExcerpt}

Approach: ${intentGuidance}

Keep it:
• Natural and conversational (10-18 words)
• Specific to ${pack.topicDomain}
• Grounded in the information above
• Include "${pack.topicTitle}" once
${avoidBlock}

Return JSON only:
{"line":"your sentence here","intent":"${intent}"}`.trim();
};

/**
 * Generate opening line variation
 */
export async function generateOpeningVariation(
  pack: SourcePack,
  options: OpeningVariationOptions = {},
): Promise<OpeningVariation> {
  const avoidOpenings = options.avoidOpenings || [];
  const intentOrder = options.intentOrder || OPENING_INTENTS;
  const startIndex = options.preferredIntent
    ? Math.max(0, intentOrder.indexOf(options.preferredIntent))
    : 0;

  for (let attempt = 0; attempt < intentOrder.length; attempt += 1) {
    const intent = intentOrder[(startIndex + attempt) % intentOrder.length];
    const prompt = buildOpeningPrompt(pack, intent, avoidOpenings);

    try {
      const result = await generateStructuredContent({
        prompt,
        schema: OpeningLineSchema,
        schemaName: 'opening_line',
        systemPrompt:
          'You write engaging, natural opening sentences for social posts. Use UK English and conversational tone.',
        model: 'quality',
        temperature: 0.5,
        maxTokens: 120,
      });

      const line = String(result.line || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!line) continue;
      if (isOpeningDuplicate(line, avoidOpenings)) continue;
      if (intent === 'question' && !line.endsWith('?')) continue;
      if (intent !== 'question' && !/[.!]$/.test(line)) continue;
      return { line, intent };
    } catch {
      continue;
    }
  }

  return {
    line: sentenceSafe(
      `${pack.topicTitle} offers a grounded lens worth noting`,
    ),
    intent: 'definition',
  };
}

/**
 * Apply opening variation to content
 */
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
