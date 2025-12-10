export interface EntityRelationship {
  name: string;
  type:
    | 'planet'
    | 'zodiac'
    | 'tarot'
    | 'crystal'
    | 'element'
    | 'chakra'
    | 'day';
  url: string;
  description?: string;
}

export const PLANETARY_CORRESPONDENCES: Record<
  string,
  {
    rulesZodiac: string[];
    tarotCard: string;
    tarotUrl: string;
    crystals: string[];
    element: string;
    chakra: string;
    day: string;
    metal?: string;
  }
> = {
  sun: {
    rulesZodiac: ['Leo'],
    tarotCard: 'The Sun',
    tarotUrl: '/grimoire/tarot/the-sun',
    crystals: ['Citrine', 'Sunstone', "Tiger's Eye", 'Amber'],
    element: 'Fire',
    chakra: 'Solar Plexus',
    day: 'Sunday',
    metal: 'Gold',
  },
  moon: {
    rulesZodiac: ['Cancer'],
    tarotCard: 'The High Priestess',
    tarotUrl: '/grimoire/tarot/the-high-priestess',
    crystals: ['Moonstone', 'Selenite', 'Pearl', 'Labradorite'],
    element: 'Water',
    chakra: 'Third Eye',
    day: 'Monday',
    metal: 'Silver',
  },
  mercury: {
    rulesZodiac: ['Gemini', 'Virgo'],
    tarotCard: 'The Magician',
    tarotUrl: '/grimoire/tarot/the-magician',
    crystals: ['Citrine', 'Amazonite', 'Blue Lace Agate', 'Fluorite'],
    element: 'Air',
    chakra: 'Throat',
    day: 'Wednesday',
    metal: 'Mercury (Quicksilver)',
  },
  venus: {
    rulesZodiac: ['Taurus', 'Libra'],
    tarotCard: 'The Empress',
    tarotUrl: '/grimoire/tarot/the-empress',
    crystals: ['Rose Quartz', 'Emerald', 'Jade', 'Malachite'],
    element: 'Earth',
    chakra: 'Heart',
    day: 'Friday',
    metal: 'Copper',
  },
  mars: {
    rulesZodiac: ['Aries', 'Scorpio'],
    tarotCard: 'The Tower',
    tarotUrl: '/grimoire/tarot/the-tower',
    crystals: ['Red Jasper', 'Carnelian', 'Bloodstone', 'Garnet'],
    element: 'Fire',
    chakra: 'Root',
    day: 'Tuesday',
    metal: 'Iron',
  },
  jupiter: {
    rulesZodiac: ['Sagittarius', 'Pisces'],
    tarotCard: 'Wheel of Fortune',
    tarotUrl: '/grimoire/tarot/wheel-of-fortune',
    crystals: ['Amethyst', 'Lapis Lazuli', 'Turquoise', 'Sodalite'],
    element: 'Fire',
    chakra: 'Crown',
    day: 'Thursday',
    metal: 'Tin',
  },
  saturn: {
    rulesZodiac: ['Capricorn', 'Aquarius'],
    tarotCard: 'The World',
    tarotUrl: '/grimoire/tarot/the-world',
    crystals: ['Black Tourmaline', 'Obsidian', 'Onyx', 'Hematite'],
    element: 'Earth',
    chakra: 'Root',
    day: 'Saturday',
    metal: 'Lead',
  },
  uranus: {
    rulesZodiac: ['Aquarius'],
    tarotCard: 'The Fool',
    tarotUrl: '/grimoire/tarot/the-fool',
    crystals: ['Clear Quartz', 'Aquamarine', 'Lepidolite', 'Kunzite'],
    element: 'Air',
    chakra: 'Third Eye',
    day: 'Wednesday',
  },
  neptune: {
    rulesZodiac: ['Pisces'],
    tarotCard: 'The Hanged Man',
    tarotUrl: '/grimoire/tarot/the-hanged-man',
    crystals: ['Amethyst', 'Aquamarine', 'Celestite', 'Fluorite'],
    element: 'Water',
    chakra: 'Third Eye',
    day: 'Monday',
  },
  pluto: {
    rulesZodiac: ['Scorpio'],
    tarotCard: 'Death',
    tarotUrl: '/grimoire/tarot/death',
    crystals: ['Obsidian', 'Smoky Quartz', 'Moldavite', 'Black Tourmaline'],
    element: 'Water',
    chakra: 'Root',
    day: 'Tuesday',
  },
};

