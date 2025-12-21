#!/usr/bin/env tsx
/**
 * Script to backfill a moon circle for a specific date
 * Usage: pnpm backfill:moon-circle YYYY-MM-DD
 * Example: pnpm backfill:moon-circle 2025-01-15
 *
 * Or directly: tsx scripts/backfill-moon-circle.ts YYYY-MM-DD
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const dateStr = process.argv[2];

if (!dateStr) {
  console.error('❌ Please provide a date in YYYY-MM-DD format');
  console.error('Usage: tsx scripts/backfill-moon-circle.ts YYYY-MM-DD');
  process.exit(1);
}

// Validate date format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(dateStr)) {
  console.error(
    '❌ Invalid date format. Please use YYYY-MM-DD (e.g., 2025-01-15)',
  );
  process.exit(1);
}

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://lunary.app'
    : 'http://localhost:3000';

async function backfillMoonCircle() {
  try {
    // Check for CRON_SECRET
    if (!process.env.CRON_SECRET) {
      console.error('❌ CRON_SECRET is not set in your environment variables');
      console.error('');
      console.error('To fix this, add CRON_SECRET to your .env.local file:');
      console.error('  CRON_SECRET=your-secret-here');
      console.error('');
      console.error('Or pull from Vercel: vercel env pull .env.local');
      console.error('');
      console.error(
        'Or run with: CRON_SECRET=your-secret pnpm backfill:moon-circle YYYY-MM-DD',
      );
      process.exit(1);
    }

    console.log(`🌙 Creating Moon Circle for ${dateStr}...`);

    const response = await fetch(`${baseUrl}/api/cron/moon-circles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ date: dateStr, force: false }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      if (response.status === 401) {
        console.error('❌ Authentication failed');
        console.error(
          '   Make sure CRON_SECRET is set correctly in your .env.local file',
        );
        console.error('   Or pull from Vercel: vercel env pull .env.local');
        console.error(`   Error: ${errorData.error || 'Unauthorized'}`);
      } else {
        console.error(`❌ Request failed with status ${response.status}`);
        console.error(`   Error: ${errorData.error || errorText}`);
      }
      process.exit(1);
    }

    const result = await response.json();

    if (result.success) {
      if (result.moonCircleGenerated) {
        console.log('✅ Moon Circle created successfully!');
        console.log(`   Phase: ${result.moonCircle?.phase || 'N/A'}`);
        console.log(`   Sign: ${result.moonCircle?.sign || 'N/A'}`);
        console.log(`   Date: ${result.date}`);
      } else {
        console.log('ℹ️  Moon Circle already exists or not a new/full moon');
        console.log(`   Message: ${result.message}`);
      }
    } else {
      console.error('❌ Failed to create Moon Circle');
      console.error(`   Error: ${result.error || result.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

backfillMoonCircle();
