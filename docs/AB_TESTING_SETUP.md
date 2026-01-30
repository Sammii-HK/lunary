# A/B Testing Setup Guide

This guide explains how to track A/B tests from PostHog in your local database and view results in the admin dashboard.

## Overview

The A/B testing system works by:

1. **PostHog** assigns users to test variants via feature flags
2. **Your app** includes the variant in event metadata when tracking
3. **Local database** stores events with A/B test metadata
4. **Admin dashboard** queries the local database for analysis

## Setup Instructions

### 1. Create A/B Tests in PostHog

1. Go to PostHog → Experiments
2. Create a new experiment (e.g., "pricing_cta_test")
3. Set up variants (control / test)
4. Launch the experiment

### 2. Map PostHog Test Names

Edit `src/lib/ab-test-tracking.ts` and add your PostHog experiment name to the mapping:

```typescript
const POSTHOG_TEST_MAPPING: Record<string, string> = {
  pricing_cta_test: 'pricing_cta', // Maps to admin dashboard
  pricing_display_test: 'pricing_price',
  onboarding_flow_test: 'onboarding_flow',
  upgrade_prompt_test: 'upgrade_prompt',
};
```

The **key** is your PostHog experiment name.
The **value** is the test name shown in the admin dashboard at `/admin/ab-testing`.

### 3. Track Events with A/B Test Metadata

There are two ways to track events:

#### Option A: Using the Helper (Recommended)

```typescript
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';
import { trackEvent } from '@/lib/analytics';

function YourComponent() {
  // Get variant from PostHog
  const variant = useFeatureFlagVariant('pricing_cta_test');

  useEffect(() => {
    // Get A/B test metadata
    const abMetadata = getABTestMetadataFromVariant('pricing_cta_test', variant);

    if (abMetadata) {
      // Track impression event
      trackEvent('pricing_page_viewed', {
        metadata: abMetadata
        // abMetadata = { abTest: 'pricing_cta', abVariant: 'A' or 'B' }
      });
    }
  }, [variant]);

  const handleClick = () => {
    const abMetadata = getABTestMetadataFromVariant('pricing_cta_test', variant);

    if (abMetadata) {
      // Track conversion event
      trackEvent('trial_started', {
        metadata: abMetadata
      });
    }
  };

  return <button onClick={handleClick}>Get Started</button>;
}
```

#### Option B: Manual Metadata

```typescript
trackEvent('pricing_page_viewed', {
  metadata: {
    abTest: 'pricing_cta', // Test name from mapping
    abVariant: 'A', // or 'B'    // Variant A or B
  },
});
```

### 4. Required Events for Each Test

For the admin dashboard to calculate conversion rates, you need to track:

**Impression Events:**

- `app_opened` - App impression
- `pricing_page_viewed` - Pricing page view

**Conversion Events:**

- `trial_started` - User started trial
- `subscription_started` - User subscribed
- `trial_converted` - Trial converted to paid

Both impression and conversion events must include the same `abTest` and `abVariant` metadata.

## Backfilling Historical Data

If you already have A/B test data in PostHog, you can backfill it:

### Prerequisites

1. Create a PostHog Personal API Key:
   - Go to PostHog → Settings → Personal API Keys
   - Create a new key with "Read" permissions

2. Add to `.env.local`:

```bash
POSTHOG_PERSONAL_API_KEY=phx_abc123...
NEXT_PUBLIC_POSTHOG_PROJECT_ID=12345
```

### Run the Backfill

```bash
# Dry run (preview what would be inserted)
tsx scripts/backfill-ab-test-data.ts --dry-run

# Backfill last 30 days
tsx scripts/backfill-ab-test-data.ts

# Backfill custom time period
tsx scripts/backfill-ab-test-data.ts --days=60
```

The script will:

1. Fetch events from PostHog with A/B test feature flags
2. Transform them to match your schema
3. Insert into `conversion_events` table
4. Skip duplicates automatically

## Current A/B Tests

The system tracks these tests (configured in `/admin/ab-testing/page.tsx`):

| Test Name         | PostHog Flag           | Description              |
| ----------------- | ---------------------- | ------------------------ |
| `pricing_cta`     | `pricing_cta_test`     | Pricing CTA button text  |
| `pricing_price`   | `pricing_display_test` | Pricing display format   |
| `onboarding_flow` | `onboarding_flow_test` | Onboarding flow variant  |
| `upgrade_prompt`  | `upgrade_prompt_test`  | Upgrade prompt messaging |

## Viewing Results

1. Go to `/admin/ab-testing` in your app
2. Select time range (7d, 30d, 90d)
3. View conversion metrics for each test:
   - Impressions (Variant A vs B)
   - Conversions (Variant A vs B)
   - Conversion rate
   - Statistical confidence
   - Recommendation

