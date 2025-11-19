# Deploying Lunary Cron Jobs to Cloudflare Workers

## Quick Deploy

```bash
cd cloudflare-worker
wrangler deploy
```

## First Time Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

### 3. Set Secrets

**Required Secrets:**

```bash
wrangler secret put CRON_SECRET
```

When prompted, enter your `CRON_SECRET` value (same one used in Vercel).

**Discord Webhook Secrets:**

You can set all Discord webhooks at once using the provided script:

```bash
# Make sure you have DISCORD_WEBHOOK_* variables in your environment
# Then run:
cd cloudflare-worker
./set-discord-webhooks.sh

# Or using Node.js:
node set-discord-webhooks.js
```

Or set them individually:

```bash
wrangler secret put DISCORD_WEBHOOK_URGENT
wrangler secret put DISCORD_WEBHOOK_ANALYTICS
wrangler secret put DISCORD_WEBHOOK_TODO
wrangler secret put DISCORD_WEBHOOK_GENERAL
wrangler secret put DISCORD_WEBHOOK_URL  # Fallback (optional)
```

**Required Discord Webhooks:**

- `DISCORD_WEBHOOK_URGENT` - Critical alerts (health checks, failures, conversions)
- `DISCORD_WEBHOOK_ANALYTICS` - Daily analytics summaries

**Optional Discord Webhooks:**

- `DISCORD_WEBHOOK_TODO` - Tasks requiring action
- `DISCORD_WEBHOOK_GENERAL` - General notifications
- `DISCORD_WEBHOOK_URL` - Fallback (backward compatibility)

### 4. Deploy

```bash
wrangler deploy
```

## Verify Deployment

### Check Cron Triggers

```bash
wrangler cron list
```

You should see all 5 cron triggers:

- `0 */4 * * *` - Every 4 hours
- `0 8 * * *` - Daily at 8 AM
- `0 14 * * *` - Daily at 2 PM
- `0 20 * * *` - Daily at 8 PM
- `0 10 * * 0` - Sunday at 10 AM

### Test Manually

```bash
# Test cosmic pulse
curl -X POST https://lunary-notifications.YOUR_SUBDOMAIN.workers.dev/daily-cosmic-pulse

# Test moon circles
curl -X POST https://lunary-notifications.YOUR_SUBDOMAIN.workers.dev/moon-circles

# Test weekly report
curl -X POST https://lunary-notifications.YOUR_SUBDOMAIN.workers.dev/weekly-report
```

### View Logs

```bash
wrangler tail
```

This streams real-time logs from your worker.

## Update Secrets

If you need to update `CRON_SECRET`:

```bash
wrangler secret put CRON_SECRET
```

## Schedule Overview

| Time (UTC)   | Task                             | Frequency  |
| ------------ | -------------------------------- | ---------- |
| 8:00 AM      | Daily Cosmic Pulse + Daily Posts | Daily      |
| 2:00 PM      | Cosmic Changes Notification      | Daily      |
| 8:00 PM      | Moon Circles Check               | Daily      |
| Every 4h     | Cosmic Snapshot Updates          | Continuous |
| Sunday 10 AM | Weekly Cosmic Report             | Weekly     |

## Troubleshooting

### Worker not triggering?

1. Check cron triggers are registered:

   ```bash
   wrangler cron list
   ```

2. Check logs for errors:

   ```bash
   wrangler tail
   ```

3. Verify secret is set:
   ```bash
   wrangler secret list
   ```

### Testing locally

```bash
wrangler dev
```

This runs the worker locally and you can test endpoints.

## Migration from Vercel

All crons have been moved from Vercel to Cloudflare because:

- Vercel free plan only allows 1 cron
- Cloudflare free plan allows unlimited crons
- Better reliability and global edge network

Make sure to remove crons from `vercel.json` (already done).
