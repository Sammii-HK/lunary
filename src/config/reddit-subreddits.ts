export interface SubredditConfig {
  name: string;
  memberCount: number;
  description: string;
  contentType: 'educational' | 'promotional' | 'community' | 'readings';
  allowsSelfPromotion: boolean;
  titleFormat?: string;
  notes?: string;
}

export const REDDIT_SUBREDDITS: SubredditConfig[] = [
  {
    name: 'lunary_insights',
    memberCount: 100,
    description:
      'Official Lunary community - daily cosmic guidance, astrology insights, and updates',
    contentType: 'promotional',
    allowsSelfPromotion: true,
    notes: 'Our own subreddit - always safe to post any content',
  },
  {
    name: 'astrology',
    memberCount: 1200000,
    description: 'Technical astrology discussion, chart analysis, transit talk',
    contentType: 'educational',
    allowsSelfPromotion: false,
    notes:
      'Value-first, no self-promotion. Reference chart data with specificity.',
  },
  {
    name: 'tarot',
    memberCount: 400000,
    description: 'Tarot practice, interpretations, and reading techniques',
    contentType: 'educational',
    allowsSelfPromotion: false,
    notes: 'Practical, spreads-focused. No fearmongering about "scary" cards.',
  },
  {
    name: 'witchcraft',
    memberCount: 500000,
    description: 'Practical witchcraft, spellwork, and ritual discussion',
    contentType: 'community',
    allowsSelfPromotion: false,
    notes:
      'Ritual-focused, include materials and timing. Respect all traditions.',
  },
  {
    name: 'spirituality',
    memberCount: 800000,
    description: 'Spiritual growth, philosophy, and personal development',
    contentType: 'community',
    allowsSelfPromotion: false,
    notes: 'Philosophical and accessible. Inclusive of different paths.',
  },
];

let currentIndex = 0;

export function getNextSubreddit(): SubredditConfig {
  const subreddit = REDDIT_SUBREDDITS[currentIndex];
  currentIndex = (currentIndex + 1) % REDDIT_SUBREDDITS.length;
  return subreddit;
}

export function getSubredditByName(name: string): SubredditConfig | undefined {
  return REDDIT_SUBREDDITS.find((sub) => sub.name === name);
}

export function getSubredditsByContentType(
  contentType: SubredditConfig['contentType'],
): SubredditConfig[] {
  return REDDIT_SUBREDDITS.filter((sub) => sub.contentType === contentType);
}

export function getSubredditsForPostType(postType: string): SubredditConfig[] {
  return REDDIT_SUBREDDITS;
}

export function selectSubredditForPostType(postType: string): SubredditConfig {
  return REDDIT_SUBREDDITS[0];
}
