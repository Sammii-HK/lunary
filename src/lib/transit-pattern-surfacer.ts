/**
 * Transit Pattern Surfacer
 *
 * Wraps `detectTransitTimingPatterns` from the journal pattern detector and
 * adapts its output to a UI-ready shape. The detector itself is currently a
 * placeholder (returns []), so this surfacer is forward-compatible: when the
 * detector starts returning data the card will render automatically.
 *
 * Returns the top 3-5 patterns ranked by `confidence * correlationStrength`.
 */

import {
  detectTransitTimingPatterns,
  type TransitTimingPattern,
} from './journal/transit-pattern-detector';
import type { BirthChartData } from '../../utils/astrology/birthChart';

export type SurfacedTransitPattern = {
  pattern: string;
  confidence: number;
  transitContext: string;
  journalContext: string;
  supportingDates: string[];
};

type PersonalTransit = {
  transitPlanet: string;
  natalPlanet?: string;
  aspect?: string;
  date?: string;
};

type SurfaceArgs = {
  userId: string;
  birthChart: BirthChartData[];
  /** Optional: current personal transits for cross-referencing context. */
  personalTransits?: PersonalTransit[];
  /** Lookback window for pattern detection (default 90 days). */
  daysBack?: number;
  /** Maximum number of patterns to return (default 5). */
  limit?: number;
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: 'conjuncts',
  opposition: 'opposes',
  square: 'squares',
  trine: 'trines',
  sextile: 'sextiles',
};

/**
 * Format the detector's `transitType` (e.g. "Mars_square") into a natural
 * sentence about which transit is active. If we have a `natalPlanet` we
 * surface the personal aspect; otherwise we describe the transit broadly.
 */
function buildTransitContext(p: TransitTimingPattern): string {
  const [planetRaw, aspectRaw] = (p.transitType || '').split('_');
  const planet = planetRaw || 'A planet';
  const aspect = aspectRaw ? ASPECT_LABELS[aspectRaw] || aspectRaw : null;

  if (p.natalPlanet && aspect) {
    return `When transit ${planet} ${aspect} your natal ${p.natalPlanet}`;
  }
  if (aspect) {
    return `When transit ${planet} forms a ${aspectRaw}`;
  }
  return `When ${planet} is active`;
}

/**
 * Build the journal-side phrasing — what the user *does* during this transit.
 * Falls back to the detector's `description` when we can't synthesize one.
 */
function buildJournalContext(p: TransitTimingPattern): string {
  if (p.moodTags && p.moodTags.length > 0) {
    const top = p.moodTags.slice(0, 2).join(' and ');
    return `you tend to journal ${top} feelings`;
  }
  if (p.type === 'transit_sensitivity') {
    return `you journal more frequently (${p.journalCount} entries vs. ${p.totalOccurrences} transit days)`;
  }
  return p.description;
}

/**
 * Pick supporting dates if the detector exposes them on `(p as any).dates`.
 * The current placeholder doesn't, but this is forward-compatible.
 */
function extractSupportingDates(p: TransitTimingPattern): string[] {
  const maybeDates = (p as unknown as { supportingDates?: unknown })
    .supportingDates;
  if (!Array.isArray(maybeDates)) return [];
  return maybeDates
    .filter(
      (d): d is string | Date => typeof d === 'string' || d instanceof Date,
    )
    .slice(0, 4)
    .map((d) => (d instanceof Date ? d.toISOString() : d));
}

export async function surfaceTransitPatterns({
  userId,
  birthChart,
  personalTransits = [],
  daysBack = 90,
  limit = 5,
}: SurfaceArgs): Promise<SurfacedTransitPattern[]> {
  if (!userId || !birthChart || birthChart.length === 0) return [];

  let detected: TransitTimingPattern[] = [];
  try {
    detected = await detectTransitTimingPatterns(userId, birthChart, daysBack);
  } catch (err) {
    console.error('[transit-pattern-surfacer] detector failed:', err);
    return [];
  }

  // Cross-reference: prefer patterns whose `transitPlanet` is currently active
  // for this user — these are the most actionable surfacing moments.
  const activePlanets = new Set(
    personalTransits.map((t) => t.transitPlanet).filter(Boolean),
  );

  const surfaced: SurfacedTransitPattern[] = detected
    .map((p) => {
      const [planetRaw] = (p.transitType || '').split('_');
      const isActive = activePlanets.has(planetRaw);
      const score = (p.confidence ?? 0) * (p.correlationStrength ?? 0);
      return { p, score, isActive };
    })
    // Active transits float to the top; otherwise rank by combined score.
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b.score - a.score;
    })
    .slice(0, Math.max(3, Math.min(limit, 5)))
    .map(({ p }) => ({
      pattern: buildJournalContext(p),
      confidence: Math.max(0, Math.min(1, p.confidence ?? 0)),
      transitContext: buildTransitContext(p),
      journalContext: p.description,
      supportingDates: extractSupportingDates(p),
    }));

  return surfaced;
}
