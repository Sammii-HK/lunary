import { NextRequest, NextResponse } from 'next/server';
import {
  generateWeeklyContent,
  WeeklyCosmicData,
} from '../../../../../utils/blog/weeklyContentGenerator';
import {
  generateWeeklyNewsletterHTML,
  generateWeeklyNewsletterText,
} from '@/lib/email-templates/weekly-newsletter';
import { sendDiscordAdminNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';

// Weekly newsletter generation and distribution
export async function POST(request: NextRequest) {
  try {
    const {
      send = false,
      testEmail = null,
      customSubject = null,
      weekOffset = 0, // 0 = this week, 1 = next week, -1 = last week
    } = await request.json();

    console.log(
      `📧 Generating weekly newsletter (weekOffset: ${weekOffset}, send: ${send})`,
    );

    // Calculate target week
    const today = new Date();
    const targetDate = new Date(
      today.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
    );

    // Get start of week (Monday)
    const dayOfWeek = targetDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(
      targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
    );

    // Generate weekly cosmic content
    const weeklyData = await generateWeeklyContent(weekStart);

    // Generate newsletter content
    const newsletter = generateNewsletterHTML(weeklyData, customSubject);

    if (send) {
      // Send newsletter (implement with your preferred email service)
      const emailResult = await sendNewsletter(
        newsletter,
        testEmail,
        weeklyData,
      );

      const hasFailures =
        emailResult.recipients === 0 || (emailResult.failed ?? 0) > 0;

      if (!testEmail && hasFailures) {
        await sendDiscordAdminNotification({
          title: 'Weekly newsletter delivery issue',
          message: `Newsletter send completed with issues. Recipients: ${emailResult.recipients}. Failed: ${emailResult.failed ?? 0}.`,
          priority: 'high',
          category: 'urgent',
          dedupeKey: `weekly-newsletter-failed-${weeklyData.year}-${weeklyData.weekNumber}`,
          fields: [
            {
              name: 'Subject',
              value: newsletter.subject,
            },
            {
              name: 'Week',
              value: `Week ${weeklyData.weekNumber}, ${weeklyData.year}`,
            },
          ],
        });
      }

      return NextResponse.json({
        success: true,
        message: testEmail
          ? `Test newsletter sent to ${testEmail}`
          : `Newsletter sent to subscriber list`,
        data: {
          subject: newsletter.subject,
          recipients: emailResult.recipients,
          weekData: {
            title: weeklyData.title,
            weekNumber: weeklyData.weekNumber,
            year: weeklyData.year,
            majorEvents:
              weeklyData.planetaryHighlights.length +
              weeklyData.retrogradeChanges.length,
          },
        },
      });
    }

    // Return newsletter preview
    return NextResponse.json({
      success: true,
      preview: true,
      newsletter: {
        subject: newsletter.subject,
        html: newsletter.html,
        text: newsletter.text,
        metadata: {
          weekStart: weeklyData.weekStart,
          weekEnd: weeklyData.weekEnd,
          weekNumber: weeklyData.weekNumber,
          year: weeklyData.year,
          contentSummary: {
            planetaryHighlights: weeklyData.planetaryHighlights.length,
            retrogradeChanges: weeklyData.retrogradeChanges.length,
            majorAspects: weeklyData.majorAspects.length,
            moonPhases: weeklyData.moonPhases.length,
          },
        },
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Newsletter generation error:', {
      message: errorMessage,
      stack: errorStack,
    });
    try {
      await sendDiscordAdminNotification({
        title: 'Weekly newsletter failed',
        message: `Newsletter generation or send failed. Error: ${errorMessage}`,
        priority: 'emergency',
        category: 'urgent',
        dedupeKey: `weekly-newsletter-error-${new Date().toISOString().slice(0, 10)}`,
      });
    } catch (discordError) {
      console.error('Failed to send Discord urgent alert:', discordError);
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate newsletter',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// GET endpoint for newsletter preview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get('week') || '0');

    // Generate preview without sending — use absolute URL with trusted base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
    const response = await fetch(`${baseUrl}/api/newsletter/weekly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ send: false, weekOffset }),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Preview generation failed' },
      { status: 500 },
    );
  }
}

function generateNewsletterHTML(
  data: WeeklyCosmicData,
  customSubject?: string,
): { subject: string; html: string; text: string } {
  const weekRange = `${data.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${data.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const subject = customSubject || `${data.title} | ${weekRange}`;
  const html = generateWeeklyNewsletterHTML(data, subject);
  const text = generateWeeklyNewsletterText(data, subject);

  return { subject, html, text };
}

function generateTextNewsletter(
  data: WeeklyCosmicData,
  subject: string,
  unsubscribeUrl?: string,
): string {
  return generateWeeklyNewsletterText(data, subject, unsubscribeUrl);
}

async function sendNewsletter(
  newsletter: { subject: string; html: string; text: string },
  testEmail?: string,
  weeklyData?: any,
) {
  const { sendEmail } = await import('@/lib/email');
  const { sql } = await import('@vercel/postgres');

  type BatchEmailResult = {
    success: number;
    failed: number;
    total: number;
    errors: Array<{ email: string; error: string }>;
  };

  console.log(`📧 Sending newsletter: "${newsletter.subject}"`);
  console.log(`📊 HTML length: ${newsletter.html.length} chars`);
  console.log(`📊 Text length: ${newsletter.text.length} chars`);
  const sendDate = new Date().toISOString().split('T')[0];

  // Test email - send to single recipient
  if (testEmail) {
    console.log(`🧪 Test mode: sending to ${testEmail}`);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
      const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(testEmail)}`;
      const personalizedHtml = newsletter.html.replace(
        /{{UNSUBSCRIBE_URL}}/g,
        unsubscribeUrl,
      );
      const personalizedText = weeklyData
        ? generateTextNewsletter(weeklyData, newsletter.subject, unsubscribeUrl)
        : newsletter.text;

      await sendEmail({
        to: testEmail,
        subject: newsletter.subject,
        html: personalizedHtml,
        text: personalizedText,
        tracking: {
          userId: testEmail,
          notificationType: 'weekly_report',
          notificationId: `weekly-${sendDate}-test`,
          utm: {
            source: 'email',
            medium: 'newsletter',
            campaign: 'weekly_report_test',
          },
        },
      });
      return {
        recipients: 1,
        success: 1,
        failed: 0,
        testMode: true,
        email: testEmail,
      };
    } catch (error) {
      console.error('Test email failed:', error);
      return {
        recipients: 1,
        success: 0,
        failed: 1,
        testMode: true,
        email: testEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Production: Get active verified subscribers
  try {
    const subscribers = await sql`
      SELECT email 
      FROM newsletter_subscribers 
      WHERE is_active = true 
      AND is_verified = true
      AND preferences->>'weeklyNewsletter' = 'true'
      ORDER BY created_at ASC
    `;

    const emailList = subscribers.rows.map((row) => row.email);

    if (emailList.length === 0) {
      console.log('📭 No active subscribers found');
      return {
        recipients: 0,
        success: 0,
        failed: 0,
        testMode: false,
        note: 'No active subscribers',
      };
    }

    console.log(`📬 Sending to ${emailList.length} subscribers`);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

    // Replace unsubscribe URLs per email
    const personalizedEmails = emailList.map((email) => {
      const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
      const personalizedHtml = newsletter.html.replace(
        /{{UNSUBSCRIBE_URL}}/g,
        unsubscribeUrl,
      );
      const personalizedText = generateTextNewsletter(
        weeklyData,
        newsletter.subject,
        unsubscribeUrl,
      );

      return {
        email,
        html: personalizedHtml,
        text: personalizedText,
      };
    });

    // Send emails individually to personalize unsubscribe links
    const results = await Promise.allSettled(
      personalizedEmails.map(({ email, html, text }) =>
        sendEmail({
          to: email,
          subject: newsletter.subject,
          html,
          text,
          tracking: {
            userId: email,
            notificationType: 'weekly_report',
            notificationId: `weekly-${sendDate}-${email}`,
            utm: {
              source: 'email',
              medium: 'newsletter',
              campaign: 'weekly_report',
            },
          },
        }),
      ),
    );

    const success = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    const errors = results
      .map((r, i) => {
        if (r.status === 'rejected') {
          return {
            email: emailList[i],
            error: r.reason?.message || 'Unknown error',
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ email: string; error: string }>;

    const result = {
      success,
      failed,
      total: emailList.length,
      errors,
    };

    // Update last_email_sent and increment email_count for successful sends
    if (typeof result === 'object' && 'success' in result) {
      const batchResult = result as BatchEmailResult;

      // Update subscriber records
      const updatePromises = emailList.map(
        (email) =>
          sql`
          UPDATE newsletter_subscribers 
          SET 
            last_email_sent = NOW(),
            email_count = email_count + 1
          WHERE email = ${email}
        `,
      );

      await Promise.allSettled(updatePromises);

      return {
        recipients: emailList.length,
        success: batchResult.success,
        failed: batchResult.failed,
        errors: batchResult.errors,
        testMode: false,
      };
    }

    return {
      recipients: emailList.length,
      success: emailList.length,
      failed: 0,
      testMode: false,
    };
  } catch (error) {
    console.error('Newsletter sending failed:', error);
    throw error;
  }
}
