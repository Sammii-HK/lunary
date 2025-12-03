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
};

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

    const ascendantLongitudeDeg = (ascendantLongitude * 180) / Math.PI;
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
  } catch {
    // If Ascendant calculation fails, continue without it
  }

  return birthChartData;
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
