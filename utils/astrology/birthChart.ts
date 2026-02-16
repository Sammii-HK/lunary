import {
  getAstrologicalChart,
  AstroChartInformation,
  getZodiacSign,
  formatDegree,
} from './astrology';
import {
  calculateCeres,
  calculatePallas,
  calculateJuno,
  calculateVesta,
  calculateHygiea,
  calculatePholus,
  calculatePsyche,
  calculateEros,
} from './asteroids';
import {
  Observer,
  AstroTime,
  SiderealTime,
  e_tilt,
  Body,
  GeoVector,
  HelioVector,
  Ecliptic,
  EclipticGeoMoon,
  SearchMoonNode,
  NextMoonNode,
  NodeEventKind,
  SearchLunarApsis,
  NextLunarApsis,
  ApsisKind,
} from 'astronomy-engine';

export type BirthChartData = {
  body: string;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
  retrograde: boolean;
  house?: number;
};

export type HouseCusp = {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
};

export type BirthChartResult = {
  planets: BirthChartData[];
  houses: HouseCusp[];
};

function calculateMeanLunarNode(date: Date): number {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  let omega =
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return normalizeDegrees(omega);
}

function calculateTrueLunarNode(
  date: Date,
  kind: NodeEventKind = NodeEventKind.Ascending,
): number {
  const targetTime = new AstroTime(date);
  const searchStart = new Date(date.getTime() - 20 * 24 * 60 * 60 * 1000);
  let node = SearchMoonNode(new AstroTime(searchStart));
  let prevMatch: null | ReturnType<typeof SearchMoonNode> = null;
  let nextMatch: null | ReturnType<typeof SearchMoonNode> = null;

  for (let i = 0; i < 12; i += 1) {
    if (node.kind === kind) {
      if (node.time.ut <= targetTime.ut) {
        prevMatch = node;
      } else {
        nextMatch = node;
        break;
      }
    }
    node = NextMoonNode(node);
  }

  const chosen = (() => {
    if (prevMatch && nextMatch) {
      const prevDelta = Math.abs(prevMatch.time.ut - targetTime.ut);
      const nextDelta = Math.abs(nextMatch.time.ut - targetTime.ut);
      return prevDelta <= nextDelta ? prevMatch : nextMatch;
    }
    return prevMatch || nextMatch;
  })();

  if (!chosen) {
    return calculateMeanLunarNode(date);
  }

  const moonEcliptic = EclipticGeoMoon(chosen.time);
  return normalizeDegrees(moonEcliptic.lon);
}

function calculateChiron(date: Date): number {
  const jd = getJulianDay(date);
  const elements = {
    epochJd: 2461000.5,
    a: 13.69219896172984,
    e: 0.3789792342846475,
    i: 6.926003536565557,
    om: 209.2984204899107,
    w: 339.2537417045351,
    m: 212.8397717853335,
    n: 0.01945334424082164,
  };

  const d = jd - elements.epochJd;
  const meanAnomaly = normalizeDegrees(elements.m + elements.n * d);
  const meanAnomalyRad = (meanAnomaly * Math.PI) / 180;
  const eccentricAnomaly = solveKepler(meanAnomalyRad, elements.e);
  const trueAnomaly =
    2 *
    Math.atan2(
      Math.sqrt(1 + elements.e) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - elements.e) * Math.cos(eccentricAnomaly / 2),
    );
  const radius = elements.a * (1 - elements.e * Math.cos(eccentricAnomaly));

  const nodeRad = (elements.om * Math.PI) / 180;
  const inclRad = (elements.i * Math.PI) / 180;
  const argRad = (elements.w * Math.PI) / 180;
  const argTrue = argRad + trueAnomaly;

  const xh =
    radius *
    (Math.cos(nodeRad) * Math.cos(argTrue) -
      Math.sin(nodeRad) * Math.sin(argTrue) * Math.cos(inclRad));
  const yh =
    radius *
    (Math.sin(nodeRad) * Math.cos(argTrue) +
      Math.cos(nodeRad) * Math.sin(argTrue) * Math.cos(inclRad));
  const zh = radius * Math.sin(argTrue) * Math.sin(inclRad);

  const earth = getEarthHeliocentricEcliptic(date);
  const xg = xh - earth.x;
  const yg = yh - earth.y;
  const zg = zh - earth.z;

  const longitude = Math.atan2(yg, xg);
  return normalizeDegrees((longitude * 180) / Math.PI);
}

