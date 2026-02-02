# Weekly Subscription Sync - Vercel Cron Setup

The weekly subscription sync is configured to run automatically on Vercel every Sunday at 2:00 AM UTC.

## What's Already Done

✅ Cron job configured in `vercel.json`
✅ API route created at `/api/cron/weekly-subscription-sync`
✅ Discord notifications integrated

## Setup Steps

### 1. Ensure Environment Variables are Set

The following must be in your Vercel project environment variables:

**Required:**

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `DATABASE_URL` - Your Postgres database connection string

**Optional (for Discord notifications):**

- `DISCORD_WEBHOOK_ANALYTICS` - Discord webhook for analytics notifications
- `DISCORD_WEBHOOK_URL` - Fallback Discord webhook

To set these in Vercel:

1. Go to your project settings in Vercel dashboard
2. Navigate to Environment Variables
3. Add the variables for Production, Preview, and Development environments

### 2. Deploy to Vercel

The cron job will automatically activate when deployed to production:

```bash
git add .
git commit -m "Add weekly subscription sync cron"
git push origin main
```

Vercel will deploy and activate the cron job.

### 3. Verify Cron Job is Active

1. Go to your Vercel project dashboard
2. Navigate to "Cron Jobs" tab
3. You should see: `weekly-subscription-sync` scheduled for `0 2 * * 0` (Sunday 2 AM UTC)

## Testing

### Test Locally

Run the sync script directly:

```bash
npx ts-node scripts/weekly-sync-cron.ts
```

### Test the API Endpoint

Test the cron endpoint with manual authentication:

```bash
# Set CRON_SECRET in your .env.local first
curl http://localhost:3000/api/cron/weekly-subscription-sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test in Production

Trigger the cron job manually from Vercel:

1. Go to Vercel dashboard → Cron Jobs
2. Find `weekly-subscription-sync`
3. Click "Run Now"

OR use the Vercel CLI:

```bash
vercel cron trigger weekly-subscription-sync
```

## What the Cron Does

Every Sunday at 2:00 AM UTC:

1. ✅ Fetches all users with Stripe customer IDs from database
2. ✅ Checks their current subscription status in Stripe
3. ✅ Updates database to match Stripe (source of truth)
4. ✅ Handles cancelled subscriptions
5. ✅ Clears invalid customer IDs
6. ✅ Sends Discord notification with summary:
   - Number of users updated
   - Number cancelled
   - Invalid customers cleaned
   - Any errors encountered

## Discord Notifications

You'll receive a Discord message every Sunday after the sync runs:

**Success notification (green):**

- Shows stats: updated, cancelled, errors, total processed
- Priority: normal (or high if errors > 0)
- Channel: Analytics webhook

**Failure notification (red):**

- Shows error message
- Priority: high
- Channel: Urgent webhook

## Monitoring

### View Cron Logs in Vercel

1. Go to Vercel dashboard → Deployments
2. Click on latest deployment
3. Go to "Functions" tab
4. Find `/api/cron/weekly-subscription-sync`
5. View logs

### Check Execution History

In Vercel dashboard → Cron Jobs:

- See when the job last ran
- View success/failure status
- See next scheduled run

## Manual Sync

If you need to run a sync outside the weekly schedule:

### Using Vercel Dashboard

1. Cron Jobs → weekly-subscription-sync → "Run Now"

### Using Vercel CLI

```bash
vercel cron trigger weekly-subscription-sync
```

### Using the Script Directly

```bash
npx ts-node scripts/weekly-sync-cron.ts
```

## Troubleshooting

### Cron not running

1. **Check Vercel dashboard** - Is the cron job listed?
2. **Check deployment** - Did the latest deploy succeed?
3. **Check environment variables** - Are they set in Vercel?

### No Discord notifications

1. **Check webhook URL** - Is `DISCORD_WEBHOOK_ANALYTICS` or `DISCORD_WEBHOOK_URL` set in Vercel?
2. **Test webhook manually**:
   ```bash
   npx ts-node scripts/test-discord-webhook.ts
   ```

### Sync errors

1. **View Vercel function logs** - Check what the error is
2. **Run locally** to debug:
   ```bash
   npx ts-node scripts/weekly-sync-cron.ts
   ```
3. **Check Discord** - Error notifications include the error message

### Authentication errors

The cron endpoint checks for:

- `x-vercel-cron: 1` header (automatically added by Vercel)
- OR `Authorization: Bearer <CRON_SECRET>` for manual testing

If testing locally, make sure `CRON_SECRET` is set in `.env.local`.

## Modifying the Schedule

To change when the cron runs, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-subscription-sync",
      "schedule": "0 2 * * 0" // Cron expression
    }
  ]
}
```

**Common schedules:**

```cron
# Every Sunday at 2 AM UTC
0 2 * * 0

# Every Monday at 9 AM UTC
0 9 * * 1

# First day of every month at 3 AM UTC
0 3 1 * *

# Every day at midnight UTC
0 0 * * *
```

After editing, commit and push to deploy the change.

## Security

- ✅ Endpoint is protected by Vercel cron headers
- ✅ Optional `CRON_SECRET` for manual testing
- ✅ Only accessible via authorized requests
- ✅ No sensitive data exposed in responses

## Cost

Vercel cron jobs are included in all plans:

- Hobby: 1 cron job (you're using 1)
- Pro: Unlimited cron jobs

Function execution time counts toward your serverless function execution quota.
