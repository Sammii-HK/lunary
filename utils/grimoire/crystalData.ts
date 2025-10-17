// Centralized crystal data from grimoire - consolidating all crystal information
export interface CrystalData {
  name: string;
  properties: string;
  category: string;
  chakra?: string;
  element?: string;
  zodiacSigns?: string[];
  moonPhases?: string[];
  intentions?: string[];
  colors?: string[];
  astrological?: {
    sunSigns?: string[];
    moonSigns?: string[];
    aspects?: string[];
  };
}

export const crystalCategories = {
  'Protection & Grounding': {
    description: 'Crystals for energetic protection, grounding, and stability',
    element: 'Earth',
    chakras: ['Root', 'Solar Plexus'],
    colors: ['Black', 'Brown', 'Red', 'Dark Green'],
    intentions: ['protection', 'grounding', 'stability', 'strength']
  },
  'Love & Heart Healing': {
    description: 'Crystals for love, relationships, and emotional healing',
    element: 'Water',
    chakras: ['Heart'],
    colors: ['Pink', 'Green', 'Rose'],
    intentions: ['love', 'compassion', 'emotional healing', 'relationships']
  },
  'Spiritual & Intuitive': {
    description: 'Crystals for spiritual development and psychic abilities',
    element: 'Air',
    chakras: ['Third Eye', 'Crown'],
    colors: ['Purple', 'Blue', 'Clear', 'White'],
    intentions: ['intuition', 'spiritual growth', 'psychic abilities', 'meditation']
  },
  'Manifestation & Abundance': {
    description: 'Crystals for prosperity, success, and manifesting goals',
    element: 'Fire',
    chakras: ['Solar Plexus', 'Sacral'],
    colors: ['Gold', 'Yellow', 'Orange', 'Green'],
    intentions: ['abundance', 'manifestation', 'success', 'confidence']
  },
  'Healing & Wellness': {
    description: 'Crystals for physical, emotional, and spiritual healing',
    element: 'Water',
    chakras: ['Heart', 'Throat'],
    colors: ['Blue', 'Green', 'Clear', 'Pink'],
    intentions: ['healing', 'wellness', 'balance', 'restoration']
  },
  'Communication & Clarity': {
    description: 'Crystals for clear communication and mental clarity',
    element: 'Air',
    chakras: ['Throat', 'Third Eye'],
    colors: ['Blue', 'Clear', 'Light Blue'],
    intentions: ['communication', 'clarity', 'truth', 'expression']
  },
  'Creativity & Inspiration': {
    description: 'Crystals for artistic expression and creative flow',
    element: 'Fire',
    chakras: ['Sacral', 'Solar Plexus'],
    colors: ['Orange', 'Yellow', 'Red', 'Multi-colored'],
    intentions: ['creativity', 'inspiration', 'artistic expression', 'passion']
  },
  'Balance & Harmony': {
    description: 'Crystals for creating balance and harmony in life',
    element: 'Earth',
    chakras: ['All Chakras'],
    colors: ['Multi-colored', 'Green', 'Clear'],
    intentions: ['balance', 'harmony', 'peace', 'equilibrium']
  }
};