function calculateMeanLilith(date: Date): number {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  let lilith =
    83.3532465 + 4069.0137287 * T - 0.01032 * T * T - (T * T * T) / 80000;
  return normalizeDegrees(lilith);
}

function calculateTrueLilith(date: Date): number {
  const targetTime = new AstroTime(date);
  const searchStart = new Date(date.getTime() - 35 * 24 * 60 * 60 * 1000);
  let apsis = SearchLunarApsis(new AstroTime(searchStart));
  let prevApogee = null as null | ReturnType<typeof SearchLunarApsis>;
  let nextApogee = null as null | ReturnType<typeof SearchLunarApsis>;

  for (let i = 0; i < 6; i += 1) {
    if (apsis.kind === ApsisKind.Apocenter) {
      if (apsis.time.ut <= targetTime.ut) {
        prevApogee = apsis;
      } else {
        nextApogee = apsis;
        break;
      }
    }
    apsis = NextLunarApsis(apsis);
  }

  const chosen = (() => {
    if (prevApogee && nextApogee) {
      const prevDelta = Math.abs(prevApogee.time.ut - targetTime.ut);
      const nextDelta = Math.abs(nextApogee.time.ut - targetTime.ut);
      return prevDelta <= nextDelta ? prevApogee : nextApogee;
    }
    return prevApogee || nextApogee;
  })();

  if (!chosen) {
    return calculateMeanLilith(date);
  }

  const moonVector = GeoVector(Body.Moon, chosen.time, true);
  const moonEcliptic = Ecliptic(moonVector);
  return normalizeDegrees(moonEcliptic.elon);
}

export function getJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5
  );
}

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function isRetrograde(current: number, previous: number): boolean {
  const forwardMotion = normalizeDegrees(current - previous);
  return forwardMotion > 180;
}

function solveKepler(meanAnomaly: number, eccentricity: number): number {
  let E = meanAnomaly;
  for (let i = 0; i < 8; i += 1) {
    const delta =
      (E - eccentricity * Math.sin(E) - meanAnomaly) /
      (1 - eccentricity * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-8) break;
  }
  return E;
}

export function getEarthHeliocentricEcliptic(date: Date): {
  x: number;
  y: number;
  z: number;
} {
  const time = new AstroTime(date);
  const earthVector = HelioVector(Body.Earth, time);
  const earthEcliptic = Ecliptic(earthVector);
  const distance = earthVector.Length();
  return rectFromLonLatDist(earthEcliptic.elon, earthEcliptic.elat, distance);
}

function rectFromLonLatDist(
  lonDeg: number,
  latDeg: number,
  distance: number,
): { x: number; y: number; z: number } {
  const lonRad = (lonDeg * Math.PI) / 180;
  const latRad = (latDeg * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  return {
    x: distance * cosLat * Math.cos(lonRad),
    y: distance * cosLat * Math.sin(lonRad),
    z: distance * Math.sin(latRad),
  };
}

function calculateMidheaven(lstDeg: number, obliquity: number): number {
  const lstRad = (lstDeg * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;
  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad));
  mc = (mc * 180) / Math.PI;
  return normalizeDegrees(mc);
}

function calculateAscendant(
  lstDeg: number,
  latitude: number,
  obliquity: number,
): number {
  const lstRad = (lstDeg * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;
  const numerator = -Math.cos(lstRad);
  const denominator =
    Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);
  let asc = Math.atan2(numerator, denominator);
  if (asc < 0) asc += 2 * Math.PI;
  return normalizeDegrees((asc * 180) / Math.PI + 180);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  // Some environments return "24" for midnight with hour12:false — normalize to 0
  const hourNum = Number(values.hour) % 24;
  const formattedUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    hourNum,
    Number(values.minute),
    Number(values.second),
  );
  return formattedUtc - date.getTime();
}

