#!/usr/bin/env tsx

/**
 * Generate CTA examples using real transit calculations
 * Run this script monthly when the Sun changes signs (~20th of each month)
 *
 * Usage: npm run generate-cta-examples
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  getReferenceChart,
  getReferenceChartWithHouses,
  formatFullPosition,
  REFERENCE_PROFILE,
} from './lib/reference-chart';
import { generateBirthChart } from '../utils/astrology/birthChart';
import { calculateTransitHouses } from '../src/lib/ai/transit-houses';
import type { BirthChartSnapshot } from '../src/lib/ai/types';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CTAExample {
  type: string;
  text: string;
  interpretation: string;
}

interface MarketingPersona {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
}

interface MarketingMoonPhase {
  phase: string;
  sign: string;
  daysUntilNext: number;
  nextPhase: string;
  element: string;
  rulingPlanet: string;
  modality: string;
  spell: string;
}

interface MarketingTarotCard {
  name: string;
  keywords: string;
}

interface MarketingCrystal {
  name: string;
  meaning: string;
}

interface MarketingTransit {
  planet: string;
  aspect: string;
  aspectSymbol: string;
  natalPlanet: string;
  house: number;
  meaning: string;
}

interface MarketingData {
  persona: MarketingPersona;
  moonPhase: MarketingMoonPhase;
  tarotCard: MarketingTarotCard;
  crystal: MarketingCrystal;
  todayTheme: string;
  todayTransit: MarketingTransit;
}

interface CTAExamplesOutput {
  generatedAt: string;
  generatedForDate: string;
  reference: {
    birthDate: string;
    birthTime: string;
    birthLocation: string;
  };
  horoscopes: {
    examples: CTAExample[];
  };
  planets: {
    examples: CTAExample[];
  };
  houses: {
    examples: CTAExample[];
  };
  transits: {
    examples: CTAExample[];
  };
  moon: {
    examples: CTAExample[];
  };
  aspects: {
    examples: CTAExample[];
  };
  marketing: MarketingData;
}

/**
 * Calculate aspect between two positions (in degrees 0-360)
 */
function calculateAspect(
  pos1: number,
  pos2: number,
): {
  type: string | null;
  orb: number;
} {
  let diff = Math.abs(pos1 - pos2);
  if (diff > 180) diff = 360 - diff;

  const aspects = [
    { name: 'conjunction', angle: 0, orb: 8 },
    { name: 'opposition', angle: 180, orb: 8 },
    { name: 'trine', angle: 120, orb: 6 },
    { name: 'square', angle: 90, orb: 6 },
    { name: 'sextile', angle: 60, orb: 5 },
  ];

  for (const aspect of aspects) {
    const orbDiff = Math.abs(diff - aspect.angle);
    if (orbDiff <= aspect.orb) {
      return { type: aspect.name, orb: orbDiff };
    }
  }

  return { type: null, orb: 0 };
}

/**
 * Get aspect symbol
 */
function getAspectSymbol(aspectType: string): string {
  const symbols: Record<string, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
  };
  return symbols[aspectType] || '';
}

/**
 * Get aspect interpretation
 */
function getAspectInterpretation(
  aspectType: string,
  transitPlanet: string,
  natalPlanet: string,
): string {
  const interpretations: Record<string, Record<string, string>> = {
    conjunction: {
      default: 'merging energies, new beginnings',
      Moon: 'emotional intensity and activation',
      Mercury: 'mental focus and communication emphasis',
      Venus: 'harmony and values alignment',
      Mars: 'dynamic action and initiative',
    },
    opposition: {
      default: 'tension seeking balance',
      Moon: 'emotional awareness through contrast',
      Mercury: 'perspective from different viewpoints',
      Venus: 'relationship dynamics highlighted',
      Mars: 'productive tension driving action',
    },
    square: {
      default: 'friction creating growth',
      Moon: 'emotional challenge prompting change',
      Mercury: 'mental obstacles requiring solutions',
      Venus: 'value conflicts needing resolution',
      Mars: 'energetic push toward breakthrough',
    },
    trine: {
      default: 'flowing ease and harmony',
      Moon: 'emotional comfort and support',
      Mercury: 'clear communication and understanding',
      Venus: 'natural grace and attraction',
      Mars: 'effortless action and confidence',
    },
    sextile: {
      default: 'opportunity for connection',
      Moon: 'emotional opportunities arising',
      Mercury: 'ideas and connections emerging',
      Venus: 'social and creative openings',
      Mars: 'motivated action available',
    },
  };

  const typeInterpretations =
    interpretations[aspectType] || interpretations.conjunction;
  return typeInterpretations[transitPlanet] || typeInterpretations.default;
}

