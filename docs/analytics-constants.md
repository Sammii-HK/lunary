# Analytics Constants & Thresholds

**Last Updated:** 2026-02-01

This document catalogs all magic numbers, thresholds, and configuration constants used in the analytics system.

---

## Test User Filtering

### Email Patterns

- **Pattern:** `%@test.lunary.app`
- **Exact:** `test@test.lunary.app`
- **Purpose:** Exclude internal test accounts from all analytics metrics
- **Location:** `src/lib/analytics/test-filter.ts`
- **Used in:** All analytics endpoints

---

## Deduplication Windows

### App-Level Events

| Event                    | Window   | Storage      | Policy           |
| ------------------------ | -------- | ------------ | ---------------- |
| `app_opened`             | 24 hours | localStorage | UTC calendar day |
| `product_opened`         | 24 hours | localStorage | UTC calendar day |
| `daily_dashboard_viewed` | 24 hours | localStorage | UTC calendar day |

**Rationale:**

- Uses **localStorage** (not sessionStorage) to persist across browser sessions
- UTC calendar day comparison prevents duplicate events on the same day
- Fail-open: If storage is unavailable, event still fires

**Implementation:** `src/lib/analytics.ts`

---

## Conversion Windows

### Free to Trial

- **Window:** 30 days
- **Measurement:** From `signup_completed` to `trial_started`
- **Boundary:** Exclusive upper bound (< 31 days)
- **Location:** `src/app/api/admin/analytics/subscription-30d/route.ts`

### Trial to Paid

- **Window:** 30 days (configurable via `WINDOW_DAYS`)
- **Measurement:** From `trial_started` to `subscription_started` or `trial_converted`
- **Boundary:** Exclusive upper bound (< 31 days)
- **Location:** `src/app/api/admin/analytics/conversions/route.ts`

**Safeguards:**

- Clock skew filter: `EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) > 0`
- Max window: `< 86400 * 365` (prevents conversions >1 year)

---

## Engagement Metrics

### Active User Definitions

| Metric                     | Time Window   | Event Type   |
| -------------------------- | ------------- | ------------ |
| DAU (Daily Active Users)   | Last 24 hours | `app_opened` |
| WAU (Weekly Active Users)  | Last 7 days   | `app_opened` |
| MAU (Monthly Active Users) | Last 30 days  | `app_opened` |

### Stickiness Targets

- **DAU/MAU:** Target >20% (good product stickiness)
- **WAU/MAU:** Target >60% (weekly engagement)

**Location:** `src/lib/analytics/kpis.ts`

---

## Subscription States

### Priority Order (Mutually Exclusive)

1. **active** - Has active Stripe subscription (`stripe_subscription_id IS NOT NULL`)
2. **trial** - In trial period (`trial_ends_at > NOW()`)
3. **past_due** - Payment failed but subscription not cancelled
4. **cancelled** - Explicitly cancelled or inactive

**Location:** `src/app/api/admin/analytics/subscription-lifecycle/route.ts`

**Invariant:** A user can only be in ONE state at a time. Priority determines state when multiple conditions match.

---

## Pricing (as of 2025)

### Plan Types

| Plan ID                 | Display Name  | Monthly Price (USD) | Annual Price (USD)       |
| ----------------------- | ------------- | ------------------- | ------------------------ |
| `lunary_plus`           | Basic Monthly | $4.99               | -                        |
| `lunary_plus_ai`        | Pro Monthly   | $8.99               | -                        |
| `lunary_plus_ai_annual` | Pro Annual    | -                   | $89.99 ($7.49/month MRR) |
| `free`                  | Free          | $0                  | -                        |

### Source of Truth

- **Database field:** `subscriptions.monthly_amount_due`
- **Stripe API:** Price ID mapping in `utils/stripe-prices.ts`
- **NEVER hardcode:** Always use actual database values for MRR calculations

**Location:** `utils/stripe-prices.ts`, `utils/pricing.ts`

---

## Cache TTL

### Analytics Endpoints

- **Default TTL:** 300 seconds (5 minutes)
- **Header:** `Cache-Control: private, max-age=300`
- **Configuration:** `src/lib/analytics-cache-config.ts`

**Rationale:** 5-minute cache balances data freshness with query performance. Private cache ensures user-specific data isn't shared.

---

## Date Ranges

### Boundary Rules

- **Start:** INCLUSIVE (`>=` start at `00:00:00.000Z`)
- **End:** EXCLUSIVE (`<` end+1 at `00:00:00.000Z`)
- **Pattern:** Always use `>= start AND < end` in SQL queries

