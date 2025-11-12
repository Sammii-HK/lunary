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
    name: 'astrology',
    memberCount: 1400000,
    description: 'Main astrology community for discussions and learning',
    contentType: 'educational',
    allowsSelfPromotion: false,
    notes: 'Requires educational content, no direct self-promotion',
  },
  {
    name: 'Advancedastrology',
    memberCount: 105000,
    description: 'Advanced astrology topics and discussions',
    contentType: 'educational',
    allowsSelfPromotion: false,
    notes: 'For experienced astrologers, educational content preferred',
  },
  {
    name: 'AskAstrologers',
    memberCount: 223000,
    description: 'Q&A focused community for astrology questions',
    contentType: 'community',
    allowsSelfPromotion: false,
    notes: 'Answer questions, provide insights, minimal self-promotion',
  },
  {
    name: 'astrologyreadings',
    memberCount: 194000,
    description: 'Astrology readings and interpretations',
    contentType: 'readings',
    allowsSelfPromotion: true,
    notes: 'Allows readings and reading offers',
  },
  {
    name: 'AstrologyBasics',
    memberCount: 4000,
    description: 'Beginner-friendly astrology discussions',
    contentType: 'educational',
    allowsSelfPromotion: false,
    notes: 'Educational content for beginners',
  },
  {
    name: 'spirituality',
    memberCount: 1200000,
    description: 'Broader spiritual content and discussions',
    contentType: 'community',
    allowsSelfPromotion: false,
    notes: 'General spirituality, cosmic guidance fits well',
  },
  {
    name: 'witchcraft',
    memberCount: 800000,
    description: 'Witchcraft and magical practices',
    contentType: 'community',
    allowsSelfPromotion: false,
    notes: 'May allow cosmic guidance if framed appropriately',
  },
  {
    name: 'moon',
    memberCount: 50000,
    description: 'Moon phase and lunar content',
    contentType: 'educational',
    allowsSelfPromotion: false,
    notes: 'Perfect for moon phase content',
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

/**
 * Maps post types to appropriate subreddit content types
 * Ensures posts go to subreddits that allow that type of content
 */
export function getSubredditsForPostType(postType: string): SubredditConfig[] {
  switch (postType) {
    case 'educational':
    case 'behind_scenes':
      // Educational content goes to educational subreddits
      return getSubredditsByContentType('educational');

    case 'promotional':
    case 'benefit':
    case 'feature':
      // Promotional content only goes to subreddits that allow self-promotion
      return REDDIT_SUBREDDITS.filter((sub) => sub.allowsSelfPromotion);

    case 'inspirational':
    case 'user_story':
      // Community-focused content goes to community subreddits
      return getSubredditsByContentType('community');

    default:
      // Default: educational subreddits (safest, most likely to be accepted)
      return getSubredditsByContentType('educational');
  }
}

/**
 * Selects the best subreddit for a post type, considering rules and member count
 */
export function selectSubredditForPostType(postType: string): SubredditConfig {
  const suitableSubreddits = getSubredditsForPostType(postType);

  if (suitableSubreddits.length === 0) {
    // Fallback: use educational subreddits if no suitable ones found
    const educational = getSubredditsByContentType('educational');
    if (educational.length > 0) {
      return educational[0];
    }
    // Last resort: return first subreddit
    return REDDIT_SUBREDDITS[0];
  }

  // Prefer larger communities, but prioritize those that allow self-promotion for promotional posts
  if (
    postType === 'promotional' ||
    postType === 'benefit' ||
    postType === 'feature'
  ) {
    // For promotional posts, prefer the one that explicitly allows self-promotion
    const promotional = suitableSubreddits.find(
      (sub) => sub.allowsSelfPromotion,
    );
    if (promotional) return promotional;
  }

  // Sort by member count (largest first) and return the first
  return suitableSubreddits.sort((a, b) => b.memberCount - a.memberCount)[0];
}
