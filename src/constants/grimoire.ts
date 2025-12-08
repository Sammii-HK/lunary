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
      'Angel Numbers',
      'Life Path Numbers',
      'Universal Years',
      'Master Numbers',
      'Core Numbers',
      'Planetary Days',
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
  // New SEO-focused sections
  compatibility: {
    title: 'Zodiac Compatibility',
    contents: [
      'All Compatibility Matches',
      'Best Matches by Sign',
      'Love Compatibility',
      'Friendship Compatibility',
    ],
  },
  placements: {
    title: 'Planet Placements',
    contents: [
      'Sun Placements',
      'Moon Placements',
      'Mercury Placements',
      'Venus Placements',
      'Mars Placements',
    ],
  },
  aspects: {
    title: 'Astrological Aspects',
    contents: ['Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile'],
  },
  houses: {
    title: 'Astrological Houses',
    contents: ['1st House', '7th House', '10th House', 'Planets in Houses'],
  },
  decans: {
    title: 'Zodiac Decans',
  },
  cusps: {
    title: 'Zodiac Cusps',
  },
  birthday: {
    title: 'Birthday Zodiac',
    contents: ['Find Your Sign', 'Birthday Calendar', 'Decan by Birthday'],
  },
  chineseZodiac: {
    title: 'Chinese Zodiac',
    contents: ['The 12 Animals', 'Year of the Snake 2025', 'Compatibility'],
  },
  seasons: {
    title: 'Zodiac Seasons',
  },
  transits: {
    title: 'Yearly Transits',
  },
  glossary: {
    title: 'Astrology Glossary',
  },
  events: {
    title: 'Astrological Events',
    contents: ['2025 Events', '2026 Events', 'Mercury Retrograde', 'Eclipses'],
  },
  guides: {
    title: 'Complete Guides',
    contents: [
      'Birth Chart Guide',
      'Tarot Guide',
      'Crystal Healing Guide',
      'Moon Phases Guide',
    ],
  },
  horoscopes: {
    title: 'Monthly Horoscopes',
    contents: [
      'Aries',
      'Taurus',
      'Gemini',
      'Cancer',
      'Leo',
      'Virgo',
      'Libra',
      'Scorpio',
      'Sagittarius',
      'Capricorn',
      'Aquarius',
      'Pisces',
    ],
  },
};

export const grimoireItems = Object.keys(grimoire);

// Custom hrefs for sections that have their own subpages instead of anchors
export const customContentHrefs: Record<string, Record<string, string>> = {
  guides: {
    'Birth Chart Guide': '/grimoire/guides/birth-chart-complete-guide',
    'Tarot Guide': '/grimoire/guides/tarot-complete-guide',
    'Crystal Healing Guide': '/grimoire/guides/crystal-healing-guide',
    'Moon Phases Guide': '/grimoire/guides/moon-phases-guide',
  },
  horoscopes: {
    Aries: '/horoscope/aries',
    Taurus: '/horoscope/taurus',
    Gemini: '/horoscope/gemini',
    Cancer: '/horoscope/cancer',
    Leo: '/horoscope/leo',
    Virgo: '/horoscope/virgo',
    Libra: '/horoscope/libra',
    Scorpio: '/horoscope/scorpio',
    Sagittarius: '/horoscope/sagittarius',
    Capricorn: '/horoscope/capricorn',
    Aquarius: '/horoscope/aquarius',
    Pisces: '/horoscope/pisces',
  },
};
