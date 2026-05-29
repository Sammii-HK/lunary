import {
  AstroTime,
  Body,
  Ecliptic,
  GeoVector,
  Observer,
} from 'astronomy-engine';
import { buildCurrentSkyFacts } from './citation-datasets';
import {
  planetaryPositions,
  getZodiacSign,
} from '../../../utils/astrology/astrology';
import { ZODIAC_SIGNS, planetaryBodies } from '../../../utils/zodiac/zodiac';

const BASE_URL = 'https://lunary.app';

type SkyBodyFact = {
  name: string;
  sign: string;
  degreeInSign: number;
  eclipticLongitude: number;
  source: string;
};

type MoonFact = SkyBodyFact & {
  phase: string;
  illuminationPercent: number;
  phaseAngleDegrees: number;
  isSuperMoon: boolean;
  canonicalGuide: string;
};

type CurrentSkyFacts = ReturnType<typeof buildCurrentSkyFacts> & {
  moon: MoonFact;
  sun: SkyBodyFact;
  planets: SkyBodyFact[];
};

export type FactPageData = {
  dateKey: string;
  facts: CurrentSkyFacts;
  datasetUrl: string;
  archiveUrl: string;
  methodologyUrl: string;
};

export function getFactPageData(date = new Date()): FactPageData {
  const facts = buildCurrentSkyFacts(date) as CurrentSkyFacts;
  const dateKey = date.toISOString().slice(0, 10);

  return {
    dateKey,
    facts,
    datasetUrl: `${BASE_URL}/grimoire/datasets/current-sky-facts.json`,
    archiveUrl: `${BASE_URL}/grimoire/datasets/current-sky/${dateKey}`,
    methodologyUrl: `${BASE_URL}/about/methodology`,
  };
}

export function getPlanetaryPositionRows(facts: CurrentSkyFacts) {
  return [facts.sun, facts.moon, ...facts.planets].map((body) => ({
    body: body.name,
    sign: body.sign,
    degree: `${body.degreeInSign.toFixed(2)}° ${body.sign}`,
    longitude: `${body.eclipticLongitude.toFixed(2)}°`,
  }));
}

export function getMercuryRetrogradeStatus(date = new Date()) {
  const positions = planetaryPositions(date, new Observer(0, 0, 0));
  const mercury = positions.Mercury;
  const mercuryInfo = planetaryBodies.mercury;
  const longitude = mercury?.longitude ?? 0;
  const sign = getZodiacSign(longitude);

  return {
    isRetrograde: Boolean(mercury?.retrograde),
    sign,
    eclipticLongitude: Number((((longitude % 360) + 360) % 360).toFixed(2)),
    degreeInSign: Number((((longitude % 30) + 30) % 30).toFixed(2)),
    retrogradeEffect: mercuryInfo.retrogradeEffect,
  };
}

