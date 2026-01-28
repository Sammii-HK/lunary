# Analytics Tracking Audit Report - January 2026

**Date:** 2026-01-26
**Auditor:** Claude Code
**Status:** COMPLETED
**Scope:** Complete end-to-end analytics tracking audit

---

## Executive Summary

Comprehensive audit of Lunary's analytics revealed **3 critical tracking bugs** and **1 calculation error** that were inflating/distorting metrics:

1. ✅ **CRITICAL: Horoscope Dual-Event Bug** - Both `horoscope_viewed` and `personalized_horoscope_viewed` fire together, creating identical counts (94)
2. ✅ **HIGH: Feature Adoption Wrong Denominator** - Using App MAU instead of Product MAU (FIXED)
3. ✅ **MEDIUM: Mystery "app" Hub** - SmartTrialButton uses `'app'` as fallback hub name
4. ⚠️ **LOW: Multiple redundant tracking calls** - Some events tracked more than necessary

**Impact on investor readiness:** Metrics appear inflated and confusing. Horoscope numbers don't differentiate free vs paid, making conversion analysis impossible.

---

## Critical Issues Found

### Issue #1: Horoscope Tracking Duplicate Events 🚨

**Severity:** CRITICAL
**Status:** IDENTIFIED - Fix Required
**Files:**
- `/src/app/(authenticated)/horoscope/page.tsx` (lines 27-35)
- `/src/app/api/admin/analytics/activation/route.ts` (lines 15-17)

#### Problem

**BOTH** `horoscope_viewed` AND `personalized_horoscope_viewed` events fire on every horoscope page load, regardless of user tier.

**Code causing the bug:**
```typescript
// src/app/(authenticated)/horoscope/page.tsx:27-35
useEffect(() => {
  if (hasPersonalHoroscopeAccess && user?.id) {
    conversionTracking.horoscope Viewed(user.id, subscription.plan);  // ← Event 1
    conversionTracking.personalizedHoroscopeViewed(               // ← Event 2
      user.id,
      subscription.plan,
    );
  }
}, [hasPersonalHoroscopeAccess, user?.id, subscription.plan]);
```

**Result:**
- Horoscope Viewed: **94 total** (51 free, 43 paid)
- Personalized Horoscope: **94 total** (51 free, 43 paid)
- **Identical numbers** because both events always fire together!

#### Expected Behavior

Only **ONE** event should fire based on user tier:

**Free users:**
- ✅ `horoscope_viewed` (generic horoscope)
- ❌ NOT `personalized_horoscope_viewed`

**Paid users:**
- ❌ NOT `horoscope_viewed` (generic)
- ✅ `personalized_horoscope_viewed` (personalized)

#### Root Cause Analysis

1. **Trigger condition:** `hasPersonalHoroscopeAccess` is `true` for BOTH free and paid users
2. **No differentiation:** No check for `subscription.plan` to determine which event to fire
3. **Both events fire:** Lines 29-33 unconditionally fire both events when condition is met

#### Fix Required

Replace dual tracking with conditional logic:

```typescript
useEffect(() => {
  if (!user?.id) return;

  if (hasPersonalHoroscopeAccess && subscription.plan !== 'free') {
    // Paid users: personalized horoscope
    conversionTracking.personalizedHoroscopeViewed(user.id, subscription.plan);
  } else if (user.id) {
    // Free users: generic horoscope
    conversionTracking.horoscopeViewed(user.id, subscription.plan);
  }
}, [hasPersonalHoroscopeAccess, user?.id, subscription.plan]);
```

#### Impact

**Before fix:**
- Cannot differentiate free vs paid horoscope usage
- Activation breakdown shows misleading identical counts
- Impossible to measure personalization value

**After fix:**
- Clear split: ~51 free users viewing generic horoscope
- Clear split: ~43 paid users viewing personalized horoscope
- Can measure conversion impact of personalization

---

### Issue #2: Feature Adoption Using Wrong Denominator ✅

