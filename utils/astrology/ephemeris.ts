import {
  Observer,
  AstroTime,
  Body,
  SearchRiseSet,
  Illumination,
  GeoVector,
  Horizon,
} from 'astronomy-engine';
import { LocationData } from '../location';

export interface RiseSetData {
  rise: Date | null;
  set: Date | null;
  transit: Date | null;
  isVisible: boolean;
  altitude: number;
  azimuth: number;
  magnitude?: number;
  illumination?: number;
}

export interface PlanetEphemeris {
  body: string;
  riseSet: RiseSetData;
  constellation: string;
  sign: string;
  distance?: number;
  angularSize?: number;
}

export interface SunMoonData {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  moonPhase: {
    phase: number;
    illumination: number;
    age: number;
    name: string;
  };
  dayLength: number;
}

export interface EphemerisData {
  location: LocationData;
  date: Date;
  sunMoon: SunMoonData;
  planets: PlanetEphemeris[];
  stars: StarData[];
  twilight: TwilightData;
}

export interface StarData {
  name: string;
  riseSet: RiseSetData;
  constellation: string;
}

export interface TwilightData {
  civilDawn: Date | null;
  civilDusk: Date | null;
  nauticalDawn: Date | null;
  nauticalDusk: Date | null;
  astronomicalDawn: Date | null;
  astronomicalDusk: Date | null;
}

const PLANETS = [
  { body: Body.Mercury, name: 'Mercury' },
  { body: Body.Venus, name: 'Venus' },
  { body: Body.Mars, name: 'Mars' },
  { body: Body.Jupiter, name: 'Jupiter' },
  { body: Body.Saturn, name: 'Saturn' },
  { body: Body.Uranus, name: 'Uranus' },
  { body: Body.Neptune, name: 'Neptune' },
  { body: Body.Pluto, name: 'Pluto' },
];

const BRIGHT_STARS = [
  { name: 'Sirius', ra: 101.287, dec: -16.716 },
  { name: 'Canopus', ra: 95.988, dec: -52.696 },
  { name: 'Arcturus', ra: 213.915, dec: 19.182 },
  { name: 'Vega', ra: 279.234, dec: 38.784 },
  { name: 'Capella', ra: 79.172, dec: 45.998 },
  { name: 'Rigel', ra: 78.634, dec: -8.202 },
  { name: 'Procyon', ra: 114.826, dec: 5.225 },
  { name: 'Betelgeuse', ra: 88.793, dec: 7.407 },
];

const MOON_PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Third Quarter',
  'Waning Crescent',
];

export const calculateRiseSet = (
  body: Body,
  observer: Observer,
  date: Date = new Date(),
): RiseSetData => {
  const astroTime = new AstroTime(date);

  try {
    const riseTime = SearchRiseSet(body, observer, +1, astroTime, 1);
    const setTime = SearchRiseSet(body, observer, -1, astroTime, 1);

    let transitTime: Date | null = null;

    const horizon = Horizon(astroTime, observer, 0, 0, 'normal');
    const vector = GeoVector(body, astroTime, false);
    const horizontalCoords = Horizon(
      astroTime,
      observer,
      vector.x,
      vector.y,
      'normal',
    );

    const illuminationData =
      body !== Body.Sun ? Illumination(body, astroTime) : null;

    return {
      rise: riseTime ? riseTime.date : null,
      set: setTime ? setTime.date : null,
      transit: transitTime,
      isVisible: horizontalCoords.altitude > 0,
      altitude: horizontalCoords.altitude,
      azimuth: horizontalCoords.azimuth,
      magnitude: illuminationData?.mag,
      illumination: illuminationData?.phase_fraction,
    };
  } catch (error) {
    console.warn(`Failed to calculate rise/set for ${Body[body]}:`, error);
    return {
      rise: null,
      set: null,
      transit: null,
      isVisible: false,
      altitude: 0,
      azimuth: 0,
    };
  }
};

