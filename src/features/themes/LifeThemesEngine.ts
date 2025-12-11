export interface LifeTheme {
  id: string;
  name: string;
  shortSummary: string;
  longSummary: string;
  confidence: number;
  relatedTags: string[];
  guidanceBullets?: string[];
}

interface JournalEntry {
  moodTags?: string[];
  cardReferences?: string[];
  text?: string;
}

interface TarotPatterns {
  dominantThemes?: string[];
  suitPatterns?: Array<{ suit: string; count: number }>;
}

interface BirthChartData {
  placements?: Array<{ planet: string; sign: string; element?: string }>;
}

const LIFE_THEME_DEFINITIONS: Record<
  string,
  {
    name: string;
    shortSummary: string;
    longSummary: string;
    guidanceBullets: string[];
    triggers: {
      moods?: string[];
      tarotThemes?: string[];
      suits?: string[];
      elements?: string[];
      cards?: string[];
    };
  }
> = {
  healing_the_heart: {
    name: 'Healing the Heart',
    shortSummary: 'A time of emotional restoration and self-compassion.',
    longSummary:
      'You are moving through a profound season of emotional healing. Old wounds are surfacing not to hurt you, but to finally be acknowledged and released. This is a time of deep self-compassion, where the tender parts of your heart are asking for attention. The cosmic currents support inner work, forgiveness (of self and others), and creating space for emotional renewal.',
    guidanceBullets: [
      'Practice gentle self-care rituals daily',
      'Journal about what you are ready to release',
      'Allow tears as a form of cleansing',
      'Consider working with rose quartz or heart-opening crystals',
      'Honor the pace your heart needs',
    ],
    triggers: {
      moods: ['sad', 'vulnerable', 'healing', 'reflective', 'emotional'],
      tarotThemes: ['healing', 'release', 'intuition'],
      suits: ['Cups'],
      cards: ['The Star', 'Three of Swords', 'Six of Cups', 'Ace of Cups'],
    },
  },
  creative_rebirth: {
    name: 'Creative Rebirth',
    shortSummary: 'Fresh creative energy is emerging within you.',
    longSummary:
      'A powerful creative force is stirring in your life. Whether through art, ideas, projects, or new ways of expressing yourself, you are in a season of creative rebirth. Old blocks are dissolving, and inspiration is flowing more freely. This theme invites you to trust your creative instincts, take risks with your self-expression, and follow the threads of curiosity wherever they lead.',
    guidanceBullets: [
      'Make time for creative play without judgment',
      'Start that project you have been thinking about',
      'Surround yourself with inspiring people and places',
      'Document your creative sparks in a journal',
      'Trust the messy middle of the creative process',
    ],
    triggers: {
      moods: ['inspired', 'energized', 'creative', 'passionate', 'excited'],
      tarotThemes: ['creativity', 'action', 'growth'],
      suits: ['Wands'],
      elements: ['Fire'],
      cards: ['The Empress', 'Ace of Wands', 'Three of Wands', 'The Magician'],
    },
  },
  shadow_integration: {
    name: 'Shadow Integration',
    shortSummary: 'Facing hidden aspects of self with courage.',
    longSummary:
      'You are in a transformative period of shadow work, where hidden aspects of yourself are emerging to be seen and integrated. This can feel intense, but it is profoundly healing. The parts of yourself you have pushed away or denied are asking for acknowledgment. By facing them with courage and compassion, you reclaim your wholeness and unlock dormant power.',
    guidanceBullets: [
      'Notice what triggers strong reactions in you',
      'Work with a therapist or guide if needed',
      'Journal about recurring patterns or fears',
      'Practice self-compassion when difficult emotions arise',
      'Consider ritual work with obsidian or smoky quartz',
    ],
    triggers: {
      moods: ['anxious', 'uncertain', 'fearful', 'intense', 'transforming'],
      tarotThemes: ['transformation', 'truth'],
      suits: ['Major Arcana'],
      cards: ['The Tower', 'Death', 'The Devil', 'The Moon', 'Eight of Swords'],
    },
  },
  spiritual_awakening: {
    name: 'Spiritual Awakening',
    shortSummary: 'Deepening connection to your spiritual nature.',
    longSummary:
      'Your spiritual awareness is expanding. You may be experiencing increased intuition, meaningful synchronicities, or a deepening desire to connect with something greater than yourself. This theme marks a period of spiritual growth where old beliefs may be questioned and new understanding emerges. Trust the journey, even when it feels unfamiliar.',
    guidanceBullets: [
      'Establish or deepen a daily spiritual practice',
      'Pay attention to dreams and intuitive hits',
      'Spend time in nature to ground your energy',
      'Explore teachings that resonate with your soul',
      'Trust the timing of your awakening',
    ],
    triggers: {
      moods: ['spiritual', 'intuitive', 'connected', 'peaceful', 'wondering'],
      tarotThemes: ['intuition', 'truth', 'connection'],
      suits: ['Major Arcana', 'Cups'],
      cards: [
        'The High Priestess',
        'The Star',
        'The Hermit',
        'The World',
        'Four of Cups',
      ],
    },
  },
  identity_expansion: {
    name: 'Identity Expansion',
    shortSummary: 'Discovering new dimensions of who you are.',
    longSummary:
      'You are outgrowing old versions of yourself and stepping into a more expansive identity. This may manifest as changing interests, evolving relationships, or a shift in how you see yourself in the world. While this growth can feel disorienting, it is a natural part of your evolution. You are not losing yourself—you are becoming more fully yourself.',
    guidanceBullets: [
      'Release attachment to who you used to be',
      'Explore new interests without pressure',
      'Surround yourself with people who see your potential',
      'Celebrate small shifts in perspective',
      'Trust that becoming is a lifelong process',
    ],
    triggers: {
      moods: ['changing', 'evolving', 'growing', 'curious', 'restless'],
      tarotThemes: ['growth', 'transformation', 'action'],
      suits: ['Wands', 'Major Arcana'],
      cards: ['The Fool', 'Wheel of Fortune', 'Judgement', 'Page of Wands'],
    },
  },
  grounding_stability: {
    name: 'Grounding & Stability',
    shortSummary: 'Building a solid foundation for what matters.',
    longSummary:
      'This is a time for creating stability and grounding your energy. Whether in finances, home, health, or daily routines, you are being called to build a solid foundation. This theme supports practical action, patience, and commitment to the long game. By tending to the material aspects of life, you create the stability needed for other areas to flourish.',
    guidanceBullets: [
      'Focus on one area of life that needs structure',
      'Create sustainable daily routines',
      'Review and organize your finances',
      'Spend time in nature to ground your energy',
      'Celebrate progress, not just completion',
    ],
    triggers: {
      moods: ['stable', 'grounded', 'practical', 'focused', 'determined'],
      tarotThemes: ['stability', 'growth'],
      suits: ['Pentacles'],
      elements: ['Earth'],
      cards: [
        'The Emperor',
        'Four of Pentacles',
        'Ten of Pentacles',
        'King of Pentacles',
      ],
    },
  },
  truth_seeking: {
    name: 'Truth Seeking',
    shortSummary: 'Clarity is cutting through confusion.',
    longSummary:
      'You are in a period of mental clarity and truth-seeking. Illusions are falling away, and you are seeing situations more clearly. This theme supports honest communication, discernment, and making decisions based on what is truly aligned with your values. While the truth can sometimes be uncomfortable, it is always liberating.',
    guidanceBullets: [
      'Practice radical honesty with yourself',
      'Have conversations you have been avoiding',
      'Question assumptions and beliefs',
      'Write to clarify your thoughts',
      'Trust your discernment',
    ],
    triggers: {
      moods: ['clear', 'honest', 'decisive', 'analytical'],
      tarotThemes: ['truth', 'clarity'],
      suits: ['Swords'],
      elements: ['Air'],
      cards: ['Justice', 'Ace of Swords', 'Queen of Swords', 'The Hanged Man'],
    },
  },
  connection_belonging: {
    name: 'Connection & Belonging',
    shortSummary: 'Deepening bonds and finding your people.',
    longSummary:
      'Relationships and connection are at the forefront of your journey right now. This may involve deepening existing bonds, healing relationship patterns, or finding communities where you truly belong. You are learning about the balance between independence and interdependence, and how to show up authentically in your connections with others.',
    guidanceBullets: [
      'Reach out to someone you have been thinking about',
      'Invest time in relationships that nourish you',
      'Set healthy boundaries where needed',
      'Consider how you can be of service to others',
      'Celebrate the love already present in your life',
    ],
    triggers: {
      moods: ['loving', 'connected', 'grateful', 'social', 'lonely'],
      tarotThemes: ['connection', 'healing'],
      suits: ['Cups'],
      cards: ['The Lovers', 'Two of Cups', 'Three of Cups', 'Ten of Cups'],
    },
  },
};

