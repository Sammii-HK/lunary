# Quick Test Guide - Subscription Logic

## 🚀 How to Test This Is 100% Bulletproof

### Step 1: Run Database Migration (Required First!)

```bash
psql $DATABASE_URL -f sql/migrations/002_add_orphaned_subscriptions.sql
```

**Verify it worked**:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM orphaned_subscriptions;"
# Should return 0 (table exists but empty)
```

### Step 2: Run End-to-End Test

```bash
# Make sure your app is running locally
npm run dev

# In another terminal:
npx ts-node scripts/test-subscription-flow.ts
```

**What to expect**: All 6 tests should pass

```
✅ TEST 1 PASSED: First checkout created correctly
✅ TEST 2 PASSED: Customer reuse works correctly
✅ TEST 3 PASSED: No duplicate customers on concurrent requests
✅ TEST 4 PASSED: Webhook processing configured correctly
✅ TEST 5 PASSED: Duplicate prevention works
✅ TEST 6 PASSED: Auto-recovery works correctly

✅ ALL TESTS PASSED! ✅
```

**If any test fails**, check the error message and see TESTING_GUIDE.md for debugging steps.

### Step 3: Run Health Check (If you have existing data)

```bash
# Read-only mode (safe)
npx ts-node scripts/validate-subscription-health.ts

# If issues found, review them then auto-fix:
FIX=true npx ts-node scripts/validate-subscription-health.ts
```

**What to expect**: Zero issues

```
✅ No duplicate customers found
✅ All customers have userId metadata
✅ No orphaned subscriptions
✅ All active Stripe subscriptions are in database
✅ All database subscriptions exist in Stripe

✅ All checks passed! No issues found.
```

### Step 4: Manual Smoke Test

Test the actual user flow:

1. **New User Subscribe**:
   - Go to `/pricing`
   - Click "Subscribe"
   - Complete checkout with test card: `4242 4242 4242 4242`
   - Verify you're redirected to success page
   - Verify subscription shows as active

2. **Try to Subscribe Again**:
   - Go to `/pricing` again
   - Click "Subscribe"
   - Should be redirected to billing portal (not checkout)
   - Should see message: "You already have an active subscription"

3. **Check Stripe Dashboard**:
   - Find the customer
   - Verify `metadata.userId` is set
   - Verify only ONE customer exists for your test email

4. **Check Database**:
   ```sql
   SELECT * FROM subscriptions WHERE user_email = 'your-test-email@example.com';
   -- Should show status = 'active' or 'trial'
   ```

### Step 5: Test Concurrent Requests (Stress Test)

```bash
# Run this script which simulates user clicking Subscribe 5 times
npx ts-node scripts/test-subscription-flow.ts
```

Watch the output - Test 3 specifically tests concurrent requests and verifies only 1 customer is created.

### Step 6: Verify Webhook Processing

1. Create a subscription in Stripe dashboard manually
2. Set customer metadata: `userId` = some test user ID
3. Verify webhook fires and subscription appears in database
4. Check logs for: "✅ Subscription saved to database"

### Step 7: Test Orphaned Subscription Recovery

```bash
# The end-to-end test (Test 6) covers this
# Or manually:

# 1. Create subscription in Stripe WITHOUT userId metadata
# 2. User logs in and checks subscription
# 3. Should auto-link to their account
```

## ✅ Success Criteria

Your subscription logic is **bulletproof** when:

- [x] All 6 end-to-end tests pass
- [x] Health check shows zero issues
- [x] Manual smoke test works correctly
- [x] Concurrent requests create only 1 customer
- [x] Webhooks process without errors
- [x] Orphaned subscriptions auto-recover

## 🔴 Critical Things to Verify

### 1. Customer Metadata is ALWAYS Set

```bash
# Check any customer in Stripe
stripe customers retrieve cus_xxx

# Should see:
{
  "id": "cus_xxx",
  "metadata": {
    "userId": "user-uuid-here"  # <-- MUST BE PRESENT
  }
}
```

### 2. No Duplicate Customers

```bash
# Search for email
stripe customers list --email user@example.com

# Should return exactly 1 customer
```

### 3. Database Matches Stripe

```sql
-- Check subscriptions table
SELECT user_id, stripe_customer_id, stripe_subscription_id, status
FROM subscriptions
WHERE status IN ('active', 'trial', 'past_due');

-- For each row, verify the subscription exists in Stripe with same status
```

### 4. Webhooks Don't Throw Errors

```bash
# Check webhook event table
SELECT processing_status, failure_reason
FROM stripe_webhook_events
WHERE processing_status = 'failed'
AND created_at > NOW() - INTERVAL '24 hours';

# Should return 0 rows
```

### 5. Orphaned Subscriptions Get Resolved

```sql
-- Check orphaned subscriptions
SELECT COUNT(*) FROM orphaned_subscriptions WHERE resolved = FALSE;

-- Should be 0 or very low (<5)
-- Any orphaned subs should auto-resolve when user logs in
```

## 🚨 Red Flags to Watch For

**BAD** - These indicate the fix isn't working:

- ❌ Multiple customers with same email in Stripe
- ❌ Customer without `metadata.userId`
- ❌ Webhook errors: "Unable to resolve userId"
- ❌ User can create checkout while having active subscription
- ❌ Orphaned subscriptions not auto-recovering

**GOOD** - These indicate it's working:

- ✅ Log: "Found existing customer cus_xxx for user user-xxx"
- ✅ Log: "Set userId metadata on customer cus_xxx"
- ✅ Log: "User xxx already has active subscription. Redirecting to billing portal"
- ✅ Log: "Auto-recovering orphaned subscription"
- ✅ Exactly 1 customer per user email in Stripe

## 📊 Production Monitoring

After deployment, run this daily:

```bash
# Add to cron or GitHub Actions
npx ts-node scripts/validate-subscription-health.ts | mail -s "Subscription Health" admin@example.com
```

## 🆘 If Tests Fail

1. **Check the error message** - it will tell you what went wrong
2. **See TESTING_GUIDE.md** - has debugging steps for each test
3. **Check the logs** - look for the ✅/❌ messages
4. **Verify database migration ran** - orphaned_subscriptions table must exist
5. **Check Stripe API key** - must be set correctly

## 📞 Support

If you're still seeing issues after all tests pass:

1. Run with verbose logging:

   ```bash
   VERBOSE=true npx ts-node scripts/test-subscription-flow.ts
   ```

2. Check production logs for specific error messages

3. Run health check in production:

   ```bash
   # Against production database
   DATABASE_URL=<prod-url> STRIPE_SECRET_KEY=<prod-key> \
   npx ts-node scripts/validate-subscription-health.ts
   ```

4. Review the SUBSCRIPTION_FIX_README.md for complete technical details

---

**Remember**: This is critical payment logic. All tests must pass before deploying to production!
