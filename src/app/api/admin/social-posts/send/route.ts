import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { selectSubredditForPostType } from '@/config/reddit-subreddits';

export async function POST(request: NextRequest) {
  try {
    const { postId, content, platform, scheduledDate, imageUrl, postType } =
      await request.json();

    if (!postId || !platform) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: postId and platform',
        },
        { status: 400 },
      );
    }

    // Get post data from database (including any edits)
    const postDataFromDb = await sql`
      SELECT content, post_type, scheduled_date, image_url
      FROM social_posts WHERE id = ${postId}
    `;

    if (postDataFromDb.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 },
      );
    }

    // Use content from request if provided, otherwise use from DB (which may have been edited)
    const actualContent = content || postDataFromDb.rows[0].content;
    const actualPostType =
      postType || postDataFromDb.rows[0].post_type || 'benefit';
    const actualScheduledDate =
      scheduledDate || postDataFromDb.rows[0].scheduled_date;
    const actualImageUrl = imageUrl || postDataFromDb.rows[0].image_url;

    if (!actualContent || actualContent.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Post content is empty' },
        { status: 400 },
      );
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

    // Parse scheduled date
    let scheduleDate: Date;
    if (actualScheduledDate) {
      scheduleDate = new Date(actualScheduledDate);
      if (isNaN(scheduleDate.getTime())) {
        console.warn(
          'Invalid scheduled date, using default:',
          actualScheduledDate,
        );
        scheduleDate = new Date(Date.now() + 15 * 60 * 1000);
      }
    } else {
      scheduleDate = new Date(Date.now() + 15 * 60 * 1000);
    }

    // Select appropriate Reddit subreddit if platform is Reddit
    let redditData: { title?: string; subreddit?: string } | undefined;
    if (platform === 'reddit') {
      const selectedSubreddit = selectSubredditForPostType(actualPostType);
      // Generate a Reddit-friendly title from content (first sentence or first 100 chars)
      const redditTitle =
        actualContent.match(/^[^.!?]+[.!?]/)?.[0] ||
        actualContent.substring(0, 100).replace(/\n/g, ' ').trim();
      redditData = {
        title: redditTitle,
        subreddit: selectedSubreddit.name,
      };
    }

    // Ensure accountGroupId is a string
    const accountGroupIdStr = String(accountGroupId).trim();
    if (!accountGroupIdStr) {
      return NextResponse.json(
        { success: false, error: 'Invalid accountGroupId' },
        { status: 500 },
      );
    }

    // Validate platform is a valid string
    const platformStr = String(platform).toLowerCase().trim();
    const validPlatforms = [
      'twitter',
      'instagram',
      'facebook',
      'linkedin',
      'pinterest',
      'reddit',
      'tiktok',
    ];
    if (!validPlatforms.includes(platformStr)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Build media array - ensure URLs use canonical lunary.app (non-www) domain
    const mediaArray = actualImageUrl
      ? [
          {
            type: 'image' as const,
            url: String(actualImageUrl).trim(),
            alt: `Lunary cosmic insight - ${scheduleDate.toLocaleDateString()}`,
          },
        ]
      : [];

    // Pinterest requires media - validate before proceeding
    if (platformStr === 'pinterest' && mediaArray.length === 0) {
      console.warn(
        '⚠️ Pinterest requires media but none provided. Skipping Pinterest.',
      );
      return NextResponse.json(
        {
          success: false,
          error:
            'Pinterest requires an image or video. Please provide media for Pinterest posts.',
        },
        { status: 400 },
      );
    }

    // Format date for readable title (e.g., "Nov 23, 2025 at 2:00 PM")
    const formattedDate = scheduleDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = scheduleDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const readableDate = `${formattedDate} at ${formattedTime}`;

    const postData: any = {
      accountGroupId: accountGroupIdStr,
      name: `Lunary ${platformStr.charAt(0).toUpperCase() + platformStr.slice(1)} Post - ${readableDate}`,
      content: actualContent.trim(),
      platforms: [platformStr],
      scheduledDate: scheduleDate.toISOString(),
      media: mediaArray,
    };

    // Add Reddit-specific data if platform is Reddit
    if (redditData) {
      postData.reddit = redditData;
    }

    // Add Pinterest-specific options if platform is Pinterest
    if (platformStr === 'pinterest') {
      const pinterestBoardId =
        process.env.SUCCULENT_PINTEREST_BOARD_ID || 'lunaryapp/lunary';
      const pinterestBoardName =
        process.env.SUCCULENT_PINTEREST_BOARD_NAME || 'Lunary';
      postData.pinterestOptions = {
        boardId: pinterestBoardId,
        boardName: pinterestBoardName,
      };
    }

    const succulentApiUrl = 'https://app.succulent.social/api/posts';

    // Validate and stringify JSON
    let jsonBody: string;
    try {
      jsonBody = JSON.stringify(postData);
      console.log('📤 Sending to Succulent:', {
        url: succulentApiUrl,
        postData: JSON.parse(jsonBody), // Parse back to log nicely
        jsonLength: jsonBody.length,
      });
    } catch (jsonError) {
      console.error('❌ Failed to stringify post data:', jsonError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to serialize post data: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`,
        },
        { status: 500 },
      );
    }

    const response = await fetch(succulentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: jsonBody,
    });

    let responseData;
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Succulent response:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        responseText: responseText.substring(0, 500),
      });
      return NextResponse.json(
        {
          success: false,
          error: `Invalid JSON response from Succulent: ${responseText.substring(0, 200)}`,
        },
        { status: 500 },
      );
    }

    console.log('📥 Succulent response:', {
      status: response.status,
      data: responseData,
    });

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
          error:
            responseData.error ||
            responseData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
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
