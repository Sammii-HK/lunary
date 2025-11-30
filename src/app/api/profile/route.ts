import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { encrypt, decrypt } from '@/lib/encryption';

// Dual-write configuration
const ENABLE_DUAL_WRITE = process.env.ENABLE_DUAL_WRITE === 'true';
const JAZZ_ENABLED = !!(
  process.env.JAZZ_WORKER_ACCOUNT && process.env.JAZZ_WORKER_SECRET
);

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
      SELECT * FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ profile: null });
    }

    const profile = result.rows[0];
    return NextResponse.json({
      profile: {
        id: profile.id,
        userId: profile.user_id,
        name: profile.name,
        birthday: profile.birthday ? decrypt(profile.birthday) : null,
        birthChart: profile.birth_chart,
        personalCard: profile.personal_card,
        location: profile.location,
        stripeCustomerId: profile.stripe_customer_id,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
    const { name, birthday, stripeCustomerId } = body;

    // Encrypt birthday before storing
    const encryptedBirthday = birthday ? encrypt(birthday) : null;

    let postgresSuccess = false;
    let jazzSuccess = true; // Default to true since Jazz is being removed
    let postgresError: string | undefined;

    // Write to PostgreSQL (primary)
    try {
      const result = await sql`
        INSERT INTO user_profiles (user_id, name, birthday, stripe_customer_id)
        VALUES (${user.id}, ${name || null}, ${encryptedBirthday}, ${stripeCustomerId || null})
        ON CONFLICT (user_id) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, user_profiles.name),
          birthday = COALESCE(EXCLUDED.birthday, user_profiles.birthday),
          stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_profiles.stripe_customer_id),
          updated_at = NOW()
        RETURNING *
      `;

      postgresSuccess = true;

      // Update migration status on successful PostgreSQL write
      await updateMigrationStatus(user.id, 'completed');

      // Log dual-write operation
      await logDualWriteOperation(
        user.id,
        'PUT /api/profile',
        postgresSuccess,
        jazzSuccess,
      );

      const profile = result.rows[0];
      return NextResponse.json({
        profile: {
          id: profile.id,
          userId: profile.user_id,
          name: profile.name,
          birthday: profile.birthday ? decrypt(profile.birthday) : null,
          birthChart: profile.birth_chart,
          personalCard: profile.personal_card,
          location: profile.location,
          stripeCustomerId: profile.stripe_customer_id,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
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
        'PUT /api/profile',
        postgresSuccess,
        jazzSuccess,
        postgresError,
      );

      throw error;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
