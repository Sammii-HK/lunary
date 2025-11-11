'use client';

import { useAccount } from 'jazz-tools/react';
import { useMemo, useState, useEffect } from 'react';
import { SmartTrialButton } from './SmartTrialButton';
import {
  getBirthChartFromProfile,
  hasBirthChart,
  BirthChartData,
} from '../../utils/astrology/birthChart';
import { getAstrologicalChart } from '../../utils/astrology/astrology';
import { getGeneralCrystalRecommendation } from '../../utils/crystals/generalCrystals';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Popover } from '@base-ui-components/react/popover';

// Crystal database with astrological properties - Expanded comprehensive database
type Crystal = {
  name: string;
  properties: string[];
  sunSigns: string[];
  moonSigns: string[];
  aspects: string[];
  chakra: string;
  intention: string;
  description: string;
  element: string;
  color: string[];
};

const crystalDatabase: Crystal[] = [
  // Popular & Common Crystals
  {
    name: 'Amethyst',
    properties: ['intuition', 'spiritual', 'calming', 'protection'],
    sunSigns: ['Pisces', 'Aquarius', 'Sagittarius'],
    moonSigns: ['Pisces', 'Cancer', 'Scorpio'],
    aspects: ['opposition', 'square', 'conjunction-neptune'],
    chakra: 'Crown',
    intention: 'Enhance spiritual awareness and inner peace',
    description: 'Opens the third eye and connects you to higher wisdom',
    element: 'Water',
    color: ['Purple', 'Violet'],
  },
  {
    name: 'Rose Quartz',
    properties: ['love', 'heart-healing', 'emotional', 'compassion'],
    sunSigns: ['Taurus', 'Libra', 'Cancer'],
    moonSigns: ['Cancer', 'Libra', 'Taurus'],
    aspects: ['venus-aspects', 'trine', 'moon-aspects'],
    chakra: 'Heart',
    intention: 'Open your heart to love and self-compassion',
    description: 'Soothes emotional wounds and attracts loving relationships',
    element: 'Water',
    color: ['Pink', 'Rose'],
  },
  {
    name: 'Citrine',
    properties: ['abundance', 'confidence', 'manifestation', 'solar'],
    sunSigns: ['Leo', 'Sagittarius', 'Aries'],
    moonSigns: ['Leo', 'Aries', 'Sagittarius'],
    aspects: ['sun-aspects', 'jupiter-aspects', 'trine'],
    chakra: 'Solar Plexus',
    intention: 'Amplify personal power and manifest abundance',
    description: 'Radiates confidence and attracts prosperity',
    element: 'Fire',
    color: ['Yellow', 'Golden'],
  },
  {
    name: 'Black Tourmaline',
    properties: ['protection', 'grounding', 'mars-energy', 'strength'],
    sunSigns: ['Scorpio', 'Capricorn', 'Aries'],
    moonSigns: ['Capricorn', 'Scorpio', 'Virgo'],
    aspects: ['mars-aspects', 'saturn-aspects', 'square'],
    chakra: 'Root',
    intention: 'Ground your energy and protect against negativity',
    description: 'Creates an energetic shield and promotes inner stability',
    element: 'Earth',
    color: ['Black'],
  },
  {
    name: 'Clear Quartz',
    properties: ['amplification', 'clarity', 'universal', 'mercury'],
    sunSigns: ['Gemini', 'Virgo', 'Aquarius'],
    moonSigns: ['Gemini', 'Virgo', 'Aquarius'],
    aspects: ['mercury-aspects', 'conjunction', 'any'],
    chakra: 'Crown',
    intention: 'Amplify intentions and bring mental clarity',
    description: 'The master healer that enhances all other energies',
    element: 'Air',
    color: ['Clear', 'White'],
  },
  {
    name: 'Moonstone',
    properties: ['lunar', 'intuition', 'feminine', 'cycles'],
    sunSigns: ['Cancer', 'Pisces', 'Scorpio'],
    moonSigns: ['Cancer', 'Pisces', 'Taurus'],
    aspects: ['moon-aspects', 'opposition', 'new-moon'],
    chakra: 'Sacral',
    intention: 'Connect with lunar rhythms and feminine wisdom',
    description: 'Enhances intuition and honors natural cycles',
    element: 'Water',
    color: ['White', 'Cream', 'Gray'],
  },
  {
    name: 'Carnelian',
    properties: ['creativity', 'courage', 'mars', 'action'],
    sunSigns: ['Aries', 'Leo', 'Sagittarius'],
    moonSigns: ['Aries', 'Leo', 'Scorpio'],
    aspects: ['mars-aspects', 'sun-aspects', 'fire-energy'],
    chakra: 'Sacral',
    intention: 'Boost creativity and courage for new ventures',
    description: 'Ignites passion and supports bold action',
    element: 'Fire',
    color: ['Orange', 'Red-Orange'],
  },
  {
    name: 'Labradorite',
    properties: ['transformation', 'magic', 'uranus', 'awakening'],
    sunSigns: ['Aquarius', 'Scorpio', 'Pisces'],
    moonSigns: ['Aquarius', 'Scorpio', 'Pisces'],
    aspects: ['uranus-aspects', 'pluto-aspects', 'transformation'],
    chakra: 'Third Eye',
    intention: 'Awaken psychic abilities and embrace transformation',
    description: 'Reveals hidden truths and enhances spiritual gifts',
    element: 'Air',
    color: ['Gray', 'Blue', 'Green'],
  },

  // Additional Popular Crystals
  {
    name: 'Green Aventurine',
    properties: ['luck', 'heart-healing', 'venus', 'growth'],
    sunSigns: ['Taurus', 'Virgo', 'Libra'],
    moonSigns: ['Taurus', 'Cancer', 'Virgo'],
    aspects: ['venus-aspects', 'earth-energy', 'trine'],
    chakra: 'Heart',
    intention: 'Attract good fortune and emotional healing',
    description: 'Opens opportunities and soothes the heart',
    element: 'Earth',
    color: ['Green'],
  },
  {
    name: 'Lapis Lazuli',
    properties: ['wisdom', 'truth', 'jupiter', 'communication'],
    sunSigns: ['Sagittarius', 'Pisces', 'Aquarius'],
    moonSigns: ['Sagittarius', 'Gemini', 'Aquarius'],
    aspects: ['jupiter-aspects', 'mercury-aspects', 'expansion'],
    chakra: 'Throat',
    intention: 'Speak your truth with wisdom and authority',
    description: 'Enhances communication and reveals deeper truths',
    element: 'Air',
    color: ['Blue', 'Gold'],
  },
  {
    name: 'Hematite',
    properties: ['grounding', 'mars', 'focus', 'strength'],
    sunSigns: ['Aries', 'Capricorn', 'Virgo'],
    moonSigns: ['Capricorn', 'Virgo', 'Taurus'],
    aspects: ['mars-aspects', 'saturn-aspects', 'earth-energy'],
    chakra: 'Root',
    intention: 'Ground scattered energy and enhance focus',
    description: 'Strengthens connection to Earth and builds determination',
    element: 'Earth',
    color: ['Silver', 'Metallic'],
  },
  {
    name: 'Sodalite',
    properties: ['logic', 'mercury', 'communication', 'clarity'],
    sunSigns: ['Gemini', 'Virgo', 'Aquarius'],
    moonSigns: ['Gemini', 'Virgo', 'Aquarius'],
    aspects: ['mercury-aspects', 'air-energy', 'mental-clarity'],
    chakra: 'Throat',
    intention: 'Enhance logical thinking and clear communication',
    description: 'Balances logic with intuition for wise decisions',
    element: 'Air',
    color: ['Blue', 'White'],
  },

  // Power & Protection Crystals
  {
    name: 'Obsidian',
    properties: ['protection', 'grounding', 'truth', 'pluto'],
    sunSigns: ['Scorpio', 'Capricorn', 'Sagittarius'],
    moonSigns: ['Scorpio', 'Capricorn', 'Aries'],
    aspects: ['pluto-aspects', 'square', 'opposition'],
    chakra: 'Root',
    intention: 'Shield from negativity and reveal hidden truths',
    description: 'Powerful protector that cuts through illusions',
    element: 'Fire',
    color: ['Black'],
  },
  {
    name: 'Garnet',
    properties: ['passion', 'energy', 'mars', 'commitment'],
    sunSigns: ['Aries', 'Leo', 'Capricorn'],
    moonSigns: ['Aries', 'Scorpio', 'Leo'],
    aspects: ['mars-aspects', 'conjunction', 'fire-energy'],
    chakra: 'Root',
    intention: 'Ignite passion and strengthen commitment',
    description: 'Energizes the spirit and enhances devotion',
    element: 'Fire',
    color: ['Red', 'Deep Red'],
  },
  {
    name: 'Pyrite',
    properties: ['confidence', 'prosperity', 'sun', 'willpower'],
    sunSigns: ['Leo', 'Aries', 'Sagittarius'],
    moonSigns: ['Leo', 'Capricorn', 'Aries'],
    aspects: ['sun-aspects', 'mars-aspects', 'fire-energy'],
    chakra: 'Solar Plexus',
    intention: 'Build confidence and attract abundance',
    description: 'Shields from negativity while boosting self-worth',
    element: 'Fire',
    color: ['Gold', 'Metallic'],
  },
  {
    name: "Tiger's Eye",
    properties: ['courage', 'protection', 'focus', 'earth-energy'],
    sunSigns: ['Leo', 'Capricorn', 'Gemini'],
    moonSigns: ['Leo', 'Virgo', 'Capricorn'],
    aspects: ['sun-aspects', 'saturn-aspects', 'earth-energy'],
    chakra: 'Solar Plexus',
    intention: 'Enhance personal power and clear thinking',
    description: 'Combines Earth stability with Solar confidence',
    element: 'Earth',
    color: ['Brown', 'Golden'],
  },

  // Healing & Love Crystals
  {
    name: 'Prehnite',
    properties: ['healing', 'peace', 'venus', 'unconditional-love'],
    sunSigns: ['Libra', 'Virgo', 'Taurus'],
    moonSigns: ['Cancer', 'Taurus', 'Virgo'],
    aspects: ['venus-aspects', 'trine', 'sextile'],
    chakra: 'Heart',
    intention: 'Heal the heart and promote inner peace',
    description: 'Gentle healer that connects heart and mind',
    element: 'Earth',
    color: ['Green', 'Yellow-Green'],
  },
  {
    name: 'Rhodonite',
    properties: ['emotional-healing', 'forgiveness', 'heart', 'self-love'],
    sunSigns: ['Taurus', 'Leo', 'Scorpio'],
    moonSigns: ['Cancer', 'Scorpio', 'Taurus'],
    aspects: ['venus-aspects', 'moon-aspects', 'healing'],
    chakra: 'Heart',
    intention: 'Heal emotional wounds and foster forgiveness',
    description: 'Powerful heart healer that promotes self-love',
    element: 'Water',
    color: ['Pink', 'Red'],
  },
  {
    name: 'Malachite',
    properties: ['transformation', 'protection', 'venus', 'emotional-release'],
    sunSigns: ['Scorpio', 'Taurus', 'Capricorn'],
    moonSigns: ['Scorpio', 'Cancer', 'Taurus'],
    aspects: ['pluto-aspects', 'venus-aspects', 'transformation'],
    chakra: 'Heart',
    intention: 'Transform pain into wisdom and strength',
    description: 'Absorbs negative emotions and promotes growth',
    element: 'Earth',
    color: ['Green'],
  },
  {
    name: 'Amazonite',
    properties: ['communication', 'truth', 'mercury', 'harmony'],
    sunSigns: ['Gemini', 'Virgo', 'Aquarius'],
    moonSigns: ['Gemini', 'Libra', 'Aquarius'],
    aspects: ['mercury-aspects', 'air-energy', 'harmony'],
    chakra: 'Throat',
    intention: 'Speak truth with courage and compassion',
    description: 'Balances masculine and feminine energies',
    element: 'Air',
    color: ['Blue-Green', 'Turquoise'],
  },

  // Spiritual & Intuitive Crystals
  {
    name: 'Lepidolite',
    properties: ['calming', 'anxiety-relief', 'moon', 'peace'],
    sunSigns: ['Libra', 'Pisces', 'Cancer'],
    moonSigns: ['Cancer', 'Pisces', 'Libra'],
    aspects: ['moon-aspects', 'neptune-aspects', 'calming'],
    chakra: 'Third Eye',
    intention: 'Calm anxiety and promote emotional balance',
    description: 'Contains natural lithium for emotional stability',
    element: 'Water',
    color: ['Purple', 'Lavender'],
  },
  {
    name: 'Celestite',
    properties: ['angelic', 'communication', 'peace', 'spiritual'],
    sunSigns: ['Gemini', 'Pisces', 'Aquarius'],
    moonSigns: ['Pisces', 'Cancer', 'Aquarius'],
    aspects: ['neptune-aspects', 'jupiter-aspects', 'spiritual'],
    chakra: 'Throat',
    intention: 'Connect with angelic guidance and divine wisdom',
    description: 'Opens communication with higher realms',
    element: 'Air',
    color: ['Blue', 'White'],
  },
  {
    name: 'Fluorite',
    properties: ['mental-clarity', 'focus', 'mercury', 'learning'],
    sunSigns: ['Gemini', 'Virgo', 'Pisces'],
    moonSigns: ['Gemini', 'Virgo', 'Aquarius'],
    aspects: ['mercury-aspects', 'mental-clarity', 'learning'],
    chakra: 'Third Eye',
    intention: 'Enhance mental clarity and learning ability',
    description: 'Genius stone that improves concentration',
    element: 'Air',
    color: ['Purple', 'Green', 'Blue'],
  },
  {
    name: 'Ametrine',
    properties: ['balance', 'clarity', 'spiritual-power', 'creativity'],
    sunSigns: ['Gemini', 'Libra', 'Pisces'],
    moonSigns: ['Libra', 'Gemini', 'Pisces'],
    aspects: ['balance', 'jupiter-aspects', 'creativity'],
    chakra: 'Crown',
    intention: 'Balance spiritual and material worlds',
    description: 'Combines amethyst spirituality with citrine manifestation',
    element: 'Air',
    color: ['Purple', 'Yellow'],
  },

  // Earth & Grounding Crystals
  {
    name: 'Smoky Quartz',
    properties: ['grounding', 'protection', 'earth', 'negativity-clearing'],
    sunSigns: ['Capricorn', 'Scorpio', 'Sagittarius'],
    moonSigns: ['Capricorn', 'Taurus', 'Virgo'],
    aspects: ['saturn-aspects', 'earth-energy', 'grounding'],
    chakra: 'Root',
    intention: 'Ground excess energy and clear negativity',
    description: 'Gentle but powerful grounding and protection',
    element: 'Earth',
    color: ['Brown', 'Gray'],
  },
  {
    name: 'Red Jasper',
    properties: ['vitality', 'courage', 'mars', 'endurance'],
    sunSigns: ['Aries', 'Leo', 'Scorpio'],
    moonSigns: ['Aries', 'Scorpio', 'Capricorn'],
    aspects: ['mars-aspects', 'fire-energy', 'strength'],
    chakra: 'Root',
    intention: 'Boost physical energy and courage',
    description: 'Ancient stone of strength and vitality',
    element: 'Fire',
    color: ['Red', 'Deep Red'],
  },
  {
    name: 'Moss Agate',
    properties: ['abundance', 'growth', 'earth', 'new-beginnings'],
    sunSigns: ['Virgo', 'Gemini', 'Taurus'],
    moonSigns: ['Taurus', 'Virgo', 'Cancer'],
    aspects: ['earth-energy', 'venus-aspects', 'growth'],
    chakra: 'Heart',
    intention: 'Connect with nature and promote growth',
    description: 'Enhances connection to natural world',
    element: 'Earth',
    color: ['Green', 'White'],
  },
  {
    name: 'Bloodstone',
    properties: ['courage', 'vitality', 'mars', 'healing'],
    sunSigns: ['Aries', 'Scorpio', 'Pisces'],
    moonSigns: ['Aries', 'Scorpio', 'Leo'],
    aspects: ['mars-aspects', 'healing', 'courage'],
    chakra: 'Root',
    intention: 'Enhance courage and life force energy',
    description: 'Ancient warrior stone for strength and healing',
    element: 'Fire',
    color: ['Green', 'Red'],
  },

  // Manifestation & Abundance Crystals
  {
    name: 'Green Jade',
    properties: ['prosperity', 'luck', 'harmony', 'venus'],
    sunSigns: ['Taurus', 'Libra', 'Aries'],
    moonSigns: ['Taurus', 'Cancer', 'Libra'],
    aspects: ['venus-aspects', 'earth-energy', 'abundance'],
    chakra: 'Heart',
    intention: 'Attract prosperity and good fortune',
    description: 'Ancient symbol of prosperity and protection',
    element: 'Earth',
    color: ['Green'],
  },
  {
    name: 'Peridot',
    properties: ['abundance', 'joy', 'sun', 'heart-opening'],
    sunSigns: ['Leo', 'Virgo', 'Sagittarius'],
    moonSigns: ['Leo', 'Libra', 'Sagittarius'],
    aspects: ['sun-aspects', 'venus-aspects', 'joy'],
    chakra: 'Heart',
    intention: 'Open heart to abundance and joy',
    description: 'Stone of renewal and positive energy',
    element: 'Fire',
    color: ['Green', 'Yellow-Green'],
  },
  {
    name: 'Sunstone',
    properties: ['confidence', 'leadership', 'sun', 'optimism'],
    sunSigns: ['Leo', 'Aries', 'Sagittarius'],
    moonSigns: ['Leo', 'Aries', 'Gemini'],
    aspects: ['sun-aspects', 'fire-energy', 'leadership'],
    chakra: 'Solar Plexus',
    intention: 'Radiate confidence and personal power',
    description: 'Embodies the energy of the sun itself',
    element: 'Fire',
    color: ['Orange', 'Golden'],
  },
  {
    name: 'Morganite',
    properties: ['divine-love', 'compassion', 'venus', 'emotional-healing'],
    sunSigns: ['Taurus', 'Cancer', 'Leo'],
    moonSigns: ['Cancer', 'Taurus', 'Libra'],
    aspects: ['venus-aspects', 'moon-aspects', 'divine-love'],
    chakra: 'Heart',
    intention: 'Open heart to divine love and compassion',
    description: 'High vibration heart stone for spiritual love',
    element: 'Water',
    color: ['Pink', 'Peach'],
  },

  // Wisdom & Communication Crystals
  {
    name: 'Aquamarine',
    properties: ['communication', 'truth', 'mercury', 'calming'],
    sunSigns: ['Gemini', 'Pisces', 'Aquarius'],
    moonSigns: ['Pisces', 'Cancer', 'Gemini'],
    aspects: ['mercury-aspects', 'neptune-aspects', 'water-energy'],
    chakra: 'Throat',
    intention: 'Enhance clear communication and truth',
    description: 'Stone of courage for honest expression',
    element: 'Water',
    color: ['Blue', 'Blue-Green'],
  },
  {
    name: 'Turquoise',
    properties: ['wisdom', 'protection', 'communication', 'healing'],
    sunSigns: ['Sagittarius', 'Aquarius', 'Scorpio'],
    moonSigns: ['Sagittarius', 'Gemini', 'Aquarius'],
    aspects: ['jupiter-aspects', 'mercury-aspects', 'wisdom'],
    chakra: 'Throat',
    intention: 'Speak ancient wisdom with modern clarity',
    description: 'Sacred stone of wisdom and protection',
    element: 'Air',
    color: ['Blue', 'Green'],
  },
  {
    name: 'Sapphire',
    properties: ['wisdom', 'royal-power', 'saturn', 'discipline'],
    sunSigns: ['Virgo', 'Libra', 'Taurus'],
    moonSigns: ['Virgo', 'Capricorn', 'Taurus'],
    aspects: ['saturn-aspects', 'wisdom', 'discipline'],
    chakra: 'Third Eye',
    intention: 'Access divine wisdom and inner truth',
    description: 'Royal stone of wisdom and divine favor',
    element: 'Air',
    color: ['Blue', 'Various'],
  },
  {
    name: 'Kyanite',
    properties: ['alignment', 'communication', 'mercury', 'energy-clearing'],
    sunSigns: ['Gemini', 'Taurus', 'Aries'],
    moonSigns: ['Gemini', 'Aquarius', 'Libra'],
    aspects: ['mercury-aspects', 'air-energy', 'alignment'],
    chakra: 'Throat',
    intention: 'Align all chakras and enhance communication',
    description: 'Self-clearing stone that never needs cleansing',
    element: 'Air',
    color: ['Blue', 'White'],
  },
];

