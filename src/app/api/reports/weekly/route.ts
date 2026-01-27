import { NextRequest, NextResponse } from 'next/server';
import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import {
  generateWeeklyReport,
  WeeklyReport,
} from '@/lib/cosmic-snapshot/reports';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireUser(request);

    if (!user.birthday) {
      return NextResponse.json(
        {
          error: 'Birthday required',
          message: 'Please add your birthday to view weekly reports',
        },
        { status: 400 },
      );
    }

    // Generate reports for the last 4 weeks
    const reports: WeeklyReport[] = [];
    const today = new Date();

    for (let i = 0; i < 4; i++) {
      // Calculate the start of each week (Sunday)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);

      const report = await generateWeeklyReport(user.id, weekStart);
      if (report) {
        reports.push(report);
      }
    }

    return NextResponse.json({
      success: true,
      reports,
      count: reports.length,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Weekly reports API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch reports',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
