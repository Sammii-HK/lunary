// Comprehensive Spell Database - Single Source of Truth
export interface Spell {
  id: string;
  title: string;
  alternativeNames?: string[];
  category: string;
  subcategory?: string;
  type:
    | 'spell'
    | 'ritual'
    | 'charm'
    | 'potion'
    | 'candle_magic'
    | 'herb_magic'
    | 'crystal_magic'
    | 'sigil_magic';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  tradition?: string[];
  purpose: string;
  description: string;
  fullDescription?: string;
  duration: string;
  preparationTime?: string;

  timing: {
    moonPhases?: string[];
    sabbats?: string[];
    planetaryDays?: string[];
    planetaryHours?: string[];
    timeOfDay?: string[];
    seasons?: string[];
    bestTiming?: string;
  };

  materials: {
    essential: Array<{
      name: string;
      amount?: string;
      purpose: string;
      substitutes?: string[];
    }>;
    optional?: Array<{
      name: string;
      amount?: string;
      purpose: string;
    }>;
  };

  tools: string[];

  preparation: string[];
  steps: string[];
  visualization?: string[];
  incantations?: Array<{
    text: string;
    timing: string;
    repetitions?: number;
  }>;

  correspondences: {
    elements?: string[];
    colors?: string[];
    crystals?: string[];
    herbs?: string[];
    planets?: string[];
    zodiac?: string[];
    numbers?: number[];
    deities?: string[];
    tarot?: string[];
  };

  variations?: Array<{
    name: string;
    changes: string[];
    purpose: string;
  }>;

  safety: string[];
  ethics: string[];
  aftercare: string[];

  history?: string;
  culturalNotes?: string;
  modernAdaptations?: string[];

  energySignature: {
    intensity: 'low' | 'medium' | 'high' | 'very-high';
    duration: 'instant' | 'hours' | 'days' | 'weeks' | 'months' | 'permanent';
    scope: 'personal' | 'local' | 'distant' | 'universal';
  };

  successIndicators: string[];
  troubleshooting?: Array<{
    issue: string;
    solution: string;
  }>;
}

export const spellDatabase: Spell[] = [
  {
    id: 'daily-protection-shield',
    title: 'Daily Protection Shield',
    alternativeNames: ['Morning Shield Spell', 'Aura Protection'],
    category: 'protection',
    subcategory: 'personal-protection',
    type: 'spell',
    difficulty: 'beginner',
    tradition: ['Modern Witchcraft', 'Energy Work'],
    purpose:
      'Create energetic protection for daily activities and interactions',
    description:
      'A simple yet powerful spell to create a protective energy field around yourself for the day ahead',
    fullDescription:
      'This foundational protection spell creates an energetic barrier that shields you from negative influences, psychic attacks, and unwanted energies throughout your day. Perfect for daily spiritual hygiene.',
    duration: '5-10 minutes',
    preparationTime: '2 minutes',

    timing: {
      moonPhases: ['Any'],
      planetaryDays: ['Any', 'Tuesday', 'Saturday'],
      timeOfDay: ['Morning', 'Before leaving home'],
      bestTiming: 'Every morning upon waking or before leaving home',
    },

    materials: {
      essential: [
        {
          name: 'White candle',
          purpose: 'Represents divine protection and purity',
          substitutes: ['Tea light', 'LED candle', 'Visualization of light'],
        },
        {
          name: 'Salt',
          amount: '1 pinch',
          purpose: 'Purification and protective barrier',
          substitutes: ['Sea salt', 'Himalayan salt', 'Blessed water'],
        },
      ],
      optional: [
        {
          name: 'Black tourmaline',
          purpose: 'Amplifies protective energy',
        },
        {
          name: 'Protective oil',
          amount: '1-2 drops',
          purpose: 'Anoint candle for extra power',
        },
      ],
    },

    tools: ['Lighter/matches'],

    preparation: [
      "Find a quiet space where you won't be disturbed",
      'Cleanse your hands and center yourself',
      'Set up your materials on a clean surface',
      'Take three deep breaths to ground your energy',
    ],

    steps: [
      'Light the white candle while stating your intention for protection',
      'Sprinkle salt in a small circle around the candle',
      'Place your hands over your heart and visualize bright white light surrounding you',
      'Say the incantation with conviction and feeling',
      'Visualize the protective light expanding to surround your entire body',
      'Seal the protection by saying "So mote it be" or "And so it is"',
      'Carry the energy with you throughout the day',
      'Extinguish the candle safely',
    ],

    visualization: [
      'See brilliant white light emanating from your heart center',
      'Watch it expand to create a glowing bubble around your entire body',
      'Feel this light as warm, protective, and impenetrable to negativity',
      'Know that this shield travels with you wherever you go',
    ],

    incantations: [
      {
        text: 'I am protected by divine light, negativity cannot enter my sight. This shield surrounds me night and day, keeping all harm at bay.',
        timing: 'While visualizing the protective light',
        repetitions: 3,
      },
    ],

    correspondences: {
      elements: ['Fire', 'Earth'],
      colors: ['White', 'Silver', 'Gold'],
      crystals: ['Black Tourmaline', 'Clear Quartz', 'Hematite'],
      herbs: ['Sage', 'Rosemary', 'Basil'],
      planets: ['Sun', 'Mars', 'Saturn'],
      numbers: [1, 3, 7],
      deities: ['Archangel Michael', 'Hecate', 'Thor'],
      tarot: ['The Magician', 'Strength', 'The Sun'],
    },

    variations: [
      {
        name: 'Crystal Enhancement',
        changes: [
          'Hold black tourmaline while casting',
          'Place crystals at cardinal directions',
        ],
        purpose: 'Amplify protective energy and ground the spell',
      },
      {
        name: 'Herbal Version',
        changes: [
          'Burn sage or rosemary instead of candle',
          'Carry protective herbs',
        ],
        purpose: 'For those who cannot use candles or prefer plant magic',
      },
    ],

    safety: [
      'Never leave candles unattended',
      'Ensure proper ventilation if burning herbs',
      'Ground yourself after the spell to avoid energy overload',
    ],

    ethics: [
      'This spell only protects - it does not harm others',
      'Protection magic is always ethical when used defensively',
      "Respect others' free will - this doesn't control anyone",
    ],

    aftercare: [
      'Refresh the protection if you feel it weakening',
      'Cleanse your energy at the end of the day',
      'Thank your protective allies and guides',
    ],

    history:
      'Protection spells are among the oldest forms of magic, found in every magical tradition worldwide. This modern version combines elements from various protective practices.',

    energySignature: {
      intensity: 'medium',
      duration: 'hours',
      scope: 'personal',
    },

    successIndicators: [
      'Feeling more confident and secure throughout the day',
      'Noticing negative people or situations bouncing off you',
      'Increased awareness of your energetic boundaries',
      'Sense of being surrounded by protective light',
    ],

    troubleshooting: [
      {
        issue: 'Protection feels weak or ineffective',
        solution:
          'Increase visualization time, use stronger correspondences, or cast during Mars hour',
      },
      {
        issue: 'Feeling drained after casting',
        solution:
          "Ground thoroughly, eat something, and ensure you're not giving your own energy",
      },
    ],
  },
];

