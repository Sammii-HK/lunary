import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { postId, content, platform, scheduledDate, imageUrl } =
      await request.json();

    if (!postId || !content || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
    const scheduleDate = scheduledDate
      ? new Date(scheduledDate)
      : new Date(Date.now() + 15 * 60 * 1000);

    const postData = {
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
