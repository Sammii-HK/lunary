/**
 * Grimoire Data Accessor
 *
 * Centralized access to ALL grimoire data sources.
 * This module consolidates access to ensure we use existing data instead of AI hallucination.
 */

import { crystalDatabase } from '@/constants/grimoire/crystals';
import { spells } from '@/constants/spells';
import { runesList, type Rune } from '@/constants/runes';
import { chakras } from '@/constants/chakras';
import { wheelOfTheYearSabbats, type Sabbat } from '@/constants/sabbats';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import {
  astrologicalHouses,
  astrologicalAspects,
  retrogradeInfo,
  eclipseInfo,
} from '@/constants/grimoire/seo-data';
import {
  angelNumbers,
  lifePathNumbers,
} from '@/constants/grimoire/numerology-data';
import {
  karmicDebtNumbers,
  expressionNumbers,
  soulUrgeNumbers,
} from '@/constants/grimoire/numerology-extended-data';
import {
  mirrorHours,
  doubleHours,
} from '@/constants/grimoire/clock-numbers-data';

// Import JSON data
import zodiacSignsData from '@/data/zodiac-signs.json';
import planetaryBodiesData from '@/data/planetary-bodies.json';
import tarotCardsData from '@/data/tarot-cards.json';

/**
 * Get aspect meaning from grimoire
 */
export function getAspectMeaning(aspectType: string): {
  name: string;
  symbol: string;
  nature: 'harmonious' | 'challenging' | 'neutral';
  description: string;
  meaning: string;
  keywords: string[];
  examples: string[];
} | null {
  const aspectKey = aspectType.toLowerCase().replace(/-/g, '');
  const aspect = (astrologicalAspects as any)[aspectKey];

  if (!aspect) return null;

  return aspect;
}

/**
 * Get retrograde guidance from grimoire
 */
export function getRetrogradeGuidance(planet: string): {
  name: string;
  frequency: string;
  duration: string;
  description: string;
  effects: string[];
  whatToDo: string[];
  whatToAvoid: string[];
  keywords: string[];
} | null {
  const planetKey = planet.toLowerCase();
  const retrograde = (retrogradeInfo as any)[planetKey];

  if (!retrograde) return null;

  return retrograde;
}

/**
 * Get eclipse information from grimoire
 */
export function getEclipseInfo(type: 'solar' | 'lunar'): {
  name: string;
  description: string;
  meaning: string;
  keywords: string[];
  whatToDo: string[];
  rituals: string[];
} | null {
  const eclipse = (eclipseInfo as any)[type];

  if (!eclipse) return null;

  return eclipse;
}

/**
 * Get the sabbat currently active (within ±7 days of its date), or null.
 */
export function getCurrentSabbat(date: Date = new Date()): Sabbat | null {
  const year = date.getFullYear();
  const WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  for (const sabbat of wheelOfTheYearSabbats) {
    for (const y of [year - 1, year, year + 1]) {
      const d = parseSabbatDate(sabbat.date, y);
      if (!d) continue;
      if (Math.abs(d.getTime() - date.getTime()) <= WINDOW_MS) {
        return sabbat;
      }
    }
  }

  return null;
}

/**
 * Get sabbat by name
 */
export function getSabbat(name: string): Sabbat | null {
  return (
    wheelOfTheYearSabbats.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    ) || null
  );
}

/**
 * Parse a sabbat date string like "October 31st" into a Date for the given year.
 */
function parseSabbatDate(dateStr: string, year: number): Date | null {
  const MONTHS: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };
  const match = dateStr.match(/^(\w+)\s+(\d+)/);
  if (!match) return null;
  const month = MONTHS[match[1]];
  const day = parseInt(match[2], 10);
  if (month == null || isNaN(day)) return null;
  return new Date(year, month, day);
}

/**
 * Get the next upcoming sabbat after the given date.
 */
export function getUpcomingSabbat(date: Date = new Date()): Sabbat | null {
  const year = date.getFullYear();

  // Build a list of (sabbat, Date) pairs for this year and next,
  // then find the first one strictly after `date`.
  const candidates: Array<{ sabbat: Sabbat; d: Date }> = [];
  for (const sabbat of wheelOfTheYearSabbats) {
    for (const y of [year, year + 1]) {
      const d = parseSabbatDate(sabbat.date, y);
      if (d) candidates.push({ sabbat, d });
    }
  }

  candidates.sort((a, b) => a.d.getTime() - b.d.getTime());

  const found = candidates.find((c) => c.d > date);
  return found?.sabbat ?? null;
}

/**
 * Get tarot card by name
 */
export function getTarotCard(name: string): any {
  const data = tarotCardsData as any;

  // Search major arcana
  for (const [key, card] of Object.entries(data.majorArcana || {})) {
    if ((card as any).name.toLowerCase() === name.toLowerCase()) {
      return card;
    }
  }

  // Search minor arcana
  for (const suit of Object.values(data.minorArcana || {})) {
    for (const card of Object.values(suit as any)) {
      if ((card as any).name.toLowerCase() === name.toLowerCase()) {
        return card;
      }
    }
  }

  return null;
}

/**
 * Get tarot cards by planetary correspondence
 */
export function getTarotCardsByPlanet(planet: string): any[] {
  const cards: any[] = [];
  const data = tarotCardsData as any;

  // Search major arcana
  for (const card of Object.values(data.majorArcana || {})) {
    if ((card as any).planet?.toLowerCase() === planet.toLowerCase()) {
      cards.push(card);
    }
  }

  return cards;
}

