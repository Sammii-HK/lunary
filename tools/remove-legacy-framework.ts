/**
 * LEGACY FRAMEWORK PURGE SCRIPT
 *
 * This script prepares the codebase for complete removal of the legacy framework (💩).
 *
 * DO NOT RUN THIS SCRIPT AUTOMATICALLY.
 * Run only when explicitly commanded: "perform legacy purge"
 *
 * The legacy framework is still required for lazy migration of existing users.
 * Once all users have been migrated to Postgres, this script can be executed.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// LEGACY FRAMEWORK AUDIT RESULTS
// ============================================================================
//
// | File Path | Import | Purpose | Classification | Safe to Delete |
// |-----------|--------|---------|----------------|----------------|
// | src/lib/auth.ts | jazz-tools/better-auth/database-adapter | Fallback auth for unmigrated users | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | src/lib/auth.ts | jazz-tools/better-auth/auth/server | jazzPlugin for fallback auth | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | src/lib/jazz/server.ts | jazz-tools/worker | Server-side profile loading | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | src/lib/jazz/server.ts | jazz-tools (Loaded type) | TypeScript types | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | schema.ts | jazz-tools (co, z, Group) | Schema definitions for legacy data | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | scripts/extract-jazz-users.ts | jazz-tools/better-auth/database-adapter | Migration script | SAFE_TO_DELETE_NOW | YES |
// | scripts/export-jazz-data.ts | jazz-tools/worker, jazz-tools (co, z) | Migration script | SAFE_TO_DELETE_NOW | YES |
// | scripts/query-jazz-better-auth.ts | jazz-tools/better-auth/database-adapter | Debug script | SAFE_TO_DELETE_NOW | YES |
// | next.config.mjs | transpilePackages: ['jazz-tools'] | Build config | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | jest.config.js | transformIgnorePatterns for jazz-tools | Test config | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | package.json | jazz-react, jazz-tools | Dependencies | REQUIRED_FOR_LAZY_MIGRATION | NO |
// | docs/MIGRATION_ROLLBACK_PLAN.md | Documentation reference | Docs | DEAD_REFERENCE | YES (can update) |
//
// ============================================================================

interface PurgeAction {
  type: 'delete_file' | 'remove_import' | 'remove_package' | 'update_config';
  path: string;
  description: string;
  safe: boolean;
}

const SAFE_DELETIONS: PurgeAction[] = [
  {
    type: 'delete_file',
    path: 'scripts/extract-jazz-users.ts',
    description: 'Migration script - no longer needed after migration complete',
    safe: true,
  },
  {
    type: 'delete_file',
    path: 'scripts/export-jazz-data.ts',
    description:
      'Data export script - no longer needed after migration complete',
    safe: true,
  },
  {
    type: 'delete_file',
    path: 'scripts/query-jazz-better-auth.ts',
    description: 'Debug script - no longer needed after migration complete',
    safe: true,
  },
  {
    type: 'delete_file',
    path: 'scripts/compare-jazz-postgres.ts',
    description:
      'Comparison script - no longer needed after migration complete',
    safe: true,
  },
];

const REQUIRES_MIGRATION_COMPLETE: PurgeAction[] = [
  {
    type: 'delete_file',
    path: 'src/lib/jazz/server.ts',
    description:
      'Server-side Jazz profile loader - remove after all users migrated',
    safe: false,
  },
  {
    type: 'delete_file',
    path: 'schema.ts',
    description: 'Jazz schema definitions - remove after all users migrated',
    safe: false,
  },
  {
    type: 'remove_import',
    path: 'src/lib/auth.ts',
    description: 'Remove Jazz fallback adapter and jazzPlugin imports',
    safe: false,
  },
  {
    type: 'update_config',
    path: 'next.config.mjs',
    description: 'Remove jazz-tools from transpilePackages',
    safe: false,
  },
  {
    type: 'update_config',
    path: 'jest.config.js',
    description: 'Remove jazz-tools from transformIgnorePatterns',
    safe: false,
  },
  {
    type: 'remove_package',
    path: 'package.json',
    description: 'Remove jazz-react and jazz-tools dependencies',
    safe: false,
  },
];

function printBanner() {
  console.log('');
  console.log(
    '╔════════════════════════════════════════════════════════════════╗',
  );
  console.log(
    '║           LEGACY FRAMEWORK (💩) PURGE SCRIPT                   ║',
  );
  console.log(
    '╠════════════════════════════════════════════════════════════════╣',
  );
  console.log(
    '║  This script will remove all traces of the legacy framework.  ║',
  );
  console.log(
    '║  Only run after ALL users have been migrated to Postgres.     ║',
  );
  console.log(
    '╚════════════════════════════════════════════════════════════════╝',
  );
  console.log('');
}

function checkMigrationStatus(): boolean {
  console.log('🔍 Checking migration status...');
  console.log('');
  console.log('⚠️  MANUAL CHECK REQUIRED:');
  console.log('   1. Query Postgres: SELECT COUNT(*) FROM "user"');
  console.log('   2. Compare with Jazz user count');
  console.log('   3. Ensure all active users have logged in since migration');
  console.log('');
  return false; // Always return false - manual verification required
}

function listSafeActions() {
  console.log('');
  console.log('✅ SAFE TO DELETE NOW (migration helper scripts):');
  console.log('─'.repeat(60));
  SAFE_DELETIONS.forEach((action, i) => {
    console.log(`  ${i + 1}. ${action.path}`);
    console.log(`     ${action.description}`);
  });
  console.log('');
}

function listBlockedActions() {
  console.log('');
  console.log('⛔ BLOCKED UNTIL MIGRATION COMPLETE:');
  console.log('─'.repeat(60));
  REQUIRES_MIGRATION_COMPLETE.forEach((action, i) => {
    console.log(`  ${i + 1}. [${action.type}] ${action.path}`);
    console.log(`     ${action.description}`);
  });
  console.log('');
}

function deleteSafeFiles(dryRun: boolean = true) {
  console.log('');
  console.log(
    dryRun
      ? '🔍 DRY RUN - Files that would be deleted:'
      : '🗑️  Deleting safe files...',
  );
  console.log('─'.repeat(60));

  for (const action of SAFE_DELETIONS) {
    const fullPath = path.join(process.cwd(), action.path);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      if (dryRun) {
        console.log(`  Would delete: ${action.path}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`  ✅ Deleted: ${action.path}`);
      }
    } else {
      console.log(`  ⏭️  Already removed: ${action.path}`);
    }
  }
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');
  const deleteScripts = args.includes('--delete-scripts');

  printBanner();

  if (isDryRun) {
    console.log('📋 Running in DRY RUN mode (use --execute to apply changes)');
    console.log('');
  }

  // Check migration status
  const migrationComplete = checkMigrationStatus();

  // List what can be done
  listSafeActions();
  listBlockedActions();

  // If delete-scripts flag is set, delete the safe files
  if (deleteScripts) {
    deleteSafeFiles(isDryRun);
  }

  if (!migrationComplete) {
    console.log('');
    console.log('⚠️  LAZY MIGRATION STILL ACTIVE');
    console.log('─'.repeat(60));
    console.log('The following components are still required:');
    console.log('  • src/lib/auth.ts - Jazz fallback for unmigrated users');
    console.log('  • src/lib/jazz/server.ts - Profile loading from Jazz');
    console.log('  • schema.ts - Jazz schema definitions');
    console.log('  • package.json - jazz-react, jazz-tools packages');
    console.log('');
    console.log('To complete the purge:');
    console.log('  1. Ensure all users have logged in post-migration');
    console.log('  2. Verify user counts match between Jazz and Postgres');
    console.log('  3. Run this script with --execute flag');
    console.log('');
  }

  console.log('');
  console.log('Usage:');
  console.log(
    '  npx tsx tools/remove-legacy-framework.ts              # Dry run',
  );
  console.log(
    '  npx tsx tools/remove-legacy-framework.ts --delete-scripts  # Delete safe scripts (dry run)',
  );
  console.log(
    '  npx tsx tools/remove-legacy-framework.ts --delete-scripts --execute  # Actually delete',
  );
  console.log('');
}

main();
