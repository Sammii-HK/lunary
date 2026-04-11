import type { BirthChartData } from './birthChart';
import type { HouseCusp } from './houseSystems';
import {
  convertLongitudeToZodiacSystem,
  getLongitudeInTropicalSign,
  type ZodiacSystem,
} from './zodiacSystems';

function getHouseForPlanet(longitude: number, houses: HouseCusp[]): number {
  for (let i = 0; i < 12; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % 12];

    const start = currentHouse.eclipticLongitude;
    const end = nextHouse.eclipticLongitude;

    if (end <= start) {
      if (longitude >= start || longitude < end) {
        return currentHouse.house;
      }
    } else if (longitude >= start && longitude < end) {
      return currentHouse.house;
    }
  }

  return 1;
}

export const assignHousesToBodies = (
  bodies: BirthChartData[],
  houses: HouseCusp[],
): BirthChartData[] => {
  return bodies.map((body) => ({
    ...body,
    house: getHouseForPlanet(body.eclipticLongitude, houses),
  }));
};

export const assignWholeSignHousesToBodies = (
  bodies: BirthChartData[],
  zodiacSystem: ZodiacSystem = 'tropical',
): BirthChartData[] => {
  const ascendant = bodies.find((body) => body.body === 'Ascendant');
  const ascendantLongitude = ascendant
    ? convertLongitudeToZodiacSystem(
        ascendant.eclipticLongitude,
        0,
        zodiacSystem,
      )
    : 0;
  const ascendantSignNumber =
    getLongitudeInTropicalSign(ascendantLongitude).signNumber;

  return bodies.map((body) => {
    const displayLongitude = convertLongitudeToZodiacSystem(
      body.eclipticLongitude,
      0,
      zodiacSystem,
    );
    const signNumber = getLongitudeInTropicalSign(displayLongitude).signNumber;
    const house = ((signNumber - ascendantSignNumber + 12) % 12) + 1;

    return {
      ...body,
      house,
    };
  });
};
