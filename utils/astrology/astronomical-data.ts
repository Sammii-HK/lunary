import {
  Observer,
  AstroTime,
  Body,
  GeoVector,
  Ecliptic,
  Illumination,
  MoonPhase,
} from 'astronomy-engine';
import { calculateTransitDuration } from './transit-duration';

// VARIABLE TTL BY PLANET SPEED + DYNAMIC BOUNDARY DETECTION
const PLANET_BASE_TTL = {
  Moon: 900, // 15 minutes base (fast mover, 13°/day)
  Sun: 1800, // 30 minutes base (1°/day)
  Mercury: 3600, // 1 hour base (varies: 1-4°/day)
  Venus: 7200, // 2 hours base (1.2°/day)
  Mars: 21600, // 6 hours base (0.5°/day)
  Jupiter: 86400, // 24 hours base (0.08°/day)
  Saturn: 86400 * 7, // 7 days base (0.03°/day)
  Uranus: 86400 * 14, // 14 days base (0.01°/day)
  Neptune: 86400 * 30, // 30 days base (0.006°/day)
  Pluto: 86400 * 30, // 30 days base (0.004°/day)
} as const;

// In-memory caches (migrated from cosmic-og.ts)
const positionCache = new Map<
  string,
  { data: any; expiresAt: number; planet: string }
>();
const moonPhaseCache = new Map<string, { data: any; expiresAt: number }>();
const aspectsCache = new Map<string, { data: any; expiresAt: number }>();

const MAX_CACHE_SIZE = 1000;

/**
 * Calculate dynamic TTL based on proximity to sign boundary
 * Near boundaries (28-29° or 0-1°): Use shorter TTL for accuracy
 * Mid-sign: Use base TTL for performance
 */
function getDynamicTTL(planet: string, longitude: number): number {
  const degreeInSign = longitude % 30;
  const baseTTL =
    PLANET_BASE_TTL[planet as keyof typeof PLANET_BASE_TTL] || 3600;

  // Near sign exit (28-29°) or just entered (0-1°)
  const nearBoundary = degreeInSign >= 28 || degreeInSign <= 1;

  if (nearBoundary) {
    // Reduce TTL by 75% when near boundaries for timing accuracy
    return Math.floor(baseTTL * 0.25);
    // Examples:
    // - Moon at 29° Aries: 900s → 225s (3.75 min refresh)
    // - Mars at 0° Taurus: 21600s → 5400s (1.5 hr refresh)
    // - Saturn at 28° Pisces: 604800s → 151200s (1.75 day refresh)
  }

  return baseTTL;
}

/**
 * Format longitude as degrees and minutes (15°32' instead of 15.5°)
 */
export function getDegreeInSign(longitude: number): number {
  return Math.floor(longitude % 30);
}

export function getMinutesInDegree(longitude: number): number {
  const decimal = (longitude % 30) % 1;
  return Math.round(decimal * 60);
}

export function formatDegreeMinutes(longitude: number): string {
  const deg = getDegreeInSign(longitude);
  const min = getMinutesInDegree(longitude);
  return `${deg}°${min.toString().padStart(2, '0')}'`;
}

/**
 * Get zodiac sign from longitude
 */
export function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return signs[index];
}

/**
 * Calculate moon angular size for display
 */
function getMoonSize(diamKm: number): 'large' | 'normal' | 'small' {
  // Moon diameter varies ~10% (perigee vs apogee)
  if (diamKm > 3476) return 'large'; // Near perigee
  if (diamKm < 3474) return 'small'; // Near apogee
  return 'normal';
}

function cleanupCache(cache: Map<string, any>) {
  if (cache.size > MAX_CACHE_SIZE) {
    // Remove oldest expired entries first
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (value.expiresAt < now) {
        cache.delete(key);
      }
      if (cache.size <= MAX_CACHE_SIZE) break;
    }
  }
}

/**
 * Get planetary positions with variable TTL caching
 * Extracted from cosmic-og.ts for reusability
 */
