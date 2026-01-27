# Testing the CTA Examples Cron Endpoint

## Local Testing

### 1. Start the development server

```bash
pnpm dev
```

### 2. Test the endpoint manually

```bash
# Using the npm script (requires CRON_SECRET env variable)
pnpm run cron:cta-examples

# Or using curl directly
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/generate-cta-examples
```

### 3. Verify the output

Check that:

- `src/lib/cta-examples.json` was updated with new `generatedAt` timestamp
- The response JSON shows success and example counts
- Discord notification was sent (if Discord webhook is configured)

## Production Testing

### Manual Trigger (Before Deployment)

```bash
# Test on production (requires CRON_SECRET from environment)
curl -H "Authorization: Bearer $CRON_SECRET" https://lunary.app/api/cron/generate-cta-examples
```

### Vercel Cron Configuration

The cron is configured in `vercel.json`:

```json
{
  "path": "/api/cron/generate-cta-examples",
  "schedule": "0 6 20 * *"
}
```

**Schedule**: `0 6 20 * *` = 6:00 AM UTC on the 20th of every month

This timing ensures:

- Runs when Sun is likely changing zodiac signs (around 19th-23rd each month)
- 6 AM UTC = reasonable time across all timezones
- Monthly frequency keeps examples fresh

### Monitoring

After deployment, verify cron execution:

1. Check Vercel dashboard → Cron Jobs tab
2. Monitor Discord notifications for success/failure
3. Check `src/lib/cta-examples.json` commit history on GitHub

## Expected Response

### Success

```json
{
  "success": true,
  "generatedAt": "2026-01-26T06:00:00.000Z",
  "generatedForDate": "2026-01-20",
  "totalExamples": 18,
  "exampleCounts": [
    { "hub": "horoscopes", "count": 3 },
    { "hub": "planets", "count": 2 },
    { "hub": "houses", "count": 2 },
    { "hub": "transits", "count": 3 },
    { "hub": "moon", "count": 3 },
    { "hub": "aspects", "count": 3 }
  ],
  "duration": 1234,
  "outputPath": "/var/task/src/lib/cta-examples.json"
}
```

### Error

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2026-01-26T06:00:00.000Z"
}
```

## Security

The endpoint requires one of:

1. `x-vercel-cron: 1` header (automatically set by Vercel Cron)
2. `Authorization: Bearer <CRON_SECRET>` header for manual testing

This prevents unauthorized regeneration of examples.

## Rollback Plan

If the cron fails or generates bad examples:

1. **Immediate**: Revert `src/lib/cta-examples.json` to previous version via git

   ```bash
   git checkout HEAD~1 src/lib/cta-examples.json
   git add src/lib/cta-examples.json
   git commit -m "Revert CTA examples to previous version"
   git push
   ```

2. **Fix and Regenerate**: Run script manually after fixing

   ```bash
   pnpm run generate-cta-examples
   ```

3. **Deploy**: Commit the fixed version
   ```bash
   git add src/lib/cta-examples.json
   git commit -m "Regenerate CTA examples after fix"
   git push
   ```
