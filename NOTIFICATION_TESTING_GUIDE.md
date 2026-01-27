# Push Notification Testing Guide

**Date:** 2026-01-27
**Admin Dashboard:** `/admin/notifications`

---

## Quick Start

1. Navigate to `/admin/notifications` in your browser
2. Click the **"Manual Test"** tab
3. Click **"Test Send"** on any notification type
4. Check your device for the notification
5. Click the notification to test the deep link
6. Verify it navigates to the correct page and scrolls to the right section

---

## Available Test Categories

### 📅 Daily Notifications (4 types)

| Notification | Type | Deep Link | What to Test |
|--------------|------|-----------|--------------|
| Daily Tarot | `daily_tarot` | `/app` | Dashboard shows tarot card |
| Daily Energy Theme | `energy_theme` | `/app` | Dashboard shows energy theme |
| Daily Insight | `daily_insight` | `/app` | Dashboard shows insight |
| Sky Shift Alert | `sky_shift` | `/horoscope#transit-wisdom` | Horoscope page, scrolls to Transit Wisdom section |

### 📆 Weekly Notifications (4 types)

| Notification | Type | Deep Link | What to Test |
|--------------|------|-----------|--------------|
| Monday Week Ahead | `monday_week_ahead` | `/blog` | Blog page loads |
| Friday Tarot | `friday_tarot` | `/app` | Dashboard shows tarot |
| Sunday Cosmic Reset | `sunday_reset` | `/guide` | Guide/chat page loads |
| Weekly Report | `weekly_report` | `/app` | Dashboard (fallback, email-only) |

### 💎 Personal Features - Paid Users (3 types)

| Notification | Type | Deep Link | What to Test |
|--------------|------|-----------|--------------|
| Personal Transit | `personal_transit` | `/horoscope#personal-transits` | Horoscope page, scrolls to Personal Transit Impact section |
| Transit Change | `transit_change` | `/horoscope#transit-wisdom` | Horoscope page, scrolls to Transit Wisdom section |
| Rising Activation | `rising_activation` | `/birth-chart` | Birth chart page loads |

### ⭐ Cosmic Events (7 types)

| Notification | Type | Deep Link | What to Test |
|--------------|------|-----------|--------------|
| Moon Phase | `moon_phase` | `/app#moon-phase` | Dashboard, scrolls to Moon section |
| Retrograde | `retrograde` | `/app#retrograde-mercury` | Dashboard, scrolls to retrograde info |
| Planetary Ingress | `planetary_transit` | `/horoscope#transit-wisdom` | Horoscope, scrolls to Transit Wisdom |
| Major Aspect | `major_aspect` | `/horoscope#today-aspects` | Horoscope, scrolls to Today's Aspects |
| Sabbat/Seasonal | `sabbat` | `/cosmic-state#current-transits` | Cosmic State, scrolls to Current Transits |
| Eclipse | `eclipse` | `/cosmic-state#current-transits` | Cosmic State, scrolls to Current Transits |
| Cosmic Changes | `cosmic_changes` | `/cosmic-state#current-transits` | Cosmic State, scrolls to Current Transits |

### 🌙 Special (1 type)

| Notification | Type | Deep Link | What to Test |
|--------------|------|-----------|--------------|
| Moon Circle | `moon_circle` | `/moon-circles` | Moon circles page loads |

**Total:** 19 notification types available for testing

---

## Testing Checklist

### For Each Notification Type:

- [ ] **Click "Test Send"** - Notification sends successfully
- [ ] **Check Device** - Notification appears on device
- [ ] **Click Notification** - Opens browser/app
- [ ] **Correct Page** - Lands on expected page
- [ ] **Correct Scroll** - Scrolls to correct section (for anchor links)
- [ ] **Scroll Offset** - Content not hidden under header (check `scroll-mt-20`)
- [ ] **Console Logs** - Check for `[NotificationDeepLink]` logs
- [ ] **Works on Mobile** - Test on Chrome/Safari mobile
- [ ] **Works on Desktop** - Test on Chrome/Firefox/Edge

### Expected Console Logs:

```javascript
[NotificationDeepLink] Anchor link detected: #transit-wisdom
[NotificationDeepLink] Scrolled to #transit-wisdom
```

Or:

```javascript
[NotificationDeepLink] Element not found: #some-section
```

---

## What to Look For

### ✅ Success Indicators

1. **Notification Appears** - Shows on device with correct title/body
2. **Page Loads** - Correct page loads when clicked
3. **Smooth Scroll** - Smoothly scrolls to target section
4. **Content Visible** - Target content is visible (not hidden)
5. **Console Logs** - Shows anchor detected and scrolled
6. **No Errors** - No JavaScript errors in console

### ❌ Failure Indicators

1. **Notification Not Received** - Check subscription status
2. **Wrong Page** - Deep link routing issue
3. **No Scroll** - Section ID missing or hook not integrated
4. **Hidden Content** - Scroll offset issue (needs `scroll-mt-20`)
5. **Console Errors** - Check for element not found warnings
6. **404 Error** - Page route doesn't exist

