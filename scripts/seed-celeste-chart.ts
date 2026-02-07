/**
 * One-time script to export Celeste's birth chart from the database to a static JSON file.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-celeste-chart.ts
 *
 * Requires:
 *   - POSTGRES_URL or DATABASE_URL env var (or .env file loaded)
 *   - PERSONA_EMAIL env var pointing to Celeste's user email
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const personaEmail = process.env.PERSONA_EMAIL;
  if (!personaEmail) {
    console.error('PERSONA_EMAIL env var not set');
    process.exit(1);
  }

  console.log(`Fetching chart for: ${personaEmail}`);

  const userResult = await sql`
    SELECT id FROM "user" WHERE LOWER(email) = LOWER(${personaEmail}) LIMIT 1
  `;

  if (userResult.rows.length === 0) {
    console.error('User not found');
    process.exit(1);
  }

  const userId = userResult.rows[0].id;

  const profileResult = await sql`
    SELECT birth_chart FROM user_profiles WHERE user_id = ${userId} LIMIT 1
  `;

  if (profileResult.rows.length === 0 || !profileResult.rows[0].birth_chart) {
    console.error('No birth chart data found');
    process.exit(1);
  }

  const outputPath = resolve(__dirname, '../src/lib/data/celeste-chart.json');

  writeFileSync(
    outputPath,
    JSON.stringify(profileResult.rows[0].birth_chart, null, 2),
  );

  console.log(`Wrote chart data to ${outputPath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
