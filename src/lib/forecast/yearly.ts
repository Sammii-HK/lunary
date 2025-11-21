import {
  Observer,
  AstroTime,
  Body,
  GeoVector,
  Ecliptic,
} from 'astronomy-engine';
import {
  calculateRealAspects,
  checkRetrogradeEvents,
  checkSeasonalEvents,
  checkSignIngress,
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
  getZodiacSign,
} from '../../../utils/astrology/cosmic-og';

export const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

function getEclipseDescriptionBySign(sign: string, isSolar: boolean): string {
  const signLower = sign.toLowerCase();
  const eclipseType = isSolar ? 'Solar' : 'Lunar';

  const solarDescriptions: Record<string, string> = {
    aries: 'Bold new beginnings and courageous initiatives',
    taurus: 'Grounded foundations and material stability',
    gemini: 'Communication breakthroughs and mental expansion',
    cancer: 'Emotional renewal and nurturing growth',
    leo: 'Creative expression and confident leadership',
    virgo: 'Practical refinement and service to others',
    libra: 'Harmonious partnerships and balanced decisions',
    scorpio: 'Deep transformation and powerful rebirth',
    sagittarius: 'Philosophical expansion and adventurous journeys',
    capricorn: 'Ambitious structures and disciplined achievement',
    aquarius: 'Innovative visions and humanitarian progress',
    pisces: 'Spiritual awakening and intuitive flow',
  };

  const lunarDescriptions: Record<string, string> = {
    aries: 'Releasing impulsive energy and finding balance',
    taurus: 'Letting go of material attachments and finding freedom',
    gemini: 'Releasing scattered thoughts and finding clarity',
    cancer: 'Emotional release and healing deep wounds',
    leo: 'Releasing ego and finding authentic expression',
    virgo: 'Letting go of perfectionism and finding acceptance',
    libra: 'Releasing codependency and finding independence',
    scorpio: 'Deep emotional release and transformation',
    sagittarius: 'Releasing dogmatic beliefs and finding truth',
    capricorn: 'Letting go of rigid structures and finding flexibility',
    aquarius: 'Releasing isolation and finding community',
    pisces: 'Releasing illusions and finding spiritual clarity',
  };

  const descriptions = isSolar ? solarDescriptions : lunarDescriptions;
  const description =
    descriptions[signLower] ||
    (isSolar
      ? 'New beginnings and cosmic alignment'
      : 'Release and completion');

  return `${eclipseType} Eclipse in ${sign} - ${description}`;
}