/**
 * Get house meaning
 */
function getHouseMeaning(house: number): string {
  const meanings: Record<number, string> = {
    1: 'identity, appearance, new beginnings',
    2: 'resources, values, self-worth',
    3: 'communication, learning, siblings',
    4: 'home, family, emotional foundation',
    5: 'creativity, romance, self-expression',
    6: 'health, work, daily routines',
    7: 'partnerships, relationships, balance',
    8: 'transformation, shared resources, intimacy',
    9: 'philosophy, travel, higher learning',
    10: 'career, public life, legacy',
    11: 'community, friendships, aspirations',
    12: 'spirituality, unconscious, retreat',
  };
  return meanings[house] || 'life area activation';
}

/**
 * Calculate Personal Day number (numerology)
 */
function calculatePersonalDay(
  birthDate: string,
  currentDate: dayjs.Dayjs,
): number {
  // Parse birth date
  const [year, month, day] = birthDate.split('-').map(Number);

  // Calculate birth path number
  const birthDay = day;
  const birthMonth = month;

  // Calculate current date numbers
  const currentDay = currentDate.date();
  const currentMonth = currentDate.month() + 1; // dayjs months are 0-indexed
  const currentYear = currentDate.year();

  // Sum all digits
  function reduceToSingleDigit(num: number): number {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num
        .toString()
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  }

  const birthDayReduced = reduceToSingleDigit(birthDay);
  const birthMonthReduced = reduceToSingleDigit(birthMonth);
  const currentDayReduced = reduceToSingleDigit(currentDay);
  const currentMonthReduced = reduceToSingleDigit(currentMonth);
  const currentYearReduced = reduceToSingleDigit(currentYear);

  const personalDay = reduceToSingleDigit(
    birthDayReduced +
      birthMonthReduced +
      currentDayReduced +
      currentMonthReduced +
      currentYearReduced,
  );

  return personalDay;
}

/**
 * Get Personal Day interpretation
 */
function getPersonalDayInterpretation(day: number): string {
  const interpretations: Record<number, string> = {
    1: 'new beginnings, leadership, independence',
    2: 'cooperation, balance, sensitivity',
    3: 'creativity, expression, joy',
    4: 'stability, grounding, practical focus',
    5: 'change, freedom, adventure',
    6: 'responsibility, nurturing, harmony',
    7: 'introspection, analysis, spirituality',
    8: 'power, success, material focus',
    9: 'completion, wisdom, humanitarianism',
    11: 'intuition, inspiration, spiritual insight',
    22: 'master builder, practical idealism',
    33: 'master teacher, compassionate service',
  };
  return interpretations[day] || 'personal rhythm';
}

/**
 * Get zodiac sign properties
 */
