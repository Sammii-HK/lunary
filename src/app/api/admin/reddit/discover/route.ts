import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateFetchUrl } from '@/lib/utils';
import { SUBREDDIT_TONES } from '@/lib/social/platform-strategies/reddit';

/** Allow-list of subreddit names we fetch from */
const ALLOWED_SUBREDDITS = new Set(Object.keys(SUBREDDIT_TONES));

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  numComments: number;
  url: string;
  permalink: string;
  created: number;
  flair?: string;
  subreddit: string;
}

/**
 * GET — Discover recent Reddit posts from target subreddits
 *
 * Query params:
 *   subreddit: string (must be in allow-list)
 *   sort: 'new' | 'hot' | 'rising' (default: 'new')
 *   limit: number (default: 15, max: 25)
 */
export async function GET(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get('subreddit') || 'astrology';
    const sort = searchParams.get('sort') || 'new';
    const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 25);

    // Validate subreddit against allow-list
    if (!ALLOWED_SUBREDDITS.has(subreddit)) {
      return NextResponse.json(
        { error: `Subreddit "${subreddit}" is not in the allow-list` },
        { status: 400 },
      );
    }

    // Validate sort parameter
    const allowedSorts = new Set(['new', 'hot', 'rising']);
    const safeSort = allowedSorts.has(sort) ? sort : 'new';

    // Build and validate the Reddit JSON URL
    const redditUrl = validateFetchUrl(
      `https://www.reddit.com/r/${subreddit}/${safeSort}.json?limit=${limit}&raw_json=1`,
    );

    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'lunary-admin/1.0 (content-discovery)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Reddit returned ${response.status}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const children = data?.data?.children || [];

    const posts: RedditPost[] = children
      .filter((child: any) => child.kind === 't3')
      .map((child: any) => {
        const post = child.data;
        return {
          id: post.id,
          title: post.title,
          selftext: (post.selftext || '').substring(0, 500),
          author: post.author,
          score: post.score,
          numComments: post.num_comments,
          url: post.url,
          permalink: `https://www.reddit.com${post.permalink}`,
          created: post.created_utc,
          flair: post.link_flair_text || undefined,
          subreddit,
        };
      });

    return NextResponse.json({
      success: true,
      subreddit,
      sort: safeSort,
      posts,
    });
  } catch (error) {
    console.error('[Reddit Discover] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Reddit posts' },
      { status: 500 },
    );
  }
}