export function getRealPlanetaryPositions(
  date: Date,
  observer: Observer = new Observer(51.4769, 0.0005, 0),
) {
  const astroTime = new AstroTime(date);
  const astroTimePast = new AstroTime(
    new Date(date.getTime() - 24 * 60 * 60 * 1000),
  );
  const astroTimePastPast = new AstroTime(
    new Date(date.getTime() - 24 * 60 * 60 * 1000 * 2),
  );

  const planets = [
    { body: Body.Sun, name: 'Sun' },
    { body: Body.Moon, name: 'Moon' },
    { body: Body.Mercury, name: 'Mercury' },
    { body: Body.Venus, name: 'Venus' },
    { body: Body.Mars, name: 'Mars' },
    { body: Body.Jupiter, name: 'Jupiter' },
    { body: Body.Saturn, name: 'Saturn' },
    { body: Body.Uranus, name: 'Uranus' },
    { body: Body.Neptune, name: 'Neptune' },
    { body: Body.Pluto, name: 'Pluto' },
  ];

  const positions: Record<string, any> = {};

  planets.forEach(({ body, name: planetName }) => {
    // Check per-planet cache with variable TTL
    const cacheKey = `${planetName}:${Math.floor(date.getTime() / 1000)}`;
    const cached = positionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      positions[planetName] = cached.data;
      return;
    }

    // Calculate position (same logic as cosmic-og.ts)
    const vectorNow = GeoVector(body, astroTime, true);
    const vectorPast = GeoVector(body, astroTimePast, true);
    const vectorPastPast = GeoVector(body, astroTimePastPast, true);

    const eclipticNow = Ecliptic(vectorNow);
    const eclipticPast = Ecliptic(vectorPast);
    const eclipticPastPast = Ecliptic(vectorPastPast);

    const longitude = eclipticNow.elon;
    const longitudePast = eclipticPast.elon;
    const longitudePastPast = eclipticPastPast.elon;

    // Check for retrograde motion (accounting for 0°/360° wraparound)
    let retrograde = false;
    let wasRetrograde = false;

    if (Math.abs(longitude - longitudePast) < 180) {
      retrograde = longitude < longitudePast;
    } else {
      retrograde = longitude > longitudePast;
    }

    if (Math.abs(longitudePast - longitudePastPast) < 180) {
      wasRetrograde = longitudePast < longitudePastPast;
    } else {
      wasRetrograde = longitudePast > longitudePastPast;
    }

    // Detect retrograde station (planet just started moving backwards)
    const newRetrograde = retrograde && !wasRetrograde;

    // Detect direct station (planet just started moving forwards again)
    const newDirect = !retrograde && wasRetrograde;

    // Calculate transit duration (zero additional astronomy calls!)
    const sign = getZodiacSign(longitude);
    const duration = calculateTransitDuration(
      planetName,
      sign,
      longitude,
      date,
    );

    const positionData = {
      longitude,
      sign,
      degree: getDegreeInSign(longitude),
      minutes: getMinutesInDegree(longitude),
      retrograde,
      newRetrograde,
      newDirect,
      duration: duration
        ? {
            totalDays: duration.totalDays,
            remainingDays: duration.remainingDays,
            displayText: duration.displayText,
            startDate: duration.startDate,
            endDate: duration.endDate,
          }
        : undefined,
    };

    // Cache with dynamic TTL (shorter near sign boundaries)
    const ttl = getDynamicTTL(planetName, longitude);
    positionCache.set(cacheKey, {
      data: positionData,
      expiresAt: Date.now() + ttl * 1000,
      planet: planetName,
    });

    positions[planetName] = positionData;
  });

  cleanupCache(positionCache);
  return positions;
}

// Constants for supermoon/micromoon detection
const MOON_PERIGEE_KM = 356500;
const MOON_APOGEE_KM = 406700;
const SUPERMOON_THRESHOLD = 0.9;

/**
 * Calculate illumination change rate based on phase angle
 * Rate varies: fastest at quarters (~0.28%/hr), slowest at new/full (~0%/hr)
 */
