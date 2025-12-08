import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function getLegacyUserCount(): Promise<{
  count: number;
  emails: string[];
}> {
  try {
    const accountID = process.env.JAZZ_WORKER_ACCOUNT;
    const accountSecret = process.env.JAZZ_WORKER_SECRET;

    if (!accountID || !accountSecret) {
      return { count: -1, emails: [] };
    }

    // Note: Jazz doesn't provide a direct way to list all users
    // The migration happens automatically on login
    // This function returns -1 to indicate we can't directly query legacy users
    // We rely on the lazy migration which copies users to Postgres on login
    return { count: -1, emails: [] };
  } catch (error) {
    console.error('Failed to check legacy system:', error);
    return { count: -1, emails: [] };
  }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails =
      process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map((e) =>
        e.trim().toLowerCase(),
      ) || [];

    if (!adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const postgresResult = await sql`
      SELECT COUNT(*) as count FROM "user"
    `;
    const postgresCount = parseInt(postgresResult.rows[0]?.count || '0', 10);

    const postgresEmailsResult = await sql`
      SELECT email FROM "user" WHERE email IS NOT NULL
    `;
    const postgresEmails = postgresEmailsResult.rows.map((r) =>
      r.email?.toLowerCase(),
    );

    const legacy = await getLegacyUserCount();

    // Check recent signups (last 30 days) from Postgres
    const recentSignupsResult = await sql`
      SELECT COUNT(*) as count FROM "user" 
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
    `;
    const recentSignups = parseInt(
      recentSignupsResult.rows[0]?.count || '0',
      10,
    );

    return NextResponse.json({
      success: true,
      postgres: {
        count: postgresCount,
        recentSignups,
        emails: postgresEmails.slice(0, 20),
      },
      legacy: {
        count: legacy.count,
        available: legacy.count >= 0,
        note:
          legacy.count < 0
            ? 'Legacy system cannot be queried directly. Users migrate automatically on login.'
            : undefined,
      },
      migration: {
        method: 'lazy',
        description:
          'Users migrate automatically when they sign in. No batch migration needed.',
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Migration status check failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to check migration status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
