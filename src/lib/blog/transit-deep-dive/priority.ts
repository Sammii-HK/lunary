/**
 * Transit blog post prioritisation.
 *
 * Determines which transits need blog posts and in what order.
 * Queries existing posts from DB to avoid duplicates.
 */

import { sql } from '@vercel/postgres';
import {
  YEARLY_TRANSITS,
  type YearlyTransit,
} from '@/constants/seo/yearly-transits';
import type { TransitCandidate } from './types';
import type { EventRarity } from '@/lib/astro/event-calendar';

const RARITY_SCORES: Record<string, number> = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
};

const ORBITAL_PERIOD_YEARS: Record<string, number> = {
  Jupiter: 11.86,
  Saturn: 29.46,
  Uranus: 84.01,
  Neptune: 164.8,
  Pluto: 247.9,
};

function getRarity(planet: string): EventRarity {
  const period = ORBITAL_PERIOD_YEARS[planet];
  if (!period) return 'LOW';
  if (period >= 80) return 'CRITICAL';
  if (period >= 25) return 'HIGH';
  if (period >= 10) return 'MEDIUM';
  return 'LOW';
}

/**
 * Get all transits that don't yet have blog posts, sorted by priority.
 *
 * Priority = rarity score + proximity bonus (closer transits score higher
 * if they're within the 180-day lead window).
 */
export async function getTransitsNeedingBlogPosts(): Promise<
  TransitCandidate[]
> {
  // Get all existing transit blog post transit IDs
  const existing =
    await sql`SELECT transit_id FROM transit_blog_posts WHERE status != 'archived'`;
  const existingIds = new Set(existing.rows.map((r) => r.transit_id));

  const now = new Date();
  const candidates: TransitCandidate[] = [];

  for (const transit of YEARLY_TRANSITS) {
    if (existingIds.has(transit.id)) continue;

    // Only generate for slow planets (Jupiter+)
    if (!ORBITAL_PERIOD_YEARS[transit.planet]) continue;

    const rarity = getRarity(transit.planet);
    const rarityScore = RARITY_SCORES[rarity];

    // Proximity bonus: transits starting sooner get a boost
    let proximityBonus = 0;
    if (transit.startDate) {
      const daysUntil = Math.max(
        0,
        (transit.startDate.getTime() - now.getTime()) / 86400000,
      );
      // Past or imminent transits get max bonus
      if (daysUntil <= 0) {
        proximityBonus = 50; // Already started -- urgent catch-up
      } else if (daysUntil <= 90) {
        proximityBonus = 40;
      } else if (daysUntil <= 180) {
        proximityBonus = 30;
      } else if (daysUntil <= 365) {
        proximityBonus = 15;
      }
    }

    candidates.push({
      transitId: transit.id,
      planet: transit.planet,
      sign: transit.signs[0],
      year: transit.year,
      transitType: transit.transitType,
      startDate: transit.startDate ?? null,
      endDate: transit.endDate ?? null,
      rarity,
      score: rarityScore + proximityBonus,
      title: transit.title,
    });
  }

  // Sort by score descending, then by start date ascending
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = a.startDate?.getTime() ?? Infinity;
    const bDate = b.startDate?.getTime() ?? Infinity;
    return aDate - bDate;
  });

  return candidates;
}

/**
 * Get the count of uncovered transits within the lead-time window.
 * Used by the cron to determine adaptive batch size.
 */
export async function getUncoveredCount(
  leadDays: number = 180,
): Promise<number> {
  const candidates = await getTransitsNeedingBlogPosts();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + leadDays * 86400000);

  return candidates.filter((c) => {
    if (!c.startDate) return true; // No date = include it
    return c.startDate <= windowEnd;
  }).length;
}

/**
 * Get a specific YearlyTransit by ID.
 */
export function getTransitById(transitId: string): YearlyTransit | undefined {
  return YEARLY_TRANSITS.find((t) => t.id === transitId);
}
