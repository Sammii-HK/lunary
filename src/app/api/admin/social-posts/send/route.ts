import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { selectSubredditForPostType } from '@/config/reddit-subreddits';

export async function POST(request: NextRequest) {
  try {
    const { postId, content, platform, scheduledDate, imageUrl, postType } =
      await request.json();

    if (!postId || !content || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Get post type from database if not provided
    let actualPostType = postType;
    if (!actualPostType) {
      const postData = await sql`
        SELECT post_type FROM social_posts WHERE id = ${postId}
      `;
      actualPostType = postData.rows[0]?.post_type || 'benefit';
    }

    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

    if (!apiKey || !accountGroupId) {
      return NextResponse.json(
        { success: false, error: 'Succulent API not configured' },
        { status: 500 },
      );
    }

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const platforms = [platform];
    const scheduleDate = scheduledDate
      ? new Date(scheduledDate)
      : new Date(Date.now() + 15 * 60 * 1000);

    // Select appropriate Reddit subreddit if platform is Reddit
    let redditData: { title?: string; subreddit?: string } | undefined;
    if (platform === 'reddit') {
      const selectedSubreddit = selectSubredditForPostType(actualPostType);
      // Generate a Reddit-friendly title from content (first sentence or first 100 chars)
      const redditTitle =
        content.match(/^[^.!?]+[.!?]/)?.[0] ||
        content.substring(0, 100).replace(/\n/g, ' ').trim();
      redditData = {
        title: redditTitle,
        subreddit: selectedSubreddit.name,
      };
    }

    const postData: any = {
      accountGroupId,
      content,
      platforms,
      scheduledDate: scheduleDate.toISOString(),
      media: imageUrl
        ? [
            {
              type: 'image',
              url: imageUrl,
              alt: `Lunary cosmic insight - ${new Date(scheduledDate || Date.now()).toLocaleDateString()}`,
            },
          ]
        : [],
    };

    // Add Reddit-specific data if platform is Reddit
    if (redditData) {
      postData.reddit = redditData;
    }

    const succulentApiUrl = 'https://app.succulent.social/api/posts';

    const response = await fetch(succulentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(postData),
    });

    const responseData = await response.json();

    if (response.ok) {
      await sql`
        UPDATE social_posts
        SET status = 'sent', updated_at = NOW()
        WHERE id = ${postId}
      `;

      return NextResponse.json({
        success: true,
        message: 'Post sent to Succulent successfully',
        postId: responseData.data?.postId || responseData.postId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: responseData.error || `HTTP ${response.status}`,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('Error sending post to Succulent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
