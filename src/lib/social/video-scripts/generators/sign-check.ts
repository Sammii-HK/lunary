/**
 * Sign Check content generator
 *
 * Generates "If you're a [sign], stop scrolling" video scripts.
 * Direct, personal, teasing callout format targeting one sign at a time.
 *
 * Integrated into weekly secondary schedule: Mondays (+ Saturday fallback).
 */

import {
  generateStructuredContent,
  VideoScriptSchema,
} from '@/lib/ai/content-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import { countWords, estimateDuration } from '../../shared/text/normalize';
import {
  getVoiceConfig,
  getRandomScriptStructure,
} from '../content-type-voices';
import type { VideoScript, ScriptSection } from '../types';

/**
 * Zodiac signs for rotation
 */
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
 * Angles for sign check — what aspect of the sign to call out
 */
const SIGN_CHECK_ANGLES = [
  "this week's energy",
  "what you're avoiding right now",
  'your blind spot',
  'the thing you do that everyone notices',
  'what you need to hear today',
  'the pattern you keep repeating',
  "what you're pretending is fine",
  'your superpower you underuse',
];

/**
 * Get the sign for the given date (deterministic rotation through 12 signs)
 */
export function getSignForDate(scheduledDate: Date): string {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  return ZODIAC_SIGNS[seed % ZODIAC_SIGNS.length];
}

/**
 * Get the angle for the given date (deterministic)
 */
function getAngleForDate(scheduledDate: Date): string {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  // Use a different offset so sign and angle don't always pair the same
  return SIGN_CHECK_ANGLES[(seed + 7) % SIGN_CHECK_ANGLES.length];
}

/**
 * Generate a sign check video script
 */
export async function generateSignCheckScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const sign = getSignForDate(scheduledDate);
  const angle = getAngleForDate(scheduledDate);
  const voiceConfig = getVoiceConfig('sign_check');
  const scriptStructure = getRandomScriptStructure('sign_check');

  const prompt = `You are writing a short-form sign check video script.

CONTENT TYPE: SIGN CHECK (direct, personal, teasing callout)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Sign: ${sign}
Angle: ${angle}

SIGN CHECK-SPECIFIC REQUIREMENTS:
- Open with "If you're a ${sign}, stop scrolling" or similar direct address
- Speak DIRECTLY to ${sign} using "you" — this is personal
- Name 2-3 hyper-specific behaviours that ${sign} will recognise instantly
- Tease with affection, not malice
- The viewer should feel SEEN, almost uncomfortably so
- End with "Send this to your ${sign} friend" or similar share prompt
- Keep it 70-90 words, ~28 seconds spoken

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "If you're a ${sign}, stop scrolling.",
    "scriptBody": [
      "First specific callout about ${sign} and ${angle}",
      "Second behaviour they'll immediately recognise",
      "The deeper truth underneath",
      "Affectionate or teasing closer",
      "Share/tag call to action"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt: `You write personal, direct TikTok callout scripts for zodiac signs. You speak to one sign at a time like you know them personally. You tease with affection, and every line makes the viewer feel seen. You never sound generic.`,
      model: 'quality',
      temperature: 0.8,
      maxTokens: 500,
    })) as {
      video?: { hook?: string; scriptBody?: string[] };
    };

    const video = result.video || {};
    const hook = String(video.hook || '').trim();
    const bodyLines = Array.isArray(video.scriptBody)
      ? video.scriptBody.map((l) => String(l).trim()).filter(Boolean)
      : [];

    if (!hook || bodyLines.length < 3) return null;

    const fullScript = normalizeGeneratedContent(
      `${hook}\n\n${bodyLines.join('\n')}`,
      { topicLabel: `${sign} ${angle}` },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hook },
      {
        name: 'Callout',
        duration: `${Math.max(15, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: `sign-check-${sign.toLowerCase()}`,
      themeName: `Sign Check: ${sign}`,
      facetTitle: `${sign}: ${angle}`,
      topic: `${sign} ${angle}`,
      contentType: 'sign-check',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'SIGN CHECK',
        title: `${sign}: ${angle}`,
        series: '',
        summary: `Sign check for ${sign}: ${angle}`,
        targetAudience: 'discovery',
        contentTypeKey: 'sign_check',
      } as VideoScript['metadata'],
      hookText: hook,
      hookVersion: 1,
      hookStyle: 'callout',
      scriptStructureName:
        scriptStructure.split(':')[0]?.trim() || 'SIGN_CHECK',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate sign check script:', error);
    return null;
  }
}
