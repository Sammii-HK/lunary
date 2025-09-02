import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { postData, succulentApiUrl, testMode } = await request.json();

    // Get environment variables
    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

    if (!apiKey || !accountGroupId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing Succulent API configuration',
          error:
            'SUCCULENT_SECRET_KEY or SUCCULENT_ACCOUNT_GROUP_ID not found in environment variables',
        },
        { status: 500 },
      );
    }

    // Use real account group ID and pass image URL directly
    const finalPostData = {
      ...postData,
      accountGroupId,
    };

    console.log('📤 Sending to Succulent:', succulentApiUrl);
    console.log('📋 Post Data (content preview):', {
      ...finalPostData,
      content: finalPostData.content.substring(0, 100) + '...',
      mediaItems: finalPostData.mediaItems,
    });

    // Send to Succulent API - let Succulent handle the image URL
    const response = await fetch(succulentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(finalPostData),
    });

    const responseData = await response.json();
    console.log('📨 Succulent Response:', response.status, responseData);

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: `Today's cosmic post scheduled successfully!`,
        summary: {
          totalPosts: 1,
          successful: 1,
          failed: 0,
          scheduledFor: postData.scheduledDate,
        },
        results: [
          {
            date: postData.scheduledDate.split('T')[0],
            status: 'success',
            postId: responseData.data?.postId || 'unknown',
            platforms: postData.platforms,
            imageUrl: finalPostData.mediaItems?.[0]?.url,
          },
        ],
        postContent: postData.content,
        succulentResponse: responseData,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to schedule post to Succulent',
          error: responseData.error || 'Unknown error',
          summary: {
            totalPosts: 1,
            successful: 0,
            failed: 1,
          },
          results: [
            {
              date: postData.scheduledDate.split('T')[0],
              status: 'error',
              error: responseData.error || `HTTP ${response.status}`,
            },
          ],
          succulentResponse: responseData,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('Single post scheduler error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process single post',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
