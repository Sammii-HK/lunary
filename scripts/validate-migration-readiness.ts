#!/usr/bin/env tsx
/**
 * Pre-Migration Validation Script
 * Checks that all prerequisites for Jazz to PostgreSQL migration are in place
 *
 * Run with: pnpm tsx scripts/validate-migration-readiness.ts
 */

import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
}

const results: ValidationResult[] = [];

function logResult(check: string, passed: boolean, message: string) {
  results.push({ check, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${check}: ${message}`);
}

async function checkDatabaseConnection() {
  try {
    await sql`SELECT 1`;
    logResult('Database Connection', true, 'PostgreSQL connected successfully');
  } catch (error) {
    logResult(
      'Database Connection',
      false,
      `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function checkRequiredTables() {
  const requiredTables = [
    'user_profiles',
    'shop_packs',
    'shop_purchases',
    'user_notes',
    'jazz_migration_status',
    'subscriptions',
    'user',
  ];

  for (const table of requiredTables) {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        )
      `;
      const exists = result.rows[0]?.exists;
      logResult(
        `Table: ${table}`,
        exists,
        exists ? 'Table exists' : 'Table not found',
      );
    } catch (error) {
      logResult(
        `Table: ${table}`,
        false,
        `Error checking table: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

async function checkRequiredIndexes() {
  const requiredIndexes = [
    { table: 'user_profiles', index: 'idx_user_profiles_user_id' },
    { table: 'shop_packs', index: 'idx_shop_packs_slug' },
    { table: 'shop_purchases', index: 'idx_shop_purchases_user_id' },
    { table: 'user_notes', index: 'idx_user_notes_user_id' },
  ];

  for (const { table, index } of requiredIndexes) {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE tablename = ${table} AND indexname = ${index}
        )
      `;
      const exists = result.rows[0]?.exists;
      logResult(
        `Index: ${index}`,
        exists,
        exists ? 'Index exists' : 'Index not found',
      );
    } catch (error) {
      logResult(
        `Index: ${index}`,
        false,
        `Error checking index: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

function checkEnvironmentVariables() {
  const requiredVars = [
    'POSTGRES_URL',
    'BETTER_AUTH_SECRET',
    'STRIPE_SECRET_KEY',
  ];

  const optionalVars = [
    'ENABLE_DUAL_WRITE',
    'JAZZ_WORKER_ACCOUNT',
    'JAZZ_WORKER_SECRET',
  ];

  for (const varName of requiredVars) {
    const exists = !!process.env[varName];
    logResult(
      `Env: ${varName}`,
      exists,
      exists ? 'Set' : 'MISSING - Required for migration',
    );
  }

  console.log('\n📋 Optional environment variables:');
  for (const varName of optionalVars) {
    const exists = !!process.env[varName];
    console.log(
      `   ${exists ? '✓' : '○'} ${varName}: ${exists ? 'Set' : 'Not set'}`,
    );
  }
}

async function checkUserProfilesSchema() {
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles'
      ORDER BY ordinal_position
    `;

    const columns = result.rows.map((r) => r.column_name);
    const requiredColumns = [
      'id',
      'user_id',
      'name',
      'birthday',
      'birth_chart',
      'personal_card',
      'location',
      'stripe_customer_id',
    ];

    const missingColumns = requiredColumns.filter((c) => !columns.includes(c));

    if (missingColumns.length === 0) {
      logResult(
        'User Profiles Schema',
        true,
        `All ${requiredColumns.length} required columns present`,
      );
    } else {
      logResult(
        'User Profiles Schema',
        false,
        `Missing columns: ${missingColumns.join(', ')}`,
      );
    }
  } catch (error) {
    logResult(
      'User Profiles Schema',
      false,
      `Error checking schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function checkApiRoutes() {
  const apiRoutes = [
    '/api/profile',
    '/api/profile/birth-chart',
    '/api/profile/personal-card',
    '/api/profile/location',
    '/api/subscription',
  ];

  console.log('\n📋 API Routes to verify (manual check required):');
  for (const route of apiRoutes) {
    console.log(`   → ${route}`);
  }
  console.log('   Run local server and test endpoints manually.');
}

async function checkMigrationStatus() {
  try {
    const result = await sql`
      SELECT 
        migration_status,
        COUNT(*) as count
      FROM jazz_migration_status
      GROUP BY migration_status
    `;

    if (result.rows.length > 0) {
      console.log('\n📊 Migration Status Summary:');
      for (const row of result.rows) {
        console.log(`   ${row.migration_status}: ${row.count} users`);
      }
    } else {
      console.log('\n📊 No migration status records found (fresh migration)');
    }
  } catch (error) {
    console.log(
      '\n⚠️  Could not check migration status:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

async function main() {
  console.log('🔍 Pre-Migration Validation Script');
  console.log('====================================\n');

  console.log('📡 Checking database connection...');
  await checkDatabaseConnection();

  console.log('\n📋 Checking required tables...');
  await checkRequiredTables();

  console.log('\n🔍 Checking required indexes...');
  await checkRequiredIndexes();

  console.log('\n🔐 Checking environment variables...');
  checkEnvironmentVariables();

  console.log('\n📊 Checking user_profiles schema...');
  await checkUserProfilesSchema();

  await checkApiRoutes();
  await checkMigrationStatus();

  // Summary
  console.log('\n====================================');
  console.log('📋 Validation Summary');
  console.log('====================================');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total:  ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Migration NOT ready. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ Migration ready! All checks passed.');
    process.exit(0);
  }
}

main().catch(console.error);
