// export type Constellation

export interface Constellation {
  name: string;
  element: string;
  quality: string;
  rulingPlanet: string;
  symbol: string;
  keywords: string[];
  information: string;
  crystals: string[];
}

export const constellations = {
  aries: {
    name: 'Aries',
    element: 'Fire',
    quality: 'Cardinal',
    rulingPlanet: 'Mars',
    symbol: 'Ram',
    keywords: ['Courage', 'Initiative', 'Leadership'],
    information:
      'Aries is known for its courage, initiative, and leadership. This is a time to take bold actions, start new projects, and assert yourself confidently. Focus on channeling your pioneering spirit and embracing your inner leader.',
    crystals: ['Carnelian', 'Red Jasper'],
  },
  taurus: {
    name: 'Taurus',
    element: 'Earth',
    quality: 'Fixed',
    rulingPlanet: 'Venus',
    symbol: 'Bull',
    keywords: ['Stability', 'Security', 'Sensuality'],
    information:
      "Taurus emphasizes stability, security, and sensuality. It's a time to build solid foundations, enjoy life's pleasures, and value consistency. Focus on practical matters, financial security, and appreciating the beauty around you.",
    crystals: ['Rose Quartz', 'Emerald'],
  },
  gemini: {
    name: 'Gemini',
    element: 'Air',
    quality: 'Mutable',
    rulingPlanet: 'Mercury',
    symbol: 'Twins',
    keywords: ['Adaptability', 'Communication', 'Intellect'],
    information:
      'Gemini is characterized by adaptability, communication, and intellect. This is a time to explore new ideas, connect with others, and stay curious. Focus on learning, sharing knowledge, and staying flexible in your approach.',
    crystals: ['Citrine', 'Agate'],
  },
  cancer: {
    name: 'Cancer',
    element: 'Water',
    quality: 'Cardinal',
    rulingPlanet: 'Moon',
    symbol: 'Crab',
    keywords: ['Nurturing', 'Emotion', 'Home'],
    information:
      "Cancer is associated with nurturing, emotion, and home. It's a time to care for yourself and loved ones, create a cozy home environment, and honor your feelings. Focus on family bonds, emotional well-being, and domestic life.",
    crystals: ['Moonstone', 'Pearl'],
  },
  leo: {
    name: 'Leo',
    element: 'Fire',
    quality: 'Fixed',
    rulingPlanet: 'Sun',
    symbol: 'Lion',
    keywords: ['Creativity', 'Confidence', 'Generosity'],
    information:
      'Leo shines with creativity, confidence, and generosity. This is a time to express your talents, lead with confidence, and give generously. Focus on creative projects, self-expression, and inspiring others with your charisma.',
    crystals: ['Sunstone', 'Citrine'],
  },
  virgo: {
    name: 'Virgo',
    element: 'Earth',
    quality: 'Mutable',
    rulingPlanet: 'Mercury',
    symbol: 'Maiden',
    keywords: ['Analysis', 'Perfection', 'Service'],
    information:
      "Virgo values analysis, perfection, and service. It's a time to focus on details, improve your skills, and be of service to others. Embrace organization, practical tasks, and a healthy lifestyle.",
    crystals: ['Peridot', 'Jade'],
  },
  libra: {
    name: 'Libra',
    element: 'Air',
    quality: 'Cardinal',
    rulingPlanet: 'Venus',
    symbol: 'Scales',
    keywords: ['Balance', 'Harmony', 'Relationships'],
    information:
      'Libra seeks balance, harmony, and relationships. This is a time to cultivate partnerships, seek fairness, and create beauty. Focus on social connections, diplomacy, and finding equilibrium in all areas of life.',
    crystals: ['Lapis Lazuli', 'Opal'],
  },
  scorpio: {
    name: 'Scorpio',
    element: 'Water',
    quality: 'Fixed',
    rulingPlanet: 'Pluto',
    symbol: 'Scorpion',
    keywords: ['Intensity', 'Transformation', 'Mystery'],
    information:
      "Scorpio is known for its intensity, transformation, and mystery. It's a time to delve deep into your psyche, embrace change, and explore hidden truths. Focus on personal growth, emotional depth, and transformative experiences.",
    crystals: ['Obsidian', 'Malachite'],
  },
  sagittarius: {
    name: 'Sagittarius',
    element: 'Fire',
    quality: 'Mutable',
    rulingPlanet: 'Jupiter',
    symbol: 'Archer',
    keywords: ['Adventure', 'Philosophy', 'Freedom'],
    information:
      'Sagittarius is adventurous, philosophical, and freedom-loving. This is a time to broaden your horizons, seek truth, and embrace new experiences. Focus on travel, higher learning, and expanding your worldview.',
    crystals: ['Lapis Lazuli', 'Amethyst'],
  },
  capricorn: {
    name: 'Capricorn',
    element: 'Earth',
    quality: 'Cardinal',
    rulingPlanet: 'Saturn',
    symbol: 'Goat',
    keywords: ['Ambition', 'Discipline', 'Practicality'],
    information:
      "Capricorn emphasizes ambition, discipline, and practicality. It's a time to set long-term goals, work hard, and stay focused on your ambitions. Focus on career, achieving milestones, and practical planning.",
    crystals: ['Garnet', 'Onyx'],
  },
  aquarius: {
    name: 'Aquarius',
    element: 'Air',
    quality: 'Fixed',
    rulingPlanet: 'Uranus',
    symbol: 'Water Bearer',
    keywords: ['Innovation', 'Individuality', 'Humanitarian'],
    information:
      'Aquarius is innovative, individualistic, and humanitarian. This is a time to embrace your unique qualities, think outside the box, and contribute to the greater good. Focus on social causes, technological advancements, and community.',
    crystals: ['Amethyst', 'Aquamarine'],
  },
  pisces: {
    name: 'Pisces',
    element: 'Water',
    quality: 'Mutable',
    rulingPlanet: 'Neptune',
    symbol: 'Fish',
    keywords: ['Compassion', 'Imagination', 'Spirituality'],
    information:
      "Pisces is compassionate, imaginative, and spiritual. It's a time to connect with your inner self, explore your creativity, and show empathy to others. Focus on your dreams, artistic pursuits, and spiritual growth.",
    crystals: ['Aquamarine', 'Moonstone'],
  },
  ophiuchus: {
    name: 'Ophiuchus',
    element: 'Fire',
    quality: 'Fixed',
    rulingPlanet: 'Jupiter',
    symbol: 'Serpent Bearer',
    keywords: ['Healing', 'Wisdom', 'Rebirth'],
    information:
      'Ophiuchus is associated with healing, wisdom, and rebirth. This is a time to embrace transformation, seek knowledge, and heal old wounds. Focus on personal growth, learning, and rejuvenation.',
    crystals: ['Serpentine', 'Chrysocolla'],
  },
};

// console.log(constellations);
