/**
 * Weekly Thematic Content System
 *
 * Defines weekly themes with daily facets for educational content generation.
 * Each theme has 7 facets that build understanding cumulatively across the week.
 */

export interface DailyFacet {
  dayIndex: number; // 0-6 for Mon-Sun
  title: string;
  grimoireSlug: string;
  focus: string;
  shortFormHook: string; // 1-2 sentence encyclopedic insight
}

export interface WeeklyTheme {
  id: string;
  name: string;
  description: string;
  category:
    | 'zodiac'
    | 'tarot'
    | 'lunar'
    | 'planetary'
    | 'crystals'
    | 'numerology'
    | 'chakras'
    | 'sabbat';
  facets: DailyFacet[];
}

export interface SabbatTheme {
  id: string;
  name: string;
  date: { month: number; day: number };
  category: 'sabbat';
  leadUpFacets: DailyFacet[]; // 4 facets: day -3, -2, -1, day-of
}

// Domain hashtags for 3-layer system
export const domainHashtags: Record<string, string> = {
  zodiac: '#astrology',
  tarot: '#tarot',
  lunar: '#moonphases',
  planetary: '#astrology',
  sabbat: '#wheeloftheyear',
  numerology: '#numerology',
  crystals: '#crystalhealing',
  chakras: '#spirituality',
};

// ============================================================================
// CATEGORY THEMES - 7 facets each, rotate weekly
// ============================================================================

