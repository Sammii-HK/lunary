/**
 * Shared astrology utilities for email generation.
 * Computes planetary positions, house placements, transit aspects,
 * moon phase, and tarot card selection — all without requiring a
 * user location (ecliptic longitude is observer-independent).
 */
import {
  Body,
  GeoVector,
  Ecliptic,
  AstroTime,
  Observer,
  MoonPhase,
} from 'astronomy-engine';
import tarotData from '@/data/tarot-cards.json';
import { calculateTransitAspects } from '@/lib/astrology/transit-aspects';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

const ZODIAC_SIGNS = [
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
];

// Generic observer — ecliptic longitude is essentially observer-independent for planets
const OBSERVER = new Observer(51.5, 0, 0);

const TRANSITING_PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

// Planets worth highlighting in teasers (slow enough to be meaningful week to week)
const TEASER_PLANETS = [
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Mars',
  'Venus',
];

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity and how you show up in the world',
  2: 'money, self-worth, and what you value',
  3: 'communication, learning, and your immediate environment',
  4: 'home, roots, and your inner foundation',
  5: 'creativity, joy, romance, and self-expression',
  6: 'health, daily habits, and work',
  7: 'partnerships, relationships, and how you collaborate',
  8: 'transformation, intimacy, and shared resources',
  9: 'beliefs, travel, and expanding your worldview',
  10: 'career, public reputation, and long-term goals',
  11: 'community, friendships, and future visions',
  12: 'solitude, the subconscious, and what is hidden',
};

// ─── Planetary positions ──────────────────────────────────────────────────

export interface PlanetPosition {
  body: string;
  sign: string;
  eclipticLongitude: number;
  retrograde: boolean;
}

export function getCurrentPlanetPositions(
  date: Date = new Date(),
): PlanetPosition[] {
  const astroTime = new AstroTime(date);
  const astroTimePrev = new AstroTime(new Date(date.getTime() - 86_400_000));

  return TRANSITING_PLANETS.flatMap((name) => {
    try {
      const body = Body[name as keyof typeof Body];
      const vec = GeoVector(body, astroTime, false);
      const vecPrev = GeoVector(body, astroTimePrev, false);
      const lon = ((Ecliptic(vec).elon % 360) + 360) % 360;
      const lonPrev = ((Ecliptic(vecPrev).elon % 360) + 360) % 360;

      let delta = lon - lonPrev;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const signIndex = Math.floor(lon / 30) % 12;
      return [
        {
          body: name,
          sign: ZODIAC_SIGNS[signIndex],
          eclipticLongitude: lon,
          retrograde: delta < 0,
        },
      ];
    } catch {
      return [];
    }
  });
}

/** Convert PlanetPosition[] to BirthChartData[] for calculateTransitAspects */
function positionsToBirthChartData(
  positions: PlanetPosition[],
): BirthChartData[] {
  return positions.map(
    (p) =>
      ({
        body: p.body,
        sign: p.sign,
        eclipticLongitude: p.eclipticLongitude,
      }) as BirthChartData,
  );
}

// ─── Moon phase ───────────────────────────────────────────────────────────

export interface MoonPhaseInfo {
  name: string;
  isNewMoon: boolean;
  isFullMoon: boolean;
}

export function getCurrentMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const angle = MoonPhase(new AstroTime(date));

  let name: string;
  if (angle < 22.5 || angle >= 337.5) name = 'New Moon';
  else if (angle < 67.5) name = 'Waxing Crescent';
  else if (angle < 112.5) name = 'First Quarter';
  else if (angle < 157.5) name = 'Waxing Gibbous';
  else if (angle < 202.5) name = 'Full Moon';
  else if (angle < 247.5) name = 'Waning Gibbous';
  else if (angle < 292.5) name = 'Last Quarter';
  else name = 'Waning Crescent';

  return {
    name,
    isNewMoon: angle < 22.5 || angle >= 337.5,
    isFullMoon: angle >= 157.5 && angle < 202.5,
  };
}

// ─── Tarot card selection ─────────────────────────────────────────────────

export interface WeeklyCard {
  name: string;
  keywords: string[];
  uprightMeaning: string;
}

const MAJOR_ARCANA_KEYS = Object.keys(tarotData.majorArcana);

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Card of the week — same for every free user. Rotates through all 22 cards. */
export function getWeeklyCard(weekNum: number): WeeklyCard {
  const key = MAJOR_ARCANA_KEYS[weekNum % 22];
  const card = tarotData.majorArcana[
    key as keyof typeof tarotData.majorArcana
  ] as WeeklyCard;
  return card;
}

/** Personalised card — different per user, consistent within a week. */
export function getPersonalisedCard(
  weekNum: number,
  userId: string,
): WeeklyCard {
  const index = (weekNum + simpleHash(userId)) % 22;
  const key = MAJOR_ARCANA_KEYS[index];
  const card = tarotData.majorArcana[
    key as keyof typeof tarotData.majorArcana
  ] as WeeklyCard;
  return card;
}

// ─── House placements (teaser for free users) ─────────────────────────────

