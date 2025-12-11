export interface LifeTheme {
  id: string;
  name: string;
  shortSummary: string;
  longSummary: string;
  guidanceBullets: string[];
  relatedTags: string[];
  triggers: {
    tarotSuits: string[];
    tarotMajors: string[];
    journalKeywords: string[];
    moodTags: string[];
    transits: string[];
  };
}

export const LIFE_THEMES: LifeTheme[] = [
  {
    id: 'healing',
    name: 'Healing & Restoration',
    shortSummary:
      'A period of emotional mending and rebuilding inner strength.',
    longSummary:
      'You are moving through a profound healing cycle. This is a time when old wounds rise to the surface not to harm you, but to finally be released. The patterns in your readings and reflections suggest your psyche is ready to integrate past experiences and emerge with renewed wholeness. Trust this process—healing is rarely linear, but you are making meaningful progress.',
    guidanceBullets: [
      'Honor your need for rest and gentle self-care',
      'Notice what emotions arise without trying to fix them',
      'Consider what boundaries need strengthening',
      'Celebrate small moments of peace as signs of progress',
      'Release the timeline—healing unfolds at its own pace',
    ],
    relatedTags: ['healing', 'recovery', 'self-care', 'restoration', 'peace'],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: ['The Star', 'Temperance', 'The Empress'],
      journalKeywords: [
        'healing',
        'recovery',
        'letting go',
        'peace',
        'rest',
        'self-care',
        'gentle',
        'mending',
      ],
      moodTags: ['peaceful', 'hopeful', 'tender', 'vulnerable'],
      transits: ['Moon trine Venus', 'Venus in Cancer', 'Neptune aspects'],
    },
  },
  {
    id: 'transformation',
    name: 'Deep Transformation',
    shortSummary:
      'Fundamental shifts are reshaping how you see yourself and your path.',
    longSummary:
      'You are in the midst of a powerful metamorphosis. Like the phoenix, parts of your old identity are burning away to make space for who you are becoming. This process can feel intense—even destabilizing at times—but the patterns in your cosmic data reveal this is purposeful change. The towers that crumble were never meant to stand forever. What emerges from this transformation will be more authentically you.',
    guidanceBullets: [
      'Embrace uncertainty as a sign of genuine growth',
      'Let go of who you thought you should be',
      'Journal about what you are ready to release',
      'Notice what excites you about the unknown',
      'Trust that you can rebuild from any foundation',
    ],
    relatedTags: ['transformation', 'change', 'growth', 'rebirth', 'evolution'],
    triggers: {
      tarotSuits: ['Swords'],
      tarotMajors: [
        'Death',
        'The Tower',
        'Judgement',
        'The Hanged Man',
        'The World',
      ],
      journalKeywords: [
        'change',
        'transformation',
        'different',
        'evolving',
        'shifting',
        'becoming',
        'new',
        'letting go',
      ],
      moodTags: ['intense', 'uncertain', 'powerful', 'raw'],
      transits: [
        'Pluto aspects',
        'Saturn return',
        'Uranus square',
        'Eclipse season',
      ],
    },
  },
  {
    id: 'seeking',
    name: 'Quest for Meaning',
    shortSummary:
      'An inner explorer emerges, drawn toward deeper understanding.',
    longSummary:
      'A restless curiosity is guiding you toward bigger questions about life, purpose, and what truly matters. Your recent patterns reveal a soul in search mode—not lost, but actively questing. This is a fertile time for learning, whether through books, travel, conversations, or inner exploration. The answers you seek may not come all at once, but each step on the path reveals something valuable.',
    guidanceBullets: [
      'Follow what genuinely fascinates you',
      'Explore without needing immediate answers',
      'Seek teachers, mentors, or wisdom traditions that resonate',
      'Ask bigger questions in your journaling',
      'Trust that seeking itself is meaningful',
    ],
    relatedTags: ['seeking', 'purpose', 'meaning', 'exploration', 'learning'],
    triggers: {
      tarotSuits: ['Wands'],
      tarotMajors: ['The Hermit', 'The Fool', 'The High Priestess', 'The Moon'],
      journalKeywords: [
        'wondering',
        'seeking',
        'purpose',
        'meaning',
        'why',
        'learning',
        'curious',
        'exploring',
      ],
      moodTags: ['curious', 'seeking', 'open', 'questioning'],
      transits: [
        'Jupiter aspects',
        'Mercury in Sagittarius',
        'Sun in 9th house',
      ],
    },
  },
  {
    id: 'creation',
    name: 'Creative Emergence',
    shortSummary:
      'Creative energy is rising, ready to be channeled into expression.',
    longSummary:
      'Something wants to be born through you. The patterns in your readings point to a surge of creative potential seeking an outlet. This goes beyond art in the traditional sense—it is the fundamental human drive to make, build, and bring new things into being. Whether through projects, relationships, ideas, or literal creations, you are in a generative phase. The key is to start before you feel ready.',
    guidanceBullets: [
      'Make space for unstructured creative time',
      'Start messy—perfection comes later',
      'Notice what you create when no one is watching',
      'Honor creative impulses even when they seem impractical',
      'Share your work before it feels finished',
    ],
    relatedTags: ['creativity', 'expression', 'art', 'making', 'inspiration'],
    triggers: {
      tarotSuits: ['Wands'],
      tarotMajors: ['The Empress', 'The Magician', 'The Sun', 'The Star'],
      journalKeywords: [
        'create',
        'making',
        'idea',
        'inspiration',
        'project',
        'building',
        'art',
        'express',
      ],
      moodTags: ['inspired', 'creative', 'energized', 'playful'],
      transits: ['Venus in Leo', 'Sun trine Neptune', 'Mercury in Gemini'],
    },
  },
  {
    id: 'grounding',
    name: 'Building Foundations',
    shortSummary: 'A call to establish stability and strengthen your roots.',
    longSummary:
      'Your patterns reveal a need to come back to earth and build something solid. This is a time for practical matters—finances, health, home, routines. It may feel less exciting than other phases, but the foundations you lay now will support everything that comes next. The earth element is strong in your current cycle, asking you to slow down and attend to what sustains you.',
    guidanceBullets: [
      'Address practical matters you have been avoiding',
      'Create or refine daily routines that support you',
      'Invest in your physical space and body',
      'Make decisions with your future self in mind',
      'Find satisfaction in steady, unglamorous progress',
    ],
    relatedTags: ['stability', 'grounding', 'practical', 'foundations', 'home'],
    triggers: {
      tarotSuits: ['Pentacles'],
      tarotMajors: ['The Emperor', 'The Hierophant', 'The World'],
      journalKeywords: [
        'stable',
        'routine',
        'home',
        'work',
        'money',
        'health',
        'practical',
        'building',
      ],
      moodTags: ['grounded', 'stable', 'focused', 'determined'],
      transits: [
        'Saturn aspects',
        'Taurus transits',
        'Capricorn emphasis',
        'Moon in earth signs',
      ],
    },
  },
  {
    id: 'connection',
    name: 'Deepening Connection',
    shortSummary: 'Relationships and emotional bonds are taking center stage.',
    longSummary:
      'Love, in all its forms, is the current teacher. Your patterns point toward a phase where relationships—romantic, platonic, familial, or community—demand attention and offer profound growth. This may mean healing old relational wounds, forming new bonds, or learning to love more openly. The heart is both vulnerable and powerful now. Lean into connection, even when it feels risky.',
    guidanceBullets: [
      'Initiate meaningful conversations',
      'Practice vulnerability with safe people',
      'Examine patterns you bring to relationships',
      'Express appreciation more often',
      'Consider what you truly need from others',
    ],
    relatedTags: [
      'relationships',
      'love',
      'connection',
      'community',
      'intimacy',
    ],
    triggers: {
      tarotSuits: ['Cups'],
      tarotMajors: ['The Lovers', 'The Empress', 'Two of Cups', 'The Sun'],
      journalKeywords: [
        'relationship',
        'love',
        'friend',
        'partner',
        'family',
        'connection',
        'together',
        'heart',
      ],
      moodTags: ['loving', 'connected', 'open', 'grateful'],
      transits: ['Venus aspects', 'Moon in Libra', '7th house transits'],
    },
  },
  {
    id: 'empowerment',
    name: 'Reclaiming Power',
    shortSummary: 'A journey toward personal authority and confident action.',
    longSummary:
      'This phase is about stepping into your power—not power over others, but the deep self-trust that allows decisive action. Your patterns suggest you are reclaiming parts of yourself that were diminished, learning to advocate for your needs, and developing the courage to take up space. This work can feel uncomfortable, especially if you were taught to stay small. But your fire is meant to burn brightly.',
    guidanceBullets: [
      'Practice making decisions more quickly',
      'Notice where you give away your power',
      'Set and maintain boundaries without over-explaining',
      'Take action even when you feel unsure',
      'Celebrate assertiveness as a form of self-respect',
    ],
    relatedTags: [
      'empowerment',
      'confidence',
      'strength',
      'boundaries',
      'action',
    ],
    triggers: {
      tarotSuits: ['Wands', 'Swords'],
      tarotMajors: [
        'Strength',
        'The Chariot',
        'The Emperor',
        'The Magician',
        'Justice',
      ],
      journalKeywords: [
        'power',
        'strength',
        'confident',
        'boundary',
        'standing up',
        'voice',
        'action',
        'courage',
      ],
      moodTags: ['powerful', 'confident', 'determined', 'fierce'],
      transits: ['Mars aspects', 'Sun in Aries', 'Pluto transits', 'Leo moon'],
    },
  },
  {
    id: 'integration',
    name: 'Integration & Synthesis',
    shortSummary: 'Bringing together disparate parts into a cohesive whole.',
    longSummary:
      'You are in a period of synthesis—weaving together various threads of experience, identity, and learning into something coherent. This is the work of making meaning from what you have lived. The patterns in your data suggest you have gathered enough raw material; now comes the alchemical work of integration. This phase often precedes a new chapter, as you consolidate before the next adventure.',
    guidanceBullets: [
      'Review and reflect on recent experiences',
      'Look for themes that connect seemingly separate events',
      'Write about what you have learned this year',
      'Honor both light and shadow aspects of yourself',
      'Prepare for what wants to emerge next',
    ],
    relatedTags: [
      'integration',
      'synthesis',
      'meaning',
      'reflection',
      'wholeness',
    ],
    triggers: {
      tarotSuits: ['Pentacles', 'Cups'],
      tarotMajors: ['The World', 'Judgement', 'Temperance', 'The Hermit'],
      journalKeywords: [
        'learning',
        'understanding',
        'making sense',
        'connecting',
        'realizing',
        'pattern',
        'whole',
      ],
      moodTags: ['reflective', 'contemplative', 'peaceful', 'wise'],
      transits: ['Saturn return', 'Jupiter return', 'Nodal returns'],
    },
  },
];

export function getThemeById(id: string): LifeTheme | undefined {
  return LIFE_THEMES.find((theme) => theme.id === id);
}
