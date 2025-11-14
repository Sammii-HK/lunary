import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import {
  generateFreeSubstackPost,
  generatePaidSubstackPost,
} from '../../../../../utils/substack/contentFormatter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get('week') || '0');

    const today = new Date();
    const targetDate = new Date(
      today.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
    );

    const dayOfWeek = targetDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(
      targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
    );

    const weeklyData = await generateWeeklyContent(weekStart);
    const freePost = generateFreeSubstackPost(weeklyData);
    const paidPost = generatePaidSubstackPost(weeklyData);

    return NextResponse.json({
      success: true,
      free: freePost,
      paid: paidPost,
      metadata: {
        weekStart: weeklyData.weekStart,
        weekEnd: weeklyData.weekEnd,
        weekNumber: weeklyData.weekNumber,
        freeWordCount: freePost.content.split(/\s+/).length,
        paidWordCount: paidPost.content.split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
