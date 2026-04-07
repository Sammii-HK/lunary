import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const [last7d, last48h, lastEver, verifEmails] = await Promise.all([
      sql`
        SELECT COUNT(*) as count
        FROM public."user"
        WHERE "createdAt" > NOW() - INTERVAL '7 days'
      `,
      sql`
        SELECT COUNT(*) as count
        FROM public."user"
        WHERE "createdAt" > NOW() - INTERVAL '48 hours'
      `,
      sql`
        SELECT MAX("createdAt") as last_signup FROM public."user"
      `,
      sql`
        SELECT COUNT(*) as count
        FROM analytics_notification_events
        WHERE notification_type = 'email_verification'
          AND event_type = 'sent'
          AND created_at > NOW() - INTERVAL '48 hours'
      `,
    ]);

    const last7dCount = Number(last7d.rows[0]?.count || 0);
    const last48hCount = Number(last48h.rows[0]?.count || 0);
    const lastSignup = lastEver.rows[0]?.last_signup ?? null;
    const verifCount = Number(verifEmails.rows[0]?.count || 0);

    const hoursSinceLast = lastSignup
      ? Math.floor((Date.now() - new Date(lastSignup).getTime()) / 3_600_000)
      : null;

    const alert = hoursSinceLast !== null && hoursSinceLast > 48;

    return NextResponse.json({
      signups7d: last7dCount,
      signups48h: last48hCount,
      lastSignupAt: lastSignup,
      hoursSinceLastSignup: hoursSinceLast,
      verificationEmailsSent48h: verifCount,
      alert,
      alertReason: alert
        ? `No new signups in ${hoursSinceLast}h — signup flow may be broken`
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
