# Implementation Clarifications & Fixes

## 1. ✅ Crystal Index Integration

**Status**: Clarified  
**Note**: Crystal Index is a separate site - integration will focus on:

- CTAs from Lunary app → Crystal Index site
- CTAs from Crystal Index site → Lunary app
- Deep linking between platforms
- "Crystal of the day" already exists in `CrystalWidget.tsx` - will enhance with transit-based suggestions

## 2. ✅ Duplicate Notifications Fixed

**Issue**: Duplicate notifications being sent  
**Fix Applied**:

- Added deduplication check using `notification_sent_events` table
- Checks if cosmic pulse already sent today before sending
- Prevents duplicate push notifications and emails
- Uses event key: `cosmic-pulse-{date}`

**Files Updated**:

- `src/app/api/cron/daily-cosmic-pulse/route.ts` - Added duplicate check

## 3. ✅ Notification Timing Fixed

**Issue**: Should be local morning  
**Fix Applied**:

- Changed cron schedule from `0 9 * * *` (9 AM) to `0 8 * * *` (8 AM)
- Added user preference support for `cosmicPulseTime` (morning/evening)
- Defaults to morning if not specified

**Files Updated**:

- `vercel.json` - Updated schedule
- `src/lib/cosmic-pulse/generator.ts` - Added `preferredTime` parameter
- `src/app/api/cron/daily-cosmic-pulse/route.ts` - Reads user preference

## 4. ✅ Ritual Generation Clarified

**Current Implementation**:

- AI chat already interprets tarot ✅ (via `interpret_tarot` mode)
- Tarot spread pulls per subscription ✅ (already implemented with limits)
- Ritual/spell suggestions already exist ✅ (`getRecommendedSpells()` based on moon phase)

**Updated Implementation**:

- Ritual generation mode now uses existing `getRecommendedSpells()` function
- Leverages moon phase-based spell recommendations from `src/constants/spells.ts`
- No duplicate ritual generation - uses existing spell database

**Files Updated**:

- `src/lib/ai/assist.ts` - Updated `ritualGeneration()` to use existing spells

## 5. 📊 Highest Conversion - Analytics Query

To find which pricing tier converts best, you can query:

```sql
SELECT
  plan_type,
  COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials_started,
  COUNT(DISTINCT CASE WHEN event_type = 'trial_converted' THEN user_id END) as trials_converted,
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'trial_converted' THEN user_id END)::numeric /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END), 0) * 100,
    2
  ) as conversion_rate_percent
FROM conversion_events
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND plan_type IS NOT NULL
GROUP BY plan_type
ORDER BY conversion_rate_percent DESC;
```

**Current Pricing Tiers**:

- **Lunary+** (£4.99/month) - Most popular (marked in pricing)
- **Lunary+ Pro** (£8.99/month) - Higher value tier
- **Annual** (£79.99/year) - Best value (26% savings)

The analytics dashboard at `/admin/analytics` shows:

- Trial conversion rate
- Monthly vs yearly subscriptions
- MRR (Monthly Recurring Revenue)
- Conversion funnel metrics

---

## Summary of Fixes

✅ **Duplicate Notifications**: Fixed with deduplication check  
✅ **Notification Timing**: Changed to 8 AM (local morning)  
✅ **Ritual Generation**: Now uses existing spell recommendations  
✅ **Crystal Index**: Clarified as separate site integration  
✅ **Tarot Interpretation**: Already exists in AI chat

All fixes are implemented and ready for testing.
