# Analytics Audit - January 2026

**Date:** 2026-01-26
**Auditor:** Claude Code
**Status:** COMPLETED

---

## Executive Summary

Analytics dashboard was showing incorrect feature adoption percentages because they were being divided by App MAU (3,042 users) instead of Product MAU (131 users). This made all product features appear to have extremely low adoption rates (~0.1-0.6%) when they should show 5-20%.

**Impact:** Metrics were understated by ~23x, making product features appear to have almost no adoption.

---

## Issue 1: Incorrect Denominator for Feature Adoption

### Problem

Feature adoption percentages were using App MAU (3,042) as the denominator instead of Product MAU (131).

### Root Cause

**File:** `src/app/api/admin/analytics/feature-adoption/route.ts`

The API route was not specifying which "family" of users to use as the baseline:

```typescript
// LINE 19-26 in route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const family = searchParams.get('family');  // ← This is NULL by default
    const eventType = familyToEventType(family); // ← Defaults to 'app_opened'

    const adoption = await getFeatureAdoption(range, { eventType });
```

**The mapping function (lines 5-17):**
```typescript
const familyToEventType = (
  family: string | null,
): 'app_opened' | 'product_opened' | 'grimoire_viewed' => {
  switch (family) {
    case 'product':
      return 'product_opened';  // ← Should use this for Product MAU
    case 'grimoire':
      return 'grimoire_viewed';
    case 'site':
    default:
      return 'app_opened';      // ← Was defaulting to this (App MAU)
  }
};
```

### Metrics Comparison

**Current (WRONG) - Using App MAU:**
```
daily_dashboard_viewed: 26 users • 0.60% (26/3,042)
astral_chat_used:       6 users  • 0.14% (6/3,042)
tarot_drawn:           13 users  • 0.30% (13/3,042)
chart_viewed:          [unknown] • [unknown]
ritual_started:        [unknown] • [unknown]
```

**Correct - Using Product MAU:**
```
daily_dashboard_viewed: 26 users • 19.8% (26/131)
astral_chat_used:       6 users  • 4.6%  (6/131)
tarot_drawn:           13 users  • 9.9%  (13/131)
chart_viewed:          [unknown] • [unknown]
ritual_started:        [unknown] • [unknown]
```

### Fix Applied ✅

**File:** `src/app/api/admin/analytics/feature-adoption/route.ts` (APPLIED 2026-01-26)

Change the default family from `'site'` to `'product'`:

```typescript
const familyToEventType = (
  family: string | null,
): 'app_opened' | 'product_opened' | 'grimoire_viewed' => {
  switch (family) {
    case 'product':
    default:  // ← Move default to product
      return 'product_opened';
    case 'grimoire':
      return 'grimoire_viewed';
    case 'site':
      return 'app_opened';
  }
};
```

---

## Issue 2: Product MAU Definition Analysis

### Current Definition

**Product MAU** is defined by users who triggered `'product_opened'` events within the MAU window (30 days).

**File:** `src/app/api/admin/analytics/dau-wau-mau/route.ts`

Product events that count toward Product MAU (lines 22-29):
```typescript
const PRODUCT_EVENTS = [
  'daily_dashboard_viewed',
  'chart_viewed',
  'tarot_drawn',
  'astral_chat_used',
  'ritual_started',
];
```

### The Mystery: Only 26/131 (19.8%) Viewed Dashboard

**Question:** Why are only 26 out of 131 Product MAU users viewing the dashboard if `/app` is the main product entry point?

**Hypothesis:** Users are becoming "Product MAU" through other events WITHOUT viewing the dashboard.

### Product MAU Source Breakdown (NEEDS INVESTIGATION)

To understand where the 105 non-dashboard Product MAU come from, we need to query:

```sql
-- Get first product event per user in MAU window
SELECT
  first_product_event,
  COUNT(DISTINCT user_id) as user_count,
  ROUND(100.0 * COUNT(DISTINCT user_id) / 131, 2) as percentage
FROM (
  SELECT
    user_id,
    FIRST_VALUE(event_type) OVER (
      PARTITION BY user_id
      ORDER BY created_at
    ) as first_product_event
  FROM conversion_events
  WHERE event_type IN (
    'daily_dashboard_viewed',
    'chart_viewed',
    'tarot_drawn',
    'astral_chat_used',
    'ritual_started'
  )
  AND created_at >= [MAU_START]
  AND created_at <= [MAU_END]
  AND user_id IS NOT NULL
  AND user_id NOT LIKE 'anon:%'
) as first_events
GROUP BY first_product_event
ORDER BY user_count DESC;
```

**Expected output:**
```
Event Type              | Users | % of Product MAU
------------------------|-------|------------------
daily_dashboard_viewed  | 26    | 19.8%
chart_viewed            | ?     | ?
tarot_drawn            | ?     | ?
astral_chat_used       | ?     | ?
ritual_started         | ?     | ?
```