function calculateThemeScore(
  themeKey: string,
  journalMoods: string[],
  tarotThemes: string[],
  dominantSuits: string[],
  elements: string[],
  cardReferences: string[],
): number {
  const theme = LIFE_THEME_DEFINITIONS[themeKey];
  if (!theme) return 0;

  let score = 0;
  const triggers = theme.triggers;

  if (triggers.moods) {
    const moodMatches = journalMoods.filter((mood) =>
      triggers.moods!.some((t) => mood.toLowerCase().includes(t.toLowerCase())),
    );
    score += moodMatches.length * 2;
  }

  if (triggers.tarotThemes) {
    const themeMatches = tarotThemes.filter((t) =>
      triggers.tarotThemes!.some((tt) =>
        t.toLowerCase().includes(tt.toLowerCase()),
      ),
    );
    score += themeMatches.length * 3;
  }

  if (triggers.suits) {
    const suitMatches = dominantSuits.filter((s) =>
      triggers.suits!.includes(s),
    );
    score += suitMatches.length * 2;
  }

  if (triggers.elements) {
    const elementMatches = elements.filter((e) =>
      triggers.elements!.includes(e),
    );
    score += elementMatches.length * 1.5;
  }

  if (triggers.cards) {
    const cardMatches = cardReferences.filter((c) =>
      triggers.cards!.some((tc) => c.toLowerCase().includes(tc.toLowerCase())),
    );
    score += cardMatches.length * 2.5;
  }

  return score;
}

