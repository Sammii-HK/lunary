# Subscription & Webhook Logic Fixes

## Problem Summary

Users were able to create multiple Stripe accounts and subscriptions because:

1. **Multiple Customer Creation**: The checkout flow wasn't properly checking for existing customers before creating new ones
2. **Webhook Failures**: When webhooks couldn't resolve a userId, they threw errors causing Stripe to retry
3. **Race Conditions**: Metadata wasn't being set immediately, causing webhooks to fail to link subscriptions to users
4. **User Confusion**: When payments didn't appear to process immediately, users would try again, creating duplicates

## What Was Fixed

### 1. Prevent Duplicate Customer Creation

**File**: `src/app/api/stripe/create-checkout-session/route.ts`

**Changes**:

- ✅ Database lookup happens FIRST before any Stripe API calls
- ✅ Customer metadata (userId) is set IMMEDIATELY during checkout creation
- ✅ Customer ID is persisted to database BEFORE returning checkout session
- ✅ Strict email matching prevents false positives
- ✅ Added idempotency to customer creation
- ✅ Better logging to track customer creation/reuse

**Before**: Customer creation happened after multiple failed lookups, metadata set later
**After**: Database check first, metadata set immediately, customer persisted before checkout

### 2. Resilient Webhook Handling

**File**: `src/app/api/stripe/webhooks/route.ts`

**Changes**:

- ✅ Webhooks NO LONGER THROW ERRORS when userId can't be resolved
- ✅ Orphaned subscriptions are stored in a new table for manual review
- ✅ Better logging with full context for debugging
- ✅ Returns success to Stripe to prevent infinite retries

**Before**: Webhook threw error → Stripe retried → User stayed paywalled → User tried again
**After**: Webhook stores orphaned subscription → Admin can manually link → No duplicate attempts

### 3. Orphaned Subscription Recovery

**New Files**:

- `sql/migrations/002_add_orphaned_subscriptions.sql` - Database table
- `src/app/api/admin/resolve-orphaned-subscriptions/route.ts` - Admin API

**Features**:

- 📊 Automatic storage of subscriptions where userId couldn't be resolved
- 🔄 Auto-recovery when user checks their subscription
- 🛠️ Admin API to manually link orphaned subscriptions
- 📝 Full audit trail of resolution

### 4. Duplicate Detection & Prevention

**Changes in**: `src/app/api/stripe/create-checkout-session/route.ts`

**Features**:

- ✅ Checks for existing active subscriptions before creating checkout
- ✅ Redirects to billing portal if subscription already exists
- ✅ Warns about orphaned subscriptions that might need linking
- ✅ Prevents users from accidentally creating duplicate subscriptions

### 5. Automatic Recovery

**Changes in**: `src/app/api/stripe/get-subscription/route.ts`

**Features**:

- 🔄 Automatically checks for orphaned subscriptions matching user email
- 🔗 Auto-links orphaned subscriptions when user logs in
- ✅ Updates Stripe metadata automatically
- 📝 Marks orphaned subscription as resolved

### 6. Cleanup Tools

**New File**: `scripts/fix-duplicate-customers.ts`

**Features**:

- 🔍 Scans for users with multiple Stripe customers
- 🎯 Identifies which customer to keep (active subscription priority)
- 🗑️ Cancels and archives duplicate customers
- ⚠️ Dry-run mode by default for safety

## Database Schema Changes

### New Table: `orphaned_subscriptions`

```sql
CREATE TABLE orphaned_subscriptions (
  id SERIAL PRIMARY KEY,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  customer_email TEXT,
  status TEXT NOT NULL,
  plan_type TEXT,
  subscription_metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_user_id TEXT,
  resolved_at TIMESTAMP,
  resolved_by TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## How to Deploy

### 1. Run Database Migration

```bash
# Apply the orphaned subscriptions table
psql $DATABASE_URL -f sql/migrations/002_add_orphaned_subscriptions.sql
```

### 2. Clean Up Existing Duplicates (Optional)

```bash
# Dry run first (recommended)
DRY_RUN=true npx ts-node scripts/fix-duplicate-customers.ts

