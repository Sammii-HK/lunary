import dayjs from 'dayjs';
import { getAstrologicalChart } from '../astrology/astrology';
import { Observer } from 'astronomy-engine';
import { getMoonPhase } from '../moon/moonPhases';

// Super lightweight crystal index (~7KB)
import crystalIndex from '@/data/crystal-index.json';

type CrystalIndexEntry = {
  n: string; // name
  z: string; // zodiac codes (comma-sep)
  m: string; // moon codes (comma-sep)
  e: string; // element codes (comma-sep)
  p: string; // property codes (comma-sep)
};

const index = crystalIndex as CrystalIndexEntry[];

// Decode mappings
const zodiacDecode: Record<string, string> = {
  AR: 'Aries',
  TA: 'Taurus',
  GE: 'Gemini',
  CA: 'Cancer',
  LE: 'Leo',
  VI: 'Virgo',
  LI: 'Libra',
  SC: 'Scorpio',
  SA: 'Sagittarius',
  CP: 'Capricorn',
  AQ: 'Aquarius',
  PI: 'Pisces',
  '*': 'All Signs',
};

const moonDecode: Record<string, string> = {
  NM: 'New Moon',
  WC: 'Waxing Crescent',
  FQ: 'First Quarter',
  WG: 'Waxing Gibbous',
  FM: 'Full Moon',
  VG: 'Waning Gibbous',
  TQ: 'Third Quarter',
  VC: 'Waning Crescent',
  WX: 'Waxing Moon',
  WN: 'Waning Moon',
  DM: 'Dark Moon',
  '*': 'All Moon Phases',
};

const elementDecode: Record<string, string> = {
  F: 'Fire',
  W: 'Water',
  E: 'Earth',
  A: 'Air',
  S: 'Spirit',
  '*': 'All Elements',
};

const propDecode: Record<string, string> = {
  INT: 'intuition',
  SPG: 'spiritual growth',
  LOV: 'love',
  EMH: 'emotional healing',
  PRO: 'protection',
  GRD: 'grounding',
  CLR: 'clarity',
  ABD: 'abundance',
  MAN: 'manifestation',
  TRN: 'transformation',
  CRG: 'courage',
  CRE: 'creativity',
  WIS: 'wisdom',
  HEA: 'healing',
  COM: 'communication',
  PEA: 'peace',
  BAL: 'balance',
  ENG: 'energy',
  VIT: 'vitality',
  STR: 'strength',
  CAL: 'calming',
  FOC: 'focus',
  LCK: 'luck',
  OPP: 'opportunity',
  TRU: 'truth',
  LOG: 'logic',
  PAS: 'passion',
  CNF: 'confidence',
  PSP: 'prosperity',
  FEM: 'feminine energy',
  MAG: 'magic',
  AMP: 'amplification',
  STB: 'stability',
  PUR: 'purification',
  PAT: 'patience',
  HAR: 'harmony',
  GRO: 'growth',
  INS: 'inspiration',
  PTY: 'purity',
  LDR: 'leadership',
  MCL: 'mental clarity',
  CLS: 'cleansing',
  DRW: 'dream work',
  PSY: 'psychic ability',
  SPC: 'spiritual connection',
  SPV: 'spiritual vision',
  ALN: 'alignment',
  SPA: 'spiritual awakening',
  ANG: 'angelic communication',
  OPT: 'optimism',
  JOY: 'joy',
  HRT: 'heart opening',
  ADP: 'adaptability',
  MED: 'meditation',
  PLC: 'past life connection',
  ILL: 'illumination',
  EMF: 'EMF protection',
  GRF: 'grief healing',
  EMB: 'emotional balance',
  PRP: 'prophecy',
  NAT: 'connection to nature',
  SPP: 'spiritual protection',
};

// Helper to decode comma-separated codes
const decodeList = (codes: string, map: Record<string, string>): string[] =>
  codes.split(',').map((c) => map[c] || c);

export type GeneralCrystalRecommendation = {
  name: string;
  reason: string;
  properties: string[];
  guidance: string;
  moonPhaseAlignment: string;
  alternatives: { name: string; properties: string[] }[];
};

// Get crystal from index
const getCrystalFromIndex = (name: string): CrystalIndexEntry | undefined =>
  index.find((c) => c.n.toLowerCase() === name.toLowerCase());

// Get crystals matching zodiac sign
const getCrystalsByZodiac = (sign: string): string[] => {
  const code = Object.entries(zodiacDecode).find(([, v]) => v === sign)?.[0];
  if (!code) return [];
  return index
    .filter((c) => c.z.includes(code) || c.z.includes('*'))
    .map((c) => c.n);
};

// Get crystals matching moon phase
const getCrystalsByMoonPhase = (phase: string): string[] => {
  const code = Object.entries(moonDecode).find(([, v]) => v === phase)?.[0];
  if (!code) return [];
  return index
    .filter((c) => c.m.includes(code) || c.m.includes('*'))
    .map((c) => c.n);
};

// Get crystals by element
const getCrystalsByElement = (element: string): string[] => {
  const code = Object.entries(elementDecode).find(
    ([, v]) => v === element,
  )?.[0];
  if (!code) return [];
  return index
    .filter((c) => c.e.includes(code) || c.e.includes('*'))
    .map((c) => c.n);
};

