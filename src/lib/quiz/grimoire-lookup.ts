import sunPlacements from '@/data/sun-placements.json';
import moonPlacements from '@/data/moon-placements.json';
import mercuryPlacements from '@/data/mercury-placements.json';
import venusPlacements from '@/data/venus-placements.json';
import marsPlacements from '@/data/mars-placements.json';
import jupiterPlacements from '@/data/jupiter-placements.json';
import saturnPlacements from '@/data/saturn-placements.json';
import uranusPlacements from '@/data/uranus-placements.json';
import neptunePlacements from '@/data/neptune-placements.json';
import plutoPlacements from '@/data/pluto-placements.json';
import housesData from '@/data/houses.json';
import risingSignsData from '@/data/rising-signs.json';

import type { PlanetKey, SignKey, HouseNumber } from './types';

export type PlacementEntry = {
  sign: string;
  element?: string;
  modality?: string;
  ruler?: string;
  coreTraits?: string[];
  lifeThemes?: string;
  strengths?: string[];
  challenges?: string[];
  careerPaths?: string;
  famousExamples?: string;
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: unknown;
};

type PlacementFile = {
  description?: string;
  placements: Record<string, PlacementEntry>;
};

const PLACEMENT_FILES: Record<PlanetKey, PlacementFile> = {
  sun: sunPlacements as PlacementFile,
  moon: moonPlacements as PlacementFile,
  mercury: mercuryPlacements as PlacementFile,
  venus: venusPlacements as PlacementFile,
  mars: marsPlacements as PlacementFile,
  jupiter: jupiterPlacements as PlacementFile,
  saturn: saturnPlacements as PlacementFile,
  uranus: uranusPlacements as PlacementFile,
  neptune: neptunePlacements as PlacementFile,
  pluto: plutoPlacements as PlacementFile,
};

export function getPlanetInSign(
  planet: PlanetKey,
  sign: SignKey,
): PlacementEntry | null {
  const file = PLACEMENT_FILES[planet];
  if (!file) return null;
  const key = `${planet}-in-${sign}`;
  return file.placements[key] ?? null;
}

export type HouseEntry = {
  number: number;
  name: string;
  keywords: string[];
  lifeArea: string;
  naturalSign: string;
  naturalRuler: string;
  description: string;
};

type HousesFile = {
  houseData: Record<string, HouseEntry>;
};

export function getHouse(n: HouseNumber): HouseEntry | null {
  const data = (housesData as unknown as HousesFile).houseData;
  return data[String(n)] ?? null;
}

export type RisingEntry = {
  sign: string;
  element: string;
  modality: string;
  ruler: string;
  coreTraits: string[];
  firstImpression: string;
  physicalAppearance: string;
  lifeApproach: string;
  howOthersSeeYou: string;
  strengths: string[];
  challenges: string[];
  compatibility?: string;
  famousExamples?: string;
};

type RisingSignsFile = {
  risingSigns: Record<string, RisingEntry>;
};

export function getRisingSign(sign: SignKey): RisingEntry | null {
  const data = (risingSignsData as unknown as RisingSignsFile).risingSigns;
  return data[`${sign}-rising`] ?? null;
}