export function computeLifeThemes(
  journalEntries: JournalEntry[],
  tarotPatterns: TarotPatterns | null,
  birthChart: BirthChartData | null,
): LifeTheme[] {
  const journalMoods: string[] = [];
  const cardReferences: string[] = [];

  journalEntries.forEach((entry) => {
    if (entry.moodTags) {
      journalMoods.push(...entry.moodTags);
    }
    if (entry.cardReferences) {
      cardReferences.push(...entry.cardReferences);
    }
  });

  const tarotThemes = tarotPatterns?.dominantThemes || [];
  const dominantSuits = (tarotPatterns?.suitPatterns || [])
    .slice(0, 2)
    .map((s) => s.suit);

  const elements: string[] = [];
  if (birthChart?.placements) {
    const elementCounts: Record<string, number> = {};
    birthChart.placements.forEach((p) => {
      const element = getElementFromSign(p.sign);
      if (element) {
        elementCounts[element] = (elementCounts[element] || 0) + 1;
      }
    });
    const sortedElements = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([el]) => el);
    elements.push(...sortedElements.slice(0, 2));
  }

  const themeScores: Array<{ key: string; score: number }> = [];

  Object.keys(LIFE_THEME_DEFINITIONS).forEach((themeKey) => {
    const score = calculateThemeScore(
      themeKey,
      journalMoods,
      tarotThemes,
      dominantSuits,
      elements,
      cardReferences,
    );
    if (score > 0) {
      themeScores.push({ key: themeKey, score });
    }
  });

  themeScores.sort((a, b) => b.score - a.score);

  const maxScore = themeScores[0]?.score || 1;

  return themeScores.slice(0, 5).map(({ key, score }) => {
    const def = LIFE_THEME_DEFINITIONS[key];
    return {
      id: key,
      name: def.name,
      shortSummary: def.shortSummary,
      longSummary: def.longSummary,
      confidence: Math.min(score / maxScore, 1),
      relatedTags: [
        ...(def.triggers.moods?.slice(0, 2) || []),
        ...(def.triggers.suits?.slice(0, 1) || []),
      ],
      guidanceBullets: def.guidanceBullets,
    };
  });
}

function getElementFromSign(sign: string): string | null {
  const elementMap: Record<string, string> = {
    Aries: 'Fire',
    Leo: 'Fire',
    Sagittarius: 'Fire',
    Taurus: 'Earth',
    Virgo: 'Earth',
    Capricorn: 'Earth',
    Gemini: 'Air',
    Libra: 'Air',
    Aquarius: 'Air',
    Cancer: 'Water',
    Scorpio: 'Water',
    Pisces: 'Water',
  };
  return elementMap[sign] || null;
}

export function getLifeThemeById(id: string): LifeTheme | null {
  const def = LIFE_THEME_DEFINITIONS[id];
  if (!def) return null;

  return {
    id,
    name: def.name,
    shortSummary: def.shortSummary,
    longSummary: def.longSummary,
    confidence: 1,
    relatedTags: [
      ...(def.triggers.moods?.slice(0, 2) || []),
      ...(def.triggers.suits?.slice(0, 1) || []),
    ],
    guidanceBullets: def.guidanceBullets,
  };
}
