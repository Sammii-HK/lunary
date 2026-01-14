import { config } from 'dotenv';
import { resolve } from 'path';
import {
  buildFxDriftReport,
  DEFAULT_FX_URL,
  REVIEW_THRESHOLD,
  UPDATE_THRESHOLD,
} from '../utils/fx-drift';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}

function classifyDrift(drift: number): 'ok' | 'review' | 'update' {
  if (drift >= UPDATE_THRESHOLD) return 'update';
  if (drift >= REVIEW_THRESHOLD) return 'review';
  return 'ok';
}

async function main() {
  const { results } = await buildFxDriftReport();

  const needsReview = results.filter(
    (result) => classifyDrift(result.driftPercent) !== 'ok',
  );

  console.log('='.repeat(72));
  console.log('FX Drift Report (anchors: USD, GBP)');
  console.log(`Provider: ${process.env.FX_RATE_API_URL || DEFAULT_FX_URL}`);
  console.log(`Review >= ${REVIEW_THRESHOLD}%, Update >= ${UPDATE_THRESHOLD}%`);
  console.log('='.repeat(72));

  if (results.length === 0) {
    console.log('No non-anchor prices found to evaluate.');
  }

  for (const result of results) {
    const status = classifyDrift(result.driftPercent);
    const statusLabel =
      status === 'update' ? 'UPDATE' : status === 'review' ? 'REVIEW' : 'OK';
    const details = [
      `Plan: ${result.planId}`,
      `Currency: ${result.currency}`,
      `Stored: ${formatMoney(result.storedAmount, result.currency)}`,
      `Anchor: ${result.anchor}`,
      `Drift: ${formatPercent(result.driftPercent)}`,
    ];

    if (typeof result.driftUsd === 'number') {
      details.push(`USD drift: ${formatPercent(result.driftUsd)}`);
    }

    if (typeof result.driftGbp === 'number') {
      details.push(`GBP drift: ${formatPercent(result.driftGbp)}`);
    }

    console.log(`[${statusLabel}] ${details.join(' | ')}`);
  }

  console.log('='.repeat(72));
  console.log(
    `Summary: ${needsReview.length} flagged / ${results.length} checked`,
  );

  if (needsReview.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('FX drift check failed:', error);
  process.exit(1);
});
