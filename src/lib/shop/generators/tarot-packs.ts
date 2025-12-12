import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

interface TarotSpread {
  name: string;
  cardCount: number;
  description: string;
  positions: string[];
}

interface TarotPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  spreads: TarotSpread[];
  ritual: string;
  journalPrompts: string[];
  perfectFor: string[];
  price: number;
  gradient: string;
  tags?: string[];
  keywords?: string[];
  badge?: 'new' | 'seasonal' | 'trending' | 'popular';
}

const TAROT_PACK_CONFIGS: TarotPackConfig[] = [
  {
    id: 'shadow-excavation-tarot',
    slug: 'shadow-excavation-tarot-pack',
    title: 'Shadow Excavation Tarot Pack',
    tagline: 'Illuminate the hidden corners of self.',
    description:
      'The shadow holds our rejected gifts, our buried pain, our untapped power. This pack offers spreads designed specifically for shadow work—layouts that gently reveal what lies beneath, along with interpretation guides and integration rituals. Meet yourself in the dark.',
    spreads: [
      {
        name: 'The Mirror Spread',
        cardCount: 5,
        description:
          'Reveals the face you show, the face you hide, and the integration point.',
        positions: [
          'The Mask',
          'The Shadow',
          'The Root',
          'The Gift',
          'Integration',
        ],
      },
      {
        name: 'Descent Journey',
        cardCount: 7,
        description: 'A journey into and back from the underworld of psyche.',
        positions: [
          'The Call',
          'The Threshold',
          'The Descent',
          'The Ordeal',
          'The Treasure',
          'The Return',
          'The Gift',
        ],
      },
      {
        name: 'Wound and Wisdom',
        cardCount: 4,
        description: 'Transforms pain into power.',
        positions: ['The Wound', 'The Pattern', 'The Teaching', 'The Medicine'],
      },
    ],
    ritual:
      'A candle ritual for creating sacred space before shadow work readings.',
    journalPrompts: [
      'What part of myself have I been refusing to see?',
      'What gift lies hidden in my shame?',
      'How can I hold this aspect of myself with compassion?',
    ],
    perfectFor: [
      'Those drawn to deep psychological exploration.',
      'Anyone processing difficult emotions through the cards.',
      'Practitioners of Jungian-inspired inner work.',
    ],
    price: PRICE_TIERS.tarotPremium,
    gradient: SHOP_GRADIENTS.nebulaHazeRose, // Deep shadow work journey
  },
  {
    id: 'heart-mirror-relationship',
    slug: 'heart-mirror-relationship-pack',
    title: 'Heart Mirror Relationship Pack',
    tagline: 'See love with clearer eyes.',
    description:
      'Relationships are mirrors reflecting our deepest patterns. This pack contains spreads for understanding romantic dynamics, healing connection wounds, and cultivating self-love as the foundation. Whether single or partnered, these layouts illuminate the heart.',
    spreads: [
      {
        name: 'The Connection Spread',
        cardCount: 6,
        description: 'Maps the energy between you and another.',
        positions: [
          'Your Energy',
          'Their Energy',
          'The Bond',
          'The Challenge',
          'The Gift',
          'The Path Forward',
        ],
      },
      {
        name: 'Self-Love Mirror',
        cardCount: 5,
        description: 'Reflects your relationship with yourself.',
        positions: [
          'How I See Myself',
          'What I Need',
          'What I Give',
          "My Heart's Desire",
          'Self-Love Action',
        ],
      },
      {
        name: 'Pattern Breaker',
        cardCount: 4,
        description: 'Reveals and releases repeating relationship patterns.',
        positions: [
          'The Pattern',
          'Its Origin',
          'What Maintains It',
          'The Release',
        ],
      },
      {
        name: 'Love Calling Spread',
        cardCount: 5,
        description: 'For those seeking new love.',
        positions: [
          'What I Offer',
          'What I Seek',
          'Current Block',
          'Opening Energy',
          'Next Step',
        ],
      },
    ],
    ritual: 'A rose quartz heart-opening ritual before relationship readings.',
    journalPrompts: [
      'What pattern keeps appearing in my relationships?',
      'Where do I abandon myself for connection?',
      'What does healthy love feel like in my body?',
    ],
    perfectFor: [
      'Those seeking to understand relationship dynamics.',
      'Anyone healing from heartbreak or loss.',
      'Those ready to call in new love.',
    ],
    price: PRICE_TIERS.tarotPremium,
    gradient: SHOP_GRADIENTS.roseToSupernova, // Romantic, heart energy
  },
  {
    id: 'career-insight-tarot',
    slug: 'career-insight-tarot-pack',
    title: 'Career Insight Tarot Pack',
    tagline: 'Align your work with your soul.',
    description:
      'Your career is a path of purpose. This pack offers spreads for navigating professional crossroads, discovering vocational calling, and manifesting abundance. Let the cards guide you toward work that feeds both your bank account and your spirit.',
    spreads: [
      {
        name: 'Vocational Compass',
        cardCount: 5,
        description: 'Points toward your true calling.',
        positions: [
          'Current Position',
          'Hidden Skills',
          "Soul's Calling",
          'Obstacle',
          'Next Step',
        ],
      },
      {
        name: 'The Crossroads',
        cardCount: 4,
        description: 'For making career decisions.',
        positions: [
          'Path A Outcome',
          'Path B Outcome',
          "What I'm Not Seeing",
          "Heart's Truth",
        ],
      },
      {
        name: 'Abundance Channel',
        cardCount: 5,
        description: 'Opens the flow of prosperity.',
        positions: [
          'Current Abundance State',
          'Block to Receiving',
          'Hidden Resource',
          'Action to Take',
          'Prosperity Outcome',
        ],
      },
    ],
    ritual: 'A prosperity candle ritual for career readings.',
    journalPrompts: [
      'What would I do if money were no object?',
      'Where am I undervaluing my gifts?',
      'What does success mean to me?',
    ],
    perfectFor: [
      'Those navigating career transitions and pivots.',
      'Anyone manifesting professional abundance.',
      'Those seeking to find deeper purpose in their work.',
    ],
    price: PRICE_TIERS.tarotPremium,
    gradient: SHOP_GRADIENTS.cometFade, // Career/air energy
  },
  {
    id: 'creativity-flow-tarot',
    slug: 'creativity-flow-tarot-pack',
    title: 'Creativity Flow Tarot Pack',
    tagline: 'Unblock your creative channel.',
    description:
      'Creativity is your birthright. This pack contains spreads for moving through creative blocks, finding inspiration, and honouring the muse. Whether you are an artist, writer, or anyone seeking to live more creatively, these layouts help the ideas flow.',
    spreads: [
      {
        name: 'The Muse Spread',
        cardCount: 4,
        description: 'Connects you to creative inspiration.',
        positions: [
          'The Spark',
          'The Block',
          'The Medicine',
          'Creative Action',
        ],
      },
      {
        name: 'Project Compass',
        cardCount: 5,
        description: 'Guides a creative project.',
        positions: [
          'The Vision',
          'Current State',
          'Next Step',
          'Potential Challenge',
          'Ultimate Expression',
        ],
      },
      {
        name: 'Inner Artist',
        cardCount: 3,
        description: 'Reconnects with your creative self.',
        positions: [
          'Your Creative Essence',
          'What Wants Expression',
          'How to Begin',
        ],
      },
    ],
    ritual: 'An altar-setting ritual for invoking the muse.',
    journalPrompts: [
      'What creative dream have I abandoned?',
      'Where does perfectionism block my flow?',
      'What would my inner child want to create?',
    ],
    perfectFor: [
      'Artists and creatives seeking fresh inspiration.',
      'Anyone breaking through creative blocks.',
      'Those starting new creative projects.',
    ],
    price: PRICE_TIERS.tarot,
    gradient: SHOP_GRADIENTS.supernovaFade, // Creative fire energy
  },
  {
    id: 'elemental-alignment-tarot',
    slug: 'elemental-alignment-tarot-pack',
    title: 'Elemental Alignment Tarot Pack',
    tagline: 'Balance the four elements within.',
    description:
      'Fire, Water, Air, Earth—these primordial forces live within you. This pack explores the tarot through elemental wisdom, with spreads for balancing your inner elements and understanding the suits on a deeper level.',
    spreads: [
      {
        name: 'Elemental Balance',
        cardCount: 5,
        description: 'Reveals which elements need attention.',
        positions: [
          'Fire (Passion/Action)',
          'Water (Emotion/Intuition)',
          'Air (Thought/Communication)',
          'Earth (Material/Body)',
          'Spirit Centre',
        ],
      },
      {
        name: 'Suit Deep Dive',
        cardCount: 4,
        description:
          'Explores one suit in depth—use for the element you need to strengthen.',
        positions: ['Lesson', 'Shadow', 'Gift', 'Integration'],
      },
      {
        name: 'Elemental Medicine',
        cardCount: 4,
        description: 'Finds which element offers healing.',
        positions: [
          'Current Imbalance',
          'Element Medicine',
          'How to Apply It',
          'Restored Balance',
        ],
      },
    ],
    ritual: 'An elemental invocation ritual using four candles.',
    journalPrompts: [
      'Which element do I naturally embody?',
      'Which element feels foreign or challenging?',
      'How can I bring more balance to my inner world?',
    ],
    perfectFor: [
      'Those deepening their tarot practice through elemental wisdom.',
      'Readers seeking a more intimate understanding of the suits.',
      'Anyone working to balance their personality and energy.',
    ],
    price: PRICE_TIERS.tarot,
    gradient: SHOP_GRADIENTS.hazeNebulaCometBlend, // Multi-element energy
    tags: ['tarot', 'elements', 'balance', 'suits'],
    keywords: ['elemental tarot', 'tarot elements', 'suit meanings'],
  },
];

