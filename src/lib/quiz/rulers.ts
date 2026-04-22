import type { PlanetKey, SignKey } from './types';

const MODERN_RULERS: Record<SignKey, PlanetKey> = {
  aries: 'mars',
  taurus: 'venus',
  gemini: 'mercury',
  cancer: 'moon',
  leo: 'sun',
  virgo: 'mercury',
  libra: 'venus',
  scorpio: 'pluto',
  sagittarius: 'jupiter',
  capricorn: 'saturn',
  aquarius: 'uranus',
  pisces: 'neptune',
};

const TRADITIONAL_RULERS: Record<SignKey, PlanetKey> = {
  aries: 'mars',
  taurus: 'venus',
  gemini: 'mercury',
  cancer: 'moon',
  leo: 'sun',
  virgo: 'mercury',
  libra: 'venus',
  scorpio: 'mars',
  sagittarius: 'jupiter',
  capricorn: 'saturn',
  aquarius: 'saturn',
  pisces: 'jupiter',
};

export type RulershipSystem = 'modern' | 'traditional';

export function getRulingPlanet(
  sign: SignKey,
  system: RulershipSystem = 'modern',
): PlanetKey {
  return system === 'traditional'
    ? TRADITIONAL_RULERS[sign]
    : MODERN_RULERS[sign];
}

const VALID_SIGNS: SignKey[] = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

export function normalizeSign(sign: string): SignKey | null {
  const lower = sign.trim().toLowerCase();
  return (VALID_SIGNS as string[]).includes(lower) ? (lower as SignKey) : null;
}