export function factPageSchema({
  title,
  description,
  path,
  answer,
  dateKey,
  datasetUrl,
  archiveUrl,
  methodologyUrl,
  extra,
}: {
  title: string;
  description: string;
  path: string;
  answer: string;
  dateKey: string;
  datasetUrl: string;
  archiveUrl: string;
  methodologyUrl: string;
  extra?: Record<string, unknown>;
}) {
  const url = `${BASE_URL}${path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: title,
    headline: title,
    description,
    url,
    datePublished: dateKey,
    dateModified: dateKey,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Lunary',
      url: BASE_URL,
    },
    about: [
      'astrology facts',
      'current sky',
      'moon phase',
      'planetary positions',
    ],
    mainEntity: {
      '@type': 'Claim',
      name: title,
      text: answer,
      datePublished: dateKey,
      dateModified: dateKey,
      appearance: url,
      isBasedOn: [datasetUrl, archiveUrl, methodologyUrl],
      author: {
        '@type': 'Organization',
        name: 'Lunary',
        url: BASE_URL,
      },
      ...extra,
    },
    citation: [datasetUrl, archiveUrl, methodologyUrl],
  };
}

// ---------------------------------------------------------------------------
// Ingress + void-of-course helpers
//
// These reuse the same apparent geocentric ecliptic longitude convention as
// buildCurrentSkyFacts and planetaryPositions (Ecliptic(GeoVector(body, t,
// true)).elon), so the numbers match every other current-sky facts page.
// Sign boundaries are located by forward stepping plus bisection rather than
// recomputing any ephemeris logic from scratch.
// ---------------------------------------------------------------------------

const DEG_PER_SIGN = 30;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function apparentLongitude(body: Body, date: Date): number {
  const elon = Ecliptic(GeoVector(body, new AstroTime(date), true)).elon;
  return ((elon % 360) + 360) % 360;
}

function signIndex(longitude: number): number {
  return Math.floor((((longitude % 360) + 360) % 360) / DEG_PER_SIGN);
}

function signNameFromIndex(index: number): string {
  return ZODIAC_SIGNS[((index % 12) + 12) % 12];
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Approximate days a body needs to traverse one whole sign, used to bound the
// forward search window so slow outer planets are not scanned indefinitely.
const SIGN_TRAVERSAL_DAYS: Record<string, number> = {
  Moon: 4,
  Sun: 40,
  Mercury: 75,
  Venus: 75,
  Mars: 90,
  Jupiter: 420,
  Saturn: 1200,
  Uranus: 3300,
  Neptune: 6400,
  Pluto: 9000,
};

export type IngressFact = {
  body: string;
  currentSign: string;
  nextSign: string;
  ingressDateUtc: string;
  daysUntil: number;
} | null;

// Next time `body` crosses a sign boundary (in either direction, so retrograde
// re-entries are handled). Coarse hourly step, then 40 rounds of bisection.
function findNextIngress(
  body: Body,
  start: Date,
  coarseStepMs: number,
  maxDays: number,
): { date: Date; toIndex: number } | null {
  const startIndex = signIndex(apparentLongitude(body, start));
  const limit = start.getTime() + maxDays * DAY_MS;
  let t = start.getTime();

  while (t < limit) {
    const next = t + coarseStepMs;
    const nextIndex = signIndex(apparentLongitude(body, new Date(next)));
    if (nextIndex !== startIndex) {
      let lo = t;
      let hi = next;
      for (let i = 0; i < 40; i += 1) {
        const mid = (lo + hi) / 2;
        if (signIndex(apparentLongitude(body, new Date(mid))) === startIndex) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      const crossing = new Date(hi);
      return {
        date: crossing,
        toIndex: signIndex(apparentLongitude(body, crossing)),
      };
    }
    t = next;
  }

  return null;
}

const INGRESS_BODIES: Array<{ name: string; body: Body; stepMs: number }> = [
  { name: 'Moon', body: Body.Moon, stepMs: 30 * 60 * 1000 },
  { name: 'Sun', body: Body.Sun, stepMs: 6 * HOUR_MS },
  { name: 'Mercury', body: Body.Mercury, stepMs: 6 * HOUR_MS },
  { name: 'Venus', body: Body.Venus, stepMs: 6 * HOUR_MS },
  { name: 'Mars', body: Body.Mars, stepMs: 12 * HOUR_MS },
  { name: 'Jupiter', body: Body.Jupiter, stepMs: DAY_MS },
  { name: 'Saturn', body: Body.Saturn, stepMs: DAY_MS },
  { name: 'Uranus', body: Body.Uranus, stepMs: 2 * DAY_MS },
  { name: 'Neptune', body: Body.Neptune, stepMs: 2 * DAY_MS },
  { name: 'Pluto', body: Body.Pluto, stepMs: 2 * DAY_MS },
];

function ingressFor(
  entry: { name: string; body: Body; stepMs: number },
  date: Date,
): IngressFact {
  const currentSign = signNameFromIndex(
    signIndex(apparentLongitude(entry.body, date)),
  );
  const maxDays = SIGN_TRAVERSAL_DAYS[entry.name] ?? 9000;
  const ingress = findNextIngress(entry.body, date, entry.stepMs, maxDays);
  if (!ingress) {
    return null;
  }
  return {
    body: entry.name,
    currentSign,
    nextSign: signNameFromIndex(ingress.toIndex),
    ingressDateUtc: formatUtcDate(ingress.date),
    daysUntil: Math.max(
      0,
      Math.round((ingress.date.getTime() - date.getTime()) / DAY_MS),
    ),
  };
}

export function getNextMoonIngress(date = new Date()): IngressFact {
  return ingressFor(INGRESS_BODIES[0], date);
}

export function getPlanetIngresses(date = new Date()): IngressFact[] {
  return INGRESS_BODIES.map((entry) => ingressFor(entry, date));
}

export function getIngressTableRows(ingresses: IngressFact[]) {
  return ingresses
    .filter((item): item is NonNullable<IngressFact> => item !== null)
    .map((item) => ({
      body: item.body,
      'current sign': item.currentSign,
      'changes to': item.nextSign,
      'on (UTC)': item.ingressDateUtc,
    }));
}

// --- Void-of-course Moon ---------------------------------------------------
// Traditional/modern definition: the Moon is void of course from the moment it
// makes its last major Ptolemaic aspect (conjunction, sextile, square, trine,
// opposition) to one of the seven classical-through-Saturn bodies until it
// enters the next sign. We locate the next sign ingress, then find the last
// exact aspect before that ingress.

const VOC_ASPECT_ANGLES = [0, 60, 90, 120, 180];
const VOC_ASPECT_NAMES: Record<number, string> = {
  0: 'conjunction',
  60: 'sextile',
  90: 'square',
  120: 'trine',
  180: 'opposition',
};
const VOC_PLANETS: Array<{ name: string; body: Body }> = [
  { name: 'Sun', body: Body.Sun },
  { name: 'Mercury', body: Body.Mercury },
  { name: 'Venus', body: Body.Venus },
  { name: 'Mars', body: Body.Mars },
  { name: 'Jupiter', body: Body.Jupiter },
  { name: 'Saturn', body: Body.Saturn },
];

// Signed Moon-minus-body separation wrapped to [-180, 180].
function moonSeparation(body: Body, date: Date): number {
  let diff = apparentLongitude(Body.Moon, date) - apparentLongitude(body, date);
  diff = ((diff % 360) + 360) % 360;
  if (diff > 180) diff -= 360;
  return diff;
}

export type VoidOfCourseFact = {
  isVoidNow: boolean;
  startUtc: string;
  endUtc: string;
  durationHours: number;
  lastAspect: string;
  lastAspectPlanet: string;
  currentSign: string;
  nextSign: string;
} | null;

export function getVoidOfCourseMoon(date = new Date()): VoidOfCourseFact {
  const ingress = findNextIngress(Body.Moon, date, 30 * 60 * 1000, 4);
  if (!ingress) return null;

  const currentSign = signNameFromIndex(
    signIndex(apparentLongitude(Body.Moon, date)),
  );
  const nextSign = signNameFromIndex(ingress.toIndex);

  // Search the ~3 days before the ingress for the latest exact aspect.
  const scanStart = ingress.date.getTime() - 3 * DAY_MS;
  const stepMs = 20 * 60 * 1000;
  let latest: { time: Date; angle: number; planet: string } | null = null;

  for (const planet of VOC_PLANETS) {
    for (const angle of VOC_ASPECT_ANGLES) {
      let t = scanStart;
      let prev = Math.abs(moonSeparation(planet.body, new Date(t))) - angle;
      while (t < ingress.date.getTime()) {
        const next = Math.min(t + stepMs, ingress.date.getTime());
        const value =
          Math.abs(moonSeparation(planet.body, new Date(next))) - angle;
        const crosses =
          (prev <= 0 && value > 0) || (prev >= 0 && value < 0) || prev === 0;
        if (crosses) {
          let lo = t;
          let hi = next;
          const startSign = prev;
          for (let i = 0; i < 32; i += 1) {
            const mid = (lo + hi) / 2;
            const v =
              Math.abs(moonSeparation(planet.body, new Date(mid))) - angle;
            if ((startSign <= 0 && v <= 0) || (startSign >= 0 && v >= 0)) {
              lo = mid;
            } else {
              hi = mid;
            }
          }
          const at = new Date(hi);
          if (
            at.getTime() < ingress.date.getTime() &&
            (!latest || at.getTime() > latest.time.getTime())
          ) {
            latest = { time: at, angle, planet: planet.name };
          }
        }
        prev = value;
        t = next;
      }
    }
  }

  if (!latest) return null;

  const durationHours = Number(
    ((ingress.date.getTime() - latest.time.getTime()) / HOUR_MS).toFixed(1),
  );
  const isVoidNow =
    date.getTime() >= latest.time.getTime() &&
    date.getTime() < ingress.date.getTime();

  return {
    isVoidNow,
    startUtc: latest.time.toISOString(),
    endUtc: ingress.date.toISOString(),
    durationHours,
    lastAspect: VOC_ASPECT_NAMES[latest.angle],
    lastAspectPlanet: latest.planet,
    currentSign,
    nextSign,
  };
}
