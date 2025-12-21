#!/usr/bin/env tsx
/**
 * Script to delete a moon circle for a specific date
 * Usage: pnpm delete:moon-circle YYYY-MM-DD
 * Example: pnpm delete:moon-circle 2025-12-22
 *
 * Or directly: tsx scripts/delete-moon-circle.ts YYYY-MM-DD
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const dateStr = process.argv[2];

if (!dateStr) {
  console.error('❌ Please provide a date in YYYY-MM-DD format');
  console.error('Usage: pnpm delete:moon-circle YYYY-MM-DD');
  process.exit(1);
}

// Validate date format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(dateStr)) {
  console.error(
    '❌ Invalid date format. Please use YYYY-MM-DD (e.g., 2025-12-22)',
  );
  process.exit(1);
}

async function deleteMoonCircle() {
  try {
    console.log(`🗑️  Deleting Moon Circle for ${dateStr}...`);

    // First, check if it exists
    const existing = await sql`
      SELECT id, moon_phase, event_date, title, insight_count
      FROM moon_circles
      WHERE event_date = ${dateStr}::date
    `;

    if (existing.rows.length === 0) {
      console.log(`ℹ️  No Moon Circle found for ${dateStr}`);
      process.exit(0);
    }

    const moonCircle = existing.rows[0];
    console.log(`📋 Found Moon Circle:`);
    console.log(`   ID: ${moonCircle.id}`);
    console.log(`   Phase: ${moonCircle.moon_phase}`);
    console.log(`   Date: ${moonCircle.event_date}`);
    console.log(`   Title: ${moonCircle.title}`);
    console.log(`   Insights: ${moonCircle.insight_count || 0}`);

    // Delete the moon circle (cascade will delete insights)
    await sql`
      DELETE FROM moon_circles
      WHERE event_date = ${dateStr}::date
    `;

    console.log(`✅ Moon Circle deleted successfully!`);
    console.log(
      `   Note: Associated insights have also been deleted (CASCADE)`,
    );
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

deleteMoonCircle();
