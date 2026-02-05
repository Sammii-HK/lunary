import { unstable_cache, revalidateTag } from 'next/cache';
import { sql } from '@vercel/postgres';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
  checkSeasonalEvents,
  checkSignIngress,
  checkRetrogradeEvents,
  getSignDescription,
} from '../../../utils/astrology/astronomical-data';
import { calculateTransitDuration } from '../../../utils/astrology/transit-duration';
import { Observer } from 'astronomy-engine';

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

export type GlobalCosmicData = {
  moonPhase: {
    name: string;
    energy: string;
    priority: number;
    emoji: string;
    illumination: number;
    age: number;
    isSignificant: boolean;
  };
  planetaryPositions: Record<
    string,
    {
      longitude: number;
      sign: string;
      degree: number; // Degree in sign (0-29)
      minutes: number; // Minutes of arc (0-59)
      retrograde: boolean;
      newRetrograde: boolean;
      newDirect: boolean; // Detect direct station
      // Duration fields (will be added in Phase 1)
      duration?: {
        totalDays: number;
        remainingDays: number;
        displayText: string;
        startDate: Date;
        endDate: Date;
      };
    }
  >;
  generalTransits: Array<{
    name: string;
    aspect: string;
    glyph: string;
    planetA: any;
    planetB: any;
    energy: string;
    priority: number;
    separation: number;
  }>;
};

export async function buildGlobalCosmicData(
  date: Date = new Date(),
): Promise<GlobalCosmicData> {
  const positions = getRealPlanetaryPositions(date, DEFAULT_OBSERVER);
  const moonPhase = getAccurateMoonPhase(date);
  const aspects = calculateRealAspects(positions);
  const seasonalEvents = checkSeasonalEvents(positions);
  const ingresses = checkSignIngress(positions, date);
  const retrogradeEvents = checkRetrogradeEvents(positions);

  const generalTransits = [
    ...aspects.map((aspect) => ({
      name: aspect.name,
      aspect: aspect.aspect,
      glyph: aspect.glyph,
      planetA: aspect.planetA,
      planetB: aspect.planetB,
      energy: aspect.energy,
      priority: aspect.priority,
      separation: aspect.separation,
    })),
    ...seasonalEvents.map((event) => ({
      name: event.name,
      aspect: 'seasonal',
      glyph: event.emoji,
      planetA: { name: 'Sun', constellation: positions.Sun.sign },
      planetB: null,
      energy: event.energy,
      priority: event.priority,
      separation: 0,
    })),
    ...ingresses.map((ingress) => ({
      name: ingress.name,
      aspect: 'ingress',
      glyph: '→',
      planetA: { name: ingress.planet, constellation: ingress.sign },
      planetB: null,
      energy: ingress.energy,
      priority: ingress.priority,
      separation: 0,
    })),
    ...retrogradeEvents.map((retro) => ({
      name: retro.name,
      aspect: 'retrograde',
      glyph: '℞',
      planetA: { name: retro.planet, constellation: retro.sign },
      planetB: null,
      energy: retro.energy,
      priority: retro.priority,
      separation: 0,
    })),
  ].sort((a, b) => b.priority - a.priority);

  return {
    moonPhase,
    planetaryPositions: positions,
    generalTransits,
  };
}

const hasPostgres = Boolean(process.env.POSTGRES_URL);

