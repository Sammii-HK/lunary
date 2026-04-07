/**
 * POST /api/broadcast
 *
 * Manually triggered by Sammii when a meaningful update ships.
 * Sends a personal "something changed" email to all activated users.
 *
 * Body:
 *   subject    — email subject (sentence case, no em dashes)
 *   headline   — one-line announcement (shown in preview + first line)
 *   body       — main copy (2–4 sentences, plain language)
 *   ctaLabel   — link label, e.g. "See what's new"
 *   ctaPath    — app path, e.g. "/app" or "/changelog"
 *
 * Auth: Bearer CRON_SECRET header (same secret as cron jobs)
 * Rate: No dedup — caller is responsible for not spamming.
 */
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

interface BroadcastBody {
  subject: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaPath?: string;
}

async function renderBroadcastEmail(
  firstName: string,
  headline: string,
  bodyText: string,
  ctaLabel: string | undefined,
  ctaHref: string | undefined,
  userEmail?: string,
): Promise<string> {
  return render(
    <PersonalEmail preview={headline} userEmail={userEmail}>
      <P>Hi {firstName},</P>
      <P>{bodyText}</P>
      {ctaLabel && ctaHref ? <Cta href={ctaHref} label={ctaLabel} /> : null}
      <Signature />
    </PersonalEmail>,
  );
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let broadcastBody: BroadcastBody;
  try {
    broadcastBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    subject,
    headline,
    body: bodyText,
    ctaLabel,
    ctaPath,
  } = broadcastBody;

  if (!subject || !headline || !bodyText) {
    return NextResponse.json(
      { error: 'subject, headline, and body are required' },
      { status: 400 },
    );
  }

  const ctaHref = ctaPath ? `${BASE_URL}${ctaPath}` : undefined;

  // All activated users (at least one real session)
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

  for (const user of users.rows) {
    try {
      const firstName = user.name?.split(' ')[0] || 'there';
      const html = await renderBroadcastEmail(
        firstName,
        headline,
        bodyText,
        ctaLabel,
        ctaHref,
        user.email,
      );

      await sendEmail({
        to: user.email,
        from: 'Sammii <sammii@lunary.app>',
        subject,
        html,
        tracking: {
          userId: user.user_id,
          notificationType: 'broadcast',
          notificationId: `broadcast-${Date.now()}-${user.user_id}`,
          utm: {
            source: 'email',
            medium: 'broadcast',
            campaign: 'product_update',
          },
        },
      });

      sent++;
    } catch (error) {
      console.error(`[Broadcast] Failed for ${user.email}:`, error);
      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    subject,
    sent,
    failed,
    total: users.rows.length,
  });
}
