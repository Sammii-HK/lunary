/**
 * Myth / Storytime content generator
 *
 * Generates "The real reason [sign] is..." video scripts.
 * Storytelling, captivating, reveal-structured content.
 *
 * Integrated into weekly secondary schedule: Fridays.
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
 * Myth topic pools — zodiac origins, planet mythology, symbol origins
 */
const MYTH_TOPICS = [
  'why Scorpio is associated with death and rebirth',
  "the origin of Cancer's crab symbol",
  'why Aquarius is an air sign not water',
  "the mythology behind Saturn's rings and limitations",
  'why Venus rules both Taurus and Libra',
  "the real meaning behind Mercury's winged sandals",
  'why Pisces is two fish swimming in opposite directions',
  'the myth that made Virgo the sign of the harvest',
  'why Leo is the only sign ruled by the Sun',
  'the origin of Sagittarius the archer centaur',
  'why Capricorn is half goat half fish',
  'the real story behind Gemini the twins',
  'why Aries is the first sign of the zodiac',
  'the mythology connecting the Moon to emotions',
  'why Pluto was named after the god of the underworld',
];

/**
 * Get a myth topic for the given date (deterministic)
 */
export function getMythTopic(scheduledDate: Date): string {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  return MYTH_TOPICS[seed % MYTH_TOPICS.length];
}

/**
 * Generate a myth/storytime video script
 */
export async function generateMythScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const topic = getMythTopic(scheduledDate);
  const voiceConfig = getVoiceConfig('myth');
  const scriptStructure = getRandomScriptStructure('myth');

  const prompt = `You are writing a short-form myth/storytime video script.

CONTENT TYPE: MYTH (storytelling, captivating, reveal-structured)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Topic: ${topic}

MYTH-SPECIFIC REQUIREMENTS:
- Open with intrigue: "The real reason..." or "Nobody tells you..."
- Build like a story: setup, context, twist, reveal
- Ground the mythology in real meaning — why it MATTERS for understanding the sign/planet
- The payoff should make the viewer see the topic differently
- Make ancient stories feel relevant to modern behaviour
- Keep it 90-110 words, ~35 seconds spoken
- The pacing should feel like a story that builds to a revelation

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Intriguing opening about ${topic}",
    "scriptBody": [
      "What most people assume",
      "The actual origin or myth",
      "The key detail everyone misses",
      "Why this matters for understanding the sign/planet",
      "The modern relevance or behaviour it explains",
      "Reveal or reframing that changes perspective",
      "Closing that makes viewer want to save/share"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt:
        'You write captivating TikTok storytime scripts about zodiac mythology and origins. You are a storyteller who makes ancient myths feel urgent and relevant. Every story has a reveal that changes how the viewer sees the topic. You never sound like a textbook or Wikipedia.',
      model: 'quality',
      temperature: 0.8,
      maxTokens: 600,
    })) as {
      video?: { hook?: string; scriptBody?: string[] };
    };

    const video = result.video || {};
    const aiHook = String(video.hook || '').trim();
    const bodyLines = Array.isArray(video.scriptBody)
      ? video.scriptBody.map((l) => String(l).trim()).filter(Boolean)
      : [];

    if (!aiHook || bodyLines.length < 4) return null;

    const hookLine = ensureSentenceEndsWithPunctuation(
      normalizeHookLine(buildHookForTopic(topic, undefined)),
    );

    const fullScript = normalizeGeneratedContent(
      `${hookLine}\n\n${bodyLines.join('\n')}`,
      { topicLabel: topic },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hookLine },
      {
        name: 'Story',
        duration: `${Math.max(20, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: 'myth',
      themeName: 'Myth',
      facetTitle: topic,
      topic,
      contentType: 'myth',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'MYTH',
        title: topic,
        series: '',
        summary: `Myth: ${topic}`,
        targetAudience: 'discovery',
        contentTypeKey: 'myth',
      } as VideoScript['metadata'],
      hookText: hookLine,
      hookVersion: 1,
      hookStyle: 'intrigue',
      scriptStructureName: scriptStructure.split(':')[0]?.trim() || 'MYTH',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate myth script:', error);
    return null;
  }
}