export const categoryThemes: WeeklyTheme[] = [
  {
    id: 'zodiac-foundations',
    name: 'Foundations of the Zodiac',
    description:
      'A foundational exploration of the zodiacal system, its structure, and core principles.',
    category: 'zodiac',
    facets: [
      {
        dayIndex: 0,
        title: 'The Four Elements',
        grimoireSlug: 'correspondences/elements',
        focus:
          'Fire, Earth, Air, Water - the elemental building blocks of astrological temperament',
        shortFormHook:
          'The zodiac divides into four elements: Fire signs act, Earth signs build, Air signs think, Water signs feel.',
      },
      {
        dayIndex: 1,
        title: 'The Three Modalities',
        grimoireSlug: 'glossary#modality',
        focus:
          'Cardinal initiates, Fixed stabilizes, Mutable adapts - the modes of expression',
        shortFormHook:
          'Cardinal signs begin each season and initiate action. Fixed signs sustain it. Mutable signs transform and release.',
      },
      {
        dayIndex: 2,
        title: 'The Twelve Houses',
        grimoireSlug: 'birth-chart/houses',
        focus: 'The twelve life areas governed by the houses in a birth chart',
        shortFormHook:
          'The twelve houses divide the birth chart into life domains, from identity to spirituality, each ruling specific experiences.',
      },
      {
        dayIndex: 3,
        title: 'Planetary Rulership',
        grimoireSlug: 'astronomy/planets',
        focus: 'Each sign has a ruling planet that colors its expression',
        shortFormHook:
          'Each zodiac sign is ruled by a planet that shapes its core expression. Mars rules Aries with drive; Venus rules Taurus with sensuality.',
      },
      {
        dayIndex: 4,
        title: 'The Ascendant',
        grimoireSlug: 'rising-sign',
        focus: 'The rising sign as the mask we wear and how we meet the world',
        shortFormHook:
          'The Ascendant, or rising sign, is the zodiac sign on the eastern horizon at birth. It shapes first impressions and outward personality.',
      },
      {
        dayIndex: 5,
        title: 'Aspects and Relationships',
        grimoireSlug: 'glossary#aspect',
        focus:
          'How planets in aspect create dialogue - conjunctions, squares, trines',
        shortFormHook:
          'Aspects are geometric relationships between planets. Trines flow easily; squares create tension that drives growth.',
      },
      {
        dayIndex: 6,
        title: 'Reading Your Birth Chart',
        grimoireSlug: 'birth-chart',
        focus: 'Synthesizing elements, modalities, houses, and aspects',
        shortFormHook:
          'A birth chart is a snapshot of the sky at your moment of birth. It maps planetary positions across signs and houses.',
      },
    ],
  },
  {
    id: 'planetary-wisdom',
    name: 'Understanding Planetary Rulership',
    description:
      'Deep exploration of each classical planet and its astrological significance.',
    category: 'planetary',
    facets: [
      {
        dayIndex: 0,
        title: 'The Sun',
        grimoireSlug: 'astronomy/planets/sun',
        focus: 'Core identity, vitality, and conscious self-expression',
        shortFormHook:
          'The Sun represents core identity and life force. Its sign shows how you express your essential self and where you seek recognition.',
      },
      {
        dayIndex: 1,
        title: 'The Moon',
        grimoireSlug: 'astronomy/planets/moon',
        focus: 'Emotional nature, instincts, and the unconscious',
        shortFormHook:
          'The Moon governs emotional instincts and inner needs. Its sign reveals how you process feelings and what makes you feel secure.',
      },
      {
        dayIndex: 2,
        title: 'Mercury',
        grimoireSlug: 'astronomy/planets/mercury',
        focus: 'Communication, thought patterns, and mental processing',
        shortFormHook:
          'Mercury rules the mind and communication. Its placement shows how you think, learn, and express ideas.',
      },
      {
        dayIndex: 3,
        title: 'Venus',
        grimoireSlug: 'astronomy/planets/venus',
        focus: 'Love, beauty, values, and attraction',
        shortFormHook:
          'Venus governs love, beauty, and values. Its sign reveals what you find attractive and how you express affection.',
      },
      {
        dayIndex: 4,
        title: 'Mars',
        grimoireSlug: 'astronomy/planets/mars',
        focus: 'Drive, assertion, passion, and how we take action',
        shortFormHook:
          'Mars represents drive, assertion, and desire. Its placement shows how you pursue goals and express anger.',
      },
      {
        dayIndex: 5,
        title: 'Jupiter',
        grimoireSlug: 'astronomy/planets/jupiter',
        focus: 'Expansion, luck, philosophy, and growth',
        shortFormHook:
          'Jupiter expands whatever it touches, bringing growth and opportunity. Its sign shows where you find meaning and abundance.',
      },
      {
        dayIndex: 6,
        title: 'Saturn',
        grimoireSlug: 'astronomy/planets/saturn',
        focus: 'Structure, discipline, limitations, and mastery',
        shortFormHook:
          'Saturn represents structure, discipline, and life lessons. Its placement reveals where you face challenges that build mastery.',
      },
    ],
  },
  {
    id: 'tarot-symbolic-system',
    name: 'Tarot as a Symbolic System',
    description:
      'Understanding tarot as a complete symbolic language for self-reflection.',
    category: 'tarot',
    facets: [
      {
        dayIndex: 0,
        title: 'Structure of the Deck',
        grimoireSlug: 'tarot',
        focus: '78 cards: 22 Major Arcana and 56 Minor Arcana',
        shortFormHook:
          'The tarot deck contains 78 cards: 22 Major Arcana representing life lessons, and 56 Minor Arcana reflecting daily experiences.',
      },
      {
        dayIndex: 1,
        title: "The Fool's Journey",
        grimoireSlug: 'tarot/the-fool',
        focus: 'The Major Arcana as a narrative of spiritual development',
        shortFormHook:
          "The Major Arcana tells the Fool's Journey, a narrative arc from innocence through trials to integration and wholeness.",
      },
      {
        dayIndex: 2,
        title: 'The Four Suits',
        grimoireSlug: 'tarot',
        focus: 'Wands (Fire), Cups (Water), Swords (Air), Pentacles (Earth)',
        shortFormHook:
          'The four suits correspond to elements: Wands to Fire and passion, Cups to Water and emotion, Swords to Air and mind, Pentacles to Earth and matter.',
      },
      {
        dayIndex: 3,
        title: 'Number Symbolism',
        grimoireSlug: 'numerology',
        focus: 'Aces through Tens - the numerological progression',
        shortFormHook:
          'In tarot, numbers carry meaning: Aces are beginnings, Fives bring conflict, Tens represent completion of a cycle.',
      },
      {
        dayIndex: 4,
        title: 'Court Cards',
        grimoireSlug: 'tarot',
        focus: 'Page, Knight, Queen, King - aspects of personality or people',
        shortFormHook:
          'Court cards represent personality aspects or people. Pages are students, Knights are seekers, Queens embody mastery, Kings command authority.',
      },
      {
        dayIndex: 5,
        title: 'Reading Patterns',
        grimoireSlug: 'tarot',
        focus: 'Spreads, positions, and card relationships',
        shortFormHook:
          'Tarot spreads assign meaning through position. Cards in relationship reveal nuance beyond individual card meanings.',
      },
      {
        dayIndex: 6,
        title: 'Tarot as Mirror',
        grimoireSlug: 'tarot',
        focus: 'Using tarot for self-reflection rather than prediction',
        shortFormHook:
          'Tarot functions as a mirror for the unconscious, surfacing what is already known but not yet articulated.',
      },
    ],
  },
  {
    id: 'lunar-cycles',
    name: 'Emotional Cycles and the Moon',
    description:
      'Understanding lunar phases and their influence on emotional rhythms.',
    category: 'lunar',
    facets: [
      {
        dayIndex: 0,
        title: 'The Eight Phases',
        grimoireSlug: 'moon-rituals',
        focus:
          'New, Waxing Crescent, First Quarter, Waxing Gibbous, Full, Waning Gibbous, Last Quarter, Waning Crescent',
        shortFormHook:
          'The Moon moves through eight phases in 29.5 days, each carrying distinct energy from initiation to release.',
      },
      {
        dayIndex: 1,
        title: 'New Moon',
        grimoireSlug: 'moon-rituals',
        focus: 'Beginnings, intention setting, planting seeds',
        shortFormHook:
          'The New Moon marks the beginning of the lunar cycle. It is a time for setting intentions and initiating new projects.',
      },
      {
        dayIndex: 2,
        title: 'Full Moon',
        grimoireSlug: 'moon-rituals',
        focus: 'Illumination, culmination, release',
        shortFormHook:
          'The Full Moon brings illumination and culmination. What was begun at the New Moon reaches peak visibility.',
      },
      {
        dayIndex: 3,
        title: 'Moon Signs',
        grimoireSlug: 'astronomy/planets/moon',
        focus: "How the Moon's sign colors emotional expression",
        shortFormHook:
          "The Moon changes signs every 2.5 days, coloring the collective emotional atmosphere with each sign's qualities.",
      },
      {
        dayIndex: 4,
        title: 'Void of Course Moon',
        grimoireSlug: 'astronomy/planets/moon',
        focus: 'The pause between lunar sign changes',
        shortFormHook:
          'Void of Course Moon occurs when the Moon makes no more aspects before changing signs. Decisions made during this time may not manifest as expected.',
      },
      {
        dayIndex: 5,
        title: 'Lunar Nodes',
        grimoireSlug: 'glossary#north-node',
        focus: 'North Node destiny, South Node past patterns',
        shortFormHook:
          "The Lunar Nodes mark where the Moon's path crosses the ecliptic. The North Node points toward growth; the South Node indicates familiar patterns.",
      },
      {
        dayIndex: 6,
        title: 'Working with Lunar Cycles',
        grimoireSlug: 'moon-rituals',
        focus: 'Practical alignment with lunar rhythms',
        shortFormHook:
          'Aligning activities with lunar phases creates natural rhythm: begin at New Moon, assess at First Quarter, celebrate or release at Full Moon.',
      },
    ],
  },
  {
    id: 'crystal-correspondences',
    name: 'Crystal Correspondences',
    description:
      'Understanding crystals as tools for energetic work and symbolic meaning.',
    category: 'crystals',
    facets: [
      {
        dayIndex: 0,
        title: 'Crystal Basics',
        grimoireSlug: 'crystals',
        focus: 'How crystals form and hold energetic properties',
        shortFormHook:
          'Crystals form over millennia under specific conditions, each structure and composition creating distinct energetic signatures.',
      },
      {
        dayIndex: 1,
        title: 'Cleansing and Charging',
        grimoireSlug: 'crystals',
        focus: 'Preparing crystals for use through cleansing methods',
        shortFormHook:
          'Crystals absorb energy and benefit from regular cleansing. Moonlight, smoke, sound, and earth are common purification methods.',
      },
      {
        dayIndex: 2,
        title: 'Quartz Family',
        grimoireSlug: 'crystals/clear-quartz',
        focus:
          'Clear Quartz, Rose Quartz, Amethyst, Citrine - the versatile quartz varieties',
        shortFormHook:
          'The quartz family includes Clear Quartz for amplification, Rose Quartz for love, Amethyst for intuition, and Citrine for abundance.',
      },
      {
        dayIndex: 3,
        title: 'Protection Stones',
        grimoireSlug: 'crystals/black-tourmaline',
        focus: 'Black Tourmaline, Obsidian, Hematite - grounding and shielding',
        shortFormHook:
          'Protection stones like Black Tourmaline and Obsidian absorb negative energy. Hematite grounds scattered energy back to earth.',
      },
      {
        dayIndex: 4,
        title: 'Heart Stones',
        grimoireSlug: 'crystals/rose-quartz',
        focus: 'Rose Quartz, Green Aventurine, Rhodonite - emotional healing',
        shortFormHook:
          'Heart-centered stones resonate with the heart chakra. Rose Quartz opens to love; Green Aventurine attracts opportunity.',
      },
      {
        dayIndex: 5,
        title: 'Intuition Stones',
        grimoireSlug: 'crystals/amethyst',
        focus: 'Amethyst, Labradorite, Moonstone - enhancing psychic awareness',
        shortFormHook:
          'Intuition stones enhance psychic perception. Amethyst opens the third eye; Labradorite reveals hidden truths; Moonstone connects to lunar wisdom.',
      },
      {
        dayIndex: 6,
        title: 'Crystal Grids',
        grimoireSlug: 'crystals',
        focus: 'Combining crystals in sacred geometric patterns',
        shortFormHook:
          'Crystal grids arrange multiple stones in geometric patterns, amplifying intention through the combined energy of placement and stone properties.',
      },
    ],
  },
  {
    id: 'numerology-basics',
    name: 'Numerology Basics',
    description: 'Understanding the symbolic language of numbers.',
    category: 'numerology',
    facets: [
      {
        dayIndex: 0,
        title: 'Life Path Number',
        grimoireSlug: 'numerology',
        focus: 'Calculating and interpreting your core number',
        shortFormHook:
          'The Life Path number, derived from birth date, reveals your core purpose and the primary lessons of this lifetime.',
      },
      {
        dayIndex: 1,
        title: 'Numbers 1-3',
        grimoireSlug: 'numerology',
        focus: 'One (independence), Two (partnership), Three (expression)',
        shortFormHook:
          'In numerology, 1 represents independence and initiative, 2 embodies partnership and balance, 3 expresses creativity and communication.',
      },
      {
        dayIndex: 2,
        title: 'Numbers 4-6',
        grimoireSlug: 'numerology',
        focus: 'Four (structure), Five (change), Six (harmony)',
        shortFormHook:
          'The number 4 builds structure and foundation, 5 brings change and freedom, 6 creates harmony and responsibility.',
      },
      {
        dayIndex: 3,
        title: 'Numbers 7-9',
        grimoireSlug: 'numerology',
        focus: 'Seven (wisdom), Eight (power), Nine (completion)',
        shortFormHook:
          'Seven seeks inner wisdom and truth, 8 manifests material power and abundance, 9 represents completion and universal love.',
      },
      {
        dayIndex: 4,
        title: 'Master Numbers',
        grimoireSlug: 'numerology',
        focus: '11, 22, 33 - heightened spiritual potential',
        shortFormHook:
          'Master numbers 11, 22, and 33 carry intensified spiritual potential. They are not reduced in calculations and demand greater responsibility.',
      },
      {
        dayIndex: 5,
        title: 'Angel Numbers',
        grimoireSlug: 'numerology/angel-numbers/111',
        focus: 'Repeating number sequences as messages',
        shortFormHook:
          'Angel numbers are repeating sequences like 111 or 444. They are interpreted as synchronistic messages drawing attention to specific themes.',
      },
      {
        dayIndex: 6,
        title: 'Personal Year Cycles',
        grimoireSlug: 'numerology',
        focus: 'Nine-year cycles of growth and development',
        shortFormHook:
          'Numerology maps nine-year cycles. Each Personal Year from 1 to 9 carries distinct themes from new beginnings to completion.',
      },
    ],
  },
  {
    id: 'chakra-system',
    name: 'The Seven Chakras',
    description: 'Understanding the chakra system as an energetic map.',
    category: 'chakras',
    facets: [
      {
        dayIndex: 0,
        title: 'Root Chakra',
        grimoireSlug: 'chakras/root',
        focus: 'Foundation, safety, survival, grounding',
        shortFormHook:
          'The Root Chakra at the base of the spine governs survival, security, and physical grounding. Its element is Earth.',
      },
      {
        dayIndex: 1,
        title: 'Sacral Chakra',
        grimoireSlug: 'chakras/sacral',
        focus: 'Creativity, pleasure, emotion, sexuality',
        shortFormHook:
          'The Sacral Chakra below the navel rules creativity, pleasure, and emotional flow. Its element is Water.',
      },
      {
        dayIndex: 2,
        title: 'Solar Plexus Chakra',
        grimoireSlug: 'chakras/solar-plexus',
        focus: 'Personal power, will, confidence',
        shortFormHook:
          'The Solar Plexus Chakra at the stomach governs personal power, will, and self-confidence. Its element is Fire.',
      },
      {
        dayIndex: 3,
        title: 'Heart Chakra',
        grimoireSlug: 'chakras/heart',
        focus: 'Love, compassion, connection, healing',
        shortFormHook:
          'The Heart Chakra at center chest bridges lower and upper chakras, governing love and compassion. Its element is Air.',
      },
      {
        dayIndex: 4,
        title: 'Throat Chakra',
        grimoireSlug: 'chakras/throat',
        focus: 'Communication, truth, authentic expression',
        shortFormHook:
          'The Throat Chakra governs communication and authentic self-expression. Blockages manifest as difficulty speaking truth.',
      },
      {
        dayIndex: 5,
        title: 'Third Eye Chakra',
        grimoireSlug: 'chakras/third-eye',
        focus: 'Intuition, vision, insight, imagination',
        shortFormHook:
          'The Third Eye Chakra between the brows governs intuition, inner vision, and imagination. It perceives beyond physical sight.',
      },
      {
        dayIndex: 6,
        title: 'Crown Chakra',
        grimoireSlug: 'chakras/crown',
        focus: 'Spiritual connection, consciousness, transcendence',
        shortFormHook:
          'The Crown Chakra at the top of the head connects to universal consciousness and spiritual transcendence.',
      },
    ],
  },
];

