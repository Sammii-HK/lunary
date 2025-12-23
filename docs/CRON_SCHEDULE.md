# Cron Schedule & Notification Guide

## Weekly Content Generation

**When:** Every **Sunday at 8:00 AM UTC** (morning)

**What happens:**

1. Weekly blog content is generated
2. Weekly newsletter is sent
3. Substack posts are published (free and paid)
4. **Social media posts for the week ahead are generated** (7 days in advance)
   - Posts are created for the week starting exactly 7 days from today
   - Example: If it's Sunday Jan 5, posts are generated for the week starting Sunday Jan 12

**Location:** `src/app/api/cron/weekly-content/route.ts`

**Schedule:** Defined in `vercel.json`:

```json
{
  "path": "/api/cron/weekly-content",
  "schedule": "0 8 * * 0" // 8 AM UTC on Sundays
}
```

## Weekly Videos

**When:** Every **Sunday at 10:00 AM UTC**

**What happens:**

- Short-form videos (TikTok/YouTube Shorts) are generated
- Long-form videos (YouTube) are generated
- Videos are uploaded to YouTube automatically

**Location:** `cloudflare-worker/notification-cron.js` → `handleWeeklySubstackSocial()` function

**Note:** Videos are generated after Substack publishing succeeds

## Daily Notifications

**Daily Insight Notification Schedule:** Daily at **8:00 AM UTC** (morning)

**What runs:**

1. **Daily Insight Notification** (8 AM UTC) - Rotates between tarot, energy theme, and insight
   - Location: `src/app/api/cron/daily-morning-notification/route.ts`
2. **Daily Cosmic Pulse** (10 AM UTC) - Sends the personalized cosmic pulse email/push for users who have birthdays on file
   - Location: `src/app/api/cron/daily-cosmic-pulse/route.ts`
3. **Daily Cosmic Event Notification** (2 PM UTC) - Sends if there's a significant cosmic event
4. **Moon Circle Creation** (2 PM UTC) - Creates moon circles on new/full moon days

**Location:**

- Morning: `src/app/api/cron/daily-morning-notification/route.ts`
- Afternoon: `src/app/api/cron/daily-posts/route.ts` → `runConsolidatedNotifications()` function

### Troubleshooting Daily Notifications

If daily notifications aren't working, check:

1. **VAPID Keys** - Required for push notifications

   ```bash
   # Check if set in environment
   echo $VAPID_PUBLIC_KEY
   echo $VAPID_PRIVATE_KEY
   ```

2. **Check logs** - Look for errors in:
   - Vercel function logs
   - Discord notifications (if configured)
   - Admin activity logs

3. **Common issues:**
   - Missing VAPID keys → Notifications won't send
   - Expired push subscriptions → Automatically marked inactive
   - No active subscriptions → No notifications sent
   - Cosmic data fetch failure → Falls back to default notification

4. **Test manually:**
   ```bash
   # Test daily insight notification
   curl -X GET "http://localhost:3000/api/cron/daily-insight-notification" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

## Yearly Tarot Analysis

**When:** Every **Jan 1 at 12:15 AM UTC**

**What happens:**

- Computes year-over-year tarot analysis for the previous year and the new year
- Stores results in `year_analysis` for reuse

**Location:** `src/app/api/cron/yearly-tarot-analysis/route.ts`

## All Cron Jobs Schedule

| Job                        | Schedule     | Time (UTC)         | Description                                           |
| -------------------------- | ------------ | ------------------ | ----------------------------------------------------- |
| Process Deletions          | `0 2 * * *`  | 2:00 AM            | Cleanup tasks                                         |
| Update Cosmic Data         | `0 6 * * *`  | 6:00 AM            | Update global cosmic snapshot                         |
| Daily Morning Notification | `0 8 * * *`  | 8:00 AM            | **Daily insight notification** (tarot/energy/insight) |
| Daily Cosmic Pulse         | `0 10 * * *` | 10:00 AM           | Daily cosmic pulse                                    |
| **Daily Posts**            | `0 8 * * *`  | **8:00 AM**        | **Daily posts generated (ready for review)**          |
| **Weekly Content**         | `0 8 * * 0`  | **8:00 AM Sunday** | **Weekly blog, newsletter, Substack, social posts**   |
| Moon Circles               | `0 10 * * *` | 10:00 AM           | Create moon circles (new/full moons)                  |
| Weekly Cosmic Report       | `0 10 * * 0` | 10:00 AM Sunday    | Weekly report generation                              |
| Weekly Metrics             | `0 2 * * 1`  | 2:00 AM Monday     | Weekly analytics                                      |
| Yearly Tarot Analysis      | `15 0 1 1 *` | 12:15 AM Jan 1     | Cache year-over-year tarot analysis                   |

## Cloudflare Worker Schedule

The Cloudflare worker also handles some notifications:

- **8:00 AM UTC**: Daily Insight + Tarot notification
- **2:00 PM UTC**: Personal transit, daily posts, cosmic changes
- **10:00 AM UTC**: Weekly notifications (Mon/Fri/Sun), cosmic events, moon circles

## Debugging Tips

1. **Check cron execution:**
   - Vercel dashboard → Functions → Cron Jobs
   - Look for execution logs and errors

2. **Check notification status:**

   ```sql
   -- Check recent notification events
   SELECT * FROM notification_sent_events
   ORDER BY date DESC
   LIMIT 10;

   -- Check active subscriptions
   SELECT COUNT(*) FROM push_subscriptions
   WHERE is_active = true;
   ```

3. **Manual trigger (for testing):**
   ```bash
   # Trigger daily posts cron (includes notifications)
   curl -X GET "http://localhost:3000/api/cron/daily-posts" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
