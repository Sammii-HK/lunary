# Subscription Fix Deployment Checklist

## Pre-Deployment

- [ ] Review all changes in `SUBSCRIPTION_FIX_README.md`
- [ ] Test locally with Stripe test mode
- [ ] Verify database migration SQL syntax

## Deployment Steps

### Step 1: Database Migration (5 minutes)

```bash
# Connect to production database
psql $DATABASE_URL -f sql/migrations/002_add_orphaned_subscriptions.sql

# Verify table was created
psql $DATABASE_URL -c "SELECT COUNT(*) FROM orphaned_subscriptions;"
```

### Step 2: Deploy Code (Standard deployment)

Deploy these modified files:

- ✅ `src/app/api/stripe/create-checkout-session/route.ts`
- ✅ `src/app/api/stripe/webhooks/route.ts`
- ✅ `src/app/api/stripe/get-subscription/route.ts`
- ✅ `src/app/api/admin/resolve-orphaned-subscriptions/route.ts` (new)
- ✅ `scripts/fix-duplicate-customers.ts` (new)

### Step 3: Verify Deployment (10 minutes)

```bash
# Test 1: Create checkout session
curl -X POST https://your-domain/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_xxx","userId":"test-user","userEmail":"test@example.com"}'

# Test 2: Check for orphaned subscriptions
curl https://your-domain/api/admin/resolve-orphaned-subscriptions

# Test 3: Check logs for new log messages
# Look for: "✅ Found existing customer" or "✅ Created new Stripe customer"
```

### Step 4: Clean Up Existing Issues (30-60 minutes)

```bash
# 1. Find and fix duplicate customers (DRY RUN first!)
DRY_RUN=true npx ts-node scripts/fix-duplicate-customers.ts

# Review output carefully, then:
DRY_RUN=false npx ts-node scripts/fix-duplicate-customers.ts

# 2. Check for orphaned subscriptions
curl https://your-domain/api/admin/resolve-orphaned-subscriptions

# 3. Manually link any orphaned subscriptions
# For each orphaned subscription, find the user by email and link:
curl -X POST https://your-domain/api/admin/resolve-orphaned-subscriptions \
  -H "Content-Type: application/json" \
  -d '{"subscriptionId":"sub_xxx","userId":"user-id","action":"link"}'
```

## Post-Deployment Monitoring (First 24 hours)

### Watch for these log messages:

**Good signs (expected)**:

- `✅ Found existing customer cus_xxx for user user-xxx`
- `✅ Set userId metadata on customer cus_xxx`
- `⚠️ User xxx already has active subscription. Redirecting to billing portal.`

**Needs attention**:

- `⚠️ CRITICAL: Unable to resolve userId for subscription`
  → Check orphaned subscriptions and link manually
- `Multiple customers found for email xxx`
  → Run duplicate cleanup script

**Should NOT see**:

- `✅ Created new Stripe customer` for existing users
  → If you see this, something is wrong with customer lookup

### Metrics to Track

```sql
-- Count orphaned subscriptions
SELECT COUNT(*) FROM orphaned_subscriptions WHERE resolved = FALSE;

-- Check auto-recovery success
SELECT COUNT(*) FROM orphaned_subscriptions WHERE resolved_by = 'auto_recovery';

-- Find users with multiple customer IDs (shouldn't happen anymore)
SELECT user_id, COUNT(DISTINCT stripe_customer_id) as customer_count
FROM subscriptions
WHERE stripe_customer_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(DISTINCT stripe_customer_id) > 1;
```

## Rollback Procedure (if needed)

If critical issues occur:

```bash
# 1. Revert code deployment (use your normal rollback process)

# 2. Keep the orphaned_subscriptions table (useful for debugging)
# DO NOT drop it unless absolutely necessary

# 3. Manually fix any users affected during deployment window
# Use Stripe dashboard to link subscriptions
```

## Success Criteria

After deployment, verify:

- [ ] No new duplicate customers being created
- [ ] Webhooks processing successfully (no userId resolution errors)
- [ ] Users with active subscriptions can't create duplicates
- [ ] Orphaned subscriptions being auto-recovered
- [ ] Existing duplicate customers cleaned up
- [ ] All new subscriptions have userId metadata set

## Support Response Templates

### "I paid but I'm still paywalled"

1. Check orphaned subscriptions:

   ```
   GET /api/admin/resolve-orphaned-subscriptions
   ```

2. Find by email, then link:

   ```
   POST /api/admin/resolve-orphaned-subscriptions
   {
     "subscriptionId": "sub_xxx",
     "userId": "user-id",
     "action": "link"
   }
   ```

3. User should refresh and see subscription active

### "I was charged twice"

1. Check Stripe dashboard for duplicate subscriptions
2. Cancel the duplicate:
   ```
   POST /api/admin/resolve-orphaned-subscriptions
   {
     "subscriptionId": "sub_xxx",
     "action": "cancel"
   }
   ```
3. Refund in Stripe dashboard if needed

## Contact

If issues arise during deployment, check:

- Application logs for error details
- Stripe webhook logs for delivery failures
- Database for orphaned subscriptions
- This README for troubleshooting steps
