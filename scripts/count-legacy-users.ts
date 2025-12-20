import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { JazzBetterAuthDatabaseAdapter } from 'jazz-tools/better-auth/database-adapter';

// Test accounts to exclude
const TEST_ACCOUNT_PATTERNS = [
  'kellow.sammii@gmail.com',
  'samhaylock@aol.com',
  'softly.becoming.studio@gmail.com',
];

const TEST_ACCOUNT_REGEX = [/^samhaylock\d*@aol\.com$/i];

function isTestAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();

  if (
    TEST_ACCOUNT_PATTERNS.some(
      (pattern) => lowerEmail === pattern.toLowerCase(),
    )
  ) {
    return true;
  }

  if (TEST_ACCOUNT_REGEX.some((regex) => regex.test(lowerEmail))) {
    return true;
  }

  return false;
}

async function countLegacyUsers() {
  console.log('🔍 Counting Users in Legacy System...\n');

  const JAZZ_WORKER_ACCOUNT = process.env.JAZZ_WORKER_ACCOUNT;
  const JAZZ_WORKER_SECRET = process.env.JAZZ_WORKER_SECRET;
  const JAZZ_SYNC_SERVER =
    process.env.JAZZ_SYNC_SERVER || 'wss://cloud.jazz.tools';

  if (!JAZZ_WORKER_ACCOUNT || !JAZZ_WORKER_SECRET) {
    console.error('❌ Missing JAZZ_WORKER_ACCOUNT or JAZZ_WORKER_SECRET');
    console.error('   Cannot query legacy system without credentials');
    process.exit(1);
  }

  try {
    console.log('📡 Connecting to legacy system...');
    const adapter = JazzBetterAuthDatabaseAdapter({
      syncServer: JAZZ_SYNC_SERVER,
      accountID: JAZZ_WORKER_ACCOUNT,
      accountSecret: JAZZ_WORKER_SECRET,
    });

    console.log('⏳ Waiting for connection to establish...');
    // Wait for the adapter to sync
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('🔍 Querying users...\n');

    // Try to get all users - may need to paginate if there are many
    let allUsers: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const users = await adapter.findMany({
          model: 'user',
          limit,
          offset,
        });

        if (!users || users.length === 0) {
          hasMore = false;
        } else {
          allUsers = allUsers.concat(users);
          console.log(`   Fetched ${allUsers.length} users so far...`);

          // If we got fewer than the limit, we're done
          if (users.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
          }
        }
      } catch (error: any) {
        console.error(
          `❌ Error fetching users at offset ${offset}:`,
          error.message,
        );
        // If findMany doesn't support offset, try without it
        if (
          error.message?.includes('offset') ||
          error.message?.includes('pagination')
        ) {
          console.log('   Trying without pagination...');
          const users = await adapter.findMany({
            model: 'user',
          });
          allUsers = users || [];
          hasMore = false;
        } else {
          throw error;
        }
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 Legacy System User Count\n');

    const totalUsers = allUsers.length;
    const realUsers = allUsers.filter((user) => !isTestAccount(user.email));
    const testUsers = allUsers.filter((user) => isTestAccount(user.email));

    console.log(`Total Users: ${totalUsers}`);
    console.log(`  - Real Users: ${realUsers.length}`);
    console.log(`  - Test Accounts: ${testUsers.length}`);
    console.log('');

    // Show some sample users
    if (realUsers.length > 0) {
      console.log('Sample Real Users (first 10):');
      realUsers.slice(0, 10).forEach((user) => {
        console.log(`  - ${user.email || 'no-email'} (${user.id})`);
      });
      if (realUsers.length > 10) {
        console.log(`  ... and ${realUsers.length - 10} more`);
      }
      console.log('');
    }

    if (testUsers.length > 0) {
      console.log('Test Accounts (excluded):');
      testUsers.forEach((user) => {
        console.log(`  - ${user.email || 'no-email'}`);
      });
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Note: This count includes all users in the legacy system,');
    console.log(
      '   including those who may not have logged in since migration started.',
    );
    console.log(
      '   Compare this with Postgres user count to see unmigrated users.',
    );

    return {
      total: totalUsers,
      real: realUsers.length,
      test: testUsers.length,
      users: allUsers,
    };
  } catch (error: any) {
    console.error('❌ Error querying legacy system:', error.message);
    console.error('');
    console.error('Possible reasons:');
    console.error('  - Legacy system credentials are incorrect');
    console.error('  - Legacy system is not accessible');
    console.error('  - Adapter does not support querying all users');
    console.error('');
    console.error('The legacy system may not support direct user queries.');
    console.error(
      'Users migrate automatically when they log in (lazy migration).',
    );
    process.exit(1);
  }
}

countLegacyUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
