import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import { formatDate } from '@/lib/analytics/date-range';
import {
  renderPostUpgradeDay3,
  renderPostUpgradeDay7,
} from '@/lib/email-components/PostUpgradeEmails';

export const dynamic = 'force-dynamic';

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

    // ─── Day 3: "Have you tried these yet?" ────────────────────────

    const day3Date = daysAgo(3);
    const day3Users = await sql.query(
      `SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name
       FROM subscriptions s
       WHERE s.user_email IS NOT NULL
       AND s.status = 'active'
       AND s.is_paying = true
       AND DATE(s.updated_at) = $1
       AND (s.post_upgrade_day3_sent = false OR s.post_upgrade_day3_sent IS NULL)`,
      [formatDate(day3Date)],
    );

    sent.day3 = 0;
    for (const user of day3Users.rows) {
      try {
        const html = await renderPostUpgradeDay3({
          userName: user.name || 'there',
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: '3 premium features worth exploring this week',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'post_upgrade',
            notificationId: `post-upgrade-day3-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'post_upgrade',
              content: 'day3_features',
            },
          },
        });

        await sql`UPDATE subscriptions SET post_upgrade_day3_sent = true WHERE user_id = ${user.user_id}`;
        sent.day3++;
      } catch (error) {
        errors.push(
          `Day 3 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Day 7: "Your first week in review" ────────────────────────

    const day7Date = daysAgo(7);
    const day7Users = await sql.query(
      `SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name
       FROM subscriptions s
       WHERE s.user_email IS NOT NULL
       AND s.status = 'active'
       AND s.is_paying = true
       AND DATE(s.updated_at) = $1
       AND (s.post_upgrade_day7_sent = false OR s.post_upgrade_day7_sent IS NULL)`,
      [formatDate(day7Date)],
    );

    sent.day7 = 0;
    for (const user of day7Users.rows) {
      try {
        // Count active days in the last 7 days
        const activityResult = await sql`
          SELECT COUNT(DISTINCT DATE(created_at)) as days_active
          FROM conversion_events
          WHERE user_id = ${user.user_id}
          AND event_type = 'app_opened'
          AND created_at >= NOW() - INTERVAL '7 days'
        `;
        const daysActive = activityResult.rows[0]?.days_active ?? 0;

        const html = await renderPostUpgradeDay7({
          userName: user.name || 'there',
          daysActive: Number(daysActive),
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Your first week with Lunary+, in numbers',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'post_upgrade',
            notificationId: `post-upgrade-day7-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'post_upgrade',
              content: 'day7_review',
            },
          },
        });

        await sql`UPDATE subscriptions SET post_upgrade_day7_sent = true WHERE user_id = ${user.user_id}`;
        sent.day7++;
      } catch (error) {
        errors.push(
          `Day 7 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
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
    console.error('Post-upgrade onboarding cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send post-upgrade onboarding emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
