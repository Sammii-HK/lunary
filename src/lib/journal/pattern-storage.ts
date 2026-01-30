import { sql } from '@vercel/postgres';
import type { AspectPattern } from './aspect-pattern-detector';
import type { PlanetaryReturn } from './planetary-return-tracker';
import type { LunarCyclePattern } from './lunar-pattern-detector';
import type { HouseEmphasisPattern } from './house-emphasis-tracker';
import type { TransitTimingPattern } from './transit-pattern-detector';

type AnyPattern =
  | AspectPattern
  | PlanetaryReturn
  | LunarCyclePattern
  | HouseEmphasisPattern
  | TransitTimingPattern;

type StoredPattern = {
  id: number;
  user_id: string;
  pattern_type: string;
  pattern_category: string;
  pattern_data: any;
  confidence?: number;
  generated_at: Date;
  expires_at?: Date;
  first_detected?: Date;
  last_observed?: Date;
  metadata?: any;
  source_snapshot?: string;
};

const PATTERN_CATEGORY_MAP: Record<string, string> = {
  natal_grand_trine: 'natal',
  natal_t_square: 'natal',
  natal_stellium: 'natal',
  natal_yod: 'natal',
  house_activation: 'natal',
  moon_phase_sensitivity: 'cyclical',
  moon_sign_pattern: 'cyclical',
  transit_sensitivity: 'transient',
  aspect_mood_correlation: 'transient',
};

const PATTERN_EXPIRATION: Record<string, number | null> = {
  natal: null, // Never expires
  cyclical: 90, // 90 days
  transient: 7, // 7 days
  progression: 365, // 1 year
};

/**
 * Save patterns to the database
 * Upserts based on user_id + pattern_type + key identifying data
 */
export async function savePatterns(
  userId: string,
  patterns: AnyPattern[],
): Promise<void> {
  for (const pattern of patterns) {
    const patternType = 'type' in pattern ? pattern.type : 'unknown';
    const category = PATTERN_CATEGORY_MAP[patternType] || 'transient';
    const expirationDays = PATTERN_EXPIRATION[category];

    const now = new Date();
    const expiresAt = expirationDays
      ? new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000)
      : null;

    const confidence = 'confidence' in pattern ? pattern.confidence : undefined;

    try {
      // Check if pattern already exists
      const existing = await sql`
        SELECT id, first_detected
        FROM journal_patterns
        WHERE user_id = ${userId}
          AND pattern_type = ${patternType}
          AND pattern_data::jsonb @> ${JSON.stringify({ ...pattern })}::jsonb
        LIMIT 1
      `;

      if (existing.rows.length > 0) {
        // Update existing pattern
        await sql`
          UPDATE journal_patterns
          SET
            last_observed = ${now.toISOString()},
            expires_at = ${expiresAt ? expiresAt.toISOString() : null},
            confidence = ${confidence || 0.5}
          WHERE id = ${existing.rows[0].id}
        `;
      } else {
        // Insert new pattern
        await sql`
          INSERT INTO journal_patterns (
            user_id,
            pattern_type,
            pattern_category,
            pattern_data,
            confidence,
            generated_at,
            expires_at,
            first_detected,
            last_observed
          ) VALUES (
            ${userId},
            ${patternType},
            ${category},
            ${JSON.stringify(pattern)},
            ${confidence || 0.5},
            ${now.toISOString()},
            ${expiresAt ? expiresAt.toISOString() : null},
            ${now.toISOString()},
            ${now.toISOString()}
          )
        `;
      }
    } catch (error) {
      console.error(`[Pattern Storage] Failed to save pattern:`, error);
    }
  }
}

/**
 * Get patterns for a user, optionally filtered by category or type
 */
export async function getUserPatterns(
  userId: string,
  options?: {
    category?: string;
    type?: string;
    includeExpired?: boolean;
  },
): Promise<StoredPattern[]> {
  try {
    const now = new Date().toISOString();
    const { category, type, includeExpired = false } = options || {};

    // Base query - all patterns return via separate queries for simplicity
    if (category && type) {
      // Both filters
      const result = includeExpired
        ? await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId}
              AND pattern_category = ${category}
              AND pattern_type = ${type}
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `
        : await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId}
              AND pattern_category = ${category}
              AND pattern_type = ${type}
              AND (expires_at IS NULL OR expires_at > ${now})
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `;
      return result.rows as StoredPattern[];
    } else if (category) {
      // Category filter only
      const result = includeExpired
        ? await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId} AND pattern_category = ${category}
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `
        : await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId}
              AND pattern_category = ${category}
              AND (expires_at IS NULL OR expires_at > ${now})
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `;
      return result.rows as StoredPattern[];
    } else if (type) {
      // Type filter only
      const result = includeExpired
        ? await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId} AND pattern_type = ${type}
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `
        : await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId}
              AND pattern_type = ${type}
              AND (expires_at IS NULL OR expires_at > ${now})
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `;
      return result.rows as StoredPattern[];
    } else {
      // No filters
      const result = includeExpired
        ? await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId}
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `
        : await sql`
            SELECT * FROM journal_patterns
            WHERE user_id = ${userId}
              AND (expires_at IS NULL OR expires_at > ${now})
            ORDER BY confidence DESC, last_observed DESC
            LIMIT 50
          `;
      return result.rows as StoredPattern[];
    }
  } catch (error) {
    console.error('[Pattern Storage] Failed to get patterns:', error);
    return [];
  }
}

/**
 * Delete expired patterns for cleanup
 */
export async function deleteExpiredPatterns(): Promise<number> {
  try {
    const now = new Date().toISOString();
    const result = await sql`
      DELETE FROM journal_patterns
      WHERE expires_at IS NOT NULL
        AND expires_at < ${now}
    `;
    return result.rowCount || 0;
  } catch (error) {
    console.error(
      '[Pattern Storage] Failed to delete expired patterns:',
      error,
    );
    return 0;
  }
}