// === SUIT-FOCUSED TAROT PACKS (4) ===
const SUIT_PACK_CONFIGS: TarotPackConfig[] = [
  {
    id: 'wands-suit-tarot',
    slug: 'wands-suit-tarot-pack',
    title: 'Wands Suit Tarot Pack',
    tagline: 'Master the fire of passion and will.',
    description:
      'The Wands suit burns with creative fire, passion, and spiritual will. This comprehensive pack explores all 14 Wands cards in depth—from the spark of the Ace to the burden of the Ten—with spreads, rituals, and journal work to embody fire energy.',
    spreads: [
      {
        name: 'Creative Fire Spread',
        cardCount: 5,
        description: 'Ignites and directs your creative passion.',
        positions: [
          'The Spark',
          'The Fuel',
          'The Obstacle',
          'The Direction',
          'The Blaze',
        ],
      },
      {
        name: 'Willpower Check',
        cardCount: 4,
        description: 'Assesses your current willpower and motivation.',
        positions: [
          'Current Drive',
          'What Drains You',
          'Hidden Strength',
          'Action to Take',
        ],
      },
      {
        name: 'Passion Compass',
        cardCount: 3,
        description: 'Points toward what truly excites you.',
        positions: ['What Calls You', 'What Holds You Back', 'First Step'],
      },
    ],
    ritual: 'A candle flame meditation for connecting with Wands energy.',
    journalPrompts: [
      'What sets my soul on fire?',
      'Where am I burning out versus burning bright?',
      'How can I channel my passion more effectively?',
    ],
    perfectFor: [
      'Those seeking to understand fire energy in tarot.',
      'Anyone needing a boost of creativity and motivation.',
      'Readers ready to deep-dive into Wands meanings.',
    ],
    price: PRICE_TIERS.tarot,
    gradient: SHOP_GRADIENTS.supernovaToRose,
    tags: ['tarot', 'wands', 'fire', 'creativity'],
    keywords: ['wands tarot', 'fire suit', 'tarot wands meaning'],
    badge: 'new',
  },
  {
    id: 'cups-suit-tarot',
    slug: 'cups-suit-tarot-pack',
    title: 'Cups Suit Tarot Pack',
    tagline: 'Dive into the waters of emotion and intuition.',
    description:
      'The Cups suit flows with emotional wisdom, intuition, and matters of the heart. This pack explores all 14 Cups cards—from the overflowing love of the Ace to the emotional fulfilment of the Ten—with spreads for navigating your inner waters.',
    spreads: [
      {
        name: 'Emotional Depths',
        cardCount: 5,
        description: 'Explores your current emotional landscape.',
        positions: [
          'Surface Feeling',
          'Hidden Emotion',
          'Root Cause',
          'What Heals',
          'Emotional Truth',
        ],
      },
      {
        name: 'Heart Opening',
        cardCount: 4,
        description: 'Guides you toward greater emotional availability.',
        positions: [
          'Heart Block',
          'Its Protection',
          'Safe Opening',
          'Love Flows',
        ],
      },
      {
        name: 'Intuition Channel',
        cardCount: 3,
        description: 'Strengthens your intuitive connection.',
        positions: ['Current Intuition', 'What Blocks It', 'How to Listen'],
      },
    ],
    ritual: 'A water blessing ritual for connecting with Cups energy.',
    journalPrompts: [
      'What emotion am I avoiding right now?',
      'How do I express love—to myself and others?',
      'When was the last time I truly trusted my intuition?',
    ],
    perfectFor: [
      'Those seeking to understand water energy in tarot.',
      'Anyone engaged in emotional healing and processing.',
      'Readers developing their intuitive gifts.',
    ],
    price: PRICE_TIERS.tarot,
    gradient: SHOP_GRADIENTS.hazeToSupernova,
    tags: ['tarot', 'cups', 'water', 'emotions'],
    keywords: ['cups tarot', 'water suit', 'tarot cups meaning'],
    badge: 'new',
  },
  {
    id: 'swords-suit-tarot',
    slug: 'swords-suit-tarot-pack',
    title: 'Swords Suit Tarot Pack',
    tagline: 'Sharpen your mind and speak your truth.',
    description:
      'The Swords suit cuts through illusion with mental clarity, truth, and communication. This pack explores all 14 Swords cards—from the breakthrough of the Ace to the endings of the Ten—with spreads for clear thinking and honest expression.',
    spreads: [
      {
        name: 'Mental Clarity',
        cardCount: 5,
        description: 'Cuts through confusion to reveal truth.',
        positions: [
          'The Fog',
          'Hidden Truth',
          'Self-Deception',
          'The Clear View',
          'Action of Truth',
        ],
      },
      {
        name: 'Communication Check',
        cardCount: 4,
        description: 'Examines how you give and receive information.',
        positions: [
          'How You Speak',
          'How You Listen',
          'Communication Block',
          'Path to Clarity',
        ],
      },
      {
        name: 'Decision Blade',
        cardCount: 3,
        description: 'Helps make clear-headed decisions.',
        positions: ['The Choice', 'What Logic Says', 'The Cut'],
      },
    ],
    ritual: 'A breath meditation for connecting with Swords energy.',
    journalPrompts: [
      'What truth am I avoiding?',
      'Where is my thinking clouded by emotion?',
      'What needs to be said that I have been holding back?',
    ],
    perfectFor: [
      'Those seeking to understand air energy in tarot.',
      'Anyone needing greater mental clarity.',
      'Readers working to improve their communication.',
    ],
    price: PRICE_TIERS.tarot,
    gradient: SHOP_GRADIENTS.cometToHaze,
    tags: ['tarot', 'swords', 'air', 'intellect'],
    keywords: ['swords tarot', 'air suit', 'tarot swords meaning'],
    badge: 'new',
  },
  {
    id: 'pentacles-suit-tarot',
    slug: 'pentacles-suit-tarot-pack',
    title: 'Pentacles Suit Tarot Pack',
    tagline: 'Ground into abundance and material wisdom.',
    description:
      'The Pentacles suit grounds you in material reality, abundance, and bodily wisdom. This pack explores all 14 Pentacles cards—from the seed of the Ace to the legacy of the Ten—with spreads for prosperity, health, and practical magic.',
    spreads: [
      {
        name: 'Abundance Inventory',
        cardCount: 5,
        description: 'Assesses your relationship with material abundance.',
        positions: [
          'Current Abundance',
          'Hidden Wealth',
          'Money Block',
          'Path to Prosperity',
          'True Wealth',
        ],
      },
      {
        name: 'Body Wisdom',
        cardCount: 4,
        description: 'Listens to your physical form.',
        positions: [
          'Body Message',
          'What It Needs',
          'What to Release',
          'Embodied Action',
        ],
      },
      {
        name: 'Work and Worth',
        cardCount: 3,
        description: 'Examines your relationship with work.',
        positions: ['Your Labour', 'Your Value', 'Fair Exchange'],
      },
    ],
    ritual: 'A grounding earth ritual for connecting with Pentacles energy.',
    journalPrompts: [
      'What is my relationship with money and material things?',
      'How do I care for my physical body?',
      'Where do I conflate self-worth with net worth?',
    ],
    perfectFor: [
      'Those seeking to understand earth energy in tarot.',
      'Anyone working on manifesting abundance.',
      'Readers seeking practical life guidance.',
    ],
    price: PRICE_TIERS.tarot,
    gradient: SHOP_GRADIENTS.hazeFade,
    tags: ['tarot', 'pentacles', 'earth', 'abundance'],
    keywords: ['pentacles tarot', 'earth suit', 'tarot pentacles meaning'],
    badge: 'new',
  },
];

