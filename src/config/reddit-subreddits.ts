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