function getZodiacProperties(sign: string): {
  element: string;
  rulingPlanet: string;
  modality: string;
} {
  const properties: Record<
    string,
    { element: string; rulingPlanet: string; modality: string }
  > = {
    Aries: { element: 'Fire', rulingPlanet: 'Mars', modality: 'Cardinal' },
    Taurus: { element: 'Earth', rulingPlanet: 'Venus', modality: 'Fixed' },
    Gemini: { element: 'Air', rulingPlanet: 'Mercury', modality: 'Mutable' },
    Cancer: { element: 'Water', rulingPlanet: 'Moon', modality: 'Cardinal' },
    Leo: { element: 'Fire', rulingPlanet: 'Sun', modality: 'Fixed' },
    Virgo: { element: 'Earth', rulingPlanet: 'Mercury', modality: 'Mutable' },
    Libra: { element: 'Air', rulingPlanet: 'Venus', modality: 'Cardinal' },
    Scorpio: { element: 'Water', rulingPlanet: 'Pluto', modality: 'Fixed' },
    Sagittarius: {
      element: 'Fire',
      rulingPlanet: 'Jupiter',
      modality: 'Mutable',
    },
    Capricorn: {
      element: 'Earth',
      rulingPlanet: 'Saturn',
      modality: 'Cardinal',
    },
    Aquarius: { element: 'Air', rulingPlanet: 'Uranus', modality: 'Fixed' },
    Pisces: { element: 'Water', rulingPlanet: 'Neptune', modality: 'Mutable' },
  };
  return (
    properties[sign] || {
      element: 'Unknown',
      rulingPlanet: 'Unknown',
      modality: 'Unknown',
    }
  );
}

/**
 * Calculate days until next moon phase
 */
function calculateDaysUntilNextPhase(
  moonLongitude: number,
  sunLongitude: number,
): number {
  let diff = moonLongitude - sunLongitude;
  if (diff < 0) diff += 360;

  const phaseBoundaries = [45, 90, 135, 180, 225, 270, 315, 360];
  let degreesUntilNext = 0;

  for (const boundary of phaseBoundaries) {
    if (diff < boundary) {
      degreesUntilNext = boundary - diff;
      break;
    }
  }

  const synodicMotion = 12.2;
  return Math.round(degreesUntilNext / synodicMotion);
}

/**
 * Get next moon phase name
 */
function getNextPhaseName(currentPhase: string): string {
  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  const currentIndex = phases.indexOf(currentPhase);
  return phases[(currentIndex + 1) % phases.length];
}

/**
 * Get spell suggestion for moon phase
 */
function getSpellForPhase(phase: string): string {
  const spells: Record<string, string> = {
    'New Moon': 'Intention Setting Ritual',
    'Waxing Crescent': 'Growth Manifestation Spell',
    'First Quarter': 'Decision Clarity Ritual',
    'Waxing Gibbous': 'Refinement & Preparation Spell',
    'Full Moon': 'Gratitude & Release Ceremony',
    'Waning Gibbous': 'Wisdom Sharing Ritual',
    'Last Quarter': 'Release & Letting Go Spell',
    'Waning Crescent': 'Rest & Integration Meditation',
  };
  return spells[phase] || 'Moon Phase Ritual';
}

/**
 * Determine tarot card from moon phase and aspects
 */