### Timezone Policy

- **Storage:** All timestamps in UTC
- **Parsing:** Date-only strings (YYYY-MM-DD) interpreted as UTC midnight
- **Queries:** All date comparisons in UTC
- **Client:** Browser events captured in local time, converted to UTC

**Format:** ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

**Location:** `src/lib/analytics/date-range.ts`

### Examples

```sql
-- Query for Jan 1-7, 2024
WHERE created_at >= '2024-01-01T00:00:00.000Z'
  AND created_at < '2024-01-08T00:00:00.000Z'

-- Date-only input "2024-01-01" becomes:
-- As start: 2024-01-01T00:00:00.000Z
-- As end: 2024-01-01T23:59:59.999Z
```

---

## Retention Cohorts

### Retention Checkpoints

| Checkpoint | Days After Signup | Event                            |
| ---------- | ----------------- | -------------------------------- |
| Day 1      | 1 day             | `app_opened` on day after signup |
| Day 7      | 7 days            | `app_opened` on 7th day          |
| Day 30     | 30 days           | `app_opened` on 30th day         |

### Mathematical Invariant

**Day 1 ≥ Day 7 ≥ Day 30** (retention should be monotonically decreasing)

**Location:** `src/lib/analytics/kpis.ts`

---

## Churn Rate Calculation

### Formula

```
churn_rate = (cancelled_in_period / total_at_period_start) * 100
```

**Critical:** Use subscriptions at **period START** as denominator, NOT period end. Otherwise churn can exceed 100%.

**Validation:** Churn rate MUST be 0-100%. Values >100% indicate calculation error.

**Location:** `src/app/api/admin/analytics/subscription-lifecycle/route.ts`

---

## Error Thresholds

### Trend Calculations

- **Extreme change warning:** >10,000% change
- **Invalid inputs:** NaN, Infinity
- **Division by zero:** Returns null with error message

**Location:** `src/lib/analytics/utils.ts`

### Percentage Caps

- **Maximum:** 100% (when `cap: true` option enabled)
- **Warning logged:** When percentage >100% is capped
- **Default behavior:** No cap (allows >100% for specific metrics)

**Location:** `src/lib/analytics/utils.ts` (`safePercentage` function)

---

## Identity Stitching

### NULL Handling

Filters applied to `analytics_identity_links`:

- `user_id IS NOT NULL AND user_id != ''`
- `anonymous_id IS NOT NULL AND anonymous_id != ''`
- `ORDER BY ... NULLS LAST` for timestamp fields

**Purpose:** Prevent missing users due to NULL values in identity mapping

**Location:** `src/lib/analytics/kpis.ts`

---

## Funnel Invariants

### Conversion Funnel

**Free ≥ Trial ≥ Paid** (funnel should be monotonically decreasing)

### Engagement Invariant

**DAU ≤ WAU ≤ MAU** (always true by definition of time windows)

**Validation:** These invariants are checked in audit mode and logged as anomalies if violated.

**Location:** `src/lib/analytics/kpis.ts`

---

## Change Log

| Date       | Change                                     | Reason                      |
| ---------- | ------------------------------------------ | --------------------------- |
| 2026-02-01 | Created documentation                      | Analytics audit - Issue #26 |
| 2026-02-01 | Standardized deduplication to localStorage | Batch 5 - Issue #19         |
| 2026-02-01 | Fixed churn rate calculation               | Batch 1 - Issue #1          |
| 2026-02-01 | Removed hardcoded MRR prices               | Batch 1 - Issue #3          |

---

## References

- **Plan Normalization:** `src/app/api/admin/analytics/plan-breakdown/route.ts`
- **Test Filters:** `src/lib/analytics/test-filter.ts`
- **Safe Calculations:** `src/lib/analytics/utils.ts`
- **Date Handling:** `src/lib/analytics/date-range.ts`
- **KPIs:** `src/lib/analytics/kpis.ts`
- **Stripe Prices:** `utils/stripe-prices.ts`

---

## Notes for Developers

1. **Never hardcode prices** - Always use `monthly_amount_due` from database
2. **Always filter test users** - Use centralized filter utilities
3. **Timezone consistency** - All server calculations use UTC
4. **Boundary pattern** - Use `>= start AND < end` for date ranges
5. **Mathematical invariants** - Validate metrics don't violate logical constraints (DAU≤WAU≤MAU, churn≤100%)
6. **Cache appropriately** - 5-minute TTL balances freshness and performance
7. **Fail gracefully** - Error handling should degrade gracefully, not crash analytics dashboard