export const crystalDatabase: CrystalData[] = [
  // Protection & Grounding
  {
    name: 'Black Tourmaline',
    properties: 'Shields from negativity, grounds excess energy, creates protective barrier',
    category: 'Protection & Grounding',
    chakra: 'Root',
    element: 'Earth',
    zodiacSigns: ['Scorpio', 'Capricorn', 'Aries'],
    moonPhases: ['Waning Moon', 'New Moon'],
    intentions: ['protection', 'grounding', 'negativity clearing'],
    colors: ['Black'],
    astrological: {
      sunSigns: ['Scorpio', 'Capricorn', 'Aries'],
      moonSigns: ['Capricorn', 'Scorpio', 'Virgo'],
      aspects: ['mars-aspects', 'saturn-aspects', 'square']
    }
  },
  {
    name: 'Obsidian',
    properties: 'Powerful protection, reveals hidden truths, psychic shield',
    category: 'Protection & Grounding',
    chakra: 'Root',
    element: 'Fire',
    zodiacSigns: ['Scorpio', 'Sagittarius'],
    moonPhases: ['New Moon', 'Waning Moon'],
    intentions: ['protection', 'truth', 'grounding'],
    colors: ['Black'],
  },
  {
    name: 'Hematite',
    properties: 'Mental focus, physical grounding, enhances concentration',
    category: 'Protection & Grounding',
    chakra: 'Root',
    element: 'Earth',
    zodiacSigns: ['Aries', 'Aquarius'],
    moonPhases: ['Any'],
    intentions: ['grounding', 'focus', 'mental clarity'],
    colors: ['Silver', 'Black'],
  },
  {
    name: 'Smoky Quartz',
    properties: 'Gentle grounding, negativity clearing, emotional balance',
    category: 'Protection & Grounding',
    chakra: 'Root',
    element: 'Earth',
    zodiacSigns: ['Scorpio', 'Capricorn'],
    moonPhases: ['Waning Moon'],
    intentions: ['grounding', 'clearing', 'emotional balance'],
    colors: ['Brown', 'Gray'],
  },

  // Love & Heart Healing
  {
    name: 'Rose Quartz',
    properties: 'Unconditional love, emotional healing, self-love, heart opening',
    category: 'Love & Heart Healing',
    chakra: 'Heart',
    element: 'Water',
    zodiacSigns: ['Taurus', 'Libra', 'Cancer'],
    moonPhases: ['Full Moon', 'Waxing Moon'],
    intentions: ['love', 'emotional healing', 'self-compassion'],
    colors: ['Pink', 'Rose'],
    astrological: {
      sunSigns: ['Taurus', 'Libra', 'Cancer'],
      moonSigns: ['Cancer', 'Libra', 'Taurus'],
      aspects: ['venus-aspects', 'trine', 'moon-aspects']
    }
  },
  {
    name: 'Green Aventurine',
    properties: 'Heart chakra healing, good fortune, emotional balance',
    category: 'Love & Heart Healing',
    chakra: 'Heart',
    element: 'Earth',
    zodiacSigns: ['Aries', 'Leo'],
    moonPhases: ['Waxing Moon', 'Full Moon'],
    intentions: ['heart healing', 'luck', 'emotional balance'],
    colors: ['Green'],
  },
  {
    name: 'Emerald',
    properties: 'Divine love, loyalty, partnership, abundance',
    category: 'Love & Heart Healing',
    chakra: 'Heart',
    element: 'Earth',
    zodiacSigns: ['Taurus', 'Gemini'],
    moonPhases: ['Full Moon'],
    intentions: ['divine love', 'loyalty', 'abundance'],
    colors: ['Green'],
  },

  // Spiritual & Intuitive
  {
    name: 'Amethyst',
    properties: 'Third eye opening, spiritual protection, enhances intuition',
    category: 'Spiritual & Intuitive',
    chakra: 'Crown',
    element: 'Air',
    zodiacSigns: ['Pisces', 'Aquarius', 'Sagittarius'],
    moonPhases: ['Full Moon', 'New Moon'],
    intentions: ['spiritual growth', 'intuition', 'protection'],
    colors: ['Purple', 'Violet'],
    astrological: {
      sunSigns: ['Pisces', 'Aquarius', 'Sagittarius'],
      moonSigns: ['Pisces', 'Cancer', 'Scorpio'],
      aspects: ['opposition', 'square', 'conjunction-neptune']
    }
  },
  {
    name: 'Labradorite',
    properties: 'Psychic abilities, transformation, spiritual awakening',
    category: 'Spiritual & Intuitive',
    chakra: 'Third Eye',
    element: 'Air',
    zodiacSigns: ['Leo', 'Scorpio', 'Sagittarius'],
    moonPhases: ['Full Moon', 'New Moon'],
    intentions: ['psychic abilities', 'transformation', 'spiritual awakening'],
    colors: ['Gray', 'Blue', 'Green', 'Gold'],
  },
  {
    name: 'Moonstone',
    properties: 'Lunar cycles, feminine wisdom, intuition, emotional balance',
    category: 'Spiritual & Intuitive',
    chakra: 'Crown',
    element: 'Water',
    zodiacSigns: ['Cancer', 'Libra', 'Scorpio'],
    moonPhases: ['All Moon Phases'],
    intentions: ['lunar connection', 'feminine wisdom', 'intuition'],
    colors: ['White', 'Cream', 'Peach'],
  },

  // Manifestation & Abundance
  {
    name: 'Citrine',
    properties: 'Amplifies personal power, manifests abundance, enhances confidence',
    category: 'Manifestation & Abundance',
    chakra: 'Solar Plexus',
    element: 'Fire',
    zodiacSigns: ['Leo', 'Sagittarius', 'Aries'],
    moonPhases: ['Waxing Moon', 'New Moon'],
    intentions: ['abundance', 'confidence', 'manifestation'],
    colors: ['Yellow', 'Golden'],
    astrological: {
      sunSigns: ['Leo', 'Sagittarius', 'Aries'],
      moonSigns: ['Leo', 'Aries', 'Sagittarius'],
      aspects: ['sun-aspects', 'jupiter-aspects', 'trine']
    }
  },
  {
    name: 'Pyrite',
    properties: 'Attracts wealth, enhances willpower, manifestation stone',
    category: 'Manifestation & Abundance',
    chakra: 'Solar Plexus',
    element: 'Fire',
    zodiacSigns: ['Leo', 'Aries'],
    moonPhases: ['Waxing Moon', 'New Moon'],
    intentions: ['wealth attraction', 'willpower', 'manifestation'],
    colors: ['Gold', 'Metallic'],
  },

  // Healing & Wellness
  {
    name: 'Clear Quartz',
    properties: 'Master healer, amplifies energy, clarity, universal healing',
    category: 'Healing & Wellness',
    chakra: 'All Chakras',
    element: 'All Elements',
    zodiacSigns: ['All Signs'],
    moonPhases: ['All Moon Phases'],
    intentions: ['healing', 'amplification', 'clarity'],
    colors: ['Clear', 'White'],
  },
  {
    name: 'Fluorite',
    properties: 'Mental clarity, spiritual discernment, focus enhancement',
    category: 'Communication & Clarity',
    chakra: 'Third Eye',
    element: 'Air',
    zodiacSigns: ['Pisces', 'Capricorn'],
    moonPhases: ['Waxing Moon'],
    intentions: ['mental clarity', 'focus', 'spiritual discernment'],
    colors: ['Purple', 'Green', 'Blue', 'Clear'],
  },

  // Communication & Clarity
  {
    name: 'Lapis Lazuli',
    properties: 'Third eye wisdom, divine connection, truth speaking',
    category: 'Communication & Clarity',
    chakra: 'Throat',
    element: 'Air',
    zodiacSigns: ['Sagittarius', 'Libra'],
    moonPhases: ['Full Moon'],
    intentions: ['truth', 'wisdom', 'divine connection'],
    colors: ['Blue', 'Gold'],
  },
  {
    name: 'Sodalite',
    properties: 'Logic, rational thinking, emotional balance, truth',
    category: 'Communication & Clarity',
    chakra: 'Throat',
    element: 'Air',
    zodiacSigns: ['Sagittarius'],
    moonPhases: ['Any'],
    intentions: ['logic', 'truth', 'emotional balance'],
    colors: ['Blue', 'White'],
  },

  // Additional comprehensive crystals
  {
    name: 'Carnelian',
    properties: 'Courage, creativity, motivation, personal power',
    category: 'Creativity & Inspiration',
    chakra: 'Sacral',
    element: 'Fire',
    zodiacSigns: ['Aries', 'Leo', 'Virgo'],
    moonPhases: ['Waxing Moon'],
    intentions: ['courage', 'creativity', 'motivation'],
    colors: ['Orange', 'Red'],
  },
  {
    name: 'Amazonite',
    properties: 'Heart-throat connection, truth in love, communication',
    category: 'Communication & Clarity',
    chakra: 'Heart',
    element: 'Water',
    zodiacSigns: ['Virgo'],
    moonPhases: ['Any'],
    intentions: ['truth', 'communication', 'emotional balance'],
    colors: ['Blue-Green', 'Turquoise'],
  }
];

