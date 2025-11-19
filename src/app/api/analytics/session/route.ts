import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { trackActivity } from '@/lib/analytics/tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pagePath, metadata } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    // Write to analytics_user_activity for session tracking and DAU/WAU/MAU calculations
    await trackActivity({
      userId,
      activityType: 'session',
      metadata: {
        page_path: pagePath,
        ...(metadata || {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
