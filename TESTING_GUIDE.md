# Subscription Flow Testing Guide

This guide explains how to test the subscription logic to ensure it's 100% reliable.

## Testing Tools

### 1. **Unit Tests** (Automated)

**File**: `tests/subscription-flow.test.ts`
**Purpose**: Comprehensive automated tests covering all scenarios
**Run**: `npm test tests/subscription-flow.test.ts`

**What it tests**:

- ✅ Customer creation for first-time users
- ✅ Customer reuse for returning users
- ✅ No duplicate customers on concurrent requests
- ✅ Customer lookup by metadata even if email changed
- ✅ Duplicate subscription prevention
- ✅ Webhook userId resolution (all fallback paths)
- ✅ Orphaned subscription creation when userId can't be resolved
- ✅ Auto-recovery of orphaned subscriptions
- ✅ Edge cases (deleted customers, race conditions)

### 2. **End-to-End Test Script** (Manual)

**File**: `scripts/test-subscription-flow.ts`
**Purpose**: Manual verification against live environment
**Run**: `npx ts-node scripts/test-subscription-flow.ts`

**Environment Variables**:

```bash
BASE_URL=http://localhost:3000  # Your app URL
STRIPE_SECRET_KEY=sk_test_...   # Your Stripe key
TEST_EMAIL=test@example.com     # (optional) Email to use
```

**What it tests**:

1. **Test 1**: First-time checkout creates customer with metadata
2. **Test 2**: Second checkout reuses existing customer
3. **Test 3**: 5 concurrent checkouts use same customer (no duplicates)
4. **Test 4**: Webhook processes subscription and links to user
5. **Test 5**: Active subscription prevents duplicate checkout
6. **Test 6**: Orphaned subscription auto-recovers on login

**Expected all tests pass output**.

### 3. **Health Check Script** (Production Monitoring)

**File**: `scripts/validate-subscription-health.ts`
**Purpose**: Check production for issues
**Run**: `npx ts-node scripts/validate-subscription-health.ts`

Run health check daily in production to catch any issues early.
