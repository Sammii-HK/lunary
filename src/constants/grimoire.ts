export const grimoire: {
  [key: string]: { title: string; contents?: string[] };
} = {
  moon: {
    title: 'Moon',
    contents: [
      'Phases',
      'Full Moon Names',
      'Rituals',
      'Moon Signs',
      'Void of Course',
      'Eclipses',
      'Moon Gardening',
    ],
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
    contents: [
      'Major Arcana',
      'Arcana',
      'Spreads',
      'Reversed Cards',
      'Card Combinations',
      'Ethics',
    ],
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
      'Crystal Healing',
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
      'Herb Profiles',
      'Animals',
    ],
  },
  practices: {
    title: 'Practices',
    contents: [
      'Spellcraft Fundamentals',
      'Altar Setup',
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
  birthChart: {
    title: 'Birth Chart',
    contents: [
      'Planets',
      'Houses',
      'Aspects',
      'Retrogrades',
      'Transits',
      'Rising Sign',
      'Synastry',
    ],
  },
  candleMagic: {
    title: 'Candle Magic',
    contents: [
      'Color Meanings',
      'Carving',
      'Anointing',
      'Altar Lighting',
      'Color Incantations',
      'Safety',
      'Rituals',
    ],
  },
  divination: {
    title: 'Divination',
    contents: ['Pendulum', 'Scrying', 'Dream Interpretation', 'Omen Reading'],
  },
  modernWitchcraft: {
    title: 'Modern Witchcraft',
    contents: [
      'Witch Types',
      'Tools',
      'Ethics',
      'Coven vs Solitary',
      'Book of Shadows',
    ],
  },
  meditation: {
    title: 'Meditation & Mindfulness',
    contents: [
      'Techniques',
      'Breathwork',
      'Grounding',
      'Centering',
      'Journaling',
    ],
  },
  compatibilityChart: {
    title: 'Compatibility Chart',
  },
};

export const grimoireItems = Object.keys(grimoire);