// ============================================================================
// SABBAT THEMES - 4 facets each (lead-up days)
// ============================================================================

export const sabbatThemes: SabbatTheme[] = [
  {
    id: 'samhain',
    name: 'Samhain',
    date: { month: 10, day: 31 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Origins of Samhain',
        grimoireSlug: 'wheel-of-the-year/samhain',
        focus: 'Celtic origins and the thinning veil between worlds',
        shortFormHook:
          'Samhain marks the Celtic New Year when the veil between worlds grows thin. It honors the dead and embraces the dark half of the year.',
      },
      {
        dayIndex: -2,
        title: 'Samhain Correspondences',
        grimoireSlug: 'wheel-of-the-year/samhain',
        focus: 'Colors, crystals, herbs, and deities of Samhain',
        shortFormHook:
          'Samhain correspondences include black and orange colors, obsidian and jet stones, mugwort and rosemary, and deities of death and rebirth.',
      },
      {
        dayIndex: -1,
        title: 'Ancestor Work',
        grimoireSlug: 'wheel-of-the-year/samhain',
        focus: 'Rituals for honoring ancestors and the beloved dead',
        shortFormHook:
          'Samhain invites ancestor communion. Traditional practices include setting a place at the table for the dead and speaking their names aloud.',
      },
      {
        dayIndex: 0,
        title: 'Samhain Celebration',
        grimoireSlug: 'wheel-of-the-year/samhain',
        focus: 'Honoring the day and embracing transformation',
        shortFormHook:
          'Samhain is both an ending and a beginning. As the final harvest, it teaches that death is part of the cycle, making space for new growth.',
      },
    ],
  },
  {
    id: 'yule',
    name: 'Yule',
    date: { month: 12, day: 21 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Winter Solstice Origins',
        grimoireSlug: 'wheel-of-the-year/yule',
        focus: 'The longest night and return of the light',
        shortFormHook:
          'Yule marks the Winter Solstice, the longest night of the year. From this point, daylight slowly returns as the sun is symbolically reborn.',
      },
      {
        dayIndex: -2,
        title: 'Yule Correspondences',
        grimoireSlug: 'wheel-of-the-year/yule',
        focus: 'Colors, plants, and symbols of Yule',
        shortFormHook:
          'Yule correspondences include red, green, and gold colors; holly, ivy, and mistletoe; and symbols of the evergreen tree and Yule log.',
      },
      {
        dayIndex: -1,
        title: 'Yule Traditions',
        grimoireSlug: 'wheel-of-the-year/yule',
        focus: 'Rituals of light, giving, and renewal',
        shortFormHook:
          'Yule traditions center on light returning to darkness: lighting candles, burning the Yule log, and exchanging gifts as symbols of hope.',
      },
      {
        dayIndex: 0,
        title: 'Yule Celebration',
        grimoireSlug: 'wheel-of-the-year/yule',
        focus: 'Celebrating the rebirth of the sun',
        shortFormHook:
          'Yule celebrates the rebirth of the sun at the darkest point. It is a reminder that light always returns, even from the deepest darkness.',
      },
    ],
  },
  {
    id: 'imbolc',
    name: 'Imbolc',
    date: { month: 2, day: 1 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Origins of Imbolc',
        grimoireSlug: 'wheel-of-the-year/imbolc',
        focus: "The stirring of spring beneath winter's surface",
        shortFormHook:
          'Imbolc marks the first stirrings of spring. Though winter persists, seeds beneath the soil begin to awaken toward growth.',
      },
      {
        dayIndex: -2,
        title: 'Imbolc Correspondences',
        grimoireSlug: 'wheel-of-the-year/imbolc',
        focus: 'Brigid, flame, and purification symbols',
        shortFormHook:
          'Imbolc honors Brigid, goddess of flame, poetry, and healing. White candles and dairy offerings are traditional correspondences.',
      },
      {
        dayIndex: -1,
        title: 'Purification Rituals',
        grimoireSlug: 'wheel-of-the-year/imbolc',
        focus: 'Cleansing home and self for new growth',
        shortFormHook:
          "Imbolc emphasizes purification and preparation. Cleansing the home and setting intentions prepares for spring's emergence.",
      },
      {
        dayIndex: 0,
        title: 'Imbolc Celebration',
        grimoireSlug: 'wheel-of-the-year/imbolc',
        focus: 'Lighting the flame of inspiration',
        shortFormHook:
          "Imbolc celebrates returning light and creative inspiration. Lighting candles honors Brigid's flame and the quickening of the year.",
      },
    ],
  },
  {
    id: 'ostara',
    name: 'Ostara',
    date: { month: 3, day: 20 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Spring Equinox Origins',
        grimoireSlug: 'wheel-of-the-year/ostara',
        focus: 'Balance of light and dark at the vernal equinox',
        shortFormHook:
          'Ostara occurs at the Spring Equinox when day and night are equal. From this point, light overtakes darkness as spring fully arrives.',
      },
      {
        dayIndex: -2,
        title: 'Ostara Correspondences',
        grimoireSlug: 'wheel-of-the-year/ostara',
        focus: 'Eggs, rabbits, and symbols of fertility',
        shortFormHook:
          "Ostara symbols include eggs representing potential, rabbits for fertility, and spring flowers marking nature's renewal.",
      },
      {
        dayIndex: -1,
        title: 'Planting Seeds',
        grimoireSlug: 'wheel-of-the-year/ostara',
        focus: 'Rituals for new beginnings and growth',
        shortFormHook:
          'Ostara is ideal for planting literal and metaphorical seeds. What was envisioned at Imbolc can now be set into motion.',
      },
      {
        dayIndex: 0,
        title: 'Ostara Celebration',
        grimoireSlug: 'wheel-of-the-year/ostara',
        focus: 'Celebrating balance and new growth',
        shortFormHook:
          'Ostara celebrates the balance point before light prevails. It honors fertility, growth, and the return of warmth and color.',
      },
    ],
  },
  {
    id: 'beltane',
    name: 'Beltane',
    date: { month: 5, day: 1 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Origins of Beltane',
        grimoireSlug: 'wheel-of-the-year/beltane',
        focus: 'Fire festival marking the height of spring',
        shortFormHook:
          "Beltane is the great fire festival celebrating fertility and the union of masculine and feminine energies at spring's peak.",
      },
      {
        dayIndex: -2,
        title: 'Beltane Correspondences',
        grimoireSlug: 'wheel-of-the-year/beltane',
        focus: 'Maypole, flowers, and fertility symbols',
        shortFormHook:
          'Beltane symbols include the Maypole representing union, flowers in full bloom, and the sacred fire through which cattle were driven.',
      },
      {
        dayIndex: -1,
        title: 'Fire and Passion',
        grimoireSlug: 'wheel-of-the-year/beltane',
        focus: 'Rituals celebrating life force and creativity',
        shortFormHook:
          'Beltane honors the life force at its most vibrant. Fire rituals, dancing, and celebration of passion mark this fertile time.',
      },
      {
        dayIndex: 0,
        title: 'Beltane Celebration',
        grimoireSlug: 'wheel-of-the-year/beltane',
        focus: 'Honoring union and abundance',
        shortFormHook:
          'Beltane celebrates the sacred marriage of earth and sky. It is a time of joy, union, and abundant creative energy.',
      },
    ],
  },
  {
    id: 'litha',
    name: 'Litha',
    date: { month: 6, day: 21 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Summer Solstice Origins',
        grimoireSlug: 'wheel-of-the-year/litha',
        focus: 'The longest day and peak of solar power',
        shortFormHook:
          'Litha marks the Summer Solstice, the longest day of the year. The sun reaches its peak power before beginning its descent.',
      },
      {
        dayIndex: -2,
        title: 'Litha Correspondences',
        grimoireSlug: 'wheel-of-the-year/litha',
        focus: 'Solar symbols, herbs, and midsummer magic',
        shortFormHook:
          "Litha correspondences include gold and yellow colors, sunflowers, St. John's Wort, and all solar symbols at their most potent.",
      },
      {
        dayIndex: -1,
        title: 'Midsummer Magic',
        grimoireSlug: 'wheel-of-the-year/litha',
        focus: 'Rituals harnessing peak solar energy',
        shortFormHook:
          'Midsummer is considered a powerful time for magic. The fae are active, and solar energy can be captured for the darker months ahead.',
      },
      {
        dayIndex: 0,
        title: 'Litha Celebration',
        grimoireSlug: 'wheel-of-the-year/litha',
        focus: 'Honoring the sun at its zenith',
        shortFormHook:
          'Litha celebrates light at its fullest while acknowledging the turn toward darkness. It balances celebration with preparation.',
      },
    ],
  },
  {
    id: 'lughnasadh',
    name: 'Lughnasadh',
    date: { month: 8, day: 1 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Origins of Lughnasadh',
        grimoireSlug: 'wheel-of-the-year/lughnasadh',
        focus: 'First harvest festival honoring Lugh',
        shortFormHook:
          'Lughnasadh is the first harvest festival, honoring the Celtic god Lugh. It marks the beginning of the grain harvest season.',
      },
      {
        dayIndex: -2,
        title: 'Lughnasadh Correspondences',
        grimoireSlug: 'wheel-of-the-year/lughnasadh',
        focus: 'Grain, bread, and harvest symbols',
        shortFormHook:
          'Lughnasadh symbols include wheat and grain, freshly baked bread, and the colors of ripening fields: gold, orange, and brown.',
      },
      {
        dayIndex: -1,
        title: 'Harvest Gratitude',
        grimoireSlug: 'wheel-of-the-year/lughnasadh',
        focus: 'Rituals of thanksgiving for abundance',
        shortFormHook:
          'Lughnasadh invites gratitude for what has ripened. Baking bread and sharing meals honors the sacrifice inherent in harvest.',
      },
      {
        dayIndex: 0,
        title: 'Lughnasadh Celebration',
        grimoireSlug: 'wheel-of-the-year/lughnasadh',
        focus: 'Celebrating first fruits and skilled craft',
        shortFormHook:
          'Lughnasadh celebrates the first harvest and the skills that created abundance. Games and crafts honor Lugh, god of many talents.',
      },
    ],
  },
  {
    id: 'mabon',
    name: 'Mabon',
    date: { month: 9, day: 22 },
    category: 'sabbat',
    leadUpFacets: [
      {
        dayIndex: -3,
        title: 'Autumn Equinox Origins',
        grimoireSlug: 'wheel-of-the-year/mabon',
        focus: 'Second harvest and balance before darkness',
        shortFormHook:
          'Mabon marks the Autumn Equinox, when day and night are equal. It is the second harvest festival before darkness overtakes light.',
      },
      {
        dayIndex: -2,
        title: 'Mabon Correspondences',
        grimoireSlug: 'wheel-of-the-year/mabon',
        focus: 'Apples, wine, and symbols of abundance',
        shortFormHook:
          'Mabon symbols include apples, grapes and wine, gourds, and the rich colors of autumn leaves: red, orange, gold, and brown.',
      },
      {
        dayIndex: -1,
        title: 'Balance and Release',
        grimoireSlug: 'wheel-of-the-year/mabon',
        focus: 'Rituals for gratitude and letting go',
        shortFormHook:
          'Mabon invites both gratitude for harvest and release of what is complete. Balance is honored before the descent into darkness.',
      },
      {
        dayIndex: 0,
        title: 'Mabon Celebration',
        grimoireSlug: 'wheel-of-the-year/mabon',
        focus: 'Thanksgiving and preparation for winter',
        shortFormHook:
          "Mabon is a thanksgiving celebration for the harvest's bounty. It prepares body and spirit for the introspective dark season ahead.",
      },
    ],
  },
];