// Helper functions for crystal selection
export const getCrystalsByCategory = (category: string): CrystalData[] => {
  return crystalDatabase.filter(crystal => crystal.category === category);
};

export const getCrystalsByIntention = (intention: string): CrystalData[] => {
  return crystalDatabase.filter(crystal => 
    crystal.intentions?.includes(intention.toLowerCase())
  );
};

export const getCrystalsByZodiacSign = (sign: string): CrystalData[] => {
  return crystalDatabase.filter(crystal => 
    crystal.zodiacSigns?.includes(sign) || crystal.zodiacSigns?.includes('All Signs')
  );
};

export const getCrystalsByMoonPhase = (phase: string): CrystalData[] => {
  return crystalDatabase.filter(crystal => 
    crystal.moonPhases?.includes(phase) || 
    crystal.moonPhases?.includes('All Moon Phases') ||
    crystal.moonPhases?.includes('Any')
  );
};

export const getCrystalsByChakra = (chakra: string): CrystalData[] => {
  return crystalDatabase.filter(crystal => 
    crystal.chakra === chakra || crystal.chakra === 'All Chakras'
  );
};

export const getRandomCrystal = (): CrystalData => {
  const randomIndex = Math.floor(Math.random() * crystalDatabase.length);
  return crystalDatabase[randomIndex];
};

export const getCrystalByName = (name: string): CrystalData | undefined => {
  return crystalDatabase.find(crystal => 
    crystal.name.toLowerCase() === name.toLowerCase()
  );
};