/**
 * Get tarot cards by zodiac sign
 */
export function getTarotCardsByZodiac(sign: string): any[] {
  const cards: any[] = [];
  const data = tarotCardsData as any;

  // Search major arcana
  for (const card of Object.values(data.majorArcana || {})) {
    if ((card as any).zodiacSign?.toLowerCase() === sign.toLowerCase()) {
      cards.push(card);
    }
  }

  return cards;
}

/**
 * Get rune by name
 */
export function getRune(name: string): Rune | null {
  return runesList[name.toLowerCase()] || null;
}

/**
 * Get runes by element
 */
export function getRunesByElement(element: string): Rune[] {
  return Object.values(runesList).filter(
    (rune) => rune.element.toLowerCase() === element.toLowerCase(),
  );
}

/**
 * Get angel number meaning
 */
export function getAngelNumberMeaning(number: string): any {
  return (angelNumbers as any)[number] || null;
}

/**
 * Get life path number meaning
 */
export function getLifePathMeaning(number: number): any {
  return (lifePathNumbers as any)[number] || null;
}

/**
 * Get karmic debt number meaning
 */
export function getKarmicDebtMeaning(number: number): any {
  return (karmicDebtNumbers as any)[number.toString()] || null;
}

/**
 * Get mirror hour meaning
 */
export function getMirrorHourMeaning(time: string): any {
  return (mirrorHours as any)[time] || null;
}

/**
 * Get double hour meaning
 */
export function getDoubleHourMeaning(time: string): any {
  return (doubleHours as any)[time] || null;
}

/**
 * Get element correspondences
 */
export function getElementCorrespondences(element: string): any {
  return (correspondencesData.elements as any)[element] || null;
}

/**
 * Get color correspondences
 */
export function getColorCorrespondences(color: string): any {
  return (correspondencesData.colors as any)[color] || null;
}

/**
 * Get day correspondences
 */
export function getDayCorrespondences(day: string): any {
  return (correspondencesData.days as any)[day] || null;
}

/**
 * Get current planetary day
 */
export function getCurrentPlanetaryDay(date: Date = new Date()): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
}

/**
 * Get planetary day correspondences
 */
export function getPlanetaryDayCorrespondences(date: Date = new Date()): any {
  const day = getCurrentPlanetaryDay(date);
  return getDayCorrespondences(day);
}

/**
 * Get herb correspondences
 */
export function getHerbCorrespondences(herb: string): any {
  return (correspondencesData.herbs as any)[herb] || null;
}

/**
 * Get flower correspondences
 */
export function getFlowerCorrespondences(flower: string): any {
  return (correspondencesData.flowers as any)[flower] || null;
}

/**
 * Get animal correspondences
 */
export function getAnimalCorrespondences(animal: string): any {
  return (correspondencesData.animals as any)[animal] || null;
}

/**
 * Get wood correspondences
 */
export function getWoodCorrespondences(wood: string): any {
  return (correspondencesData.wood as any)[wood] || null;
}

/**
 * Get deity information
 */
export function getDeity(pantheon: string, deityName: string): any {
  const pantheonData = (correspondencesData.deities as any)[pantheon];
  if (!pantheonData) return null;

  return pantheonData[deityName] || null;
}

/**
 * Get zodiac sign data
 */
export function getZodiacSign(sign: string): any {
  return (zodiacSignsData as any)[sign.toLowerCase()] || null;
}

/**
 * Get planetary body data
 */
export function getPlanetaryBody(planet: string): any {
  return (planetaryBodiesData as any)[planet.toLowerCase()] || null;
}

/**
 * Get house meaning
 */
export function getHouseMeaning(houseNumber: number): any {
  const houseKeys = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth',
    'eleventh',
    'twelfth',
  ];

  if (houseNumber < 1 || houseNumber > 12) return null;

  const houseKey = houseKeys[houseNumber - 1];
  return (astrologicalHouses as any)[houseKey] || null;
}

/**
 * Get chakra information
 */
export function getChakra(chakraName: string): any {
  return (chakras as any)[chakraName.toLowerCase()] || null;
}

/**
 * Export all for convenience
 */
export const grimoireData = {
  // Astrology
  aspects: astrologicalAspects,
  retrogrades: retrogradeInfo,
  eclipses: eclipseInfo,
  houses: astrologicalHouses,
  zodiacSigns: zodiacSignsData,
  planets: planetaryBodiesData,

  // Divination
  tarot: tarotCardsData,
  runes: runesList,

  // Numerology
  angelNumbers,
  lifePathNumbers,
  karmicDebt: karmicDebtNumbers,
  expressionNumbers,
  soulUrgeNumbers,
  mirrorHours,
  doubleHours,

  // Correspondences
  elements: correspondencesData.elements,
  colors: correspondencesData.colors,
  days: correspondencesData.days,
  deities: correspondencesData.deities,
  herbs: correspondencesData.herbs,
  flowers: correspondencesData.flowers,
  animals: correspondencesData.animals,
  wood: correspondencesData.wood,
  numbers: correspondencesData.numbers,

  // Practices
  crystals: crystalDatabase,
  spells,
  sabbats: wheelOfTheYearSabbats,
  chakras,
};