// ============================================================================
// THEME SELECTION LOGIC
// ============================================================================

/**
 * Check if a date falls within the lead-up to a sabbat
 */
export function getSabbatForDate(date: Date): {
  sabbat: SabbatTheme;
  daysUntil: number;
} | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sabbat of sabbatThemes) {
    // Calculate sabbat date for this year
    const sabbatDate = new Date(
      date.getFullYear(),
      sabbat.date.month - 1,
      sabbat.date.day,
    );

    // Calculate days until sabbat
    const diffTime = sabbatDate.getTime() - date.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if within 4-day lead-up window (day -3, -2, -1, 0)
    if (daysUntil >= 0 && daysUntil <= 3) {
      return { sabbat, daysUntil };
    }
  }

  return null;
}

/**
 * Get the appropriate theme and facet for a specific date
 */
export function getThemeForDate(
  date: Date,
  currentThemeIndex: number = 0,
): {
  theme: WeeklyTheme | SabbatTheme;
  facet: DailyFacet;
  isSabbat: boolean;
} {
  // Check if this date falls within a sabbat lead-up
  const sabbatInfo = getSabbatForDate(date);

  if (sabbatInfo) {
    const { sabbat, daysUntil } = sabbatInfo;
    // daysUntil: 3 = day -3, 2 = day -2, 1 = day -1, 0 = day of
    const facetIndex = 3 - daysUntil;
    return {
      theme: sabbat,
      facet: sabbat.leadUpFacets[facetIndex],
      isSabbat: true,
    };
  }

  // Otherwise use rotating category theme
  const dayOfWeek = date.getDay();
  const facetIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6

  const theme = categoryThemes[currentThemeIndex % categoryThemes.length];
  return {
    theme,
    facet: theme.facets[facetIndex],
    isSabbat: false,
  };
}

