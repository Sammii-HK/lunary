import { config } from 'dotenv';
import { resolve } from 'path';
import { UPDATE_THRESHOLD } from '../utils/fx-drift';
import {
  resolveFxDriftUpdates,
  type FxResolveUpdate,
} from '../utils/fx-drift-resolve';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    apply: args.includes('--apply'),
    updateMap: args.includes('--update-map'),
    thresholdArg: args.find((arg) => arg.startsWith('--threshold=')),
  };
}

async function main() {
  const { apply, updateMap, thresholdArg } = parseArgs();
  const updateThreshold = thresholdArg
    ? Number(thresholdArg.split('=')[1])
    : Number(process.env.FX_DRIFT_UPDATE_THRESHOLD || UPDATE_THRESHOLD);

  if (!Number.isFinite(updateThreshold)) {
    throw new Error('Invalid update threshold.');
  }

  const { updates, updatedMapping } = await resolveFxDriftUpdates({
    apply,
    updateMap,
    updateThreshold,
  });

  if (updates.length === 0) {
    console.log(
      `No currencies exceed ${updateThreshold}% drift. Nothing to update.`,
    );
    return;
  }

  console.log(
    `Found ${updates.length} currencies exceeding ${updateThreshold}% drift.`,
  );

  updates.forEach((update: FxResolveUpdate) => {
    console.log(
      `[${update.planId}] ${update.currency}: ${update.fromAmount} → ${update.toAmount} (anchor ${update.anchorCurrency}, drift ${update.driftPercent.toFixed(2)}%)`,
    );
  });

  if (apply && updateMap && updatedMapping) {
    const fs = await import('fs');
    const outputPath = resolve(process.cwd(), 'utils/stripe-prices.ts');
    const content = `// Auto-generated price mapping from Stripe
// Run: npm run generate-price-mapping
// Last updated: ${new Date().toISOString()}

export const STRIPE_PRICE_MAPPING = ${JSON.stringify(updatedMapping, null, 2)} as const;

export type PlanId = keyof typeof STRIPE_PRICE_MAPPING;
export type Currency = string;

export function getPriceForCurrency(
  planId: PlanId,
  currency: Currency = 'USD',
): { priceId: string; amount: number; currency: string } | null {
  const planPrices = STRIPE_PRICE_MAPPING[planId];
  if (!planPrices) return null;

  // Try exact match first
  if (planPrices[currency.toUpperCase() as keyof typeof planPrices]) {
    return planPrices[currency.toUpperCase() as keyof typeof planPrices];
  }

  // Fallback to USD
  return planPrices['USD'] || null;
}

export function getAvailableCurrencies(planId: PlanId): string[] {
  const planPrices = STRIPE_PRICE_MAPPING[planId];
  if (!planPrices) return [];
  return Object.keys(planPrices);
}
`;

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ Updated local price mapping: ${outputPath}`);
  }
}

main().catch((error) => {
  console.error('FX drift resolve failed:', error);
  process.exit(1);
});
