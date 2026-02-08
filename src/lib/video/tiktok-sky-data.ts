/**
 * Sky Data for Dynamic TikTok Scripts
 *
 * Builds a SkyData object from real astronomical calculations
 * that script generators use to produce accurate voiceover text.
 */

import dayjs from 'dayjs';
import {
  buildGlobalCosmicData,
  type GlobalCosmicData,
} from '../cosmic-snapshot/global-cache';
import { getUniversalDayNumber } from '../numerology/universalDay';
import { getPersonalDayNumber } from '../numerology/personalNumbers';

export interface SkyData {
  moonSign: string;
  moonPhase: { name: string; emoji: string; illumination: number };
  planets: Record<
    string,
    { sign: string; degree: number; retrograde: boolean }
  >;
  retrogradePlanets: string[];
  topTransit?: { planetA: string; planetB: string; aspect: string };
  numerology?: {
    universalDay: number;
    universalMeaning: string;
    personalDay: number;
    personalMeaning: string;
  };
}

export async function buildSkyData(
  date?: Date,
  personaBirthday?: string,
): Promise<SkyData> {
  const targetDate = date ?? new Date();
  const cosmic: GlobalCosmicData = await buildGlobalCosmicData(targetDate);

  // Build planets map
  const planets: SkyData['planets'] = {};
  const retrogradePlanets: string[] = [];

  for (const [name, pos] of Object.entries(cosmic.planetaryPositions)) {
    planets[name] = {
      sign: pos.sign,
      degree: pos.degree,
      retrograde: pos.retrograde,
    };
    if (pos.retrograde) {
      retrogradePlanets.push(name);
    }
  }

  // Pick top transit (highest priority aspect between two planets)
  let topTransit: SkyData['topTransit'];
  const firstAspect = cosmic.generalTransits.find(
    (t) => t.planetA?.name && t.planetB?.name,
  );
  if (firstAspect) {
    topTransit = {
      planetA: firstAspect.planetA.name,
      planetB: firstAspect.planetB.name,
      aspect: firstAspect.aspect,
    };
  }

  // Numerology (if persona birthday provided)
  let numerology: SkyData['numerology'];
  const currentDay = dayjs(targetDate);

  const universal = getUniversalDayNumber(currentDay);

  if (personaBirthday) {
    const personal = getPersonalDayNumber(personaBirthday, currentDay);
    numerology = {
      universalDay: universal.number,
      universalMeaning: universal.meaning,
      personalDay: personal.number,
      personalMeaning: personal.meaning,
    };
  }

  return {
    moonSign: cosmic.planetaryPositions.Moon?.sign ?? 'Aries',
    moonPhase: {
      name: cosmic.moonPhase.name,
      emoji: cosmic.moonPhase.emoji,
      illumination: cosmic.moonPhase.illumination,
    },
    planets,
    retrogradePlanets,
    topTransit,
    numerology,
  };
}
