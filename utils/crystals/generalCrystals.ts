import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { getAstrologicalChart } from '../astrology/astrology';
import { Observer } from 'astronomy-engine';
import { getMoonPhase } from '../moon/moonPhases';

dayjs.extend(dayOfYear);

export type GeneralCrystalRecommendation = {
  name: string;
  reason: string;
  properties: string[];
  guidance: string;
  moonPhaseAlignment: string;
};

const CRYSTALS_BY_SIGN = {
  Aries: ['Carnelian', 'Red Jasper', 'Hematite', 'Bloodstone'],
  Taurus: ['Rose Quartz', 'Green Aventurine', 'Emerald', 'Malachite'],
  Gemini: ['Citrine', 'Agate', 'Clear Quartz', "Tiger's Eye"],
  Cancer: ['Moonstone', 'Pearl', 'Selenite', 'Aquamarine'],
  Leo: ['Sunstone', 'Citrine', 'Amber', 'Pyrite'],
  Virgo: ['Amazonite', 'Moss Agate', 'Peridot', 'Sapphire'],
  Libra: ['Lapis Lazuli', 'Opal', 'Jade', 'Lepidolite'],
  Scorpio: ['Obsidian', 'Garnet', 'Labradorite', 'Malachite'],
  Sagittarius: ['Turquoise', 'Sodalite', 'Amethyst', 'Lapis Lazuli'],
  Capricorn: ['Garnet', 'Black Tourmaline', 'Fluorite', 'Onyx'],
  Aquarius: ['Amethyst', 'Aquamarine', 'Fluorite', 'Labradorite'],
  Pisces: ['Amethyst', 'Aquamarine', 'Moonstone', 'Fluorite'],
};

const CRYSTAL_PROPERTIES = {
  Amethyst: ['intuition', 'spiritual growth', 'calming', 'protection'],
  'Rose Quartz': [
    'love',
    'emotional healing',
    'self-compassion',
    'relationships',
  ],
  'Clear Quartz': ['amplification', 'clarity', 'energy', 'manifestation'],
  Citrine: ['abundance', 'creativity', 'confidence', 'joy'],
  'Black Tourmaline': [
    'protection',
    'grounding',
    'energy cleansing',
    'stability',
  ],
  Moonstone: [
    'intuition',
    'feminine energy',
    'emotional balance',
    'new beginnings',
  ],
  Carnelian: ['courage', 'motivation', 'creativity', 'vitality'],
  Labradorite: ['transformation', 'intuition', 'magic', 'psychic abilities'],
  Selenite: ['cleansing', 'clarity', 'peace', 'spiritual connection'],
  Hematite: ['grounding', 'focus', 'protection', 'strength'],
  'Green Aventurine': ['luck', 'opportunity', 'heart healing', 'growth'],
  Sodalite: ['truth', 'communication', 'wisdom', 'emotional balance'],
  "Tiger's Eye": ['confidence', 'protection', 'mental clarity', 'good luck'],
  Fluorite: ['mental clarity', 'focus', 'learning', 'decision making'],
  Malachite: ['transformation', 'protection', 'healing', 'emotional release'],
  Garnet: ['passion', 'energy', 'strength', 'commitment'],
  Aquamarine: ['communication', 'courage', 'clarity', 'emotional healing'],
  Bloodstone: ['courage', 'vitality', 'grounding', 'decision making'],
  Sunstone: ['leadership', 'vitality', 'creativity', 'optimism'],
  'Lapis Lazuli': ['wisdom', 'truth', 'communication', 'spiritual insight'],
  Obsidian: ['protection', 'grounding', 'truth', 'emotional healing'],
  Jade: ['harmony', 'prosperity', 'protection', 'wisdom'],
  Amazonite: ['communication', 'truth', 'courage', 'emotional balance'],
  Opal: ['creativity', 'inspiration', 'emotional healing', 'intuition'],
  Emerald: ['love', 'abundance', 'healing', 'growth'],
  Peridot: ['abundance', 'protection', 'emotional healing', 'growth'],
  Pyrite: ['abundance', 'confidence', 'manifestation', 'protection'],
  Onyx: ['strength', 'protection', 'grounding', 'self-control'],
  Agate: ['stability', 'grounding', 'protection', 'balance'],
  Amber: ['healing', 'purification', 'vitality', 'manifestation'],
  Lepidolite: ['peace', 'emotional balance', 'stress relief', 'transition'],
  Pearl: ['wisdom', 'purity', 'emotional healing', 'intuition'],
  'Red Jasper': ['strength', 'vitality', 'grounding', 'courage'],
  'Moss Agate': [
    'growth',
    'abundance',
    'connection to nature',
    'emotional balance',
  ],
  Sapphire: ['wisdom', 'truth', 'spiritual insight', 'mental clarity'],
  Turquoise: ['protection', 'healing', 'communication', 'spiritual connection'],
};

