# Testing Analytics Filtering

This guide helps you verify that test users are being excluded from your analytics.

## Quick Test: Check API Endpoint

The easiest way to test is to call the analytics endpoint directly:

```bash
# Replace YOUR_SECRET with your ANALYTICS_API_SECRET from Vercel
curl -H "Authorization: Bearer YOUR_SECRET" \
  https://lunary.app/api/analytics/summary | jq '.dau, .mau, .activePayingUsers'
```

Compare the numbers before and after the filtering changes. If test users were being counted, you should see lower numbers now.

## Test Script (Requires Database Access)

If you have database access, run:

```bash
# Make sure POSTGRES_URL is in your .env.local
pnpm tsx scripts/test-analytics-filtering.ts
```

This will:

1. Check if test users exist in the database
2. Compare DAU with/without filtering
3. Compare subscriptions with/without filtering
4. Show you the difference

## Google Apps Script Update (Deprecated)

⚠️ **Note**: The Google Apps Script approach has been replaced by the server-side implementation. See [`docs/analytics-sheet.md`](./analytics-sheet.md) for the new approach.

**If you're still using the old Apps Script:**

Yes, running your Apps Script again WILL correct the numbers!

The Apps Script fetches fresh data from the API endpoint each time it runs. Since we've updated the endpoint to exclude test users, the next run will:

1. ✅ Fetch filtered data (no test users)
2. ✅ Append new row with corrected numbers
3. ✅ Show accurate metrics going forward

### How to Update Your Sheets

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Click **Run** on the `updateLunaryMetrics` function
4. Check the sheets - you should see:
   - Lower DAU/WAU/MAU (if test users were being counted)
   - Lower subscription counts (if test subscriptions existed)
   - More accurate conversion rates

### What Gets Updated

All sheets will get new rows with filtered data:

- **HighLevelKPIs** - DAU, WAU, MAU, MRR, etc.
- **Financial** - MRR breakdown
- **CohortRetention** - Retention metrics
- **AIEngagement** - AI usage stats
- **FunnelPerformance** - Conversion funnel
- **SEO** - SEO metrics
- **Notifications** - Notification stats
- **ProductUsage** - Feature usage
- **PricingTiers** - Subscription breakdown
- **APICosts** - Cost metrics

### Historical Data

⚠️ **Note**: The filtering only affects NEW data going forward. Historical rows in your sheets will still contain test users if they were counted before. You can:

1. Leave historical data as-is (shows growth over time)
2. Manually delete rows with test user data
3. Create a new sheet for "clean" data going forward

## Verification Checklist

- [ ] Run Apps Script and check new row appears (or use new server-side pipeline)
- [ ] Compare DAU before/after (should be lower if test users existed)
- [ ] Check subscription counts (should exclude test subscriptions)
- [ ] Verify conversion rates look more realistic
- [ ] Confirm no test emails (`@test.lunary.app`) in any metrics

## Test User Patterns Excluded

The following patterns are automatically excluded:

- `%@test.lunary.app` (any email ending with this)
- `test@test.lunary.app` (exact match)
- `kellow.sammii@gmail.com` (your email)

If you need to exclude additional test emails, add them to the constants in `src/app/api/analytics/summary/route.ts`.
