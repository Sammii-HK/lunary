export const grimoire: {
  [key: string]: { title: string; contents?: string[] };
} = {
  moon: {
    title: 'Moon',
    contents: ['Phases', 'Full Moon Names'],
  },
  wheelOfTheYear: {
    title: 'Wheel of the Year',
    // contents: [
    //   'sabbats',
    // ]
  },
  astronomy: {
    title: 'Astronomy',
    contents: ['Planets', 'Zodiac'],
  },
  tarot: {
    title: 'Tarot',
    contents: ['Arcana', 'Spreads'],
  },
  runes: {
    title: 'Runes',
  },
  chakras: {
    title: 'Chakras',
  },
  numerology: {
    title: 'Numerology',
    contents: [
      'Core Numbers',
      'Master Numbers',
      'Planetary Days',
      'Calculations',
    ],
  },
  crystals: {
    title: 'Crystals',
    contents: [
      'Daily Selection',
      'Crystal Categories',
      'Working with Crystals',
    ],
  },
  correspondences: {
    title: 'Correspondences',
    contents: [
      'Elements',
      'Colors',
      'Days',
      'Deities',
      'Flowers',
      'Numbers',
      'Wood',
      'Herbs',
      'Animals',
    ],
  },
  practices: {
    title: 'Practices',
    contents: [
      'Spells & Rituals',
      'Protection',
      'Love & Relationships',
      'Prosperity',
      'Healing',
      'Cleansing',
      'Divination',
      'Manifestation',
      'Banishing',
    ],
  },
};

export const grimoireItems = Object.keys(grimoire);
