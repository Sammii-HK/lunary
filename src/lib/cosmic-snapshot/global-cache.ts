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
    return await buildGlobalCosmicData(new Date());
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

  // Freshen fast-moving planet positions with current time.
  // The DB/day-cache stores positions from the first request (midnight UTC),
  // but Moon moves ~13°/day — stale by afternoon. getRealPlanetaryPositions
  // has its own per-planet cache (Moon: 15min TTL) so this is efficient.
  if (data?.planetaryPositions) {
    const now = new Date();
    const FAST = ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars'];
    const freshPositions = getRealPlanetaryPositions(now, DEFAULT_OBSERVER);

    for (const planet of FAST) {
      if (freshPositions[planet]) {
        data.planetaryPositions[planet] = freshPositions[planet];
      }
    }

    // Slow planets: just refresh duration from stored longitude + current time
    const SLOW = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    for (const planet of SLOW) {
      const pos = data.planetaryPositions[planet];
      if (!pos) continue;
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

    // Refresh moon phase (illumination drifts throughout the day)
    data.moonPhase = getAccurateMoonPhase(now);
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
  eventTime?: Date;
};

/**
 * Detect upcoming planet sign changes by comparing today vs tomorrow.
 * Returns ingress/egress events for sign changes detected between the two dates.
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

  for (const [planet, todayPos] of Object.entries(
    todayData.planetaryPositions,
  )) {
    const tomorrowPos = tomorrowData.planetaryPositions[planet];
    if (!tomorrowPos) continue;

    const todaySign = todayPos.sign;
    const tomorrowSign = tomorrowPos.sign;

    if (todaySign !== tomorrowSign) {
      // endDate = when planet leaves todaySign = when it enters tomorrowSign
      const eventTime = todayPos.duration?.endDate
        ? new Date(todayPos.duration.endDate)
        : undefined;

      ingresses.push({
        name: `${planet} enters ${tomorrowSign}`,
        energy: getSignDescription(tomorrowSign),
        priority: 8,
        type: 'ingress',
        planet,
        sign: tomorrowSign,
        previousSign: todaySign,
        eventTime,
      });

      egresses.push({
        name: `${planet}'s last hours in ${todaySign}`,
        energy: getSignDescription(todaySign),
        priority: 7,
        type: 'egress',
        planet,
        sign: todaySign,
        nextSign: tomorrowSign,
        eventTime,
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
  eventTime?: Date;
};

/**
 * Detect upcoming retrograde stations by comparing today vs tomorrow.
 * Returns retrograde/direct station events detected between the two dates.
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

  for (const [planet, todayPos] of Object.entries(
    todayData.planetaryPositions,
  )) {
    const tomorrowPos = tomorrowData.planetaryPositions[planet];
    if (!tomorrowPos) continue;

    const todayRetrograde = todayPos.retrograde;
    const tomorrowRetrograde = tomorrowPos.retrograde;

    if (!todayRetrograde && tomorrowRetrograde) {
      stations.push({
        name: `${planet} stations retrograde`,
        energy: `Time to slow down and review ${planet.toLowerCase()} themes`,
        priority: 9,
        type: 'retrograde_start',
        planet,
        sign: todayPos.sign,
      });
    }

    if (todayRetrograde && !tomorrowRetrograde) {
      stations.push({
        name: `${planet} stations direct`,
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

export type CountdownEvent = {
  name: string;
  energy: string;
  priority: number;
  type: 'retrograde_countdown' | 'sign_change_countdown';
  planet: string;
  sign: string;
  daysUntil: 3 | 7;
  event: 'retrograde_start' | 'retrograde_end' | 'sign_ingress';
};

/**
 * Detect major transit countdowns (3 days and 7 days before events)
 * Detects upcoming retrogrades and sign changes to post advance warnings
 */
export async function detectMajorEventCountdowns(
  today: Date,
): Promise<CountdownEvent[]> {
  const threeDaysAhead = new Date(today);
  threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);

  const sevenDaysAhead = new Date(today);
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);

  const [todayData, in3Days, in7Days] = await Promise.all([
    getGlobalCosmicData(today),
    getGlobalCosmicData(threeDaysAhead),
    getGlobalCosmicData(sevenDaysAhead),
  ]);

  const countdowns: CountdownEvent[] = [];

  if (!todayData?.planetaryPositions) return countdowns;

  // Check retrograde stations
  for (const [planet, todayPos] of Object.entries(
    todayData.planetaryPositions,
  )) {
    const in3DaysPos = in3Days?.planetaryPositions?.[planet];
    const in7DaysPos = in7Days?.planetaryPositions?.[planet];

    // 3 days countdown
    if (in3DaysPos && todayPos.retrograde !== in3DaysPos.retrograde) {
      const event = in3DaysPos.retrograde
        ? 'retrograde_start'
        : 'retrograde_end';
      countdowns.push({
        name: `${planet} ${event === 'retrograde_start' ? 'retrograde' : 'direct'} in 3 days`,
        energy:
          event === 'retrograde_start'
            ? `Prepare for ${planet.toLowerCase()} review mode`
            : `${planet} momentum returns soon`,
        priority: 8,
        type: 'retrograde_countdown',
        planet,
        sign: todayPos.sign,
        daysUntil: 3,
        event,
      });
    }

    // 7 days countdown (only for Mercury, Venus, Mars - high interest)
    // Skip if the 3-day countdown already covers this event
    const retro3DayFired =
      in3DaysPos && todayPos.retrograde !== in3DaysPos.retrograde;
    if (
      !retro3DayFired &&
      in7DaysPos &&
      ['Mercury', 'Venus', 'Mars'].includes(planet) &&
      todayPos.retrograde !== in7DaysPos.retrograde
    ) {
      const event = in7DaysPos.retrograde
        ? 'retrograde_start'
        : 'retrograde_end';
      countdowns.push({
        name: `${planet} ${event === 'retrograde_start' ? 'retrograde' : 'direct'} in 1 week`,
        energy:
          event === 'retrograde_start'
            ? `${planet} retrograde approaches - start preparations`
            : `${planet} direct station approaching`,
        priority: 7,
        type: 'retrograde_countdown',
        planet,
        sign: todayPos.sign,
        daysUntil: 7,
        event,
      });
    }

    // Sign change countdowns (slow planets only - frequent changes for fast planets)
    const SLOW_PLANETS_FOR_COUNTDOWN = [
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
    ];
    if (!SLOW_PLANETS_FOR_COUNTDOWN.includes(planet)) continue;

    // 3 days countdown for sign change
    if (in3DaysPos && todayPos.sign !== in3DaysPos.sign) {
      countdowns.push({
        name: `${planet} enters ${in3DaysPos.sign} in 3 days`,
        energy: `Major shift approaching: ${getSignDescription(in3DaysPos.sign)}`,
        priority: 8,
        type: 'sign_change_countdown',
        planet,
        sign: in3DaysPos.sign,
        daysUntil: 3,
        event: 'sign_ingress',
      });
    }

    // 7 days countdown for sign change — skip if 3-day already covers it
    const sign3DayFired = in3DaysPos && todayPos.sign !== in3DaysPos.sign;
    if (!sign3DayFired && in7DaysPos && todayPos.sign !== in7DaysPos.sign) {
      countdowns.push({
        name: `${planet} enters ${in7DaysPos.sign} in 1 week`,
        energy: `Generational shift ahead: ${getSignDescription(in7DaysPos.sign)}`,
        priority: 7,
        type: 'sign_change_countdown',
        planet,
        sign: in7DaysPos.sign,
        daysUntil: 7,
        event: 'sign_ingress',
      });
    }
  }

  return countdowns;
}

