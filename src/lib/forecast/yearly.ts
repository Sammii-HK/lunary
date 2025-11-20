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
    startDate?: string;
    endDate?: string;
  }>;
  monthlyForecast?: Array<{
    month: number;
    monthName: string;
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
    keyAspects: Array<{
      date: string;
      aspect: string;
      planets: string[];
      description: string;
    }>;
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
  const startTime = Date.now();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const majorTransits: YearlyForecast['majorTransits'] = [];
  const retrogrades: YearlyForecast['retrogrades'] = [];
  const keyAspects: YearlyForecast['keyAspects'] = [];
  const monthlyData = new Map<
    number,
    {
      majorTransits: YearlyForecast['majorTransits'];
      eclipses: YearlyForecast['eclipses'];
      keyAspects: YearlyForecast['keyAspects'];
    }
  >();

  // Initialize monthly data structure
  for (let month = 0; month < 12; month++) {
    monthlyData.set(month, {
      majorTransits: [],
      eclipses: [],
      keyAspects: [],
    });
  }

  // Track retrograde periods by comparing day-to-day
  const retrogradeStartMap = new Map<
    string,
    { startDate: string; planet: string; startSign: string }
  >();
  const previousPositions = new Map<string, boolean>();

  // Track conjunction periods (when planets are within 8 degrees)
  const conjunctionStartMap = new Map<
    string,
    { startDate: string; planetA: string; planetB: string; startSign: string }
  >();
  const previousConjunctions = new Map<string, boolean>();

  let currentDate = new Date(startDate);

  // Scan day by day to catch all retrograde transitions
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const month = currentDate.getMonth();
    const positions = getRealPlanetaryPositions(currentDate, observer);
    const aspects = calculateRealAspects(positions);

    // Detect retrograde changes by comparing with previous day
    Object.entries(positions).forEach(([planet, data]: [string, any]) => {
      // Skip Sun and Moon (they don't retrograde)
      if (planet === 'Sun' || planet === 'Moon') {
        return;
      }

      const wasRetrograde = previousPositions.get(planet) || false;
      const isRetrograde = data.retrograde || false;

      if (!wasRetrograde && isRetrograde) {
        // Retrograde starts
        retrogradeStartMap.set(planet, {
          startDate: dateStr,
          planet,
          startSign: data.sign,
        });
      } else if (wasRetrograde && !isRetrograde) {
        // Retrograde ends
        const startInfo = retrogradeStartMap.get(planet);
        if (startInfo) {
          const existingRetrograde = retrogrades.find(
            (r) => r.planet === planet && r.startDate === startInfo.startDate,
          );
          if (existingRetrograde) {
            existingRetrograde.endDate = dateStr;
            existingRetrograde.description = `${planet} retrograde period (${startInfo.startSign} → ${data.sign})`;
          } else {
            retrogrades.push({
              planet,
              startDate: startInfo.startDate,
              endDate: dateStr,
              description: `${planet} retrograde period (${startInfo.startSign} → ${data.sign})`,
            });
          }
          retrogradeStartMap.delete(planet);
        }
      }

      previousPositions.set(planet, isRetrograde);
    });

    // Track conjunctions with start/end dates (similar to retrogrades)
    const conjunctionKey = (planetA: string, planetB: string) =>
      [planetA, planetB].sort().join('-');

    aspects
      .filter((a) => a.aspect === 'conjunction')
      .forEach((aspect) => {
        const planetA = aspect.planetA?.name || '';
        const planetB = aspect.planetB?.name || '';
        const key = conjunctionKey(planetA, planetB);
        const wasConjunction = previousConjunctions.get(key) || false;
        const isConjunction = true;

        if (!wasConjunction && isConjunction) {
          // Conjunction starts
          conjunctionStartMap.set(key, {
            startDate: dateStr,
            planetA,
            planetB,
            startSign: aspect.planetA?.constellation || '',
          });
        } else if (wasConjunction && !isConjunction) {
          // Conjunction ends
          const startInfo = conjunctionStartMap.get(key);
          if (startInfo) {
            const existingAspect = keyAspects.find(
              (a) =>
                a.aspect === 'conjunction' &&
                a.planets.includes(planetA) &&
                a.planets.includes(planetB) &&
                a.startDate === startInfo.startDate,
            );
            if (existingAspect) {
              existingAspect.endDate = dateStr;
            } else {
              keyAspects.push({
                date: startInfo.startDate,
                aspect: 'conjunction',
                planets: [planetA, planetB],
                description: `${planetA} conjunction ${planetB}`,
                startDate: startInfo.startDate,
                endDate: dateStr,
              });
            }
            conjunctionStartMap.delete(key);
          }
        }

        previousConjunctions.set(key, isConjunction);
      });

    // Process other aspects (non-conjunctions) with correct property names
    aspects
      .filter((a) => a.priority >= 6 && a.aspect !== 'conjunction')
      .forEach((aspect) => {
        const planetA = aspect.planetA?.name || '';
        const planetB = aspect.planetB?.name || '';
        const aspectDescription =
          aspect.energy || `${planetA} ${aspect.aspect} ${planetB}`;

        if (
          !keyAspects.find(
            (a) =>
              a.date === dateStr &&
              a.aspect === aspect.aspect &&
              a.planets.includes(planetA) &&
              a.planets.includes(planetB),
          )
        ) {
          const keyAspect = {
            date: dateStr,
            aspect: aspect.aspect || '',
            planets: [planetA, planetB],
            description: aspectDescription,
          };
          keyAspects.push(keyAspect);
          monthlyData.get(month)!.keyAspects.push(keyAspect);

          if (aspect.priority >= 7) {
            const majorTransit = {
              date: dateStr,
              event: aspect.aspect || '',
              description: aspectDescription,
              significance: `Major ${aspect.aspect} between ${planetA} and ${planetB}`,
            };
            majorTransits.push(majorTransit);
            monthlyData.get(month)!.majorTransits.push(majorTransit);
          }
        }
      });

    // Process conjunctions that are active (add to keyAspects if not already added)
    aspects
      .filter((a) => a.aspect === 'conjunction' && a.priority >= 6)
      .forEach((aspect) => {
        const planetA = aspect.planetA?.name || '';
        const planetB = aspect.planetB?.name || '';
        const key = conjunctionKey(planetA, planetB);
        const startInfo = conjunctionStartMap.get(key);

        if (startInfo) {
          // Check if we already have this conjunction period
          const existingAspect = keyAspects.find(
            (a) =>
              a.aspect === 'conjunction' &&
              a.planets.includes(planetA) &&
              a.planets.includes(planetB) &&
              a.startDate === startInfo.startDate,
          );

          if (!existingAspect) {
            const aspectDescription =
              aspect.energy || `${planetA} conjunction ${planetB}`;
            const keyAspect = {
              date: dateStr,
              aspect: 'conjunction',
              planets: [planetA, planetB],
              description: aspectDescription,
              startDate: startInfo.startDate,
            };
            keyAspects.push(keyAspect);
            monthlyData.get(month)!.keyAspects.push(keyAspect);

            if (aspect.priority >= 7) {
              const majorTransit = {
                date: dateStr,
                event: 'conjunction',
                description: aspectDescription,
                significance: `Major conjunction between ${planetA} and ${planetB}`,
              };
              majorTransits.push(majorTransit);
              monthlyData.get(month)!.majorTransits.push(majorTransit);
            }
          }
        }
      });

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  // Handle retrogrades that start but don't end within the year
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
        description: `${planetKey} retrograde begins in ${startInfo.startSign}`,
      });
    }
  }

  // Handle conjunctions that start but don't end within the year
  for (const [conjunctionKey, startInfo] of conjunctionStartMap.entries()) {
    const existingAspect = keyAspects.find(
      (a) =>
        a.aspect === 'conjunction' &&
        a.planets.includes(startInfo.planetA) &&
        a.planets.includes(startInfo.planetB) &&
        a.startDate === startInfo.startDate,
    );
    if (!existingAspect) {
      keyAspects.push({
        date: startInfo.startDate,
        aspect: 'conjunction',
        planets: [startInfo.planetA, startInfo.planetB],
        description: `${startInfo.planetA} conjunction ${startInfo.planetB}`,
        startDate: startInfo.startDate,
        endDate: '',
      });
    }
  }

  const eclipses = calculateEclipses(year, observer);

  // Group eclipses by month
  eclipses.forEach((eclipse) => {
    const eclipseDate = new Date(eclipse.date);
    const month = eclipseDate.getMonth();
    monthlyData.get(month)!.eclipses.push(eclipse);
  });

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

  // Build monthly forecast array
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthlyForecast = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      monthName: monthNames[month],
      majorTransits: data.majorTransits.filter(
        (transit, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.date === transit.date &&
              t.event === transit.event &&
              t.description === transit.description,
          ),
      ),
      eclipses: data.eclipses,
      keyAspects: data.keyAspects.filter(
        (aspect, index, self) =>
          index ===
          self.findIndex(
            (a) =>
              a.date === aspect.date &&
              a.aspect === aspect.aspect &&
              a.planets.every((p) => aspect.planets.includes(p)),
          ),
      ),
    }))
    .filter(
      (month) =>
        month.majorTransits.length > 0 ||
        month.eclipses.length > 0 ||
        month.keyAspects.length > 0,
    );

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(
    `[generateYearlyForecast] Generated forecast for ${year} in ${duration}s: ${majorTransits.length} transits, ${retrogrades.length} retrogrades, ${eclipses.length} eclipses, ${keyAspects.length} aspects`,
  );

  return {
    year,
    majorTransits: deduplicatedMajorTransits.slice(0, 30),
    eclipses,
    retrogrades: retrogrades.slice(0, 15),
    keyAspects: deduplicatedKeyAspects.slice(0, 30),
    monthlyForecast,
    summary,
  };
}
