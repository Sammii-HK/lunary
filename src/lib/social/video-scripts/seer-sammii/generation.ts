/**
 * Seer Sammii script generation
 *
 * Generates first-person, talking-to-camera video scripts grounded in:
 * - Real planetary positions and active retrogrades
 * - Moon phase and moon sign
 * - Event calendar: rarity scoring, historical context, convergence detection
 * - Sabbat / Wheel of the Year proximity
 * - Planetary dignities (rulership, exaltation, detriment, fall)
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
import {
  getEventCalendarForDate,
  PLANETARY_DIGNITIES,
  type CalendarEvent,
} from '@/lib/astro/event-calendar';
import { getSabbatForDate } from '@/lib/social/weekly-themes';
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
  /** Significant calendar events for the date (rarity-scored) */
  calendarEvents: CalendarEvent[];
  /** Sabbat context if within 3 days of a sabbat */
  sabbatContext: string | null;
  /** Planetary dignity context for key planets */
  dignityContext: string | null;
}

/**
 * Get the dignity status for a planet in a sign.
 * Returns e.g. "Mars is in domicile in Aries" or null if no special dignity.
 */
function getDignityForPlanet(planet: string, sign: string): string | null {
  const dignity = PLANETARY_DIGNITIES[planet];
  if (!dignity) return null;
  if (dignity.rules.includes(sign))
    return `${planet} is in domicile (rules) in ${sign} — at full power`;
  if (dignity.exalted.includes(sign))
    return `${planet} is exalted in ${sign} — elevated expression`;
  if (dignity.detriment.includes(sign))
    return `${planet} is in detriment in ${sign} — working against its nature`;
  if (dignity.fall.includes(sign))
    return `${planet} is in fall in ${sign} — weakest expression`;
  return null;
}

/**
 * Builds a rich cosmic context string including:
 * - Current moon phase, sign, and trend
 * - Active planet sign positions with retrograde flags
 * - Upcoming transit events (next 3 days)
 * - Event calendar: rarity scores, historical context, convergence
 * - Sabbat proximity (Wheel of the Year)
 * - Planetary dignity context
 */