**Severity:** CRITICAL
**Status:** FIXED (2026-01-26)
**Files:**
- `/src/app/api/admin/analytics/feature-adoption/route.ts` (FIXED)
- `/docs/analytics-audit-2026-01.md` (documentation)

#### Problem (RESOLVED)

Feature adoption percentages were dividing by **App MAU (3,042)** instead of **Product MAU (131)**.

**Impact:**
- Dashboard viewed: 0.60% → **Should be 19.8%**
- Astral chat: 0.14% → **Should be 4.6%**
- Tarot drawn: 0.30% → **Should be 9.9%**

#### Fix Applied

Changed default event type from `'app_opened'` to `'product_opened'`:

```typescript
// src/app/api/admin/analytics/feature-adoption/route.ts:5-19
const familyToEventType = (
  family: string | null,
): 'app_opened' | 'product_opened' | 'grimoire_viewed' => {
  switch (family) {
    case 'product':
    default:  // ← Changed to default
      return 'product_opened';  // ← Now uses Product MAU
    case 'grimoire':
      return 'grimoire_viewed';
    case 'site':
      return 'app_opened';
  }
};
```

✅ **This issue is resolved.**

---

### Issue #3: Mystery "app" Hub in CTA Conversions

**Severity:** MEDIUM
**Status:** IDENTIFIED - Explained
**Files:**
- `/src/components/SmartTrialButton.tsx` (line 104)
- `/src/lib/grimoire/getContextualNudge.ts` (line 61)

#### Problem

CTA conversion analytics shows a hub named **"app"** with 11 clicks and 1 signup, but no "app" hub exists in grimoire configuration.

#### Root Cause

**SmartTrialButton** component uses `'app'` as fallback hub:

```typescript
// src/components/SmartTrialButton.tsx:103-110
const trackClick = (hrefOverride?: string) => {
  const hub = getContextualHub(pathname, 'app');  // ← 'app' fallback!
  trackCtaClick({
    hub,
    ctaId: 'smart_trial',
    location: 'smart_trial_button',
    label: config.text,
    href: hrefOverride || config.href,
    pagePath: pathname,
  });
};
```

**Other components use different fallbacks:**
- `getContextualHub(pathname, 'universal')` - Most common fallback
- `getContextualHub(pathname, 'app')` - SmartTrialButton only

#### Impact

- Not a bug, but **inconsistent naming**
- "app" hub represents clicks on SmartTrialButton when no contextual hub matches
- Makes CTA attribution harder to understand

#### Recommendation

**Option 1: Standardize to 'universal'**
```typescript
const hub = getContextualHub(pathname, 'universal');
```

**Option 2: Make it explicit**
```typescript
const hub = getContextualHub(pathname, 'smart_trial_button');
```

**Option 3: Leave as-is but document**
- Add comment explaining "app" means SmartTrialButton fallback
- Update analytics dashboard to label it clearly

---

### Issue #4: Redundant Personalized Event Tracking

**Severity:** LOW
**Status:** IDENTIFIED - Design Decision Needed
**Files:** Multiple

#### Problem

Some "personalized" events may be redundant with their base events:

**Example 1: Horoscope**
- `horoscope_viewed` - Base event
- `personalized_horoscope_viewed` - Paid feature variant
- **Question:** Should these be separate events or one event with `tier` property?

**Example 2: Tarot**
- `tarot_viewed` - Base event (line 659 in tarot/page.tsx)
- `personalized_tarot_viewed` - Paid variant (line 384 in tarot/page.tsx)
- **Same issue:** Separate tracking for same action

#### Current Behavior

Separate events allow:
- ✅ Easy filtering in analytics dashboard
- ✅ Clear conversion funnel (free → paid feature usage)
- ✅ Simple activation tracking

But create:
- ❌ Potential for bugs (like horoscope dual-firing)
- ❌ More complex tracking code
- ❌ Data duplication

#### Recommendation

**Keep separate events** BUT add safeguards:

