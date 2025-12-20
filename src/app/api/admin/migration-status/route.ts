import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Test accounts to exclude from migration checks
const TEST_ACCOUNT_PATTERNS = [
  'kellow.sammii@gmail.com',
  'samhaylock@aol.com',
  'softly.becoming.studio@gmail.com',
];

// Pattern matching for numbered variants (e.g., samhaylock2@aol.com)
const TEST_ACCOUNT_REGEX = [/^samhaylock\d*@aol\.com$/i];

function isTestAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();

  // Check exact matches
  if (
    TEST_ACCOUNT_PATTERNS.some(
      (pattern) => lowerEmail === pattern.toLowerCase(),
    )
  ) {
    return true;
  }

  // Check regex patterns
  if (TEST_ACCOUNT_REGEX.some((regex) => regex.test(lowerEmail))) {
    return true;
  }

  return false;
}

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

    // Note: The legacy system doesn't provide a direct way to list all users
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

    // Get all users
    const allUsersResult = await sql`
      SELECT id, email, "createdAt", "updatedAt" FROM "user" WHERE email IS NOT NULL
    `;
    const allUsers = allUsersResult.rows;

    // Separate test accounts from real users
    const realUsers = allUsers.filter((user) => !isTestAccount(user.email));
    const testUsers = allUsers.filter((user) => isTestAccount(user.email));

    // Get migration status records
    const migrationStatusResult = await sql`
      SELECT 
        user_id, 
        migration_status, 
        migrated_at, 
        jazz_account_id,
        updated_at
      FROM jazz_migration_status
    `;
    const migrationStatus = migrationStatusResult.rows;

    // Count by status
    const statusCounts: Record<string, number> = {};
    for (const row of migrationStatus) {
      const status = row.migration_status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }

    // Find users in Postgres but not in migration table
    const migrationUserIds = new Set(migrationStatus.map((r) => r.user_id));
    const untrackedUsers = realUsers.filter(
      (user) => !migrationUserIds.has(user.id),
    );

    // Find users with completed migration status
    const completedUserIds = new Set(
      migrationStatus
        .filter((r) => r.migration_status === 'completed')
        .map((r) => r.user_id),
    );
    const completedUsers = realUsers.filter((user) =>
      completedUserIds.has(user.id),
    );

    // Check recent signups (last 30 days) from Postgres
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = realUsers.filter(
      (user) => new Date(user.createdAt) > thirtyDaysAgo,
    ).length;

    // Calculate completion percentage
    const completionPercentage =
      realUsers.length > 0
        ? ((completedUsers.length / realUsers.length) * 100).toFixed(1)
        : '0.0';

    // Determine if safe to remove legacy framework
    const allTracked = untrackedUsers.length === 0;
    const allCompleted = completedUsers.length === realUsers.length;
    const noPending = (statusCounts['pending'] || 0) === 0;
    const noFailed = (statusCounts['failed'] || 0) === 0;
    const safeToRemove = allTracked && allCompleted && noPending && noFailed;

    const legacy = await getLegacyUserCount();

    return NextResponse.json({
      success: true,
      postgres: {
        total: allUsers.length,
        realUsers: realUsers.length,
        testAccounts: testUsers.length,
        recentSignups,
        emails: realUsers
          .slice(0, 20)
          .map((r) => r.email?.toLowerCase())
          .filter(Boolean),
      },
      migration: {
        totalRecords: migrationStatus.length,
        statusCounts: {
          completed: statusCounts['completed'] || 0,
          pending: statusCounts['pending'] || 0,
          failed: statusCounts['failed'] || 0,
        },
        completed: completedUsers.length,
        untracked: untrackedUsers.length,
        completionPercentage: `${completionPercentage}%`,
        safeToRemove,
        recommendation: safeToRemove
          ? 'All real users have been migrated and tracked. Consider removing legacy framework after verifying no active dependencies.'
          : 'Not all users are tracked or completed. Run backfill script and verify all migrations are complete.',
        method: 'lazy',
        description:
          'Users migrate automatically when they sign in. Migration status is tracked in jazz_migration_status table.',
      },
      legacy: {
        count: legacy.count,
        available: legacy.count >= 0,
        note:
          legacy.count < 0
            ? 'Legacy system cannot be queried directly. Users migrate automatically on login.'
            : undefined,
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
