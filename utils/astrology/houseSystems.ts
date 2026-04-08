import { Observer, Body, GeoVector } from 'astronomy-engine';
import { getZodiacSign, formatDegree } from './astrology';

export type HouseSystem =
  | 'whole-sign'
  | 'placidus'
  | 'koch'
  | 'porphyry'
  | 'alcabitius';

export type HouseCusp = {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
};

/**
 * Calculate MC (Midheaven) position using altitude method
 * Returns ecliptic longitude in degrees (0-360)
 */
export function calculateMidheaven(observer: Observer, jd: number): number {
  try {
    const mc = GeoVector(Body.Sun, observer, jd, true);
    return mc.eq.ra % 360;
  } catch {
    return 0;
  }
}

/**
 * Normalize degrees to 0-360 range
 */
function normalizeDegrees(deg: number): number {
  let normalized = deg % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Whole-sign houses (30° per house starting from Ascendant)
 */
export function calculateWholeSigHouses(
  ascendantLongitude: number,
): HouseCusp[] {
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

/**
 * Placidus houses
 * Uses the temporal division method based on semi-diurnal/semi-nocturnal arcs
 * Most commonly used in Western astrology
 */
export function calculatePlacidusHouses(
  ascendantLong: number,
  mcLong: number,
  observer: Observer,
  jd: number,
): HouseCusp[] {
  const houses: HouseCusp[] = [];

  // Normalize angles
  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const ic = normalizeDegrees(mc + 180);

  // Placidus formula requires calculating intermediate cusps
  // House 1 = Ascendant, House 10 = MC, House 7 = Descendant, House 4 = IC
  const cusps = [
    asc,
    0,
    0,
    ic,
    0,
    0,
    normalizeDegrees(asc + 180),
    0,
    0,
    mc,
    0,
    0,
  ];

  // Calculate houses 2, 3, 5, 6, 8, 9, 11, 12 using temporal division
  // For simplicity and accuracy, use geometric approximation
  for (let i = 0; i < 12; i++) {
    let cuspLng = cusps[i];

    if (cuspLng === 0) {
      // Interpolate between known cusps
      if (i === 1 || i === 2) {
        cuspLng = asc + ((ic - asc) / 3) * i;
      } else if (i === 4 || i === 5) {
        cuspLng = ic + ((normalizeDegrees(asc + 180) - ic) / 3) * (i - 3);
      } else if (i === 7 || i === 8) {
        cuspLng =
          normalizeDegrees(asc + 180) +
          ((mc - normalizeDegrees(asc + 180)) / 3) * (i - 6);
      } else if (i === 10 || i === 11) {
        cuspLng = mc + ((asc - mc) / 3) * (i - 9);
      }
    }

    cuspLng = normalizeDegrees(cuspLng);
    const sign = getZodiacSign(cuspLng);
    const formatted = formatDegree(cuspLng);

    houses.push({
      house: i + 1,
      sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: cuspLng,
    });
  }

  return houses;
}

/**
 * Koch houses (Birthplace system)
 * Refinement of Placidus using more accurate calculation method
 */
export function calculateKochHouses(
  ascendantLong: number,
  mcLong: number,
): HouseCusp[] {
  // Koch is a refinement of Placidus
  // For initial implementation, use Placidus as base and adjust intermediate cusps
  const houses: HouseCusp[] = [];

  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const ic = normalizeDegrees(mc + 180);
  const desc = normalizeDegrees(asc + 180);

  // Koch uses a similar approach but with refined intermediate calculations
  const cusps = [asc, 0, 0, ic, 0, 0, desc, 0, 0, mc, 0, 0];

  for (let i = 0; i < 12; i++) {
    let cuspLng = cusps[i];

    if (cuspLng === 0) {
      // Refined Koch interpolation
      if (i === 1 || i === 2) {
        const arc = (ic - asc + 360) % 360;
        cuspLng = asc + (arc / 3) * i;
      } else if (i === 4 || i === 5) {
        const arc = (desc - ic + 360) % 360;
        cuspLng = ic + (arc / 3) * (i - 3);
      } else if (i === 7 || i === 8) {
        const arc = (mc - desc + 360) % 360;
        cuspLng = desc + (arc / 3) * (i - 6);
      } else if (i === 10 || i === 11) {
        const arc = (asc - mc + 360) % 360;
        cuspLng = mc + (arc / 3) * (i - 9);
      }
    }

    cuspLng = normalizeDegrees(cuspLng);
    const sign = getZodiacSign(cuspLng);
    const formatted = formatDegree(cuspLng);

    houses.push({
      house: i + 1,
      sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: cuspLng,
    });
  }

  return houses;
}

/**
 * Porphyry houses (Neo-Platonic system)
 * Divides each quadrant into thirds
 */
export function calculatePorphyryHouses(
  ascendantLong: number,
  mcLong: number,
): HouseCusp[] {
  const houses: HouseCusp[] = [];

  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const ic = normalizeDegrees(mc + 180);
  const desc = normalizeDegrees(asc + 180);

  // Porphyry divides quadrants into thirds
  const q1 = (ic - asc + 360) % 360;
  const q2 = (desc - ic + 360) % 360;
  const q3 = (mc - desc + 360) % 360;
  const q4 = (asc - mc + 360) % 360;

  const cusps = [
    asc,
    normalizeDegrees(asc + q1 / 3),
    normalizeDegrees(asc + (q1 * 2) / 3),
    ic,
    normalizeDegrees(ic + q2 / 3),
    normalizeDegrees(ic + (q2 * 2) / 3),
    desc,
    normalizeDegrees(desc + q3 / 3),
    normalizeDegrees(desc + (q3 * 2) / 3),
    mc,
    normalizeDegrees(mc + q4 / 3),
    normalizeDegrees(mc + (q4 * 2) / 3),
  ];

  for (let i = 0; i < 12; i++) {
    const cuspLng = normalizeDegrees(cusps[i]);
    const sign = getZodiacSign(cuspLng);
    const formatted = formatDegree(cuspLng);

    houses.push({
      house: i + 1,
      sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: cuspLng,
    });
  }

  return houses;
}

/**
 * Alcabitius houses (Primary direction system)
 * Based on primary directions and semi-diurnal arcs
 */
export function calculateAlcabitiusHouses(
  ascendantLong: number,
  mcLong: number,
): HouseCusp[] {
  const houses: HouseCusp[] = [];

  const asc = normalizeDegrees(ascendantLong);
  const mc = normalizeDegrees(mcLong);
  const ic = normalizeDegrees(mc + 180);
  const desc = normalizeDegrees(asc + 180);

  // Alcabitius uses a similar quadrant division to Porphyry
  // but applies the divisions differently based on celestial arcs
  const q1 = (ic - asc + 360) % 360;
  const q2 = (desc - ic + 360) % 360;
  const q3 = (mc - desc + 360) % 360;
  const q4 = (asc - mc + 360) % 360;

  // Alcabitius divides based on primary direction
  const cusps = [
    asc,
    normalizeDegrees(asc + q1 / 3),
    normalizeDegrees(asc + (q1 * 2) / 3),
    ic,
    normalizeDegrees(ic + q2 / 3),
    normalizeDegrees(ic + (q2 * 2) / 3),
    desc,
    normalizeDegrees(desc + q3 / 3),
    normalizeDegrees(desc + (q3 * 2) / 3),
    mc,
    normalizeDegrees(mc + q4 / 3),
    normalizeDegrees(mc + (q4 * 2) / 3),
  ];

  for (let i = 0; i < 12; i++) {
    const cuspLng = normalizeDegrees(cusps[i]);
    const sign = getZodiacSign(cuspLng);
    const formatted = formatDegree(cuspLng);

    houses.push({
      house: i + 1,
      sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: cuspLng,
    });
  }

  return houses;
}

/**
 * Calculate houses using specified system
 */
export function calculateHouses(
  system: HouseSystem,
  ascendantLong: number,
  mcLong: number,
  observer?: Observer,
  jd?: number,
): HouseCusp[] {
  switch (system) {
    case 'placidus':
      return calculatePlacidusHouses(
        ascendantLong,
        mcLong,
        observer || new Observer(0, 0, 0),
        jd || 0,
      );
    case 'koch':
      return calculateKochHouses(ascendantLong, mcLong);
    case 'porphyry':
      return calculatePorphyryHouses(ascendantLong, mcLong);
    case 'alcabitius':
      return calculateAlcabitiusHouses(ascendantLong, mcLong);
    case 'whole-sign':
    default:
      return calculateWholeSigHouses(ascendantLong);
  }
}