## Tracking Components

These components already have A/B test tracking enabled:

- ✅ **Pricing Page** (`src/app/pricing/page.tsx`)
  - Tracks `pricing_cta_test` and `pricing_display_test`
  - Impressions on page view
  - Conversions on checkout click

- ✅ **Upgrade Prompt** (`src/components/UpgradePrompt.tsx`)
  - Tracks `upgrade_prompt_test`
  - Impressions when prompt shown
  - Conversions on upgrade click

## Adding New A/B Tests

To add a new A/B test:

1. **Create in PostHog:**
   - Create experiment with unique name (e.g., `homepage_hero_test`)

2. **Add to mapping:**

   ```typescript
   // src/lib/ab-test-tracking.ts
   const POSTHOG_TEST_MAPPING: Record<string, string> = {
     homepage_hero_test: 'homepage_hero', // Add this line
     // ... existing tests
   };
   ```

3. **Add to admin dashboard:**

   ```typescript
   // src/app/admin/ab-testing/page.tsx
   const getTestDisplayName = (testName: string): string => {
     const names: Record<string, string> = {
       homepage_hero: 'Homepage Hero Section', // Add this line
       // ... existing tests
     };
     return names[testName] || testName;
   };
   ```

4. **Track in your component:**

   ```typescript
   const heroVariant = useFeatureFlagVariant('homepage_hero_test');
   const abMetadata = getABTestMetadataFromVariant(
     'homepage_hero_test',
     heroVariant,
   );

   // Track impressions and conversions with abMetadata
   ```

## Troubleshooting

### Admin dashboard shows "No tests"

**Causes:**

- No events in database with `metadata.abTest` and `metadata.abVariant`
- Events tracked without A/B metadata
- Wrong time range selected

**Solution:**

```sql
-- Check if you have any A/B test data
SELECT
  metadata->>'abTest' as test_name,
  COUNT(*) as count
FROM conversion_events
WHERE metadata->>'abTest' IS NOT NULL
GROUP BY metadata->>'abTest';
```

### Events not tracking

**Check:**

1. PostHog feature flag is active and assigned
2. `useFeatureFlagVariant()` returns a value (not undefined)
3. Metadata helper returns non-null value
4. `trackEvent()` is being called
5. Browser console for errors

### Backfill script fails

**Common issues:**

- Missing `POSTHOG_PERSONAL_API_KEY` env var
- Incorrect PostHog project ID
- Rate limiting (reduce `--days` parameter)
- No events with A/B test flags in PostHog

## Database Schema

A/B test data is stored in the `metadata` JSONB column:

```sql
CREATE TABLE conversion_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_id UUID,
  user_id TEXT,
  metadata JSONB, -- { "abTest": "pricing_cta", "abVariant": "A" }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query events for a specific test
SELECT *
FROM conversion_events
WHERE metadata->>'abTest' = 'pricing_cta'
  AND metadata->>'abVariant' = 'A'
  AND event_type IN ('pricing_page_viewed', 'trial_started');
```

## Best Practices

1. **Consistent Naming:** Use clear, descriptive test names
2. **Track Both Events:** Always track both impressions AND conversions
3. **Unique Event IDs:** Use crypto.randomUUID() for event_id to avoid duplicates
4. **Test Isolation:** Run one test per page/feature to avoid interaction effects
5. **Sample Size:** Wait for at least 100 users per variant before making decisions
6. **Statistical Significance:** Only act on results with 95%+ confidence

## API Reference

### `getABTestMetadata(posthogTestName: string)`

Fetches current variant from PostHog and returns metadata.

```typescript
const metadata = getABTestMetadata('pricing_cta_test');
// Returns: { abTest: 'pricing_cta', abVariant: 'A' } or null
```

### `getABTestMetadataFromVariant(posthogTestName: string, variant: string | boolean | undefined)`

Converts an already-fetched variant value to metadata.

```typescript
const variant = useFeatureFlagVariant('pricing_cta_test');
const metadata = getABTestMetadataFromVariant('pricing_cta_test', variant);
```

### `getMultipleABTestMetadata(posthogTestNames: string[])`

Gets metadata for the first active test from a list.

```typescript
const metadata = getMultipleABTestMetadata([
  'pricing_cta_test',
  'pricing_display_test',
]);
// Returns metadata for whichever test the user is in
```

## Support

- **PostHog Docs:** https://posthog.com/docs/experiments
- **Admin Dashboard:** `/admin/ab-testing`
- **Code:** `src/lib/ab-test-tracking.ts`
