# Lunary Cloudflare Worker - Notification Cron

This Cloudflare Worker handles all scheduled tasks for Lunary, spread throughout the day.

## 🚀 Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set Environment Variables

```bash
cd cloudflare-worker
wrangler secret put CRON_SECRET
# Enter your CRON_SECRET value (same as Vercel)
```

### 4. Deploy Worker

```bash
wrangler deploy
```

## ⏰ Schedule (Spread Throughout the Day)

- **8:00 AM** - Daily cosmic pulse
- **2:00 PM** - Daily posts (created the day before for next day) + Cosmic changes notification
- **8:00 PM** - Moon circles check
- **Every 4 hours** (0, 4, 8, 12, 16, 20) - Cosmic snapshot updates
- **Sunday 10:00 AM** - Weekly cosmic report

All times are UTC.

## 🧪 Testing

### Manual Trigger

```bash
# Test the worker manually
curl -X POST https://lunary-notifications.YOUR_SUBDOMAIN.workers.dev/trigger
```

### Check Logs

```bash
wrangler tail
```

## 🔄 How It Works

1. **Fetches** cosmic data from `https://www.lunary.app/api/og/cosmic-post/[date]`
2. **Filters** for notification-worthy events (moon phases, retrogrades, etc.)
3. **Sends** notifications via `https://www.lunary.app/api/notifications/send`
4. **Logs** results and errors

## 💰 Cost

- **Free**: Up to 100,000 requests/day
- **Your usage**: ~10 requests/day (spread across different times)
- **Well within limits**: 99.99% under the free tier

## 🔧 Benefits Over Vercel Cron

- ✅ **Multiple crons** without paid plan (Vercel free = 1 cron only)
- ✅ **Global edge network** for reliability
- ✅ **Better timing** precision
- ✅ **Spread throughout day** - notifications don't all arrive at once
- ✅ **Free tier** generous limits

## 📋 All Cron Jobs

1. **Daily Cosmic Pulse** (8 AM) - Personalized daily notifications
2. **Daily Posts** (2 PM) - Blog/Substack content generation (created the day before for next day)
3. **Cosmic Changes** (2 PM) - Afternoon notification about cosmic shifts
4. **Moon Circles** (8 PM) - Evening check for New/Full Moon events
5. **Cosmic Snapshots** (Every 4 hours) - Update cached cosmic data
6. **Weekly Report** (Sunday 10 AM) - Weekly email summary