export interface PlanetHousePlacement {
  body: string;
  sign: string;
  house: number;
  houseMeaning: string;
  retrograde: boolean;
}

function calculateHouse(planetLon: number, ascLon: number): number {
  const ascSign = Math.floor((((ascLon % 360) + 360) % 360) / 30);
  const planetSign = Math.floor((((planetLon % 360) + 360) % 360) / 30);
  return ((planetSign - ascSign + 12) % 12) + 1;
}

/**
 * Returns current planet house placements against the user's Ascendant.
 * Used for the free-user teaser: "Jupiter is moving through your 9th house".
 */
export function getPlanetHousePlacements(
  birthChart: unknown[],
  currentPositions: PlanetPosition[],
): PlanetHousePlacement[] {
  const chart = birthChart as Record<string, unknown>[];
  const ascEntry = chart.find((p) => p?.body === 'Ascendant');
  if (!ascEntry) return [];

  const ascLon = ascEntry.eclipticLongitude as number;

  return currentPositions
    .filter((p) => TEASER_PLANETS.includes(p.body))
    .map((p) => {
      const house = calculateHouse(p.eclipticLongitude, ascLon);
      return {
        body: p.body,
        sign: p.sign,
        house,
        houseMeaning: HOUSE_MEANINGS[house] || 'personal growth',
        retrograde: p.retrograde,
      };
    });
}

// ─── Full transit aspects (Pro users) ────────────────────────────────────

export interface SignificantAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  house: number;
  houseMeaning: string;
  orbDegrees: number;
  transitSign: string;
  natalSign: string;
}

const ASPECT_VERBS: Record<string, string> = {
  conjunction: 'is joining',
  trine: 'is forming a trine to',
  sextile: 'is forming a sextile to',
  square: 'is squaring',
  opposition: 'is opposing',
};

const ASPECT_TONE: Record<string, string> = {
  conjunction: 'This intensifies and merges the energy of both planets.',
  trine: 'This is a supportive, flowing influence.',
  sextile: 'This opens a door — an easier-than-usual energy to work with.',
  square: 'This creates friction that pushes you to act.',
  opposition: 'This calls for balance between two competing pulls.',
};

// Priority weights for sorting aspects (higher = more notable)
const PLANET_WEIGHT: Record<string, number> = {
  Sun: 3,
  Moon: 3,
  Ascendant: 3,
  Venus: 2,
  Mars: 2,
  Mercury: 1,
  Jupiter: 2,
  Saturn: 2,
  Uranus: 1,
  Neptune: 1,
  Pluto: 1,
};

const TRANSIT_WEIGHT: Record<string, number> = {
  Jupiter: 5,
  Saturn: 5,
  Uranus: 4,
  Neptune: 4,
  Pluto: 4,
  Mars: 3,
  Venus: 2,
  Sun: 2,
  Mercury: 1,
  Moon: 1,
};

export function getSignificantTransitAspects(
  birthChart: unknown[],
  currentPositions: PlanetPosition[],
  limit = 2,
): SignificantAspect[] {
  const chart = birthChart as BirthChartData[];
  const transits = positionsToBirthChartData(currentPositions);
  const raw = calculateTransitAspects(chart, transits);

  return raw
    .map((a) => {
      const house = a.house ?? 1;
      return {
        transitPlanet: a.transitPlanet,
        natalPlanet: a.natalPlanet,
        aspectType: a.aspectType,
        house,
        houseMeaning: HOUSE_MEANINGS[house] ?? 'personal growth',
        orbDegrees: a.orbDegrees,
        transitSign: a.transitSign,
        natalSign: a.natalSign,
      };
    })
    .sort((a, b) => {
      const scoreA =
        (TRANSIT_WEIGHT[a.transitPlanet] ?? 1) +
        (PLANET_WEIGHT[a.natalPlanet] ?? 1) -
        a.orbDegrees;
      const scoreB =
        (TRANSIT_WEIGHT[b.transitPlanet] ?? 1) +
        (PLANET_WEIGHT[b.natalPlanet] ?? 1) -
        b.orbDegrees;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/** Human-readable sentence for a full transit aspect (Pro) */
export function formatAspectSentence(aspect: SignificantAspect): string {
  const verb = ASPECT_VERBS[aspect.aspectType] ?? 'is aspecting';
  const tone = ASPECT_TONE[aspect.aspectType] ?? '';
  const retro =
    aspect.transitPlanet !== 'Sun' && aspect.transitPlanet !== 'Moon' ? '' : '';
  return (
    `${aspect.transitPlanet} ${verb} your natal ${aspect.natalPlanet} ` +
    `(house ${aspect.house} — ${aspect.houseMeaning}). ${tone}`.trim()
  );
}

/** Short teaser line for a house placement (free users) */
export function formatHouseTeaser(p: PlanetHousePlacement): string {
  const retro = p.retrograde ? ' (retrograde)' : '';
  return `${p.body}${retro} is moving through your ${ordinal(p.house)} house — ${p.houseMeaning}`;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
