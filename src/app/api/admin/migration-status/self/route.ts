import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const session = await auth.api.getSession({ headers: request.headers });
    const normalizedEmail = session?.user?.email?.toLowerCase() ?? '';
    const userResult = await sql`
      SELECT id, email, "createdAt", "updatedAt"
      FROM "user"
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1
    `;
    const userRow = userResult.rows[0] || null;

    let migrationRow = null;
    if (userRow?.id) {
      const migrationResult = await sql`
        SELECT user_id, migration_status, migrated_at, jazz_account_id, updated_at
        FROM jazz_migration_status
        WHERE user_id = ${userRow.id}
        LIMIT 1
      `;
      migrationRow = migrationResult.rows[0] || null;
    }

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      postgresUser: userRow
        ? {
            id: userRow.id,
            email: userRow.email,
            createdAt: userRow.createdAt,
            updatedAt: userRow.updatedAt,
          }
        : null,
      migrationStatus: migrationRow
        ? {
            userId: migrationRow.user_id,
            status: migrationRow.migration_status,
            migratedAt: migrationRow.migrated_at,
            legacyAccountId: migrationRow.jazz_account_id,
            updatedAt: migrationRow.updated_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Self migration status check failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to check migration status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
