import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  renderBrowseAbandonEmail1,
  renderBrowseAbandonEmail2,
  renderBrowseAbandonEmail3,
} from '@/lib/email-components/BrowseAbandonEmails';

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

    // ─── Email 1: 24hr after pricing page view ────────────────────

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const email1Users = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.last_pricing_viewed_at IS NOT NULL
      AND s.last_pricing_viewed_at BETWEEN ${twoDaysAgo.toISOString()} AND ${oneDayAgo.toISOString()}
      AND s.status IN ('free', 'trial')
      AND s.is_paying = false
      AND s.last_checkout_expired_at IS NULL
      AND (s.browse_abandon_email1_sent = false OR s.browse_abandon_email1_sent IS NULL)
    `;

    sent.email1 = 0;
    for (const user of email1Users.rows) {
      try {
        const html = await renderBrowseAbandonEmail1({
          userName: user.name || 'there',
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Still thinking about Lunary+?',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'browse_abandon',
            notificationId: `browse-abandon-email1-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'browse_abandon',
              content: 'email1_comparison',
            },
          },
        });

        await sql`UPDATE subscriptions SET browse_abandon_email1_sent = true WHERE user_id = ${user.user_id}`;
        sent.email1++;
      } catch (error) {
        errors.push(
          `Email 1 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Email 2: 72hr after pricing page view (social proof) ─────

    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 96 * 60 * 60 * 1000);

    const email2Users = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.last_pricing_viewed_at IS NOT NULL
      AND s.last_pricing_viewed_at BETWEEN ${fourDaysAgo.toISOString()} AND ${threeDaysAgo.toISOString()}
      AND s.status IN ('free', 'trial')
      AND s.is_paying = false
      AND s.last_checkout_expired_at IS NULL
      AND (s.browse_abandon_email2_sent = false OR s.browse_abandon_email2_sent IS NULL)
    `;

    sent.email2 = 0;
    for (const user of email2Users.rows) {
      try {
        const html = await renderBrowseAbandonEmail2({
          userName: user.name || 'there',
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'You are not alone in your curiosity',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'browse_abandon',
            notificationId: `browse-abandon-email2-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'browse_abandon',
              content: 'email2_social_proof',
            },
          },
        });

        await sql`UPDATE subscriptions SET browse_abandon_email2_sent = true WHERE user_id = ${user.user_id}`;
        sent.email2++;
      } catch (error) {
        errors.push(
          `Email 2 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // ─── Email 3: 7 days after pricing page view (10% off) ────────

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    const email3Users = await sql`
      SELECT DISTINCT s.user_id, s.user_email as email, s.user_name as name
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
      AND s.last_pricing_viewed_at IS NOT NULL
      AND s.last_pricing_viewed_at BETWEEN ${eightDaysAgo.toISOString()} AND ${sevenDaysAgo.toISOString()}
      AND s.status IN ('free', 'trial')
      AND s.is_paying = false
      AND s.last_checkout_expired_at IS NULL
      AND (s.browse_abandon_email3_sent = false OR s.browse_abandon_email3_sent IS NULL)
    `;

    sent.email3 = 0;
    for (const user of email3Users.rows) {
      try {
        const html = await renderBrowseAbandonEmail3({
          userName: user.name || 'there',
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'A small thank you for your interest',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'browse_abandon',
            notificationId: `browse-abandon-email3-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'browse_abandon',
              content: 'email3_coupon',
            },
          },
        });

        await sql`UPDATE subscriptions SET browse_abandon_email3_sent = true WHERE user_id = ${user.user_id}`;
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
    console.error('Browse abandon cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send browse abandon emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
