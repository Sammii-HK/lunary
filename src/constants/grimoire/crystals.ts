// Comprehensive Crystal Database - Single Source of Truth
export interface Crystal {
  id: string;
  name: string;
  alternativeNames?: string[];
  properties: string[];
  categories: string[];
  chakras: string[];
  elements: string[];
  zodiacSigns: string[];
  moonPhases: string[];
  planets: string[];
  intentions: string[];
  colors: string[];
  hardness?: number;
  origin?: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare';
  description: string;
  metaphysicalProperties: string;
  physicalProperties?: string;
  historicalUse?: string;
  workingWith: {
    meditation: string;
    spellwork: string;
    healing: string;
    manifestation: string;
  };
  careInstructions: {
    cleansing: string[];
    charging: string[];
    programming: string;
  };
  combinations: {
    enhances: string[];
    complements: string[];
    avoid?: string[];
  };
  correspondences: {
    herbs: string[];
    incense: string[];
    oils: string[];
    numbers: number[];
    tarot: string[];
  };
}

export const crystalDatabase: Crystal[] = [
  {
    id: 'amethyst',
    name: 'Amethyst',
    alternativeNames: ['Purple Quartz', "Bishop's Stone"],
    properties: [
      'intuition',
      'spiritual growth',
      'calming',
      'protection',
      'clarity',
      'sobriety',
    ],
    categories: [
      'Spiritual & Intuitive',
      'Healing & Wellness',
      'Protection & Grounding',
    ],
    chakras: ['Crown', 'Third Eye'],
    elements: ['Air', 'Water'],
    zodiacSigns: ['Pisces', 'Aquarius', 'Sagittarius', 'Capricorn'],
    moonPhases: ['Full Moon', 'New Moon', 'Waning Moon'],
    planets: ['Neptune', 'Jupiter', 'Moon'],
    intentions: [
      'spiritual awakening',
      'meditation',
      'psychic protection',
      'addiction recovery',
      'stress relief',
    ],
    colors: ['Purple', 'Violet', 'Lavender', 'Deep Purple'],
    hardness: 7,
    origin: ['Brazil', 'Uruguay', 'Russia', 'South Korea', 'United States'],
    rarity: 'common',
    description:
      'A powerful spiritual stone that opens the third eye and connects you to higher wisdom',
    metaphysicalProperties:
      'Enhances spiritual awareness, promotes sobriety, calms the mind, and provides protection during spiritual work. Known as the stone of spiritual transformation.',
    physicalProperties:
      'Silicon dioxide crystal with iron and aluminum impurities creating the purple color',
    historicalUse:
      'Used by ancient Greeks to prevent intoxication, worn by bishops as a symbol of spiritual royalty',
    workingWith: {
      meditation:
        'Hold during meditation to enhance spiritual connection and receive divine guidance',
      spellwork:
        'Use in protection spells, dream work, and psychic development rituals',
      healing:
        'Place on third eye or crown chakra for spiritual healing and mental clarity',
      manifestation:
        'Helps manifest spiritual goals and higher purpose alignment',
    },
    careInstructions: {
      cleansing: [
        'moonlight',
        'sage smoke',
        'sound cleansing',
        'running water',
      ],
      charging: ['full moon', 'amethyst cluster', 'selenite', 'meditation'],
      programming:
        'Hold while stating your spiritual intentions clearly and with conviction',
    },
    combinations: {
      enhances: ['Clear Quartz', 'Selenite', 'Labradorite'],
      complements: ['Rose Quartz', 'Moonstone', 'Fluorite'],
      avoid: ['direct sunlight for extended periods'],
    },
    correspondences: {
      herbs: ['Lavender', 'Mugwort', 'Frankincense', 'Rosemary'],
      incense: ['Frankincense', 'Sandalwood', 'Lavender'],
      oils: ['Lavender', 'Frankincense', 'Clary Sage'],
      numbers: [3, 7, 9],
      tarot: ['The High Priestess', 'The Hermit', 'Temperance'],
    },
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    alternativeNames: ['Pink Quartz', 'Love Stone', 'Heart Stone'],
    properties: [
      'love',
      'emotional healing',
      'self-compassion',
      'relationships',
      'heart opening',
      'forgiveness',
    ],
    categories: ['Love & Heart Healing', 'Healing & Wellness'],
    chakras: ['Heart', 'Higher Heart'],
    elements: ['Water', 'Earth'],
    zodiacSigns: ['Taurus', 'Libra', 'Cancer', 'Pisces'],
    moonPhases: ['Full Moon', 'Waxing Moon', 'New Moon'],
    planets: ['Venus', 'Moon'],
    intentions: [
      'self-love',
      'attracting love',
      'healing relationships',
      'emotional balance',
      'compassion',
    ],
    colors: ['Pink', 'Rose', 'Pale Pink', 'Deep Rose'],
    hardness: 7,
    origin: ['Brazil', 'Madagascar', 'India', 'South Africa', 'United States'],
    rarity: 'common',
    description:
      'The ultimate stone of unconditional love that soothes emotional wounds and attracts loving relationships',
    metaphysicalProperties:
      'Opens the heart chakra to all forms of love, promotes self-acceptance, heals emotional trauma, and attracts romantic partnerships. Known as the stone of unconditional love.',
    physicalProperties:
      'Silicon dioxide with traces of titanium, iron, or manganese creating the pink color',
    historicalUse:
      'Sacred to Aphrodite and Venus, used in love magic throughout history, given as tokens of affection',
    workingWith: {
      meditation:
        'Hold over heart chakra to open to love and heal emotional wounds',
      spellwork:
        'Essential for love spells, self-love rituals, and relationship healing work',
      healing:
        'Use for emotional healing, trauma recovery, and heart chakra balancing',
      manifestation: 'Helps manifest loving relationships and self-acceptance',
    },
    careInstructions: {
      cleansing: [
        'moonlight',
        'rose water',
        'sound cleansing',
        'gentle running water',
      ],
      charging: ['full moon', 'rose quartz cluster', 'heart chakra meditation'],
      programming:
        "Hold while focusing on love and stating your heart's desires",
    },
    combinations: {
      enhances: ['Green Aventurine', 'Rhodonite', 'Kunzite'],
      complements: ['Clear Quartz', 'Amethyst', 'Moonstone'],
    },
    correspondences: {
      herbs: ['Rose', 'Lavender', 'Jasmine', 'Hibiscus'],
      incense: ['Rose', 'Jasmine', 'Ylang Ylang'],
      oils: ['Rose', 'Geranium', 'Palmarosa'],
      numbers: [2, 6, 7],
      tarot: ['The Lovers', 'Two of Cups', 'Empress'],
    },
  },
  {
    id: 'clear-quartz',
    name: 'Clear Quartz',
    alternativeNames: ['Rock Crystal', 'Master Healer', 'Crystal Quartz'],
    properties: [
      'amplification',
      'clarity',
      'universal healing',
      'energy enhancement',
      'programmability',
    ],
    categories: [
      'Healing & Wellness',
      'Communication & Clarity',
      'Manifestation & Abundance',
    ],
    chakras: ['Crown', 'All Chakras'],
    elements: ['All Elements', 'Spirit'],
    zodiacSigns: ['All Signs', 'Aries', 'Leo', 'Capricorn'],
    moonPhases: ['All Moon Phases'],
    planets: ['Sun', 'Moon', 'All Planets'],
    intentions: [
      'amplification',
      'clarity',
      'healing',
      'manifestation',
      'spiritual connection',
    ],
    colors: ['Clear', 'White', 'Transparent'],
    hardness: 7,
    origin: ['Brazil', 'Arkansas USA', 'Madagascar', 'Tibet', 'Worldwide'],
    rarity: 'common',
    description:
      'The master healer that amplifies energy and intention while bringing clarity to all situations',
    metaphysicalProperties:
      'Amplifies the energy of other crystals and intentions, provides mental clarity, enhances spiritual connection, and can be programmed for any purpose. The most versatile healing stone.',
    physicalProperties:
      'Pure silicon dioxide crystal with perfect hexagonal structure',
    historicalUse:
      'Used by ancient civilizations for scrying, healing, and spiritual ceremonies across all cultures',
    workingWith: {
      meditation:
        'Hold to amplify meditation and receive clear guidance from higher realms',
      spellwork:
        'Essential for all magical work - amplifies intentions and other crystal energies',
      healing:
        'Master healer that can be used for any healing purpose and chakra work',
      manifestation:
        'Programs easily for any manifestation goal and amplifies visualization',
    },
    careInstructions: {
      cleansing: [
        'all methods safe',
        'sunlight',
        'moonlight',
        'water',
        'sage',
        'sound',
      ],
      charging: ['sunlight', 'moonlight', 'earth burial', 'other crystals'],
      programming:
        'Extremely programmable - hold while clearly stating your intention',
    },
    combinations: {
      enhances: ['All crystals', 'Amplifies any stone'],
      complements: ['Works with everything'],
    },
    correspondences: {
      herbs: ['All herbs', 'White Sage', 'Frankincense', 'Cedar'],
      incense: ['Frankincense', 'Sandalwood', 'White Sage'],
      oils: ['Frankincense', 'Sandalwood', 'Clear Quartz Essence'],
      numbers: [1, 4, 7],
      tarot: ['The Magician', 'Ace of Wands', 'The World'],
    },
  },
  // Add more crystals following the same comprehensive structure...
  {
    id: 'black-tourmaline',
    name: 'Black Tourmaline',
    alternativeNames: ['Schorl', 'Tourmaline Noir'],
    properties: [
      'protection',
      'grounding',
      'EMF protection',
      'negativity clearing',
      'psychic shield',
    ],
    categories: ['Protection & Grounding'],
    chakras: ['Root', 'Earth Star'],
    elements: ['Earth'],
    zodiacSigns: ['Scorpio', 'Capricorn', 'Virgo'],
    moonPhases: ['Waning Moon', 'Dark Moon', 'New Moon'],
    planets: ['Saturn', 'Mars', 'Pluto'],
    intentions: [
      'psychic protection',
      'grounding',
      'EMF shielding',
      'negativity removal',
      'energetic boundaries',
    ],
    colors: ['Black', 'Deep Black'],
    hardness: 7.5,
    origin: ['Brazil', 'Afghanistan', 'United States', 'Pakistan', 'Kenya'],
    rarity: 'common',
    description:
      'The ultimate protection stone that creates an energetic shield and grounds excess energy',
    metaphysicalProperties:
      'Creates powerful protective barriers against negative energy, EMF radiation, and psychic attacks. Grounds scattered energy and promotes emotional stability.',
    physicalProperties:
      'Complex borosilicate mineral with natural electrical properties',
    historicalUse:
      'Used by shamans and healers for protection during spiritual work, carried by travelers for safety',
    workingWith: {
      meditation:
        'Hold for grounding and protection during deep spiritual work',
      spellwork:
        'Essential for protection spells, banishing rituals, and boundary work',
      healing: 'Use for energetic protection and grounding scattered energy',
      manifestation:
        'Helps ground manifestation work and protect from interference',
    },
    careInstructions: {
      cleansing: [
        'earth burial',
        'sage smoke',
        'sound cleansing',
        'running water',
      ],
      charging: ['earth connection', 'hematite', 'new moon'],
      programming:
        'Hold while visualizing protective barriers and stating protective intentions',
    },
    combinations: {
      enhances: ['Hematite', 'Smoky Quartz', 'Obsidian'],
      complements: ['Clear Quartz', 'Selenite', 'Amethyst'],
    },
    correspondences: {
      herbs: ['Sage', 'Rosemary', 'Basil', 'Salt', 'Iron'],
      incense: ["Dragon's Blood", 'Frankincense', 'Myrrh'],
      oils: ['Rosemary', 'Basil', 'Frankincense'],
      numbers: [1, 3, 8],
      tarot: ['The Tower', 'Ten of Swords', 'Four of Pentacles'],
    },
  },
];