async function buildRichTransitContext(date: Date): Promise<TransitSummary> {
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

  // --- Event Calendar: rarity, historical context, convergence ---
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  let calendarEvents: CalendarEvent[] = [];
  try {
    calendarEvents = await getEventCalendarForDate(dateStr);
  } catch (err) {
    console.warn('[seer-sammii] Event calendar lookup failed:', err);
  }

  const significantEvents = calendarEvents.filter((e) => e.score >= 30);
  if (significantEvents.length > 0) {
    parts.push('\nSIGNIFICANT COSMIC EVENTS TODAY:');
    for (const event of significantEvents.slice(0, 5)) {
      parts.push(
        `  [${event.rarity}] ${event.name} (score: ${event.score}/100)`,
      );
      if (event.rarityFrame) {
        parts.push(`    Rarity: ${event.rarityFrame}`);
      }
      if (event.historicalContext) {
        parts.push(`    History: ${event.historicalContext}`);
      }
      if (event.lastInThisSign) {
        parts.push(`    Last occurrence: ${event.lastInThisSign}`);
      }
      if (event.hookSuggestions?.length > 0) {
        parts.push(
          `    Hook ideas: ${event.hookSuggestions.slice(0, 2).join(' | ')}`,
        );
      }
    }

    // Convergence detection
    const convergenceMultiplier = Math.max(
      ...significantEvents.map((e) => e.convergenceMultiplier),
    );
    if (convergenceMultiplier > 1) {
      parts.push(
        `  CONVERGENCE: Multiple significant events align today (${convergenceMultiplier}x multiplier). This is rare.`,
      );
    }
  }

  // --- Sabbat context ---
  let sabbatContext: string | null = null;
  const sabbatMatch = getSabbatForDate(date);
  if (sabbatMatch) {
    const { sabbat, daysUntil } = sabbatMatch;
    const timing =
      daysUntil === 0
        ? 'TODAY'
        : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
    sabbatContext = `SABBAT: ${sabbat.name} is ${timing}`;
    parts.push(`\n${sabbatContext}`);

    // Look for rich sabbat data from the calendar events
    const sabbatEvent = calendarEvents.find(
      (e) => e.eventType === 'sabbat' && e.sabbatData,
    );
    if (sabbatEvent?.sabbatData) {
      const sd = sabbatEvent.sabbatData;
      parts.push(`  Meaning: ${sd.spiritualMeaning}`);
      if (sd.crystals?.length)
        parts.push(`  Crystals: ${sd.crystals.slice(0, 4).join(', ')}`);
      if (sd.herbs?.length)
        parts.push(`  Herbs: ${sd.herbs.slice(0, 4).join(', ')}`);
      if (sd.rituals?.length)
        parts.push(`  Rituals: ${sd.rituals.slice(0, 3).join(', ')}`);
      if (sd.traditions?.length)
        parts.push(`  Traditions: ${sd.traditions.slice(0, 3).join(', ')}`);
      if (sd.deities?.length)
        parts.push(`  Deities: ${sd.deities.slice(0, 3).join(', ')}`);
      if (sd.history) parts.push(`  History: ${sd.history}`);
    }
  }

  // --- Planetary dignity context ---
  const dignities: string[] = [];
  for (const planet of keyPlanets) {
    const pos = positions[planet] as any;
    if (!pos?.sign) continue;
    const dignity = getDignityForPlanet(planet, pos.sign);
    if (dignity) dignities.push(dignity);
  }
  // Also check retrograde planets
  for (const planet of retrogrades) {
    const pos = positions[planet] as any;
    if (!pos?.sign) continue;
    const dignity = getDignityForPlanet(planet, pos.sign);
    if (dignity && !dignities.some((d) => d.startsWith(planet))) {
      dignities.push(dignity);
    }
  }

  let dignityContext: string | null = null;
  if (dignities.length > 0) {
    dignityContext = dignities.join('. ');
    parts.push(`\nPLANETARY DIGNITIES: ${dignityContext}`);
  }

  // Identify the primary planet for grimoire searches
  const highPriorityTransit = relevant.find((t) => t.significance === 'high');
  // Prefer critical/high-rarity event planets over generic transits
  const criticalEvent = significantEvents.find(
    (e) => e.rarity === 'CRITICAL' && e.planet,
  );
  const highEvent = significantEvents.find(
    (e) => e.rarity === 'HIGH' && e.planet,
  );
  const primaryPlanet =
    criticalEvent?.planet ||
    highEvent?.planet ||
    highPriorityTransit?.planet ||
    retrogrades[0] ||
    'Moon';

  return {
    summary: parts.join('\n'),
    primaryPlanet,
    moonSign,
    moonPhase: moonData.name,
    retrogrades,
    calendarEvents,
    sabbatContext,
    dignityContext,
  };
}

/**
 * Selects a content type based on what's cosmically interesting today.
 * Accounts for sabbats, rare events, moon phase, and retrogrades.
 */
