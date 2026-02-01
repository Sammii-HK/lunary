# Database Migration Guide

## What These Tables Do

### 1. **orphaned_subscriptions** (New)

**Purpose**: Stores subscriptions where we couldn't automatically determine which user they belong to.

**Why it's needed:**

- When Stripe webhooks fire but userId metadata is missing
- Instead of throwing errors (which caused your original problem), we save them here
- Admin can manually link them OR user auto-recovers when they log in

**Example scenario:**

- User completes Stripe checkout
- Webhook fires before metadata is set (race condition)
- Instead of failing, we store it as "orphaned"
- When user logs in, we find it by email and auto-link it
- User sees their subscription immediately ✅

### 2. **stripe_webhook_events** (New)

**Purpose**: Tracks every webhook event from Stripe for idempotency and debugging.

**Why it's needed:**

- Prevents processing the same webhook twice (idempotency)
- Logs failures with full context for debugging
- Allows retries without duplicating data

### 3. **subscription_audit_log** (New)

**Purpose**: Audit trail of all subscription changes.

**Why it's needed:**

- Track who changed what and when
- Debug subscription issues
- Compliance and accountability

### 4. **subscriptions** (Updated)

**New fields added:**

- `trial_used`: Prevents users from getting multiple free trials
- `promo_code`: Stores which promo code was used
- `discount_ends_at`: When promotional discount expires
- `sync_error_count`: Number of failed sync attempts
- `last_sync_error`: Last error message
- `last_sync_error_at`: When last error occurred

## How to Run the Migration

### Step 1: Create the Migration

```bash
npx prisma migrate dev --name add_orphaned_subscriptions_and_webhook_tracking
```

This will:

- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Regenerate the Prisma Client

### Step 2: Verify It Worked

```bash
# Check that tables exist
psql $DATABASE_URL -c "\dt orphaned_subscriptions"
psql $DATABASE_URL -c "\dt stripe_webhook_events"
psql $DATABASE_URL -c "\dt subscription_audit_log"

# Should show the tables
```

### Step 3: Deploy to Production

```bash
# On production server
npx prisma migrate deploy
```

## Alternative: Manual SQL Migration

If you prefer to run the SQL directly (for more control):

```bash
# Generate the migration SQL without applying it
npx prisma migrate dev --create-only --name add_orphaned_subscriptions_and_webhook_tracking

# This creates a migration file at:
# prisma/migrations/TIMESTAMP_add_orphaned_subscriptions_and_webhook_tracking/migration.sql

# Review the SQL, then apply manually:
psql $DATABASE_URL -f prisma/migrations/TIMESTAMP_add_orphaned_subscriptions_and_webhook_tracking/migration.sql
```

## What the Migration Does

The migration will:

1. ✅ Create `orphaned_subscriptions` table with 14 fields
2. ✅ Create `stripe_webhook_events` table with 13 fields
3. ✅ Create `subscription_audit_log` table with 9 fields
4. ✅ Add 6 new fields to `subscriptions` table
5. ✅ Create 15+ indexes for query performance

**Total changes**: 3 new tables, 1 updated table, ~15 new indexes

## Rollback Plan

If you need to rollback:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Or manually:
DROP TABLE orphaned_subscriptions;
DROP TABLE stripe_webhook_events;
DROP TABLE subscription_audit_log;

ALTER TABLE subscriptions
  DROP COLUMN trial_used,
  DROP COLUMN promo_code,
  DROP COLUMN discount_ends_at,
  DROP COLUMN sync_error_count,
  DROP COLUMN last_sync_error,
  DROP COLUMN last_sync_error_at;
```

## After Migration

Once the migration is complete, the new subscription logic will:

1. ✅ **Prevent duplicate customers** - Database lookup happens first
2. ✅ **Handle webhook failures gracefully** - Orphaned subs stored instead of errors
3. ✅ **Auto-recover orphaned subs** - When user logs in, auto-links by email
4. ✅ **Track everything** - Full audit trail and webhook event history

## Testing After Migration

Run the test script to verify:

```bash
npx ts-node scripts/test-subscription-flow.ts
```

Should see:

```
✅ TEST 1 PASSED: First checkout created correctly
✅ TEST 2 PASSED: Customer reuse works correctly
✅ TEST 3 PASSED: No duplicate customers on concurrent requests
✅ TEST 4 PASSED: Webhook processing configured correctly
✅ TEST 5 PASSED: Duplicate prevention works
✅ TEST 6 PASSED: Auto-recovery works correctly
```

## Database Size Impact

**Expected increase**:

- ~10-20 KB per 1000 webhook events
- ~5-10 KB per 100 orphaned subscriptions
- Negligible for subscription table updates

**Total**: Very minimal, these tables are lightweight.

## Questions?

- See `SUBSCRIPTION_FIX_README.md` for complete technical details
- See `QUICK_TEST_GUIDE.md` for testing instructions
- See `TESTING_GUIDE.md` for comprehensive testing docs
