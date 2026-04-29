/**
 * Lightweight keyword classifier for the Cosmic Decision Helper.
 *
 * Pure module — no IO, no async. Maps a free-text question to one of eight
 * decision categories the scorer understands, with `'general'` as a safe
 * fallback when nothing matches.
 *
 * The matching is intentionally simple — whole-word, case-insensitive
 * substring scan against per-category keyword lists. We rank categories by
 * the number of distinct keyword hits and break ties using a fixed priority
 * order so the same input always returns the same category.
 */

export type Category =
  | 'communication'
  | 'love'
  | 'action'
  | 'career'
  | 'creative'
  | 'travel'
  | 'commitment'
  | 'rest'
  | 'general';

// Tie-break order — earlier wins when two categories tie on hit count.
// Communication wins ties because it's the most common decision-helper use case
// (users asking "should I send/text/say…").
const PRIORITY: readonly Category[] = [
  'communication',
  'love',
  'action',
  'career',
  'creative',
  'travel',
  'commitment',
  'rest',
] as const;

const KEYWORDS: Record<Exclude<Category, 'general'>, readonly string[]> = {
  communication: [
    'send',
    'email',
    'text',
    'message',
    'reply',
    'dm',
    'say',
    'tell',
    'call',
    'voicemail',
    'pitch',
    'reach out',
    'follow up',
    'follow-up',
    'announce',
    'post',
    'tweet',
    'share',
  ],
  love: [
    'ask out',
    'date',
    'love',
    'crush',
    'kiss',
    'flirt',
    'romance',
    'relationship',
    'partner',
    'breakup',
    'break up',
    'reconcile',
    'ex',
    'marry',
    'propose',
    'sleep with',
  ],
  action: [
    'launch',
    'ship',
    'start',
    'begin',
    'attack',
    'push',
    'compete',
    'fight',
    'workout',
    'train',
    'sprint',
    'race',
    'do it',
    'take action',
    'go for it',
  ],
  career: [
    'job',
    'career',
    'work',
    'promotion',
    'raise',
    'interview',
    'apply',
    'resign',
    'quit',
    'boss',
    'business',
    'invest',
    'meeting',
    'present',
    'presentation',
    'negotiate',
    'salary',
    'role',
    'position',
  ],
  creative: [
    'create',
    'paint',
    'write',
    'draw',
    'compose',
    'design',
    'film',
    'record',
    'sing',
    'perform',
    'art',
    'creative',
    'song',
    'novel',
    'poem',
    'story',
    'photo',
    'shoot',
  ],
  travel: [
    'travel',
    'trip',
    'flight',
    'fly',
    'drive',
    'roadtrip',
    'road trip',
    'vacation',
    'holiday',
    'move',
    'relocate',
    'visit',
    'abroad',
    'overseas',
    'journey',
    'explore',
  ],
  commitment: [
    'commit',
    'sign',
    'contract',
    'lease',
    'mortgage',
    'buy',
    'purchase',
    'agreement',
    'vow',
    'promise',
    'engage',
    'engagement',
    'wedding',
    'long term',
    'long-term',
    'forever',
  ],
  rest: [
    'rest',
    'sleep',
    'nap',
    'pause',
    'break',
    'recharge',
    'recover',
    'heal',
    'cancel',
    'reschedule',
    'stay home',
    'stay in',
    'do nothing',
    'retreat',
    'unplug',
    'quiet day',
  ],
};

function hitCount(haystack: string, keywords: readonly string[]): number {
  let hits = 0;
  for (const kw of keywords) {
    if (haystack.includes(kw)) hits += 1;
  }
  return hits;
}

/**
 * Classify a free-text decision question into one of the eight supported
 * categories, or `'general'` when nothing scores. Always deterministic.
 */
export function categoriseQuestion(text: string): Category {
  if (typeof text !== 'string' || text.trim().length === 0) return 'general';

  // Lowercase + collapse internal whitespace so we can do whole-string
  // substring matching against multi-word keywords like "follow up".
  const normalised = text.toLowerCase().replace(/\s+/g, ' ').trim();

  let bestCategory: Category = 'general';
  let bestScore = 0;

  for (const cat of PRIORITY) {
    const keywords = KEYWORDS[cat as keyof typeof KEYWORDS];
    if (!keywords) continue;
    const score = hitCount(normalised, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  return bestCategory;
}

export const __test__ = { KEYWORDS, PRIORITY };
