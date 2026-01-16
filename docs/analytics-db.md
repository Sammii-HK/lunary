# DB-only analytics (deduplicated, privacy-safe)

Lunary’s KPI analytics are computed from the `conversion_events` table in Postgres.

## Principles

- Metrics are based on **meaningful user-level events**, not raw pageviews or session recordings.
- Dedupe is expected and desired:
  - `app_opened`: **1 per user per UTC day**
  - `grimoire_viewed`: **1 per user per UTC day per Grimoire entity** (falls back to `page_path` when `entity_id` is missing)
- All KPI endpoints are **DB-only**. PostHog is used only for **one-time historical backfill**.

## Setup (schema + indexes)

Run:

```bash
pnpm setup-db
```

This ensures:

- `conversion_events.anonymous_id`, `entity_type`, `entity_id` exist
- Indexes exist for `created_at`, `(user_id, created_at)`, `(event_type, created_at)`
- Dedupe unique indexes exist for `app_opened` and `grimoire_viewed`

## Backfill (one-time from PostHog)

Backfill from PostHog into `conversion_events` with deterministic dedupe enforced by DB unique indexes.

Dry run:

```bash
pnpm backfill:posthog-events:dry --start-date=2025-12-17 --end-date=2026-01-15
```

Real run:

```bash
pnpm backfill:posthog-events --start-date=2025-12-17 --end-date=2026-01-15
```

Output counters:

- `fetched`: events returned by PostHog
- `inserted`: rows inserted into Postgres
- `skipped_no_user`: no usable user identifier available
- `skipped_duplicate`: dedupe conflict (insert-on-conflict-do-nothing)
- `skipped_invalid`: failed normalisation or invalid payload

Admin-triggered backfill (requires `CRON_SECRET`):

```bash
curl -sS \\
  -H "Authorization: Bearer $CRON_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"start_date":"2025-12-17","end_date":"2026-01-15","dry_run":false,"limit":5000}' \\
  "http://localhost:3000/api/admin/analytics/backfill-events"
```

## Sanity check SQL

### 1) Event counts by type (last 30 days)

```sql
SELECT event_type, COUNT(*)
FROM conversion_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_type
ORDER BY COUNT(*) DESC;
```

### 2) Distinct active users (last 30 days, deduped app_opened)

```sql
SELECT COUNT(DISTINCT user_id) AS mau
FROM conversion_events
WHERE event_type = 'app_opened'
  AND user_id IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days';
```

### 3) app_opened count in a backfilled window (daily deduped)

```sql
SELECT COUNT(*)
FROM conversion_events
WHERE event_type = 'app_opened'
  AND created_at >= '2025-12-17T00:00:00.000Z'::timestamptz
  AND created_at <= '2026-01-15T23:59:59.999Z'::timestamptz;
```

### 4) grimoire_viewed count in a backfilled window (daily per entity deduped)

```sql
SELECT COUNT(*)
FROM conversion_events
WHERE event_type = 'grimoire_viewed'
  AND created_at >= '2025-12-17T00:00:00.000Z'::timestamptz
  AND created_at <= '2026-01-15T23:59:59.999Z'::timestamptz;
```

### 5) Confirm dedupe uniqueness (spot-check duplicates)

```sql
-- app_opened duplicates should be impossible after indexes are in place
SELECT user_id, (created_at AT TIME ZONE 'UTC')::date AS day, COUNT(*)
FROM conversion_events
WHERE event_type = 'app_opened'
GROUP BY user_id, (created_at AT TIME ZONE 'UTC')::date
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 50;
```

```sql
-- grimoire_viewed duplicates should be impossible per user/day/entity key
SELECT
  user_id,
  (created_at AT TIME ZONE 'UTC')::date AS day,
  COALESCE(entity_id, page_path, '') AS entity_key,
  COUNT(*)
FROM conversion_events
WHERE event_type = 'grimoire_viewed'
GROUP BY user_id, (created_at AT TIME ZONE 'UTC')::date, COALESCE(entity_id, page_path, '')
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 50;
```

## Admin endpoints (DB-only)

- `/api/admin/analytics/engagement-overview`
- `/api/admin/analytics/feature-adoption`
- `/api/admin/analytics/grimoire-health`
- `/api/admin/analytics/conversion-influence`
- Single user profile: `/admin/analytics/users/:userId`