# Review the output, then run for real
DRY_RUN=false npx ts-node scripts/fix-duplicate-customers.ts
```

### 3. Deploy Code Changes

Deploy the updated files to production:

- `src/app/api/stripe/create-checkout-session/route.ts`
- `src/app/api/stripe/webhooks/route.ts`
- `src/app/api/stripe/get-subscription/route.ts`
- `src/app/api/admin/resolve-orphaned-subscriptions/route.ts`

## Admin Tools

### View Orphaned Subscriptions

```bash
GET /api/admin/resolve-orphaned-subscriptions
```

Returns list of all unresolved orphaned subscriptions.

### Manually Link Orphaned Subscription

```bash
POST /api/admin/resolve-orphaned-subscriptions
{
  "subscriptionId": "sub_xxxxx",
  "userId": "user-uuid",
  "action": "link"
}
```

### Cancel Orphaned Subscription

```bash
POST /api/admin/resolve-orphaned-subscriptions
{
  "subscriptionId": "sub_xxxxx",
  "action": "cancel"
}
```

## Monitoring

### Key Log Messages

**Customer Creation**:

```
✅ Found existing customer cus_xxxxx for user user-uuid
✅ Created new Stripe customer cus_xxxxx for user user-uuid
✅ Set userId metadata on customer cus_xxxxx
```

**Webhook Processing**:

```
⚠️ CRITICAL: Unable to resolve userId for subscription
✅ Stored orphaned subscription for manual review: sub_xxxxx
```

**Auto-Recovery**:

```
🔄 Auto-recovering orphaned subscription sub_xxxxx for user user-uuid
✅ Successfully auto-recovered subscription for user user-uuid
```

**Duplicate Prevention**:

```
⚠️ User user-uuid already has active subscription. Redirecting to billing portal.
```

## Testing Checklist

- [ ] New user creates subscription → customer created with metadata
- [ ] Existing user creates subscription → reuses existing customer
- [ ] User with orphaned subscription logs in → auto-recovery works
- [ ] User tries to create duplicate subscription → redirected to portal
- [ ] Webhook receives subscription without userId → stored as orphaned
- [ ] Admin can view orphaned subscriptions via API
- [ ] Admin can manually link orphaned subscription
- [ ] No duplicate customers created for same user

## Rollback Plan

If issues occur:

1. **Revert webhook changes**: The old webhook behavior threw errors, which at least prevented bad data from being stored. Revert to previous version if auto-recovery causes issues.

2. **Disable auto-recovery**: Comment out the auto-recovery section in `get-subscription/route.ts` if it causes problems.

3. **Database rollback**:

```sql
DROP TABLE IF EXISTS orphaned_subscriptions;
```

## Support Scenarios

### Scenario 1: User says "I paid but I'm still paywalled"

1. Check orphaned subscriptions:

   ```
   GET /api/admin/resolve-orphaned-subscriptions
   ```

2. Find subscription matching user's email

3. Link it manually:
   ```
   POST /api/admin/resolve-orphaned-subscriptions
   {
     "subscriptionId": "sub_xxxxx",
     "userId": "user-uuid",
     "action": "link"
   }
   ```

### Scenario 2: User has duplicate subscriptions

1. Check their subscriptions in Stripe dashboard

2. Identify which subscription should be kept (usually the active one)

3. Cancel duplicate subscription:
   ```
   POST /api/admin/resolve-orphaned-subscriptions
   {
     "subscriptionId": "sub_xxxxx",
     "action": "cancel"
   }
   ```

### Scenario 3: User has multiple Stripe customer accounts

1. Run the cleanup script:

   ```bash
   DRY_RUN=false npx ts-node scripts/fix-duplicate-customers.ts
   ```

2. Or manually in Stripe dashboard:
   - Identify primary customer (one with active subscription)
   - Cancel subscriptions on duplicate customers
   - Delete duplicate customer accounts

## Key Metrics to Monitor

1. **Orphaned subscription rate**: Number of orphaned subscriptions created per week
2. **Auto-recovery success rate**: Percentage of orphaned subscriptions auto-linked
3. **Duplicate customer creation**: Should be near zero after fixes
4. **Webhook failure rate**: Should be near zero (no more userId resolution errors)
5. **Duplicate subscription attempts**: Track portal redirects vs new checkouts

## Additional Notes

- All fixes are backward compatible with existing subscriptions
- Auto-recovery is safe and won't link wrong subscriptions (matches by email)
- Idempotency prevents duplicates even if user clicks "Subscribe" multiple times
- Better logging makes debugging future issues much easier
- Admin tools allow manual intervention when edge cases occur
