/**
 * Tarot Pack Content Generator
 *
 * Generates rich PDF content for tarot packs from the shop configurations.
 */

import { PdfTarotCard, PdfTarotPack, PdfTarotSpread } from '../schema';

interface TarotPackConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  spreads: Array<{
    name: string;
    cardCount: number;
    description: string;
    positions: string[];
  }>;
  cards: PdfTarotCard[];
  journalPrompts: string[];
  perfectFor: string[];
}

const POSITION_MEANINGS: Record<string, string> = {
  'The Mask':
    'The version of yourself you present to the world—your persona and public face.',
  'The Shadow':
    'The hidden or rejected aspect of yourself that seeks acknowledgement and integration.',
  'The Root':
    'The origin point—where this pattern or energy first took hold in your life.',
  'The Gift':
    'The hidden blessing, strength, or wisdom contained within this situation.',
  Integration: 'How you might bring these energies together into wholeness.',
  'The Call': 'What is calling you forward at this time.',
  'The Threshold': 'The boundary you must cross to move forward.',
  'The Descent': 'What you must face in the depths.',
  'The Ordeal': 'The challenge that will transform you.',
  'The Treasure': 'What you will gain from this journey.',
  'The Return': 'How you will emerge changed.',
  'The Pattern': 'A repeating theme or cycle in your life.',
  'The Teaching': 'The lesson this pattern is trying to impart.',
  'The Medicine': 'The healing or remedy available to you.',
  'Your Energy': 'Your current energetic state in this situation.',
  'Their Energy': 'The energy of the other person or situation.',
  'The Bond': 'What connects you to this person or situation.',
  'The Challenge': 'The obstacle or difficulty you must navigate.',
  'The Path Forward': 'The direction that leads to growth.',
  'Current Position': 'Where you stand right now.',
  'Hidden Skills': 'Talents or abilities you may not recognise.',
  'Soul Calling': 'What your deeper self is guiding you toward.',
  Obstacle: 'What stands in your way.',
  'Next Step': 'The action to take now.',
  'The Spark': 'The initial inspiration or impulse.',
  'The Fuel': 'What sustains and powers this energy.',
  'The Block': 'What is preventing flow or movement.',
  'Creative Action': 'How to channel this energy productively.',
  'The Vision': 'The larger picture or end goal.',
  'Current State': 'Your present situation.',
  'Potential Challenge': 'A difficulty that may arise.',
  'Ultimate Expression': 'The highest form this could take.',
};

function generatePositionMeaning(positionName: string): string {
  return (
    POSITION_MEANINGS[positionName] ||
    `Consider what ${positionName.toLowerCase()} reveals about your situation.`
  );
}

const THEME_INTROS: Record<string, string> = {
  shadow:
    'Shadow work is sacred inner work. Approach these spreads with patience and self-compassion. There is no need to uncover everything at once. Take breaks when you need them, and remember: meeting your shadow is an act of courage and self-love.',
  relationship:
    'Relationships mirror our inner world. These spreads help you see your patterns more clearly, understand the dynamics at play, and cultivate healthier connections—starting with the one you have with yourself.',
  career:
    'Your work is part of your purpose. These spreads help you align your career with your soul, navigate professional crossroads, and manifest abundance through meaningful contribution.',
  creativity:
    'Creativity is your birthright. These spreads help you reconnect with your creative source, move through blocks, and bring your unique gifts into expression.',
  element:
    'The four elements live within you. These spreads help you understand your elemental balance, strengthen what is weak, and integrate all parts of your nature.',
  major:
    "The Major Arcana charts the soul's journey from innocence to wisdom. These spreads help you locate yourself on this sacred path and understand the archetypal forces at work in your life.",
  suit: 'Each suit of the tarot carries its own wisdom. These spreads help you develop a deeper relationship with this elemental energy and apply its lessons to your life.',
};

const THEME_CLOSINGS: Record<string, string> = {
  shadow:
    'Thank you for doing this meaningful inner work with Lunary. Shadow work is not about fixing what is broken—it is about welcoming home what has been hidden. Every part of you belongs.',
  relationship:
    'Thank you for exploring your relationships with Lunary. May these spreads bring clarity, healing, and deeper connection to all your bonds—especially the one with yourself.',
  career:
    'Thank you for seeking vocational clarity with Lunary. May your work become an expression of your purpose and a source of both abundance and fulfilment.',
  creativity:
    'Thank you for nurturing your creativity with Lunary. The world needs what only you can create. Trust your muse and keep showing up.',
  element:
    'Thank you for exploring the elements with Lunary. May you find balance within yourself, honouring fire and water, earth and air, as they dance together in your being.',
  major:
    'Thank you for walking this sacred path with Lunary. The Major Arcana reminds us that every challenge is an initiation and every ending leads to new beginnings.',
  suit: 'Thank you for deepening your relationship with this suit. May its wisdom guide you in your daily life and readings.',
};

