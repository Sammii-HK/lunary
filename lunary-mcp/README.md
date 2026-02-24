# Lunary MCP Server

MCP server for querying Lunary admin analytics, revenue, growth, content, and health data from Claude Code.

## Setup

### 1. Build

```bash
cd lunary-mcp
pnpm install
pnpm build
```

### 2. Configure Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "lunary": {
      "command": "node",
      "args": ["/path/to/lunary/lunary-mcp/dist/index.js"],
      "env": {
        "LUNARY_API_URL": "https://lunary.app",
        "LUNARY_ADMIN_KEY": "<your-admin-api-key>"
      }
    }
  }
}
```

### 3. Create a local `.env` (recommended)

Create `lunary-mcp/.env` as a reliable fallback. Claude Code sometimes fails to pass env vars to MCP processes (stale sessions, config reload issues). The `.env` file is always available.

```bash
# lunary-mcp/.env (gitignored)
LUNARY_API_URL=https://lunary.app
LUNARY_ADMIN_KEY=<your-admin-api-key>
```

The client checks `process.env` first, then falls back to `.env`. Startup logs show the source:

```
[lunary-mcp] BASE_URL=https://lunary.app ADMIN_KEY=eKwpmqza...(len=35) (source: .env file)
```

### 4. Set the server-side env var

The `LUNARY_ADMIN_KEY` value must match the `ADMIN_API_KEY` environment variable on Vercel. The MCP client sends this as a `Bearer` token and the server's `requireAdminAuth` middleware (`src/lib/admin-auth.ts`) validates it.

```bash
# Set on Vercel (must match LUNARY_ADMIN_KEY in Claude settings)
npx vercel env add ADMIN_API_KEY
```

After adding or changing the Vercel env var, **redeploy** for it to take effect.

## Environment Variables

| Variable           | Where                               | Purpose                                 |
| ------------------ | ----------------------------------- | --------------------------------------- |
| `LUNARY_ADMIN_KEY` | MCP config (`env` in settings.json) | Sent as `Authorization: Bearer <key>`   |
| `ADMIN_API_KEY`    | Vercel production env               | Server-side check in `requireAdminAuth` |
| `LUNARY_API_URL`   | MCP config (optional)               | Defaults to `https://lunary.app`        |

**These must be the same value.** The naming difference is intentional — `LUNARY_ADMIN_KEY` is scoped to the MCP process, `ADMIN_API_KEY` is the server-side env var.

## Tool Groups

| Group       | Tools                                                                                                                                                                                      | File                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Health      | `health_check`, `deep_health_check`, `list_cron_jobs`, `trigger_cron`, `get_db_status`                                                                                                     | `tools/health.ts`     |
| Analytics   | `get_dashboard`, `get_dau_wau_mau`, `get_engagement`, `get_user_segments`, `get_metric_snapshot`                                                                                           | `tools/analytics.ts`  |
| Revenue     | `get_revenue`, `get_subscription_lifecycle`, `get_subscription_30d`, `get_plan_breakdown`, `get_subscriber_count`                                                                          | `tools/revenue.ts`    |
| Growth      | `get_user_growth`, `get_cohort_retention`, `get_activation`, `get_conversions`, `get_attribution`, `get_cac`                                                                               | `tools/growth.ts`     |
| Content     | `get_search_console`, `get_grimoire_health`, `get_seo_metrics`, `get_ai_engagement`, `get_pending_posts`, `approve_post`, `get_social_schedule`, `get_video_jobs`, `get_video_performance` | `tools/content.ts`    |
| A/B Testing | `get_ab_tests`, `get_ab_insights`, `apply_ab_winner`                                                                                                                                       | `tools/ab-testing.ts` |
| Social      | Social media management tools                                                                                                                                                              | `tools/social.ts`     |
| Features    | `get_feature_usage`, `get_feature_adoption`, `get_cta_conversions`, `get_conversion_influence`                                                                                             | `tools/features.ts`   |

## Troubleshooting

### 401 Unauthorized on authenticated endpoints

`health_check` works but `get_dashboard`, `deep_health_check`, etc. return 401.

**Check 1: Key mismatch**

The MCP sends `LUNARY_ADMIN_KEY` as a Bearer token. The server checks `ADMIN_API_KEY`. These must be identical.

```bash
# Verify they match
npx vercel env pull /tmp/env-check
grep ADMIN_API_KEY /tmp/env-check
# Compare with the value in ~/.claude/settings.json → mcpServers.lunary.env.LUNARY_ADMIN_KEY
rm /tmp/env-check
```

**Check 2: Vercel env var not deployed**

Adding an env var on Vercel doesn't apply to the running deployment. You must redeploy.

```bash
npx vercel --prod  # trigger production redeploy
```

**Check 3: Stale MCP process**

Claude Code spawns MCP servers once at session start. If you change the key in `~/.claude/settings.json` or rebuild the MCP server, the running process still uses the old values.

**Fix:** Restart Claude Code. There is no way to reload MCP servers without restarting the session.

To verify the process has the right key, check stderr output on startup — the client logs:

```
[lunary-mcp] BASE_URL=https://lunary.app ADMIN_KEY=eKwpmqza...(len=35)
```

If it says `ADMIN_KEY=EMPTY`, the env var isn't being passed through.

**Check 4: Test outside the MCP**

Isolate whether the issue is the MCP process or the server:

```bash
# Direct curl — if this works, the server is fine
curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer <your-key>" \
  "https://lunary.app/api/admin/analytics/dashboard"

# Node fetch — if this works, the code is fine
node -e "
fetch('https://lunary.app/api/admin/analytics/dashboard', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <your-key>',
  }
}).then(r => console.log(r.status));
"

# Full MCP simulation — if this works, the process env is the issue
env -i LUNARY_API_URL=https://lunary.app LUNARY_ADMIN_KEY=<your-key> \
  HOME=$HOME PATH=$PATH \
  node /path/to/lunary-mcp/dist/index.js
```

### MCP tools not appearing in Claude Code

After adding new tools or changing tool names, Claude Code won't see them until the MCP process restarts.

**Fix:** Restart Claude Code.

If tools still don't appear, check the build output:

```bash
cd lunary-mcp
pnpm build  # should complete with no errors
node dist/index.js  # should hang waiting for stdio input (ctrl+c to exit)
```

### Debugging request failures

The client logs failed requests to stderr with the URL, status, and key prefix:

```
[lunary-mcp] FAILED GET https://lunary.app/api/admin/analytics/dashboard → 401 | key=eKwpmqza...
```

If `key=EMPTY`, the `LUNARY_ADMIN_KEY` env var is missing from the MCP process.

## Development

```bash
pnpm dev    # Run with tsx (hot reload)
pnpm build  # Compile to dist/
pnpm start  # Run compiled output
```

After making changes, rebuild and restart Claude Code:

```bash
pnpm build
# Then restart Claude Code for it to pick up the new build
```