export const ZODIAC_CORRESPONDENCES: Record<
  string,
  {
    rulingPlanet: string;
    element: string;
    modality: 'Cardinal' | 'Fixed' | 'Mutable';
    tarotCard: string;
    tarotUrl: string;
    crystals: string[];
    chakra: string;
    bodyPart: string;
  }
> = {
  aries: {
    rulingPlanet: 'Mars',
    element: 'Fire',
    modality: 'Cardinal',
    tarotCard: 'The Emperor',
    tarotUrl: '/grimoire/tarot/the-emperor',
    crystals: ['Red Jasper', 'Carnelian', 'Bloodstone', 'Diamond'],
    chakra: 'Solar Plexus',
    bodyPart: 'Head',
  },
  taurus: {
    rulingPlanet: 'Venus',
    element: 'Earth',
    modality: 'Fixed',
    tarotCard: 'The Hierophant',
    tarotUrl: '/grimoire/tarot/the-hierophant',
    crystals: ['Rose Quartz', 'Emerald', 'Malachite', 'Lapis Lazuli'],
    chakra: 'Throat',
    bodyPart: 'Neck',
  },
  gemini: {
    rulingPlanet: 'Mercury',
    element: 'Air',
    modality: 'Mutable',
    tarotCard: 'The Lovers',
    tarotUrl: '/grimoire/tarot/the-lovers',
    crystals: ['Citrine', 'Agate', "Tiger's Eye", 'Aquamarine'],
    chakra: 'Throat',
    bodyPart: 'Arms, Hands',
  },
  cancer: {
    rulingPlanet: 'Moon',
    element: 'Water',
    modality: 'Cardinal',
    tarotCard: 'The Chariot',
    tarotUrl: '/grimoire/tarot/the-chariot',
    crystals: ['Moonstone', 'Pearl', 'Selenite', 'Opal'],
    chakra: 'Heart',
    bodyPart: 'Chest, Stomach',
  },
  leo: {
    rulingPlanet: 'Sun',
    element: 'Fire',
    modality: 'Fixed',
    tarotCard: 'Strength',
    tarotUrl: '/grimoire/tarot/strength',
    crystals: ['Sunstone', 'Citrine', "Tiger's Eye", 'Amber'],
    chakra: 'Solar Plexus',
    bodyPart: 'Heart, Spine',
  },
  virgo: {
    rulingPlanet: 'Mercury',
    element: 'Earth',
    modality: 'Mutable',
    tarotCard: 'The Hermit',
    tarotUrl: '/grimoire/tarot/the-hermit',
    crystals: ['Amazonite', 'Peridot', 'Moss Agate', 'Sapphire'],
    chakra: 'Throat',
    bodyPart: 'Digestive System',
  },
  libra: {
    rulingPlanet: 'Venus',
    element: 'Air',
    modality: 'Cardinal',
    tarotCard: 'Justice',
    tarotUrl: '/grimoire/tarot/justice',
    crystals: ['Rose Quartz', 'Jade', 'Opal', 'Lepidolite'],
    chakra: 'Heart',
    bodyPart: 'Lower Back, Kidneys',
  },
  scorpio: {
    rulingPlanet: 'Pluto',
    element: 'Water',
    modality: 'Fixed',
    tarotCard: 'Death',
    tarotUrl: '/grimoire/tarot/death',
    crystals: ['Obsidian', 'Malachite', 'Garnet', 'Smoky Quartz'],
    chakra: 'Sacral',
    bodyPart: 'Reproductive System',
  },
  sagittarius: {
    rulingPlanet: 'Jupiter',
    element: 'Fire',
    modality: 'Mutable',
    tarotCard: 'Temperance',
    tarotUrl: '/grimoire/tarot/temperance',
    crystals: ['Turquoise', 'Lapis Lazuli', 'Amethyst', 'Sodalite'],
    chakra: 'Third Eye',
    bodyPart: 'Thighs, Hips',
  },
  capricorn: {
    rulingPlanet: 'Saturn',
    element: 'Earth',
    modality: 'Cardinal',
    tarotCard: 'The Devil',
    tarotUrl: '/grimoire/tarot/the-devil',
    crystals: ['Black Tourmaline', 'Garnet', 'Onyx', 'Jet'],
    chakra: 'Root',
    bodyPart: 'Bones, Knees',
  },
  aquarius: {
    rulingPlanet: 'Uranus',
    element: 'Air',
    modality: 'Fixed',
    tarotCard: 'The Star',
    tarotUrl: '/grimoire/tarot/the-star',
    crystals: ['Amethyst', 'Aquamarine', 'Labradorite', 'Clear Quartz'],
    chakra: 'Third Eye',
    bodyPart: 'Ankles, Circulation',
  },
  pisces: {
    rulingPlanet: 'Neptune',
    element: 'Water',
    modality: 'Mutable',
    tarotCard: 'The Moon',
    tarotUrl: '/grimoire/tarot/the-moon',
    crystals: ['Amethyst', 'Aquamarine', 'Fluorite', 'Moonstone'],
    chakra: 'Crown',
    bodyPart: 'Feet',
  },
};

