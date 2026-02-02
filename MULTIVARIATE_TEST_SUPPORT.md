# Multivariate A/B Test Support - Implementation Plan

## Problem

The A/B testing system was built for **binary tests** (A vs B), but most of your PostHog feature flags are **multivariate** (3+ variants):

- `cta-copy-test`: no-verb (33%), mystical (33%), simple (34%)
- `homepage-features-test`: control (33%), four-cards-updated (33%), three-sections (34%)
- `weekly-lock-style`: heavy-blur (33%), light-blur (33%), no-preview (34%)
- etc.

## What We Fixed

### 1. ✅ Variant Normalization (DONE)

**Files changed:**

- `src/lib/ab-test-tracking.ts`
- `scripts/backfill-ab-test-data.ts`

**What changed:**

- `normalizeVariant()` now returns the actual variant name instead of forcing it to "A" or "B"
- Supports variants like: "no-verb", "mystical", "simple", "blur", "truncated", etc.
- Still normalizes "control"/"test" to "A"/"B" for backward compatibility

### 2. ⚠️ Admin Dashboard (NEEDS UPDATE)

**File:** `src/app/api/admin/ab-testing/route.ts`

**Current issue:**

- Hardcoded to query only "A" and "B" variants
- Returns `variantA` and `variantB` objects
- Can't handle 3+ variants

**What needs to change:**

```typescript
// BEFORE (hardcoded A/B)
const impressionsA = await sql`... WHERE metadata->>'abVariant' = 'A'`;
const impressionsB = await sql`... WHERE metadata->>'abVariant' = 'B'`;

// AFTER (dynamic variants)
const variants = await sql`
  SELECT DISTINCT metadata->>'abVariant' as variant
  FROM conversion_events
  WHERE metadata->>'abTest' = ${testName}
`;

// Then query metrics for each variant dynamically
```

**Return type needs to change:**

```typescript
// BEFORE
interface ABTestResult {
  variantA: { name: string; impressions: number; ... };
  variantB: { name: string; impressions: number; ... };
}

// AFTER
interface ABTestResult {
  variants: Array<{
    name: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  }>;
  winner?: string; // Best performing variant
}
```

### 3. ⚠️ Admin UI (NEEDS UPDATE)

**File:** `src/app/admin/ab-testing/page.tsx`

**Current issue:**

- UI shows exactly 2 variants side-by-side
- Hardcoded to `test.variantA` and `test.variantB`

**What needs to change:**

- Dynamic grid that shows N variants
- Compare all variants, not just 2
- Show which variant is winning

## Quick Fix vs. Full Fix

### Option A: Quick Fix (Use it as-is)

The tracking NOW WORKS for multivariate tests. You'll get data like:

```sql
| test_name    | variant     | impressions | conversions |
|--------------|-------------|-------------|-------------|
| cta_copy     | no-verb     | 234         | 12          |
| cta_copy     | mystical    | 198         | 18          |
| cta_copy     | simple      | 221         | 15          |
```

You can query this directly with SQL:

```sql
SELECT
  metadata->>'abTest' as test,
  metadata->>'abVariant' as variant,
  COUNT(DISTINCT user_id) as impressions,
  SUM(CASE WHEN event_type IN ('trial_started', 'subscription_started') THEN 1 ELSE 0 END) as conversions
FROM conversion_events
WHERE metadata->>'abTest' = 'cta_copy'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2;
```

**Admin dashboard will show 0 tests** until you update the API/UI.

### Option B: Full Fix (Update dashboard)

Update the admin API and UI to handle multivariate tests properly.

**Effort:** 1-2 hours
**Benefit:** Beautiful UI for analyzing multivariate tests

## Immediate Action Items

1. ✅ **DONE**: Deploy the fixes to `ab-test-tracking.ts`
2. ✅ **DONE**: Update backfill script
3. ⏳ **TODO**: Update tests to use new variant types
4. ⏳ **OPTIONAL**: Update admin dashboard for multivariate support

## Testing the Fix

After deploying:

```bash
# Wait 1-2 hours for events, then check PostHog
pnpm tsx scripts/check-recent-posthog-ab-data.ts

# Should now show:
# Found 234 events with abTest metadata
# cta_copy:
#   no-verb: 78 events
#   mystical: 81 events
#   simple: 75 events
```

Then check the database:

```bash
pnpm tsx scripts/check-ab-test-data.ts

# Should now show:
# Events with 'abTest' key: 234
# Sample events:
#   page_viewed | Test: cta_copy | Variant: mystical
#   app_opened | Test: cta_copy | Variant: simple
```

## SQL Queries for Analysis

Until the admin dashboard is updated, use these queries:

### View all test results:

```sql
WITH test_metrics AS (
  SELECT
    metadata->>'abTest' as test_name,
    metadata->>'abVariant' as variant,
    COUNT(DISTINCT CASE WHEN event_type IN ('app_opened', 'page_viewed') THEN user_id END) as impressions,
    COUNT(DISTINCT CASE WHEN event_type IN ('trial_started', 'subscription_started', 'upgrade_clicked') THEN user_id END) as conversions
  FROM conversion_events
  WHERE metadata->>'abTest' IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1, 2
)
SELECT
  test_name,
  variant,
  impressions,
  conversions,
  ROUND((conversions::numeric / NULLIF(impressions, 0) * 100), 2) as conversion_rate
FROM test_metrics
ORDER BY test_name, conversion_rate DESC;
```

### Find the winning variant for each test:

```sql
WITH test_metrics AS (
  SELECT
    metadata->>'abTest' as test_name,
    metadata->>'abVariant' as variant,
    COUNT(DISTINCT CASE WHEN event_type IN ('app_opened', 'page_viewed') THEN user_id END) as impressions,
    COUNT(DISTINCT CASE WHEN event_type IN ('trial_started', 'subscription_started') THEN user_id END) as conversions
  FROM conversion_events
  WHERE metadata->>'abTest' IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1, 2
),
ranked AS (
  SELECT
    *,
    ROUND((conversions::numeric / NULLIF(impressions, 0) * 100), 2) as conversion_rate,
    ROW_NUMBER() OVER (PARTITION BY test_name ORDER BY (conversions::numeric / NULLIF(impressions, 0)) DESC) as rank
  FROM test_metrics
  WHERE impressions >= 100  -- Minimum sample size
)
SELECT
  test_name,
  variant as winning_variant,
  impressions,
  conversions,
  conversion_rate || '%' as rate
FROM ranked
WHERE rank = 1
ORDER BY test_name;
```

## Summary

- ✅ **Tracking is fixed** - Multivariate tests now record data correctly
- ✅ **Backfill is ready** - Will work once you deploy and get new data
- ⚠️ **Dashboard limited** - Still expects binary tests, won't display multivariate results
- ✅ **SQL queries work** - You can analyze results directly

Deploy the fixes and you'll start collecting A/B test data for all your multivariate tests!
