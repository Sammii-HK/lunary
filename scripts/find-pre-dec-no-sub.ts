import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function main() {
  const result = await sql.query(`
    SELECT 
      u.id,
      u.email,
      u.name,
      u."createdAt",
      s.status,
      s.stripe_customer_id,
      s.stripe_subscription_id
    FROM "user" u
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE u."createdAt" < '2025-12-01'
      AND u.email NOT LIKE '%test.lunary.app%'
      AND u.email NOT LIKE '%@lunary.app'
      AND u.email != 'kellow.sammii@gmail.com'
      AND (s.user_id IS NULL OR s.status IN ('free', 'cancelled'))
    ORDER BY u."createdAt" ASC
  `);

  console.log(
    `${result.rows.length} users signed up before Dec 2025 with no active sub:\n`,
  );
  for (const r of result.rows) {
    const date = new Date(r.createdAt).toISOString().split('T')[0];
    const status = r.status || '(no row)';
    const stripe = r.stripe_customer_id ? '[has stripe cus]' : '';
    console.log(`${date}  ${r.email}  ${status}  ${stripe}`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