const MOON_PHASE_CRYSTALS = {
  'New Moon': ['Moonstone', 'Clear Quartz', 'Selenite', 'Amethyst'],
  'Waxing Crescent': ['Citrine', 'Green Aventurine', 'Carnelian', 'Sunstone'],
  'First Quarter': ["Tiger's Eye", 'Hematite', 'Fluorite', 'Garnet'],
  'Waxing Gibbous': ['Rose Quartz', 'Amazonite', 'Jade', 'Peridot'],
  'Full Moon': ['Moonstone', 'Labradorite', 'Selenite', 'Amethyst'],
  'Waning Gibbous': ['Lepidolite', 'Sodalite', 'Aquamarine', 'Blue Lace Agate'],
  'Third Quarter': ['Black Tourmaline', 'Obsidian', 'Hematite', 'Onyx'],
  'Waning Crescent': ['Amethyst', 'Fluorite', 'Selenite', 'Clear Quartz'],
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
  const elementalCrystals = {
    fire: ['Carnelian', 'Red Jasper', 'Sunstone', 'Citrine', 'Garnet'],
    earth: [
      'Hematite',
      'Black Tourmaline',
      'Green Aventurine',
      'Moss Agate',
      'Emerald',
    ],
    air: ['Clear Quartz', 'Fluorite', 'Sodalite', 'Lapis Lazuli', 'Aquamarine'],
    water: ['Moonstone', 'Amethyst', 'Rose Quartz', 'Aquamarine', 'Pearl'],
  };

  return (
    elementalCrystals[element as keyof typeof elementalCrystals] ||
    elementalCrystals.air
  );
};

const getCrystalGuidance = (
  crystal: string,
  moonPhase: string,
  dominantElement: string,
): string => {
  const properties = CRYSTAL_PROPERTIES[
    crystal as keyof typeof CRYSTAL_PROPERTIES
  ] || ['balance', 'harmony'];
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
  const today = date ? dayjs(date) : dayjs();
  const observer = new Observer(51.4769, 0.0005, 0); // Default location
  const currentChart = getAstrologicalChart(today.toDate(), observer);
  const moonPhase = getMoonPhase(today.toDate());

  // Get dominant elemental energy
  const dominantElement = getDominantEnergy(currentChart);

  // Get current sun and moon signs for selection
  const sun = currentChart.find((p) => p.body === 'Sun');
  const moon = currentChart.find((p) => p.body === 'Moon');

  // Create pools of crystals from different sources
  const sunCrystals = sun
    ? CRYSTALS_BY_SIGN[sun.sign as keyof typeof CRYSTALS_BY_SIGN] || []
    : [];
  const moonCrystals = moon
    ? CRYSTALS_BY_SIGN[moon.sign as keyof typeof CRYSTALS_BY_SIGN] || []
    : [];
  const moonPhaseCrystals =
    MOON_PHASE_CRYSTALS[moonPhase as keyof typeof MOON_PHASE_CRYSTALS] ||
    MOON_PHASE_CRYSTALS['New Moon'];
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
  const dayOfYear = today.dayOfYear();
  const selectedCrystal = sortedCrystals[dayOfYear % sortedCrystals.length];

  // Generate reason
  let reason = `Based on today's cosmic energy`;
  if (sun) reason += ` with the Sun in ${sun.sign}`;
  if (moon) reason += ` and Moon in ${moon.sign}`;
  reason += `, ${selectedCrystal} resonates perfectly with the ${dominantElement} elemental influence.`;

  return {
    name: selectedCrystal,
    reason,
    properties: CRYSTAL_PROPERTIES[
      selectedCrystal as keyof typeof CRYSTAL_PROPERTIES
    ] || ['balance', 'harmony', 'energy', 'healing'],
    guidance: getCrystalGuidance(selectedCrystal, moonPhase, dominantElement),
    moonPhaseAlignment: getMoonPhaseGuidance(moonPhase, selectedCrystal),
  };
};
