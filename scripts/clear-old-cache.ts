/**
 * One-time script to clear old cosmic snapshots that don't have patterns
 * Run with: npx tsx scripts/clear-old-cache.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function clearOldCache() {
  console.log('🗑️  Clearing old cosmic snapshots without cache version...');

  const result = await sql`
    DELETE FROM cosmic_snapshots
    WHERE snapshot_data->>'_cacheVersion' IS NULL
    OR (snapshot_data->>'_cacheVersion')::int < 2
  `;

  console.log(`✅ Deleted ${result.rowCount} old snapshots`);
  console.log('💾 New snapshots will be generated with patterns included');

  process.exit(0);
}

clearOldCache().catch((error) => {
  console.error('❌ Error clearing cache:', error);
  process.exit(1);
});
