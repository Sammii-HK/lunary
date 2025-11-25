import dayjs from 'dayjs';
import { getAstrologicalChart } from '../astrology/astrology';
import { Observer } from 'astronomy-engine';
import { getMoonPhase } from '../moon/moonPhases';
import {
  crystalDatabase,
  getCrystalsByZodiacSign,
  getCrystalsByMoonPhase,
  getCrystalByName,
} from '../../src/constants/grimoire/crystals';

export type GeneralCrystalRecommendation = {
  name: string;
  reason: string;
  properties: string[];
  guidance: string;
  moonPhaseAlignment: string;
};

// Get crystal properties from database (SSOT)
const getCrystalProperties = (crystalName: string): string[] => {
  const crystal = getCrystalByName(crystalName);
  return crystal?.properties || ['balance', 'harmony', 'energy', 'healing'];
};

const getDominantEnergy = (currentChart: any[]): string => {
  // Find the most prominent elements based on planetary positions
  const elements = {
    fire: 0, // Aries, Leo, Sagittarius
    earth: 0, // Taurus, Virgo, Capricorn
    air: 0, // Gemini, Libra, Aquarius
    water: 0, // Cancer, Scorpio, Pisces
  };

  const fireSignsRegex = /(Aries|Leo|Sagittarius)/;
  const earthSignsRegex = /(Taurus|Virgo|Capricorn)/;
  const airSignsRegex = /(Gemini|Libra|Aquarius)/;
  const waterSignsRegex = /(Cancer|Scorpio|Pisces)/;

  currentChart.forEach((planet) => {
    if (fireSignsRegex.test(planet.sign)) elements.fire++;
    else if (earthSignsRegex.test(planet.sign)) elements.earth++;
    else if (airSignsRegex.test(planet.sign)) elements.air++;
    else if (waterSignsRegex.test(planet.sign)) elements.water++;
  });

  // Find dominant element
  const maxElement = Object.keys(elements).reduce((a, b) =>
    elements[a as keyof typeof elements] > elements[b as keyof typeof elements]
      ? a
      : b,
  );

  return maxElement;
};

const getElementalCrystals = (element: string): string[] => {
  // Use the crystal database instead of hardcoded lists
  const elementMap: Record<string, string[]> = {
    fire: ['Fire'],
    earth: ['Earth'],
    air: ['Air'],
    water: ['Water'],
  };

  const elementName = elementMap[element]?.[0] || 'Air';

  // Get crystals from database that match this element
  const matchingCrystals = crystalDatabase.filter(
    (crystal) =>
      crystal.elements.includes(elementName) ||
      crystal.elements.includes('All Elements'),
  );

  // Return crystal names
  return matchingCrystals.map((c) => c.name);
};

const getCrystalGuidance = (
  crystal: string,
  moonPhase: string,
  dominantElement: string,
): string => {
  const properties = getCrystalProperties(crystal);
  const primaryProperty = properties[0];

  const guidanceTemplates = [
    `Work with ${crystal} today to enhance your ${primaryProperty}. ${getMoonPhaseGuidance(moonPhase, crystal)}.`,
    `${crystal} supports your ${dominantElement} energy today, bringing ${properties.slice(0, 2).join(' and ')}. ${getMoonPhaseGuidance(moonPhase, crystal)}.`,
    `The cosmic energies favor ${crystal} for ${primaryProperty} and ${properties[1] || 'balance'}. ${getMoonPhaseGuidance(moonPhase, crystal)}.`,
    `${crystal} resonates with today's ${dominantElement} energy, offering ${properties.slice(0, 2).join(' and ')}. ${getMoonPhaseGuidance(moonPhase, crystal)}.`,
  ];

  // Use a simple hash to get consistent but varied guidance
  const hash = (crystal + moonPhase + dominantElement).length;
  return guidanceTemplates[hash % guidanceTemplates.length];
};

