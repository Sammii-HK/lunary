import {
  getJulianDay,
  normalizeDegrees,
  getEarthHeliocentricEcliptic,
} from './birthChart';

interface OrbitalElements {
  epochJd: number;
  a: number; // Semi-major axis (AU)
  e: number; // Eccentricity
  i: number; // Inclination (degrees)
  om: number; // Longitude of ascending node (degrees)
  w: number; // Argument of perihelion (degrees)
  m: number; // Mean anomaly at epoch (degrees)
  n: number; // Mean motion (degrees/day)
}

// Orbital elements from JPL Horizons (epoch JD 2461000.5 = 2026-Jan-18)
const ASTEROID_ELEMENTS: Record<string, OrbitalElements> = {
  ceres: {
    epochJd: 2461000.5,
    a: 2.768268270897305,
    e: 0.07582467943513585,
    i: 10.59406732644066,
    om: 80.30196155951738,
    w: 73.11676906141464,
    m: 95.98956419464152,
    n: 0.2141142465893966,
  },
  pallas: {
    epochJd: 2461000.5,
    a: 2.771918184011465,
    e: 0.2311656328646094,
    i: 34.83881516348639,
    om: 173.0915875929564,
    w: 310.0394493716818,
    m: 78.23825672991644,
    n: 0.2133043488709826,
  },
  juno: {
    epochJd: 2461000.5,
    a: 2.669509949066486,
    e: 0.2563003046844989,
    i: 12.98861654437629,
    om: 169.8719306881747,
    w: 248.4067693551286,
    m: 33.13369750213732,
    n: 0.2255267024687893,
  },
  vesta: {
    epochJd: 2461000.5,
    a: 2.361764887697032,
    e: 0.08896350022669558,
    i: 7.140567267028846,
    om: 103.8513448304419,
    w: 151.1982379975923,
    m: 205.8092766646614,
    n: 0.2717143714145831,
  },
  hygiea: {
    epochJd: 2461000.5,
    a: 3.138667074663736,
    e: 0.1177481893353195,
    i: 3.835951893394039,
    om: 283.2088146652399,
    w: 312.4686311467827,
    m: 115.4291625824363,
    n: 0.1556917945142419,
  },
  pholus: {
    epochJd: 2461000.5,
    a: 20.43026711598173,
    e: 0.5711042464869751,
    i: 24.66619699066673,
    om: 119.4235033694954,
    w: 354.7850033639206,
    m: 23.18934686733341,
    n: 0.01263795466961308,
  },
  psyche: {
    epochJd: 2461000.5,
    a: 2.922590846516846,
    e: 0.1340144462870098,
    i: 3.096551856729829,
    om: 150.2586765799772,
    w: 227.9682093736869,
    m: 189.3268423451734,
    n: 0.1814328883495142,
  },
  eros: {
    epochJd: 2461000.5,
    a: 1.458167632988862,
    e: 0.2229437799479293,
    i: 10.82893736235598,
    om: 304.3222780878047,
    w: 178.6651633671416,
    m: 320.1034526863708,
    n: 0.5599204815834456,
  },
};

function solveKepler(
  meanAnomalyRad: number,
  eccentricity: number,
  tolerance = 1e-8,
  maxIterations = 30,
): number {
  let eccentricAnomaly = meanAnomalyRad;
  for (let i = 0; i < maxIterations; i++) {
    const delta =
      eccentricAnomaly -
      eccentricity * Math.sin(eccentricAnomaly) -
      meanAnomalyRad;
    eccentricAnomaly -= delta / (1 - eccentricity * Math.cos(eccentricAnomaly));
    if (Math.abs(delta) < tolerance) break;
  }
  return eccentricAnomaly;
}

function calculateAsteroidPosition(
  elements: OrbitalElements,
  date: Date,
): number {
  const jd = getJulianDay(date);
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

export function calculateCeres(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.ceres, date);
}

export function calculatePallas(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.pallas, date);
}

export function calculateJuno(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.juno, date);
}

export function calculateVesta(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.vesta, date);
}

export function calculateHygiea(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.hygiea, date);
}

export function calculatePholus(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.pholus, date);
}

export function calculatePsyche(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.psyche, date);
}

export function calculateEros(date: Date): number {
  return calculateAsteroidPosition(ASTEROID_ELEMENTS.eros, date);
}
