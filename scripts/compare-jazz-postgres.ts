#!/usr/bin/env tsx
/**
 * Data Comparison Script
 * Compares data between Jazz export and PostgreSQL to verify migration accuracy
 *
 * Run with: pnpm tsx scripts/compare-jazz-postgres.ts
 *
 * Prerequisites:
 * - Jazz data exported to jazz_export_data.json
 * - PostgreSQL populated with migrated data
 */

import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

interface JazzExportData {
  profiles: Array<{
    accountId: string;
    email?: string;
    profile?: {
      name?: string;
      birthday?: string;
      birthChart?: any;
      personalCard?: any;
      location?: any;
      stripeCustomerId?: string;
    };
  }>;
  shopPacks: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  shopPurchases: Array<{
    userId: string;
    packId: string;
    amount: number;
  }>;
}

interface ComparisonResult {
  field: string;
  jazzValue: any;
  postgresValue: any;
  match: boolean;
}

let totalComparisons = 0;
let matchCount = 0;
let mismatchCount = 0;

function compareValues(field: string, jazzVal: any, pgVal: any): boolean {
  totalComparisons++;

  // Handle null/undefined comparisons
  if (jazzVal === null || jazzVal === undefined) {
    if (pgVal === null || pgVal === undefined) {
      matchCount++;
      return true;
    }
    mismatchCount++;
    return false;
  }

  // Handle object comparisons (JSONB fields)
  if (typeof jazzVal === 'object' && typeof pgVal === 'object') {
    const match = JSON.stringify(jazzVal) === JSON.stringify(pgVal);
    if (match) matchCount++;
    else mismatchCount++;
    return match;
  }

  // Handle primitive comparisons
  const match = jazzVal === pgVal;
  if (match) matchCount++;
  else mismatchCount++;
  return match;
}

