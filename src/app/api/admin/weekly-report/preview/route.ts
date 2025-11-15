import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateWeeklyReport } from '@/lib/cosmic-snapshot/reports';
import {
  generateWeeklyReportEmailHTML,
  generateWeeklyReportEmailText,
} from '@/lib/weekly-report/email-template';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('email');
    const weekStartStr = searchParams.get('weekStart');

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 },
      );
    }

    let targetUserId = userId;

    if (!targetUserId && userEmail) {
      const userResult = await sql`
        SELECT user_id FROM push_subscriptions
        WHERE user_email = ${userEmail}
        AND is_active = true
        LIMIT 1
      `;
      if (userResult.rows.length > 0) {
        targetUserId = userResult.rows[0].user_id;
      } else {
        return NextResponse.json(
          { error: 'User not found with that email' },
          { status: 404 },
        );
      }
    }

    const weekStart = weekStartStr
      ? new Date(weekStartStr)
      : (() => {
          const date = new Date();
          date.setDate(date.getDate() - 6);
          date.setHours(0, 0, 0, 0);
          return date;
        })();

    const report = await generateWeeklyReport(targetUserId, weekStart);

    if (!report) {
      return NextResponse.json(
        {
          error:
            'Failed to generate report. User may not have enough snapshot data.',
        },
        { status: 404 },
      );
    }

    const userResult = await sql`
      SELECT user_email, preferences
      FROM push_subscriptions
      WHERE user_id = ${targetUserId}
      AND is_active = true
      LIMIT 1
    `;

    const userEmailFromDb = userResult.rows[0]?.user_email || userEmail;
    const preferences = userResult.rows[0]?.preferences || {};
    const userName = (preferences.name as string) || undefined;

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const emailHtml = generateWeeklyReportEmailHTML(
      report,
      userName,
      baseUrl,
      userEmailFromDb,
    );
    const emailText = generateWeeklyReportEmailText(
      report,
      userName,
      baseUrl,
      userEmailFromDb,
    );

    return NextResponse.json({
      success: true,
      report,
      email: {
        html: emailHtml,
        text: emailText,
        subject: `🌙 Your Weekly Cosmic Report`,
        to: userEmailFromDb,
      },
      user: {
        id: targetUserId,
        email: userEmailFromDb,
        name: userName,
      },
      weekStart: weekStart.toISOString(),
      weekEnd: report.weekEnd.toISOString(),
    });
  } catch (error) {
    console.error('[admin/weekly-report/preview] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
