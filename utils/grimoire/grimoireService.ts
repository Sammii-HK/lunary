// Centralized grimoire service - consolidates all magical data
import { crystalDatabase, crystalCategories, getCrystalsByIntention, getCrystalsByCategory } from './crystalData';
import { spells, spellCategories, getSpellById } from '../../src/constants/spells';
import { runesList } from '../../src/constants/runes';
import { wiccanWeek } from '../../src/constants/weekDays';
import { wheelOfTheYearSabbats } from '../../src/constants/sabbats';

export interface GrimoireCorrespondences {
  colors: string[];
  crystals: string[];
  herbs: string[];
  elements: string[];
  planets: string[];
  days: string[];
  moonPhases?: string[];
  zodiacSigns?: string[];
  numbers?: number[];
  intentions: string[];
}

export interface PackContent {
  title: string;
  category: string;
  description: string;
  spells: any[];
  crystals: any[];
  correspondences: GrimoireCorrespondences;
  timing: {
    bestDays: string[];
    planetaryHour: string;
    moonPhase: string;
    seasonalNote: string;
  };
  herbs: any[];
  rituals?: any[];
  ethics: string[];
  howToUse: string[];
}

// Comprehensive correspondences from grimoire knowledge
export const grimoireCorrespondences = {
  protection: {
    colors: ['Black', 'White', 'Silver', 'Dark Blue', 'Red'],
    crystals: ['Black Tourmaline', 'Obsidian', 'Clear Quartz', 'Hematite', 'Smoky Quartz', 'Jet', 'Garnet'],
    herbs: ['Sage', 'Rosemary', 'Basil', 'Salt', 'Bay Leaves', 'Rue', 'Vervain', 'Iron'],
    elements: ['Earth', 'Fire'],
    planets: ['Mars', 'Saturn', 'Sun'],
    days: ['Tuesday', 'Saturday', 'Sunday'],
    moonPhases: ['Waning Moon', 'New Moon', 'Dark Moon'],
    zodiacSigns: ['Aries', 'Scorpio', 'Capricorn'],
    numbers: [1, 3, 7, 9],
    intentions: ['protection', 'banishing', 'shielding', 'warding', 'grounding']
  },
  love: {
    colors: ['Pink', 'Red', 'Green', 'Rose', 'Copper'],
    crystals: ['Rose Quartz', 'Emerald', 'Rhodonite', 'Green Aventurine', 'Morganite', 'Kunzite'],
    herbs: ['Rose', 'Jasmine', 'Lavender', 'Cinnamon', 'Vanilla', 'Apple', 'Strawberry', 'Honey'],
    elements: ['Water', 'Earth'],
    planets: ['Venus', 'Moon'],
    days: ['Friday', 'Monday'],
    moonPhases: ['Waxing Moon', 'Full Moon'],
    zodiacSigns: ['Taurus', 'Libra', 'Cancer', 'Pisces'],
    numbers: [2, 6, 7],
    intentions: ['love', 'romance', 'self-love', 'relationships', 'compassion', 'heart healing']
  },
  prosperity: {
    colors: ['Green', 'Gold', 'Silver', 'Brown', 'Yellow'],
    crystals: ['Citrine', 'Pyrite', 'Green Aventurine', 'Clear Quartz', 'Jade', 'Peridot'],
    herbs: ['Basil', 'Cinnamon', 'Bay Leaves', 'Mint', 'Clover', 'Allspice', 'Ginger'],
    elements: ['Earth', 'Fire'],
    planets: ['Jupiter', 'Sun', 'Venus'],
    days: ['Thursday', 'Sunday', 'Friday'],
    moonPhases: ['New Moon', 'Waxing Moon'],
    zodiacSigns: ['Taurus', 'Leo', 'Sagittarius', 'Capricorn'],
    numbers: [3, 8, 9],
    intentions: ['abundance', 'wealth', 'success', 'career', 'manifestation', 'opportunities']
  },
  healing: {
    colors: ['Blue', 'Green', 'White', 'Light Blue', 'Violet'],
    crystals: ['Clear Quartz', 'Amethyst', 'Rose Quartz', 'Fluorite', 'Selenite', 'Aventurine'],
    herbs: ['Eucalyptus', 'Chamomile', 'Lavender', 'Aloe', 'Calendula', 'Lemon Balm'],
    elements: ['Water', 'Earth', 'Air'],
    planets: ['Sun', 'Moon', 'Mercury'],
    days: ['Sunday', 'Monday', 'Wednesday'],
    moonPhases: ['Full Moon', 'Waxing Moon'],
    zodiacSigns: ['Virgo', 'Cancer', 'Pisces'],
    numbers: [4, 6, 9],
    intentions: ['healing', 'wellness', 'restoration', 'balance', 'vitality', 'recovery']
  },
  cleansing: {
    colors: ['White', 'Clear', 'Light Blue', 'Silver'],
    crystals: ['Clear Quartz', 'Selenite', 'Amethyst', 'Black Tourmaline', 'Smoky Quartz'],
    herbs: ['Sage', 'Palo Santo', 'Frankincense', 'Myrrh', 'Salt', 'Lemon'],
    elements: ['Air', 'Fire', 'Water'],
    planets: ['Sun', 'Moon', 'Mercury'],
    days: ['Sunday', 'Monday', 'Wednesday'],
    moonPhases: ['Waning Moon', 'New Moon'],
    zodiacSigns: ['Virgo', 'Gemini'],
    numbers: [1, 3, 7],
    intentions: ['purification', 'clearing', 'cleansing', 'renewal', 'fresh start']
  },
  divination: {
    colors: ['Purple', 'Blue', 'Silver', 'Black', 'Indigo'],
    crystals: ['Amethyst', 'Labradorite', 'Moonstone', 'Lapis Lazuli', 'Fluorite'],
    herbs: ['Mugwort', 'Jasmine', 'Bay Leaves', 'Rosemary', 'Frankincense'],
    elements: ['Air', 'Water'],
    planets: ['Moon', 'Neptune', 'Mercury'],
    days: ['Monday', 'Wednesday'],
    moonPhases: ['Full Moon', 'New Moon'],
    zodiacSigns: ['Pisces', 'Cancer', 'Scorpio', 'Gemini'],
    numbers: [3, 7, 9],
    intentions: ['divination', 'psychic abilities', 'intuition', 'wisdom', 'insight']
  },
  manifestation: {
    colors: ['Gold', 'Yellow', 'Orange', 'White', 'Clear'],
    crystals: ['Citrine', 'Clear Quartz', 'Pyrite', 'Carnelian', 'Sunstone'],
    herbs: ['Cinnamon', 'Bay Leaves', 'Allspice', 'Orange Peel', 'Ginger'],
    elements: ['Fire', 'Air'],
    planets: ['Sun', 'Jupiter', 'Mars'],
    days: ['Sunday', 'Thursday', 'Tuesday'],
    moonPhases: ['New Moon', 'Waxing Moon'],
    zodiacSigns: ['Leo', 'Sagittarius', 'Aries'],
    numbers: [1, 3, 8],
    intentions: ['manifestation', 'goals', 'dreams', 'creation', 'willpower']
  },
  banishing: {
    colors: ['Black', 'Dark Blue', 'Dark Purple', 'Gray'],
    crystals: ['Black Tourmaline', 'Obsidian', 'Hematite', 'Jet', 'Smoky Quartz'],
    herbs: ['Sage', 'Rue', 'Vervain', 'Garlic', 'Onion', 'Salt'],
    elements: ['Fire', 'Earth'],
    planets: ['Saturn', 'Mars', 'Pluto'],
    days: ['Saturday', 'Tuesday'],
    moonPhases: ['Waning Moon', 'Dark Moon'],
    zodiacSigns: ['Scorpio', 'Capricorn', 'Aries'],
    numbers: [3, 7, 9],
    intentions: ['banishing', 'removal', 'breaking', 'ending', 'release']
  }
};

