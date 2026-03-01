/**
 * Seer Sammii script generation
 *
 * Generates first-person, talking-to-camera video scripts grounded in:
 * - Real planetary positions and active retrogrades
 * - Moon phase and moon sign
 * - Grimoire spells, crystals, and teachings matched to the transit
 *
 * Content varies across 5 types: transit_report, teaching, spell_suggestion,
 * crystal_recommendation, myth_bust
 */

import dayjs from 'dayjs';
import { z } from 'zod';
import { generateStructuredContent } from '@/lib/ai/content-generator';
import { retrieveGrimoireContext } from '@/lib/ai/astral-guide';
import {
  getUpcomingTransits,
  type TransitEvent,
} from '../../../../../utils/astrology/transitCalendar';
import {
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
} from '../../../../../utils/astrology/astronomical-data';
import { buildSeerSammiiPrompt, buildTalkingPointsPrompt } from './prompts';
import type {
  SeerSammiiScript,
  SeerSammiiTalkingPoints,
  ScriptContentType,
} from './types';

const SeerSammiiScriptSchema = z.object({
  talkingPoints: z.array(z.string()).min(2).max(5),
  fullScript: z.string().min(50),
  caption: z.string().max(300),
  hashtags: z.array(z.string()),
  cta: z.string(),
  contentType: z.string().optional(),
});

const TalkingPointsSchema = z.object({
  options: z.array(
    z.object({
      topic: z.string(),
      points: z.array(z.string()),
      transitSource: z.string(),
      contentType: z.string().optional(),
    }),
  ),
});

interface TransitSummary {
  summary: string;
  primaryPlanet: string;
  moonSign: string;
  moonPhase: string;
  retrogrades: string[];
}

/**
 * Builds a rich cosmic context string including:
 * - Current moon phase, sign, and trend
 * - Active planet sign positions with retrograde flags
 * - Upcoming transit events (next 3 days)
 */
function buildRichTransitContext(date: Date): TransitSummary {
  const transits = getUpcomingTransits(dayjs(date));
  const moonData = getAccurateMoonPhase(date);
  const positions = getRealPlanetaryPositions(date);

  const moonSign: string = (positions.Moon as any)?.sign || 'Unknown';

  // All planets currently in retrograde
  const retrogrades = Object.entries(positions)
    .filter(([, pos]) => (pos as any).retrograde)
    .map(([planet]) => planet)
    .filter((p) => p !== 'Moon' && p !== 'Sun'); // Moon/Sun don't retrograde

  // Transits within the next 3 days (or yesterday for context)
  const today = dayjs(date);
  const relevant = transits.filter(
    (t: TransitEvent) =>
      t.date.isBefore(today.add(3, 'day')) &&
      !t.date.isBefore(today.subtract(1, 'day')),
  );

  const parts: string[] = [];

  // Always lead with moon — it's the most immediately relevant
  const supermoon = (moonData as any).isSuperMoon ? ' — SUPERMOON' : '';
  parts.push(
    `MOON: ${moonData.name} in ${moonSign} (${moonData.trend}, ${moonData.illumination}% illuminated)${supermoon}`,
  );

  // Current planet positions for key planets
  const keyPlanets = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planetPositions = keyPlanets
    .map((p) => {
      const pos = positions[p] as any;
      if (!pos?.sign) return null;
      const rx = pos.retrograde ? ' Rx' : '';
      return `${p} in ${pos.sign}${rx}`;
    })
    .filter(Boolean);

  if (planetPositions.length > 0) {
    parts.push(`CURRENT SKY: ${planetPositions.join(', ')}`);
  }

  // Call out retrogrades explicitly — they're high-value content
  if (retrogrades.length > 0) {
    parts.push(`RETROGRADES ACTIVE: ${retrogrades.join(', ')}`);
  }

  // Upcoming transit events
  if (relevant.length > 0) {
    parts.push('UPCOMING EVENTS:');
    relevant.slice(0, 5).forEach((t: TransitEvent) => {
      parts.push(
        `  ${t.planet} ${t.event} on ${t.date.format('MMM D')} (${t.significance}): ${t.description}`,
      );
    });
  } else {
    parts.push(
      'No major ingresses or aspect events in the next 3 days. Focus on current placements and moon phase.',
    );
  }

  // Identify the primary planet for grimoire searches
  const highPriorityTransit = relevant.find((t) => t.significance === 'high');
  const primaryPlanet = highPriorityTransit?.planet || retrogrades[0] || 'Moon';

  return {
    summary: parts.join('\n'),
    primaryPlanet,
    moonSign,
    moonPhase: moonData.name,
    retrogrades,
  };
}

/**
 * Selects a content type based on what's cosmically interesting today.
 * Weighted toward variety so scripts don't all feel the same.
 */
