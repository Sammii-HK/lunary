import Stripe from 'stripe';
import { PRICING_PLANS } from './pricing';
import { STRIPE_PRICE_MAPPING, type PlanId } from './stripe-prices';
import { buildFxDriftReport, UPDATE_THRESHOLD } from './fx-drift';

const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'HUF']);
const MONTHLY_PRO_PLAN_ID: PlanId = 'lunary_plus_ai';
const ANNUAL_PRO_PLAN_ID: PlanId = 'lunary_plus_ai_annual';
const ANNUAL_MONTHS_EQUIVALENT = 10;

export type FxResolveOptions = {
  apply: boolean;
  updateMap: boolean;
  updateThreshold?: number;
};

export type FxResolveUpdate = {
  planId: string;
  currency: string;
  fromAmount: number;
  toAmount: number;
  anchorCurrency: 'USD' | 'GBP';
  driftPercent: number;
  oldPriceId?: string;
  newPriceId?: string;
};

function getAnnualAnchorAmount(currency: string): number | undefined {
  const normalizedCurrency = currency.toUpperCase();
  const monthlyPlan = STRIPE_PRICE_MAPPING[MONTHLY_PRO_PLAN_ID];
  if (!monthlyPlan) return undefined;
  const monthlyAmount =
    monthlyPlan[normalizedCurrency as keyof typeof monthlyPlan]?.amount;
  if (!monthlyAmount) return undefined;
  return monthlyAmount * ANNUAL_MONTHS_EQUIVALENT;
}

function getAnchorAmount(planId: PlanId, currency: string): number | undefined {
  if (planId === ANNUAL_PRO_PLAN_ID) {
    return getAnnualAnchorAmount(currency);
  }
  const plan = STRIPE_PRICE_MAPPING[planId];
  if (!plan) return undefined;
  const normalizedCurrency = currency.toUpperCase();
  return plan[normalizedCurrency as keyof typeof plan]?.amount;
}

function roundPriceForCurrency(
  amount: number,
  currency: string,
  interval: 'month' | 'year',
  minPriceOverride?: number,
): number {
  const upperCurrency = currency.toUpperCase();

  if (ZERO_DECIMAL_CURRENCIES.has(upperCurrency)) {
    const minPrice = interval === 'month' ? 500 : 0;
    return Math.max(minPrice, Math.ceil(amount));
  }

  const roundedUp = Math.ceil(amount);
  const priceWith99 = roundedUp - 0.01;
  const minPrice =
    typeof minPriceOverride === 'number'
      ? minPriceOverride
      : interval === 'month'
        ? 4.99
        : 0.99;
  return Math.max(minPrice, priceWith99);
}

function getUnitAmount(amount: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())
    ? Math.round(amount)
    : Math.round(amount * 100);
}

export async function resolveFxDriftUpdates(
  options: FxResolveOptions,
): Promise<{
  updates: FxResolveUpdate[];
  updatedMapping?: Record<
    string,
    Record<string, { amount: number; priceId: string }>
  >;
}> {
  const updateThreshold =
    options.updateThreshold ??
    Number(process.env.FX_DRIFT_UPDATE_THRESHOLD) ??
    UPDATE_THRESHOLD;

  if (!Number.isFinite(updateThreshold)) {
    throw new Error('Invalid update threshold.');
  }

  const { rates, results } = await buildFxDriftReport();
  const updates: FxResolveUpdate[] = [];

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (options.apply && !stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is required to apply updates.');
  }

  const stripe = options.apply
    ? new Stripe(stripeKey as string, { apiVersion: '2025-08-27.basil' })
    : null;

  const mappingUpdates = new Map<
    string,
    Map<string, { amount: number; priceId: string }>
  >();

  for (const result of results) {
    if (result.driftPercent < updateThreshold) continue;

    const plan = PRICING_PLANS.find((entry) => entry.id === result.planId);
    if (!plan) continue;

    const anchorCurrency = result.anchor === 'GBP' ? 'GBP' : 'USD';
    const anchorAmount = getAnchorAmount(
      result.planId as PlanId,
      anchorCurrency,
    );
    if (!anchorAmount) continue;

    const rateUsdToCurrency = rates[result.currency];
    const rateUsdToGbp = rates['GBP'];
    if (!rateUsdToCurrency || !rateUsdToGbp) continue;

    const rateFromAnchor =
      anchorCurrency === 'GBP'
        ? rateUsdToCurrency / rateUsdToGbp
        : rateUsdToCurrency;

    const targetAmountRaw = anchorAmount * rateFromAnchor;
    const targetAmount = roundPriceForCurrency(
      targetAmountRaw,
      result.currency,
      plan.interval,
      plan.interval === 'year' ? targetAmountRaw : undefined,
    );

    const mappingPlan = STRIPE_PRICE_MAPPING[result.planId as PlanId];
    const currentPriceId = mappingPlan
      ? mappingPlan[result.currency.toUpperCase() as keyof typeof mappingPlan]
          ?.priceId
      : undefined;

    const update: FxResolveUpdate = {
      planId: result.planId,
      currency: result.currency,
      fromAmount: result.storedAmount,
      toAmount: targetAmount,
      anchorCurrency,
      driftPercent: result.driftPercent,
      oldPriceId: currentPriceId,
    };

    if (!options.apply || !stripe) {
      updates.push(update);
      continue;
    }

    if (!currentPriceId) {
      updates.push(update);
      continue;
    }

    const searchQuery = `name:'${plan.name}' AND metadata['plan_id']:'${plan.id}'`;
    const products = await stripe.products.search({
      query: searchQuery,
      limit: 1,
    });

    if (products.data.length === 0) {
      updates.push(update);
      continue;
    }

    const product = products.data[0];
    await stripe.prices.update(currentPriceId, { active: false });

    const unitAmount = getUnitAmount(targetAmount, result.currency);
    const newPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: result.currency.toLowerCase(),
      recurring: {
        interval: plan.interval === 'year' ? 'year' : 'month',
        trial_period_days:
          plan.trialDays || (plan.interval === 'year' ? 14 : 7),
      },
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        interval: plan.interval,
        converted_from_fx: 'true',
        anchor_currency: anchorCurrency,
        anchor_amount: anchorAmount.toString(),
      },
    });

    update.newPriceId = newPrice.id;
    updates.push(update);

    const planUpdates =
      mappingUpdates.get(plan.id) ||
      new Map<string, { amount: number; priceId: string }>();
    planUpdates.set(result.currency, {
      amount: targetAmount,
      priceId: newPrice.id,
    });
    mappingUpdates.set(plan.id, planUpdates);
  }

  if (!options.updateMap || mappingUpdates.size === 0) {
    return { updates };
  }

  const updatedMapping = JSON.parse(JSON.stringify(STRIPE_PRICE_MAPPING));
  for (const [planId, currencyUpdates] of mappingUpdates.entries()) {
    for (const [currency, updateInfo] of currencyUpdates.entries()) {
      if (!updatedMapping[planId]?.[currency]) continue;
      updatedMapping[planId][currency] = {
        priceId: updateInfo.priceId,
        amount: updateInfo.amount,
        currency: currency.toLowerCase(),
      };
    }
  }

  return { updates, updatedMapping };
}
