# Analytics Sheet Setup Guide

## Overview

This guide explains how to set up the weekly metrics pipeline that automatically writes investor-grade metrics to Google Sheets.

**This is the primary and recommended approach** - it replaces the old Google Apps Script method described in `KPI_SHEETS_SETUP.md`.

## Prerequisites

- Google Cloud Project with OAuth 2.0 credentials
- Brand Gmail account (lunary.app@gmail.com) with access to Google Sheets
- Existing OAuth credentials configured for YouTube API (can be reused)

## Step 1: OAuth Setup

The OAuth credentials are already configured for YouTube API. To add Google Sheets access:

1. **Regenerate refresh token with Sheets scope**:

   ```bash
   npx tsx scripts/regenerate-google-token.ts
   ```

2. **Follow the prompts**:
   - Script will display an authorization URL
   - Open the URL in your browser
   - **Sign in with lunary.app@gmail.com** (brand account)
   - Grant permissions for both YouTube and Google Sheets APIs
   - Copy the authorization code from the redirect URL
   - Paste the code when prompted
   - Copy the new refresh token

3. **Update environment variable**:
   - Update `GOOGLE_REFRESH_TOKEN` in your environment (Vercel/hosting)
   - The token now includes both YouTube and Sheets scopes

## Step 2: Google Sheet Setup

1. **Create or use existing Google Sheet**:
   - Create a new sheet or use an existing one
   - Ensure the sheet is shared with **lunary.app@gmail.com** (Editor access)
   - Copy the Sheet ID from the URL:
     ```
     https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
     ```

2. **Set environment variable**:
   - Add `GOOGLE_SHEETS_ID` to your environment variables
   - Value should be the Sheet ID from the URL

## Step 3: Environment Variables

Required environment variables:

- `GOOGLE_CLIENT_ID` - OAuth client ID (already configured)
- `GOOGLE_CLIENT_SECRET` - OAuth client secret (already configured)
- `GOOGLE_REFRESH_TOKEN` - OAuth refresh token (regenerate to include Sheets scope)
- `GOOGLE_SHEETS_ID` - Target Google Sheet ID
- `GOOGLE_SEARCH_CONSOLE_SITE_URL` - For Search Console (optional, uses service account by default)

## Step 4: Sheet Structure

The pipeline automatically creates the following tabs:

### README

- Pipeline metadata: purpose, timezone, week definition, data sources, last run times

### Weekly_KPIs (Primary)

- One row per week with all key metrics
- Upserted by `iso_week` (idempotent)

### Funnel_Week

- Conversion funnel metrics per week
- Upserted by `week_start_date`

### Feature_Usage_Weekly

- Feature usage breakdown per week
- One row per feature per week

## Step 5: Running the Pipeline

### Automatic (Weekly Cron)

The pipeline runs automatically every Monday at 02:00 Europe/London via Vercel cron:

- Endpoint: `GET /api/cron/weekly-metrics`
- Calculates metrics for the previous week
- Writes to Google Sheets
- Sends Discord notification

### Manual Backfill

To backfill historical weeks:

```bash
curl -X POST https://lunary.app/api/admin/analytics/backfill \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  }'
```

### Rerun Single Week

To rerun a specific week:

```bash
# By week start date
curl -X POST https://lunary.app/api/admin/analytics/rerun-week \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "week_start_date": "2025-01-06"
  }'

# Or by ISO week
curl -X POST https://lunary.app/api/admin/analytics/rerun-week \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "iso_week": "2025-W02"
  }'
```

## Metric Definitions

### Acquisition

- **new_users**: Count of first-time signups that week
- **new_trials**: Trial starts that week
- **new_paying_subscribers**: First successful paid conversion that week

### Activation

- **activated_users**: Users who complete activation event within 24h of signup
- **activation_rate**: activated_users / new_users
- **Activation events**: `grimoire_save`, `tarot_pull`, `moon_phase_view`

### Engagement

- **WAU**: Weekly Active Users (distinct users with at least 1 meaningful event)
- **avg_sessions_per_active_user**: Average sessions per active user
- **avg_events_per_active_user**: Average events per active user
- **Meaningful events**: `app_open`, `tarot_pull`, `grimoire_save`, `ritual_view`, `moon_phase_view`, `paywall_view`, `trial_start`, `sub_activated`

### Retention

- **w1_retention**: % of new users who are active in the following week
- **w4_retention**: % of new users who are active in weeks 2-4

### Revenue

- **gross_revenue_week**: Sum of subscription payments in week (approximate)
- **mrr_end_of_week**: Sum of `monthly_amount_due` for active subscriptions at week end
- **arr_run_rate_end_of_week**: `mrr_end_of_week * 12`
- **arpu_week**: `gross_revenue_week / WAU`

### Subscriptions

- **active_subscribers_end_of_week**: Active subscriptions at week end
- **churned_subscribers_week**: Subscriptions that ended/cancelled during week
- **churn_rate_week**: `churned_subscribers_week / active_subscribers_start_of_week`
- **trial_to_paid_conversion_rate_week**: Trial to paid conversion rate

### Quality

- **data_completeness_score**: 0-100 score based on missing sources/API failures

## Week Definition

- **Timezone**: Europe/London
- **Week start**: Monday 00:00:00
- **Week end**: Sunday 23:59:59.999
- **Format**: ISO week (YYYY-W##)

## Data Sources

- **PostgreSQL**: `conversion_events`, `subscriptions` tables
- **PostHog API**: Engagement, retention, feature usage (via HogQL queries)
- **Stripe**: Via `subscriptions.monthly_amount_due` field

## Troubleshooting

### OAuth Token Expired

If you see "invalid_grant" errors:

1. Regenerate the refresh token: `npx tsx scripts/regenerate-google-token.ts`
2. Update `GOOGLE_REFRESH_TOKEN` environment variable
3. Ensure you sign in with **lunary.app@gmail.com**

### Sheet Access Denied

If you see permission errors:

1. Verify the sheet is shared with **lunary.app@gmail.com** (Editor access)
2. Check that `GOOGLE_SHEETS_ID` is correct
3. Verify the OAuth token includes Sheets scope

### Missing Data

If metrics show 0 or incomplete:

1. Check data completeness score in the sheet
2. Verify PostHog API is accessible (check API key)
3. Check database connection (PostgreSQL)
4. Review error logs for specific failures

### Search Console

Search Console uses the existing service account (`GOOGLE_SERVICE_ACCOUNT_JSON`) by default. Both accounts (lunary.app@gmail.com and service account) are verified owners, so no additional setup is needed.

## Sanity Check

Run the sanity check script to verify metrics:

```bash
npx tsx scripts/sanity-check-metrics.ts
```

This prints the last 4 weeks of KPIs to the console for quick verification.

## Support

For issues or questions:

1. Check error logs in Vercel/hosting platform
2. Verify all environment variables are set correctly
3. Test OAuth token with the regenerate script
4. Check Discord notifications for pipeline status