---

## Debugging Issues

### Issue: Notification Not Received

**Possible Causes:**
- Not subscribed to notifications
- Notifications blocked in browser
- Push subscription expired
- Server error

**How to Debug:**
1. Check browser notification permissions
2. Check Network tab for `/api/notifications/send` response
3. Check subscriber count in admin dashboard
4. Re-subscribe to notifications

---

### Issue: Wrong Page Loads

**Possible Causes:**
- Deep link URL incorrect in `tiered-service.ts`
- Service worker not reading `data.url` correctly
- Browser caching old service worker

**How to Debug:**
1. Check `tiered-service.ts` `getNotificationUrl()` function
2. Check `public/sw.js` notification click handler
3. Clear service worker cache and refresh
4. Check console for actual URL being navigated to

---

### Issue: Page Loads but Doesn't Scroll

**Possible Causes:**
- Section ID missing on target element
- Hook not integrated on page
- Hook running before element renders
- Typo in section ID

**How to Debug:**
1. Check if section ID exists: `document.getElementById('transit-wisdom')`
2. Check if hook is called on page (look for console logs)
3. Check for `[NotificationDeepLink] Element not found` warning
4. Verify ID in HTML matches URL hash

**Example Check:**
```javascript
// In browser console
document.getElementById('transit-wisdom'); // Should return element
// If null, ID is missing or incorrect
```

---

### Issue: Scrolls but Content Hidden Under Header

**Possible Causes:**
- Missing `scroll-mt-20` class on section
- Fixed header covering content
- Scroll offset calculation incorrect

**How to Debug:**
1. Check if element has `scroll-mt-20` class
2. Try adding `scroll-mt-32` for larger offset
3. Check computed styles for `scroll-margin-top`

**Fix:**
```tsx
// Add scroll-mt-20 class to section
<div id='transit-wisdom' className='... scroll-mt-20'>
```

---

### Issue: Hook Not Working on Page

**Possible Causes:**
- Hook not imported on page
- Hook not called in component
- Page is server-side rendered (needs 'use client')

**How to Debug:**
1. Check imports at top of page file
2. Check if `useNotificationDeepLink()` is called
3. Check if page has `'use client'` directive
4. Look for console logs - should see `[NotificationDeepLink]` messages

**Fix:**
```tsx
// Add to page component
'use client';

import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';

export default function MyPage() {
  useNotificationDeepLink(); // Add this line

  // ... rest of component
}
```

---

## Testing Workflow Example

### Example: Testing "Personal Transit" Notification

1. **Navigate to Admin Dashboard**
   - Go to `/admin/notifications`
   - Click "Manual Test" tab

2. **Find "Personal Transit" in "Personal Features" category**
   - Type: `personal_transit`
   - URL: `/horoscope#personal-transits`

3. **Click "Test Send"**
   - Alert shows: "✅ Notification sent! Recipients: 1, Successful: 1"

4. **Check Device**
   - Notification appears with title and body

5. **Click Notification**
   - Browser opens to `/horoscope#personal-transits`
   - Page loads
   - Console shows: `[NotificationDeepLink] Anchor link detected: #personal-transits`
   - Page scrolls to Personal Transit Impact section
   - Content is visible (not hidden)
   - Console shows: `[NotificationDeepLink] Scrolled to #personal-transits`

6. **Verify Section**
   - "Personal Transit Impact" heading is visible
   - Section shows upcoming transits
   - Scroll offset is correct

✅ **Test passes!**

---

## Common Test Scenarios

### Scenario 1: Testing Anchor Link Scrolling

**Steps:**
1. Test notification: Sky Shift Alert (`/horoscope#transit-wisdom`)
2. Click notification
3. Verify:
   - Opens `/horoscope` page
   - Scrolls to "Transit Wisdom" section
   - Section is in center of screen
   - Console logs show anchor detected + scrolled

---

### Scenario 2: Testing Page-Only Navigation

**Steps:**
1. Test notification: Moon Circles (`/moon-circles`)
2. Click notification
3. Verify:
   - Opens `/moon-circles` page
   - No scrolling (no hash in URL)
   - Page content loads correctly

---

### Scenario 3: Testing Dynamic Anchor (Retrograde)

**Steps:**
1. Test notification: Retrograde (`/app#retrograde-mercury`)
2. Click notification
3. Verify:
   - Opens `/app` dashboard
   - Attempts to scroll to `#retrograde-mercury`
   - **Note:** This ID may not exist yet (dynamic ID needs implementation)
   - Falls back to top of page if ID not found

---

## Browser Console Commands

### Check if Section ID Exists
```javascript
document.getElementById('transit-wisdom'); // Should return element, not null
```

### Check All IDs on Page
```javascript
document.querySelectorAll('[id]').forEach(el => console.log(el.id));
```

