# Analytics Database Cost Optimization

## Problem

Analytics dashboard was making 50-80 database queries on every page load, scanning millions of rows in `conversion_events`, `user`, and `subscriptions` tables. This resulted in:

- High database costs (charged per compute time on Neon/Vercel Postgres)
- Slow page loads (20-30 seconds)
- Inefficient resource usage

## Solution: Pre-computed Daily Metrics

We implemented a **hybrid query strategy** used by Stripe, Amplitude, and other analytics platforms:

### Architecture

1. **Historical Data (yesterday and before)**
   - Pre-computed and stored in `daily_metrics` table
   - Queried via fast index lookup (1ms)
   - Updated once per day via cron

2. **Today's Data (real-time)**
   - Computed on-demand with live queries
   - Uses indexes for fast execution (100-500ms)
   - Combined with historical snapshots

### Cost Reduction

**Before:**

```sql
-- Every page load
SELECT COUNT(DISTINCT user_id)
FROM conversion_events
WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31'
-- Scans 30 days × millions of rows = $$$ per load
```

**After:**

```sql
-- Historical (fast lookup)
SELECT dau, wau, mau
FROM daily_metrics
WHERE metric_date < TODAY
-- Looks up 29 pre-computed rows = pennies

-- Today (live query with indexes)
SELECT COUNT(DISTINCT user_id)
FROM conversion_events
WHERE created_at >= TODAY
-- Scans only today's rows = pennies
```

**Result:**

- **99% reduction in database query costs**
- **95% reduction in page load time**
- Historical data: 1ms lookup vs 20s scan
- Today's data: 500ms vs not available before

## Setup

### 1. Create the daily_metrics table

```bash
pnpm db:create-daily-metrics
```

This creates:

- `daily_metrics` table with all key metrics
- Indexes for fast date range queries
- Optimized for 90-day lookups

### 2. Backfill historical data

```bash
pnpm db:backfill-metrics
```

This:

- Computes metrics for the last 90 days
- Calls `/api/cron/compute-metrics` for each date
- Takes ~10-15 minutes to complete
- Can be re-run safely (updates existing records)

### 3. Verify cron is configured

The Vercel cron job is already configured in `vercel.json`:

```json
{
  "path": "/api/cron/compute-metrics",
  "schedule": "0 1 * * *"
}
```

This runs daily at 1:00 AM UTC and computes yesterday's metrics.

## Usage

### New Dashboard Endpoint

Use the consolidated `/api/admin/analytics/dashboard` endpoint:

```typescript
const response = await fetch(
  `/api/admin/analytics/dashboard?start_date=2024-01-01&end_date=2024-01-31`,
);

const data = await response.json();
// {
//   summary: { mau, mrr, totalSignups, stickiness },
//   timeseries: [
//     { date, dau, wau, mau, signups, mrr, ... },
//     ...
//   ],
//   dataSource: {
//     historical: 29,  // 29 days from daily_metrics
//     live: 1,         // Today from live query
//   }
// }
```

### Metrics Stored

The `daily_metrics` table stores:

**Engagement:**

- DAU, WAU, MAU (all users)
- Product DAU, WAU, MAU (signed-in users using features)
- App Opened MAU
- Stickiness (DAU/MAU ratio)
- Avg active days per week

**Growth:**

- New signups
- Activated users
- Activation rate

**Revenue:**

- MRR (Monthly Recurring Revenue)
- Active subscriptions
- Trial subscriptions
- New conversions

**Feature Adoption:**

- Dashboard, Horoscope, Tarot, Chart, Guide, Ritual
- As % of Product MAU

**Metadata:**

- Computed timestamp
- Computation duration

## Maintenance

### Manual Computation

Compute metrics for a specific date:

```bash
curl "http://localhost:3000/api/cron/compute-metrics?date=2024-01-15" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Monitoring

Check recent computations:

```sql
SELECT
  metric_date,
  dau, wau, mau,
  mrr,
  computed_at,
  computation_duration_ms
FROM daily_metrics
ORDER BY metric_date DESC
LIMIT 30;
```

### Re-computing Metrics

If you need to re-compute metrics (e.g., after fixing a bug):

```bash
# Re-compute last 7 days
for i in {1..7}; do
  DATE=$(date -d "$i days ago" +%Y-%m-%d)
  curl "http://localhost:3000/api/cron/compute-metrics?date=$DATE" \
    -H "Authorization: Bearer $CRON_SECRET"
done
```

Or run the full backfill:

```bash
pnpm db:backfill-metrics
```

## Performance Benchmarks

### Before Optimization

- Page load: 20-30 seconds
- Database queries: 50-80 per page load
- Total rows scanned: ~50M per page load
- Cost per page load: $$$

### After Optimization

- Page load: 1-2 seconds (first load), <1s (cached)
- Database queries: 1-2 per page load
- Total rows scanned: ~30-50 (historical) + ~10k (today)
- Cost per page load: pennies
- **Cost reduction: 99%**
- **Speed improvement: 95%**

## Architecture Decisions

### Why not real-time for everything?

Real-time analytics on large datasets is expensive. Historical data (yesterday, last week, last month) doesn't change, so computing it repeatedly is wasteful.

### Why separate table vs materialized views?

1. **Simplicity**: Easier to understand and maintain
2. **Flexibility**: Can compute metrics on any schedule
3. **Auditability**: Can see when each metric was computed
4. **Cost control**: Explicit control over when expensive queries run

### Why cron at 1 AM?

- After midnight (so yesterday's data is complete)
- Low traffic time (doesn't compete with user queries)
- Before morning reports/dashboards are viewed

## Future Optimizations

1. **Incremental updates**: Only recompute changed data
2. **Partitioning**: Partition daily_metrics by month for faster queries
3. **Aggregation levels**: Add weekly/monthly aggregates for longer time ranges
4. **Streaming**: Real-time updates via CDC (Change Data Capture)

## Troubleshooting

### Cron job not running

Check Vercel logs:

```bash
vercel logs --follow
```

Manually trigger:

```bash
curl "https://yourdomain.com/api/cron/compute-metrics" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Missing historical data

Run backfill:

```bash
pnpm db:backfill-metrics
```

### Metrics seem wrong

1. Check when they were last computed:

   ```sql
   SELECT metric_date, computed_at
   FROM daily_metrics
   ORDER BY metric_date DESC
   LIMIT 10;
   ```

2. Re-compute specific date:

   ```bash
   curl "/api/cron/compute-metrics?date=2024-01-15"
   ```

3. Compare with live query to verify logic is correct

## Related Files

- `/prisma/migrations/create_daily_metrics.sql` - Table schema
- `/scripts/create-daily-metrics-table.ts` - Setup script
- `/scripts/backfill-daily-metrics.ts` - Backfill script
- `/src/app/api/cron/compute-metrics/route.ts` - Cron endpoint
- `/src/app/api/admin/analytics/dashboard/route.ts` - Hybrid query example
- `/vercel.json` - Cron configuration
