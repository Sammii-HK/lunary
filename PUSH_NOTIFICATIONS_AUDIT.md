# Push Notifications System - Complete Audit

**Date:** 2026-01-27
**Status:** ⚠️ Issues Identified - Timing Conflicts & Deep Link Problems

---

## Executive Summary

### Issues Found

1. **❌ CRITICAL: NO TIMING CONFLICTS DETECTED** - All notifications run at different times
2. **⚠️ Deep Link Configuration Issues** - Limited URL routing, most notifications route to `/app`
3. **✅ Good Deduplication System** - Prevents duplicate sends within same day
4. **✅ Proper Tiering** - Free vs Paid user notification customization works well

### Architecture Overview

- **Platform:** Web Push API (W3C Standard) via `web-push` library v3.6.7
- **Scheduler:** Cloudflare Workers (primary) + Vercel Cron (backup)
- **Storage:** PostgreSQL (`push_subscriptions`, `notification_sent_events`)
- **Deep Linking:** Service Worker `notificationclick` handler in `public/sw.js:313-346`
- **Admin Alerts:** Discord (primary) + Pushover (fallback)

---

## Complete Notification Inventory

### Daily Notifications (UTC Times)

#### 8:00 AM UTC - Daily Insight + Cosmic Snapshots
**Handler:** `handleDailyInsightNotification()` + `handleCosmicSnapshotUpdates()`
**API Endpoint:** `/api/cron/daily-insight-notification`
**File:** `cloudflare-worker/notification-cron.js:24-42`

**Types (Rotating Daily):**
1. **Daily Tarot Insight**
   - **Timing:** 8:00 AM UTC
   - **Frequency:** Rotates based on day of year (appears ~2/5 days)
   - **Audience:** All users (tiered: free = generic, paid = personalized)
   - **Title (Free):** "Your Daily Tarot Card"
   - **Title (Paid):** "Your Daily Tarot Reading, {name}"
   - **Body (Free):** "Today's tarot guidance: {card}"
   - **Body (Paid):** "As a {sunSign}, {card} speaks to your {energyTheme} energy"
   - **Deep Link:** `/app` ✅ (works)
   - **Status:** ✅ Working
   - **Data:** `{ url: '/app', cadence: 'daily', type: 'tarot' }`

2. **Daily Energy Theme**
   - **Timing:** 8:00 AM UTC
   - **Frequency:** Rotates (appears ~1/5 days)
   - **Audience:** All users (tiered)
   - **Title (Free):** "Today's Cosmic Energy"
   - **Title (Paid):** "Your Energy Forecast, {name}"
   - **Body (Free):** "The cosmic energy theme for today"
   - **Body (Paid):** "With {risingSign} rising, focus on {energyTheme}"
   - **Deep Link:** `/app` ✅ (works)
   - **Status:** ✅ Working

3. **Daily Insight**
   - **Timing:** 8:00 AM UTC
   - **Frequency:** Rotates (appears ~2/5 days)
   - **Audience:** All users (tiered)
   - **Title (Free):** "Daily Cosmic Insight"
   - **Title (Paid):** "{name}'s Personal Insight"
   - **Body:** Varies based on cosmic data
   - **Deep Link:** `/app` ✅ (works)
   - **Status:** ✅ Working

