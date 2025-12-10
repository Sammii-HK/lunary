// Crystal Types and Helper Functions
// Data is loaded from JSON for better code splitting

export interface Crystal {
  id: string;
  name: string;
  alternativeNames?: string[];
  properties: string[];
  categories: string[];
  chakras: string[];
  elements: string[];
  zodiacSigns: string[];
  sunSigns?: string[];
  moonSigns?: string[];
  aspects?: string[];
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
  ogColor?: string;
  primaryChakra?: string;
  keywords?: string[];
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

// Import crystal data from JSON - this enables tree shaking
import crystalsData from '@/data/crystals.json';

export const crystalDatabase: Crystal[] = crystalsData as Crystal[];

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

// Helper function to get crystal by name (case-insensitive)
export const getCrystalByName = (name: string): Crystal | undefined => {
  return crystalDatabase.find(
    (crystal) =>
      crystal.name.toLowerCase() === name.toLowerCase() ||
      crystal.alternativeNames?.some(
        (alt) => alt.toLowerCase() === name.toLowerCase(),
      ),
  );
};

// Helper function to get OG properties for a crystal
export const getCrystalOGProperties = (
  crystalName: string,
): {
  color: string;
  primaryChakra: string;
  keywords: string[];
} => {
  const crystal = getCrystalByName(crystalName);
  if (!crystal) {
    return {
      color: '#6366F1',
      primaryChakra: 'Crown Chakra',
      keywords: ['Crystal', 'Healing', 'Energy'],
    };
  }
  return {
    color: crystal.ogColor || '#6366F1',
    primaryChakra:
      crystal.primaryChakra || crystal.chakras[0] || 'Crown Chakra',
    keywords: crystal.keywords || crystal.properties.slice(0, 3),
  };
};
