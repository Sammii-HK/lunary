# Ritual Feature Investigation - 0% Adoption Issue

## Executive Summary

**Critical Finding:** The Ritual feature shows 0% adoption because it's **only accessible to paid subscribers** and is **hidden inside the Guide chat interface** during specific time windows (morning/evening).

## What is the Ritual Feature?

The "ritual" feature is **NOT a standalone feature**, but rather:

- Morning/evening reflection prompts injected into the Guide chat
- Only appears during specific time windows (6am-2pm for morning, 2pm+ for evening)
- Only shown to paid subscribers
- Displayed as chat messages from the AI assistant
- Requires users to be actively using the Guide feature

## Tracking Implementation

### Event Name

- Canonical event: `ritual_started`
- Legacy event: `ritual_view` (maps to ritual_started)

### Tracking Locations

#### 1. Guide Page (Primary Location)

**File:** `src/app/(authenticated)/guide/page.tsx`

**How it works:**

- Uses `useRitualBadge` hook to check if there's an unread morning/evening ritual
- Injects ritual message into chat history when user opens Guide
- Tracks "shown" event via `trackRitualShown()`
- Tracks "engaged" event via `trackRitualEngaged()` when user responds
- **Note:** This is `ritual_message_events` table, NOT the `ritual_started` canonical event

**Gating:**

- Only for `subscription.isSubscribed === true`
- Only during specific time windows
- Only on Sunday mornings (for weekly insights)

#### 2. DailyRitualPrompt Component (UNUSED!)

**File:** `src/components/DailyRitualPrompt.tsx`

**Critical Issue:** This component exists and calls `conversionTracking.ritualStarted()` (which fires the canonical event), BUT:

- **The component is never imported or used anywhere in the codebase**
- It's a standalone Link component that redirects to Book of Shadows
- It has proper tracking: `conversionTracking.ritualStarted()` on click
- This is likely the component that SHOULD be firing the canonical event

### Why 0% Adoption?

**Root Cause: The canonical event `ritual_started` is never fired because:**

1. **DailyRitualPrompt component is not used**
   - The only component that calls `conversionTracking.ritualStarted()` is never rendered
   - It's an orphaned component in the codebase

2. **Guide page tracks different events**
   - Guide page tracks to `ritual_message_events` table (for A/B testing ritual messages)
   - Does NOT call `conversionTracking.ritualStarted()`
   - Different tracking system entirely

3. **No other components call ritualStarted()**
   - Searched entire codebase
   - Only DailyRitualPrompt.tsx calls the canonical tracking function
   - And it's not rendered anywhere

## Discoverability Issues

Even if tracking worked, there are major discoverability problems:

### 1. Hidden Behind Subscription Paywall

- Only paid users can see ritual prompts
- Free users never encounter the feature
- Limits potential adoption to ~5-10% of user base

### 2. Buried Inside Guide Interface

- Not a standalone feature with its own nav item
- Only appears as injected messages in chat
- Users must:
  1. Be subscribed
  2. Open Guide during specific time window
  3. Recognize the ritual prompt in chat
  4. Engage with it

### 3. Time-Gated

- Morning rituals: 6am-2pm only
- Evening rituals: 2pm+ only
- Sunday weekly insights only
- Users visiting at "wrong" time never see it

### 4. No Visual Indicators

- No badge or notification in nav
- No dedicated entry point
- Appears identical to regular chat messages
- Easy to miss or ignore

## Analytics Data Sources

### Canonical Events Table

- **Table:** `conversion_events`
- **Event type:** `ritual_started`
- **Status:** 0 events (confirmed in analytics)

### Ritual Message Events Table

- **Table:** `ritual_message_events`
- **Columns:** `message_id`, `context`, `user_id`, `shown_at`, `engaged`, `engaged_at`
- **Purpose:** A/B testing ritual message performance
- **Status:** Unknown (separate from canonical events)

## Recommendations

### Immediate Fixes (High Priority)

