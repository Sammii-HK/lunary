/**
 * Cosmic data enricher
 * Adds cosmic context to historical tarot pulls and journal entries
 */

import { sql } from '@vercel/postgres';
import type {
  EnrichedTarotPull,
  EnrichedJournalEntry,
  CosmicData,
} from '../types';

/**
 * Enrich tarot pulls with cosmic data from global_cosmic_data cache
 */
export async function enrichTarotPulls(
  userId: string,
  startDate: Date,
): Promise<EnrichedTarotPull[]> {
  try {
    const result = await sql`
      SELECT
        tr.id,
        tr.created_at,
        tr.cards,
        tr.metadata,
        gcd.moon_phase,
        gcd.planetary_positions,
        gcd.general_transits
      FROM tarot_readings tr
      LEFT JOIN global_cosmic_data gcd
        ON DATE(tr.created_at) = gcd.data_date
      WHERE tr.user_id = ${userId}
        AND tr.created_at >= ${startDate.toISOString()}
      ORDER BY tr.created_at DESC
    `;

    const pulls: EnrichedTarotPull[] = result.rows.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      cards: row.cards,
      metadata: row.metadata,
      cosmicData: parseCosmicData(row),
    }));

    // Filter out pulls without cosmic data (shouldn't happen often)
    return pulls.filter((pull) => pull.cosmicData.moonPhase);
  } catch (error) {
    console.error('Error enriching tarot pulls:', error);
    throw new Error('Failed to enrich tarot pulls with cosmic data');
  }
}

/**
 * Enrich journal entries with cosmic data
 */
export async function enrichJournalEntries(
  userId: string,
  startDate: Date,
): Promise<EnrichedJournalEntry[]> {
  try {
    const result = await sql`
      SELECT
        c.id,
        c.content,
        c.tags,
        c.created_at,
        c.metadata,
        gcd.moon_phase,
        gcd.planetary_positions,
        gcd.general_transits
      FROM collections c
      LEFT JOIN global_cosmic_data gcd
        ON DATE(c.created_at) = gcd.data_date
      WHERE c.user_id = ${userId}
        AND c.category = 'journal'
        AND c.created_at >= ${startDate.toISOString()}
      ORDER BY c.created_at DESC
    `;

    const entries: EnrichedJournalEntry[] = result.rows.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      content: row.content,
      tags: row.tags,
      emotions: extractEmotionsFromMetadata(row.metadata),
      cosmicData: parseCosmicData(row),
    }));

    // Filter out entries without cosmic data
    return entries.filter((entry) => entry.cosmicData.moonPhase);
  } catch (error) {
    console.error('Error enriching journal entries:', error);
    throw new Error('Failed to enrich journal entries with cosmic data');
  }
}

/**
 * Parse cosmic data from database row
 */
function parseCosmicData(row: any): CosmicData {
  // If no cosmic data, return minimal structure
  if (!row.moon_phase) {
    return {
      moonPhase: { name: 'Unknown', illumination: 0 },
      planetaryPositions: {},
      aspects: [],
    };
  }

  // Parse moon phase
  const moonPhase =
    typeof row.moon_phase === 'string'
      ? JSON.parse(row.moon_phase)
      : row.moon_phase;

  // Parse planetary positions (Record<string, object> format)
  const planetaryPositions =
    typeof row.planetary_positions === 'string'
      ? JSON.parse(row.planetary_positions)
      : row.planetary_positions || {};

  // Parse general transits (includes aspects)
  let aspects: any[] = [];
  if (row.general_transits) {
    const transits =
      typeof row.general_transits === 'string'
        ? JSON.parse(row.general_transits)
        : row.general_transits;

    // general_transits is already an array of transit objects
    if (Array.isArray(transits)) {
      aspects = transits;
    }
  }

  return {
    moonPhase: {
      name: moonPhase.name || 'Unknown',
      illumination: moonPhase.illumination || 0,
      energy: moonPhase.energy,
      emoji: moonPhase.emoji,
      age: moonPhase.age,
      isSignificant: moonPhase.isSignificant,
      priority: moonPhase.priority,
    },
    planetaryPositions: planetaryPositions || {},
    aspects: Array.isArray(aspects) ? aspects : [],
  };
}

/**
 * Extract emotions from journal metadata
 */
function extractEmotionsFromMetadata(metadata: any): string[] {
  if (!metadata) return [];

  // Check various possible metadata structures
  if (Array.isArray(metadata.emotions)) {
    return metadata.emotions;
  }

  if (typeof metadata.emotion === 'string') {
    return [metadata.emotion];
  }

  if (Array.isArray(metadata.tags)) {
    // Filter tags that look like emotions
    const emotionTags = metadata.tags.filter((tag: string) =>
      /^(happy|sad|anxious|grateful|angry|peaceful|excited|stressed|calm|worried)$/i.test(
        tag,
      ),
    );
    return emotionTags;
  }

  return [];
}

/**
 * Get date range for analysis window
 */
export function getAnalysisDateRange(daysBack: number): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  return { startDate, endDate };
}