/**
 * Generate hashtags for a theme and facet
 */
export function generateHashtags(
  theme: WeeklyTheme | SabbatTheme,
  facet: DailyFacet,
): { domain: string; topic: string; brand: string } {
  const domain = domainHashtags[theme.category] || '#spirituality';

  // Generate topic hashtag from facet title
  const topicBase = facet.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '');
  const topic = `#${topicBase}`;

  // Third hashtag based on category (for variety, not brand)
  const categoryThirdHashtags: Record<string, string> = {
    zodiac: '#astrology',
    tarot: '#tarot',
    lunar: '#moonmagic',
    planetary: '#astrology',
    sabbat: '#wheeloftheyear',
    numerology: '#numerology',
    crystals: '#crystalhealing',
    chakras: '#chakras',
  };
  const fallbackThirdHashtags: Record<string, string[]> = {
    zodiac: ['#zodiacsigns', '#horoscope'],
    tarot: ['#tarotreading', '#tarotcards'],
    lunar: ['#lunarcycle', '#moonmagic'],
    planetary: ['#planets', '#cosmicwisdom'],
    sabbat: ['#seasonalrituals', '#paganwheel'],
    numerology: ['#numbersymbolism', '#numerologyguide'],
    crystals: ['#crystals', '#healingstones'],
    chakras: ['#energyhealing', '#chakrawork'],
  };
  const baseThird = categoryThirdHashtags[theme.category] || '#spirituality';
  const used = new Set([domain, topic]);
  let thirdHashtag = baseThird;
  if (used.has(baseThird)) {
    const fallbacks = fallbackThirdHashtags[theme.category] || [
      '#cosmicwisdom',
    ];
    thirdHashtag = fallbacks.find((tag) => !used.has(tag)) || baseThird;
  }

  return {
    domain,
    topic,
    brand: thirdHashtag, // Reusing brand field for third hashtag (not actually brand)
  };
}

/**
 * Get the week's content plan
 */
export function getWeeklyContentPlan(
  weekStartDate: Date,
  currentThemeIndex: number = 0,
): Array<{
  date: Date;
  dayName: string;
  theme: WeeklyTheme | SabbatTheme;
  facet: DailyFacet;
  isSabbat: boolean;
  hashtags: { domain: string; topic: string; brand: string };
}> {
  const plan = [];
  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);

    const { theme, facet, isSabbat } = getThemeForDate(date, currentThemeIndex);
    const hashtags = generateHashtags(theme, facet);

    plan.push({
      date,
      dayName: dayNames[i],
      theme,
      facet,
      isSabbat,
      hashtags,
    });
  }

  return plan;
}
