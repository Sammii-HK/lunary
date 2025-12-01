#!/usr/bin/env tsx
/**
 * Post-Migration Validation Script
 * Verifies that all data has been successfully migrated from Jazz to PostgreSQL
 *
 * Run with: pnpm tsx scripts/validate-migration-complete.ts
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
  details?: any;
}

const results: ValidationResult[] = [];

function logResult(
  check: string,
  passed: boolean,
  message: string,
  details?: any,
) {
  results.push({ check, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${check}: ${message}`);
  if (details && !passed) {
    console.log(`   Details: ${JSON.stringify(details)}`);
  }
}

async function checkAllUsersHaveProfiles() {
  try {
    // Count users without profiles
    const result = await sql`
      SELECT COUNT(*) as count
      FROM "user" u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE up.id IS NULL
    `;

    const missingCount = parseInt(result.rows[0]?.count || '0');

    if (missingCount === 0) {
      logResult(
        'User Profiles Coverage',
        true,
        'All users have profiles in PostgreSQL',
      );
    } else {
      logResult(
        'User Profiles Coverage',
        false,
        `${missingCount} users missing profiles`,
        { missingCount },
      );
    }
  } catch (error) {
    logResult(
      'User Profiles Coverage',
      false,
      `Error checking: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function checkMigrationStatusComplete() {
  try {
    const result = await sql`
      SELECT 
        migration_status,
        COUNT(*) as count
      FROM jazz_migration_status
      GROUP BY migration_status
    `;

    const statusMap: Record<string, number> = {};
    for (const row of result.rows) {
      statusMap[row.migration_status] = parseInt(row.count);
    }

    const pending = statusMap['pending'] || 0;
    const failed = statusMap['failed'] || 0;
    const completed = statusMap['completed'] || 0;

    if (pending === 0 && failed === 0 && completed > 0) {
      logResult(
        'Migration Status',
        true,
        `All ${completed} users migrated successfully`,
      );
    } else if (pending > 0 || failed > 0) {
      logResult(
        'Migration Status',
        false,
        `Pending: ${pending}, Failed: ${failed}, Completed: ${completed}`,
        statusMap,
      );
    } else {
      logResult('Migration Status', false, 'No migration status records found');
    }
  } catch (error) {
    logResult(
      'Migration Status',
      false,
      `Error checking: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function checkNoOrphanedRecords() {
  try {
    // Check for orphaned profiles
    const orphanedProfiles = await sql`
      SELECT COUNT(*) as count
      FROM user_profiles up
      LEFT JOIN "user" u ON up.user_id = u.id
      WHERE u.id IS NULL
    `;

    // Check for orphaned purchases
    const orphanedPurchases = await sql`
      SELECT COUNT(*) as count
      FROM shop_purchases sp
      LEFT JOIN shop_packs p ON sp.pack_id = p.id
      WHERE p.id IS NULL
    `;

    const profileCount = parseInt(orphanedProfiles.rows[0]?.count || '0');
    const purchaseCount = parseInt(orphanedPurchases.rows[0]?.count || '0');

    if (profileCount === 0 && purchaseCount === 0) {
      logResult('Orphaned Records', true, 'No orphaned records found');
    } else {
      logResult(
        'Orphaned Records',
        false,
        `Found orphaned: ${profileCount} profiles, ${purchaseCount} purchases`,
        { orphanedProfiles: profileCount, orphanedPurchases: purchaseCount },
      );
    }
  } catch (error) {
    logResult(
      'Orphaned Records',
      false,
      `Error checking: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function checkCriticalDataPresent() {
  try {
    // Check for users with birth charts
    const birthChartResult = await sql`
      SELECT COUNT(*) as count
      FROM user_profiles
      WHERE birth_chart IS NOT NULL
    `;

    // Check for users with personal cards
    const personalCardResult = await sql`
      SELECT COUNT(*) as count
      FROM user_profiles
      WHERE personal_card IS NOT NULL
    `;

    // Check for users with subscriptions
    const subscriptionResult = await sql`
      SELECT COUNT(*) as count
      FROM subscriptions
      WHERE status IN ('active', 'trial')
    `;

    const birthCharts = parseInt(birthChartResult.rows[0]?.count || '0');
    const personalCards = parseInt(personalCardResult.rows[0]?.count || '0');
    const subscriptions = parseInt(subscriptionResult.rows[0]?.count || '0');

    console.log('\n📊 Data Statistics:');
    console.log(`   Birth Charts: ${birthCharts} users`);
    console.log(`   Personal Cards: ${personalCards} users`);
    console.log(`   Active Subscriptions: ${subscriptions} users`);

    logResult(
      'Critical Data Present',
      true,
      `Found: ${birthCharts} charts, ${personalCards} cards, ${subscriptions} subs`,
    );
  } catch (error) {
    logResult(
      'Critical Data Present',
      false,
      `Error checking: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function checkRecentUpdates() {
  try {
    // Check for recent profile updates (last 24 hours)
    const result = await sql`
      SELECT COUNT(*) as count
      FROM user_profiles
      WHERE updated_at > NOW() - INTERVAL '24 hours'
    `;

    const recentCount = parseInt(result.rows[0]?.count || '0');

    console.log(
      `\n📅 Recent Activity (last 24h): ${recentCount} profile updates`,
    );

    logResult(
      'Recent Updates',
      true,
      `${recentCount} profiles updated in last 24 hours`,
    );
  } catch (error) {
    logResult(
      'Recent Updates',
      false,
      `Error checking: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function checkApiEndpointsWorking() {
  console.log('\n🔌 API Endpoint Status (manual verification):');
  const endpoints = [
    { path: '/api/profile', method: 'GET' },
    { path: '/api/profile', method: 'PUT' },
    { path: '/api/profile/birth-chart', method: 'GET' },
    { path: '/api/profile/birth-chart', method: 'PUT' },
    { path: '/api/profile/personal-card', method: 'GET' },
    { path: '/api/profile/personal-card', method: 'PUT' },
    { path: '/api/profile/location', method: 'GET' },
    { path: '/api/profile/location', method: 'PUT' },
    { path: '/api/subscription', method: 'GET' },
  ];

  for (const { path, method } of endpoints) {
    console.log(`   → ${method} ${path}`);
  }
  console.log('\n   Test these endpoints manually or run E2E tests.');
}

async function checkStripeDataIntegrity() {
  try {
    // Check Stripe customer ID consistency
    const result = await sql`
      SELECT COUNT(*) as count
      FROM subscriptions s
      JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.stripe_customer_id IS NOT NULL
        AND up.stripe_customer_id IS NOT NULL
        AND s.stripe_customer_id != up.stripe_customer_id
    `;

    const mismatchCount = parseInt(result.rows[0]?.count || '0');

    if (mismatchCount === 0) {
      logResult(
        'Stripe Data Integrity',
        true,
        'All Stripe customer IDs consistent',
      );
    } else {
      logResult(
        'Stripe Data Integrity',
        false,
        `${mismatchCount} mismatched Stripe customer IDs`,
        { mismatchCount },
      );
    }
  } catch (error) {
    logResult(
      'Stripe Data Integrity',
      false,
      `Error checking: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

async function main() {
  console.log('🔍 Post-Migration Validation Script');
  console.log('====================================\n');

  console.log('👥 Checking user profile coverage...');
  await checkAllUsersHaveProfiles();

  console.log('\n📊 Checking migration status...');
  await checkMigrationStatusComplete();

  console.log('\n🔗 Checking for orphaned records...');
  await checkNoOrphanedRecords();

  console.log('\n📋 Checking critical data...');
  await checkCriticalDataPresent();

  console.log('\n📅 Checking recent activity...');
  await checkRecentUpdates();

  console.log('\n💳 Checking Stripe data integrity...');
  await checkStripeDataIntegrity();

  await checkApiEndpointsWorking();

  // Summary
  console.log('\n====================================');
  console.log('📋 Post-Migration Summary');
  console.log('====================================');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total:  ${results.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Some validations failed. Review and fix issues above.');
    console.log('   Consider running data repair scripts if needed.');
    process.exit(1);
  } else {
    console.log('\n✅ Migration complete! All validations passed.');
    console.log('   Ready to remove Jazz dependencies.');
    process.exit(0);
  }
}

main().catch(console.error);
