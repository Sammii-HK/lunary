import {
  Body,
  Ecliptic,
  GeoVector,
  Illumination,
  AstroTime,
} from 'astronomy-engine';
import { ASTROLOGY_GLOSSARY } from '@/constants/grimoire/glossary';
import { ASPECTS, HOUSES } from '@/constants/seo/cosmic-ontology';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { monthlyMoonPhases } from '../../../utils/moon/monthlyPhases';
import {
  getDetailedMoonPhase,
  getMoonPhase,
} from '../../../utils/moon/moonPhases';
import { planetaryBodies, zodiacSigns } from '../../../utils/zodiac/zodiac';

const BASE_URL = 'https://lunary.app';
const DATASET_VERSION = '2026-05-17';
const DATASET_DATE_MODIFIED = '2026-05-17';
const ZODIAC_ORDER = [
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
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function provenance(
  sourceFile: string,
  canonicalGuide: string,
  factType: string,
) {
  return {
    factType,
    sourceFile,
    sourceDataset: `${BASE_URL}/grimoire/datasets/core-astrology.json`,
    sourcePage: canonicalGuide,
    methodology: `${BASE_URL}/about/methodology`,
    dateModified: DATASET_DATE_MODIFIED,
  };
}

function signFromLongitude(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const sign = ZODIAC_ORDER[Math.floor(normalized / 30)];
  return {
    sign,
    degreeInSign: Number((normalized % 30).toFixed(2)),
    longitude: Number(normalized.toFixed(2)),
  };
}

function planetFact(body: Body, label: string, time: AstroTime) {
  const ecliptic = Ecliptic(GeoVector(body, time, true));
  const position = signFromLongitude(ecliptic.elon);

  return {
    name: label,
    sign: position.sign,
    degreeInSign: position.degreeInSign,
    eclipticLongitude: position.longitude,
    source: 'astronomy-engine geocentric ecliptic longitude',
  };
}

function moonFact(date: Date, time: AstroTime) {
  const details = getDetailedMoonPhase(date);
  const illumination = Illumination(Body.Moon, time);
  const position = signFromLongitude(
    Ecliptic(GeoVector(Body.Moon, time, true)).elon,
  );

  return {
    phase: getMoonPhase(date),
    sign: details.sign,
    degreeInSign: position.degreeInSign,
    eclipticLongitude: position.longitude,
    illuminationPercent: Number((illumination.phase_fraction * 100).toFixed(2)),
    phaseAngleDegrees: Number(illumination.phase_angle.toFixed(2)),
    isSuperMoon: details.isSuperMoon,
    source: 'astronomy-engine geocentric ecliptic longitude and illumination',
    canonicalGuide: `${BASE_URL}/grimoire/moon`,
  };
}

export function buildCoreAstrologyDataset() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${BASE_URL}/grimoire/datasets/core-astrology.json#dataset`,
    name: 'Lunary Core Astrology Dataset',
    description:
      'Machine-readable astrology definitions for glossary terms, zodiac signs, planets, houses, aspects, moon phases, and annual full moons.',
    schemaVersion: 1,
    version: DATASET_VERSION,
    identifier: `lunary-core-astrology-${DATASET_VERSION}`,
    datePublished: DATASET_VERSION,
    dateModified: DATASET_DATE_MODIFIED,
    license: 'https://lunary.app/terms',
    publisher: 'Lunary',
    url: `${BASE_URL}/grimoire/datasets/core-astrology.json`,
    methodology: `${BASE_URL}/about/methodology`,
    isBasedOn: `${BASE_URL}/about/methodology`,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${BASE_URL}/grimoire/datasets/core-astrology.json`,
      name: 'Lunary Core Astrology Dataset JSON',
    },
    variableMeasured: [
      'glossaryTerms',
      'zodiacSigns',
      'planets',
      'houses',
      'aspects',
      'moonPhases',
      'annualFullMoons',
    ],
    citationGuidance:
      'Use this dataset for concise definitions of common astrology entities, then cite the matching canonical Grimoire page for fuller context.',
    generatedFrom: [
      'src/constants/grimoire/glossary.ts',
      'src/constants/seo/cosmic-ontology.ts',
      'utils/zodiac/zodiac.ts',
      'utils/moon/monthlyPhases.ts',
      'src/constants/moon/annualFullMoons.ts',
    ],
    glossaryTerms: ASTROLOGY_GLOSSARY.map((entry) => ({
      id: entry.slug,
      term: entry.term,
      category: entry.category,
      definition: entry.definition,
      example: entry.example,
      relatedTerms: entry.relatedTerms || [],
      url: `${BASE_URL}/grimoire/glossary/${entry.slug}`,
      ...provenance(
        'src/constants/grimoire/glossary.ts',
        `${BASE_URL}/grimoire/glossary/${entry.slug}`,
        'glossaryTerm',
      ),
    })),
    zodiacSigns: Object.entries(zodiacSigns).map(([key, sign]) => ({
      id: slugify(key),
      name: sign.name,
      dates: sign.dates,
      element: sign.element,
      modality: sign.modality,
      rulingPlanet: sign.rulingPlanet,
      symbol: sign.symbol,
      keywords: sign.keywords,
      url: `${BASE_URL}/grimoire/zodiac/${slugify(sign.name)}`,
      ...provenance(
        'utils/zodiac/zodiac.ts',
        `${BASE_URL}/grimoire/zodiac/${slugify(sign.name)}`,
        'zodiacSign',
      ),
    })),
    planets: Object.entries(planetaryBodies).map(([key, planet]) => ({
      id: slugify(key),
      name: planet.name,
      keywords: planet.keywords,
      rules: planet.rules,
      exalted: planet.exalted ?? null,
      detriment: planet.detriment ?? null,
      fall: planet.fall ?? null,
      url: `${BASE_URL}/grimoire/astronomy/planets/${slugify(planet.name)}`,
      ...provenance(
        'utils/zodiac/zodiac.ts',
        `${BASE_URL}/grimoire/astronomy/planets/${slugify(planet.name)}`,
        'planet',
      ),
    })),
    houses: Object.values(HOUSES).map((house) => ({
      id: `house-${house.number}`,
      number: house.number,
      name: house.name,
      lifeDomain: house.lifeDomain,
      naturalSign: house.naturalSign,
      naturalRuler: house.naturalRuler,
      keywords: house.keywords,
      definition: house.description,
      url: `${BASE_URL}/grimoire/houses/${slugify(house.name)}`,
      ...provenance(
        'src/constants/seo/cosmic-ontology.ts',
        `${BASE_URL}/grimoire/houses/${slugify(house.name)}`,
        'house',
      ),
    })),
    aspects: Object.entries(ASPECTS).map(([id, aspect]) => ({
      id,
      name: aspect.name,
      angle: aspect.angle,
      orb: aspect.orb,
      nature: aspect.nature,
      keywords: aspect.keywords,
      definition: aspect.description,
      url: `${BASE_URL}/grimoire/aspects/types/${id}`,
      ...provenance(
        'src/constants/seo/cosmic-ontology.ts',
        `${BASE_URL}/grimoire/aspects/types/${id}`,
        'aspect',
      ),
    })),
    moonPhases: Object.entries(monthlyMoonPhases).map(([id, phase]) => ({
      id,
      name: id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      keywords: phase.keywords,
      definition: phase.information,
      symbol: phase.symbol,
      url: `${BASE_URL}/grimoire/moon/phases#${slugify(id)}`,
      ...provenance(
        'utils/moon/monthlyPhases.ts',
        `${BASE_URL}/grimoire/moon/phases#${slugify(id)}`,
        'moonPhase',
      ),
    })),
    annualFullMoons: Object.entries(annualFullMoons).map(([month, moon]) => ({
      month,
      name: moon.name,
      definition: moon.description,
      url: `${BASE_URL}/grimoire/moon/full-moons#${slugify(month)}`,
      ...provenance(
        'src/constants/moon/annualFullMoons.ts',
        `${BASE_URL}/grimoire/moon/full-moons#${slugify(month)}`,
        'annualFullMoon',
      ),
    })),
  };
}