function selectContentType(
  moonPhase: string,
  retrogrades: string[],
): ScriptContentType {
  const phase = moonPhase.toLowerCase();

  // New moon → spell work is most relevant
  if (phase.includes('new')) {
    return 'spell_suggestion';
  }

  // Full moon → teaching about culmination or a release spell
  if (phase.includes('full')) {
    return Math.random() > 0.5 ? 'spell_suggestion' : 'teaching';
  }

  // Active retrograde → great teaching or crystal content
  if (retrogrades.length > 0) {
    return Math.random() > 0.5 ? 'teaching' : 'crystal_recommendation';
  }

  // Regular day: weighted variety
  const pool: ScriptContentType[] = [
    'transit_report',
    'teaching',
    'teaching', // double weight — strongest content type
    'spell_suggestion',
    'crystal_recommendation',
    'myth_bust',
  ];

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Builds a rich grimoire context by running multiple targeted searches:
 * - Main topic search
 * - Spell/ritual search for spell_suggestion content
 * - Crystal search for crystal_recommendation content
 * - Teaching/meaning search for teaching content
 */
async function buildRichGrimoireContext(
  topic: string,
  primaryPlanet: string,
  moonSign: string,
  contentType: ScriptContentType,
): Promise<string> {
  const searches: Promise<{ context: string }>[] = [
    retrieveGrimoireContext(topic, 3),
  ];

  if (contentType === 'spell_suggestion') {
    searches.push(
      retrieveGrimoireContext(`${primaryPlanet} spell ritual magic`, 2),
    );
  } else if (contentType === 'crystal_recommendation') {
    searches.push(
      retrieveGrimoireContext(`crystal ${primaryPlanet} ${moonSign}`, 2),
    );
  } else if (contentType === 'teaching') {
    searches.push(
      retrieveGrimoireContext(
        `${primaryPlanet} meaning astrology ${moonSign}`,
        2,
      ),
    );
  }

  const results = await Promise.all(searches);

  return results
    .map((r) => r.context)
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Auto-generates a specific, angle-driven topic based on what's happening cosmically.
 * Falls back to a generic topic only if nothing more interesting is available.
 */
function autoSelectTopic(
  primaryPlanet: string,
  moonPhase: string,
  moonSign: string,
  retrogrades: string[],
  contentType: ScriptContentType,
  date: Date,
): string {
  const dateStr = dayjs(date).format('MMMM D, YYYY');
  const phase = moonPhase.toLowerCase();

  switch (contentType) {
    case 'spell_suggestion':
      if (phase.includes('new'))
        return `New moon in ${moonSign} — what spell to cast tonight`;
      if (phase.includes('full'))
        return `Full moon in ${moonSign} — what to release and how`;
      if (retrogrades.length > 0)
        return `${retrogrades[0]} retrograde protection and clarity spell`;
      return `${primaryPlanet} in ${moonSign} — spell work for this transit`;

    case 'teaching':
      if (retrogrades.length > 0)
        return `What ${retrogrades[0]} retrograde actually does (not what you think)`;
      if (phase.includes('new'))
        return `What the new moon in ${moonSign} is actually for`;
      if (phase.includes('full'))
        return `What a full moon in ${moonSign} really means energetically`;
      return `What ${primaryPlanet} in ${moonSign} is actually doing to you right now`;

    case 'crystal_recommendation':
      if (retrogrades.length > 0)
        return `Best crystals for ${retrogrades[0]} retrograde survival`;
      return `Crystals for ${primaryPlanet} energy — what to use and why`;

    case 'myth_bust':
      return `The biggest misconception about ${primaryPlanet} in astrology`;

    default:
      return `Today's cosmic weather — ${dateStr}`;
  }
}

/**
 * Generate a full Seer Sammii script for a given date.
 * Uses real planetary positions, moon phase, and multi-search grimoire context.
 */
export async function generateSeerSammiiScript(
  date: Date,
  topic?: string,
  contentType?: ScriptContentType,
): Promise<SeerSammiiScript> {
  const transitData = buildRichTransitContext(date);

  const resolvedContentType =
    contentType ||
    selectContentType(transitData.moonPhase, transitData.retrogrades);

  const scriptTopic =
    topic ||
    autoSelectTopic(
      transitData.primaryPlanet,
      transitData.moonPhase,
      transitData.moonSign,
      transitData.retrogrades,
      resolvedContentType,
      date,
    );

  // Pull grimoire context with multiple targeted searches
  const grimoireContext = await buildRichGrimoireContext(
    scriptTopic,
    transitData.primaryPlanet,
    transitData.moonSign,
    resolvedContentType,
  );

  const prompt = buildSeerSammiiPrompt(
    scriptTopic,
    transitData.summary,
    grimoireContext,
    resolvedContentType,
  );

  const result = await generateStructuredContent({
    prompt,
    schema: SeerSammiiScriptSchema,
    systemPrompt:
      'You are writing scripts for Seer Sammii — a first-person TikTok astrology creator who teaches real astrological mechanics, spells, and crystal correspondences. Write with substance and specificity.',
    temperature: 0.7,
    maxTokens: 900,
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
    contentType:
      (result.contentType as ScriptContentType) || resolvedContentType,
    transitContext: transitData.summary,
    scheduledDate: date,
    status: 'draft',
  };
}

/**
 * Generate daily talking point options (lighter than full script).
 * Returns 3 options with varied content types.
 */
export async function generateDailyTalkingPoints(
  date: Date,
): Promise<SeerSammiiTalkingPoints[]> {
  const transitData = buildRichTransitContext(date);

  // Get grimoire context seeded by the most interesting current event
  const { context: grimoireContext } = await retrieveGrimoireContext(
    `${transitData.primaryPlanet} ${transitData.moonPhase} ${transitData.moonSign}`,
    3,
  );

  const prompt = buildTalkingPointsPrompt(transitData.summary, grimoireContext);

  const result = await generateStructuredContent({
    prompt,
    schema: TalkingPointsSchema,
    systemPrompt:
      'You are brainstorming TikTok video topics for Seer Sammii, a real astrology creator who teaches mechanics, spells, and crystals. Topics must be specific to the transits provided. Vary content types across options.',
    temperature: 0.8,
    maxTokens: 700,
  });

  return result.options.map((opt) => ({
    topic: opt.topic,
    points: opt.points,
    transitContext: opt.transitSource,
    contentType: opt.contentType as ScriptContentType | undefined,
  }));
}
