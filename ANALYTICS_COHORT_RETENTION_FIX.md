# Cohort Retention Calculation Fix

## Problem

Day 1, Day 7, and Day 30 cohort retention calculations were showing 0% retention due to incorrect time-window logic.

### Root Cause

The current SQL uses **time intervals** (24-hour windows) instead of **calendar days**:

```sql
-- BROKEN: Time interval approach
AND ce.created_at > u."createdAt"
AND ce.created_at <= u."createdAt" + INTERVAL '1 day'
```

This fails when users return more than 24 hours after signup, even if it's the next calendar day.

**Example failure:**

- User signs up: Monday 12:00 PM
- User returns: Tuesday 2:00 PM (26 hours later, next calendar day)
- Current logic: ❌ NOT counted (26h > 24h)
- Expected: ✅ Should count (Tuesday = Day 1)

### Edge Case

**Late night signups break even more:**

- User signs up: Monday 11:59 PM
- User returns: Wednesday 1:00 AM (25 hours later, calendar Day 2)
- Current logic: ❌ Misses Day 1 AND Day 2
- Expected: ✅ Should count as Day 2

## Solution

Use **calendar day calculations** instead of time intervals:

```sql
-- FIXED: Calendar day approach
AND DATE(ce.created_at AT TIME ZONE 'UTC') =
    DATE(u."createdAt" AT TIME ZONE 'UTC') + 1
```

This correctly identifies:

- **Day 1** = The calendar day after signup day (regardless of time)
- **Day 7** = Any return on calendar days 1-7
- **Day 30** = Any return on calendar days 1-30

## Verification

### Run the test script

```bash
pnpm tsx scripts/test-cohort-retention-fix.ts
```

This script:

1. Creates test users with specific signup/return times
2. Runs both current (broken) and fixed calculations
3. Compares results on real production data
4. Shows the difference

### Expected output

```
✅ Test PASSED! Fix works correctly.
   ❌ Current logic FAILS: 0 users retained
   ✅ Fixed logic WORKS: 1 user retained
```

## Implementation Plan

### Files to update

1. **`src/app/api/admin/analytics/cohorts/route.ts`**
   - Day 1 retention calculation
   - Day 7 retention calculation
   - Day 30 retention calculation

2. **Update query logic from:**

   ```sql
   AND ce.created_at > u."createdAt"
   AND ce.created_at <= u."createdAt" + INTERVAL '1 day'
   ```

3. **To:**

   ```sql
   AND DATE(ce.created_at AT TIME ZONE 'UTC') =
       DATE(u."createdAt" AT TIME ZONE 'UTC') + 1
   ```

4. **For Day 7:**

   ```sql
   AND DATE(ce.created_at AT TIME ZONE 'UTC') BETWEEN
       DATE(u."createdAt" AT TIME ZONE 'UTC') + 1 AND
       DATE(u."createdAt" AT TIME ZONE 'UTC') + 7
   ```

5. **For Day 30:**
   ```sql
   AND DATE(ce.created_at AT TIME ZONE 'UTC') BETWEEN
       DATE(u."createdAt" AT TIME ZONE 'UTC') + 1 AND
       DATE(u."createdAt" AT TIME ZONE 'UTC') + 30
   ```

## Testing

### Unit Tests

Run the unit tests that define correct behavior:

```bash
npm test -- cohort-retention.test.ts
```

These tests verify:

- ✅ Day 1 = next calendar day (not 24-hour window)
- ✅ Same-day returns don't count as Day 1
- ✅ Returns on Day 2 don't count as Day 1
- ✅ Timezone handling (UTC)
- ✅ Cohort size calculations
- ✅ Retention rate calculations (0%, 30%, 100% cases)

**Status:** 11 tests, all passing ✅

### Integration Verification

Run the verification script before and after the fix:

```bash
# Before fix: shows 0% retention
pnpm tsx scripts/test-cohort-retention-fix.ts

# After fix: should show correct retention
pnpm tsx scripts/test-cohort-retention-fix.ts
```

### Compare with production

The script also queries actual production data and compares:

- Current calculation results
- Fixed calculation results
- Difference between them

This shows the real-world impact of the fix on your actual user cohorts.

## Expected Impact

After deploying the fix, you should see:

- ✅ Non-zero Day 1 retention rates (likely 15-40%)
- ✅ Realistic Day 7 retention rates (likely 5-20%)
- ✅ Realistic Day 30 retention rates (likely 2-10%)

Currently showing 0% because the broken logic misses most valid returns.

## Related Issues

This fix also relates to the identity stitching issue (0.4% coverage):

- Low coverage may be affecting cohort tracking
- Anonymous users who convert might not be counted correctly
- Should investigate identity stitching separately

## References

- Unit tests: `__tests__/unit/lib/analytics/cohort-retention.test.ts`
- Verification script: `scripts/test-cohort-retention-fix.ts`
- Audit script: `scripts/audit-analytics-calculations.ts`
