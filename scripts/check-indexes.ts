import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });

async function check() {
  console.log('Checking indexes on conversion_events...\n');

  const indexes = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'conversion_events'
    ORDER BY indexname
  `;

  if (indexes.rows.length === 0) {
    console.log('❌ NO INDEXES FOUND!');
    console.log('Run: pnpm run setup-db');
  } else {
    console.log(`✅ Found ${indexes.rows.length} indexes:\n`);
    indexes.rows.forEach((row: any) => {
      console.log(`- ${row.indexname}`);
    });
  }
}

check().then(() => process.exit(0));
