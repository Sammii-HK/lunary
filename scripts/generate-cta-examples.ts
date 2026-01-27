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
import { getReferenceChart, formatFullPosition } from './lib/reference-chart';
import { generateBirthChart } from '../utils/astrology/birthChart';
import { calculateTransitHouses } from '../src/lib/ai/transit-houses';
import type { BirthChartSnapshot } from '../src/lib/ai/transit-houses';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CTAExample {
  type: string;
  text: string;
  interpretation: string;
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
    planets: natalChart.map((p) => ({
      body: p.body,
      sign: p.sign,
      degree: p.degree,
      house: p.house,
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

    // Write to output file
    const outputPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'cta-examples.json',
    );
    await fs.writeFile(outputPath, JSON.stringify(examples, null, 2), 'utf-8');

    console.log('📝 Output written to:', outputPath);
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
