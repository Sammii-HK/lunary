# Analytics Bugs - Comprehensive Fix List

## Critical Bugs Found

### 1. ❌ Conversion Funnel - Broken Status Logic

**File:** `src/app/api/admin/analytics/conversions/route.ts`
**Lines:** 205-227

**Problem:**

```typescript
// Counts subscriptions with CURRENT status='trial' that were updated in range
const trialUsersResult = await sql`
  WHERE status = 'trial'
  AND updated_at BETWEEN ...
`;

// Counts subscriptions with CURRENT status='active' that were updated in range
const paidUsersResult = await sql`
  WHERE status = 'active'
  AND updated_at BETWEEN ...
`;
```

**Why It's Wrong:**

- Free users (163): Counts users CREATED in range ✓
- Trial users (2): Counts subscriptions WHERE status='trial' AND updated in range ❌
  - Misses users who started trial but already converted to paid
  - Only counts subscriptions still in trial state
- Paid users (7): Counts subscriptions WHERE status='active' AND updated in range ❌
  - Can be > trial users because it counts different thing!

**Expected Behavior:**
Should count conversion EVENTS that happened in range, not current status:

- Free: Users created in range
- Trial: Users who STARTED trial in range (regardless of current status)
- Paid: Users who BECAME paid in range (regardless of current status)

**Fix:**

```typescript
// Count trial_started events in range
const trialUsersResult = await sql`
  SELECT COUNT(DISTINCT user_id) as count
  FROM conversion_events
  WHERE event_type = 'trial_started'
  AND created_at BETWEEN ${start} AND ${end}
  AND (user_email IS NULL OR ...)
`;

// Count subscription_started / trial_converted events in range
const paidUsersResult = await sql`
  SELECT COUNT(DISTINCT user_id) as count
  FROM conversion_events
  WHERE event_type IN ('subscription_started', 'trial_converted')
  AND created_at BETWEEN ${start} AND ${end}
  AND (user_email IS NULL OR ...)
`;
```

---

### 2. ❌ DAU/WAU/MAU Retention - Time Interval Bug

**File:** `src/app/api/admin/analytics/dau-wau-mau/route.ts`
**Lines:** 765-855 (calcRetention function)

**Problem:**

```typescript
// Uses time intervals instead of calendar days
AND ce.created_at <= cohort."createdAt" + INTERVAL '${days} days'
```

**Why It's Wrong:**

- Same bug we just fixed in cohorts/route.ts!
- Uses 24-hour time windows instead of calendar days
- Fails when users return >24h after signup but still on next calendar day
- Causes Day 1 < Day 7 (impossible!)

**Evidence from User's Data:**

```
Cohort: Jan 12, 2026
- Day 1: 33.3%
- Day 7: 44.4%   ← IMPOSSIBLE! Should be ≥ Day 1
- Day 30: 44.4%
```

**Fix:**
Use calendar day logic like we did in cohorts/route.ts:

```typescript
// For Day 1
AND DATE(ce.created_at AT TIME ZONE 'UTC') =
    DATE(cohort."createdAt" AT TIME ZONE 'UTC') + 1

// For Day 7
AND DATE(ce.created_at AT TIME ZONE 'UTC') BETWEEN
    DATE(cohort."createdAt" AT TIME ZONE 'UTC') + 1 AND
    DATE(cohort."createdAt" AT TIME ZONE 'UTC') + 7

// For Day 30
AND DATE(ce.created_at AT TIME ZONE 'UTC') BETWEEN
    DATE(cohort."createdAt" AT TIME ZONE 'UTC') + 1 AND
    DATE(cohort."createdAt" AT TIME ZONE 'UTC') + 30
```

---

### 3. ⚠️ Engagement Metrics Look Suspiciously Low

**Current Values:**

```
Engaged DAU: 7
Engaged WAU: 30
Engaged MAU: 621
```

**Potential Issues:**

- Numbers seem very low for a real product
- Need to verify event definitions in ENGAGEMENT_EVENTS array
- Check if identity stitching (0.7% coverage) is causing undercounting

**Investigation Needed:**

1. Run query to check actual event volumes
2. Verify ENGAGEMENT_EVENTS list includes right events
3. Check if requireSignedIn filter is too restrictive

---

## Fix Priority

### P0 - Fix Immediately (Blocking Decisions)

1. ✅ **Cohort retention calendar day logic** - FIXED in cohorts/route.ts
2. ❌ **DAU/WAU/MAU retention calendar day logic** - NEEDS FIX in dau-wau-mau/route.ts
3. ❌ **Conversion funnel status logic** - NEEDS FIX in conversions/route.ts

### P1 - Fix Soon (Data Accuracy)

4. ⚠️ Investigate engagement metrics (DAU/WAU/MAU seem low)
5. ⚠️ Identity stitching coverage (0.7% is very low)

### P2 - Nice to Have (Cleanup)

6. ℹ️ Event list consistency across endpoints
7. ℹ️ Orphaned identity links cleanup
8. ℹ️ Duplicate anonymous IDs cleanup

---

## Testing Plan

### After Each Fix:

1. Run audit script to verify metrics
2. Check that retention values are monotonic: Day 1 ≥ Day 7 ≥ Day 30
3. Check that funnel is monotonic: Free ≥ Trial ≥ Paid
4. Verify DAU ≤ WAU ≤ MAU

### Acceptance Criteria:

- ✅ Day 1 retention ≥ Day 7 retention ≥ Day 30 retention
- ✅ Free users ≥ Trial users ≥ Paid users
- ✅ DAU ≤ WAU ≤ MAU
- ✅ Non-zero retention rates (15-40% Day 1 is normal)
- ✅ Stickiness ratios make sense (1-10% DAU/MAU is normal)

---

## Files to Fix

1. `src/app/api/admin/analytics/conversions/route.ts` - Conversion funnel
2. `src/app/api/admin/analytics/dau-wau-mau/route.ts` - Retention calculations
3. `src/app/api/admin/analytics/cohorts/route.ts` - ✅ ALREADY FIXED

---

## Current Status

- ✅ Cohorts route retention logic fixed (calendar days)
- ✅ Unit tests created and passing
- ✅ Verification script created
- ❌ DAU/WAU/MAU retention still broken (needs same fix)
- ❌ Conversion funnel status logic broken (needs event-based fix)
- ❌ Identity stitching low coverage (0.7%, investigate later)
