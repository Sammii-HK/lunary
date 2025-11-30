import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';

// Dual-write configuration
const ENABLE_DUAL_WRITE = process.env.ENABLE_DUAL_WRITE === 'true';

// Log dual-write operations for monitoring
async function logDualWriteOperation(
  userId: string,
  operation: string,
  postgresSuccess: boolean,
  jazzSuccess: boolean,
  error?: string,
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[DualWrite] ${operation} for user ${userId}: PG=${postgresSuccess}, Jazz=${jazzSuccess}${error ? `, Error: ${error}` : ''}`,
    );
  }
}

// Update migration status for user
async function updateMigrationStatus(
  userId: string,
  status: 'pending' | 'completed' | 'failed',
) {
  try {
    await sql`
      INSERT INTO jazz_migration_status (user_id, migration_status, last_sync_at)
      VALUES (${userId}, ${status}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        migration_status = ${status},
        last_sync_at = NOW(),
        migrated_at = CASE WHEN ${status} = 'completed' THEN NOW() ELSE jazz_migration_status.migrated_at END,
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error updating migration status:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT personal_card FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0 || !result.rows[0].personal_card) {
      return NextResponse.json({ personalCard: null });
    }

    return NextResponse.json({
      personalCard: result.rows[0].personal_card,
    });
  } catch (error) {
    console.error('Error fetching personal card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal card' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { personalCard } = body;

    if (!personalCard || typeof personalCard !== 'object') {
      return NextResponse.json(
        { error: 'Invalid personal card data' },
        { status: 400 },
      );
    }

    let postgresSuccess = false;
    let jazzSuccess = true; // Default to true since Jazz is being removed
    let postgresError: string | undefined;

    // Write to PostgreSQL (primary)
    try {
      await sql`
        INSERT INTO user_profiles (user_id, personal_card)
        VALUES (${user.id}, ${JSON.stringify(personalCard)}::jsonb)
        ON CONFLICT (user_id) DO UPDATE SET
          personal_card = EXCLUDED.personal_card,
          updated_at = NOW()
      `;

      postgresSuccess = true;

      // Update migration status on successful PostgreSQL write
      await updateMigrationStatus(user.id, 'completed');

      // Log dual-write operation
      await logDualWriteOperation(
        user.id,
        'PUT /api/profile/personal-card',
        postgresSuccess,
        jazzSuccess,
      );

      return NextResponse.json({
        success: true,
        _migration: {
          postgresSuccess,
          jazzSuccess,
          dualWriteEnabled: ENABLE_DUAL_WRITE,
        },
      });
    } catch (error) {
      postgresSuccess = false;
      postgresError =
        error instanceof Error ? error.message : 'Unknown PostgreSQL error';

      // Log the failure
      await logDualWriteOperation(
        user.id,
        'PUT /api/profile/personal-card',
        postgresSuccess,
        jazzSuccess,
        postgresError,
      );

      throw error;
    }
  } catch (error) {
    console.error('Error saving personal card:', error);
    return NextResponse.json(
      { error: 'Failed to save personal card' },
      { status: 500 },
    );
  }
}
