/**
 * Angel Number content generator
 *
 * Generates angel number explainer video scripts (111, 222, 333...).
 * S-tier performer: 3,000+ avg views. Max 2x/week for scarcity.
 * Comment-driving CTA ("Which number do you keep seeing?").
 *
 * Data insight: 711 comments on 111 video drove 7,420 views.
 * Comments are THE growth multiplier on TikTok.
 */

import {
  generateStructuredContent,
  VideoScriptSchema,
} from '@/lib/ai/content-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import {
  countWords,
  estimateDuration,
  normalizeHookLine,
  ensureSentenceEndsWithPunctuation,
} from '../../shared/text/normalize';
import { buildHookForTopic } from '../hooks';
import {
  getVoiceConfig,
  getRandomScriptStructure,
} from '../content-type-voices';
import type { VideoScript, ScriptSection } from '../types';

/**
 * Angel numbers pool — rotated through deterministically
 */
const ANGEL_NUMBERS = [
  '111',
  '222',
  '333',
  '444',
  '555',
  '666',
  '777',
  '888',
  '999',
  '000',
  '1010',
  '1111',
  '1212',
  '1234',
  '911',
];

/**
 * Get the angel number for the given date (deterministic rotation)
 */
export function getAngelNumberForDate(scheduledDate: Date): string {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  return ANGEL_NUMBERS[seed % ANGEL_NUMBERS.length];
}

/**
 * Generate an angel number video script
 */
export async function generateAngelNumberScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const number = getAngelNumberForDate(scheduledDate);
  const voiceConfig = getVoiceConfig('angel_numbers');
  const scriptStructure = getRandomScriptStructure('angel_numbers');

  const prompt = `You are writing a short-form angel number video script.

CONTENT TYPE: ANGEL NUMBER (pattern recognition, actionable, grounded)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Angel Number: ${number}

ANGEL NUMBER-SPECIFIC REQUIREMENTS:
- Open with the number and when it appears (specific situations)
- Name 2-3 EXACT moments people see this number (receipts, clock, phone)
- Explain what connects those moments — the pattern
- Be direct about what to DO when you see it
- End with "Which number do you keep seeing? Drop it below."
- Keep it 50-65 words, ~21 seconds spoken
- DO NOT use mystical language — this is pattern recognition

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Single hook about ${number}",
    "scriptBody": [
      "When this number appears",
      "Specific situation 1",
      "Specific situation 2",
      "What the pattern means",
      "Comment-driving CTA"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt:
        'You write grounded, pattern-focused TikTok scripts about angel numbers. You speak like a friend who noticed something interesting, not a spiritual guru. Every line is specific and actionable.',
      model: 'quality',
      temperature: 0.75,
      maxTokens: 400,
    })) as {
      video?: { hook?: string; scriptBody?: string[] };
    };

    const video = result.video || {};
    const aiHook = String(video.hook || '').trim();
    const bodyLines = Array.isArray(video.scriptBody)
      ? video.scriptBody.map((l) => String(l).trim()).filter(Boolean)
      : [];

    if (!aiHook || bodyLines.length < 3) return null;

    const hookLine = ensureSentenceEndsWithPunctuation(
      normalizeHookLine(buildHookForTopic(`angel number ${number}`, undefined)),
    );

    const fullScript = normalizeGeneratedContent(
      `${hookLine}\n\n${bodyLines.join('\n')}`,
      { topicLabel: `Angel Number ${number}` },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hookLine },
      {
        name: 'Pattern',
        duration: `${Math.max(12, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: `angel-number-${number}`,
      themeName: `Angel Number ${number}`,
      facetTitle: `Angel Number ${number}`,
      topic: `Angel Number ${number}`,
      contentType: 'angel-number',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'ANGEL NUMBER',
        title: `Angel Number ${number}`,
        series: '',
        summary: `Angel number ${number} pattern recognition`,
        targetAudience: 'discovery',
        contentTypeKey: 'angel_numbers',
      } as VideoScript['metadata'],
      hookText: hookLine,
      hookVersion: 1,
      hookStyle: 'pattern',
      scriptStructureName:
        scriptStructure.split(':')[0]?.trim() || 'ANGEL_NUMBER',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate angel number script:', error);
    return null;
  }
}
