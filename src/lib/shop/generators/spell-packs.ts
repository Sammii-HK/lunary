import { spellDatabase } from '@/constants/grimoire/spells';
import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

interface SpellPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  descriptionTemplate: string;
  spellCategories: string[];
  moonPhases?: string[];
  keywords: string[];
  perfectFor: string[];
  price: number;
  gradient: string;
  tags?: string[];
  badge?: 'new' | 'seasonal' | 'trending' | 'popular';
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
    moonPhases: ['New Moon', 'Waxing Crescent'],
    keywords: ['manifestation', 'new moon', 'intention', 'beginning'],
    perfectFor: [
      'Monthly new moon rituals',
      'Goal setting and manifestation work',
      'Starting fresh chapters',
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
    moonPhases: ['Full Moon', 'Waning Gibbous'],
    keywords: ['release', 'full moon', 'letting go', 'completion'],
    perfectFor: [
      'Monthly full moon ceremonies',
      'Breaking patterns and habits',
      'Closure and completion rituals',
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
      'Building a self-care practice',
      'Healing from heartbreak',
      'Reconnecting with your inner self',
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
      'Empaths and sensitive souls',
      'Creating energetic boundaries',
      'Protecting home and sacred spaces',
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
      'The next Mercury retrograde season',
      'Smoothing communication mishaps',
      'Protecting devices and travel plans',
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
      'Processing returning exes or old feelings',
      'Reevaluating relationship patterns',
      'Deep self-love and worth work',
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
      'Managing frustration during Mars retrograde',
      'Reviewing goals and projects',
      'Redirecting assertive energy',
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
      'Building lasting habits and structures',
      'Grounding during times of change',
      'Embracing responsibility with grace',
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
      'Aries season rituals (March 21 - April 19)',
      'Starting new projects',
      'Building courage and confidence',
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
      'Taurus season rituals (April 20 - May 20)',
      'Abundance and prosperity magic',
      'Grounding and stability work',
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
      'Gemini season rituals (May 21 - June 20)',
      'Enhancing communication',
      'Study and learning magic',
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
      'Cancer season rituals (June 21 - July 22)',
      'Home blessing and protection',
      'Emotional healing work',
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
      'Leo season rituals (July 23 - August 22)',
      'Boosting confidence and charisma',
      'Creative expression magic',
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
      'Virgo season rituals (August 23 - September 22)',
      'Health and wellness magic',
      'Organisation and decluttering',
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
      'Libra season rituals (September 23 - October 22)',
      'Relationship harmony magic',
      'Justice and fairness spells',
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
      'Scorpio season rituals (October 23 - November 21)',
      'Shadow work and transformation',
      'Psychic development',
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
      'Sagittarius season rituals (November 22 - December 21)',
      'Travel protection and adventure',
      'Expanding horizons and wisdom',
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
      'Capricorn season rituals (December 22 - January 19)',
      'Career and ambition magic',
      'Building lasting foundations',
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
      'Aquarius season rituals (January 20 - February 18)',
      'Breaking free from limitations',
      'Community and humanitarian magic',
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
      'Pisces season rituals (February 19 - March 20)',
      'Dream work and intuition',
      'Spiritual and psychic development',
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
      'Fire sign magic (Aries, Leo, Sagittarius)',
      'Candle magic and flame work',
      'Building courage and passion',
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
      'Water sign magic (Cancer, Scorpio, Pisces)',
      'Emotional healing and release',
      'Moon and tide magic',
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
      'Air sign magic (Gemini, Libra, Aquarius)',
      'Communication and mental clarity',
      'Travel and new beginnings',
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
      'Earth sign magic (Taurus, Virgo, Capricorn)',
      'Abundance and prosperity',
      'Grounding and stability work',
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
    moonPhases: ['Waxing Crescent', 'First Quarter', 'Waxing Gibbous'],
    keywords: ['waxing moon', 'growth', 'building', 'attraction'],
    perfectFor: [
      'Waxing moon phase rituals',
      'Building toward goals',
      'Attraction and growth magic',
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
    moonPhases: ['First Quarter'],
    keywords: ['first quarter', 'action', 'decision', 'obstacles'],
    perfectFor: [
      'First quarter moon rituals',
      'Overcoming challenges',
      'Making important decisions',
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
    moonPhases: ['Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
    keywords: ['waning moon', 'release', 'banishing', 'letting go'],
    perfectFor: [
      'Waning moon phase rituals',
      'Releasing and banishing',
      'Breaking bad habits',
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
    moonPhases: ['Last Quarter'],
    keywords: ['last quarter', 'surrender', 'forgiveness', 'reflection'],
    perfectFor: [
      'Last quarter moon rituals',
      'Forgiveness and releasing grudges',
      'Preparing for new cycles',
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
      'Processing loss and bereavement',
      'Honouring ancestors and loved ones',
      'Finding comfort in difficult times',
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
      'Overcoming imposter syndrome',
      'Public speaking and presentations',
      'Interviews and important meetings',
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
      'Managing anxiety and panic',
      'Creating calm in chaos',
      'Grounding scattered energy',
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
      'Lifting depression and heaviness',
      'Cultivating daily joy',
      "Celebrating life's pleasures",
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
      'Releasing pent-up rage',
      'Transforming anger productively',
      'Setting firm boundaries',
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
      'Facing phobias and fears',
      'Taking scary leaps',
      'Building courage muscles',
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
      'Healing low self-esteem',
      'Releasing internalised criticism',
      'Remembering your inherent value',
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
      'Releasing grudges and resentment',
      'Self-forgiveness work',
      'Cord cutting and freedom',
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
      'Emerging from depression',
      'Finding hope after loss',
      'Rekindling optimism',
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
      'Cultivating inner calm',
      'Meditation support',
      'Finding peace in busy lives',
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
      'Jupiter retrograde periods',
      'Inner spiritual growth',
      'Recognising hidden blessings',
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
      'Uranus retrograde periods',
      'Inner revolution and change',
      'Embracing authenticity',
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
      'Neptune retrograde periods',
      'Seeing through deception',
      'Grounding spiritual practice',
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
      'Pluto retrograde periods',
      'Deep shadow integration',
      'Profound transformation',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.supernovaToNebula,
    tags: ['retrograde', 'pluto', 'transformation', 'shadow work'],
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
];

function getSpellsForPack(config: SpellPackConfig): string[] {
  const matchingSpells = spellDatabase.filter((spell) => {
    const categoryMatch = config.spellCategories.includes(spell.category);
    const moonMatch =
      !config.moonPhases ||
      config.moonPhases.some(
        (phase) =>
          spell.timing.moonPhases?.includes(phase) ||
          spell.timing.moonPhases?.includes('Any'),
      );
    return categoryMatch || moonMatch;
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

  if (config.moonPhases) {
    baseContents.push(`Moon phase timing guide for ${config.moonPhases[0]}`);
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