// Helper functions for crystal data
export const getCrystalById = (id: string): Crystal | undefined => {
  return crystalDatabase.find((crystal) => crystal.id === id);
};

export const getCrystalsByCategory = (category: string): Crystal[] => {
  return crystalDatabase.filter((crystal) =>
    crystal.categories.includes(category),
  );
};

export const getCrystalsByIntention = (intention: string): Crystal[] => {
  return crystalDatabase.filter((crystal) =>
    crystal.intentions.some((intent) =>
      intent.toLowerCase().includes(intention.toLowerCase()),
    ),
  );
};

export const getCrystalsByZodiacSign = (sign: string): Crystal[] => {
  return crystalDatabase.filter(
    (crystal) =>
      crystal.zodiacSigns.includes(sign) ||
      crystal.zodiacSigns.includes('All Signs'),
  );
};

export const getCrystalsByMoonPhase = (phase: string): Crystal[] => {
  return crystalDatabase.filter(
    (crystal) =>
      crystal.moonPhases.includes(phase) ||
      crystal.moonPhases.includes('All Moon Phases'),
  );
};

export const getCrystalsByChakra = (chakra: string): Crystal[] => {
  return crystalDatabase.filter(
    (crystal) =>
      crystal.chakras.includes(chakra) ||
      crystal.chakras.includes('All Chakras'),
  );
};