function determineTarotCard(
  aspects: Array<{ aspectType: string }>,
  moonPhase: string,
): { name: string; keywords: string } {
  const dominantAspectType = aspects[0]?.aspectType || 'conjunction';

  const harmoniousAspects = ['trine', 'sextile'];
  const challengingAspects = ['square', 'opposition'];

  if (harmoniousAspects.includes(dominantAspectType)) {
    const harmoniousCards = [
      { name: 'The Star', keywords: 'Hope • Renewal • Serenity' },
      { name: 'The Sun', keywords: 'Joy • Success • Vitality' },
      { name: 'Temperance', keywords: 'Balance • Patience • Harmony' },
      { name: 'The World', keywords: 'Completion • Achievement • Integration' },
    ];
    return harmoniousCards[
      aspects.length % harmoniousCards.length
    ] as (typeof harmoniousCards)[0];
  }

  if (challengingAspects.includes(dominantAspectType)) {
    const challengeCards = [
      { name: 'The Tower', keywords: 'Change • Revelation • Breakthrough' },
      { name: 'The Devil', keywords: 'Liberation • Shadow Work • Release' },
      { name: 'Death', keywords: 'Transformation • Endings • Renewal' },
      {
        name: 'The Hanged Man',
        keywords: 'Surrender • New Perspective • Pause',
      },
    ];
    return challengeCards[
      aspects.length % challengeCards.length
    ] as (typeof challengeCards)[0];
  }

  const phaseCards: Record<string, { name: string; keywords: string }> = {
    'New Moon': {
      name: 'The Fool',
      keywords: 'New Beginnings • Trust • Potential',
    },
    'Waxing Crescent': {
      name: 'The Magician',
      keywords: 'Manifestation • Power • Action',
    },
    'First Quarter': {
      name: 'The Chariot',
      keywords: 'Willpower • Direction • Success',
    },
    'Waxing Gibbous': {
      name: 'Strength',
      keywords: 'Courage • Patience • Compassion',
    },
    'Full Moon': { name: 'The Moon', keywords: 'Intuition • Dreams • Mystery' },
    'Waning Gibbous': {
      name: 'The Hermit',
      keywords: 'Reflection • Wisdom • Solitude',
    },
    'Last Quarter': {
      name: 'Justice',
      keywords: 'Truth • Fairness • Clarity',
    },
    'Waning Crescent': {
      name: 'Judgement',
      keywords: 'Reflection • Rebirth • Evaluation',
    },
  };

  return (
    phaseCards[moonPhase] || {
      name: 'The Star',
      keywords: 'Hope • Renewal • Serenity',
    }
  );
}

/**
 * Determine crystal from moon sign and dominant aspect
 */
function determineCrystal(
  moonSign: string,
  dominantAspectType: string,
): { name: string; meaning: string } {
  const challengingAspects = ['square', 'opposition'];

  if (challengingAspects.includes(dominantAspectType)) {
    return {
      name: 'Black Tourmaline',
      meaning: 'Protection and grounding during challenging transits',
    };
  }

  const crystalsBySign: Record<string, { name: string; meaning: string }> = {
    Aries: {
      name: 'Carnelian',
      meaning: 'Supports courage and passionate action',
    },
    Taurus: {
      name: 'Rose Quartz',
      meaning: 'Encourages love and sensory pleasure',
    },
    Gemini: {
      name: 'Clear Quartz',
      meaning: 'Amplifies mental clarity and communication',
    },
    Cancer: {
      name: 'Moonstone',
      meaning: 'Honors intuition and emotional depths',
    },
    Leo: {
      name: 'Citrine',
      meaning: 'Enhances confidence and creative expression',
    },
    Virgo: {
      name: 'Amazonite',
      meaning: 'Supports practical wisdom and healing',
    },
    Libra: {
      name: 'Jade',
      meaning: 'Brings harmony and balanced relationships',
    },
    Scorpio: {
      name: 'Obsidian',
      meaning: 'Facilitates deep transformation and shadow work',
    },
    Sagittarius: {
      name: 'Turquoise',
      meaning: 'Encourages adventure and philosophical insight',
    },
    Capricorn: {
      name: 'Garnet',
      meaning: 'Grounds ambition with steady determination',
    },
    Aquarius: {
      name: 'Amethyst',
      meaning: 'Supports intuition during this visionary phase',
    },
    Pisces: {
      name: 'Aquamarine',
      meaning: 'Enhances compassion and spiritual connection',
    },
  };

  return (
    crystalsBySign[moonSign] || {
      name: 'Clear Quartz',
      meaning: 'Universal amplifier of energy and intention',
    }
  );
}

/**
 * Generate today's theme from dominant aspect
 */
