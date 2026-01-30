import { unstable_cache, revalidateTag } from 'next/cache';
import { sql } from '@vercel/postgres';
import { LunaryContext } from '../ai/types';
import { buildLunaryContext } from '../ai/context';
import { GlobalCosmicData } from './global-cache';

// CACHE_VERSION: Increment when snapshot schema changes
// This ensures old cached data is invalidated when we add new fields
const CACHE_VERSION = 2; // v2: Added natal chart patterns

export async function getCachedSnapshot(
  userId: string,
  date: Date = new Date(),
): Promise<LunaryContext | null> {
  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `cosmic-snapshot-${userId}-${dateStr}`;
  const tags = [
    'cosmic-snapshot',
    `cosmic-snapshot-${userId}`,
    `cosmic-snapshot-${userId}-${dateStr}`,
  ];

  const cached = unstable_cache(
    async () => {
      const result = await sql`
        SELECT snapshot_data, updated_at
        FROM cosmic_snapshots
        WHERE user_id = ${userId} AND snapshot_date = ${dateStr}
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        const snapshot = result.rows[0].snapshot_data as LunaryContext & {
          _cacheVersion?: number;
        };
        const updatedAt = new Date(result.rows[0].updated_at);
        const now = new Date();
        const hoursSinceUpdate =
          (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

        // Check cache version - if mismatched, return null to force refresh
        if (snapshot._cacheVersion !== CACHE_VERSION) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[getCachedSnapshot] Cache version mismatch (cached: ${snapshot._cacheVersion}, current: ${CACHE_VERSION}), forcing refresh`,
            );
          }
          return null;
        }

        // Check if birth chart has patterns - if missing, return null to force refresh
        // This handles edge cases where cache version matches but data is incomplete
        if (snapshot.birthChart && !snapshot.birthChart.patterns) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[getCachedSnapshot] Birth chart missing patterns, forcing refresh`,
            );
          }
          return null;
        }

        // Tarot cards change daily - if snapshot is older than 24 hours, return null to force refresh
        // This ensures daily/weekly/personal cards are always fresh
        // The route will generate a new snapshot when this returns null
        if (hoursSinceUpdate > 24) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[getCachedSnapshot] Snapshot too old (${hoursSinceUpdate.toFixed(1)}h), returning null to trigger refresh`,
            );
          }
          return null;
        }

        return snapshot;
      }

      // No snapshot exists - return null so route can create it
      return null;
    },
    [cacheKey],
    {
      tags,
      revalidate: 3600, // 1 hour - Next.js cache TTL
      // Note: We don't cache null results indefinitely - if snapshot is stale or missing,
      // the route will generate it and saveSnapshot will invalidate the cache tags
    },
  );

  return await cached();
}

export async function saveSnapshot(
  userId: string,
  date: Date,
  context: LunaryContext,
): Promise<void> {
  const dateStr = date.toISOString().split('T')[0];

  // Add cache version to snapshot for future invalidation
  const versionedContext = {
    ...context,
    _cacheVersion: CACHE_VERSION,
  };

  await sql`
    INSERT INTO cosmic_snapshots (user_id, snapshot_date, snapshot_data, updated_at)
    VALUES (${userId}, ${dateStr}, ${JSON.stringify(versionedContext)}::jsonb, NOW())
    ON CONFLICT (user_id, snapshot_date)
    DO UPDATE SET
      snapshot_data = ${JSON.stringify(versionedContext)}::jsonb,
      updated_at = NOW()
  `;

  revalidateTag('cosmic-snapshot');
  revalidateTag(`cosmic-snapshot-${userId}`);
  revalidateTag(`cosmic-snapshot-${userId}-${dateStr}`);
}

export function invalidateSnapshot(userId: string): void {
  revalidateTag(`cosmic-snapshot-${userId}`);
}

export async function buildSnapshotWithGlobalCache(
  userId: string,
  globalData: GlobalCosmicData,
  tz: string,
  locale: string,
  displayName?: string,
  userBirthday?: string,
  now?: Date,
): Promise<LunaryContext> {
  const { context } = await buildLunaryContext({
    userId,
    tz,
    locale,
    displayName,
    userBirthday,
    now,
  });

  return context;
}