async function loadJazzExport(): Promise<JazzExportData | null> {
  const exportPath = resolve(process.cwd(), 'jazz_export_data.json');

  if (!existsSync(exportPath)) {
    console.log('⚠️  Jazz export file not found: jazz_export_data.json');
    console.log(
      '   Run: pnpm tsx scripts/export-jazz-data.ts to create export',
    );
    return null;
  }

  try {
    const data = readFileSync(exportPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading Jazz export:', error);
    return null;
  }
}

async function compareProfiles(jazzData: JazzExportData) {
  console.log('\n👥 Comparing User Profiles...');
  console.log('================================');

  let compared = 0;
  let mismatches: Array<{ email: string; field: string; jazz: any; pg: any }> =
    [];

  for (const jazzProfile of jazzData.profiles) {
    if (!jazzProfile.email) continue;

    try {
      // Find corresponding PostgreSQL user by email
      const userResult = await sql`
        SELECT id FROM "user" WHERE email = ${jazzProfile.email} LIMIT 1
      `;

      if (userResult.rows.length === 0) {
        console.log(
          `   ⚠️  User not found in PostgreSQL: ${jazzProfile.email}`,
        );
        continue;
      }

      const userId = userResult.rows[0].id;

      // Get PostgreSQL profile
      const profileResult = await sql`
        SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1
      `;

      if (profileResult.rows.length === 0) {
        console.log(
          `   ⚠️  Profile not found in PostgreSQL for: ${jazzProfile.email}`,
        );
        continue;
      }

      const pgProfile = profileResult.rows[0];
      const jazzP = jazzProfile.profile || {};

      compared++;

      // Compare fields
      const fieldsToCompare = [
        { field: 'name', jazz: jazzP.name, pg: pgProfile.name },
        { field: 'birthday', jazz: jazzP.birthday, pg: pgProfile.birthday },
        {
          field: 'stripeCustomerId',
          jazz: jazzP.stripeCustomerId,
          pg: pgProfile.stripe_customer_id,
        },
      ];

      for (const { field, jazz, pg } of fieldsToCompare) {
        if (!compareValues(field, jazz, pg)) {
          mismatches.push({ email: jazzProfile.email, field, jazz, pg });
        }
      }

      // Compare JSONB fields (just check if both exist or both null)
      const jsonFields = [
        {
          field: 'birthChart',
          jazz: jazzP.birthChart,
          pg: pgProfile.birth_chart,
        },
        {
          field: 'personalCard',
          jazz: jazzP.personalCard,
          pg: pgProfile.personal_card,
        },
        { field: 'location', jazz: jazzP.location, pg: pgProfile.location },
      ];

      for (const { field, jazz, pg } of jsonFields) {
        const jazzExists = jazz !== null && jazz !== undefined;
        const pgExists = pg !== null && pg !== undefined;

        if (jazzExists !== pgExists) {
          mismatchCount++;
          mismatches.push({
            email: jazzProfile.email,
            field,
            jazz: jazzExists ? 'exists' : 'null',
            pg: pgExists ? 'exists' : 'null',
          });
        } else {
          matchCount++;
        }
        totalComparisons++;
      }
    } catch (error) {
      console.error(
        `   ❌ Error comparing profile for ${jazzProfile.email}:`,
        error,
      );
    }
  }

  console.log(`   Profiles compared: ${compared}`);
  console.log(`   Mismatches found: ${mismatches.length}`);

  if (mismatches.length > 0 && mismatches.length <= 10) {
    console.log('\n   Mismatch details:');
    for (const m of mismatches) {
      console.log(
        `   - ${m.email}.${m.field}: Jazz="${m.jazz}" vs PG="${m.pg}"`,
      );
    }
  } else if (mismatches.length > 10) {
    console.log(`\n   Showing first 10 mismatches:`);
    for (const m of mismatches.slice(0, 10)) {
      console.log(
        `   - ${m.email}.${m.field}: Jazz="${m.jazz}" vs PG="${m.pg}"`,
      );
    }
  }
}

async function compareShopPacks(jazzData: JazzExportData) {
  console.log('\n📦 Comparing Shop Packs...');
  console.log('================================');

  let compared = 0;
  let mismatches = 0;

  for (const jazzPack of jazzData.shopPacks) {
    try {
      const result = await sql`
        SELECT * FROM shop_packs WHERE id = ${jazzPack.id} LIMIT 1
      `;

      if (result.rows.length === 0) {
        console.log(`   ⚠️  Pack not found in PostgreSQL: ${jazzPack.id}`);
        mismatches++;
        continue;
      }

      compared++;
      const pgPack = result.rows[0];

      if (jazzPack.name !== pgPack.name) {
        console.log(
          `   ⚠️  Name mismatch for ${jazzPack.id}: "${jazzPack.name}" vs "${pgPack.name}"`,
        );
        mismatches++;
      }
    } catch (error) {
      console.error(`   ❌ Error comparing pack ${jazzPack.id}:`, error);
    }
  }

  console.log(`   Packs compared: ${compared}`);
  console.log(`   Mismatches found: ${mismatches}`);
}

async function compareShopPurchases(jazzData: JazzExportData) {
  console.log('\n🛒 Comparing Shop Purchases...');
  console.log('================================');

  let compared = 0;
  let mismatches = 0;

  for (const jazzPurchase of jazzData.shopPurchases) {
    try {
      const result = await sql`
        SELECT * FROM shop_purchases 
        WHERE user_id = ${jazzPurchase.userId} 
        AND pack_id = ${jazzPurchase.packId}
        LIMIT 1
      `;

      if (result.rows.length === 0) {
        console.log(
          `   ⚠️  Purchase not found: user=${jazzPurchase.userId}, pack=${jazzPurchase.packId}`,
        );
        mismatches++;
        continue;
      }

      compared++;
    } catch (error) {
      console.error(`   ❌ Error comparing purchase:`, error);
    }
  }

  console.log(`   Purchases compared: ${compared}`);
  console.log(`   Mismatches found: ${mismatches}`);
}

async function main() {
  console.log('🔍 Jazz vs PostgreSQL Data Comparison');
  console.log('======================================\n');

  const jazzData = await loadJazzExport();

  if (!jazzData) {
    console.log('\n❌ Cannot proceed without Jazz export data.');
    console.log(
      '   If you have already migrated without an export, skip this script.',
    );
    process.exit(1);
  }

  console.log('📊 Jazz Export Summary:');
  console.log(`   Profiles: ${jazzData.profiles.length}`);
  console.log(`   Shop Packs: ${jazzData.shopPacks.length}`);
  console.log(`   Shop Purchases: ${jazzData.shopPurchases.length}`);

  await compareProfiles(jazzData);
  await compareShopPacks(jazzData);
  await compareShopPurchases(jazzData);

  // Summary
  console.log('\n======================================');
  console.log('📋 Comparison Summary');
  console.log('======================================');
  console.log(`   Total comparisons: ${totalComparisons}`);
  console.log(`   Matches: ${matchCount}`);
  console.log(`   Mismatches: ${mismatchCount}`);

  const accuracy =
    totalComparisons > 0
      ? ((matchCount / totalComparisons) * 100).toFixed(2)
      : 'N/A';
  console.log(`   Accuracy: ${accuracy}%`);

  if (mismatchCount === 0) {
    console.log('\n✅ Data migration verified! All data matches.');
  } else {
    console.log('\n⚠️  Data discrepancies found. Review mismatches above.');
  }
}

main().catch(console.error);
