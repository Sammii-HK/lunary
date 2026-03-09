#!/usr/bin/env node
/**
 * Backfill conversion_events for users who subscribed/trialled via Stripe webhook
 * but never had a trial_started or subscription_started event recorded.
 *
 * Safe: append-only, never modifies existing rows, uses event_id unique constraint
 * to prevent duplicates even if run multiple times.
 *
 * Usage:
 *   node scripts/backfill-conversion-events.js          dry run (default)
 *   node scripts/backfill-conversion-events.js --execute actually insert
 *
 * Requires: PROD_DB env var
 */

const { Pool } = require('pg');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const DRY_RUN = !process.argv.includes('--execute');

// Load from .env.local if PROD_DB not set
function loadEnv() {
  if (process.env.PROD_DB) return process.env.PROD_DB;
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return null;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^POSTGRES_URL=(.+)$/);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const PROD_DB = loadEnv();

if (!PROD_DB) {
  console.error('Missing PROD_DB env var or POSTGRES_URL in .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: PROD_DB });

// Map plan_type from subscriptions table to monthly/yearly for conversion_events
function toPlanType(plan_type) {
  if (!plan_type || plan_type === 'free') return 'monthly';
  if (plan_type.includes('annual')) return 'yearly';
  return 'monthly';
}

// Infer trial start from trial_ends_at and plan type
function inferTrialStartedAt(row) {
  if (row.trial_ends_at) {
    const trialDays = toPlanType(row.plan_type) === 'yearly' ? 14 : 7;
    const d = new Date(row.trial_ends_at);
    d.setDate(d.getDate() - trialDays);
    return d;
  }
  return new Date(row.created_at);
}

async function main() {
  const client = await pool.connect();

  try {
    console.log(
      DRY_RUN
        ? '🔍 DRY RUN — no changes will be made\n'
        : '✏️  EXECUTE mode — inserting rows\n',
    );

    // Fetch all users who ever had a paid subscription
    const { rows: subs } = await client.query(`
      SELECT
        user_id,
        user_email,
        status,
        plan_type,
        trial_used,
        trial_ends_at,
        created_at,
        promo_code,
        coupon_id
      FROM subscriptions
      WHERE status IN ('active', 'trial', 'past_due', 'cancelled')
         OR trial_used = true
      ORDER BY created_at ASC
    `);

    console.log(`Found ${subs.length} subscription rows to process\n`);

    let toInsert = [];
    let alreadyHaveEvent = 0;

    for (const row of subs) {
      if (!row.user_id) continue;

      // Determine event type
      const eventType = row.trial_used
        ? 'trial_started'
        : 'subscription_started';

      // Check if this user already has this event type in conversion_events
      const { rows: existing } = await client.query(
        `SELECT id FROM conversion_events
         WHERE user_id = $1 AND event_type = $2
         LIMIT 1`,
        [row.user_id, eventType],
      );

      if (existing.length > 0) {
        alreadyHaveEvent++;
        continue;
      }

      const inferredAt = row.trial_used
        ? inferTrialStartedAt(row)
        : new Date(row.created_at);

      const planType = toPlanType(row.plan_type);
      const hasCoupon = !!(row.promo_code || row.coupon_id);

      toInsert.push({
        event_type: eventType,
        user_id: row.user_id,
        user_email: row.user_email,
        plan_type: planType,
        created_at: inferredAt,
        event_id: randomUUID(),
        metadata: {
          backfilled: true,
          source: 'subscriptions_backfill',
          original_status: row.status,
          original_plan_type: row.plan_type,
          has_coupon: hasCoupon,
          inferred_from: row.trial_ends_at ? 'trial_ends_at' : 'created_at',
        },
      });
    }

    console.log(`Already have event:  ${alreadyHaveEvent}`);
    console.log(`Would insert:        ${toInsert.length}\n`);

    if (toInsert.length === 0) {
      console.log('Nothing to insert.');
      return;
    }

    // Preview first 5
    console.log('Sample rows to insert:');
    toInsert.slice(0, 5).forEach((r) => {
      console.log(
        `  ${r.event_type} | user: ${r.user_id} | plan: ${r.plan_type} | at: ${r.created_at.toISOString()} | coupon: ${r.metadata.has_coupon}`,
      );
    });

    if (toInsert.length > 5) {
      console.log(`  ... and ${toInsert.length - 5} more\n`);
    }

    if (DRY_RUN) {
      console.log('\n✅ Dry run complete. Run with --execute to apply.');
      return;
    }

    // Insert in batches of 50
    const BATCH = 50;
    let inserted = 0;

    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH);

      for (const r of batch) {
        await client.query(
          `INSERT INTO conversion_events
             (event_type, user_id, user_email, plan_type, created_at, event_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (event_id) DO NOTHING`,
          [
            r.event_type,
            r.user_id,
            r.user_email,
            r.plan_type,
            r.created_at,
            r.event_id,
            JSON.stringify(r.metadata),
          ],
        );
        inserted++;
      }

      console.log(
        `  Inserted ${Math.min(i + BATCH, toInsert.length)} / ${toInsert.length}...`,
      );
    }

    console.log(`\n✅ Done. Inserted ${inserted} events.`);
    console.log(
      'Note: historical metrics will now show data, but timestamps are inferred.',
    );
    console.log(
      "Filter with: WHERE metadata->>'backfilled' = 'true' to exclude if needed.",
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
