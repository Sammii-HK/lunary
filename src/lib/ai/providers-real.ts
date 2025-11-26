import { getGlobalCosmicData } from '../cosmic-snapshot/global-cache';
import { getBirthChart, type CurrentTransitsResponse } from './providers';
import { TransitRecord, MoonSnapshot, BirthChartSnapshot } from './types';

export async function getCurrentTransitsReal({
  userId,
  now = new Date(),
}: {
  userId: string;
  now?: Date;
}): Promise<CurrentTransitsResponse> {
  const globalData = await getGlobalCosmicData(now);

  if (!globalData) {
    return {
      transits: [],
      moon: null,
    };
  }

  const birthChart = await getBirthChart({ userId });

  const moon: MoonSnapshot = {
    phase: globalData.moonPhase.name,
    sign: globalData.planetaryPositions.Moon?.sign || 'Unknown',
    emoji: globalData.moonPhase.emoji,
    illumination: globalData.moonPhase.illumination / 100,
  };

  const transits: TransitRecord[] = globalData.generalTransits
    .slice(0, 10)
    .map((transit) => {
      // Handle ingresses specially - they have planetB as null, sign is in planetA.constellation
      if (transit.aspect === 'ingress') {
        const planet =
          transit.planetA?.name || transit.planetA?.planet || 'Unknown';
        const sign = transit.planetA?.constellation || 'Unknown';
        return {
          aspect: transit.aspect,
          from: planet,
          to: sign !== 'Unknown' ? sign : 'Unknown',
          exactUtc: now.toISOString(),
          applying: true,
          strength: Math.min(transit.priority / 10, 1),
        };
      }

      return {
        aspect: transit.aspect,
        from: transit.planetA?.name || transit.planetA?.planet || 'Unknown',
        to: transit.planetB?.name || transit.planetB?.planet || 'Unknown',
        exactUtc: now.toISOString(),
        applying: true,
        strength: Math.min(transit.priority / 10, 1),
      };
    });

  if (birthChart && transits.length > 0) {
    const personalizedTransits = personalizeTransits(transits, birthChart);
    return {
      transits: personalizedTransits,
      moon,
    };
  }

  return {
    transits,
    moon,
  };
}

function personalizeTransits(
  transits: TransitRecord[],
  birthChart: BirthChartSnapshot,
): TransitRecord[] {
  return transits.map((transit) => {
    const natalPlanet = birthChart.placements?.find(
      (p) => p.planet === transit.from,
    );

    if (natalPlanet) {
      return {
        ...transit,
        strength: transit.strength * 1.1,
      };
    }

    return transit;
  });
}
