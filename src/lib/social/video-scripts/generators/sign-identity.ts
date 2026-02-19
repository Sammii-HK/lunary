/**
 * Sign Identity content generator
 *
 * Generates "If you're a [sign]..." identity callout video scripts.
 * A-tier performer: 400-900 avg views.
 *
 * Data insight: naming a specific sign in the hook = 2-4x views
 * vs generic "zodiac signs" content.
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
 * Identity angles — specific traits/moments to call out
 */
const IDENTITY_ANGLES = [
  'the way you text',
  'your guilty pleasure',
  'what you do when nobody is watching',
  'how you act when you catch feelings',
  'the lie you keep telling yourself',
  'what you do at 2am',
  'your toxic trait',
  'what you actually need right now',
  'how you handle being wrong',
  'what your friends say behind your back (affectionately)',
  'your morning routine energy',
  'how you act in a group chat',
];

/**
 * Get sign and angle for the given date (deterministic)
 */
export function getSignIdentityForDate(scheduledDate: Date): {
  sign: string;
  angle: string;
} {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  return {
    sign: ZODIAC_SIGNS[seed % ZODIAC_SIGNS.length],
    angle: IDENTITY_ANGLES[(seed + 5) % IDENTITY_ANGLES.length],
  };
}

/**
 * Generate a sign identity video script
 */
export async function generateSignIdentityScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const { sign, angle } = getSignIdentityForDate(scheduledDate);
  const voiceConfig = getVoiceConfig('sign_identity');
  const scriptStructure = getRandomScriptStructure('sign_identity');

  const prompt = `You are writing a short-form sign identity video script.

CONTENT TYPE: SIGN IDENTITY (personal, identity-driven, shareable)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Sign: ${sign}
Angle: ${angle}

SIGN IDENTITY-SPECIFIC REQUIREMENTS:
- MUST name "${sign}" in the very first line — this is non-negotiable
- Speak DIRECTLY to ${sign} using "you" language
- Focus on: ${angle}
- Name 3-4 hyper-specific behaviours ${sign} will recognise instantly
- Each line should make them feel more seen than the last
- Tone: affectionate teasing, not mean-spirited
- End with "Drop your sign below" or "Tag your ${sign} friend"
- Keep it 50-65 words, ~21 seconds spoken

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "${sign}, ${angle}.",
    "scriptBody": [
      "First hyper-specific behaviour",
      "Second behaviour they'll recognise",
      "Third behaviour — the most accurate one",
      "Affectionate closer",
      "Comment-driving CTA"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt: `You write identity-affirming TikTok scripts about zodiac signs. You speak directly to one sign at a time like you've been studying them for years. Every line should make the viewer say "HOW do you know that?"`,
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
      normalizeHookLine(buildHookForTopic(`${sign} ${angle}`, undefined)),
    );

    const fullScript = normalizeGeneratedContent(
      `${hookLine}\n\n${bodyLines.join('\n')}`,
      { topicLabel: `${sign} ${angle}` },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hookLine },
      {
        name: 'Identity',
        duration: `${Math.max(12, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: `sign-identity-${sign.toLowerCase()}`,
      themeName: `Sign Identity: ${sign}`,
      facetTitle: `${sign}: ${angle}`,
      topic: `${sign} ${angle}`,
      contentType: 'sign-identity',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'SIGN IDENTITY',
        title: `${sign}: ${angle}`,
        series: '',
        summary: `${sign} identity callout: ${angle}`,
        targetAudience: 'discovery',
        contentTypeKey: 'sign_identity',
      } as VideoScript['metadata'],
      hookText: hookLine,
      hookVersion: 1,
      hookStyle: 'identity',
      scriptStructureName:
        scriptStructure.split(':')[0]?.trim() || 'SIGN_IDENTITY',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate sign identity script:', error);
    return null;
  }
}