export const searchCrystals = (query: string): Crystal[] => {
  const searchTerm = query.toLowerCase();
  return crystalDatabase.filter(
    (crystal) =>
      crystal.name.toLowerCase().includes(searchTerm) ||
      crystal.alternativeNames?.some((name) =>
        name.toLowerCase().includes(searchTerm),
      ) ||
      crystal.properties.some((prop) =>
        prop.toLowerCase().includes(searchTerm),
      ) ||
      crystal.intentions.some((intent) =>
        intent.toLowerCase().includes(searchTerm),
      ) ||
      crystal.description.toLowerCase().includes(searchTerm),
  );
};

export const getRandomCrystal = (): Crystal => {
  const randomIndex = Math.floor(Math.random() * crystalDatabase.length);
  return crystalDatabase[randomIndex];
};

export const crystalCategories = [
  'Protection & Grounding',
  'Love & Heart Healing',
  'Spiritual & Intuitive',
  'Manifestation & Abundance',
  'Healing & Wellness',
  'Communication & Clarity',
  'Creativity & Inspiration',
  'Balance & Harmony',
];

export const crystalChakras = [
  'Root',
  'Sacral',
  'Solar Plexus',
  'Heart',
  'Throat',
  'Third Eye',
  'Crown',
  'All Chakras',
];

export const crystalElements = [
  'Fire',
  'Water',
  'Earth',
  'Air',
  'Spirit',
  'All Elements',
];
