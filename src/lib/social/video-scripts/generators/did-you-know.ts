/**
 * Did You Know content generator
 *
 * Generates "Did you know...?" video scripts with surprising grimoire facts.
 * Curious, informative, save-worthy content designed for TikTok discovery.
 *
 * Integrated into weekly Engagement B schedule: Saturdays.
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
import { FACT_POOLS } from '@/lib/instagram/did-you-know-content';

const CATEGORIES = Object.keys(FACT_POOLS);

/**
 * Get a fact for the given date (deterministic)
 */
export function getDidYouKnowFact(scheduledDate: Date): {
  fact: string;
  category: string;
  source: string;
} {
  const seed =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();

  const category = CATEGORIES[seed % CATEGORIES.length];
  const pool = FACT_POOLS[category] || FACT_POOLS.tarot;
  const entry = pool[seed % pool.length];

  return { fact: entry.fact, category, source: entry.source };
}

/**
 * Generate a "Did You Know" video script
 */
export async function generateDidYouKnowScript(
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const { fact, category, source } = getDidYouKnowFact(scheduledDate);
  const voiceConfig = getVoiceConfig('did_you_know');
  const scriptStructure = getRandomScriptStructure('did_you_know');

  const prompt = `You are writing a short-form "Did You Know" video script.

CONTENT TYPE: DID YOU KNOW (curious, informative, slightly conspiratorial)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Category: ${category}
Fact: ${fact}
Source: ${source}

DID YOU KNOW-SPECIFIC REQUIREMENTS:
- Open with "Did you know..." — the hook IS the question
- Deliver the fact clearly in 1-2 sentences
- Add context: WHY this matters, or what it changes about how you see the topic
- End with a save-worthy closer that makes viewers want to remember this
- Keep it 50-70 words, ~15-25 seconds spoken
- The tone is "wait till you hear this" — curious, not preachy
- Viewers should feel they learned something worth saving

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Did you know [surprising opening question]?",
    "scriptBody": [
      "The core fact, clearly stated",
      "Context or history that makes it stick",
      "Why this matters or what it changes",
      "Save-worthy closer"
    ]
  }
}`;

  try {
    const result = (await generateStructuredContent({
      prompt,
      schema: VideoScriptSchema,
      schemaName: 'video_script',
      systemPrompt:
        'You write curious, informative TikTok scripts that make viewers feel smarter. You share surprising facts about astrology, tarot, numerology, and spiritual practices. You are genuinely fascinated by what you share and it shows. You never sound like a textbook — you sound like someone who just discovered something amazing.',
      model: 'quality',
      temperature: 0.8,
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
      { topicLabel: fact },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hook },
      {
        name: 'Fact & Context',
        duration: `${Math.max(10, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: 'did-you-know',
      themeName: 'Did You Know',
      facetTitle: `Did you know: ${fact.slice(0, 60)}...`,
      topic: fact,
      contentType: 'did-you-know',
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'DID YOU KNOW',
        title: `Did You Know: ${category}`,
        series: '',
        summary: fact,
        targetAudience: 'discovery',
        contentTypeKey: 'did_you_know',
      } as VideoScript['metadata'],
      hookText: hook,
      hookVersion: 1,
      hookStyle: 'curiosity',
      scriptStructureName:
        scriptStructure.split(':')[0]?.trim() || 'DID_YOU_KNOW',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate did-you-know script:', error);
    return null;
  }
}
