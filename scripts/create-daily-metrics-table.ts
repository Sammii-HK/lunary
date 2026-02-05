/**
 * Create daily_metrics table for pre-computed analytics
 * Run with: pnpm tsx scripts/create-daily-metrics-table.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
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

async function createDailyMetricsTable() {
  console.log('📊 Creating daily_metrics table...\n');

  try {
    // Read the SQL file
    const sqlFile = join(
      __dirname,
      '../prisma/migrations/create_daily_metrics.sql',
    );
    const sqlContent = readFileSync(sqlFile, 'utf-8');

    // Split into individual statements and clean them
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => {
        // Remove leading comment-only lines (keep inline comments)
        const lines = s.split('\n');
        const firstNonComment = lines.findIndex((line) => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--');
        });
        if (firstNonComment === -1) return ''; // All comments
        return lines.slice(firstNonComment).join('\n').trim();
      })
      .filter((s) => s.length > 0 && !s.startsWith('COMMENT')); // Remove COMMENT statements

    console.log(`🔨 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      // Extract object name for logging
      const tableMatch = statement.match(/daily_metrics/);
      const indexMatch = statement.match(/idx_\w+/);
      const name =
        indexMatch?.[0] ||
        (tableMatch ? 'daily_metrics table' : `statement ${i + 1}`);

      try {
        console.log(`   Creating ${name}...`);
        await sql.query(statement);
        console.log(`   ✅ ${name} created`);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('already exists') ||
            error.message.includes('duplicate'))
        ) {
          console.log(`   ⚠️  ${name} already exists (skipping)`);
        } else {
          console.error(`   ❌ Failed to create ${name}:`, error);
          throw error;
        }
      }
    }

    console.log('\n✨ Daily metrics table created successfully!');
    console.log('\n📈 Next steps:');
    console.log('   1. Run: pnpm tsx scripts/backfill-daily-metrics.ts');
    console.log(
      '   2. Set up Vercel cron to run /api/cron/compute-metrics daily',
    );
    console.log('\n💡 Benefits:');
    console.log('   • 99% reduction in database query costs');
    console.log('   • Historical data served from snapshots (1ms lookup)');
    console.log("   • Today's data still real-time (500ms live query)");
  } catch (error) {
    console.error('\n❌ Error creating daily_metrics table:', error);
    process.exit(1);
  }

  process.exit(0);
}

createDailyMetricsTable();