### Manually Trigger Scroll
```javascript
document.getElementById('transit-wisdom')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
```

### Check Scroll Offset
```javascript
const el = document.getElementById('transit-wisdom');
console.log(window.getComputedStyle(el)['scroll-margin-top']); // Should show "5rem" or "80px"
```

---

## Integration Status

### Pages with Hook Integrated (✅)

- ✅ `/app` (AppDashboardClient.tsx)
- ✅ `/horoscope` (page.tsx)
- ✅ `/cosmic-state` (page.tsx)

### Pages Without Hook (Need to Add if Testing)

- ❌ `/birth-chart` (no anchor links needed currently)
- ❌ `/blog` (no anchor links needed currently)
- ❌ `/guide` (no anchor links needed currently)
- ❌ `/moon-circles` (no anchor links needed currently)

---

## Section IDs Reference

### Dashboard (`/app`)

| ID | Section | Component |
|----|---------|-----------|
| `moon-phase` | Moon Preview | MoonPreview wrapper div |
| `transit-of-day` | Transit of the Day | TransitOfTheDay wrapper div |

### Horoscope (`/horoscope`)

| ID | Section | Component |
|----|---------|-----------|
| `transit-wisdom` | Transit Wisdom | HoroscopeSection |
| `today-aspects` | Today's Aspects to Your Chart | HoroscopeSection |
| `personal-transits` | Personal Transit Impact | HoroscopeSection |

### Cosmic State (`/cosmic-state`)

| ID | Section | Component |
|----|---------|-----------|
| `current-transits` | Current Transits | div wrapper |

---

## Performance Considerations

### Scroll Delay

The hook uses a 300ms delay before scrolling to allow page content to render:

```typescript
setTimeout(() => {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, 300);
```

If sections load slowly (e.g., fetching data), increase the delay:

```typescript
setTimeout(() => {
  // ... scroll code
}, 600); // Increase to 600ms for slower loads
```

---

## Known Limitations

### 1. Dynamic Retrograde IDs Not Implemented

**Issue:** Route uses `/app#retrograde-mercury` but TransitOfTheDay component doesn't add these IDs

**Current Behavior:** Opens dashboard but doesn't scroll to specific retrograde

**Workaround:** Falls back to `#transit-of-day` section

**Fix Needed:** Update TransitOfTheDay component to add dynamic IDs

---

### 2. Sabbat Section ID Doesn't Exist Yet

**Issue:** Originally used `/cosmic-state#seasonal-events` but that ID doesn't exist

**Current Behavior:** Routes to `/cosmic-state#current-transits` instead (sabbats mixed in)

**Status:** ✅ Fixed - now uses `#current-transits`

---

### 3. Weekly Reports Have No Web UI

**Issue:** Weekly reports are email-only

**Current Behavior:** Falls back to `/app` dashboard

**Workaround:** This is expected behavior

**Future:** Consider creating `/reports/weekly` page

---

## Tips for Effective Testing

### 1. Test on Real Devices
- Mobile behavior differs from desktop
- Test both Chrome and Safari on iOS
- Test Chrome on Android

### 2. Clear Cache Between Tests
- Service worker caching can cause issues
- Clear application cache in DevTools
- Unregister and re-register service worker if needed

### 3. Check Network Tab
- Verify `/api/notifications/send` returns 200 status
- Check response for success/failure details
- Look for subscription endpoints being called

### 4. Use Console Logs
- Every anchor link logs to console
- Look for `[NotificationDeepLink]` prefix
- Warnings indicate missing IDs

### 5. Test Edge Cases
- What happens with no internet?
- What if section hasn't loaded yet?
- What if user clicks notification twice?

---

## Reporting Issues

When reporting a notification issue, include:

1. **Notification Type** - Which notification was tested
2. **Expected URL** - What URL should open
3. **Actual URL** - What URL actually opened
4. **Expected Scroll** - What section should scroll to
5. **Actual Behavior** - What actually happened
6. **Console Logs** - Copy [NotificationDeepLink] logs
7. **Browser/Device** - Chrome/Safari, iOS/Android, Desktop/Mobile
8. **Screenshot** - If possible

**Example:**
```
Notification Type: Personal Transit
Expected URL: /horoscope#personal-transits
Actual URL: /horoscope (no hash)
Expected Scroll: To "Personal Transit Impact" section
Actual Behavior: Page loads but doesn't scroll
Console Logs: [NotificationDeepLink] Element not found: #personal-transits
Browser: Chrome Desktop
```

---

## Success Metrics

### What "Working" Looks Like

- ✅ All 19 notification types send successfully
- ✅ Click-through rate improves (users click notifications)
- ✅ Users land on correct page every time
- ✅ Anchor links scroll smoothly to target sections
- ✅ No 404 errors or broken routes
- ✅ Console shows successful anchor detection
- ✅ Mobile and desktop work identically

---

**End of Testing Guide**

Generated: 2026-01-27
Admin Dashboard: /admin/notifications
Total Notification Types: 19