function selectContentType(
  moonPhase: string,
  retrogrades: string[],
  calendarEvents: CalendarEvent[],
  sabbatContext: string | null,
): ScriptContentType {
  const phase = moonPhase.toLowerCase();

  // Sabbat within range → spell work (rituals are the core of sabbat practice)
  if (sabbatContext) {
    return Math.random() > 0.3 ? 'spell_suggestion' : 'teaching';
  }

  // Critical/high rarity event → transit report to frame the significance
  const hasCriticalEvent = calendarEvents.some((e) => e.rarity === 'CRITICAL');
  const hasHighEvent = calendarEvents.some((e) => e.rarity === 'HIGH');
  if (hasCriticalEvent) {
    return 'transit_report'; // Once-in-a-lifetime events demand a report
  }
  if (hasHighEvent) {
    return Math.random() > 0.4 ? 'transit_report' : 'teaching';
  }

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
 * - Sabbat-specific search when near a sabbat
 */
async function buildRichGrimoireContext(
  topic: string,
  primaryPlanet: string,
  moonSign: string,
  contentType: ScriptContentType,
  sabbatContext: string | null,
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

  // Sabbat-specific grimoire search
  if (sabbatContext) {
    const sabbatName = sabbatContext
      .replace(/^SABBAT:\s*/, '')
      .split(' is ')[0];
    searches.push(
      retrieveGrimoireContext(
        `${sabbatName} sabbat ritual wheel of the year`,
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
 * Prioritises rare events, sabbats, and historical context over generic transits.
 */
function autoSelectTopic(
  primaryPlanet: string,
  moonPhase: string,
  moonSign: string,
  retrogrades: string[],
  contentType: ScriptContentType,
  date: Date,
  calendarEvents: CalendarEvent[],
  sabbatContext: string | null,
): string {
  const dateStr = dayjs(date).format('MMMM D, YYYY');
  const phase = moonPhase.toLowerCase();

  // If there's a CRITICAL or HIGH event, lead with that
  const criticalEvent = calendarEvents.find((e) => e.rarity === 'CRITICAL');
  const highEvent = calendarEvents.find((e) => e.rarity === 'HIGH');
  const topEvent = criticalEvent || highEvent;

  // Sabbat-driven topics
  if (sabbatContext) {
    const sabbatName = sabbatContext
      .replace(/^SABBAT:\s*/, '')
      .split(' is ')[0];
    if (contentType === 'spell_suggestion') {
      return `${sabbatName} ritual — what to do and why it matters this year`;
    }
    if (topEvent) {
      return `${sabbatName} with ${topEvent.name} — why this one is different`;
    }
    return `${sabbatName} — the real meaning and what to do with it`;
  }

  // Rare event-driven topics
  if (topEvent && contentType === 'transit_report') {
    if (topEvent.historicalContext) {
      return `${topEvent.name} — last time this happened: ${topEvent.lastInThisSign || 'decades ago'}`;
    }
    return `${topEvent.name} — what it means and why it's ${topEvent.rarity === 'CRITICAL' ? 'once in a lifetime' : 'rare'}`;
  }

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
      if (topEvent)
        return `What ${topEvent.name} actually means (not what you think)`;
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
 * Uses real planetary positions, moon phase, event calendar (rarity/history),
 * sabbat context, planetary dignities, and multi-search grimoire context.
 */
export async function generateSeerSammiiScript(
  date: Date,
  topic?: string,
  contentType?: ScriptContentType,
): Promise<SeerSammiiScript> {
  const transitData = await buildRichTransitContext(date);

  const resolvedContentType =
    contentType ||
    selectContentType(
      transitData.moonPhase,
      transitData.retrogrades,
      transitData.calendarEvents,
      transitData.sabbatContext,
    );

  const scriptTopic =
    topic ||
    autoSelectTopic(
      transitData.primaryPlanet,
      transitData.moonPhase,
      transitData.moonSign,
      transitData.retrogrades,
      resolvedContentType,
      date,
      transitData.calendarEvents,
      transitData.sabbatContext,
    );

  // Pull grimoire context with multiple targeted searches
  const grimoireContext = await buildRichGrimoireContext(
    scriptTopic,
    transitData.primaryPlanet,
    transitData.moonSign,
    resolvedContentType,
    transitData.sabbatContext,
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
      'You are writing scripts for Seer Sammii — a first-person TikTok astrology creator who teaches real astrological mechanics, spells, and crystal correspondences. Ground scripts in historical context, event rarity, and sabbat traditions when available. Write with substance and specificity.',
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
  const transitData = await buildRichTransitContext(date);

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
