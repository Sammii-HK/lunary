import { sql } from '@vercel/postgres';
import { generateBirthChart, parseLocationToCoordinates } from './birthChart';
import type { BirthChartData } from './birthChart';
import { CURRENT_BIRTH_CHART_VERSION } from './chart-version';
import tzLookup from 'tz-lookup';

export interface RelationshipProfile {
  id: string;
  birthday: string;
  birth_time?: string | null;
  birth_location?: string | null;
  birth_chart?: BirthChartData[] | null;
  birth_chart_version?: number | null;
}

// ---------------------------------------------------------------------------
// In-flight dedup: If two requests hit the same profile simultaneously,
// they share a single generation promise instead of hammering LocationIQ twice.
// ---------------------------------------------------------------------------
const inFlightMap = new Map<
  string,
  Promise<{ chart: BirthChartData[] | null; regenerated: boolean }>
>();

// ---------------------------------------------------------------------------
// Short-term TTL cache: When the DB persist fails (migration not applied),
// the version column stays stale, so the next GET would trigger regeneration
// again. This cache prevents that by remembering recent regenerations for 5 min.
// ---------------------------------------------------------------------------
const recentRegenCache = new Map<
  string,
  { chart: BirthChartData[]; expiresAt: number }
>();
const REGEN_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Validates that a generated chart is usable: non-empty array with at least
 * one entry that has the critical `body` and `sign` fields.
 */
function isValidChart(chart: BirthChartData[]): boolean {
  return (
    Array.isArray(chart) &&
    chart.length > 0 &&
    chart.some(
      (entry) =>
        typeof entry.body === 'string' && typeof entry.sign === 'string',
    )
  );
}

/**
 * Checks whether a relationship profile's birth chart is up-to-date.
 * If stale (version mismatch), regenerates the chart, persists it to DB,
 * and returns the fresh chart.
 *
 * Designed to be resilient:
 * - If chart generation fails → returns existing chart
 * - If generated chart is empty/invalid → returns existing chart
 * - If DB persist fails (e.g. migration not yet applied) → still returns the freshly-generated chart
 * - If birthday is missing → returns existing chart without attempting generation
 * - Concurrent requests for the same profile share a single generation promise
 * - Recent regenerations are cached for 5 min to avoid re-generating when the version column can't persist
 */
export async function ensureRelationshipChartFresh(
  profile: RelationshipProfile,
): Promise<{ chart: BirthChartData[] | null; regenerated: boolean }> {
  // Already up to date (null/undefined !== number, so missing version triggers regen — intentional)
  if (profile.birth_chart_version === CURRENT_BIRTH_CHART_VERSION) {
    return { chart: profile.birth_chart ?? null, regenerated: false };
  }

  // Can't regenerate without a birthday
  if (!profile.birthday) {
    return { chart: profile.birth_chart ?? null, regenerated: false };
  }

  // Check short-term cache — avoids re-generating when migration hasn't applied
  const cached = recentRegenCache.get(profile.id);
  if (cached && cached.expiresAt > Date.now()) {
    return { chart: cached.chart, regenerated: false };
  }
  // Expired entry — clean up
  if (cached) {
    recentRegenCache.delete(profile.id);
  }

  // In-flight dedup: if another request is already regenerating this profile, wait for it
  const inFlight = inFlightMap.get(profile.id);
  if (inFlight) {
    return inFlight;
  }

  const promise = doRegenerate(profile);
  inFlightMap.set(profile.id, promise);

  try {
    return await promise;
  } finally {
    inFlightMap.delete(profile.id);
  }
}

/**
 * Internal: performs the actual chart regeneration, persistence, and caching.
 * Callers should go through ensureRelationshipChartFresh for dedup/cache.
 */
async function doRegenerate(
  profile: RelationshipProfile,
): Promise<{ chart: BirthChartData[] | null; regenerated: boolean }> {
  // Step 1: Generate the chart
  let chart: BirthChartData[];
  try {
    let birthTimezone: string | undefined;
    if (profile.birth_location) {
      try {
        const coords = await parseLocationToCoordinates(profile.birth_location);
        if (coords) {
          birthTimezone = tzLookup(coords.latitude, coords.longitude);
        }
      } catch {
        // Geocoding or tz-lookup failed — generate without timezone
      }
    }

    chart = await generateBirthChart(
      profile.birthday,
      profile.birth_time || undefined,
      profile.birth_location || undefined,
      birthTimezone,
    );
  } catch (genErr) {
    console.error(
      `[ensureRelationshipChartFresh] Chart generation failed for profile ${profile.id}:`,
      genErr,
    );
    // Generation failed entirely — return whatever we have
    return { chart: profile.birth_chart ?? null, regenerated: false };
  }

  // Step 1b: Validate the generated chart — refuse to overwrite a good chart with garbage
  if (!isValidChart(chart)) {
    console.warn(
      `[ensureRelationshipChartFresh] Generated chart is empty/invalid for profile ${profile.id}, keeping existing chart`,
    );
    return { chart: profile.birth_chart ?? null, regenerated: false };
  }

  // Step 2: Persist the regenerated chart + version (separate try/catch)
  // If this fails (e.g. birth_chart_version column doesn't exist yet),
  // fall back to saving just the chart. The user still gets fresh data this request.
  try {
    await sql`
      UPDATE relationship_profiles
      SET
        birth_chart = ${JSON.stringify(chart)}::jsonb,
        birth_chart_version = ${CURRENT_BIRTH_CHART_VERSION},
        updated_at = NOW()
      WHERE id = ${profile.id}::uuid
    `;
  } catch {
    // birth_chart_version column may not exist — try saving just the chart
    try {
      await sql`
        UPDATE relationship_profiles
        SET
          birth_chart = ${JSON.stringify(chart)}::jsonb,
          updated_at = NOW()
        WHERE id = ${profile.id}::uuid
      `;
    } catch (dbErr) {
      console.warn(
        `[ensureRelationshipChartFresh] DB persist failed for profile ${profile.id}:`,
        dbErr,
      );
      // DB persist failed entirely — cache locally so we don't re-generate on the next request
      recentRegenCache.set(profile.id, {
        chart,
        expiresAt: Date.now() + REGEN_CACHE_TTL_MS,
      });
    }
  }

  return { chart, regenerated: true };
}

// Exported for testing only
export { isValidChart, recentRegenCache, inFlightMap };