const getMoonPhaseGuidance = (moonPhase: string, crystal: string): string => {
  const phaseGuidance: { [key: string]: string } = {
    'New Moon': `Place ${crystal} under tonight's new moon to set intentions for the lunar cycle ahead`,
    'Waxing Crescent': `Use ${crystal} to support the building energy as the moon grows brighter`,
    'First Quarter': `${crystal} helps you push through challenges with the moon's determined energy`,
    'Waxing Gibbous': `Let ${crystal} help refine your approach as the moon nears fullness`,
    'Full Moon': `Charge ${crystal} under the full moon's peak energy for maximum potency`,
    'Waning Gibbous': `Work with ${crystal} to integrate the lessons of this lunar cycle`,
    'Third Quarter': `${crystal} supports release and letting go as the moon wanes`,
    'Waning Crescent': `Use ${crystal} for rest and reflection before the next new moon`,
  };

  return (
    phaseGuidance[moonPhase] ||
    `Work with ${crystal} in harmony with the current lunar energy`
  );
};

export const getGeneralCrystalRecommendation = (
  date?: Date,
): GeneralCrystalRecommendation => {
  // Normalize date to noon UTC to ensure static seeding per day (remove time component)
  let normalizedDate: Date;
  if (date) {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    normalizedDate = new Date(dateStr + 'T12:00:00Z');
  } else {
    const todayStr = dayjs().format('YYYY-MM-DD');
    normalizedDate = new Date(todayStr + 'T12:00:00Z');
  }

  const today = dayjs(normalizedDate);
  const observer = new Observer(51.4769, 0.0005, 0); // Default location
  const currentChart = getAstrologicalChart(today.toDate(), observer);
  const moonPhase = getMoonPhase(today.toDate());

  // Get dominant elemental energy
  const dominantElement = getDominantEnergy(currentChart);

  // Get current sun and moon signs for selection
  const sun = currentChart.find((p) => p.body === 'Sun');
  const moon = currentChart.find((p) => p.body === 'Moon');

  // Create pools of crystals from different sources using the database
  const sunCrystals = sun
    ? getCrystalsByZodiacSign(sun.sign).map((c) => c.name)
    : [];
  const moonCrystals = moon
    ? getCrystalsByZodiacSign(moon.sign).map((c) => c.name)
    : [];
  const moonPhaseCrystals = getCrystalsByMoonPhase(moonPhase).map(
    (c) => c.name,
  );
  const elementalCrystals = getElementalCrystals(dominantElement);

  // Combine all crystal options and remove duplicates
  const allCrystals = [
    ...sunCrystals,
    ...moonCrystals,
    ...moonPhaseCrystals,
    ...elementalCrystals,
  ];

  // Remove duplicates while preserving order (first occurrence wins)
  const uniqueCrystals = Array.from(new Set(allCrystals));

  // If we have duplicates, prefer crystals that appear in multiple categories
  // This gives more variety and better matches cosmic energy
  const crystalFrequency = new Map<string, number>();
  allCrystals.forEach((crystal) => {
    crystalFrequency.set(crystal, (crystalFrequency.get(crystal) || 0) + 1);
  });

  // Sort by frequency (most common first) then by original order
  const sortedCrystals = uniqueCrystals.sort((a, b) => {
    const freqA = crystalFrequency.get(a) || 0;
    const freqB = crystalFrequency.get(b) || 0;
    if (freqA !== freqB) return freqB - freqA; // Higher frequency first
    return uniqueCrystals.indexOf(a) - uniqueCrystals.indexOf(b); // Preserve order
  });

  // Select crystal based on current day to ensure consistency
  // Calculate day of year manually to avoid plugin issues
  const startOfYear = dayjs(normalizedDate).startOf('year');
  const currentDayOfYear = today.diff(startOfYear, 'day') + 1;
  const selectedCrystal =
    sortedCrystals[currentDayOfYear % sortedCrystals.length];

  // Generate reason
  let reason = `Based on today's cosmic energy`;
  if (sun) reason += ` with the Sun in ${sun.sign}`;
  if (moon) reason += ` and Moon in ${moon.sign}`;
  reason += `, ${selectedCrystal} resonates perfectly with the ${dominantElement} elemental influence.`;

  return {
    name: selectedCrystal,
    reason,
    properties: getCrystalProperties(selectedCrystal),
    guidance: getCrystalGuidance(selectedCrystal, moonPhase, dominantElement),
    moonPhaseAlignment: getMoonPhaseGuidance(moonPhase, selectedCrystal),
  };
};
