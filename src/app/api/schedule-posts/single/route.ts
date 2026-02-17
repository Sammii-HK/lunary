import { NextRequest, NextResponse } from 'next/server';
import { getImageBaseUrl } from '@/lib/urls';
import { postToSocialMultiPlatform } from '@/lib/social/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Single post scheduler started');

    const { postData } = await request.json();

    // Get the base URL for the application (dev vs prod)
    const baseUrl = getImageBaseUrl();

    // Ensure media URLs use the correct base URL
    const updatedMediaItems =
      postData.media?.map((item: any) => ({
        ...item,
        url: item.url.startsWith('http')
          ? item.url
          : `${baseUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
      })) || [];

    console.log('📤 Scheduling post via social client');
    console.log('📋 Post Data:', {
      contentLength: postData.content?.length || 0,
      platforms: postData.platforms,
      scheduledDate: postData.scheduledDate,
      media: updatedMediaItems,
    });

    const { results } = await postToSocialMultiPlatform({
      platforms: postData.platforms,
      content: postData.content,
      scheduledDate: postData.scheduledDate,
      media: updatedMediaItems,
      variants: postData.variants,
      name: postData.name,
      reddit: postData.reddit,
      pinterestOptions: postData.pinterestOptions,
      tiktokOptions: postData.tiktokOptions,
      instagramOptions: postData.instagramOptions,
      youtubeOptions: postData.youtubeOptions,
    });

    const anySuccess = Object.values(results).some((r) => r.success);

    if (anySuccess) {
      console.log('✅ Success! Post scheduled successfully');
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
            platforms: postData.platforms,
            imageUrl: updatedMediaItems?.[0]?.url,
            backends: Object.fromEntries(
              Object.entries(results).map(([p, r]) => [p, r.backend]),
            ),
          },
        ],
        postContent: postData.content,
      });
    } else {
      const firstError = Object.values(results).find((r) => r.error);
      console.error('❌ All platforms failed:', results);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to schedule post',
          error: firstError?.error || 'All platforms failed',
          summary: {
            totalPosts: 1,
            successful: 0,
            failed: 1,
          },
          results: [
            {
              date: postData.scheduledDate.split('T')[0],
              status: 'error',
              error: firstError?.error || 'All platforms failed',
            },
          ],
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('💥 Single post scheduler error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process single post',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
