# Lunary Cloudflare Worker - Notification Cron

This Cloudflare Worker handles push notifications for astronomical events every 4 hours.

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
# Enter: eKwpmqza0ldtCaHUSZnsIEzY0w3rV663gPs+rxeDlBw=
```

### 4. Deploy Worker

```bash
wrangler deploy
```

## ⏰ Schedule

- **Runs**: Every 4 hours (0 _/4 _ \* \*)
- **Checks**: Astronomical events via lunary.app API
- **Sends**: Push notifications for significant events

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
- **Your usage**: ~6 requests/day (every 4 hours)
- **Well within limits**: 99.994% under the free tier

## 🔧 Benefits Over Vercel Cron

- ✅ **Multiple crons** without paid plan
- ✅ **Global edge network** for reliability
- ✅ **Better timing** precision
- ✅ **Separate concerns** (posts vs notifications)
- ✅ **Free tier** generous limits