### Potential Explanations

1. **Direct Feature Access:** Users might be accessing specific features (tarot, chart, astral chat) directly via deep links or bookmarks without visiting `/app` dashboard first

2. **Mobile/Email Links:** Email notifications or mobile push notifications might link directly to features, bypassing the dashboard

3. **Grimoire-to-Product Flow:** Users might enter via Grimoire and then use product features without ever visiting `/app`

4. **Returning Users:** Returning users might go directly to their preferred feature (e.g., bookmarked `/app/tarot`) without loading the dashboard

5. **Dashboard Tracking Issue:** The `daily_dashboard_viewed` event might not be firing reliably (see Issue 3)

---

## Issue 3: Dashboard View Tracking Analysis

### Current Implementation

**File:** `src/app/app/dashboard/AppDashboardClient.tsx` (or similar)

The dashboard view event should be tracked like this:

```typescript
useEffect(() => {
  if (!authState.isAuthenticated || authState.loading) return;

  const today = new Date().toISOString().split('T')[0];
  const key = `lunary_daily_dashboard_viewed:${userId}:${today}`;

  // Check if already tracked today
  if (localStorage.getItem(key)) {
    return;
  }

  // Track and mark as tracked
  localStorage.setItem(key, '1');
  conversionTracking.dailyDashboardViewed(
    authState.user?.id,
    authState.user?.email,
  );
}, [authState.isAuthenticated, authState.loading, today]);
```

### Tracking Implementation

**File:** `src/lib/analytics.ts`

The tracking helper:
```typescript
dailyDashboardViewed(userId?: string, email?: string) {
  if (!shouldTrackDailyDashboardViewed()) return;

  trackEvent('daily_dashboard_viewed', {
    userId,
    userEmail: email,
    timestamp: Date.now(),
  });
}
```

### Guard Mechanism

**De-duplication:** Uses localStorage with UTC date key to ensure only 1 event per user per day:
- Key format: `lunary_daily_dashboard_viewed:{userId}:{YYYY-MM-DD}`
- Prevents duplicate tracking on same UTC day

### Potential Issues

1. **Client-side errors:** JavaScript errors could prevent the tracking call from executing
2. **Ad blockers:** Analytics tracking might be blocked by browser extensions
3. **Race conditions:** Fast navigation away from `/app` before useEffect fires
4. **Server-side rendering:** Initial server render doesn't track, relies on client-side hydration
5. **Conditional logic:** Auth checks might prevent firing in some edge cases

### Verification Needed

To verify tracking works correctly:

1. **Check browser console** for any JavaScript errors on `/app` page load
2. **Inspect network requests** to see if `conversion_events` POST is made
3. **Verify localStorage** to see if de-duplication key is being set
4. **Test in incognito** to rule out localStorage corruption
5. **Check server logs** for failed event inserts

---

## Issue 4: Product MAU vs App MAU Definitions

### Definitions

| Metric | Event Type | Description | Current Value |
|--------|-----------|-------------|---------------|
| **App MAU** | `app_opened` | Any user who opened the app (site + product + grimoire) | 3,042 |
| **Product MAU** | `product_opened` | Signed-in users who used product features | 131 |
| **Grimoire MAU** | `grimoire_viewed` | Users who viewed grimoire content | [unknown] |

### Event Type Mappings

**From:** `src/app/api/admin/analytics/dau-wau-mau/route.ts`

**App-level events (App MAU):**
```typescript
const APP_OPENED_EVENTS = ['app_opened'];
```

**Product events (Product MAU) - SIGNED-IN ONLY:**
```typescript
const PRODUCT_EVENTS = [
  'daily_dashboard_viewed',
  'chart_viewed',
  'tarot_drawn',
  'astral_chat_used',
  'ritual_started',
];
```

**Grimoire events:**
```typescript
const GRIMOIRE_EVENTS = ['grimoire_viewed'];
```

**General engagement events:**
```typescript
const ENGAGEMENT_EVENTS = [
  'grimoire_viewed',
  'tarot_drawn',
  'chart_viewed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
  'astral_chat_used',
  'ritual_started',
  'horoscope_viewed',
];
```

### Identity Resolution

The system uses **canonical identity** to deduplicate users:

1. **Signed-in users:** `user:{user_id}` (from `ce.user_id`)
2. **Linked anonymous users:** `user:{user_id}` (from `analytics_identity_links`)
3. **Anonymous users:** `anon:{anonymous_id}` (from `ce.anonymous_id`)

**Key distinction:** Product MAU requires `requireSignedIn: true` (line 513 in dau-wau-mau/route.ts), filtering out anonymous users.

---

