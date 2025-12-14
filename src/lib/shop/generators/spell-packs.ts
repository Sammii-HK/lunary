import { spellDatabase } from '@/lib/spells';
import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

interface SpellPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  descriptionTemplate: string;
  spellCategories: string[];
  moonPhase?: string[];
  keywords: string[];
  perfectFor: string[];
  price: number;
  gradient: string;
  tags?: string[];
  badge?: 'new' | 'seasonal' | 'trending' | 'popular';
  stripePriceId?: string;
}

// === CORE SPELL PACKS (8) ===
const CORE_SPELL_CONFIGS: SpellPackConfig[] = [
  {
    id: 'new-moon-manifestation',
    slug: 'new-moon-manifestation-pack',
    title: 'New Moon Manifestation Pack',
    tagline: 'Plant seeds of intention under the dark moon.',
    descriptionTemplate:
      'The new moon invites you to dream. This collection gathers manifestation rituals, intention-setting spells, and lunar magic designed to be cast during the dark moon phase. Let the quiet darkness hold your wishes as they begin to take root.',
    spellCategories: ['manifestation'],
    moonPhase: ['New Moon', 'Waxing Crescent'],
    keywords: ['manifestation', 'new moon', 'intention', 'beginning'],
    perfectFor: [
      'Those who practise monthly new moon rituals.',
      'Anyone focused on goal-setting and manifestation work.',
      'Those who are beginning fresh chapters in their lives.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToComet,
    tags: ['moon', 'manifestation', 'new moon', 'intentions'],
    badge: 'popular',
  },
  {
    id: 'full-moon-release',
    slug: 'full-moon-release-pack',
    title: 'Full Moon Release Pack',
    tagline: 'Let go under the luminous light.',
    descriptionTemplate:
      'When the moon reaches her fullness, she illuminates what no longer serves you. This pack holds rituals for release, completion, and gratitude—spells designed to help you surrender the old and make space for what comes next.',
    spellCategories: ['banishing', 'cleansing'],
    moonPhase: ['Full Moon', 'Waning Gibbous'],
    keywords: ['release', 'full moon', 'letting go', 'completion'],
    perfectFor: [
      'Those who hold monthly full moon ceremonies.',
      'Anyone working to break patterns and habits.',
      'Those seeking closure and completion rituals.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightNebulaToHaze,
    tags: ['moon', 'release', 'full moon', 'letting go'],
    badge: 'popular',
  },
  {
    id: 'self-love-ritual',
    slug: 'self-love-ritual-pack',
    title: 'Self-Love Ritual Pack',
    tagline: 'Return to yourself with gentle magic.',
    descriptionTemplate:
      'Self-love is the foundation of all magic. This tender collection offers rituals for self-compassion, mirror work, and heart healing. Each spell reminds you of your inherent worth and helps you cultivate the relationship that matters most—the one with yourself.',
    spellCategories: ['love'],
    keywords: ['self-love', 'compassion', 'healing', 'worthiness'],
    perfectFor: [
      'Those building a meaningful self-care practice.',
      'Anyone healing from heartbreak or difficult relationships.',
      'Those seeking to reconnect with their inner self.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightHazeToRose,
    tags: ['love', 'self-love', 'healing', 'compassion'],
  },
  {
    id: 'protection-boundaries',
    slug: 'protection-boundaries-pack',
    title: 'Protection + Boundaries Pack',
    tagline: 'Shield your energy, reclaim your space.',
    descriptionTemplate:
      'Your energy is sacred. This collection offers potent protection spells, warding rituals, and boundary magic to help you move through the world feeling safe and sovereign. Learn to shield yourself from negativity while staying open to love.',
    spellCategories: ['protection'],
    keywords: ['protection', 'boundaries', 'shielding', 'safety'],
    perfectFor: [
      'Empaths and sensitive souls who absorb energy easily.',
      'Those learning to create and maintain energetic boundaries.',
      'Anyone seeking to protect their home and sacred spaces.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometNebulaHaze,
    tags: ['protection', 'boundaries', 'shielding', 'energy'],
  },
  {
    id: 'mercury-retrograde-survival',
    slug: 'mercury-retrograde-survival-pack',
    title: 'Mercury Retrograde Survival Pack',
    tagline: 'Navigate the cosmic chaos with grace.',
    descriptionTemplate:
      'Mercury retrograde need not derail you. This pack contains protective communication spells, tech-blessing rituals, and grounding practices to help you flow with the retrograde current rather than fight against it. Turn disruption into reflection.',
    spellCategories: ['protection', 'divination'],
    keywords: ['mercury retrograde', 'communication', 'travel', 'technology'],
    perfectFor: [
      'Those preparing for the next Mercury retrograde season.',
      'Anyone who wants to smooth communication mishaps.',
      'Those seeking to protect devices and travel plans.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.horizCometToRose,
    tags: ['retrograde', 'mercury', 'communication', 'protection'],
    badge: 'trending',
  },
  {
    id: 'venus-retrograde-healing',
    slug: 'venus-retrograde-healing-pack',
    title: 'Venus Retrograde Heart Healing Pack',
    tagline: 'Tend to old loves and hidden wounds.',
    descriptionTemplate:
      'Venus retrograde invites us to revisit matters of the heart. This collection offers gentle rituals for processing past relationships, healing old heartache, and recalibrating your relationship with beauty, pleasure, and self-worth.',
    spellCategories: ['love', 'healing'],
    keywords: ['venus retrograde', 'love', 'relationships', 'heart healing'],
    perfectFor: [
      'Those processing returning exes or old feelings.',
      'Anyone reevaluating their relationship patterns.',
      'Those engaged in deep self-love and self-worth work.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.roseFade,
    tags: ['retrograde', 'venus', 'love', 'healing'],
  },
  {
    id: 'mars-retrograde-reset',
    slug: 'mars-retrograde-reset-pack',
    title: 'Mars Retrograde Action Reset Pack',
    tagline: 'Redirect your fire, reclaim your power.',
    descriptionTemplate:
      'When Mars turns backward, frustration can build. This pack offers rituals for channelling anger constructively, patience spells, and practices for reviewing your goals and strategies. Transform stagnation into strategic rest.',
    spellCategories: ['banishing', 'manifestation'],
    keywords: ['mars retrograde', 'action', 'anger', 'motivation'],
    perfectFor: [
      'Those managing frustration during Mars retrograde.',
      'Anyone reviewing their goals and projects.',
      'Those seeking to redirect assertive energy constructively.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.supernovaToNebula,
    tags: ['retrograde', 'mars', 'action', 'motivation'],
  },
  {
    id: 'saturn-grounding',
    slug: 'saturn-grounding-pack',
    title: 'Saturn Grounding Pack',
    tagline: 'Find stability through ancient discipline.',
    descriptionTemplate:
      'Saturn asks us to build foundations that last. This collection holds grounding rituals, boundary-setting spells, and practices for cultivating patience and perseverance. Embrace the wisdom of slow, steady growth.',
    spellCategories: ['protection', 'manifestation'],
    keywords: ['saturn', 'grounding', 'discipline', 'structure'],
    perfectFor: [
      'Those building lasting habits and structures.',
      'Anyone seeking grounding during times of change.',
      'Those learning to embrace responsibility with grace.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.vertNebulaToRose,
    tags: ['saturn', 'grounding', 'discipline', 'stability'],
  },
];

// === ZODIAC SPELL PACKS (12) ===
const ZODIAC_SPELL_CONFIGS: SpellPackConfig[] = [
  {
    id: 'aries-season-spells',
    slug: 'aries-season-spell-pack',
    title: 'Aries Season Spell Pack',
    tagline: 'Ignite your inner warrior.',
    descriptionTemplate:
      "Channel the fiery energy of Aries season with spells for courage, new beginnings, and bold action. This pack harnesses the Ram's initiating force to help you start fresh and fearless.",
    spellCategories: ['manifestation', 'protection'],
    keywords: ['aries', 'fire', 'courage', 'new beginnings'],
    perfectFor: [
      'Those celebrating Aries season (21 March – 19 April).',
      'Anyone starting new projects or ventures.',
      'Those seeking to build courage and confidence.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaToRose,
    tags: ['zodiac', 'aries', 'fire', 'courage'],
  },
  {
    id: 'taurus-season-spells',
    slug: 'taurus-season-spell-pack',
    title: 'Taurus Season Spell Pack',
    tagline: 'Ground into abundance.',
    descriptionTemplate:
      "Embrace the sensual, earthy magic of Taurus season with spells for abundance, stability, and pleasure. This pack connects you to the Bull's steady power of manifestation.",
    spellCategories: ['manifestation', 'love'],
    keywords: ['taurus', 'earth', 'abundance', 'stability'],
    perfectFor: [
      'Those celebrating Taurus season (20 April – 20 May).',
      'Anyone focused on abundance and prosperity magic.',
      'Those seeking grounding and stability work.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeFade,
    tags: ['zodiac', 'taurus', 'earth', 'abundance'],
  },
  {
    id: 'gemini-season-spells',
    slug: 'gemini-season-spell-pack',
    title: 'Gemini Season Spell Pack',
    tagline: 'Speak your truth into being.',
    descriptionTemplate:
      "Harness the quicksilver energy of Gemini season with spells for communication, learning, and mental clarity. This pack channels the Twins' gift for connection and curiosity.",
    spellCategories: ['divination', 'manifestation'],
    keywords: ['gemini', 'air', 'communication', 'learning'],
    perfectFor: [
      'Those celebrating Gemini season (21 May – 20 June).',
      'Anyone seeking to enhance communication skills.',
      'Those focused on study and learning magic.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['zodiac', 'gemini', 'air', 'communication'],
  },
  {
    id: 'cancer-season-spells',
    slug: 'cancer-season-spell-pack',
    title: 'Cancer Season Spell Pack',
    tagline: 'Nurture what matters most.',
    descriptionTemplate:
      "Embrace the nurturing, intuitive magic of Cancer season with spells for home protection, emotional healing, and family blessings. This pack honours the Crab's sacred hearth.",
    spellCategories: ['protection', 'love'],
    keywords: ['cancer', 'water', 'home', 'nurturing'],
    perfectFor: [
      'Those celebrating Cancer season (21 June – 22 July).',
      'Anyone focused on home blessing and protection.',
      'Those engaged in emotional healing work.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightHazeToRose,
    tags: ['zodiac', 'cancer', 'water', 'home'],
  },
  {
    id: 'leo-season-spells',
    slug: 'leo-season-spell-pack',
    title: 'Leo Season Spell Pack',
    tagline: 'Shine in your fullest glory.',
    descriptionTemplate:
      "Radiate the bold, creative energy of Leo season with spells for confidence, self-expression, and joyful creation. This pack celebrates the Lion's royal magnificence.",
    spellCategories: ['manifestation', 'love'],
    keywords: ['leo', 'fire', 'confidence', 'creativity'],
    perfectFor: [
      'Those celebrating Leo season (23 July – 22 August).',
      'Anyone seeking to boost confidence and charisma.',
      'Those exploring creative expression through magic.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.roseToSupernova,
    tags: ['zodiac', 'leo', 'fire', 'confidence'],
  },
  {
    id: 'virgo-season-spells',
    slug: 'virgo-season-spell-pack',
    title: 'Virgo Season Spell Pack',
    tagline: 'Refine your sacred craft.',
    descriptionTemplate:
      "Channel the purifying, healing energy of Virgo season with spells for health, organisation, and practical magic. This pack honours the Virgin's devotion to service.",
    spellCategories: ['healing', 'cleansing'],
    keywords: ['virgo', 'earth', 'health', 'organisation'],
    perfectFor: [
      'Those celebrating Virgo season (23 August – 22 September).',
      'Anyone focused on health and wellness magic.',
      'Those seeking to bring order through organisation.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToComet,
    tags: ['zodiac', 'virgo', 'earth', 'healing'],
  },
  {
    id: 'libra-season-spells',
    slug: 'libra-season-spell-pack',
    title: 'Libra Season Spell Pack',
    tagline: 'Find your perfect balance.',
    descriptionTemplate:
      "Embrace the harmonising energy of Libra season with spells for relationships, justice, and beauty. This pack channels the Scales' quest for equilibrium and grace.",
    spellCategories: ['love', 'manifestation'],
    keywords: ['libra', 'air', 'balance', 'relationships'],
    perfectFor: [
      'Those celebrating Libra season (23 September – 22 October).',
      'Anyone focused on relationship harmony magic.',
      'Those seeking justice and fairness in their lives.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightNebulaToHaze,
    tags: ['zodiac', 'libra', 'air', 'balance'],
  },
  {
    id: 'scorpio-season-spells',
    slug: 'scorpio-season-spell-pack',
    title: 'Scorpio Season Spell Pack',
    tagline: 'Transform through the depths.',
    descriptionTemplate:
      "Harness the transformative, intense energy of Scorpio season with spells for shadow work, rebirth, and psychic power. This pack embraces the Scorpion's fearless descent.",
    spellCategories: ['banishing', 'divination'],
    keywords: ['scorpio', 'water', 'transformation', 'shadow work'],
    perfectFor: [
      'Those celebrating Scorpio season (23 October – 21 November).',
      'Anyone engaged in shadow work and transformation.',
      'Those developing their psychic abilities.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToSupernova,
    tags: ['zodiac', 'scorpio', 'water', 'transformation'],
  },
  {
    id: 'sagittarius-season-spells',
    slug: 'sagittarius-season-spell-pack',
    title: 'Sagittarius Season Spell Pack',
    tagline: 'Expand into infinite possibility.',
    descriptionTemplate:
      "Embrace the adventurous, philosophical energy of Sagittarius season with spells for travel, wisdom, and expansion. This pack fuels the Archer's eternal quest for truth.",
    spellCategories: ['manifestation', 'divination'],
    keywords: ['sagittarius', 'fire', 'adventure', 'wisdom'],
    perfectFor: [
      'Those celebrating Sagittarius season (22 November – 21 December).',
      'Anyone seeking travel protection and adventure.',
      'Those focused on expanding horizons and wisdom.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToSupernova,
    tags: ['zodiac', 'sagittarius', 'fire', 'adventure'],
  },
  {
    id: 'capricorn-season-spells',
    slug: 'capricorn-season-spell-pack',
    title: 'Capricorn Season Spell Pack',
    tagline: 'Build your legacy with purpose.',
    descriptionTemplate:
      "Channel the ambitious, disciplined energy of Capricorn season with spells for career success, structure, and long-term goals. This pack honours the Goat's steady climb.",
    spellCategories: ['manifestation', 'protection'],
    keywords: ['capricorn', 'earth', 'ambition', 'career'],
    perfectFor: [
      'Those celebrating Capricorn season (22 December – 19 January).',
      'Anyone focused on career and ambition magic.',
      'Those building lasting foundations in their lives.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToSupernova,
    tags: ['zodiac', 'capricorn', 'earth', 'ambition'],
    badge: 'seasonal',
  },
  {
    id: 'aquarius-season-spells',
    slug: 'aquarius-season-spell-pack',
    title: 'Aquarius Season Spell Pack',
    tagline: 'Revolutionise your reality.',
    descriptionTemplate:
      "Harness the innovative, rebellious energy of Aquarius season with spells for liberation, community, and visionary thinking. This pack channels the Water Bearer's electric genius.",
    spellCategories: ['manifestation', 'divination'],
    keywords: ['aquarius', 'air', 'innovation', 'community'],
    perfectFor: [
      'Those celebrating Aquarius season (20 January – 18 February).',
      'Anyone seeking to break free from limitations.',
      'Those drawn to community and humanitarian magic.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['zodiac', 'aquarius', 'air', 'innovation'],
  },
  {
    id: 'pisces-season-spells',
    slug: 'pisces-season-spell-pack',
    title: 'Pisces Season Spell Pack',
    tagline: 'Dissolve into divine connection.',
    descriptionTemplate:
      "Embrace the mystical, compassionate energy of Pisces season with spells for intuition, dreams, and spiritual connection. This pack honours the Fish's boundless imagination.",
    spellCategories: ['divination', 'love'],
    keywords: ['pisces', 'water', 'intuition', 'dreams'],
    perfectFor: [
      'Those celebrating Pisces season (19 February – 20 March).',
      'Anyone focused on dream work and intuition.',
      'Those developing spiritually and psychically.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: ['zodiac', 'pisces', 'water', 'intuition'],
  },
];

// === ELEMENTAL SPELL PACKS (4) ===
const ELEMENTAL_SPELL_CONFIGS: SpellPackConfig[] = [
  {
    id: 'fire-element-spells',
    slug: 'fire-element-spell-pack',
    title: 'Fire Element Spell Pack',
    tagline: 'Ignite passion, courage, and transformation.',
    descriptionTemplate:
      'Work with the transformative power of Fire through spells for passion, courage, creativity, and purification. This pack teaches you to harness flame energy safely and powerfully.',
    spellCategories: ['manifestation', 'banishing'],
    keywords: ['fire', 'element', 'passion', 'transformation'],
    perfectFor: [
      'Fire signs seeking to amplify their element (Aries, Leo, Sagittarius).',
      'Those drawn to candle magic and flame work.',
      'Anyone building courage and passion.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaToRose,
    tags: ['element', 'fire', 'passion', 'transformation'],
  },
  {
    id: 'water-element-spells',
    slug: 'water-element-spell-pack',
    title: 'Water Element Spell Pack',
    tagline: 'Flow with emotion, intuition, and healing.',
    descriptionTemplate:
      'Embrace the flowing power of Water through spells for emotional healing, intuition, love, and purification. This pack connects you to the depths of feeling and psychic awareness.',
    spellCategories: ['love', 'divination'],
    keywords: ['water', 'element', 'emotion', 'intuition'],
    perfectFor: [
      'Water signs seeking to amplify their element (Cancer, Scorpio, Pisces).',
      'Those focused on emotional healing and release.',
      'Anyone drawn to moon and tide magic.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: ['element', 'water', 'emotion', 'intuition'],
  },
  {
    id: 'air-element-spells',
    slug: 'air-element-spell-pack',
    title: 'Air Element Spell Pack',
    tagline: 'Breathe life into thought and communication.',
    descriptionTemplate:
      'Harness the clarifying power of Air through spells for communication, mental clarity, travel, and new ideas. This pack connects you to the realm of intellect and inspiration.',
    spellCategories: ['divination', 'manifestation'],
    keywords: ['air', 'element', 'communication', 'intellect'],
    perfectFor: [
      'Air signs seeking to amplify their element (Gemini, Libra, Aquarius).',
      'Those seeking communication and mental clarity.',
      'Anyone preparing for travel or new beginnings.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['element', 'air', 'communication', 'intellect'],
  },
  {
    id: 'earth-element-spells',
    slug: 'earth-element-spell-pack',
    title: 'Earth Element Spell Pack',
    tagline: 'Ground into abundance and stability.',
    descriptionTemplate:
      'Connect with the stabilising power of Earth through spells for abundance, protection, grounding, and manifestation. This pack roots you in practical, lasting magic.',
    spellCategories: ['manifestation', 'protection'],
    keywords: ['earth', 'element', 'abundance', 'grounding'],
    perfectFor: [
      'Earth signs seeking to amplify their element (Taurus, Virgo, Capricorn).',
      'Those focused on abundance and prosperity.',
      'Anyone seeking grounding and stability work.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeFade,
    tags: ['element', 'earth', 'abundance', 'grounding'],
  },
];

// === MOON PHASE SPELL PACKS (4 additional) ===
const MOON_PHASE_SPELL_CONFIGS: SpellPackConfig[] = [
  {
    id: 'waxing-moon-spells',
    slug: 'waxing-moon-spell-pack',
    title: 'Waxing Moon Spell Pack',
    tagline: 'Build momentum as the light grows.',
    descriptionTemplate:
      "Ride the building energy of the waxing moon with spells for growth, attraction, and building toward your goals. This pack harnesses the moon's increasing power for manifestation.",
    spellCategories: ['manifestation'],
    moonPhase: ['Waxing Crescent', 'First Quarter', 'Waxing Gibbous'],
    keywords: ['waxing moon', 'growth', 'building', 'attraction'],
    perfectFor: [
      'Those who practise waxing moon phase rituals.',
      'Anyone actively building toward their goals.',
      'Those drawn to attraction and growth magic.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToHaze,
    tags: ['moon', 'waxing', 'growth', 'manifestation'],
  },
  {
    id: 'first-quarter-spells',
    slug: 'first-quarter-moon-spell-pack',
    title: 'First Quarter Moon Spell Pack',
    tagline: 'Take decisive action at the crossroads.',
    descriptionTemplate:
      'The first quarter moon is a time of decision and action. This pack contains spells for overcoming obstacles, making choices, and pushing through challenges with determination.',
    spellCategories: ['manifestation', 'protection'],
    moonPhase: ['First Quarter'],
    keywords: ['first quarter', 'action', 'decision', 'obstacles'],
    perfectFor: [
      'Those who practise first quarter moon rituals.',
      'Anyone working to overcome challenges.',
      'Those facing important decisions.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.cometNebulaHaze,
    tags: ['moon', 'first quarter', 'action', 'decision'],
  },
  {
    id: 'waning-moon-spells',
    slug: 'waning-moon-spell-pack',
    title: 'Waning Moon Spell Pack',
    tagline: 'Release as the light retreats.',
    descriptionTemplate:
      'Work with the diminishing energy of the waning moon for spells of release, banishing, and letting go. This pack helps you clear what no longer serves as the moon shrinks.',
    spellCategories: ['banishing', 'cleansing'],
    moonPhase: ['Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
    keywords: ['waning moon', 'release', 'banishing', 'letting go'],
    perfectFor: [
      'Those who practise waning moon phase rituals.',
      'Anyone focused on releasing and banishing.',
      'Those working to break unhelpful habits.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.vertHazeToNebula,
    tags: ['moon', 'waning', 'release', 'banishing'],
  },
  {
    id: 'last-quarter-spells',
    slug: 'last-quarter-moon-spell-pack',
    title: 'Last Quarter Moon Spell Pack',
    tagline: 'Surrender and prepare for rebirth.',
    descriptionTemplate:
      'The last quarter moon invites reflection and surrender. This pack contains spells for forgiveness, releasing resentment, and preparing the ground for new beginnings.',
    spellCategories: ['banishing', 'healing'],
    moonPhase: ['Last Quarter'],
    keywords: ['last quarter', 'surrender', 'forgiveness', 'reflection'],
    perfectFor: [
      'Those who practise last quarter moon rituals.',
      'Anyone working on forgiveness and releasing grudges.',
      'Those preparing for new cycles.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightNebulaToMainHaze,
    tags: ['moon', 'last quarter', 'surrender', 'forgiveness'],
  },
];

// === EMOTIONAL SUPPORT SPELL PACKS (10) ===
const EMOTIONAL_SPELL_CONFIGS: SpellPackConfig[] = [
  {
    id: 'grief-healing-spells',
    slug: 'grief-healing-spell-pack',
    title: 'Grief Healing Spell Pack',
    tagline: 'Hold space for sorrow, find your way to peace.',
    descriptionTemplate:
      'Grief is love with nowhere to go. This pack offers gentle spells for processing loss, honouring those who have passed, and finding your way through the darkest valleys toward eventual peace.',
    spellCategories: ['healing'],
    keywords: ['grief', 'loss', 'healing', 'comfort'],
    perfectFor: [
      'Those processing loss and bereavement.',
      'Anyone wishing to honour ancestors and loved ones.',
      'Those seeking comfort in difficult times.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.vertNebulaToRose,
    tags: ['emotional', 'grief', 'healing', 'comfort'],
  },
  {
    id: 'confidence-building-spells',
    slug: 'confidence-building-spell-pack',
    title: 'Confidence Building Spell Pack',
    tagline: 'Step into your power and shine.',
    descriptionTemplate:
      'Reclaim your confidence with spells that banish self-doubt, boost self-esteem, and help you stand tall in your authentic power. This pack is your magical pep talk.',
    spellCategories: ['manifestation'],
    keywords: ['confidence', 'self-esteem', 'power', 'courage'],
    perfectFor: [
      'Those overcoming imposter syndrome.',
      'Anyone preparing for public speaking or presentations.',
      'Those facing interviews and important meetings.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.roseToSupernova,
    tags: ['emotional', 'confidence', 'empowerment', 'self-esteem'],
  },
  {
    id: 'anxiety-relief-spells',
    slug: 'anxiety-relief-spell-pack',
    title: 'Anxiety Relief Spell Pack',
    tagline: 'Calm the storm within.',
    descriptionTemplate:
      'When anxiety spirals, these spells offer grounding, calm, and relief. This pack includes rituals for panic moments, daily anxiety management, and long-term nervous system soothing.',
    spellCategories: ['healing', 'protection'],
    keywords: ['anxiety', 'calm', 'grounding', 'peace'],
    perfectFor: [
      'Those managing anxiety and panic.',
      'Anyone seeking to create calm in chaos.',
      'Those working to ground scattered energy.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.hazeFade,
    tags: ['emotional', 'anxiety', 'calm', 'grounding'],
    badge: 'popular',
  },
  {
    id: 'joy-attraction-spells',
    slug: 'joy-attraction-spell-pack',
    title: 'Joy Attraction Spell Pack',
    tagline: 'Invite more happiness into your life.',
    descriptionTemplate:
      'Joy is your birthright. This pack contains spells for attracting happiness, cultivating gratitude, and opening yourself to the simple pleasures that make life sweet.',
    spellCategories: ['manifestation', 'love'],
    keywords: ['joy', 'happiness', 'gratitude', 'pleasure'],
    perfectFor: [
      'Those working to lift depression and heaviness.',
      'Anyone seeking to cultivate daily joy.',
      "Those who wish to celebrate life's pleasures.",
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightHazeToSupernova,
    tags: ['emotional', 'joy', 'happiness', 'gratitude'],
  },
  {
    id: 'anger-release-spells',
    slug: 'anger-release-spell-pack',
    title: 'Anger Release Spell Pack',
    tagline: 'Transform fire into fuel.',
    descriptionTemplate:
      'Anger holds power—when channelled wisely. This pack offers spells for safely releasing rage, transforming anger into motivation, and setting healthy boundaries without burning bridges.',
    spellCategories: ['banishing'],
    keywords: ['anger', 'release', 'transformation', 'boundaries'],
    perfectFor: [
      'Those needing to release pent-up rage safely.',
      'Anyone wanting to transform anger productively.',
      'Those learning to set firm boundaries.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.supernovaToNebula,
    tags: ['emotional', 'anger', 'release', 'transformation'],
  },
  {
    id: 'fear-conquering-spells',
    slug: 'fear-conquering-spell-pack',
    title: 'Fear Conquering Spell Pack',
    tagline: 'Face what frightens you with magical support.',
    descriptionTemplate:
      'Fear shrinks when we face it. This pack contains spells for courage, protection from what scares you, and rituals to help you move through fear rather than around it.',
    spellCategories: ['protection', 'banishing'],
    keywords: ['fear', 'courage', 'bravery', 'overcoming'],
    perfectFor: [
      'Those ready to face phobias and fears.',
      'Anyone preparing to take scary leaps.',
      'Those building their courage muscles.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToSupernova,
    tags: ['emotional', 'fear', 'courage', 'bravery'],
  },
  {
    id: 'self-worth-spells',
    slug: 'self-worth-spell-pack',
    title: 'Self-Worth Spell Pack',
    tagline: 'Remember your inherent value.',
    descriptionTemplate:
      'You are worthy simply because you exist. This pack offers spells to heal wounded self-worth, release internalised criticism, and reconnect with your inherent preciousness.',
    spellCategories: ['love', 'healing'],
    keywords: ['self-worth', 'value', 'worthiness', 'self-love'],
    perfectFor: [
      'Those healing from low self-esteem.',
      'Anyone releasing internalised criticism.',
      'Those seeking to remember their inherent value.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightRoseToMainHaze,
    tags: ['emotional', 'self-worth', 'value', 'healing'],
  },
  {
    id: 'forgiveness-spells',
    slug: 'forgiveness-spell-pack',
    title: 'Forgiveness Spell Pack',
    tagline: 'Free yourself from the weight of resentment.',
    descriptionTemplate:
      'Forgiveness is a gift you give yourself. This pack contains spells for releasing resentment, forgiving yourself and others, and cutting cords that bind you to old hurts.',
    spellCategories: ['banishing', 'healing'],
    keywords: ['forgiveness', 'release', 'resentment', 'freedom'],
    perfectFor: [
      'Those ready to release grudges and resentment.',
      'Anyone engaged in self-forgiveness work.',
      'Those seeking cord cutting and freedom.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightNebulaToRose,
    tags: ['emotional', 'forgiveness', 'release', 'freedom'],
  },
  {
    id: 'hope-restoration-spells',
    slug: 'hope-restoration-spell-pack',
    title: 'Hope Restoration Spell Pack',
    tagline: 'Rekindle the light within.',
    descriptionTemplate:
      'When hope feels distant, these spells call it back. This pack offers rituals for rekindling optimism, finding light in darkness, and remembering that things can get better.',
    spellCategories: ['manifestation', 'healing'],
    keywords: ['hope', 'optimism', 'light', 'renewal'],
    perfectFor: [
      'Those emerging from depression.',
      'Anyone seeking hope after loss.',
      'Those working to rekindle optimism.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.nebulaToHaze,
    tags: ['emotional', 'hope', 'optimism', 'renewal'],
  },
  {
    id: 'inner-peace-spells',
    slug: 'inner-peace-spell-pack',
    title: 'Inner Peace Spell Pack',
    tagline: 'Find stillness in the chaos.',
    descriptionTemplate:
      'Peace is not the absence of storm but the calm within it. This pack contains spells for cultivating inner tranquility, silencing the inner critic, and finding your centre.',
    spellCategories: ['healing', 'protection'],
    keywords: ['peace', 'calm', 'tranquility', 'stillness'],
    perfectFor: [
      'Those cultivating inner calm.',
      'Anyone seeking meditation support.',
      'Those finding peace amid busy lives.',
    ],
    price: PRICE_TIERS.standard,
    gradient: SHOP_GRADIENTS.lightCometToHaze,
    tags: ['emotional', 'peace', 'calm', 'tranquility'],
  },
];

// === OUTER PLANET RETROGRADE PACKS (4) ===
const OUTER_RETROGRADE_CONFIGS: SpellPackConfig[] = [
  {
    id: 'jupiter-retrograde-spells',
    slug: 'jupiter-retrograde-spell-pack',
    title: 'Jupiter Retrograde Spell Pack',
    tagline: 'Turn inward for inner expansion.',
    descriptionTemplate:
      'Jupiter retrograde invites inner growth rather than outer expansion. This pack offers spells for philosophical reflection, spiritual study, and recognising abundance already present.',
    spellCategories: ['divination', 'manifestation'],
    keywords: ['jupiter', 'retrograde', 'expansion', 'philosophy'],
    perfectFor: [
      'Those navigating Jupiter retrograde periods.',
      'Anyone focused on inner spiritual growth.',
      'Those seeking to recognise hidden blessings.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.nebulaToHaze,
    tags: ['retrograde', 'jupiter', 'expansion', 'philosophy'],
  },
  {
    id: 'uranus-retrograde-spells',
    slug: 'uranus-retrograde-spell-pack',
    title: 'Uranus Retrograde Spell Pack',
    tagline: 'Revolutionise from within.',
    descriptionTemplate:
      'Uranus retrograde asks where you need inner liberation. This pack offers spells for breaking internal patterns, embracing your authentic self, and preparing for future breakthroughs.',
    spellCategories: ['banishing', 'manifestation'],
    keywords: ['uranus', 'retrograde', 'liberation', 'authenticity'],
    perfectFor: [
      'Those navigating Uranus retrograde periods.',
      'Anyone seeking inner revolution and change.',
      'Those embracing their authenticity.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.cometToSupernova,
    tags: ['retrograde', 'uranus', 'liberation', 'change'],
  },
  {
    id: 'neptune-retrograde-spells',
    slug: 'neptune-retrograde-spell-pack',
    title: 'Neptune Retrograde Spell Pack',
    tagline: 'See through the illusions.',
    descriptionTemplate:
      'Neptune retrograde lifts the veil of illusion. This pack offers spells for clarity, releasing escapism, confronting self-deception, and grounding spiritual practice in reality.',
    spellCategories: ['divination', 'banishing'],
    keywords: ['neptune', 'retrograde', 'clarity', 'illusion'],
    perfectFor: [
      'Those navigating Neptune retrograde periods.',
      'Anyone seeking to see through deception.',
      'Those grounding their spiritual practice.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: ['retrograde', 'neptune', 'clarity', 'truth'],
  },
  {
    id: 'pluto-retrograde-spells',
    slug: 'pluto-retrograde-spell-pack',
    title: 'Pluto Retrograde Spell Pack',
    tagline: 'Descend into the underworld within.',
    descriptionTemplate:
      'Pluto retrograde intensifies shadow work and inner transformation. This pack offers spells for facing buried truths, releasing what dies to make way for rebirth, and reclaiming power.',
    spellCategories: ['banishing', 'healing'],
    keywords: ['pluto', 'retrograde', 'transformation', 'shadow'],
    perfectFor: [
      'Those navigating Pluto retrograde periods.',
      'Anyone engaged in deep shadow integration.',
      'Those undergoing profound transformation.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.supernovaToNebula,
    tags: ['retrograde', 'pluto', 'transformation', 'shadow work'],
  },
];

const LUNAR_NEW_YEAR_SPELL_CONFIG: SpellPackConfig[] = [
  {
    id: 'lunar-new-year-abundance',
    slug: 'lunar-new-year-abundance-pack',
    title: 'Lunar New Year Abundance Pack',
    tagline: 'Welcome prosperity with the new moon.',
    descriptionTemplate:
      'The Lunar New Year marks a powerful portal for manifestation and fresh starts. This pack blends intention-setting, prosperity magic, and new-year renewal rituals timed to the new year moon.',
    spellCategories: ['manifestation', 'prosperity'], // or manifestation + protection if you prefer
    moonPhase: ['New Moon', 'Waxing Crescent'],
    keywords: [
      'lunar new year',
      'abundance',
      'prosperity',
      'new moon',
      'renewal',
    ],
    perfectFor: [
      'Those setting powerful yearly intentions.',
      'Anyone drawn to abundance and prosperity magic.',
      'Practitioners who honour lunar cycles in their work.',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.roseFade,
    tags: ['seasonal', 'abundance', 'prosperity', 'new moon'],
    badge: 'seasonal',
  },
];

// Combine all configs
const ALL_SPELL_PACK_CONFIGS: SpellPackConfig[] = [
  ...CORE_SPELL_CONFIGS,
  ...ZODIAC_SPELL_CONFIGS,
  ...ELEMENTAL_SPELL_CONFIGS,
  ...MOON_PHASE_SPELL_CONFIGS,
  ...EMOTIONAL_SPELL_CONFIGS,
  ...OUTER_RETROGRADE_CONFIGS,
  ...LUNAR_NEW_YEAR_SPELL_CONFIG,
];

function getSpellsForPack(config: SpellPackConfig): string[] {
  const matchingSpells = spellDatabase.filter((spell) => {
    const categoryMatch = config.spellCategories.includes(spell.category);
    const moonMatch =
      !config.moonPhase ||
      config.moonPhase.some(
        (phase) =>
          spell.timing.moonPhase?.includes(phase) ||
          spell.timing.moonPhase?.includes('Any'),
      );
    return categoryMatch && moonMatch;
  });

  if (matchingSpells.length > 0) {
    return matchingSpells.slice(0, 5).map((spell) => spell.title);
  }

  return [
    'Foundational ritual for this intention',
    'Quick daily practice',
    'Deep ceremonial working',
    'Protection and preparation spell',
    'Integration and closing ritual',
  ];
}

function generateWhatInside(config: SpellPackConfig): string[] {
  const spellTitles = getSpellsForPack(config);
  const baseContents = [
    `${spellTitles.length} curated spells and rituals`,
    'Step-by-step casting instructions',
    'Material lists with substitution options',
    'Timing recommendations for optimal results',
    'Incantations and visualisation guides',
  ];

  if (config.moonPhase) {
    baseContents.push(`Moon phase timing guide for ${config.moonPhase[0]}`);
  }

  return baseContents;
}

export function generateSpellPacks(): ShopProduct[] {
  return ALL_SPELL_PACK_CONFIGS.map((config) => ({
    id: config.id,
    slug: config.slug,
    title: config.title,
    tagline: config.tagline,
    description: config.descriptionTemplate,
    category: 'spell' as const,
    whatInside: generateWhatInside(config),
    perfectFor: config.perfectFor,
    related: ALL_SPELL_PACK_CONFIGS.filter((c) => c.id !== config.id)
      .slice(0, 3)
      .map((c) => c.slug),
    price: config.price,
    gradient: config.gradient,
    tags: config.tags,
    keywords: config.keywords,
    badge: config.badge,
  }));
}

export function getSpellPackBySlug(slug: string): ShopProduct | undefined {
  return generateSpellPacks().find((pack) => pack.slug === slug);
}