// === MAJOR ARCANA PACK (1) ===
const MAJOR_ARCANA_CONFIG: TarotPackConfig[] = [
  {
    id: 'major-arcana-journey',
    slug: 'major-arcana-journey-pack',
    title: 'Major Arcana Journey Pack',
    tagline: "Walk the Fool's path from innocence to wholeness.",
    description:
      "The Major Arcana tells the story of the soul's journey—from the innocent Fool through trials and transformations to the enlightened World. This comprehensive pack explores all 22 Major Arcana cards as a spiritual path, with spreads for understanding where you are in your own journey.",
    spreads: [
      {
        name: 'Where Am I on the Journey?',
        cardCount: 5,
        description: "Locates your current position on the Fool's journey.",
        positions: [
          'Recent Lesson',
          'Current Position',
          'Approaching Challenge',
          'Hidden Guide',
          'Next Milestone',
        ],
      },
      {
        name: 'Archetype Activation',
        cardCount: 4,
        description: 'Identifies which Major Arcana energy you need now.',
        positions: [
          'Current Archetype',
          'Needed Archetype',
          'How to Embody It',
          'Gift It Brings',
        ],
      },
      {
        name: 'Soul Purpose Spread',
        cardCount: 7,
        description: 'Reveals your larger life path through the Majors.',
        positions: [
          'Origin',
          'Challenge',
          'Ally',
          'Shadow',
          'Gift',
          'Purpose',
          'Destiny',
        ],
      },
      {
        name: 'Major Life Decision',
        cardCount: 3,
        description: 'Uses Major Arcana wisdom for big choices.',
        positions: ['The Choice', 'Cosmic Guidance', "Soul's Path"],
      },
    ],
    ritual: 'A journey meditation moving through all 22 Major Arcana.',
    journalPrompts: [
      'Which Major Arcana card represents my current life chapter?',
      'What archetype am I being called to embody?',
      'How is my soul evolving through current challenges?',
    ],
    perfectFor: [
      'Those ready for deep Major Arcana study.',
      "Anyone seeking to understand life's bigger patterns.",
      'Readers drawn to soul-level guidance and purpose.',
    ],
    price: PRICE_TIERS.tarotPremium,
    gradient: SHOP_GRADIENTS.fullSpectrum,
    tags: ['tarot', 'major arcana', 'soul journey', 'archetypes'],
    keywords: ['major arcana meanings', "fool's journey", 'tarot archetypes'],
    badge: 'trending',
  },
];

