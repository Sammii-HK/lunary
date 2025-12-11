import {
  crystalDatabase,
  getCrystalsByIntention,
  getCrystalsByZodiacSign,
  getCrystalsByChakra,
} from '@/constants/grimoire/crystals';
import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

interface CrystalPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  crystalSelectionMethod: 'intention' | 'zodiac' | 'chakra' | 'custom';
  selectionValue: string;
  customCrystals?: string[];
  perfectFor: string[];
  price: number;
  gradient: string;
  tags?: string[];
  keywords?: string[];
  badge?: 'new' | 'seasonal' | 'trending' | 'popular';
}

// === ZODIAC CRYSTAL PACKS (12) ===
const ZODIAC_CRYSTAL_CONFIGS: CrystalPackConfig[] = [
  {
    id: 'aries-crystals',
    slug: 'crystals-for-aries',
    title: 'Crystals for Aries',
    tagline: 'Fiery stones for the bold warrior.',
    description:
      'Channel the fierce energy of the Ram with crystals that amplify courage, initiative, and passionate action. This pack features stones aligned with Mars and the fire element to support your bold ventures.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Aries',
    perfectFor: [
      'Aries sun, moon, or rising',
      'Aries season rituals',
      'Boosting courage and initiative',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaToRose,
    tags: ['zodiac', 'aries', 'fire', 'mars'],
    keywords: ['aries crystals', 'crystals for aries', 'aries stones'],
  },
  {
    id: 'taurus-crystals',
    slug: 'crystals-for-taurus',
    title: 'Crystals for Taurus',
    tagline: 'Grounding stones for the sensual soul.',
    description:
      'Embrace the steady, luxurious energy of the Bull with crystals that enhance stability, abundance, and sensory pleasure. These Venus-ruled stones support your connection to earthly delights.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Taurus',
    perfectFor: [
      'Taurus sun, moon, or rising',
      'Taurus season grounding',
      'Manifesting abundance and stability',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeFade,
    tags: ['zodiac', 'taurus', 'earth', 'venus'],
    keywords: ['taurus crystals', 'crystals for taurus', 'taurus stones'],
  },
  {
    id: 'gemini-crystals',
    slug: 'crystals-for-gemini',
    title: 'Crystals for Gemini',
    tagline: 'Quicksilver stones for the curious mind.',
    description:
      'Feed your intellectual hunger with crystals that enhance communication, mental clarity, and adaptability. Mercury-ruled stones to help the Twins find balance between their many facets.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Gemini',
    perfectFor: [
      'Gemini sun, moon, or rising',
      'Enhancing communication skills',
      'Mental clarity and focus',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['zodiac', 'gemini', 'air', 'mercury'],
    keywords: ['gemini crystals', 'crystals for gemini', 'gemini stones'],
  },
  {
    id: 'cancer-crystals',
    slug: 'crystals-for-cancer',
    title: 'Crystals for Cancer',
    tagline: 'Nurturing stones for the tender heart.',
    description:
      'Honour your deep emotional wisdom with crystals that protect, nurture, and enhance intuition. Moon-ruled stones to support your natural empathy while maintaining healthy boundaries.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Cancer',
    perfectFor: [
      'Cancer sun, moon, or rising',
      'Emotional healing and protection',
      'Enhancing intuition',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightHazeToRose,
    tags: ['zodiac', 'cancer', 'water', 'moon'],
    keywords: ['cancer crystals', 'crystals for cancer', 'cancer stones'],
  },
  {
    id: 'leo-crystals',
    slug: 'crystals-for-leo',
    title: 'Crystals for Leo',
    tagline: 'Radiant stones for the regal heart.',
    description:
      'Amplify your natural magnetism with crystals that boost confidence, creativity, and joyful self-expression. Sun-ruled stones to help the Lion shine in their fullest glory.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Leo',
    perfectFor: [
      'Leo sun, moon, or rising',
      'Boosting confidence and charisma',
      'Creative self-expression',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.roseToSupernova,
    tags: ['zodiac', 'leo', 'fire', 'sun'],
    keywords: ['leo crystals', 'crystals for leo', 'leo stones'],
  },
  {
    id: 'virgo-crystals',
    slug: 'crystals-for-virgo',
    title: 'Crystals for Virgo',
    tagline: 'Purifying stones for the discerning healer.',
    description:
      'Support your natural healing gifts with crystals that enhance clarity, health, and practical wisdom. Mercury-ruled stones to help the Virgin refine their craft and serve with grace.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Virgo',
    perfectFor: [
      'Virgo sun, moon, or rising',
      'Health and wellness rituals',
      'Clarity and organisation',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToComet,
    tags: ['zodiac', 'virgo', 'earth', 'mercury'],
    keywords: ['virgo crystals', 'crystals for virgo', 'virgo stones'],
  },
  {
    id: 'libra-crystals',
    slug: 'crystals-for-libra',
    title: 'Crystals for Libra',
    tagline: 'Harmonising stones for the peacemaker.',
    description:
      'Find your centre with crystals that enhance balance, beauty, and harmonious relationships. Venus-ruled stones to support the Scales in creating peace both within and without.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Libra',
    perfectFor: [
      'Libra sun, moon, or rising',
      'Relationship harmony',
      'Finding balance and peace',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightNebulaToHaze,
    tags: ['zodiac', 'libra', 'air', 'venus'],
    keywords: ['libra crystals', 'crystals for libra', 'libra stones'],
  },
  {
    id: 'scorpio-crystals',
    slug: 'crystals-for-scorpio',
    title: 'Crystals for Scorpio',
    tagline: 'Transformative stones for the alchemist.',
    description:
      'Embrace your power of transformation with crystals that support deep healing, psychic development, and shadow integration. Pluto-ruled stones for the fearless journey into the depths.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Scorpio',
    perfectFor: [
      'Scorpio sun, moon, or rising',
      'Shadow work and transformation',
      'Psychic development',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToSupernova,
    tags: ['zodiac', 'scorpio', 'water', 'pluto'],
    keywords: ['scorpio crystals', 'crystals for scorpio', 'scorpio stones'],
  },
  {
    id: 'sagittarius-crystals',
    slug: 'crystals-for-sagittarius',
    title: 'Crystals for Sagittarius',
    tagline: 'Expansive stones for the eternal seeker.',
    description:
      'Fuel your quest for truth with crystals that enhance optimism, adventure, and philosophical wisdom. Jupiter-ruled stones to support the Archer in their journey toward meaning.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Sagittarius',
    perfectFor: [
      'Sagittarius sun, moon, or rising',
      'Travel protection and adventure',
      'Expanding wisdom and perspective',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToSupernova,
    tags: ['zodiac', 'sagittarius', 'fire', 'jupiter'],
    keywords: [
      'sagittarius crystals',
      'crystals for sagittarius',
      'sagittarius stones',
    ],
  },
  {
    id: 'capricorn-crystals',
    slug: 'crystals-for-capricorn',
    title: 'Crystals for Capricorn',
    tagline: 'Earthy stones for ambitious goals.',
    description:
      "Capricorn season calls us to build, achieve, and endure. This pack features crystals aligned with Saturn's disciplined energy—stones for focus, perseverance, and manifesting long-term dreams.",
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Capricorn',
    perfectFor: [
      'Capricorn sun, moon, or rising',
      'Career and ambition magic',
      'Building lasting foundations',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToSupernova,
    tags: ['zodiac', 'capricorn', 'earth', 'saturn'],
    keywords: [
      'capricorn crystals',
      'crystals for capricorn',
      'capricorn stones',
    ],
    badge: 'seasonal',
  },
  {
    id: 'aquarius-crystals',
    slug: 'crystals-for-aquarius',
    title: 'Crystals for Aquarius',
    tagline: 'Electric stones for the visionary rebel.',
    description:
      "Amplify your unique genius with crystals that enhance innovation, humanitarian vision, and authentic self-expression. Uranus-ruled stones for the Water Bearer's revolutionary spirit.",
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Aquarius',
    perfectFor: [
      'Aquarius sun, moon, or rising',
      'Innovation and invention',
      'Community and humanitarian work',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['zodiac', 'aquarius', 'air', 'uranus'],
    keywords: ['aquarius crystals', 'crystals for aquarius', 'aquarius stones'],
  },
  {
    id: 'pisces-crystals',
    slug: 'crystals-for-pisces',
    title: 'Crystals for Pisces',
    tagline: 'Dreamy stones for the mystic soul.',
    description:
      'Honour your spiritual sensitivity with crystals that enhance intuition, compassion, and creative imagination. Neptune-ruled stones to support the Fish in navigating between worlds.',
    crystalSelectionMethod: 'zodiac',
    selectionValue: 'Pisces',
    perfectFor: [
      'Pisces sun, moon, or rising',
      'Spiritual and psychic development',
      'Creative and artistic pursuits',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: ['zodiac', 'pisces', 'water', 'neptune'],
    keywords: ['pisces crystals', 'crystals for pisces', 'pisces stones'],
  },
];

// === PLANETARY CRYSTAL PACKS (10) ===
const PLANETARY_CRYSTAL_CONFIGS: CrystalPackConfig[] = [
  {
    id: 'sun-crystals',
    slug: 'crystals-for-the-sun',
    title: 'Crystals for the Sun',
    tagline: 'Radiant stones for vitality and self-expression.',
    description:
      'Harness solar energy with crystals that boost confidence, vitality, and authentic self-expression. These golden and warm-toned stones connect you to your core identity and life force.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'sun',
    customCrystals: [
      'Citrine',
      'Sunstone',
      'Amber',
      'Carnelian',
      'Tigers Eye',
      'Pyrite',
    ],
    perfectFor: [
      'Boosting confidence and vitality',
      'Connecting with your true self',
      'Sunday rituals and solar magic',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.roseToSupernova,
    tags: ['planetary', 'sun', 'vitality', 'confidence'],
    keywords: ['sun crystals', 'solar crystals', 'vitality stones'],
  },
  {
    id: 'moon-crystals',
    slug: 'crystals-for-the-moon',
    title: 'Crystals for the Moon',
    tagline: 'Luminous stones for intuition and emotion.',
    description:
      'Embrace lunar energy with crystals that enhance intuition, emotional wisdom, and psychic abilities. These silvery and iridescent stones attune you to the cycles of the moon.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'moon',
    customCrystals: [
      'Moonstone',
      'Selenite',
      'Labradorite',
      'Opal',
      'Pearl',
      'Clear Quartz',
    ],
    perfectFor: [
      'Moon phase rituals',
      'Developing intuition',
      'Emotional balance and healing',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightHazeToSupernova,
    tags: ['planetary', 'moon', 'intuition', 'emotions'],
    keywords: ['moon crystals', 'lunar crystals', 'intuition stones'],
    badge: 'popular',
  },
  {
    id: 'mercury-crystals',
    slug: 'crystals-for-mercury',
    title: 'Crystals for Mercury',
    tagline: 'Quicksilver stones for mind and message.',
    description:
      'Sharpen your mental faculties with crystals that enhance communication, learning, and mental agility. Perfect for Mercury retrograde protection and clear thinking.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'mercury',
    customCrystals: [
      'Blue Lace Agate',
      'Sodalite',
      'Fluorite',
      'Amazonite',
      'Howlite',
      'Apatite',
    ],
    perfectFor: [
      'Mercury retrograde survival',
      'Clear communication',
      'Study and learning',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['planetary', 'mercury', 'communication', 'intellect'],
    keywords: [
      'mercury crystals',
      'communication stones',
      'mercury retrograde crystals',
    ],
  },
  {
    id: 'venus-crystals',
    slug: 'crystals-for-venus',
    title: 'Crystals for Venus',
    tagline: 'Romantic stones for love and beauty.',
    description:
      'Attract love and enhance beauty with crystals aligned to Venus energy. These heart-opening stones support romance, self-love, artistic expression, and sensual pleasure.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'venus',
    customCrystals: [
      'Rose Quartz',
      'Rhodonite',
      'Green Aventurine',
      'Jade',
      'Emerald',
      'Kunzite',
    ],
    perfectFor: [
      'Love and romance magic',
      'Self-love rituals',
      'Friday Venus workings',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightHazeToRose,
    tags: ['planetary', 'venus', 'love', 'beauty'],
    keywords: ['venus crystals', 'love stones', 'heart crystals'],
    badge: 'popular',
  },
  {
    id: 'mars-crystals',
    slug: 'crystals-for-mars',
    title: 'Crystals for Mars',
    tagline: 'Warrior stones for courage and action.',
    description:
      'Ignite your inner warrior with crystals that boost courage, motivation, and protective strength. These fiery red and orange stones fuel your drive and defend your boundaries.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'mars',
    customCrystals: [
      'Red Jasper',
      'Carnelian',
      'Bloodstone',
      'Garnet',
      'Ruby',
      'Hematite',
    ],
    perfectFor: [
      'Courage and motivation',
      'Protection magic',
      'Tuesday Mars workings',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaToRose,
    tags: ['planetary', 'mars', 'courage', 'protection'],
    keywords: ['mars crystals', 'courage stones', 'warrior crystals'],
  },
  {
    id: 'jupiter-crystals',
    slug: 'crystals-for-jupiter',
    title: 'Crystals for Jupiter',
    tagline: 'Abundant stones for expansion and luck.',
    description:
      "Expand your horizons with crystals that attract abundance, luck, and spiritual growth. These royal purple and blue stones connect you to Jupiter's benevolent blessings.",
    crystalSelectionMethod: 'custom',
    selectionValue: 'jupiter',
    customCrystals: [
      'Amethyst',
      'Lapis Lazuli',
      'Turquoise',
      'Sapphire',
      'Azurite',
      'Sugilite',
    ],
    perfectFor: [
      'Abundance and prosperity magic',
      'Spiritual expansion',
      'Thursday Jupiter workings',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToHaze,
    tags: ['planetary', 'jupiter', 'abundance', 'luck'],
    keywords: ['jupiter crystals', 'abundance stones', 'luck crystals'],
  },
  {
    id: 'saturn-crystals',
    slug: 'crystals-for-saturn',
    title: 'Crystals for Saturn',
    tagline: 'Grounding stones for discipline and wisdom.',
    description:
      "Build lasting foundations with crystals that support discipline, boundaries, and karmic lessons. These dark and grounding stones help you master Saturn's teachings.",
    crystalSelectionMethod: 'custom',
    selectionValue: 'saturn',
    customCrystals: [
      'Black Tourmaline',
      'Obsidian',
      'Onyx',
      'Jet',
      'Shungite',
      'Smoky Quartz',
    ],
    perfectFor: [
      'Saturn return support',
      'Building discipline and structure',
      'Saturday Saturn workings',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToSupernova,
    tags: ['planetary', 'saturn', 'discipline', 'grounding'],
    keywords: ['saturn crystals', 'grounding stones', 'saturn return crystals'],
  },
  {
    id: 'uranus-crystals',
    slug: 'crystals-for-uranus',
    title: 'Crystals for Uranus',
    tagline: 'Electric stones for awakening and innovation.',
    description:
      'Embrace sudden change with crystals that support awakening, innovation, and liberation from old patterns. These high-vibration stones attune you to Uranian frequencies.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'uranus',
    customCrystals: [
      'Labradorite',
      'Aquamarine',
      'Tanzanite',
      'Moldavite',
      'Blue Kyanite',
      'Angelite',
    ],
    perfectFor: [
      'Embracing change and innovation',
      'Breaking free from limitations',
      'Awakening and transformation',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToSupernova,
    tags: ['planetary', 'uranus', 'awakening', 'innovation'],
    keywords: [
      'uranus crystals',
      'awakening stones',
      'transformation crystals',
    ],
  },
  {
    id: 'neptune-crystals',
    slug: 'crystals-for-neptune',
    title: 'Crystals for Neptune',
    tagline: 'Dreamy stones for mysticism and imagination.',
    description:
      "Dissolve boundaries with crystals that enhance psychic vision, spiritual connection, and creative imagination. These ethereal stones attune you to Neptune's mystical depths.",
    crystalSelectionMethod: 'custom',
    selectionValue: 'neptune',
    customCrystals: [
      'Amethyst',
      'Lepidolite',
      'Charoite',
      'Larimar',
      'Ametrine',
      'Celestite',
    ],
    perfectFor: [
      'Psychic development',
      'Dream work and meditation',
      'Spiritual and artistic pursuits',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: ['planetary', 'neptune', 'psychic', 'dreams'],
    keywords: ['neptune crystals', 'psychic stones', 'dream crystals'],
  },
  {
    id: 'pluto-crystals',
    slug: 'crystals-for-pluto',
    title: 'Crystals for Pluto',
    tagline: 'Transformative stones for death and rebirth.',
    description:
      'Navigate profound transformation with crystals that support shadow work, regeneration, and empowerment. These deep, intense stones accompany you through Plutonian transits.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'pluto',
    customCrystals: [
      'Obsidian',
      'Malachite',
      'Labradorite',
      'Moldavite',
      'Nuummite',
      'Black Kyanite',
    ],
    perfectFor: [
      'Shadow work and transformation',
      'Pluto transits and returns',
      'Deep healing and regeneration',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaToNebula,
    tags: ['planetary', 'pluto', 'transformation', 'shadow work'],
    keywords: [
      'pluto crystals',
      'transformation stones',
      'shadow work crystals',
    ],
  },
];

// === LIFE THEME CRYSTAL PACKS (16+) ===
const LIFE_THEME_CRYSTAL_CONFIGS: CrystalPackConfig[] = [
  {
    id: 'anxiety-relief-crystals',
    slug: 'crystals-for-anxiety-relief',
    title: 'Crystals for Anxiety Relief',
    tagline: 'Stone allies for nervous hearts.',
    description:
      'When anxiety tightens its grip, these crystalline companions offer gentle relief. This pack explores the most calming, grounding stones—their properties, how to work with them, and rituals for releasing worry.',
    crystalSelectionMethod: 'intention',
    selectionValue: 'stress relief',
    perfectFor: [
      'Those navigating anxious times',
      'Building a calming crystal collection',
      'Grounding and centring practices',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeFade,
    tags: ['emotional', 'anxiety', 'calming', 'stress'],
    keywords: ['anxiety crystals', 'calming stones', 'stress relief crystals'],
    badge: 'popular',
  },
  {
    id: 'heartbreak-crystals',
    slug: 'crystals-for-heartbreak',
    title: 'Crystals for Heartbreak',
    tagline: 'Tender stones for mending the heart.',
    description:
      'When love has left you shattered, these gentle companions support your healing. This pack features crystals that ease heartache, restore hope, and remind you of your inherent worthiness.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'heartbreak',
    customCrystals: [
      'Rose Quartz',
      'Rhodonite',
      'Mangano Calcite',
      'Apache Tear',
      'Chrysoprase',
      'Pink Opal',
    ],
    perfectFor: [
      'Healing after breakups or loss',
      'Restoring self-love',
      'Processing grief and sadness',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.roseFade,
    tags: ['emotional', 'heartbreak', 'healing', 'love'],
    keywords: [
      'heartbreak crystals',
      'healing stones',
      'broken heart crystals',
    ],
  },
  {
    id: 'sleep-crystals',
    slug: 'crystals-for-sleep',
    title: 'Crystals for Sleep',
    tagline: 'Dreamy stones for restful nights.',
    description:
      'Find peaceful slumber with crystals that calm the mind, ease nightmares, and invite restful sleep. This pack includes stones for your bedside, dream enhancement, and establishing healthy sleep rituals.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'sleep',
    customCrystals: [
      'Amethyst',
      'Howlite',
      'Lepidolite',
      'Moonstone',
      'Selenite',
      'Smoky Quartz',
    ],
    perfectFor: [
      'Insomnia and sleep difficulties',
      'Reducing nightmares',
      'Creating peaceful sleep space',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightNebulaToHaze,
    tags: ['emotional', 'sleep', 'dreams', 'calm'],
    keywords: ['sleep crystals', 'insomnia stones', 'dream crystals'],
  },
  {
    id: 'creativity-crystals',
    slug: 'crystals-for-creativity',
    title: 'Crystals for Creativity',
    tagline: 'Inspiring stones for the creative spirit.',
    description:
      'Unblock your creative channels with crystals that spark inspiration, enhance imagination, and support artistic expression. This pack helps artists, writers, and creators of all kinds.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'creativity',
    customCrystals: [
      'Carnelian',
      'Citrine',
      'Orange Calcite',
      'Tangerine Quartz',
      'Sunstone',
      'Vanadinite',
    ],
    perfectFor: [
      'Artists and creative professionals',
      'Breaking through creative blocks',
      'Sacral chakra activation',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaFade,
    tags: ['emotional', 'creativity', 'inspiration', 'art'],
    keywords: ['creativity crystals', 'inspiration stones', 'artist crystals'],
  },
  {
    id: 'confidence-crystals',
    slug: 'crystals-for-confidence',
    title: 'Crystals for Confidence',
    tagline: 'Empowering stones for self-belief.',
    description:
      'Step into your power with crystals that boost self-esteem, courage, and authentic expression. This pack supports you in overcoming self-doubt and shining your brightest light.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'confidence',
    customCrystals: [
      'Citrine',
      'Tigers Eye',
      'Carnelian',
      'Pyrite',
      'Sunstone',
      'Golden Healer Quartz',
    ],
    perfectFor: [
      'Building self-esteem',
      'Public speaking and presentations',
      'Solar plexus empowerment',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.roseToSupernova,
    tags: ['emotional', 'confidence', 'empowerment', 'courage'],
    keywords: [
      'confidence crystals',
      'self-esteem stones',
      'empowerment crystals',
    ],
  },
  {
    id: 'manifestation-crystals',
    slug: 'crystals-for-manifestation',
    title: 'Crystals for Manifestation',
    tagline: 'Powerful stones for bringing dreams to life.',
    description:
      'Amplify your intentions with crystals that support manifestation, goal-setting, and attracting abundance. This pack includes high-vibration stones for creating the life you desire.',
    crystalSelectionMethod: 'intention',
    selectionValue: 'manifestation',
    perfectFor: [
      'New moon intention setting',
      'Vision board and goal work',
      'Abundance and prosperity rituals',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToHaze,
    tags: ['spiritual', 'manifestation', 'abundance', 'intentions'],
    keywords: [
      'manifestation crystals',
      'abundance stones',
      'intention crystals',
    ],
    badge: 'trending',
  },
  {
    id: 'grief-crystals',
    slug: 'crystals-for-grief',
    title: 'Crystals for Grief',
    tagline: 'Comforting stones for times of loss.',
    description:
      'Hold space for your sorrow with crystals that offer comfort, acceptance, and gentle healing. This pack supports you through grief, loss, and the process of letting go.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'grief',
    customCrystals: [
      'Apache Tear',
      'Smoky Quartz',
      'Rose Quartz',
      'Rhodonite',
      'Lepidolite',
      'Aquamarine',
    ],
    perfectFor: [
      'Processing loss and grief',
      'Honouring those who have passed',
      'Finding acceptance and peace',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.vertNebulaToRose,
    tags: ['emotional', 'grief', 'comfort', 'healing'],
    keywords: ['grief crystals', 'loss stones', 'comfort crystals'],
  },
  {
    id: 'psychic-protection-crystals',
    slug: 'crystals-for-psychic-protection',
    title: 'Crystals for Psychic Protection',
    tagline: 'Shielding stones for sensitive souls.',
    description:
      'Protect your energy field with crystals that shield against negativity, psychic attack, and energy vampires. Essential for empaths, healers, and spiritually sensitive individuals.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'psychic protection',
    customCrystals: [
      'Black Tourmaline',
      'Obsidian',
      'Labradorite',
      'Amethyst',
      'Shungite',
      'Black Kyanite',
    ],
    perfectFor: [
      'Empaths and sensitives',
      'Energy workers and healers',
      'Protection from negative energy',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToSupernova,
    tags: ['protection', 'psychic', 'empath', 'shielding'],
    keywords: [
      'psychic protection crystals',
      'empath stones',
      'shielding crystals',
    ],
  },
  {
    id: 'focus-crystals',
    slug: 'crystals-for-focus',
    title: 'Crystals for Focus',
    tagline: 'Clarifying stones for sharp minds.',
    description:
      'Cut through mental fog with crystals that enhance concentration, memory, and mental clarity. This pack supports students, professionals, and anyone needing laser-like focus.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'focus',
    customCrystals: [
      'Fluorite',
      'Clear Quartz',
      'Tigers Eye',
      'Sodalite',
      'Hematite',
      'Amazonite',
    ],
    perfectFor: [
      'Study and exam preparation',
      'Work and productivity',
      'Clearing mental fog',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['mental', 'focus', 'clarity', 'study'],
    keywords: ['focus crystals', 'concentration stones', 'study crystals'],
  },
  {
    id: 'love-attraction-crystals',
    slug: 'crystals-for-attracting-love',
    title: 'Crystals for Attracting Love',
    tagline: 'Magnetic stones for drawing in romance.',
    description:
      'Open your heart to new love with crystals that attract romantic partners, enhance magnetism, and prepare you for healthy relationships. This pack works on both inner and outer love.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'love',
    customCrystals: [
      'Rose Quartz',
      'Rhodochrosite',
      'Green Aventurine',
      'Pink Tourmaline',
      'Garnet',
      'Moonstone',
    ],
    perfectFor: [
      'Attracting romantic partners',
      'Opening the heart chakra',
      'Preparing for new relationships',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeToRose,
    tags: ['love', 'romance', 'attraction', 'heart'],
    keywords: ['love crystals', 'romance stones', 'attraction crystals'],
  },
  {
    id: 'shadow-work-crystals',
    slug: 'shadow-work-crystal-pack',
    title: 'Shadow Work Crystal Pack',
    tagline: 'Companions for the descent.',
    description:
      'Shadow work asks us to face what we have hidden. These crystals offer protection and support as you explore your depths—stones for uncovering truth, processing emotions, and integrating all parts of yourself.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'shadow',
    customCrystals: [
      'Obsidian',
      'Smoky Quartz',
      'Black Tourmaline',
      'Labradorite',
      'Malachite',
      'Moldavite',
    ],
    perfectFor: [
      'Deep psychological and spiritual work',
      'Processing trauma with crystal support',
      'Integrating rejected aspects of self',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToSupernova,
    tags: ['shadow work', 'transformation', 'healing', 'depth'],
    keywords: [
      'shadow work crystals',
      'transformation stones',
      'healing crystals',
    ],
  },
  {
    id: 'new-beginnings-crystals',
    slug: 'crystals-for-new-beginnings',
    title: 'Crystals for New Beginnings',
    tagline: 'Fresh start stones for new chapters.',
    description:
      'Step into new phases with crystals that support fresh starts, courage for change, and optimism for what lies ahead. Perfect for new jobs, moves, relationships, or any life transition.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'new beginnings',
    customCrystals: [
      'Citrine',
      'Moonstone',
      'Amazonite',
      'Aventurine',
      'Clear Quartz',
      'Aquamarine',
    ],
    perfectFor: [
      'Starting new chapters in life',
      'Career or location changes',
      'New year and new moon rituals',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightCometToHaze,
    tags: ['transition', 'new beginnings', 'change', 'fresh start'],
    keywords: [
      'new beginnings crystals',
      'fresh start stones',
      'change crystals',
    ],
    badge: 'new',
  },
  {
    id: 'letting-go-crystals',
    slug: 'crystals-for-letting-go',
    title: 'Crystals for Letting Go',
    tagline: 'Releasing stones for what no longer serves.',
    description:
      'Release what weighs you down with crystals that support letting go, forgiveness, and energetic cord cutting. This pack helps you clear the past and make space for the new.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'letting go',
    customCrystals: [
      'Smoky Quartz',
      'Obsidian',
      'Black Tourmaline',
      'Rhodonite',
      'Danburite',
      'Blue Lace Agate',
    ],
    perfectFor: [
      'Full moon release rituals',
      'Cord cutting ceremonies',
      'Moving on from the past',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.vertHazeToNebula,
    tags: ['release', 'letting go', 'forgiveness', 'cord cutting'],
    keywords: [
      'letting go crystals',
      'release stones',
      'cord cutting crystals',
    ],
  },
  {
    id: 'childhood-healing-crystals',
    slug: 'crystals-for-healing-childhood-wounds',
    title: 'Crystals for Healing Childhood Wounds',
    tagline: 'Nurturing stones for your inner child.',
    description:
      'Tend to old wounds with crystals that support inner child healing, re-parenting, and releasing childhood trauma. This pack creates a safe container for deep healing work.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'childhood healing',
    customCrystals: [
      'Rose Quartz',
      'Rhodonite',
      'Chrysoprase',
      'Pink Calcite',
      'Lepidolite',
      'Larimar',
    ],
    perfectFor: [
      'Inner child healing work',
      'Therapy and counselling support',
      'Breaking generational patterns',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightRoseToSupernova,
    tags: ['healing', 'inner child', 'trauma', 'nurturing'],
    keywords: [
      'inner child crystals',
      'childhood healing stones',
      'trauma crystals',
    ],
  },
  {
    id: 'empath-shielding-crystals',
    slug: 'crystals-for-empath-shielding',
    title: 'Crystals for Empath Shielding',
    tagline: 'Protective stones for absorbing souls.',
    description:
      'Maintain healthy boundaries while honouring your sensitivity. This pack features crystals that help empaths distinguish their energy from others, shield against overwhelm, and recharge.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'empath',
    customCrystals: [
      'Black Tourmaline',
      'Labradorite',
      'Hematite',
      'Fluorite',
      'Malachite',
      'Tigers Eye',
    ],
    perfectFor: [
      'Highly sensitive people',
      'Energy workers and healers',
      'Crowded or intense environments',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometNebulaHaze,
    tags: ['empath', 'protection', 'boundaries', 'sensitive'],
    keywords: ['empath crystals', 'sensitive stones', 'boundary crystals'],
  },
  {
    id: 'travel-protection-crystals',
    slug: 'crystals-for-travel-protection',
    title: 'Crystals for Travel Protection',
    tagline: 'Guardian stones for safe journeys.',
    description:
      'Travel with confidence using crystals that offer protection, ease jet lag, and bring good fortune on your journeys. This pack is your essential travel companion.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'travel',
    customCrystals: [
      'Black Tourmaline',
      'Malachite',
      'Moonstone',
      'Amethyst',
      'Tigers Eye',
      'Aquamarine',
    ],
    perfectFor: [
      'Safe travel and protection',
      'Reducing travel anxiety',
      'Jet lag and travel fatigue',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.horizNebulaToHaze,
    tags: ['travel', 'protection', 'journey', 'adventure'],
    keywords: ['travel crystals', 'protection stones', 'journey crystals'],
  },
  {
    id: 'spiritual-awakening-crystals',
    slug: 'crystals-for-spiritual-awakening',
    title: 'Crystals for Spiritual Awakening',
    tagline: 'High-vibration stones for ascension.',
    description:
      'Support your spiritual evolution with crystals that raise your vibration, open higher chakras, and facilitate connection with higher dimensions and guides.',
    crystalSelectionMethod: 'custom',
    selectionValue: 'awakening',
    customCrystals: [
      'Moldavite',
      'Clear Quartz',
      'Selenite',
      'Apophyllite',
      'Danburite',
      'Phenacite',
    ],
    perfectFor: [
      'Spiritual awakening and ascension',
      'Connecting with guides and higher self',
      'Raising your vibration',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaHazeNebula,
    tags: ['spiritual', 'awakening', 'ascension', 'high vibration'],
    keywords: [
      'awakening crystals',
      'ascension stones',
      'high vibration crystals',
    ],
  },
  {
    id: 'psychic-opening-crystals',
    slug: 'crystals-for-psychic-opening',
    title: 'Crystals for Psychic Opening',
    tagline: 'Awaken your inner sight.',
    description:
      'Ready to deepen your intuition? This collection explores crystals that open the third eye, enhance psychic abilities, and support spiritual connection. Learn to work with these high-vibration stones safely.',
    crystalSelectionMethod: 'chakra',
    selectionValue: 'Third Eye',
    perfectFor: [
      'Developing intuitive abilities',
      'Meditation and spiritual practice',
      'Divination and oracle work',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: ['psychic', 'intuition', 'third eye', 'clairvoyance'],
    keywords: ['psychic crystals', 'third eye stones', 'intuition crystals'],
  },
];

// Combine all configs
const ALL_CRYSTAL_PACK_CONFIGS: CrystalPackConfig[] = [
  ...ZODIAC_CRYSTAL_CONFIGS,
  ...PLANETARY_CRYSTAL_CONFIGS,
  ...LIFE_THEME_CRYSTAL_CONFIGS,
];

function getCrystalsForPack(config: CrystalPackConfig): string[] {
  if (config.customCrystals) {
    return config.customCrystals;
  }

  let crystals: typeof crystalDatabase = [];

  switch (config.crystalSelectionMethod) {
    case 'intention':
      crystals = getCrystalsByIntention(config.selectionValue);
      break;
    case 'zodiac':
      crystals = getCrystalsByZodiacSign(config.selectionValue);
      break;
    case 'chakra':
      crystals = getCrystalsByChakra(config.selectionValue);
      break;
    default:
      crystals = crystalDatabase.slice(0, 5);
  }

  return crystals.slice(0, 6).map((c) => c.name);
}

function generateWhatInside(config: CrystalPackConfig): string[] {
  const crystalNames = getCrystalsForPack(config);
  const crystalCount = crystalNames.length || 5;

  return [
    `${crystalCount} crystal profiles with properties and meanings`,
    'Cleansing and charging instructions',
    'Meditation practices for each stone',
    'Crystal grid layouts and suggestions',
    'Ritual applications and spell correspondences',
    'Care instructions and crystal ethics',
  ];
}

export function generateCrystalPacks(): ShopProduct[] {
  return ALL_CRYSTAL_PACK_CONFIGS.map((config) => ({
    id: config.id,
    slug: config.slug,
    title: config.title,
    tagline: config.tagline,
    description: config.description,
    category: 'crystal' as const,
    whatInside: generateWhatInside(config),
    perfectFor: config.perfectFor,
    related: ALL_CRYSTAL_PACK_CONFIGS.filter((c) => c.id !== config.id)
      .slice(0, 3)
      .map((c) => c.slug),
    price: config.price,
    gradient: config.gradient,
    tags: config.tags,
    keywords: config.keywords,
    badge: config.badge,
  }));
}

export function getCrystalPackBySlug(slug: string): ShopProduct | undefined {
  return generateCrystalPacks().find((pack) => pack.slug === slug);
}
