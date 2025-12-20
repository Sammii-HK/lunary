import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

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

async function checkMigrationStatus() {
  console.log('🔍 Checking Migration Status...\n');

  try {
    // Get all users in Postgres
    const allUsers = await sql`
      SELECT id, email, "createdAt", "updatedAt"
      FROM "user"
      WHERE email IS NOT NULL
      ORDER BY "createdAt" DESC
    `;

    // Get migration status records
    const migrationStatus = await sql`
      SELECT user_id, migration_status, migrated_at, jazz_account_id, updated_at
      FROM jazz_migration_status
      ORDER BY migrated_at DESC
    `;

    // Separate test accounts from real users
    const realUsers = allUsers.rows.filter(
      (user) => !isTestAccount(user.email),
    );
    const testUsers = allUsers.rows.filter((user) => isTestAccount(user.email));

    // Count users by migration status
    const statusCounts: Record<string, number> = {};
    for (const row of migrationStatus.rows) {
      const status = row.migration_status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }

    // Find users in Postgres but not in migration table
    const migrationUserIds = new Set(
      migrationStatus.rows.map((r) => r.user_id),
    );
    const untrackedUsers = realUsers.filter(
      (user) => !migrationUserIds.has(user.id),
    );

    // Find users with completed migration status
    const completedUserIds = new Set(
      migrationStatus.rows
        .filter((r) => r.migration_status === 'completed')
        .map((r) => r.user_id),
    );
    const completedUsers = realUsers.filter((user) =>
      completedUserIds.has(user.id),
    );

    // Calculate statistics
    const totalRealUsers = realUsers.length;
    const totalTestUsers = testUsers.length;
    const totalWithStatus = migrationStatus.rows.length;
    const completedCount = completedUsers.length;
    const untrackedCount = untrackedUsers.length;
    const pendingCount = statusCounts['pending'] || 0;
    const failedCount = statusCounts['failed'] || 0;

    // Print summary
    console.log('='.repeat(60));
    console.log('📊 Migration Status Summary\n');
    console.log(`Total Users in Postgres: ${allUsers.rows.length}`);
    console.log(`  - Real Users: ${totalRealUsers}`);
    console.log(`  - Test Accounts (excluded): ${totalTestUsers}`);
    console.log('');
    console.log(`Migration Status Records: ${totalWithStatus}`);
    console.log(`  - Completed: ${completedCount}`);
    console.log(`  - Pending: ${pendingCount}`);
    console.log(`  - Failed: ${failedCount}`);
    console.log('');
    console.log(
      `Untracked Users (in Postgres, not in migration table): ${untrackedCount}`,
    );
    console.log('');

    // Show untracked users
    if (untrackedUsers.length > 0) {
      console.log('⚠️  Untracked Users:');
      untrackedUsers.slice(0, 10).forEach((user) => {
        console.log(`   - ${user.email} (created: ${user.createdAt})`);
      });
      if (untrackedUsers.length > 10) {
        console.log(`   ... and ${untrackedUsers.length - 10} more`);
      }
      console.log('');
    }

    // Check recent activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = realUsers.filter(
      (user) => new Date(user.updatedAt) > thirtyDaysAgo,
    );
    console.log(
      `Active Users (updated in last 30 days): ${recentUsers.length}`,
    );
    console.log('');

    // Calculate completion percentage
    const completionPercentage =
      totalRealUsers > 0
        ? ((completedCount / totalRealUsers) * 100).toFixed(1)
        : '0.0';

    console.log('='.repeat(60));
    console.log('📈 Migration Progress\n');
    console.log(
      `Completion: ${completedCount}/${totalRealUsers} (${completionPercentage}%)`,
    );
    console.log('');

    // Check for users with subscriptions but no migration status (potential legacy users)
    const usersWithSubs = await sql`
      SELECT DISTINCT user_id, user_email
      FROM subscriptions
      WHERE user_id IS NOT NULL AND user_email IS NOT NULL
    `;
    const subUserIds = new Set(usersWithSubs.rows.map((r) => r.user_id));
    const subEmails = new Set(
      usersWithSubs.rows
        .map((r) => r.user_email?.toLowerCase())
        .filter(Boolean),
    );

    // Find subscription users not in Postgres (potential unmigrated legacy users)
    const potentialLegacyUsers = usersWithSubs.rows.filter(
      (sub) =>
        !isTestAccount(sub.user_email) &&
        !allUsers.rows.some(
          (u) =>
            u.id === sub.user_id ||
            u.email?.toLowerCase() === sub.user_email?.toLowerCase(),
        ),
    );

    // Recommendation
    console.log('='.repeat(60));
    console.log('💡 Recommendation\n');

    const allTracked = untrackedCount === 0;
    const allCompleted = completedCount === totalRealUsers;
    const noPending = pendingCount === 0;
    const noFailed = failedCount === 0;
    const noPotentialLegacy = potentialLegacyUsers.length === 0;

    // Check if there are any active subscriptions
    const activeSubs = await sql`
      SELECT COUNT(*) as count
      FROM subscriptions
      WHERE status IN ('active', 'trialing', 'past_due')
    `;
    const activeSubCount = parseInt(activeSubs.rows[0]?.count || '0', 10);

    if (
      allTracked &&
      allCompleted &&
      noPending &&
      noFailed &&
      noPotentialLegacy
    ) {
      console.log('✅ LIKELY SAFE TO REMOVE LEGACY FRAMEWORK');
      console.log('');
      console.log('All real users in Postgres have been migrated and tracked.');
      console.log('No pending or failed migrations.');
      console.log('No subscription records pointing to unmigrated users.');
      console.log('');
      console.log('⚠️  IMPORTANT LIMITATIONS:');
      console.log('  • This check only sees users already in Postgres');
      console.log(
        "  • Users in legacy system who haven't logged in won't appear here",
      );
      console.log('  • Legacy system cannot be queried directly');
      console.log('');
      console.log('⚠️  Before removing, verify:');
      console.log('  1. No active subscriptions depend on legacy system');
      console.log('  2. All user data has been migrated');
      console.log('  3. Wait 90+ days after last known legacy login');
      console.log('  4. Monitor for any support requests about login issues');
      console.log('  5. Check application logs for legacy fallback usage');
    } else {
      console.log('⚠️  NOT SAFE TO REMOVE LEGACY FRAMEWORK YET');
      console.log('');
      if (!allTracked) {
        console.log(
          `   - ${untrackedCount} users in Postgres but not in migration table`,
        );
        console.log('     Run: npm run backfill-migration-status');
      }
      if (!allCompleted) {
        console.log(
          `   - ${totalRealUsers - completedCount} users not marked as completed`,
        );
      }
      if (pendingCount > 0) {
        console.log(`   - ${pendingCount} migrations still pending`);
      }
      if (failedCount > 0) {
        console.log(
          `   - ${failedCount} migrations failed (check error messages)`,
        );
      }
      if (!noPotentialLegacy) {
        console.log(
          `   - ${potentialLegacyUsers.length} subscription records point to users not in Postgres`,
        );
        console.log("     These may be legacy users who haven't logged in yet");
        if (potentialLegacyUsers.length <= 5) {
          potentialLegacyUsers.forEach((user) => {
            console.log(
              `       • ${user.user_email} (user_id: ${user.user_id})`,
            );
          });
        }
      }
    }

    // Additional warnings
    console.log('');
    console.log('='.repeat(60));
    console.log('⚠️  Reliability Notes\n');
    console.log('This check has limitations:');
    console.log('  • Only sees users already migrated to Postgres');
    console.log(
      "  • Cannot detect users still in legacy system who haven't logged in",
    );
    console.log('  • Legacy system cannot be queried directly');
    console.log('');
    console.log('To increase confidence:');
    console.log('  1. Monitor application logs for legacy fallback usage');
    console.log(
      '  2. Wait 90+ days after disabling new signups in legacy system',
    );
    console.log('  3. Check for any support tickets about login issues');
    console.log('  4. Verify all active subscriptions are in Postgres');
    if (activeSubCount > 0) {
      console.log(
        `  5. You have ${activeSubCount} active subscriptions - verify they're all migrated`,
      );
    }

    console.log('');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    process.exit(1);
  }
}

checkMigrationStatus().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