export async function getGlobalCosmicData(
  date: Date = new Date(),
): Promise<GlobalCosmicData | null> {
  if (!hasPostgres) {
    return await buildGlobalCosmicData(date);
  }

  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `global-cosmic-${dateStr}`;
  const tags = ['cosmic-global', `cosmic-global-${dateStr}`];

  const cached = unstable_cache(
    async () => {
      const result = await sql`
        SELECT moon_phase, planetary_positions, general_transits
        FROM global_cosmic_data
        WHERE data_date = ${dateStr}
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        return {
          moonPhase: result.rows[0].moon_phase,
          planetaryPositions: result.rows[0].planetary_positions,
          generalTransits: result.rows[0].general_transits,
        } as GlobalCosmicData;
      }

      const freshData = await buildGlobalCosmicData(date);
      await saveGlobalCosmicData(date, freshData, { revalidateTags: false });
      return freshData;
    },
    [cacheKey],
    {
      tags,
      revalidate: 7200,
    },
  );

  const data = await cached();

  // Recompute durations from current time using cached position data.
  // The DB/cache stores static remainingDays that go stale, but longitude
  // and sign are still valid — recalculate duration from those + current date.
  if (data?.planetaryPositions) {
    const now = new Date();
    for (const [planet, pos] of Object.entries(data.planetaryPositions)) {
      const fresh = calculateTransitDuration(
        planet,
        pos.sign,
        pos.longitude,
        now,
      );
      pos.duration = fresh
        ? {
            totalDays: fresh.totalDays,
            remainingDays: fresh.remainingDays,
            displayText: fresh.displayText,
            startDate: fresh.startDate,
            endDate: fresh.endDate,
          }
        : undefined;
    }
  }

  return data;
}

export async function saveGlobalCosmicData(
  date: Date = new Date(),
  data: GlobalCosmicData,
  options?: { revalidateTags?: boolean },
): Promise<void> {
  if (!hasPostgres) return;
  const dateStr = date.toISOString().split('T')[0];
  const shouldRevalidate = options?.revalidateTags ?? true;

  await sql`
    INSERT INTO global_cosmic_data (data_date, moon_phase, planetary_positions, general_transits, updated_at)
    VALUES (${dateStr}, ${JSON.stringify(data.moonPhase)}::jsonb, ${JSON.stringify(data.planetaryPositions)}::jsonb, ${JSON.stringify(data.generalTransits)}::jsonb, NOW())
    ON CONFLICT (data_date) 
    DO UPDATE SET
      moon_phase = ${JSON.stringify(data.moonPhase)}::jsonb,
      planetary_positions = ${JSON.stringify(data.planetaryPositions)}::jsonb,
      general_transits = ${JSON.stringify(data.generalTransits)}::jsonb,
      updated_at = NOW()
  `;

  if (shouldRevalidate) {
    revalidateTag('cosmic-global');
    revalidateTag(`cosmic-global-${dateStr}`);
  }
}

export type SignChangeEvent = {
  name: string;
  energy: string;
  priority: number;
  type: 'ingress' | 'egress';
  planet: string;
  sign: string;
  previousSign?: string;
  nextSign?: string;
};

/**
 * Detect upcoming planet sign changes by comparing today vs tomorrow.
 * Returns ingress/egress events for changes happening TOMORROW so we can post TODAY.
 * This eliminates the problem of slow planets (like Neptune) generating
 * duplicate ingress posts for months when using degree-based detection.
 */
export async function detectUpcomingSignChanges(
  today: Date,
  tomorrow: Date,
): Promise<{ ingresses: SignChangeEvent[]; egresses: SignChangeEvent[] }> {
  const [todayData, tomorrowData] = await Promise.all([
    getGlobalCosmicData(today),
    getGlobalCosmicData(tomorrow),
  ]);

  const ingresses: SignChangeEvent[] = [];
  const egresses: SignChangeEvent[] = [];

  if (!todayData?.planetaryPositions || !tomorrowData?.planetaryPositions) {
    return { ingresses, egresses };
  }

  // Compare today vs tomorrow - post TODAY about TOMORROW's changes
  for (const [planet, todayPos] of Object.entries(
    todayData.planetaryPositions,
  )) {
    const tomorrowPos = tomorrowData.planetaryPositions[planet];
    if (!tomorrowPos) continue;

    const todaySign = todayPos.sign;
    const tomorrowSign = tomorrowPos.sign;

    // Sign changes TOMORROW = post TODAY
    if (todaySign !== tomorrowSign) {
      ingresses.push({
        name: `${planet} enters ${tomorrowSign} tomorrow`,
        energy: getSignDescription(tomorrowSign),
        priority: 8,
        type: 'ingress',
        planet,
        sign: tomorrowSign,
        previousSign: todaySign,
      });

      egresses.push({
        name: `${planet}'s final day in ${todaySign}`,
        energy: getSignDescription(todaySign),
        priority: 7,
        type: 'egress',
        planet,
        sign: todaySign,
        nextSign: tomorrowSign,
      });
    }
  }

  return { ingresses, egresses };
}

export type RetrogradeStationEvent = {
  name: string;
  energy: string;
  priority: number;
  type: 'retrograde_start' | 'retrograde_end';
  planet: string;
  sign: string;
};

