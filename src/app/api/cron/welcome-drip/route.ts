import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import { formatDate } from '@/lib/analytics/date-range';
import {
  renderWelcomeDay2,
  renderWelcomeDay5,
} from '@/lib/email-components/WelcomeSeriesEmails';

export const dynamic = 'force-dynamic';

function extractSunSign(birthChart: unknown): string | undefined {
  if (!Array.isArray(birthChart)) return undefined;
  for (const placement of birthChart) {
    if (typeof placement !== 'object' || !placement) continue;
    const body = (placement as Record<string, unknown>).body as string;
    const sign = (placement as Record<string, unknown>).sign as string;
    if (body === 'Sun' && sign) return sign;
  }
  return undefined;
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sent: Record<string, number> = {};
    const errors: string[] = [];

    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d;
    };

    // ─── Day 2: "Your cosmic toolkit" ──────────────────────────────

    const day2Date = daysAgo(2);
    const day2Users = await sql.query(
      `SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
              up.birth_chart
       FROM subscriptions s
       LEFT JOIN user_profiles up ON s.user_id = up.user_id
       WHERE s.user_email IS NOT NULL
       AND DATE(s.created_at) = $1
       AND (s.welcome_day2_sent = false OR s.welcome_day2_sent IS NULL)`,
      [formatDate(day2Date)],
    );

    sent.day2 = 0;
    for (const user of day2Users.rows) {
      try {
        const sunSign = extractSunSign(user.birth_chart);

        const html = await renderWelcomeDay2({
          userName: user.name || 'there',
          sunSign,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Your cosmic toolkit: 5 things Lunary gives you',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'welcome_series',
            notificationId: `welcome-day2-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'welcome_series',
              content: 'day2',
            },
          },
        });

        await sql`UPDATE subscriptions SET welcome_day2_sent = true WHERE user_id = ${user.user_id}`;
        sent.day2++;
      } catch (error) {
        errors.push(
          `Day 2 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 5: "Unlock your full picture" ─────────────────────────

    const day5Date = daysAgo(5);
    const day5Users = await sql.query(
      `SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
              up.birth_chart
       FROM subscriptions s
       LEFT JOIN user_profiles up ON s.user_id = up.user_id
       WHERE s.user_email IS NOT NULL
       AND s.status = 'free'
       AND DATE(s.created_at) = $1
       AND (s.welcome_day5_sent = false OR s.welcome_day5_sent IS NULL)`,
      [formatDate(day5Date)],
    );

    sent.day5 = 0;
    for (const user of day5Users.rows) {
      try {
        const sunSign = extractSunSign(user.birth_chart);

        const html = await renderWelcomeDay5({
          userName: user.name || 'there',
          sunSign,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Here is what you are missing on the free tier',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'welcome_series',
            notificationId: `welcome-day5-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'welcome_series',
              content: 'day5',
            },
          },
        });

        await sql`UPDATE subscriptions SET welcome_day5_sent = true WHERE user_id = ${user.user_id}`;
        sent.day5++;
      } catch (error) {
        errors.push(
          `Day 5 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
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
    console.error('Welcome drip cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send welcome drip emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
