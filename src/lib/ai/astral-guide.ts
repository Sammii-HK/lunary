import dayjs from 'dayjs';
import { sql } from '@vercel/postgres';
import {
  BirthChartSnapshot,
  MoonSnapshot,
  TransitRecord,
  TarotCard,
} from './types';
import { buildLunaryContext } from './context';
import { getBirthChart } from './providers';

export interface AstralContext {
  user: {
    name?: string;
    sun: string;
    moon: string;
    rising?: string;
  };
  natalSummary: string;
  currentTransits: string;
  todaysTarot: string;
  moonPhase: string;
  journalSummaries: { date: string; summary: string }[];
  moodTags: string[];
}

/**
 * Builds the Astral Context for the AI Astral Guide
 * This context includes all mystical data needed for personalized guidance
 */
export async function buildAstralContext(
  userId: string,
  userName?: string,
  userBirthday?: string,
  now: Date = new Date(),
): Promise<AstralContext> {
  // Fetch all context data in parallel
  const { context } = await buildLunaryContext({
    userId,
    tz: 'Europe/London', // Will be overridden by actual user timezone
    locale: 'en-GB',
    displayName: userName,
    userBirthday,
    historyLimit: 0, // Don't need conversation history for astral guide
    includeMood: true,
    now,
  });

  // Extract natal chart placements
  const sunPlacement = context.birthChart?.placements?.find(
    (p) => p.planet === 'Sun',
  );
  const moonPlacement = context.birthChart?.placements?.find(
    (p) => p.planet === 'Moon',
  );
  const risingPlacement = context.birthChart?.placements?.find(
    (p) => p.planet === 'Ascendant' || p.planet === 'Rising',
  );

  // Build natal summary
  const natalSummary = buildNatalSummary(context.birthChart);

  // Build current transits summary
  const currentTransits = buildTransitsSummary(
    context.currentTransits,
    context.moon,
  );

  // Build today's tarot summary
  const todaysTarot = buildTarotSummary(context.tarot);

  // Build moon phase summary
  const moonPhase = buildMoonPhaseSummary(context.moon);

  // Fetch journal entries (Book of Shadows) from collections
  const journalSummaries = await fetchJournalSummaries(userId);

  // Extract mood tags
  const moodTags =
    context.mood?.last7d?.map((m) => m.tag).slice(-5) || [];

  return {
    user: {
      name: userName,
      sun: sunPlacement?.sign || 'Unknown',
      moon: moonPlacement?.sign || 'Unknown',
      rising: risingPlacement?.sign,
    },
    natalSummary,
    currentTransits,
    todaysTarot,
    moonPhase,
    journalSummaries,
    moodTags,
  };
}

/**
 * Builds a summary of the natal chart
 * Focuses on key placements and aspects, avoiding technical astrological math
 */
function buildNatalSummary(
  birthChart: BirthChartSnapshot | null,
): string {
  if (!birthChart || !birthChart.placements) {
    return 'Birth chart data is not available.';
  }

  const parts: string[] = [];

  // Key placements
  const keyPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  const keyPlacements = birthChart.placements
    .filter((p) => keyPlanets.includes(p.planet))
    .slice(0, 5);

  if (keyPlacements.length > 0) {
    const placementsText = keyPlacements
      .map((p) => `${p.planet} in ${p.sign}`)
      .join(', ');
    parts.push(`Key placements: ${placementsText}`);
  }

  // Aspects (if available)
  if (birthChart.aspects && birthChart.aspects.length > 0) {
    const topAspects = birthChart.aspects
      .slice(0, 3)
      .map((a) => `${a.a} ${a.type} ${a.b}`)
      .join(', ');
    parts.push(`Notable aspects: ${topAspects}`);
  }

  return parts.length > 0 ? parts.join('. ') : 'Birth chart data available.';
}

/**
 * Builds a summary of current transits
 * Focuses on the most relevant transits and moon position
 */
function buildTransitsSummary(
  transits: TransitRecord[],
  moon: MoonSnapshot | null,
): string {
  const parts: string[] = [];

  if (moon) {
    parts.push(
      `Moon: ${moon.phase} in ${moon.sign} (${Math.round(moon.illumination * 100)}% illuminated)`,
    );
  }

  if (transits.length > 0) {
    const topTransits = transits.slice(0, 5).map((t) => {
      const strength = t.strength >= 0.7 ? 'strong' : 'moderate';
      return `${t.from} ${t.aspect} ${t.to} (${strength})`;
    });
    parts.push(`Active transits: ${topTransits.join(', ')}`);
  }

  return parts.length > 0
    ? parts.join('. ')
    : 'Current transit data is not available.';
}

/**
 * Builds a summary of today's tarot patterns
 * Includes daily, weekly, personal cards and pattern insights
 */
