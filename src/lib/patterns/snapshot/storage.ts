/**
 * Pattern snapshot storage
 * Saves and retrieves pattern snapshots with change detection
 */

import { sql } from '@vercel/postgres';
import { encryptJSON, decryptJSON } from '@/lib/encryption';
import type { PatternSnapshot } from './types';
import { hasPatternChanged } from './types';
import { invalidatePatternCache } from './cache';

/**
 * Save a pattern snapshot (if it changed)
 * Returns true if saved, false if skipped
 */
export async function savePatternSnapshot(
  userId: string,
  snapshot: PatternSnapshot,
): Promise<boolean> {
  try {
    // Get most recent snapshot of this type
    const recentResult = await sql`
      SELECT pattern_data
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type = ${snapshot.type}
      ORDER BY generated_at DESC
      LIMIT 1
    `;

    let previousSnapshot: PatternSnapshot | null = null;
    if (recentResult.rows.length > 0) {
      const encryptedString = recentResult.rows[0].pattern_data.encrypted;
      if (encryptedString) {
        previousSnapshot = decryptJSON<PatternSnapshot>(encryptedString);
      }
    }

    // Check if pattern changed
    if (!hasPatternChanged(previousSnapshot, snapshot)) {
      console.log(
        `[PatternSnapshot] No significant change in ${snapshot.type} for user ${userId}, skipping save`,
      );
      return false;
    }

    // Encrypt snapshot
    const encryptedData = encryptJSON(snapshot);
    const jsonbData = JSON.stringify({ encrypted: encryptedData });

    // Calculate expiration (6 months from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    // Save snapshot
    await sql`
      INSERT INTO journal_patterns (
        user_id,
        pattern_type,
        pattern_data,
        generated_at,
        expires_at
      ) VALUES (
        ${userId},
        ${snapshot.type},
        ${jsonbData}::jsonb,
        NOW(),
        ${expiresAt.toISOString()}
      )
    `;

    console.log(
      `[PatternSnapshot] Saved ${snapshot.type} snapshot for user ${userId}`,
    );

    // Invalidate cache after saving new pattern
    invalidatePatternCache(userId);

    return true;
  } catch (error) {
    console.error('Error saving pattern snapshot:', error);
    return false;
  }
}

/**
 * Get pattern snapshot history for a user
 */
export async function getPatternHistory(
  userId: string,
  patternType?: string,
  limit: number = 50,
): Promise<PatternSnapshot[]> {
  try {
    const query = patternType
      ? sql`
          SELECT pattern_data, generated_at
          FROM journal_patterns
          WHERE user_id = ${userId}
            AND pattern_type = ${patternType}
            AND expires_at > NOW()
          ORDER BY generated_at DESC
          LIMIT ${limit}
        `
      : sql`
          SELECT pattern_data, generated_at
          FROM journal_patterns
          WHERE user_id = ${userId}
            AND pattern_type IN ('life_themes', 'tarot_season', 'archetype', 'tarot_moon_phase', 'emotion_moon_phase')
            AND expires_at > NOW()
          ORDER BY generated_at DESC
          LIMIT ${limit}
        `;

    const result = await query;

    const snapshots: PatternSnapshot[] = [];
    for (const row of result.rows) {
      const encryptedString = row.pattern_data.encrypted;
      if (encryptedString) {
        const snapshot = decryptJSON<PatternSnapshot>(encryptedString);
        snapshots.push(snapshot);
      }
    }

    return snapshots;
  } catch (error) {
    console.error('Error fetching pattern history:', error);
    return [];
  }
}

/**
 * Get the most recent snapshot for each pattern type
 */
export async function getCurrentSnapshots(
  userId: string,
): Promise<Record<string, PatternSnapshot>> {
  try {
    const result = await sql`
      SELECT DISTINCT ON (pattern_type)
        pattern_type,
        pattern_data,
        generated_at
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type IN ('life_themes', 'tarot_season', 'archetype', 'tarot_moon_phase', 'emotion_moon_phase')
        AND expires_at > NOW()
      ORDER BY pattern_type, generated_at DESC
    `;

    const snapshots: Record<string, PatternSnapshot> = {};

    for (const row of result.rows) {
      const encryptedString = row.pattern_data.encrypted;
      if (encryptedString) {
        const snapshot = decryptJSON<PatternSnapshot>(encryptedString);
        snapshots[row.pattern_type] = snapshot;
      }
    }

    return snapshots;
  } catch (error) {
    console.error('Error fetching current snapshots:', error);
    return {};
  }
}

/**
 * Check if a snapshot should be generated for a user
 * Returns true if:
 * - No snapshot exists for this type
 * - Last snapshot is >7 days old
 * - Pattern has changed significantly
 */
export async function shouldGenerateSnapshot(
  userId: string,
  patternType: string,
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT generated_at
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type = ${patternType}
      ORDER BY generated_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return true; // No snapshot exists
    }

    const lastGenerated = new Date(result.rows[0].generated_at);
    const daysSinceLastSnapshot =
      (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastSnapshot >= 7; // Weekly snapshots
  } catch (error) {
    console.error('Error checking snapshot status:', error);
    return false;
  }
}
