import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Max per run — keeps 50/day headroom for transactional emails on Resend free tier
const MAX_PER_RUN = 50;

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // Fetch users who were restored (updatedAt = 2026-03-09) with no active session
  // and haven't been sent a reactivation email yet (no reactivation event in last 7 days)
  const { rows } = await sql.query(
    `SELECT u.id, u.email, u.name
     FROM "user" u
     WHERE DATE(u."updatedAt") = '2026-03-09'
       AND u.email IS NOT NULL
       AND u.email NOT LIKE '%noreply%'
       AND u.email NOT LIKE '%test%'
       AND NOT EXISTS (
         SELECT 1 FROM session s
         WHERE s."userId" = u.id AND s."expiresAt" > NOW()
       )
       AND NOT EXISTS (
         SELECT 1 FROM conversion_events ce
         WHERE ce.user_id = u.id AND ce.event_type = 'reactivation_email_sent'
       )
     ORDER BY (
       SELECT MAX(ce2.created_at) FROM conversion_events ce2 WHERE ce2.user_id = u.id
     ) DESC NULLS LAST
     LIMIT $1`,
    [MAX_PER_RUN],
  );

  if (rows.length === 0) {
    return NextResponse.json({
      message: 'No users left to reactivate',
      sent: 0,
    });
  }

  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const user of rows) {
    try {
      const firstName = user.name?.split(' ')[0] || 'there';

      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a;">
          <img src="https://lunary.app/logo.png" alt="Lunary" width="32" height="32" style="margin-bottom:24px;" />
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;">Hi ${firstName},</h2>
          <p style="margin:0 0 16px;line-height:1.6;color:#444;">
            We had a technical issue last week that may have logged you out of Lunary.
            Everything is fixed now — and all your data is exactly where you left it.
          </p>
          <p style="margin:0 0 24px;line-height:1.6;color:#444;">
            Just log back in and pick up where you were.
          </p>
          <a href="https://lunary.app/login"
             style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;">
            Log back in
          </a>
          <p style="margin:32px 0 0;font-size:13px;color:#888;line-height:1.6;">
            Any trouble logging in? Just reply to this email and we'll sort it out.
          </p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Your Lunary account is ready — log back in',
        html,
        replyTo: 'hello@lunary.app',
      });

      // Record the send so this user is skipped on future runs
      await sql.query(
        `INSERT INTO conversion_events (event_type, user_id, user_email, created_at)
         VALUES ('reactivation_email_sent', $1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [user.id, user.email],
      );

      results.sent++;
    } catch (err) {
      results.failed++;
      results.errors.push(
        `${user.email}: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  }

  return NextResponse.json({
    sent: results.sent,
    failed: results.failed,
    remaining:
      rows.length === MAX_PER_RUN
        ? 'more remaining — run again tomorrow'
        : 'all done',
    errors: results.errors,
  });
}