function getThemeFromSlug(slug: string): string {
  if (slug.includes('shadow')) return 'shadow';
  if (
    slug.includes('relationship') ||
    slug.includes('love') ||
    slug.includes('heart')
  )
    return 'relationship';
  if (slug.includes('career') || slug.includes('abundance')) return 'career';
  if (slug.includes('creativ')) return 'creativity';
  if (slug.includes('element')) return 'element';
  if (slug.includes('major') || slug.includes('arcana')) return 'major';
  if (
    slug.includes('wand') ||
    slug.includes('cup') ||
    slug.includes('sword') ||
    slug.includes('pentacle')
  )
    return 'suit';
  return 'shadow';
}

const DEFAULT_SPREADS: PdfTarotSpread[] = [
  {
    name: 'The Three Card Spread',
    description: 'A versatile spread for any question.',
    cardCount: 3,
    positions: [
      {
        position: 1,
        name: 'Past',
        meaning: 'Past influences or the root of the situation.',
      },
      {
        position: 2,
        name: 'Present',
        meaning: 'Present energies or the current challenge.',
      },
      {
        position: 3,
        name: 'Future',
        meaning: 'Future potential or the path forward.',
      },
    ],
    bestFor: ['Quick insights', 'Daily guidance', 'Simple questions'],
    journalPrompts: [
      'What story do these three cards tell together?',
      'How does the past influence my present situation?',
      'What action does the future card suggest?',
    ],
  },
  {
    name: 'The Celtic Cross',
    description: 'A comprehensive spread for deep exploration.',
    cardCount: 10,
    positions: [
      { position: 1, name: 'The Heart', meaning: 'The heart of the matter.' },
      {
        position: 2,
        name: 'The Challenge',
        meaning: 'The challenge or crossing.',
      },
      {
        position: 3,
        name: 'The Foundation',
        meaning: 'The foundation or unconscious.',
      },
      { position: 4, name: 'The Recent Past', meaning: 'The recent past.' },
      {
        position: 5,
        name: 'The Possible Outcome',
        meaning: 'The possible outcome.',
      },
      { position: 6, name: 'The Near Future', meaning: 'The near future.' },
      {
        position: 7,
        name: 'Your Attitude',
        meaning: 'Your attitude or approach.',
      },
      {
        position: 8,
        name: 'External Influences',
        meaning: 'External influences.',
      },
      { position: 9, name: 'Hopes and Fears', meaning: 'Hopes and fears.' },
      {
        position: 10,
        name: 'The Final Outcome',
        meaning: 'The final outcome.',
      },
    ],
    bestFor: [
      'Complex situations',
      'Major life questions',
      'Deep self-reflection',
    ],
    journalPrompts: [
      'What is the core message of this reading?',
      'Which card surprised me most and why?',
      'What action steps emerge from this spread?',
    ],
  },
];

export function generateTarotPackContent(
  config: TarotPackConfig,
): PdfTarotPack {
  const theme = getThemeFromSlug(config.slug);

  const spreads: PdfTarotSpread[] =
    config.spreads.length > 0
      ? config.spreads.map((spread) => ({
          name: spread.name,
          description: spread.description,
          cardCount: spread.cardCount,
          positions: spread.positions.map((pos, idx) => ({
            position: idx + 1,
            name: pos,
            meaning: generatePositionMeaning(pos),
          })),
          bestFor: [
            'Deep self-reflection',
            'Understanding patterns',
            'Gaining clarity',
          ],
          journalPrompts: [
            'What message stands out most from this spread?',
            'How does this reading connect to my current life situation?',
            'What action am I being called to take?',
          ],
        }))
      : DEFAULT_SPREADS;

  return {
    type: 'tarot',
    slug: config.slug,
    title: config.title,
    subtitle: config.tagline,
    moodText: config.description,
    perfectFor: config.perfectFor.map((item) =>
      item.endsWith('.') ? item : `${item}.`,
    ),
    introText: THEME_INTROS[theme] || THEME_INTROS.shadow,
    spreads,
    cards: config.cards || [],
    journalPrompts:
      config.journalPrompts.length > 0
        ? config.journalPrompts
        : [
            'What insight from this reading will I carry forward?',
            'Where in my life is this message most relevant?',
            'How can I honour this guidance in my daily actions?',
          ],
    closingText: THEME_CLOSINGS[theme] || THEME_CLOSINGS.shadow,
    optionalAffirmation:
      'I trust the wisdom of the cards. I receive their guidance with an open heart and apply their teachings with courage.',
  };
}
