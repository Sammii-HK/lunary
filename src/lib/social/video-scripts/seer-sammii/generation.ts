/**
 * Seer Sammii script generation
 *
 * Generates first-person, talking-to-camera video scripts
 * using today's transit data and grimoire context.
 */

import dayjs from 'dayjs';
import { z } from 'zod';
import { generateStructuredContent } from '@/lib/ai/content-generator';
import { retrieveGrimoireContext } from '@/lib/ai/astral-guide';
import {
  getUpcomingTransits,
  type TransitEvent,
} from '../../../../../utils/astrology/transitCalendar';
import { buildSeerSammiiPrompt, buildTalkingPointsPrompt } from './prompts';
import type { SeerSammiiScript, SeerSammiiTalkingPoints } from './types';

const SeerSammiiScriptSchema = z.object({
  talkingPoints: z.array(z.string()).min(2).max(5),
  fullScript: z.string().min(50),
  caption: z.string().max(300),
  hashtags: z.array(z.string()),
  cta: z.string(),
});

const TalkingPointsSchema = z.object({
  options: z.array(
    z.object({
      topic: z.string(),
      points: z.array(z.string()),
      transitSource: z.string(),
    }),
  ),
});

function buildTransitSummary(date: Date): string {
  const transits = getUpcomingTransits(dayjs(date));

  // Filter to today and next 2 days
  const today = dayjs(date);
  const relevant = transits.filter(
    (t: TransitEvent) =>
      t.date.isBefore(today.add(3, 'day')) &&
      !t.date.isBefore(today.subtract(1, 'day')),
  );

  if (relevant.length === 0) {
    return 'No major transits active today. Focus on the current moon phase and sign.';
  }

  return relevant
    .slice(0, 6)
    .map(
      (t: TransitEvent) =>
        `${t.planet} ${t.event} (${t.significance}): ${t.description}`,
    )
    .join('\n');
}

/**
 * Generate a full Seer Sammii script for a given date
 */
export async function generateSeerSammiiScript(
  date: Date,
  topic?: string,
): Promise<SeerSammiiScript> {
  const transitContext = buildTransitSummary(date);

  // Determine topic from transits if not provided
  const scriptTopic =
    topic || `Today's cosmic weather for ${dayjs(date).format('MMMM D, YYYY')}`;

  // Get grimoire context for the topic
  const { context: grimoireContext } = await retrieveGrimoireContext(
    scriptTopic,
    3,
  );

  const prompt = buildSeerSammiiPrompt(
    scriptTopic,
    transitContext,
    grimoireContext,
  );

  const result = await generateStructuredContent({
    prompt,
    schema: SeerSammiiScriptSchema,
    systemPrompt:
      'You are a script writer for Seer Sammii, a first-person TikTok astrology creator. Write conversational, authentic scripts.',
    temperature: 0.7,
    maxTokens: 800,
  });

  const wordCount = result.fullScript.split(/\s+/).length;
  const estimatedSeconds = Math.round(wordCount / 2.5);

  return {
    talkingPoints: result.talkingPoints,
    fullScript: result.fullScript,
    wordCount,
    estimatedDuration: `${estimatedSeconds}s`,
    topic: scriptTopic,
    caption: result.caption,
    hashtags: result.hashtags,
    cta: result.cta,
    transitContext,
    scheduledDate: date,
    status: 'draft',
  };
}

/**
 * Generate daily talking point options (lighter than full script)
 */
export async function generateDailyTalkingPoints(
  date: Date,
): Promise<SeerSammiiTalkingPoints[]> {
  const transitContext = buildTransitSummary(date);

  const prompt = buildTalkingPointsPrompt(transitContext);

  const result = await generateStructuredContent({
    prompt,
    schema: TalkingPointsSchema,
    systemPrompt:
      'You are brainstorming video topics for an astrology TikTok creator. Be specific and timely.',
    temperature: 0.8,
    maxTokens: 600,
  });

  return result.options.map((opt) => ({
    topic: opt.topic,
    points: opt.points,
    transitContext: opt.transitSource,
  }));
}
