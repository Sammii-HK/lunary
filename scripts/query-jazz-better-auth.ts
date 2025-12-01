import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { JazzBetterAuthDatabaseAdapter } from 'jazz-tools/better-auth/database-adapter';
import { sql } from '@vercel/postgres';
import { scryptSync, randomBytes } from 'crypto';

async function queryJazzBetterAuth() {
  console.log('=== Querying Better Auth Users from Jazz ===\n');

  const JAZZ_WORKER_ACCOUNT = process.env.JAZZ_WORKER_ACCOUNT;
  const JAZZ_WORKER_SECRET = process.env.JAZZ_WORKER_SECRET;
  const JAZZ_SYNC_SERVER =
    process.env.JAZZ_SYNC_SERVER || 'wss://cloud.jazz.tools';

  if (!JAZZ_WORKER_ACCOUNT || !JAZZ_WORKER_SECRET) {
    console.error('❌ Missing JAZZ_WORKER_ACCOUNT or JAZZ_WORKER_SECRET');
    process.exit(1);
  }

  console.log('📡 Creating Jazz Better Auth Adapter...');

  try {
    // Create the adapter - this is what Better Auth uses
    const adapter = JazzBetterAuthDatabaseAdapter({
      syncServer: JAZZ_SYNC_SERVER,
      accountID: JAZZ_WORKER_ACCOUNT,
      accountSecret: JAZZ_WORKER_SECRET,
    });

    console.log('✅ Adapter created\n');

    // Query for all users
    console.log('🔍 Querying for users...');

    const users = await adapter.findMany({
      model: 'user',
      limit: 100,
    });

    console.log(`\n📊 Found ${users?.length || 0} users:\n`);

    if (users && users.length > 0) {
      for (const user of users) {
        console.log(`  - ${user.email} (${user.id})`);
        console.log(`    Name: ${user.name}`);
        console.log(`    Created: ${user.createdAt}`);
        console.log('');
      }

      // Migrate to PostgreSQL
      console.log('\n🔄 Migrating users to PostgreSQL...\n');

      for (const user of users) {
        try {
          const existing = await sql`
            SELECT id FROM "user" WHERE email = ${user.email}
          `;

          if (existing.rows.length > 0) {
            console.log(`  ⏭️  ${user.email} already exists`);
            continue;
          }

          // Create user
          await sql`
            INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
            VALUES (${user.id}, ${user.name}, ${user.email}, ${user.emailVerified || false}, NOW(), NOW())
          `;

          // Get their account (for password hash)
          const accounts = await adapter.findMany({
            model: 'account',
            where: [{ field: 'userId', value: user.id }],
          });

          if (accounts && accounts.length > 0) {
            for (const account of accounts) {
              const accountId = crypto.randomUUID();
              await sql`
                INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
                VALUES (${accountId}, ${account.accountId || user.email}, ${account.providerId || 'credential'}, ${user.id}, ${account.password || hashPassword(randomBytes(32).toString('hex'))}, NOW(), NOW())
              `;
            }
          } else {
            // No account found, create temp one
            const accountId = crypto.randomUUID();
            const tempHash = hashPassword(randomBytes(32).toString('hex'));
            await sql`
              INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
              VALUES (${accountId}, ${user.email}, 'credential', ${user.id}, ${tempHash}, NOW(), NOW())
            `;
          }

          console.log(`  ✅ Migrated: ${user.email}`);
        } catch (e: any) {
          console.log(`  ❌ Error migrating ${user.email}: ${e.message}`);
        }
      }
    } else {
      console.log('No users found in Jazz Better Auth.');
    }

    // Also query for accounts
    console.log('\n🔍 Querying for accounts...');
    const accounts = await adapter.findMany({
      model: 'account',
      limit: 100,
    });
    console.log(`Found ${accounts?.length || 0} accounts`);

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

queryJazzBetterAuth();
