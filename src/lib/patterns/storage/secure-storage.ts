/**
 * Secure storage for cosmic patterns with encryption
 * All pattern data is encrypted before saving to database
 */

import { sql } from '@vercel/postgres';
import { encryptJSON, decryptJSON } from '@/lib/encryption';
import type { Pattern, PatternTier } from '../types';
import { PATTERN_CONSTANTS } from '../core/constants';

/**
 * Save cosmic patterns to database (encrypted)
 * Replaces existing patterns for user
 */
export async function saveCosmicPatterns(
  userId: string,
  patterns: Pattern[],
): Promise<void> {
  try {
    // Delete existing cosmic patterns for user
    await sql`
      DELETE FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type LIKE 'tarot_%'
        OR pattern_type LIKE 'emotion_%'
    `;

    // Insert new patterns (encrypted)
    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() + PATTERN_CONSTANTS.PATTERN_EXPIRATION_DAYS,
    );

    for (const pattern of patterns) {
      // Encrypt the entire pattern data
      const encryptedData = encryptJSON(pattern);

      // Wrap encrypted string in a JSON object for JSONB storage
      const jsonbData = JSON.stringify({ encrypted: encryptedData });

      await sql`
        INSERT INTO journal_patterns (
          user_id,
          pattern_type,
          pattern_data,
          generated_at,
          expires_at
        ) VALUES (
          ${userId},
          ${pattern.type},
          ${jsonbData}::jsonb,
          NOW(),
          ${expirationDate.toISOString()}
        )
      `;
    }

    console.log(
      `Saved ${patterns.length} encrypted cosmic patterns for user ${userId}`,
    );
  } catch (error) {
    console.error('Error saving cosmic patterns:', error);
    throw new Error('Failed to save cosmic patterns');
  }
}

/**
 * Get cosmic patterns for user (decrypted)
 * Filters by tier if specified
 */
export async function getCosmicPatterns(
  userId: string,
  tier?: PatternTier,
): Promise<Pattern[]> {
  try {
    let query;

    if (tier) {
      // Filter by tier (requires decryption first, then filter in-memory)
      query = sql`
        SELECT pattern_data
        FROM journal_patterns
        WHERE user_id = ${userId}
          AND expires_at > NOW()
          AND (pattern_type LIKE 'tarot_%' OR pattern_type LIKE 'emotion_%')
        ORDER BY generated_at DESC
      `;
    } else {
      query = sql`
        SELECT pattern_data
        FROM journal_patterns
        WHERE user_id = ${userId}
          AND expires_at > NOW()
          AND (pattern_type LIKE 'tarot_%' OR pattern_type LIKE 'emotion_%')
        ORDER BY generated_at DESC
      `;
    }

    const result = await query;

    // Decrypt patterns
    const patterns: Pattern[] = result.rows
      .map((row) => {
        try {
          // Extract encrypted string from JSONB wrapper
          const encryptedString = row.pattern_data.encrypted;
          if (!encryptedString) {
            console.error('Pattern data missing encrypted field');
            return null;
          }

          // Decrypt the pattern data
          return decryptJSON<Pattern>(encryptedString);
        } catch (error) {
          console.error('Error decrypting pattern:', error);
          return null;
        }
      })
      .filter((p): p is Pattern => p !== null);

    // Filter by tier if specified
    if (tier) {
      return patterns.filter((p) => p.tier === tier);
    }

    return patterns;
  } catch (error) {
    console.error('Error retrieving cosmic patterns:', error);
    throw new Error('Failed to retrieve cosmic patterns');
  }
}

/**
 * Check if user has valid patterns (not expired)
 */
export async function hasValidPatterns(userId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND expires_at > NOW()
        AND (pattern_type LIKE 'tarot_%' OR pattern_type LIKE 'emotion_%')
    `;

    const count = parseInt(result.rows[0]?.count || '0');
    return count > 0;
  } catch (error) {
    console.error('Error checking valid patterns:', error);
    return false;
  }
}

/**
 * Get last pattern generation timestamp for user
 */
export async function getLastGenerationTime(
  userId: string,
): Promise<Date | null> {
  try {
    const result = await sql`
      SELECT MAX(generated_at) as last_generated
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND (pattern_type LIKE 'tarot_%' OR pattern_type LIKE 'emotion_%')
    `;

    const timestamp = result.rows[0]?.last_generated;
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Error getting last generation time:', error);
    return null;
  }
}

/**
 * Check if user can request pattern refresh (rate limiting)
 */
export async function canRefreshPatterns(userId: string): Promise<boolean> {
  const lastGeneration = await getLastGenerationTime(userId);

  if (!lastGeneration) return true;

  const hoursSinceLastGeneration =
    (Date.now() - lastGeneration.getTime()) / (1000 * 60 * 60);

  return (
    hoursSinceLastGeneration >= PATTERN_CONSTANTS.RECALCULATION_COOLDOWN_HOURS
  );
}

/**
 * Delete all patterns for user
 */
export async function deleteUserPatterns(userId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM journal_patterns
      WHERE user_id = ${userId}
        AND (pattern_type LIKE 'tarot_%' OR pattern_type LIKE 'emotion_%')
    `;

    console.log(`Deleted all cosmic patterns for user ${userId}`);
  } catch (error) {
    console.error('Error deleting patterns:', error);
    throw new Error('Failed to delete patterns');
  }
}
