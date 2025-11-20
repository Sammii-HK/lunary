import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentActivity,
  getActivityByType,
  getActivityStats,
  ActivityType,
} from '@/lib/admin-activity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ActivityType | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const stats = searchParams.get('stats') === 'true';
    const days = parseInt(searchParams.get('days') || '7');

    if (stats) {
      const statsData = await getActivityStats(days);
      return NextResponse.json({
        success: true,
        stats: statsData,
        days,
      });
    }

    if (type) {
      const activities = await getActivityByType(type, limit);
      return NextResponse.json({
        success: true,
        activities,
        type,
        limit,
      });
    }

    const activities = await getRecentActivity(limit);
    return NextResponse.json({
      success: true,
      activities: activities || [],
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch admin activity:', error);
    // Return success with empty array instead of 500 error
    return NextResponse.json({
      success: true,
      activities: [],
      limit: 50,
      error:
        error instanceof Error ? error.message : 'Failed to fetch activity',
    });
  }
}
