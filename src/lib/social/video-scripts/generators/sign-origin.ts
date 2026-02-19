/**
 * Sign Origin content generator
 *
 * Generates "Why is [sign] the [ordinal] sign?" origin story scripts.
 * A-tier performer: 898 avg views.
 *
 * Data insight: origin stories + specific sign = high share rate.
 * Viewers tag friends of that sign.
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

const ORDINALS = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
];

/**
 * Sign origin angles — different origin story perspectives
 */
const ORIGIN_ANGLES = [
  'why it holds this position in the zodiac',
  'the mythology behind its symbol',
  'the original meaning of its name',
  'the constellation story',
];

/**
 * Get sign for origin content on a given date (deterministic)
 */
export function getSignOriginForDate(scheduledDate: Date): {
  sign: string;
  ordinal: string;
  angle: string;
} {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  // Offset by 9 to avoid colliding with sign-check and chiron rotations
  const signIndex = (seed + 9) % ZODIAC_SIGNS.length;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    ordinal: ORDINALS[signIndex],
    angle: ORIGIN_ANGLES[(seed + 2) % ORIGIN_ANGLES.length],
  };
}

/**
 * Generate a sign origin video script
 */
export async function generateSignOriginScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const { sign, ordinal, angle } = getSignOriginForDate(scheduledDate);
  const voiceConfig = getVoiceConfig('sign_origin');
  const scriptStructure = getRandomScriptStructure('sign_origin');

  const prompt = `You are writing a short-form sign origin story video script.

CONTENT TYPE: SIGN ORIGIN (storytelling, educational, awe-inspiring)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Sign: ${sign} (the ${ordinal} sign)
Angle: ${angle}

SIGN ORIGIN-SPECIFIC REQUIREMENTS:
- Open with "Why is ${sign} the ${ordinal} sign?" or similar origin question
- Tell the origin story in a way that reveals something surprising
- Connect the mythology/numerology to ${sign}'s actual personality traits
- The reveal should change how the viewer sees ${sign}
- End with "Send this to every ${sign} you know" or similar share prompt
- Keep it 50-65 words, ~21 seconds spoken
- Make it feel like discovering a secret, not a lecture

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Why is ${sign} the ${ordinal} sign?",
    "scriptBody": [
      "The origin/mythology",
      "The surprising connection",
      "How it explains ${sign}'s personality",
      "The reveal that changes everything",
      "Share-driving CTA"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt: `You write fascinating origin story TikTok scripts about zodiac signs. You make ancient mythology feel like a secret someone just told you. Every script should make the viewer see a sign differently.`,
      model: 'quality',
      temperature: 0.8,
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
      normalizeHookLine(buildHookForTopic(`${sign} origin`, undefined)),
    );

    const fullScript = normalizeGeneratedContent(
      `${hookLine}\n\n${bodyLines.join('\n')}`,
      { topicLabel: `${sign} origin` },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hookLine },
      {
        name: 'Origin Story',
        duration: `${Math.max(12, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: `sign-origin-${sign.toLowerCase()}`,
      themeName: `Sign Origin: ${sign}`,
      facetTitle: `Why is ${sign} the ${ordinal} sign?`,
      topic: `${sign} origin: ${angle}`,
      contentType: 'sign-origin',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'SIGN ORIGIN',
        title: `${sign}: ${angle}`,
        series: '',
        summary: `${sign} origin: ${angle}`,
        targetAudience: 'discovery',
        contentTypeKey: 'sign_origin',
      } as VideoScript['metadata'],
      hookText: hookLine,
      hookVersion: 1,
      hookStyle: 'curiosity',
      scriptStructureName:
        scriptStructure.split(':')[0]?.trim() || 'SIGN_ORIGIN',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate sign origin script:', error);
    return null;
  }
}
