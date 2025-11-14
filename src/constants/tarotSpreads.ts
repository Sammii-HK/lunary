export type TarotPlan = 'free' | 'monthly' | 'yearly';

export interface TarotSpreadPosition {
  id: string;
  label: string;
  prompt: string;
  axis?: 'timeline' | 'internal' | 'external' | 'challenge' | 'outcome';
}

export interface TarotSpreadDefinition {
  slug: string;
  name: string;
  description: string;
  intention: string;
  category:
    | 'Quick Insight'
    | 'Deep Dive'
    | 'Growth & Career'
    | 'Relationships'
    | 'Lunar Ritual';
  cardCount: number;
  estimatedTime: string;
  bestFor: string[];
  minimumPlan: TarotPlan;
  recommendedCadence?: string;
  journalPrompts: string[];
  tags: string[];
  positions: TarotSpreadPosition[];
}

export const PLAN_RANK: Record<TarotPlan, number> = {
  free: 0,
  monthly: 1,
  yearly: 2,
};

export const TAROT_SPREADS: TarotSpreadDefinition[] = [
  {
    slug: 'past-present-future',
    name: 'Past • Present • Future',
    description:
      'A classic three-card pull to ground yourself, understand current energy, and glimpse the path ahead.',
    intention: 'Daily clarity and quick alignment check-ins.',
    category: 'Quick Insight',
    cardCount: 3,
    estimatedTime: '5 minutes',
    bestFor: ['Daily reflection', 'Quick clarity', 'Tracking progress'],
    minimumPlan: 'free',
    recommendedCadence: 'Use anytime you need a fast vibe check.',
    journalPrompts: [
      'What recent lesson from the past card is still influencing me?',
      'How does the present card mirror my current mindset?',
      'What small action can I take to welcome the future energy?',
    ],
    tags: ['daily', 'reflection', 'overview'],
    positions: [
      {
        id: 'past',
        label: 'Past',
        prompt: 'Energy, lessons, or context recently influencing you.',
        axis: 'timeline',
      },
      {
        id: 'present',
        label: 'Present',
        prompt: 'What is unfolding in this moment or needs attention now.',
        axis: 'timeline',
      },
      {
        id: 'future',
        label: 'Future',
        prompt: 'Likely outcome or momentum if nothing shifts.',
        axis: 'timeline',
      },
    ],
  },
  {
    slug: 'self-care-compass',
    name: 'Self-Care Compass',
    description:
      'A nurturing four-card spread highlighting where to rest, nourish, focus, and grow.',
    intention: 'Reset your nervous system and craft an aligned self-care plan.',
    category: 'Quick Insight',
    cardCount: 4,
    estimatedTime: '7 minutes',
    bestFor: ['Burnout prevention', 'Weekly reset', 'Emotional check-ins'],
    minimumPlan: 'free',
    recommendedCadence: 'Pull weekly or whenever you feel drained.',
    journalPrompts: [
      'Where can I create space for softness this week?',
      'What needs to be released to feel nourished?',
      'Which boundary or ritual will reinforce my wellbeing?',
    ],
    tags: ['self-care', 'wellbeing', 'rest'],
    positions: [
      {
        id: 'body',
        label: 'Body',
        prompt: 'How can you support your physical vessel?',
        axis: 'internal',
      },
      {
        id: 'mind',
        label: 'Mind',
        prompt: 'Mental patterns or stories to soothe or reframe.',
        axis: 'internal',
      },
      {
        id: 'heart',
        label: 'Heart',
        prompt: 'Emotional nourishment and connection.',
        axis: 'internal',
      },
      {
        id: 'spirit',
        label: 'Spirit',
        prompt: 'Spiritual practices or rituals to anchor you.',
        axis: 'internal',
      },
    ],
  },
  {
    slug: 'decision-crossroads',
    name: 'Decision Crossroads',
    description:
      'Clarify options, unseen influences, and the aligned next move when you’re weighing a choice.',
    intention: 'Move from overthinking into confident action.',
    category: 'Quick Insight',
    cardCount: 4,
    estimatedTime: '8 minutes',
    bestFor: ['Evaluating choices', 'Negotiations', 'Creative direction'],
    minimumPlan: 'free',
    journalPrompts: [
      'What does my intuition whisper about this decision?',
      'What becomes possible if I release the fear highlighted here?',
      'How does the aligned next step card feel in my body?',
    ],
    tags: ['decision', 'strategy', 'clarity'],
    positions: [
      {
        id: 'option-a',
        label: 'Path A',
        prompt: 'The energy, opportunity, or cost of the first option.',
        axis: 'external',
      },
      {
        id: 'option-b',
        label: 'Path B',
        prompt: 'The energy, opportunity, or cost of the second option.',
        axis: 'external',
      },
      {
        id: 'hidden',
        label: 'Hidden Factor',
        prompt: 'What you are not seeing or an unseen influence.',
        axis: 'challenge',
      },
      {
        id: 'aligned-step',
        label: 'Aligned Next Step',
        prompt: 'Action that keeps you in integrity with your truth.',
        axis: 'outcome',
      },
    ],
  },
  {
    slug: 'monthly-overview',
    name: 'Monthly Overview',
    description:
      'Track the pulse of the coming month across mindset, opportunities, obstacles, and breakthroughs.',
    intention: 'Strategise the month with cosmic support.',
    category: 'Growth & Career',
    cardCount: 5,
    estimatedTime: '12 minutes',
    bestFor: ['Planning', 'Energetic forecasting', 'Goal setting'],
    minimumPlan: 'monthly',
    recommendedCadence: 'Pull at the start of each month.',
    journalPrompts: [
      'Which opportunity card excites me most and why?',
      'What support system helps me navigate the obstacle energy?',
      'How can I celebrate the breakthrough card even before it arrives?',
    ],
    tags: ['planning', 'forecast', 'productivity'],
    positions: [
      {
        id: 'theme',
        label: 'Theme',
        prompt: 'The core vibration colouring this month.',
        axis: 'timeline',
      },
      {
        id: 'opportunity',
        label: 'Opportunity',
        prompt: 'Where momentum and expansion are available.',
        axis: 'external',
      },
      {
        id: 'challenge',
        label: 'Challenge',
        prompt: 'Potential friction, roadblocks, or energy leaks.',
        axis: 'challenge',
      },
      {
        id: 'support',
        label: 'Support',
        prompt: 'Resources, allies, or practices to lean on.',
        axis: 'internal',
      },
      {
        id: 'breakthrough',
        label: 'Breakthrough',
        prompt: 'What unlocks when you stay the course.',
        axis: 'outcome',
      },
    ],
  },
  {
    slug: 'career-pathfinder',
    name: 'Career Pathfinder',
    description:
      'Reveal growth edges, visibility steps, and the energetic signature of your vocation right now.',
    intention: 'Align work and purpose with confidence.',
    category: 'Growth & Career',
    cardCount: 5,
    estimatedTime: '15 minutes',
    bestFor: ['Career pivots', 'Business owners', 'Performance reviews'],
    minimumPlan: 'monthly',
    journalPrompts: [
      'What strengths want louder expression in my work?',
      'Where can I claim greater authority or ownership?',
      'Which experiment will move me toward the outcome card?',
    ],
    tags: ['career', 'purpose', 'abundance'],
    positions: [
      {
        id: 'current-role',
        label: 'Current Energy',
        prompt: 'How your professional identity feels right now.',
        axis: 'internal',
      },
      {
        id: 'growth-edge',
        label: 'Growth Edge',
        prompt: 'Skill or mindset that wants expansion.',
        axis: 'challenge',
      },
      {
        id: 'visibility',
        label: 'Visibility',
        prompt: 'How to be seen, pitch, or market yourself.',
        axis: 'external',
      },
      {
        id: 'supporter',
        label: 'Supporter',
        prompt: 'Who or what champions your next move.',
        axis: 'external',
      },
      {
        id: 'trajectory',
        label: 'Trajectory',
        prompt: 'Likely direction if you lean into the guidance.',
        axis: 'outcome',
      },
    ],
  },
  {
    slug: 'relationship-radar',
    name: 'Relationship Radar',
    description:
      'Map the emotional climate, what you offer, what you receive, and steps toward deeper harmony.',
    intention: 'Bring compassion and clarity into partnership.',
    category: 'Relationships',
    cardCount: 6,
    estimatedTime: '18 minutes',
    bestFor: [
      'Romantic partnerships',
      'Creative collaborations',
      'Family dynamics',
    ],
    minimumPlan: 'monthly',
    journalPrompts: [
      'What need or desire is ready to be voiced?',
      'How can I hold space for the other person’s perspective?',
      'Which shared ritual or boundary will nurture the connection?',
    ],
    tags: ['relationships', 'communication', 'healing'],
    positions: [
      {
        id: 'you',
        label: 'You',
        prompt: 'Your current energy in the relational field.',
        axis: 'internal',
      },
      {
        id: 'them',
        label: 'Them',
        prompt: 'The other person’s energy or perspective.',
        axis: 'external',
      },
      {
        id: 'dynamic',
        label: 'Dynamic',
        prompt: 'The intersection or pattern between you.',
        axis: 'challenge',
      },
      {
        id: 'strength',
        label: 'Shared Strength',
        prompt: 'What works beautifully and wants amplification.',
        axis: 'internal',
      },
      {
        id: 'lesson',
        label: 'Lesson',
        prompt: 'The growth edge inviting compassion and courage.',
        axis: 'challenge',
      },
      {
        id: 'path-forward',
        label: 'Path Forward',
        prompt: 'Action that deepens trust and alignment.',
        axis: 'outcome',
      },
    ],
  },
  {
    slug: 'celtic-cross',
    name: 'Celtic Cross',
    description:
      'A legendary ten-card deep dive unpacking root causes, subconscious influences, and the trajectory ahead.',
    intention: 'Comprehensive insight when life is shifting rapidly.',
    category: 'Deep Dive',
    cardCount: 10,
    estimatedTime: '25 minutes',
    bestFor: ['Major transitions', 'Shadow work', 'Annual resets'],
    minimumPlan: 'monthly',
    recommendedCadence:
      'Use when you need the full story once or twice per season.',
    journalPrompts: [
      'What pattern is surfacing from the subconscious card?',
      'Which card offers the medicine I’m most resistant to?',
      'How can I partner with the outcome card starting today?',
    ],
    tags: ['deep-dive', 'shadow', 'strategy'],
    positions: [
      {
        id: 'significator',
        label: 'Significator',
        prompt: 'The core theme surrounding you now.',
      },
      {
        id: 'challenge',
        label: 'Crossing Energy',
        prompt: 'Primary obstacle or catalyst.',
      },
      {
        id: 'foundation',
        label: 'Foundation',
        prompt: 'Root cause or subconscious influence.',
      },
      {
        id: 'recent-past',
        label: 'Recent Past',
        prompt: 'What is dissolving or completing.',
      },
      {
        id: 'higher-self',
        label: 'Higher Guidance',
        prompt: 'Spiritual guidance or highest potential.',
      },
      {
        id: 'near-future',
        label: 'Near Future',
        prompt: 'Energy arriving shortly.',
      },
      {
        id: 'self',
        label: 'You',
        prompt: 'How you see yourself in this story.',
      },
      {
        id: 'environment',
        label: 'Environment',
        prompt: 'External influences, allies, or pressure.',
      },
      {
        id: 'hopes-fears',
        label: 'Hopes & Fears',
        prompt: 'What you long for and what you resist.',
      },
      {
        id: 'outcome',
        label: 'Outcome',
        prompt: 'Likely trajectory if energy stays consistent.',
      },
    ],
  },
  {
    slug: 'year-ahead-wheel',
    name: 'Year Ahead Wheel',
    description:
      'Twelve cards to illuminate each month plus an anchor for your core theme, ally, and growth edge.',
    intention: 'Design your year with intention and pattern awareness.',
    category: 'Deep Dive',
    cardCount: 15,
    estimatedTime: '35 minutes',
    bestFor: ['Birthday portals', 'New Year rituals', 'Business planning'],
    minimumPlan: 'monthly',
    recommendedCadence:
      'Use once per year, ideally at a pivotal turning point.',
    journalPrompts: [
      'Which months feel especially potent and why?',
      'How can I work with the yearly ally to anchor my desires?',
      'What support structure do I need for the growth edge card?',
    ],
    tags: ['annual', 'ritual', 'planning'],
    positions: [
      {
        id: 'theme',
        label: 'Annual Theme',
        prompt: 'The overarching energy guiding your year.',
      },
      {
        id: 'ally',
        label: 'Spiritual Ally',
        prompt: 'Archetypal support to call on again and again.',
      },
      {
        id: 'growth-edge',
        label: 'Growth Edge',
        prompt: 'Primary lesson or stretch this year brings.',
      },
      ...Array.from({ length: 12 }).map((_, index) => ({
        id: `month-${index + 1}`,
        label: `Month ${index + 1}`,
        prompt: `Key focus for month ${index + 1}.`,
        axis: 'timeline' as const,
      })),
    ],
  },
  {
    slug: 'new-moon-intentions',
    name: 'New Moon Intentions',
    description:
      'Harness the fresh lunar cycle with clarity on seeds to plant, support available, and aligned next steps.',
    intention: 'Set soulful goals with lunar backing.',
    category: 'Lunar Ritual',
    cardCount: 5,
    estimatedTime: '12 minutes',
    bestFor: ['Monthly rituals', 'Manifestation work', 'Creative launches'],
    minimumPlan: 'monthly',
    recommendedCadence: 'Use on or near every new moon.',
    journalPrompts: [
      'What intention feels most alive right now?',
      'How does the lunar support card want to be embodied?',
      'What concrete commitment can I make before the waxing moon?',
    ],
    tags: ['lunar', 'manifestation', 'ritual'],
    positions: [
      { id: 'seed', label: 'Seed', prompt: 'What desire wants to be planted?' },
      {
        id: 'soil',
        label: 'Soil',
        prompt: 'The environment or mindset that nurtures it.',
      },
      {
        id: 'sun',
        label: 'Light',
        prompt: 'Support, allies, or resources available.',
      },
      {
        id: 'shadow',
        label: 'Shadow',
        prompt: 'What to release, clear, or reframe.',
      },
      {
        id: 'action',
        label: 'Action',
        prompt: 'First physical step to anchor the intention.',
      },
    ],
  },
  {
    slug: 'full-moon-release',
    name: 'Full Moon Release',
    description:
      'A reflective ritual to celebrate progress, identify what is complete, and alchemise lessons.',
    intention: 'Close loops and create space for the next chapter.',
    category: 'Lunar Ritual',
    cardCount: 5,
    estimatedTime: '12 minutes',
    bestFor: ['Monthly reflection', 'Shadow work', 'Completion rituals'],
    minimumPlan: 'monthly',
    recommendedCadence: 'Use on or near each full moon.',
    journalPrompts: [
      'What am I proud of from this lunar cycle?',
      'What emotion or pattern am I ready to release?',
      'How can I integrate the moonlight card over the next two weeks?',
    ],
    tags: ['lunar', 'release', 'reflection'],
    positions: [
      {
        id: 'illumination',
        label: 'Illumination',
        prompt: 'What is fully visible now?',
      },
      {
        id: 'gratitude',
        label: 'Gratitude',
        prompt: 'What deserves celebration or thanks?',
      },
      {
        id: 'release',
        label: 'Release',
        prompt: 'What is ready to be surrendered?',
      },
      {
        id: 'lesson',
        label: 'Lesson',
        prompt: 'Wisdom gained through the cycle.',
      },
      {
        id: 'integration',
        label: 'Integration',
        prompt: 'How to embody the insight moving forward.',
      },
    ],
  },
];

export const TAROT_SPREAD_MAP = Object.fromEntries(
  TAROT_SPREADS.map((spread) => [spread.slug, spread]),
);

export const FREE_PLAN_MONTHLY_READING_LIMIT = 2;
export const MONTHLY_PLAN_MONTHLY_READING_LIMIT = 10;
export const FREE_PLAN_HISTORY_RETENTION_DAYS = 7;
export const SUBSCRIBER_HISTORY_RETENTION_DAYS = 365;
