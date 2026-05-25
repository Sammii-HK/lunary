import { Observer } from 'astronomy-engine';
import { buildCurrentSkyFacts } from './citation-datasets';
import {
  planetaryPositions,
  getZodiacSign,
} from '../../../utils/astrology/astrology';
import { planetaryBodies } from '../../../utils/zodiac/zodiac';

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
