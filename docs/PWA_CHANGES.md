# PWA Notification Changes - Quiet Hours Implementation

## Summary

We've implemented **quiet hours** for PWA (Progressive Web App) push notifications to reduce notification spam and respect user sleep schedules.

## Changes Made

### 1. **Quiet Hours Logic** (10 PM - 8 AM UTC)

**File**: `src/app/api/notifications/send/route.ts`

- Added quiet hours check: **10 PM - 8 AM UTC**
- Notifications are skipped during quiet hours **unless** they're time-specific astronomical events

### 2. **Time-Specific vs Scheduled Notifications**

**Time-Specific Events** (bypass quiet hours):

- Retrograde start/end
- Planetary transit notifications
- Major aspect notifications
- Eclipse notifications
- Sabbat notifications
- Moon phase events (when they actually occur)

**Scheduled Notifications** (respect quiet hours):

- Daily cosmic pulse (scheduled at 8 AM)
- Cosmic changes (scheduled at 2 PM)
- Moon circles (scheduled at 8 PM)
- Personalized tarot (scheduled times)
- Weekly reports

### 3. **Updated Cron Jobs**

All scheduled notification cron jobs now check for quiet hours:

- `src/app/api/cron/daily-cosmic-pulse/route.ts`
  - Checks quiet hours before sending
  - Skips if between 10 PM - 8 AM UTC
  - Marks as `isScheduled: true` in notification data

- `src/app/api/cron/cosmic-changes-notification/route.ts`
  - Checks quiet hours before sending
  - Skips if between 10 PM - 8 AM UTC
  - Marks as `isScheduled: true` in notification data

- `src/app/api/cron/moon-circles/route.ts`
  - Checks quiet hours before sending
  - Skips if between 10 PM - 8 AM UTC
  - Marks as `isScheduled: true` in notification data

- `src/app/api/cron/personalized-tarot/route.ts`
  - Checks quiet hours per user before sending
  - Skips if between 10 PM - 8 AM UTC
  - Marks as `isScheduled: true` in notification data

- `src/app/api/cron/check-notifications/route.ts`
  - Marks cosmic events as `isTimeSpecific: true`
  - These bypass quiet hours automatically

## Implementation Details

### Quiet Hours Check Function

```typescript
function shouldSendPwaNotification(): boolean {
  // Time-specific = astronomical events happening at specific times
  const timeSpecificTypes = [
    'retrograde',
    'planetary_transit',
    'major_aspect',
    'eclipse',
    'sabbat',
    'moon_phase',
  ];
  const isTimeSpecific =
    timeSpecificTypes.includes(payload.type) ||
    timeSpecificTypes.includes(payload.data?.eventType || '');

  if (isTimeSpecific) return true; // Always send time-specific events

  // Non-time-specific = scheduled notifications
  const nonTimeSpecificTypes = [
    'cosmic_pulse',
    'cosmic_changes',
    'moon_circle',
    'weekly_report',
    'personalized_tarot',
  ];
  const isScheduledNotification =
    nonTimeSpecificTypes.includes(payload.type) ||
    nonTimeSpecificTypes.includes(payload.data?.eventType || '') ||
    payload.data?.isScheduled === true;

  if (isScheduledNotification) {
    const now = new Date();
    const hour = now.getUTCHours();
    const isQuietHours = hour >= 22 || hour < 8; // 10 PM - 8 AM UTC
    return !isQuietHours; // Skip scheduled notifications during quiet hours
  }

  // Default: respect quiet hours
  const now = new Date();
  const hour = now.getUTCHours();
  const isQuietHours = hour >= 22 || hour < 8;
  return !isQuietHours;
}
```

### Notification Data Structure

Notifications now include flags to indicate their type:

```typescript
{
  data: {
    type: 'cosmic_pulse',
    isScheduled: true,  // Indicates scheduled notification (respects quiet hours)
    // OR
    isTimeSpecific: true,  // Indicates astronomical event (bypasses quiet hours)
  }
}
```

## Benefits

1. **Reduced Spam**: Users won't receive scheduled notifications during sleep hours
2. **Important Events Still Delivered**: Astronomical events (retrogrades, eclipses) are always sent
3. **Better User Experience**: Respects user sleep schedules while keeping critical alerts
4. **Configurable**: Quiet hours can be adjusted via environment variables (future enhancement)

## Future Enhancements

- User timezone support (currently uses UTC)
- Per-user quiet hours preferences
- Configurable quiet hours start/end times
- Quiet hours override for urgent notifications

## Testing

To test quiet hours:

1. Set system time to between 10 PM - 8 AM UTC
2. Trigger a scheduled notification (cosmic pulse, tarot, etc.)
3. Verify notification is skipped
4. Trigger a time-specific event (retrograde start)
5. Verify notification is sent (bypasses quiet hours)
