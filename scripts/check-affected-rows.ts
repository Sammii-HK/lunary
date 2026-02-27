import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

const userIds = [
  'd7226f8f-f0a7-4bd6-b873-b129190e88ed',
  'b5b9f339-8fe1-4c09-b747-2aa9439eb7a4',
  '8058fbe9-d307-4d70-bd5c-5405fd1b5a82',
  '763f5d6a-300d-4c05-86a3-ac9401e89858',
  'b7dc8b32-4bcb-4979-abcf-da98507fd5fa',
  '21227d66-6504-4c9c-a34f-27e54681a051',
  '8a726042-9aff-416c-9c8c-e3cbfe162b1d',
  'd8f52a49-bd9e-41b6-90a4-66c8a5ba71a1',
  'b8fb2af3-5189-477b-9505-8488f29fa2a0',
];

const proposedSubs: Record<string, string> = {
  'd7226f8f-f0a7-4bd6-b873-b129190e88ed': 'sub_1SlSdEPsyR7YcHgYM643SeO4',
  'b5b9f339-8fe1-4c09-b747-2aa9439eb7a4': 'sub_1SlPV9PsyR7YcHgYWjDdrAoY',
  '8058fbe9-d307-4d70-bd5c-5405fd1b5a82': 'sub_1SlOxePsyR7YcHgYSCjW8h6h',
  '763f5d6a-300d-4c05-86a3-ac9401e89858': 'sub_1SlOadPsyR7YcHgYTVvtiF88',
  'b7dc8b32-4bcb-4979-abcf-da98507fd5fa': 'sub_1SlNn2PsyR7YcHgYYX9dOGZ3',
  '21227d66-6504-4c9c-a34f-27e54681a051': 'sub_1SlN8qPsyR7YcHgYo7k5PINJ',
  '8a726042-9aff-416c-9c8c-e3cbfe162b1d': 'sub_1SlKZNPsyR7YcHgYtedgLz6D',
  'd8f52a49-bd9e-41b6-90a4-66c8a5ba71a1': 'sub_1SlIG4PsyR7YcHgYKdF2gdv2',
  'b8fb2af3-5189-477b-9505-8488f29fa2a0': 'sub_1SlDWOPsyR7YcHgYme8DXY8k',
};

async function main() {
  const rows = await sql.query(
    `SELECT user_id, user_email, status, plan_type, stripe_subscription_id, monthly_amount_due
   FROM subscriptions WHERE user_id = ANY($1)`,
    [userIds],
  );

  console.log('\nCurrent DB vs what script would write:\n');
  for (const row of rows.rows) {
    const proposed = proposedSubs[row.user_id];
    const subChanged = row.stripe_subscription_id !== proposed;
    console.log(`${row.user_email || row.user_id}`);
    console.log(`  status:  ${row.status}  (no change — still active)`);
    console.log(`  sub_id:  ${row.stripe_subscription_id ?? '(null)'}`);
    if (subChanged) {
      console.log(
        `        → ${proposed}  ← CHANGES (old sub replaced with best active)`,
      );
    } else {
      console.log(`        → (same sub_id, only other fields refreshed)`);
    }
    console.log(`  amount:  ${row.monthly_amount_due ?? 'NULL'}`);
    console.log('');
  }
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