// Generate comprehensive pack content using grimoire data
export const generateGrimoirePack = (category: string, includeRituals: boolean = false): PackContent => {
  const correspondences = grimoireCorrespondences[category as keyof typeof grimoireCorrespondences] || grimoireCorrespondences.protection;
  
  // Get spells from constants
  const categorySpells = spells.filter(spell => spell.category === category);
  
  // Get crystals from grimoire data
  const categoryCrystals = getCrystalsByCategory(getFullCategoryName(category));
  const intentionCrystals = correspondences.intentions.flatMap(intention => 
    getCrystalsByIntention(intention)
  ).slice(0, 5); // Limit to top 5
  
  const allCrystals = [...categoryCrystals, ...intentionCrystals]
    .filter((crystal, index, self) => 
      index === self.findIndex(c => c.name === crystal.name)
    ) // Remove duplicates
    .slice(0, 8); // Limit to 8 crystals

  // Get herbs from correspondences
  const herbs = correspondences.herbs.map(herb => ({
    name: herb,
    properties: getHerbProperties(herb, category),
    uses: getHerbUses(herb, category)
  }));

  // Generate timing based on correspondences
  const timing = {
    bestDays: correspondences.days,
    planetaryHour: `${correspondences.planets[0]} hour for enhanced power`,
    moonPhase: correspondences.moonPhases?.[0] || 'Any phase with clear intention',
    seasonalNote: getSeasonalRecommendation(category)
  };

  return {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Grimoire Pack`,
    category: category,
    description: getCategoryDescription(category),
    spells: categorySpells.map(spell => ({
      id: spell.id,
      title: spell.title,
      purpose: spell.purpose,
      difficulty: spell.difficulty,
      duration: spell.duration,
      ingredients: spell.ingredients,
      steps: spell.steps,
      correspondences: spell.correspondences,
      timing: spell.timing
    })),
    crystals: allCrystals.map(crystal => ({
      name: crystal.name,
      properties: crystal.properties,
      chakra: crystal.chakra,
      element: crystal.element,
      intentions: crystal.intentions,
      colors: crystal.colors,
      usage: `Hold during ${category} work or place on altar for enhanced energy`
    })),
    correspondences: correspondences,
    timing: timing,
    herbs: herbs,
    ...(includeRituals && { rituals: generateRituals(category) }),
    ethics: [
      'Always consider the ethical implications of your work',
      'Respect free will - avoid manipulative magic',
      'Work for the highest good of all involved',
      'Take responsibility for your magical actions',
      'Practice with respect for nature and all beings'
    ],
    howToUse: [
      'Study the correspondences to understand the energy patterns',
      'Choose spells and crystals that resonate with your specific need',
      'Follow timing recommendations for optimal results',
      'Prepare your space and materials mindfully',
      'Work with focused intention and clear purpose',
      'Record your experiences and results in your grimoire',
      'Practice regularly to build your magical skills'
    ]
  };
};

// Helper functions
function getFullCategoryName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'protection': 'Protection & Grounding',
    'love': 'Love & Heart Healing',
    'prosperity': 'Manifestation & Abundance',
    'healing': 'Healing & Wellness',
    'cleansing': 'Healing & Wellness',
    'divination': 'Spiritual & Intuitive',
    'manifestation': 'Manifestation & Abundance',
    'banishing': 'Protection & Grounding'
  };
  return categoryMap[category] || 'Protection & Grounding';
}

function getCategoryDescription(category: string): string {
  const descriptions = {
    protection: 'Essential practices for creating energetic shields, cleansing spaces, and maintaining spiritual boundaries using time-honored grimoire wisdom.',
    love: 'Heart-opening practices for self-love, relationships, and attracting loving connections, drawn from traditional love magic.',
    prosperity: 'Abundance magic to attract wealth, opportunities, and material success through focused intention and natural correspondences.',
    healing: 'Restorative practices for physical, emotional, and spiritual healing using crystal and herbal wisdom.',
    cleansing: 'Purification rituals for clearing negative energy from spaces, objects, and self using traditional methods.',
    divination: 'Practices for enhancing psychic abilities and gaining insight through crystal and herbal allies.',
    manifestation: 'Powerful techniques for bringing desires and goals into reality using natural magical correspondences.',
    banishing: 'Traditional methods for removing negative influences, breaking bad habits, and clearing obstacles.'
  };
  
  return descriptions[category as keyof typeof descriptions] || 'A collection of focused magical practices from grimoire traditions.';
}

function getHerbProperties(herb: string, category: string): string {
  const herbProperties: { [key: string]: string } = {
    'Sage': 'Purification, wisdom, protection, cleansing negative energy',
    'Rosemary': 'Memory, protection, love, mental clarity, remembrance',
    'Basil': 'Prosperity, love, protection, happiness, abundance',
    'Bay Leaves': 'Success, protection, psychic powers, wishes, divination',
    'Cinnamon': 'Success, healing, power, love, prosperity, protection',
    'Lavender': 'Love, protection, sleep, peace, happiness, purification',
    'Rose': 'Love, psychic powers, healing, love divination, luck, protection',
    'Jasmine': 'Love, money, prophetic dreams, spiritual love',
    'Mint': 'Money, love, luck, healing, exorcism, travel, protection',
    'Salt': 'Purification, protection, grounding, blessing, consecration',
    'Frankincense': 'Spirituality, protection, exorcism, consecration',
    'Myrrh': 'Protection, exorcism, healing, spirituality',
    'Mugwort': 'Psychic powers, protection, prophetic dreams, healing',
    'Rue': 'Healing, health, mental powers, exorcism, love'
  };
  
  return herbProperties[herb] || `Powerful herb for ${category} work`;
}

function getHerbUses(herb: string, category: string): string[] {
  const baseUses = [
    'Add to spell bags and charm pouches',
    'Burn as incense during rituals',
    'Use in ritual baths',
    'Sprinkle around sacred space'
  ];
  
  const specificUses: { [key: string]: string[] } = {
    'Sage': ['Smudging and space clearing', 'Wisdom and knowledge spells'],
    'Basil': ['Prosperity spell jars', 'Love and happiness magic'],
    'Rose': ['Love spells and potions', 'Heart healing rituals'],
    'Bay Leaves': ['Write wishes and burn', 'Success and victory magic'],
    'Cinnamon': ['Money drawing spells', 'Power and energy raising']
  };
  
  return [...baseUses, ...(specificUses[herb] || [])];
}

function getSeasonalRecommendation(category: string): string {
  const currentMonth = new Date().getMonth();
  const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];
  const currentSeason = seasons[currentMonth];
  
  const seasonalNotes: { [key: string]: { [key: string]: string } } = {
    protection: {
      'Spring': 'Spring energy supports new protective barriers and fresh starts',
      'Summer': 'Solar energy enhances protective shields and strength',
      'Autumn': 'Harvest season perfect for banishing and clearing',
      'Winter': 'Introspective energy ideal for deep protection work'
    },
    love: {
      'Spring': 'New growth energy perfect for attracting new love',
      'Summer': 'Passionate solar energy enhances romantic connections',
      'Autumn': 'Harvest energy brings relationships to fruition',
      'Winter': 'Reflective time for self-love and inner healing'
    },
    prosperity: {
      'Spring': 'Planting season ideal for new financial ventures',
      'Summer': 'Growth energy supports expanding abundance',
      'Autumn': 'Harvest time for reaping financial rewards',
      'Winter': 'Planning season for future prosperity goals'
    }
  };
  
  return seasonalNotes[category]?.[currentSeason] || `${currentSeason} energy supports this work naturally`;
}

function generateRituals(category: string) {
  return [
    {
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Circle Ritual`,
      description: `A complete ceremonial approach to ${category} work using grimoire traditions`,
      duration: '45-60 minutes',
      participants: '1 or group',
      materials: ['Altar setup', 'Candles', 'Incense', 'Ritual tools', 'Crystals', 'Herbs'],
      preparation: [
        'Cleanse and consecrate your space',
        'Set up altar with appropriate correspondences',
        'Gather all materials mindfully',
        'Center yourself through meditation'
      ],
      steps: [
        'Cast protective circle using traditional methods',
        'Call upon the four elements and their guardians',
        'State your intention clearly and with conviction',
        'Work with chosen spells, crystals, and herbs',
        'Raise and direct energy toward your goal',
        'Thank all energies and entities involved',
        'Close circle and ground excess energy'
      ],
      notes: 'This ritual framework can be adapted for any specific working within this category'
    }
  ];
}

export { crystalDatabase, crystalCategories, spells, spellCategories, runesList, wiccanWeek, wheelOfTheYearSabbats };