export const TAROT_MAJOR_ARCANA_CORRESPONDENCES: Record<
  string,
  {
    planet?: string;
    zodiacSign?: string;
    element?: string;
    number: number;
    keywords: string[];
  }
> = {
  'the-fool': {
    planet: 'Uranus',
    number: 0,
    keywords: ['new beginnings', 'innocence', 'spontaneity'],
  },
  'the-magician': {
    planet: 'Mercury',
    number: 1,
    keywords: ['manifestation', 'willpower', 'skill'],
  },
  'the-high-priestess': {
    planet: 'Moon',
    number: 2,
    keywords: ['intuition', 'mystery', 'subconscious'],
  },
  'the-empress': {
    planet: 'Venus',
    number: 3,
    keywords: ['fertility', 'abundance', 'nurturing'],
  },
  'the-emperor': {
    zodiacSign: 'Aries',
    number: 4,
    keywords: ['authority', 'structure', 'leadership'],
  },
  'the-hierophant': {
    zodiacSign: 'Taurus',
    number: 5,
    keywords: ['tradition', 'spirituality', 'guidance'],
  },
  'the-lovers': {
    zodiacSign: 'Gemini',
    number: 6,
    keywords: ['love', 'choices', 'harmony'],
  },
  'the-chariot': {
    zodiacSign: 'Cancer',
    number: 7,
    keywords: ['willpower', 'determination', 'victory'],
  },
  strength: {
    zodiacSign: 'Leo',
    number: 8,
    keywords: ['courage', 'patience', 'inner strength'],
  },
  'the-hermit': {
    zodiacSign: 'Virgo',
    number: 9,
    keywords: ['introspection', 'wisdom', 'solitude'],
  },
  'wheel-of-fortune': {
    planet: 'Jupiter',
    number: 10,
    keywords: ['cycles', 'fate', 'change'],
  },
  justice: {
    zodiacSign: 'Libra',
    number: 11,
    keywords: ['fairness', 'truth', 'balance'],
  },
  'the-hanged-man': {
    planet: 'Neptune',
    number: 12,
    keywords: ['surrender', 'perspective', 'sacrifice'],
  },
  death: {
    zodiacSign: 'Scorpio',
    number: 13,
    keywords: ['transformation', 'endings', 'rebirth'],
  },
  temperance: {
    zodiacSign: 'Sagittarius',
    number: 14,
    keywords: ['balance', 'moderation', 'patience'],
  },
  'the-devil': {
    zodiacSign: 'Capricorn',
    number: 15,
    keywords: ['bondage', 'materialism', 'shadow'],
  },
  'the-tower': {
    planet: 'Mars',
    number: 16,
    keywords: ['upheaval', 'revelation', 'awakening'],
  },
  'the-star': {
    zodiacSign: 'Aquarius',
    number: 17,
    keywords: ['hope', 'inspiration', 'renewal'],
  },
  'the-moon': {
    zodiacSign: 'Pisces',
    number: 18,
    keywords: ['illusion', 'dreams', 'intuition'],
  },
  'the-sun': {
    planet: 'Sun',
    number: 19,
    keywords: ['success', 'joy', 'vitality'],
  },
  judgement: {
    planet: 'Pluto',
    element: 'Fire',
    number: 20,
    keywords: ['rebirth', 'inner calling', 'absolution'],
  },
  'the-world': {
    planet: 'Saturn',
    number: 21,
    keywords: ['completion', 'integration', 'accomplishment'],
  },
};