function calculateMoonChangeRate(phaseAngle: number): number {
  // Distance from nearest new/full moon (0°, 180°, 360°)
  const distanceFromPeak = Math.min(
    Math.abs(phaseAngle),
    Math.abs(phaseAngle - 180),
    Math.abs(phaseAngle - 360),
  );

  // Maximum rate: ~0.28% per hour at quarters
  const maxRate = 0.28;
  const rate = maxRate * Math.sin((distanceFromPeak / 90) * (Math.PI / 2));

  return Math.max(rate, 0.01); // Minimum 0.01 to avoid division by zero
}

/**
 * Calculate smart TTL: expires when illumination reaches next integer %
 * This eliminates "jumps" at arbitrary cache boundaries
 */
function calculateSmartMoonTTL(
  currentIllumination: number,
  changeRatePerHour: number,
  trend: 'waxing' | 'waning',
): { secondsUntilNext: number; optimalTTL: number } {
  // Calculate distance to next integer percentage
  let percentageGap: number;
  if (trend === 'waxing') {
    // Moving toward next higher integer
    percentageGap = Math.ceil(currentIllumination) - currentIllumination;
    if (percentageGap < 0.01) percentageGap = 1; // Just passed, next is +1%
  } else {
    // Moving toward next lower integer
    percentageGap = currentIllumination - Math.floor(currentIllumination);
    if (percentageGap < 0.01) percentageGap = 1; // Just passed, next is -1%
  }

  // Calculate time until next percentage (in hours)
  const hoursUntilNext = percentageGap / changeRatePerHour;
  const secondsUntilNext = Math.max(hoursUntilNext * 3600, 60); // Minimum 1 minute

  // Set TTL with safety bounds
  const minTTL = 60; // Minimum 1 minute
  const maxTTL = 3600; // Maximum 1 hour
  const optimalTTL = Math.max(minTTL, Math.min(secondsUntilNext, maxTTL));

  return { secondsUntilNext, optimalTTL };
}

/**
 * Get accurate moon phase with smart cache and supermoon detection
 * Global data (same for everyone worldwide - geocentric view)
 *
 * Smart cache: Expires when illumination reaches next integer %
 * No arbitrary hour-boundary jumps, updates feel smooth and natural
 */
