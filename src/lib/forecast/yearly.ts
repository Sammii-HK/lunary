import { Observer } from 'astronomy-engine';
import {
  calculateRealAspects,
  checkRetrogradeEvents,
  checkSeasonalEvents,
  checkSignIngress,
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
} from '../../../utils/astrology/cosmic-og';

export const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

export interface YearlyForecast {
  year: number;
  majorTransits: Array<{
    date: string;
    event: string;
    description: string;
    significance: string;
  }>;
  eclipses: Array<{
    date: string;
    type: 'solar' | 'lunar';
    sign: string;
    description: string;
  }>;
  retrogrades: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  keyAspects: Array<{
    date: string;
    aspect: string;
    planets: string[];
    description: string;
  }>;
  summary: string;
}

export function calculateEclipses(
  year: number,
  observer: Observer = DEFAULT_OBSERVER,
): YearlyForecast['eclipses'] {
  const eclipses: YearlyForecast['eclipses'] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const moonPhase = getAccurateMoonPhase(currentDate);
    const positions = getRealPlanetaryPositions(currentDate, observer);

    if (
      moonPhase.isSignificant &&
      (moonPhase.name === 'New Moon' || moonPhase.name === 'Full Moon')
    ) {
      eclipses.push({
        date: currentDate.toISOString().split('T')[0],
        type: moonPhase.name === 'New Moon' ? 'solar' : 'lunar',
        sign: positions.moon?.sign || 'Unknown',
        description: `${moonPhase.name === 'New Moon' ? 'Solar' : 'Lunar'} Eclipse in ${positions.moon?.sign || 'Unknown'} - ${moonPhase.energy || 'A powerful cosmic event'}`,
      });
    }

    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return eclipses;
}

export async function generateYearlyForecast(
  year: number,
  userBirthday?: string,
  observer: Observer = DEFAULT_OBSERVER,
): Promise<YearlyForecast> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const majorTransits: YearlyForecast['majorTransits'] = [];
  const retrogrades: YearlyForecast['retrogrades'] = [];
  const keyAspects: YearlyForecast['keyAspects'] = [];

  let currentDate = new Date(startDate);
  const checkedDates = new Set<string>();
  const retrogradeStartMap = new Map<
    string,
    { startDate: string; planet: string }
  >();

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];

    if (checkedDates.has(dateStr)) {
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      continue;
    }
    checkedDates.add(dateStr);

    const positions = getRealPlanetaryPositions(currentDate, observer);
    const aspects = calculateRealAspects(positions);
    const ingresses = checkSignIngress(positions, currentDate);
    const retrogradeEvents = checkRetrogradeEvents(positions);

    retrogradeEvents.forEach((event) => {
      const planetKey = event.planet || 'Unknown';
      if (event.type === 'starts') {
        if (!retrogradeStartMap.has(planetKey)) {
          retrogradeStartMap.set(planetKey, {
            startDate: dateStr,
            planet: planetKey,
          });
        }
      } else if (event.type === 'ends' && retrogradeStartMap.has(planetKey)) {
        const startInfo = retrogradeStartMap.get(planetKey)!;
        const existingRetrograde = retrogrades.find(
          (r) => r.planet === planetKey && r.startDate === startInfo.startDate,
        );
        if (existingRetrograde) {
          existingRetrograde.endDate = dateStr;
          existingRetrograde.description = `${planetKey} retrograde period`;
        } else {
          retrogrades.push({
            planet: planetKey,
            startDate: startInfo.startDate,
            endDate: dateStr,
            description: `${planetKey} retrograde period`,
          });
        }
        retrogradeStartMap.delete(planetKey);
      }
    });

    aspects
      .filter((a) => a.priority >= 6)
      .forEach((aspect) => {
        if (
          !keyAspects.find(
            (a) =>
              a.date === dateStr &&
              a.aspect === aspect.aspect &&
              a.planets.includes(aspect.planet1 || '') &&
              a.planets.includes(aspect.planet2 || ''),
          )
        ) {
          keyAspects.push({
            date: dateStr,
            aspect: aspect.aspect || '',
            planets: [aspect.planet1 || '', aspect.planet2 || ''],
            description: aspect.description || '',
          });

          if (aspect.priority >= 7) {
            majorTransits.push({
              date: dateStr,
              event: aspect.aspect || '',
              description: aspect.description || '',
              significance: `Major ${aspect.aspect} between ${aspect.planet1} and ${aspect.planet2}`,
            });
          }
        }
      });

    currentDate = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  }

  for (const [planetKey, startInfo] of retrogradeStartMap.entries()) {
    if (
      !retrogrades.find(
        (r) => r.planet === planetKey && r.startDate === startInfo.startDate,
      )
    ) {
      retrogrades.push({
        planet: planetKey,
        startDate: startInfo.startDate,
        endDate: '',
        description: `${planetKey} retrograde begins`,
      });
    }
  }

  const eclipses = calculateEclipses(year, observer);

  const summary = `Your ${year} cosmic forecast reveals ${majorTransits.length} major planetary transits, ${retrogrades.length} planetary retrogrades, ${eclipses.length} eclipses, and ${keyAspects.length} significant aspects. This year brings transformative energies and opportunities for growth.`;

  const deduplicatedMajorTransits = majorTransits.filter(
    (transit, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.date === transit.date &&
          t.event === transit.event &&
          t.description === transit.description,
      ),
  );

  const deduplicatedKeyAspects = keyAspects.filter(
    (aspect, index, self) =>
      index ===
      self.findIndex(
        (a) =>
          a.date === aspect.date &&
          a.aspect === aspect.aspect &&
          a.planets.every((p) => aspect.planets.includes(p)),
      ),
  );

  return {
    year,
    majorTransits: deduplicatedMajorTransits.slice(0, 30),
    eclipses,
    retrogrades: retrogrades.slice(0, 15),
    keyAspects: deduplicatedKeyAspects.slice(0, 30),
    summary,
  };
}
