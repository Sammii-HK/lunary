/**
 * Chiron in [sign] content generator
 *
 * Generates "Chiron in [sign]" wound/healing video scripts.
 * A-tier performer: reliable 300-585 views.
 *
 * Data insight: Chiron + specific sign = consistently strong.
 * Deep, personal, save-worthy content.
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

/**
 * Core wound descriptions per sign (for prompt context)
 */
const CHIRON_WOUNDS: Record<string, string> = {
  Aries: 'the right to exist and take up space',
  Taurus: 'self-worth and feeling deserving',
  Gemini: 'communication and being heard',
  Cancer: 'belonging and emotional safety',
  Leo: 'being seen authentically without performing',
  Virgo: 'being good enough without perfection',
  Libra: 'identity within relationships',
  Scorpio: 'trust, vulnerability, and power',
  Sagittarius: 'meaning, purpose, and belief',
  Capricorn: 'authority, achievement, and recognition',
  Aquarius: 'belonging while being different',
  Pisces: 'boundaries between self and others',
};

/**
 * Get the sign for Chiron content on a given date (deterministic)
 */
export function getChironSignForDate(scheduledDate: Date): string {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  // Offset by 3 so it doesn't always match sign-check rotation
  return ZODIAC_SIGNS[(seed + 3) % ZODIAC_SIGNS.length];
}

/**
 * Generate a Chiron in [sign] video script
 */
export async function generateChironSignScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const sign = getChironSignForDate(scheduledDate);
  const wound = CHIRON_WOUNDS[sign] || 'identity and self-expression';
  const voiceConfig = getVoiceConfig('chiron_sign');
  const scriptStructure = getRandomScriptStructure('chiron_sign');

  const prompt = `You are writing a short-form Chiron placement video script.

CONTENT TYPE: CHIRON IN SIGN (deep, empathetic, healing-focused)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Sign: ${sign}
Core Wound: ${wound}

CHIRON-SPECIFIC REQUIREMENTS:
- Open with "Chiron in ${sign}" — name it directly
- The core wound is about: ${wound}
- Describe how this wound shows up in DAILY LIFE (not abstract)
- Be specific: relationships, work, self-talk
- Show the GIFT that emerges when the wound heals
- Tone: empathetic, not clinical. Like a therapist who gets it.
- End with "If this is your Chiron, drop your sign."
- Keep it 50-65 words, ~21 seconds spoken

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Chiron in ${sign}.",
    "scriptBody": [
      "The core wound",
      "How it shows up daily",
      "The pattern in relationships",
      "The gift that emerges",
      "Comment CTA"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt: `You write deep, empathetic TikTok scripts about Chiron placements. You speak like a compassionate therapist who makes people feel understood. Every line should feel like validation.`,
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
      normalizeHookLine(buildHookForTopic(`Chiron in ${sign}`, undefined)),
    );

    const fullScript = normalizeGeneratedContent(
      `${hookLine}\n\n${bodyLines.join('\n')}`,
      { topicLabel: `Chiron in ${sign}` },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hookLine },
      {
        name: 'Wound & Healing',
        duration: `${Math.max(12, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: `chiron-${sign.toLowerCase()}`,
      themeName: `Chiron in ${sign}`,
      facetTitle: `Chiron in ${sign}: ${wound}`,
      topic: `Chiron in ${sign}`,
      contentType: 'chiron-sign',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'CHIRON',
        title: `Chiron in ${sign}`,
        series: '',
        summary: `Chiron in ${sign}: ${wound}`,
        targetAudience: 'discovery',
        contentTypeKey: 'chiron_sign',
      } as VideoScript['metadata'],
      hookText: hookLine,
      hookVersion: 1,
      hookStyle: 'empathetic',
      scriptStructureName:
        scriptStructure.split(':')[0]?.trim() || 'CHIRON_SIGN',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate Chiron sign script:', error);
    return null;
  }
}