export interface YearlyForecast {
  year: number;
  majorTransits: Array<{
    date: string;
    startDate: string;
    endDate: string;
    event: string;
    description: string;
    significance: string;
  }>;
  eclipses: Array<{
    date: string;
    startDate: string;
    endDate: string;
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
    startDate: string;
    endDate: string;
    aspect: string;
    planets: string[];
    description: string;
  }>;
  monthlyForecast?: Array<{
    month: number;
    monthName: string;
    majorTransits: Array<{
      date: string;
      startDate: string;
      endDate: string;
      event: string;
      description: string;
      significance: string;
    }>;
    eclipses: Array<{
      date: string;
      startDate: string;
      endDate: string;
      type: 'solar' | 'lunar';
      sign: string;
      description: string;
    }>;
    keyAspects: Array<{
      date: string;
      startDate: string;
      endDate: string;
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
  const seenEclipses = new Set<string>();

  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    let foundEclipse = false;

    for (let hour = 0; hour < 24; hour += 3) {
      const checkTime = new Date(currentDate);
      checkTime.setHours(hour, 0, 0, 0);

      const moonPhase = getAccurateMoonPhase(checkTime);

      const isNewMoon = moonPhase.name === 'New Moon';
      const isFullMoon =
        moonPhase.isSignificant &&
        moonPhase.name !== 'New Moon' &&
        moonPhase.name !== 'First Quarter' &&
        moonPhase.name !== 'Third Quarter' &&
        moonPhase.name !== 'Waxing Crescent' &&
        moonPhase.name !== 'Waning Crescent' &&
        moonPhase.name !== 'Waxing Gibbous' &&
        moonPhase.name !== 'Waning Gibbous' &&
        moonPhase.illumination >= 99;

      if (isNewMoon || isFullMoon) {
        const isSolar = isNewMoon;
        const phaseDate = checkTime.toISOString().split('T')[0];

        const astroTime = new AstroTime(checkTime);
        const moonVector = GeoVector(Body.Moon, astroTime, true);
        const moonEcliptic = Ecliptic(moonVector);
        const sunVector = GeoVector(Body.Sun, astroTime, true);
        const sunEcliptic = Ecliptic(sunVector);

        const moonLatitudeRad = moonEcliptic.elat;
        const phaseLatitudeDegrees = Math.abs(
          moonLatitudeRad * (180 / Math.PI),
        );

        const distanceFromEcliptic = Math.abs(moonVector.z);
        const moonDistance = Math.sqrt(moonVector.x ** 2 + moonVector.y ** 2);
        const distanceFromEclipticDegrees =
          Math.atan2(distanceFromEcliptic, moonDistance) * (180 / Math.PI);

        const moonLongitude = moonEcliptic.elon;
        const sunLongitude = sunEcliptic.elon;
        const longitudeDiff = Math.abs(moonLongitude - sunLongitude);
        const longitudeSeparation =
          longitudeDiff > Math.PI ? 2 * Math.PI - longitudeDiff : longitudeDiff;
        const longitudeSeparationDegrees =
          longitudeSeparation * (180 / Math.PI);

        const phaseLatitude = distanceFromEclipticDegrees;

        const isAligned = isSolar
          ? longitudeSeparationDegrees < 10.0
          : longitudeSeparationDegrees > 170.0 &&
            longitudeSeparationDegrees < 190.0;

        let bestDate: Date | null = null;
        let minLatitude = phaseLatitude;

        const initialThreshold = 18.0;
        if (phaseLatitude <= initialThreshold) {
          bestDate = checkTime;
          minLatitude = phaseLatitude;

          for (let offset = -1; offset <= 1; offset++) {
            const checkDate = new Date(checkTime);
            checkDate.setDate(checkDate.getDate() + offset);
            checkDate.setHours(12, 0, 0, 0);

            const checkMoonPhase = getAccurateMoonPhase(checkDate);
            const isCorrectPhase = isSolar
              ? checkMoonPhase.name === 'New Moon'
              : checkMoonPhase.isSignificant &&
                checkMoonPhase.name !== 'New Moon' &&
                checkMoonPhase.illumination >= 99;

            if (!isCorrectPhase) continue;

            const checkAstroTime = new AstroTime(checkDate);
            const checkMoonVector = GeoVector(Body.Moon, checkAstroTime, true);
            const checkMoonEcliptic = Ecliptic(checkMoonVector);

            const checkLatitudeDegrees = Math.abs(
              checkMoonEcliptic.elat * (180 / Math.PI),
            );
            const checkDistance = Math.abs(checkMoonVector.z);
            const checkMoonDist = Math.sqrt(
              checkMoonVector.x ** 2 + checkMoonVector.y ** 2,
            );
            const checkDistFromEclipticDegrees =
              Math.atan2(checkDistance, checkMoonDist) * (180 / Math.PI);
            const checkLatitude = checkDistFromEclipticDegrees;

            if (checkLatitude < minLatitude) {
              minLatitude = checkLatitude;
              bestDate = checkDate;
            }
          }
        }

        const expectedDates = [
          '2026-02-17',
          '2026-03-03',
          '2026-08-12',
          '2026-08-27',
          '2026-08-28',
        ];
        if (
          expectedDates.includes(phaseDate) ||
          expectedDates.includes(bestDate?.toISOString().split('T')[0] || '')
        ) {
          console.log(
            `[calculateEclipses] ${isSolar ? 'New' : 'Full'} Moon on ${phaseDate} at ${hour}:00, phaseLatitude: ${phaseLatitude.toFixed(3)}° (elat: ${phaseLatitudeDegrees.toFixed(3)}°, dist: ${distanceFromEclipticDegrees.toFixed(3)}°), best date: ${bestDate?.toISOString().split('T')[0]}, minLatitude: ${minLatitude.toFixed(3)}°, passes: ${bestDate && minLatitude <= 5.0}`,
          );
        }

        const latitudeThreshold = 18.0;
        if (bestDate && minLatitude <= latitudeThreshold) {
          const dateStr = bestDate.toISOString().split('T')[0];

          const eclipseKey = `${dateStr}-${isSolar ? 'solar' : 'lunar'}`;
          if (seenEclipses.has(eclipseKey)) {
            continue;
          }
          const positions = getRealPlanetaryPositions(bestDate, observer);

          let eclipseSign: string | undefined;
          if (isSolar) {
            eclipseSign =
              positions?.Sun?.sign ||
              positions?.Moon?.sign ||
              (positions?.Sun?.longitude !== undefined
                ? getZodiacSign(positions.Sun.longitude)
                : positions?.Moon?.longitude !== undefined
                  ? getZodiacSign(positions.Moon.longitude)
                  : undefined);
          } else {
            eclipseSign =
              positions?.Moon?.sign ||
              positions?.Sun?.sign ||
              (positions?.Moon?.longitude !== undefined
                ? getZodiacSign(positions.Moon.longitude)
                : positions?.Sun?.longitude !== undefined
                  ? getZodiacSign(positions.Sun.longitude)
                  : undefined);
          }

          if (eclipseSign) {
            seenEclipses.add(eclipseKey);
            eclipses.push({
              date: dateStr,
              startDate: dateStr,
              endDate: dateStr,
              type: (isSolar ? 'solar' : 'lunar') as 'solar' | 'lunar',
              sign: eclipseSign,
              description: `${getEclipseDescriptionBySign(eclipseSign, isSolar)} (latitude: ${minLatitude.toFixed(3)}°)`,
            });
            console.log(
              `[calculateEclipses] Found ${isSolar ? 'SOLAR' : 'LUNAR'} eclipse: ${dateStr} in ${eclipseSign}, latitude: ${minLatitude.toFixed(3)}°`,
            );

            foundEclipse = true;
            currentDate = new Date(
              bestDate.getTime() + 14 * 24 * 60 * 60 * 1000,
            );
            break;
          }
        }
      }
    }

    if (foundEclipse) {
      continue;
    }

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const deduplicated: YearlyForecast['eclipses'] = [];
  const processed = new Set<string>();

  const sortedEclipses = [...eclipses].sort((a, b) => {
    const aLat = parseFloat(
      a.description.match(/latitude: ([\d.]+)°/)?.[1] || '999',
    );
    const bLat = parseFloat(
      b.description.match(/latitude: ([\d.]+)°/)?.[1] || '999',
    );
    return aLat - bLat;
  });

  for (const eclipse of sortedEclipses) {
    const eclipseDate = new Date(eclipse.date);
    const dateKey = `${eclipse.date}-${eclipse.type}`;

    if (processed.has(dateKey)) continue;

    const eclipseLatitude = parseFloat(
      eclipse.description.match(/latitude: ([\d.]+)°/)?.[1] || '999',
    );

    const nearbyEclipses = eclipses.filter(
      (e) =>
        e.type === eclipse.type &&
        e.date !== eclipse.date &&
        Math.abs(new Date(e.date).getTime() - eclipseDate.getTime()) <
          35 * 24 * 60 * 60 * 1000,
    );

    if (nearbyEclipses.length > 0) {
      const minNearbyLatitude = Math.min(
        ...nearbyEclipses.map((e) =>
          parseFloat(e.description.match(/latitude: ([\d.]+)°/)?.[1] || '999'),
        ),
      );
      if (eclipseLatitude >= minNearbyLatitude) {
        continue;
      }
      for (const nearby of nearbyEclipses) {
        processed.add(`${nearby.date}-${nearby.type}`);
      }
    }

    processed.add(dateKey);
    deduplicated.push({
      ...eclipse,
      description: eclipse.description.replace(/\s*\(latitude: [\d.]+°\)/, ''),
    });
  }

  deduplicated.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return deduplicated;
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

  // Track all aspect periods (conjunction, square, trine, opposition, sextile)
  const aspectStartMap = new Map<
    string,
    {
      startDate: string;
      planetA: string;
      planetB: string;
      aspect: string;
      startSign: string;
    }
  >();
  const previousAspects = new Map<string, boolean>();

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

    // Track all aspects with start/end dates (similar to retrogrades)
    const aspectKey = (planetA: string, planetB: string, aspectType: string) =>
      `${[planetA, planetB].sort().join('-')}-${aspectType}`;

    // Build set of currently active aspect keys
    const currentAspectKeys = new Set<string>();
    aspects
      .filter((a) => a.priority >= 6)
      .forEach((aspect) => {
        const planetA = aspect.planetA?.name || '';
        const planetB = aspect.planetB?.name || '';
        const aspectType = aspect.aspect || '';
        const key = aspectKey(planetA, planetB, aspectType);
        currentAspectKeys.add(key);
      });

    // Check for aspects that ended (were active yesterday but not today)
    previousAspects.forEach((wasActive, key) => {
      if (wasActive && !currentAspectKeys.has(key)) {
        // Aspect ended (exited orb)
        const startInfo = aspectStartMap.get(key);
        if (startInfo) {
          const existingAspect = keyAspects.find(
            (a) =>
              a.aspect === startInfo.aspect &&
              a.planets.includes(startInfo.planetA) &&
              a.planets.includes(startInfo.planetB) &&
              a.startDate === startInfo.startDate,
          );
          if (existingAspect) {
            existingAspect.endDate = dateStr;
            // Update corresponding major transit
            const existingTransit = majorTransits.find(
              (t) =>
                t.event === startInfo.aspect &&
                t.startDate === startInfo.startDate &&
                t.description.includes(startInfo.planetA) &&
                t.description.includes(startInfo.planetB),
            );
            if (existingTransit) {
              existingTransit.endDate = dateStr;
            }
          }
          aspectStartMap.delete(key);
        }
      }
    });

    // Process currently active aspects
    aspects
      .filter((a) => a.priority >= 6)
      .forEach((aspect) => {
        const planetA = aspect.planetA?.name || '';
        const planetB = aspect.planetB?.name || '';
        const aspectType = aspect.aspect || '';
        const key = aspectKey(planetA, planetB, aspectType);
        const wasAspect = previousAspects.get(key) || false;

        if (!wasAspect) {
          // Aspect starts (enters orb)
          aspectStartMap.set(key, {
            startDate: dateStr,
            planetA,
            planetB,
            aspect: aspectType,
            startSign: aspect.planetA?.constellation || '',
          });
        }

        // Add to keyAspects if not already added
        const startInfo = aspectStartMap.get(key);
        if (startInfo) {
          const existingAspect = keyAspects.find(
            (a) =>
              a.aspect === aspectType &&
              a.planets.includes(planetA) &&
              a.planets.includes(planetB) &&
              a.startDate === startInfo.startDate,
          );

          if (!existingAspect) {
            const aspectDescription =
              aspect.energy || `${planetA} ${aspectType} ${planetB}`;
            const keyAspect = {
              date: dateStr,
              aspect: aspectType,
              planets: [planetA, planetB],
              description: aspectDescription,
              startDate: startInfo.startDate,
              endDate: '',
            };
            keyAspects.push(keyAspect);
            monthlyData.get(month)!.keyAspects.push(keyAspect);

            if (aspect.priority >= 7) {
              const majorTransit = {
                date: dateStr,
                startDate: startInfo.startDate,
                endDate: '',
                event: aspectType,
                description: aspectDescription,
                significance: `Major ${aspectType} between ${planetA} and ${planetB}`,
              };
              majorTransits.push(majorTransit);
              monthlyData.get(month)!.majorTransits.push(majorTransit);
            }
          }
        }
      });

    // Update previousAspects map for next iteration
    previousAspects.clear();
    currentAspectKeys.forEach((key) => {
      previousAspects.set(key, true);
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

  // Handle aspects that start but don't end within the year
  for (const [aspectKey, startInfo] of aspectStartMap.entries()) {
    const existingAspect = keyAspects.find(
      (a) =>
        a.aspect === startInfo.aspect &&
        a.planets.includes(startInfo.planetA) &&
        a.planets.includes(startInfo.planetB) &&
        a.startDate === startInfo.startDate,
    );
    if (!existingAspect) {
      const aspectDescription = `${startInfo.planetA} ${startInfo.aspect} ${startInfo.planetB}`;
      keyAspects.push({
        date: startInfo.startDate,
        aspect: startInfo.aspect,
        planets: [startInfo.planetA, startInfo.planetB],
        description: aspectDescription,
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

  const limitedMajorTransits = deduplicatedMajorTransits.slice(0, 30);
  const limitedRetrogrades = retrogrades.slice(0, 15);
  const limitedKeyAspects = deduplicatedKeyAspects.slice(0, 30);

  const summary = `Your ${year} cosmic forecast reveals ${limitedMajorTransits.length} major planetary transits, ${limitedRetrogrades.length} planetary retrogrades, ${eclipses.length} eclipses, and ${limitedKeyAspects.length} significant aspects. This year brings transformative energies and opportunities for growth.`;

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
    majorTransits: limitedMajorTransits,
    eclipses,
    retrogrades: limitedRetrogrades,
    keyAspects: limitedKeyAspects,
    monthlyForecast,
    summary,
  };
}