export function getEntityRelationships(
  entityType: 'planet' | 'zodiac' | 'tarot',
  entityKey: string,
): EntityRelationship[] {
  const relationships: EntityRelationship[] = [];

  if (entityType === 'planet') {
    const planetData = PLANETARY_CORRESPONDENCES[entityKey.toLowerCase()];
    if (planetData) {
      planetData.rulesZodiac.forEach((sign) => {
        relationships.push({
          name: sign,
          type: 'zodiac',
          url: `/grimoire/zodiac/${sign.toLowerCase()}`,
          description: `${entityKey} rules ${sign}`,
        });
      });

      relationships.push({
        name: planetData.tarotCard,
        type: 'tarot',
        url: planetData.tarotUrl,
        description: `Tarot card associated with ${entityKey}`,
      });

      planetData.crystals.forEach((crystal) => {
        relationships.push({
          name: crystal,
          type: 'crystal',
          url: `/grimoire/crystals/${crystal.toLowerCase().replace(/\s+/g, '-')}`,
          description: `Crystal associated with ${entityKey}`,
        });
      });

      relationships.push({
        name: planetData.element,
        type: 'element',
        url: `/grimoire/correspondences/elements/${planetData.element.toLowerCase()}`,
        description: `Element associated with ${entityKey}`,
      });

      relationships.push({
        name: planetData.chakra,
        type: 'chakra',
        url: `/grimoire/chakras/${planetData.chakra.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Chakra associated with ${entityKey}`,
      });

      relationships.push({
        name: planetData.day,
        type: 'day',
        url: `/grimoire/correspondences/days/${planetData.day.toLowerCase()}`,
        description: `Day ruled by ${entityKey}`,
      });
    }
  }

  if (entityType === 'zodiac') {
    const zodiacData = ZODIAC_CORRESPONDENCES[entityKey.toLowerCase()];
    if (zodiacData) {
      relationships.push({
        name: zodiacData.rulingPlanet,
        type: 'planet',
        url: `/grimoire/astronomy/planets/${zodiacData.rulingPlanet.toLowerCase()}`,
        description: `Ruling planet of ${entityKey}`,
      });

      relationships.push({
        name: zodiacData.tarotCard,
        type: 'tarot',
        url: zodiacData.tarotUrl,
        description: `Tarot card associated with ${entityKey}`,
      });

      zodiacData.crystals.forEach((crystal) => {
        relationships.push({
          name: crystal,
          type: 'crystal',
          url: `/grimoire/crystals/${crystal.toLowerCase().replace(/\s+/g, '-')}`,
          description: `Crystal for ${entityKey}`,
        });
      });

      relationships.push({
        name: zodiacData.element,
        type: 'element',
        url: `/grimoire/correspondences/elements/${zodiacData.element.toLowerCase()}`,
        description: `Element of ${entityKey}`,
      });

      relationships.push({
        name: zodiacData.chakra,
        type: 'chakra',
        url: `/grimoire/chakras/${zodiacData.chakra.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Primary chakra for ${entityKey}`,
      });
    }
  }

  return relationships;
}
