import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { render } from '@react-email/render';
import { sendEmail } from '@/lib/email';
import {
  P,
  PersonalEmail,
  Signature,
  Cta,
} from '@/lib/email-components/PersonalEmail';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

async function renderAnnouncementEmail(
  firstName: string,
  headline: string,
  bodyText: string,
  ctaLabel: string,
  ctaHref: string,
  userEmail?: string,
): Promise<string> {
  return render(
    <PersonalEmail preview={headline} userEmail={userEmail}>
      <P>Hi {firstName},</P>
      <P>{bodyText}</P>
      <Cta href={ctaHref} label={ctaLabel} />
      <Signature />
    </PersonalEmail>,
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only run on 2026-05-06
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  if (dateString !== '2026-05-06') {
    return NextResponse.json({
      success: true,
      sent: 0,
      reason: 'not_scheduled_for_today',
      today: dateString,
    });
  }

  try {
    const users = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name
      FROM subscriptions s
      WHERE s.user_email IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
        )
      LIMIT 500
    `;

    if (users.rows.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        reason: 'no_eligible_users',
      });
    }

    let sent = 0;
    let failed = 0;

    const headline = 'New ways to explore';
    const bodyText =
      'Switch to light mode from your profile settings. Explore the Elder Futhark runes in the grimoire and see how current cosmic transits align with your reading for deeper insight.';
    const ctaLabel = 'Explore runes';
    const ctaHref = `${BASE_URL}/grimoire/runes`;

    for (const user of users.rows) {
      try {
        const firstName = user.name?.split(' ')[0] || 'there';
        const html = await renderAnnouncementEmail(
          firstName,
          headline,
          bodyText,
          ctaLabel,
          ctaHref,
          user.email,
        );

        await sendEmail({
          to: user.email,
          from: 'Sammii <hello@lunary.app>',
          replyTo: 'sammii@lunary.app',
          subject: 'Read the runes in daylight (and darkness)',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'announcement',
            notificationId: `announcement-light-mode-runes-${Date.now()}-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'announcement',
              campaign: 'light_mode_runes',
            },
          },
        });

        sent++;
      } catch (error) {
        const safeEmail = String(user.email).replace(
          /[\r\n\x00-\x1F\x7F]/g,
          '',
        );
        console.error(`[Announcement] Failed for ${safeEmail}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      subject: 'Read the runes in daylight (and darkness)',
      sent,
      failed,
      total: users.rows.length,
    });
  } catch (error) {
    console.error('[Announcement] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to send announcement' },
      { status: 500 },
    );
  }
}
