import { sql } from '@vercel/postgres';
import { addBrevoNewsletterContact } from '@/lib/brevo';

type SubscriberRow = {
  email: string;
  source: string | null;
};

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 100;

if (!Number.isFinite(limit) || limit <= 0) {
  throw new Error('Invalid --limit value');
}

async function fetchBatch(offset: number) {
  const result = await sql<SubscriberRow>`
    SELECT email, source
    FROM newsletter_subscribers
    WHERE is_active = true
      AND is_verified = true
      AND preferences->>'weeklyNewsletter' = 'true'
    ORDER BY created_at ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return result.rows;
}

async function run() {
  console.log(
    `🔁 Backfilling Brevo newsletter contacts (limit=${limit}, dryRun=${isDryRun})`,
  );

  let offset = 0;
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalFailed = 0;

  while (true) {
    const batch = await fetchBatch(offset);

    if (batch.length === 0) {
      break;
    }

    console.log(`📦 Processing batch ${offset / limit + 1} (${batch.length})`);

    for (const subscriber of batch) {
      totalProcessed += 1;

      if (isDryRun) {
        continue;
      }

      try {
        const result = await addBrevoNewsletterContact(
          subscriber.email,
          subscriber.source || 'newsletter_backfill',
        );

        if (result.ok) {
          totalSuccess += 1;
        } else {
          totalFailed += 1;
          console.warn(
            `⚠️ Skipped ${subscriber.email}: ${result.reason || 'unknown reason'}`,
          );
        }
      } catch (error) {
        totalFailed += 1;
        console.error(
          `❌ Failed to sync ${subscriber.email}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    offset += batch.length;
  }

  console.log(
    `✅ Backfill complete. Processed: ${totalProcessed}, Success: ${totalSuccess}, Failed: ${totalFailed}`,
  );
}

run().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