const getDominantEnergy = (currentChart: any[]): string => {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };

  currentChart.forEach((planet) => {
    if (/(Aries|Leo|Sagittarius)/.test(planet.sign)) elements.fire++;
    else if (/(Taurus|Virgo|Capricorn)/.test(planet.sign)) elements.earth++;
    else if (/(Gemini|Libra|Aquarius)/.test(planet.sign)) elements.air++;
    else if (/(Cancer|Scorpio|Pisces)/.test(planet.sign)) elements.water++;
  });

  return Object.keys(elements).reduce((a, b) =>
    elements[a as keyof typeof elements] > elements[b as keyof typeof elements]
      ? a
      : b,
  );
};

const getCrystalGuidance = (
  crystal: string,
  moonPhase: string,
  dominantElement: string,
): string => {
  const crystalData = getCrystalFromIndex(crystal);
  const properties = crystalData
    ? decodeList(crystalData.p, propDecode)
    : ['balance', 'harmony'];
  const primaryProperty = properties[0];

  const templates = [
    `Work with ${crystal} today to enhance your ${primaryProperty}. ${getMoonPhaseGuidance(moonPhase, crystal)}.`,
    `${crystal} supports your ${dominantElement} energy today, bringing ${properties.join(' and ')}. ${getMoonPhaseGuidance(moonPhase, crystal)}.`,
    `The cosmic energies favor ${crystal} for ${primaryProperty}. ${getMoonPhaseGuidance(moonPhase, crystal)}.`,
  ];

  return templates[(crystal + moonPhase).length % templates.length];
};

const getMoonPhaseGuidance = (moonPhase: string, crystal: string): string => {
  const guidance: Record<string, string> = {
    'New Moon': `Place ${crystal} under tonight's new moon to set intentions`,
    'Waxing Crescent': `Use ${crystal} to support building energy`,
    'First Quarter': `${crystal} helps push through challenges`,
    'Waxing Gibbous': `Let ${crystal} refine your approach`,
    'Full Moon': `Charge ${crystal} under the full moon's peak energy`,
    'Waning Gibbous': `Work with ${crystal} to integrate lessons`,
    'Third Quarter': `${crystal} supports release and letting go`,
    'Waning Crescent': `Use ${crystal} for rest and reflection`,
  };
  return (
    guidance[moonPhase] || `Work with ${crystal} in harmony with lunar energy`
  );
};

export const getGeneralCrystalRecommendation = (
  date?: Date,
): GeneralCrystalRecommendation => {
  const normalizedDate = date
    ? new Date(dayjs(date).format('YYYY-MM-DD') + 'T12:00:00Z')
    : new Date(dayjs().format('YYYY-MM-DD') + 'T12:00:00Z');

  const today = dayjs(normalizedDate);
  const observer = new Observer(51.4769, 0.0005, 0);
  const currentChart = getAstrologicalChart(today.toDate(), observer);
  const moonPhase = getMoonPhase(today.toDate());
  const dominantElement = getDominantEnergy(currentChart);

  const sun = currentChart.find((p) => p.body === 'Sun');
  const moon = currentChart.find((p) => p.body === 'Moon');

  // Collect matching crystals
  const allCrystals = [
    ...(sun ? getCrystalsByZodiac(sun.sign) : []),
    ...(moon ? getCrystalsByZodiac(moon.sign) : []),
    ...getCrystalsByMoonPhase(moonPhase),
    ...getCrystalsByElement(
      dominantElement.charAt(0).toUpperCase() + dominantElement.slice(1),
    ),
  ];

  // Score by frequency
  const freq = new Map<string, number>();
  allCrystals.forEach((c) => freq.set(c, (freq.get(c) || 0) + 1));

  const sorted = [...new Set(allCrystals)].sort(
    (a, b) => (freq.get(b) || 0) - (freq.get(a) || 0),
  );

  // Select based on day
  const dayOfYear = today.diff(today.startOf('year'), 'day') + 1;
  const cosmicSeed =
    dayOfYear + moonPhase.length + dominantElement.length + sorted.length;
  const selected =
    sorted[sorted.length ? cosmicSeed % sorted.length : 0] || 'Amethyst';

  const nextCrystalCandidates: string[] = [];
  for (let offset = 1; offset < Math.min(sorted.length, 4); offset += 1) {
    const candidate = sorted[(cosmicSeed + offset) % sorted.length];
    if (candidate && candidate !== selected) {
      nextCrystalCandidates.push(candidate);
    }
  }
  const uniqueAlternatives = [...new Set(nextCrystalCandidates)].slice(0, 2);

  const crystalData = getCrystalFromIndex(selected);
  const properties = crystalData
    ? decodeList(crystalData.p, propDecode)
    : ['balance', 'harmony'];

  let reason = `Based on today's cosmic energy`;
  if (sun) reason += ` with Sun in ${sun.sign}`;
  if (moon) reason += ` and Moon in ${moon.sign}`;
  reason += `, ${selected} resonates with ${dominantElement} energy.`;

  return {
    name: selected,
    reason,
    properties,
    guidance: getCrystalGuidance(selected, moonPhase, dominantElement),
    moonPhaseAlignment: getMoonPhaseGuidance(moonPhase, selected),
    alternatives: uniqueAlternatives.map((alternative) => {
      const altData = getCrystalFromIndex(alternative);
      const altProperties = altData
        ? decodeList(altData.p, propDecode)
        : ['balance', 'harmony'];
      return {
        name: alternative,
        properties: altProperties,
      };
    }),
  };
};
