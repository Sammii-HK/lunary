const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export const grimoire: {
  [key: string]: { title: string; contents?: string[] };
} = {
  // ═══════════════════════════════════════════════════════════
  // ZODIAC & SIGNS
  // ═══════════════════════════════════════════════════════════
  zodiac: {
    title: 'Zodiac Signs',
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
  decans: {
    title: 'Zodiac Decans',
  },
  cusps: {
    title: 'Zodiac Cusps',
  },
  birthday: {
    title: 'Birthday Zodiac',
  },
  seasons: {
    title: 'Zodiac Seasons',
  },
  compatibility: {
    title: 'Zodiac Compatibility',
  },

  // ═══════════════════════════════════════════════════════════
  // ASTROLOGY
  // ═══════════════════════════════════════════════════════════
  birthChart: {
    title: 'Birth Chart',
    contents: [
      'Planets',
      'Houses',
      'Aspects',
      'Rising Sign',
      'Synastry',
      'Lunar Nodes',
      'Retrogrades',
    ],
  },
  houses: {
    title: 'Astrological Houses',
    contents: [
      '1st House',
      '2nd House',
      '3rd House',
      '4th House',
      '5th House',
      '6th House',
      '7th House',
      '8th House',
      '9th House',
      '10th House',
      '11th House',
      '12th House',
      'Planets in Houses',
    ],
  },
  aspects: {
    title: 'Astrological Aspects',
    contents: ['Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile'],
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
  transits: {
    title: 'Transits',
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
  astronomy: {
    title: 'Astronomy',
    contents: ['Planets', 'Zodiac'],
  },

  // ═══════════════════════════════════════════════════════════
  // MOON
  // ═══════════════════════════════════════════════════════════
  moon: {
    title: 'Moon',
    contents: [
      'Phases',
      'Full Moon Names',
      'Moon Signs',
      'Rituals',
      'Eclipses',
      'Void of Course',
      'Moon Gardening',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // TAROT & DIVINATION
  // ═══════════════════════════════════════════════════════════
  tarot: {
    title: 'Tarot',
    contents: [
      'Spreads',
      'Major Arcana',
      'Minor Arcana',
      'Reversed Cards',
      'Card Combinations',
      'Tarot Ethics',
    ],
  },
  runes: {
    title: 'Runes',
  },
  divination: {
    title: 'Divination',
    contents: ['Pendulum', 'Scrying', 'Dream Interpretation', 'Omen Reading'],
  },

  // ═══════════════════════════════════════════════════════════
  // CRYSTALS
  // ═══════════════════════════════════════════════════════════
  crystals: {
    title: 'Crystals',
    contents: ['Daily Selection', 'Crystal Categories', 'Crystal Healing'],
  },

  // ═══════════════════════════════════════════════════════════
  // NUMEROLOGY
  // ═══════════════════════════════════════════════════════════
  numerology: {
    title: 'Numerology',
    contents: [
      'Angel Numbers',
      'Life Path',
      'Core Numbers',
      'Master Numbers',
      'Expression Numbers',
      'Soul Urge',
      'Karmic Debt',
      'Mirror Hours',
      'Double Hours',
      'Planetary Days',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // WITCHCRAFT & PRACTICES
  // ═══════════════════════════════════════════════════════════
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
  practices: {
    title: 'Spellcraft & Rituals',
    contents: ['Spells & Rituals', 'Spellcraft Fundamentals'],
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

  // ═══════════════════════════════════════════════════════════
  // OTHER
  // ═══════════════════════════════════════════════════════════
  chakras: {
    title: 'Chakras',
  },
  wheelOfTheYear: {
    title: 'Wheel of the Year',
  },
  chineseZodiac: {
    title: 'Chinese Zodiac',
  },
  events: {
    title: 'Astrological Events',
    contents: [
      `${currentYear} Events`,
      `${nextYear} Events`,
      'Mercury Retrograde',
      'Eclipses',
    ],
  },
  glossary: {
    title: 'Astrology Glossary',
  },
  guides: {
    title: 'Complete Guides',
    contents: [
      'Birth Chart Guide',
      'Tarot Guide',
      'Moon Phases Guide',
      'Crystal Healing Guide',
    ],
  },
};

export const grimoireItems = Object.keys(grimoire);

// Custom hrefs for sections that have their own subpages instead of anchors
export const customContentHrefs: Record<string, Record<string, string>> = {
  // Zodiac Signs
  zodiac: {
    Aries: '/grimoire/zodiac/aries',
    Taurus: '/grimoire/zodiac/taurus',
    Gemini: '/grimoire/zodiac/gemini',
    Cancer: '/grimoire/zodiac/cancer',
    Leo: '/grimoire/zodiac/leo',
    Virgo: '/grimoire/zodiac/virgo',
    Libra: '/grimoire/zodiac/libra',
    Scorpio: '/grimoire/zodiac/scorpio',
    Sagittarius: '/grimoire/zodiac/sagittarius',
    Capricorn: '/grimoire/zodiac/capricorn',
    Aquarius: '/grimoire/zodiac/aquarius',
    Pisces: '/grimoire/zodiac/pisces',
  },
  // Horoscopes
  horoscopes: {
    Aries: '/grimoire/horoscopes/aries',
    Taurus: '/grimoire/horoscopes/taurus',
    Gemini: '/grimoire/horoscopes/gemini',
    Cancer: '/grimoire/horoscopes/cancer',
    Leo: '/grimoire/horoscopes/leo',
    Virgo: '/grimoire/horoscopes/virgo',
    Libra: '/grimoire/horoscopes/libra',
    Scorpio: '/grimoire/horoscopes/scorpio',
    Sagittarius: '/grimoire/horoscopes/sagittarius',
    Capricorn: '/grimoire/horoscopes/capricorn',
    Aquarius: '/grimoire/horoscopes/aquarius',
    Pisces: '/grimoire/horoscopes/pisces',
  },
  // Birth Chart
  birthChart: {
    Planets: '/grimoire/astronomy',
    Houses: '/grimoire/houses',
    Aspects: '/grimoire/aspects',
    'Rising Sign': '/grimoire/rising-sign',
    Synastry: '/grimoire/synastry',
    'Lunar Nodes': '/grimoire/lunar-nodes',
    Retrogrades: '/grimoire/retrogrades',
  },
  // Houses
  houses: {
    '1st House': '/grimoire/houses/overview/first',
    '2nd House': '/grimoire/houses/overview/second',
    '3rd House': '/grimoire/houses/overview/third',
    '4th House': '/grimoire/houses/overview/fourth',
    '5th House': '/grimoire/houses/overview/fifth',
    '6th House': '/grimoire/houses/overview/sixth',
    '7th House': '/grimoire/houses/overview/seventh',
    '8th House': '/grimoire/houses/overview/eighth',
    '9th House': '/grimoire/houses/overview/ninth',
    '10th House': '/grimoire/houses/overview/tenth',
    '11th House': '/grimoire/houses/overview/eleventh',
    '12th House': '/grimoire/houses/overview/twelfth',
    'Planets in Houses': '/grimoire/houses',
  },
  // Aspects
  aspects: {
    Conjunction: '/grimoire/aspects/types/conjunction',
    Opposition: '/grimoire/aspects/types/opposition',
    Trine: '/grimoire/aspects/types/trine',
    Square: '/grimoire/aspects/types/square',
    Sextile: '/grimoire/aspects/types/sextile',
  },
  // Moon
  moon: {
    Phases: '/grimoire/moon/phases',
    'Full Moon Names': '/grimoire/moon/full-moons',
    'Moon Signs': '/grimoire/moon-signs',
    Rituals: '/grimoire/moon-rituals',
    Eclipses: '/grimoire/eclipses',
  },
  // Tarot
  tarot: {
    Spreads: '/grimoire/tarot/spreads',
    'Major Arcana': '/grimoire/tarot/the-fool',
    'Minor Arcana': '/grimoire/tarot-suits/wands',
    'Reversed Cards': '/grimoire/reversed-cards-guide',
    'Card Combinations': '/grimoire/card-combinations',
  },
  // Divination
  divination: {
    Pendulum: '/grimoire/divination/pendulum',
    Scrying: '/grimoire/divination/scrying/crystal-ball',
    'Dream Interpretation': '/grimoire/divination/dream-interpretation',
    'Omen Reading': '/grimoire/divination/omen-reading',
  },
  // Numerology
  numerology: {
    'Angel Numbers': '/grimoire/angel-numbers',
    'Life Path': '/grimoire/life-path',
    'Core Numbers': '/grimoire/numerology/core-numbers',
    'Master Numbers': '/grimoire/numerology/master-numbers',
    'Expression Numbers': '/grimoire/numerology/expression',
    'Soul Urge': '/grimoire/numerology/soul-urge',
    'Karmic Debt': '/grimoire/numerology/karmic-debt',
    'Mirror Hours': '/grimoire/mirror-hours',
    'Double Hours': '/grimoire/double-hours',
    'Planetary Days': '/grimoire/numerology/planetary-days',
  },
  // Modern Witchcraft
  modernWitchcraft: {
    'Witch Types': '/grimoire/modern-witchcraft/witch-types',
    Tools: '/grimoire/modern-witchcraft/tools',
    Ethics: '/grimoire/witchcraft-ethics',
    'Book of Shadows': '/grimoire/book-of-shadows',
  },
  // Practices
  practices: {
    'Spells & Rituals': '/grimoire/spells/protection-circle',
    'Spellcraft Fundamentals': '/grimoire/spellcraft-fundamentals',
  },
  // Candle Magic
  candleMagic: {
    'Color Meanings': '/grimoire/candle-magic/colors',
    Anointing: '/grimoire/anointing-candles',
    'Altar Lighting': '/grimoire/lighting-candles-on-altar',
    'Color Incantations': '/grimoire/incantations-by-candle-color',
  },
  // Correspondences
  correspondences: {
    Elements: '/grimoire/correspondences/elements/fire',
    Colors: '/grimoire/correspondences/colors/red',
    Days: '/grimoire/correspondences/days/sunday',
    Deities: '/grimoire/correspondences/deities/greek/aphrodite',
    Flowers: '/grimoire/correspondences/flowers/rose',
    Numbers: '/grimoire/correspondences/numbers/1',
    Wood: '/grimoire/correspondences/wood/oak',
    Herbs: '/grimoire/correspondences/herbs/lavender',
    'Herb Profiles': '/grimoire/correspondences/herbs/sage',
    Animals: '/grimoire/correspondences/animals/cat',
  },
  // Meditation
  meditation: {
    Techniques: '/grimoire/meditation/techniques',
    Breathwork: '/grimoire/meditation/breathwork',
    Grounding: '/grimoire/meditation/grounding',
  },
  // Events
  events: {
    [`${currentYear} Events`]: `/grimoire/events/${currentYear}`,
    [`${nextYear} Events`]: `/grimoire/events/${nextYear}`,
    'Mercury Retrograde': `/grimoire/events/${currentYear}/mercury-retrograde`,
    Eclipses: `/grimoire/events/${currentYear}/eclipses`,
  },
  // Complete Guides - Pillar Content
  guides: {
    'Birth Chart Guide': '/grimoire/guides/birth-chart-complete-guide',
    'Tarot Guide': '/grimoire/guides/tarot-complete-guide',
    'Moon Phases Guide': '/grimoire/guides/moon-phases-guide',
    'Crystal Healing Guide': '/grimoire/guides/crystal-healing-guide',
  },
};
