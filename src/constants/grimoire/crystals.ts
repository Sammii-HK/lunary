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
  // OG Image properties
  ogColor?: string; // Hex color code for OG images
  primaryChakra?: string; // Formatted chakra name for OG display (e.g., "Crown Chakra")
  keywords?: string[]; // Top keywords for OG display
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
    ogColor: '#9333EA',
    primaryChakra: 'Crown Chakra',
    keywords: ['Intuition', 'Clarity', 'Protection'],
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
    ogColor: '#F472B6',
    primaryChakra: 'Heart Chakra',
    keywords: ['Love', 'Compassion', 'Peace'],
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
    ogColor: '#F3F4F6',
    primaryChakra: 'All Chakras',
    keywords: ['Amplification', 'Clarity', 'Healing'],
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
  {
    id: 'citrine',
    name: 'Citrine',
    alternativeNames: ['Merchant Stone', 'Success Stone'],
    properties: [
      'abundance',
      'manifestation',
      'confidence',
      'personal power',
      'prosperity',
      'success',
    ],
    categories: ['Manifestation & Abundance', 'Healing & Wellness'],
    chakras: ['Solar Plexus', 'Crown'],
    elements: ['Fire'],
    zodiacSigns: ['Leo', 'Aries', 'Sagittarius'],
    moonPhases: ['New Moon', 'Waxing Moon'],
    planets: ['Sun', 'Jupiter'],
    intentions: [
      'manifestation',
      'abundance',
      'confidence',
      'success',
      'personal power',
    ],
    colors: ['Yellow', 'Golden', 'Orange'],
    hardness: 7,
    origin: ['Brazil', 'Madagascar', 'Russia', 'Spain'],
    rarity: 'common',
    ogColor: '#FCD34D',
    primaryChakra: 'Solar Plexus Chakra',
    keywords: ['Abundance', 'Confidence', 'Manifestation'],
    description:
      'The stone of abundance that radiates confidence and attracts prosperity',
    metaphysicalProperties:
      'Manifests wealth and success, boosts confidence and personal power, attracts abundance in all forms. Known as the merchant stone for business success.',
    physicalProperties:
      'Quartz crystal colored by iron impurities, naturally occurring citrine is rare',
    historicalUse:
      'Carried by merchants for business success, used in ancient times to attract wealth',
    workingWith: {
      meditation:
        'Hold during visualization to amplify manifestation intentions',
      spellwork:
        'Essential for abundance spells, money magic, and success rituals',
      healing: 'Boosts energy and vitality, supports digestive health',
      manifestation:
        'Place in wealth corner or carry to attract opportunities and abundance',
    },
    careInstructions: {
      cleansing: ['sunlight', 'smoke', 'sound'],
      charging: ['sunlight', 'citrine cluster'],
      programming:
        'Hold while visualizing your abundance goals and stating your intentions',
    },
    combinations: {
      enhances: ['Clear Quartz', 'Pyrite', 'Green Aventurine'],
      complements: ['Amethyst', 'Rose Quartz', 'Tiger Eye'],
    },
    correspondences: {
      herbs: ['Cinnamon', 'Ginger', 'Basil'],
      incense: ['Frankincense', 'Cinnamon', 'Sandalwood'],
      oils: ['Bergamot', 'Ginger', 'Cinnamon'],
      numbers: [3, 6, 8],
      tarot: ['The Sun', 'Ace of Pentacles', 'Ten of Pentacles'],
    },
  },
  {
    id: 'moonstone',
    name: 'Moonstone',
    alternativeNames: ['Adularia', 'Selenite'],
    properties: [
      'intuition',
      'feminine energy',
      'emotional balance',
      'cycles',
      'new beginnings',
    ],
    categories: ['Spiritual & Intuitive', 'Healing & Wellness'],
    chakras: ['Crown', 'Third Eye', 'Sacral'],
    elements: ['Water'],
    zodiacSigns: ['Cancer', 'Pisces', 'Scorpio'],
    moonPhases: ['New Moon', 'Full Moon', 'All Moon Phases'],
    planets: ['Moon', 'Neptune'],
    intentions: [
      'intuition',
      'emotional balance',
      'feminine wisdom',
      'new beginnings',
      'lunar connection',
    ],
    colors: ['White', 'Cream', 'Gray', 'Peach', 'Blue'],
    hardness: 6,
    origin: ['India', 'Sri Lanka', 'Madagascar', 'Australia'],
    rarity: 'common',
    ogColor: '#F3F4F6',
    primaryChakra: 'Crown Chakra',
    keywords: ['Intuition', 'Balance', 'Cycles'],
    description:
      'The stone of new beginnings that enhances intuition and honors natural cycles',
    metaphysicalProperties:
      'Enhances intuition and psychic abilities, balances emotions, connects to feminine wisdom and lunar cycles. Supports new beginnings and emotional healing.',
    physicalProperties:
      'Feldspar mineral with adularescence (shimmering effect)',
    historicalUse:
      'Sacred to moon goddesses, used in ancient times for fertility and protection during travel',
    workingWith: {
      meditation:
        'Hold during new moon or full moon meditation to enhance intuition',
      spellwork:
        'Use in moon magic, intuition spells, and emotional healing rituals',
      healing: 'Balances hormones and supports reproductive health',
      manifestation:
        'Works with lunar cycles for manifesting new beginnings and emotional goals',
    },
    careInstructions: {
      cleansing: ['moonlight', 'running water', 'smoke'],
      charging: ['full moon', 'new moon'],
      programming:
        'Charge under moonlight while setting intentions for new beginnings',
    },
    combinations: {
      enhances: ['Amethyst', 'Labradorite', 'Rose Quartz'],
      complements: ['Clear Quartz', 'Selenite', 'Pearl'],
    },
    correspondences: {
      herbs: ['Jasmine', 'Moonflower', 'White Sage'],
      incense: ['Jasmine', 'Sandalwood', 'Myrrh'],
      oils: ['Jasmine', 'Ylang Ylang', 'Rose'],
      numbers: [2, 7],
      tarot: ['The High Priestess', 'The Moon', 'Two of Cups'],
    },
  },
  {
    id: 'carnelian',
    name: 'Carnelian',
    alternativeNames: ['Sard', 'Cornelian'],
    properties: [
      'courage',
      'creativity',
      'vitality',
      'action',
      'motivation',
      'passion',
    ],
    categories: ['Healing & Wellness', 'Creativity & Inspiration'],
    chakras: ['Sacral', 'Solar Plexus'],
    elements: ['Fire'],
    zodiacSigns: ['Aries', 'Leo', 'Sagittarius'],
    moonPhases: ['Waxing Moon', 'Full Moon'],
    planets: ['Mars', 'Sun'],
    intentions: [
      'courage',
      'creativity',
      'vitality',
      'motivation',
      'passion',
      'action',
    ],
    colors: ['Orange', 'Red-Orange', 'Brown'],
    hardness: 7,
    origin: ['India', 'Brazil', 'Uruguay', 'Indonesia'],
    rarity: 'common',
    ogColor: '#EA580C',
    primaryChakra: 'Sacral Chakra',
    keywords: ['Courage', 'Creativity', 'Vitality'],
    description:
      'The stone of courage that ignites passion and supports bold action',
    metaphysicalProperties:
      'Boosts courage and confidence, enhances creativity and motivation, increases vitality and physical energy. Supports taking action on goals and igniting passion.',
    physicalProperties: 'Chalcedony quartz colored by iron oxide impurities',
    historicalUse:
      'Used by warriors for courage, carried by artists for creativity, ancient Egyptians used it for protection',
    workingWith: {
      meditation:
        'Hold during meditation to boost confidence and ignite creative fire',
      spellwork:
        'Use in courage spells, creativity rituals, and motivation magic',
      healing: 'Supports reproductive health and boosts physical energy',
      manifestation:
        'Carry when you need courage to take action or start new creative projects',
    },
    careInstructions: {
      cleansing: ['sunlight', 'running water', 'smoke'],
      charging: ['sunlight', 'carnelian cluster'],
      programming:
        'Hold while visualizing yourself taking bold action and stating your goals',
    },
    combinations: {
      enhances: ['Citrine', 'Red Jasper', 'Sunstone'],
      complements: ['Clear Quartz', 'Amethyst', 'Rose Quartz'],
    },
    correspondences: {
      herbs: ['Ginger', 'Cinnamon', 'Basil'],
      incense: ['Frankincense', 'Cinnamon', 'Cedar'],
      oils: ['Ginger', 'Bergamot', 'Orange'],
      numbers: [1, 3],
      tarot: ['The Chariot', 'Ace of Wands', 'Knight of Wands'],
    },
  },
  {
    id: 'labradorite',
    name: 'Labradorite',
    alternativeNames: ['Spectrolite', 'Rainbow Moonstone'],
    properties: [
      'transformation',
      'magic',
      'protection',
      'intuition',
      'mysticism',
      'awakening',
    ],
    categories: ['Spiritual & Intuitive', 'Protection & Grounding'],
    chakras: ['Third Eye', 'Throat', 'Crown'],
    elements: ['Air', 'Water'],
    zodiacSigns: ['Aquarius', 'Scorpio', 'Pisces'],
    moonPhases: ['New Moon', 'Full Moon'],
    planets: ['Uranus', 'Neptune'],
    intentions: [
      'transformation',
      'psychic protection',
      'intuition',
      'magic',
      'awakening',
    ],
    colors: ['Gray', 'Blue', 'Green', 'Gold'],
    hardness: 6,
    origin: ['Canada', 'Finland', 'Madagascar', 'Russia'],
    rarity: 'common',
    ogColor: '#6366F1',
    primaryChakra: 'Third Eye Chakra',
    keywords: ['Transformation', 'Magic', 'Protection'],
    description:
      'The stone of transformation that reveals hidden truths and enhances spiritual gifts',
    metaphysicalProperties:
      'Protects against negative energy while enhancing intuition and psychic abilities. Supports transformation and spiritual awakening. Known as the stone of magic.',
    physicalProperties:
      'Feldspar mineral with labradorescence (colorful flash effect)',
    historicalUse:
      'Used by Inuit peoples for magic and protection, believed to contain the Northern Lights',
    workingWith: {
      meditation:
        'Hold during meditation to enhance intuition and connect with higher realms',
      spellwork:
        'Essential for protection magic, transformation spells, and psychic development',
      healing:
        'Supports mental clarity and emotional balance during transformation',
      manifestation:
        'Use during times of change to protect energy and enhance spiritual growth',
    },
    careInstructions: {
      cleansing: ['moonlight', 'smoke', 'sound'],
      charging: ['moonlight', 'selenite'],
      programming:
        'Hold while visualizing transformation and stating your spiritual intentions',
    },
    combinations: {
      enhances: ['Amethyst', 'Clear Quartz', 'Selenite'],
      complements: ['Moonstone', 'Lapis Lazuli', 'Fluorite'],
    },
    correspondences: {
      herbs: ['Mugwort', 'Lavender', 'Frankincense'],
      incense: ['Frankincense', 'Sandalwood', 'Mugwort'],
      oils: ['Frankincense', 'Lavender', 'Clary Sage'],
      numbers: [7, 9],
      tarot: ['The Star', 'The Moon', 'The Hermit'],
    },
  },
  {
    id: 'green-aventurine',
    name: 'Green Aventurine',
    alternativeNames: ['Aventurine', 'Indian Jade'],
    properties: [
      'luck',
      'opportunity',
      'prosperity',
      'heart healing',
      'growth',
      'optimism',
    ],
    categories: ['Manifestation & Abundance', 'Love & Heart Healing'],
    chakras: ['Heart'],
    elements: ['Earth'],
    zodiacSigns: ['Taurus', 'Virgo', 'Libra'],
    moonPhases: ['Waxing Moon', 'Full Moon'],
    planets: ['Venus', 'Mercury'],
    intentions: [
      'luck',
      'opportunity',
      'prosperity',
      'heart healing',
      'growth',
      'emotional balance',
    ],
    colors: ['Green'],
    hardness: 7,
    origin: ['India', 'Brazil', 'Russia', 'Tibet'],
    rarity: 'common',
    ogColor: '#10B981',
    primaryChakra: 'Heart Chakra',
    keywords: ['Luck', 'Opportunity', 'Prosperity'],
    description:
      'The stone of opportunity that opens doors and attracts good fortune',
    metaphysicalProperties:
      'Attracts luck and opportunities, opens the heart to love and healing, promotes prosperity and growth. Enhances optimism and emotional balance.',
    physicalProperties:
      'Quartz with mica inclusions creating the shimmering aventurescence effect',
    historicalUse:
      'Used in ancient times for luck and opportunity, carried by merchants and travelers',
    workingWith: {
      meditation:
        'Hold over heart chakra to open to love and attract opportunities',
      spellwork:
        'Use in luck spells, prosperity magic, and heart healing rituals',
      healing: 'Supports heart health and emotional healing',
      manifestation:
        'Carry or place in wealth corner to attract opportunities and prosperity',
    },
    careInstructions: {
      cleansing: ['running water', 'smoke', 'moonlight'],
      charging: ['sunlight', 'green aventurine cluster'],
      programming:
        'Hold while visualizing opportunities opening and stating your intentions',
    },
    combinations: {
      enhances: ['Rose Quartz', 'Citrine', 'Clear Quartz'],
      complements: ['Amethyst', 'Moonstone', 'Jade'],
    },
    correspondences: {
      herbs: ['Basil', 'Mint', 'Sage'],
      incense: ['Sandalwood', 'Frankincense', 'Cedar'],
      oils: ['Bergamot', 'Geranium', 'Rose'],
      numbers: [4, 6],
      tarot: ['The Wheel of Fortune', 'Ace of Pentacles', 'Six of Cups'],
    },
  },
  {
    id: 'lapis-lazuli',
    name: 'Lapis Lazuli',
    alternativeNames: ['Lapis', 'Sapphire of the Poor'],
    properties: [
      'wisdom',
      'truth',
      'communication',
      'intuition',
      'divine connection',
      'self-expression',
    ],
    categories: ['Spiritual & Intuitive', 'Communication & Clarity'],
    chakras: ['Third Eye', 'Throat'],
    elements: ['Air', 'Water'],
    zodiacSigns: ['Sagittarius', 'Pisces', 'Aquarius'],
    moonPhases: ['Full Moon', 'New Moon'],
    planets: ['Jupiter', 'Venus'],
    intentions: [
      'wisdom',
      'truth',
      'communication',
      'intuition',
      'self-expression',
      'divine connection',
    ],
    colors: ['Blue', 'Deep Blue', 'Gold'],
    hardness: 5.5,
    origin: ['Afghanistan', 'Chile', 'Russia', 'Pakistan'],
    rarity: 'uncommon',
    ogColor: '#1E40AF',
    primaryChakra: 'Third Eye Chakra',
    keywords: ['Wisdom', 'Truth', 'Communication'],
    description:
      'The stone of wisdom that enhances communication and reveals deeper truths',
    metaphysicalProperties:
      'Enhances wisdom and truth-seeking, improves communication and self-expression, strengthens intuition and divine connection. Known as the stone of truth.',
    physicalProperties:
      'Metamorphic rock containing lazurite, pyrite, and calcite',
    historicalUse:
      'Prized by ancient Egyptians for royalty and wisdom, used in burial masks and jewelry',
    workingWith: {
      meditation:
        'Place on third eye or throat chakra during meditation for wisdom and clarity',
      spellwork: 'Use in truth spells, communication magic, and wisdom rituals',
      healing: 'Supports throat health and mental clarity',
      manifestation:
        'Carry when you need courage to speak your truth or seek wisdom',
    },
    careInstructions: {
      cleansing: ['smoke', 'sound', 'dry methods only'],
      charging: ['moonlight', 'selenite'],
      programming:
        'Hold while stating your truth and setting intentions for clear communication',
    },
    combinations: {
      enhances: ['Clear Quartz', 'Sodalite', 'Amethyst'],
      complements: ['Rose Quartz', 'Moonstone', 'Turquoise'],
    },
    correspondences: {
      herbs: ['Sage', 'Frankincense', 'Mugwort'],
      incense: ['Frankincense', 'Sandalwood', 'Sage'],
      oils: ['Frankincense', 'Sandalwood', 'Cedar'],
      numbers: [3, 7],
      tarot: ['The Hierophant', 'The Hermit', 'Ace of Swords'],
    },
  },
  {
    id: 'hematite',
    name: 'Hematite',
    alternativeNames: ['Iron Rose', 'Blood Stone'],
    properties: [
      'grounding',
      'focus',
      'mental clarity',
      'protection',
      'strength',
      'concentration',
    ],
    categories: ['Protection & Grounding', 'Healing & Wellness'],
    chakras: ['Root'],
    elements: ['Earth'],
    zodiacSigns: ['Aries', 'Capricorn', 'Virgo'],
    moonPhases: ['Waning Moon', 'New Moon'],
    planets: ['Mars', 'Saturn'],
    intentions: [
      'grounding',
      'focus',
      'mental clarity',
      'protection',
      'strength',
      'concentration',
    ],
    colors: ['Silver', 'Metallic', 'Black'],
    hardness: 6,
    origin: ['Brazil', 'Canada', 'United States', 'Venezuela'],
    rarity: 'common',
    ogColor: '#6B7280',
    primaryChakra: 'Root Chakra',
    keywords: ['Grounding', 'Focus', 'Strength'],
    description:
      'The stone of focus that grounds scattered energy and enhances mental clarity',
    metaphysicalProperties:
      'Powerfully grounds scattered energy, enhances focus and concentration, strengthens connection to Earth. Provides mental clarity and emotional stability.',
    physicalProperties:
      'Iron oxide mineral with metallic luster, often polished to mirror-like finish',
    historicalUse:
      'Used by ancient peoples for protection and grounding, carried by warriors for strength',
    workingWith: {
      meditation: 'Hold during meditation to ground energy and enhance focus',
      spellwork: 'Use in grounding spells, protection magic, and focus rituals',
      healing: 'Supports blood health and physical strength',
      manifestation:
        'Carry when you need to stay grounded and focused on practical goals',
    },
    careInstructions: {
      cleansing: ['earth burial', 'smoke', 'sound'],
      charging: ['earth connection', 'hematite cluster'],
      programming:
        'Hold while visualizing yourself grounded and focused, stating your intentions',
    },
    combinations: {
      enhances: ['Black Tourmaline', 'Smoky Quartz', 'Obsidian'],
      complements: ['Clear Quartz', 'Amethyst', 'Rose Quartz'],
    },
    correspondences: {
      herbs: ['Sage', 'Rosemary', 'Basil'],
      incense: ['Frankincense', 'Sage', 'Cedar'],
      oils: ['Rosemary', 'Basil', 'Cedar'],
      numbers: [1, 4],
      tarot: ['The Emperor', 'Four of Pentacles', 'Ace of Pentacles'],
    },
  },
  {
    id: 'sodalite',
    name: 'Sodalite',
    alternativeNames: ['Princess Blue'],
    properties: [
      'logic',
      'communication',
      'truth',
      'rational thinking',
      'self-expression',
      'clarity',
    ],
    categories: ['Communication & Clarity', 'Spiritual & Intuitive'],
    chakras: ['Throat', 'Third Eye'],
    elements: ['Air', 'Water'],
    zodiacSigns: ['Gemini', 'Virgo', 'Aquarius'],
    moonPhases: ['Full Moon', 'New Moon'],
    planets: ['Mercury', 'Jupiter'],
    intentions: [
      'logic',
      'communication',
      'truth',
      'rational thinking',
      'self-expression',
      'mental clarity',
    ],
    colors: ['Blue', 'White', 'Gray'],
    hardness: 6,
    origin: ['Canada', 'Brazil', 'Namibia', 'Russia'],
    rarity: 'common',
    ogColor: '#3B82F6',
    primaryChakra: 'Throat Chakra',
    keywords: ['Logic', 'Communication', 'Clarity'],
    description:
      'The stone of logic that balances rational thinking with intuitive wisdom',
    metaphysicalProperties:
      'Enhances logical thinking and clear communication, balances logic with intuition, promotes truth and self-expression. Supports rational decision-making.',
    physicalProperties:
      'Feldspathoid mineral, often found with white calcite veins',
    historicalUse:
      'Used by ancient peoples for communication and truth-seeking',
    workingWith: {
      meditation:
        'Place on throat chakra during meditation to enhance communication',
      spellwork:
        'Use in communication spells, truth magic, and clarity rituals',
      healing: 'Supports throat health and mental clarity',
      manifestation:
        'Carry when you need to communicate clearly or make logical decisions',
    },
    careInstructions: {
      cleansing: ['running water', 'smoke', 'sound'],
      charging: ['moonlight', 'selenite'],
      programming:
        'Hold while visualizing clear communication and stating your truth',
    },
    combinations: {
      enhances: ['Lapis Lazuli', 'Clear Quartz', 'Amethyst'],
      complements: ['Rose Quartz', 'Moonstone', 'Turquoise'],
    },
    correspondences: {
      herbs: ['Sage', 'Mint', 'Eucalyptus'],
      incense: ['Sandalwood', 'Frankincense', 'Sage'],
      oils: ['Peppermint', 'Eucalyptus', 'Sage'],
      numbers: [3, 6],
      tarot: ['The Magician', 'Ace of Swords', 'Page of Swords'],
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    alternativeNames: ['Volcanic Glass', 'Apache Tear'],
    properties: [
      'protection',
      'grounding',
      'truth',
      'transformation',
      'psychic shield',
      'clarity',
    ],
    categories: ['Protection & Grounding', 'Spiritual & Intuitive'],
    chakras: ['Root'],
    elements: ['Fire', 'Earth'],
    zodiacSigns: ['Scorpio', 'Capricorn', 'Sagittarius'],
    moonPhases: ['Waning Moon', 'Dark Moon', 'New Moon'],
    planets: ['Saturn', 'Pluto'],
    intentions: [
      'protection',
      'grounding',
      'truth',
      'transformation',
      'psychic protection',
      'clarity',
    ],
    colors: ['Black', 'Dark Gray'],
    hardness: 5,
    origin: ['United States', 'Mexico', 'Iceland', 'Italy'],
    rarity: 'common',
    ogColor: '#111827',
    primaryChakra: 'Root Chakra',
    keywords: ['Protection', 'Truth', 'Transformation'],
    description:
      'The powerful protector that cuts through illusions and reveals hidden truths',
    metaphysicalProperties:
      'Creates powerful protective barriers, reveals hidden truths and cuts through illusions, supports transformation and grounding. Powerful psychic shield.',
    physicalProperties: 'Volcanic glass formed from rapidly cooled lava',
    historicalUse:
      'Used by ancient peoples for tools, weapons, and protection, sacred to many cultures',
    workingWith: {
      meditation: 'Hold during meditation for protection and truth-seeking',
      spellwork:
        'Essential for protection spells, banishing rituals, and truth magic',
      healing: 'Supports emotional release and transformation',
      manifestation:
        'Use during times of transformation to protect energy and reveal truth',
    },
    careInstructions: {
      cleansing: ['earth burial', 'smoke', 'sound', 'running water'],
      charging: ['earth connection', 'obsidian cluster'],
      programming:
        'Hold while visualizing protective barriers and stating your intentions',
    },
    combinations: {
      enhances: ['Black Tourmaline', 'Smoky Quartz', 'Hematite'],
      complements: ['Clear Quartz', 'Amethyst', 'Selenite'],
    },
    correspondences: {
      herbs: ['Sage', 'Rosemary', 'Basil', 'Salt'],
      incense: ["Dragon's Blood", 'Frankincense', 'Myrrh'],
      oils: ['Rosemary', 'Basil', 'Frankincense'],
      numbers: [1, 8],
      tarot: ['The Tower', 'Death', 'Judgement'],
    },
  },
  {
    id: 'garnet',
    name: 'Garnet',
    alternativeNames: ['Carbuncle'],
    properties: [
      'passion',
      'energy',
      'commitment',
      'vitality',
      'courage',
      'strength',
    ],
    categories: ['Healing & Wellness', 'Protection & Grounding'],
    chakras: ['Root', 'Heart'],
    elements: ['Fire', 'Earth'],
    zodiacSigns: ['Aries', 'Leo', 'Capricorn'],
    moonPhases: ['Waxing Moon', 'Full Moon'],
    planets: ['Mars', 'Pluto'],
    intentions: [
      'passion',
      'energy',
      'commitment',
      'vitality',
      'courage',
      'strength',
    ],
    colors: ['Red', 'Deep Red', 'Garnet'],
    hardness: 7.5,
    origin: ['India', 'Sri Lanka', 'Brazil', 'United States'],
    rarity: 'common',
    ogColor: '#DC2626',
    primaryChakra: 'Root Chakra',
    keywords: ['Passion', 'Energy', 'Commitment'],
    description:
      'The stone of passion that energizes the spirit and strengthens commitment',
    metaphysicalProperties:
      'Boosts passion and energy, strengthens commitment and devotion, enhances vitality and courage. Supports taking action and following through on goals.',
    physicalProperties:
      'Silicate mineral group with various colors, most commonly red',
    historicalUse:
      'Used by warriors for protection and courage, carried by travelers for safety',
    workingWith: {
      meditation: 'Hold during meditation to boost energy and ignite passion',
      spellwork: 'Use in passion spells, commitment magic, and energy rituals',
      healing: 'Supports blood health and physical vitality',
      manifestation:
        'Carry when you need energy and commitment to achieve your goals',
    },
    careInstructions: {
      cleansing: ['running water', 'smoke', 'sound'],
      charging: ['sunlight', 'garnet cluster'],
      programming:
        'Hold while visualizing passion and commitment, stating your intentions',
    },
    combinations: {
      enhances: ['Carnelian', 'Red Jasper', 'Citrine'],
      complements: ['Clear Quartz', 'Rose Quartz', 'Amethyst'],
    },
    correspondences: {
      herbs: ['Ginger', 'Cinnamon', 'Basil'],
      incense: ['Frankincense', 'Cinnamon', 'Cedar'],
      oils: ['Ginger', 'Bergamot', 'Cinnamon'],
      numbers: [1, 3],
      tarot: ['The Chariot', 'Ace of Wands', 'Knight of Wands'],
    },
  },
  {
    id: 'pyrite',
    name: 'Pyrite',
    alternativeNames: ["Fool's Gold", 'Iron Pyrite'],
    properties: [
      'confidence',
      'prosperity',
      'willpower',
      'protection',
      'abundance',
      'self-worth',
    ],
    categories: ['Manifestation & Abundance', 'Protection & Grounding'],
    chakras: ['Solar Plexus'],
    elements: ['Fire', 'Earth'],
    zodiacSigns: ['Leo', 'Aries', 'Sagittarius'],
    moonPhases: ['Waxing Moon', 'Full Moon'],
    planets: ['Sun', 'Mars'],
    intentions: [
      'confidence',
      'prosperity',
      'willpower',
      'protection',
      'abundance',
      'self-worth',
    ],
    colors: ['Gold', 'Metallic', 'Brass'],
    hardness: 6.5,
    origin: ['Spain', 'Peru', 'United States', 'Russia'],
    rarity: 'common',
    ogColor: '#F59E0B',
    primaryChakra: 'Solar Plexus Chakra',
    keywords: ['Confidence', 'Prosperity', 'Protection'],
    description:
      'The stone of confidence that shields from negativity while attracting abundance',
    metaphysicalProperties:
      'Boosts confidence and self-worth, attracts prosperity and abundance, strengthens willpower. Protects against negative energy while enhancing personal power.',
    physicalProperties:
      'Iron sulfide mineral with metallic luster, often mistaken for gold',
    historicalUse:
      'Used in ancient times for protection and prosperity, carried by merchants',
    workingWith: {
      meditation:
        'Hold during meditation to boost confidence and attract abundance',
      spellwork:
        'Use in prosperity spells, confidence magic, and protection rituals',
      healing: 'Supports mental clarity and self-esteem',
      manifestation:
        'Carry or place in wealth corner to attract prosperity and boost confidence',
    },
    careInstructions: {
      cleansing: ['smoke', 'sound', 'dry methods only'],
      charging: ['sunlight', 'pyrite cluster'],
      programming:
        'Hold while visualizing confidence and prosperity, stating your intentions',
    },
    combinations: {
      enhances: ['Citrine', 'Clear Quartz', 'Green Aventurine'],
      complements: ['Amethyst', 'Rose Quartz', 'Tiger Eye'],
    },
    correspondences: {
      herbs: ['Cinnamon', 'Ginger', 'Basil'],
      incense: ['Frankincense', 'Cinnamon', 'Sandalwood'],
      oils: ['Bergamot', 'Ginger', 'Cinnamon'],
      numbers: [1, 3, 8],
      tarot: ['The Sun', 'Ace of Pentacles', 'Ten of Pentacles'],
    },
  },
  {
    id: 'tigers-eye',
    name: "Tiger's Eye",
    alternativeNames: ['Tiger Eye', 'Tigereye'],
    properties: [
      'courage',
      'protection',
      'focus',
      'confidence',
      'grounding',
      'practical action',
    ],
    categories: ['Protection & Grounding', 'Manifestation & Abundance'],
    chakras: ['Solar Plexus', 'Root'],
    elements: ['Earth', 'Fire'],
    zodiacSigns: ['Leo', 'Capricorn', 'Gemini'],
    moonPhases: ['Waxing Moon', 'Full Moon'],
    planets: ['Sun', 'Mars'],
    intentions: [
      'courage',
      'protection',
      'focus',
      'confidence',
      'grounding',
      'practical action',
    ],
    colors: ['Brown', 'Golden', 'Yellow'],
    hardness: 7,
    origin: ['South Africa', 'Australia', 'India', 'Myanmar'],
    rarity: 'common',
    ogColor: '#D97706',
    primaryChakra: 'Solar Plexus Chakra',
    keywords: ['Courage', 'Protection', 'Focus'],
    description:
      'The stone of courage that combines Earth stability with Solar confidence',
    metaphysicalProperties:
      'Enhances courage and personal power, provides protection while maintaining focus, combines Earth grounding with Solar confidence. Supports practical action.',
    physicalProperties:
      "Quartz with crocidolite inclusions creating the chatoyant (cat's eye) effect",
    historicalUse:
      'Used by warriors for protection and courage, carried for confidence and focus',
    workingWith: {
      meditation:
        'Hold during meditation to boost confidence and maintain focus',
      spellwork: 'Use in protection spells, courage magic, and focus rituals',
      healing: 'Supports mental clarity and emotional stability',
      manifestation:
        'Carry when you need courage and focus to take practical action',
    },
    careInstructions: {
      cleansing: ['sunlight', 'smoke', 'sound'],
      charging: ['sunlight', 'tiger eye cluster'],
      programming:
        'Hold while visualizing courage and focus, stating your intentions',
    },
    combinations: {
      enhances: ['Citrine', 'Pyrite', 'Red Jasper'],
      complements: ['Clear Quartz', 'Amethyst', 'Black Tourmaline'],
    },
    correspondences: {
      herbs: ['Cinnamon', 'Ginger', 'Basil'],
      incense: ['Frankincense', 'Cinnamon', 'Cedar'],
      oils: ['Ginger', 'Bergamot', 'Cinnamon'],
      numbers: [1, 3],
      tarot: ['Strength', 'The Sun', 'Ace of Wands'],
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
    ogColor: '#1F2937',
    primaryChakra: 'Root Chakra',
    keywords: ['Protection', 'Grounding', 'Strength'],
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
  chakra: string;
  keywords: string[];
} => {
  const crystal = getCrystalByName(crystalName);

  if (crystal) {
    return {
      color: crystal.ogColor || getColorFromName(crystal.colors[0] || 'Purple'),
      chakra:
        crystal.primaryChakra || formatChakra(crystal.chakras[0] || 'Crown'),
      keywords:
        crystal.keywords || crystal.properties.slice(0, 3).map(capitalize),
    };
  }

  // Fallback for unknown crystals
  return {
    color: '#9333EA',
    chakra: 'Crown Chakra',
    keywords: ['Balance', 'Harmony', 'Energy'],
  };
};

// Helper to format chakra name for OG display
const formatChakra = (chakra: string): string => {
  if (chakra === 'All Chakras') return 'All Chakras';
  const chakraMap: Record<string, string> = {
    Root: 'Root Chakra',
    Sacral: 'Sacral Chakra',
    'Solar Plexus': 'Solar Plexus',
    Heart: 'Heart Chakra',
    Throat: 'Throat Chakra',
    'Third Eye': 'Third Eye',
    Crown: 'Crown Chakra',
  };
  return chakraMap[chakra] || `${chakra} Chakra`;
};

// Helper to get hex color from color name
const getColorFromName = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    Purple: '#9333EA',
    Violet: '#9333EA',
    Lavender: '#9333EA',
    Pink: '#F472B6',
    Rose: '#F472B6',
    Clear: '#F3F4F6',
    White: '#F3F4F6',
    Black: '#1F2937',
    Yellow: '#F59E0B',
    Golden: '#F59E0B',
    Orange: '#EA580C',
    'Red-Orange': '#EA580C',
    Green: '#10B981',
    Blue: '#3B82F6',
    'Blue-Green': '#14B8A6',
    Turquoise: '#14B8A6',
    Brown: '#92400E',
    Gray: '#6B7280',
    Silver: '#9CA3AF',
    Metallic: '#9CA3AF',
    Red: '#DC2626',
    'Deep Red': '#991B1B',
  };
  return colorMap[colorName] || '#9333EA';
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
