import {
  getAstrologicalChart,
  AstroChartInformation,
  getZodiacSign,
  formatDegree,
} from './astrology';
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
import dayjs from 'dayjs';

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

function getJulianDay(date: Date): number {
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

function normalizeDegrees(degrees: number): number {
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

function getEarthHeliocentricEcliptic(date: Date): {
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
  const formattedUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
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
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMs);
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

  const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2]),
    };
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
      birthDateTime = birthTime
        ? dayjs(`${birthDate} ${birthTime}`).toDate()
        : dayjs(`${birthDate} 12:00`).toDate();
    }
  } else if (birthTime) {
    birthDateTime = dayjs(`${birthDate} ${birthTime}`).toDate();
  } else {
    birthDateTime = dayjs(`${birthDate} 12:00`).toDate();
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
  } catch {
    // If angle calculations fail, continue without them
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
  } catch {
    // If node calculations fail, continue without them
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
  } catch {
    // If Chiron calculation fails, continue without it
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
  } catch {
    // If Lilith calculation fails, continue without it
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
