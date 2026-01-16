import housesJson from '@/data/houses.json';

export type House = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type HousePlanet =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'north-node'
  | 'chiron';

export interface HouseData {
  number: House;
  name: string;
  keywords: string[];
  lifeArea: string;
  naturalSign: string;
  naturalRuler: string;
  description: string;
}

export const houseMap: Record<string, string> = {
  '1': 'first',
  '2': 'second',
  '3': 'third',
  '4': 'fourth',
  '5': 'fifth',
  '6': 'sixth',
  '7': 'seventh',
  '8': 'eighth',
  '9': 'ninth',
  '10': 'tenth',
  '11': 'eleventh',
  '12': 'twelfth',
};

export type HousesJsonSchema = {
  houses: House[];
  planetsForHouses: HousePlanet[];
  planetHouseDisplay: Record<HousePlanet, string>;
  houseData: Record<House, HouseData>;
};

export const housesData = housesJson as HousesJsonSchema;

export const HOUSES_JSON = housesData;
export const HOUSES: House[] = housesData.houses;
export const PLANETS_FOR_HOUSES: HousePlanet[] = housesData.planetsForHouses;
export const PLANET_HOUSE_DISPLAY = housesData.planetHouseDisplay;
export const HOUSE_DATA = housesData.houseData;

export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function generateAllHouseParams(): { planet: string; house: string }[] {
  const params: { planet: string; house: string }[] = [];

  for (const planet of PLANETS_FOR_HOUSES) {
    for (const house of HOUSES) {
      params.push({ planet, house: String(house) });
    }
  }

  return params;
}
