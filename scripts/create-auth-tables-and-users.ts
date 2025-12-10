import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import { randomBytes, scryptSync } from 'crypto';

config({ path: '.env.local' });

async function main() {
  console.log('=== Creating Better Auth Tables & Pre-Creating Users ===\n');

  // 1. Create Better Auth tables
  console.log('📦 Creating Better Auth tables...\n');

  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      image TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ Created "user" table');

  await sql`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      token TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    )
  `;
  console.log('✅ Created "session" table');

  await sql`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
      "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
      scope TEXT,
      password TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ Created "account" table');

  await sql`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ Created "verification" table');

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_session_userId ON session("userId")`;
  await sql`CREATE INDEX IF NOT EXISTS idx_session_token ON session(token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_account_userId ON account("userId")`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email)`;
  console.log('✅ Created indexes\n');

  // 2. Get existing users from subscriptions (our source of truth)
  console.log('👥 Finding existing users from subscriptions...\n');

  const existingUsers = await sql`
    SELECT DISTINCT user_id, user_email, stripe_customer_id
    FROM subscriptions
    WHERE user_id IS NOT NULL 
    AND user_id != 'unknown'
    AND user_email IS NOT NULL
    AND user_email LIKE '%@%'
  `;

  console.log(`Found ${existingUsers.rows.length} users to migrate:\n`);

  // 3. Pre-create user accounts
  for (const user of existingUsers.rows) {
    const userId = user.user_id;
    const email = user.user_email;
    const name = email.split('@')[0]; // Default name from email

    console.log(`Creating account for: ${email} (${userId})`);

    try {
      // Check if user already exists
      const existing =
        await sql`SELECT id FROM "user" WHERE id = ${userId} OR email = ${email}`;

      if (existing.rows.length > 0) {
        console.log(`  ⏭️  User already exists, skipping`);
        continue;
      }

      // Create user record
      await sql`
        INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        VALUES (${userId}, ${name}, ${email}, true, NOW(), NOW())
      `;

      // Create account record (credential provider)
      // We'll use a random password hash - users will need to reset password
      const accountId = crypto.randomUUID();
      const tempPasswordHash = await hashPassword(
        randomBytes(32).toString('hex'),
      );

      await sql`
        INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        VALUES (${accountId}, ${email}, 'credential', ${userId}, ${tempPasswordHash}, NOW(), NOW())
      `;

      console.log(`  ✅ Created user and account`);
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n=== Summary ===');

  const userCount = await sql`SELECT COUNT(*) as count FROM "user"`;
  const accountCount = await sql`SELECT COUNT(*) as count FROM account`;

  console.log(`Users in database: ${userCount.rows[0].count}`);
  console.log(`Accounts in database: ${accountCount.rows[0].count}`);

  console.log(
    '\n⚠️  IMPORTANT: Users will need to use "Forgot Password" to set their password!',
  );
  console.log(
    '   Or you can manually set passwords using the update-user-password.ts script.',
  );
}

// Simple password hashing using scrypt (same as Better Auth uses)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

main().catch(console.error);
