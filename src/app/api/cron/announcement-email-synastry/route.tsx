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

  // Only run on 2026-04-22
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  if (dateString !== '2026-04-22') {
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

    const headline = 'Cosmic compatibility revealed';
    const bodyText =
      'Share your birth chart with friends and explore your cosmic compatibility through synastry. Discover planetary connections that reveal attraction, challenges, and growth potential.';
    const ctaLabel = 'View synastry guide';
    const ctaHref = `${BASE_URL}/grimoire/synastry/aspects`;

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
          subject: 'See how your chart connects with friends',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'announcement',
            notificationId: `announcement-synastry-${Date.now()}-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'announcement',
              campaign: 'synastry',
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
      subject: 'See how your chart connects with friends',
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