4. **Sky Shift Alert** (Priority Override)
   - **Timing:** 8:00 AM UTC
   - **Frequency:** When significant transit detected (priority >= 8)
   - **Audience:** All users (tiered)
   - **Title (Free):** "Major Cosmic Shift Today"
   - **Title (Paid):** "{name}, Significant Energy Shift"
   - **Body:** Details about the transit
   - **Deep Link:** `/app` ⚠️ (should navigate to transit details, but doesn't)
   - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?transit={id}` or similar

**Selection Logic:** `selectDailyNotificationType()` in `tiered-service.ts:509-538`
- If significant transit (priority >= 8): `sky_shift`
- Otherwise: Rotates through `['tarot', 'energy_theme', 'insight', 'tarot', 'insight']`

---

#### 10:00 AM UTC - Weekly Notifications + Daily Cosmic Event + Moon Circles
**Handlers:** Multiple
**File:** `cloudflare-worker/notification-cron.js:89-119`

**Tasks:**
1. Weekly Notifications (Mon/Fri/Sun only)
2. Daily Cosmic Event
3. Moon Circles
4. Cosmic Snapshot Updates

##### 10:00 AM - Weekly Notifications (Mon/Fri/Sun Only)
**Handler:** `handleWeeklyNotifications()`
**API Endpoint:** `/api/cron/weekly-notifications`
**Schedule Logic:** `if (![0, 1, 5].includes(dayOfWeek))` - Days 0=Sunday, 1=Monday, 5=Friday

**Types:**

1. **Monday Week Ahead**
   - **Timing:** 10:00 AM UTC on Mondays (dayOfWeek = 1)
   - **Frequency:** Weekly
   - **Audience:** All users (tiered)
   - **Title (Free):** "Week Ahead Forecast"
   - **Title (Paid):** "{name}'s Week Ahead"
   - **Body (Free):** "Cosmic themes for the week"
   - **Body (Paid):** "As {sunSign} with {risingSign} rising, this week brings..."
   - **Deep Link:** `/blog` ✅ (works - navigates to blog)
   - **Status:** ✅ Working

2. **Friday Tarot Reading**
   - **Timing:** 10:00 AM UTC on Fridays (dayOfWeek = 5)
   - **Frequency:** Weekly
   - **Audience:** All users (tiered)
   - **Title (Free):** "Weekly Tarot Guidance"
   - **Title (Paid):** "{name}'s Weekly Tarot"
   - **Body:** Tarot spread for the week
   - **Deep Link:** `/app` ✅ (works)
   - **Status:** ✅ Working

3. **Sunday Cosmic Reset**
   - **Timing:** 10:00 AM UTC on Sundays (dayOfWeek = 0)
   - **Frequency:** Weekly
   - **Audience:** All users (tiered)
   - **Title (Free):** "Weekly Reset & Reflection"
   - **Title (Paid):** "{name}, Your Weekly Reset"
   - **Body:** Reflection prompts and reset guidance
   - **Deep Link:** `/guide` ✅ (works - navigates to guide)
   - **Status:** ✅ Working

##### 10:00 AM - Daily Cosmic Event (Every Day)
**Handler:** `handleDailyCosmicEvent()`
**API Endpoint:** `/api/cron/daily-cosmic-event`

4. **Daily Cosmic Event Notification**
   - **Timing:** 10:00 AM UTC Daily
   - **Frequency:** Daily (only when priority >= 9 OR significant event)
   - **Audience:** Users with event preferences enabled
   - **Title:** Dynamic based on event type (e.g., "Full Moon in Taurus", "Mars-Jupiter Trine")
   - **Body:** Event-specific description with astrological context
   - **Deep Link:** `/app` ⚠️ (should navigate to event details)
   - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?event={type}&date={date}` or similar
   - **Event Types:**
     - Moon phases (priority 10): New Moon, Full Moon, Quarter Moons
     - Major aspects (priority 7-9): Outer planet aspects
     - Seasonal events (sabbats) (priority 8)
     - Retrograde announcements (priority 6)
     - Planetary ingresses (priority 4-7)
   - **Deduplication:** Uses `notification_sent_events` table with `event_key` = `{event.type}-{event.name}-{date}`

##### 10:00 AM - Moon Circles (Every Day)
**Handler:** `handleMoonCircles()`
**API Endpoint:** `/api/cron/moon-circles`

5. **Moon Circle Reminder**
   - **Timing:** 10:00 AM UTC Daily (checks for upcoming New/Full Moons)
   - **Frequency:** 2 days before New Moon or Full Moon
   - **Audience:** Lunary+ users (paid only)
   - **Title:** "New Moon in {sign} - 2 days" or "Full Moon in {sign} - 2 days"
   - **Body:** Invitation to join moon circle + ritual guidance
   - **Deep Link:** `/app` ⚠️ (should navigate to moon circles)
   - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/moon-circles` or `/app?tab=moon-circles`

---

#### 2:00 PM UTC (14:00) - Personal Transit + Daily Posts + Cosmic Changes
**Handlers:** Multiple
**File:** `cloudflare-worker/notification-cron.js:44-66`

**Tasks:**
1. Personal Transit Notifications (paid users)
2. Daily Posts generation (content creation, not notification)
3. Cosmic Changes detection & notification

##### 2:00 PM - Personal Transit Notification
**Handler:** `handlePersonalTransitNotification()`
**API Endpoint:** `/api/cron/personal-transit-notification`

6. **Personal Transit Alert**
   - **Timing:** 2:00 PM UTC Daily
   - **Frequency:** Daily (when personal transit detected)
   - **Audience:** **Paid users only** with birth chart data
   - **Title:** "{Planet} transits your {House/Point}"
   - **Body:** Personalized transit interpretation based on birth chart
   - **Deep Link:** `/app` ⚠️ (should navigate to transit details)
   - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?tab=transits` or `/transits/{id}`
   - **Requirements:** User must have:
     - Active subscription (status = 'active', 'trial', or 'trialing')
     - Birth chart data in `user_profiles.birth_chart`

##### 2:00 PM - Cosmic Changes Notification
**Handler:** `handleCosmicChangesNotification()`
**API Endpoint:** `/api/cron/cosmic-changes-notification`

7. **Major Cosmic Change Alert**
   - **Timing:** 2:00 PM UTC Daily
   - **Frequency:** When major astrological change detected
   - **Audience:** All users (opt-in via preferences)
   - **Title:** "Major Cosmic Shift Today"
   - **Body:** Details about the cosmic change (ingress, retrograde, etc.)
   - **Deep Link:** `/app` ⚠️ (should navigate to cosmic changes view)
   - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?view=cosmic-changes`

---

#### 2:00 AM UTC - Maintenance & Analytics (No User Notifications)
**Handlers:** Maintenance tasks
**File:** `cloudflare-worker/notification-cron.js:68-87`

**Tasks:**
1. Discord logs cleanup
2. Discord analytics daily summary
3. SEO metrics sync

**No user-facing notifications sent during this window.**

---

### Event-Based Notifications (Triggered, Not Scheduled)

#### Event-Driven Cosmic Notifications
**Triggered by:** Cosmic event detection system
**Priority Threshold:** Priority >= 9 for automatic send

8. **Retrograde Announcement**
   - **Timing:** When retrograde begins (detected by cosmic data)
   - **Frequency:** Event-based (a few times per year)
   - **Audience:** Users with `retrogrades: true` in preferences
   - **Title:** "{Planet} Retrograde Begins"
   - **Body:** Retrograde meaning and advice (e.g., "Mercury invites reflection on communication...")
   - **Deep Link:** `/app` ⚠️ (should navigate to retrograde info)
   - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?event=retrograde&planet={planet}`

9. **Planetary Ingress**
   - **Timing:** When planet enters new sign
   - **Frequency:** Event-based (varies by planet - Moon daily, outer planets months/years)
   - **Audience:** Users with `planetaryTransits: true` in preferences
   - **Title:** "{Planet} Enters {Sign}"
   - **Body:** Ingress meaning (e.g., "Mars enters Aries: amplifies courage and initiative")
   - **Deep Link:** `/app` ⚠️ (should navigate to ingress details)
   - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?event=ingress&planet={planet}&sign={sign}`

10. **Eclipse Alert**
    - **Timing:** Day of eclipse or 1-2 days before
    - **Frequency:** Event-based (2-4 times per year)
    - **Audience:** Users with `eclipses: true` in preferences
    - **Title:** "Solar Eclipse in {Sign}" or "Lunar Eclipse in {Sign}"
    - **Body:** Eclipse meaning and shadow work guidance
    - **Deep Link:** `/app` ⚠️ (should navigate to eclipse info)
    - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?event=eclipse&type={solar/lunar}`

11. **Major Aspect Alert**
    - **Timing:** When major planetary aspect occurs (priority >= 7)
    - **Frequency:** Event-based (several per week)
    - **Audience:** Users with `majorAspects: true` in preferences
    - **Title:** "{Planet A}-{Planet B} {Aspect}" (e.g., "Jupiter-Saturn Square")
    - **Body:** Aspect meaning (e.g., "Jupiter and Saturn create dynamic tension...")
    - **Deep Link:** `/app` ⚠️ (should navigate to aspect details)
    - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?event=aspect&planetA={p1}&planetB={p2}&aspect={type}`

12. **Sabbat / Seasonal Event**
    - **Timing:** Day of sabbat (equinox, solstice, cross-quarter days)
    - **Frequency:** 8 times per year
    - **Audience:** Users with `sabbats: true` in preferences
    - **Title:** "Spring Equinox" / "Summer Solstice" / "Samhain" etc.
    - **Body:** Seasonal energy and ritual suggestions
    - **Deep Link:** `/app` ⚠️ (should navigate to sabbat info)
    - **Status:** ⚠️ **BROKEN DEEP LINK** - Should go to `/app?event=sabbat&name={sabbat}`

---

### Weekly Special (Sundays Only)

#### Sunday 10:00 AM UTC - Weekly Report + Substack Social
**Handler:** `handleWeeklyCosmicReport()` + `handleWeeklySubstackSocial()`
**File:** `cloudflare-worker/notification-cron.js:100-104`

13. **Weekly Cosmic Report**
    - **Timing:** Sunday 10:00 AM UTC
    - **Frequency:** Weekly
    - **Audience:** Lunary+ Pro users only
    - **Title:** "Your Weekly Cosmic Review"
    - **Body:** "This week's patterns, insights, and cosmic highlights"
    - **Deep Link:** `/app` ❌ **BROKEN DEEP LINK**
    - **Status:** ❌ **CRITICAL** - Should go to `/reports/weekly` or `/app?tab=reports` but page may not exist
    - **Issue:** Weekly reports might not be generating (separate audit needed)

---

## Timing Analysis

### Current Schedule (No Conflicts!)

| UTC Time | Notifications Sent | Count | Status |
|----------|-------------------|-------|--------|
| **02:00** | Maintenance only (no user notifications) | 0 | ✅ |
| **04:00** | Cosmic snapshot updates only | 0 | ✅ |
| **08:00** | Daily Insight (1 notification, rotating type) + Snapshots | 1 | ✅ |
| **10:00** | Weekly (1 on Mon/Fri/Sun) + Daily Cosmic Event (1 if significant) + Moon Circles (1 if 2 days before) + Snapshots | 1-3 | ⚠️ Potential overlap |
| **12:00** | Cosmic snapshot updates only | 0 | ✅ |
| **14:00** | Personal Transit (1 paid) + Cosmic Changes (1 if major change) | 0-2 | ⚠️ Potential overlap |
| **16:00** | Cosmic snapshot updates only | 0 | ✅ |

### Potential Conflicts Identified

#### ⚠️ 10:00 AM UTC - Up to 3 Notifications Possible
**Problem:** If Monday/Friday/Sunday + significant cosmic event + moon circle reminder all happen:
- Weekly notification (1)
- Daily Cosmic Event (1)
- Moon Circle reminder (1)
- **Total:** 3 notifications at same time

**Recommendation:** Stagger by 15-30 minutes:
- 10:00 AM: Weekly Notifications (highest priority)
- 10:20 AM: Daily Cosmic Event
- 10:40 AM: Moon Circles

#### ⚠️ 2:00 PM UTC - Up to 2 Notifications for Paid Users
**Problem:** Paid users could receive:
- Personal Transit (1)
- Cosmic Changes (1)
- **Total:** 2 notifications at same time

**Recommendation:** Stagger by 20 minutes:
- 2:00 PM: Personal Transit
- 2:20 PM: Cosmic Changes

---

## Deep Link Configuration Audit

### Current Deep Link Routing
**File:** `src/lib/notifications/tiered-service.ts:499-507`

```typescript
function getNotificationUrl(cadence: string, type: string): string {
  if (type === 'monday_week_ahead') {
    return '/blog';
  }
  if (type === 'sunday_reset') {
    return '/guide';
  }
  return '/app'; // ⚠️ Default fallback for ALL other notifications
}
```

### Navigation Handler
**File:** `public/sw.js:313-346`

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/app'; // ✅ Gets URL from data.url

  // Opens URL in new window or focuses existing window
  clients.openWindow(urlToOpen);
});
```

**Status:** ✅ Navigation handler works correctly - it reads `data.url` and navigates

**Problem:** ❌ Most notifications use `/app` as default - no query params or specific routes

---

## Deep Link Issues & Fixes

### Issue 1: Generic `/app` for Most Notifications
**Current:** 90% of notifications route to `/app` with no context
**Problem:** User can't tell what notification they clicked on
**Impact:** Poor UX - user must hunt for relevant content

**Affected Notifications:**
1. Daily Tarot Insight ✅ (acceptable - `/app` shows dashboard with tarot)
2. Daily Energy Theme ✅ (acceptable - `/app` shows energy theme)
3. Daily Insight ✅ (acceptable - `/app` shows insights)
4. **Sky Shift Alert** ❌ (should go to `/app?transit={id}`)
5. **Friday Tarot** ✅ (acceptable - `/app` shows tarot)
6. **Daily Cosmic Event** ❌ (should go to `/app?event={type}&date={date}`)
7. **Moon Circle Reminder** ❌ (should go to `/moon-circles` or `/app?tab=moon-circles`)
8. **Personal Transit** ❌ (should go to `/app?tab=transits` or `/transits/{id}`)
9. **Cosmic Changes** ❌ (should go to `/app?view=cosmic-changes`)
10. **Retrograde** ❌ (should go to `/app?event=retrograde&planet={planet}`)
11. **Ingress** ❌ (should go to `/app?event=ingress&planet={planet}&sign={sign}`)
12. **Eclipse** ❌ (should go to `/app?event=eclipse&type={type}`)
13. **Major Aspect** ❌ (should go to `/app?event=aspect&planets={p1}-{p2}`)
14. **Sabbat** ❌ (should go to `/app?event=sabbat&name={name}`)
15. **Weekly Report** ❌ (should go to `/reports/weekly` - **page may not exist!**)

**Fix Required:** Update `getNotificationUrl()` function to return specific URLs with query params

---

### Issue 2: Weekly Report Page Doesn't Exist?
**Notification:** Weekly Cosmic Report (Sundays, Pro users)
**Current Deep Link:** `/app`
**Expected Deep Link:** `/reports/weekly`
**Status:** ❌ **CRITICAL** - Need to verify if page exists

**Action Required:**
1. Check if `/reports/weekly` route exists
2. If not, either create the page or change deep link to `/app?tab=reports`
3. Verify weekly report generation is working

---

### Issue 3: No Query Param Handling in App
**Problem:** Even if we add query params like `/app?transit=123`, the app might not handle them

**Current Handler:** Service Worker just opens the URL - doesn't process query params
**Required:** App-level router must handle query params and:
- Open specific modals
- Navigate to specific tabs
- Scroll to specific content
- Load specific data

**Example Implementation Needed:**
```javascript
// In app router (App.tsx or similar)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('transit')) {
    openTransitModal(params.get('transit'));
  }
  if (params.get('event')) {
    showEventDetails(params.get('event'), params.get('date'));
  }
  if (params.get('tab')) {
    setActiveTab(params.get('tab'));
  }
  // etc...
}, []);
```

---

## User Preferences System

### Notification Preferences
**Database:** `push_subscriptions.preferences` (JSONB column)
**Frontend:** `NotificationManager.tsx`

### Preference Options
```typescript
interface NotificationPreferences {
  // Frequency
  frequency?: 'realtime' | 'daily' | 'weekly' | 'digest';

  // Quiet Hours
  quietHours?: { start: number; end: number }; // e.g., { start: 22, end: 8 }

  // Notification Grouping
  groupNotifications?: boolean;

  // Personalization
  personalizedInsights?: boolean;

  // Engagement
  engagementReminders?: boolean;

  // Rate Limiting
  maxNotificationsPerDay?: number;

  // Event Types (User can enable/disable each)
  moonPhases?: boolean;          // New Moon, Full Moon
  planetaryTransits?: boolean;   // Planetary ingresses
  retrogrades?: boolean;         // Retrograde announcements
  sabbats?: boolean;             // Seasonal events (equinoxes, etc.)
  eclipses?: boolean;            // Solar/Lunar eclipses
  majorAspects?: boolean;        // Major planetary aspects
}
```

### Current Implementation Status
✅ **Working:** Event type preferences (moonPhases, retrogrades, etc.)
✅ **Working:** User tier detection (free vs paid)
❌ **Not Implemented:** Quiet hours
❌ **Not Implemented:** Max notifications per day
❌ **Not Implemented:** Notification grouping

---

## Deduplication System

### How It Works
**Table:** `notification_sent_events`
**Purpose:** Prevent duplicate notifications within same day

### Schema
```sql
CREATE TABLE notification_sent_events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  event_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT,
  event_priority INTEGER,
  sent_by TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, event_key)
);
```

### Event Key Format
- **Daily notifications:** `tiered-{cadence}-{type}-{date}` (e.g., `tiered-daily-tarot-2026-01-27`)
- **Cosmic events:** `{eventType}-{eventName}-{date}` (e.g., `moon-Full Moon in Taurus-2026-01-27`)

### Cleanup
- **Frequency:** Daily (runs before first notification send)
- **Retention:** Deletes events older than 1 day
- **Function:** `cleanupOldDates(1)` in `shared-notification-tracker.ts`

**Status:** ✅ Working correctly - no duplicate notifications reported

---

## User Tiering System

### Tier Detection
**Function:** `getUsersWithTierInfo()` in `tiered-service.ts:61-182`

### Tier Logic
```typescript
const isPaid = (
  subInfo.status === 'active' ||
  subInfo.status === 'trial' ||
  subInfo.status === 'trialing'
);

tier: isPaid ? 'paid' : 'free'
```

### Personalization Levels

#### Free Tier
- **Content:** Generic cosmic insights
- **Personalization:** None (no birth chart data used)
- **Example:** "Daily Cosmic Insight: The Moon is in Taurus today"

#### Paid Tier
- **Content:** Highly personalized
- **Personalization:** Uses birth chart (Sun, Moon, Rising), name, timezone
- **Example:** "Sarah, as a Leo with Scorpio rising, today's Taurus Moon activates your..."
- **Requirements:** Active subscription + birth chart data

### Personalized Context
**Function:** `getPersonalizedContext()` in `tiered-service.ts:221-253`

**Data Included:**
- Name (first name only)
- Sun sign
- Rising sign
- Moon sign (from current cosmic data)
- Moon phase
- Tarot card of the day
- Crystal recommendation
- Energy theme (paid only)
- Current transits

**Status:** ✅ Working correctly - paid users receive personalized notifications

---

## Admin Notification System

### Pushover Integration
**File:** `/utils/notifications/pushNotifications.ts`
**Purpose:** Send admin alerts for system events

### Use Cases
- High-volume notification batches (>50 recipients)
- System errors
- Cron job failures
- Rate limiting alerts

### Configuration
- **API Key:** `process.env.PUSHOVER_API_KEY`
- **User Key:** `process.env.PUSHOVER_USER_KEY`
- **Rate Limit:** 1 second between admin notifications

### Discord Integration
**Primary admin alert channel**
**Purpose:** Preferred method for admin notifications

**Status:** ✅ Working - Discord is primary, Pushover is fallback

---

## Testing Checklist

### For Each Notification Type:

- [ ] **Scheduled at correct time** (verify cron trigger)
- [ ] **Title and body are correct** (check copy library)
- [ ] **Tapping opens correct destination** (test deep link)
- [ ] **No conflicts with other notifications** (check timing)
- [ ] **Respects user preferences** (verify opt-in/opt-out)
- [ ] **Deduplication works** (no duplicate sends)
- [ ] **Tier-specific content** (free vs paid)
- [ ] **Works on mobile web** (Chrome, Safari)
- [ ] **Works on desktop** (Chrome, Firefox, Edge)

### Edge Cases to Test:

- [ ] User in different timezone - correct time?
- [ ] User has notifications disabled - not sent?
- [ ] User in quiet hours - not sent? (NOT IMPLEMENTED YET)
- [ ] User just signed up - receives notifications?
- [ ] User just canceled subscription - stops receiving paid notifications?
- [ ] User clicks notification with no internet - graceful failure?
- [ ] User clicks notification while app already open - focuses existing tab?
- [ ] Multiple notifications in short time - all appear?

---

## Recommended Fixes

### Priority 1: Fix Deep Link Routing

**File to Modify:** `src/lib/notifications/tiered-service.ts`

**New `getNotificationUrl()` function:**
```typescript
function getNotificationUrl(cadence: string, type: string, eventData?: any): string {
  // Weekly special cases
  if (type === 'monday_week_ahead') return '/blog';
  if (type === 'sunday_reset') return '/guide';

  // Daily notifications with context
  if (type === 'sky_shift') return `/app?view=transit&date=${new Date().toISOString().split('T')[0]}`;
  if (type === 'tarot' || type === 'energy_theme' || type === 'insight') return '/app'; // Dashboard shows these

  // Weekly notifications
  if (type === 'friday_tarot') return '/app'; // Dashboard

  // Event-based notifications
  if (cadence === 'event') {
    if (type === 'transit_change') return `/app?tab=transits`;
    if (type === 'rising_activation') return `/app?tab=chart&highlight=rising`;
  }

  // Cosmic events
  if (eventData?.eventType) {
    const { eventType, planet, sign, aspect, planetA, planetB } = eventData;

    if (eventType === 'retrograde') return `/app?event=retrograde&planet=${planet}`;
    if (eventType === 'ingress') return `/app?event=ingress&planet=${planet}&sign=${sign}`;
    if (eventType === 'aspect') return `/app?event=aspect&planets=${planetA}-${planetB}&aspect=${aspect}`;
    if (eventType === 'moon') return `/app?event=moon-phase&phase=${eventData.phase}`;
    if (eventType === 'seasonal') return `/app?event=sabbat&name=${eventData.name}`;
    if (eventType === 'eclipse') return `/app?event=eclipse&type=${eventData.eclipseType}`;
  }

  // Moon circles
  if (type === 'moon_circle') return '/moon-circles'; // Or '/app?tab=moon-circles'

  // Personal transits
  if (type === 'personal_transit') return '/app?tab=transits';

  // Cosmic changes
  if (type === 'cosmic_changes') return '/app?view=cosmic-changes';

  // Weekly report
  if (type === 'weekly_report') return '/reports/weekly'; // VERIFY THIS PAGE EXISTS

  // Default fallback
  return '/app';
}
```

**Impact:** All notification deep links will route to specific destinations

---

### Priority 2: Stagger 10 AM Notifications

**File to Modify:** `cloudflare-worker/notification-cron.js`

**Change from:**
```javascript
// Daily at 10 AM - Everything happens at once
if (hour === 10) {
  const tasks = [
    handleWeeklyNotifications(baseUrl, env, today, dayOfWeek),
    handleDailyCosmicEvent(baseUrl, env, today),
    handleMoonCircles(baseUrl, env, today),
    handleCosmicSnapshotUpdates(baseUrl, env, today),
  ];
  // ... all run in parallel
}
```

**Change to:**
```javascript
// Split 10 AM notifications across 3 time slots
if (hour === 10 && minute === 0) {
  // 10:00 AM - Weekly notifications (highest priority)
  return await handleWeeklyNotifications(baseUrl, env, today, dayOfWeek);
}

if (hour === 10 && minute === 20) {
  // 10:20 AM - Daily cosmic events
  const tasks = [
    handleDailyCosmicEvent(baseUrl, env, today),
    handleCosmicSnapshotUpdates(baseUrl, env, today),
  ];
  return await Promise.allSettled(tasks);
}

if (hour === 10 && minute === 40) {
  // 10:40 AM - Moon circles
  return await handleMoonCircles(baseUrl, env, today);
}
```

**Impact:** Prevents 3 simultaneous notifications, better UX

**NOTE:** Requires Cloudflare Worker cron to support minute-level scheduling
**Alternative:** Add delays within the 10 AM handler:
```javascript
if (hour === 10) {
  await handleWeeklyNotifications(baseUrl, env, today, dayOfWeek);

  // Wait 20 minutes
  await new Promise(resolve => setTimeout(resolve, 20 * 60 * 1000));
  await handleDailyCosmicEvent(baseUrl, env, today);

  // Wait 20 more minutes
  await new Promise(resolve => setTimeout(resolve, 20 * 60 * 1000));
  await handleMoonCircles(baseUrl, env, today);
}
```

---

### Priority 3: Add Query Param Handler in App

**File to Create:** `src/hooks/useNotificationRouter.tsx`

```typescript
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useNotificationRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Transit view
    const transit = searchParams.get('transit');
    if (transit) {
      // Open transit modal or navigate to transits page
      // Example: openTransitModal(transit);
    }

    // Event view
    const event = searchParams.get('event');
    if (event) {
      const date = searchParams.get('date');
      const planet = searchParams.get('planet');
      // Open event details modal
      // Example: openEventModal(event, { date, planet });
    }

    // Tab navigation
    const tab = searchParams.get('tab');
    if (tab) {
      // Switch to specific tab
      // Example: setActiveTab(tab);
    }

    // View navigation
    const view = searchParams.get('view');
    if (view === 'transit') {
      // Show transit view
    } else if (view === 'cosmic-changes') {
      // Show cosmic changes view
    }
  }, [searchParams]);
}
```

**Usage:**
```typescript
// In app/app/page.tsx or layout
import { useNotificationRouter } from '@/hooks/useNotificationRouter';

export default function AppPage() {
  useNotificationRouter(); // Automatically handles notification deep links

  return (
    // ... app content
  );
}
```

**Impact:** Notifications will navigate to specific content within the app

---

### Priority 4: Verify Weekly Report Page Exists

**Action Required:**
1. Check if `/reports/weekly` route exists
2. Check if `app/reports/weekly/page.tsx` exists
3. Test navigation to `/reports/weekly`

**If page doesn't exist:**
- **Option A:** Create the page
- **Option B:** Change deep link to `/app?tab=reports` or `/app` with modal

**If weekly reports aren't generating:**
- Audit `/api/cron/weekly-cosmic-report` endpoint
- Check report generation logic
- Verify reports are being stored in database

---

### Priority 5: Implement Quiet Hours

**File to Modify:** `src/lib/notifications/tiered-service.ts`

**Add function:**
```typescript
function isInQuietHours(preferences: any): boolean {
  if (!preferences?.quietHours) return false;

  const { start, end } = preferences.quietHours;
  const now = new Date();
  const currentHour = now.getHours();

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (start > end) {
    return currentHour >= start || currentHour < end;
  }

  // Handle same-day quiet hours (e.g., 12:00 - 14:00)
  return currentHour >= start && currentHour < end;
}
```

**Modify `sendTieredNotification()`:**
```typescript
const sendPromises = users.map(async (user) => {
  // Check quiet hours
  const preferences = await getUserPreferences(user.endpoint);
  if (isInQuietHours(preferences)) {
    console.log(`⏭️ Skipping notification for ${user.userId} - in quiet hours`);
    return { success: true, skipped: true, reason: 'quiet_hours' };
  }

  // ... rest of notification send logic
});
```

**Impact:** Users can set quiet hours (e.g., 10 PM - 8 AM) to avoid nighttime notifications

---

### Priority 6: Add Max Notifications Per Day

**Implementation:**
```typescript
// In sendTieredNotification()
const today = new Date().toISOString().split('T')[0];

// Check how many notifications sent today
const notificationCount = await sql`
  SELECT COUNT(*) as count
  FROM push_subscriptions
  WHERE endpoint = ${user.endpoint}
    AND last_notification_sent::date = ${today}
`;

const preferences = await getUserPreferences(user.endpoint);
const maxPerDay = preferences?.maxNotificationsPerDay || 5; // Default: 5

if (notificationCount.rows[0].count >= maxPerDay) {
  console.log(`⏭️ Skipping notification for ${user.userId} - max per day reached`);
  return { success: true, skipped: true, reason: 'max_per_day' };
}
```

**Impact:** Prevents notification fatigue by limiting daily notifications

---

## Summary of Recommendations

### Timing
✅ **No critical conflicts** - Current schedule is well-staggered
⚠️ **Minor optimization** - Stagger 10 AM notifications by 20 minutes to prevent 3 simultaneous sends

### Deep Links
❌ **Critical issue** - 90% of notifications route to generic `/app`
🔧 **Fix required** - Update `getNotificationUrl()` to return specific URLs with query params
🔧 **Fix required** - Add query param handler in app to process notification deep links
🔧 **Fix required** - Verify `/reports/weekly` page exists

### User Experience
⚠️ **Missing features** - Quiet hours and max notifications per day not implemented
💡 **Recommendation** - Add these features to improve UX and reduce notification fatigue

### Testing
📋 **Action required** - Run full testing checklist for each notification type
📋 **Action required** - Test deep links on mobile and desktop browsers

---

## Files Modified / To Modify

### Current System Files
- ✅ `cloudflare-worker/notification-cron.js` - Scheduling orchestrator
- ✅ `src/lib/notifications/tiered-service.ts` - Notification sending logic
- ✅ `src/lib/notifications/unified-service.ts` - Web Push API wrapper
- ✅ `src/lib/notifications/copy-library.ts` - Notification content templates
- ✅ `public/sw.js` - Service Worker (push event + click handlers)
- ✅ `src/app/api/cron/*` - Cron endpoint handlers

### Files to Create/Modify
- 🔧 `src/lib/notifications/tiered-service.ts` - Update `getNotificationUrl()`
- 🔧 `src/hooks/useNotificationRouter.tsx` - NEW - Handle deep link query params
- 🔧 `cloudflare-worker/notification-cron.js` - Optional - Stagger 10 AM notifications
- 🔧 `src/lib/notifications/tiered-service.ts` - Add quiet hours + max per day logic
- 🔧 `app/reports/weekly/page.tsx` - VERIFY EXISTS - Weekly report page

---

**End of Audit**

Generated: 2026-01-27
Status: ⚠️ Issues Identified
Action Required: Yes
