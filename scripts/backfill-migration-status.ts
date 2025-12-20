import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Test accounts to exclude from backfill
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

async function backfillMigrationStatus() {
  console.log('🔄 Backfilling Migration Status...\n');

  try {
    // Get all users in Postgres
    const allUsers = await sql`
      SELECT id, email, "createdAt", "updatedAt"
      FROM "user"
      WHERE email IS NOT NULL
      ORDER BY "createdAt" DESC
    `;

    // Get existing migration status records
    const existingStatus = await sql`
      SELECT user_id
      FROM jazz_migration_status
    `;

    const existingUserIds = new Set(existingStatus.rows.map((r) => r.user_id));

    // Filter out test accounts and users already in migration table
    const usersToBackfill = allUsers.rows.filter(
      (user) => !isTestAccount(user.email) && !existingUserIds.has(user.id),
    );

    if (usersToBackfill.length === 0) {
      console.log('✅ All users already have migration status records');
      console.log('   (excluding test accounts)');
      return;
    }

    console.log(`Found ${usersToBackfill.length} users to backfill\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToBackfill) {
      try {
        await sql`
          INSERT INTO jazz_migration_status (
            user_id,
            migration_status,
            migrated_at,
            created_at,
            updated_at
          )
          VALUES (
            ${user.id},
            'completed',
            ${user.createdAt},
            NOW(),
            NOW()
          )
          ON CONFLICT (user_id) DO NOTHING
        `;

        successCount++;
        if (successCount % 10 === 0) {
          process.stdout.write(`   Processed ${successCount} users...\r`);
        }
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Failed to backfill ${user.email}:`, error);
      }
    }

    console.log('\n');
    console.log('='.repeat(60));
    console.log('📊 Backfill Summary\n');
    console.log(`Total users processed: ${usersToBackfill.length}`);
    console.log(`✅ Successfully backfilled: ${successCount}`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }
    console.log('');

    // Verify the backfill
    const verifyResult = await sql`
      SELECT COUNT(*) as count
      FROM jazz_migration_status
      WHERE migration_status = 'completed'
    `;
    const totalCompleted = parseInt(verifyResult.rows[0]?.count || '0', 10);

    console.log(`Total users with 'completed' status: ${totalCompleted}`);
    console.log('');
    console.log('✅ Backfill complete!');
    console.log('   Run: npm run check-migration-status to verify');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  }
}

backfillMigrationStatus().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
