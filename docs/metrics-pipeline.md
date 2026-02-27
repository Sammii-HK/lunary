# Metrics Pipeline

Reference doc for how Lunary computes, stores, and exposes its KPI metrics. Read this when something looks wrong in the dashboard, the MCP, or BIP posts.

---

## The three-table chain

```
conversion_events          (raw, append-only)
       │
       ▼  daily cron computes each day
daily_unique_users         (per-day user-ID arrays, one row per day per segment)
       │
       ▼  same cron aggregates into summary row
daily_metrics              (one row per day, pre-computed KPIs)
       │
       ▼  read by
Admin API endpoints        /api/admin/analytics/*
       │
       ▼  consumed by
Lunary MCP / BIP pipeline / dashboard UI
```

---

## 1. conversion_events

Raw event table. Every meaningful user action lands here: `app_opened`, `grimoire_viewed`, `tarot_drawn`, `chart_viewed`, etc.

- One row per event (some event types have dedupe indexes, e.g. `app_opened` is limited to one per user per UTC day)
- Anonymous users tracked via `anonymous_id`; signed-in users via `user_id`
- Test accounts filtered by `user_email LIKE '%@test.lunary.app'`

See `docs/analytics-db.md` for full schema notes.

---

## 2. daily_unique_users (snapshot table)

Intermediate table. Each row stores the **array of user IDs** who were active on a given day in a given segment.

| column        | description                                         |
| ------------- | --------------------------------------------------- |
| `metric_date` | the day (date)                                      |
| `segment`     | `all`, `product`, `app_opened`, `reach`, `grimoire` |
| `user_ids`    | `text[]` array of resolved user IDs                 |
| `user_count`  | `COUNT(user_ids)` (denormalised for speed)          |

**Why this table exists:** computing MAU requires finding distinct users across 30 days. Scanning 30 days of `conversion_events` is expensive. Instead, the cron scans just _one_ day at a time and stores the user-ID array. WAU/MAU is then derived by unnesting and deduplicating across the stored arrays — a very cheap operation.

**Identity resolution:** if `analytics_identity_links` exists, anonymous IDs are stitched to their eventual signed-in `user_id` before storage. This means the same person who browsed anonymously and then signed up counts as one user, not two.

---

## 3. daily_metrics

One summary row per day. Populated by the compute-metrics cron after `daily_unique_users` is updated.

Key columns: `mau`, `wau`, `dau`, `signed_in_product_mau`, `mrr`, `new_signups`, `new_conversions`, `stickiness`, `activation_rate`, plus feature adoption rates.

**This table is the source of truth for all dashboard charts.** The admin API reads it directly rather than recomputing from raw events.

---

## The cron: compute-metrics

**File:** `src/app/api/cron/compute-metrics/route.ts`

**Schedule:** runs daily (see `vercel.json` and `docs/CRON_SCHEDULE.md`)

**What it does (two-phase):**

Phase 1 — scans ONE day of `conversion_events` → inserts into `daily_unique_users`

Phase 2 — reads `daily_unique_users` for the trailing 7 days (WAU) or 30 days (MAU) → aggregates → writes one row to `daily_metrics`

**Manual trigger (backfill a specific date):**

```bash
curl "https://lunary.app/api/cron/compute-metrics?date=2026-02-01" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Backfill the last 90 days:**

```bash
pnpm db:backfill-metrics
```

This calls compute-metrics for each of the last 90 days sequentially. Requires `daily_unique_users` to already have data for those days — run the snapshot backfill first if it doesn't.

**Backfill daily_unique_users snapshots first:**

```bash
curl "https://lunary.app/api/cron/compute-metrics/backfill-snapshots?days=90" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Known data issue: MAU series break

> **TL;DR:** `daily_metrics.mau` is unreliable for dates before approximately late January 2026. Do not compare week-over-week MAU if the comparison period crosses that boundary.

### What happened

The compute-metrics cron was refactored to the two-phase approach (described above) at some point in early 2026. Before that refactor, MAU was computed by directly scanning 30 days of `conversion_events` and counting `DISTINCT user_id OR anonymous_id`. This included every anonymous web visitor who triggered a `page_viewed` event — which is tens of thousands of people per month.

The old `pnpm db:backfill-metrics` script was run against historical dates using whichever version of `compute-metrics` was live at the time. For those dates it baked the inflated (anonymous-inclusive) MAU into `daily_metrics`.

The new cron correctly counts only meaningful engagement events from signed-in (or identity-resolved) users. So the series looks like:

```
Jan 2026 (old methodology):  MAU ≈ 24,000   ← all anonymous visitors
Feb 2026 (new methodology):  MAU ≈ 245      ← real signed-in MAU
```

This is **not a bug in the current code** — the current numbers are correct. The historical rows are just wrong.

### How to fix it (when you have time)

