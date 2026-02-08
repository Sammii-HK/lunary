/**
 * Quiz content generator (#15)
 *
 * Generates interactive quiz-format video scripts from zodiac signs,
 * numerology life paths, or moon phases. Designed for high engagement
 * (comments, shares, saves) through identity-based questions.
 *
 * Integrated into content rotation: 1 in 7 videos per week is quiz format
 * (e.g., Wednesdays), triggered by day-of-week check.
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
 * Quiz topic pools by category
 */
const QUIZ_TOPICS = {
  zodiac: [
    'Aries vs Leo vs Sagittarius',
    'Taurus vs Virgo vs Capricorn',
    'Gemini vs Libra vs Aquarius',
    'Cancer vs Scorpio vs Pisces',
    'Fire signs vs Water signs',
    'Earth signs vs Air signs',
    'Cardinal signs vs Fixed signs vs Mutable signs',
  ],
  numerology: [
    'Life Path 1 vs Life Path 8',
    'Life Path 3 vs Life Path 5',
    'Life Path 7 vs Life Path 9',
    'Master numbers: 11 vs 22 vs 33',
    'Even life paths vs Odd life paths',
  ],
  lunar: [
    'New Moon people vs Full Moon people',
    'Waxing energy vs Waning energy',
    'Which moon phase matches your energy right now',
    'Moon in fire signs vs Moon in water signs',
  ],
};

/**
 * Check if a date should produce quiz content (Wednesdays = day 3)
 */
export function isQuizDay(scheduledDate: Date): boolean {
  return scheduledDate.getDay() === 3; // Wednesday
}

/**
 * Get a quiz topic for the given date
 */
function getQuizTopic(
  category: string,
  scheduledDate: Date,
): { topic: string; quizCategory: keyof typeof QUIZ_TOPICS } {
  const categories = Object.keys(QUIZ_TOPICS) as Array<
    keyof typeof QUIZ_TOPICS
  >;
  const dayIndex =
    scheduledDate.getFullYear() * 10000 +
    (scheduledDate.getMonth() + 1) * 100 +
    scheduledDate.getDate();

  // Prefer the matching category, fall back to rotation
  let quizCategory: keyof typeof QUIZ_TOPICS;
  if (category in QUIZ_TOPICS) {
    quizCategory = category as keyof typeof QUIZ_TOPICS;
  } else {
    quizCategory = categories[dayIndex % categories.length];
  }

  const pool = QUIZ_TOPICS[quizCategory];
  const topic = pool[dayIndex % pool.length];

  return { topic, quizCategory };
}

/**
 * Generate a quiz-format video script
 */
export async function generateQuizScript(
  category: string,
  scheduledDate: Date,
): Promise<VideoScript | null> {
  const { topic, quizCategory } = getQuizTopic(category, scheduledDate);
  const voiceConfig = getVoiceConfig('quiz');
  const scriptStructure = getRandomScriptStructure('quiz');

  const prompt = `You are writing a short-form quiz video script.

CONTENT TYPE: QUIZ (interactive, identity-affirming)

${voiceConfig.voiceDescription}

${voiceConfig.exampleEnergy}

SCRIPT STRUCTURE TO USE:
${scriptStructure}

Topic: ${topic}
Category: ${quizCategory}

QUIZ-SPECIFIC REQUIREMENTS:
- The hook must be a question or challenge that demands a response
- Present 3-4 distinct options that viewers identify with
- Each option must be specific and recognizable (not vague)
- Include at least ONE "tag someone" prompt
- End with a comment call: "Drop yours below" or similar
- Keep it under 30 seconds spoken (80-100 words)

BANNED PHRASES: ${voiceConfig.specificBans.map((b) => `"${b}"`).join(', ')}

KEY PHRASES TO USE: ${voiceConfig.keyPhrases.map((p) => `"${p}"`).join(', ')}

Return strict JSON only:
{
  "video": {
    "hook": "Single hook question about ${topic}",
    "scriptBody": [
      "Option setup or framing line",
      "Option A with specific behavior",
      "Option B with specific behavior",
      "Option C with specific behavior",
      "Reveal or identity-affirming observation",
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
        'You write interactive TikTok quiz scripts. Every line should make someone want to comment their answer. You are playful, specific, and identity-affirming. You never sound like a textbook.',
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

    if (!hook || bodyLines.length < 4) return null;

    const fullScript = normalizeGeneratedContent(
      `${hook}\n\n${bodyLines.join('\n')}`,
      { topicLabel: topic },
    );

    const wordCount = countWords(fullScript);

    const sections: ScriptSection[] = [
      { name: 'Hook', duration: '3 seconds', content: hook },
      {
        name: 'Quiz Body',
        duration: `${Math.max(15, Math.round(wordCount / 2.6) - 3)} seconds`,
        content: bodyLines.join('\n'),
      },
    ];

    return {
      themeId: `quiz-${quizCategory}`,
      themeName: `Quiz: ${quizCategory}`,
      facetTitle: topic,
      topic,
      platform: 'tiktok',
      sections,
      fullScript,
      wordCount,
      estimatedDuration: estimateDuration(wordCount),
      scheduledDate,
      status: 'draft',
      metadata: {
        theme: 'QUIZ',
        title: topic,
        series: '',
        summary: `Interactive quiz: ${topic}`,
        targetAudience: 'discovery',
        contentTypeKey: 'quiz',
      } as VideoScript['metadata'],
      hookText: hook,
      hookVersion: 1,
      hookStyle: 'question',
      scriptStructureName: scriptStructure.split(':')[0]?.trim() || 'QUIZ',
      hasLoopStructure: false,
      hasStitchBait: false,
    };
  } catch (error) {
    console.error('Failed to generate quiz script:', error);
    return null;
  }
}
