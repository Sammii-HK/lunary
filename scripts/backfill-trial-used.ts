import { sql } from '@vercel/postgres';

async function main() {
  const preview = process.argv.includes('--preview');

  const candidates = await sql`
    SELECT user_id, trial_ends_at, trial_used
    FROM subscriptions
    WHERE trial_used = false
    AND trial_ends_at IS NOT NULL
  `;

  console.log(`Found ${candidates.rowCount} subscriptions to backfill.`);

  if (preview || candidates.rowCount === 0) {
    console.log('Preview mode enabled; no updates applied.');
    return;
  }

  const result = await sql`
    UPDATE subscriptions
    SET trial_used = true, updated_at = NOW()
    WHERE trial_used = false
    AND trial_ends_at IS NOT NULL
  `;

  console.log(`Updated ${result.rowCount || 0} subscriptions.`);
}

main().catch((error) => {
  console.error('Failed to backfill trial_used:', error);
  process.exit(1);
});