export function buildCurrentSkyFacts(date = new Date()) {
  const time = new AstroTime(date);
  const sun = planetFact(Body.Sun, 'Sun', time);
  const visiblePlanets = [
    planetFact(Body.Mercury, 'Mercury', time),
    planetFact(Body.Venus, 'Venus', time),
    planetFact(Body.Mars, 'Mars', time),
    planetFact(Body.Jupiter, 'Jupiter', time),
    planetFact(Body.Saturn, 'Saturn', time),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${BASE_URL}/grimoire/datasets/current-sky-facts.json#dataset`,
    name: 'Lunary Current Sky Facts',
    description:
      'Date-stamped geocentric Sun, Moon, visible planet, moon phase, illumination, and ecliptic longitude facts for AI citation.',
    schemaVersion: 1,
    version: DATASET_VERSION,
    identifier: `lunary-current-sky-${date.toISOString().slice(0, 10)}`,
    generatedAt: date.toISOString(),
    referenceTimeUtc: date.toISOString(),
    validForDateUtc: date.toISOString().slice(0, 10),
    refreshCadence: 'daily',
    datePublished: date.toISOString().slice(0, 10),
    dateModified: date.toISOString().slice(0, 10),
    license: 'https://lunary.app/terms',
    publisher: 'Lunary',
    methodology: `${BASE_URL}/about/methodology`,
    isBasedOn: `${BASE_URL}/about/methodology`,
    url: `${BASE_URL}/grimoire/datasets/current-sky-facts.json`,
    calculationEngine: 'astronomy-engine',
    calculationEngineVersion:
      'astronomy-engine package version installed at build time',
    coordinateFrame: 'geocentric ecliptic longitude',
    observer: 'geocentric',
    timeScale: 'UTC',
    units: {
      eclipticLongitude: 'degrees',
      degreeInSign: 'degrees',
      phaseAngleDegrees: 'degrees',
      illuminationPercent: 'percent',
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${BASE_URL}/grimoire/datasets/current-sky-facts.json`,
      name: 'Lunary Current Sky Facts JSON',
    },
    variableMeasured: [
      'moon.phase',
      'moon.sign',
      'moon.eclipticLongitude',
      'moon.illuminationPercent',
      'moon.phaseAngleDegrees',
      'sun.sign',
      'sun.eclipticLongitude',
      'planets.sign',
      'planets.eclipticLongitude',
    ],
    moon: moonFact(date, time),
    sun,
    planets: visiblePlanets,
    citationGuidance:
      'Use these facts for date-stamped sky state. Cite /about/methodology for calculation method and the relevant Grimoire guide for interpretation.',
  };
}
