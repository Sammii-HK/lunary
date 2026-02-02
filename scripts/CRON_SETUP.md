# Weekly Sync Cron Job Setup

This guide will help you set up a weekly cron job that syncs your database with Stripe and sends Discord notifications.

## Prerequisites

1. **Discord Webhook URL** - Get one from Discord:
   - Open Discord Server Settings
   - Go to Integrations → Webhooks
   - Click "New Webhook"
   - Name it "Lunary Sync" (or whatever you want)
   - Copy the Webhook URL
   - Click "Save"

2. **Add to .env.local**:
   ```bash
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE
   ```

## Test the Script First

Before setting up the cron job, test the script manually:

```bash
npx ts-node scripts/weekly-sync-cron.ts
```

You should see:

- Console output showing the sync progress
- A Discord message in your channel with the results

## Setup Cron Job

### Option 1: Using crontab (Mac/Linux)

1. **Find the full path to your project**:

   ```bash
   pwd
   ```

   Example output: `/Users/sammii/development/lunary`

2. **Edit crontab**:

   ```bash
   crontab -e
   ```

3. **Add this line** (replace `/path/to/lunary` with your actual path):

   ```cron
   # Run every Sunday at 2 AM
   0 2 * * 0 /path/to/lunary/scripts/run-weekly-sync.sh
   ```

   **Other schedule options:**

   ```cron
   # Every Monday at 9 AM
   0 9 * * 1 /path/to/lunary/scripts/run-weekly-sync.sh

   # Every Saturday at midnight
   0 0 * * 6 /path/to/lunary/scripts/run-weekly-sync.sh

   # First day of every month at 3 AM
   0 3 1 * * /path/to/lunary/scripts/run-weekly-sync.sh
   ```

4. **Save and exit** (`:wq` in vim, or `Ctrl+X` then `Y` in nano)

5. **Verify cron job is set**:
   ```bash
   crontab -l
   ```

### Option 2: Using macOS launchd (Recommended for Mac)

Create a launch agent for better reliability on macOS:

1. **Create the plist file**:

   ```bash
   nano ~/Library/LaunchAgents/com.lunary.weekly-sync.plist
   ```

2. **Add this content** (replace paths with your actual paths):

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.lunary.weekly-sync</string>

       <key>ProgramArguments</key>
       <array>
           <string>/path/to/lunary/scripts/run-weekly-sync.sh</string>
       </array>

       <key>StartCalendarInterval</key>
       <dict>
           <key>Weekday</key>
           <integer>0</integer>
           <key>Hour</key>
           <integer>2</integer>
           <key>Minute</key>
           <integer>0</integer>
       </dict>

       <key>StandardOutPath</key>
       <string>/path/to/lunary/logs/weekly-sync.log</string>

       <key>StandardErrorPath</key>
       <string>/path/to/lunary/logs/weekly-sync-error.log</string>
   </dict>
   </plist>
   ```

3. **Load the launch agent**:

   ```bash
   launchctl load ~/Library/LaunchAgents/com.lunary.weekly-sync.plist
   ```

4. **Verify it's loaded**:

   ```bash
   launchctl list | grep lunary
   ```

5. **Test it manually** (don't wait for Sunday):

   ```bash
   launchctl start com.lunary.weekly-sync
   ```

6. **Check the logs**:
   ```bash
   tail -f logs/weekly-sync.log
   ```

### Option 3: Using Vercel Cron (if deployed on Vercel)

If your app is deployed on Vercel, you can use Vercel Cron:

1. Create `vercel.json` in project root:

   ```json
   {
     "crons": [
       {
         "path": "/api/cron/weekly-sync",
         "schedule": "0 2 * * 0"
       }
     ]
   }
   ```

2. Create the API route at `src/app/api/cron/weekly-sync/route.ts`:

   ```typescript
   import { NextResponse } from 'next/server';
   import { runWeeklySync } from '@/scripts/weekly-sync-cron';

   export async function GET() {
     try {
       await runWeeklySync();
       return NextResponse.json({ success: true });
     } catch (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }
   }
   ```

## Monitoring

### Check Logs

View recent sync logs:

```bash
tail -n 100 logs/weekly-sync.log
```

Watch logs in real-time:

```bash
tail -f logs/weekly-sync.log
```

### Discord Notifications

You'll receive Discord notifications with:

- ✅ Success: Number of updates, cancellations, errors
- ❌ Failure: Error message

### Manual Run

Run the sync manually anytime:

```bash
npx ts-node scripts/weekly-sync-cron.ts
```

## Troubleshooting

### Cron job not running

1. **Check cron is running**:

   ```bash
   # macOS
   sudo launchctl list | grep cron

   # Linux
   systemctl status cron
   ```

2. **Check the log file**:

   ```bash
   cat logs/weekly-sync.log
   ```

3. **Verify paths are absolute** in crontab (not relative)

4. **Check permissions**:
   ```bash
   ls -la scripts/run-weekly-sync.sh
   ```
   Should show `-rwxr-xr-x` (executable)

### Discord notifications not sending

1. **Verify webhook URL** in `.env.local`
2. **Test the webhook manually**:
   ```bash
   curl -H "Content-Type: application/json" \
        -d '{"content": "Test message"}' \
        YOUR_DISCORD_WEBHOOK_URL
   ```

### Script errors

Run manually to see full error output:

```bash
npx ts-node scripts/weekly-sync-cron.ts
```

## Uninstalling

### Remove crontab entry:

```bash
crontab -e
# Delete the line with weekly-sync.sh
```

### Remove launchd agent:

```bash
launchctl unload ~/Library/LaunchAgents/com.lunary.weekly-sync.plist
rm ~/Library/LaunchAgents/com.lunary.weekly-sync.plist
```

## What the Sync Does

Every week, the script:

1. ✅ Fetches all users with Stripe customer IDs from database
2. ✅ Checks their current subscription status in Stripe
3. ✅ Updates database to match Stripe (source of truth)
4. ✅ Handles cancelled subscriptions
5. ✅ Clears invalid customer IDs
6. ✅ Sends summary to Discord

This ensures your database stays in sync with Stripe automatically!
