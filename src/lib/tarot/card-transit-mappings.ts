/**
 * Tarot Card to Transit Mappings
 *
 * Defines which planetary transits are most relevant for each tarot card.
 * Used to find meaningful connections between daily/spread cards and current transits.
 */

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'square'
  | 'trine'
  | 'sextile'
  | 'any';

export type CardTransitAffinity = {
  planets: string[]; // e.g., ['Mars', 'Sun']
  themes: string[]; // e.g., ['courage', 'vitality', 'inner-power']
  aspectTypes: AspectType[]; // Preferred aspect types
  weight?: number; // Optional weight for prioritization (1-10, default 5)
};

/**
 * Map of tarot card slugs to their transit affinities
 *
 * Cards are mapped using kebab-case slugs that match the card names
 */
export const CARD_TRANSIT_AFFINITIES: Record<string, CardTransitAffinity> = {
  // MAJOR ARCANA
  'the-fool': {
    planets: ['Uranus', 'Jupiter'],
    themes: ['new-beginnings', 'freedom', 'spontaneity', 'risk'],
    aspectTypes: ['conjunction', 'trine', 'any'],
    weight: 7,
  },
  'the-magician': {
    planets: ['Mercury'],
    themes: ['manifestation', 'communication', 'skill', 'willpower'],
    aspectTypes: ['any'],
    weight: 6,
  },
  'the-high-priestess': {
    planets: ['Moon', 'Neptune'],
    themes: ['intuition', 'mystery', 'unconscious', 'secrets'],
    aspectTypes: ['any'],
    weight: 6,
  },
  'the-empress': {
    planets: ['Venus'],
    themes: ['abundance', 'nurturing', 'creativity', 'fertility'],
    aspectTypes: ['trine', 'conjunction', 'any'],
    weight: 6,
  },
  'the-emperor': {
    planets: ['Mars', 'Saturn'],
    themes: ['authority', 'structure', 'leadership', 'control'],
    aspectTypes: ['any'],
    weight: 6,
  },
  'the-hierophant': {
    planets: ['Jupiter', 'Saturn'],
    themes: ['tradition', 'teaching', 'belief-systems', 'conformity'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'the-lovers': {
    planets: ['Venus', 'Mercury'],
    themes: ['choice', 'relationship', 'values', 'union'],
    aspectTypes: ['any'],
    weight: 7,
  },
  'the-chariot': {
    planets: ['Mars'],
    themes: ['willpower', 'determination', 'control', 'victory'],
    aspectTypes: ['conjunction', 'square', 'any'],
    weight: 6,
  },
  'strength': {
    planets: ['Mars', 'Sun'],
    themes: ['courage', 'vitality', 'inner-power', 'compassion'],
    aspectTypes: ['any'],
    weight: 7,
  },
  'the-hermit': {
    planets: ['Saturn', 'Mercury'],
    themes: ['solitude', 'introspection', 'wisdom', 'guidance'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'wheel-of-fortune': {
    planets: ['Jupiter'],
    themes: ['fate', 'change', 'cycles', 'opportunity'],
    aspectTypes: ['any'],
    weight: 6,
  },
  'justice': {
    planets: ['Saturn', 'Venus'],
    themes: ['balance', 'truth', 'consequences', 'fairness'],
    aspectTypes: ['opposition', 'square', 'any'],
    weight: 6,
  },
  'the-hanged-man': {
    planets: ['Neptune', 'Saturn'],
    themes: ['surrender', 'perspective', 'sacrifice', 'letting-go'],
    aspectTypes: ['any'],
    weight: 6,
  },
  'death': {
    planets: ['Pluto', 'Saturn'],
    themes: ['transformation', 'endings', 'release', 'rebirth'],
    aspectTypes: ['any'],
    weight: 8,
  },
  'temperance': {
    planets: ['Jupiter', 'Venus'],
    themes: ['balance', 'moderation', 'integration', 'healing'],
    aspectTypes: ['trine', 'sextile', 'any'],
    weight: 5,
  },
  'the-devil': {
    planets: ['Saturn', 'Pluto', 'Mars'],
    themes: ['bondage', 'addiction', 'materialism', 'shadow'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 7,
  },
  'the-tower': {
    planets: ['Uranus', 'Mars', 'Pluto'],
    themes: ['sudden-change', 'upheaval', 'breakthrough', 'destruction'],
    aspectTypes: ['square', 'opposition', 'conjunction', 'any'],
    weight: 9,
  },
  'the-star': {
    planets: ['Jupiter', 'Venus', 'Uranus'],
    themes: ['hope', 'healing', 'inspiration', 'renewal'],
    aspectTypes: ['trine', 'sextile', 'any'],
    weight: 7,
  },
  'the-moon': {
    planets: ['Moon', 'Neptune'],
    themes: ['illusion', 'fear', 'unconscious', 'dreams'],
    aspectTypes: ['any'],
    weight: 7,
  },
  'the-sun': {
    planets: ['Sun', 'Jupiter'],
    themes: ['joy', 'success', 'vitality', 'clarity'],
    aspectTypes: ['conjunction', 'trine', 'any'],
    weight: 8,
  },
  'judgement': {
    planets: ['Pluto', 'Uranus'],
    themes: ['awakening', 'rebirth', 'calling', 'evaluation'],
    aspectTypes: ['any'],
    weight: 7,
  },
  'the-world': {
    planets: ['Jupiter', 'Saturn'],
    themes: ['completion', 'integration', 'wholeness', 'achievement'],
    aspectTypes: ['trine', 'conjunction', 'any'],
    weight: 7,
  },

  // MINOR ARCANA - WANDS (Fire/Mars/Sun)
  'ace-of-wands': {
    planets: ['Mars', 'Sun'],
    themes: ['initiative', 'passion', 'inspiration', 'creative-spark'],
    aspectTypes: ['conjunction', 'any'],
    weight: 6,
  },
  'two-of-wands': {
    planets: ['Mars', 'Jupiter'],
    themes: ['planning', 'future-vision', 'decisions', 'ambition'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'three-of-wands': {
    planets: ['Sun', 'Jupiter'],
    themes: ['expansion', 'foresight', 'exploration', 'progress'],
    aspectTypes: ['trine', 'sextile', 'any'],
    weight: 5,
  },
  'four-of-wands': {
    planets: ['Venus', 'Jupiter'],
    themes: ['celebration', 'community', 'foundation', 'harmony'],
    aspectTypes: ['trine', 'any'],
    weight: 5,
  },
  'five-of-wands': {
    planets: ['Mars'],
    themes: ['conflict', 'competition', 'struggle', 'tension'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 6,
  },
  'six-of-wands': {
    planets: ['Sun', 'Jupiter'],
    themes: ['victory', 'recognition', 'success', 'pride'],
    aspectTypes: ['trine', 'conjunction', 'any'],
    weight: 6,
  },
  'seven-of-wands': {
    planets: ['Mars'],
    themes: ['defense', 'perseverance', 'challenge', 'courage'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 6,
  },
  'eight-of-wands': {
    planets: ['Mercury', 'Mars'],
    themes: ['speed', 'movement', 'action', 'communication'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'nine-of-wands': {
    planets: ['Mars', 'Saturn'],
    themes: ['resilience', 'persistence', 'boundaries', 'exhaustion'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'ten-of-wands': {
    planets: ['Saturn', 'Mars'],
    themes: ['burden', 'responsibility', 'overextension', 'completion'],
    aspectTypes: ['square', 'any'],
    weight: 6,
  },

  // MINOR ARCANA - CUPS (Water/Moon/Venus)
  'ace-of-cups': {
    planets: ['Moon', 'Venus'],
    themes: ['emotional-opening', 'love', 'intuition', 'new-feelings'],
    aspectTypes: ['conjunction', 'trine', 'any'],
    weight: 7,
  },
  'two-of-cups': {
    planets: ['Venus'],
    themes: ['partnership', 'connection', 'mutual-attraction', 'union'],
    aspectTypes: ['conjunction', 'trine', 'any'],
    weight: 7,
  },
  'three-of-cups': {
    planets: ['Venus', 'Jupiter'],
    themes: ['celebration', 'friendship', 'community', 'joy'],
    aspectTypes: ['trine', 'any'],
    weight: 5,
  },
  'four-of-cups': {
    planets: ['Moon', 'Saturn'],
    themes: ['apathy', 'contemplation', 'missed-opportunity', 'discontent'],
    aspectTypes: ['square', 'any'],
    weight: 5,
  },
  'five-of-cups': {
    planets: ['Moon', 'Saturn'],
    themes: ['loss', 'grief', 'regret', 'disappointment'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 6,
  },
  'six-of-cups': {
    planets: ['Moon', 'Venus'],
    themes: ['nostalgia', 'innocence', 'memories', 'past'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'seven-of-cups': {
    planets: ['Neptune', 'Moon'],
    themes: ['illusion', 'fantasy', 'choices', 'confusion'],
    aspectTypes: ['any'],
    weight: 6,
  },
  'eight-of-cups': {
    planets: ['Moon', 'Saturn'],
    themes: ['withdrawal', 'seeking-truth', 'letting-go', 'transition'],
    aspectTypes: ['any'],
    weight: 6,
  },
  'nine-of-cups': {
    planets: ['Jupiter', 'Venus'],
    themes: ['satisfaction', 'wish-fulfillment', 'contentment', 'pleasure'],
    aspectTypes: ['trine', 'any'],
    weight: 6,
  },
  'ten-of-cups': {
    planets: ['Jupiter', 'Venus', 'Moon'],
    themes: ['fulfillment', 'family', 'harmony', 'happiness'],
    aspectTypes: ['trine', 'conjunction', 'any'],
    weight: 7,
  },

  // MINOR ARCANA - SWORDS (Air/Mercury)
  'ace-of-swords': {
    planets: ['Mercury', 'Uranus'],
    themes: ['clarity', 'breakthrough', 'truth', 'mental-power'],
    aspectTypes: ['conjunction', 'any'],
    weight: 7,
  },
  'two-of-swords': {
    planets: ['Moon', 'Mercury'],
    themes: ['decision', 'mental-tension', 'stalemate', 'avoidance'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 6,
  },
  'three-of-swords': {
    planets: ['Saturn', 'Mercury'],
    themes: ['heartbreak', 'painful-truth', 'sorrow', 'grief'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 7,
  },
  'four-of-swords': {
    planets: ['Mercury', 'Saturn'],
    themes: ['rest', 'recuperation', 'contemplation', 'retreat'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'five-of-swords': {
    planets: ['Mars', 'Mercury'],
    themes: ['conflict', 'defeat', 'betrayal', 'winning-at-cost'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 6,
  },
  'six-of-swords': {
    planets: ['Mercury', 'Saturn'],
    themes: ['transition', 'moving-on', 'recovery', 'travel'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'seven-of-swords': {
    planets: ['Mercury', 'Uranus'],
    themes: ['deception', 'strategy', 'cunning', 'betrayal'],
    aspectTypes: ['square', 'any'],
    weight: 5,
  },
  'eight-of-swords': {
    planets: ['Saturn', 'Mercury'],
    themes: ['restriction', 'helplessness', 'mental-prison', 'victimhood'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 6,
  },
  'nine-of-swords': {
    planets: ['Moon', 'Saturn', 'Mercury'],
    themes: ['anxiety', 'nightmares', 'worry', 'fear'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 7,
  },
  'ten-of-swords': {
    planets: ['Pluto', 'Saturn'],
    themes: ['rock-bottom', 'ending', 'betrayal', 'painful-conclusion'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 8,
  },

  // MINOR ARCANA - PENTACLES (Earth/Saturn/Venus)
  'ace-of-pentacles': {
    planets: ['Saturn', 'Venus', 'Jupiter'],
    themes: ['manifestation', 'opportunity', 'material-foundation', 'prosperity'],
    aspectTypes: ['conjunction', 'trine', 'any'],
    weight: 7,
  },
  'two-of-pentacles': {
    planets: ['Mercury', 'Jupiter'],
    themes: ['balance', 'adaptability', 'juggling', 'flexibility'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'three-of-pentacles': {
    planets: ['Saturn', 'Mercury'],
    themes: ['collaboration', 'teamwork', 'skill', 'building'],
    aspectTypes: ['trine', 'sextile', 'any'],
    weight: 5,
  },
  'four-of-pentacles': {
    planets: ['Saturn'],
    themes: ['control', 'security', 'possessiveness', 'scarcity'],
    aspectTypes: ['square', 'any'],
    weight: 5,
  },
  'five-of-pentacles': {
    planets: ['Saturn'],
    themes: ['hardship', 'loss', 'poverty', 'isolation'],
    aspectTypes: ['square', 'opposition', 'any'],
    weight: 7,
  },
  'six-of-pentacles': {
    planets: ['Venus', 'Jupiter'],
    themes: ['generosity', 'giving', 'receiving', 'balance'],
    aspectTypes: ['trine', 'sextile', 'any'],
    weight: 6,
  },
  'seven-of-pentacles': {
    planets: ['Saturn', 'Venus'],
    themes: ['patience', 'evaluation', 'long-term-vision', 'investment'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'eight-of-pentacles': {
    planets: ['Mercury', 'Saturn'],
    themes: ['mastery', 'dedication', 'skill-development', 'focus'],
    aspectTypes: ['trine', 'any'],
    weight: 5,
  },
  'nine-of-pentacles': {
    planets: ['Venus', 'Jupiter'],
    themes: ['self-sufficiency', 'luxury', 'accomplishment', 'independence'],
    aspectTypes: ['trine', 'any'],
    weight: 6,
  },
  'ten-of-pentacles': {
    planets: ['Saturn', 'Jupiter'],
    themes: ['wealth', 'legacy', 'family', 'tradition'],
    aspectTypes: ['trine', 'conjunction', 'any'],
    weight: 7,
  },

  // COURT CARDS - WANDS
  'page-of-wands': {
    planets: ['Mars', 'Mercury'],
    themes: ['exploration', 'enthusiasm', 'messages', 'new-ideas'],
    aspectTypes: ['any'],
    weight: 4,
  },
  'knight-of-wands': {
    planets: ['Mars'],
    themes: ['action', 'adventure', 'impulsiveness', 'passion'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'queen-of-wands': {
    planets: ['Sun', 'Venus'],
    themes: ['confidence', 'independence', 'warmth', 'determination'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'king-of-wands': {
    planets: ['Sun', 'Mars'],
    themes: ['leadership', 'vision', 'entrepreneurship', 'charisma'],
    aspectTypes: ['any'],
    weight: 5,
  },

  // COURT CARDS - CUPS
  'page-of-cups': {
    planets: ['Moon', 'Mercury'],
    themes: ['intuition', 'creativity', 'sensitivity', 'messages'],
    aspectTypes: ['any'],
    weight: 4,
  },
  'knight-of-cups': {
    planets: ['Venus', 'Neptune'],
    themes: ['romance', 'charm', 'idealism', 'pursuit'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'queen-of-cups': {
    planets: ['Moon', 'Venus'],
    themes: ['emotional-depth', 'intuition', 'compassion', 'nurturing'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'king-of-cups': {
    planets: ['Moon', 'Jupiter'],
    themes: ['emotional-balance', 'diplomacy', 'wisdom', 'compassion'],
    aspectTypes: ['any'],
    weight: 5,
  },

  // COURT CARDS - SWORDS
  'page-of-swords': {
    planets: ['Mercury'],
    themes: ['curiosity', 'vigilance', 'communication', 'ideas'],
    aspectTypes: ['any'],
    weight: 4,
  },
  'knight-of-swords': {
    planets: ['Mercury', 'Mars'],
    themes: ['action', 'ambition', 'hastiness', 'directness'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'queen-of-swords': {
    planets: ['Mercury', 'Saturn'],
    themes: ['clarity', 'independence', 'discernment', 'boundaries'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'king-of-swords': {
    planets: ['Mercury', 'Saturn'],
    themes: ['intellectual-power', 'authority', 'truth', 'judgment'],
    aspectTypes: ['any'],
    weight: 5,
  },

  // COURT CARDS - PENTACLES
  'page-of-pentacles': {
    planets: ['Mercury', 'Venus'],
    themes: ['manifestation', 'study', 'planning', 'opportunity'],
    aspectTypes: ['any'],
    weight: 4,
  },
  'knight-of-pentacles': {
    planets: ['Saturn', 'Venus'],
    themes: ['reliability', 'hard-work', 'routine', 'responsibility'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'queen-of-pentacles': {
    planets: ['Venus', 'Saturn'],
    themes: ['nurturing', 'practicality', 'security', 'prosperity'],
    aspectTypes: ['any'],
    weight: 5,
  },
  'king-of-pentacles': {
    planets: ['Saturn', 'Jupiter'],
    themes: ['abundance', 'security', 'leadership', 'material-success'],
    aspectTypes: ['any'],
    weight: 5,
  },
};

/**
 * Normalize card name to slug
 * "The Fool" -> "the-fool"
 * "Ace of Cups" -> "ace-of-cups"
 */
export function cardNameToSlug(cardName: string): string {
  return cardName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get transit affinity for a card by name
 */
export function getCardAffinity(cardName: string): CardTransitAffinity | null {
  const slug = cardNameToSlug(cardName);
  return CARD_TRANSIT_AFFINITIES[slug] || null;
}