export function getAccurateMoonPhase(date: Date): {
  name: string;
  energy: string;
  priority: number;
  emoji: string;
  illumination: number;
  illuminationPrecise: number;
  age: number;
  isSignificant: boolean;
  distanceKm: number;
  isSuperMoon: boolean;
  isMicroMoon: boolean;
  angularSize: number;
  changeRatePerHour: number;
  nextPercentageIn: number;
  optimalCacheTTL: number;
  phaseAngle: number;
  trend: 'waxing' | 'waning';
} {
  // Cache key: round to nearest minute (not hour!)
  const minuteKey = Math.floor(date.getTime() / (60 * 1000));
  const cacheKey = `moon:${minuteKey}`;

  const cached = moonPhaseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Calculate fresh data
  const astroTime = new AstroTime(date);
  const body = Body.Moon;
  const illum = Illumination(body, astroTime);
  const phase = MoonPhase(date); // Phase angle in degrees

  // Get distance
  const geoVector = GeoVector(body, astroTime, true);
  const distanceKm =
    Math.sqrt(
      geoVector.x * geoVector.x +
        geoVector.y * geoVector.y +
        geoVector.z * geoVector.z,
    ) * 149597870.7; // AU to km

  // Calculate illumination
  const illuminationPrecise = illum.phase_fraction * 100;
  const illumination = Math.round(illuminationPrecise);
  const moonAge = (phase / 360) * 29.530588853;

  // Determine trend
  const trend: 'waxing' | 'waning' = phase < 180 ? 'waxing' : 'waning';

  // Calculate change rate (% per hour)
  const changeRatePerHour = calculateMoonChangeRate(phase);

  // Calculate when illumination will reach next integer percentage
  const { secondsUntilNext, optimalTTL } = calculateSmartMoonTTL(
    illuminationPrecise,
    changeRatePerHour,
    trend,
  );

  // Supermoon detection
  const perigeeThreshold =
    MOON_PERIGEE_KM +
    (MOON_APOGEE_KM - MOON_PERIGEE_KM) * (1 - SUPERMOON_THRESHOLD);
  const apogeeThreshold =
    MOON_APOGEE_KM -
    (MOON_APOGEE_KM - MOON_PERIGEE_KM) * (1 - SUPERMOON_THRESHOLD);
  const isSuperMoon = distanceKm <= perigeeThreshold;
  const isMicroMoon = distanceKm >= apogeeThreshold;

  // Named moons by month (used for full moon display)
  const moonNames: { [key: number]: string } = {
    1: 'Wolf Moon',
    2: 'Snow Moon',
    3: 'Worm Moon',
    4: 'Pink Moon',
    5: 'Flower Moon',
    6: 'Strawberry Moon',
    7: 'Buck Moon',
    8: 'Sturgeon Moon',
    9: 'Harvest Moon',
    10: 'Hunter Moon',
    11: 'Beaver Moon',
    12: 'Cold Moon',
  };

  // Determine if this is the exact peak day (narrow window for cosmic posts)
  const isExactNewMoon = phase >= 358 || phase <= 2;
  const isExactFullMoon = phase >= 178 && phase <= 182;
  const isExactFirstQuarter = phase >= 88 && phase <= 92;
  const isExactThirdQuarter = phase >= 268 && phase <= 272;
  const isSignificant =
    isExactNewMoon ||
    isExactFullMoon ||
    isExactFirstQuarter ||
    isExactThirdQuarter;

  // Determine display phase and energy
  let name: string;
  let emoji: string;
  let energy: string;
  let priority: number;

  if (illumination <= 3) {
    name = 'New Moon';
    emoji = '🌑';
    energy = 'New Beginnings';
    priority = isSignificant ? 10 : 8;
  } else if (illumination >= 97) {
    const month = date.getMonth() + 1;
    name = moonNames[month] || 'Full Moon';
    emoji = '🌕';
    energy = 'Peak Power';
    priority = isSignificant ? 10 : 8;
  } else if (phase >= 85 && phase <= 95) {
    name = 'First Quarter';
    emoji = '🌓';
    energy = 'Action & Decision';
    priority = isSignificant ? 10 : 6;
  } else if (phase >= 265 && phase <= 275) {
    name = 'Third Quarter';
    emoji = '🌗';
    energy = 'Release & Letting Go';
    priority = isSignificant ? 10 : 6;
  } else if (phase > 5 && phase < 85) {
    name = 'Waxing Crescent';
    emoji = '🌒';
    energy = 'Growing Energy';
    priority = 2;
  } else if (phase > 95 && phase < 175) {
    name = 'Waxing Gibbous';
    emoji = '🌔';
    energy = 'Building Power';
    priority = 2;
  } else if (phase > 185 && phase < 265) {
    name = 'Waning Gibbous';
    emoji = '🌖';
    energy = 'Gratitude & Wisdom';
    priority = 2;
  } else {
    name = 'Waning Crescent';
    emoji = '🌘';
    energy = 'Rest & Reflection';
    priority = 2;
  }

  // Amplify energy for supermoons
  if (isSuperMoon) {
    energy = `${energy} (Supermoon!)`;
    priority = Math.max(priority, 9);
  }

  // Calculate angular size from distance
  // Moon's physical radius: 1737.4 km
  // Angular diameter (arcseconds) = 2 * arctan(radius / distance) * 206265
  const moonRadiusKm = 1737.4;
  const angularDiameterArcsec =
    2 * Math.atan(moonRadiusKm / distanceKm) * 206265;

  const result = {
    name,
    energy,
    priority,
    emoji,
    illumination,
    illuminationPrecise,
    age: moonAge,
    isSignificant,
    distanceKm,
    isSuperMoon,
    isMicroMoon,
    angularSize: angularDiameterArcsec, // In arcseconds (~1758" to ~2046")
    changeRatePerHour,
    nextPercentageIn: secondsUntilNext,
    optimalCacheTTL: optimalTTL,
    phaseAngle: phase,
    trend,
  };

  // Cache with smart TTL (expires when percentage changes)
  moonPhaseCache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + optimalTTL * 1000,
  });

  cleanupCache(moonPhaseCache);
  return result;
}

/**
 * Calculate real aspects between planets (extracted from cosmic-og.ts)
 */