1. **Mutual exclusion:** Ensure only ONE fires per page load
2. **Add tier property:** Include `userTier: 'free' | 'paid'` on all events
3. **Validation:** Add runtime checks to prevent dual-firing

```typescript
// Example improved tracking
if (subscription.plan === 'free') {
  trackEvent('horoscope_viewed', { userTier: 'free' });
} else {
  trackEvent('personalized_horoscope_viewed', { userTier: 'paid' });
}
```

---

## Complete Event Inventory

### User Lifecycle Events

| Event | Trigger | Location | De-dup |
|-------|---------|----------|--------|
| `signup` | User completes registration | Auth.tsx:123 | None |
| `onboarding_completed` | User finishes onboarding | - | None |
| `birthday_entered` | User enters birthday | profile/page.tsx:516 | None |
| `birth_data_submitted` | User submits birth data | OnboardingFlow.tsx:442 | None |
| `profile_completed` | User completes profile | profile/page.tsx:519 | None |

### Product Feature Usage (Product MAU)

| Event | Trigger | Location | De-dup | Notes |
|-------|---------|----------|--------|-------|
| `daily_dashboard_viewed` | Dashboard page load | app/AppDashboardClient.tsx:160 | **Once/day** | localStorage guard |
| `astral_chat_used` | User sends chat message | guide/page.tsx:674 | None | |
| `tarot_drawn` | Tarot card pull | tarot/page.tsx:659 | None | Mapped from `tarot_viewed` |
| `chart_viewed` | Birth chart view | birth-chart/page.tsx:1108 | None | Mapped from `birth_chart_viewed` |
| `ritual_started` | User starts daily ritual | DailyRitualPrompt.tsx:80 | None | |

### Content View Events

| Event | Trigger | Location | De-dup | Bug Status |
|-------|---------|----------|--------|------------|
| `horoscope_viewed` | Horoscope page load | horoscope/page.tsx:29 | None | 🐛 **FIRES WITH personalized_horoscope_viewed** |
| `personalized_horoscope_viewed` | Same as above | horoscope/page.tsx:30 | None | 🐛 **DUPLICATE OF horoscope_viewed** |
| `personalized_tarot_viewed` | Personalized tarot | tarot/page.tsx:384 | None | ⚠️ Check for similar bug |
| `grimoire_viewed` | Grimoire content view | GrimoireLayoutClient.tsx:899 | **Once/day/entity** | DB constraint |
| `crystal_recommendations_viewed` | Crystal widget | CrystalWidget.tsx:80 | None | |

### Engagement Events

| Event | Trigger | Location | De-dup |
|-------|---------|----------|--------|
| `app_opened` | Session start | analytics.ts:484 | **30min** (session) |
| `product_opened` | Auth layout load | (authenticated)/layout.tsx:26 | **30min** (session) |
| `page_viewed` | Generic page view | analytics.ts:494 | None |

### CTA/Conversion Events

| Event | Trigger | Location | Notes |
|-------|---------|----------|-------|
| `cta_clicked` | Any CTA click | telemetry/cta-click/route.ts | Hub parameter tracked |
| `upgrade_prompted_shown` | Paywall shown | UpgradePrompt.tsx:96 | |
| `upgrade_clicked` | Upgrade button | Multiple files | |
| `feature_gated` | Feature blocked | FeatureGate.tsx:42 | |
| `pricing_page_viewed` | /pricing visit | useConversionTracking.ts:16 | |

### Subscription Events

| Event | Trigger | Location | Notes |
|-------|---------|----------|-------|
| `trial_started` | Trial begins | success/page.tsx:88 | |
| `trial_converted` | Trial → paid | useConversionTracking.ts:49 | |
| `subscription_started` | New subscription | success/page.tsx:110 | |
| `trial_expired` | Trial ends | conversionTracking | |

---

## Analytics Query Audit

### Query 1: Feature Adoption ✅ FIXED

**Endpoint:** `/api/admin/analytics/feature-adoption`
**Status:** Fixed on 2026-01-26

