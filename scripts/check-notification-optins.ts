import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function checkOptIns() {
  console.log('\n📊 NOTIFICATION OPT-IN ANALYSIS\n');

  // Total users
  const totalUsers = await sql`
    SELECT COUNT(*) as total FROM "user"
  `;

  // Push subscriptions (opted in)
  const pushSubs = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active
    FROM push_subscriptions
  `;

  // Check what the notification crons are actually sending to
  const activeSubsCheck = await sql`
    SELECT COUNT(*) as sending_to FROM push_subscriptions WHERE is_active = true
  `;

  console.log(`Total Users in System:       ${totalUsers.rows[0]?.total}`);
  console.log(`Push Subscriptions (total):  ${pushSubs.rows[0]?.total}`);
  console.log(`Push Subscriptions (active): ${pushSubs.rows[0]?.active}`);
  console.log(
    `Notification crons sending to: ${activeSubsCheck.rows[0]?.sending_to} people`,
  );

  // Estimate CPU waste
  const activeOpts = pushSubs.rows[0]?.active || 0;
  const totalUserCount = totalUsers.rows[0]?.total || 0;

  console.log(
    `\n⚠️  You have ${totalUserCount} total users but only ${activeOpts} opted into push.`,
  );

  if (activeOpts < 100) {
    console.log(
      `This means your notification crons are likely QUERYING all ${totalUserCount} users`,
    );
    console.log(`and filtering down to ${activeOpts} — massive CPU waste.\n`);
  }

  // Check preferences
  const preferences = await sql`
    SELECT 
      preferences as prefs,
      COUNT(*) as count
    FROM push_subscriptions
    WHERE is_active = true
    GROUP BY preferences
    ORDER BY count DESC
    LIMIT 10
  `;

  console.log(`\nTop notification preference patterns:`);
  console.log('────────────────────────────────────────────');
  for (const row of preferences.rows) {
    console.log(
      `  ${JSON.stringify(row.prefs).substring(0, 80)} → ${row.count} users`,
    );
  }

  console.log('\n');
}

checkOptIns().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