export function calculateRealAspects(positions: any): Array<any> {
  // Create cache key from positions (use first planet's longitude as identifier)
  const positionKey = Object.values(positions)
    .map((p: any) => `${p.longitude.toFixed(1)}`)
    .join(',');
  const cacheKey = `aspects:${positionKey}`;

  const cached = aspectsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const aspects: Array<any> = [];
  const planetNames = Object.keys(positions);

  // Check all planet pairs for aspects
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planetA = planetNames[i];
      const planetB = planetNames[j];

      const longA = positions[planetA].longitude;
      const longB = positions[planetB].longitude;

      // Calculate angular separation
      let separation = Math.abs(longA - longB);
      if (separation > 180) {
        separation = 360 - separation;
      }

      // Determine aspect type based on separation
      let aspectType = null;
      let priority = 0;

      if (separation < 8) {
        aspectType = 'conjunction';
        priority =
          (planetA === 'Jupiter' && planetB === 'Saturn') ||
          (planetA === 'Saturn' && planetB === 'Jupiter')
            ? 9
            : 7;
      } else if (Math.abs(separation - 60) < 6) {
        aspectType = 'sextile';
        priority = 5;
      } else if (Math.abs(separation - 90) < 8) {
        aspectType = 'square';
        priority = 6;
      } else if (Math.abs(separation - 120) < 8) {
        aspectType = 'trine';
        priority = 6;
      } else if (Math.abs(separation - 180) < 8) {
        aspectType = 'opposition';
        priority = 6;
      }

      if (aspectType) {
        aspects.push({
          name: `${planetA}-${planetB} ${aspectType}`,
          aspect: aspectType,
          planetA,
          planetB,
          energy: `${planetA} ${aspectType} ${planetB}`,
          priority,
          separation: Math.round(separation * 10) / 10,
        });
      }
    }
  }

  const sortedAspects = aspects.sort((a, b) => b.priority - a.priority);

  // Cache the result (1 hour)
  aspectsCache.set(cacheKey, {
    data: sortedAspects,
    expiresAt: Date.now() + 3600 * 1000,
  });

  cleanupCache(aspectsCache);
  return sortedAspects;
}

/**
 * Check for seasonal events
 */
export function checkSeasonalEvents(positions: any): Array<any> {
  const sunLongitude = positions.Sun.longitude;
  const events: Array<any> = [];

  // Exact seasonal markers (within 1 degree)
  // Spring Equinox: 0° (or 360°)
  if (Math.abs(sunLongitude - 0) < 1 || Math.abs(sunLongitude - 360) < 1) {
    events.push({
      name: 'Spring Equinox',
      energy: 'Balance & New Growth',
      priority: 9,
      type: 'seasonal',
      emoji: '🌸',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 0° - Spring begins',
    });
  } else if (Math.abs(sunLongitude - 90) < 1) {
    events.push({
      name: 'Summer Solstice',
      energy: 'Maximum Solar Power',
      priority: 9,
      type: 'seasonal',
      emoji: '☀️',
      description: 'Longest day of the year',
      detail: 'Solar longitude 90° - Peak solar energy',
    });
  } else if (Math.abs(sunLongitude - 180) < 1) {
    events.push({
      name: 'Autumn Equinox',
      energy: 'Harvest & Reflection',
      priority: 9,
      type: 'seasonal',
      emoji: '🍂',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 180° - Autumn begins',
    });
  } else if (Math.abs(sunLongitude - 270) < 1) {
    events.push({
      name: 'Winter Solstice',
      energy: 'Inner Light & Renewal',
      priority: 9,
      type: 'seasonal',
      emoji: '❄️',
      description: 'Longest night of the year',
      detail: 'Solar longitude 270° - Return of the light',
    });
  }

  return events;
}

/**
 * Check for planets entering new signs (sign ingress)
 */