function toUtcFromTimeZone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  // Start with a UTC date that has the local time values
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);
  const firstResult = new Date(utcGuess.getTime() - offsetMs);

  // Re-check: the offset at the computed UTC time may differ from our initial
  // guess near DST boundaries. Iterate once to converge.
  const offsetMs2 = getTimeZoneOffsetMs(firstResult, timeZone);
  if (offsetMs2 !== offsetMs) {
    return new Date(utcGuess.getTime() - offsetMs2);
  }

  return firstResult;
}

function calculateWholeSigHouses(ascendantLongitude: number): HouseCusp[] {
  const houses: HouseCusp[] = [];
  const ascSign = Math.floor(ascendantLongitude / 30);

  for (let i = 0; i < 12; i++) {
    const houseSign = (ascSign + i) % 12;
    const cuspLongitude = houseSign * 30;
    const sign = getZodiacSign(cuspLongitude);
    const formatted = formatDegree(cuspLongitude);

    houses.push({
      house: i + 1,
      sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: cuspLongitude,
    });
  }

  return houses;
}

function getHouseForPlanet(longitude: number, houses: HouseCusp[]): number {
  for (let i = 0; i < 12; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % 12];

    let start = currentHouse.eclipticLongitude;
    let end = nextHouse.eclipticLongitude;

    if (end <= start) {
      if (longitude >= start || longitude < end) {
        return currentHouse.house;
      }
    } else {
      if (longitude >= start && longitude < end) {
        return currentHouse.house;
      }
    }
  }
  return 1;
}

const locationCache = new Map<
  string,
  { latitude: number; longitude: number }
>();

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY || '';
const LOCATIONIQ_BASE_URL =
  process.env.LOCATIONIQ_BASE_URL || 'https://us1.locationiq.com/v1';

