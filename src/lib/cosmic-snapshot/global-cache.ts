import { unstable_cache, revalidateTag } from 'next/cache';
import { sql } from '@vercel/postgres';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
  checkSeasonalEvents,
  checkSignIngress,
  checkRetrogradeEvents,
} from '../../../utils/astrology/astronomical-data';
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

  return await cached();
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
