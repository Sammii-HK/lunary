import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  renderRenewal30d,
  renderRenewal7d,
  renderRenewal1d,
} from '@/lib/email-components/AnnualRenewalEmails';

export const dynamic = 'force-dynamic';

function formatRenewalDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const sent: Record<string, number> = {};
    const errors: string[] = [];

    const daysFromNow = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + n);
      return d;
    };

    // ─── 30 days before renewal ────────────────────────────────────

    const thirtyDaysOut = daysFromNow(30);
    const thirtyOneDaysOut = daysFromNow(31);

    const renewal30dUsers = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
             s.current_period_end, s.plan_type
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.status = 'active'
      AND s.is_paying = true
      AND s.plan_type LIKE '%annual%'
      AND s.current_period_end BETWEEN ${thirtyDaysOut.toISOString()} AND ${thirtyOneDaysOut.toISOString()}
      AND (s.renewal_30d_sent = false OR s.renewal_30d_sent IS NULL)
    `;

    sent.renewal_30d = 0;
    for (const user of renewal30dUsers.rows) {
      try {
        const renewalDate = formatRenewalDate(
          new Date(user.current_period_end),
        );

        const html = await renderRenewal30d({
          userName: user.name || 'there',
          renewalDate,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Your year with Lunary+, in review',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'annual_renewal',
            notificationId: `renewal-30d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'annual_renewal',
              content: '30d_review',
            },
          },
        });

        await sql`UPDATE subscriptions SET renewal_30d_sent = true WHERE user_id = ${user.user_id}`;
        sent.renewal_30d++;
      } catch (error) {
        errors.push(
          `30d → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── 7 days before renewal ─────────────────────────────────────

    const sevenDaysOut = daysFromNow(7);
    const eightDaysOut = daysFromNow(8);

    const renewal7dUsers = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
             s.current_period_end, s.plan_type
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.status = 'active'
      AND s.is_paying = true
      AND s.plan_type LIKE '%annual%'
      AND s.current_period_end BETWEEN ${sevenDaysOut.toISOString()} AND ${eightDaysOut.toISOString()}
      AND (s.renewal_7d_sent = false OR s.renewal_7d_sent IS NULL)
    `;

    sent.renewal_7d = 0;
    for (const user of renewal7dUsers.rows) {
      try {
        const renewalDate = formatRenewalDate(
          new Date(user.current_period_end),
        );

        const html = await renderRenewal7d({
          userName: user.name || 'there',
          renewalDate,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: `Your renewal is coming up on ${renewalDate}`,
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'annual_renewal',
            notificationId: `renewal-7d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'annual_renewal',
              content: '7d_whats_new',
            },
          },
        });

        await sql`UPDATE subscriptions SET renewal_7d_sent = true WHERE user_id = ${user.user_id}`;
        sent.renewal_7d++;
      } catch (error) {
        errors.push(
          `7d → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── 1 day before renewal ──────────────────────────────────────

    const oneDayOut = daysFromNow(1);
    const twoDaysOut = daysFromNow(2);

    const renewal1dUsers = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
             s.current_period_end, s.plan_type
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.status = 'active'
      AND s.is_paying = true
      AND s.plan_type LIKE '%annual%'
      AND s.current_period_end BETWEEN ${oneDayOut.toISOString()} AND ${twoDaysOut.toISOString()}
      AND (s.renewal_1d_sent = false OR s.renewal_1d_sent IS NULL)
    `;

    sent.renewal_1d = 0;
    for (const user of renewal1dUsers.rows) {
      try {
        const renewalDate = formatRenewalDate(
          new Date(user.current_period_end),
        );

        const html = await renderRenewal1d({
          userName: user.name || 'there',
          renewalDate,
          planType:
            user.plan_type === 'lunary_plus_ai_annual'
              ? 'Lunary+ AI (Yearly)'
              : 'Lunary+ (Yearly)',
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Your Lunary+ renewal is tomorrow',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'annual_renewal',
            notificationId: `renewal-1d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'annual_renewal',
              content: '1d_confirmation',
            },
          },
        });

        await sql`UPDATE subscriptions SET renewal_1d_sent = true WHERE user_id = ${user.user_id}`;
        sent.renewal_1d++;
      } catch (error) {
        errors.push(
          `1d → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    const total = Object.values(sent).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      sent: { ...sent, total },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Annual renewal reminders cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send annual renewal reminder emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