function generateTodayTheme(
  aspects: Array<{
    transitPlanet: string;
    natalPlanet: string;
    aspectType: string;
  }>,
  moonPhase: string,
): string {
  if (aspects.length === 0) {
    return `A ${moonPhase.toLowerCase()} for reflection and intention`;
  }

  const { transitPlanet, natalPlanet, aspectType } = aspects[0];

  const themeTemplates: Record<string, (t: string, n: string) => string> = {
    conjunction: (t, n) =>
      `${t} merges with your natal ${n} - powerful activation`,
    opposition: (t, n) =>
      `${t} opposes your natal ${n} - balance seeking perspective`,
    square: (t, n) => `${t} squares your natal ${n} - tension creates growth`,
    trine: (t, n) => `${t} flows with your natal ${n} - graceful harmony`,
    sextile: (t, n) => `${t} supports your natal ${n} - opportunity emerging`,
  };

  const template = themeTemplates[aspectType] || themeTemplates.conjunction;
  return template(transitPlanet, natalPlanet);
}

/**
 * Get Moon phase description
 */
function getMoonPhase(
  moonLongitude: number,
  sunLongitude: number,
): { phase: string; description: string } {
  let diff = moonLongitude - sunLongitude;
  if (diff < 0) diff += 360;

  if (diff < 45)
    return { phase: 'New Moon', description: 'new intentions, fresh starts' };
  if (diff < 90)
    return {
      phase: 'Waxing Crescent',
      description: 'building momentum, taking action',
    };
  if (diff < 135)
    return {
      phase: 'First Quarter',
      description: 'overcoming challenges, decisive action',
    };
  if (diff < 180)
    return { phase: 'Waxing Gibbous', description: 'refinement, preparation' };
  if (diff < 225)
    return {
      phase: 'Full Moon',
      description: 'culmination, illumination, clarity',
    };
  if (diff < 270)
    return {
      phase: 'Waning Gibbous',
      description: 'sharing wisdom, gratitude',
    };
  if (diff < 315)
    return { phase: 'Last Quarter', description: 'release, letting go' };
  return {
    phase: 'Waning Crescent',
    description: 'rest, reflection, integration',
  };
}

/**
 * Generate examples for all hubs
 */