async function parseLocationToCoordinates(
  location: string,
): Promise<{ latitude: number; longitude: number } | null> {
  if (!location?.trim()) return null;

  const parseCoordinateToken = (token: string): number | null => {
    const value = token.trim();
    if (!value) return null;

    const decimalHemisphereMatch = value.match(
      /^(-?\d+(?:\.\d+)?)\s*([NSEW])$/i,
    );
    if (decimalHemisphereMatch) {
      const numeric = Number.parseFloat(decimalHemisphereMatch[1]);
      if (!Number.isFinite(numeric)) return null;
      const hemisphere = decimalHemisphereMatch[2].toUpperCase();
      const magnitude = Math.abs(numeric);
      return hemisphere === 'S' || hemisphere === 'W' ? -magnitude : magnitude;
    }

    // Possessive quantifiers (via atomic groups) prevent ReDoS backtracking
    const dmsMatch = value.match(
      /^(\d{1,3})\s*[°º]\s*(\d{1,2})?['\u2032]?\s*(\d{1,2}(?:\.\d+)?)?["\u2033]?\s*([NSEW])$/i,
    );
    if (dmsMatch) {
      const degrees = Number.parseFloat(dmsMatch[1]);
      const minutes = dmsMatch[2] ? Number.parseFloat(dmsMatch[2]) : 0;
      const seconds = dmsMatch[3] ? Number.parseFloat(dmsMatch[3]) : 0;
      if (![degrees, minutes, seconds].every(Number.isFinite)) return null;
      const hemisphere = dmsMatch[4].toUpperCase();
      const magnitude = degrees + minutes / 60 + seconds / 3600;
      return hemisphere === 'S' || hemisphere === 'W' ? -magnitude : magnitude;
    }

    return null;
  };

  const coordMatch = location.match(
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
  );
  if (coordMatch) {
    return {
      latitude: Number.parseFloat(coordMatch[1]),
      longitude: Number.parseFloat(coordMatch[2]),
    };
  }

  const decimalPairSpaceMatch = location.match(
    /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/,
  );
  if (decimalPairSpaceMatch) {
    return {
      latitude: Number.parseFloat(decimalPairSpaceMatch[1]),
      longitude: Number.parseFloat(decimalPairSpaceMatch[2]),
    };
  }

  if (location.includes(',')) {
    const [latToken, lonToken] = location.split(',', 2);
    const latitude = parseCoordinateToken(latToken);
    const longitude = parseCoordinateToken(lonToken);
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
  }

  // Use character class with bounded repetition to avoid ReDoS
  const directionalTokens = location.match(
    /[0-9.°º'"\u2032\u2033\s]{1,30}[NSEW]/gi,
  );
  if (directionalTokens && directionalTokens.length >= 2) {
    const latitude = parseCoordinateToken(directionalTokens[0]);
    const longitude = parseCoordinateToken(directionalTokens[1]);
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
  }

  const normalizedLocation = location.trim().toLowerCase();
  if (locationCache.has(normalizedLocation)) {
    return locationCache.get(normalizedLocation)!;
  }

  if (!LOCATIONIQ_API_KEY) {
    console.warn(
      '[LocationIQ] Missing API key. Set LOCATIONIQ_API_KEY (server only).',
    );
    return null;
  }

  try {
    const response = await fetch(
      `${LOCATIONIQ_BASE_URL}/search?key=${LOCATIONIQ_API_KEY}&format=json&limit=1&q=${encodeURIComponent(location)}`,
    );

    if (!response.ok) {
      console.warn('LocationIQ geocoding failed', response.status);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
      locationCache.set(normalizedLocation, result);
      return result;
    }
  } catch (error) {
    console.warn('Failed to geocode birth location via LocationIQ', error);
  }

  return null;
}

export const generateBirthChart = async (
  birthDate: string,
  birthTime?: string,
  birthLocation?: string,
  birthTimezone?: string,
  observer?: Observer,
): Promise<BirthChartData[]> => {
  // Validate birthDate format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    throw new Error(
      `Invalid birthDate format: "${birthDate}". Expected YYYY-MM-DD.`,
    );
  }

  // Validate birthTime format and range if provided
  if (birthTime) {
    const timeMatch = birthTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      throw new Error(
        `Invalid birthTime format: "${birthTime}". Expected HH:MM.`,
      );
    }
    const h = Number(timeMatch[1]);
    const m = Number(timeMatch[2]);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      throw new Error(
        `Invalid birthTime format: "${birthTime}". Expected HH:MM (00-23:00-59).`,
      );
    }
  }

  let birthDateTime: Date;
  if (birthTimezone) {
    const [year, month, day] = birthDate.split('-').map(Number);
    let hours = 12;
    let minutes = 0;
    if (birthTime) {
      const [h, m] = birthTime.split(':').map(Number);
      hours = h;
      minutes = m || 0;
    }
    try {
      birthDateTime = toUtcFromTimeZone(
        year,
        month,
        day,
        hours,
        minutes,
        birthTimezone,
      );
    } catch {
      // Fallback: treat as UTC explicitly (not runtime-local)
      console.warn(
        `[BirthChart] Timezone conversion failed for "${birthTimezone}", falling back to UTC`,
      );
      birthDateTime = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0),
      );
    }
  } else {
    // No timezone available — use UTC explicitly to ensure consistent behavior
    // across server (Vercel/UTC) and client environments
    const [year, month, day] = birthDate.split('-').map(Number);
    let hours = 12;
    let minutes = 0;
    if (birthTime) {
      const [h, m] = birthTime.split(':').map(Number);
      hours = h;
      minutes = m || 0;
    }
    console.warn(
      '[BirthChart] No timezone provided, using UTC. Chart may be inaccurate — provide birth location for timezone resolution.',
    );
    birthDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  }

  let finalObserver: Observer;
  if (observer) {
    finalObserver = observer;
  } else if (birthLocation) {
    const coords = await parseLocationToCoordinates(birthLocation);
    if (coords) {
      finalObserver = new Observer(coords.latitude, coords.longitude, 0);
    } else {
      finalObserver = new Observer(51.4769, 0.0005, 0);
    }
  } else {
    finalObserver = new Observer(51.4769, 0.0005, 0);
  }

  const astroChart = getAstrologicalChart(birthDateTime, finalObserver);

  const birthChartData: BirthChartData[] = astroChart.map(
    (planet: AstroChartInformation) => ({
      body: planet.body as string,
      sign: planet.sign,
      degree: planet.formattedDegree.degree,
      minute: planet.formattedDegree.minute,
      eclipticLongitude: planet.eclipticLongitude,
      retrograde: planet.retrograde,
    }),
  );

  let ascendantLongitudeDeg = 0;

  try {
    const astroTime = new AstroTime(birthDateTime);
    const obliquity = e_tilt(astroTime).tobl;
    let localSiderealTime =
      SiderealTime(astroTime) + finalObserver.longitude / 15;
    localSiderealTime = ((localSiderealTime % 24) + 24) % 24;
    const lstDeg = localSiderealTime * 15;
    ascendantLongitudeDeg = calculateAscendant(
      lstDeg,
      finalObserver.latitude,
      obliquity,
    );
    const ascendantSign = getZodiacSign(ascendantLongitudeDeg);
    const ascendantFormatted = formatDegree(ascendantLongitudeDeg);

    birthChartData.push({
      body: 'Ascendant',
      sign: ascendantSign,
      degree: ascendantFormatted.degree,
      minute: ascendantFormatted.minute,
      eclipticLongitude: ascendantLongitudeDeg,
      retrograde: false,
    });

    const descendantLongitudeDeg = normalizeDegrees(
      ascendantLongitudeDeg + 180,
    );
    const descendantSign = getZodiacSign(descendantLongitudeDeg);
    const descendantFormatted = formatDegree(descendantLongitudeDeg);

    birthChartData.push({
      body: 'Descendant',
      sign: descendantSign,
      degree: descendantFormatted.degree,
      minute: descendantFormatted.minute,
      eclipticLongitude: descendantLongitudeDeg,
      retrograde: false,
    });

    const mcLongitude = calculateMidheaven(lstDeg, obliquity);
    const mcSign = getZodiacSign(mcLongitude);
    const mcFormatted = formatDegree(mcLongitude);

    birthChartData.push({
      body: 'Midheaven',
      sign: mcSign,
      degree: mcFormatted.degree,
      minute: mcFormatted.minute,
      eclipticLongitude: mcLongitude,
      retrograde: false,
    });

    // Imum Coeli (IC) — directly opposite the Midheaven
    const icLongitude = normalizeDegrees(mcLongitude + 180);
    const icSign = getZodiacSign(icLongitude);
    const icFormatted = formatDegree(icLongitude);

    birthChartData.push({
      body: 'Imum Coeli',
      sign: icSign,
      degree: icFormatted.degree,
      minute: icFormatted.minute,
      eclipticLongitude: icLongitude,
      retrograde: false,
    });

    // Part of Fortune calculation
    const sunData = birthChartData.find((p) => p.body === 'Sun');
    const moonData = birthChartData.find((p) => p.body === 'Moon');
    if (sunData && moonData) {
      const sunLong = sunData.eclipticLongitude;
      const moonLong = moonData.eclipticLongitude;
      // Day/night: Sun is below horizon when normalizeDegrees(sunLong - ascLong) > 180
      const isNight = normalizeDegrees(sunLong - ascendantLongitudeDeg) > 180;
      const pofLong = isNight
        ? normalizeDegrees(ascendantLongitudeDeg + sunLong - moonLong)
        : normalizeDegrees(ascendantLongitudeDeg + moonLong - sunLong);
      const pofSign = getZodiacSign(pofLong);
      const pofFormatted = formatDegree(pofLong);

      birthChartData.push({
        body: 'Part of Fortune',
        sign: pofSign,
        degree: pofFormatted.degree,
        minute: pofFormatted.minute,
        eclipticLongitude: pofLong,
        retrograde: false,
      });

      // Part of Spirit — inverse formula of Part of Fortune
      const posLong = isNight
        ? normalizeDegrees(ascendantLongitudeDeg + moonLong - sunLong)
        : normalizeDegrees(ascendantLongitudeDeg + sunLong - moonLong);
      const posSign = getZodiacSign(posLong);
      const posFormatted = formatDegree(posLong);

      birthChartData.push({
        body: 'Part of Spirit',
        sign: posSign,
        degree: posFormatted.degree,
        minute: posFormatted.minute,
        eclipticLongitude: posLong,
        retrograde: false,
      });
    }

    // Vertex calculation: Ascendant at co-latitude (90 - latitude)
    const coLatitude = 90 - finalObserver.latitude;
    let vertexLong = calculateAscendant(lstDeg, coLatitude, obliquity);
    // Vertex is always in the western hemisphere (houses 5-8).
    // calculateAscendant may return the Anti-Vertex (eastern hemisphere).
    // If the result is within 90° of the Ascendant, we have the Anti-Vertex — flip by 180°.
    const vertexRelative = normalizeDegrees(vertexLong - ascendantLongitudeDeg);
    if (vertexRelative < 90 || vertexRelative > 270) {
      vertexLong = normalizeDegrees(vertexLong + 180);
    }
    const vertexSign = getZodiacSign(vertexLong);
    const vertexFormatted = formatDegree(vertexLong);

    birthChartData.push({
      body: 'Vertex',
      sign: vertexSign,
      degree: vertexFormatted.degree,
      minute: vertexFormatted.minute,
      eclipticLongitude: vertexLong,
      retrograde: false,
    });

    // Anti-Vertex — directly opposite the Vertex
    const antiVertexLong = normalizeDegrees(vertexLong + 180);
    const antiVertexSign = getZodiacSign(antiVertexLong);
    const antiVertexFormatted = formatDegree(antiVertexLong);

    birthChartData.push({
      body: 'Anti-Vertex',
      sign: antiVertexSign,
      degree: antiVertexFormatted.degree,
      minute: antiVertexFormatted.minute,
      eclipticLongitude: antiVertexLong,
      retrograde: false,
    });

    // East Point (Equatorial Ascendant) — Ascendant calculated at 0° latitude
    const eastPointLong = calculateAscendant(lstDeg, 0, obliquity);
    const eastPointSign = getZodiacSign(eastPointLong);
    const eastPointFormatted = formatDegree(eastPointLong);

    birthChartData.push({
      body: 'East Point',
      sign: eastPointSign,
      degree: eastPointFormatted.degree,
      minute: eastPointFormatted.minute,
      eclipticLongitude: eastPointLong,
      retrograde: false,
    });
  } catch (error) {
    console.warn(
      '[BirthChart] Angle calculations failed (Ascendant/MC/IC/Vertex):',
      error,
    );
  }

  try {
    const northNodeLong = calculateTrueLunarNode(
      birthDateTime,
      NodeEventKind.Ascending,
    );
    const northNodeSign = getZodiacSign(northNodeLong);
    const northNodeFormatted = formatDegree(northNodeLong);
    const northNodePrevLong = calculateTrueLunarNode(
      new Date(birthDateTime.getTime() - 24 * 60 * 60 * 1000),
      NodeEventKind.Ascending,
    );

    birthChartData.push({
      body: 'North Node',
      sign: northNodeSign,
      degree: northNodeFormatted.degree,
      minute: northNodeFormatted.minute,
      eclipticLongitude: northNodeLong,
      retrograde: isRetrograde(northNodeLong, northNodePrevLong),
    });

    const southNodeLong = calculateTrueLunarNode(
      birthDateTime,
      NodeEventKind.Descending,
    );
    const southNodeSign = getZodiacSign(southNodeLong);
    const southNodeFormatted = formatDegree(southNodeLong);
    const southNodePrevLong = calculateTrueLunarNode(
      new Date(birthDateTime.getTime() - 24 * 60 * 60 * 1000),
      NodeEventKind.Descending,
    );

    birthChartData.push({
      body: 'South Node',
      sign: southNodeSign,
      degree: southNodeFormatted.degree,
      minute: southNodeFormatted.minute,
      eclipticLongitude: southNodeLong,
      retrograde: isRetrograde(southNodeLong, southNodePrevLong),
    });
  } catch (error) {
    console.warn('[BirthChart] Lunar node calculations failed:', error);
  }

  try {
    const chironLong = calculateChiron(birthDateTime);
    const chironSign = getZodiacSign(chironLong);
    const chironFormatted = formatDegree(chironLong);
    const chironPrevLong = calculateChiron(
      new Date(birthDateTime.getTime() - 24 * 60 * 60 * 1000),
    );

    birthChartData.push({
      body: 'Chiron',
      sign: chironSign,
      degree: chironFormatted.degree,
      minute: chironFormatted.minute,
      eclipticLongitude: chironLong,
      retrograde: isRetrograde(chironLong, chironPrevLong),
    });
  } catch (error) {
    console.warn('[BirthChart] Chiron calculation failed:', error);
  }

  try {
    const lilithLong = calculateTrueLilith(birthDateTime);
    const lilithSign = getZodiacSign(lilithLong);
    const lilithFormatted = formatDegree(lilithLong);
    const lilithPrevLong = calculateTrueLilith(
      new Date(birthDateTime.getTime() - 24 * 60 * 60 * 1000),
    );

    birthChartData.push({
      body: 'Lilith',
      sign: lilithSign,
      degree: lilithFormatted.degree,
      minute: lilithFormatted.minute,
      eclipticLongitude: lilithLong,
      retrograde: isRetrograde(lilithLong, lilithPrevLong),
    });
  } catch (error) {
    console.warn('[BirthChart] Lilith calculation failed:', error);
  }

  // Add asteroids
  const asteroids = [
    { name: 'Ceres', calc: calculateCeres },
    { name: 'Pallas', calc: calculatePallas },
    { name: 'Juno', calc: calculateJuno },
    { name: 'Vesta', calc: calculateVesta },
    { name: 'Hygiea', calc: calculateHygiea },
    { name: 'Pholus', calc: calculatePholus },
    { name: 'Psyche', calc: calculatePsyche },
    { name: 'Eros', calc: calculateEros },
  ];

  for (const asteroid of asteroids) {
    try {
      const asteroidLong = asteroid.calc(birthDateTime);
      const asteroidSign = getZodiacSign(asteroidLong);
      const asteroidFormatted = formatDegree(asteroidLong);
      const asteroidPrevLong = asteroid.calc(
        new Date(birthDateTime.getTime() - 24 * 60 * 60 * 1000),
      );

      birthChartData.push({
        body: asteroid.name,
        sign: asteroidSign,
        degree: asteroidFormatted.degree,
        minute: asteroidFormatted.minute,
        eclipticLongitude: asteroidLong,
        retrograde: isRetrograde(asteroidLong, asteroidPrevLong),
      });
    } catch (error) {
      console.warn(`[BirthChart] ${asteroid.name} calculation failed:`, error);
    }
  }

  return birthChartData;
};

export const generateBirthChartWithHouses = async (
  birthDate: string,
  birthTime?: string,
  birthLocation?: string,
  birthTimezone?: string,
  observer?: Observer,
): Promise<BirthChartResult> => {
  const planets = await generateBirthChart(
    birthDate,
    birthTime,
    birthLocation,
    birthTimezone,
    observer,
  );

  const ascendant = planets.find((p) => p.body === 'Ascendant');
  const ascendantLong = ascendant?.eclipticLongitude || 0;

  const houses = calculateWholeSigHouses(ascendantLong);

  const planetsWithHouses = planets.map((planet) => ({
    ...planet,
    house: getHouseForPlanet(planet.eclipticLongitude, houses),
  }));

  return {
    planets: planetsWithHouses,
    houses,
  };
};

export const __test__ = {
  toUtcFromTimeZone,
};

export const hasBirthChart = (
  birthChart: BirthChartData[] | null | undefined,
): boolean => {
  if (!birthChart) return false;
  return Array.isArray(birthChart) && birthChart.length > 0;
};

export const getBirthChartFromProfile = (
  profile: any,
): BirthChartData[] | null => {
  if (!profile) return null;
  const birthChart = profile.birthChart || profile.birth_chart;
  if (!birthChart || !Array.isArray(birthChart) || birthChart.length === 0) {
    return null;
  }
  return birthChart as BirthChartData[];
};

export { parseLocationToCoordinates };
