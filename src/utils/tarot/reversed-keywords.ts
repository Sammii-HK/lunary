/**
 * Utility for deriving reversed tarot card keywords from upright keywords.
 * Creates meaningful shadow/blocked interpretations while maintaining
 * semantic relevance to the original concepts.
 */

const REVERSAL_PREFIXES = [
  'blocked',
  'delayed',
  'shadow',
  'repressed',
  'inverted',
] as const;

/**
 * Common keyword transformations for upright -> reversed meanings.
 * These are domain-specific to tarot interpretation.
 */
const TRANSFORMATIONS: Record<string, string> = {
  // Major Arcana common keywords
  'new beginnings': 'fear of change',
  innocence: 'naivety',
  spontaneity: 'recklessness',
  'a free spirit': 'aimlessness',
  'leap of faith': 'foolish risks',
  adventure: 'escapism',
  manifestation: 'manipulation',
  resourcefulness: 'untapped potential',
  power: 'misuse of power',
  'inspired action': 'scattered energy',
  willpower: 'weak willpower',
  skill: 'lack of skill',
  intuition: 'ignored intuition',
  'sacred knowledge': 'hidden agendas',
  'divine feminine': 'disconnection from self',
  'the subconscious mind': 'repressed feelings',
  mystery: 'secrets',
  'inner voice': 'silenced voice',
  femininity: 'creative block',
  beauty: 'vanity',
  nature: 'disconnect from nature',
  nurturing: 'smothering',
  abundance: 'scarcity mindset',
  fertility: 'infertility',
  creativity: 'creative block',
  authority: 'domination',
  establishment: 'rigidity',
  structure: 'inflexibility',
  'a father figure': 'absent authority',
  leadership: 'tyranny',
  stability: 'stagnation',
  'spiritual wisdom': 'dogma',
  'religious beliefs': 'blind faith',
  conformity: 'rebellion',
  tradition: 'outdated beliefs',
  institutions: 'restriction',
  mentorship: 'bad advice',
  love: 'disharmony',
  harmony: 'imbalance',
  relationships: 'relationship problems',
  'values alignment': 'misaligned values',
  choices: 'poor choices',
  union: 'separation',
  partnership: 'disconnection',
  determination: 'lack of direction',
  control: 'lack of control',
  success: 'delayed success',
  ambition: 'misdirected ambition',
  action: 'inaction',
  strength: 'self-doubt',
  courage: 'cowardice',
  influence: 'powerlessness',
  'inner strength': 'inner weakness',
  bravery: 'fear',
  compassion: 'lack of compassion',
  'soul searching': 'avoidance',
  introspection: 'isolation',
  'being alone': 'loneliness',
  'inner guidance': 'lost path',
  contemplation: 'overthinking',
  wisdom: 'poor judgment',
  karma: 'bad karma',
  'life cycles': 'resistance to change',
  destiny: 'missed opportunities',
  'turning point': 'being stuck',
  luck: 'bad luck',
  balance: 'imbalance',
  patience: 'impatience',
  moderation: 'excess',
  purpose: 'lack of purpose',
  meaning: 'meaninglessness',
  transformation: 'stagnation',
  endings: 'fear of endings',
  change: 'resistance to change',
  'letting go': 'unable to let go',
  renewal: 'decay',
  transition: 'stuck in transition',
  hope: 'hopelessness',
  faith: 'lack of faith',
  inspiration: 'uninspired',
  'inner calm': 'inner turmoil',
  joy: 'sadness',
  vitality: 'depletion',
  enlightenment: 'confusion',
  warmth: 'coldness',
  positivity: 'negativity',
  judgment: 'self-doubt',
  rebirth: 'fear of judgment',
  awakening: 'denial',
  absolution: 'guilt',
  'inner calling': 'ignored calling',
  completion: 'incompletion',
  integration: 'disintegration',
  accomplishment: 'failure',
  travel: 'stagnation',
  'sense of belonging': 'feeling lost',
  wholeness: 'fragmentation',

  // Minor Arcana common keywords
  ace: 'missed opportunity',
  beginning: 'false start',
  potential: 'wasted potential',
  opportunity: 'missed opportunity',
  growth: 'stunted growth',
  progress: 'setback',
  celebration: 'cancelled plans',
  happiness: 'unhappiness',
  friendship: 'falling out',
  community: 'isolation',
  reunion: 'separation',
  homecoming: 'displacement',
  loss: 'recovery',
  grief: 'moving on',
  disappointment: 'acceptance',
  regret: 'forgiveness',
  'moving on': 'stuck in past',
  'leaving behind': 'returning',
  journey: 'delays',
  searching: 'lost',
  dissatisfaction: 'satisfaction',
  'emotional fulfillment': 'emotional void',
  'wish come true': 'unfulfilled wish',
  contentment: 'discontent',
  indulgence: 'deprivation',
  overindulgence: 'moderation',
  stagnation: 'movement',
  apathy: 'engagement',
  'emotional withdrawal': 'emotional openness',

  // Court card keywords
  messenger: 'delayed message',
  news: 'no news',
  curiosity: 'disinterest',
  enthusiasm: 'apathy',
  romance: 'unrequited love',
  charm: 'superficiality',
  diplomacy: 'conflict',
  intuitive: 'disconnected',
  caring: 'neglect',
  empathy: 'lack of empathy',
  emotional: 'emotionally unavailable',
  mastery: 'novice',
  maturity: 'immaturity',
  generosity: 'selfishness',
  compassionate: 'cold',
};

/**
 * Simple hash function for deterministic "randomness" based on string input.
 * Used to consistently select prefixes for keywords without true transformations.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Derives reversed/shadow keywords from upright tarot keywords.
 * Uses a combination of:
 * 1. Direct transformations for common keywords
 * 2. Prefix-based modifications for others
 *
 * @param uprightKeywords - Array of upright keyword strings
 * @returns Array of reversed keyword strings
 */
export function deriveReversedKeywords(uprightKeywords: string[]): string[] {
  return uprightKeywords.map((keyword) => {
    const normalizedKeyword = keyword.toLowerCase().trim();

    // Check for direct transformation
    if (TRANSFORMATIONS[normalizedKeyword]) {
      return TRANSFORMATIONS[normalizedKeyword];
    }

    // Use deterministic prefix based on keyword hash
    const prefix =
      REVERSAL_PREFIXES[
        simpleHash(normalizedKeyword) % REVERSAL_PREFIXES.length
      ];
    return `${prefix} ${normalizedKeyword}`;
  });
}

/**
 * Gets both upright and reversed keywords formatted for display.
 * Useful for components that need both sets together.
 */
export function getTarotKeywordSets(uprightKeywords: string[]): {
  upright: string[];
  reversed: string[];
} {
  return {
    upright: uprightKeywords,
    reversed: deriveReversedKeywords(uprightKeywords),
  };
}
