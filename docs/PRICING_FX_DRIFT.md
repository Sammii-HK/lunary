# Pricing FX Drift Review

## Cadence

- Cron runs monthly and only executes on cadence months.
- Default cadence is quarterly; set `FX_DRIFT_CADENCE_MONTHS=6` for semiannual.
- Only update non-anchor currencies when drift is meaningful.

## Anchors

- USD and GBP are anchor prices and must remain stable.
- All other currency prices are evaluated against current FX rates.
- Annual plan anchors are derived from 10x monthly Pro (USD/GBP).

## Workflow

1. Generate or refresh the local pricing map if needed:
   - `pnpm generate-price-mapping`
2. Run the drift report:
   - `pnpm fx:check`
3. Review any flagged currencies:
   - Review threshold: >= 5%
   - Update recommended: >= 10%
4. Resolve updates (dry-run by default):
   - `pnpm fx:resolve`
   - Apply Stripe updates + refresh local map: `pnpm fx:resolve --apply --update-map`
5. Auto-apply + commit mapping update:

## GitHub Action

- Scheduled workflow: `.github/workflows/fx-drift-pr.yml`
- Requires `STRIPE_SECRET_KEY` and optional `FX_RATE_API_URL`/`FX_RATE_API_KEY` secrets.
  - `pnpm fx:apply:commit`
  - Optional PR: `pnpm fx:apply:commit -- --pr`

## Notes

- The report compares stored non-anchor prices to current FX rates.
- The drift check never suggests changing USD or GBP amounts.
- Configure the provider with `FX_RATE_API_URL` (optional `FX_RATE_API_KEY`).
- Override update threshold with `FX_DRIFT_UPDATE_THRESHOLD` if needed.
- Cron endpoint: `/api/cron/fx-drift` (schedule in `vercel.json`).
- Auto-apply in cron: `FX_DRIFT_AUTO_APPLY=true` (mapping should be regenerated).
