import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { encrypt } from '@/lib/encryption';
import { normalizeIsoDateOnly } from '@/lib/date-only';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has profile data already
    const result = await sql`
      SELECT birthday, birth_chart FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const hasData =
      result.rows.length > 0 &&
      (result.rows[0].birthday || result.rows[0].birth_chart);

    return NextResponse.json({
      migrationStatus: hasData ? 'completed' : 'pending',
      needsMigration: !hasData,
    });
  } catch (error: any) {
    // Table doesn't exist = needs migration
    if (error?.code === '42P01') {
      return NextResponse.json({
        migrationStatus: 'pending',
        needsMigration: true,
      });
    }
    console.error('Error checking migration status:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      birthday,
      birthChart,
      personalCard,
      location,
      stripeCustomerId,
    } = body;

    const normalizedBirthday = normalizeIsoDateOnly(birthday);

    // Encrypt sensitive PII data
    const encryptedName = name ? encrypt(name) : null;
    const encryptedBirthday = normalizedBirthday
      ? encrypt(normalizedBirthday)
      : null;

    await sql`
      INSERT INTO user_profiles (
        user_id, name, birthday, birth_chart, personal_card, location, stripe_customer_id
      )
      VALUES (
        ${user.id}, 
        ${encryptedName}, 
        ${encryptedBirthday}, 
        ${birthChart ? JSON.stringify(birthChart) : null}::jsonb,
        ${personalCard ? JSON.stringify(personalCard) : null}::jsonb,
        ${location ? JSON.stringify(location) : null}::jsonb,
        ${stripeCustomerId || null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, user_profiles.name),
        birthday = COALESCE(EXCLUDED.birthday, user_profiles.birthday),
        birth_chart = COALESCE(EXCLUDED.birth_chart, user_profiles.birth_chart),
        personal_card = COALESCE(EXCLUDED.personal_card, user_profiles.personal_card),
        location = COALESCE(EXCLUDED.location, user_profiles.location),
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_profiles.stripe_customer_id),
        updated_at = NOW()
    `;

    console.log(`[Migration] Migrated profile data for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      migrationStatus: 'completed',
    });
  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
