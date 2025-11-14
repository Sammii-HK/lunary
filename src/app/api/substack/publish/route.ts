import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import {
  generateFreeSubstackPost,
  generatePaidSubstackPost,
} from '../../../../../utils/substack/contentFormatter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      weekOffset = 0,
      publishFree = true,
      publishPaid = true,
    } = await request.json();

    const today = new Date();
    const targetDate = new Date(
      today.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
    );

    const dayOfWeek = targetDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(
      targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
    );

    console.log(
      `📅 Generating Substack posts for week starting ${weekStart.toDateString()}`,
    );

    const weeklyData = await generateWeeklyContent(weekStart);
    const freePost = generateFreeSubstackPost(weeklyData);
    const paidPost = generatePaidSubstackPost(weeklyData);

    const { publishBothTiers, publishToSubstack } = await import(
      '../../../../../utils/substack/publisher'
    );

    let results;

    if (publishFree && publishPaid) {
      results = await publishBothTiers(freePost, paidPost);
    } else if (publishFree) {
      results = {
        free: await publishToSubstack(freePost, 'free'),
        paid: { success: false, tier: 'paid' as const, error: 'Skipped' },
      };
    } else if (publishPaid) {
      results = {
        free: { success: false, tier: 'free' as const, error: 'Skipped' },
        paid: await publishToSubstack(paidPost, 'paid'),
      };
    } else {
      return NextResponse.json(
        { error: 'Must specify at least one tier to publish' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      results,
      posts: {
        free: freePost,
        paid: paidPost,
      },
      metadata: {
        weekStart: weeklyData.weekStart,
        weekEnd: weeklyData.weekEnd,
        weekNumber: weeklyData.weekNumber,
      },
    });
  } catch (error) {
    console.error('Error publishing to Substack:', error);
    return NextResponse.json(
      {
        error: 'Failed to publish to Substack',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
