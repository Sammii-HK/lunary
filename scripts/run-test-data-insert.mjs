import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';

async function insertTestData() {
  console.log('🌙 Inserting test journal data...\n');

  try {
    // Read and execute the SQL file
    const sqlContent = readFileSync('scripts/insert-test-journal-data.sql', 'utf8');

    // Split by semicolons but keep the statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== 'BEGIN' && s !== 'COMMIT');

    for (const statement of statements) {
      if (statement.includes('SELECT')) {
        const result = await sql.query(statement);
        console.log('Query result:', result.rows);
      } else {
        await sql.query(statement);
      }
    }

    console.log('✅ Test data inserted successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

insertTestData();