export const spellCategories = {
  protection: {
    name: 'Protection',
    description: 'Spells for creating shields, barriers, and safeguards',
    subcategories: [
      'personal-protection',
      'home-protection',
      'travel-protection',
      'psychic-protection',
    ],
  },
  love: {
    name: 'Love & Relationships',
    description:
      'Magic for self-love, attracting love, and strengthening bonds',
    subcategories: [
      'self-love',
      'attracting-love',
      'relationship-healing',
      'friendship',
    ],
  },
  prosperity: {
    name: 'Prosperity & Abundance',
    description: 'Spells for financial success and material abundance',
    subcategories: [
      'money-drawing',
      'career-success',
      'business-prosperity',
      'luck',
    ],
  },
  healing: {
    name: 'Healing & Wellness',
    description:
      'Magical practices for physical, emotional, and spiritual healing',
    subcategories: [
      'physical-healing',
      'emotional-healing',
      'spiritual-healing',
      'energy-healing',
    ],
  },
  cleansing: {
    name: 'Cleansing & Purification',
    description: 'Clearing negative energy from spaces, objects, and self',
    subcategories: [
      'space-clearing',
      'object-cleansing',
      'aura-cleansing',
      'spiritual-cleansing',
    ],
  },
  divination: {
    name: 'Divination & Wisdom',
    description: 'Enhancing psychic abilities and gaining insight',
    subcategories: [
      'scrying',
      'dream-work',
      'psychic-enhancement',
      'oracle-work',
    ],
  },
  manifestation: {
    name: 'Manifestation',
    description: 'Bringing desires and goals into physical reality',
    subcategories: [
      'goal-manifestation',
      'opportunity-creation',
      'reality-shaping',
      'law-of-attraction',
    ],
  },
  banishing: {
    name: 'Banishing & Release',
    description: 'Removing unwanted influences and letting go',
    subcategories: [
      'habit-breaking',
      'entity-removal',
      'cord-cutting',
      'obstacle-removal',
    ],
  },
};

// Helper functions
export const getSpellById = (id: string): Spell | undefined => {
  return spellDatabase.find((spell) => spell.id === id);
};

export const getSpellsByCategory = (category: string): Spell[] => {
  return spellDatabase.filter((spell) => spell.category === category);
};

export const getSpellsByDifficulty = (difficulty: string): Spell[] => {
  return spellDatabase.filter((spell) => spell.difficulty === difficulty);
};

export const getSpellsByMoonPhase = (moonPhase: string): Spell[] => {
  return spellDatabase.filter(
    (spell) =>
      spell.timing.moonPhases?.includes(moonPhase) ||
      spell.timing.moonPhases?.includes('Any'),
  );
};

export const searchSpells = (query: string): Spell[] => {
  const searchTerm = query.toLowerCase();
  return spellDatabase.filter(
    (spell) =>
      spell.title.toLowerCase().includes(searchTerm) ||
      spell.alternativeNames?.some((name) =>
        name.toLowerCase().includes(searchTerm),
      ) ||
      spell.purpose.toLowerCase().includes(searchTerm) ||
      spell.description.toLowerCase().includes(searchTerm) ||
      spell.category.toLowerCase().includes(searchTerm),
  );
};