export function checkSignIngress(positions: any, date: Date): Array<any> {
  const ingresses: Array<any> = [];

  // For each planet, check if it's near the beginning of a sign (0-2 degrees)
  Object.entries(positions).forEach(([planet, data]: [string, any]) => {
    const longitude = data.longitude;
    const degreeInSign = longitude % 30;

    // Planet entering new sign if within first 2 degrees
    if (degreeInSign < 2) {
      ingresses.push({
        name: `${planet} enters ${data.sign}`,
        energy: `${planet} energy shifts`,
        priority: 8,
        type: 'ingress',
        planet,
        sign: data.sign,
      });
    }
  });

  return ingresses.sort((a, b) => b.priority - a.priority);
}

/**
 * Check for retrograde events
 */
export function checkRetrogradeEvents(positions: any): Array<any> {
  const retrogradeEvents: Array<any> = [];
  Object.entries(positions).forEach(([planet, data]: [string, any]) => {
    // Detect when a planet stations retrograde (starts moving backwards)
    if (data.newRetrograde) {
      retrogradeEvents.push({
        name: `${planet} Retrograde Begins`,
        energy: `${planet} stations retrograde in ${data.sign}`,
        priority: 9,
        type: 'retrograde_start',
        planet,
        sign: data.sign,
      });
    }

    // Detect when a planet stations direct (ends retrograde, starts moving forwards)
    if (data.newDirect) {
      retrogradeEvents.push({
        name: `${planet} Retrograde Ends`,
        energy: `${planet} stations direct in ${data.sign}`,
        priority: 9,
        type: 'retrograde_end',
        planet,
        sign: data.sign,
      });
    }
  });
  return retrogradeEvents.sort((a, b) => b.priority - a.priority);
}

/**
 * Check for retrograde ingress
 */
export function checkRetrogradeIngress(positions: any): Array<any> {
  const retrogradeIngress: Array<any> = [];
  Object.entries(positions).forEach(([planet, data]: [string, any]) => {
    const longitude = data.longitude;
    const degreeInSign = longitude % 30;

    // Planet entering new sign if within first 2 degrees
    if (data.retrograde && degreeInSign < 1) {
      retrogradeIngress.push({
        name: `${planet} is retrograde`,
        energy: `${planet} is retrograde`,
        priority: 8,
        type: 'retrograde',
        planet,
        sign: data.sign,
      });
    }
  });
  return retrogradeIngress.sort((a, b) => b.priority - a.priority);
}

/**
 * Get descriptive qualities for zodiac signs
 */
export function getSignDescription(sign: string): string {
  const descriptions: { [key: string]: string } = {
    Aries: 'initiating and pioneering',
    Taurus: 'grounding and stabilizing',
    Gemini: 'communicating and adapting',
    Cancer: 'nurturing and protective',
    Leo: 'creative and expressive',
    Virgo: 'practical and analytical',
    Libra: 'harmonizing and diplomatic',
    Scorpio: 'transforming and intense',
    Sagittarius: 'expanding and philosophical',
    Capricorn: 'structuring and ambitious',
    Aquarius: 'innovative and independent',
    Pisces: 'intuitive and compassionate',
  };
  return descriptions[sign] || 'cosmic';
}

/**
 * Helper: Format supermoon info for display
 */
export function formatSupermoonInfo(moonData: {
  distanceKm: number;
  isSuperMoon: boolean;
  isMicroMoon: boolean;
}): string {
  if (moonData.isSuperMoon) {
    return `🌕 Supermoon! (${Math.round(moonData.distanceKm).toLocaleString()} km - Extra close!)`;
  } else if (moonData.isMicroMoon) {
    return `🌑 Micromoon (${Math.round(moonData.distanceKm).toLocaleString()} km - Extra far)`;
  }
  return `${Math.round(moonData.distanceKm).toLocaleString()} km from Earth`;
}

/**
 * Helper: Format cache info for debugging
 */
export function formatCacheInfo(moonData: {
  nextPercentageIn: number;
  illuminationPrecise: number;
  trend: 'waxing' | 'waning';
}): string {
  const minutes = Math.floor(moonData.nextPercentageIn / 60);
  const seconds = Math.round(moonData.nextPercentageIn % 60);
  return `Next update in ${minutes}m ${seconds}s (when reaching ${moonData.trend === 'waxing' ? Math.ceil(moonData.illuminationPrecise) : Math.floor(moonData.illuminationPrecise)}%)`;
}
