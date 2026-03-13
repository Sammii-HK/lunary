import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  renderAbandonedCheckoutEmail2,
  renderAbandonedCheckoutEmail3,
} from '@/lib/email-components/AbandonedCheckoutDripEmails';

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
    const sent: Record<string, number> = {};
    const errors: string[] = [];

    // ─── Email 2: 24hr after abandoned checkout ────────────────────

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const email2Users = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name,
             s.plan_type
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.last_checkout_expired_at IS NOT NULL
      AND s.last_checkout_expired_at BETWEEN ${twoDaysAgo.toISOString()} AND ${oneDayAgo.toISOString()}
      AND s.status IN ('free', 'cancelled')
      AND (s.abandoned_checkout_email2_sent = false OR s.abandoned_checkout_email2_sent IS NULL)
    `;

    sent.email2 = 0;
    for (const user of email2Users.rows) {
      try {
        const html = await renderAbandonedCheckoutEmail2({
          userName: user.name || 'there',
          planType: user.plan_type,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Here is exactly what you get with Lunary+',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'abandoned_checkout',
            notificationId: `abandoned-checkout-email2-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'abandoned_checkout',
              content: 'email2_benefits',
            },
          },
        });

        await sql`UPDATE subscriptions SET abandoned_checkout_email2_sent = true WHERE user_id = ${user.user_id}`;
        sent.email2++;
      } catch (error) {
        errors.push(
          `Email 2 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Email 3: 72hr after abandoned checkout (coupon) ───────────

    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 96 * 60 * 60 * 1000);

    const email3Users = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.last_checkout_expired_at IS NOT NULL
      AND s.last_checkout_expired_at BETWEEN ${fourDaysAgo.toISOString()} AND ${threeDaysAgo.toISOString()}
      AND s.status IN ('free', 'cancelled')
      AND (s.abandoned_checkout_email3_sent = false OR s.abandoned_checkout_email3_sent IS NULL)
    `;

    sent.email3 = 0;
    for (const user of email3Users.rows) {
      try {
        const html = await renderAbandonedCheckoutEmail3({
          userName: user.name || 'there',
          couponCode: 'WELCOME15',
          discountPercent: 15,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Here is 15% off Lunary+, just for you',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'abandoned_checkout',
            notificationId: `abandoned-checkout-email3-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'abandoned_checkout',
              content: 'email3_coupon',
            },
          },
        });

        await sql`UPDATE subscriptions SET abandoned_checkout_email3_sent = true WHERE user_id = ${user.user_id}`;
        sent.email3++;
      } catch (error) {
        errors.push(
          `Email 3 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
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
    console.error('Abandoned checkout drip cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send abandoned checkout drip emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
