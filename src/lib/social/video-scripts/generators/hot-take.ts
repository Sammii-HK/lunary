/**
 * Hot Take content generator
 *
 * Generates "Unpopular opinion: [take]" video scripts.
 * Confident, debate-provoking content designed for duets and stitches.
 *
 * Integrated into weekly secondary schedule: Thursdays.
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
 * Hot take topic pools — opinions, placement debates, general takes
 */
const HOT_TAKE_TOPICS = [
  'rising signs matter more than sun signs',
  'Scorpios are overrated',
  'Geminis get too much hate',
  'your moon sign explains your relationships better than Venus',
  'people who say they dont believe in astrology are always the most stereotypical',
  'Libras are the most passive-aggressive sign',
  'Virgos are meaner than Scorpios',
  'Sagittarius is the most emotionally avoidant sign',
  'Capricorns pretend they dont have feelings',
  'Aries starts things they never finish',
  'most people read their horoscope wrong',
  'compatibility charts are mostly useless',
];

/**
 * Get a hot take topic for the given date (deterministic)
 */
export function getHotTakeTopic(scheduledDate: Date): string {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  return HOT_TAKE_TOPICS[seed % HOT_TAKE_TOPICS.length];
}

/**
 * Generate a hot take video script
 */
export async function generateHotTakeScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const topic = getHotTakeTopic(scheduledDate);
  const voiceConfig = getVoiceConfig('hot_take');
  const scriptStructure = getRandomScriptStructure('hot_take');

  const prompt = `You are writing a short-form hot take video script.

CONTENT TYPE: HOT TAKE (confident, debate-provoking, combative)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Topic: ${topic}

HOT TAKE-SPECIFIC REQUIREMENTS:
- Lead with the controversial statement — no buildup
- Back it up with ONE undeniable observation from real life
- Short, declarative sentences. No hedging.
- The tone is "I said what I said"
- End by daring people to disagree
- Keep it 60-80 words, ~25 seconds spoken
- This should make people want to stitch or duet

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Bold opening statement — the hot take itself",
    "scriptBody": [
      "Supporting observation from real life",
      "Double down on the claim",
      "Specific example that makes it undeniable",
      "Closing dare or challenge to disagree"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt:
        'You write bold, unapologetic TikTok hot takes about astrology. You have strong opinions and you back them up with specific observations. You never hedge or apologise. Your goal is to start debates.',
      model: 'quality',
      temperature: 0.9,
      maxTokens: 400,
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
      { topicLabel: topic },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hook },
      {
        name: 'Take',
        duration: `${Math.max(12, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: 'hot-take',
      themeName: 'Hot Take',
      facetTitle: `Hot take: ${topic}`,
      topic,
      contentType: 'hot-take',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'HOT TAKE',
        title: `Hot take: ${topic}`,
        series: '',
        summary: `Unpopular opinion: ${topic}`,
        targetAudience: 'discovery',
        contentTypeKey: 'hot_take',
      } as VideoScript['metadata'],
      hookText: hook,
      hookVersion: 1,
      hookStyle: 'provocative',
      scriptStructureName: scriptStructure.split(':')[0]?.trim() || 'HOT_TAKE',
      hasLoopStructure: false,
      hasStitchBait: true,
    };
  } catch (error) {
    console.error('Failed to generate hot take script:', error);
    return null;
  }
}
