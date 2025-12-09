'use client';

import {
  getAstrologicalChart,
  AstroChartInformation,
  getZodiacSign,
  formatDegree,
} from './astrology';
import { Observer, AstroTime, Horizon } from 'astronomy-engine';
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
  omega = omega % 360;
  if (omega < 0) omega += 360;
  return omega;
}

function calculateChiron(date: Date): number {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const meanAnomaly = 209.35 + (1.8509 * (jd - 2451545.0)) / 365.25;
  let longitude = 173.75 + (1.18538 * (jd - 2451545.0)) / 365.25;
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  return longitude;
}

function calculateMeanLilith(date: Date): number {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  let lilith = 83.353243 + 40.68923 * (jd - 2451545.0);
  lilith = lilith % 360;
  if (lilith < 0) lilith += 360;
  return lilith;
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

function calculateMidheaven(lstDeg: number, obliquity: number): number {
  const lstRad = (lstDeg * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;
  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad));
  mc = (mc * 180) / Math.PI;
  if (mc < 0) mc += 360;
  return mc;
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

async function parseLocationToCoordinates(
  location: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2]),
    };
  }
  return null;
}

export const generateBirthChart = async (
  birthDate: string,
  birthTime?: string,
  birthLocation?: string,
  observer?: Observer,
): Promise<BirthChartData[]> => {
  let birthDateTime: Date;
  if (birthTime) {
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
    const horizon = Horizon(astroTime, finalObserver, 0, 0, 'normal');

    const siderealTime = horizon.ra;
    const localSiderealTime = siderealTime + finalObserver.longitude / 15;

    const obliquity = 23.4393;
    const latRad = (finalObserver.latitude * Math.PI) / 180;
    const lstRad = (localSiderealTime * 15 * Math.PI) / 180;

    const tanAsc =
      Math.cos(lstRad) /
      (Math.cos(latRad) * Math.tan((obliquity * Math.PI) / 180) +
        Math.sin(latRad) * Math.sin(lstRad));
    let ascendantLongitude = Math.atan(tanAsc);

    if (Math.cos(lstRad) < 0) {
      ascendantLongitude += Math.PI;
    }
    if (ascendantLongitude < 0) {
      ascendantLongitude += 2 * Math.PI;
    }

    ascendantLongitudeDeg = (ascendantLongitude * 180) / Math.PI;
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

    const lstDeg = localSiderealTime * 15;
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
    const northNodeLong = calculateMeanLunarNode(birthDateTime);
    const northNodeSign = getZodiacSign(northNodeLong);
    const northNodeFormatted = formatDegree(northNodeLong);

    birthChartData.push({
      body: 'North Node',
      sign: northNodeSign,
      degree: northNodeFormatted.degree,
      minute: northNodeFormatted.minute,
      eclipticLongitude: northNodeLong,
      retrograde: true,
    });

    const southNodeLong = (northNodeLong + 180) % 360;
    const southNodeSign = getZodiacSign(southNodeLong);
    const southNodeFormatted = formatDegree(southNodeLong);

    birthChartData.push({
      body: 'South Node',
      sign: southNodeSign,
      degree: southNodeFormatted.degree,
      minute: southNodeFormatted.minute,
      eclipticLongitude: southNodeLong,
      retrograde: true,
    });
  } catch {
    // If node calculations fail, continue without them
  }

  try {
    const chironLong = calculateChiron(birthDateTime);
    const chironSign = getZodiacSign(chironLong);
    const chironFormatted = formatDegree(chironLong);

    birthChartData.push({
      body: 'Chiron',
      sign: chironSign,
      degree: chironFormatted.degree,
      minute: chironFormatted.minute,
      eclipticLongitude: chironLong,
      retrograde: false,
    });
  } catch {
    // If Chiron calculation fails, continue without it
  }

  try {
    const lilithLong = calculateMeanLilith(birthDateTime);
    const lilithSign = getZodiacSign(lilithLong);
    const lilithFormatted = formatDegree(lilithLong);

    birthChartData.push({
      body: 'Lilith',
      sign: lilithSign,
      degree: lilithFormatted.degree,
      minute: lilithFormatted.minute,
      eclipticLongitude: lilithLong,
      retrograde: false,
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
  observer?: Observer,
): Promise<BirthChartResult> => {
  const planets = await generateBirthChart(
    birthDate,
    birthTime,
    birthLocation,
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