export const calculateSunMoon = (
  observer: Observer,
  date: Date = new Date(),
): SunMoonData => {
  const astroTime = new AstroTime(date);

  const sunRise = SearchRiseSet(Body.Sun, observer, +1, astroTime, 1);
  const sunSet = SearchRiseSet(Body.Sun, observer, -1, astroTime, 1);

  const moonRise = SearchRiseSet(Body.Moon, observer, +1, astroTime, 1);
  const moonSet = SearchRiseSet(Body.Moon, observer, -1, astroTime, 1);

  const moonIllumination = Illumination(Body.Moon, astroTime);
  const moonPhaseAngle = moonIllumination.phase_angle;
  const moonAge = (moonPhaseAngle / 360) * 29.53;

  const phaseIndex = Math.round(moonPhaseAngle / 45) % 8;

  const dayLength = sunRise && sunSet ? (sunSet.ut - sunRise.ut) * 24 : 0;

  // Calculate solar noon as midpoint between sunrise and sunset
  let solarNoon: Date | null = null;
  if (sunRise && sunSet) {
    const midpointTime = (sunRise.ut + sunSet.ut) / 2;
    solarNoon = new AstroTime(midpointTime).date;
  }

  return {
    sunrise: sunRise?.date || null,
    sunset: sunSet?.date || null,
    solarNoon,
    moonrise: moonRise?.date || null,
    moonset: moonSet?.date || null,
    moonPhase: {
      phase: moonPhaseAngle,
      illumination: moonIllumination.phase_fraction * 100,
      age: moonAge,
      name: MOON_PHASE_NAMES[phaseIndex],
    },
    dayLength,
  };
};

export const calculateTwilight = (
  observer: Observer,
  date: Date = new Date(),
): TwilightData => {
  return {
    civilDawn: null,
    civilDusk: null,
    nauticalDawn: null,
    nauticalDusk: null,
    astronomicalDawn: null,
    astronomicalDusk: null,
  };
};

export const getZodiacSign = (longitude: number): string => {
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
  const index = Math.floor((longitude % 360) / 30);
  return signs[index];
};

export const getConstellation = (ra: number, dec: number): string => {
  // Simple constellation mapping based on ecliptic longitude
  const constellations = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpius',
    'Sagittarius',
    'Capricornus',
    'Aquarius',
    'Pisces',
  ];

  // Convert to constellation index (simplified)
  const index = Math.floor((((ra % 360) + 360) % 360) / 30);
  return constellations[index] || 'Unknown';
};

export const calculatePlanetEphemeris = (
  observer: Observer,
  date: Date = new Date(),
): PlanetEphemeris[] => {
  const astroTime = new AstroTime(date);

  const results = PLANETS.map(({ body, name }) => {
    const riseSet = calculateRiseSet(body, observer, date);
    const vector = GeoVector(body, astroTime, true);

    const longitude = Math.atan2(vector.y, vector.x) * (180 / Math.PI);
    const sign = getZodiacSign(longitude);
    const constellation = getConstellation(longitude, 0);

    return {
      body: name,
      riseSet,
      constellation,
      sign,
      distance: Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2),
    };
  });

  return results;
};

export const calculateStarEphemeris = (
  observer: Observer,
  date: Date = new Date(),
): StarData[] => {
  return [];
};

export const calculateFullEphemeris = (
  location: LocationData,
  date: Date = new Date(),
): EphemerisData => {
  const observer = new Observer(location.latitude, location.longitude, 0);

  const sunMoon = calculateSunMoon(observer, date);
  const planets = calculatePlanetEphemeris(observer, date);
  const stars = calculateStarEphemeris(observer, date);
  const twilight = calculateTwilight(observer, date);

  return {
    location,
    date,
    sunMoon,
    planets,
    stars,
    twilight,
  };
};

export const formatTime = (date: Date | null, timezone?: string): string => {
  if (!date) return '--:--';

  try {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });
  } catch {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export const formatDayLength = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};
