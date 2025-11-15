import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateWeeklyReport } from '@/lib/cosmic-snapshot/reports';
import {
  generateWeeklyReportEmailHTML,
  generateWeeklyReportEmailText,
} from '@/lib/weekly-report/email-template';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const dayOfWeek = now.getDay();

    if (dayOfWeek !== 0) {
      return NextResponse.json({
        success: true,
        message: 'Not Sunday, skipping weekly report',
        dayOfWeek,
      });
    }

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const dateStr = now.toISOString().split('T')[0];
    const eventKey = `weekly-report-${dateStr}`;

    const alreadySent = await sql`
      SELECT id FROM notification_sent_events 
      WHERE date = ${dateStr}::date 
      AND event_key = ${eventKey}
    `;

    if (alreadySent.rows.length > 0) {
      console.log('[weekly-report] Already sent today, skipping');
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        message: 'Already sent today',
        date: dateStr,
      });
    }

    const subscriptions = await sql`
      SELECT DISTINCT user_id, user_email, preferences
      FROM push_subscriptions
      WHERE is_active = true
      AND (
        preferences->>'weeklyReport' = 'true'
        OR preferences->>'weeklyReport' IS NULL
      )
      AND (
        preferences->>'birthday' IS NOT NULL 
        AND preferences->>'birthday' != ''
      )
    `;

    if (subscriptions.rows.length === 0) {
      console.log('[weekly-report] No subscribers found');
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        message: 'No subscribers for weekly report',
      });
    }

    console.log(
      `[weekly-report] Generating reports for ${subscriptions.rows.length} subscribers`,
    );

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const sub of subscriptions.rows) {
      try {
        const userId = sub.user_id;
        const userEmail = sub.user_email;
        const preferences = sub.preferences || {};
        const userName = (preferences.name as string) || undefined;

        if (!userEmail || !userId) {
          continue;
        }

        const report = await generateWeeklyReport(userId, weekStart);

        if (!report) {
          console.log(`⚠️ Failed to generate report for ${userId}`);
          continue;
        }

        const baseUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://lunary.app'
            : 'http://localhost:3000';

        const emailHtml = generateWeeklyReportEmailHTML(
          report,
          userName,
          baseUrl,
          userEmail,
        );
        const emailText = generateWeeklyReportEmailText(
          report,
          userName,
          baseUrl,
          userEmail,
        );

        await sendEmail({
          to: userEmail,
          subject: `🌙 Your Weekly Cosmic Report`,
          html: emailHtml,
          text: emailText,
        });

        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send weekly report to ${sub.user_email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    if (emailsSent > 0) {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${dateStr}::date, ${eventKey}, 'weekly_report', 'Weekly Cosmic Report', 5, 'weekly')
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    }

    console.log(
      `[weekly-report] Completed: ${emailsSent} sent, ${emailsFailed} failed`,
    );

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsFailed,
      totalSubscribers: subscriptions.rows.length,
      date: dateStr,
    });
  } catch (error) {
    console.error('[weekly-report] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send weekly reports',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