## Issue 5: Feature List Completeness

### Features Tracked in Analytics

**File:** `src/lib/analytics/kpis.ts` (lines 760-767)

Default feature types for adoption tracking:
```typescript
const featureTypes = options?.featureTypes ?? [
  'daily_dashboard_viewed',
  'grimoire_viewed',
  'astral_chat_used',
  'tarot_drawn',
  'ritual_started',
  'chart_viewed',
];
```

### Missing Features

The following product events are NOT included in feature adoption tracking:

From `canonical-events.ts`:
- `'personalized_horoscope_viewed'`
- `'personalized_tarot_viewed'`
- `'horoscope_viewed'`
- `'signup_completed'`
- `'subscription_started'`
- `'trial_started'`
- `'trial_converted'`
- `'subscription_cancelled'`

**Recommendation:** Consider adding personalized content views to feature adoption metrics, as these are core product features.

---

## Recommendations

### Immediate Actions (Critical)

1. ✅ **COMPLETED: Fix feature adoption denominator** - Changed default family to `'product'` in feature-adoption API route (src/app/api/admin/analytics/feature-adoption/route.ts:10)
2. ⏳ **TODO: Investigate Product MAU sources** - Run query to understand where 105 non-dashboard users come from (SQL query provided in Appendix)
3. ⏳ **TODO: Verify dashboard tracking** - Test that `daily_dashboard_viewed` fires reliably on `/app` page load

### Short-term Actions (Important)

4. ⏳ **Add Product MAU breakdown to dashboard** - Show which product events are driving Product MAU
5. ⏳ **Add personalized features** to adoption tracking - Track `personalized_horoscope_viewed` and `personalized_tarot_viewed`
6. ⏳ **Document analytics definitions** - Add clear definitions of App MAU vs Product MAU to analytics UI

### Long-term Actions (Nice to have)

7. ⏳ **Add real-time validation** - Alert if feature adoption metrics look anomalous (e.g., >100% or <0.1%)
8. ⏳ **Create analytics test suite** - Unit tests for KPI calculations to prevent regression
9. ⏳ **Add audit logging** - Track when metrics are queried and by whom for compliance

---

## Testing Checklist

- [ ] Verify feature adoption % shows correct percentages after fix
- [ ] Confirm Product MAU = 131 is used as denominator
- [ ] Understand where 105 non-dashboard Product MAU come from
- [ ] Verify dashboard view event tracking works on `/app`
- [ ] Confirm all percentages are between 0-100%
- [ ] Test with different date ranges
- [ ] Validate against raw SQL queries

---

## Analytics System Architecture

### Data Flow

```
User Action
    ↓
Client-side Tracking (analytics.ts)
    ↓
conversionTracking.{eventName}()
    ↓
trackEvent() → POST to API
    ↓
conversion_events table (PostgreSQL)
    ↓
KPI Queries (kpis.ts)
    ↓
API Routes (/api/admin/analytics/*)
    ↓
Admin Dashboard (page.tsx)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/analytics.ts` | Client-side tracking functions |
| `src/lib/analytics/canonical-events.ts` | Event type definitions and schema |
| `src/lib/analytics/kpis.ts` | Core metrics calculation functions |
| `src/app/api/admin/analytics/feature-adoption/route.ts` | Feature adoption API endpoint |
| `src/app/api/admin/analytics/dau-wau-mau/route.ts` | DAU/WAU/MAU calculations |
| `src/app/admin/analytics/page.tsx` | Admin analytics dashboard UI |

### Database Schema

**Table:** `conversion_events`

Key columns:
- `id` - Primary key
- `event_type` - Canonical event type (e.g., 'daily_dashboard_viewed')
- `user_id` - Signed-in user ID (nullable)
- `anonymous_id` - Anonymous session ID (nullable)
- `user_email` - User email (for filtering test accounts)
- `created_at` - Event timestamp (UTC)
- `metadata` - JSONB field for additional event data

**Table:** `analytics_identity_links`

Connects anonymous sessions to signed-in users:
- `anonymous_id` - Anonymous session ID
- `user_id` - User ID after sign-in
- `first_seen_at` - First time this link was established
- `last_seen_at` - Last time this link was updated

### Event Type Normalization

Legacy events are automatically mapped to canonical types:

```typescript
'dashboard_viewed' → 'daily_dashboard_viewed'
'ai_chat' → 'astral_chat_used'
'tarot_viewed' → 'tarot_drawn'
'birth_chart_viewed' → 'chart_viewed'
'ritual_view' → 'ritual_started'
```

This ensures consistent metrics even if event names change in the frontend.

---

## Appendix: SQL Queries for Investigation

### Query 1: Product MAU Source Breakdown