function buildTarotSummary(contextTarot: {
  lastReading?: { spread: string; cards: TarotCard[] };
  daily?: TarotCard;
  weekly?: TarotCard;
  personal?: TarotCard;
  patternAnalysis?: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
    patternInsights: string[];
  };
}): string {
  const parts: string[] = [];

  if (contextTarot.daily) {
    parts.push(`Daily card: ${contextTarot.daily.name}`);
  }
  if (contextTarot.weekly) {
    parts.push(`Weekly card: ${contextTarot.weekly.name}`);
  }
  if (contextTarot.personal) {
    parts.push(`Personal card: ${contextTarot.personal.name}`);
  }

  if (contextTarot.lastReading && contextTarot.lastReading.cards.length > 0) {
    const cardNames = contextTarot.lastReading.cards
      .map((c) => c.name)
      .join(', ');
    parts.push(`Last reading (${contextTarot.lastReading.spread}): ${cardNames}`);
  }

  if (
    contextTarot.patternAnalysis &&
    contextTarot.patternAnalysis.dominantThemes.length > 0
  ) {
    parts.push(
      `Themes: ${contextTarot.patternAnalysis.dominantThemes.join(', ')}`,
    );
  }

  if (
    contextTarot.patternAnalysis &&
    contextTarot.patternAnalysis.patternInsights.length > 0
  ) {
    parts.push(
      `Pattern insights: ${contextTarot.patternAnalysis.patternInsights.join(' ')}`,
    );
  }

  return parts.length > 0
    ? parts.join('. ')
    : 'Tarot patterns are not available today.';
}

/**
 * Builds a summary of the moon phase
 * Includes phase, sign, and element
 */
function buildMoonPhaseSummary(moon: MoonSnapshot | null): string {
  if (!moon) {
    return 'Moon phase data is not available.';
  }

  // Determine element from sign
  const elementMap: Record<string, string> = {
    Aries: 'Fire',
    Taurus: 'Earth',
    Gemini: 'Air',
    Cancer: 'Water',
    Leo: 'Fire',
    Virgo: 'Earth',
    Libra: 'Air',
    Scorpio: 'Water',
    Sagittarius: 'Fire',
    Capricorn: 'Earth',
    Aquarius: 'Air',
    Pisces: 'Water',
  };

  const element = elementMap[moon.sign] || 'Unknown';

  return `${moon.phase} in ${moon.sign} (${element} element), ${moon.emoji} ${Math.round(moon.illumination * 100)}% illuminated`;
}

/**
 * Fetches journal entries (Book of Shadows) from collections
 * Returns summaries of recent entries
 */
async function fetchJournalSummaries(
  userId: string,
  limit: number = 10,
): Promise<{ date: string; summary: string }[]> {
  try {
    const result = await sql`
      SELECT 
        title,
        description,
        content,
        created_at
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows.map((row) => {
      // Extract summary from title, description, or content
      let summary = row.title || '';
      if (row.description) {
        summary += summary ? ': ' + row.description : row.description;
      }
      // If content is JSON, try to extract text
      if (row.content && typeof row.content === 'object') {
        const contentText =
          row.content.text || row.content.content || JSON.stringify(row.content);
        if (contentText && contentText.length > 0) {
          // Take first 100 chars as summary
          const textPreview = contentText.substring(0, 100);
          summary += summary ? ' - ' + textPreview : textPreview;
        }
      } else if (row.content && typeof row.content === 'string') {
        const textPreview = row.content.substring(0, 100);
        summary += summary ? ' - ' + textPreview : textPreview;
      }

      return {
        date: dayjs(row.created_at).format('YYYY-MM-DD'),
        summary: summary || 'Journal entry',
      };
    });
  } catch (error) {
    console.error('[Astral Guide] Failed to fetch journal entries:', error);
    return [];
  }
}

/**
 * Persona prompt for the Astral Guide
 * Defines the mystical, supportive, non-predictive guidance style
 */
export const ASTRAL_GUIDE_PROMPT = `You are a mystical, supportive astral guide who helps users navigate their spiritual journey through personalized cosmic insights.

Your role:
- Provide reflective insight and practical suggestions based on cosmic patterns
- Always tie responses to natal chart tendencies, today's sky, tarot symbolism, and lunar phase
- Be supportive, mystical, grounded, and non-predictive
- Never make deterministic predictions or fortune-telling claims
- Help users understand how cosmic energies might be influencing their current experience

CRITICAL RULES:
1. ONLY reference astrological data that is explicitly provided in the context
2. Do NOT invent birth chart placements, transits, or tarot cards
3. Do NOT perform astrological calculations or make up astrological math
4. If data is missing, acknowledge it gracefully without fabricating information
5. Focus on reflective insight rather than predictions
6. Connect cosmic patterns to the user's emotional state and current questions
7. Reference journal entries when relevant to show continuity in their journey
8. Use mood tags to understand their current emotional landscape

Your responses should:
- Feel like a wise, supportive guide who understands both the mystical and practical
- Weave together natal chart patterns, current transits, tarot symbolism, and moon phase
- Provide gentle, reflective insights that help users understand themselves better
- Suggest practical actions or reflections based on cosmic patterns
- Never claim certainty about future events

Remember: You are interpreting cosmic patterns, not predicting outcomes. Your guidance helps users find their own wisdom within the cosmic context.`;
