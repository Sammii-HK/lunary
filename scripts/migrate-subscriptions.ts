import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Check if POSTGRES_URL is set
if (
  !process.env.POSTGRES_URL &&
  !process.env.POSTGRES_PRISMA_URL &&
  !process.env.POSTGRES_URL_NON_POOLING
) {
  console.error('❌ POSTGRES_URL environment variable not found');
  console.error('   Make sure you have .env.local with POSTGRES_URL set');
  console.error('   Or pull from Vercel: vercel env pull .env.local');
  process.exit(1);
}

async function checkMigrationNeeded(): Promise<{
  tableExists: boolean;
  needsUserEmail: boolean;
  needsUserName: boolean;
  needsMigration: boolean;
}> {
  try {
    // Check if subscriptions table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
      )
    `;
    const tableExists = tableCheck.rows[0]?.exists || false;

    if (!tableExists) {
      return {
        tableExists: false,
        needsUserEmail: true,
        needsUserName: true,
        needsMigration: true,
      };
    }

    // Check if user_email column exists
    const emailColumnCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'user_email'
      )
    `;
    const needsUserEmail = !emailColumnCheck.rows[0]?.exists;

    // Check if user_name column exists
    const nameColumnCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'user_name'
      )
    `;
    const needsUserName = !nameColumnCheck.rows[0]?.exists;

    return {
      tableExists: true,
      needsUserEmail,
      needsUserName,
      needsMigration: needsUserEmail || needsUserName,
    };
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('🔍 Checking if subscriptions migration is needed...');

    const status = await checkMigrationNeeded();

    if (!status.needsMigration) {
      console.log('✅ No migration needed - subscriptions table is up to date');
      return { migrated: false, reason: 'Already up to date' };
    }

    console.log('📊 Migration status:', {
      tableExists: status.tableExists,
      needsUserEmail: status.needsUserEmail,
      needsUserName: status.needsUserName,
    });

    // Create subscriptions table if it doesn't exist
    if (!status.tableExists) {
      console.log('📦 Creating subscriptions table...');
      await sql`
        CREATE TABLE subscriptions (
          id SERIAL PRIMARY KEY,
          
          -- User identification
          user_id TEXT NOT NULL UNIQUE,
          user_email TEXT,
          user_name TEXT,
          
          -- Subscription details
          status TEXT NOT NULL DEFAULT 'free',
          plan_type TEXT NOT NULL DEFAULT 'free',
          
          -- Trial information
          trial_ends_at TIMESTAMP WITH TIME ZONE,
          trial_reminder_3d_sent BOOLEAN DEFAULT false,
          trial_reminder_1d_sent BOOLEAN DEFAULT false,
          trial_expired_email_sent BOOLEAN DEFAULT false,
          
          -- Stripe integration
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          
          -- Period information
          current_period_end TIMESTAMP WITH TIME ZONE,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at ON subscriptions(trial_ends_at)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email)`;

      // Create trigger function
      await sql`
        CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

      // Create trigger
      await sql`
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions
      `;

      await sql`
        CREATE TRIGGER update_subscriptions_updated_at
            BEFORE UPDATE ON subscriptions
            FOR EACH ROW
            EXECUTE FUNCTION update_subscriptions_updated_at()
      `;

      console.log('✅ Subscriptions table created with all columns');
      return { migrated: true, reason: 'Table created' };
    }

    // Add missing columns
    if (status.needsUserEmail) {
      console.log('➕ Adding user_email column...');
      await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_email TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email)`;
    }

    if (status.needsUserName) {
      console.log('➕ Adding user_name column...');
      await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_name TEXT`;
    }

    // Ensure trigger exists
    await sql`
      CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions
    `;

    await sql`
      CREATE TRIGGER update_subscriptions_updated_at
          BEFORE UPDATE ON subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_subscriptions_updated_at()
    `;

    console.log('✅ Migration completed successfully');
    return { migrated: true, reason: 'Columns added' };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check') || args.includes('-c');

  try {
    if (checkOnly) {
      const status = await checkMigrationNeeded();
      console.log('\n📊 Migration Status:');
      console.log(`  Table exists: ${status.tableExists ? '✅' : '❌'}`);
      console.log(
        `  user_email column: ${status.needsUserEmail ? '❌ Missing' : '✅ Exists'}`,
      );
      console.log(
        `  user_name column: ${status.needsUserName ? '❌ Missing' : '✅ Exists'}`,
      );
      console.log(
        `\n  Migration needed: ${status.needsMigration ? '⚠️  YES' : '✅ NO'}`,
      );

      process.exit(status.needsMigration ? 1 : 0);
    } else {
      const result = await runMigration();
      if (result.migrated) {
        console.log(`\n🎉 Migration completed: ${result.reason}`);
      } else {
        console.log(`\n✅ ${result.reason}`);
      }
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

main();