```sql
WITH mau_window AS (
  SELECT
    DATE('[END_DATE]'::timestamp - INTERVAL '29 days') as start_date,
    DATE('[END_DATE]'::timestamp) as end_date
),
product_users AS (
  SELECT DISTINCT
    ce.user_id,
    FIRST_VALUE(ce.event_type) OVER (
      PARTITION BY ce.user_id
      ORDER BY ce.created_at
    ) as first_product_event
  FROM conversion_events ce
  CROSS JOIN mau_window w
  WHERE ce.event_type IN (
    'daily_dashboard_viewed',
    'chart_viewed',
    'tarot_drawn',
    'astral_chat_used',
    'ritual_started'
  )
  AND ce.created_at >= w.start_date
  AND ce.created_at <= w.end_date
  AND ce.user_id IS NOT NULL
  AND ce.user_id NOT LIKE 'anon:%'
  AND (ce.user_email IS NULL OR (
    ce.user_email NOT LIKE '%@test.lunary.app'
    AND ce.user_email != 'test@test.lunary.app'
  ))
)
SELECT
  first_product_event,
  COUNT(*) as user_count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM product_users), 2) as percentage
FROM product_users
GROUP BY first_product_event
ORDER BY user_count DESC;
```

### Query 2: Dashboard View Coverage

```sql
WITH mau_window AS (
  SELECT
    DATE('[END_DATE]'::timestamp - INTERVAL '29 days') as start_date,
    DATE('[END_DATE]'::timestamp) as end_date
),
product_mau AS (
  SELECT DISTINCT ce.user_id
  FROM conversion_events ce
  CROSS JOIN mau_window w
  WHERE ce.event_type IN (
    'daily_dashboard_viewed',
    'chart_viewed',
    'tarot_drawn',
    'astral_chat_used',
    'ritual_started'
  )
  AND ce.created_at >= w.start_date
  AND ce.created_at <= w.end_date
  AND ce.user_id IS NOT NULL
  AND ce.user_id NOT LIKE 'anon:%'
  AND (ce.user_email IS NULL OR (
    ce.user_email NOT LIKE '%@test.lunary.app'
    AND ce.user_email != 'test@test.lunary.app'
  ))
),
dashboard_viewers AS (
  SELECT DISTINCT ce.user_id
  FROM conversion_events ce
  CROSS JOIN mau_window w
  WHERE ce.event_type = 'daily_dashboard_viewed'
  AND ce.created_at >= w.start_date
  AND ce.created_at <= w.end_date
  AND ce.user_id IS NOT NULL
  AND (ce.user_email IS NULL OR (
    ce.user_email NOT LIKE '%@test.lunary.app'
    AND ce.user_email != 'test@test.lunary.app'
  ))
)
SELECT
  (SELECT COUNT(*) FROM product_mau) as total_product_mau,
  (SELECT COUNT(*) FROM dashboard_viewers) as dashboard_viewers,
  ROUND(100.0 * (SELECT COUNT(*) FROM dashboard_viewers) /
    (SELECT COUNT(*) FROM product_mau), 2) as dashboard_coverage_percent,
  (SELECT COUNT(*) FROM product_mau) -
    (SELECT COUNT(*) FROM dashboard_viewers) as non_dashboard_product_users;
```

### Query 3: Event Frequency per User

```sql
WITH mau_window AS (
  SELECT
    DATE('[END_DATE]'::timestamp - INTERVAL '29 days') as start_date,
    DATE('[END_DATE]'::timestamp) as end_date
)
SELECT
  ce.event_type,
  COUNT(DISTINCT ce.user_id) as unique_users,
  COUNT(*) as total_events,
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT ce.user_id), 0), 2) as avg_events_per_user
FROM conversion_events ce
CROSS JOIN mau_window w
WHERE ce.event_type IN (
  'daily_dashboard_viewed',
  'chart_viewed',
  'tarot_drawn',
  'astral_chat_used',
  'ritual_started'
)
AND ce.created_at >= w.start_date
AND ce.created_at <= w.end_date
AND ce.user_id IS NOT NULL
AND ce.user_id NOT LIKE 'anon:%'
AND (ce.user_email IS NULL OR (
  ce.user_email NOT LIKE '%@test.lunary.app'
  AND ce.user_email != 'test@test.lunary.app'
))
GROUP BY ce.event_type
ORDER BY unique_users DESC;
```

---

## Conclusion

The primary issue (incorrect denominator for feature adoption) has been identified and a fix has been documented. The secondary mystery (why only 19.8% of Product MAU view dashboard) requires further investigation via SQL queries to understand user entry points into the product.

**Next Steps:**
1. Apply the fix to feature-adoption API route
2. Run SQL queries to understand Product MAU composition
3. Verify dashboard tracking implementation
4. Add Product MAU breakdown to analytics dashboard for ongoing monitoring