1. Run the snapshot backfill to populate `daily_unique_users` for the last 90 days:
   ```bash
   curl "https://lunary.app/api/cron/compute-metrics/backfill-snapshots?days=90" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
2. Re-run `pnpm db:backfill-metrics` to recompute `daily_metrics` from those corrected snapshots.

After that, the full 90-day series will use the same methodology and week-over-week deltas will be accurate.

### How the BIP pipeline handles it

`src/lib/bip-metrics.ts` has a guard: if a calculated delta is below -90%, it is silently replaced with 0. This prevents posting "-99% MAU this week" when the comparison is crossing the series break. Once ~30 days of clean data accumulate the guard will never trigger.

---

## Admin API endpoints

All require `Authorization: Bearer <LUNARY_ADMIN_KEY>`.

| endpoint                                | what it returns                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/api/admin/analytics/dashboard`        | MAU, MRR, signups, stickiness, timeseries. Params: `startDate`, `endDate` (YYYY-MM-DD). Default: last 30 days. |
| `/api/admin/analytics/dau-wau-mau`      | Full DAU/WAU/MAU breakdown with all segments                                                                   |
| `/api/admin/analytics/revenue`          | `{ mrr, free_to_trial_rate }`. MRR is in **pounds** (e.g. `22.50`).                                            |
| `/api/admin/analytics/search-console`   | Google Search Console impressions, clicks, CTR, position. Params: `startDate`, `endDate`.                      |
| `/api/admin/analytics/user-growth`      | New signup counts per day                                                                                      |
| `/api/admin/analytics/cohort-retention` | Cohort retention matrix                                                                                        |
| `/api/admin/analytics/snapshot`         | Latest metric snapshot (for MCP / quick reads)                                                                 |

**Date param names** (important — `days` is NOT a recognised param):

```
?startDate=2026-02-01&endDate=2026-02-26    ✓
?start_date=2026-02-01&end_date=2026-02-26  ✓
?days=7                                      ✗ ignored, falls back to 30-day default
```

---

## Lunary MCP

**Location:** `lunary-mcp/`

**What it is:** An MCP server that exposes Lunary's admin analytics as Claude Code tools. Claude Code (this tool) can call these directly in a conversation.

**Auth:** reads `LUNARY_ADMIN_KEY` and `LUNARY_API_URL` from `lunary-mcp/.env`. These are **not** in `lunary/.env.local` — they live in the MCP's own env file.

**Available tools (selection):**

| tool                   | what it does                             |
| ---------------------- | ---------------------------------------- |
| `get_dashboard`        | MAU, MRR, signups, stickiness            |
| `get_dau_wau_mau`      | Engagement metrics with all segments     |
| `get_revenue`          | MRR and conversion rate                  |
| `get_search_console`   | SEO impressions/clicks                   |
| `get_user_growth`      | Signup trend                             |
| `get_cohort_retention` | Retention cohort matrix                  |
| `get_metric_snapshot`  | Cached daily snapshot                    |
| `get_ai_insights`      | GPT-generated summary of current metrics |

**To reload the MCP after a code change:**
Restart Claude Code, or use `/mcp` to check connection status.

---

## BIP post pipeline

**Location:** `scripts/generate-bip-post.ts`

Fetches metrics, renders a card image (SVG → sharp → PNG at 1200×675), generates a caption via GPT-4o-mini, and schedules the post to the `sammii` account set in Spellcast.

```bash
pnpm post:bip              # weekly card (default)
pnpm post:bip:milestone    # checks if a threshold was crossed; fires once per threshold
pnpm post:bip:launch "Feature Name"   # feature launch card
pnpm post:bip:dry          # print output, no Spellcast post created
pnpm post:bip --no-schedule            # create Spellcast draft only, no scheduled time
pnpm post:bip --schedule 2026-03-01T10:00:00Z   # custom schedule time
```

**Env requirements (all in `lunary/.env.local`):**

- `OPENAI_API_KEY` — for caption generation
- `SPELLCAST_API_URL` and `SPELLCAST_API_KEY` — for posting
- `LUNARY_ADMIN_KEY` — NOT required in `.env.local`; auto-loaded from `lunary-mcp/.env` as fallback

**Card output:** `public/app-demos/bip/<mode>-<date>.png` (gitignored)

**Milestone deduplication state:** `public/app-demos/bip/.milestones-posted.json` (gitignored). Delete this file to re-fire all milestones.

**Milestone thresholds:**

- MAU: 500, 1,000, 2,500, 5,000
- MRR: £100, £500, £1,000
- Impressions/day: 50k, 100k, 250k

---

## Quick reference: "why is this metric wrong?"

| symptom                                     | likely cause                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| MAU looks like 20k+ in old charts           | Series break — old methodology included all anonymous visitors                         |
| Week-over-week MAU delta is -99%            | Comparison is crossing the series break boundary                                       |
| BIP post shows `+0%` for MAU/MRR            | Sanity clamp triggered due to series break; will resolve in ~30 days                   |
| Impressions/day is 0 in BIP                 | Search Console API credentials may have expired, or GSC has no data for the date range |
| Dashboard returns 30 days instead of N days | `days` param is not recognised — use `startDate`/`endDate`                             |
| MCP returns stale data                      | The MCP process may be using cached `.env` values — restart Claude Code                |
