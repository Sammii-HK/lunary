import type { PlanetKey, SignKey } from './types';

export type Dignity = 'domicile' | 'exaltation' | 'detriment' | 'fall';

type DignityTable = Partial<
  Record<PlanetKey, Partial<Record<SignKey, Dignity>>>
>;

const DIGNITIES: DignityTable = {
  sun: {
    leo: 'domicile',
    aries: 'exaltation',
    aquarius: 'detriment',
    libra: 'fall',
  },
  moon: {
    cancer: 'domicile',
    taurus: 'exaltation',
    capricorn: 'detriment',
    scorpio: 'fall',
  },
  mercury: {
    gemini: 'domicile',
    virgo: 'domicile',
    sagittarius: 'detriment',
    pisces: 'detriment',
  },
  venus: {
    taurus: 'domicile',
    libra: 'domicile',
    pisces: 'exaltation',
    aries: 'detriment',
    scorpio: 'detriment',
    virgo: 'fall',
  },
  mars: {
    aries: 'domicile',
    scorpio: 'domicile',
    capricorn: 'exaltation',
    taurus: 'detriment',
    libra: 'detriment',
    cancer: 'fall',
  },
  jupiter: {
    sagittarius: 'domicile',
    pisces: 'domicile',
    cancer: 'exaltation',
    gemini: 'detriment',
    virgo: 'detriment',
    capricorn: 'fall',
  },
  saturn: {
    capricorn: 'domicile',
    aquarius: 'domicile',
    libra: 'exaltation',
    cancer: 'detriment',
    leo: 'detriment',
    aries: 'fall',
  },
  uranus: {
    aquarius: 'domicile',
    leo: 'detriment',
  },
  neptune: {
    pisces: 'domicile',
    virgo: 'detriment',
  },
  pluto: {
    scorpio: 'domicile',
    taurus: 'detriment',
  },
};

export function getDignity(planet: PlanetKey, sign: SignKey): Dignity | null {
  return DIGNITIES[planet]?.[sign] ?? null;
}

export function describeDignity(d: Dignity | null): string {
  switch (d) {
    case 'domicile':
      return 'in its own sign (domicile) — at home, uncompromised, operating at full strength';
    case 'exaltation':
      return 'exalted — amplified, operating with unusual clarity and power';
    case 'detriment':
      return 'in detriment — operating against its natural grain, working harder than usual';
    case 'fall':
      return 'in fall — the placement where this planet finds least traction, often the crucible of growth';
    default:
      return 'in peregrine (no major dignity) — operating in neutral territory';
  }
}