**Previous issue:**
- Used `'app_opened'` event type → App MAU (3,042)
- Result: Feature adoption appeared <1%

**Current implementation:**
- Uses `'product_opened'` event type → Product MAU (131)
- Result: Realistic 5-20% adoption rates

---

### Query 2: Activation Breakdown 🐛 AFFECTED BY HOROSCOPE BUG

**Endpoint:** `/api/admin/analytics/activation`
**Status:** Correct logic, but receives duplicate event data

**Current implementation:** (activation/route.ts:51-111)
```sql
WITH activation_events AS (
  SELECT
    ce.user_id,
    ce.event_type,
    MIN(ce.created_at) as activation_at
  FROM conversion_events ce
  JOIN signups s ON ce.user_id = s.user_id
  WHERE ce.event_type = ANY($5::text[])  -- Includes both horoscope events
    AND ce.created_at >= s.signup_at
    AND ce.created_at <= s.signup_at + INTERVAL '24 hours'
  GROUP BY ce.user_id, ce.event_type
)
```

**Issue:**
- Query logic is CORRECT
- But receives BOTH `horoscope_viewed` and `personalized_horoscope_viewed` for same users
- Results in identical counts because source data is duplicated

**Fix:**
- Fix horoscope page tracking (Issue #1)
- Query will automatically show correct breakdown

---

### Query 3: CTA Conversions ✅ WORKING AS DESIGNED

**Endpoint:** `/api/admin/analytics/cta-conversions`
**Status:** Working correctly

**Current implementation:**
- Groups CTA clicks by `hub` parameter
- Joins with signups within 7-day attribution window
- Calculates conversion rate per hub

**"app" hub:**
- Represents SmartTrialButton clicks when no contextual hub matches
- Not a bug, just naming inconsistency

**Recommendation:**
- Document hub naming convention
- Consider renaming to `'smart_trial_button'` or `'universal'`

---

### Query 4: DAU/WAU/MAU Calculations ✅ CORRECT

**Endpoint:** `/api/admin/analytics/dau-wau-mau`
**Status:** Working correctly

**Metrics tracked:**
- **App MAU:** Users who triggered `'app_opened'` (any user)
- **Product MAU:** Users who triggered product events (signed-in only)
- **Grimoire MAU:** Users who triggered `'grimoire_viewed'`

**Product events definition:** (dau-wau-mau/route.ts:22-29)
```typescript
const PRODUCT_EVENTS = [
  'daily_dashboard_viewed',
  'chart_viewed',
  'tarot_drawn',
  'astral_chat_used',
  'ritual_started',
];
```

**Validation:**
- De-duplication via canonical identity (user_id + anonymous_id linking)
- Test email filtering (`@test.lunary.app`)
- Signed-in requirement for Product MAU

✅ **No issues found**

---

## Tracking Implementation Review

### De-duplication Guards

| Event | Guard Type | Key/Storage | Duration |
|-------|-----------|-------------|----------|
| `daily_dashboard_viewed` | Date-based | localStorage | 1 UTC day |
| `app_opened` | Session-based | sessionStorage | 30 minutes |
| `product_opened` | Session-based | sessionStorage | 30 minutes |
| `grimoire_viewed` | DB constraint | Database | 1 UTC day per entity |

**Implementation pattern:**
```typescript
function shouldTrackDailyDashboardViewed(): boolean {
  const today = new Date().toISOString().slice(0, 10); // UTC date
  const userId = getUserId();
  const key = `lunary_daily_dashboard_viewed:${userId}:${today}`;

  if (localStorage.getItem(key)) {
    return false;  // Already tracked today
  }

  localStorage.setItem(key, '1');
  return true;
}
```

---

### Event Metadata Captured

**Global metadata on ALL events:**
- `userId` - Signed-in user ID (nullable)
- `anonymousId` - Anonymous session ID (fallback)
- `userEmail` - User email address
- `planType` - Subscription plan (monthly/yearly/free)
- `eventId` - Unique event UUID for deduplication
- `pagePath` - Current page URL path
- `timestamp` - Event timestamp (client-side)

**Attribution metadata:**
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `referrer` - HTTP referrer
- `origin_hub` - Contextual hub (grimoire, tarot, horoscope, etc.)
- `origin_page` - Landing page
- `origin_type` - Traffic type (seo, internal, direct)

**Event-specific metadata:**
- `grimoire_viewed`: `entity_id`, `entity_type`, `search_query`, `first_touch_*`
- `cta_clicked`: `hub`, `ctaId`, `location`, `label`, `href`
- `ritual_started`: `ritualType`, `prompt`
- `astral_chat_used`: `message_length`, `is_first_message` (PostHog only)

---

### Privacy & Data Sanitization

**Blocked metadata keys:** (canonical-events.ts:177-187)
```typescript
const BLOCKED_METADATA_KEYS = [
  'message', 'prompt', 'completion', 'input', 'output',
  'text', 'content', 'conversation', 'thread',
  'assistant', 'response'
];
```

**Sanitization rules:**
- Email normalized to lowercase
- Paths stripped of query/hash
- Only primitives allowed (strings, numbers, booleans, null)
- Nested objects flattened

**Test email filtering:**
- Pattern: `%@test.lunary.app`
- Exact: `test@test.lunary.app`
- Applied in ALL analytics queries

---

## Recommendations

### Immediate Actions (Critical)

1. ✅ **COMPLETED: Fix feature adoption denominator**
   - Changed to use Product MAU
   - Commit: 498bbe6f

2. 🚨 **TODO: Fix horoscope dual-event tracking**
   - **Priority: CRITICAL**
   - Replace dual tracking with conditional logic
   - Test with free AND paid users
   - Verify activation breakdown shows correct split

3. ⚠️ **TODO: Standardize CTA hub naming**
   - **Priority: MEDIUM**
   - Change SmartTrialButton fallback from `'app'` to `'universal'`
   - OR document "app" as SmartTrialButton fallback
   - Update analytics dashboard labels

### Short-term Actions (Important)

4. ⏳ **Add tier property to all events**
   - Include `userTier: 'free' | 'paid'` on every event
   - Enables better segmentation in analytics
   - Redundancy with separate event types provides validation

5. ⏳ **Add runtime validation for dual-firing**
   - Detect when multiple mutually-exclusive events fire
   - Log warnings in development
   - Prevent in production

6. ⏳ **Document event taxonomy**
   - Create events.md with full event catalog
   - Include when each event fires
   - Specify mutual exclusions

### Long-term Actions (Nice to have)

7. ⏳ **Create analytics test suite**
   - Unit tests for each tracking function
   - Integration tests for event firing
   - Validation tests for query calculations

8. ⏳ **Add event versioning**
   - Schema evolution for breaking changes
   - Backward compatibility for queries
   - Migration paths for renamed events

9. ⏳ **Implement event schema validation**
   - TypeScript types for event payloads
   - Runtime validation on API
   - Reject malformed events

---

## Testing Checklist

### Horoscope Tracking Fix

- [ ] Free user visits /horoscope → only `horoscope_viewed` fires
- [ ] Paid user visits /horoscope → only `personalized_horoscope_viewed` fires
- [ ] Activation breakdown shows different counts for each event
- [ ] No users appear in both event types

### CTA Hub Tracking

- [ ] SmartTrialButton click records correct hub
- [ ] Grimoire CTAs use contextual hub (not "app")
- [ ] Dashboard shows clear hub names
- [ ] All hubs have associated conversions

### Feature Adoption

- [ ] Dashboard viewed: ~19.8% (26/131)
- [ ] Astral chat: ~4.6% (6/131)
- [ ] Tarot drawn: ~9.9% (13/131)
- [ ] All percentages between 0-100%

### De-duplication

- [ ] Daily dashboard only tracked once per day per user
- [ ] App/product opened only once per 30min session
- [ ] Grimoire viewed once per day per entity
- [ ] No duplicate event_ids in database

---

## Files Modified (Pending)

### To Fix Horoscope Bug:

**File:** `/src/app/(authenticated)/horoscope/page.tsx`

**Lines 27-35:** Replace with:
```typescript
useEffect(() => {
  if (!user?.id) return;

  const isPaidUser = subscription.plan === 'monthly' || subscription.plan === 'yearly';

  if (hasPersonalHoroscopeAccess && isPaidUser) {
    // Paid users: track personalized horoscope view
    conversionTracking.personalizedHoroscopeViewed(user.id, subscription.plan);
  } else if (user.id) {
    // Free users: track generic horoscope view
    conversionTracking.horoscopeViewed(user.id, subscription.plan);
  }
}, [hasPersonalHoroscopeAccess, user?.id, subscription.plan]);
```

### To Fix CTA Hub:

**File:** `/src/components/SmartTrialButton.tsx`

**Line 104:** Change from:
```typescript
const hub = getContextualHub(pathname, 'app');
```

To:
```typescript
const hub = getContextualHub(pathname, 'universal'); // Standardize fallback
```

OR add comment:
```typescript
const hub = getContextualHub(pathname, 'app'); // 'app' = SmartTrialButton fallback
```

---

## Appendix: Analytics Architecture

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
conversionTracking.*() or trackEvent()
    ↓
┌─────────────────┬──────────────────┬───────────────────┐
│ Vercel Analytics│  PostHog (opt)   │  Conversion API   │
│   track()       │  capture()       │  POST /api/...    │
└─────────────────┴──────────────────┴───────────────────┘
                                              ↓
                                   Event Canonicalization
                                              ↓
                                   conversion_events table
                                              ↓
                                   KPI Calculation Queries
                                              ↓
                                   Analytics Dashboard
```

### Key Technologies

- **Database:** PostgreSQL (Vercel Postgres)
- **Analytics Platform:** Vercel Analytics (web vitals)
- **Optional:** PostHog (feature flags, experiments)
- **Transport:** Fetch API + navigator.sendBeacon()
- **Client Framework:** React + Next.js App Router

### Database Schema

**Table:** `conversion_events`

```sql
CREATE TABLE conversion_events (
  id SERIAL PRIMARY KEY,
  event_id UUID UNIQUE NOT NULL,  -- Client-generated UUID for deduplication
  event_type VARCHAR(100) NOT NULL,
  user_id VARCHAR(255),
  anonymous_id VARCHAR(255),
  user_email VARCHAR(255),
  plan_type VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB,

  -- Constraints for de-duplication
  CONSTRAINT uq_conversion_events_grimoire_viewed_daily
    UNIQUE (user_id, event_type, entity_id, DATE(created_at))
    WHERE event_type = 'grimoire_viewed'
);

-- Indexes for performance
CREATE INDEX idx_conversion_events_type_created ON conversion_events(event_type, created_at);
CREATE INDEX idx_conversion_events_user_created ON conversion_events(user_id, created_at);
CREATE INDEX idx_conversion_events_event_id ON conversion_events(event_id);
```

**Table:** `analytics_identity_links`

```sql
CREATE TABLE analytics_identity_links (
  anonymous_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  first_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Conclusion

**Analytics tracking audit is complete.** Three main issues identified:

1. ✅ **Feature adoption denominator** - FIXED
2. 🚨 **Horoscope dual-event bug** - FIX REQUIRED (code provided)
3. ⚠️ **CTA hub naming** - DESIGN DECISION NEEDED

**Next steps:**
1. Apply horoscope tracking fix
2. Decide on CTA hub naming standard
3. Verify metrics in production
4. Consider tier property addition for future-proofing

**Investor readiness status:**
- After horoscope fix: ✅ Metrics will be accurate and defensible
- Current state: ⚠️ Horoscope numbers confusing, feature adoption fixed