1. **Connect DailyRitualPrompt Component**
   - Add DailyRitualPrompt to dashboard or appropriate page
   - This will start firing `ritual_started` events
   - Component already has proper tracking implemented

2. **Add Canonical Tracking to Guide**
   - When ritual message is injected in Guide, also call:
     ```typescript
     conversionTracking.ritualStarted(user?.id, user?.email, planType, {
       ritualType: ritualState.ritualType,
       context: 'guide_chat',
     });
     ```

3. **Verify Ritual Feature Still Desired**
   - Component has been orphaned - was it intentionally deprecated?
   - If yes: Remove from analytics tracking
   - If no: Re-implement with better discoverability

### Medium-Term Improvements

4. **Improve Discoverability**
   - Add dedicated "Rituals" or "Daily Practice" nav tab
   - Show badge when morning/evening ritual is available
   - Make it accessible to free users (to drive upgrades)
   - Add entry point on dashboard

5. **Expand Time Windows**
   - Don't gate by time - show morning ritual all day
   - Add "catch up on yesterday's ritual" option
   - Make rituals persistent, not ephemeral

6. **Unify Tracking Systems**
   - Bridge `ritual_message_events` table to canonical events
   - Create view or scheduled job to sync engagement data
   - Ensure all ritual interactions fire canonical events

### Long-Term Vision

7. **Standalone Ritual Experience**
   - Dedicated page: `/rituals` or `/practice`
   - Morning/evening ritual flows
   - Tracking integration (moon phases, planets, etc)
   - Journal integration
   - Community sharing (optional)

8. **Progressive Feature Access**
   - Free users see simplified ritual prompts
   - Paid users get personalized, astrologically-timed rituals
   - Use as conversion driver ("Unlock personalized rituals")

## Test Plan

To verify tracking after fixes:

1. **Test DailyRitualPrompt:**
   - Add component to dashboard temporarily
   - Click the prompt link
   - Verify `ritual_started` event in Postgres:
     ```sql
     SELECT * FROM conversion_events
     WHERE event_type = 'ritual_started'
     ORDER BY created_at DESC LIMIT 10;
     ```

2. **Test Guide Integration:**
   - Be subscribed user
   - Open Guide during morning/evening window
   - Check ritual message appears
   - Verify canonical event fires
   - Check `ritual_message_events` table for engagement

3. **Monitor Analytics:**
   - Check `/api/admin/analytics/feature-adoption` endpoint
   - Verify `ritual_started` count > 0
   - Monitor for next 7 days to establish baseline

## Files Involved

### Components

- `src/components/DailyRitualPrompt.tsx` - Orphaned ritual component with tracking
- `src/app/(authenticated)/guide/page.tsx` - Guide chat with ritual injection

### Tracking

- `src/lib/analytics.ts` - `conversionTracking.ritualStarted()` function
- `src/lib/analytics/canonical-events.ts` - Event type definitions
- `src/hooks/useRitualBadge.ts` - Ritual badge state management

### API Routes

- `src/app/api/rituals/track/route.ts` - Ritual message tracking (separate system)
- `src/app/api/rituals/weekly-insights/route.ts` - Weekly insight generation
- `src/app/api/ritual/complete/route.ts` - Ritual completion tracking

### Database Tables

- `conversion_events` - Canonical analytics events (ritual_started)
- `ritual_message_events` - A/B testing events (shown, engaged)

## Conclusion

**The ritual feature has 0% adoption because the tracking code is in an unused component.**

This is a **tracking issue**, not necessarily a feature usage issue. The ritual messages ARE being shown to paid users in the Guide, but they're tracked in a separate table (`ritual_message_events`) that doesn't feed into the canonical analytics.

**Action Required:**

1. Decide if rituals should be a standalone feature (with DailyRitualPrompt component)
2. Or if rituals should remain Guide-only (add canonical tracking to Guide)
3. Or if rituals should be deprecated entirely (remove tracking from analytics)

**Recommended:** Option 1 - Make rituals a standalone, discoverable feature with proper tracking. The infrastructure exists, it just needs to be connected and surfaced to users.