// Combine all configs
const ALL_TAROT_PACK_CONFIGS: TarotPackConfig[] = [
  ...TAROT_PACK_CONFIGS,
  ...SUIT_PACK_CONFIGS,
  ...MAJOR_ARCANA_CONFIG,
];

function generateWhatInside(config: TarotPackConfig): string[] {
  const spreadCount = config.spreads.length;
  const totalPositions = config.spreads.reduce(
    (sum, s) => sum + s.cardCount,
    0,
  );

  return [
    `${spreadCount} custom tarot spreads (${totalPositions} total positions)`,
    'Detailed interpretation guides for each position',
    'Shadow and light meanings for every spread',
    `${config.journalPrompts.length} journal prompts for integration`,
    '1 themed ritual for reading preparation',
    'Tips for reading for yourself and others',
  ];
}

export function generateTarotPacks(): ShopProduct[] {
  return ALL_TAROT_PACK_CONFIGS.map((config) => ({
    id: config.id,
    slug: config.slug,
    title: config.title,
    tagline: config.tagline,
    description: config.description,
    category: 'tarot' as const,
    whatInside: generateWhatInside(config),
    perfectFor: config.perfectFor,
    related: ALL_TAROT_PACK_CONFIGS.filter((c) => c.id !== config.id)
      .slice(0, 3)
      .map((c) => c.slug),
    price: config.price,
    gradient: config.gradient,
    tags: config.tags,
    keywords: config.keywords,
    badge: config.badge,
  }));
}

export function getTarotPackBySlug(slug: string): ShopProduct | undefined {
  return generateTarotPacks().find((pack) => pack.slug === slug);
}