/**
 * Detect upcoming retrograde stations by comparing today vs tomorrow.
 * Returns retrograde/direct station events happening TOMORROW so we can post TODAY.
 * This provides a heads-up before the station rather than posting after.
 */
export async function detectUpcomingRetrogradeStations(
  today: Date,
  tomorrow: Date,
): Promise<RetrogradeStationEvent[]> {
  const [todayData, tomorrowData] = await Promise.all([
    getGlobalCosmicData(today),
    getGlobalCosmicData(tomorrow),
  ]);

  const stations: RetrogradeStationEvent[] = [];

  if (!todayData?.planetaryPositions || !tomorrowData?.planetaryPositions) {
    return stations;
  }

  // Compare today vs tomorrow - post TODAY about TOMORROW's stations
  for (const [planet, todayPos] of Object.entries(
    todayData.planetaryPositions,
  )) {
    const tomorrowPos = tomorrowData.planetaryPositions[planet];
    if (!tomorrowPos) continue;

    const todayRetrograde = todayPos.retrograde;
    const tomorrowRetrograde = tomorrowPos.retrograde;

    // Planet goes retrograde TOMORROW = post TODAY
    if (!todayRetrograde && tomorrowRetrograde) {
      stations.push({
        name: `${planet} stations retrograde tomorrow`,
        energy: `Time to slow down and review ${planet.toLowerCase()} themes`,
        priority: 9,
        type: 'retrograde_start',
        planet,
        sign: todayPos.sign,
      });
    }

    // Planet goes direct TOMORROW = post TODAY
    if (todayRetrograde && !tomorrowRetrograde) {
      stations.push({
        name: `${planet} stations direct tomorrow`,
        energy: `Momentum returns to ${planet.toLowerCase()} themes`,
        priority: 9,
        type: 'retrograde_end',
        planet,
        sign: todayPos.sign,
      });
    }
  }

  return stations;
}

// Slow planets that get milestone posts
const SLOW_PLANETS = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

export type TransitMilestoneEvent = {
  planet: string;
  sign: string;
  totalDays: number;
  remainingDays: number;
  milestone: 'halfway' | '3_months' | '1_month' | '1_week';
  milestoneLabel: string;
  displayText: string;
};

/**
 * Detect transit milestones for slow-moving planets.
 * Returns milestone events when a slow planet transit hits:
 * - Halfway point
 * - 3 months remaining
 * - 1 month remaining
 * - 1 week remaining
 *
 * Only triggers on the exact day of the milestone to avoid duplicates.
 */
export async function detectTransitMilestones(
  date: Date,
): Promise<TransitMilestoneEvent[]> {
  const data = await getGlobalCosmicData(date);
  const milestones: TransitMilestoneEvent[] = [];

  if (!data?.planetaryPositions) {
    return milestones;
  }

  for (const [planet, position] of Object.entries(data.planetaryPositions)) {
    // Only check slow planets
    if (!SLOW_PLANETS.includes(planet)) continue;

    const duration = position.duration;
    if (!duration || !duration.totalDays || !duration.remainingDays) continue;

    const { totalDays, remainingDays } = duration;
    const halfwayDays = Math.floor(totalDays / 2);

    // Check for milestone matches (use ranges to account for daily check)
    let milestone: TransitMilestoneEvent['milestone'] | null = null;
    let milestoneLabel = '';

    // Halfway point (within 1 day of halfway)
    if (remainingDays === halfwayDays || remainingDays === halfwayDays + 1) {
      milestone = 'halfway';
      milestoneLabel = 'Halfway through';
    }
    // 3 months remaining (90 days, check 89-91)
    else if (remainingDays >= 89 && remainingDays <= 91) {
      milestone = '3_months';
      milestoneLabel = '3 months remaining';
    }
    // 1 month remaining (30 days, check 29-31)
    else if (remainingDays >= 29 && remainingDays <= 31) {
      milestone = '1_month';
      milestoneLabel = '1 month remaining';
    }
    // 1 week remaining (7 days, check 6-8)
    else if (remainingDays >= 6 && remainingDays <= 8) {
      milestone = '1_week';
      milestoneLabel = '1 week remaining';
    }

    if (milestone) {
      milestones.push({
        planet,
        sign: position.sign,
        totalDays,
        remainingDays,
        milestone,
        milestoneLabel,
        displayText: duration.displayText || `${remainingDays} days remaining`,
      });
    }
  }

  return milestones;
}
