import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { startWorker } from 'jazz-tools/worker';
import { MyAppAccount } from '../schema';
import { sql } from '@vercel/postgres';
import { scryptSync, randomBytes } from 'crypto';

async function exportJazzAuthUsers() {
  console.log('=== Exporting Better Auth Users from Jazz ===\n');

  const JAZZ_WORKER_ACCOUNT = process.env.JAZZ_WORKER_ACCOUNT;
  const JAZZ_WORKER_SECRET = process.env.JAZZ_WORKER_SECRET;
  const JAZZ_SYNC_SERVER =
    process.env.JAZZ_SYNC_SERVER || 'wss://cloud.jazz.tools';

  if (!JAZZ_WORKER_ACCOUNT || !JAZZ_WORKER_SECRET) {
    console.error(
      '❌ Missing JAZZ_WORKER_ACCOUNT or JAZZ_WORKER_SECRET in .env.local',
    );
    process.exit(1);
  }

  console.log('📡 Connecting to Jazz Cloud...');
  console.log(`   Account: ${JAZZ_WORKER_ACCOUNT.substring(0, 20)}...`);

  try {
    const { worker } = await startWorker({
      AccountSchema: MyAppAccount,
      accountID: JAZZ_WORKER_ACCOUNT as `co_z${string}`,
      accountSecret: JAZZ_WORKER_SECRET as `sealerSecret_z${string}`,
      syncServer: JAZZ_SYNC_SERVER,
    });

    console.log('✅ Connected to Jazz Cloud');
    console.log(`   Worker ID: ${worker.id}\n`);

    // Load the worker's root which should contain the Better Auth database
    await worker.ensureLoaded({ root: true });

    console.log('🔍 Exploring worker root structure...');

    const root = worker.root as any;
    if (!root) {
      console.log('❌ Worker root is empty');
      process.exit(1);
    }

    console.log('   Root keys:', Object.keys(root));

    // Jazz Better Auth stores data in a "database" key
    // Let's explore all keys to find users
    const allData: any = {};

    for (const key of Object.keys(root)) {
      try {
        const value = root[key];
        if (value && typeof value === 'object') {
          await value.ensureLoaded?.({ depth: 3 });
          allData[key] = value;
          console.log(`   Found: ${key} (${typeof value})`);
        }
      } catch (e) {
        // Skip unloadable keys
      }
    }

    // Look for user-like structures
    console.log('\n📦 Looking for user data...\n');

    const users: any[] = [];

    // Check common patterns where Jazz Better Auth might store users
    const possibleUserLocations = [
      'database',
      'tables',
      'users',
      'user',
      'betterAuth',
      'auth',
    ];

    for (const loc of possibleUserLocations) {
      if (root[loc]) {
        console.log(`   Checking ${loc}...`);
        try {
          const data = root[loc];
          await data.ensureLoaded?.({ depth: 5 });

          // If it's a table-like structure
          if (data.tables) {
            await data.tables.ensureLoaded?.({ depth: 3 });
            console.log(`   Found tables in ${loc}:`, Object.keys(data.tables));

            if (data.tables.user) {
              const userTable = data.tables.user;
              await userTable.ensureLoaded?.({ depth: 3 });
              console.log(`   User table has ${userTable.length || 0} entries`);

              for (const entry of userTable || []) {
                if (entry) {
                  await entry.ensureLoaded?.({ depth: 2 });
                  users.push({
                    id: entry.id,
                    email: entry.email,
                    name: entry.name,
                    emailVerified: entry.emailVerified,
                    createdAt: entry.createdAt,
                    _raw: entry,
                  });
                }
              }
            }
          }

          // If it's a list of users directly
          if (Array.isArray(data) || data[Symbol.iterator]) {
            for (const item of data) {
              if (item?.email) {
                users.push(item);
              }
            }
          }
        } catch (e: any) {
          console.log(`   Error loading ${loc}: ${e.message}`);
        }
      }
    }

    console.log(`\n📊 Found ${users.length} users in Jazz\n`);

    if (users.length > 0) {
      console.log('Users found:');
      for (const user of users) {
        console.log(`  - ${user.email || user.id}`);
      }

      // Migrate to PostgreSQL
      console.log('\n🔄 Migrating users to PostgreSQL...\n');

      for (const user of users) {
        if (!user.email) {
          console.log(`  ⏭️  Skipping user without email: ${user.id}`);
          continue;
        }

        try {
          // Check if user already exists
          const existing = await sql`
            SELECT id FROM "user" WHERE email = ${user.email}
          `;

          if (existing.rows.length > 0) {
            console.log(`  ⏭️  ${user.email} already exists`);
            continue;
          }

          const userId = user.id || crypto.randomUUID();
          const name = user.name || user.email.split('@')[0];

          // Create user
          await sql`
            INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
            VALUES (${userId}, ${name}, ${user.email}, ${user.emailVerified || false}, NOW(), NOW())
          `;

          // Create account with temp password
          const accountId = crypto.randomUUID();
          const tempHash = hashPassword(randomBytes(32).toString('hex'));

          await sql`
            INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
            VALUES (${accountId}, ${user.email}, 'credential', ${userId}, ${tempHash}, NOW(), NOW())
          `;

          console.log(`  ✅ Migrated: ${user.email}`);
        } catch (e: any) {
          console.log(`  ❌ Error migrating ${user.email}: ${e.message}`);
        }
      }
    } else {
      console.log('No users found in the explored locations.');
      console.log(
        'The Better Auth database might be stored in a different location.',
      );
      console.log('\nDumping full root structure for debugging:');
      console.log(JSON.stringify(allData, getCircularReplacer(), 2));
    }

    // Close connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function getCircularReplacer() {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (key.startsWith('_')) return undefined;
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  };
}

exportJazzAuthUsers();