async function generateExamples(): Promise<CTAExamplesOutput> {
  console.log('🌟 Generating CTA examples...\n');

  // Get reference birth chart
  console.log('📊 Loading reference birth chart...');
  const natalChart = await getReferenceChart();
  console.log(`✓ Loaded ${natalChart.length} natal positions\n`);

  // Get current transits (today's planetary positions)
  const today = dayjs();
  console.log(`📅 Calculating transits for ${today.format('YYYY-MM-DD')}...`);
  const transitChart = await generateBirthChart(
    today.format('YYYY-MM-DD'),
    today.format('HH:mm'),
    'London, UK',
    'Europe/London',
  );
  console.log(`✓ Calculated ${transitChart.length} transit positions\n`);

  // Calculate transit houses relative to natal chart
  const natalSnapshot: BirthChartSnapshot = {
    date: '1990-01-15',
    time: '12:00',
    lat: 51.5074, // London latitude
    lon: -0.1278, // London longitude
    placements: natalChart.map((p) => ({
      planet: p.body,
      sign: p.sign,
      degree: p.degree,
      house: p.house || 1, // Default to house 1 if undefined
    })),
  };

  const transitPositions: Record<string, { sign: string; degree?: number }> =
    {};
  transitChart.forEach((planet) => {
    transitPositions[planet.body] = {
      sign: planet.sign,
      degree: planet.degree,
    };
  });

  const transitHouses = calculateTransitHouses(natalSnapshot, transitPositions);
  console.log(`✓ Calculated transit houses\n`);

  // Find interesting aspects
  const aspects: Array<{
    transitPlanet: string;
    natalPlanet: string;
    aspectType: string;
    orb: number;
    transitPosition: string;
    natalPosition: string;
  }> = [];

  const majorPlanets = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
  ];

  for (const transitBody of transitChart.filter((p) =>
    majorPlanets.includes(p.body),
  )) {
    for (const natalBody of natalChart.filter((p) =>
      majorPlanets.includes(p.body),
    )) {
      const aspect = calculateAspect(
        transitBody.eclipticLongitude,
        natalBody.eclipticLongitude,
      );
      if (aspect.type) {
        aspects.push({
          transitPlanet: transitBody.body,
          natalPlanet: natalBody.body,
          aspectType: aspect.type,
          orb: aspect.orb,
          transitPosition: formatFullPosition(transitBody),
          natalPosition: formatFullPosition(natalBody),
        });
      }
    }
  }

  // Sort by orb (tightest aspects first)
  aspects.sort((a, b) => a.orb - b.orb);
  console.log(`✓ Found ${aspects.length} aspects\n`);

  // Calculate Personal Day
  const personalDay = calculatePersonalDay('1990-01-15', today);

  // Get Moon phase
  const moon = transitChart.find((p) => p.body === 'Moon')!;
  const sun = transitChart.find((p) => p.body === 'Sun')!;
  const moonPhase = getMoonPhase(moon.eclipticLongitude, sun.eclipticLongitude);

  // Generate marketing data for persona "Celeste"
  console.log('🎨 Generating marketing data for Celeste...');

  const natalSun = natalChart.find((p) => p.body === 'Sun');
  const natalMoon = natalChart.find((p) => p.body === 'Moon');
  const natalAscendant = natalChart.find((p) => p.body === 'Ascendant');

  const moonSignProps = getZodiacProperties(moon.sign);
  const daysUntilNext = calculateDaysUntilNextPhase(
    moon.eclipticLongitude,
    sun.eclipticLongitude,
  );
  const nextPhase = getNextPhaseName(moonPhase.phase);
  const spell = getSpellForPhase(moonPhase.phase);

  const tarotCard = determineTarotCard(aspects, moonPhase.phase);
  const crystal = determineCrystal(
    moon.sign,
    aspects[0]?.aspectType || 'trine',
  );
  const todayTheme = generateTodayTheme(aspects, moonPhase.phase);

  const tightestAspect = aspects[0];
  const natalPlanetForTransit = natalChart.find(
    (p) => p.body === tightestAspect?.natalPlanet,
  );

  const marketing: MarketingData = {
    persona: {
      name: 'Celeste',
      birthDate: REFERENCE_PROFILE.birthDate,
      birthTime: REFERENCE_PROFILE.birthTime,
      birthLocation: REFERENCE_PROFILE.birthLocation,
      sunSign: natalSun?.sign || 'Capricorn',
      moonSign: natalMoon?.sign || 'Virgo',
      risingSign: natalAscendant?.sign || 'Taurus',
    },
    moonPhase: {
      phase: moonPhase.phase,
      sign: moon.sign,
      daysUntilNext,
      nextPhase,
      element: moonSignProps.element,
      rulingPlanet: moonSignProps.rulingPlanet,
      modality: moonSignProps.modality,
      spell,
    },
    tarotCard,
    crystal,
    todayTheme,
    todayTransit: {
      planet: tightestAspect?.transitPlanet || 'Jupiter',
      aspect: tightestAspect?.aspectType || 'sextile',
      aspectSymbol: getAspectSymbol(tightestAspect?.aspectType || 'sextile'),
      natalPlanet: tightestAspect?.natalPlanet || 'Moon',
      house: natalPlanetForTransit?.house || 6,
      meaning: getAspectInterpretation(
        tightestAspect?.aspectType || 'sextile',
        tightestAspect?.transitPlanet || 'Jupiter',
        tightestAspect?.natalPlanet || 'Moon',
      ),
    },
  };

  console.log(`✓ Marketing data generated for ${marketing.persona.name}\n`);

  // Build examples
  const examples: CTAExamplesOutput = {
    generatedAt: dayjs().toISOString(),
    generatedForDate: today.format('YYYY-MM-DD'),
    reference: {
      birthDate: '1990-01-15',
      birthTime: '12:00 PM',
      birthLocation: 'London, UK',
    },

    // HOROSCOPES hub examples
    horoscopes: {
      examples: [
        // Transit-to-natal aspect
        aspects.length > 0
          ? {
              type: 'transit_to_natal',
              text: `${aspects[0].transitPlanet} ${aspects[0].transitPosition} ${getAspectSymbol(aspects[0].aspectType)} your natal ${aspects[0].natalPlanet} ${aspects[0].natalPosition}`,
              interpretation: getAspectInterpretation(
                aspects[0].aspectType,
                aspects[0].transitPlanet,
                aspects[0].natalPlanet,
              ),
            }
          : {
              type: 'transit_to_natal',
              text: 'Current transits activating your birth chart',
              interpretation: 'personalized cosmic weather',
            },

        // House activation
        {
          type: 'house_activation',
          text: `${transitHouses[3]?.planet || 'Mars'} activating your ${transitHouses[3]?.natalHouse || 10}${getOrdinalSuffix(transitHouses[3]?.natalHouse || 10)} house`,
          interpretation: getHouseMeaning(transitHouses[3]?.natalHouse || 10),
        },

        // Personal Day
        {
          type: 'personal_day',
          text: `Personal Day ${personalDay}`,
          interpretation: getPersonalDayInterpretation(personalDay),
        },
      ],
    },

    // PLANETS hub examples
    planets: {
      examples: [
        // Natal Mercury example
        {
          type: 'natal_position',
          text: natalChart.find((p) => p.body === 'Mercury')
            ? `Mercury ${formatFullPosition(natalChart.find((p) => p.body === 'Mercury')!)}${
                natalChart.find((p) => p.body === 'Mercury')!.house
                  ? ` in ${natalChart.find((p) => p.body === 'Mercury')!.house}${getOrdinalSuffix(natalChart.find((p) => p.body === 'Mercury')!.house!)} house`
                  : ''
              }`
            : 'Mercury in your natal chart',
          interpretation: 'communication style and mental patterns',
        },

        // Current transit to natal Venus
        aspects.find((a) => a.natalPlanet === 'Venus')
          ? {
              type: 'current_transit',
              text: `${aspects.find((a) => a.natalPlanet === 'Venus')!.transitPlanet} ${getAspectSymbol(aspects.find((a) => a.natalPlanet === 'Venus')!.aspectType)} your Venus`,
              interpretation: getAspectInterpretation(
                aspects.find((a) => a.natalPlanet === 'Venus')!.aspectType,
                aspects.find((a) => a.natalPlanet === 'Venus')!.transitPlanet,
                'Venus',
              ),
            }
          : {
              type: 'current_transit',
              text: 'Current transits to your natal planets',
              interpretation: 'personalized planetary activations',
            },
      ],
    },

    // HOUSES hub examples
    houses: {
      examples: [
        // House with planets transiting through
        {
          type: 'house_activation',
          text: (() => {
            const house = transitHouses[0]?.natalHouse || 1;
            const planetsInHouse = transitHouses
              .filter((t) => t.natalHouse === house)
              .map((t) => t.planet);
            return planetsInHouse.length > 0
              ? `${planetsInHouse.join(', ')} activating your ${house}${getOrdinalSuffix(house)} house`
              : `Your ${house}${getOrdinalSuffix(house)} house activity`;
          })(),
          interpretation: getHouseMeaning(transitHouses[0]?.natalHouse || 1),
        },

        // Different house example
        {
          type: 'multi_planet_house',
          text: (() => {
            const house = transitHouses[3]?.natalHouse || 10;
            const planetsInHouse = transitHouses
              .filter((t) => t.natalHouse === house)
              .map((t) => t.planet);
            return planetsInHouse.length > 0
              ? `${planetsInHouse.join(', ')} in your ${house}${getOrdinalSuffix(house)} house`
              : `Your ${house}${getOrdinalSuffix(house)} house focus`;
          })(),
          interpretation: getHouseMeaning(transitHouses[3]?.natalHouse || 10),
        },
      ],
    },

    // TRANSITS hub examples
    transits: {
      examples: [
        // Major aspect with timing
        aspects.length > 0
          ? {
              type: 'major_transit',
              text: `${aspects[0].transitPlanet} ${aspects[0].aspectType} ${aspects[0].natalPlanet}`,
              interpretation: `${Math.round(aspects[0].orb * 10) / 10}° orb, ${aspects[0].orb < 2 ? 'exact today' : 'applying'}`,
            }
          : {
              type: 'major_transit',
              text: 'Current transits to your chart',
              interpretation: 'personalized timing',
            },

        // House activation with transit
        {
          type: 'transit_house',
          text: `${transitHouses[1]?.planet || 'Venus'} through your ${transitHouses[1]?.natalHouse || 5}${getOrdinalSuffix(transitHouses[1]?.natalHouse || 5)} house`,
          interpretation: getHouseMeaning(transitHouses[1]?.natalHouse || 5),
        },

        // Multiple aspects
        {
          type: 'multiple_aspects',
          text: `${aspects.length} aspects forming to your natal planets`,
          interpretation: 'layered cosmic influences today',
        },
      ],
    },

    // MOON hub examples
    moon: {
      examples: [
        // Moon phase
        {
          type: 'moon_phase',
          text: moonPhase.phase,
          interpretation: moonPhase.description,
        },

        // Moon's current position and house
        {
          type: 'moon_position',
          text: `Moon ${formatFullPosition(moon)} in your ${transitHouses.find((t) => t.planet === 'Moon')?.natalHouse || 1}${getOrdinalSuffix(transitHouses.find((t) => t.planet === 'Moon')?.natalHouse || 1)} house`,
          interpretation: getHouseMeaning(
            transitHouses.find((t) => t.planet === 'Moon')?.natalHouse || 1,
          ),
        },

        // Moon aspect to natal planet
        aspects.find((a) => a.transitPlanet === 'Moon')
          ? {
              type: 'moon_aspect',
              text: `Moon ${getAspectSymbol(aspects.find((a) => a.transitPlanet === 'Moon')!.aspectType)} your natal ${aspects.find((a) => a.transitPlanet === 'Moon')!.natalPlanet}`,
              interpretation: getAspectInterpretation(
                aspects.find((a) => a.transitPlanet === 'Moon')!.aspectType,
                'Moon',
                aspects.find((a) => a.transitPlanet === 'Moon')!.natalPlanet,
              ),
            }
          : {
              type: 'moon_aspect',
              text: 'Moon activating your natal chart',
              interpretation: 'emotional currents today',
            },
      ],
    },

    // ASPECTS hub examples
    aspects: {
      examples: aspects.slice(0, 3).map((aspect) => ({
        type: 'aspect',
        text: `${aspect.transitPlanet} ${getAspectSymbol(aspect.aspectType)} ${aspect.natalPlanet}`,
        interpretation: `${aspect.aspectType}, ${Math.round(aspect.orb * 10) / 10}° orb`,
      })),
    },

    // MARKETING data
    marketing,
  };

  console.log('✅ Example generation complete!\n');
  return examples;
}

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('═══════════════════════════════════════');
    console.log('  CTA Examples Generator');
    console.log('═══════════════════════════════════════\n');

    const examples = await generateExamples();

    // Write CTA examples to output file
    const outputPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'cta-examples.json',
    );
    await fs.writeFile(outputPath, JSON.stringify(examples, null, 2), 'utf-8');
    console.log('📝 CTA examples written to:', outputPath);

    // Generate and write reference chart data for marketing
    console.log('\n📊 Generating reference chart data with houses...');
    const referenceChart = await getReferenceChartWithHouses();

    const referenceChartData = {
      persona: examples.marketing.persona,
      planets: referenceChart.planets,
      houses: referenceChart.houses,
    };

    const referenceChartPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'reference-chart-data.json',
    );
    await fs.writeFile(
      referenceChartPath,
      JSON.stringify(referenceChartData, null, 2),
      'utf-8',
    );
    console.log('📝 Reference chart data written to:', referenceChartPath);

    console.log(
      '\n✨ Done! Run this script again when the Sun changes signs (~20th of each month)\n',
    );
  } catch (error) {
    console.error('❌ Error generating examples:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateExamples };
