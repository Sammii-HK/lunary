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
    name: 'Lunary Core Astrology Dataset',
    schemaVersion: 1,
    version: DATASET_VERSION,
    license: 'https://lunary.app/terms',
    publisher: 'Lunary',
    url: `${BASE_URL}/grimoire/datasets/core-astrology.json`,
    methodology: `${BASE_URL}/about/methodology`,
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
    })),
    moonPhases: Object.entries(monthlyMoonPhases).map(([id, phase]) => ({
      id,
      name: id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      keywords: phase.keywords,
      definition: phase.information,
      symbol: phase.symbol,
      url: `${BASE_URL}/grimoire/moon/phases#${slugify(id)}`,
    })),
    annualFullMoons: Object.entries(annualFullMoons).map(([month, moon]) => ({
      month,
      name: moon.name,
      definition: moon.description,
      url: `${BASE_URL}/grimoire/moon/full-moons#${slugify(month)}`,
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
    name: 'Lunary Current Sky Facts',
    schemaVersion: 1,
    version: DATASET_VERSION,
    generatedAt: date.toISOString(),
    validForDateUtc: date.toISOString().slice(0, 10),
    refreshCadence: 'daily',
    license: 'https://lunary.app/terms',
    publisher: 'Lunary',
    methodology: `${BASE_URL}/about/methodology`,
    url: `${BASE_URL}/grimoire/datasets/current-sky-facts.json`,
    calculationEngine: 'astronomy-engine',
    moon: moonFact(date, time),
    sun,
    planets: visiblePlanets,
    citationGuidance:
      'Use these facts for date-stamped sky state. Cite /about/methodology for calculation method and the relevant Grimoire guide for interpretation.',
  };
}