// Daily influences that affect crystal selection
const getDailyInfluences = (today: Date, userBirthday?: string) => {
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  // Calculate Universal Day Number (numerology)
  const universalDay = dateString
    .replace(/-/g, '')
    .split('')
    .reduce((sum, digit) => sum + parseInt(digit), 0);
  let reducedUniversal = universalDay;
  while (reducedUniversal > 9 && ![11, 22, 33].includes(reducedUniversal)) {
    reducedUniversal = reducedUniversal
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  // Calculate Personal Day Number if birthday available
  let personalDay = 1;
  if (userBirthday) {
    const [birthYear, birthMonth, birthDay] = userBirthday
      .split('-')
      .map(Number);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const personalSum =
      birthMonth + birthDay + currentYear + currentMonth + currentDay;
    personalDay = personalSum;
    while (personalDay > 9 && ![11, 22, 33].includes(personalDay)) {
      personalDay = personalDay
        .toString()
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
  }

  // Day of week planetary rulers
  const planetaryRulers = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ];
  const todaysPlanet = planetaryRulers[dayOfWeek];

  // Day of week elements
  const weekElements = [
    'Fire',
    'Water',
    'Fire',
    'Air',
    'Fire',
    'Water',
    'Earth',
  ];
  const todaysElement = weekElements[dayOfWeek];

  return {
    dayOfWeek,
    universalDay: reducedUniversal,
    personalDay,
    planetaryRuler: todaysPlanet,
    element: todaysElement,
    dateString,
  };
};

const calculateCrystalRecommendation = (
  birthChart: BirthChartData[],
  currentTransits: any[],
  today: Date,
  userBirthday?: string,
): Crystal => {
  const scores: Record<string, number> = {};

  // Initialize scores
  crystalDatabase.forEach((crystal) => {
    scores[crystal.name] = 0;
  });

  // Get daily influences
  const dailyInfluences = getDailyInfluences(today, userBirthday);

  // Get user's key placements
  const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
  const moonSign = birthChart.find((p) => p.body === 'Moon')?.sign || 'Aries';

  // Get current transits
  const transitSun = currentTransits.find((p) => p.body === 'Sun');
  const transitMoon = currentTransits.find((p) => p.body === 'Moon');
  const transitMercury = currentTransits.find((p) => p.body === 'Mercury');
  const transitVenus = currentTransits.find((p) => p.body === 'Venus');
  const transitMars = currentTransits.find((p) => p.body === 'Mars');
  const transitJupiter = currentTransits.find((p) => p.body === 'Jupiter');

  // Calculate aspects
  const aspects = calculateKeyAspects(birthChart, currentTransits);

  // Score crystals based on multiple factors
  crystalDatabase.forEach((crystal) => {
    let score = 0;

    // Base astrological compatibility
    if (crystal.sunSigns.includes(sunSign)) score += 10;
    if (crystal.sunSigns.includes(transitSun?.sign || '')) score += 8;
    if (crystal.moonSigns.includes(moonSign)) score += 10;
    if (crystal.moonSigns.includes(transitMoon?.sign || '')) score += 8;

    // Daily planetary ruler influence (NEW)
    const planetProps = {
      Sun: ['solar', 'confidence', 'leadership', 'sun'],
      Moon: ['lunar', 'intuition', 'emotional', 'moon'],
      Mars: ['mars', 'courage', 'action', 'energy'],
      Mercury: ['mercury', 'communication', 'clarity', 'mental-clarity'],
      Jupiter: ['jupiter', 'wisdom', 'abundance', 'expansion'],
      Venus: ['venus', 'love', 'beauty', 'harmony'],
      Saturn: ['saturn', 'grounding', 'discipline', 'structure'],
    };

    const todaysProperties =
      planetProps[dailyInfluences.planetaryRuler as keyof typeof planetProps] ||
      [];
    todaysProperties.forEach((prop) => {
      if (crystal.properties.includes(prop)) score += 12; // High weight for daily ruler
    });

    // Daily element influence (NEW)
    if (crystal.element === dailyInfluences.element) score += 8;

    // Universal Day Number influence (NEW)
    const numerologyProperties: Record<number, string[]> = {
      1: ['leadership', 'confidence', 'new-beginnings', 'courage'],
      2: ['cooperation', 'harmony', 'peace', 'emotional'],
      3: ['creativity', 'communication', 'joy', 'expression'],
      4: ['grounding', 'stability', 'focus', 'earth'],
      5: ['freedom', 'adventure', 'change', 'curiosity'],
      6: ['nurturing', 'healing', 'love', 'responsibility'],
      7: ['spiritual', 'wisdom', 'intuition', 'mystical'],
      8: ['abundance', 'power', 'material', 'achievement'],
      9: ['completion', 'wisdom', 'humanitarian', 'universal'],
      11: ['intuition', 'spiritual', 'awakening', 'psychic'],
      22: ['manifestation', 'master', 'building', 'vision'],
      33: ['healing', 'teaching', 'service', 'compassion'],
    };

    const universalProperties =
      numerologyProperties[dailyInfluences.universalDay] || [];
    universalProperties.forEach((prop) => {
      if (crystal.properties.includes(prop)) score += 7;
    });

    // Personal Day Number influence (NEW)
    const personalProperties =
      numerologyProperties[dailyInfluences.personalDay] || [];
    personalProperties.forEach((prop) => {
      if (crystal.properties.includes(prop)) score += 9; // Higher weight for personal
    });

    // Day of week specific boosts (NEW)
    const dayBoosts: Record<number, string[]> = {
      0: ['spiritual', 'confidence', 'solar'], // Sunday - Sun
      1: ['intuition', 'emotional', 'lunar'], // Monday - Moon
      2: ['courage', 'action', 'mars'], // Tuesday - Mars
      3: ['communication', 'learning', 'mercury'], // Wednesday - Mercury
      4: ['wisdom', 'expansion', 'jupiter'], // Thursday - Jupiter
      5: ['love', 'beauty', 'venus'], // Friday - Venus
      6: ['grounding', 'discipline', 'saturn'], // Saturday - Saturn
    };

    const todaysBoosts = dayBoosts[dailyInfluences.dayOfWeek] || [];
    todaysBoosts.forEach((boost) => {
      if (crystal.properties.includes(boost)) score += 6;
    });

    // Aspect compatibility
    aspects.forEach((aspect) => {
      if (crystal.aspects.includes(aspect.type)) score += 6;
      if (
        crystal.aspects.includes(
          `${aspect.transitPlanet.toLowerCase()}-aspects`,
        )
      )
        score += 5;
      if (
        crystal.aspects.includes(`${aspect.natalPlanet.toLowerCase()}-aspects`)
      )
        score += 5;
    });

    // Current planetary emphases
    if (transitMercury && crystal.properties.includes('mercury')) score += 7;
    if (transitVenus && crystal.properties.includes('love')) score += 7;
    if (transitMars && crystal.properties.includes('mars')) score += 7;
    if (transitJupiter && crystal.properties.includes('jupiter')) score += 7;

    // Element compatibility with birth chart
    const fireSignsInChart = birthChart.filter((p) =>
      ['Aries', 'Leo', 'Sagittarius'].includes(p.sign),
    );
    const earthSignsInChart = birthChart.filter((p) =>
      ['Taurus', 'Virgo', 'Capricorn'].includes(p.sign),
    );
    const airSignsInChart = birthChart.filter((p) =>
      ['Gemini', 'Libra', 'Aquarius'].includes(p.sign),
    );
    const waterSignsInChart = birthChart.filter((p) =>
      ['Cancer', 'Scorpio', 'Pisces'].includes(p.sign),
    );

    if (fireSignsInChart.length >= 3 && crystal.properties.includes('solar'))
      score += 5;
    if (
      earthSignsInChart.length >= 3 &&
      crystal.properties.includes('grounding')
    )
      score += 5;
    if (airSignsInChart.length >= 3 && crystal.properties.includes('clarity'))
      score += 5;
    if (
      waterSignsInChart.length >= 3 &&
      crystal.properties.includes('intuition')
    )
      score += 5;

    // Challenging aspects need protection/grounding
    const hasChallengingAspects = aspects.some(
      (a) => a.type === 'square' || a.type === 'opposition',
    );
    if (hasChallengingAspects && crystal.properties.includes('protection'))
      score += 8;
    if (hasChallengingAspects && crystal.properties.includes('grounding'))
      score += 6;

    // Harmonious aspects support manifestation/growth
    const hasHarmoniousAspects = aspects.some(
      (a) => a.type === 'trine' || a.type === 'sextile',
    );
    if (hasHarmoniousAspects && crystal.properties.includes('manifestation'))
      score += 6;
    if (hasHarmoniousAspects && crystal.properties.includes('abundance'))
      score += 5;

    // Add strong deterministic daily variation based on date + crystal name
    const dateNumber = parseInt(dailyInfluences.dateString.replace(/-/g, ''));
    const crystalSeed =
      crystal.name.length +
      crystal.name.charCodeAt(0) +
      crystal.name.charCodeAt(crystal.name.length - 1);

    // Create more significant daily variation (0-20 points)
    const dailyVariation =
      (dateNumber + crystalSeed + dailyInfluences.dayOfWeek * 13) % 21;

    // Add extra boost to prevent same crystal appearing consecutive days
    const yesterdayNumber = dateNumber - 1;
    const yesterdayVariation =
      (yesterdayNumber +
        crystalSeed +
        ((dailyInfluences.dayOfWeek - 1 + 7) % 7) * 13) %
      21;

    // Penalize if this crystal would have been top choice yesterday
    if (yesterdayVariation >= 15) {
      score -= 10; // Significant penalty for yesterday's likely winner
    }

    score += dailyVariation;

    scores[crystal.name] = score;
  });

  // Get top 5 crystals to ensure variety
  const sortedCrystals = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Use date-based rotation within top choices to prevent repetition
  const dateHash = parseInt(dailyInfluences.dateString.replace(/-/g, ''));
  const rotationIndex = dateHash % sortedCrystals.length;
  const selectedCrystalName = sortedCrystals[rotationIndex][0];

  return (
    crystalDatabase.find((crystal) => crystal.name === selectedCrystalName) ||
    crystalDatabase[0]
  );
};

const calculateKeyAspects = (
  birthChart: BirthChartData[],
  currentTransits: any[],
) => {
  const aspects = [];

  // Check transiting planets against natal planets
  for (const transit of currentTransits) {
    for (const natal of birthChart) {
      let diff = Math.abs(transit.eclipticLongitude - natal.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      // Check for major aspects
      if (Math.abs(diff - 0) <= 10) {
        aspects.push({
          type: 'conjunction',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 0),
        });
      } else if (Math.abs(diff - 180) <= 10) {
        aspects.push({
          type: 'opposition',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 180),
        });
      } else if (Math.abs(diff - 120) <= 8) {
        aspects.push({
          type: 'trine',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 120),
        });
      } else if (Math.abs(diff - 90) <= 8) {
        aspects.push({
          type: 'square',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 90),
        });
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
};

const getCrystalGuidance = (
  crystal: Crystal,
  sunSign: string,
  today: Date,
  userBirthday?: string,
): string => {
  const dailyInfluences = getDailyInfluences(today, userBirthday);

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayName = dayNames[dailyInfluences.dayOfWeek];

  const guidanceTemplates = [
    `This ${todayName}, ${crystal.name} aligns with ${dailyInfluences.planetaryRuler}'s energy to support your ${crystal.properties[0]} nature.`,
    `Your Universal Day ${dailyInfluences.universalDay} calls for ${crystal.name}'s ${crystal.properties.join(' and ')} qualities.`,
    `${crystal.name} resonates with today's ${dailyInfluences.element} element, enhancing your ${sunSign} energy.`,
    `Let ${crystal.name} guide you toward ${crystal.intention.toLowerCase()} on this ${todayName}.`,
    `Today's planetary ruler ${dailyInfluences.planetaryRuler} harmonizes with ${crystal.name} to support your ${crystal.chakra} chakra.`,
    `Your Personal Day ${dailyInfluences.personalDay} energy is amplified by ${crystal.name}'s ${crystal.element} properties.`,
  ];

  // Use date-based selection for consistent daily messages
  const dateNumber = parseInt(dailyInfluences.dateString.replace(/-/g, ''));
  const templateIndex = dateNumber % guidanceTemplates.length;

  return guidanceTemplates[templateIndex];
};

export const CrystalWidget = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const [observer, setObserver] = useState<any>(null);

  // Lazy load astronomy-engine
  useEffect(() => {
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, []);

  const hasChartAccess = hasBirthChartAccess(subscription.status);

  // Get birth chart data (needed for hooks)
  const hasBirthChartData = hasBirthChart(me?.profile);
  const birthChart = hasBirthChartData
    ? getBirthChartFromProfile(me?.profile)
    : null;

  // Memoize general crystal for non-premium users
  const generalCrystal = useMemo(() => {
    if (hasChartAccess) return null;
    return getGeneralCrystalRecommendation();
  }, [hasChartAccess]);

  // Memoize crystal calculation to ensure it's seeded and deterministic
  // Calculate stable date string once - will be same for entire day
  const todayDateString = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }, []);

  const crystalData = useMemo(() => {
    if (!birthChart || !userBirthday || !observer) return null;

    // Use the date string to create a stable Date object for the day
    const today = new Date(todayDateString + 'T12:00:00'); // Use noon to avoid timezone issues
    const currentTransits = getAstrologicalChart(today, observer);

    const recommendedCrystal = calculateCrystalRecommendation(
      birthChart,
      currentTransits,
      today,
      userBirthday,
    );
    const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
    const guidance = getCrystalGuidance(
      recommendedCrystal,
      sunSign,
      today,
      userBirthday,
    );

    return {
      crystal: recommendedCrystal,
      guidance,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayDateString, userBirthday, observer, JSON.stringify(birthChart)]);

  // If user doesn't have birth chart access, show general crystal recommendation
  if (!hasChartAccess) {
    if (!generalCrystal) return null;

    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col'>
        <div className='space-y-2'>
          {/* <div className='flex items-center justify-between'>
            <h3 className='font-bold'>Crystal Energy</h3>
            <div className='text-lg'>💎</div>
          </div> */}

          <div className='space-y-2'>
            <div className='text-center'>
              <h4 className='font-semibold text-purple-300'>
                {generalCrystal.name}
              </h4>
              <p className='text-xs text-zinc-400'>
                {generalCrystal.properties.slice(0, 3).join(' • ')}
              </p>
            </div>

            <p className='text-xs text-zinc-300'>{generalCrystal.reason}</p>
          </div>

          <div className='bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded p-2 border border-purple-500/20'>
            {/* <p className='text-xs text-purple-200 mb-1'>
              💎 Start Your Free Trial
            </p> */}
            <p className='text-xs text-zinc-400 mb-2'>
              Get crystals chosen specifically for YOUR birth chart. See what
              the universe has selected for you!
            </p>
            <SmartTrialButton variant='link' />
          </div>
        </div>
      </div>
    );
  }

  // For premium users, we need both profile data AND subscription access
  if (!me || !userBirthday) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Crystal</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
          <div className='text-4xl mb-2'>💎</div>
          <p className='text-zinc-400 text-xs mb-2'>
            Add your birthday for personalized crystal guidance
          </p>
          <Link href='/profile' className='text-blue-400 text-xs underline'>
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!birthChart) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Crystal</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
          <div className='text-4xl mb-2'>🔮</div>
          <p className='text-zinc-400 text-xs'>
            Calculating your crystal alignment...
          </p>
        </div>
      </div>
    );
  }

  if (!crystalData) {
    return (
      <div className='py-3 px-4 border border-stone-800 rounded-md w-full h-full flex flex-col'>
        <div className='text-center'>
          <h3 className='font-bold mb-2'>Personal Crystal</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
          <div className='text-4xl mb-2'>🔮</div>
          <p className='text-zinc-400 text-xs'>
            Calculating your crystal alignment...
          </p>
        </div>
      </div>
    );
  }

  const recommendedCrystal = crystalData.crystal;
  const guidance = crystalData.guidance;

  return (
    <div className='py-3 px-4 border border-stone-800 rounded-md w-full'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>Personal Crystal</h3>
          <span className='text-xs text-purple-400'>Personalised</span>
        </div>

        <div className='text-center mb-3'>
          <div className='text-md font-semibold text-white'>
            {recommendedCrystal.name}
          </div>
          <div className='text-xs text-zinc-400 mb-2'>
            {recommendedCrystal.chakra} Chakra
          </div>
        </div>

        <div className='text-center text-sm text-zinc-300 leading-relaxed mb-3'>
          <p className='mb-2'>{recommendedCrystal.description}</p>
          <p className='text-xs text-zinc-400'>{guidance}</p>
        </div>

        <div className='text-center mb-3'>
          <div className='text-xs text-zinc-500 italic'>
            &quot;{recommendedCrystal.intention}&quot;
          </div>
        </div>
      </div>
    </div>
  );
  <div className='py-3 px-4 border border-stone-800 rounded-md w-full relative'>
    {/* Info Icon with Popover */}
    <Popover.Root>
      <Popover.Trigger className='absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors'>
        <Info size={14} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className='bg-zinc-800 border border-zinc-700 rounded-lg p-4 max-w-sm text-xs text-zinc-300 shadow-lg z-50'>
            <div className='space-y-3'>
              <div>
                <h4 className='font-semibold text-white mb-2'>
                  Crystal Selection Process
                </h4>
                <p className='mb-2'>Your daily crystal is calculated using:</p>
                <ul className='list-disc list-inside space-y-1 text-zinc-400'>
                  <li>Your birth chart placements (Sun, Moon, planets)</li>
                  <li>Current planetary positions and transits</li>
                  <li>Today&apos;s numerological vibration</li>
                  <li>Day-of-week planetary ruler energies</li>
                  <li>Astrological aspects and alignments</li>
                </ul>
              </div>
              <div>
                <p className='text-zinc-400'>
                  Each crystal&apos;s properties are matched against these
                  cosmic factors to find your most beneficial stone for the day.
                </p>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>

    <div className='text-center mb-3'>
      <div className='text-md font-semibold text-white'>
        {recommendedCrystal.name}
      </div>
      <div className='text-xs text-zinc-400 mb-2'>
        {recommendedCrystal.chakra} Chakra
      </div>
    </div>

    <div className='text-center text-sm text-zinc-300 leading-relaxed mb-3'>
      <p className='mb-2'>{recommendedCrystal.description}</p>
      <p className='text-xs text-zinc-400'>{guidance}</p>
    </div>

    <div className='text-center mb-3'>
      <div className='text-xs text-zinc-500 italic'>
        &quot;{recommendedCrystal.intention}&quot;
      </div>
    </div>
  </div>;
};
