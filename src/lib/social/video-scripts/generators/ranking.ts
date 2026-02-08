/**
 * Ranking content generator
 *
 * Generates "Ranking signs by [trait]" video scripts.
 * Provocative, list-format content designed for comment debate.
 *
 * Integrated into weekly secondary schedule: Tuesdays and Sundays.
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
 * Ranking topic pools — ~15 topics across emotional, relational, and daily life
 */
const RANKING_TOPICS = [
  'who overthinks the most',
  'who moves on the fastest after a breakup',
  'who keeps the biggest secrets',
  'most emotionally unavailable',
  'most likely to ghost you',
  'best at giving advice they never follow',
  'who holds grudges the longest',
  'who is the scariest when angry',
  'who falls in love the hardest',
  'who has the most chaotic energy',
  'who is the best liar',
  'most likely to double text',
  'who survives a horror movie',
  'most dramatic about small things',
  'who actually has their life together',
];

/**
 * Get a ranking topic for the given date (deterministic)
 */
export function getRankingTopic(scheduledDate: Date): string {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();
  return RANKING_TOPICS[seed % RANKING_TOPICS.length];
}

/**
 * Generate a ranking-format video script
 */
export async function generateRankingScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const topic = getRankingTopic(scheduledDate);
  const voiceConfig = getVoiceConfig('ranking');
  const scriptStructure = getRandomScriptStructure('ranking');

  const prompt = `You are writing a short-form ranking video script.

CONTENT TYPE: RANKING (provocative, list-format, debate-driving)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Topic: Ranking zodiac signs by ${topic}

RANKING-SPECIFIC REQUIREMENTS:
- The hook must be bold and immediately controversial
- Rank ALL 12 signs or focus on top 3/bottom 3 (depending on structure)
- Each ranking must have a punchy, specific reason (not generic)
- At least one placement should be genuinely surprising
- End with a comment prompt: "Prove me wrong", "Where did your sign land?", or "Tell me I'm wrong"
- Keep it 80-100 words, ~30 seconds spoken
- DO NOT be nice about it — the controversy drives engagement

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Single hook line about ranking signs by ${topic}",
    "scriptBody": [
      "First ranking segment",
      "Second ranking segment",
      "Third ranking segment",
      "Controversial placement with reason",
      "Final ranking or summary",
      "Comment call to action"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt:
        'You write provocative TikTok ranking scripts about zodiac signs. You are confident, opinionated, and never apologetic. Every ranking should make people want to argue in the comments.',
      model: 'quality',
      temperature: 0.85,
      maxTokens: 500,
    })) as {
      video?: { hook?: string; scriptBody?: string[] };
    };

    const video = result.video || {};
    const hook = String(video.hook || '').trim();
    const bodyLines = Array.isArray(video.scriptBody)
      ? video.scriptBody.map((l) => String(l).trim()).filter(Boolean)
      : [];

    if (!hook || bodyLines.length < 4) return null;

    const fullScript = normalizeGeneratedContent(
      `${hook}\n\n${bodyLines.join('\n')}`,
      { topicLabel: topic },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hook },
      {
        name: 'Rankings',
        duration: `${Math.max(15, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: 'ranking',
      themeName: 'Ranking',
      facetTitle: `Ranking signs: ${topic}`,
      topic,
      contentType: 'ranking',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'RANKING',
        title: `Ranking signs: ${topic}`,
        series: '',
        summary: `Ranking zodiac signs by ${topic}`,
        targetAudience: 'discovery',
        contentTypeKey: 'ranking',
      } as VideoScript['metadata'],
      hookText: hook,
      hookVersion: 1,
      hookStyle: 'provocative',
      scriptStructureName: scriptStructure.split(':')[0]?.trim() || 'RANKING',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate ranking script:', error);
    return null;
  }
}