// Planets that get milestone posts (both fast and slow)
const MILESTONE_PLANETS = [
  'Mercury',
  'Venus',
  'Mars', // Fast planets
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto', // Slow planets
];

export type TransitMilestoneEvent = {
  planet: string;
  sign: string;
  totalDays: number;
  remainingDays: number;
  milestone:
    | 'halfway'
    | '6_months'
    | '3_months'
    | '1_month'
    | '2_weeks'
    | '1_week'
    | '3_days'
    | 'tomorrow';
  milestoneLabel: string;
  displayText: string;
};

/**
 * Detect transit milestones for both fast and slow-moving planets.
 * Returns milestone events when a planet transit hits:
 * - Halfway point (truly halfway through the transit)
 * - 6 months remaining
 * - 3 months remaining
 * - 1 month remaining
 * - 2 weeks remaining
 * - 1 week remaining
 * - 3 days remaining
 * - Tomorrow (final day before sign change)
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
    // Only check milestone planets
    if (!MILESTONE_PLANETS.includes(planet)) continue;

    const duration = position.duration;
    if (!duration || !duration.totalDays || !duration.remainingDays) continue;

    const { totalDays, remainingDays } = duration;
    const elapsedDays = totalDays - remainingDays;
    const halfwayDays = Math.floor(totalDays / 2);

    // Check for milestone matches (use ranges to account for daily check)
    let milestone: TransitMilestoneEvent['milestone'] | null = null;
    let milestoneLabel = '';

    // Planet-specific milestone thresholds
    if (planet === 'Mercury') {
      // ~20 day transits - halfway and 3 days
      if (elapsedDays >= halfwayDays - 1 && elapsedDays <= halfwayDays + 1) {
        milestone = 'halfway';
        milestoneLabel = 'Halfway through';
      } else if (remainingDays >= 2 && remainingDays <= 4) {
        milestone = '3_days';
        milestoneLabel = '3 days remaining';
      }
    } else if (planet === 'Venus') {
      // ~25 day transits - halfway, 1 week, 3 days
      if (elapsedDays >= halfwayDays - 1 && elapsedDays <= halfwayDays + 1) {
        milestone = 'halfway';
        milestoneLabel = 'Halfway through';
      } else if (remainingDays >= 6 && remainingDays <= 8) {
        milestone = '1_week';
        milestoneLabel = '1 week remaining';
      } else if (remainingDays >= 2 && remainingDays <= 4) {
        milestone = '3_days';
        milestoneLabel = '3 days remaining';
      }
    } else if (planet === 'Mars') {
      // ~60 day transits - halfway, 1 month, 1 week, 3 days
      if (elapsedDays >= halfwayDays - 1 && elapsedDays <= halfwayDays + 1) {
        milestone = 'halfway';
        milestoneLabel = 'Halfway through';
      } else if (remainingDays >= 28 && remainingDays <= 32) {
        milestone = '1_month';
        milestoneLabel = '1 month remaining';
      } else if (remainingDays >= 6 && remainingDays <= 8) {
        milestone = '1_week';
        milestoneLabel = '1 week remaining';
      } else if (remainingDays >= 2 && remainingDays <= 4) {
        milestone = '3_days';
        milestoneLabel = '3 days remaining';
      }
    } else {
      // Slow planets - existing logic with all milestones
      if (elapsedDays >= halfwayDays - 1 && elapsedDays <= halfwayDays + 1) {
        milestone = 'halfway';
        milestoneLabel = 'Halfway through';
      } else if (remainingDays >= 178 && remainingDays <= 182) {
        milestone = '6_months';
        milestoneLabel = '6 months remaining';
      } else if (remainingDays >= 88 && remainingDays <= 92) {
        milestone = '3_months';
        milestoneLabel = '3 months remaining';
      } else if (remainingDays >= 28 && remainingDays <= 32) {
        milestone = '1_month';
        milestoneLabel = '1 month remaining';
      } else if (remainingDays >= 13 && remainingDays <= 15) {
        milestone = '2_weeks';
        milestoneLabel = '2 weeks remaining';
      } else if (remainingDays >= 6 && remainingDays <= 8) {
        milestone = '1_week';
        milestoneLabel = '1 week remaining';
      } else if (remainingDays >= 2 && remainingDays <= 4) {
        milestone = '3_days';
        milestoneLabel = '3 days remaining';
      } else if (remainingDays >= 0 && remainingDays <= 1) {
        milestone = 'tomorrow';
        milestoneLabel = 'Leaving tomorrow';
      }
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
