# A/B Test Data Backfill Guide

## Can We Backfill from PostHog?

**YES!** PostHog stores A/B test data with each event, including:

- `$feature_flag` - The test name
- `$feature_flag_response` - The variant the user saw

Even though our database doesn't have this data, PostHog does. We can backfill it!

## Prerequisites

### 1. Get a PostHog Personal API Key

1. Go to [PostHog Settings → Personal API Keys](https://posthog.com/settings/user-api-keys)
2. Click "Create new key"
3. Give it a name like "A/B Test Backfill"
4. Copy the key

### 2. Add to .env.local

```bash
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxx
```

Make sure you also have:

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_ID=your_project_id
POSTGRES_URL=your_postgres_url
```

## Running the Backfill

### Step 1: Dry Run (Preview)

See what data would be backfilled without actually inserting it:

```bash
pnpm tsx scripts/backfill-ab-test-data.ts --days=30 --dry-run
```

This will show:

- How many PostHog events have A/B test data
- Which tests are found
- Sample events that would be inserted

### Step 2: Run the Backfill

If the dry run looks good, run it for real:

```bash
pnpm tsx scripts/backfill-ab-test-data.ts --days=30
```

Options:

- `--days=N` - Number of days to backfill (default: 30)
- `--dry-run` - Preview mode, doesn't insert data

### Step 3: Verify the Data

Check that data was inserted:

```bash
pnpm tsx scripts/check-ab-test-data.ts
```

You should now see:

```
🧪 A/B test data:
   Events with 'abTest' key: 1,234

📋 Sample events:
   page_viewed | Test: cta_copy | Variant: A
   app_opened | Test: cta_copy | Variant: B
```

## What the Backfill Does

1. **Fetches events from PostHog** with A/B test feature flags
2. **Transforms the data** to match your conversion_events schema
3. **Maps test names** from PostHog to your admin dashboard names
4. **Normalizes variants** (control → A, test → B, true → B, false → A)
5. **Inserts into conversion_events** with proper `abTest` and `abVariant` metadata

## Current A/B Tests

The script is configured for these tests (from `src/lib/ab-test-tracking.ts`):

| PostHog Name               | Dashboard Name      | Description             |
| -------------------------- | ------------------- | ----------------------- |
| `cta-copy-test`            | `cta_copy`          | CTA copy variations     |
| `paywall_preview_style_v1` | `paywall_preview`   | Paywall preview style   |
| `homepage-features-test`   | `homepage_features` | Homepage card sections  |
| `feature_preview_blur_v1`  | `feature_preview`   | Feature preview blur    |
| `transit-overflow-style`   | `transit_overflow`  | Transit display style   |
| `weekly-lock-style`        | `weekly_lock`       | Weekly tarot lock style |
| `tarot-truncation-length`  | `tarot_truncation`  | Tarot text truncation   |
| `transit-limit-test`       | `transit_limit`     | Free user transit limit |

## Limitations

### What CAN Be Backfilled

✅ Events that were sent to PostHog with feature flag data
✅ Conversion events: `trial_started`, `subscription_started`, etc.
✅ Page views: `page_viewed`, `app_opened`
✅ Feature usage: `tarot_viewed`, `horoscope_viewed`, etc.

### What CANNOT Be Backfilled

❌ Events that were never sent to PostHog
❌ Events from before you started using PostHog
❌ Events from users who were never in any A/B test
❌ Events where PostHog didn't record feature flag data

## Expected Results

Based on your current data (181,131 events in 30 days), you should expect:

- **Best case**: 10-30% of events have A/B test data (if 10-30% of users were in tests)
- **Realistic case**: 5-15% of events have A/B test data
- **Minimum for analysis**: 100+ impressions per variant (should be achievable)

Even if you only recover a fraction of the data, it should be enough to see trends and make decisions.

## After Backfill

1. **Check the admin dashboard**: Visit `/admin/ab-testing`
2. **Verify test results**: You should see impressions and conversions for each variant
3. **Deploy the fix**: So new data continues to flow correctly
4. **Monitor going forward**: Use the diagnostic script regularly

## Troubleshooting

### "POSTHOG_PERSONAL_API_KEY environment variable not set"

Add it to `.env.local`:

```bash
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxx
```

### "No events to backfill"

Possible reasons:

1. No users were in A/B tests during this period
2. PostHog wasn't tracking feature flag data
3. The test names don't match (check `POSTHOG_TEST_MAPPING` in the script)

### "PostHog API error: 401"

Your API key is invalid or expired. Generate a new one.

### "PostHog API error: 429"

Rate limit hit. Wait a few minutes and try again with fewer days:

```bash
pnpm tsx scripts/backfill-ab-test-data.ts --days=7
```

## Combining Old and New Data

After backfilling:

- **Historical data** (backfilled): Shows past performance
- **New data** (after fix): Shows current performance

Keep in mind:

- Historical data may be incomplete (only users who were in tests)
- New data will be complete (all users tracked)
- Compare trends, not absolute numbers

## Need More Help?

Check the script source: `scripts/backfill-ab-test-data.ts`

The script has detailed comments explaining each step.
